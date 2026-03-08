---
phase: 52-ad-draft-decoupling
plan: 02
subsystem: api
tags: [strapi, typescript, draft, ad-status, tdd]

# Dependency graph
requires:
  - phase: 52-ad-draft-decoupling
    provides: "Phase 52 context — ad draft field migration"
provides:
  - "Updated computeAdStatus() returning 'draft' as first check"
  - "AdStatus union type with 'draft', without 'abandoned'"
  - "draftAds() service method with draft: true filter"
  - "drafts() controller handler calling draftAds()"
  - "GET /ads/drafts route replacing /ads/abandoneds"
affects: [52-ad-draft-decoupling, dashboard-borradores]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "adServiceFactory({ strapi }) pattern for TDD service testing (mirrors ad.approve.zoho.test.ts)"
    - "draft field as authoritative source of truth for draft state"

key-files:
  created:
    - apps/strapi/src/api/ad/services/__tests__/ad.compute-status.test.ts
  modified:
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/strapi/src/api/ad/routes/00-ad-custom.ts

key-decisions:
  - "draft field is the authoritative source of truth for draft state — replaced complex abandoned conditions with single field check"
  - "abandoned branch completely removed from computeAdStatus() — ads that would have been 'abandoned' now have draft: true after migration"

patterns-established:
  - "draft status checked FIRST in computeAdStatus() — before rejected, banned, active checks"

requirements-completed: [BACK-03, BACK-04, BACK-05]

# Metrics
duration: 5min
completed: 2026-03-08
---

# Phase 52 Plan 02: Ad Draft Decoupling Summary

**Replaced `abandoned` with `draft` in Strapi ad service/controller/route — `computeAdStatus()` now returns `"draft"` as first check via `draft: true` field**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-08T18:22:57Z
- **Completed:** 2026-03-08T18:28:30Z
- **Tasks:** 2 (TDD: RED→GREEN + standard auto)
- **Files modified:** 4 (3 source + 1 test)

## Accomplishments
- Replaced `"abandoned"` with `"draft"` in the `AdStatus` union type
- Added `draft: true` check as the FIRST condition in `computeAdStatus()` — before rejected, banned, active
- Renamed `abandonedAds()` to `draftAds()` with simplified `draft: { $eq: true }` filter
- Renamed `abandoneds()` controller to `drafts()`, wired to `draftAds()`
- Replaced `GET /ads/abandoneds` with `GET /ads/drafts` in route file
- 6 TDD tests written and passing (RED→GREEN cycle)
- Zero TypeScript errors across entire Strapi project

## Task Commits

Each task was committed atomically:

1. **RED: Failing tests for draft status** - `2b573f0` (test)
2. **GREEN: Task 1 — AdStatus type + computeAdStatus + draftAds** - `baab8d5` (feat)
3. **Task 2: Controller rename + route update** - `403e30c` (feat)

_Note: TDD task had RED+GREEN commits (2 commits for Task 1). No REFACTOR needed._

## Files Created/Modified
- `apps/strapi/src/api/ad/services/ad.ts` — AdStatus type updated, computeAdStatus with draft-first check, abandonedAds→draftAds
- `apps/strapi/src/api/ad/controllers/ad.ts` — abandoneds()→drafts() handler, .draftAds() service call
- `apps/strapi/src/api/ad/routes/00-ad-custom.ts` — /ads/abandoneds→/ads/drafts, ad.abandoneds→ad.drafts
- `apps/strapi/src/api/ad/services/__tests__/ad.compute-status.test.ts` — 6 TDD tests for new draft behavior

## Decisions Made
- **draft field is single source of truth**: Removed complex multi-condition `abandoned` branch (active=false, no reservation, is_paid, remaining_days>0) in favor of a single `draft === true` field check. Ads that would have been "abandoned" will have `draft: true` after migration (Plan 01).
- **First-check guarantee**: The draft check MUST be first in computeAdStatus() to ensure it wins over all other conditions, including `active: true`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `GET /api/ads/drafts` endpoint is ready to serve the dashboard "Borradores" section (Plan 04)
- All three files (service, controller, route) are updated and type-safe
- Existing tests (Zoho wiring) still pass — no regressions

---
*Phase: 52-ad-draft-decoupling*
*Completed: 2026-03-08*

## Self-Check: PASSED

- ✅ `apps/strapi/src/api/ad/services/__tests__/ad.compute-status.test.ts` — exists
- ✅ `apps/strapi/src/api/ad/services/ad.ts` — exists
- ✅ `apps/strapi/src/api/ad/controllers/ad.ts` — exists
- ✅ `apps/strapi/src/api/ad/routes/00-ad-custom.ts` — exists
- ✅ `.planning/phases/52-ad-draft-decoupling/52-02-SUMMARY.md` — exists
- ✅ Commit `2b573f0` — test(52-02): RED phase
- ✅ Commit `baab8d5` — feat(52-02): GREEN phase
- ✅ Commit `403e30c` — feat(52-02): Task 2
- ✅ Commit `e3b3266` — docs(52-02): metadata
