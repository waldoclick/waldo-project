---
phase: 097-strapi-one-tap-endpoint
plan: "01"
subsystem: api
tags: [jest, tdd, google-one-tap, google-auth-library, strapi, unit-tests]

# Dependency graph
requires: []
provides:
  - Failing unit tests for GoogleOneTapService.verifyCredential() — GTAP-03
  - Failing unit tests for GoogleOneTapService.findOrCreateUser() existing user — GTAP-04
  - Failing unit tests for GoogleOneTapService.findOrCreateUser() new user — GTAP-05
  - Failing unit test for auth-one-tap controller { jwt, user } response — GTAP-06
affects:
  - 097-02 (GoogleOneTapService implementation — must make these tests pass GREEN)
  - 097-03 (auth-one-tap controller implementation — must make GTAP-06 test pass GREEN)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD RED phase: test files import non-existent modules to guarantee failure"
    - "jest.mock() hoisted above imports to intercept google-auth-library"
    - "global strapi mock matching authController.test.ts pattern"

key-files:
  created:
    - apps/strapi/src/services/google-one-tap/google-one-tap.service.test.ts
    - apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts
  modified: []

key-decisions:
  - "Tests fail at TypeScript compile level (TS2307) not runtime — stricter RED than runtime import errors"
  - "auth-one-tap.test.ts mocks google-one-tap as '../../../services/google-one-tap' (index) not the service file — requires index.ts to export googleOneTapService singleton in plan 02"
  - "Controller test asserts ctx.body has no 'pendingToken' or 'email' keys — explicit 2-step bypass contract"

patterns-established:
  - "Wave 0 RED: create test file, run tests, confirm FAIL before any implementation"
  - "Strapi db.query mock uses contentType dispatch pattern (matching authController.test.ts)"

requirements-completed: [GTAP-03, GTAP-04, GTAP-05, GTAP-06]

# Metrics
duration: 2 min
completed: 2026-03-19
---

# Phase 097 Plan 01: Strapi One Tap Endpoint — Wave 0 RED Scaffolds Summary

**TDD RED phase: failing test scaffolds for GoogleOneTapService (GTAP-03/04/05) and auth-one-tap controller (GTAP-06) — both fail with TS2307 module-not-found confirming no implementation exists**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-19T03:05:10Z
- **Completed:** 2026-03-19T03:07:47Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `google-one-tap.service.test.ts` with 7 tests covering verifyCredential() (3 cases) and findOrCreateUser() (4 cases: sub-lookup hit, email fallback, no-duplicate guard, new user with provider:'google')
- Created `auth-one-tap.test.ts` with 4 tests covering the GTAP-06 bypass contract: `{ jwt, user }` response, 400 on missing credential, 401 on invalid credential, `jwt.issue({ id })` shape
- Both test suites fail in RED state with `TS2307: Cannot find module` — implementations not yet written

## Task Commits

Each task was committed atomically:

1. **Task 1: GoogleOneTapService test scaffold (RED)** - `06e4348` (test)
2. **Task 2: auth-one-tap controller test scaffold (RED)** - `f5aebf2` (test)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `apps/strapi/src/services/google-one-tap/google-one-tap.service.test.ts` — 231 lines, 7 failing unit tests for GTAP-03/04/05
- `apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.test.ts` — 139 lines, 4 failing unit tests for GTAP-06

## Decisions Made

- Tests fail at TypeScript compile level (TS2307) not runtime — stricter RED than runtime import errors; ts-jest catches missing modules at compile time
- `auth-one-tap.test.ts` mocks `'../../../services/google-one-tap'` (index export), not the service file directly — requires plan 02 to export `googleOneTapService` singleton from `index.ts`
- Controller test explicitly asserts `ctx.body` does NOT have `pendingToken` or `email` keys — makes the 2-step bypass contract executable

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both test scaffolds in place — plan 097-02 implements `GoogleOneTapService` to turn GTAP-03/04/05 GREEN
- Plan 097-03 implements `auth-one-tap` controller + `google-one-tap` index to turn GTAP-06 GREEN
- No blockers — RED state confirmed, implementation path clear

---
*Phase: 097-strapi-one-tap-endpoint*
*Completed: 2026-03-19*
