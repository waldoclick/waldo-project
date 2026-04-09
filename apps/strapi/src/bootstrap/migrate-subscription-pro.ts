import logger from "../utils/logtail";

interface UserRecord {
  id: number;
  tbk_user: string;
  pro_card_type?: string | null;
  pro_card_last4?: string | null;
  pro_inscription_token?: string | null;
  pro_pending_invoice?: boolean | null;
}

/**
 * One-time bootstrap migration: creates subscription-pro records for all
 * PRO users who have tbk_user set on their user record (pre-migration state).
 * Idempotent — skips users who already have a subscription-pro record.
 */
export async function migrateSubscriptionPro(): Promise<void> {
  const users = (await strapi.db
    .query("plugin::users-permissions.user")
    .findMany({
      where: {
        tbk_user: { $notNull: true },
        pro_status: { $in: ["active", "cancelled"] },
      },
    })) as UserRecord[];

  if (users.length === 0) {
    logger.info("migrateSubscriptionPro: no PRO users to migrate");
    return;
  }

  logger.info(`migrateSubscriptionPro: found ${users.length} users to check`);

  for (const user of users) {
    const existing = await strapi.db
      .query("api::subscription-pro.subscription-pro")
      .findOne({ where: { user: { id: user.id } } });

    if (existing) {
      logger.info(
        `migrateSubscriptionPro: skipping user ${user.id} — subscription-pro already exists`
      );
      continue;
    }

    await strapi.db.query("api::subscription-pro.subscription-pro").create({
      data: {
        user: user.id,
        tbk_user: user.tbk_user,
        card_type: user.pro_card_type ?? null,
        card_last4: user.pro_card_last4 ?? null,
        inscription_token: user.pro_inscription_token ?? null,
        pending_invoice: user.pro_pending_invoice ?? false,
        publishedAt: new Date(),
      },
    });

    logger.info(
      `migrateSubscriptionPro: created subscription-pro for user ${user.id}`
    );
  }
}
