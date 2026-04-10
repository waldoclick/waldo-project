---
phase: quick
plan: 260409-tns
subsystem: api
tags: [strapi, googleapis, cloudflare, search-console, analytics]

# Dependency graph
requires:
  - phase: quick/260409-taw
    provides: SearchConsoleService and CloudflareService stub classes with constructor fields
  - phase: quick/260409-tig
    provides: search-console and cloudflare API modules (controller + route) wired to Strapi

provides:
  - ISearchConsoleService interface with getPerformance/getTopQueries/getTopPages signatures
  - SearchConsoleService implementing all three methods via googleapis searchconsole v1
  - ICloudflareService interface with getAnalytics signature returning CloudflareAnalytics
  - CloudflareService.getAnalytics() fetching Cloudflare dashboard endpoint with computed metrics
  - GET /api/search-console returning { performance, topQueries, topPages }
  - GET /api/cloudflare returning { requests, bandwidth, threats, pageviews, cacheHitRate, errorRate, timeseries }

affects: [dashboard analytics pages, search-console, cloudflare]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Auth.GoogleAuth instantiated per-method (not shared instance) to avoid credential caching
    - Cloudflare response navigated with any cast and inline comment explaining reason
    - Both analytics controllers use Promise.all or direct await and propagate errors as 500

key-files:
  created: []
  modified:
    - apps/strapi/src/services/search-console/types/search-console.types.ts
    - apps/strapi/src/services/search-console/services/search-console.service.ts
    - apps/strapi/src/services/cloudflare/types/cloudflare.types.ts
    - apps/strapi/src/services/cloudflare/services/cloudflare.service.ts
    - apps/strapi/src/api/search-console/controllers/search-console.ts
    - apps/strapi/src/api/cloudflare/controllers/cloudflare.ts

key-decisions:
  - "Auth.GoogleAuth instantiated per method call (not stored as instance field) to avoid credential caching issues across requests"
  - "Cloudflare response cast to any with explanatory comment — API response shape is untyped; all derived fields computed explicitly from totals"
  - "cacheHitRate and errorRate both guard against division by zero when requests.all is 0"

patterns-established:
  - "GoogleAuth + google.searchconsole per-method pattern: create auth/client inside each method, not in constructor"
  - "Cloudflare analytics: fetch with Bearer token, parse totals, compute derived metrics, pass timeseries through"

requirements-completed: [TNS-01]

# Metrics
duration: 2min
completed: 2026-04-09
---

# Quick Task 260409-tns: Implement Search Console and Cloudflare Analytics Summary

**Real Google Search Console and Cloudflare analytics replacing stub { ok: true } responses — both services fully typed and wired to their controllers**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-09T~03:43Z
- **Completed:** 2026-04-09T~03:45Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Replaced empty ISearchConsoleService stub with three typed method signatures; implemented all three using googleapis searchconsole v1 with per-method GoogleAuth instantiation
- Replaced empty ICloudflareService stub with getAnalytics returning CloudflareAnalytics; fetches Cloudflare dashboard endpoint with Bearer auth and computes cacheHitRate and errorRate from totals
- Both controllers now call real service methods — Search Console controller fans out three calls in parallel via Promise.all; Cloudflare controller awaits getAnalytics and returns the shape directly
- Full Strapi TypeScript check (npx tsc --noEmit) passes with zero errors

## Task Commits

1. **Task 1: Implement SearchConsoleService methods and typed interface** - `64167657` (feat)
2. **Task 2: Implement CloudflareService.getAnalytics and typed interface** - `2fbd17aa` (feat)
3. **Task 3: Wire controllers to return real analytics data** - `fde1984a` (feat)

## Files Created/Modified

- `apps/strapi/src/services/search-console/types/search-console.types.ts` - SearchConsoleRow, SearchConsolePerformanceRow, ISearchConsoleService (3 method signatures)
- `apps/strapi/src/services/search-console/services/search-console.service.ts` - getPerformance (28-day date dimension), getTopQueries (rowLimit 10), getTopPages (rowLimit 10)
- `apps/strapi/src/services/cloudflare/types/cloudflare.types.ts` - CloudflareTimeseries, CloudflareAnalytics, ICloudflareService
- `apps/strapi/src/services/cloudflare/services/cloudflare.service.ts` - getAnalytics fetching /analytics/dashboard?since=-672&until=0 with computed metrics
- `apps/strapi/src/api/search-console/controllers/search-console.ts` - calls all three service methods in parallel, responds with { performance, topQueries, topPages }
- `apps/strapi/src/api/cloudflare/controllers/cloudflare.ts` - calls getAnalytics and returns CloudflareAnalytics directly

## Decisions Made

- Auth.GoogleAuth is instantiated inside each method (not in constructor or as instance field) to prevent stale credential caching across requests
- Cloudflare JSON response cast to `any` with an explanatory comment — the Cloudflare Analytics API response shape is not publicly typed; this is the correct narrow use of `any` per project conventions
- Division-by-zero guards on cacheHitRate and errorRate when `requests.all` is 0

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Both services require environment variables configured in Strapi before the endpoints return real data:

- `GOOGLE_SC_CREDENTIALS_PATH` — path to Google service account JSON key file
- `GOOGLE_SC_SITE_URL` — Search Console site URL (e.g. `https://example.com/`)
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Zone Analytics read permission
- `CLOUDFLARE_ZONE_ID` — Cloudflare zone ID for the target domain

## Next Phase Readiness

- Both endpoints are functional and will return real data once environment variables are set
- Dashboard analytics pages can now consume GET /api/search-console and GET /api/cloudflare

---
*Phase: quick*
*Completed: 2026-04-09*

## Self-Check: PASSED

All 6 files confirmed on disk. All 3 task commits confirmed in git log.
