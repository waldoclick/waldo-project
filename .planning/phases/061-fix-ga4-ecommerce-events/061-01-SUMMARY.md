---
phase: 061-fix-ga4-ecommerce-events
plan: 01
subsystem: analytics
tags: [ga4, ecommerce, gtm, datalayer, vitest, tdd]

# Dependency graph
requires: []
provides:
  - PurchaseOrderData interface exported from useAdAnalytics.ts
  - purchase(order) method in useAdAnalytics composable
  - Optional flow discriminator param in pushEvent() (default "ad_creation")
affects:
  - apps/website/app/pages/pagar/gracias.vue (can now call purchase() after payment)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD for composable logic: write failing tests → implement → verify clean"
    - "pushEvent flow discriminator: optional 4th param disambiguates ad_creation vs pack_purchase GA4 events"

key-files:
  created:
    - apps/website/app/composables/useAdAnalytics.test.ts
  modified:
    - apps/website/app/composables/useAdAnalytics.ts

key-decisions:
  - "purchase() passes empty items array to pushEvent to avoid ecommerce overwrite, full payload lives in extraData.ecommerce"
  - "PurchaseOrderData interface exported so pages can type-check order objects before passing to purchase()"
  - "flow param defaults to 'ad_creation' as 4th positional arg to preserve full backward compatibility"

patterns-established:
  - "Pattern: purchase() owns full ecommerce payload — passes [] as items and full {ecommerce:{...}} in extraData"

requirements-completed:
  - GA-01
  - GA-03
  - GA-04

# Metrics
duration: 3min
completed: 2026-03-11
---

# Phase 061 Plan 01: Fix GA4 Ecommerce Events Summary

**`purchase()` method and `flow` discriminator added to `useAdAnalytics` composable via TDD — enables GA4 ecommerce tracking on /pagar/gracias without relying on cleared ad store state**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-11T13:07:31Z
- **Completed:** 2026-03-11T13:10:08Z
- **Tasks:** 1 (TDD: 2 commits)
- **Files modified:** 2

## Accomplishments

- `purchase(order: PurchaseOrderData)` method added to `useAdAnalytics` composable — builds full GA4 ecommerce purchase event from raw order data
- `pushEvent()` extended with optional 4th `flow` param (defaults to `"ad_creation"` — fully backward compatible)
- `PurchaseOrderData` interface exported for use in page components
- All fallback chains guaranteed: `transaction_id`, `value`, `currency` never `undefined`
- 12 TDD tests covering all fallback paths, flow discriminator, and backward compatibility

## Task Commits

TDD cycle produced 2 atomic commits:

1. **RED — Failing tests** - `42d3160` (test)
2. **GREEN — Implementation** - `a48f1a5` (feat)

**Plan metadata:** (docs commit follows)

_Note: No REFACTOR commit needed — implementation was clean on first pass._

## Files Created/Modified

- `apps/website/app/composables/useAdAnalytics.ts` — Added `PurchaseOrderData` interface, `flow` param to `pushEvent()`, and `purchase()` method
- `apps/website/app/composables/useAdAnalytics.test.ts` — 12 TDD tests for new behavior

## Decisions Made

- **purchase() passes `[]` as items, not the real items array.** The `pushEvent` body has a legacy block that overwrites `eventData.ecommerce` with just `{ items }` when items.length > 0. To preserve the full ecommerce payload (transaction_id, value, currency, items), `purchase()` passes an empty array and puts the complete ecommerce object inside `extraData`. This keeps existing callers working without changing `pushEvent`'s internal logic.
- **PurchaseOrderData interface is exported** so pages importing from the composable can type-check order objects before passing them to `purchase()`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected items arg to avoid ecommerce payload overwrite**

- **Found during:** GREEN phase (tests failing on ecommerce payload assertions)
- **Issue:** The plan spec said `pushEvent("purchase", items, { ecommerce: {...} }, "pack_purchase")` — but `pushEvent` contains `if (items.length > 0) { eventData.ecommerce = { items } }` which overwrites the full ecommerce payload passed via `extraData`
- **Fix:** `purchase()` passes `[]` as the items arg and puts the complete `{ ecommerce: { transaction_id, value, currency, items } }` object inside `extraData` only
- **Files modified:** `apps/website/app/composables/useAdAnalytics.ts`
- **Verification:** All 12 tests pass
- **Committed in:** `a48f1a5` (GREEN commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary correction for correct GA4 payload. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviation above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `useAdAnalytics.purchase()` is ready for use in `apps/website/app/pages/pagar/gracias.vue`
- Import `PurchaseOrderData` and `useAdAnalytics` from `@/composables/useAdAnalytics`
- Call `purchase(order)` after the order is fetched and before or alongside `adStore.clearAll()`
- No blockers.

---
*Phase: 061-fix-ga4-ecommerce-events*
*Completed: 2026-03-11*

## Self-Check

- [x] `apps/website/app/composables/useAdAnalytics.ts` — exists and modified
- [x] `apps/website/app/composables/useAdAnalytics.test.ts` — exists and created
- [x] Commit `42d3160` — exists (RED)
- [x] Commit `a48f1a5` — exists (GREEN)
- [x] 12/12 tests passing
- [x] TypeScript typecheck clean

## Self-Check: PASSED
