---
phase: 55-store-unification
plan: "01"
subsystem: ui
tags: [nuxt, vue, pinia, strapi, composables, refactor]

# Dependency graph
requires: []
provides:
  - usePacksList composable with TTL cache (module-level, shared across call sites)
  - PaymentMethod.vue free of packs.store dependency
  - PackMethod.vue free of packs.store dependency
  - useAdPaymentSummary.ts free of packs.store dependency
  - usePackPaymentSummary.ts free of packs.store dependency
affects:
  - 55-store-unification
  - 56-pack-purchase-flow
  - 57-payment-hub-adaptation

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Module-level cache pattern: ref + lastFetch number declared outside composable function, shared across all call sites within the same page"
    - "readonly() wrapper on returned refs to prevent accidental mutation"
    - "TTL cache guard: packs.value.length > 0 && Date.now() - lastFetch < TTL"

key-files:
  created:
    - apps/website/app/composables/usePacksList.ts
  modified:
    - apps/website/app/components/PaymentMethod.vue
    - apps/website/app/components/PackMethod.vue
    - apps/website/app/composables/useAdPaymentSummary.ts
    - apps/website/app/composables/usePackPaymentSummary.ts

key-decisions:
  - "usePacksList uses module-level cache (not Pinia) — no store overhead, TTL ensures freshness across navigation"
  - "readonly() on returned packs ref prevents accidental mutation from consumers"
  - "computed import retained in PaymentMethod.vue — adReservations, freeAdText, paidAdText still require it"

patterns-established:
  - "Module-level ref + lastFetch pattern for composable-level caching (alternative to Pinia when state is non-persistent)"
  - "await loadPacks() as first statement in onMounted for components needing pack data"

requirements-completed:
  - PAY-04
  - CLN-02

# Metrics
duration: 2min
completed: 2026-03-08
---

# Phase 55 Plan 01: Create usePacksList composable and migrate components and composables Summary

**New `usePacksList` composable with module-level TTL cache replaces `packs.store` in PaymentMethod.vue, PackMethod.vue, useAdPaymentSummary.ts, and usePackPaymentSummary.ts**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T22:49:56Z
- **Completed:** 2026-03-08T22:52:37Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Created `usePacksList` composable with module-level TTL cache (30min / 1_800_000ms) shared across all call sites
- Migrated all 4 consumer files (`PaymentMethod.vue`, `PackMethod.vue`, `useAdPaymentSummary.ts`, `usePackPaymentSummary.ts`) off `packs.store`
- All 5 plan `must_haves` satisfied: no TypeScript errors, zero `packs.store` imports in target files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create usePacksList composable** - `c3e0c8a` (feat)
2. **Task 2: Migrate PaymentMethod.vue** - `5f5e6ea` (feat)
3. **Task 3: Migrate PackMethod.vue, useAdPaymentSummary.ts, usePackPaymentSummary.ts** - `80a14d4` (feat)

**Plan metadata:** _(pending docs commit)_

## Files Created/Modified
- `apps/website/app/composables/usePacksList.ts` - New composable; fetches ad-packs from Strapi with module-level TTL cache; returns readonly packs ref
- `apps/website/app/components/PaymentMethod.vue` - Replaced `usePacksStore` + computed with `usePacksList()`; `await loadPacks()` in `onMounted`
- `apps/website/app/components/PackMethod.vue` - Replaced `usePacksStore`, added `lang="ts"`, explicit types for `formatPrice` and `selectedPack`
- `apps/website/app/composables/useAdPaymentSummary.ts` - Replaced `packsStore.packs.find()` with `packs.value.find()` via `usePacksList()`
- `apps/website/app/composables/usePackPaymentSummary.ts` - Replaced `packsStore.packs.find()` with `packs.value.find()` via `usePacksList()`

## Decisions Made
- **Module-level cache instead of Pinia:** `_packs` and `_lastFetch` live at module scope (outside the function) so all call sites share a single cache — same semantics as the packs.store TTL pattern but without the Pinia dependency.
- **`readonly()` on packs ref:** Prevents consumers from mutating the shared module-level ref accidentally.
- **`computed` kept in PaymentMethod.vue:** Plan suggested removing it, but `adReservations`, `freeAdText`, and `paidAdText` still use `computed` — removing it would break TypeScript.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Retained `computed` import in PaymentMethod.vue**
- **Found during:** Task 2 (PaymentMethod.vue migration)
- **Issue:** Plan said "remove unused `computed` import since the `packs` computed is removed" — but `adReservations`, `freeAdText`, and `paidAdText` are all computed properties still present in the file; removing `computed` would cause TypeScript errors
- **Fix:** Kept `computed` in the import, added `ref` back to imports alongside it
- **Files modified:** `apps/website/app/components/PaymentMethod.vue`
- **Verification:** No TypeScript errors; ESLint pre-commit hook passed
- **Committed in:** `5f5e6ea` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary correctness fix. No scope creep.

## Issues Encountered
None — all three tasks executed cleanly with pre-commit hooks passing.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `usePacksList` composable is available for Phase 56 (pack purchase flow) and Phase 57 (payment hub adaptation)
- `packs.store` still exists and is used by `packs/index.vue` and `BuyPack.vue` — those are cleaned up in subsequent plans
- Ready for Phase 55 Plan 02 (if not already complete)

---
*Phase: 55-store-unification*
*Completed: 2026-03-08*
