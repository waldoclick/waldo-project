import PaymentUtils from "../utils";
import { getPaymentGateway } from "../../../services/payment-gateway";
import { zohoService } from "../../../services/zoho";
import logger from "../../../utils/logtail";

interface CheckoutPayload {
  pack: string; // pack name (must not be "free")
  ad_id?: number; // optional — present when publishing an ad
  featured?: boolean; // optional — present when buying featured slot
}

interface InitiateResult {
  success: boolean;
  url?: string;
  token?: string;
  message?: string;
}

interface ProcessResult {
  success: boolean;
  message?: string;
}

class CheckoutService {
  /**
   * Initiate a unified checkout transaction via Webpay.
   * Handles pack-only, pack+ad, and pack+featured+ad flows.
   */
  async initiateCheckout(
    payload: CheckoutPayload,
    userId: string
  ): Promise<InitiateResult> {
    // 1. Validate pack name
    if (payload.pack === "free" || payload.pack === "paid") {
      return { success: false, message: "Invalid pack" };
    }

    // 2. Look up pack by name
    const packRecord = await strapi.db
      .query("api::ad-pack.ad-pack")
      .findOne({ where: { name: payload.pack } });

    if (!packRecord) {
      return { success: false, message: "Pack not found" };
    }

    const packData = packRecord as {
      id: number;
      price?: string | number;
    };

    // 3. Validate that this is a paid pack
    if (packData.price === undefined || String(packData.price) === "0") {
      return { success: false, message: "Pack is not a paid pack" };
    }

    // 4. Build amount
    let amount = Number(packData.price);

    // 5. Add featured price if requested
    if (payload.featured === true) {
      amount += Number(process.env.AD_FEATURED_PRICE) || 10000;
    }

    // 6. Encode buy_order and sessionId
    const adId = payload.ad_id ?? 0;
    const featuredFlag = payload.featured ? 1 : 0;
    const buyOrder = `order-checkout-${userId}-${
      packData.id
    }-${adId}-${featuredFlag}-${Date.now()}`;
    const sessionId = `session-checkout-${userId}-${Date.now()}`;

    // 7. Build return URL
    const returnUrl = `${process.env.APP_URL}/api/payments/webpay`;

    // 8. Create Webpay transaction
    const result = await getPaymentGateway().createTransaction(
      amount,
      buyOrder,
      sessionId,
      returnUrl
    );

    // 9. Handle failure
    if (!result.success) {
      return {
        success: false,
        message: String(result.error ?? "Webpay transaction failed"),
      };
    }

    // 10. Return redirect info — gatewayRef is the Webpay token
    return { success: true, url: result.url, token: result.gatewayRef };
  }

