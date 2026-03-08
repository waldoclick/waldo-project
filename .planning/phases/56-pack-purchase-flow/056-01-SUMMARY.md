---
phase: 56-pack-purchase-flow
plan: "056-01"
subsystem: ui
tags: [nuxt, vue, pinia, adStore, pack-flow, dead-code-removal]

# Dependency graph
requires:
  - phase: 55-store-unification
    provides: adStore.updatePack action and pack field; packs.store.ts removal groundwork
provides:
  - CardPack.vue wired to adStore and navigating to /pagar
  - /packs/comprar route eliminated (404)
  - BuyPack.vue, FormPack.vue, PackMethod.vue, PackInvoice.vue, BarPacks.vue deleted
  - usePackPaymentSummary.ts deleted
  - pack.store.ts deleted
affects:
  - 57-payment-hub-adaptation

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "adStore.updatePack(packId) as the single entry point for pack selection from /packs"
    - "router.push('/pagar') as the universal checkout redirect from all paid flows"

key-files:
  created: []
  modified:
    - apps/website/app/components/CardPack.vue
    - apps/website/app/types/pack.d.ts

key-decisions:
  - "Pack interface extended with recommended? and quantity? optional fields to satisfy TypeScript after strict prop typing"

patterns-established:
  - "Pack flow: /packs → adStore.updatePack(id) → router.push('/pagar') — no intermediate /packs/comprar step"

requirements-completed:
  - PACK-01
  - PACK-02
  - PACK-03
  - CLN-01

# Metrics
duration: 2min
completed: 2026-03-08
---

# Phase 56 Plan 01: Pack Purchase Flow Summary

**CardPack.vue rewired from pack.store to adStore, navigating to /pagar; 8-file /packs/comprar dead-code tree deleted; nuxt typecheck passes clean**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T23:21:39Z
- **Completed:** 2026-03-08T23:23:19Z
- **Tasks:** 2
- **Files modified:** 2 (modified), 8 (deleted)

## Accomplishments
- CardPack.vue `buyPack()` now calls `adStore.updatePack(packId)` and `router.push('/pagar')` instead of the obsolete `packStore` + `/packs/comprar`
- All 8 files forming the closed `/packs/comprar` dependency tree deleted with zero remaining dangling references
- `nuxt typecheck` passes with zero TypeScript errors after plan completion

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite CardPack.vue to use adStore and navigate to /pagar** - `bc56f15` (feat)
2. **Task 2: Delete obsolete files and verify nuxt typecheck** - `0de6a4f` (chore)

**Plan metadata:** _(see final docs commit)_

## Files Created/Modified
- `apps/website/app/components/CardPack.vue` — prop typed as `Pack`, imports `useAdStore`, `buyPack` writes to adStore and navigates to `/pagar`
- `apps/website/app/types/pack.d.ts` — added `recommended?: boolean` and `quantity?: number` optional fields to `Pack` interface

## Files Deleted
- `apps/website/app/pages/packs/comprar.vue`
- `apps/website/app/components/BuyPack.vue`
- `apps/website/app/components/FormPack.vue`
- `apps/website/app/components/PackMethod.vue`
- `apps/website/app/components/PackInvoice.vue`
- `apps/website/app/components/BarPacks.vue`
- `apps/website/app/composables/usePackPaymentSummary.ts`
- `apps/website/app/stores/pack.store.ts`

## Decisions Made
- Extended `Pack` interface with `recommended?: boolean` and `quantity?: number` — these optional fields were already used by the CardPack.vue template but were missing from the type definition. Adding them was necessary to satisfy strict TypeScript checking after removing the `pack: any` prop type.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added missing `recommended` and `quantity` fields to Pack interface**
- **Found during:** Task 2 (nuxt typecheck verification)
- **Issue:** The `Pack` interface in `pack.d.ts` did not declare `recommended` and `quantity` fields. When Task 1 changed the prop from `pack: any` to `pack: Pack`, TypeScript correctly flagged the two template bindings (`pack.recommended`, `pack.quantity`) as errors.
- **Fix:** Added `recommended?: boolean` and `quantity?: number` as optional fields to the `Pack` interface. The plan's `<interfaces>` block already showed them as optional — they simply had not been added to the source type file yet.
- **Files modified:** `apps/website/app/types/pack.d.ts`
- **Verification:** `nuxt typecheck` exits with zero errors after the fix
- **Committed in:** `0de6a4f` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential type correctness fix. The plan noted these fields explicitly in the `<interfaces>` block — the omission from `pack.d.ts` was an oversight in the source file, not a scope expansion.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 56 plan 01 complete: CardPack → adStore → /pagar flow is live; /packs/comprar is eliminated
- Ready for Phase 57: Payment Hub Adaptation — `/pagar` must now handle pack-only flows (no `adStore.ad.ad_id`) and `FormCheckout` must hide reservation sections in pack-only context

---
*Phase: 56-pack-purchase-flow*
*Completed: 2026-03-08*
