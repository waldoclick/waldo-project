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
  /**
   * Decrements `remaining_days` by 1 for every active ad on each daily run.
   * When `remaining_days` reaches 0, the ad is deactivated (active: false).
   *
   * Uses the `remainings` collection as a deduplication log: before decrementing
   * an ad, this method checks whether a `remaining` record was already created
   * today for that ad. If one exists, the ad is skipped — ensuring each ad is
   * decremented only once per calendar day even if the cron fires multiple times.
   */
  async decrementRemainingDays(): Promise<ICronjobResult> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Fetch all active ads that still have remaining days. These are candidates for today's decrement.
      const ads = (await strapi.entityService.findMany("api::ad.ad", {
        filters: {
          remaining_days: { $gt: 0 },
          active: true,
        },
        pagination: { pageSize: -1 },
      })) as Ad[];

      for (const ad of ads) {
        // Check the remainings collection for a record created today for this ad.
        // If one exists, this ad was already decremented in a prior run today — skip it.
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
          // Compute the new remaining_days count (current minus one).
          const updatedRemainingDays = ad.remaining_days - 1;

          // Persist the decrement. If remaining_days reaches 0, set active: false to deactivate the ad.
          await strapi.entityService.update("api::ad.ad", ad.id, {
            data: {
              remaining_days: updatedRemainingDays,
              ...(updatedRemainingDays === 0 && { active: false }),
            },
          });

          // Record this decrement in the remainings collection. This entry acts as the idempotency
          // guard — prevents double-decrement if the cron runs more than once today.
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

      // Send a daily report email to admins listing all ads decremented today.
      await this.sendUpdatedAdsReport();

      return { success: true, results: "Ads updated successfully" };
    } catch (error) {
      logger.error("Error updating ads:", error);
      return { success: false, error: "Failed to update ads" };
    }
  }

  /**
   * Collects all `remainings` records created today, maps them to their associated
   * ads, and emails a daily report to admins.
   *
   * Called automatically at the end of each successful `decrementRemainingDays` run.
   */
  private async sendUpdatedAdsReport(): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Fetch all remainings records created today to build the report payload.
      // Each record links to the ad that was decremented.
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
