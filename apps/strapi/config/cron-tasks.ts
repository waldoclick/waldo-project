import UserCronService from "../src/cron/user.cron";
import { AdService } from "../src/cron/ad.cron";
import { CleanupService } from "../src/cron/cleanup.cron";
import { BackupService } from "../src/cron/backup.cron";

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
};
