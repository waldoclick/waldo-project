import logger from "../utils/logtail";
import { sendMjmlEmail } from "../services/mjml";

export interface ICronjobResult {
  success: boolean;
  results?: string;
  error?: string;
}

/**
 * FeaturedCronService
 *
 * Guarantees every registered user always has exactly 3 "free available"
 * ad-reservation slots (api::ad-reservation.ad-reservation). A slot is
 * considered "free available" when:
 *   - price = 0  (it is a complimentary reservation)
 *   - AND (ad = null OR ad.active = false)  (not currently linked to a live ad)
 *
 * Runs daily at 2:30 AM America/Santiago via cron-tasks.ts.
 */
export default class FeaturedCronService {
  /**
   * Scan every user, count their free-available ad-reservations,
   * and create however many slots are missing to reach the guaranteed minimum of 3.
   *
   * Algorithm:
   *   1. Fetch all users (plugin::users-permissions.user)
   *   2. For each user:
   *        a. Count free-available slots: price=0 AND (ad=null OR ad.active=false)
   *        b. neededSlots = max(0, 3 - freeAvailableCount)
   *        c. Create each missing slot with price=0, total_days=15
   *   3. Send email report listing every user who received new slots
   *   4. Return summary result
   */
  async restoreFreeFeaturedReservations(): Promise<ICronjobResult> {
    try {
      // Guard: verify strapi global is available before touching entityService.
      if (typeof strapi === "undefined") {
        throw new Error("strapi is not defined");
      }

      logger.info("=== STARTING FREE AD RESERVATION RESTORE ===");

      // Fetch all users — id, username, and email are needed for the report.
      const allUsers = (await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: ["id", "username", "email"],
          pagination: { pageSize: -1 },
        }
      )) as any[];

      logger.info(`Processing ${allUsers.length} users`);

      let totalCreated = 0;

      // Collect users who received new slots so we can include them in the report.
      const usersWithNewSlots: {
        id: number;
        username: string;
        email: string;
        freeAvailableCount: number;
        neededSlots: number;
        totalAfterRestore: number;
      }[] = [];

      // Iterate over every user and top up their free ad reservation pool.
      for (const user of allUsers) {
        const userId = user.id;

        try {
          // Count the user's current free-available ad-reservations.
          // Free-available = price=0 AND (ad is null OR ad.active=false).
          // Note: { ad: { id: { $null: true } } } is the correct Strapi v5
          // entityService syntax for a null-relation check — plain { ad: null }
          // does not work and silently returns zero results.
          const freeAvailableSlots = (await strapi.entityService.findMany(
            "api::ad-reservation.ad-reservation",
            {
              filters: {
                user: { id: { $eq: userId } },
                price: 0, // Free slots only
                $or: [
                  { ad: { id: { $null: true } } }, // Not linked to any ad
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

          // Create each missing slot with total_days=15, consistent with how
          // registration (authController.ts) initialises free ad-reservations.
          for (let i = 0; i < neededSlots; i++) {
            await strapi.entityService.create(
              "api::ad-reservation.ad-reservation",
              {
                data: {
                  price: 0,
                  total_days: 15,
                  user: userId,
                  description: `Free reservation restored ${new Date().toISOString()}`,
                },
              }
            );

            totalCreated++;
          }

          if (neededSlots > 0) {
            logger.info("Free ad reservations created for user", {
              userId,
              freeAvailableCount,
              neededSlots,
              totalAfterRestore: freeAvailableCount + neededSlots,
            });

            usersWithNewSlots.push({
              id: user.id,
              username: user.username,
              email: user.email,
              freeAvailableCount,
              neededSlots,
              totalAfterRestore: freeAvailableCount + neededSlots,
            });
          }
        } catch (error) {
          // Per-user errors are caught individually so one bad user does not abort the whole run.
          logger.error("Error processing ad reservations for user", {
            userId,
            error: error.message,
          });
        }
      }

      logger.info(
        `=== FREE AD RESERVATION RESTORE COMPLETE — users: ${allUsers.length}, slots created: ${totalCreated} ===`
      );

      // Send an admin report listing every user who received new slots this run.
      if (usersWithNewSlots.length > 0) {
        const adminEmails =
          process.env.ADMIN_EMAILS || "waldo.development@gmail.com";
        const emailArray = adminEmails.split(",").map((email) => email.trim());

        await sendMjmlEmail(
          strapi,
          "report-free-reservations-restoration",
          emailArray,
          "Reporte de restauración de reservas gratuitas",
          {
            users: usersWithNewSlots,
          }
        );
      }

      return {
        success: true,
        results: `Processed ${allUsers.length} users, created ${totalCreated} free ad reservation slots`,
      };
    } catch (error) {
      logger.error("Error in restoreFreeFeaturedReservations:", error);
      return {
        success: false,
        error: "Failed to restore free ad reservations",
      };
    }
  }
}
