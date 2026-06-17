/**
 * Ad View Service
 *
 * Event-sourced view tracking for advertisements.
 * Records one row per visitor per day, excluding the ad owner.
 * Errors are swallowed — tracking must never break the ad page.
 */

import { factories } from "@strapi/strapi";
import crypto from "crypto";

/** Shape returned by getAdStats. */
export interface AdStatsResult {
  /** All-time count of ad-view rows for the ad. */
  total: number;
  /** Per-day view counts, length === days, ordered oldest→newest (last = today). */
  series: number[];
  /** Count of ad-contact rows for the ad. */
  contacts: number;
  /** Conversion percentage: round(contacts/total*100), 0 when total===0. */
  conversion: number;
  /** Average views per day: round(total/days), 0 when total===0. */
  avgPerDay: number;
}

/** Returns a UTC date-only key (yyyy-mm-dd) for a Date. */
function toUtcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

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

    /**
     * Aggregate view statistics for a single ad over a sliding window.
     *
     * - `total`: all-time view count (separate count query, not just the window).
     * - `series`: per-day bucket array of length `days`, ordered oldest→newest
     *   (index 0 = `days-1` days ago, last index = today). Aggregates from
     *   event rows via findMany + group-by UTC day — never a stored counter.
     * - `contacts`: all-time count of ad-contact rows for the ad.
     * - `conversion`: round(contacts/total*100), returns 0 when total===0.
     * - `avgPerDay`: round(total/days), returns 0 when total===0.
     *
     * @param adDocumentId - Strapi documentId of the ad
     * @param days - Window length in days (default 14, clamped 1..90)
     * @returns AdStatsResult with zero-shape if the ad is not found
     */
    async getAdStats(
      adDocumentId: string,
      days = 14,
    ): Promise<AdStatsResult> {
      const clampedDays = Math.max(1, Math.min(90, days));
      const zeroShape = (): AdStatsResult => ({
        total: 0,
        series: Array(clampedDays).fill(0) as number[],
        contacts: 0,
        conversion: 0,
        avgPerDay: 0,
      });

      // Step 1: Resolve the ad numeric id from documentId
      const ad = (await strapi.db.query("api::ad.ad").findOne({
        where: { documentId: adDocumentId },
      })) as Record<string, unknown> | null;

      if (!ad) return zeroShape();

      const adId = ad.id as number;

      // Step 2: Compute window start = today minus (clampedDays - 1) days at 00:00 UTC
      const now = new Date();
      const todayKey = toUtcDay(now);
      const windowStart = new Date(
        `${toUtcDay(new Date(now.getTime() - (clampedDays - 1) * 86400000))}T00:00:00.000Z`,
      );

      // Step 3: Build the empty bucket map keyed by yyyy-mm-dd, oldest→newest
      const buckets = new Map<string, number>();
      for (let i = clampedDays - 1; i >= 0; i--) {
        const key = toUtcDay(
          new Date(now.getTime() - i * 86400000),
        );
        buckets.set(key, 0);
      }

      // Step 4: Query ad-view rows within the window and bucket by UTC day
      const viewRows = (await strapi.db
        .query("api::ad-view.ad-view")
        .findMany({
          where: {
            ad: adId,
            viewed_at: { $gte: windowStart },
          },
        })) as Array<{ viewed_at: Date | string }>;

      for (const row of viewRows) {
        const key = toUtcDay(new Date(row.viewed_at));
        if (buckets.has(key)) {
          buckets.set(key, (buckets.get(key) ?? 0) + 1);
        }
      }

      // Step 5: All-time total via count (separate query — total ≥ sum(series))
      const total = (await strapi.db
        .query("api::ad-view.ad-view")
        .count({ where: { ad: adId } })) as number;

      // Step 6: All-time contacts count
      const contacts = (await strapi.db
        .query("api::ad-contact.ad-contact")
        .count({ where: { ad: adId } })) as number;

      // Step 7: Derived metrics (guard zero division)
      const conversion = total > 0 ? Math.round((contacts / total) * 100) : 0;
      const avgPerDay = total > 0 ? Math.round(total / clampedDays) : 0;

      // Today's bucket key for ordering verification
      const series = Array.from(buckets.values());
      // Confirm last key is today (sanity — buckets are inserted oldest→newest)
      const keys = Array.from(buckets.keys());
      if (keys[keys.length - 1] !== todayKey) {
        // Off-by-one in bucket generation — return zeros rather than silently wrong data
        return { total, series: Array(clampedDays).fill(0) as number[], contacts, conversion, avgPerDay };
      }

      return { total, series, contacts, conversion, avgPerDay };
    },

    /**
     * Aggregate view counts for a batch of ads in a single query.
     *
     * Fetches all ad-view rows for the given ad ids in one findMany, then
     * counts per ad in memory. Returns a map of ad.id → count.
     * Guards against an empty array to avoid `$in: []`.
     *
     * @param adIds - Array of numeric ad ids
     * @returns Record mapping each ad id to its view count (missing = 0)
     */
    async getViewCountsByAdIds(
      adIds: number[],
    ): Promise<Record<number, number>> {
      if (adIds.length === 0) return {};

      const rows = (await strapi.db
        .query("api::ad-view.ad-view")
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
     * Aggregate total view count across all active ads belonging to a user.
     *
     * Used by the account Panel KPI "Vistas totales".
     * Guards against an empty active-ad list to avoid `$in: []` queries.
     *
     * @param userId - Strapi numeric user id
     * @returns Integer count of all ad-view rows for the user's active ads
     */
    async getUserTotalViews(userId: number): Promise<number> {
      // Step 1: Collect active ad ids for the user
      const activeAds = (await strapi.db.query("api::ad.ad").findMany({
        where: { user: userId, active: true },
        select: ["id"],
      })) as Array<{ id: number }>;

      if (activeAds.length === 0) return 0;

      const adIds = activeAds.map((a) => a.id);

      // Step 2: Count all view events for those ads
      const total = (await strapi.db
        .query("api::ad-view.ad-view")
        .count({ where: { ad: { $in: adIds } } })) as number;

      return total;
    },
  }),
);
