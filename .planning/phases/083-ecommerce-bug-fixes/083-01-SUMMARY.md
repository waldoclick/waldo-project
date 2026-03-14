---
phase: 083-ecommerce-bug-fixes
plan: 01
subsystem: analytics
tags: [ga4, analytics, ecommerce, vitest, tdd, strapi]

# Dependency graph
requires: []
provides:
  - "GA4 purchase events receive numeric value (not string) — real revenue visible in GA4 dashboard"
  - "GA4 purchase item_id falls back to transactionId when documentId is absent"
  - "15 Vitest tests covering purchase() behavior (12 existing + 3 new)"
affects: [084-ad-discovery-tracking, 085-contact-auth-blog-events]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Number() coercion for Strapi biginteger fields that serialize to strings in JSON responses"
    - "|| operator (not ??) for fallback chains where empty string should trigger fallback"

key-files:
  created: []
  modified:
    - apps/website/app/composables/useAdAnalytics.ts
    - apps/website/app/composables/useAdAnalytics.test.ts

key-decisions:
  - "Used || instead of ?? for item_id fallback — empty string is falsy and must trigger transactionId fallback"
  - "Number() wraps the entire ?? chain to ensure any string/number input produces a number"

patterns-established:
  - "Strapi biginteger defense: always wrap numeric fields from API responses with Number() before passing to GA4"

requirements-completed: [ECOM-01, ECOM-02]

# Metrics
duration: 1min
completed: 2026-03-14
---

# Phase 83 Plan 01: Ecommerce Bug Fixes Summary

**Two-line fix in `useAdAnalytics.purchase()`: `Number()` coercion for Strapi biginteger string amounts and `||` fallback chain for `item_id` — GA4 now receives real revenue and correct item IDs**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-14T15:07:28Z
- **Completed:** 2026-03-14T15:08:46Z
- **Tasks:** 2 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments

- Fixed ECOM-01: `Number()` coercion ensures Strapi `biginteger` strings are converted to numbers before reaching GA4 — revenue dashboard shows real values (e.g. `19990`) instead of `$0`
- Fixed ECOM-02: `item_id` now uses `order.documentId || transactionId || ""` so GA4 item IDs fall back to `buy_order` when `documentId` is absent
- TDD cycle complete: 3 RED tests confirmed bugs exist, GREEN implementation made all 15 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Add failing tests (RED)** - `658a99b` (test)
2. **Task 2: Fix purchase() — value coercion and item_id fallback (GREEN)** - `1d1fd39` (fix)

**Plan metadata:** _(docs commit below)_

_Note: TDD plan — RED commit (test) then GREEN commit (fix)_

## Files Created/Modified

- `apps/website/app/composables/useAdAnalytics.ts` — Two-line fix: `Number()` coercion on `value`, `||` fallback chain on `item_id`
- `apps/website/app/composables/useAdAnalytics.test.ts` — 3 new tests for string-amount coercion (ECOM-01, ECOM-01b) and item_id fallback (ECOM-02); 15 total

## Decisions Made

- **`||` instead of `??` for item_id fallback:** `??` only guards against `null`/`undefined` — empty string `""` passes through unchanged. The `||` operator treats `""` as falsy, correctly triggering the `transactionId` fallback. This is the intended behavior: an empty `documentId` should not be stored as the item ID.
- **`Number()` wrapping the entire chain:** `Number(order.amount ?? order.totalAmount ?? 0)` ensures the coercion applies regardless of which value is picked — whether `amount`, `totalAmount`, or the default `0`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ECOM-01 and ECOM-02 fully resolved with test coverage
- ECOM-03 (remaining ecommerce bug) is the next plan in this phase
- No blockers for 083-02

---
*Phase: 083-ecommerce-bug-fixes*
*Completed: 2026-03-14*
