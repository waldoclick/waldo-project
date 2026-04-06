import logger from "../utils/logtail";
import { sendMjmlEmail } from "../services/mjml";

interface AdReservationRecord {
  id: number;
  ad?: {
    remaining_days: number;
    banned: boolean;
    rejected: boolean;
  } | null;
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

      interface UserRecord {
        id: number;
        username: string;
        email: string;
      }
      const allUsers = (await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: ["id", "username", "email"],
          pagination: { pageSize: -1 },
        }
      )) as UserRecord[];

      logger.info(`Processing ${allUsers.length} users`);

      const usersWithRestoredAds = [];

      // Process users in batches of 50 to parallelize DB queries without
      // overwhelming the connection pool with thousands of concurrent requests.
      const BATCH_SIZE = 50;
      for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
        const batch = allUsers.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
          batch.map(async (user) => {
            const userId = user.id.toString();
            try {
              const result = await this.restoreUserFreeReservations(userId);
              if (result.neededReservations > 0) {
                return {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  ...result,
                };
              }
              return null;
            } catch (error: unknown) {
              logger.error("Error restoring free reservations for user", {
                userId,
                error: error instanceof Error ? error.message : String(error),
              });
              return null;
            }
          })
        );

        usersWithRestoredAds.push(...results.filter(Boolean));
      }

      logger.info(
        `Restoration complete — users topped up: ${usersWithRestoredAds.length}`
      );

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
        results: `Processed ${usersWithRestoredAds.length} users with restored free reservations`,
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
      // in use (linked ad has remaining_days > 0 and is not banned or rejected).
      // "In use" covers both active ads (active=true) and pending ads (active=false,
      // remaining_days>0) — both consume a reservation slot.
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
                  remaining_days: { $gt: 0 },
                  banned: { $eq: false },
                  rejected: { $eq: false },
                },
              }, // In use by an active or pending ad
            ],
          },
          populate: {
            ad: true,
          },
        }
      )) as AdReservationRecord[];

      const availableReservations = currentReservations.filter(
        (r) => !r.ad
      ).length;
      const activeReservations = currentReservations.filter(
        (r) => r.ad && r.ad.remaining_days > 0 && !r.ad.banned && !r.ad.rejected
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
    } catch (error: unknown) {
      logger.error("Error restoring user free reservations", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
