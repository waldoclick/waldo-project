---
phase: 120-refactor-pro-subscription-model
verified: 2026-04-08T00:00:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 120: Refactor PRO Subscription Model — Verification Report

**Phase Goal:** Introduce a `subscription-pro` collection type to own card enrollment data, fix the charge-before-activate ordering bug in proResponse (charge first, activate only on success), migrate cron and cancellation service to read card data from subscription-pro, remove the orphaned `pro` boolean from the user schema, and update all affected tests.
**Verified:** 2026-04-08
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | subscription-pro collection type exists with all 6 attributes (user, tbk_user, card_type, card_last4, inscription_token, pending_invoice) | VERIFIED | `apps/strapi/src/api/subscription-pro/content-types/subscription-pro/schema.json` — valid JSON with all 6 attributes and oneToOne inversedBy relation |
| 2 | User schema has subscription_pro inverse relation (mappedBy: "user") | VERIFIED | `user/schema.json` line 210: `"subscription_pro": { "type": "relation", "relation": "oneToOne", "target": "api::subscription-pro.subscription-pro", "mappedBy": "user" }` |
| 3 | Orphaned `pro` boolean field removed from user schema | VERIFIED | `grep '"pro"' user/schema.json` returns 0 matches; only `pro_status`, `pro_expires_at`, `pro_card_*` remain |
| 4 | Bootstrap migration copies card data from active/cancelled users idempotently | VERIFIED | `migrate-subscription-pro.ts` — findOne idempotency check before create; `$notNull` filter on tbk_user; wired in `src/index.ts` line 62 |
| 5 | proResponse charges BEFORE activating — charge failure does NOT activate user | VERIFIED | payment.ts: `authorizeCharge` at line 508, `subProCreate subscription-pro` at line 533, `pro_status: "active"` at line 552. Ordering confirmed. |
| 6 | subscription-pro record created only after successful charge | VERIFIED | `subProCreate("api::subscription-pro.subscription-pro", ...)` at line 533 — gated by `chargeResult.success` check at line 517 |
| 7 | pro/error page shows specific message for charge-failed reason | VERIFIED | `apps/website/app/pages/pro/error.vue` lines 42 and 51-52: errorTitle "Error en el cobro" and errorDescription with correct copy |
| 8 | Cron reads tbk_user from subscription-pro relation, not user fields | VERIFIED | `subscription-charge.cron.ts` — ProUser interface has `subscription_pro?: { tbk_user?: string } | null`; populate at lines 80 and 146; `user.subscription_pro?.tbk_user` extraction with guard at lines 116 and 161 |
| 9 | Cancellation service reads tbk_user from subscription-pro and clears it on cancel | VERIFIED | `pro-cancellation.service.ts` — `strapi.db.query("api::subscription-pro.subscription-pro").findOne(...)` at line 25; clears `tbk_user` on subscription-pro record at line 58 |
| 10 | protect-user-fields middleware keeps tbk_user, pro_card_type, pro_card_last4, pro_inscription_token protected | VERIFIED | `protect-user-fields.ts` — PROTECTED_USER_FIELDS array unchanged; JSDoc updated at line 16 to document dual-write rationale |

