import type { Core } from "@strapi/strapi";

/**
 * One-time migration: sets draft: true on all ads that match the abandoned
 * condition (active=false, ad_reservation=null).
 *
 * Safe to re-run: uses updateMany with a targeted where clause, skipping
 * ads that already have draft: true.
 */
const populateAdDraftMigration = async (strapi: Core.Strapi): Promise<void> => {
  console.log("🔄 Migrando avisos abandonados a draft: true...");

  try {
    // Find ads matching the abandoned condition that haven't been migrated yet
    const abandonedAds = await strapi.db.query("api::ad.ad").findMany({
      where: {
        active: { $eq: false },
        ad_reservation: { $null: true },
        draft: { $ne: true },
      },
      select: ["id"],
    });

    if (abandonedAds.length === 0) {
      console.log(
        "✅ No hay avisos abandonados para migrar (ya migrados o ninguno existe)"
      );
      return;
    }

    console.log(
      `📋 Encontrados ${abandonedAds.length} avisos para migrar a draft: true`
    );

    const ids = abandonedAds.map((ad) => ad.id);

    // Batch update all matching ads to draft: true
    await strapi.db.query("api::ad.ad").updateMany({
      where: { id: { $in: ids } },
      data: { draft: true },
    });

    console.log(
      `✅ Migración completada: ${abandonedAds.length} avisos actualizados a draft: true`
    );
  } catch (error) {
    const e = error as { message?: string };
    console.error(
      `❌ Error en migración de draft: ${e.message ?? "unknown error"}`
    );
    throw error;
  }
};

export default populateAdDraftMigration;
