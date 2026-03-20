---
phase: 103-monthly-charging-cron
plan: 02
subsystem: payments
tags: [transbank, oneclick, strapi, cron, subscription, billing]

# Dependency graph
requires:
  - phase: 103-monthly-charging-cron
    provides: subscription-payment content type, OneclickService.authorizeCharge()
provides:
  - SubscriptionChargeService with chargeExpiredSubscriptions() entry point
  - 8 unit tests covering CHRG-01 through CHRG-05
  - subscriptionChargeCron registered at 5 AM daily (America/Santiago)
affects:
  - 104-cancellation (SubscriptionChargeService deactivation logic)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SubscriptionChargeService follows AdService pattern (ICronjobResult, id-based queries)
    - Idempotency via period_start check against existing approved subscription-payments
    - Retry scheduling: day 1 (tomorrow), day 3 (+2 days from tomorrow = day 3 after expiry)
    - Deactivation clears pro_status, pro, pro_expires_at, and tbk_user atomically

key-files:
  created:
    - apps/strapi/src/cron/subscription-charge.cron.ts
    - apps/strapi/src/cron/subscription-charge.cron.test.ts
  modified:
    - apps/strapi/config/cron-tasks.ts

key-decisions:
  - "FailedPaymentRecord uses numeric id (not documentId) for update calls — Strapi v5 numeric IDs work for entityService.update()"
  - "Uses (strapi.entityService.findMany as Function)() pattern to bypass TypeScript errors on unregistered content type at test time"
  - "retry scheduling: attempt=1 → tomorrow, attempt=2 → +2 days (lands on day 3 after expiry)"

patterns-established:
  - "SubscriptionChargeService.chargeUser() private helper handles both new records and retry updates via optional existingRecordId parameter"
  - "Buy order format: parentBuyOrder=pro-{userId}-{YYYYMMDD}, childBuyOrder=c-{userId}-{YYYYMMDD}-{attempt}"

requirements-completed:
  - CHRG-01
  - CHRG-02
  - CHRG-03
  - CHRG-04
  - CHRG-05

# Metrics
duration: 5min
completed: 2026-03-20
---

# Phase 103 Plan 02: SubscriptionChargeService Summary

**SubscriptionChargeService cron class with 8 unit tests covering expired user charging, idempotency guards, retry scheduling, deactivation logic, and PRO_MONTHLY_PRICE env var validation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-20T21:12:51Z
- **Completed:** 2026-03-20T21:17:54Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Implemented `SubscriptionChargeService` class with `chargeExpiredSubscriptions()` main entry point and `chargeUser()` private helper
- 8 unit tests pass covering all 5 requirements: CHRG-01 through CHRG-05
- Registered `subscriptionChargeCron` at 5 AM daily in `cron-tasks.ts` with JSDoc describing the full billing loop
- Idempotency guard prevents double-charging users for the same billing period

## Task Commits

Each task was committed atomically:

1. **Task 1 TDD RED: Add failing tests for SubscriptionChargeService** - `108ea950` (test)
2. **Task 1 TDD GREEN: Implement SubscriptionChargeService with idempotent billing loop** - `bb267c54` (feat)
3. **Task 2: Register subscriptionChargeCron at 5 AM daily** - `2f2e0382` (feat)

**Plan metadata:** docs(103-02): complete subscription-charge cron plan

## Files Created/Modified
- `apps/strapi/src/cron/subscription-charge.cron.ts` - SubscriptionChargeService class with chargeExpiredSubscriptions() and chargeUser() methods
- `apps/strapi/src/cron/subscription-charge.cron.test.ts` - 8 Jest unit tests for all 5 requirements
- `apps/strapi/config/cron-tasks.ts` - subscriptionChargeCron registered at "0 5 * * *" America/Santiago

## Decisions Made
- Used numeric `id` for entityService.update() calls on subscription-payment records (not documentId) — Strapi v5 accepts both, numeric id works fine for updates
- Used `(strapi.entityService.findMany as Function)()` pattern to bypass TypeScript errors when content type is not yet registered at test time
- Retry scheduling follows the plan exactly: attempt=1 retries tomorrow (day 2 after expiry), attempt=2 retries +2 days (day 3 after expiry)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SubscriptionChargeService is ready for Plan 03 (cancellation + account management)
- Deactivation logic (clears pro_status, pro, pro_expires_at, tbk_user) is implemented and tested
- No blockers for Phase 104

---
*Phase: 103-monthly-charging-cron*
*Completed: 2026-03-20*

## Self-Check: PASSED
- subscription-charge.cron.ts: FOUND
- subscription-charge.cron.test.ts: FOUND
- cron-tasks.ts (subscriptionChargeCron): FOUND
- Commit 108ea950: FOUND
- Commit bb267c54: FOUND
- Commit 2f2e0382: FOUND