**Score:** 10/10 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/src/api/subscription-pro/content-types/subscription-pro/schema.json` | subscription-pro collection type schema | VERIFIED | Exists, substantive (6 attributes + relation), wired via inversedBy to user |
| `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` | User schema with subscription_pro relation, without pro boolean | VERIFIED | subscription_pro relation at line 210; no standalone "pro" boolean found |
| `apps/strapi/src/bootstrap/migrate-subscription-pro.ts` | Idempotent card data migration | VERIFIED | Exports `migrateSubscriptionPro`, idempotency via findOne, $notNull filter |
| `apps/strapi/src/index.ts` | Bootstrap wiring for migration | VERIFIED | Imports and calls `migrateSubscriptionPro()` at line 62 |
| `apps/strapi/src/api/payment/controllers/payment.ts` | proResponse with charge-before-activate | VERIFIED | authorizeCharge (508) before subscription-pro create (533) before user activation (552) |
| `apps/website/app/pages/pro/error.vue` | Error page with charge-failed handling | VERIFIED | 2+ occurrences of "charge-failed" with correct title and description |
| `apps/strapi/src/cron/subscription-charge.cron.ts` | Cron reads from subscription-pro | VERIFIED | populate subscription_pro in both expired-user and retry findMany calls |
| `apps/strapi/src/api/payment/services/pro-cancellation.service.ts` | Cancellation queries subscription-pro | VERIFIED | Queries subscription-pro for tbk_user; clears on cancel |
| `apps/strapi/src/middlewares/protect-user-fields.ts` | Middleware with updated JSDoc | VERIFIED | PROTECTED_USER_FIELDS unchanged; JSDoc mentions subscription-pro collection |
| `apps/strapi/tests/api/subscription-pro/subscription-pro.service.test.ts` | Wave 0 stub | VERIFIED | Exists with describe blocks and it.todo stubs |
| `apps/strapi/tests/api/payment/payment-pro-response.test.ts` | Wave 0 stub | VERIFIED | Exists with 3 describe blocks covering success/failure/inscription paths |
| `apps/strapi/tests/cron/subscription-charge.cron.test.ts` | Updated cron tests | VERIFIED | Mock users use `subscription_pro: { tbk_user }` pattern; CHRG-01b skip tests added |
| `apps/strapi/tests/api/payment/services/pro-cancellation.service.test.ts` | Updated cancellation tests | VERIFIED | Mocks `api::subscription-pro.subscription-pro` db.query; subProUpdate assertions |
| `apps/strapi/tests/middlewares/protect-user-fields.test.ts` | Updated middleware tests | VERIFIED | Tests 8 and 9 verify card fields still protected |
| `apps/strapi/tests/bootstrap/migrate-subscription-pro.test.ts` | New bootstrap migration test | VERIFIED | Covers: active/cancelled users, $notNull filter, idempotency skip, empty set |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `subscription-pro/schema.json` | `user/schema.json` | oneToOne inversedBy: subscription_pro | WIRED | inversedBy on subscription-pro (owns FK), mappedBy on user |
| `migrate-subscription-pro.ts` | `src/index.ts` | import + bootstrap call | WIRED | Line 10 import, line 62 await call |
| `payment.ts` (proResponse) | `OneclickService.authorizeCharge` | charge call before user update | WIRED | authorizeCharge line 508, pro_status: active line 552 |
| `payment.ts` (proResponse) | `api::subscription-pro.subscription-pro` | entityService.create after successful charge | WIRED | subProCreate at line 533, gated by chargeResult.success |
| `subscription-charge.cron.ts` | `api::subscription-pro.subscription-pro` | populate subscription_pro in findMany | WIRED | populate at lines 80 and 146; extraction at lines 116 and 161 |
| `pro-cancellation.service.ts` | `api::subscription-pro.subscription-pro` | db.query for tbk_user | WIRED | findOne at line 25, subProUpdate at line 58 |
| `protect-user-fields.ts` | PROTECTED_USER_FIELDS array | tbk_user remains in array | WIRED | Array unchanged; tbk_user at position 3 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SUB-SCHEMA-01 | 120-01 | subscription-pro collection type with oneToOne user relation | SATISFIED | schema.json created with inversedBy; user schema has mappedBy |
| SUB-SCHEMA-02 | 120-01 | subscription-pro has tbk_user, card_type, card_last4, inscription_token, pending_invoice fields | SATISFIED | All 5 card fields present in schema.json attributes |
| SUB-SCHEMA-03 | 120-01 | Orphaned pro boolean removed from user schema | SATISFIED | grep '"pro"' returns 0 matches in user schema.json |
| SUB-MIGRATE-01 | 120-01 | Idempotent bootstrap migration for existing active/cancelled PRO users | SATISFIED | migrate-subscription-pro.ts: findOne check + $notNull + wired in index.ts |
| SUB-CHARGE-01 | 120-02 | authorizeCharge called BEFORE pro_status set to active in proResponse | SATISFIED | payment.ts: line 508 < line 552; failed charge redirects to charge-failed without activating |
| SUB-CHARGE-02 | 120-02 | subscription-pro record created only after successful charge | SATISFIED | payment.ts: subProCreate at line 533, gated by chargeResult.success block |
| SUB-ERROR-01 | 120-02 | pro/error page handles charge-failed reason with specific message | SATISFIED | error.vue: 2 occurrences of "charge-failed" with "Error en el cobro" title |
| SUB-CRON-01 | 120-03 | Cron reads tbk_user from subscription-pro, not user fields | SATISFIED | subscription-charge.cron.ts: ProUser interface, populate, extraction, guard all updated |
| SUB-CANCEL-01 | 120-03 | Cancellation service reads from subscription-pro and clears tbk_user on cancel | SATISFIED | pro-cancellation.service.ts: db.query for subscription-pro; subProUpdate clears tbk_user |
| SUB-PROTECT-01 | 120-03 | protect-user-fields keeps card enrollment fields protected (dual-write period) | SATISFIED | PROTECTED_USER_FIELDS array unchanged; JSDoc updated with dual-write rationale |

All 10 requirement IDs from plan frontmatter are accounted for. No REQUIREMENTS.md file exists in `.planning/` — requirement IDs are defined inline in plan files only. No orphaned requirements found.

---

## Anti-Patterns Found

None. No TODOs, FIXMEs, placeholders, or stub patterns found in the modified source files. The Wave 0 test stubs (`it.todo()`) are intentional scaffolding as designed.

**Note on pre-existing test failures:** Plan 04 SUMMARY documents 4 pre-existing failing test suites (`authController`, `payment.test`, `ad.approve.zoho`, `indicador`) that existed before Phase 120 and are unrelated to this phase. These are not regressions introduced by Phase 120.

---

## Human Verification Required

### 1. First-month charge on inscription end-to-end

**Test:** Register a PRO plan card via the Webpay Oneclick flow in a staging environment. Observe whether the first-month charge is processed before activation.
**Expected:** User receives a charge confirmation before their account shows PRO status. If charge fails (e.g., insufficient funds), user is redirected to `/pro/error?reason=charge-failed` and their `pro_status` remains inactive.
**Why human:** Requires a live Transbank Oneclick staging connection and real browser interaction. Cannot verify authorizeCharge response codes programmatically.

### 2. Bootstrap migration on Strapi restart

**Test:** Start Strapi against a database with existing active/cancelled PRO users who have `tbk_user` set. Check whether `subscription_pros` table is populated after startup.
**Expected:** One `subscription_pros` record per user with card data copied. Restarting again skips already-migrated users.
**Why human:** Requires a running Strapi instance connected to a real or seeded database. Cannot verify database state programmatically without Strapi running.

### 3. Calendar billing prorated charge amount

**Test:** Subscribe as PRO on day 15 of a 30-day month. Verify the first-month charge amount is approximately 50% of the monthly price (prorated for remaining days).
**Expected:** Charge amount matches `ceil((daysRemaining / daysInMonth) * monthlyPrice)` formula.
**Why human:** Requires a live Transbank transaction to observe the actual charged amount.

---

## Gaps Summary

No gaps. All 10 observable truths are verified, all 15 artifacts exist with substantive content and correct wiring, and all 10 requirement IDs are satisfied by evidence in the codebase.

---

_Verified: 2026-04-08_
_Verifier: Claude (gsd-verifier)_
