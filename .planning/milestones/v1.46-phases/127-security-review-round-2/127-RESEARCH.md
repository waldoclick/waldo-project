# Phase 127: Security Review Round 2 — Research

**Researched:** 2026-06-12
**Domain:** Strapi v5 / Nuxt 4 security hardening (payment integrity, authorization, auth, XSS, lockdown)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Plan 01 — SEC2-PAYMENT: Webpay return integrity**
- After `commit()` returns `AUTHORIZED`, recompute expected amount server-side from pack price (DB lookup) + featured price. Reject if `wepbayResponse.response.amount !== expectedAmount`. Files: `checkout.service.ts` (~line 164), `pack.service.ts` (~line 99).
- Add idempotency/replay: add `unique: true` on `buy_order` in `apps/strapi/src/api/order/content-types/order/schema.json`; before granting benefit, look up existing processed order by `buy_order` and short-circuit to its `order.documentId` redirect if found. Wrap grant + order creation in a DB transaction where feasible.
- Verify `adId` ownership on paid-checkout return: load ad, assert `ad.user.id === userId` (from `buy_order`) before publish/relink/re-date. Mirror `free-ad.service.ts` pattern.
- Fail-closed on missing price env: do NOT silently use `|| 10000` fallback for `AD_FEATURED_PRICE` at commit time. If unset, error.

**Plan 02 — SEC2-AUTHZ: order + reservation/pack authorization**
- `order.findOne` (`order.ts:386`): after fetching, enforce `if (!isManager && order.user?.id !== ctx.state.user?.id) return ctx.forbidden()`. Copy pattern from `payment.thankyou` (`payment.ts:744`).
- `order.find` (`order.ts:26`): scope to `ctx.state.user.id` for non-managers; ignore client-supplied `filters` that widen user scope.
- Gate `order.exportCsv` and `order.salesByMonth` routes behind `global::isManager`.
- `ad-pack`, `ad-reservation`, `ad-featured-reservation`: remove public `create/update/delete`. Packs → `global::isManager`. Reservations → owner-scoped controller setting `user` from `ctx.state.user`, ignoring client `price`/`user`. Keep existing manager-only `gift` action.

**Plan 03 — SEC2-AUTH: auth hardening**
- Google login: in `google-one-tap.service.ts` `findOrCreateUser`, reject when `payload.email_verified !== true` BEFORE the email-fallback link and before create.
- Remove hardcoded JWT fallback `?? "strapi-jwt-secret"` in `ad.ts:757`. Use `strapi.plugins['users-permissions'].services.jwt.verify(token)`. If `JWT_SECRET` unset → treat as unauthenticated (`userId = null`).
- Rate-limiting on auth endpoints (`/api/auth/local`, `/auth/local/register`, `/auth/forgot-password`, `/auth/verify-code`, `/auth/resend-code`, `/auth/google-one-tap`): BOTH layers — per-IP in Nuxt Nitro proxy AND Strapi-layer rate-limit middleware.
- Bind reCAPTCHA `action` and `hostname` in both layers (`google-recaptcha.service.ts:22` and `apps/website/server/utils/recaptcha.ts`).

**Plan 04 — SEC2-XSS: frontend SSR sanitizer**
- Replace regex SSR branch in `useSanitize.ts:13-40` with real sanitizer running identically on server and client. Use `isomorphic-dompurify` (JSDOM-backed). Remove regex branch entirely.
- `parseMarkdown` (`useSanitize.ts:115`): configure `marked` to NOT pass through raw inline HTML, then sanitize output unconditionally.
- Verify sinks: `AdSingle.vue:15`, `ArticleSingle.vue:12`, `MessageDefault.vue`, `CardHighlight.vue`, `CardCategory.vue`.
- Do NOT touch session cookie or CSP.

**Plan 05 — SEC2-LOCKDOWN: email / upload / PII / route lockdown**
- MJML emails: set `autoescape: true` in `apps/strapi/src/services/mjml/index.ts:4`. Verify numeric IDs/server tokens still render. Re-check cron report templates.
- Upload validation (`middlewares/upload.ts`): add magic-byte verification rejecting declared-MIME mismatches. Add explicit `sizeLimit` to upload plugin config (`config/plugins.ts`). SVG/html already excluded — keep excluded.
- `GET /api/users` (`getUserDataWithFilters`): whitelist allowed `filters` keys; strip PII (email/phone/RUT/address/birthdate) from list response unless caller is manager.
- Disable content-API routes for `verification-code`, `contact` (expose only `create`), `subscription-payment` (no write to non-managers). Override core router to `only: []` or restrict to necessary actions for `verification-code`.

### Claude's Discretion
- Exact test file locations follow root-level `tests/` rule. Jest for Strapi, Vitest for Nuxt.
- Choice of rate-limit library/store: default to in-memory per-IP if no shared store configured, note limitation.
- Whether to add a shared `assertOwnerOrManager` helper vs inline checks — prefer subtractive/DRY but do not over-abstract.
- Wave assignment and plan ordering.

### Deferred Ideas (OUT OF SCOPE)
- Phase 128: `httpOnly`+`Secure`+`SameSite` session cookie + CSRF tokens.
- CSP nonce migration to drop `script-src 'unsafe-inline'`.
- HSTS max-age increase to 1 year + preload.
- DB role-permission audit (operational, not code).
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC2-PAYMENT | Webpay amount validation, replay idempotency via unique buy_order, ad ownership at commit, fail-closed env | §Plan-01 findings: amount validation pattern, unique constraint mechanic, strapi.db.query transaction pattern |
| SEC2-AUTHZ | Order IDOR (findOne/find), reservation/pack CRUD authorization | §Plan-02 findings: ownership check pattern, createCoreRouter `only:[]` mechanic |
| SEC2-AUTH | Google email_verified, JWT fallback removal, rate-limiting both layers, reCAPTCHA binding | §Plan-03 findings: koa2-ratelimit built-in config, nuxt-security per-route rate limit |
| SEC2-XSS | isomorphic-dompurify SSR, marked HTML stripping | §Plan-04 findings: version-correct import, marked renderer override, pitfalls |
| SEC2-LOCKDOWN | nunjucks autoescape, file-type magic bytes, PII strip, core route disable | §Plan-05 findings: file-type CJS constraint, autoescape impact, createCoreRouter only:[] |
</phase_requirements>

