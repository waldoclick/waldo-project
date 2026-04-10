---
phase: quick
plan: 260409-tig
subsystem: strapi-api
tags: [strapi, api, search-console, cloudflare, routing, policy]
dependency_graph:
  requires:
    - 260409-taw (search-console and cloudflare service stubs)
  provides:
    - GET /api/search-console route with isManager guard
    - GET /api/cloudflare route with isManager guard
  affects:
    - apps/strapi/src/api/search-console/
    - apps/strapi/src/api/cloudflare/
tech_stack:
  added: []
  patterns:
    - cron-runner controller/route pattern (named default export + isManager policy)
key_files:
  created:
    - apps/strapi/src/api/search-console/controllers/search-console.ts
    - apps/strapi/src/api/search-console/routes/search-console.ts
    - apps/strapi/src/api/cloudflare/controllers/cloudflare.ts
    - apps/strapi/src/api/cloudflare/routes/cloudflare.ts
  modified: []
decisions:
  - Controller calls `new Service()` to validate constructor wiring; no real API calls are made yet — stub pattern identical to cron-runner
metrics:
  duration: ~5 minutes
  completed: 2026-04-10
  tasks_completed: 2
  tasks_total: 2
  files_created: 4
  files_modified: 0
---

# Phase quick Plan 260409-tig: Create Search Console and Cloudflare API Modules Summary

**One-liner:** GET /api/search-console and GET /api/cloudflare stubs wired to their service constructors, locked behind global::isManager policy, mirroring the cron-runner pattern exactly.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create search-console API module (controller + route) | 627358ad | search-console.ts (controller + route) |
| 2 | Create cloudflare API module (controller + route) | fa96b1f5 | cloudflare.ts (controller + route) |

## What Was Built

Four files under `apps/strapi/src/api/` following the established cron-runner pattern:

- **search-console controller** — `getData` method instantiates `SearchConsoleService`, returns `{ ok: true }` on success, `ctx.internalServerError` on constructor throw (e.g. missing env vars)
- **search-console route** — `GET /search-console` mapped to `search-console.getData`, protected by `global::isManager`
- **cloudflare controller** — `getData` method instantiates `CloudflareService`, same stub/error pattern
- **cloudflare route** — `GET /cloudflare` mapped to `cloudflare.getData`, protected by `global::isManager`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

The controllers return `{ ok: true }` without making real API calls. This is intentional — the plan explicitly scopes these as stubs. Real data retrieval will be implemented in a future task that wires actual Search Console and Cloudflare API calls through the respective services.

## Self-Check: PASSED

- `apps/strapi/src/api/search-console/controllers/search-console.ts` — exists, exports default object with `getData`
- `apps/strapi/src/api/search-console/routes/search-console.ts` — exists, `GET /search-console` + `global::isManager`
- `apps/strapi/src/api/cloudflare/controllers/cloudflare.ts` — exists, exports default object with `getData`
- `apps/strapi/src/api/cloudflare/routes/cloudflare.ts` — exists, `GET /cloudflare` + `global::isManager`
- TypeScript: zero errors in new files (`tsc --noEmit` clean)
- Commits: `627358ad` (search-console), `fa96b1f5` (cloudflare) — both verified in git log
