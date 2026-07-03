import PaymentUtils from "../utils";
import { getPaymentGateway } from "../../../services/payment-gateway";
import {
  logAuditInfo,
  logAuditWarn,
  logAuditError,
} from "../../../utils/audit-log";
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
    isInvoice: boolean,
  ) {
    try {
      logAuditInfo("Iniciando proceso de compra de pack", {
        actor: Number(userId),
        actor_type: "plugin::users-permissions.user",
        data: {
          packId,
          isInvoice,
        },
      });

      const adPack = await PaymentUtils.adPack.getAdPack(packId);

      if (!adPack.success) {
        logAuditWarn("Pack no encontrado", {
          actor: Number(userId),
          actor_type: "plugin::users-permissions.user",
          data: { packId },
        });
        return { success: false, message: "Pack does not exist" };
      }

      const packDataId = adPack.data.id;
      const amount = adPack.data.price;
      const returnUrl = `${process.env.FRONTEND_URL}/api/payments/pack-response`;

      const meta = `${userId}-${packDataId}-${isInvoice}`;
      const buyOrder = `order-${meta}`;
      const sessionId = `session-${packDataId}`;

      logAuditInfo("Creando transacción en Webpay", {
        actor: Number(userId),
        actor_type: "plugin::users-permissions.user",
        data: {
          packId,
          amount,
          sessionId,
        },
      });

      const transbankResponse = await getPaymentGateway().createTransaction(
        amount,
        buyOrder,
        sessionId,
        returnUrl,
      );

      logAuditInfo("Transacción Webpay creada exitosamente", {
        actor: Number(userId),
        actor_type: "plugin::users-permissions.user",
        data: { response: transbankResponse },
      });

      return {
        success: true,
        message: "Pack purchase initiated",
        webpay: transbankResponse,
      };
    } catch (error) {
      logAuditError("Error en proceso de compra de pack", {
        actor: Number(userId),
        actor_type: "plugin::users-permissions.user",
        data: {
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
        logAuditError("Error en respuesta de Webpay", {
          actor: "system",
          actor_type: "system",
          data: { response: wepbayResponse },
        });
        return { success: false, error: wepbayResponse.error };
      }

      if (wepbayResponse.response?.status !== "AUTHORIZED") {
        logAuditWarn("Transacción no autorizada", {
          actor: "system",
          actor_type: "system",
          data: { response: wepbayResponse },
        });
        return { success: false, error: wepbayResponse.response };
      }

      const buyOrder = wepbayResponse.response.buy_order;
      const { userId, adId, isInvoice } =
        PaymentUtils.general.extractIdsFromMeta(buyOrder);

      logAuditInfo("Procesando respuesta de Webpay", {
        actor: Number(userId),
        actor_type: "plugin::users-permissions.user",
        data: { response: wepbayResponse },
      });

      logAuditInfo("Extrayendo información de la orden", {
        actor: Number(userId),
        actor_type: "plugin::users-permissions.user",
        data: { token },
      });

      const packData = await PaymentUtils.adPack.getAdPack(Number(adId));

      if (!packData.success) {
        logAuditError("Pack no encontrado al procesar pago", {
          actor: Number(userId),
          actor_type: "plugin::users-permissions.user",
          data: { adId },
        });
        return { success: false, message: "Pack does not exist" };
      }

      const { price, total_ads, total_days, total_features } = packData.data;

      // SECURITY: Amount validation — recompute expected amount server-side and reject mismatch
      const expectedPackAmount = Number(price);
      const actualPackAmount = Number(wepbayResponse.response.amount);
      if (actualPackAmount !== expectedPackAmount) {
        logAuditWarn(
          `[pack] Amount mismatch: expected=${expectedPackAmount}, actual=${actualPackAmount}, buyOrder=${buyOrder}`,
          { actor: Number(userId), actor_type: "plugin::users-permissions.user" },
        );
        return { success: false, message: "Payment amount mismatch" };
      }

      const unitPrice = price / total_ads;

      logAuditInfo("Creando reservas de anuncios y destacados", {
        actor: Number(userId),
        actor_type: "plugin::users-permissions.user",
        data: {
          packId: adId,
        },
      });

      // Crear reservas de anuncios
      for (let i = 0; i < total_ads; i++) {
        await PaymentUtils.adReservation.createAdReservation(
          userId,
          unitPrice.toString(),
          total_days,
          "Reservation created from pack purchase",
        );
      }

      // Crear reservas de destacados
      for (let i = 0; i < total_features; i++) {
        await PaymentUtils.adFeaturedReservation.createAdFeaturedReservation(
          userId,
          "0",
          "Featured reservation created from pack purchase",
        );
      }

      logAuditInfo("Proceso de pago completado exitosamente", {
        actor: Number(userId),
        actor_type: "plugin::users-permissions.user",
        data: {
          packId: adId,
        },
      });

      // Zoho CRM sync — await is safe here (this method is called before a redirect, not from one)
      try {
        const user = await strapi.db
          .query("plugin::users-permissions.user")
          .findOne({ where: { id: userId } });
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
          logAuditInfo(
            "Zoho contact not found for pack purchase — skipping CRM sync",
            {
              actor: Number(userId),
              actor_type: "plugin::users-permissions.user",
            },
          );
        }
      } catch (zohoError) {
        logAuditError(
          "Zoho sync failed for pack purchase — payment flow unaffected",
          {
            actor: Number(userId),
            actor_type: "plugin::users-permissions.user",
            data: {
              error: zohoError.message,
            },
          },
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
      logAuditError("Error en procesamiento de pago Webpay", {
        actor: "system",
        actor_type: "system",
        data: {
          error: error.message,
          token,
        },
      });
      return { success: false, message: error.message };
    }
  }
}

export default new PackService();
