/**
 * Ad View Controller
 *
 * Handles HTTP requests for ad-view aggregation endpoints:
 * - stats: per-ad 14-day series + total + contacts + conversion
 * - panelViewsTotal: aggregated view count for the authenticated user's active ads
 */

import { factories } from "@strapi/strapi";

/** Returns true if ctx.state.user has the manager role. */
const ctxIsManager = (ctx: { state: { user: unknown } }): boolean => {
  const user = ctx.state.user as Record<string, unknown>;
  const role = user?.role as Record<string, unknown> | undefined;
  return ((role?.name as string) ?? "").toLowerCase() === "manager";
};

export default factories.createCoreController(
  "api::ad-view.ad-view",
  ({ strapi }) => ({
    /**
     * GET /api/ads/:documentId/stats
     *
     * Returns aggregated stats for a single ad:
     * - total: all-time view count
     * - series: per-day bucket array for the last `days` days (oldest→newest)
     * - contacts: all-time contact count
     * - conversion: round(contacts/total*100), 0 when total===0
     * - avgPerDay: round(total/days), 0 when total===0
     *
     * Auth: required. Only the ad owner or a manager may access stats.
     *
     * Query: ?days=14 (1..90, default 14)
     */
    async stats(ctx) {
      const userId = ctx.state.user?.id;
      if (!userId) {
        return ctx.unauthorized(
          "You must be authenticated to view ad statistics",
        );
      }

      const { documentId } = ctx.params as { documentId: string };

      // Parse and clamp days from query
      const rawDays = parseInt(
        String((ctx.query as Record<string, unknown>).days ?? "14"),
        10,
      );
      const days = isNaN(rawDays) ? 14 : Math.max(1, Math.min(90, rawDays));

      // Ownership check: resolve ad by documentId, verify owner-or-manager
      const ad = (await strapi.db.query("api::ad.ad").findOne({
        where: { documentId },
        populate: ["user"],
      })) as Record<string, unknown> | null;

      if (!ad) {
        return ctx.notFound("Advertisement not found");
      }

      const adUser = ad.user as Record<string, unknown> | null | undefined;
      const isOwner = adUser?.id?.toString() === userId.toString();
      if (!isOwner && !ctxIsManager(ctx)) {
        return ctx.forbidden(
          "You do not have permission to view statistics for this advertisement",
        );
      }

      const result = await strapi
        .service("api::ad-view.ad-view")
        .getAdStats(documentId, days);

      return ctx.send({ data: result });
    },

    /**
     * GET /api/ads/me/views-total
     *
     * Returns the total view count across all active ads for the authenticated user.
     * Used by the account Panel KPI "Vistas totales".
     *
     * Auth: required.
     */
    async panelViewsTotal(ctx) {
      const userId = ctx.state.user?.id;
      if (!userId) {
        return ctx.unauthorized(
          "You must be authenticated to view panel statistics",
        );
      }

      const total = await strapi
        .service("api::ad-view.ad-view")
        .getUserTotalViews(userId);

      return ctx.send({ data: { total } });
    },
  }),
);
