import { sendMjmlEmail } from "../services/mjml";
import logger from "../utils/logtail";

export interface ICronjobResult {
  success: boolean;
  results?: string;
  error?: string;
}

export interface Ad {
  id: number;
  name: string;
  slug: string;
  price: string;
  active: boolean;
  rejected: boolean;
  currency: string;
  duration_days: number;
  remaining_days: number;
}

export interface Remaining {
  id: number;
  ad: Ad;
  createdAt: string;
}

export class AdService {
  async decrementRemainingDays(): Promise<ICronjobResult> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Obtener todos los anuncios donde remaining_days sea mayor a 0
      const ads = (await strapi.entityService.findMany("api::ad.ad", {
        filters: {
          remaining_days: { $gt: 0 },
          active: true,
        },
        pagination: { pageSize: -1 },
      })) as Ad[];

      for (const ad of ads) {
        // Verificar si ya se ha descontado un día para este anuncio hoy
        const existingRemaining = await strapi.entityService.findMany(
          "api::remaining.remaining",
          {
            filters: {
              ad: { id: ad.id },
              createdAt: {
                $gte: `${today}T00:00:00.000Z`,
                $lte: `${today}T23:59:59.999Z`,
              },
            },
          }
        );

        if (existingRemaining.length === 0) {
          // Restar uno al valor de remaining_days del anuncio
          const updatedRemainingDays = ad.remaining_days - 1;

          // Guardar los cambios en la base de datos
          await strapi.entityService.update("api::ad.ad", ad.id, {
            data: { remaining_days: updatedRemainingDays },
          });

          // Registrar la operación en la colección remainings
          await strapi.entityService.create("api::remaining.remaining", {
            data: {
              ad: ad.id,
            },
          });

          logger.info(`Ad ${ad.id} updated successfully`);
        } else {
          logger.info(`Ad ${ad.id} has already been updated today`);
        }
      }

      // Llamar a la función para recoger los anuncios actualizados hoy y enviar el correo
      await this.sendUpdatedAdsReport();

      return { success: true, results: "Ads updated successfully" };
    } catch (error) {
      logger.error("Error updating ads:", error);
      return { success: false, error: "Failed to update ads" };
    }
  }

  private async sendUpdatedAdsReport(): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Obtener todos los registros de remainings creados hoy
      const remainings = await strapi.entityService.findMany(
        "api::remaining.remaining",
        {
          filters: {
            createdAt: {
              $gte: `${today}T00:00:00.000Z`,
              $lte: `${today}T23:59:59.999Z`,
            },
          },
          sort: { id: "desc" },
          populate: ["ad"],
        }
      );

      const updatedAds = remainings
        .filter((remaining: any) => remaining.ad)
        .map((remaining: any) => ({
          id: remaining.ad.id,
          name: remaining.ad.name,
          duration_days: remaining.ad.duration_days,
          remaining_days: remaining.ad.remaining_days,
        }));

      if (updatedAds.length > 0) {
        const adminEmails =
          process.env.ADMIN_EMAILS || "waldo.development@gmail.com";
        const emailArray = adminEmails.split(",").map((email) => email.trim());

        await sendMjmlEmail(
          strapi,
          "report-ads-daily-update",
          emailArray,
          "Reporte diario de actualización de anuncios",
          {
            ads: updatedAds,
          }
        );
      }
    } catch (error) {
      logger.error("Error sending updated ads report:", error);
    }
  }
}
