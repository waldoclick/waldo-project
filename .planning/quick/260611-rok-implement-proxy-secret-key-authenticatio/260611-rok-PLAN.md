---
phase: quick-260611-rok
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/.env
  - apps/website/.env
  - apps/strapi/.env.example
  - apps/website/.env.example
  - apps/website/server/api/[...].ts
  - apps/strapi/src/middlewares/proxy-auth.ts
  - apps/strapi/config/middlewares.ts
  - apps/strapi/tests/middlewares/proxy-auth.test.ts
autonomous: true
requirements: [PROXY-AUTH-01]

must_haves:
  truths:
    - "Website proxy adds X-Proxy-Key header (PROXY_SECRET_WEB) to every proxied request to Strapi"
    - "Strapi rejects /api/* requests with no X-Proxy-Key (401) or a wrong key (403)"
    - "Strapi accepts /api/* requests carrying either PROXY_SECRET_WEB or PROXY_SECRET_APP"
    - "Strapi admin panel (/content-manager, /upload, /admin, etc.) keeps working — non-/api paths are not enforced"
  artifacts:
    - path: "apps/strapi/src/middlewares/proxy-auth.ts"
      provides: "Global middleware enforcing X-Proxy-Key on /api/* requests"
      contains: "timingSafeEqual"
    - path: "apps/strapi/tests/middlewares/proxy-auth.test.ts"
      provides: "Jest unit tests for proxy-auth middleware"
    - path: "apps/strapi/.env.example"
      provides: "Documented PROXY_SECRET_WEB and PROXY_SECRET_APP placeholders"
      contains: "PROXY_SECRET_WEB"
  key_links:
    - from: "apps/website/server/api/[...].ts"
      to: "apps/strapi/src/middlewares/proxy-auth.ts"
      via: "X-Proxy-Key request header"
      pattern: "X-Proxy-Key"
    - from: "apps/strapi/config/middlewares.ts"
      to: "global::proxy-auth"
      via: "middleware registration after strapi::errors, before strapi::security"
      pattern: "global::proxy-auth"
---

<objective>
Add a shared-secret authentication layer between the Nuxt website proxy and Strapi so that only the website (and the mobile app) can reach the Strapi content API. The website attaches an `X-Proxy-Key` header to every proxied request; a global Strapi middleware validates it with a timing-safe comparison and rejects unauthenticated/forged callers.

Purpose: Prevent direct, unauthenticated access to the Strapi `/api/*` surface from outside the proxy.
Output: Secrets wired into both apps, website proxy header forwarding, a new global Strapi middleware (with Jest tests), and middleware registration.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

@apps/strapi/src/middlewares/recaptcha.ts
@apps/strapi/tests/middlewares/protect-user-fields.test.ts
@apps/website/server/api/[...].ts
@apps/strapi/config/middlewares.ts

<interfaces>
<!-- Patterns the executor must replicate. -->

Existing timing-safe key check (recaptcha.ts) — REPLICATE this pattern exactly:
```typescript
import crypto from "crypto";
// length check BEFORE timingSafeEqual — timingSafeEqual throws on unequal buffer lengths
if (providedKey.length !== validKey.length) return false;
return crypto.timingSafeEqual(Buffer.from(providedKey), Buffer.from(validKey));
```

Strapi global middleware signature (recaptcha.ts uses a no-arg factory; proxy-auth needs no config/strapi, so use the same):
```typescript
import { Context } from "koa";
export default () => {
  return async (ctx: Context, next: () => Promise<void>) => { /* ... */ };
};
```

Closest existing test to replicate: `apps/strapi/tests/middlewares/protect-user-fields.test.ts`
— imports middleware via `../../src/middlewares/...`, builds a plain mock `ctx` object, calls the middleware factory then the returned fn, asserts with Jest. Follow its structure exactly (AAA, descriptive English names).

Koa Context response helpers available in Strapi: `ctx.unauthorized(msg)` → 401, `ctx.forbidden(msg)` → 403.
`ctx.path` is the request path (e.g. `/api/ads`, `/content-manager/...`, `/admin`).
Header access: `ctx.request.headers["x-proxy-key"]` (Koa lowercases header names).

Website proxy header forwarding block (server/api/[...].ts, ~line 68-89): headers object built then passed to `proxyRequest(event, targetUrl, { headers })`. New header goes alongside `Authorization` / `Content-Type`.
</interfaces>

