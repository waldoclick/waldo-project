---
phase: 060-unified-checkout-endpoint
plan: "01"
subsystem: api
tags: [strapi, webpay, transbank, checkout, payment, recaptcha]

# Dependency graph
requires:
  - phase: 050-free-ad-flow
    provides: PaymentUtils, getPaymentGateway, zohoService patterns
provides:
  - checkout.service.ts with initiateCheckout() and processWebpayReturn()
  - Unified buy_order encoding (userId-packId-adId-featured-timestamp)
  - reCAPTCHA guard updated to /api/payments/checkout
affects:
  - 060-02 (checkout controller uses this service)
  - frontend migration phase (calls /api/payments/checkout)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "buy_order encoding: order-checkout-{userId}-{packId}-{adId}-{featured}-{timestamp}"
    - "IGatewayInitResponse.gatewayRef carries the Webpay token (not .token)"
    - "Zoho CRM sync as floating Promise.resolve().then() — non-blocking"

key-files:
  created:
    - apps/strapi/src/api/payment/services/checkout.service.ts
  modified:
    - apps/strapi/src/middlewares/recaptcha.ts

key-decisions:
  - "Use gatewayRef (not token) from IGatewayInitResponse — aligns with TransbankAdapter contract"
  - "buy_order parsed via split('-') directly; legacy extractIdsFromMeta not used per plan spec"
  - "Pack-included featured reservations linked to ad only when adId > 0 AND featured=false (standalone paid featured is a separate step)"

patterns-established:
  - "CheckoutService pattern: standalone class, no Core.Strapi DI, uses global strapi for DB queries"
  - "buy_order format for checkout: order-checkout-{userId}-{packId}-{adId}-{featured}-{timestamp}"

requirements-completed:
  - CHK-01
  - CHK-02
  - CHK-03
  - CHK-04
  - CHK-05
  - CHK-07

# Metrics
duration: 3min
completed: 2026-03-09
---

# Phase 060 Plan 01: Unified Checkout Service Summary

**Unified checkout.service.ts with initiateCheckout() and processWebpayReturn() covering pack-only, pack+ad, and pack+featured+ad flows via Webpay; recaptcha.ts updated from /api/payments/pack to /api/payments/checkout**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-09T02:33:24Z
- **Completed:** 2026-03-09T02:35:56Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `checkout.service.ts` as a typed singleton class with `initiateCheckout()` and `processWebpayReturn()` — zero `any`, `tsc --noEmit` exits 0
- Unified buy_order encoding captures userId, packId, adId, featured flag, and timestamp for reliable round-trip parsing
- Updated `recaptcha.ts` to guard `/api/payments/checkout` (was `/api/payments/pack`)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create checkout.service.ts** — `2d30343` (feat)
2. **Task 2: Update recaptcha.ts to guard /api/payments/checkout** — `343e1d5` (feat)

## Files Created/Modified

- `apps/strapi/src/api/payment/services/checkout.service.ts` — New unified checkout service class with `initiateCheckout()` and `processWebpayReturn()` methods
- `apps/strapi/src/middlewares/recaptcha.ts` — Single path change: `/api/payments/pack` → `/api/payments/checkout`

## Decisions Made

- **`IGatewayInitResponse.gatewayRef` not `.token`**: The TransbankAdapter maps `result.token → gatewayRef` when wrapping the payment gateway abstraction. The `InitiateResult` interface exposes this as `token` for callers while internally using the gateway contract correctly.
- **Legacy `extractIdsFromMeta` not used**: Per plan specification, the new `processWebpayReturn` parses buy_order with `split('-')` directly — the legacy helper encodes a different format.
- **Pack-included featured reservation linking**: Only linked to ad when `adId > 0 AND !featured` — if the user is also buying a standalone paid featured (`featured=true`), step 9 handles that separately, so step 8 must not double-link.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used `result.gatewayRef` instead of `result.token` and `String()` for error message**
- **Found during:** Task 1 (checkout.service.ts creation)
- **Issue:** Plan comment showed `result.token` but `IGatewayInitResponse` type uses `gatewayRef`. Also `result.error` is typed `unknown` so direct string assignment fails.
- **Fix:** Changed `result.token` → `result.gatewayRef`; wrapped error in `String(result.error ?? "...")`
- **Files modified:** `apps/strapi/src/api/payment/services/checkout.service.ts`
- **Verification:** `tsc --noEmit` exits 0, LSP errors resolved
- **Committed in:** `2d30343` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — type mismatch with gateway interface)
**Impact on plan:** Necessary correctness fix; no scope change.

## Issues Encountered

None — both tasks completed as planned.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `checkout.service.ts` singleton ready for import and use by the checkout controller (060-02)
- `recaptcha.ts` already protecting the new endpoint
- `ad.service.ts`, `free-ad.service.ts`, `pack.service.ts` untouched (confirmed via git diff)

---
*Phase: 060-unified-checkout-endpoint*
*Completed: 2026-03-09*
