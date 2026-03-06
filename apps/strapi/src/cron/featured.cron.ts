import logger from "../utils/logtail";

export interface ICronjobResult {
  success: boolean;
  results?: string;
  error?: string;
}

/**
 * FeaturedCronService
 *
 * Guarantees every registered user always has exactly 3 "free available"
 * ad-featured-reservation slots. A slot is considered "free available" when:
 *   - price = 0  (it is a complimentary featured reservation)
 *   - AND (ad = null OR ad.active = false)  (not currently linked to a live ad)
 *
 * Runs daily at 2:30 AM America/Santiago via cron-tasks.ts.
 */
export default class FeaturedCronService {
  /**
   * Scan every user, count their free-available featured reservations,
   * and create however many slots are missing to reach the guaranteed minimum of 3.
   *
   * Algorithm:
   *   1. Fetch all users (plugin::users-permissions.user)
   *   2. For each user:
   *        a. Count free-available slots: price=0 AND (ad=null OR ad.active=false)
   *        b. neededSlots = max(0, 3 - freeAvailableCount)
   *        c. Create each missing slot with price=0, no total_days (no expiry concept)
   *   3. Log summary and return result
   */
  async restoreFreeFeaturedReservations(): Promise<ICronjobResult> {
    try {
      // Guard: verify strapi global is available before touching entityService.
      if (typeof strapi === "undefined") {
        throw new Error("strapi is not defined");
      }

      logger.info("=== STARTING FREE FEATURED RESERVATION RESTORE ===");

      // Fetch all users — we need every user id, nothing else.
      const allUsers = (await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: ["id"],
          pagination: { pageSize: -1 },
        }
      )) as any[];

      logger.info(`Processing ${allUsers.length} users`);

      let totalCreated = 0;

      // Iterate over every user and top up their free featured reservation pool.
      for (const user of allUsers) {
        const userId = user.id;

        try {
          // Count the user's current free-available featured reservations.
          // Free-available = price=0 AND (ad is null OR ad.active=false).
          const freeAvailableSlots = (await strapi.entityService.findMany(
            "api::ad-featured-reservation.ad-featured-reservation",
            {
              filters: {
                user: { id: { $eq: userId } },
                price: 0, // Free slots only
                $or: [
                  { ad: null }, // Not linked to any ad
                  { ad: { active: { $eq: false } } }, // Linked to an inactive ad
                ],
              },
              populate: { ad: true },
              pagination: { pageSize: -1 },
            }
          )) as any[];

          const freeAvailableCount = freeAvailableSlots.length;

          // Determine how many new slots must be created to reach the guaranteed 3.
          const neededSlots = Math.max(0, 3 - freeAvailableCount);

          // Create each missing slot.  Note: total_days is intentionally omitted —
          // featured reservations have no expiry concept (unlike ad-reservations).
          for (let i = 0; i < neededSlots; i++) {
            await strapi.entityService.create(
              "api::ad-featured-reservation.ad-featured-reservation",
              {
                data: {
                  price: 0,
                  user: userId,
                  description: `Free featured reservation restored ${new Date().toISOString()}`,
                  publishedAt: new Date(),
                  // total_days intentionally absent — featured slots never expire
                },
              }
            );

            totalCreated++;
          }

          if (neededSlots > 0) {
            logger.info("Free featured reservations created for user", {
              userId,
              freeAvailableCount,
              neededSlots,
              totalAfterRestore: freeAvailableCount + neededSlots,
            });
          }
        } catch (error) {
          // Per-user errors are caught individually so one bad user does not abort the whole run.
          logger.error("Error processing featured reservations for user", {
            userId,
            error: error.message,
          });
        }
      }

      logger.info(
        `=== FREE FEATURED RESERVATION RESTORE COMPLETE — users: ${allUsers.length}, slots created: ${totalCreated} ===`
      );

      return {
        success: true,
        results: `Processed ${allUsers.length} users, created ${totalCreated} free featured reservation slots`,
      };
    } catch (error) {
      logger.error("Error in restoreFreeFeaturedReservations:", error);
      return {
        success: false,
        error: "Failed to restore free featured reservations",
      };
    }
  }
}
