import PaymentUtils from "../utils";
import { getPaymentGateway } from "../../../services/payment-gateway";
import logger from "../../../utils/logtail";
import { zohoService } from "../../../services/zoho";

class PackService {
  /**
   * Process a pack purchase
   * @param packId The pack ID to purchase
   * @param userId The user ID making the purchase
   * @returns The processed pack purchase
   */
  public async packPurchase(
    packId: number,
    userId: string,
    isInvoice: boolean
  ) {
    try {
      logger.info("Iniciando proceso de compra de pack", {
        userId,
        response: {
          packId,
          isInvoice,
        },
      });

      const adPack = await PaymentUtils.adPack.getAdPack(packId);

      if (!adPack.success) {
        logger.warn("Pack no encontrado", {
          userId,
          response: { packId },
        });
        return { success: false, message: "Pack does not exist" };
      }

      const packDataId = adPack.data.id;
      const amount = adPack.data.price;
      const returnUrl = `${process.env.APP_URL}/api/payments/pack-response`;

      const meta = `${userId}-${packDataId}-${isInvoice}`;
      const buyOrder = `order-${meta}`;
      const sessionId = `session-${packDataId}`;

      logger.info("Creando transacción en Webpay", {
        userId,
        response: {
          packId,
          amount,
          sessionId,
        },
      });

      const transbankResponse = await getPaymentGateway().createTransaction(
        amount,
        buyOrder,
        sessionId,
        returnUrl
      );

      logger.info("Transacción Webpay creada exitosamente", {
        userId,
        response: transbankResponse,
      });

      return {
        success: true,
        message: "Pack purchase initiated",
        webpay: transbankResponse,
      };
    } catch (error) {
      logger.error("Error en proceso de compra de pack", {
        userId,
        response: {
          error: error.message,
          packId,
        },
      });
      return { success: false, message: error.message };
    }
  }

  /**
   * Process Webpay response for pack purchase
   * @param token The Webpay token
   * @returns The processed pack purchase response
   */
  public async processPaidWebpay(token: string) {
    try {
      const wepbayResponse = await getPaymentGateway().commitTransaction(token);

      if (!wepbayResponse.success) {
        logger.error("Error en respuesta de Webpay", {
          response: wepbayResponse,
        });
        return { success: false, error: wepbayResponse.error };
      }

      if (wepbayResponse.response?.status !== "AUTHORIZED") {
        logger.warn("Transacción no autorizada", {
          response: wepbayResponse,
        });
        return { success: false, error: wepbayResponse.response };
      }

      const buyOrder = wepbayResponse.response.buy_order;
      const { userId, adId, isInvoice } =
        PaymentUtils.general.extractIdsFromMeta(buyOrder);

      logger.info("Procesando respuesta de Webpay", {
        userId,
        response: wepbayResponse,
      });

      logger.info("Extrayendo información de la orden", {
        userId,
        response: { token },
      });

      const packData = await PaymentUtils.adPack.getAdPack(Number(adId));

      if (!packData.success) {
        logger.error("Pack no encontrado al procesar pago", {
          userId,
          response: { adId },
        });
        return { success: false, message: "Pack does not exist" };
      }

      const { price, total_ads, total_days, total_features } = packData.data;
      const unitPrice = price / total_ads;

      logger.info("Creando reservas de anuncios y destacados", {
        userId,
        response: {
          packId: adId,
        },
      });

      // Crear reservas de anuncios
      for (let i = 0; i < total_ads; i++) {
        await PaymentUtils.adReservation.createAdReservation(
          userId,
          unitPrice.toString(),
          total_days,
          "Reservation created from pack purchase"
        );
      }

      // Crear reservas de destacados
      for (let i = 0; i < total_features; i++) {
        await PaymentUtils.adFeaturedReservation.createAdFeaturedReservation(
          userId,
          "0",
          "Featured reservation created from pack purchase"
        );
      }

      logger.info("Proceso de pago completado exitosamente", {
        userId,
        response: {
          packId: adId,
        },
      });

      // Zoho CRM sync — await is safe here (this method is called before a redirect, not from one)
      try {
        const user = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          userId
        );
        const contact = user?.email
          ? await zohoService.findContact(user.email)
          : null;
        if (contact) {
          const closingDate = new Date().toISOString().split("T")[0];
          await zohoService.createDeal({
            dealName: packData.data.name,
            amount: wepbayResponse.response.amount,
            contactId: contact.id,
            type: "Pack Purchase",
            closingDate,
            leadSource: "Website",
          });
          await zohoService.updateContactStats(contact.id, {
            Total_Spent__c: wepbayResponse.response.amount,
            Packs_Purchased__c: 1,
          });
        } else {
          logger.info(
            "Zoho contact not found for pack purchase — skipping CRM sync",
            { userId }
          );
        }
      } catch (zohoError) {
        logger.error(
          "Zoho sync failed for pack purchase — payment flow unaffected",
          {
            userId,
            error: zohoError.message,
          }
        );
      }

      return {
        success: true,
        message: "Pack purchase processed successfully",
        pack: packData.data,
        webpay: wepbayResponse?.response,
        userId,
        isInvoice,
      };
    } catch (error) {
      logger.error("Error en procesamiento de pago Webpay", {
        response: {
          error: error.message,
          token,
        },
      });
      return { success: false, message: error.message };
    }
  }
}

export default new PackService();
