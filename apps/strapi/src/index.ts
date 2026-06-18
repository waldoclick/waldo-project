import populateCategories from "../seeders/categories";
import populateConditions from "../seeders/conditions";
import populateFaqs from "../seeders/faqs";
import populatePacks from "../seeders/packs";
import populateRegions from "../seeders/regions";
import populateAdDraftMigration from "../seeders/ad-draft-migration";
import populatePolicies from "../seeders/policies";
import populateTerms from "../seeders/terms";
import { recalculateSortPriorities } from "./api/ad/services/ad";

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
    } else {
      console.log("🌱 Ejecutando seeders...");

      try {
        await populateCategories(strapi);
        await populateConditions(strapi);
        await populateFaqs(strapi);
        await populatePacks(strapi);
        await populateRegions(strapi);
        await populateAdDraftMigration(strapi);
        await populatePolicies(strapi);
        await populateTerms(strapi);
        console.log("✅ Seeders completados exitosamente");
      } catch (error) {
        console.error("❌ Error ejecutando seeders:", error);
      }
    }

    // Backfill sort_priority for all existing ads on every start
    try {
      const updated = await recalculateSortPriorities();
      console.log(`sort_priority backfill complete: ${updated} ads updated`);
    } catch (error) {
      console.error("Error backfilling sort_priority:", error);
    }

    // Grant the Authenticated role the stats action permissions on every boot.
    // Idempotent: skips any action already present (guards against duplicate rows).
    // v5 permission content-type has only action + role (no extra flag field).
    // recordContact route is auth:false so this grant is a no-op for access;
    // kept for D-05 fidelity. Real 403→200 flips: stats, panelViewsTotal, contactsTotal.
    try {
      const statsActionUIDs = [
        "api::ad-view.ad-view.stats",
        "api::ad-view.ad-view.panelViewsTotal",
        "api::ad-contact.ad-contact.recordContact",
        "api::ad-contact.ad-contact.contactsTotal",
        "api::order.order.meSummary",
      ];

      const role = await strapi.db
        .query("plugin::users-permissions.role")
        .findOne({
          where: { type: "authenticated" },
          populate: ["permissions"],
        });

      if (!role) {
        console.warn(
          "stats permissions grant: Authenticated role not found — skipping",
        );
      } else {
        // Cast each permission row as { action: string } — v5 shape has only action + role
        const existing = new Set(
          (role.permissions as Array<{ action: string }>).map((p) => p.action),
        );

        let created = 0;
        for (const uid of statsActionUIDs) {
          if (!existing.has(uid)) {
            await strapi.db
              .query("plugin::users-permissions.permission")
              .create({ data: { action: uid, role: role.id } });
            created++;
          }
        }

        const alreadyPresent = statsActionUIDs.length - created;
        console.log(
          `stats permissions grant: ${created} created, ${alreadyPresent} already present`,
        );
      }
    } catch (error) {
      console.error("Error granting stats permissions:", error);
    }
  },
};
