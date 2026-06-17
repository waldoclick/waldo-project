/**
 * Ad Contact Service
 *
 * Event-sourced contact tracking for advertisements.
 * Records one row per contact event (call or message).
 */

import { factories } from "@strapi/strapi";
import crypto from "crypto";

export default factories.createCoreService(
  "api::ad-contact.ad-contact",
  ({ strapi }) => ({
    /**
     * Record a contact event for an ad.
     *
     * @param adDocumentId - Strapi documentId of the ad
     * @param type - Contact type: "call" or "message"
     * @param ip - Visitor IP address
     * @param ua - Visitor User-Agent header value
     */
    async recordContact(
      adDocumentId: string,
      type: "call" | "message",
      ip: string,
      ua: string,
    ): Promise<void> {
      try {
        const day = new Date().toISOString().slice(0, 10);
        const visitor_hash = crypto
          .createHash("sha256")
          .update(`${ip}|${ua}|${day}`)
          .digest("hex");

        const ad = (await strapi.db.query("api::ad.ad").findOne({
          where: { documentId: adDocumentId },
        })) as Record<string, unknown> | null;

        if (!ad) return;

        await strapi.db.query("api::ad-contact.ad-contact").create({
          data: {
            ad: ad.id,
            type,
            visitor_hash,
            contacted_at: new Date(),
          },
        });
      } catch (error) {
        // Swallow — contact tracking must never break the ad page
        try {
          strapi.log?.warn("recordContact failed (swallowed):", error);
        } catch {
          // ignore logging failure
        }
      }
    },

    /**
     * Aggregate contact counts for a batch of ads in a single query.
     *
     * Fetches all ad-contact rows for the given ad ids in one findMany, then
     * counts per ad in memory. Returns a map of ad.id → count.
     * Guards against an empty array to avoid `$in: []`.
     *
     * @param adIds - Array of numeric ad ids
     * @returns Record mapping each ad id to its contact count (missing = 0)
     */
    async getContactCountsByAdIds(
      adIds: number[],
    ): Promise<Record<number, number>> {
      if (adIds.length === 0) return {};

      const rows = (await strapi.db
        .query("api::ad-contact.ad-contact")
        .findMany({
          where: { ad: { $in: adIds } },
          populate: { ad: { fields: ["id"] } },
        })) as Array<{ ad?: { id: number } | null }>;

      const counts: Record<number, number> = {};
      for (const row of rows) {
        const adId = row.ad?.id;
        if (adId !== undefined) {
          counts[adId] = (counts[adId] ?? 0) + 1;
        }
      }
      return counts;
    },

    /**
     * Aggregate total contact count across all active ads belonging to a user.
     *
     * Used by the account Panel KPI "Contactos recibidos".
     * Guards against an empty active-ad list to avoid `$in: []` queries.
     *
     * @param userId - Strapi numeric user id
     * @returns Integer count of all ad-contact rows for the user's active ads
     */
    async getUserTotalContacts(userId: number): Promise<number> {
      // Step 1: Collect active ad ids for the user
      const activeAds = (await strapi.db.query("api::ad.ad").findMany({
        where: { user: userId, active: true },
        select: ["id"],
      })) as Array<{ id: number }>;

      if (activeAds.length === 0) return 0;

      const adIds = activeAds.map((a) => a.id);

      // Step 2: Count all contact events for those ads
      const total = (await strapi.db
        .query("api::ad-contact.ad-contact")
        .count({ where: { ad: { $in: adIds } } })) as number;

      return total;
    },
  }),
);
