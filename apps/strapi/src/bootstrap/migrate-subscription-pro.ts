import logger from "../utils/logtail";

interface ProUserRow {
  id: number;
  tbk_user: string | null;
  pro_card_type: string | null;
  pro_card_last4: string | null;
  pro_inscription_token: string | null;
  pro_pending_invoice: boolean | null;
}

/**
 * One-time migration: copies card enrollment data from up_users to subscription_pros
 * for all users with pro_status IN ('active', 'cancelled') and tbk_user IS NOT NULL.
 *
 * Idempotent: skips users who already have a subscription-pro record.
 * Safe to run multiple times on restart.
 */
export async function migrateSubscriptionPro(): Promise<void> {
  const subProCreate = strapi.entityService.create as (
    _uid: string,
    _params: { data: Record<string, unknown> }
  ) => Promise<unknown>;

  // Find all active/cancelled users with card data
  const proUsers = (await strapi.db
    .query("plugin::users-permissions.user")
    .findMany({
      where: {
        pro_status: { $in: ["active", "cancelled"] },
        tbk_user: { $notNull: true },
      },
      select: ["id", "tbk_user", "pro_card_type", "pro_card_last4", "pro_inscription_token", "pro_pending_invoice"],
      limit: -1,
    })) as ProUserRow[];

  if (proUsers.length === 0) {
    logger.info("migrateSubscriptionPro: no PRO users to migrate");
    return;
  }

  let migrated = 0;
  let skipped = 0;

  for (const user of proUsers) {
    // Idempotency: check if subscription-pro already exists for this user
    const existing = await strapi.db
      .query("api::subscription-pro.subscription-pro")
      .findOne({ where: { user: { id: user.id } } });

    if (existing) {
      skipped++;
      continue;
    }

    await subProCreate("api::subscription-pro.subscription-pro", {
      data: {
        user: user.id,
        tbk_user: user.tbk_user,
        card_type: user.pro_card_type,
        card_last4: user.pro_card_last4,
        inscription_token: user.pro_inscription_token,
        pending_invoice: Boolean(user.pro_pending_invoice ?? false),
        publishedAt: new Date(),
      },
    });
    migrated++;
  }

  logger.info(`migrateSubscriptionPro: migrated ${migrated}, skipped ${skipped} (already exist)`);
}
