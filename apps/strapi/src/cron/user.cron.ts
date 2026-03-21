import PaymentUtils from "../api/payment/utils";
import logger from "../utils/logtail";
import { sendMjmlEmail } from "../services/mjml";

interface AdReservation {
  id: number;
  ad?: any;
  price: string;
  total_days: number;
}

export interface ICronjobResult {
  success: boolean;
  results?: string;
  error?: string;
}

export default class UserCronService {
  async restoreFreeAds(): Promise<ICronjobResult> {
    try {
      // Verificar si strapi está definido
      if (typeof strapi === "undefined") {
        throw new Error("strapi is not defined");
      }

      logger.info("=== INICIANDO RESTAURACIÓN DE AVISOS GRATUITOS ===");

      // Buscar anuncios gratuitos que llegaron a 0 días restantes
      const expiredFreeAds = (await strapi.entityService.findMany(
        "api::ad.ad",
        {
          filters: {
            remaining_days: 0,
            active: true,
            ad_reservation: {
              price: 0, // Solo anuncios gratuitos
            },
          },
          populate: {
            ad_reservation: true,
            user: true,
          },
          pagination: { pageSize: -1 },
        }
      )) as any[];

      logger.info(
        `Encontrados ${expiredFreeAds.length} anuncios gratuitos expirados`
      );

      const usersWithRestoredAds = [];
      const processedUsers = new Set<string>();

      // Procesar cada anuncio expirado
      for (const ad of expiredFreeAds) {
        const userId = ad.user.id.toString();

        // Evitar procesar el mismo usuario múltiples veces
        if (processedUsers.has(userId)) {
          continue;
        }
        processedUsers.add(userId);

        try {
          // Desactivar el anuncio expirado
          await strapi.entityService.update("api::ad.ad", ad.id, {
            data: { active: false },
          });

          // Desvincular la reserva del anuncio para que quede disponible
          await strapi.entityService.update(
            "api::ad-reservation.ad-reservation",
            ad.ad_reservation.id,
            {
              data: { ad: null },
            }
          );

          logger.info("Anuncio gratuito expirado procesado", {
            adId: ad.id,
            userId,
            reservationId: ad.ad_reservation.id,
          });

          // Verificar si el usuario necesita más reservas gratuitas
          const result = await this.restoreUserFreeReservations(userId);

          usersWithRestoredAds.push({
            id: ad.user.id,
            username: ad.user.username,
            email: ad.user.email,
            ...result,
          });
        } catch (error) {
          logger.error("Error procesando anuncio expirado", {
            adId: ad.id,
            userId,
            error: error.message,
          });
        }
      }

      logger.info(
        `Procesados ${usersWithRestoredAds.length} usuarios con anuncios expirados`
      );

      // Enviar reporte por correo
      if (usersWithRestoredAds.length > 0) {
        const adminEmails =
          process.env.ADMIN_EMAILS || "waldo.development@gmail.com";
        const emailArray = adminEmails.split(",").map((email) => email.trim());

        await sendMjmlEmail(
          strapi,
          "report-free-ads-restoration",
          emailArray,
          "Reporte de restauración de anuncios gratuitos",
          {
            users: usersWithRestoredAds,
          }
        );
      }

      logger.info("=== RESTAURACIÓN DE AVISOS GRATUITOS COMPLETADA ===");

      return {
        success: true,
        results: `Processed ${usersWithRestoredAds.length} users with expired free ads`,
      };
    } catch (error) {
      logger.error("Error restoring free ads:", error);
      return { success: false, error: "Failed to restore free ads" };
    }
  }

  /**
   * Restore free reservations for a specific user
   * Ensures user always has 3 free reservations available
   */
  private async restoreUserFreeReservations(userId: string) {
    try {
      // Contar reservas gratuitas actuales (disponibles + activas)
      const currentReservations = (await strapi.entityService.findMany(
        "api::ad-reservation.ad-reservation",
        {
          filters: {
            user: { id: { $eq: userId } },
            price: 0,
            $or: [
              { ad: null }, // Disponibles
              {
                ad: {
                  remaining_days: { $gt: 0 },
                },
              }, // Activas
            ],
          },
          populate: {
            ad: true,
          },
        }
      )) as any[];

      const availableReservations = currentReservations.filter(
        (r) => !r.ad
      ).length;
      const activeReservations = currentReservations.filter(
        (r) => r.ad && r.ad.remaining_days > 0
      ).length;
      const totalReservations = availableReservations + activeReservations;
      const neededReservations = Math.max(0, 3 - totalReservations);

      // Crear reservas faltantes
      for (let i = 0; i < neededReservations; i++) {
        await strapi.entityService.create(
          "api::ad-reservation.ad-reservation",
          {
            data: {
              price: 0,
              total_days: 15,
              user: userId,
              description: `Reserva gratuita restaurada ${new Date().toISOString()}`,
              publishedAt: new Date(),
            },
          }
        );
      }

      logger.info("Reservas gratuitas restauradas para usuario", {
        userId,
        availableReservations,
        activeReservations,
        neededReservations,
        totalAfterRestore: totalReservations + neededReservations,
      });

      return {
        availableReservations,
        activeReservations,
        neededReservations,
        totalAfterRestore: totalReservations + neededReservations,
      };
    } catch (error) {
      logger.error("Error restoring user free reservations", {
        userId,
        error: error.message,
      });
      throw error;
    }
  }
}
