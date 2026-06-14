---
phase: 120-refactor-pro-subscription-model
plan: "02"
subsystem: strapi-payment-pro
tags: [pro-subscription, oneclick, charge-before-activate, error-handling]
dependency_graph:
  requires: ["120-01"]
  provides: ["subscription-pro-record-on-inscription", "charge-before-activate-order", "charge-failed-error-page"]
  affects: ["apps/strapi/src/api/payment/controllers/payment.ts", "apps/website/app/pages/pro/error.vue"]
tech_stack:
  added: []
  patterns: ["charge-before-activate", "dual-write card data", "subscription-pro entity creation"]
key_files:
  created: []
  modified:
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/website/app/pages/pro/error.vue
decisions:
  - "Dual-write card data to both subscription-pro and user fields — Plan 03 will remove user fields after migration is complete"
  - "chargeResult.rawResponse included in order payment_response for audit trail of the Oneclick charge"
  - "authorizeCharge uses todayCompact date suffix on buy_order/childBuyOrder to avoid collisions"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-09"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 120 Plan 02: Fix Charge-Before-Activate and Subscription-Pro Record Creation Summary

Rewrote proResponse to charge via Oneclick before activating the user, create a subscription-pro record on successful charge, and handle charge failures with a dedicated error page reason.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix charge-before-activate order in proResponse and create subscription-pro record | c9bd0d99 | apps/strapi/src/api/payment/controllers/payment.ts |
| 2 | Add charge-failed reason to pro error page | df1043ac | apps/website/app/pages/pro/error.vue |

## What Was Built

### Task 1: Charge-Before-Activate Fix (payment.ts)

The `proResponse` method was rewritten to enforce the correct order:

**Before (broken):**
1. `finishInscription` — get tbkUser/cardType/last4
2. `entityService.update` — activate user (pro_status: "active") + store card data
3. Calculate prorated price
4. Create order/Facto (non-fatal)

**After (correct):**
1. `finishInscription` — get tbkUser/cardType/last4
2. Calculate prorated price (moved before charge)
3. `authorizeCharge` — charge the first month's prorated amount **before** activating
4. If charge fails → redirect to `/pro/error?reason=charge-failed` and RETURN (user NOT activated)
5. `subProCreate("api::subscription-pro.subscription-pro")` — create subscription-pro record with card data
6. `entityService.update` — activate user (pro_status: "active") + dual-write card data to user fields
7. Create order + Facto document (non-fatal)
8. Recalculate sort_priority for featured ads

Key implementation details:
- `todayCompact` date suffix on buy_order prevents Transbank collisions on same-day retries
- `chargeResult.rawResponse` included in order `payment_response` for audit
- Card data dual-written to user fields for backwards compatibility until Plan 03 removes them

### Task 2: Pro Error Page (error.vue)

Added `charge-failed` handling to both computed properties:
- `errorTitle`: "Error en el cobro"
- `errorDescription`: "Tu tarjeta fue registrada pero no se pudo realizar el cobro del primer mes. Puedes intentarlo nuevamente desde tu cuenta."

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — card data dual-write to user fields is intentional and documented (Plan 03 will remove it).

## Self-Check: PASSED

- `apps/strapi/src/api/payment/controllers/payment.ts` — modified (authorizeCharge at line 502, before pro_status: "active" at line 544)
- `apps/website/app/pages/pro/error.vue` — modified (charge-failed appears 2 times)
- Commit c9bd0d99 — exists
- Commit df1043ac — exists
