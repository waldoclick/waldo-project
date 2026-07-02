# Research: Fix Vercel edge caching for the website image proxy

## Problem confirmed

`https://www.waldo.click/api/images/<file>` always returns `x-vercel-cache: MISS`, verified with repeated curl requests to the same URL seconds apart. The handler (`apps/website/server/api/images/[...].ts`) proxies to Strapi's `/uploads/<file>` via h3's `proxyRequest`.

## Root cause (confirmed via Vercel's official CDN Cache docs)

Per https://vercel.com/docs/caching/cdn-cache, for a Vercel Function response to be cached at the edge:

- The `Cache-Control` header **must** include one of: `s-maxage=N`, `s-maxage=N, stale-while-revalidate=Z`, or `s-maxage=N, stale-while-revalidate=Z, stale-if-error=Z`. `public` is **not** required — the "any of these directives" list is exhaustive and doesn't list `public` as a requirement.
- The response **must not** contain `private`, `no-cache`, or `no-store` in `Cache-Control` — any of these disqualifies caching regardless of `s-maxage`.
- Request must be GET/HEAD, no `Range` header, no `Authorization` header. Both hold for normal `<img>` tag loads of this route.
- Response must not have `set-cookie`, must be ≤10MB, and status must be one of 200/404/410/301/302/307/308.

Today, the actual response header reaching the browser/Vercel is whatever Strapi's static upload server sets: `Cache-Control: max-age=14400` — no `s-maxage`. That fails the first criterion above, so Vercel never caches it. This is confirmed independently of the dead code in the handler.

## The handler's existing `Cache-Control: "no-cache"` line is a no-op (verified in h3 source)

```ts
const headers: Record<string, string> = {
  "Cache-Control": "no-cache", // Sin cache en servidor, solo Cloudflare
  ...
};
return proxyRequest(event, finalUrl, { headers });
```

Read `node_modules/h3/dist/index.mjs`:
- `proxyRequest(event, target, opts)` merges `opts.headers` into `fetchOptions.headers` — i.e. it's sent as a **request** header to Strapi, not set on the response returned to the browser.
- `sendProxy` (called internally) then copies **every** header from Strapi's response onto `event.node.res` via `res.setHeader(key, value)`, unconditionally overwriting anything set earlier — except `content-encoding`, `content-length`, `set-cookie` (collected separately).

So even if this header were somehow applied to the response, Strapi's own `Cache-Control: max-age=14400` would overwrite it anyway, since `sendProxy` runs after and copies the origin's headers verbatim. The comment "Sin cache en servidor, solo Cloudflare" reflects a stale assumption — `www.waldo.click` is served directly by Vercel today with no Cloudflare in front of it (confirmed via curl: `server: Vercel`, no `cf-ray`).

## The fix

Set the response header **after** `proxyRequest` resolves (not before, and not via its `headers` option), so it lands after `sendProxy`'s header-copy loop has already run:

```ts
await proxyRequest(event, finalUrl, {
  headers: { /* only real outgoing headers to Strapi, e.g. CORS is irrelevant here */ },
});
setResponseHeader(
  event,
  "cache-control",
  `public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400`,
);
```

`setResponseHeader` is a Nitro/h3 auto-import, consistent with the rest of the codebase's auto-import usage (`getQuery`, `defineEventHandler`, etc. are already auto-imported and unqualified in this same file).

**TTL choice:** use `14400` (4h) to match Strapi's own upload cache TTL and the existing `REDIS_TTL` default (`3600 * 4`) in `apps/strapi/src/middlewares/cache.ts` — don't invent a new number. `stale-while-revalidate=86400` (24h) is a reasonable grace window consistent with typical Vercel examples, allowing stale-serve during revalidation without inventing an unrelated magic number that isn't traceable to existing config.

**Do NOT reuse the JSON API's `no-store, s-maxage=<ttl>` pattern** (used in `apps/strapi/src/middlewares/cache.ts` for `/api/ads/*`). That pattern is correct for JSON API responses (browser must always revalidate, only the CDN/Redis layer caches) — but per Vercel's own criteria, `no-store` **disqualifies the response from Vercel's CDN cache entirely**. Images should be cacheable by the browser too, so `public, max-age=...` (no `no-store`) is correct here, unlike for the JSON routes.

## nuxt.config.ts / nuxt-security — no conflicts found

- No existing `routeRules` entry for `/api/images/**` (only `/dashboard/*` redirects exist) — no need to touch `routeRules`, the fix belongs in the handler itself.
- `nuxt-security`'s `headers` config (production-only) only configures CSP/permissions-policy/etc. — it does not touch `Cache-Control`. No conflict.

## Test pattern to reuse

`apps/website/tests/server/recaptcha-proxy.test.ts` establishes the mocking convention for this codebase's Nitro handlers:

```ts
vi.mock("h3", () => ({
  getHeader: vi.fn(),
  createError: vi.fn(...),
  proxyRequest: vi.fn().mockResolvedValue({}),
  defineEventHandler: vi.fn((fn) => fn),
}));
```

For this task, extend the mock with `setResponseHeader: vi.fn()` and `getQuery: vi.fn().mockReturnValue({})`, import the handler, invoke it with a minimal mock `event`, then assert `setResponseHeader` was called with `(event, "cache-control", "public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400")` — this is the property under test, not Strapi's actual response.

Per this repo's testing rules, the test file must live at `apps/website/tests/server/api/images/[...].test.ts` (mirrors `apps/website/server/api/images/[...].ts`).

## Recommendation summary

1. Edit `apps/website/server/api/images/[...].ts`: remove the no-op `Cache-Control: "no-cache"` request header, add `setResponseHeader(event, "cache-control", "public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400")` after `await proxyRequest(...)`.
2. No `nuxt.config.ts` changes needed.
3. Add one regression test asserting the response header is set correctly.
4. Out of scope (per task boundary): Cloudflare Cache Rules for `api.waldo.click/uploads/*` — that's a dashboard config change for the user.
