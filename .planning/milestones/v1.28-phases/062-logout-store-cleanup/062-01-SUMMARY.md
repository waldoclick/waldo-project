---
phase: 062-logout-store-cleanup
plan: 01
subsystem: auth
tags: [pinia, nuxt, composables, vitest, stores, logout]

# Dependency graph
requires: []
provides:
  - useLogout composable with 6-store reset sequence before auth logout
  - reset() action in useAdsStore, useMeStore, useUserStore
  - #imports alias in vitest.config.ts for Nuxt auto-import testing
affects: [components-using-logout]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Explicit #imports import in composables that need useStrapiAuth/navigateTo for testability"
    - "tests/stubs/imports.stub.ts as vitest alias target for Nuxt virtual modules"

key-files:
  created:
    - apps/website/app/composables/useLogout.ts
    - apps/website/app/composables/useLogout.test.ts
    - apps/website/tests/stubs/imports.stub.ts
  modified:
    - apps/website/app/stores/ads.store.ts
    - apps/website/app/stores/me.store.ts
    - apps/website/app/stores/user.store.ts
    - apps/website/vitest.config.ts

key-decisions:
  - "Import useStrapiAuth and navigateTo explicitly from #imports (not relying on Nuxt auto-inject) so vi.mock('#imports') can intercept them in tests"
  - "Add #imports alias to vitest.config.ts pointing to tests/stubs/imports.stub.ts stub to make Nuxt virtual module resolvable in bare Vitest environment"
  - "TDD cycle: RED (test file without composable), then GREEN (composable + vitest config fix)"

patterns-established:
  - "For Nuxt composables that need auto-imports in tests: use explicit import from #imports, add #imports alias in vitest.config.ts"

requirements-completed: [LGOUT-01, LGOUT-02, LGOUT-03, LGOUT-04, LGOUT-05, QUAL-01]

# Metrics
duration: 5min
completed: 2026-03-12
---

# Phase 62 Plan 1: Logout Store Cleanup Summary

**reset() actions added to 3 Composition API stores, useLogout composable orchestrates 6-store reset sequence before useStrapiAuth().logout() and navigateTo('/')**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-12T22:04:17Z
- **Completed:** 2026-03-12T22:09:28Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Added `reset()` action to `useAdsStore`, `useMeStore`, and `useUserStore` (Composition API stores that lack built-in `$reset()`)
- Created `useLogout` composable calling all 6 stores in locked order: adStore.$reset → historyStore.$reset → meStore.reset → userStore.reset → adsStore.reset → appStore.$reset → strapiAuth.logout → navigateTo('/')
- Created `useLogout.test.ts` with 4 tests covering full reset sequence, call ordering, and navigation target
- Fixed vitest test infrastructure to support Nuxt auto-imports via `#imports` alias

## Task Commits

Each task was committed atomically:

1. **Task 1: Add reset() to Composition API stores** - `f6676c8` (feat)
2. **Task 2 RED: Failing tests for useLogout** - `38ab4ca` (test)
3. **Task 2 GREEN: useLogout composable + vitest fix** - `c48cffa` (feat)

## Files Created/Modified

- `apps/website/app/stores/ads.store.ts` - Added reset() function and export
- `apps/website/app/stores/me.store.ts` - Added reset() function and export
- `apps/website/app/stores/user.store.ts` - Added reset() function and export
- `apps/website/app/composables/useLogout.ts` - Centralized logout composable
- `apps/website/app/composables/useLogout.test.ts` - Unit tests for logout sequence
- `apps/website/tests/stubs/imports.stub.ts` - Stub for #imports Nuxt virtual module
- `apps/website/vitest.config.ts` - Added #imports alias for test resolution

## Decisions Made

- **Explicit #imports import:** The composable explicitly imports `useStrapiAuth` and `navigateTo` from `#imports` instead of relying on Nuxt's implicit auto-inject. This is required for `vi.mock("#imports")` to intercept them in the Vitest environment.
- **vitest.config.ts #imports alias:** Added `#imports` → `tests/stubs/imports.stub.ts` alias so Vite can resolve the virtual module path. The stub is a no-op since `vi.mock` replaces it entirely at test runtime.
- **No try/catch in useLogout:** Errors propagate as specified — no silent failure on store resets.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added #imports alias to vitest.config.ts**
- **Found during:** Task 2 (GREEN phase — running tests after creating composable)
- **Issue:** The composable imports `useStrapiAuth` and `navigateTo` from `#imports` (Nuxt virtual module), but vitest.config.ts has no alias for `#imports`, causing "Failed to resolve import" error
- **Fix:** Created `tests/stubs/imports.stub.ts` with stub exports, added `"#imports"` alias in `vitest.config.ts` pointing to it
- **Files modified:** `apps/website/vitest.config.ts`, `apps/website/tests/stubs/imports.stub.ts`
- **Verification:** All 4 tests pass after fix
- **Committed in:** `c48cffa` (Task 2 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required to make tests work in the existing Vitest-only (non-Nuxt) test environment. No scope creep.

## Issues Encountered

None beyond the blocking deviation above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Store reset actions are ready; phase is complete
- Components that call `useStrapiAuth().logout()` directly (MenuUser.vue, MobileBar.vue, SidebarAccount.vue) can now be migrated to `useLogout()` — this is the next planned task per the STATE.md context

---
*Phase: 062-logout-store-cleanup*
*Completed: 2026-03-12*

## Self-Check: PASSED

- ✓ `apps/website/app/composables/useLogout.ts` exists
- ✓ `apps/website/app/composables/useLogout.test.ts` exists
- ✓ `apps/website/tests/stubs/imports.stub.ts` exists
- ✓ Commit `f6676c8` exists (feat: store reset actions)
- ✓ Commit `38ab4ca` exists (test: failing tests)
- ✓ Commit `c48cffa` exists (feat: composable + vitest fix)
