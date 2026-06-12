/**
 * Auth Rate Limit Middleware — SEC2-AUTH
 *
 * Applies per-IP rate limiting to custom authentication routes that are NOT
 * covered by the built-in users-permissions ratelimit (which only covers
 * Strapi's own /api/auth/* routes, not custom API routes).
 *
 * NOTE: single-process in-memory store via koa2-ratelimit. If Strapi runs
 * in cluster mode, each worker maintains its own store — a shared Redis store
 * would be required for accurate cross-process limiting.
 *
 * koa2-ratelimit is a transitive dependency via @strapi/plugin-users-permissions.
 */

import { RateLimit } from "koa2-ratelimit";
import type { Context, Next } from "koa";

// Custom auth routes NOT covered by the built-in users-permissions ratelimit.
// Built-in routes (/api/auth/local, /api/auth/local/register, /api/auth/forgot-password,
// /api/auth/reset-password, /api/auth/send-email-confirmation) are handled separately.
const AUTH_PATHS = [
  "/api/auth/google-one-tap", // One Tap login (POST)
  "/api/auth/verify-code", // 2-step OTP verify (POST)
  "/api/auth/resend-code", // 2-step OTP resend (POST)
];

const limiter = RateLimit.middleware({
  interval: { min: 1 }, // 1-minute window
  max: 10, // 10 requests per IP per path per window
  message: "Too many authentication requests",
  headers: true, // Set RateLimit-* response headers
  keyGenerator: (ctx: Context) => `auth:${ctx.ip}:${ctx.path}`,
});

export default () => {
  return async (ctx: Context, next: Next) => {
    if (AUTH_PATHS.some((p) => ctx.path.startsWith(p))) {
      return limiter(ctx, next);
    }
    return next();
  };
};
