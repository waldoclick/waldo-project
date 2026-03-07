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
          // Deactivate every expired ad for this user. The ad is set inactive but
          // its reservation is intentionally left linked — it stays as permanent history.
          // restoreUserFreeReservations will create a new free reservation to replace it.
          for (const ad of ads) {
            await strapi.entityService.update("api::ad.ad", ad.id, {
              data: { active: false },
            });

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

      // Global top-up sweep: ensure ALL users have their free reservation pool
      // topped up to 3, not just those whose ads happened to expire today.
      // Users who already had their ads expire on a previous day (and thus weren't
      // caught by the expiredFreeAds query above) are handled here.
      const processedUserIds = new Set(
        usersWithRestoredAds.map((u) => u.id.toString())
      );

      const allUsers = (await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: ["id", "username", "email"],
          pagination: { pageSize: -1 },
        }
      )) as any[];

      for (const user of allUsers) {
        const userId = user.id.toString();

        // Skip users already processed in the expired-ads loop above.
        if (processedUserIds.has(userId)) {
          continue;
        }

        try {
          const result = await this.restoreUserFreeReservations(userId);

          if (result.neededReservations > 0) {
            usersWithRestoredAds.push({
              id: user.id,
              username: user.username,
              email: user.email,
              ...result,
            });
          }
        } catch (error) {
          logger.error("Error in global sweep for user", {
            userId,
            error: error.message,
          });
        }
      }

      logger.info(
        `Global sweep complete — total users topped up: ${usersWithRestoredAds.length}`
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
   * Restore free reservations for a specific user.
   * Ensures the user always has 3 free reservations in the "active pool":
   *   - available: price=0 reservations with no ad linked (ad = null)
   *   - in-use:    price=0 reservations linked to an ad that is still active (ad.active = true)
   *
   * Reservations linked to an expired ad (ad.active = false) are permanent history
   * and are NOT counted — a new free reservation must be created to replace them.
   */
  private async restoreUserFreeReservations(userId: string) {
    try {
      // Count this user's current free reservations: available (ad = null) and
      // in active use (linked ad has active = true).
      // Note: { ad: { id: { $null: true } } } is the correct Strapi v5 entityService syntax
      // for a null-relation check — plain { ad: null } silently returns zero results.
      const currentReservations = (await strapi.entityService.findMany(
        "api::ad-reservation.ad-reservation",
        {
          filters: {
            user: { id: { $eq: userId } },
            price: 0,
            $or: [
              { ad: { id: { $null: true } } }, // Available (not yet used)
              {
                ad: {
                  active: { $eq: true },
                },
              }, // In use by an active ad
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
        (r) => r.ad && r.ad.active === true
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
