import PaymentUtils from "../utils";
import ad from "../../ad/services/ad";
import TransbankServices from "../../../services/transbank";
import { AdData, PackType, FeaturedType, Details } from "../types/payment.type";
import logger from "../../../utils/logtail";
import { sendMjmlEmail } from "../../../services/mjml";

class AdService {
  /**
   * Initialize payment validation
   * @param pack The pack type ("free", "paid", true, false, or number)
   * @param featured The featured type ("free", true, or false)
   * @param userId The user ID
   * @returns Validation result with success and isPaymentRequired
   */
  public async validatePayment(
    pack: PackType,
    featured: FeaturedType,
    userId: string
  ) {
    // validate pack free
    if (pack === "free") {
      const freeAdReservationCredits =
        await PaymentUtils.adReservation.getReservationByUser(userId, true);

      if (!freeAdReservationCredits) {
        return { success: false, message: "No free credits available" };
      }
    }

    // validate pack paid
    if (pack === "paid") {
      const paidAdReservationCredits =
        await PaymentUtils.adReservation.getReservationByUser(userId, false);

      if (!paidAdReservationCredits) {
        return { success: false, message: "No paid credits available" };
      }
    }

    // validate pack
    if (typeof pack === "number") {
      const adPack = await PaymentUtils.adPack.getAdPack(pack);

      if (!adPack) {
        return { success: false, message: "Pack does not exist" };
      }
    }

    // validate featured
    if (featured === "free") {
      const freeAdFeaturedReservationAvailable =
        await PaymentUtils.adFeaturedReservation.getAdFeaturedReservationAvailable(
          userId,
          true
        );

      if (!freeAdFeaturedReservationAvailable.success) {
        return {
          success: false,
          message: "No free featured credits available",
        };
      }
    }

    const isPaymentRequiredChecked =
      await PaymentUtils.general.isPaymentRequired(pack, featured);

    return {
      success: true,
      isPaymentRequired: isPaymentRequiredChecked,
    };
  }

  /**
   * Create a new ad with its details
   * @param ad The ad data (name, description, etc)
   * @param userId The user ID creating the ad
   * @param details The ad details (pack, featured, is_invoice)
   * @returns Created ad data with success status
   */
  public async create(ad: AdData, userId: string, details: Details) {
    try {
      // Si ad_id es null, creamos un nuevo aviso
      if (!ad.ad_id) {
        const adData = await PaymentUtils.ad.createdAd(userId, {
          ...ad,
          details,
        });
        logger.info(
          `Nuevo aviso creado con ID ${adData.id} por el usuario ${userId}`
        );
        return { success: true, ad: adData };
      }

      // Si ad_id existe, actualizamos el aviso existente
      const updatedAd = await PaymentUtils.ad.updateAd(userId, ad.ad_id, {
        ...ad,
        details,
      });
      logger.info(`Aviso ${ad.ad_id} modificado por el usuario ${userId}`);
      return { success: true, ad: updatedAd };
    } catch (error) {
      logger.error(`Error al procesar aviso: ${error.message}`, {
        userId,
        adId: ad.ad_id,
      });
      return { success: false, message: error.message };
    }
  }

