---
phase: 098-frontend-rewrite-logout-fix
plan: "01"
subsystem: testing
tags: [vitest, tdd, red, google-one-tap, gis, logout, composables, plugins]

# Dependency graph
requires:
  - phase: 097-strapi-one-tap-endpoint
    provides: GoogleOneTapService, auth-one-tap endpoint, google_sub field
provides:
  - "RED test scaffolds for all Phase 098 behavioral changes"
  - "useLogout.test.ts GTAP-12 test (disableAutoSelect ordering)"
  - "useGoogleOneTap.test.ts with promptIfEligible() contract (3 behavioral tests)"
  - "tests/plugins/google-one-tap.test.ts with GIS callback integration tests"
affects:
  - 098-02-PLAN
  - 098-03-PLAN

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vi.hoisted() for mock variables referenced in vi.mock() factory — prevents undefined at hoisting time"
    - "vi.resetModules() + vi.clearAllMocks() in top-level beforeEach for module isolation"
    - "vi.stubGlobal('google', {...}) in nested describe beforeEach for GIS mock isolation"
    - "dynamic import inside each it() block to pick up fresh module state after vi.resetModules()"

key-files:
  created:
    - apps/website/app/composables/useGoogleOneTap.test.ts
    - apps/website/tests/plugins/google-one-tap.test.ts
  modified:
    - apps/website/app/composables/useLogout.test.ts

key-decisions:
  - "RED failures are behavioral (TypeError/assertion errors), not TS compile errors — ensures tests can go GREEN once implementation exists"
  - "Plugin test uses file-level module resolution error (Cannot find module) as RED — valid because plugin file doesn't exist yet"
  - "vi.hoisted() used in useGoogleOneTap.test.ts and plugin test for mock refs in vi.mock() factory, matching 087-01 pattern"
  - "Top-level beforeEach with vi.resetModules() added to useLogout.test.ts to ensure GTAP-12 window.google stub is picked up by dynamic import"

patterns-established:
  - "Plugin test pattern: vi.hoisted for mocks, dynamic import inside loadPlugin(), await new Promise(r => setTimeout(r, 0)) to settle ticks"
  - "Nested describe for isolated GTAP tests that require additional global stubs (window.google)"

requirements-completed: [GTAP-07, GTAP-09, GTAP-10, GTAP-11, GTAP-12]

# Metrics
duration: 27min
completed: 2026-03-19
---

# Phase 098 Plan 01: Frontend Rewrite + Logout Fix (RED Scaffolds) Summary

**TDD RED scaffolds for Google One Tap frontend rewrite: 3 test files covering disableAutoSelect() ordering (GTAP-12), promptIfEligible() API contract (GTAP-07/09/10), and GIS callback integration (GTAP-11)**

## Performance

- **Duration:** 27 min
- **Started:** 2026-03-19T03:54:00Z
- **Completed:** 2026-03-19T04:21:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Extended `useLogout.test.ts` with GTAP-12 RED test asserting `disableAutoSelect()` fires before `strapiLogout()` (invocationCallOrder assertion)
- Created `useGoogleOneTap.test.ts` with 3 behavioral tests for the new `promptIfEligible()` API contract (auth guard, route guard, happy path)
- Created `tests/plugins/google-one-tap.test.ts` with 3 integration tests for GIS callback: POST to Strapi, `setToken(jwt)`, `fetchUser()` ordering
- Zero regressions: 57 previously passing tests still pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend useLogout.test.ts with GTAP-12 RED test** - `06878ae` (test)
2. **Task 2: Create useGoogleOneTap.test.ts (RED scaffold)** - `9f57561` (test)
3. **Task 3: Create tests/plugins/google-one-tap.test.ts (RED scaffold)** - `f168004` (test)

**Plan metadata:** `(docs commit follows)`

## Files Created/Modified

- `apps/website/app/composables/useLogout.test.ts` — Added `mockDisableAutoSelect`, top-level `beforeEach(vi.resetModules)`, and GTAP-12 nested `describe` with GIS stub
- `apps/website/app/composables/useGoogleOneTap.test.ts` — New file with 6 tests (1 auth guard + 4 route guards via `it.each` + 1 happy path) for `promptIfEligible()` API
- `apps/website/tests/plugins/google-one-tap.test.ts` — New file with 3 tests for GIS callback: API call, `setToken`, `fetchUser` ordering

## Decisions Made

- Used `vi.hoisted()` for mock references inside `vi.mock()` factories in both new test files (matches established 087-01 pattern from STATE.md)
- Added `vi.resetModules()` at top-level in `useLogout.test.ts` — ensures the GTAP-12 test's `vi.stubGlobal("google")` is seen when the module is re-imported
- Nested `describe` for GTAP-12 test in `useLogout.test.ts` — isolates the window.google stub to only that test, preventing cross-contamination with the 4 existing tests
- Plugin test confirms RED via `Cannot find module` (file-level error) — accepted RED failure mode per plan spec

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 3 RED test files committed; behavioral contracts are locked
- Plan 098-02 can now implement `useLogout.ts` changes (add `disableAutoSelect()` call before `strapiLogout()`) to turn GTAP-12 GREEN
- Plan 098-03 can rewrite `useGoogleOneTap.ts` to export `promptIfEligible()` to turn GTAP-07/09/10 GREEN
- Plan 098-04 can create `apps/website/app/plugins/google-one-tap.client.ts` to turn GTAP-11 GREEN

---
*Phase: 098-frontend-rewrite-logout-fix*
*Completed: 2026-03-19*

## Self-Check: PASSED

- ✅ `apps/website/app/composables/useLogout.test.ts` — exists
- ✅ `apps/website/app/composables/useGoogleOneTap.test.ts` — exists
- ✅ `apps/website/tests/plugins/google-one-tap.test.ts` — exists
- ✅ `098-01-SUMMARY.md` — exists
- ✅ Commit `06878ae` — found (Task 1)
- ✅ Commit `9f57561` — found (Task 2)
- ✅ Commit `f168004` — found (Task 3)
