---
phase: 02-call-site-wiring-and-bug-fixes
plan: "02"
subsystem: payments

tags: [transbank, payment-gateway, ad-service, pack-service, payment-controller, typescript, jest]

# Dependency graph
requires:
  - phase: 01-interface-and-adapter-layer
    provides: IPaymentGateway interface, getPaymentGateway registry, TransbankAdapter
  - phase: 02-call-site-wiring-and-bug-fixes
    plan: 01
    provides: Wave 0 failing test suites for WIRE-01 through WIRE-04

provides:
  - ad.service.ts using getPaymentGateway() — no direct TransbankServices dependency
  - pack.service.ts using getPaymentGateway() — no direct TransbankServices dependency
  - payment.ts with dynamic payment_method from PAYMENT_GATEWAY env var
  - packResponse failure path with return after ctx.redirect (no fall-through)
  - Order schema enum extended to include "transbank" alongside "webpay"

affects:
  - Any future payment gateway additions (zero code changes needed in call sites)
  - Order content type (schema enum extended)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Call getPaymentGateway() inside method bodies — env vars read at call time, never at module load"
    - "process.env.PAYMENT_GATEWAY ?? \"transbank\" pattern for gateway-agnostic payment_method"
    - "Cast payment_method as union literal at entityService call to satisfy Strapi generated types"

key-files:
  created: []
  modified:
    - apps/strapi/src/api/payment/services/ad.service.ts
    - apps/strapi/src/api/payment/services/pack.service.ts
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/api/payment/utils/order.utils.ts
    - apps/strapi/src/api/order/content-types/order/schema.json
    - apps/strapi/types/generated/contentTypes.d.ts
    - apps/strapi/src/api/payment/services/__tests__/ad.service.test.ts

key-decisions:
  - "Order schema enum extended from [\"webpay\"] to [\"webpay\", \"transbank\"] — required for PAYMENT_GATEWAY env var default value \"transbank\" to be accepted by Strapi entity service"
  - "CreateOrderParams.payment_method type broadened from literal \"webpay\" to string; cast as union at entityService call to avoid breaking Strapi type inference"
  - "ad.service.test.ts beforeEach needed extractIdsFromMeta and adReservation.getAdReservationAvailable mocks — test was designed as RED-only and had incomplete mock setup for the GREEN path"

patterns-established:
  - "getPaymentGateway() called inline at point of use — never stored in module-level variable"
  - "Strapi schema enum updates require matching change to types/generated/contentTypes.d.ts"

requirements-completed: [WIRE-01, WIRE-02, WIRE-03, WIRE-04]

# Metrics
duration: 8min
completed: 2026-03-04
---

# Phase 02 Plan 02: Call Site Wiring and Bug Fixes — Wave 1 Implementation Summary

**All four WIRE call sites rewired to getPaymentGateway(), payment_method env-var driven, and packResponse fall-through bug fixed — all 11 Wave 0 tests now GREEN**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-04T10:56:00Z
- **Completed:** 2026-03-04T11:04:10Z
- **Tasks:** 2 of 2
- **Files modified:** 7

## Accomplishments
- Replaced `TransbankServices.transbank.*` calls with `getPaymentGateway().*` in `ad.service.ts` (processPaidPayment + processPaidWebpay) and `pack.service.ts` (packPurchase + processPaidWebpay)
- Replaced both hardcoded `"webpay"` payment_method values in `payment.ts` with `process.env.PAYMENT_GATEWAY ?? "transbank"`
- Added missing `return` after `ctx.redirect` in packResponse failure path — documentDetails and createAdOrder no longer execute on payment failure
- Extended order schema enum and generated types to accept "transbank" as a valid payment_method value
- All 11 Wave 0 tests flipped from RED to GREEN; TypeScript compiles clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewire ad.service.ts and pack.service.ts** - `07de957` (feat)
2. **Task 2: Fix hardcoded payment_method and missing return in payment.ts** - `158f130` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified
- `apps/strapi/src/api/payment/services/ad.service.ts` — Import swapped to `getPaymentGateway`; createTransaction and commitTransaction now call through gateway abstraction
- `apps/strapi/src/api/payment/services/pack.service.ts` — Same import swap and call site rewiring
- `apps/strapi/src/api/payment/controllers/payment.ts` — Two `payment_method: "webpay"` replaced with env var expression; `return` added in packResponse failure path
- `apps/strapi/src/api/payment/utils/order.utils.ts` — CreateOrderParams.payment_method broadened to `string`; entityService call uses union cast
- `apps/strapi/src/api/order/content-types/order/schema.json` — Enum extended to `["webpay", "transbank"]`
- `apps/strapi/types/generated/contentTypes.d.ts` — Generated type updated to match schema enum
- `apps/strapi/src/api/payment/services/__tests__/ad.service.test.ts` — beforeEach mocks completed for GREEN path

