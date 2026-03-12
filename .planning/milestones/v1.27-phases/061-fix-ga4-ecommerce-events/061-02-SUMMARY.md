---
phase: 061-fix-ga4-ecommerce-events
plan: 02
subsystem: analytics
tags: [ga4, ecommerce, gtm, datalayer, vue, nuxt, composable]

# Dependency graph
requires:
  - phase: 061-fix-ga4-ecommerce-events
    provides: purchase() method and PurchaseOrderData interface from plan 01
provides:
  - purchase event wiring in /pagar/gracias.vue using watch(orderData) with purchaseFired guard
  - begin_checkout event wiring in /pagar/index.vue for pack-only flow (ad_id === null)
affects:
  - GA4 ecommerce tracking — purchase and begin_checkout events now fire in correct pages

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "watch(computed, cb, { immediate: true }) for SSR-safe event firing when async data resolves"
    - "purchaseFired ref guard — one-shot boolean prevents double-firing on reactive re-evaluation"
    - "isPackFlow detection via adStore.ad.ad_id === null — pack vs ad-creation flow discriminator in onMounted"

key-files:
  created: []
  modified:
    - apps/website/app/pages/pagar/gracias.vue
    - apps/website/app/pages/pagar/index.vue

key-decisions:
  - "watch(orderData, ..., { immediate: true }) chosen over onMounted to handle SSR hydration case where data is already populated before mount"
  - "purchase() uses order data (not adStore analytics) so adStore.clearAll() in onMounted doesn't affect event payload"
  - "beginCheckout() is a no-op if adStore analytics items are empty — correct behavior for pack-only flow where pack analytics may not be set"

patterns-established:
  - "Pattern: fire analytics before clearAll — watch fires synchronously on data availability, onMounted clearAll runs after"

requirements-completed:
  - GA-01
  - GA-02
  - GA-03
  - GA-04

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 061 Plan 02: Wire GA4 Events in pagar Pages Summary

**`watch(orderData)` purchase event in /pagar/gracias.vue and `beginCheckout()` on /pagar/index.vue for pack-only flow — completing the GA4 ecommerce event chain**

## Performance

- **Duration:** ~5 min (continuation — code already implemented in prior session)
- **Started:** 2026-03-12T20:57:38Z
- **Completed:** 2026-03-12T20:57:38Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `/pagar/gracias.vue`: `watch(orderData, handler, { immediate: true })` fires `adAnalytics.purchase(order)` exactly once when order data resolves — using `purchaseFired` ref as one-shot guard; `adStore.clearAll()` remains in `onMounted` and cannot clear event data since purchase reads from the order object
- `/pagar/index.vue`: `onMounted` fires `adAnalytics.beginCheckout()` only when `adStore.ad.ad_id === null` (pack-only flow); ad-creation flow is unaffected (begin_checkout already fires in anunciar/resumen.vue)
- All 7 page tests in `tests/pages/gracias.test.ts` pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Fire purchase event in pagar/gracias.vue before clearAll** - `41836a2` (feat)
2. **Task 2: Fire begin_checkout in pagar/index.vue for pack-only flow** - `be85762` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `apps/website/app/pages/pagar/gracias.vue` — Added `watch(orderData, ..., { immediate: true })` to fire `adAnalytics.purchase(order as PurchaseOrderData)` once on data availability, with `purchaseFired` guard; `adStore.clearAll()` retained in `onMounted`
- `apps/website/app/pages/pagar/index.vue` — Added `onMounted` with `isPackFlow` check (`adStore.ad.ad_id === null`) to fire `adAnalytics.beginCheckout()`; imports for `useAdStore`, `useAdAnalytics`, `onMounted`

## Decisions Made

- **`watch(orderData, ..., { immediate: true })` over `onMounted`** — `onMounted` can't guarantee order data is available (SSR hydration may have it already; lazy-loaded case has it later). `watch` with `immediate: true` handles both cases cleanly.
- **Order data drives purchase event, not adStore analytics** — Since `adStore.clearAll()` runs in `onMounted` and would wipe analytics state, using the fetched order object directly ensures the event always has complete data regardless of mount timing.
- **beginCheckout() no-op for empty items is acceptable** — In pack-only flow, analytics items (pack_selected, featured_selected) may be null. The existing `if (items.length > 0)` guard in `pushEvent` ensures no empty/undefined event is sent.

## Deviations from Plan

None - plan executed exactly as written. Both files already had the implementation in place from a prior session (tasks were pre-committed). Verified correctness and test passage.

## Issues Encountered

Pre-existing test failure in `tests/components/ResumeOrder.test.ts` (3 tests failing) — expects "Código de comercio" field that was intentionally removed in quick task 6. This is out of scope for this plan and was not introduced by plan 02 changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Complete GA4 ecommerce event chain is now wired:
  - `add_to_cart` fires on pack/feature selection (existing)
  - `begin_checkout` fires on `/pagar` entry for pack-only flow (plan 02)
  - `begin_checkout` fires on `/anunciar/resumen` for ad-creation flow (existing)
  - `add_payment_info` fires in `CheckoutDefault.vue` (existing)
  - `purchase` fires on `/pagar/gracias` when order data resolves (plan 02)
- Phase 061 is complete — all GA4 ecommerce requirements fulfilled
- No blockers.

---
*Phase: 061-fix-ga4-ecommerce-events*
*Completed: 2026-03-12*

## Self-Check: PASSED
