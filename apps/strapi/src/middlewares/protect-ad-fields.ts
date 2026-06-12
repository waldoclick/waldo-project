// protect-ad-fields.ts
//
// Strapi middleware that strips privileged fields from POST /api/ads and
// PUT /api/ads/:id requests. Prevents mass-assignment bypasses of the payment
// and approval flows — these flags must only be set server-side by the payment
// controller and the manager approveAd/rejectAd/bannedAd paths.

import { Context } from "koa";
import type { Core } from "@strapi/strapi";

/**
 * Fields that must NEVER be settable via the public POST /api/ads or
 * PUT /api/ads/:id endpoints.
 *
 * Publish/paid/approval state — managed exclusively by the payment flow and
 * manager server-side paths:
 *   active, is_paid, banned, rejected, remaining_days, duration_days,
 *   draft, actived_by, user
 */
const PROTECTED_AD_FIELDS = [
  "active",
  "is_paid",
  "banned",
  "rejected",
  "remaining_days",
  "duration_days",
  "draft",
  "actived_by",
  "user",
] as const;

/**
 * Matches POST /api/ads or /api/ads/ (bare collection — no sub-path segments).
 * Does NOT match /api/ads/draft, /api/ads/upload, /api/ads/count, etc.
 */
const AD_COLLECTION_PATH_REGEX = /^\/api\/ads\/?$/;

/**
 * Matches PUT /api/ads/:numericId or /api/ads/:numericId/ (bare single item).
 * Does NOT match /api/ads/123/approve, /api/ads/123/reject, etc.
 */
const AD_SINGLE_PATH_REGEX = /^\/api\/ads\/\d+\/?$/;

export default (
  _config: Record<string, unknown>,
  _context: { strapi: Core.Strapi },
) => {
  return async (ctx: Context, next: () => Promise<void>) => {
    const isProtectedRoute =
      (ctx.request.method === "POST" &&
        AD_COLLECTION_PATH_REGEX.test(ctx.request.path)) ||
      (ctx.request.method === "PUT" &&
        AD_SINGLE_PATH_REGEX.test(ctx.request.path));

    if (isProtectedRoute) {
      const body = ctx.request.body as Record<string, unknown>;

      if (body && typeof body === "object") {
        if ("data" in body && body.data && typeof body.data === "object") {
          // Strapi convention: fields nested under body.data
          const data = body.data as Record<string, unknown>;
          const stripped = stripProtectedFields(data);

          if (stripped.length > 0) {
            console.warn(
              `[protect-ad-fields] Stripped protected fields from ${ctx.request.method} ${ctx.request.path}: ${stripped.join(", ")}`,
            );
          }
        } else {
          // Flat body without data wrapper
          const stripped = stripProtectedFields(body);

          if (stripped.length > 0) {
            console.warn(
              `[protect-ad-fields] Stripped protected fields from ${ctx.request.method} ${ctx.request.path}: ${stripped.join(", ")}`,
            );
          }
        }
      }
    }

    await next();
  };
};

/**
 * Removes protected fields from the given object in-place.
 * Returns the list of field names that were removed.
 */
function stripProtectedFields(obj: Record<string, unknown>): string[] {
  const stripped: string[] = [];

  for (const field of PROTECTED_AD_FIELDS) {
    if (field in obj) {
      delete obj[field];
      stripped.push(field);
    }
  }

  return stripped;
}
