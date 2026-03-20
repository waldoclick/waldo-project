---
phase: 103-monthly-charging-cron
plan: 01
subsystem: payments
tags: [transbank, oneclick, strapi, cron, subscription]

# Dependency graph
requires:
  - phase: 102-oneclick-inscription
    provides: OneclickService with startInscription/finishInscription, buildOneclickUsername, transbank-sdk installed
provides:
  - subscription-payment content type schema with 12 attributes (charge tracking + retry fields)
  - OneclickService.authorizeCharge() method calling MallTransaction.authorize()
  - IOneclickAuthorizeResponse interface
  - ONECLICK_CHILD_COMMERCE_CODE and PRO_MONTHLY_PRICE env vars documented
  - subscription-charge registered in cron-runner CRON_NAME_MAP
affects:
  - 103-02 (cron service consumes authorizeCharge and subscription-payment content type)
  - 104-cancellation (reuses OneclickService.authorizeCharge pattern)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - MallTransaction instantiated per-call (not singleton) for testability
    - IOneclickAuthorizeResponse follows same success/error pattern as IOneclickStartResponse
    - TDD RED-GREEN for SDK method wrappers

key-files:
  created:
    - apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json
  modified:
    - apps/strapi/src/services/oneclick/types/oneclick.types.ts
    - apps/strapi/src/services/oneclick/services/oneclick.service.ts
    - apps/strapi/src/services/oneclick/tests/oneclick.service.test.ts
    - apps/strapi/src/api/cron-runner/controllers/cron-runner.ts
    - apps/strapi/.env.example

key-decisions:
  - "MallTransaction instantiated per-call in authorizeCharge() (not singleton) — consistent with how existing tests mock it, avoids module-level state"
  - "authorizeCharge() takes parentBuyOrder and childBuyOrder as parameters (not derived internally) — caller controls buy_order uniqueness per attempt"

patterns-established:
  - "Pattern: IOneclickAuthorizeResponse follows existing success/error response shape with optional typed fields"
  - "Pattern: authorizeCharge checks response?.details?.[0]?.response_code === 0 for approval"

requirements-completed:
  - CHRG-04

# Metrics
duration: 3min
completed: 2026-03-20
---

# Phase 103 Plan 01: Subscription Infrastructure Summary

**subscription-payment content type with 12 attributes, OneclickService.authorizeCharge() wrapping MallTransaction.authorize() with 3 unit tests, and env var documentation for ONECLICK_CHILD_COMMERCE_CODE and PRO_MONTHLY_PRICE**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-20T17:14:54Z
- **Completed:** 2026-03-20T17:17:54Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created subscription-payment content type schema with all 12 attributes (user relation, amount, status enum, buy order fields, authorization/response fields, period_start, charged_at, charge_attempts, next_charge_attempt)
- Added IOneclickAuthorizeResponse interface and authorizeCharge() method to OneclickService, all 10 oneclick service tests pass
- Documented ONECLICK_CHILD_COMMERCE_CODE and PRO_MONTHLY_PRICE in .env.example and registered subscription-charge in cron-runner

## Task Commits

Each task was committed atomically:

1. **Task 1: Create subscription-payment content type and add env vars** - `8133ca48` (feat)
2. **Task 2 RED: Add failing tests for authorizeCharge** - `3892adf5` (test)
3. **Task 2 GREEN: Implement authorizeCharge and IOneclickAuthorizeResponse** - `f5c80d4c` (feat)

_Note: TDD task 2 has two commits (test RED → feat GREEN)_

## Files Created/Modified
- `apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json` - New content type for tracking monthly charges with retry state
- `apps/strapi/src/services/oneclick/types/oneclick.types.ts` - Added IOneclickAuthorizeResponse interface
- `apps/strapi/src/services/oneclick/services/oneclick.service.ts` - Added authorizeCharge() method using MallTransaction.authorize()
- `apps/strapi/src/services/oneclick/tests/oneclick.service.test.ts` - Added MallTransaction/TransactionDetail mocks and 3 authorizeCharge tests
- `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts` - Added subscription-charge to CRON_NAME_MAP and JSDoc
- `apps/strapi/.env.example` - Added ONECLICK_CHILD_COMMERCE_CODE and PRO_MONTHLY_PRICE

## Decisions Made
- MallTransaction instantiated per-call in authorizeCharge() (not singleton) — consistent with how existing tests mock it and avoids module-level state issues
- authorizeCharge() takes parentBuyOrder and childBuyOrder as parameters (not derived internally) — the caller (cron service in Plan 02) controls buy_order uniqueness per retry attempt

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required beyond what is documented in .env.example.

## Next Phase Readiness
- subscription-payment schema ready for Strapi to register as a content type on next startup
- OneclickService.authorizeCharge() ready for Plan 02 cron service to consume
- subscription-charge registered in cron-runner for manual triggering during development/testing
- No blockers for Plan 02

---
*Phase: 103-monthly-charging-cron*
*Completed: 2026-03-20*

## Self-Check: PASSED
- schema.json: FOUND
- oneclick.types.ts: FOUND
- oneclick.service.ts: FOUND
- 103-01-SUMMARY.md: FOUND
- Commit 8133ca48: FOUND
- Commit 3892adf5: FOUND
- Commit f5c80d4c: FOUND
