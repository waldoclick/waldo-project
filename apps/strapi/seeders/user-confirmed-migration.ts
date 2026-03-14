import type { Core } from "@strapi/strapi";

/**
 * One-time migration: sets confirmed = true on all existing users that have
 * confirmed = false or confirmed = NULL.
 *
 * Safe to re-run: uses findMany to target only unconfirmed users. Returns early
 * if none found (idempotent).
 *
 * MUST be run BEFORE enabling email_confirmation in Strapi Admin Panel.
 * Prevents existing users from being locked out after the toggle is flipped.
 */
const runConfirmedMigration = async (strapi: Core.Strapi): Promise<void> => {
  strapi.log.info("🔄 Migrating unconfirmed users to confirmed=true...");

  try {
    const unconfirmedUsers = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: {
          $or: [{ confirmed: { $eq: false } }, { confirmed: { $null: true } }],
        },
        select: ["id"],
      });

    if (unconfirmedUsers.length === 0) {
      strapi.log.info("✅ All users already confirmed — migration not needed");
      return;
    }

    strapi.log.info(
      `📋 Found ${unconfirmedUsers.length} unconfirmed users — migrating...`
    );

    const ids = unconfirmedUsers.map((u) => u.id);

    await strapi.db.query("plugin::users-permissions.user").updateMany({
      where: { id: { $in: ids } },
      data: { confirmed: true },
    });

    strapi.log.info(
      `✅ Migration complete: ${ids.length} users set to confirmed=true`
    );
  } catch (error) {
    const e = error as { message?: string };
    strapi.log.error(`❌ Migration failed: ${e.message ?? "unknown error"}`);
    throw error;
  }
};

export default runConfirmedMigration;
