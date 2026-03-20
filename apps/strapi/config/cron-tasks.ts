import UserCronService from "../src/cron/ad-free-reservation-restore.cron";
import { AdService } from "../src/cron/ad-expiry.cron";
import { CleanupService } from "../src/cron/media-cleanup.cron";
import { BackupService } from "../src/cron/bbdd-backup.cron";
import { VerificationCodeCleanupService } from "../src/cron/verification-code-cleanup.cron";
import { SubscriptionChargeService } from "../src/cron/subscription-charge.cron";
import runConfirmedMigration from "../seeders/user-confirmed-migration";

export default {
  /**
   * Restores free ad reservations for users whose free ads expired today.
   * Runs daily at 2:00 AM Santiago time (America/Santiago).
   * Calls UserCronService.restoreFreeAds() — see user.cron.ts for full logic.
   */
  userCron: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO CRON RESTORE FREE ADS ===");
      const userCronService = new UserCronService();
      await userCronService.restoreFreeAds();
      strapi.log.info("=== CRON RESTORE FREE ADS FINALIZADO ===");
    },
    options: {
      rule: "0 2 * * *", // Every day at 2:00 AM (America/Santiago)
      // rule: "* * * * *", // Test
      tz: "America/Santiago",
    },
  },

  /**
   * Decrements remaining_days by 1 for every active ad and deactivates ads
   * that reach 0 remaining days. Uses the remainings collection to prevent
   * double-decrement if the cron fires more than once in a day.
   * Runs daily at 1:00 AM Santiago time (America/Santiago).
   * Calls AdService.decrementRemainingDays() — see ad.cron.ts for full logic.
   */
  adCron: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO CRON DECREMENT REMAINING DAYS ===");
      const adService = new AdService();
      await adService.decrementRemainingDays();
      strapi.log.info("=== CRON DECREMENT REMAINING DAYS FINALIZADO ===");
    },
    options: {
      rule: "0 1 * * *", // Every day at 1:00 AM (America/Santiago)
      // rule: "* * * * *", // Test
      tz: "America/Santiago",
    },
  },

  /**
   * Audits the 'ads' folder in Strapi/Cloudinary for orphan images —
   * images that are no longer referenced by any ad in the database.
   * Audit-only: logs orphans, never auto-deletes. Runs every Sunday at 4:00 AM
   * Santiago time (America/Santiago).
   * Calls CleanupService.findOrphanImages() — see cleanup.cron.ts for full logic.
   */
  cleanupCron: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO CRON CLEANUP ORPHAN IMAGES ===");
      const cleanupService = new CleanupService();
      await cleanupService.findOrphanImages();
      strapi.log.info("=== CRON CLEANUP ORPHAN IMAGES FINALIZADO ===");
    },
    options: {
      rule: "0 4 * * 0", // Every Sunday at 4:00 AM (America/Santiago)
      // rule: "* * * * *", // Test - cada 1 minuto
      tz: "America/Santiago",
    },
  },

  /**
   * Creates a compressed database backup using pg_dump and rotates old backups
   * to keep only the 7 most recent files. Password is redacted from logs.
   * Runs daily at 3:00 AM Santiago time (America/Santiago).
   * Calls BackupService.createDatabaseBackup() — see backup.cron.ts for full logic.
   */
  backupCron: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO CRON DATABASE BACKUP ===");
      const backupService = new BackupService();
      await backupService.createDatabaseBackup();
      strapi.log.info("=== CRON DATABASE BACKUP FINALIZADO ===");
    },
    options: {
      rule: "0 3 * * *", // Every day at 3:00 AM (America/Santiago)
      // rule: "* * * * *", // Test - cada 1 minuto
      tz: "America/Santiago",
    },
  },

  /**
   * Deletes expired verification-code records (expiresAt < now) to prevent
   * table bloat. Each login attempt creates a record — expired ones accumulate.
   * Runs daily at 4:00 AM Santiago time (America/Santiago).
   * Calls VerificationCodeCleanupService.cleanExpiredCodes() — see verification-code-cleanup.cron.ts.
   */
  verificationCodeCleanupCron: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO CRON VERIFICATION CODE CLEANUP ===");
      const cleanupService = new VerificationCodeCleanupService();
      await cleanupService.cleanExpiredCodes();
      strapi.log.info("=== CRON VERIFICATION CODE CLEANUP FINALIZADO ===");
    },
    options: {
      rule: "0 4 * * *", // Every day at 4:00 AM (America/Santiago)
      // rule: "* * * * *", // Test
      tz: "America/Santiago",
    },
  },

  /**
   * Charges active PRO subscribers whose billing period has expired.
   * Creates subscription-payment records, retries failed charges on days 1 and 3,
   * and deactivates subscriptions after 3 consecutive failures.
   * Runs daily at 5:00 AM Santiago time (America/Santiago).
   * Calls SubscriptionChargeService.chargeExpiredSubscriptions().
   */
  subscriptionChargeCron: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO CRON SUBSCRIPTION CHARGE ===");
      const service = new SubscriptionChargeService();
      await service.chargeExpiredSubscriptions();
      strapi.log.info("=== CRON SUBSCRIPTION CHARGE FINALIZADO ===");
    },
    options: {
      rule: "0 5 * * *", // Every day at 5:00 AM (America/Santiago)
      // rule: "* * * * *", // Test
      tz: "America/Santiago",
    },
  },

  /**
   * One-time migration: sets confirmed = true on all existing users.
   * Execute ONCE before enabling email_confirmation in Admin Panel.
   * Idempotent — safe to re-run; returns early if all users are already confirmed.
   * Trigger manually: POST /api/cron-runner/user-confirmed-migration
   */
  userConfirmedMigration: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO MIGRACIÓN USUARIO CONFIRMED ===");
      await runConfirmedMigration(strapi);
      strapi.log.info("=== MIGRACIÓN USUARIO CONFIRMED FINALIZADA ===");
    },
    options: {
      rule: "0 0 1 1 *", // far-future date — never auto-runs; execute manually only
      tz: "America/Santiago",
    },
  },
};
