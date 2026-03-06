---
phase: 18-page-double-fetch-fixes
plan: 02
subsystem: ui
tags: [nuxt, vue, pinia, useAsyncData, strapi, typescript]

# Dependency graph
requires:
  - phase: 18-page-double-fetch-fixes
    provides: GET /api/ads/me/counts endpoint returning 5 status counts in one request (Plan 01)
provides:
  - loadUserAdCounts() Pinia action in user.store.ts calling GET /api/ads/me/counts
  - mis-anuncios.vue loads with exactly 2 HTTP requests on mount (counts + ads)
  - Tab/page changes call only loadAds() — counts are never re-fetched on filter change
affects:
  - Any future page that needs per-status ad counts (can reuse loadUserAdCounts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single-endpoint counts: one loadUserAdCounts() call populates all 5 tab counts vs. N parallel status requests"
    - "useAsyncData-only data loading: counts + ads loaded inside single useAsyncData callback on mount"

key-files:
  created: []
  modified:
    - apps/website/app/stores/user.store.ts
    - apps/website/app/pages/cuenta/mis-anuncios.vue

key-decisions:
  - "Tab counts loaded once on mount from /ads/me/counts — not refreshed on filter/page change (counts are totals, not filter-dependent)"
  - "tabToUpdate block removed from loadAds() — pagination total no longer overwrites tab count on filter change"

patterns-established:
  - "loadUserAdCounts() store action: calls strapi.find('ads/me/counts') with all-zeros fallback on error"

requirements-completed:
  - PAGE-02
  - PAGE-03

# Metrics
duration: 2min
completed: 2026-03-06
---

# Phase 18 Plan 02: Mis-Anuncios Tab-Count Consolidation Summary

**Replaced 5-parallel-request loadTabCounts() with single loadUserAdCounts() call — mis-anuncios.vue now makes exactly 2 HTTP requests on load (GET /ads/me/counts + GET /ads/me)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T21:35:41Z
- **Completed:** 2026-03-06T21:38:24Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- New `loadUserAdCounts()` action in `user.store.ts` calls `GET /api/ads/me/counts` and returns `{ published, review, expired, rejected, banned }` with all-zeros fallback
- `mis-anuncios.vue` refactored: `useAsyncData` calls `loadUserAdCounts()` once then `loadAds()` once (2 total requests instead of 6)
- All 5 tab counts populated upfront from single counts response via `tabs.forEach`
- `loadTabCounts()` function eliminated; `watch([currentFilter, currentPage])` unchanged — still calls only `loadAds()`
- Removed stale `tabToUpdate` block from `loadAds()` — tab counts no longer overwritten on filter/page change

## Task Commits

Each task was committed atomically:

1. **Task 1: Add loadUserAdCounts action to user.store.ts** - `9d9709d` (feat)
2. **Task 2: Refactor mis-anuncios.vue to use new counts endpoint** - `bf3283d` (fix)

**Plan metadata:** `(docs commit — see below)`

## Files Created/Modified

- `apps/website/app/stores/user.store.ts` — Added `loadUserAdCounts()` async action calling `strapi.find("ads/me/counts", {})`, exported from store return statement
- `apps/website/app/pages/cuenta/mis-anuncios.vue` — Removed `loadTabCounts()` function; updated `useAsyncData` to call `loadUserAdCounts()` + populate tabs; removed `tabToUpdate` block from `loadAds()`; removed unused `onMounted` import

## Decisions Made

- **Tab counts loaded once, not per-filter:** Counts represent totals across all ads by status — they don't change based on which tab is active. Loading once on mount is correct; refreshing on tab/page change would be wrong semantics and wasteful.
- **tabToUpdate removed from loadAds():** Previously `loadAds()` was overwriting the active tab's count with `pagination.total` on every filter/page change. This was incorrect once counts come from a dedicated endpoint — the count for a status is the total for that status, not the current page's total.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `onMounted` import**
- **Found during:** Task 2 (Refactor mis-anuncios.vue)
- **Issue:** After removing `loadTabCounts` and the direct `loadAds()` call, `onMounted` was imported but never used — would produce ESLint warning
- **Fix:** Removed `onMounted` from the `import { ref, onMounted, watch }` statement
- **Files modified:** `apps/website/app/pages/cuenta/mis-anuncios.vue`
- **Verification:** ESLint passes in pre-commit hook (lint-staged ran without errors)
- **Committed in:** `bf3283d` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Cleanup-only fix — removed dead import that would have triggered a linter error. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 18 complete — both plans executed
- mis-anuncios.vue now makes exactly 2 HTTP requests on load (down from 6)
- The /api/ads/me/counts endpoint and loadUserAdCounts() store action are available for any future page requiring per-status counts
- Ready for phase transition

## Self-Check: PASSED

- ✅ `18-02-SUMMARY.md` exists on disk
- ✅ Commit `9d9709d` (Task 1) exists in git log
- ✅ Commit `bf3283d` (Task 2) exists in git log
- ✅ `grep -c "loadTabCounts" mis-anuncios.vue` → 0
- ✅ `loadUserAdCounts` defined and exported in user.store.ts
- ✅ `loadUserAdCounts` called inside useAsyncData in mis-anuncios.vue

---
*Phase: 18-page-double-fetch-fixes*
*Completed: 2026-03-06*
