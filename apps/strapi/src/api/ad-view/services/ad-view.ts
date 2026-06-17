/**
 * Ad View Service
 *
 * Event-sourced view tracking for advertisements.
 * Records one row per visitor per day, excluding the ad owner.
 * Errors are swallowed — tracking must never break the ad page.
 */

import { factories } from "@strapi/strapi";
import crypto from "crypto";

export default factories.createCoreService(
  "api::ad-view.ad-view",
  ({ strapi }) => ({
    /**
     * Record a view event for an ad.
     *
     * - Owner exclusion: if viewerId === ad.user.id, returns early (no row).
     * - Per-visitor/day dedupe: visitor_hash = sha256(ip|ua|yyyy-mm-dd).
     *   If a view with the same hash already exists today, skips creation.
     * - All errors are swallowed — tracking is fire-and-forget.
     *
     * @param adDocumentId - Strapi documentId of the ad
     * @param viewerId - Strapi user id of the viewer, or null for anonymous
     * @param source - Context where the view originated (e.g. "detail")
     * @param ip - Visitor IP address
     * @param ua - Visitor User-Agent header value
     */
    async recordView(
      adDocumentId: string,
      viewerId: number | null,
      source: string | null,
      ip: string,
      ua: string,
    ): Promise<void> {
      try {
        // Step 1: Compute visitor_hash = sha256(ip|ua|yyyy-mm-dd)
        const day = new Date().toISOString().slice(0, 10);
        const visitor_hash = crypto
          .createHash("sha256")
          .update(`${ip}|${ua}|${day}`)
          .digest("hex");

        // Step 2: Resolve the ad with its owner
        const ad = (await strapi.db.query("api::ad.ad").findOne({
          where: { documentId: adDocumentId },
          populate: ["user"],
        })) as Record<string, unknown> | null;

        if (!ad) return;

        // Step 3: Owner exclusion
        const adUser = ad.user as Record<string, unknown> | null | undefined;
        if (viewerId && adUser?.id === viewerId) return;

        // Step 4: Per-visitor/day dedupe
        const startOfDay = new Date(`${day}T00:00:00.000Z`);
        const existingViews = await strapi.db
          .query("api::ad-view.ad-view")
          .findMany({
            where: {
              visitor_hash,
              viewed_at: { $gte: startOfDay },
            },
          });

        if (existingViews.length > 0) return;

        // Step 5: Create the view event row
        await strapi.db.query("api::ad-view.ad-view").create({
          data: {
            ad: ad.id,
            viewed_at: new Date(),
            visitor_hash,
            source: source ?? "detail",
            viewer: viewerId ?? null,
          },
        });
      } catch (error) {
        // Swallow — view tracking must never break the ad page
        // Use strapi.log if available (undefined in unit tests — safe to guard)
        try {
          strapi.log?.warn("recordView failed (swallowed):", error);
        } catch {
          // ignore logging failure
        }
      }
    },
  }),
);
