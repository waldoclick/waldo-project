---
phase: 08-transactional-components
plan: 01
subsystem: ui
tags: [vue, nuxt, typescript, strapi-sdk-v5, double-fetch, watch]

# Dependency graph
requires:
  - phase: 07-catalog-components
    provides: "v1.1 canonical watch-only pattern established — onMounted removed from six catalog components"
provides:
  - "Double-fetch eliminated from ReservationsFree, ReservationsUsed, FeaturedFree, FeaturedUsed"
  - "All four transactional components use watch({ immediate: true }) as sole data-loading trigger"
  - "searchParams typed as Record<string, unknown> in all four components (Strapi SDK v5 pattern)"
affects: [future-transactional-components, dfx-requirements]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "watch({ immediate: true }) as sole data-loading trigger — onMounted never paired"
    - "Strapi SDK v5 cast: searchParams as Record<string, unknown>, nested mutation cast to Record<string, unknown>"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/ReservationsFree.vue
    - apps/dashboard/app/components/ReservationsUsed.vue
    - apps/dashboard/app/components/FeaturedFree.vue
    - apps/dashboard/app/components/FeaturedUsed.vue

key-decisions:
  - "Purely subtractive change: no new code added, onMounted blocks deleted, watch({ immediate: true }) retained as sole trigger"
  - "Nested Record<string, unknown> mutation requires explicit cast: (searchParams.filters as Record<string, unknown>).$or = [...] to satisfy vue-tsc typeCheck"
  - "ReservationsUsed.vue secondary watch on totalPages.value preserved — enforces client-side page-bounds for in-memory pagination"

patterns-established:
  - "Double-fetch fix pattern v1.1: delete onMounted import + block, verify watch({ immediate: true }) remains, fix searchParams type"
  - "vue-tsc typeCheck with Record<string, unknown>: cast nested property access to Record<string, unknown> before mutation"

requirements-completed: [DFX-07, DFX-08, DFX-09, DFX-10]

# Metrics
duration: 11min
completed: 2026-03-05
---

# Phase 8 Plan 01: Transactional Components Double-Fetch Cleanup Summary

**onMounted removed from all four transactional components (ReservationsFree, ReservationsUsed, FeaturedFree, FeaturedUsed); watch({ immediate: true }) is now sole data-loading trigger; searchParams typed as Record<string, unknown> with nested cast pattern for vue-tsc compliance**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-05T22:50:53Z
- **Completed:** 2026-03-05T23:01:53Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Eliminated double-fetch bug across all four transactional components — each component now fires exactly one network request on mount
- Applied the v1.1 canonical watch-only pattern (established in AdsTable.vue, applied in Phase 7 to catalog components) to the final four affected components
- Fixed `searchParams: any` to `Record<string, unknown>` in all four files, satisfying Strapi SDK v5 cast pattern and vue-tsc typeCheck
- Build exits 0 with no TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove onMounted from all four transactional components and fix searchParams types** - `8e8b967` (fix)
2. **Task 2: Run dashboard build + fix TS18046 type errors** - `1753d6b` (fix)

## Files Created/Modified

- `apps/dashboard/app/components/ReservationsFree.vue` - Removed onMounted import and block; fixed searchParams type; cast nested filters mutation
- `apps/dashboard/app/components/ReservationsUsed.vue` - Removed onMounted import and block; fixed searchParams type; secondary watch on totalPages.value preserved
- `apps/dashboard/app/components/FeaturedFree.vue` - Removed onMounted import and block; fixed searchParams type; cast nested filters mutation
- `apps/dashboard/app/components/FeaturedUsed.vue` - Removed onMounted import and block; fixed searchParams type; cast nested filters mutation

## Decisions Made

- Applied the same purely subtractive approach as Phase 7 — no new code, no guard state, no restructuring
- Retained ReservationsUsed.vue's secondary watch on `totalPages.value` (client-side page-bounds enforcement for in-memory pagination)
- Cast `(searchParams.filters as Record<string, unknown>).$or` pattern to satisfy vue-tsc strict narrowing on `Record<string, unknown>` values

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TS18046 type errors from Record<string, unknown> narrowing**
- **Found during:** Task 2 (yarn build typeCheck)
- **Issue:** Changing `searchParams: any` to `Record<string, unknown>` made `searchParams.filters` typed as `unknown`, so accessing `searchParams.filters.$or` failed with TS18046 in three components (ReservationsFree, FeaturedFree, FeaturedUsed)
- **Fix:** Cast the `filters` property when assigning the nested `$or` key: `(searchParams.filters as Record<string, unknown>).$or = [...]`
- **Files modified:** `apps/dashboard/app/components/ReservationsFree.vue`, `apps/dashboard/app/components/FeaturedFree.vue`, `apps/dashboard/app/components/FeaturedUsed.vue`
- **Verification:** `yarn build` exits 0 with no TypeScript errors after fix
- **Committed in:** `1753d6b`

---

**Total deviations:** 1 auto-fixed (Rule 1 — type error introduced by the planned `any` → `Record<string, unknown>` change)
**Impact on plan:** Fix was necessary for typeCheck compliance. No scope creep — same four files, subtractive intent preserved.

## Issues Encountered

The `Record<string, unknown>` type annotation for `searchParams` is correct per the Strapi SDK v5 pattern, but it requires an explicit cast when mutating nested sub-properties after initialization. This is a known TypeScript constraint — `unknown` values cannot be indexed without a cast. The fix (`(searchParams.filters as Record<string, unknown>).$or = [...]`) is the minimal correct approach and is consistent with the Strapi SDK v5 cast pattern documented in PROJECT.md.

Note: `ReservationsUsed.vue` was not affected because it assigns the entire `searchParams.filters` object (not a sub-key), so the compiler inferred the correct type for that assignment.

## User Setup Required

None - no external service configuration required.

## Self-Check: PASSED

All four modified files exist on disk. Both task commits (8e8b967, 1753d6b) verified in git log.

## Next Phase Readiness

- Double-fetch bug fully eliminated across all transactional and catalog components (v1.2 milestone complete)
- All components follow the canonical watch-only pattern — onMounted is no longer used for data loading anywhere in the dashboard
- Requirements DFX-07 through DFX-10 satisfied

---
*Phase: 08-transactional-components*
*Completed: 2026-03-05*
