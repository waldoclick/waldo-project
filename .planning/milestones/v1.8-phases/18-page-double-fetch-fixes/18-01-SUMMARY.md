---
phase: 18-page-double-fetch-fixes
plan: 01
subsystem: api
tags: [nuxt, strapi, useAsyncData, entityService, vue, typescript]

# Dependency graph
requires:
  - phase: 17-email-notification-update
    provides: baseline Strapi controller patterns and Nuxt page conventions
provides:
  - preguntas-frecuentes.vue loads FAQs with a single SSR-integrated useAsyncData call
  - GET /api/ads/me/counts endpoint returning 5 status counts in one request
affects:
  - 19-mis-anuncios-tab-counts (consumes /api/ads/me/counts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useAsyncData as sole data-loading trigger in Nuxt pages — no bare await before it"
    - "Promise.all for parallel entityService.count() calls in Strapi controllers"
    - "as any cast on Strapi entityService filters to satisfy strict generics"

key-files:
  created: []
  modified:
    - apps/website/app/pages/preguntas-frecuentes.vue
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/strapi/src/api/ad/routes/00-ad-custom.ts

key-decisions:
  - "Use as any cast on entityService.count filters — matches existing me() pattern, avoids fighting Strapi's strict generic types"
  - "Route /ads/me/counts placed before /ads/me in 00-ad-custom.ts — Strapi matches routes top-to-bottom so specific paths must precede parameterless ones"

patterns-established:
  - "useAsyncData-only pattern: never pair bare await store calls with useAsyncData in same page"
  - "Parallel counts endpoint: single meCounts handler replaces N sequential status calls"

requirements-completed:
  - PAGE-01
  - PAGE-02

# Metrics
duration: 3min
completed: 2026-03-06
---

# Phase 18 Plan 01: Page Double-Fetch Fixes Summary

**Fixed FAQ page double HTTP request (bare await + useAsyncData → single useAsyncData) and added GET /api/ads/me/counts returning all 5 status counts in one parallel Promise.all request**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-06T21:30:13Z
- **Completed:** 2026-03-06T21:33:15Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `preguntas-frecuentes.vue` now issues exactly 1 API call on load (SSR-integrated `useAsyncData` only — bare `await faqsStore.loadFaqs()` and `allFaqs` deduplication removed)
- New `GET /api/ads/me/counts` Strapi endpoint: runs 5 `entityService.count()` calls in parallel via `Promise.all`, returns `{ published, review, expired, rejected, banned }` in a single response
- Route `/ads/me/counts` registered before `/ads/me` in custom routes file to prevent Strapi route shadowing

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix preguntas-frecuentes.vue double fetch** - `2ed1f78` (fix)
2. **Task 2: Add GET /ads/me/counts Strapi endpoint** - `cfa4aee` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `apps/website/app/pages/preguntas-frecuentes.vue` — Removed bare `await faqsStore.loadFaqs()`, `faqsData`, and `allFaqs` deduplication; single `useAsyncData` remains; template and `$setStructuredData` updated to use `faqs.value`
- `apps/strapi/src/api/ad/controllers/ad.ts` — Added `meCounts` handler with auth guard and 5 parallel count queries
- `apps/strapi/src/api/ad/routes/00-ad-custom.ts` — Registered `/ads/me/counts` route before `/ads/me`

## Decisions Made

- **`as any` on entityService filters:** The existing `me()` handler builds filters through an intermediate `filterClause: any` variable to bypass Strapi's strict generic types. The new `meCounts` handler uses `as any` casts for the same reason — fighting these types adds noise without benefit since the runtime behavior is correct.
- **Route ordering:** `/ads/me/counts` must come before `/ads/me` in 00-ad-custom.ts. Strapi evaluates custom routes top-to-bottom; without this ordering the more-specific path would be shadowed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added `as any` casts to entityService.count filters**
- **Found during:** Task 2 (Add meCounts handler)
- **Issue:** TypeScript strict generics on `entityService.count()` rejected numeric `userId` and `remaining_days: 0` values as incompatible with the inferred filter type, producing 5 TS2559/TS2353 errors that would block compilation
- **Fix:** Added `} as any` cast to each `filters` object — mirrors the pattern used throughout the existing controller
- **Files modified:** `apps/strapi/src/api/ad/controllers/ad.ts`
- **Verification:** `npx tsc --noEmit --project apps/strapi/tsconfig.json` — zero errors
- **Committed in:** `cfa4aee` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Fix was necessary for TypeScript compilation. No scope creep — identical pattern already used in `me()` handler.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 01 complete — the `/api/ads/me/counts` endpoint is ready for Plan 02 to consume
- Plan 02 (`mis-anuncios.vue` tab-count consolidation) can now replace its 5 separate status requests with a single call to the new endpoint

## Self-Check: PASSED

- ✅ `18-01-SUMMARY.md` exists on disk
- ✅ Commit `2ed1f78` (Task 1) exists in git log
- ✅ Commit `cfa4aee` (Task 2) exists in git log

---
*Phase: 18-page-double-fetch-fixes*
*Completed: 2026-03-06*