  /**
   * Process a free payment for an ad
   * @param id The ad ID to process
   * @returns The processed ad
   */
  public async processFreePayment(id: number) {
    try {
      const result = await PaymentUtils.ad.getAdById(id);
      if (!result.success) {
        return result;
      }

      if (!result.ad?.user?.id) {
        return {
          success: false,
          message: "El anuncio no tiene un usuario asociado",
        };
      }

      const userId = result.ad.user.id;
      const pack = result.ad.details.pack;
      const featured = result.ad.details.featured;
      const adId = result.ad.id;

      // Get an available ad featured reservation for the user
      let freeAdFeaturedReservationAvailable = null;

      // if featured is "free"
      if (featured === "free") {
        freeAdFeaturedReservationAvailable =
          await PaymentUtils.adFeaturedReservation.getAdFeaturedReservationAvailable(
            userId,
            true
          );

        if (!freeAdFeaturedReservationAvailable.success) {
          return freeAdFeaturedReservationAvailable;
        }

        // Update the ad featured reservation
        const adFeaturedReservationId =
          freeAdFeaturedReservationAvailable?.availableAdFeaturedReservation
            ?.id;

        if (!adFeaturedReservationId) {
          return {
            success: false,
            message: "No ad featured reservation available",
          };
        }

        await PaymentUtils.ad.updateAdFeaturedReservation(
          adId,
          adFeaturedReservationId
        );
      }

      // if pack is "paid"
      if (pack === "paid") {
        const aAdReservationCredit =
          await PaymentUtils.adReservation.getAdReservationAvailable(
            userId,
            false
          );

        if (
          !aAdReservationCredit.success ||
          !aAdReservationCredit.adReservation
        ) {
          return {
            success: false,
            message: "No paid reservation available",
          };
        }

        const adReservationId = aAdReservationCredit.adReservation.id;
        const total_days = aAdReservationCredit.adReservation.total_days;

        await PaymentUtils.ad.updateAdReservation(adId, adReservationId);
        await PaymentUtils.ad.updateAdDates(Number(adId), total_days);
      }

      // if pack is "free"
      if (pack === "free") {
        const aAdReservationCredit =
          await PaymentUtils.adReservation.getAdReservationAvailable(
            userId,
            true
          );

        if (
          !aAdReservationCredit.success ||
          !aAdReservationCredit.adReservation
        ) {
          return {
            success: false,
            message: "No free reservation available",
          };
        }

        const adReservationId = aAdReservationCredit.adReservation.id;

        await PaymentUtils.ad.updateAdReservation(adId, adReservationId);
      }

      // Enviar emails con MJML
      try {
        // Email de confirmación al usuario
        await sendMjmlEmail(
          strapi,
          "ad-creation-user",
          result.ad.user.email,
          "Tu anuncio ha sido creado",
          {
            name: `${result.ad.user.firstname} ${result.ad.user.lastname}`,
            adUrl: `${process.env.FRONTEND_URL}/anuncios/${result.ad.slug}`,
          }
        );

        // Email de notificación al admin
        const adminEmails =
          process.env.ADMIN_EMAILS || "waldo.development@gmail.com";
        const emailArray = adminEmails.split(",").map((email) => email.trim());

        await sendMjmlEmail(
          strapi,
          "ad-creation-admin",
          emailArray,
          "Nuevo anuncio creado para validar",
          {
            name: `${result.ad.user.firstname} ${result.ad.user.lastname}`,
            email: result.ad.user.email,
            slug: result.ad.slug,
            adUrl: `${process.env.DASHBOARD_URL}/dashboard/ads/${result.ad.id}`,
          }
        );
      } catch (error) {
        logger.error("Error sending ad creation emails:", {
          error,
        });
      }

      return {
        success: true,
        ad: result.ad,
        message: "Free ad created successfully",
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Process a paid payment for an ad
   * @param id The ad ID to process
   * @returns The processed ad
   */
  public async processPaidPayment(id: number) {
    try {
      const result = await PaymentUtils.ad.getAdById(id);
      if (!result.success) {
        return result;
      }

      const pack = result.ad.details.pack;
      const featured = result.ad.details.featured;
      const userId = result.ad.user.id;
      const adId = result.ad.id;

      const paymentDetails = await PaymentUtils.general.PaymentDetails(
        pack,
        featured,
        userId,
        adId
      );

      const returnUrl = `${process.env.APP_URL}/api/payments/ad-response`;

      const transbankResponse =
        await TransbankServices.transbank.createTransaction(
          paymentDetails.amount,
          paymentDetails.buyOrder,
          paymentDetails.sessionId,
          returnUrl
        );

      // Verificar si la respuesta de Transbank fue exitosa
      if (!transbankResponse || !transbankResponse.success) {
        return {
          success: false,
          message: "Failed to create Webpay transaction",
          error: transbankResponse?.error || "Unknown error",
        };
      }

      return {
        success: true,
        message: "Paid ad created successfully",
        ad: result.ad,
        webpay: transbankResponse,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  public async processPaidWebpay(token: string) {
    try {
      const wepbayResponse =
        await TransbankServices.transbank.commitTransaction(token);

      if (!wepbayResponse.success) {
        return { success: false, error: wepbayResponse.error };
      }

      if (wepbayResponse.response?.status !== "AUTHORIZED") {
        return { success: false, error: wepbayResponse.response };
      }

      const buyOrder = wepbayResponse.response.buy_order;
      const { userId, adId } =
        PaymentUtils.general.extractIdsFromMeta(buyOrder);

      const adData = await PaymentUtils.ad.getAdById(Number(adId));
      if (!adData.success) {
        return adData;
      }

      const pack = adData.ad?.details?.pack;
      const featured = adData.ad?.details?.featured;

      if (featured === true) {
        const featuredPrice = Number(process.env.AD_FEATURED_PRICE) || 10000;

        await PaymentUtils.adFeaturedReservation.createAdFeaturedReservation(
          userId,
          featuredPrice.toString(),
          "Featured reservation from payment",
          Number(adId)
        );
      }

      // if pack is a number create ad reservations and featured reservations
      if (typeof pack === "number") {
        const packData = await PaymentUtils.adPack.getAdPack(Number(pack));

        if (!packData.success) {
          return { success: false, message: packData.message };
        }

        const { price, total_ads, total_days, total_features } = packData.data;
        const unitPrice = price / total_ads;

        // Create ad reservations and immediately use the first one for current ad
        let firstReservationId = null;

        logger.info("Creando reservas de anuncios del pack", {
          userId,
          adId,
          total_ads,
          total_days,
          unitPrice,
        });

        for (let i = 0; i < total_ads; i++) {
          const reservationResponse =
            await PaymentUtils.adReservation.createAdReservation(
              userId,
              unitPrice.toString(),
              total_days,
              "Reservation created from pack",
              i === 0 ? Number(adId) : undefined
            );

          logger.info(`Reserva ${i + 1}/${total_ads} creada`, {
            userId,
            adId,
            reservationId: reservationResponse.adReservation?.id,
            success: reservationResponse.success,
          });

          // Store the first reservation ID to use immediately
          if (i === 0 && reservationResponse.success) {
            firstReservationId = reservationResponse.adReservation.id;
            logger.info("Primera reserva almacenada para uso inmediato", {
              userId,
              adId,
              firstReservationId,
            });
          }
        }

        // Create ad featured reservations
        for (let i = 0; i < total_features; i++) {
          await PaymentUtils.adFeaturedReservation.createAdFeaturedReservation(
            userId,
            "0", // Precio gratuito para reservas destacadas del pack
            "Featured reservation created from pack"
          );
        }

        // Use the first reservation immediately for the current ad
        if (firstReservationId) {
          logger.info("Asignando primera reserva al anuncio actual", {
            userId,
            adId,
            firstReservationId,
          });

          await PaymentUtils.ad.updateAdReservation(
            Number(adId),
            firstReservationId
          );

          logger.info("Primera reserva asignada exitosamente", {
            userId,
            adId,
            firstReservationId,
          });
        } else {
          logger.error("No se pudo obtener la primera reserva para asignar", {
            userId,
            adId,
            total_ads,
          });
        }

        // Update ad dates
        await PaymentUtils.ad.updateAdDates(Number(adId), total_days);
      }

      // if pack is "paid" (not a number) use an existing ad reservation
      if (pack === "paid") {
        const aAdReservationCredit =
          await PaymentUtils.adReservation.getAdReservationAvailable(
            userId,
            false
          );

        if (
          !aAdReservationCredit.success ||
          !aAdReservationCredit.adReservation
        ) {
          return {
            success: false,
            message: "No paid reservation available",
          };
        }

        const adReservationId = aAdReservationCredit.adReservation.id;

        await PaymentUtils.ad.updateAdReservation(
          Number(adId),
          adReservationId
        );
      }

      return {
        success: true,
        ad: adData.ad || null,
        webpay: wepbayResponse?.response || null,
        message: "Paid ad payment processed successfully",
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new AdService();
