---
phase: 121-clean-subscription-data-model
plan: "03"
subsystem: strapi-tests
tags: [tests, subscription, period_end, cron, pro-response, middleware]
dependency_graph:
  requires: [121-01, 121-02]
  provides: [SUB-MODEL-121-01, SUB-MODEL-121-02, SUB-MODEL-121-03, SUB-MODEL-121-04]
  affects: [strapi-test-suite]
tech_stack:
  added: []
  patterns:
    - "Jest AAA pattern for all test updates"
    - "mockImplementation routing pattern for strapi.db.query uid dispatch"
    - "Negative assertions (not.toHaveProperty) to verify absence of deleted fields"
key_files:
  modified:
    - apps/strapi/tests/cron/subscription-charge.cron.test.ts
    - apps/strapi/tests/middlewares/protect-user-fields.test.ts
    - apps/strapi/tests/api/payment/payment-pro-response.test.ts
    - apps/strapi/tests/api/payment/services/pro-cancellation.service.test.ts
decisions:
  - "Cron tests: removed CHRG-05 idempotency describe block — period_end query is self-guarding"
  - "Cron mock chain: 4 findMany calls on subscription-payment (was 5 with user idempotency check)"
  - "protect-user-fields Test 8 inverted: card fields are NOT stripped (moved to subscription-pro)"
  - "pro-cancellation: tbk_user cleared on subscription-pro only, NOT on user — test assertions corrected (Rule 1 auto-fix)"
metrics:
  duration: "20 minutes"
  completed_date: "2026-04-09"
  tasks: 2
  files: 4
---

# Phase 121 Plan 03: Update Test Suites for period_end Data Model Summary

Updated all 4 test files to validate the Phase 121 data model where `period_end` lives on `subscription-payment` and `pro_expires_at` no longer exists on the user record.

## Tasks Completed

### Task 1: Update cron test suite for period_end-based billing
**Commit:** ee0e95af

Rewrote `tests/cron/subscription-charge.cron.test.ts` to match the refactored `SubscriptionChargeService`:

- **Mock chain**: reduced from 5 to 4 `findMany` calls (Step 1 now queries `subscription-payment` directly, no separate idempotency check)
- **CHRG-01**: asserts `findMany` on `api::subscription-payment.subscription-payment` with `period_end: { $lte: today }` filter (was querying `plugin::users-permissions.user`)
- **CHRG-02**: asserts `mockCreate` includes `period_end`, no longer asserts user update with `pro_expires_at`
- **CHRG-03 deactivation**: asserts user update contains only `pro_status: "inactive"` — no `pro_expires_at`, no `tbk_user`
- **CHRG-03 retry**: asserts `mockUpdate` on `subscription-payment` includes `period_end`
- **CANC-04**: asserts `findMany` on `subscription-payment` with cancelled filter, user update without `pro_expires_at`
- **Deleted**: CHRG-05 idempotency describe block (the period_end query is self-guarding)
- **Added**: deduplication test (multiple payment records for same cancelled user → single user update)

### Task 2: Update middleware + proResponse + cancellation tests
**Commit:** d8193331

**protect-user-fields.test.ts:**
- Test 2: removed `pro_expires_at` and `tbk_user` (no longer in `PROTECTED_USER_FIELDS`)
- Test 8: inverted — card fields (`pro_card_type`, `pro_card_last4`, `pro_inscription_token`) are no longer protected; test verifies they pass through
- Test 9: updated to 8 protected fields (was 13) — matches actual `PROTECTED_USER_FIELDS` constant

**payment-pro-response.test.ts — fully implemented (was all `.todo`):**
- 10 tests covering `proResponse` controller method
- Successful path: `authorizeCharge` before user update, `subscription-payment` created with `period_end`, user updated with `pro_status: "active"` only (no `pro_expires_at`), redirect to `/pro/pagar/gracias?order={documentId}`
- Charge failure: user not activated, subscription-pro not updated, redirect to `/pro/error?reason=charge-failed`
- Inscription failure: redirect to `/pro/error?reason=rejected`
- Cancelled (no `TBK_TOKEN`): redirect to `/pro/error?reason=cancelled`

**pro-cancellation.service.test.ts:**
- Renamed test description to not reference `pro_expires_at`
- Auto-fixed (Rule 1): two tests were asserting `tbk_user: null` in user update — source code only sets `pro_status: "cancelled"` on user, `tbk_user` is cleared on `subscription-pro` record instead. Corrected assertions.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] pro-cancellation test assertions did not match source code**
- **Found during:** Task 2 execution
- **Issue:** Two tests asserted `tbk_user: null` in user update (`plugin::users-permissions.user`), but the `ProCancellationService` (refactored in Phase 120) only sets `pro_status: "cancelled"` on the user — `tbk_user` is cleared on `subscription-pro` via `subProUpdate`, not via `mockUserEntityUpdate`
- **Fix:** Corrected user update assertions to match actual source behavior; added `not.toHaveProperty("tbk_user")` where appropriate
- **Files modified:** `apps/strapi/tests/api/payment/services/pro-cancellation.service.test.ts`
- **Commit:** d8193331

## Known Stubs

None — all test stubs (`.todo`) in `payment-pro-response.test.ts` were fully implemented.

## Verification

Final sweep results:
1. `grep -r "pro_expires_at" apps/strapi/src/` — **0 matches** (clean)
2. `grep -r "pro_expires_at" apps/strapi/tests/` — only in comments and `not.toHaveProperty` negative assertions
3. `grep "period_end" apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json` — field confirmed present
4. All 4 test files pass individually with `jest --no-coverage`
5. `grep -c "period_end" apps/strapi/src/cron/subscription-charge.cron.ts` — 14 matches
6. `grep -c "period_end" apps/strapi/src/api/payment/controllers/payment.ts` — 3 matches

Note: Full `yarn jest --no-coverage` suite is killed with SIGKILL (exit 137) due to WSL2 memory limits — this is a pre-existing environment constraint, not a test failure. Each test file passes independently.

## Self-Check: PASSED

Files confirmed exist:
- FOUND: apps/strapi/tests/cron/subscription-charge.cron.test.ts
- FOUND: apps/strapi/tests/middlewares/protect-user-fields.test.ts
- FOUND: apps/strapi/tests/api/payment/payment-pro-response.test.ts
- FOUND: apps/strapi/tests/api/payment/services/pro-cancellation.service.test.ts

Commits confirmed:
- ee0e95af (Task 1 cron tests)
- d8193331 (Task 2 middleware + proResponse + cancellation tests)
