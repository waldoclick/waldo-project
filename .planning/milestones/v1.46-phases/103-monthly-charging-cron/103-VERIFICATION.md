---
phase: 103-monthly-charging-cron
verified: 2026-03-20T23:45:00Z
status: passed
score: 7/7 must-haves verified
gaps: []
---

# Phase 103: Monthly Charging Cron — Verification Report

**Phase Goal:** PRO subscribers are charged automatically each month without any manual action
**Verified:** 2026-03-20T23:45:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                 | Status     | Evidence                                                                                             |
| --- | --------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| 1   | Daily cron queries users with pro_status=active and pro_expires_at past | ✓ VERIFIED | `subscription-charge.cron.ts` lines 57–69 query with `pro_status: active` + `pro_expires_at <= today` |
| 2   | Successful charge creates subscription-payment record (status=approved) + extends pro_expires_at by 30 days | ✓ VERIFIED | `chargeUser()` lines 235–286: create/approve record, update user with `Date.now() + 30*24*60*60*1000`   |
| 3   | Failed charge creates subscription-payment record (status=failed), charge_attempts=1, next_charge_attempt=tomorrow | ✓ VERIFIED | `chargeUser()` lines 291–341: failure path creates failed record with attempt=1 → tomorrow retry       |
| 4   | Second retry sets next_charge_attempt to +2 days (day 3 after expiry) | ✓ VERIFIED | `chargeUser()` lines 293–300: `attempt === 1` → +1 day; `attempt !== 1` → +2 days                     |
| 5   | Third failed attempt deactivates user: pro_status=inactive, pro=false, pro_expires_at=null, tbk_user=null | ✓ VERIFIED | `chargeExpiredSubscriptions()` lines 147–179: full deactivation of exhausted users                     |
| 6   | Existing approved payment for same period_start skips user (idempotency) | ✓ VERIFIED | `chargeExpiredSubscriptions()` lines 78–95: idempotency check before each charge                     |
| 7   | PRO_MONTHLY_PRICE env var determines charge amount; throws if not set | ✓ VERIFIED | `chargeExpiredSubscriptions()` lines 45–52: guard with descriptive error; `.env.example` line 41       |

**Score:** 7/7 truths verified

### Required Artifacts

#### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json` | 12-attribute content type schema | ✓ VERIFIED | 12 attributes: user, amount, status, parent_buy_order, child_buy_order, authorization_code, response_code, payment_response, period_start, charged_at, charge_attempts, next_charge_attempt |
| `apps/strapi/src/services/oneclick/services/oneclick.service.ts` | authorizeCharge method calling MallTransaction.authorize() | ✓ VERIFIED | Lines 72–111: `authorizeCharge()` with per-call MallTransaction, TransactionDetail using ONECLICK_CHILD_COMMERCE_CODE, response_code 0 check |
| `apps/strapi/src/services/oneclick/types/oneclick.types.ts` | IOneclickAuthorizeResponse interface | ✓ VERIFIED | Lines 16–22: `success`, `authorizationCode`, `responseCode`, `rawResponse`, `error` |
| `apps/strapi/.env.example` | ONECLICK_CHILD_COMMERCE_CODE + PRO_MONTHLY_PRICE | ✓ VERIFIED | Lines 40–41: both vars present with values |
| `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts` | subscription-charge entry in CRON_NAME_MAP | ✓ VERIFIED | Line 19: `"subscription-charge": "subscriptionChargeCron"` |

#### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `apps/strapi/src/cron/subscription-charge.cron.ts` | SubscriptionChargeService class, 343 lines | ✓ VERIFIED | chargeExpiredSubscriptions() main entry + chargeUser() private helper; follows AdService pattern |
| `apps/strapi/src/cron/subscription-charge.cron.test.ts` | 8 unit tests covering CHRG-01–CHRG-05 | ✓ VERIFIED | 8 tests: CHRG-01 (query), CHRG-02 (approval + 30-day extension), CHRG-05 (idempotency), CHRG-03 (failure/retry/deactivation), CHRG-04 (env var) |
| `apps/strapi/config/cron-tasks.ts` | subscriptionChargeCron at 0 5 * * * America/Santiago | ✓ VERIFIED | Lines 118–130: registered with 5 AM schedule, SubscriptionChargeService import at line 6 |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `subscription-charge.cron.ts` | `oneclick.service.ts` | `new OneclickService().authorizeCharge()` | ✓ WIRED | Lines 222–229: instantiates service, calls authorizeCharge with correct params |
| `subscription-charge.cron.ts` | `api::subscription-payment.subscription-payment` | `strapi.entityService.create/findMany/update` | ✓ WIRED | Lines 254, 81, 237–251, 167: all three operations present and wired |
| `cron-tasks.ts` | `subscription-charge.cron.ts` | `SubscriptionChargeService` import | ✓ WIRED | Line 6 import, line 121 instantiation, line 122 call |
| `oneclick.service.ts` | `oneclick.types.ts` | `IOneclickAuthorizeResponse` import | ✓ WIRED | Line 12: imported and used as return type |
| `oneclick.service.ts` | `transbank-sdk` | `MallTransaction.authorize()` | ✓ WIRED | Lines 80–99: per-call instantiation, TransactionDetail, authorize call |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| **CHRG-01** | 103-02 | Daily cron charges users with pro_status=active whose pro_expires_at passed | ✓ SATISFIED | `subscription-charge.cron.ts` line 61: `pro_status: { $eq: "active" }` + `pro_expires_at: { $lte: ... }`; 8 tests pass |
| **CHRG-02** | 103-02 | Successful charge creates subscription-payment record + extends pro_expires_at by 30 days | ✓ SATISFIED | `chargeUser()` lines 253–286: creates approved record, updates user with `Date.now() + 30*24*60*60*1000`; CHRG-02 test passes |
| **CHRG-03** | 103-02 | Failed charges retried over 3 days before deactivation | ✓ SATISFIED | Attempt 1→+1 day retry (line 296), attempt 2→+2 days retry (line 299), attempt ≥3 deactivates (line 137); 3 CHRG-03 tests pass |
| **CHRG-04** | 103-01 | Charge amount from PRO_MONTHLY_PRICE env var | ✓ SATISFIED | `.env.example` line 41 has `PRO_MONTHLY_PRICE=9990`; service guard at `subscription-charge.cron.ts` lines 45–52; 2 CHRG-04 tests pass |
| **CHRG-05** | 103-02 | Idempotency guard prevents double-charging same billing period | ✓ SATISFIED | `chargeExpiredSubscriptions()` lines 78–95: checks for existing approved record with same period_start; CHRG-05 test passes |

**All 5 requirement IDs from phase frontmatter are satisfied.** REQUIREMENTS.md traceability table shows all 5 CHRG-* as Complete for Phase 103.

**Requirement ID Cross-Reference:**

| ID | In PLAN 01 | In PLAN 02 | In REQUIREMENTS.md | Covered |
|----|-----------|-----------|-------------------|---------|
| CHRG-01 | — | ✓ declared + satisfied | ✓ Phase 103 Complete | ✓ |
| CHRG-02 | — | ✓ declared + satisfied | ✓ Phase 103 Complete | ✓ |
| CHRG-03 | — | ✓ declared + satisfied | ✓ Phase 103 Complete | ✓ |
| CHRG-04 | ✓ declared + satisfied | — | ✓ Phase 103 Complete | ✓ |
| CHRG-05 | — | ✓ declared + satisfied | ✓ Phase 103 Complete | ✓ |

No orphaned requirements. All IDs accounted for.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
| ---- | ------- | -------- | ------ |
| — | None found | — | — |

No TODO/FIXME/placeholder comments found. No empty stub implementations. No hardcoded empty data. No console.log-only implementations. All 18 tests pass (8 subscription-charge + 10 oneclick.service).

### Human Verification Required

None — all verifiable behaviors are covered by automated tests and code inspection.

### Minor Observation

`subscription-charge.cron.ts` line 64: The `findMany` query for expired users does not explicitly include `documentId` in the `fields` array, though `documentId` is used on line 224. Strapi v5 automatically includes `documentId` in entityService responses for collection types — the code works correctly, and tests pass with mocked data. This is not a gap; it is an acceptable observation for future reference.

### Gaps Summary

No gaps found. All must-haves verified, all artifacts exist and are substantive, all key links are wired, all 5 requirement IDs are satisfied, and the full test suite for the new code passes (18/18 tests).

---

_Verified: 2026-03-20T23:45:00Z_
_Verifier: the agent (gsd-verifier)_
