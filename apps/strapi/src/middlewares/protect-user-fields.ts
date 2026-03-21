// protect-user-fields.ts
//
// Strapi middleware that strips protected fields from PUT /api/users/:id requests.
// Prevents privilege escalation by ensuring only internal server-side code (payment
// controller, subscription cron) can modify PRO subscription fields.

import { Context } from "koa";
import type { Core } from "@strapi/strapi";

/**
 * Fields that must NEVER be settable via the public PUT /api/users/:id endpoint.
 *
 * PRO subscription fields — managed exclusively by the payment system and cron jobs:
 *   pro_status, pro_expires_at, tbk_user, pro_card_type, pro_card_last4, pro_inscription_token
 *
 * Profile fields with dedicated endpoints (username: 90-day cooldown, avatar/cover: file upload):
 *   username, avatar, cover
 *
 * Auth/system fields — must never be changed by the user directly:
 *   role, provider, confirmed, blocked
 */
const PROTECTED_USER_FIELDS = [
  "pro_status",
  "pro_expires_at",
  "tbk_user",
  "pro_card_type",
  "pro_card_last4",
  "pro_inscription_token",
  "username",
  "avatar",
  "cover",
  "role",
  "provider",
  "confirmed",
  "blocked",
] as const;

/** Matches PUT /api/users/:id where :id is a numeric Strapi id */
const USER_UPDATE_PATH_REGEX = /^\/api\/users\/\d+$/;

export default (
  _config: Record<string, unknown>,
  _context: { strapi: Core.Strapi }
) => {
  return async (ctx: Context, next: () => Promise<void>) => {
    if (
      ctx.request.method === "PUT" &&
      USER_UPDATE_PATH_REGEX.test(ctx.request.path)
    ) {
      const body = ctx.request.body as Record<string, unknown>;

      if (body && typeof body === "object") {
        const userId = ctx.request.path.split("/").pop();

        if ("data" in body && body.data && typeof body.data === "object") {
          // Strapi convention: fields nested under body.data
          const data = body.data as Record<string, unknown>;
          const stripped = stripProtectedFields(data, userId);

          if (stripped.length > 0) {
            console.warn(
              `[protect-user-fields] Stripped protected fields from PUT /api/users/${userId}: ${stripped.join(
                ", "
              )}`
            );
          }
        } else {
          // Flat body without data wrapper
          const stripped = stripProtectedFields(body, userId);

          if (stripped.length > 0) {
            console.warn(
              `[protect-user-fields] Stripped protected fields from PUT /api/users/${userId}: ${stripped.join(
                ", "
              )}`
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
function stripProtectedFields(
  obj: Record<string, unknown>,
  userId: string | undefined
): string[] {
  const stripped: string[] = [];

  for (const field of PROTECTED_USER_FIELDS) {
    if (field in obj) {
      delete obj[field];
      stripped.push(field);
    }
  }

  return stripped;
}
