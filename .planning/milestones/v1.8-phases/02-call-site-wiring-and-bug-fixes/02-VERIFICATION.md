---
phase: 02-call-site-wiring-and-bug-fixes
verified: 2026-03-04T12:00:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
---

# Phase 2: Call Site Wiring and Bug Fixes — Verification Report

**Phase Goal:** All payment call sites use the abstraction layer; Transbank behavior is identical to pre-refactor; two existing bugs in the payment flow are corrected
**Verified:** 2026-03-04T12:00:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| #  | Truth                                                                                                                        | Status     | Evidence                                                                                                                             |
|----|------------------------------------------------------------------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------|
| 1  | `ad.service.ts` no longer imports `TransbankServices` — calls `getPaymentGateway()` instead                                  | VERIFIED | Line 3: `import { getPaymentGateway } from "../../../services/payment-gateway"`. No `TransbankServices` import. Calls at lines 291, 320. |
| 2  | `pack.service.ts` no longer imports `TransbankServices` — calls `getPaymentGateway()` instead                                | VERIFIED | Line 2: `import { getPaymentGateway } from "../../../services/payment-gateway"`. No `TransbankServices` import. Calls at lines 53, 89.  |
| 3  | `payment_method` in both `adResponse` and `packResponse` reflects `PAYMENT_GATEWAY` env var, not hardcoded `"webpay"`       | VERIFIED | Lines 213, 304 in `payment.ts`: `process.env.PAYMENT_GATEWAY ?? "transbank"`. Zero `"webpay"` string matches in file.                |
| 4  | In `packResponse` failure path, execution stops after `ctx.redirect` — downstream logic does not run                        | VERIFIED | Lines 271-274: `if (!result.success) { ctx.redirect(...); return; }`. The `return` is present inside the `if` block.                  |
| 5  | `getPaymentGateway()` called inside method bodies, not at module load time                                                   | VERIFIED | Both service files call `getPaymentGateway()` inline at the point of use (inside async method bodies), never at top-level scope.     |
| 6  | The string `"webpay"` does not appear in `payment.ts` as a `payment_method` value                                            | VERIFIED | Grep of `"webpay"` in `payment.ts` returns zero matches.                                                                             |
| 7  | Order schema enum and generated types accept `"transbank"` as a valid `payment_method`                                       | VERIFIED | `schema.json` enum: `["webpay", "transbank"]`. `order.utils.ts` `payment_method: string` broadened; cast at entityService call.      |

**Score:** 7/7 truths verified

---

### Required Artifacts (from 02-02-PLAN.md must_haves)

| Artifact                                                                        | Expected                                               | Status     | Details                                                                                |
|---------------------------------------------------------------------------------|--------------------------------------------------------|------------|----------------------------------------------------------------------------------------|
| `apps/strapi/src/api/payment/services/ad.service.ts`                            | Contains `getPaymentGateway`, no `TransbankServices`   | VERIFIED | Present. `getPaymentGateway` at lines 3, 291, 320. No `TransbankServices` import.     |
| `apps/strapi/src/api/payment/services/pack.service.ts`                          | Contains `getPaymentGateway`, no `TransbankServices`   | VERIFIED | Present. `getPaymentGateway` at lines 2, 53, 89. No `TransbankServices` import.       |
| `apps/strapi/src/api/payment/controllers/payment.ts`                            | Contains `process.env.PAYMENT_GATEWAY` and `return`    | VERIFIED | `PAYMENT_GATEWAY` at lines 213, 304. `return` at line 273 after `ctx.redirect`.       |
| `apps/strapi/src/api/payment/utils/order.utils.ts`                              | `payment_method` type broadened to `string`            | VERIFIED | `payment_method: string` on line 8 of `CreateOrderParams`. Cast at entityService.     |
| `apps/strapi/src/api/order/content-types/order/schema.json`                     | Enum includes `"transbank"`                            | VERIFIED | `"enum": ["webpay", "transbank"]` present in schema.                                  |
| `apps/strapi/src/api/payment/services/__tests__/ad.service.test.ts`             | Wave 0 + GREEN test coverage for WIRE-01               | VERIFIED | File exists, 4 tests covering `processPaidPayment` and `processPaidWebpay`.           |
| `apps/strapi/src/api/payment/services/__tests__/pack.service.test.ts`           | Wave 0 + GREEN test coverage for WIRE-02               | VERIFIED | File exists, 4 tests covering `packPurchase` and `processPaidWebpay`.                 |
| `apps/strapi/src/api/payment/controllers/__tests__/payment.controller.test.ts`  | Wave 0 + GREEN test coverage for WIRE-03 and WIRE-04   | VERIFIED | File exists, 3 tests covering WIRE-04 failure path and WIRE-03 env var routing.       |

---

### Key Link Verification (from 02-02-PLAN.md must_haves.key_links)

