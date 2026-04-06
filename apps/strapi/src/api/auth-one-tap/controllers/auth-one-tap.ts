/**
 * Auth One Tap Controller
 *
 * Handles POST /api/auth/google-one-tap — verifies a Google Identity Services
 * credential JWT and returns a valid Waldo session as { jwt, user }.
 *
 * Registered as a standard content API endpoint (not a plugin extension route)
 * because plugin routes are silently ignored in Strapi v5 — see the comment in
 * strapi-server.ts lines 56–62.
 */

// NOTE: This endpoint intentionally bypasses 2-step verification (GTAP-06).
// Rationale: Google has already verified the user's identity via a signed ID token.
// This matches existing behavior of /connect/google (OAuth callback also bypasses
// 2-step) and is consistent with the design decision in STATE.md (2026-03-19).

import { googleOneTapService } from "../../../services/google-one-tap";
import { Context } from "koa";

export default {
  googleOneTap: async (ctx: Context) => {
    const { credential } = ctx.request.body as { credential?: string };

    // 1. Validate input
    if (!credential) {
      return ctx.badRequest("credential is required");
    }

    // 2. Verify Google ID token — delegates to GoogleOneTapService (handles RS256 + JWKS)
    const payload = await googleOneTapService.verifyCredential(credential);
    if (!payload) {
      return ctx.unauthorized("Invalid or expired Google credential");
    }

    // 3. Find or create Waldo user
    const { user, isNew } = await googleOneTapService.findOrCreateUser(payload);

    // 4. Grant 3 free ad slots to new users — fire-and-forget (non-blocking, same as registerUserLocal)
    if (isNew) {
      const { createUserReservations } = await import(
        "../../../extensions/users-permissions/controllers/authController"
      );
      (createUserReservations as (_user: unknown) => Promise<unknown>)(
        user
      ).catch((err: unknown) =>
        strapi.log.error(
          `[googleOneTap] createUserReservations failed for user ${
            (user as { id: number }).id
          }: ${(err as Error)?.message}`
        )
      );
    }

    // 5. Issue Waldo JWT — exact pattern from authController.ts line 314
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: (user as { id: number }).id,
    });

    // 6. Sanitize user — removes private fields (password, google_sub, etc.)
    // Exact pattern from authController.ts lines 318–323
    const userSchema = strapi.getModel("plugin::users-permissions.user");
    const sanitizedUser = await strapi.contentAPI.sanitize.output(
      user,
      userSchema,
      {
        auth: ctx.state.auth,
      }
    );

    ctx.body = { jwt, user: sanitizedUser };
  },
};
