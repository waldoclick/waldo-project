import populateCategories from "../seeders/categories";
import populateBlogCategories from "../seeders/blog-categories";
import populateArticles from "../seeders/articles";
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
        await populateBlogCategories(strapi);
        await populateArticles(strapi);
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

    // Grant real-user roles the stats/order action permissions on every boot.
    // Both "authenticated" and "manager" are real end-user roles (manager only
    // adds /dashboard access) — every account-area endpoint must be granted to
    // both, or manager users hit 403 (e.g. Total invertido $0, Contactos $0).
    // Idempotent: skips any action already present (guards against duplicate rows).
    // v5 permission content-type has only action + role (no extra flag field).
    // recordContact route is auth:false so this grant is a no-op for access;
    // kept for D-05 fidelity.
    try {
      const statsActionUIDs = [
        "api::ad-view.ad-view.stats",
        "api::ad-view.ad-view.panelViewsTotal",
        "api::ad-contact.ad-contact.recordContact",
        "api::ad-contact.ad-contact.contactsTotal",
        "api::order.order.meSummary",
      ];

      const roles = await strapi.db
        .query("plugin::users-permissions.role")
        .findMany({
          where: { type: { $in: ["authenticated", "manager"] } },
          populate: ["permissions"],
        });

      if (!roles.length) {
        console.warn(
          "stats permissions grant: no end-user roles found — skipping",
        );
      } else {
        let created = 0;
        for (const role of roles) {
          // Cast each permission row as { action: string } — v5 shape is action + role
          const existing = new Set(
            (role.permissions as Array<{ action: string }>).map(
              (p) => p.action,
            ),
          );

          for (const uid of statsActionUIDs) {
            if (!existing.has(uid)) {
              await strapi.db
                .query("plugin::users-permissions.permission")
                .create({ data: { action: uid, role: role.id } });
              created++;
            }
          }
        }

        console.log(
          `stats permissions grant: ${created} created across ${roles.length} role(s)`,
        );
      }
    } catch (error) {
      console.error("Error granting stats permissions:", error);
    }

    // Grant the PUBLIC role read access to blog-category. The route is auth:false,
    // but Strapi v5 sanitizes POPULATED relations by the related type's role
    // permissions — without this, article.blog_categories is stripped from the
    // (public, proxy) article responses. Idempotent.
    try {
      const blogCatActions = [
        "api::blog-category.blog-category.find",
        "api::blog-category.blog-category.findOne",
      ];
      const publicRole = await strapi.db
        .query("plugin::users-permissions.role")
        .findOne({
          where: { type: "public" },
          populate: ["permissions"],
        });

      if (publicRole) {
        const existing = new Set(
          (publicRole.permissions as Array<{ action: string }>).map(
            (p) => p.action,
          ),
        );
        let created = 0;
        for (const uid of blogCatActions) {
          if (!existing.has(uid)) {
            await strapi.db
              .query("plugin::users-permissions.permission")
              .create({ data: { action: uid, role: publicRole.id } });
            created++;
          }
        }
        console.log(
          `blog-category public permissions grant: ${created} created`,
        );
      }
    } catch (error) {
      console.error("Error granting blog-category permissions:", error);
    }
  },
};
