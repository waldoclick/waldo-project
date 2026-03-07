---
phase: 19-store-cache-guards-component-cleanup
plan: 01
subsystem: api
tags: [pinia, cache, stores, nuxt, typescript]

# Dependency graph
requires:
  - phase: 18-page-double-fetch-fixes
    provides: patterns for eliminating redundant HTTP calls on navigation
provides:
  - "30-minute timestamp-based cache guard in packs.store.ts loadPacks()"
  - "30-minute timestamp-based cache guard in conditions.store.ts loadConditions()"
  - "30-minute timestamp-based cache guard in regions.store.ts loadRegions()"
  - "FormCreateThree.vue no longer calls loadCommunes() on mount"
affects:
  - any phase adding new list-loading stores (follow same cache guard pattern)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Options API cache guard: state.lastFetch + length check before HTTP fetch"
    - "Store persist with localStorage ensures cache survives page refresh"

key-files:
  created: []
  modified:
    - apps/website/app/stores/packs.store.ts
    - apps/website/app/stores/conditions.store.ts
    - apps/website/app/stores/regions.store.ts
    - apps/website/app/types/condition.d.ts
    - apps/website/app/types/region.d.ts
    - apps/website/app/components/FormCreateThree.vue

key-decisions:
  - "Cache duration set to 30 min (1800000 ms) — consistent with categories.store.ts DEFAULT_CACHE_MINUTES"
  - "Guard uses array-length + timestamp (not timestamp-only) — prevents false cache hit on empty state"
  - "packs.store.ts gained persist with localStorage (was missing) — aligns with conditions/regions stores"
  - "FormCreateThree.vue retains communesStore reference — still needed for listCommunes computed"

patterns-established:
  - "Options API cache guard: add lastFetch: 0 to state(), guard at top of load action, set after fetch"

requirements-completed: [STORE-01, STORE-02, STORE-03, COMP-01]

# Metrics
duration: 2min
completed: 2026-03-06
---

# Phase 19 Plan 01: Store Cache Guards & Component Cleanup Summary

**Timestamp-based cache guards (30 min TTL) added to packs, conditions, and regions stores; redundant `loadCommunes()` removed from FormCreateThree.vue**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T21:57:21Z
- **Completed:** 2026-03-06T21:59:36Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- All 3 list-loading stores (packs, conditions, regions) now skip HTTP fetch when data is already in memory and cache age < 30 min
- `packs.store.ts` gained `persist` with localStorage — aligns with conditions/regions stores so packs survive page refresh
- `FormCreateThree.vue` no longer duplicates the commune fetch that `communes.client.ts` plugin already runs on app init
- `ConditionState` and `RegionState` typed interfaces updated with `lastFetch: number` to satisfy TypeScript

## Task Commits

Each task was committed atomically:

1. **Task 1: Add cache guards to packs, conditions, and regions stores** - `20e7279` (feat)
2. **Task 2: Remove redundant loadCommunes() from FormCreateThree.vue onMounted** - `881b9a3` (feat)

**Plan metadata:** *(docs commit follows)*

## Files Created/Modified
- `apps/website/app/stores/packs.store.ts` - Added `lastFetch: 0` to state, cache guard in `loadPacks()`, `persist` with localStorage
- `apps/website/app/stores/conditions.store.ts` - Added `lastFetch: 0` to state, cache guard in `loadConditions()`
- `apps/website/app/stores/regions.store.ts` - Added `lastFetch: 0` to state, cache guard in `loadRegions()`
- `apps/website/app/types/condition.d.ts` - Added `lastFetch: number` to `ConditionState` interface
- `apps/website/app/types/region.d.ts` - Added `lastFetch: number` to `RegionState` interface
- `apps/website/app/components/FormCreateThree.vue` - Removed `communesStore.loadCommunes()` from `onMounted`

## Decisions Made
- Cache duration is 30 min (1800000 ms) — matches `categories.store.ts` DEFAULT_CACHE_MINUTES for consistency
- Guard uses array-length + timestamp check rather than timestamp-only — prevents false cache hit when store is empty but `lastFetch` was set
- Added `persist` to `packs.store.ts` — the plan identified this was missing; without it, the cache guard would be useless on page refresh since packs would always be empty

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — the TypeScript `Cannot find type definition file for '@nuxt/types'` error in typecheck output is a pre-existing environment issue unrelated to these changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Store cache guards complete for all reference data stores (packs, conditions, regions)
- Pattern established: future list-loading stores should follow the same `lastFetch` + array-length guard
- Phase 19 has 1 plan — this plan is the only plan in the phase

---
*Phase: 19-store-cache-guards-component-cleanup*
*Completed: 2026-03-06*

## Self-Check: PASSED

- FOUND: apps/website/app/stores/packs.store.ts ✓
- FOUND: apps/website/app/stores/conditions.store.ts ✓
- FOUND: apps/website/app/stores/regions.store.ts ✓
- FOUND: apps/website/app/components/FormCreateThree.vue ✓
- FOUND: .planning/phases/19-store-cache-guards-component-cleanup/19-01-SUMMARY.md ✓
- FOUND commit 20e7279 (Task 1: cache guards) ✓
- FOUND commit 881b9a3 (Task 2: remove loadCommunes) ✓
