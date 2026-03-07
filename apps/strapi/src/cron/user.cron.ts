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
      // Verify strapi is available before proceeding.
      if (typeof strapi === "undefined") {
        throw new Error("strapi is not defined");
      }

      logger.info("=== STARTING FREE AD RESTORATION ===");

      // Query all active free ads (price = 0) that have reached 0 remaining days.
      // These are eligible for deactivation and reservation restore this run.
      const expiredFreeAds = (await strapi.entityService.findMany(
        "api::ad.ad",
        {
          filters: {
            remaining_days: 0,
            active: true,
            ad_reservation: {
              price: 0, // Free ads only
            },
          },
          populate: {
            ad_reservation: true,
            user: true,
          },
          pagination: { pageSize: -1 },
        }
      )) as any[];

      logger.info(`Found ${expiredFreeAds.length} expired free ads to process`);

      // Group expired ads by user. A single user may have multiple expired free ads
      // (e.g., published two free ads on different days, both expired today).
      // We collect them all so we can deactivate each ad individually, but call
      // restoreUserFreeReservations only once per user to avoid duplicate top-ups.
      const userAdMap = new Map<string, { user: any; ads: any[] }>();
      for (const ad of expiredFreeAds) {
        const userId = ad.user.id.toString();
        if (!userAdMap.has(userId)) {
          userAdMap.set(userId, { user: ad.user, ads: [] });
        }
        userAdMap.get(userId)!.ads.push(ad);
      }

      const usersWithRestoredAds = [];

      // Process each unique user: deactivate all their expired ads, then restore
      // their free reservation pool to the guaranteed minimum of 3.
      for (const [userId, { user, ads }] of userAdMap) {
        try {
          // Deactivate every expired ad for this user. Each ad must be set inactive
          // and its reservation unlinked so it re-enters the available pool.
          for (const ad of ads) {
            await strapi.entityService.update("api::ad.ad", ad.id, {
              data: { active: false },
            });

            // Unlink the reservation from the ad so it becomes available again.
            await strapi.entityService.update(
              "api::ad-reservation.ad-reservation",
              ad.ad_reservation.id,
              {
                data: { ad: null },
              }
            );

            logger.info("Expired free ad deactivated", {
              adId: ad.id,
              userId,
              reservationId: ad.ad_reservation.id,
            });
          }

          // Restore reservations once after all ads for this user are deactivated.
          // Calling once per user (not once per ad) prevents creating duplicate reservations.
          const result = await this.restoreUserFreeReservations(userId);

          usersWithRestoredAds.push({
            id: user.id,
            username: user.username,
            email: user.email,
            ...result,
          });
        } catch (error) {
          logger.error("Error processing expired ads for user", {
            userId,
            error: error.message,
          });
        }
      }

      logger.info(
        `Processed ${usersWithRestoredAds.length} users with expired free ads`
      );

      // Send a summary report to admins listing every user whose ads were processed.
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

      logger.info("=== FREE AD RESTORATION COMPLETE ===");

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
      // Count this user's current free reservations: available (ad = null) and active (ad has remaining days > 0).
      // Note: { ad: { id: { $null: true } } } is the correct Strapi v5 entityService syntax
      // for a null-relation check — plain { ad: null } silently returns zero results.
      const currentReservations = (await strapi.entityService.findMany(
        "api::ad-reservation.ad-reservation",
        {
          filters: {
            user: { id: { $eq: userId } },
            price: 0,
            $or: [
              { ad: { id: { $null: true } } }, // Available
              {
                ad: {
                  remaining_days: { $gt: 0 },
                },
              }, // Active
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

      // A user is guaranteed 3 free reservations at all times (available + active). Create however many are missing.
      const neededReservations = Math.max(0, 3 - totalReservations);

      // Create missing free reservations so the user is topped back up to 3.
      for (let i = 0; i < neededReservations; i++) {
        await strapi.entityService.create(
          "api::ad-reservation.ad-reservation",
          {
            data: {
              price: 0,
              total_days: 15,
              user: userId,
              description: `Free reservation restored ${new Date().toISOString()}`,
              publishedAt: new Date(),
            },
          }
        );
      }

      logger.info("Free reservations restored for user", {
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
