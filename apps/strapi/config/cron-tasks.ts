import UserCronService from "../src/cron/user.cron";
import { AdService } from "../src/cron/ad.cron";
import { CleanupService } from "../src/cron/cleanup.cron";
import { BackupService } from "../src/cron/backup.cron";

export default {
  /**
   * Cron para restaurar los avisos gratuitos de los usuarios
   * Se ejecuta todos los días a las 3 AM hora de Santiago
   */
  userCron: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO CRON RESTORE FREE ADS ===");
      const userCronService = new UserCronService();
      await userCronService.restoreFreeAds();
      strapi.log.info("=== CRON RESTORE FREE ADS FINALIZADO ===");
    },
    options: {
      rule: "0 2 * * *", // Todos los días a las 2:00 AM
      // rule: "* * * * *", // Test
      tz: "America/Santiago",
    },
  },

  /**
   * Cron para decrementar los días restantes de los anuncios
   * Se ejecuta todos los días a las 2 AM hora de Santiago
   */
  adCron: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO CRON DECREMENT REMAINING DAYS ===");
      const adService = new AdService();
      await adService.decrementRemainingDays();
      strapi.log.info("=== CRON DECREMENT REMAINING DAYS FINALIZADO ===");
    },
    options: {
      rule: "0 1 * * *", // Todos los días a las 1:00 AM
      // rule: "* * * * *", // Test
      tz: "America/Santiago",
    },
  },

  /**
   * Cron para buscar imágenes huérfanas en la carpeta 'ads' de Cloudinary
   * Se ejecuta todos los domingos a las 4 AM hora de Santiago
   */
  cleanupCron: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO CRON CLEANUP ORPHAN IMAGES ===");
      const cleanupService = new CleanupService();
      await cleanupService.findOrphanImages();
      strapi.log.info("=== CRON CLEANUP ORPHAN IMAGES FINALIZADO ===");
    },
    options: {
      rule: "0 4 * * 0", // Todos los domingos a las 4:00 AM
      // rule: "* * * * *", // Test - cada 1 minuto
      tz: "America/Santiago",
    },
  },

  /**
   * Cron para crear backup de la base de datos
   * Se ejecuta todos los días a las 3 AM hora de Santiago
   */
  backupCron: {
    task: async ({ strapi }) => {
      strapi.log.info("=== INICIANDO CRON DATABASE BACKUP ===");
      const backupService = new BackupService();
      await backupService.createDatabaseBackup();
      strapi.log.info("=== CRON DATABASE BACKUP FINALIZADO ===");
    },
    options: {
      rule: "0 3 * * *", // Todos los días a las 3:00 AM
      // rule: "* * * * *", // Test - cada 1 minuto
      tz: "America/Santiago",
    },
  },
};