<secrets>
PROXY_SECRET_WEB=50e09ce6153051edb8ba9b95bc7474965b14c1d23807ad36638e9313187160ef
PROXY_SECRET_APP=12bac1dc704f7b6a3d1d73f31d384713c0c272498592f2c498780754dc48575f
</secrets>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create proxy-auth middleware with Jest tests and register it</name>
  <files>apps/strapi/src/middlewares/proxy-auth.ts, apps/strapi/tests/middlewares/proxy-auth.test.ts, apps/strapi/config/middlewares.ts</files>
  <behavior>
    - Request to a non-`/api` path (e.g. `/admin`, `/content-manager/foo`, `/upload/files`) → middleware calls next(), never rejects (admin panel must keep working).
    - Request to `/api/ads` with NO `x-proxy-key` header → `ctx.unauthorized()` (401), next() not called.
    - Request to `/api/ads` with a WRONG `x-proxy-key` → `ctx.forbidden()` (403), next() not called.
    - Request to `/api/ads` with `x-proxy-key === PROXY_SECRET_WEB` → next() called.
    - Request to `/api/ads` with `x-proxy-key === PROXY_SECRET_APP` → next() called (mobile app path).
  </behavior>
  <action>
    Create `apps/strapi/src/middlewares/proxy-auth.ts` modeled EXACTLY on `recaptcha.ts` structure:

    1. `import { Context } from "koa";` and `import crypto from "crypto";`.
    2. `getValidProxyKeys(): string[]` — reads `process.env.PROXY_SECRET_WEB` and `process.env.PROXY_SECRET_APP`, returns the non-empty ones in an array (filter out undefined/empty). This makes EITHER key valid — required so the mobile app can call Strapi directly.
    3. `isValidProxyKey(providedKey: string | undefined): boolean` — copy the recaptcha timing-safe pattern: return false if no key or no valid keys; for each valid key do the length check BEFORE `crypto.timingSafeEqual(Buffer.from(providedKey), Buffer.from(validKey))` (timingSafeEqual throws on unequal lengths). Return true if any key matches.
    4. Default export `() => async (ctx, next) => { ... }`:
       - SKIP enforcement for any path NOT starting with `/api`: `if (!ctx.path.startsWith("/api")) return next();`
         CRITICAL — do NOT narrow this to only `/admin`. The Strapi admin panel calls `/content-manager/*`, `/upload/*`, `/content-type-builder/*`, `/i18n/*`, etc. with an admin JWT and no X-Proxy-Key; enforcing on those would 401 the whole admin UI (FAQs/policies/terms are maintained there). Only `/api/*` is the content API that the website proxy and mobile app use, so scope enforcement to `/api/*` and skip everything else. The locked "skip /admin" constraint is satisfied by this narrower-to-`/api` rule.
       - Read `const providedKey = ctx.request.headers["x-proxy-key"] as string | undefined;`
       - If `!providedKey` → `return ctx.unauthorized("Proxy key is required");` (401)
       - If `!isValidProxyKey(providedKey)` → `return ctx.forbidden("Invalid proxy key");` (403)
       - Else `await next();`

    Create `apps/strapi/tests/middlewares/proxy-auth.test.ts` — replicate the structure of the existing `protect-user-fields.test.ts` (same directory). Use Jest + AAA, descriptive English `it()` names, import via `../../src/middlewares/proxy-auth`. Set `process.env.PROXY_SECRET_WEB`/`PROXY_SECRET_APP` in `beforeEach`, restore originals in `afterEach`. For each behavior case, build a mock `ctx` like `{ path, request: { headers: {} }, unauthorized: jest.fn(), forbidden: jest.fn() }` and a `next = jest.fn()`, invoke the factory then `await mw(ctx, next)`, and assert which of next/unauthorized/forbidden was called. Cover all 5 behavior cases above.

    Register in `apps/strapi/config/middlewares.ts`: insert `"global::proxy-auth"` at array position 2 — immediately after `"strapi::errors"` and immediately before the `strapi::security` object. Resulting order: `strapi::logger, strapi::errors, global::proxy-auth, strapi::security, strapi::cors, ...`.
  </action>
  <verify>
    <automated>cd apps/strapi && pnpm test -- tests/middlewares/proxy-auth.test.ts</automated>
  </verify>
  <done>All 5 Jest cases pass; proxy-auth.ts exists with timingSafeEqual + `/api` scoping; middlewares.ts lists global::proxy-auth at index 2 between strapi::errors and strapi::security.</done>
</task>

