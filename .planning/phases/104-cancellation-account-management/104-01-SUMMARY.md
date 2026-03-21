---
phase: 104-cancellation-account-management
plan: "01"
subsystem: strapi-backend
tags:
  - cancellation
  - oneclick
  - pro-subscription
  - cron
  - tdd
dependency_graph:
  requires:
    - 103.1-01 (pro_status enum on user schema)
    - 103-01 (OneclickService authorizeCharge, subscription-charge cron)
  provides:
    - POST /payments/pro-cancel endpoint
    - ProCancellationService.cancelSubscription()
    - OneclickService.deleteInscription()
    - SubscriptionChargeService Step 4 cancelled-expiry sweep
  affects:
    - apps/strapi/src/services/oneclick/
    - apps/strapi/src/api/payment/
    - apps/strapi/src/cron/
tech_stack:
  added: []
  patterns:
    - TDD (RED/GREEN) for all new code
    - try/catch returning { success, error } — consistent with OneclickService pattern
    - Proceed-on-Transbank-failure: cancellation completes even if SDK delete fails
    - CANC-02: pro_expires_at never modified on cancellation (period-end expiry preserved)
key_files:
  created:
    - apps/strapi/src/api/payment/services/pro-cancellation.service.ts
    - apps/strapi/src/api/payment/services/__tests__/pro-cancellation.service.test.ts
  modified:
    - apps/strapi/src/services/oneclick/types/oneclick.types.ts
    - apps/strapi/src/services/oneclick/services/oneclick.service.ts
    - apps/strapi/src/services/oneclick/tests/oneclick.service.test.ts
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/api/payment/routes/payment.ts
    - apps/strapi/src/cron/subscription-charge.cron.ts
    - apps/strapi/src/cron/subscription-charge.cron.test.ts
decisions:
  - "Cancellation proceeds even if Transbank deleteInscription fails — user intent is cancellation, card deletion is best-effort"
  - "pro_expires_at is intentionally NOT cleared on cancellation — subscription expires at period end (CANC-02)"
  - "Step 4 uses same sort_priority recalculation pattern as Step 3 (exhausted deactivation)"
  - "strapi.db mock added to subscription-charge tests to support sort_priority assertions"
metrics:
  duration: "19 minutes"
  completed_date: "2026-03-21"
  tasks_completed: 2
  files_changed: 8
---

# Phase 104 Plan 01: Cancellation Backend Summary

**One-liner:** PRO subscription cancellation via deleteInscription() + ProCancellationService + POST /payments/pro-cancel + cron Step 4 cancelled-expiry sweep with 29 passing unit tests.

## What Was Built

### Task 1: deleteInscription + ProCancellationService + cancel endpoint

**`IOneclickDeleteResponse`** interface added to `oneclick.types.ts`:
- `{ success: boolean; error?: unknown }`

**`OneclickService.deleteInscription()`** added to `oneclick.service.ts`:
- Calls `inscription.delete(tbkUser, buildOneclickUsername(userDocumentId))`
- Returns `{ success: true }` on success, `{ success: false, error }` on SDK throw
- 2 unit tests added to `oneclick.service.test.ts`

**`ProCancellationService`** created at `pro-cancellation.service.ts`:
- `cancelSubscription(userId, userDocumentId)` fetches user's `tbk_user`, calls `deleteInscription`, updates user with `pro_status: "cancelled"` and `tbk_user: null`
- Intentionally does NOT modify `pro_expires_at` — subscription expires at period end (CANC-02)
- Proceeds with Strapi update even if Transbank deleteInscription fails
- Returns `{ success: false, error: "User has no active inscription" }` when `tbk_user` is null
- 5 unit tests

**`PaymentController.proCancel`** added to `payment.ts`:
- Guards: checks `user.pro_status !== "active"` before proceeding
- Calls `ProCancellationService.cancelSubscription()`
- Returns `{ data: { success: true } }` on success

**Route added** to `payment.ts` routes:
- `POST /payments/pro-cancel` → `payment.proCancel`

### Task 2: SubscriptionChargeService Step 4 cancelled-expiry sweep

**Step 4** added to `chargeExpiredSubscriptions()` in `subscription-charge.cron.ts`:
- Queries users with `pro_status = "cancelled"` AND `pro_expires_at <= today`
- Deactivates each: sets `pro_status = "inactive"`, `pro_expires_at = null`, `tbk_user = null`
- Recalculates `sort_priority` for user's featured ads (same pattern as Step 3)
- Does NOT call `authorizeCharge` (card already deleted at cancellation time)

**Test updates** to `subscription-charge.cron.test.ts`:
- Added `strapi.db` mock with `mockDbQueryFindMany` and `mockDbQueryUpdate`
- Updated all existing tests to add 5th `mockFindMany` call for new Step 4 query
- Added 4 new CANC-04 test cases

## Test Results

```
Test Suites: 3 passed
Tests:       29 passed
  - oneclick.service.test.ts: 12 tests (including 2 new deleteInscription tests)
  - pro-cancellation.service.test.ts: 5 tests (new)
  - subscription-charge.cron.test.ts: 12 tests (8 existing + 4 new Step 4 tests)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - TypeScript] Fixed `fields` type cast in ProCancellationService**
- **Found during:** Task 1 GREEN phase
- **Issue:** `{ fields: ["tbk_user"] as unknown as string[] }` caused TS2322 — the `fields` option expects a specific Strapi type, not `string[]`
- **Fix:** Used `as unknown as Parameters<typeof strapi.entityService.findOne>[2]["fields"]` double-cast pattern (consistent with subscription-charge.cron.ts)
- **Files modified:** `apps/strapi/src/api/payment/services/pro-cancellation.service.ts`
- **Commit:** a86059b3

None of the other deviations from plan — executed exactly as written.

## Known Stubs

None. All new endpoints and services are fully wired with real implementations.

## Self-Check: PASSED
