---
phase: 121-clean-subscription-data-model
verified: 2026-04-08T00:00:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 121: Clean Subscription Data Model — Verification Report

**Phase Goal:** Remove pro_expires_at from the user model and move subscription period tracking entirely to subscription-payment.period_end. All subscription lifecycle logic (billing, activation, cancellation) must use period_end from subscription-payment records, not pro_expires_at from users.
**Verified:** 2026-04-08
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | pro_expires_at no longer exists on the user schema or in PROTECTED_USER_FIELDS | VERIFIED | `grep -c "pro_expires_at" user/schema.json` = 0; PROTECTED_USER_FIELDS has 8 fields, no pro_expires_at |
| 2  | period_end field exists on subscription-payment schema as date, required | VERIFIED | `"period_end": { "type": "date", "required": true }` confirmed in schema.json |
| 3  | proResponse creates an approved subscription-payment row with period_end instead of writing pro_expires_at on user | VERIFIED | `paymentCreate("api::subscription-payment.subscription-payment", { data: { period_end: proExpiresAtStr, ... } })` at line 588-599 of payment.ts; 0 pro_expires_at occurrences in payment.ts |
| 4  | pro-cancellation.service.ts comment about pro_expires_at is updated | VERIFIED | 0 occurrences of pro_expires_at in pro-cancellation.service.ts |
| 5  | Cron Step 1 queries subscription-payment records by period_end <= today instead of querying users | VERIFIED | `findMany("api::subscription-payment.subscription-payment", { filters: { status: "approved", period_end: { $lte: today }, user: { pro_status: "active" } } })` at line 68-90 of cron |
| 6  | Cron Step 4 queries subscription-payment records for cancelled users by period_end <= today | VERIFIED | `findMany("api::subscription-payment.subscription-payment", { filters: { status: "approved", period_end: { $lte: today }, user: { pro_status: "cancelled" } } })` at line 276-295 of cron |
| 7  | chargeUser writes period_end on all 4 subscription-payment data payloads and does not update user.pro_expires_at | VERIFIED | 14 period_end matches in cron file; 0 pro_expires_at; user updates at lines 185-193 and 310-317 only set pro_status: "inactive" |
| 8  | Step 4 deduplicates users when multiple expired approved rows exist for same cancelled user | VERIFIED | `Set<number> processedCancelledUserIds` at line 301; CancelledUser interface removed |
| 9  | Zero occurrences of pro_expires_at in entire apps/strapi/src tree | VERIFIED | `grep -r "pro_expires_at" apps/strapi/src/` = 0 matches |
| 10 | Test suites updated: cron tests use period_end mocks, proResponse tests fully implemented, protect-user-fields matches 8 fields | VERIFIED | 0 .todo tests; 3 period_end assertions in proResponse test; cron test asserts subscription-payment findMany with period_end filter; middleware test has 8 protected fields |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json` | period_end field definition (date, required) | VERIFIED | Field present with correct type and required flag |
| `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` | User schema without pro_expires_at | VERIFIED | 0 occurrences of pro_expires_at |
| `apps/strapi/database/migrations/2026.04.10T00.00.00.add-period-end-drop-pro-expires-at.ts` | DB migration adding period_end, dropping pro_expires_at | VERIFIED | File exists; up() calls `alterTable("subscription_payments")` with `table.date("period_end").notNullable()` AND `alterTable("up_users")` with `table.dropColumn("pro_expires_at")` |
| `apps/strapi/src/middlewares/protect-user-fields.ts` | PROTECTED_USER_FIELDS without pro_expires_at | VERIFIED | 8-field array: pro_status, username, avatar, cover, role, provider, confirmed, blocked |
| `apps/strapi/src/api/payment/controllers/payment.ts` | proResponse creates subscription-payment with period_end | VERIFIED | `paymentCreate("api::subscription-payment.subscription-payment", ...)` with period_end at line 579-602; 3 total period_end occurrences |
| `apps/strapi/src/cron/subscription-charge.cron.ts` | Refactored cron querying subscription-payments by period_end | VERIFIED | 14 period_end occurrences; 0 pro_expires_at; DuePaymentRecord and FailedPaymentRecord interfaces updated |
| `apps/strapi/tests/cron/subscription-charge.cron.test.ts` | Updated cron test suite for period_end-based billing | VERIFIED | CHRG-05 idempotency block deleted; period_end in all mock data and assertions; findMany asserts subscription-payment UID |
| `apps/strapi/tests/middlewares/protect-user-fields.test.ts` | Updated middleware test without pro_expires_at | VERIFIED | Test 9 asserts 8 protected fields matching actual middleware |
| `apps/strapi/tests/api/payment/payment-pro-response.test.ts` | Implemented proResponse tests asserting subscription-payment creation with period_end | VERIFIED | 0 .todo stubs; 10 tests; asserts subscription-payment creation with period_end; asserts user update does not contain pro_expires_at |
| `apps/strapi/tests/api/payment/services/pro-cancellation.service.test.ts` | Updated cancellation test without pro_expires_at references | VERIFIED | All pro_expires_at references are in `not.toHaveProperty("pro_expires_at")` negative assertions — correct |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `apps/strapi/src/api/payment/controllers/payment.ts` | `api::subscription-payment.subscription-payment` | `paymentCreate` in proResponse | WIRED | `paymentCreate("api::subscription-payment.subscription-payment", { data: { period_end: proExpiresAtStr, ... } })` at line 588 |
| `apps/strapi/src/cron/subscription-charge.cron.ts` | `api::subscription-payment.subscription-payment` | entityService.findMany with period_end filter | WIRED | Both Step 1 (line 68) and Step 4 (line 276) query subscription-payment with `period_end: { $lte: today }` |
| `apps/strapi/tests/cron/subscription-charge.cron.test.ts` | `apps/strapi/src/cron/subscription-charge.cron.ts` | Jest mock assertions on period_end | WIRED | Tests assert findMany on `api::subscription-payment.subscription-payment` with period_end filter |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SUB-MODEL-121-01 | 121-01, 121-03 | Remove pro_expires_at from user schema (schema.json + DB migration DROP COLUMN) | SATISFIED | User schema: 0 occurrences; migration drops column; middleware strips 8 fields (not 9) |
| SUB-MODEL-121-02 | 121-01, 121-02, 121-03 | Add period_end (date, required) to subscription-payment schema | SATISFIED | Schema has `"period_end": { "type": "date", "required": true }`; 14 period_end writes in cron |
| SUB-MODEL-121-03 | 121-02, 121-03 | Refactor cron Step 1 to query subscription_payments by period_end <= today | SATISFIED | Step 1 queries subscription-payment with period_end filter; Step 4 same for cancelled; chargeUser writes period_end on all 4 payloads |
| SUB-MODEL-121-04 | 121-01, 121-03 | proResponse creates first subscription-payment row with period_end set; remove all pro_expires_at writes | SATISFIED | proResponse calls paymentCreate with period_end; 0 pro_expires_at in payment.ts; proResponse test asserts subscription-payment creation with period_end |

All 4 requirement IDs claimed in the plan frontmatter are satisfied. No orphaned requirements found (no separate REQUIREMENTS.md exists — requirements are defined in RESEARCH.md and ROADMAP.md).

### Anti-Patterns Found

None detected. Scanned all 6 source files and 4 test files modified by this phase.

Notable items that are NOT anti-patterns:
- `pro_expires_at` in test files: appears only in test description strings, code comments, and `not.toHaveProperty("pro_expires_at")` negative assertions. These are intentional negative test contracts verifying absence of the deleted field — not stubs or placeholders.
- `defaultTo(knex.fn.now())` in migration: intentional design decision to satisfy NOT NULL for existing rows; documented in migration comment.

### Human Verification Required

1. **DB Migration execution on real DB**
   - **Test:** Run Strapi in a staging environment and verify the migration runs successfully — `period_end` column appears in `subscription_payments` table and `pro_expires_at` column is gone from `up_users` table.
   - **Expected:** Migration completes without errors; schema matches code.
   - **Why human:** Migration correctness on a live or staging DB with existing data cannot be verified via static analysis.

2. **End-to-end PRO inscription flow**
   - **Test:** Complete a PRO inscription (Webpay Oneclick) from the website in a staging environment and verify a subscription-payment record is created with period_end = first day of next month and pro_status = "active" on the user.
   - **Expected:** User is activated; subscription-payment row has period_end; user has no pro_expires_at column value.
   - **Why human:** Integration with Webpay and the full proResponse flow requires a live payment gateway or full integration test environment.

### Gaps Summary

No gaps. All must-haves verified against the actual codebase.

---

_Verified: 2026-04-08_
_Verifier: Claude (gsd-verifier)_
