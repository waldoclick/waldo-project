import PaymentUtils from "../utils";
import OrderUtils from "../utils/order.utils";
import { getPaymentGateway } from "../../../services/payment-gateway";
import { zohoService } from "../../../services/zoho";
import logger from "../../../utils/logtail";
import { documentDetails } from "../utils/user.utils";
import generalUtils from "../utils/general.utils";
import { PackType, FeaturedType } from "../types/payment.type";

interface CheckoutPayload {
  pack: string; // pack name (must not be "free")
  ad_id?: number; // optional — present when publishing an ad
  featured?: boolean; // optional — present when buying featured slot
  is_invoice?: boolean; // optional — true for factura, false/omitted for boleta
}

interface InitiateResult {
  success: boolean;
  url?: string;
  token?: string;
  message?: string;
}

interface ProcessResult {
  success: boolean;
  adId?: number;
  message?: string;
  orderId?: string;
  orderDocumentId?: string;
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

    // 6. Encode buy_order — same style as pack.service.ts
    // Format: "order-{userId}-{packId}-{adId}-{featured}-{isInvoice}"
    const adId = payload.ad_id ?? 0;
    const featuredFlag = payload.featured ? 1 : 0;
    const invoiceFlag = payload.is_invoice ? 1 : 0;
    const buyOrder = `order-${userId}-${packData.id}-${adId}-${featuredFlag}-${invoiceFlag}`;
    const sessionId = `session-${packData.id}`;

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
      // Format: "order-{userId}-{packId}-{adId}-{featured}-{isInvoice}"
      const buyOrder = wepbayResponse.response.buy_order as string;
      const parts = buyOrder.split("-");
      const userId = parts[1];
      const packId = Number(parts[2]);
      const adId = Number(parts[3]); // 0 means no ad
      const featured = parts[4] === "1";
      const is_invoice = parts[5] === "1";

      // 4. Look up pack by id
      const packRecord = await strapi.db
        .query("api::ad-pack.ad-pack")
        .findOne({ where: { id: packId } });

      if (!packRecord) {
        return { success: false, message: "Pack not found" };
      }

      const packData = packRecord as {
        price?: string | number;
        total_ads?: number;
        total_days?: number;
        total_features?: number;
      };

      // 5. Destructure pack data with defaults
      const resolvedTotalAds = packData.total_ads ?? 1;
      const resolvedTotalDays = packData.total_days ?? 30;
      const resolvedTotalFeatures = packData.total_features ?? 0;
      const resolvedPrice = packData.price ?? 0;

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

      // 10b. Fetch billing details and emit Facto document (non-fatal)
      let userDocumentDetails:
        | Awaited<ReturnType<typeof documentDetails>>
        | undefined;
      let paymentItems: Parameters<
        typeof generalUtils.generateFactoDocument
      >[0]["items"] = [];
      let documentResponse: unknown;

      try {
        userDocumentDetails = await documentDetails(userId, is_invoice);

        const paymentDetails = await generalUtils.PaymentDetails(
          packId as unknown as PackType,
          featured as unknown as FeaturedType,
          String(userId),
          String(adId)
        );
        paymentItems = paymentDetails.items;

        documentResponse = await generalUtils.generateFactoDocument({
          isInvoice: is_invoice,
          userDetails: userDocumentDetails,
          items: paymentItems,
        });

        logger.info("Documento Facto generado exitosamente (checkout)", {
          adId,
          isInvoice: is_invoice,
        });
      } catch (factoError) {
        logger.error(
          "Error generando documento Facto (checkout) — pago no afectado",
          {
            adId,
            error: (factoError as { message?: string }).message,
          }
        );
      }

      // 11. Create order record for /pagar/gracias receipt
      let orderDocumentId: string | undefined;
      try {
        const orderResult = await OrderUtils.createAdOrder({
          amount: wepbayResponse.response?.amount ?? 0,
          buy_order: buyOrder,
          userId: Number(userId),
          is_invoice,
          payment_method: process.env.PAYMENT_GATEWAY ?? "transbank",
          payment_response: wepbayResponse.response,
          adId: adId > 0 ? adId : undefined,
          document_details: userDocumentDetails,
          items: paymentItems,
          document_response: documentResponse,
        });
        if (orderResult.success && orderResult.order) {
          orderDocumentId = (orderResult.order as { documentId?: string })
            .documentId;
        }
      } catch (orderError) {
        logger.error("Failed to create order record for checkout", {
          error: (orderError as { message?: string }).message,
        });
      }

      // 12. Zoho CRM sync — floating promise, non-blocking
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

      // 13. Return success
      return {
        success: true,
        adId,
        message: "Checkout processed successfully",
        orderId: buyOrder,
        orderDocumentId,
      };
    } catch (error) {
      const e = error as { message?: string };
      return { success: false, message: e.message };
    }
  }
}

export default new CheckoutService();
