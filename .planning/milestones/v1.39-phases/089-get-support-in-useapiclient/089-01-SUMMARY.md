---
phase: 089-get-support-in-useapiclient
plan: "01"
subsystem: testing
tags: [vitest, useApiClient, recaptcha, composable, tdd]

# Dependency graph
requires:
  - phase: 088-migrate-mutations-to-useapiclient
    provides: useApiClient composable with GET passthrough at line 50
provides:
  - GET-with-params test case confirming options passthrough and no reCAPTCHA injection in useApiClient.test.ts
affects:
  - 090-migrate-get-callers

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vi.hoisted() + vi.mock('#imports') pattern for Nuxt composable mocking in Vitest"
    - "objectContaining() assertion to verify params passthrough without requiring exact call signature"

key-files:
  created: []
  modified:
    - apps/website/app/composables/useApiClient.test.ts

key-decisions:
  - "No source changes needed — useApiClient.ts line 50 already correctly passes GET options through to useStrapiClient unchanged"
  - "Pre-existing test suite failures (17 tests in 6 files) are out of scope and pre-date this plan — confirmed by baseline check on HEAD"

patterns-established:
  - "GET callers use client(url, { method: 'GET', params: {...} }) — response is raw body, no .data wrapper"

requirements-completed:
  - API-05

# Metrics
duration: 1min
completed: 2026-03-15
---

# Phase 089 Plan 01: GET Support in useApiClient Summary

**Added missing GET-with-params test to useApiClient.test.ts confirming query-params passthrough and zero reCAPTCHA injection on GET requests**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-15T14:35:12Z
- **Completed:** 2026-03-15T14:36:31Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- New test `"passes params through on GET without modification"` added — total suite is now 9 tests (was 8)
- Confirmed `useApiClient.ts` line 50 GET passthrough is already correct; no source changes needed
- TypeScript typecheck exits 0 with zero errors
- Phase 090 GET migration can proceed with explicit documented calling convention

## Task Commits

Each task was committed atomically:

1. **Task 1: Add GET-with-params test to useApiClient.test.ts** - `44f0fcc` (test)
2. **Task 2: Phase gate — full Vitest suite + typecheck** - no separate commit (verification only, no file changes)

**Plan metadata:** _(see docs commit below)_

## Files Created/Modified
- `apps/website/app/composables/useApiClient.test.ts` — Added `"passes params through on GET without modification"` it() block after existing "defaults to GET when method is not specified" test

## Decisions Made
- No source code changes needed — the implementation was already correct at line 50
- Pre-existing suite failures (17 tests across 6 unrelated files) confirmed pre-date this plan and are out of scope per deviation rules

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Pre-existing test failures (out of scope):** The full `yarn workspace waldo-website vitest run` command exits non-zero due to 17 pre-existing failures in 6 unrelated files (`useOrderById.test.ts`, `FormRegister.test.ts`, `FormLogin.website.test.ts`, `FormLogin.spec.ts`, `ResumeOrder.test.ts`, `recaptcha-proxy.test.ts`). All confirmed pre-existing on HEAD before this plan's changes. Zero regressions introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- GET-with-params test coverage confirmed green — Phase 090 GET migration can proceed safely
- Documented calling convention: `client(url, { method: 'GET', params: {...} })` returns raw body (no `.data` wrapper)
- No blockers

---
*Phase: 089-get-support-in-useapiclient*
*Completed: 2026-03-15*
