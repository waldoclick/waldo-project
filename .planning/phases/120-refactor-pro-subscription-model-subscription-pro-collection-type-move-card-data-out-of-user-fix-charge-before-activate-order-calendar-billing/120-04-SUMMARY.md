---
phase: 120-refactor-pro-subscription-model
plan: "04"
subsystem: strapi/tests
tags: [testing, subscription-pro, jest, migration, tdd]
dependency_graph:
  requires: [120-02, 120-03]
  provides: [SUB-CRON-01, SUB-CANCEL-01, SUB-PROTECT-01, SUB-CHARGE-01, SUB-CHARGE-02, SUB-MIGRATE-01]
  affects: [apps/strapi/tests]
tech_stack:
  added: []
  patterns: [AAA test pattern, jest.fn() factory per UID, mockImplementation routing]
key_files:
  created:
    - apps/strapi/tests/bootstrap/migrate-subscription-pro.test.ts
  modified:
    - apps/strapi/tests/cron/subscription-charge.cron.test.ts
    - apps/strapi/tests/api/payment/services/pro-cancellation.service.test.ts
    - apps/strapi/tests/middlewares/protect-user-fields.test.ts
decisions:
  - mockImplementation routing pattern used for strapi.db.query to dispatch different mock objects per UID
  - strapi.entityService.update mock uses routing pattern to separate sub-pro vs user update assertions
  - 4 pre-existing test failures confirmed out-of-scope (authController, payment.test, ad.approve.zoho, indicador)
metrics:
  duration: ~20min
  completed: "2026-04-09"
  tasks_completed: 2
  files_changed: 4
---

# Phase 120 Plan 04: Update Test Suites for Subscription-Pro Migration Summary

Updated three existing test suites and created one new bootstrap migration test to reflect the Phase 120 subscription-pro migration. All 39 tests across 4 files pass cleanly. TypeScript compiles without errors.

## What Was Built

**subscription-charge.cron.test.ts** — Moved `tbk_user` from user top-level into `subscription_pro: { tbk_user }` in `makeUser()` factory. Added CHRG-01b describe block with 2 tests verifying users with `subscription_pro: null` and empty `tbk_user` are skipped. Updated retry test to use `user.subscription_pro!.tbk_user`. Updated the authorizeCharge assertion to reference `user.subscription_pro!.tbk_user`.

**pro-cancellation.service.test.ts** — Completely rewritten to replace `strapi.entityService.findOne()` mock (old pattern) with `strapi.db.query("api::subscription-pro.subscription-pro").findOne()` mock (new pattern). Added separate `mockSubProEntityUpdate` / `mockUserEntityUpdate` to enable independent assertions. Added test for `null` subscription-pro record. Added test for correct UID used in `db.query` call.

**protect-user-fields.test.ts** — Added Test 8 verifying card enrollment fields (`pro_card_type`, `pro_card_last4`, `pro_inscription_token`) are still stripped from request body. Added Test 9 verifying all 13 PROTECTED_USER_FIELDS are stripped in a single request.

**migrate-subscription-pro.test.ts (new)** — Bootstrap migration unit test covering: active+cancelled users migrated with correct field mapping (`pro_card_type` → `card_type`, etc.), `$notNull` filter in `findMany` where clause, idempotency skip for users with existing subscription-pro record, empty result set with info log, `publishedAt` set as Date on all created records.

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update cron and cancellation test suites | 679fc85a | subscription-charge.cron.test.ts, pro-cancellation.service.test.ts |
| 2 | Bootstrap migration test + middleware update | 60195733 | migrate-subscription-pro.test.ts (new), protect-user-fields.test.ts |

## Verification Results

- `yarn jest --testPathPattern="subscription-charge"` — PASS (23 tests)
- `yarn jest --testPathPattern="pro-cancellation"` — PASS (6 tests)
- `yarn jest --testPathPattern="migrate-subscription-pro"` — PASS (6 tests)
- `yarn jest --testPathPattern="protect-user-fields"` — PASS (10 tests)
- `npx tsc --noEmit` — clean (0 errors)
- No `user.tbk_user` reads in cron or cancellation source (only in `chargeUser` where `tbk_user` was already extracted from `subscription_pro` and passed as parameter)

## Deviations from Plan

### Pre-existing failures (out of scope)

4 test suites fail before and after our changes — confirmed pre-existing:
- `tests/extensions/users-permissions/controllers/authController.test.ts`
- `tests/api/payment/controllers/payment.test.ts`
- `tests/api/ad/services/ad.approve.zoho.test.ts`
- `tests/services/indicador/indicador.test.ts`

These are pre-existing failures unrelated to Phase 120 work. Logged for deferred attention.

## Known Stubs

None — all test assertions are wired to the actual service implementations.

## Self-Check: PASSED

- `apps/strapi/tests/bootstrap/migrate-subscription-pro.test.ts` — FOUND
- `apps/strapi/tests/cron/subscription-charge.cron.test.ts` — FOUND (modified)
- `apps/strapi/tests/api/payment/services/pro-cancellation.service.test.ts` — FOUND (modified)
- `apps/strapi/tests/middlewares/protect-user-fields.test.ts` — FOUND (modified)
- Commit 679fc85a — FOUND
- Commit 60195733 — FOUND