## Decisions Made
- Order schema enum needed `"transbank"` added because `process.env.PAYMENT_GATEWAY ?? "transbank"` makes `"transbank"` the default value — without it, TypeScript rejects the string at the entityService call
- `CreateOrderParams.payment_method` widened to `string` so any future gateway can be used without modifying this type; cast at entityService level maintains compile safety
- Test file `ad.service.test.ts` needed `extractIdsFromMeta` and `adReservation.getAdReservationAvailable` in `beforeEach` — the test was only designed for RED state assertions and had insufficient mock coverage for the fully-wired GREEN execution path

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Broadened CreateOrderParams.payment_method type and extended order schema enum**
- **Found during:** Task 2 (Fix hardcoded payment_method)
- **Issue:** `CreateOrderParams.payment_method` was typed as literal `"webpay"` and the Strapi schema only listed `"webpay"` in the enum. Changing payment_method to use `process.env.PAYMENT_GATEWAY ?? "transbank"` caused TypeScript to reject `string` where `"webpay"` was expected.
- **Fix:** (a) Broadened `CreateOrderParams.payment_method` to `string`; (b) added type cast `as "webpay" | "transbank"` at entityService call; (c) extended schema.json enum to `["webpay", "transbank"]`; (d) updated contentTypes.d.ts to match.
- **Files modified:** `order.utils.ts`, `schema.json`, `contentTypes.d.ts`
- **Verification:** `npx tsc --noEmit` exits 0 after fix
- **Committed in:** 158f130 (Task 2 commit)

**2. [Rule 1 - Bug] Completed missing mock setup in ad.service.test.ts beforeEach**
- **Found during:** Task 1 verification (jest run)
- **Issue:** `processPaidWebpay` test "returns success:true when commit is AUTHORIZED" was failing because the test lacked `extractIdsFromMeta` and `adReservation.getAdReservationAvailable` mocks in beforeEach. These mocks were only set up in the sibling `it` block, which was cleared by `jest.clearAllMocks()`. The test was designed for RED state and didn't need these mocks then; now that the gateway is called, execution flows into those code paths.
- **Fix:** Added `extractIdsFromMeta`, `adReservation.getAdReservationAvailable`, and `ad.updateAdReservation` default mock setup to `beforeEach`.
- **Files modified:** `ad.service.test.ts`
- **Verification:** `npx jest src/api/payment/services/__tests__/ad.service.test.ts` — 4/4 pass
- **Committed in:** 07de957 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 — bugs: type mismatch and incomplete test mock setup)
**Impact on plan:** Both fixes necessary for correct TypeScript compilation and full GREEN state. No scope creep.

## Issues Encountered
- Pre-existing integration test failures in `general.utils.test.ts`, `mjml/test.ts`, `weather/test.ts`, and `indicador/indicador.test.ts` — all require a running Strapi instance or external service. Confirmed pre-existing by verifying failures on the base commit. Out of scope for this plan.

## Next Phase Readiness
- All four WIRE requirements complete and verified (WIRE-01 through WIRE-04)
- Payment abstraction layer is now fully active — both service files and controller are gateway-agnostic
- To switch gateways: set `PAYMENT_GATEWAY=<gateway-name>` env var and implement the corresponding adapter
- Phase 2 is complete. No further plans needed.

## Self-Check: PASSED

- FOUND: `apps/strapi/src/api/payment/services/ad.service.ts` — contains `getPaymentGateway`
- FOUND: `apps/strapi/src/api/payment/services/pack.service.ts` — contains `getPaymentGateway`
- FOUND: `apps/strapi/src/api/payment/controllers/payment.ts` — contains `PAYMENT_GATEWAY`
- FOUND: `07de957` — feat(02-02): rewire ad.service.ts and pack.service.ts to use getPaymentGateway()
- FOUND: `158f130` — feat(02-02): fix hardcoded payment_method and missing return in payment.ts

---
*Phase: 02-call-site-wiring-and-bug-fixes*
*Completed: 2026-03-04*
