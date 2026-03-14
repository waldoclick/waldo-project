---
phase: 083-ecommerce-bug-fixes
plan: 02
subsystem: ui
tags: [ga4, analytics, nuxt, vue, vitest, purchase-event]

# Dependency graph
requires:
  - phase: 083-01
    provides: "purchase() composable fix handling free-ad shape (amount: 0, documentId as item_id)"
provides:
  - "GA4 purchase event with value: 0 fires on free-ad success page (/anunciar/gracias)"
  - "purchaseFired ref guard prevents double-fire on SSR hydration"
  - "17 Vitest tests covering full purchase() contract including free-ad shape"
affects: [084-ad-discovery-tracking, 085-contact-auth-blog-events]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "watch(adData, { immediate: true }) + purchaseFired ref guard — mirrors pagar/gracias.vue pattern for SSR-safe analytics"
    - "Free-ad PurchaseOrderData: { documentId: ad.documentId ?? route.query.ad, amount: 0, currency: ad.currency ?? 'CLP' }"

key-files:
  created: []
  modified:
    - apps/website/app/pages/anunciar/gracias.vue
    - apps/website/app/composables/useAdAnalytics.test.ts

key-decisions:
  - "Free-ad purchase event uses amount: 0 (not undefined) — enables funnel comparison between free and paid conversions in GA4"
  - "documentId fallback to route.query.ad covers SSR edge case where ad.documentId may not be populated yet"

patterns-established:
  - "All success pages (free or paid) fire purchase() on adData/orderData watcher — consistent GA4 conversion tracking pattern"

requirements-completed: [ECOM-03]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 083 Plan 02: Free-Ad GA4 Purchase Event Summary

**GA4 `purchase` event with `value: 0` wired in `/anunciar/gracias` via `watch(adData)` + `purchaseFired` guard, mirroring the `pagar/gracias.vue` pattern — 17 tests green**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-14T15:11:09Z
- **Completed:** 2026-03-14T15:12:33Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added two ECOM-03 Vitest tests confirming `purchase()` handles free-ad shape (value: 0, item_id from documentId)
- Wired `watch(adData, { immediate: true })` + `purchaseFired` guard in `anunciar/gracias.vue`
- Free-ad conversions now appear in GA4 Realtime as `purchase` events with `value: 0`
- TypeScript clean — zero new TS errors introduced

## Task Commits

Each task was committed atomically:

1. **Task 1: Add failing tests for free-ad purchase event** - `af2d672` (test)
2. **Task 2: Wire purchase event in anunciar/gracias.vue** - `2e36b7c` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `apps/website/app/pages/anunciar/gracias.vue` — Added `ref`/`watch` imports, `useAdAnalytics` import, `purchaseFired` ref, and `watch(adData)` watcher that calls `adAnalytics.purchase()` with `amount: 0`
- `apps/website/app/composables/useAdAnalytics.test.ts` — Added 2 ECOM-03 tests (17 total): value is numeric 0, item_id uses ad.documentId

## Decisions Made
- Free-ad purchase event uses `amount: 0` (not `undefined`) to enable GA4 funnel comparison between free and paid conversions
- `documentId` fallback to `route.query.ad` covers edge case where ad object may not carry `documentId` at SSR time (the route query param IS the documentId used to fetch the ad)
- Pattern mirrors `pagar/gracias.vue` exactly to ensure consistent analytics behavior across both success flows

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 083 complete — ECOM-01, ECOM-02, ECOM-03 all resolved
- Ready for Phase 084: Ad Discovery Tracking (DISC-01, DISC-02, DISC-03)

---
*Phase: 083-ecommerce-bug-fixes*
*Completed: 2026-03-14*

## Self-Check: PASSED

- ✅ `apps/website/app/pages/anunciar/gracias.vue` — exists on disk
- ✅ `apps/website/app/composables/useAdAnalytics.test.ts` — exists on disk
- ✅ `.planning/phases/083-ecommerce-bug-fixes/083-02-SUMMARY.md` — exists on disk
- ✅ Commit `af2d672` (test: ECOM-03 tests) — verified in git log
- ✅ Commit `2e36b7c` (feat: wire purchase event) — verified in git log
- ✅ Commit `c7c1614` (docs: metadata) — verified in git log