| From                                          | To                                              | Via                                                                        | Status     | Details                                                                                                         |
|-----------------------------------------------|-------------------------------------------------|----------------------------------------------------------------------------|------------|-----------------------------------------------------------------------------------------------------------------|
| `apps/strapi/.../services/ad.service.ts`      | `apps/strapi/.../services/payment-gateway/index.ts` | `import { getPaymentGateway } from '../../../services/payment-gateway'`    | WIRED    | Import on line 3. Called inline at lines 291 (`createTransaction`) and 320 (`commitTransaction`).              |
| `apps/strapi/.../services/pack.service.ts`    | `apps/strapi/.../services/payment-gateway/index.ts` | `import { getPaymentGateway } from '../../../services/payment-gateway'`    | WIRED    | Import on line 2. Called inline at lines 53 (`createTransaction`) and 89 (`commitTransaction`).                |
| `apps/strapi/.../controllers/payment.ts`      | `process.env.PAYMENT_GATEWAY`                   | `payment_method: process.env.PAYMENT_GATEWAY ?? "transbank"`               | WIRED    | Both `adResponse` (line 213) and `packResponse` (line 304) use the env var expression. No hardcoded `"webpay"`. |

---

### Requirements Coverage

| Requirement | Source Plan  | Description                                                                                    | Status     | Evidence                                                                                      |
|-------------|--------------|------------------------------------------------------------------------------------------------|------------|-----------------------------------------------------------------------------------------------|
| WIRE-01     | 02-01, 02-02 | `ad.service.ts` uses `getPaymentGateway()` instead of `TransbankServices` directly           | SATISFIED | Import + two call sites confirmed. Test coverage in `ad.service.test.ts`.                   |
| WIRE-02     | 02-01, 02-02 | `pack.service.ts` uses `getPaymentGateway()` instead of `TransbankServices` directly         | SATISFIED | Import + two call sites confirmed. Test coverage in `pack.service.test.ts`.                 |
| WIRE-03     | 02-01, 02-02 | Controller replaces hardcoded `"webpay"` with `process.env.PAYMENT_GATEWAY ?? "transbank"`   | SATISFIED | Lines 213 and 304 in `payment.ts` use env var. Test coverage in `payment.controller.test.ts`. |
| WIRE-04     | 02-01, 02-02 | `return` added after `ctx.redirect` in `packResponse` failure path                            | SATISFIED | Line 273 has `return;` inside `if (!result.success)` block. Test coverage in `payment.controller.test.ts`. |

All four WIRE requirements are satisfied. No orphaned requirements.

---

### Anti-Patterns Found

| File                                                                           | Line | Pattern                                                             | Severity | Impact                                                                                                                              |
|--------------------------------------------------------------------------------|------|---------------------------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------------------------------------|
| `apps/strapi/src/api/payment/controllers/payment.ts`                           | 228  | `adResponse`: checks `!result.success` AFTER calling `createAdOrder` | Info     | Pre-existing structural issue — order is created even when `result.success` is false. Out of scope for WIRE-04 (which targets `packResponse` only). No WIRE requirement covers this. |
| `apps/strapi/src/api/payment/controllers/payment.ts`                           | 269  | `console.log("result", result)` in `packResponse`                   | Warning  | Debug log left in production code. Not a blocker for phase goal, but should be removed before merge.                                |
| `apps/strapi/src/api/payment/services/__tests__/ad.service.test.ts`            | 105+ | Comments still say "Will FAIL in RED state"                         | Info     | Wave 0 test documentation is stale post-Wave 1. Tests now pass (GREEN). Comment accuracy is cosmetic only — no functional impact.  |

**Severity legend:** Info (notable, not blocking) | Warning (incomplete, non-blocking) | Blocker (prevents goal)

No blockers found.

---

### Human Verification Required

None. All success criteria for this phase are programmatically verifiable:
- Import patterns confirmed via grep
- Call site wiring confirmed via file read
- `return` statement presence confirmed at exact location
- Env var expression confirmed at both occurrence sites
- Schema enum extension confirmed via JSON read
- Git commits `07de957` and `158f130` confirmed present in log

---

### Gaps Summary

No gaps. All four WIRE requirements are fully implemented and verified against the actual codebase. The key changes are:

- **Services rewired**: Both `ad.service.ts` and `pack.service.ts` replaced their `TransbankServices` imports with `getPaymentGateway()` calls. The call pattern (`getPaymentGateway().createTransaction(...)` and `getPaymentGateway().commitTransaction(...)`) is used inline inside method bodies, which is correct — env vars are read at call time, not module load time.

- **Hardcoded string eliminated**: Both `OrderUtils.createAdOrder` calls in `payment.ts` (`adResponse` at line 213 and `packResponse` at line 304) now read from `process.env.PAYMENT_GATEWAY ?? "transbank"` instead of the hardcoded `"webpay"` literal.

- **Fall-through bug fixed**: The `packResponse` failure path now has `return;` immediately after `ctx.redirect(...)`, preventing `documentDetails`, `generateFactoDocument`, and `createAdOrder` from executing when payment fails.

- **Type system updated**: `CreateOrderParams.payment_method` broadened to `string`, schema enum extended to include `"transbank"`, and `types/generated/contentTypes.d.ts` updated to match — enabling the default `"transbank"` value to pass TypeScript compilation.

One pre-existing concern (out of scope): the `adResponse` handler contains a structural quirk where `createAdOrder` is called before checking `!result.success`, meaning orders are created regardless of `result.success`. This was present before Phase 2 and was not targeted by any WIRE requirement. It is flagged as informational only.

---

_Verified: 2026-03-04T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
