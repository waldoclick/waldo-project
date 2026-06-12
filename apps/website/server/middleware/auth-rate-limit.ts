/**
 * Auth Rate Limit Middleware — Nuxt Nitro proxy layer (SEC2-AUTH)
 *
 * Per-IP rate limiter for authentication paths. Complements reCAPTCHA protection
 * by adding a hard request-count gate — stops password spraying and email bombing
 * even when reCAPTCHA is bypassed (e.g. direct API clients).
 *
 * NOTE: single-process in-memory — PM2 cluster mode needs a shared store (Redis).
 * For the current single-process deployment this is sufficient.
 */

const AUTH_RATE_PATHS = [
  "/api/auth/local",
  "/api/auth/local/register",
  "/api/auth/forgot-password",
  "/api/auth/verify-code",
  "/api/auth/resend-code",
  "/api/auth/google-one-tap",
];

const ipStore = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000; // 1-minute window
const MAX_REQUESTS = 10; // 10 POST requests per IP per window

export default defineEventHandler((event) => {
  const path = event.node.req.url ?? "";
  const isAuthPath = AUTH_RATE_PATHS.some((p) => path.startsWith(p));
  if (!isAuthPath || event.node.req.method === "GET") return;

  const ip =
    getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ??
    event.node.req.socket?.remoteAddress ??
    "unknown";

  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    ipStore.set(ip, { count: 1, windowStart: now });
    return;
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    setResponseStatus(event, 429);
    return { statusCode: 429, statusMessage: "Too Many Requests" };
  }
});
