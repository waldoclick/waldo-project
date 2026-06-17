/**
 * Ad Contact Controller
 *
 * Handles HTTP requests for ad-contact endpoints:
 * - recordContact: POST a contact event for an ad (fire-and-forget)
 * - contactsTotal: GET total contact count across the authenticated user's active ads
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::ad-contact.ad-contact",
  ({ strapi }) => ({
    /**
     * POST /api/ads/:documentId/contact
     *
     * Record a contact event for an ad (call or message).
     * Auth: not required (auth: false on route) — anonymous visitors may contact.
     */
    async recordContact(ctx) {
      const { documentId } = ctx.params as Record<string, string>;
      const { type } = ctx.request.body as Record<string, unknown>;

      if (!type || (type !== "call" && type !== "message")) {
        return ctx.badRequest("Invalid contact type. Must be 'call' or 'message'.");
      }

      const ip = ctx.request.ip ?? "unknown";
      const ua =
        (ctx.request.headers as Record<string, string>)["user-agent"] ??
        "unknown";

      await strapi
        .service("api::ad-contact.ad-contact")
        .recordContact(documentId, type as "call" | "message", ip, ua);

      return ctx.send({ ok: true });
    },

    /**
     * GET /api/ads/me/contacts-total
     *
     * Returns the total contact count across all active ads for the authenticated user.
     * Used by the account Panel KPI "Contactos recibidos".
     *
     * Auth: required (Authenticated role permission granted by 06-01 bootstrap).
     */
    async contactsTotal(ctx) {
      const userId = ctx.state.user?.id;
      if (!userId) {
        return ctx.unauthorized(
          "You must be authenticated to view panel statistics",
        );
      }

      const total = await strapi
        .service("api::ad-contact.ad-contact")
        .getUserTotalContacts(userId);

      return ctx.send({ data: { total } });
    },
  }),
);
