/**
 * Ad Contact Controller
 *
 * Handles the contact event endpoint for tracking when users contact an ad owner.
 */

import { factories } from "@strapi/strapi";
import crypto from "crypto";

export default factories.createCoreController(
  "api::ad-contact.ad-contact",
  ({ strapi }) => ({
    /**
     * Record a contact event for an ad.
     *
     * @route POST /api/ads/:documentId/contact
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
  }),
);
