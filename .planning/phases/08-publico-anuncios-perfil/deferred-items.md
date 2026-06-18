# Deferred Items — Phase 08

Out-of-scope discoveries logged during execution. Do NOT fix inline; these belong to other plans/owners.

## From 08-02 execution

### [Nuxt proxy / caching] Reveal PII responses are cached and served to anonymous callers — HIGH severity

- **Found during:** 08-02 Task 0 (payload verification, before building the contact card).
- **Root cause (confirmed, NOT a backend auth gap):** the Strapi endpoint is correctly gated.
  A direct **anonymous** call straight at Strapi returns 401:
  ```
  curl -i "http://localhost:1337/api/ads/<documentId>/reveal/email"
  → HTTP 401 {"error":{"status":401,"name":"UnauthorizedError",...}}
  ```
  But the **Nuxt proxy** (`:3000`) serves a **cached** copy of a previously-authenticated reveal to anonymous callers:
  ```
  curl -i "http://localhost:3000/api/ads/<documentId>/reveal/email"   # no cookie
  → HTTP 200  x-cache: HIT  x-cache-middleware: active
    {"data":{"channel":"email","value":"hola@gabrielburgos.cl"}}
  ```
  The response carries `cache-control: no-store, s-maxage=14400` and `x-cache: HIT` — the proxy cache middleware cached the authed reveal (populated by a prior logged-in request) and now returns the **real PII** to anyone, with no auth.
- **Why it matters:** this fully defeats the anti-scraping purpose of the masked payload + JWT-gated reveals. An unauthenticated scraper that waits for (or triggers) one cache fill reads every revealed contact for `s-maxage` (4h). The whole 08-04 masking model is moot while reveals are cacheable.
- **Scope:** Nuxt proxy cache middleware in `apps/website` (the `x-cache-middleware`), NOT 08-02 component code and NOT the Strapi reveal handlers (those are correct — 401 at source). Relates to the known-open MEMORY item `project_proxy_cache_headers`.
- **08-02 impact:** none on the component — the website frontend only calls reveals from INSIDE the logged-IN block. But the cached endpoint is reachable by any direct caller, so the leak is real in this deployment.
- **Recommended:** exclude `**/reveal/**` (and any per-viewer/PII route) from the proxy cache middleware, or honor the upstream `no-store` (the cache currently ignores it). Re-verify with the two curls above (`:1337` 401 vs `:3000` x-cache HIT).