<task type="auto">
  <name>Task 2: Wire X-Proxy-Key into website proxy and document/populate env files</name>
  <files>apps/website/server/api/[...].ts, apps/strapi/.env, apps/website/.env, apps/strapi/.env.example, apps/website/.env.example</files>
  <action>
    1. In `apps/website/server/api/[...].ts`, in the headers object passed to `proxyRequest` (the block around lines 68-89, alongside `Authorization` and `Content-Type` forwarding), add the proxy key — but GUARD against undefined so an unset env var doesn't assign `"undefined"`:
       ```typescript
       const proxyKey = process.env.PROXY_SECRET_WEB;
       if (proxyKey) {
         headers["X-Proxy-Key"] = proxyKey;
       }
       ```
       Place this with the other forwarded headers (after the Content-Type block). This applies to ALL proxied non-OAuth requests. Do NOT add it to the OAuth redirect branch (those bypass Strapi's /api middleware via sendRedirect and go to /connect/* anyway).

    2. Append to `apps/strapi/.env` (real keys — this file is gitignored, never committed):
       ```
       # Proxy secret keys (Nuxt website / Strapi / mobile app)
       PROXY_SECRET_WEB=50e09ce6153051edb8ba9b95bc7474965b14c1d23807ad36638e9313187160ef
       PROXY_SECRET_APP=12bac1dc704f7b6a3d1d73f31d384713c0c272498592f2c498780754dc48575f
       ```

    3. Append to `apps/website/.env` (real key — website only needs WEB; gitignored, never committed):
       ```
       # Proxy secret key (sent as X-Proxy-Key to Strapi)
       PROXY_SECRET_WEB=50e09ce6153051edb8ba9b95bc7474965b14c1d23807ad36638e9313187160ef
       ```

    4. Append placeholders to `apps/strapi/.env.example` (committed):
       ```
       # Proxy secret keys (Nuxt website / Strapi / mobile app)
       PROXY_SECRET_WEB=your_proxy_secret_web
       PROXY_SECRET_APP=your_proxy_secret_app
       ```

    5. Append placeholder to `apps/website/.env.example` (committed — deviation from the original spec, which only named the Strapi example; the website consumes PROXY_SECRET_WEB so its example must document it):
       ```
       # Proxy secret key (sent as X-Proxy-Key to Strapi)
       PROXY_SECRET_WEB=your_proxy_secret_web
       ```

    Read each `.env` / `.env.example` first to match the existing comment/formatting style before appending.
  </action>
  <verify>
    <automated>grep -q "X-Proxy-Key" "apps/website/server/api/[...].ts" && grep -q "PROXY_SECRET_WEB" apps/strapi/.env.example && grep -q "PROXY_SECRET_WEB" apps/website/.env.example && grep -q "PROXY_SECRET_WEB" apps/strapi/.env && grep -q "PROXY_SECRET_WEB" apps/website/.env && echo OK</automated>
  </verify>
  <done>Website proxy sets X-Proxy-Key (guarded) from PROXY_SECRET_WEB on non-OAuth requests; both .env files hold the real keys; both .env.example files document the placeholders.</done>
</task>

</tasks>

<verification>
- `pnpm test -- tests/middlewares/proxy-auth.test.ts` (run from apps/strapi) passes all 5 cases.
- `apps/strapi/config/middlewares.ts` has `global::proxy-auth` at index 2 (after errors, before security).
- `X-Proxy-Key` present in website proxy headers; not added to OAuth redirect branch.
- Admin-plane paths (`/content-manager`, `/upload`, `/admin`) are skipped by the middleware (covered by Jest non-/api case).
- TypeScript compiles clean in apps/strapi.
</verification>

<success_criteria>
- A request to Strapi `/api/*` without a valid X-Proxy-Key is rejected (401 missing / 403 wrong); with PROXY_SECRET_WEB or PROXY_SECRET_APP it passes.
- The website proxy transparently authenticates every forwarded request.
- The Strapi admin panel continues to function (no enforcement on non-/api paths).
- Only `.env.example` (placeholders), middleware, config, proxy, and test files are committed — the real-key `.env` files are NOT committed (gitignored).
</success_criteria>

<output>
After completion, create `.planning/quick/260611-rok-implement-proxy-secret-key-authenticatio/260611-rok-SUMMARY.md`.

Git commit (exclude the gitignored real-key .env files):
```
node "~/.claude/get-shit-done/bin/gsd-tools.cjs" commit "feat(260611-rok): add proxy secret key authentication between Nuxt and Strapi" --files apps/strapi/src/middlewares/proxy-auth.ts apps/strapi/tests/middlewares/proxy-auth.test.ts apps/strapi/config/middlewares.ts "apps/website/server/api/[...].ts" apps/strapi/.env.example apps/website/.env.example
```
</output>