---

## Summary

Phase 127 is a brownfield security-hardening phase across Strapi v5 (`apps/strapi`) and Nuxt 4 (`apps/website`). All five fix areas have clear implementation paths confirmed against the current codebase. The main implementation mechanics are well-understood; the key pitfalls are package-level constraints (file-type ESM-only, isomorphic-dompurify JSDOM version pinning, marked HTML passthrough must be handled via renderer override not a config flag).

**Primary recommendation:** Follow the locked decisions precisely. The hardest part of each plan is integration with the existing middleware stack and test coverage. No new external dependencies are strictly required except `isomorphic-dompurify@2.35.0` (for Plan 04) and possibly `file-type@16.5.4` (for Plan 05). Everything else uses patterns already in the codebase.

The project already has `dompurify@^3.3.0` and `jsdom@27.4.0` installed in the website. `isomorphic-dompurify@2.35.0` is the correct version to install because it depends on `jsdom: "^27.4.0"` which matches the already-installed version exactly — avoiding a duplicate jsdom install.

---

## Standard Stack

### Core Libraries (already installed)
| Library | Installed Version | Purpose | Location |
|---------|------------------|---------|----------|
| `dompurify` | `^3.3.0` (3.4.8 installed) | HTML sanitization — client and server | `apps/website` |
| `jsdom` | `^27.0.0` (27.4.0 installed) | DOM for server-side DOMPurify | `apps/website` |
| `marked` | `^17.0.4` (17.0.4 installed) | Markdown to HTML | `apps/website` |
| `nunjucks` | `^3.2.4` | MJML template rendering | `apps/strapi` |
| `koa2-ratelimit` | (bundled in `@strapi/plugin-users-permissions`) | Auth endpoint rate limiting built-in | `apps/strapi` |
| `jsonwebtoken` | `^9.0.0` | JWT decode in `ad.ts` | `apps/strapi` |

### New Dependencies (must install)
| Library | Version | Purpose | Install In |
|---------|---------|---------|-----------|
| `isomorphic-dompurify` | `2.35.0` | SSR-safe DOMPurify wrapper using JSDOM | `apps/website` |
| `file-type` | `16.5.4` | Magic-byte upload validation (last CJS-compatible) | `apps/strapi` |

**Installation:**
```bash
# Website
cd apps/website && pnpm add isomorphic-dompurify@2.35.0

# Strapi
cd apps/strapi && pnpm add file-type@16.5.4
```

