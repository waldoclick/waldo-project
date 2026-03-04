---
phase: 02-call-site-wiring-and-bug-fixes
plan: "01"
subsystem: testing
tags: [jest, ts-jest, tdd, payments, transbank, payment-gateway]

# Dependency graph
requires:
  - phase: 01-interface-and-adapter-layer
    provides: IPaymentGateway interface, getPaymentGateway registry, TransbankAdapter

provides:
  - RED test suite for WIRE-01: ad.service.ts getPaymentGateway wiring
  - RED test suite for WIRE-02: pack.service.ts getPaymentGateway wiring
  - RED test suite for WIRE-03: payment_method env var wiring in controller
  - RED test suite for WIRE-04: missing return after ctx.redirect on pack failure path

affects:
  - 02-call-site-wiring-and-bug-fixes (Wave 1 implementation uses these tests to go GREEN)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "jest.mock at module level for payment-gateway barrel before import (hoisting requirement)"
    - "Path resolution: from services/__tests__/, payment-gateway is at ../../../../services/payment-gateway"
    - "Path resolution: from controllers/__tests__/, logtail is at ../../../../utils/logtail"
    - "Cast result to `any` to avoid TypeScript union type narrowing on undeclared fields"

key-files:
  created:
    - apps/strapi/src/api/payment/services/__tests__/ad.service.test.ts
    - apps/strapi/src/api/payment/services/__tests__/pack.service.test.ts
    - apps/strapi/src/api/payment/controllers/__tests__/payment.controller.test.ts
  modified: []

key-decisions:
  - "Import paths from __tests__ subdirectory are one level deeper than service-level paths — plan action block used service-level paths, corrected to __tests__-level paths (../../../../services/payment-gateway, not ../../../services/payment-gateway)"
  - "Controller test uses (controller as any).packResponse(ctx) because controllerWrapper returns an arrow function that is not typed on the default export directly"
  - "WIRE-04 RED state confirmed: documentDetails IS called on payment failure because packResponse is missing `return` after ctx.redirect"
  - "WIRE-03 RED state confirmed: createAdOrder receives payment_method: webpay (hardcoded), not env var value"

patterns-established:
  - "Wave 0 TDD: test files live in __tests__/ subdirectory alongside source files"
  - "Mock all Strapi-dependent utilities (PaymentUtils, logtail) to prevent import-time errors in unit tests"
  - "Use beforeEach to reset mock return values so tests are isolated from each other"

requirements-completed: [WIRE-01, WIRE-02, WIRE-03, WIRE-04]

# Metrics
duration: 4min
completed: 2026-03-04
---

# Phase 02 Plan 01: Call Site Wiring — Wave 0 Tests Summary

**Three failing test files asserting getPaymentGateway() call site wiring and packResponse missing-return bug — RED state, 11 tests fail across WIRE-01 through WIRE-04**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-04T10:49:48Z
- **Completed:** 2026-03-04T10:54:00Z
- **Tasks:** 3 of 3
- **Files modified:** 3 created

## Accomplishments
- Created `ad.service.test.ts` with 4 RED tests asserting `getPaymentGateway()` is called instead of `TransbankServices` in `processPaidPayment` and `processPaidWebpay`
- Created `pack.service.test.ts` with 4 RED tests asserting `getPaymentGateway()` is called instead of `TransbankServices` in `packPurchase` and `processPaidWebpay`
- Created `payment.controller.test.ts` with 3 RED tests confirming WIRE-04 missing-return bug and WIRE-03 hardcoded `"webpay"` string

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing ad service test (WIRE-01)** - `9a9356e` (test)
2. **Task 2: Write failing pack service test (WIRE-02)** - `c3cb396` (test)
3. **Task 3: Write failing controller tests (WIRE-03, WIRE-04)** - `0fec537` (test)

**Plan metadata:** TBD (docs: complete plan)

_Note: TDD tasks committed as test — single commit per task (no GREEN yet, this is Wave 0)_

## Files Created/Modified
- `apps/strapi/src/api/payment/services/__tests__/ad.service.test.ts` — RED tests for WIRE-01 (processPaidPayment + processPaidWebpay gateway wiring)
- `apps/strapi/src/api/payment/services/__tests__/pack.service.test.ts` — RED tests for WIRE-02 (packPurchase + processPaidWebpay gateway wiring)
- `apps/strapi/src/api/payment/controllers/__tests__/payment.controller.test.ts` — RED tests for WIRE-03 (payment_method env var) and WIRE-04 (missing return on failure)

## Decisions Made
- Import path correction: the plan's action block referenced paths relative to the source file, but test files in `__tests__/` are one level deeper. Corrected `../../../services/payment-gateway` to `../../../../services/payment-gateway` throughout.
- Cast `processPaidPayment` return to `any` to suppress TypeScript union narrowing on the `.webpay` property (which doesn't exist on all union members of the current return type).
- Controller tests access the handler via `(controller as any).packResponse(ctx)` because `controllerWrapper` wraps the handler and the public type doesn't expose it directly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Corrected relative import paths for __tests__ subdirectory**
- **Found during:** Task 1 (ad.service.test.ts)
- **Issue:** Plan action block used paths relative to the source service file (`../../../services/payment-gateway`). Tests live in `__tests__/` one level deeper, so the correct path is `../../../../services/payment-gateway`. TypeScript reported TS2307 on first run.
- **Fix:** Updated all mock paths and import paths to use the correct depth (4 levels up to reach `src/`) before committing.
- **Files modified:** `ad.service.test.ts`
- **Verification:** `npx jest ad.service.test.ts` ran and produced assertion failures (not TS2307)
- **Committed in:** 9a9356e (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking path correction)
**Impact on plan:** Necessary correction; no scope change. All WIRE requirements covered.

## Issues Encountered
- Pre-existing `general.utils.test.ts` integration test fails when running the full `src/api/payment` suite (requires a running Strapi instance). This is pre-existing and out of scope — not caused by this plan's changes.

## Next Phase Readiness
- Wave 0 tests complete. Wave 1 implementation (02-02-PLAN.md) can proceed.
- When Wave 1 lands: run `npx jest src/api/payment/services/__tests__/` and `npx jest src/api/payment/controllers/__tests__/` to verify GREEN state.
- All 11 test failures are expected RED state — Wave 1 fixes will make them pass.

## Self-Check: PASSED

- FOUND: `apps/strapi/src/api/payment/services/__tests__/ad.service.test.ts`
- FOUND: `apps/strapi/src/api/payment/services/__tests__/pack.service.test.ts`
- FOUND: `apps/strapi/src/api/payment/controllers/__tests__/payment.controller.test.ts`
- FOUND: `9a9356e` — test(02-01): add failing ad service test for WIRE-01
- FOUND: `c3cb396` — test(02-01): add failing pack service test for WIRE-02
- FOUND: `0fec537` — test(02-01): add failing controller tests for WIRE-03 and WIRE-04

---
*Phase: 02-call-site-wiring-and-bug-fixes*
*Completed: 2026-03-04*
