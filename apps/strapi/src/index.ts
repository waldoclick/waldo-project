import populateCategories from "../seeders/categories";
import populateConditions from "../seeders/conditions";
import populateFaqs from "../seeders/faqs";
import populatePacks from "../seeders/packs";
import populateRegions from "../seeders/regions";
import populateAdDraftMigration from "../seeders/ad-draft-migration";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Verificar si los seeders están habilitados
    const runSeeders = process.env.APP_RUN_SEEDERS === "true";

    if (!runSeeders) {
      console.log("⏭️ Seeders deshabilitados (APP_RUN_SEEDERS=false)");
      return;
    }

    console.log("🌱 Ejecutando seeders...");

    try {
      await populateCategories(strapi);
      await populateConditions(strapi);
      await populateFaqs(strapi);
      await populatePacks(strapi);
      await populateRegions(strapi);
      await populateAdDraftMigration(strapi);
      console.log("✅ Seeders completados exitosamente");
    } catch (error) {
      console.error("❌ Error ejecutando seeders:", error);
    }
  },
};