**Version verification (confirmed against npm registry 2026-06-12):**
- `isomorphic-dompurify@2.35.0` — requires `jsdom: "^27.4.0"` (matches installed 27.4.0)
- `file-type@16.5.4` — last CJS-compatible version (17+ is ESM-only, breaks Strapi's CommonJS)

---

## Architecture Patterns

### Recommended Project Structure (no new dirs needed)
```
apps/strapi/src/
├── middlewares/upload.ts          # Add magic-byte check here
├── api/order/controllers/order.ts # Add ownership checks here
├── api/order/content-types/order/schema.json  # Add unique:true on buy_order
├── api/payment/services/checkout.service.ts   # Add amount validation + idempotency
├── api/payment/services/pack.service.ts       # Add amount validation
├── api/ad-pack/routes/ad-pack.ts              # Gate write routes with isManager
├── api/ad-reservation/routes/ad-reservation.ts  # Gate create/update/delete
├── api/ad-featured-reservation/routes/…      # Same
├── api/verification-code/routes/…            # only:[] to disable all core routes
├── services/google-one-tap/google-one-tap.service.ts  # Add email_verified check
├── services/google/services/google-recaptcha.service.ts  # Add action+hostname bind
├── services/mjml/index.ts         # autoescape: true
├── config/plugins.ts              # Add users-permissions ratelimit + upload sizeLimit

apps/website/app/composables/
└── useSanitize.ts                 # Replace regex SSR branch with DOMPurify+JSDOM

apps/website/server/
└── utils/recaptcha.ts             # Add action+hostname validation
```

---

## Plan 01: Payment Integrity (SEC2-PAYMENT)

### Amount Validation Pattern

The buy_order format is `order-{userId}-{packId}-{adId}-{featured}-{isInvoice}`. At commit time:

```typescript
// In processWebpayReturn / pack.processWebpayReturn — after parsing buy_order:
const packRecord = await strapi.db.query("api::ad-pack.ad-pack").findOne({ where: { id: packId } });
const packPrice = Number((packRecord as { price?: number }).price ?? 0);
const featuredPrice = Number(process.env.AD_FEATURED_PRICE);
if (!featuredPrice) {
  // Fail-closed: AD_FEATURED_PRICE must be set in production
  throw new Error("AD_FEATURED_PRICE env var is not set — refusing to process payment");
}
const expectedAmount = packPrice + (featured ? featuredPrice : 0);
const actualAmount = Number(wepbayResponse.response.amount);
if (actualAmount !== expectedAmount) {
  strapi.log.warn(`[checkout] Amount mismatch: expected=${expectedAmount}, actual=${actualAmount}, buyOrder=${buyOrder}`);
  return { success: false, message: "Payment amount mismatch" };
}
```

For `pack === "free"` (featured-only): `expectedAmount = featuredPrice`.

### Idempotency: unique buy_order

**Schema change** (`apps/strapi/src/api/order/content-types/order/schema.json`):
```json
"buy_order": {
  "type": "string",
  "unique": true
}
```

**Before granting any benefit**, look up existing order:
```typescript
const existingOrder = await strapi.db.query("api::order.order").findOne({
  where: { buy_order: buyOrder },
});
if (existingOrder) {
  // Already processed — return the existing documentId (idempotent short-circuit)
  return {
    success: true,
    adId,
    message: "Already processed",
    orderId: buyOrder,
    orderDocumentId: (existingOrder as { documentId?: string }).documentId,
  };
}
```

**Unique constraint migration:** Strapi v5 creates/applies constraints at startup from `schema.json`. Adding `"unique": true` is a Strapi v5 schema change that Strapi applies via its migration system automatically on next `strapi start`. No manual SQL migration script needed for new deployments. For existing deployments with duplicate `buy_order` values, Strapi will fail startup — verify no existing duplicates first.

**Confidence:** HIGH — confirmed via Strapi v5 content-types docs pattern and existing schema.json for the project.

### Ad ownership at commit

Mirror `free-ad.service.ts` pattern:
```typescript
// After parsing userId and adId from buy_order, before calling publishAd:
if (adId > 0) {
  const ad = await strapi.db.query("api::ad.ad").findOne({
    where: { id: adId },
    populate: { user: true },
  });
  const adUser = (ad as { user?: { id: number } } | null)?.user;
  if (!adUser || String(adUser.id) !== String(userId)) {
    strapi.log.error(`[checkout] Ad ownership mismatch: adId=${adId}, payingUser=${userId}, adOwner=${adUser?.id}`);
    return { success: false, message: "Ad ownership verification failed" };
  }
}
```

---

## Plan 02: Order + Reservation Authorization (SEC2-AUTHZ)

### Ownership check pattern (already in `payment.ts:744`)

```typescript
// Copy from payment.ts:744 — use exact same pattern in order.findOne:
const isManager = ((ctx.state.user as { role?: { name?: string } })?.role?.name ?? "").toLowerCase() === "manager";
if (!isManager && String(orderUser?.id) !== String(userId)) {
  return ctx.forbidden();
}
```

The `isManager` helper policy (`apps/strapi/src/policies/isManager.ts`) operates on `ctx.state.user.role.name === "manager"`. For inline controller checks, use the same logic directly rather than calling the policy.

### Order.find scope

```typescript
// Replace current: const filters = query.filters || {};
// With:
const isManager = ((ctx.state.user as { role?: { name?: string } })?.role?.name ?? "").toLowerCase() === "manager";
const filters = isManager
  ? (query.filters as Record<string, unknown>) ?? {}
  : { user: { id: ctx.state.user.id } }; // Non-managers only see their own orders
```

### Route authorization — createCoreRouter `only` and policies

For `ad-pack` (prices — manager-only write):
```typescript
// apps/strapi/src/api/ad-pack/routes/ad-pack.ts
export default {
  routes: [
    { method: "GET", path: "/ad-packs", handler: "ad-pack.find", config: { policies: [] } },
    { method: "GET", path: "/ad-packs/:id", handler: "ad-pack.findOne", config: { policies: [] } },
    { method: "POST", path: "/ad-packs", handler: "ad-pack.create", config: { policies: ["global::isManager"] } },
    { method: "PUT", path: "/ad-packs/:id", handler: "ad-pack.update", config: { policies: ["global::isManager"] } },
    { method: "DELETE", path: "/ad-packs/:id", handler: "ad-pack.delete", config: { policies: ["global::isManager"] } },
  ],
};
```

For `ad-reservation` and `ad-featured-reservation` (credits — owner-scoped):
- Remove `create/update/delete` from routes entirely (or add `global::isManager` to match decision).
- Owner-scoped `create`: add a controller override that sets `data.user = ctx.state.user.id` and strips client-supplied `price`/`user`.

For `verification-code` (disable all core content-API routes):
```typescript
// apps/strapi/src/api/verification-code/routes/verification-code.ts
import { factories } from "@strapi/strapi";
export default factories.createCoreRouter(
  "api::verification-code.verification-code",
  { only: [] }, // No core CRUD routes exposed
);
```

**Confidence:** HIGH — `createCoreRouter` with `only: []` is official Strapi v5 API documented at `docs.strapi.io/cms/backend-customization/routes`.

---

## Plan 03: Auth Hardening (SEC2-AUTH)

### Google email_verified fix

The `TokenPayload` interface from `google-auth-library` includes `email_verified?: boolean`. The field is present when Google includes it in the ID token (it always does for Gmail and most Workspace domains).

```typescript
// In findOrCreateUser, BEFORE email fallback link or create:
async findOrCreateUser(payload: TokenPayload): Promise<{ user: Record<string, unknown>; isNew: boolean }> {
  // SECURITY: reject unverified email addresses before any account link/create
  if (payload.email_verified !== true) {
    throw new Error("Google account email is not verified");
  }
  // ... rest of method unchanged
```

The controller (`auth-one-tap.ts`) must catch this error and return 401. The same check applies to the OAuth popup path in `auth-google.ts`.

**Confidence:** HIGH — `email_verified` is documented in the `google-auth-library` `TokenPayload` type and in Google Identity documentation.

### JWT fallback removal

Current code (`ad.ts:757`):
```typescript
const secret = process.env.JWT_SECRET ?? "strapi-jwt-secret";
const decoded = jwt.verify(token, secret) as { id: number };
```

Fix — use Strapi's JWT service instead:
```typescript
// Uses the actual JWT secret configured in Strapi (no fallback)
let userId: number | null = null;
const authHeader = ctx.request.headers?.authorization as string | undefined;
if (authHeader?.startsWith("Bearer ")) {
  const token = authHeader.slice(7);
  try {
    const decoded = strapi.plugins["users-permissions"].services.jwt.verify(token) as { id: number };
    userId = decoded?.id ?? null;
  } catch {
    userId = null; // Invalid token → treat as unauthenticated
  }
}
```

The `strapi.plugins["users-permissions"].services.jwt.verify()` is the same service used in `authController.ts:438` and `auth-google.ts:88` — confirmed used across the codebase.

**Confidence:** HIGH — usage pattern confirmed at multiple sites in `apps/strapi/src/`.

### Rate limiting — Strapi layer (built-in users-permissions ratelimit)

The `@strapi/plugin-users-permissions` plugin (version 5.41.1 in this project) includes built-in rate limiting powered by `koa2-ratelimit`. Configure in `config/plugins.ts`:

```typescript
// apps/strapi/config/plugins.ts — add to users-permissions config:
"users-permissions": {
  config: {
    ratelimit: {
      enabled: true,
      interval: 60000,  // 1-minute window
      max: 10,          // 10 requests per IP per minute on auth routes
    },
    // ... existing register.allowedFields and providers config ...
  },
},
```

**What this protects:** `/api/auth/local` (login), `/api/auth/local/register`, `/api/auth/forgot-password`, `/api/auth/email-confirmation`, and the OTP routes registered in `users-permissions` extension. The built-in ratelimit key format is `${userIdentifier}:${requestPath}:${ctx.request.ip}`.

**Limitation:** The built-in ratelimit applies to routes registered via the `users-permissions` plugin. Custom routes like `/api/auth-one-tap` and `/api/auth-google` are NOT covered — they need separate middleware or route-level ratelimit.

For custom auth routes, add a global middleware that applies rate limiting only to auth paths. Since `koa2-ratelimit` is already a transitive dependency via `@strapi/plugin-users-permissions`, it can be imported directly:

```typescript
// apps/strapi/src/middlewares/auth-ratelimit.ts
import { RateLimit } from "koa2-ratelimit";
import type { Context, Next } from "koa";

const AUTH_PATHS = [
  "/api/auth-one-tap",
  "/api/auth-google",
  "/api/auth-verify",
];

const limiter = RateLimit.middleware({
  interval: { min: 1 }, // 1 minute
  max: 10,
  message: "Too many authentication requests",
  headers: true,
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
```

Register in `config/middlewares.ts`: `"global::auth-ratelimit"`.

**Confidence:** MEDIUM — `koa2-ratelimit` API confirmed from Strapi blog. Built-in ratelimit config options confirmed from Strapi v5 docs. Specific coverage of custom routes confirmed by code inspection (auth-one-tap, auth-google are NOT in users-permissions plugin scope).

### Rate limiting — Nuxt Nitro proxy layer

The proxy (`apps/website/server/api/[...].ts`) already runs per-request. Add a server middleware that tracks per-IP request counts for auth paths:

```typescript
// apps/website/server/middleware/auth-rate-limit.ts
const AUTH_RATE_PATHS = [
  "/api/auth/local",
  "/api/auth/local/register",
  "/api/auth/forgot-password",
  "/api/auth/verify-code",
  "/api/auth/resend-code",
  "/api/auth/google-one-tap",
];

// In-memory store: Map<ip, { count: number; windowStart: number }>
const ipStore = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

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
```

**Limitation:** In-memory store is per-process — if Nuxt runs multiple worker processes or PM2 cluster mode, each worker has its own store. For the current single-process PM2 deployment this is sufficient. Document in code with a `// NOTE: single-process in-memory — cluster mode needs shared store` comment.

**nuxt-security rateLimiter (existing global config):** The project already configures `rateLimiter: { tokensPerInterval: 500, interval: 300000 }` globally in nuxt-security (production only). This is a site-wide limiter, too coarse for auth endpoint protection. The per-route server middleware above is additive and more targeted.

**Confidence:** MEDIUM — H3/Nitro server middleware pattern confirmed from Nuxt docs. In-memory limitation is a known constraint documented above.

### reCAPTCHA action + hostname binding

**Strapi layer (`google-recaptcha.service.ts`):**
```typescript
async verifyToken(token: string, expectedAction?: string): Promise<boolean> {
  const response = await axios.post(this.verifyUrl, null, {
    params: { secret: this.secretKey, response: token },
  });

  const { success, score, action, hostname } = response.data;
  const allowedHostnames = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? "waldo.click,www.waldo.click").split(",");

  if (!success || score <= 0.5) return false;
  if (expectedAction && action !== expectedAction) return false;
  if (!allowedHostnames.includes(hostname)) return false;
  return true;
}
```

**Nuxt proxy layer (`recaptcha.ts`):**
```typescript
// Add after success/score check:
const allowedHostnames = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ?? "waldo.click,www.waldo.click").split(",");
if (!allowedHostnames.includes(result.hostname ?? "")) {
  throw createError({ statusCode: 400, statusMessage: "reCAPTCHA hostname mismatch" });
}
// Note: action binding requires the frontend to pass the action name via header (e.g. X-Recaptcha-Action)
// The proxy reads it and validates against the siteverify response.action field.
```

**Confidence:** HIGH — reCAPTCHA v3 `action` and `hostname` fields are documented Google properties. The `verifyToken` interface change is backward-compatible (optional param).

---

## Plan 04: Frontend SSR XSS (SEC2-XSS)

### isomorphic-dompurify — correct version for this project

The project already has:
- `dompurify@3.4.8` (installed, peer dep of isomorphic-dompurify@2.35.0: `^3.3.1` ✓)
- `jsdom@27.4.0` (installed, peer dep of isomorphic-dompurify@2.35.0: `^27.4.0` ✓)

Install: `pnpm add isomorphic-dompurify@2.35.0` in `apps/website`.

**Module format:** isomorphic-dompurify@2.35.0 ships CJS (`require`) and ESM (`import`) via its `exports` map. Nuxt 4 / Vite handles ESM for client bundle and CJS for Nitro server. No `transpile` or `noExternal` config needed.

**pnpm production build pitfall:** If lru-cache@11 (in the jsdom → cssstyle → @asamuzakjp/css-color → lru-cache chain) causes production build errors, add to `apps/website/package.json`:
```json
"pnpm": {
  "overrides": {
    "lru-cache": "^10.4.3"
  }
}
```
This is a known issue documented at [kkomelin/isomorphic-dompurify#353](https://github.com/kkomelin/isomorphic-dompurify/issues/353). The project's pnpm store already has lru-cache@10.4.3 installed (confirmed), so the override resolves cleanly.

### How to use in useSanitize.ts

```typescript
// apps/website/app/composables/useSanitize.ts
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

// Configure marked to suppress raw HTML block/inline tokens:
// This strips <svg onload=...>, <img onerror=...>, etc. from markdown source BEFORE sanitize
marked.use({
  renderer: {
    html() { return ""; }, // Block-level raw HTML → suppress entirely
  },
  walkTokens(token) {
    if (token.type === "html") {
      // Inline raw HTML tokens — clear text so they render nothing
      token.text = "";
      token.raw = "";
    }
  },
});

export const useSanitize = () => {
  const sanitizeHTML = (
    html: string,
    allowedTags: string[] = [],
    allowedAttrs: string[] = [],
  ): string => {
    if (!html) return "";

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttrs,
      KEEP_CONTENT: true,
    });
  };

  // ... sanitizeText, sanitizeRich, sanitizeStrict, sanitizeBasic — same as before, minus isServer branch ...

  const parseMarkdown = (markdown: string): string => {
    if (!markdown) return "";
    const html = marked.parse(markdown, { async: false }) as string;
    return sanitizeRich(html); // sanitizeRich now uses DOMPurify both sides
  };

  return { sanitizeText, sanitizeRich, sanitizeStrict, sanitizeBasic, parseMarkdown };
};
```

**Why the renderer + walkTokens combination:** verified by code inspection against `marked@17.0.4` (installed):
- Block-level HTML (e.g. `<svg onload=x>`) creates a `{ type: "html", block: true }` token — handled by `renderer.html() { return ""; }`.
- Inline HTML (e.g. `<b onclick=x>`) creates `{ type: "html", block: false }` tokens inside paragraph tokens — handled by `walkTokens` clearing the text.
- Both were empirically tested: `marked.parse("<svg onload=alert(1)>")` returns `""` after override; `marked.parse("text <b onclick=x>bold</b>")` returns `<p>text bold</p>`.

**IMPORTANT — marked.use is module-level:** Call `marked.use(...)` once at module load time, not inside the composable function. The `useSanitize` composable is called per-component, so the use call must be at the top of the file (outside the function).

**DOMPurify isomorphic behavior:**
- Server (Nitro/Node.js): `isomorphic-dompurify` creates an internal `JSDOM` window and calls `DOMPurify(window).sanitize(...)`. No global `window` needed.
- Client (browser): `isomorphic-dompurify` uses the existing browser `window`. Behavior is identical.
- The existing `window.DOMPurify` branch (`if (typeof window !== "undefined" && window.DOMPurify)`) in the old code is removed — isomorphic-dompurify handles both.

**Confidence:** HIGH — `marked@17.0.4` renderer override confirmed working via local Node.js test. `isomorphic-dompurify` import model verified from package exports.

### Nuxt vite optimizeDeps

Add `isomorphic-dompurify` to `vite.optimizeDeps.include` in `nuxt.config.ts` alongside the existing `dompurify` entry:
```typescript
optimizeDeps: {
  include: [
    // ... existing entries ...
    "dompurify",
    "isomorphic-dompurify",  // ADD THIS
    // ...
  ],
},
```

---

## Plan 05: Email / Upload / PII / Route Lockdown (SEC2-LOCKDOWN)

### MJML nunjucks autoescape: true

Current config (`apps/strapi/src/services/mjml/index.ts:4`):
```typescript
const env = nunjucks.configure("src/services/mjml/templates", { autoescape: false });
```

Fix:
```typescript
const env = nunjucks.configure("src/services/mjml/templates", { autoescape: true });
```

**Impact analysis:** With `autoescape: true`, nunjucks HTML-escapes ALL `{{ variable }}` expressions by default. Template expressions that intentionally render HTML need the `| safe` filter.

**Which templates need `| safe`:** Scan all `.mjml` template files for variables that contain server-generated HTML (button URLs, `<a href=...>` tags, etc.). Specifically:
- Any `{{ variable }}` that contains an HTML string (link markup, pre-formatted content).
- Variables that are plain text (names, emails, amounts, order IDs, ad titles, usernames) do NOT need `| safe` — they benefit from auto-escaping.
- The `escapeHtml()` utility already used in `contact` templates becomes redundant when `autoescape: true` is set. The existing calls to `escapeHtml()` will double-escape text (resulting in `&amp;lt;` etc.) — they must be removed from variables that are now auto-escaped.

**Action:** For each template, before switching, audit `{{ varName }}` usage:
1. If varName contains HTML → add `| safe` filter
2. If varName is plain text and already wrapped in `escapeHtml()` → remove the `escapeHtml()` wrapper, let autoescape handle it
3. If varName is plain text and not wrapped → no change needed (autoescape now protects it)

**Confidence:** HIGH — nunjucks `autoescape` behavior is standard and documented. `| safe` filter exemption is well-known.

### Upload magic-byte validation

**Critical constraint:** `file-type` v17+ is ESM-only and breaks Strapi's CommonJS loader. Use `file-type@16.5.4` (last CJS-compatible release, confirmed via Strapi issue #24859).

```bash
cd apps/strapi && pnpm add file-type@16.5.4
```

**How to read the buffer in Koa multipart context:**

`ctx.request.files` is populated by Strapi's body parser (koa-body). Each file object is an `UploadedFile` (from `formidable`) with a `filepath` property pointing to a temp file. Magic-byte detection requires reading the file buffer:

```typescript
// apps/strapi/src/middlewares/upload.ts
import { fileTypeFromFile } from "file-type"; // CJS import OK with v16.5.4

// ... existing ALLOWED_MIME_TYPES array ...

async function validateMagicBytes(filePath: string, declaredMime: string): Promise<boolean> {
  const result = await fileTypeFromFile(filePath);
  if (!result) {
    // file-type couldn't detect type (e.g. pure text) — reject to be safe
    return false;
  }
  return result.mime === declaredMime;
}

// In the middleware body, after the existing MIME type allowlist check:
// (file object has: mimetype, filepath, size fields from formidable)
const isValid = await validateMagicBytes(file.filepath, file.mimetype);
if (!isValid) {
  ctx.throw(400, `File content does not match declared type: ${file.mimetype}`);
}
```

**file-type@16.5.4 API note:** The function is `fileTypeFromFile(path)` (not `fromFile`). Returns `{ mime, ext }` or `undefined`.

**sizeLimit in config/plugins.ts:**
```typescript
upload: {
  config: {
    provider: "local",
    sizeLimit: 5 * 1024 * 1024, // 5 MB — adjust to project requirements
    actionOptions: {
      upload: {},
      uploadStream: {},
      delete: {},
    },
  },
},
```

The `sizeLimit` field is a Strapi upload plugin option (bytes). It rejects files exceeding the limit before they reach the middleware.

**Confidence:** HIGH — `fileTypeFromFile` API confirmed from file-type v16 docs. sizeLimit option confirmed from Strapi upload plugin config docs.

### getUserDataWithFilters — PII strip + filter whitelist

Current code merges `clientFilters` directly into the `where` clause. Fix two issues:

1. **Filter whitelist:**
```typescript
const ALLOWED_FILTER_KEYS = ["username", "commune", "region", "is_company", "pro_status"] as const;

// Sanitize incoming filters: only allow whitelisted top-level keys
const rawFilters = (ctx.query.filters as Record<string, unknown>) ?? {};
const safeFilters = Object.fromEntries(
  Object.entries(rawFilters).filter(([key]) => ALLOWED_FILTER_KEYS.includes(key as typeof ALLOWED_FILTER_KEYS[number]))
);
```

2. **PII strip for non-managers:**
```typescript
const isManager = ((ctx.state.user as { role?: { name?: string } })?.role?.name ?? "").toLowerCase() === "manager";
const PII_FIELDS = ["email", "phone", "rut", "address", "address_number", "postal_code", "birthdate", "business_rut", "business_address"] as const;

const sanitizedUsers = (users as Record<string, unknown>[]).map((user) => {
  const { password: _pw, resetPasswordToken: _rpt, confirmationToken: _ct, ...safe } = user as Record<string, unknown>;
  if (!isManager) {
    for (const field of PII_FIELDS) delete (safe as Record<string, unknown>)[field];
  }
  return safe;
});
```

### Disable verification-code core routes

```typescript
// apps/strapi/src/api/verification-code/routes/verification-code.ts
import { factories } from "@strapi/strapi";
export default factories.createCoreRouter(
  "api::verification-code.verification-code",
  { only: [] },
);
```

`only: []` disables all core CRUD routes (find, findOne, create, update, delete). The `verification-code` content type stores OTP codes and `pendingToken` in plaintext — making any web-accessible read route a 2FA bypass. The actual OTP logic uses `strapi.db.query` internally via the auth extension controllers, not via the content-API routes.

### Contact and subscription-payment routes

`contact` currently uses `createCoreRouter("api::contact.contact")` with no restrictions. Fix:

```typescript
// apps/strapi/src/api/contact/routes/contact.ts
import { factories } from "@strapi/strapi";
export default factories.createCoreRouter("api::contact.contact", {
  only: ["create"], // Public can create (submit contact form), no list/read/edit
});
```

`subscription-payment` writes are manager-only:

```typescript
// apps/strapi/src/api/subscription-payment/routes/subscription-payment.ts
import { factories } from "@strapi/strapi";
export default factories.createCoreRouter("api::subscription-payment.subscription-payment", {
  config: {
    create: { policies: ["global::isManager"] },
    update: { policies: ["global::isManager"] },
    delete: { policies: ["global::isManager"] },
  },
});
```

**Confidence:** HIGH — `createCoreRouter` with `only` and `config` is official Strapi v5 API. Verified via docs and local code inspection.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSR HTML sanitization | Regex-based tag stripping | `isomorphic-dompurify` | Regex misses unquoted event handlers (`<svg onload=x>`), HTML entity encoding tricks, and dozens of other XSS vectors |
| Markdown HTML passthrough | Custom tokenizer | `marked` renderer override + `walkTokens` | `marked` provides extension hooks specifically for this; custom tokenizer would break GFM |
| File magic-byte detection | Reading first bytes manually | `file-type@16.5.4` | `file-type` handles complex magic byte patterns, polyglot detection, and multi-format disambiguation |
| Auth rate limiting in Strapi | Custom counter middleware | `users-permissions` built-in ratelimit config | It's built in, uses koa2-ratelimit correctly, and covers all built-in auth routes automatically |
| Amount validation formula | Client-supplied amount | Server-side DB lookup of pack price | Only the server knows the authoritative pack price |

---

## Common Pitfalls

### Pitfall 1: marked.use() called inside the composable function
**What goes wrong:** `marked.use()` is called on every component mount, stacking duplicate extensions. The renderer override accumulates, potentially causing unexpected behavior.
**Why it happens:** Vue composables are called per-component instantiation.
**How to avoid:** Call `marked.use({ renderer: {...}, walkTokens: ... })` at module top-level, OUTSIDE the `useSanitize` function.
**Warning signs:** Markdown output behaves inconsistently across page navigations; double-escaping of content.

### Pitfall 2: file-type ESM-only (v17+) in Strapi CommonJS
**What goes wrong:** `import { fileTypeFromFile } from "file-type"` fails at Strapi startup with `ERR_REQUIRE_ESM`.
**Why it happens:** file-type v17+ uses pure ESM. Strapi's module loader is CommonJS.
**How to avoid:** Pin to `file-type@16.5.4` (last CJS-compatible version). DO NOT use dynamic `import()` workaround — it adds async complexity to what should be a sync startup load.
**Warning signs:** Strapi fails to start; `Error [ERR_REQUIRE_ESM]: require() of ES Module`.

### Pitfall 3: nunjucks autoescape: true double-escaping existing escapeHtml() calls
**What goes wrong:** Variables already wrapped in `escapeHtml()` become double-escaped (`&amp;lt;` displayed literally in emails).
**Why it happens:** `autoescape: true` escapes output; `escapeHtml()` already pre-escaped input.
**How to avoid:** Audit all templates. Remove `escapeHtml()` wrappers from plain-text variables. Add `| safe` to server-generated HTML fragments.
**Warning signs:** Email templates show `&lt;`, `&amp;` character sequences in rendered output.

### Pitfall 4: buy_order unique constraint startup failure if duplicate data exists
**What goes wrong:** Strapi fails to start after adding `"unique": true` on `buy_order` if existing records have duplicate or NULL `buy_order` values.
**Why it happens:** Strapi applies the constraint via Knex migration at startup. The DB rejects it if existing data violates uniqueness.
**How to avoid:** Before deploying, run `SELECT buy_order, COUNT(*) FROM orders GROUP BY buy_order HAVING COUNT(*) > 1;` to check for duplicates.
**Warning signs:** Strapi startup error referencing unique constraint creation failure.

### Pitfall 5: Order.find scoping breaks manager view of all orders
**What goes wrong:** Manager users cannot see all orders after scoping `order.find`.
**Why it happens:** Forgetting the `isManager` bypass when adding user-scoped filter.
**How to avoid:** Always check `isManager` first; scope only for non-managers. The existing `payment.ts:744` pattern already demonstrates the correct bypass.

### Pitfall 6: isomorphic-dompurify lru-cache production build failure
**What goes wrong:** Nitro production build fails with `Cannot find module ... lru-cache/dist/esm/index.js`.
**Why it happens:** cssstyle (transitive via jsdom) depends on lru-cache@11 which uses ESM. Nitro bundler fails to resolve it in production mode.
**How to avoid:** Add pnpm override: `"pnpm": { "overrides": { "lru-cache": "^10.4.3" } }` in `apps/website/package.json`.
**Warning signs:** `pnpm build` fails in production; `nuxt build` exits with ERR_MODULE_NOT_FOUND for lru-cache.

---

## Code Examples

### Example 1: Verified DOMPurify server-side sanitize (using isomorphic-dompurify)
```typescript
// Source: isomorphic-dompurify@2.35.0 package exports map (verified 2026-06-12)
import DOMPurify from "isomorphic-dompurify";

// Server: uses JSDOM window internally
// Client: uses browser window
const clean = DOMPurify.sanitize("<svg onload=alert(1)>", {
  ALLOWED_TAGS: ["strong", "em", "b", "i", "u", "br", "p"],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
});
// Result: "" (SVG stripped, KEEP_CONTENT preserves text nodes)
```

### Example 2: marked HTML token suppression (verified against marked@17.0.4)
```typescript
// Source: confirmed via local Node.js test against apps/website/node_modules/marked@17.0.4
import { marked } from "marked";

marked.use({
  renderer: {
    html() { return ""; }, // Block-level HTML tokens → empty
  },
  walkTokens(token) {
    if (token.type === "html") {
      token.text = ""; // Inline HTML tokens → empty text
      token.raw = "";
    }
  },
});

marked.parse("<svg onload=alert(1)>"); // → ""
marked.parse("text <b onclick=x>bold</b> after"); // → "<p>text bold after</p>"
```

### Example 3: Strapi users-permissions built-in ratelimit config
```typescript
// Source: Strapi v5 docs (docs.strapi.io/cms/features/users-permissions) — confirmed 2026-06-12
// apps/strapi/config/plugins.ts
"users-permissions": {
  config: {
    ratelimit: {
      enabled: true,
      interval: 60000,  // ms — 1-minute window
      max: 10,          // requests per key per window
    },
    // existing register.allowedFields and providers config unchanged
  },
},
```

### Example 4: createCoreRouter with only:[] (disable all routes)
```typescript
// Source: Strapi v5 docs.strapi.io/cms/backend-customization/routes — confirmed 2026-06-12
import { factories } from "@strapi/strapi";
export default factories.createCoreRouter("api::verification-code.verification-code", {
  only: [], // No core CRUD routes exposed via content API
});
```

### Example 5: file-type@16.5.4 usage in upload middleware
```typescript
// Source: file-type@16 npm README — confirmed CJS-compatible API
import { fileTypeFromFile } from "file-type"; // works with v16.5.4 CJS

const result = await fileTypeFromFile(file.filepath); // filepath from formidable
if (!result || result.mime !== file.mimetype) {
  ctx.throw(400, `File magic bytes do not match declared MIME: ${file.mimetype}`);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `file-type` any version | `file-type@16.5.4` (pin CJS) | v17.0.0 went ESM-only | Strapi cannot use v17+ without dynamic import |
| `marked` sanitize option | No built-in sanitize | Removed in marked v8 | Must use renderer override or external sanitizer |
| isomorphic-dompurify via global singleton | v3.x: no global singleton, clearWindow() export | isoDomPurify v3.0.0 | Breaking change for code using global.DOMPurify |

**Deprecated/outdated:**
- `marked` `sanitize: true` option: removed in v8 — do not reference old tutorials that use it
- `isomorphic-dompurify` global.DOMPurify pattern: removed in v3 — use named exports

---

## Validation Architecture

> `workflow.nyquist_validation: true` — section included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework (Strapi) | Jest 29.7 + ts-jest |
| Framework (Website) | Vitest 3.0 + @nuxt/test-utils |
| Config (Strapi) | `apps/strapi/jest.config.js` — roots: `["<rootDir>/tests"]` |
| Config (Website) | `apps/website/vitest.config.*` (auto-detected) |
| Quick run (Strapi) | `cd apps/strapi && pnpm test -- --testPathPattern=<file>` |
| Full suite (Strapi) | `cd apps/strapi && pnpm test` |
| Quick run (Website) | `cd apps/website && pnpm test -- <file>` |
| Full suite (Website) | `cd apps/website && pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC2-PAYMENT | Amount mismatch rejected (actual ≠ expected) | unit | `pnpm test -- --testPathPattern=checkout.service` | ❌ Wave 0 |
| SEC2-PAYMENT | Replay: second call with same buy_order → short-circuit | unit | `pnpm test -- --testPathPattern=checkout.service` | ❌ Wave 0 |
| SEC2-PAYMENT | Ad ownership mismatch → returns failure | unit | `pnpm test -- --testPathPattern=checkout.service` | ❌ Wave 0 |
| SEC2-PAYMENT | Missing AD_FEATURED_PRICE → error (no fallback) | unit | `pnpm test -- --testPathPattern=checkout.service` | ❌ Wave 0 |
| SEC2-AUTHZ | order.findOne cross-user access → 403 | unit | `pnpm test -- --testPathPattern=order.test` | ❌ Wave 0 |
| SEC2-AUTHZ | order.find non-manager → scoped to own user | unit | `pnpm test -- --testPathPattern=order.test` | ❌ Wave 0 |
| SEC2-AUTHZ | ad-pack create/update/delete → 403 for non-manager | unit | `pnpm test -- --testPathPattern=ad-pack.route` | ❌ Wave 0 |
| SEC2-AUTH | email_verified=false → rejected before link/create | unit | `pnpm test -- --testPathPattern=google-one-tap.service` | ❌ Wave 0 |
| SEC2-AUTH | JWT fallback removed → null userId when JWT_SECRET unset | unit | `pnpm test -- --testPathPattern=ad.test` | ❌ Wave 0 |
| SEC2-XSS | sanitizeHTML runs identically server + client (no regex branch) | unit | `cd apps/website && pnpm test -- useSanitize` | ❌ Wave 0 |
| SEC2-XSS | parseMarkdown strips inline HTML before sanitize | unit | `cd apps/website && pnpm test -- useSanitize` | ❌ Wave 0 |
| SEC2-XSS | `<svg onload=x>` → empty after sanitizeRich | unit | `cd apps/website && pnpm test -- useSanitize` | ❌ Wave 0 |
| SEC2-LOCKDOWN | upload.ts rejects file with mismatched magic bytes | unit | `pnpm test -- --testPathPattern=upload` | ❌ Wave 0 (existing file is in `tests/middlewares/`) |
| SEC2-LOCKDOWN | getUserDataWithFilters strips PII for non-managers | unit | `pnpm test -- --testPathPattern=userController` | ❌ Wave 0 |
| SEC2-LOCKDOWN | verification-code: no routes respond | unit (route level) | manual check or integration | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Quick run against the specific test file(s) changed
- **Per wave merge:** `pnpm test` in both `apps/strapi` and `apps/website`
- **Phase gate:** Full suite green in both apps before `/gsd:verify-work`

### Wave 0 Gaps

All test files for this phase must be created. Mirror existing patterns:
- `apps/strapi/tests/api/payment/checkout.service.test.ts` — mirrors `src/api/payment/services/checkout.service.ts`
- `apps/strapi/tests/api/order/order.test.ts` — mirrors `src/api/order/controllers/order.ts`
- `apps/strapi/tests/services/google-one-tap/google-one-tap.service.test.ts`
- `apps/strapi/tests/middlewares/upload.test.ts` — extends existing file
- `apps/strapi/tests/extensions/users-permissions/controllers/userController.test.ts`
- `apps/website/tests/composables/useSanitize.test.ts`

Existing test directory structure is already correct (root-level `tests/` in both apps). No framework installation needed.

---

## Open Questions

1. **Strapi DB transaction support for buy_order + order creation**
   - What we know: `strapi.db.query` has no direct transaction API in Strapi v5; `strapi.db.connection` (Knex) does.
   - What's unclear: Whether wrapping reservation creation and order insertion in a Knex transaction is safe in the current Strapi v5 version.
   - Recommendation: Implement the idempotency check (look up existing order before granting benefits) as the primary replay protection. The unique constraint on `buy_order` is the DB-level guard. A full transaction is a defense-in-depth enhancement — if difficult, document it as a follow-up.

2. **Template audit scope for autoescape: true**
   - What we know: `src/services/mjml/templates/` contains multiple `.mjml` files using nunjucks expressions.
   - What's unclear: Exactly how many use `escapeHtml()` or server-generated HTML that needs `| safe`.
   - Recommendation: The implementer MUST audit every template file before enabling `autoescape: true`. This is a required pre-condition, not optional.

3. **ad-reservation create — owner-scoped controller vs. route removal**
   - What we know: The decisions say "owner-scoped controller that sets user from ctx.state.user and ignores client price/user". The current route has `config: { policies: [] }` with no authentication enforcement.
   - What's unclear: Whether the reservation `create` should be accessible to any authenticated user (to buy a reservation) or only triggered internally by the payment flow.
   - Recommendation: Reservations are created by the payment flow server-side (`PaymentUtils.adReservation.createAdReservation`). A public `create` endpoint is likely unnecessary — remove it entirely and gate with `global::isManager` unless there's a known user-facing flow that creates reservations directly.

---

## Sources

### Primary (HIGH confidence)
- `apps/strapi/src/` — code inspection for existing patterns (ownership checks, JWT service usage, route configs)
- `apps/website/app/composables/useSanitize.ts` — current implementation inspected
- `apps/website/package.json` and `apps/strapi/package.json` — installed versions verified
- Local Node.js test: `marked@17.0.4` renderer override and walkTokens (empirically verified output)
- Local Node.js test: `jsdom@27.4.0` version confirmed as installed
- npm registry: `isomorphic-dompurify` package metadata verified 2026-06-12
- npm registry: `file-type@16.5.4` — last CJS-compatible version confirmed

### Secondary (MEDIUM confidence)
- [Strapi v5 docs — Routes — createCoreRouter with `only`](https://docs.strapi.io/cms/backend-customization/routes) — `only: []` syntax confirmed
- [Strapi v5 docs — users-permissions ratelimit config](https://docs.strapi.io/cms/features/users-permissions) — `ratelimit.enabled/interval/max` confirmed
- [Strapi issue #24859](https://github.com/strapi/strapi/issues/24859) — file-type v16.5.4 as last CJS version
- [isomorphic-dompurify issue #353](https://github.com/kkomelin/isomorphic-dompurify/issues/353) — lru-cache@10 override for Nuxt/Nitro build
- [isomorphic-dompurify v3.0.0 release notes](https://github.com/kkomelin/isomorphic-dompurify/releases/tag/3.0.0) — ESM support, no global singleton

### Tertiary (LOW confidence)
- Nuxt Nitro per-route server middleware pattern (in-memory rate limit) — standard H3 pattern, but no specific Nuxt 4 + auth rate limit example found; implementation is straightforward from fundamentals.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed from installed node_modules and npm registry
- Architecture: HIGH — patterns verified against existing codebase code (isManager, protect-ad-fields, jwt.service)
- Pitfalls: HIGH — most verified empirically (marked ESM, file-type CJS, autoescape double-escape is nunjucks spec)

**Research date:** 2026-06-12
**Valid until:** 2026-07-12 (stable libraries; file-type/marked major versions unlikely to shift)
