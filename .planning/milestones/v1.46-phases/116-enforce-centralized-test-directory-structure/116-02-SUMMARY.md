---
phase: 116-enforce-centralized-test-directory-structure
plan: "02"
subsystem: testing
tags: [jest, typescript, strapi, test-structure, directory-convention]

# Dependency graph
requires:
  - phase: 116-enforce-centralized-test-directory-structure
    provides: File moves of __tests__/ renames and flat test files (done in 116-01 commit)
provides:
  - All Strapi test files under tests/ subdirectories with corrected import paths
  - Jest config updated to match tests/ instead of __tests__/
  - Zero __tests__/ directories in apps/strapi/src/
  - Zero flat co-located *.test.ts files in apps/strapi/src/
affects: [future-strapi-tests, codacy-analysis, 116-phase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "All Strapi test files live in tests/ subdirectory relative to the module they test"
    - "Flat co-located test imports use ../ prefix to reference sibling source files"
    - "jest.config.js testMatch uses tests/ pattern instead of __tests__/"

key-files:
  created: []
  modified:
    - apps/strapi/jest.config.js
    - apps/strapi/src/api/auth-one-tap/controllers/tests/auth-one-tap.test.ts
    - apps/strapi/src/api/payment/controllers/tests/payment.test.ts
    - apps/strapi/src/cron/tests/subscription-charge.cron.test.ts
    - apps/strapi/src/extensions/users-permissions/controllers/tests/authController.test.ts
    - apps/strapi/src/extensions/users-permissions/controllers/tests/userController.test.ts
    - apps/strapi/src/middlewares/tests/protect-user-fields.test.ts
    - apps/strapi/src/services/google-one-tap/tests/google-one-tap.service.test.ts
    - apps/strapi/src/services/indicador/tests/indicador.test.ts
    - apps/strapi/src/services/tavily/tests/tavily.test.ts
    - apps/strapi/src/services/weather/tests/weather.test.ts
    - apps/strapi/src/services/zoho/tests/http-client.test.ts
    - apps/strapi/src/services/zoho/tests/zoho.test.ts

key-decisions:
  - "jest.config.js testMatch updated from __tests__/**/*.ts to tests/**/*.ts to reflect renamed convention"
  - "Import paths in moved flat co-located files updated from ./ to ../ since tests now live one level deeper"
  - "Pre-existing test failures (ad.approve.zoho TS error, authController SMTP test, payment pro_pending_invoice) are out of scope — not introduced by this plan"

patterns-established:
  - "tests/ subdirectory convention: all Strapi test files must live in a tests/ subdir, never flat co-located or in __tests__/"
  - "Relative import depth: tests/*.test.ts files use ../file for sibling source, ../../ for parent directory"

requirements-completed:
  - STRUCT-116-STRAPI

# Metrics
duration: 25min
completed: 2026-04-06
---

# Phase 116 Plan 02: Centralize Strapi Test Directory Structure Summary

**All 27 Strapi test files moved to tests/ subdirectories with corrected relative imports — zero __tests__/ dirs and zero flat co-located tests remain**

## Performance

- **Duration:** 25 min
- **Started:** 2026-04-06T16:05:00Z
- **Completed:** 2026-04-06T16:30:44Z
- **Tasks:** 1
- **Files modified:** 13

## Accomplishments
- Updated jest.config.js testMatch pattern from `**/__tests__/**/*.ts` to `**/tests/**/*.ts`
- Fixed all relative import paths in 12 moved flat co-located test files (./x → ../x and deeper paths adjusted proportionally)
- Verified 27 test files discoverable by Jest under tests/ subdirectories
- No new test failures introduced — pre-existing failures unchanged

## Task Commits

1. **Task 1: Rename __tests__ and move flat co-located tests** - `b63c395f` (feat)

**Plan metadata:** (pending final docs commit)

## Files Created/Modified
- `apps/strapi/jest.config.js` - Updated testMatch from __tests__ to tests/ pattern
- `apps/strapi/src/api/auth-one-tap/controllers/tests/auth-one-tap.test.ts` - Fixed imports: ./auth-one-tap → ../auth-one-tap, ../../../services → ../../../../services
- `apps/strapi/src/api/payment/controllers/tests/payment.test.ts` - Fixed all relative imports one depth deeper (../x → ../../x, ../../x → ../../../x)
- `apps/strapi/src/cron/tests/subscription-charge.cron.test.ts` - Fixed imports: ./subscription-charge.cron → ../subscription-charge.cron, ../x → ../../x
- `apps/strapi/src/extensions/users-permissions/controllers/tests/authController.test.ts` - Fixed: ./authController → ../authController, ../../../services → ../../../../services
- `apps/strapi/src/extensions/users-permissions/controllers/tests/userController.test.ts` - Fixed: ./userController → ../userController
- `apps/strapi/src/middlewares/tests/protect-user-fields.test.ts` - Fixed: ./protect-user-fields → ../protect-user-fields
- `apps/strapi/src/services/google-one-tap/tests/google-one-tap.service.test.ts` - Fixed: ./google-one-tap.service → ../google-one-tap.service
- `apps/strapi/src/services/indicador/tests/indicador.test.ts` - Fixed: ./indicador.service, ./http-client, ./interfaces → ../x
- `apps/strapi/src/services/tavily/tests/tavily.test.ts` - Fixed: ./tavily.service → ../tavily.service
- `apps/strapi/src/services/weather/tests/weather.test.ts` - Fixed: ./index → ../index, dotenv __dirname path depth adjusted
- `apps/strapi/src/services/zoho/tests/http-client.test.ts` - Fixed: ./http-client, ./interfaces → ../x
- `apps/strapi/src/services/zoho/tests/zoho.test.ts` - Fixed: ./http-client, ./zoho.service, ./interfaces → ../x

## Decisions Made
- Updated jest.config.js `testMatch` to replace `**/__tests__/**/*.ts` with `**/tests/**/*.ts` since no `__tests__/` directories remain. The second pattern `**/?(*.)+(spec|test).ts` already discovers all test files by extension, making the first pattern only meaningful for organizational clarity.
- The `__dirname`-based dotenv path in `weather.test.ts` was adjusted from `../../../.env` to `../../../../.env` since the test file moved one directory deeper.

## Deviations from Plan

None - plan executed exactly as written. The file moves were already completed in the prior 116-01 commit (`6edfe808`), so this plan only needed to handle the import path updates and jest.config.js change.

## Issues Encountered
- Discovered the file moves (Part A: __tests__ renames, Part B: flat file moves) were already performed in the 116-01 commit `6edfe808 feat(116-01): move website test files to centralized tests/ directory`. The git mv commands ran on already-moved files (no-ops), and the import path updates were the actual work remaining.
- Pre-existing test failures not introduced by this plan: `ad.approve.zoho.test.ts` (TS2740 type error), `authController.test.ts` (3 SMTP/auth failures), `payment.test.ts` (1 pro_pending_invoice assertion failure), `indicador.test.ts` (TS2339 property error).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Strapi tests are now in a consistent `tests/` subdirectory structure
- jest.config.js reflects the new convention
- Phase 116 can be marked complete

## Self-Check: PASSED
- SUMMARY.md: FOUND
- Commit b63c395f: FOUND
- Zero __tests__/ directories: CONFIRMED
- Zero flat co-located *.test.ts files: CONFIRMED
- 27 test files under tests/ subdirectories: CONFIRMED

---
*Phase: 116-enforce-centralized-test-directory-structure*
*Completed: 2026-04-06*
