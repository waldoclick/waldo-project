---
phase: 55-store-unification
plan: "055-03"
subsystem: ui
tags: [pinia, nuxt, typescript, packs, store-cleanup]

# Dependency graph
requires:
  - phase: 55-store-unification
    provides: usePacksList composable and migrated pack consumers (055-01, 055-02)
provides:
  - packs.store.ts deleted from codebase
  - comprar.vue stubbed (no packs.store import)
  - nuxt typecheck passing with zero errors
affects:
  - 56-pack-purchase-flow

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stub-then-delete pattern: remove store imports from last consumer before deleting the store to keep typecheck passing"
    - "Null-guard updatePack calls to satisfy strict TypeScript number vs number|null"

key-files:
  created: []
  modified:
    - apps/website/app/pages/packs/comprar.vue
    - apps/website/app/components/PackMethod.vue
  deleted:
    - apps/website/app/stores/packs.store.ts

key-decisions:
  - "Stub comprar.vue before deleting store to avoid breaking typecheck — the file is deleted in Phase 56 anyway"
  - "Null-guard both updatePack call sites in PackMethod.vue rather than widening the store signature"

patterns-established:
  - "When deleting a store, remove all consumer imports first (stub if needed), then delete the store file"

requirements-completed:
  - PAY-04
  - CLN-02

# Metrics
duration: 2min
completed: 2026-03-08
---

# Phase 55 Plan 03: Delete packs.store.ts and verify zero typecheck errors

**packs.store.ts deleted, comprar.vue stubbed, and PackMethod.vue null-guards added — nuxt typecheck passes with zero errors**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T22:55:46Z
- **Completed:** 2026-03-08T22:57:57Z
- **Tasks:** 2
- **Files modified:** 3 (2 modified, 1 deleted)

## Accomplishments
- Verified zero remaining `usePacksStore` / `packs.store` consumers (excluding comprar.vue and the store itself)
- Stubbed `packs/comprar.vue`: removed `usePacksStore` import, `packsStore` instance, and `loadPacks` call — no behavioral change needed (file deleted in Phase 56)
- Deleted `apps/website/app/stores/packs.store.ts` permanently
- Fixed `PackMethod.vue` null-guard bug to pass strict typecheck
- `nuxt typecheck` passes with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify no remaining consumers** — (verification only, no file changes)
2. **Task 2: Stub comprar.vue, delete store, run typecheck** — `71feb8e` (refactor)

**Plan metadata:** (included in final docs commit)

## Files Created/Modified
- `apps/website/app/pages/packs/comprar.vue` — Removed packs.store import and loadPacks call (stub for Phase 56 deletion)
- `apps/website/app/components/PackMethod.vue` — Added null guards before `packStore.updatePack()` calls (TS2345 fix)
- `apps/website/app/stores/packs.store.ts` — **DELETED**

## Decisions Made
- Stubbed comprar.vue rather than deleting it here — Phase 56 deletes the entire file together with BuyPack.vue, which is a larger scoped change
- Null-guarded `updatePack` call sites in PackMethod.vue instead of widening `pack.store.ts` signature — minimal change, correctness preserved

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `number | null` type mismatch in PackMethod.vue**
- **Found during:** Task 2 (running nuxt typecheck after store deletion)
- **Issue:** `packStore.updatePack(selectedPack.value)` called with `number | null` but `updatePack` expects `number`, causing TS2345 errors on lines 57 and 61
- **Fix:** Added `if (selectedPack.value !== null)` guards around both `updatePack` calls
- **Files modified:** `apps/website/app/components/PackMethod.vue`
- **Verification:** `nuxt typecheck` exits with code 0 after fix
- **Committed in:** `71feb8e` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Auto-fix essential for typecheck to pass. No scope creep — null-guard is strictly correct behavior (don't update store when no pack is selected).

## Issues Encountered
None — task 2 typecheck initially failed due to the null-guard bug, fixed immediately per deviation Rule 1.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 55 complete: packs.store.ts is gone, typecheck passes with zero errors
- Phase 56 can proceed: delete `packs/comprar.vue`, `BuyPack.vue`, and refactor the packs purchase flow to use `adStore`

---
*Phase: 55-store-unification*
*Completed: 2026-03-08*