  /**
   * Process Webpay return after payment completion.
   * Creates reservations, links ad, publishes ad, syncs Zoho CRM.
   */
  async processWebpayReturn(token: string): Promise<ProcessResult> {
    try {
      // 1. Commit transaction
      const wepbayResponse = await getPaymentGateway().commitTransaction(token);

      // 2. Validate authorization
      if (
        !wepbayResponse.success ||
        wepbayResponse.response?.status !== "AUTHORIZED"
      ) {
        return { success: false, message: "Payment not authorized" };
      }

      // 3. Parse buy_order
      // Format: order-checkout-{userId}-{packId}-{adId}-{featured}-{timestamp}
      const buyOrder = wepbayResponse.response.buy_order as string;
      const parts = buyOrder.split("-");
      // parts: [0]="order", [1]="checkout", [2]=userId, [3]=packId, [4]=adId, [5]=featured, [6]=timestamp
      const userId = parts[2];
      const packId = Number(parts[3]);
      const adId = Number(parts[4]); // 0 means no ad
      const featured = parts[5] === "1";

      // 4. Look up pack
      const packResult = await PaymentUtils.adPack.getAdPack(packId);
      if (!packResult.success || !packResult.data) {
        return { success: false, message: "Pack not found" };
      }

      // 5. Destructure pack data with defaults
      const { price, total_ads, total_days, total_features } = packResult.data;
      const resolvedTotalAds = total_ads ?? 1;
      const resolvedTotalDays = total_days ?? 30;
      const resolvedTotalFeatures = total_features ?? 0;
      const resolvedPrice = price ?? 0;

      // 6. Calculate unit price per ad reservation
      const unitPrice = Number(resolvedPrice) / resolvedTotalAds;

      // 7. Create paid ad-reservations
      let firstAdReservationId: number | string | undefined;
      for (let i = 0; i < resolvedTotalAds; i++) {
        const res = await PaymentUtils.adReservation.createAdReservation(
          userId,
          unitPrice.toString(),
          resolvedTotalDays,
          "Reservation from unified checkout"
          // Do NOT pass adId here — link is made explicitly in step 7b below
        );
        if (i === 0 && res.success && res.adReservation) {
          firstAdReservationId = res.adReservation.id;
        }
      }

      // Step 7b — explicitly link the first reservation to the ad
      if (firstAdReservationId !== undefined && adId > 0) {
        await PaymentUtils.ad.updateAdReservation(adId, firstAdReservationId);
      }

      // 8. Create pack-included featured reservations (if any)
      if (resolvedTotalFeatures > 0) {
        for (let i = 0; i < resolvedTotalFeatures; i++) {
          // Link first pack-included featured slot to the ad if present and not already
          // covered by standalone featured purchase
          const featuredAdId =
            i === 0 && adId > 0 && !featured ? adId : undefined;
          const featuredRes =
            await PaymentUtils.adFeaturedReservation.createAdFeaturedReservation(
              userId,
              "0",
              "Featured reservation from unified checkout",
              featuredAdId
            );
          // If linked, also call updateAdFeaturedReservation to make the association explicit
          if (
            i === 0 &&
            adId > 0 &&
            !featured &&
            featuredRes.success &&
            featuredRes.adFeaturedReservation
          ) {
            const reservationRecord = featuredRes.adFeaturedReservation as {
              id?: number;
            };
            if (reservationRecord.id !== undefined) {
              await PaymentUtils.ad.updateAdFeaturedReservation(
                adId,
                reservationRecord.id
              );
            }
          }
        }
      }

      // 9. Standalone paid featured reservation
      if (featured && adId > 0) {
        await PaymentUtils.adFeaturedReservation.createAdFeaturedReservation(
          userId,
          (Number(process.env.AD_FEATURED_PRICE) || 10000).toString(),
          "Paid featured from unified checkout",
          adId
        );
      }

      // 10. Update ad dates and publish ad
      if (adId > 0) {
        await PaymentUtils.ad.updateAdDates(adId, resolvedTotalDays);
        await PaymentUtils.ad.publishAd(adId);
      }

      // 11. Zoho CRM sync — floating promise, non-blocking
      const _amount = wepbayResponse.response?.amount;
      Promise.resolve()
        .then(async () => {
          if (!userId) return;
          if (adId > 0) {
            const adData = await PaymentUtils.ad.getAdById(adId);
            const email = (adData.ad as { user?: { email?: string } } | null)
              ?.user?.email;
            if (!email) return;
            const contact = await zohoService.findContact(email);
            if (!contact) return;
            const closingDate = new Date().toISOString().split("T")[0];
            await zohoService.createDeal({
              dealName: `Checkout Payment - ${adId}`,
              amount: _amount,
              contactId: contact.id,
              type: "Ad Payment",
              closingDate,
              leadSource: "Website",
            });
            await zohoService.updateContactStats(contact.id, {
              Total_Spent__c: _amount,
            });
          }
        })
        .catch((err: { message?: string }) => {
          logger.error("Zoho sync failed for checkout — payment unaffected", {
            error: err.message,
          });
        });

      // 12. Return success
      return { success: true, message: "Checkout processed successfully" };
    } catch (error) {
      const e = error as { message?: string };
      return { success: false, message: e.message };
    }
  }
}

export default new CheckoutService();
