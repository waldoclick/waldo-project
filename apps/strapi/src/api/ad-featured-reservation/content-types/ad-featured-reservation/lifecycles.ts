/**
 * ad-featured-reservation lifecycles
 *
 * Recalculate sort_priority on the related ad whenever a featured reservation
 * is created, updated, or deleted. This keeps the denormalized sort_priority
 * field in sync with the actual featured status.
 */

import { computeSortPriority } from "../../../../api/ad/services/ad";

async function recalculateAdSortPriority(adId: number): Promise<void> {
  const fullAd = await strapi.db.query("api::ad.ad").findOne({
    where: { id: adId },
    populate: { ad_featured_reservation: true, user: true },
  });

  if (!fullAd) return;

  const priority = computeSortPriority(
    fullAd as {
      ad_featured_reservation?: unknown;
      user?: { pro?: boolean } | null;
    }
  );

  const adRecord = fullAd as Record<string, unknown>;
  if (adRecord.sort_priority !== priority) {
    await strapi.db.query("api::ad.ad").update({
      where: { id: adId },
      data: { sort_priority: priority },
    });
  }
}

export default {
  /**
   * afterCreate: recalculate the related ad's sort_priority after a featured
   * reservation is created (ad transitions from not-featured to featured).
   */
  async afterCreate(event: { result: Record<string, unknown> }) {
    const { result } = event;
    const ad = result.ad as Record<string, unknown> | null | undefined;
    if (ad?.id) {
      try {
        await recalculateAdSortPriority(Number(ad.id));
      } catch (error) {
        console.error(
          "lifecycles(ad-featured-reservation): afterCreate recalculate sort_priority failed",
          error
        );
      }
    }
  },

  /**
   * afterUpdate: recalculate sort_priority for both the old and new ad when
   * a featured reservation is reassigned.
   */
  async afterUpdate(event: {
    result: Record<string, unknown>;
    params: { data?: Record<string, unknown>; where?: Record<string, unknown> };
  }) {
    const { result } = event;
    const ad = result.ad as Record<string, unknown> | null | undefined;
    if (ad?.id) {
      try {
        await recalculateAdSortPriority(Number(ad.id));
      } catch (error) {
        console.error(
          "lifecycles(ad-featured-reservation): afterUpdate recalculate sort_priority failed",
          error
        );
      }
    }
  },

  /**
   * afterDelete: recalculate the related ad's sort_priority after a featured
   * reservation is deleted (ad transitions from featured to not-featured).
   * At this point the reservation is gone so computeSortPriority will return 2.
   */
  async afterDelete(event: { result: Record<string, unknown> }) {
    const { result } = event;
    const ad = result.ad as Record<string, unknown> | null | undefined;
    if (ad?.id) {
      try {
        await recalculateAdSortPriority(Number(ad.id));
      } catch (error) {
        console.error(
          "lifecycles(ad-featured-reservation): afterDelete recalculate sort_priority failed",
          error
        );
      }
    }
  },
};
