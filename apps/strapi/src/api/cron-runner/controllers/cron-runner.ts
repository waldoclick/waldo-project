/**
 * Cron Runner Controller
 *
 * Handles POST /api/cron-runner/:name requests.
 * Accepts kebab-case names and maps them to the camelCase keys in cron-tasks.ts.
 *
 * Supported names: user-cron, ad-cron, cleanup-cron, backup-cron, verification-code-cleanup, user-confirmed-migration, subscription-charge
 */

import { Context } from "koa";

const CRON_NAME_MAP: Record<string, string> = {
  "user-cron": "userCron",
  "ad-cron": "adCron",
  "cleanup-cron": "cleanupCron",
  "backup-cron": "backupCron",
  "verification-code-cleanup": "verificationCodeCleanupCron",
  "user-confirmed-migration": "userConfirmedMigration",
  "subscription-charge": "subscriptionChargeCron",
};

export default {
  async run(ctx: Context) {
    const { name } = ctx.params as { name: string };

    const taskKey = CRON_NAME_MAP[name];
    if (!taskKey) {
      const available = Object.keys(CRON_NAME_MAP).join(", ");
      return ctx.badRequest(
        `Unknown cron job "${name}". Available: ${available}`
      );
    }

    const cronTasks = strapi.config.get("cron-tasks") as Record<string, any>;
    const task = cronTasks?.[taskKey];

    if (!task) {
      return ctx.internalServerError(
        `Cron task "${taskKey}" is not registered in cron-tasks.ts.`
      );
    }

    strapi.log.info(`[cron-runner] Manually triggering cron: ${name}`);

    try {
      await task.task({ strapi });
      strapi.log.info(`[cron-runner] Cron "${name}" completed successfully.`);
      ctx.body = {
        ok: true,
        cron: name,
        message: `Cron "${name}" ran successfully.`,
      };
    } catch (error: any) {
      strapi.log.error(`[cron-runner] Cron "${name}" failed: ${error.message}`);
      return ctx.internalServerError(
        `Cron "${name}" threw an error: ${error.message}`
      );
    }
  },
};
