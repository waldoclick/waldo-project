---
phase: 091-dashboard-uselogout-composable
plan: 01
subsystem: auth
tags: [nuxt, pinia, composable, logout, strapi, dashboard]

# Dependency graph
requires: []
provides:
  - "useLogout composable centralizing all dashboard logout logic"
  - "meStore.reset() action clearing user state on logout"
  - "All 3 logout call sites migrated to useLogout()"
affects:
  - 092-cookie-domain-migration

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Centralized logout composable: store resets + strapiLogout() + navigateTo('/auth/login')"
    - "import { useStrapiAuth, navigateTo } from '#imports' for Nuxt auto-import interception"

key-files:
  created:
    - apps/dashboard/app/composables/useLogout.ts
  modified:
    - apps/dashboard/app/stores/me.store.ts
    - apps/dashboard/app/components/DropdownUser.vue
    - apps/dashboard/app/components/FormVerifyCode.vue
    - apps/dashboard/app/middleware/guard.global.ts

key-decisions:
  - "useLogout resets appStore.$reset(), meStore.reset(), searchStore.clearTavily() before strapiLogout() — ensures all user state is cleared before session invalidation"
  - "import { useStrapiAuth, navigateTo } from '#imports' pattern (mirrors website useLogout.ts) — required for Nuxt auto-import interception in composables"
  - "Remove redundant router.push('/auth/login') from call sites — useLogout already calls navigateTo('/auth/login') internally"
  - "articlesStore skipped in useLogout resets — session-only cache, cleared on page reload, no user auth data"

patterns-established:
  - "Centralized logout composable: any future logout additions (e.g. old-cookie cleanup in Phase 092) happen in one place"

requirements-completed: [SAFE-01]

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 091 Plan 01: Dashboard useLogout Composable Summary

**Centralized `useLogout.ts` composable for dashboard with `meStore.reset()`, replacing 3 scattered `useStrapiAuth().logout()` call sites**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T13:17:27Z
- **Completed:** 2026-03-16T13:19:46Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created `apps/dashboard/app/composables/useLogout.ts` mirroring the website pattern: resets appStore, meStore, searchStore, then calls `strapiLogout()` and navigates to `/auth/login`
- Added `reset()` function to `meStore` (Composition API store) that sets `me.value = null` — enabling proper user state cleanup on logout
- Migrated all 3 logout call sites (DropdownUser.vue, FormVerifyCode.vue, guard.global.ts) to `useLogout()` — zero scattered `useStrapiAuth().logout()` calls remain
- `nuxt typecheck` exits 0 after all changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Add meStore.reset() + create useLogout composable** - `cb44d18` (feat)
2. **Task 2: Migrate all 3 logout call sites + typecheck** - `88e1abf` (feat)

**Plan metadata:** _(pending docs commit)_

## Files Created/Modified
- `apps/dashboard/app/composables/useLogout.ts` - New centralized logout composable: resets 3 stores + strapiLogout() + navigateTo('/auth/login')
- `apps/dashboard/app/stores/me.store.ts` - Added `reset()` function that clears `me.value = null`
- `apps/dashboard/app/components/DropdownUser.vue` - Replaced `useStrapiAuth().logout()` + `router.push()` with `useLogout()`
- `apps/dashboard/app/components/FormVerifyCode.vue` - Replaced `useStrapiAuth()` logout with `useLogout()`, removed redundant `router.push('/auth/login')`
- `apps/dashboard/app/middleware/guard.global.ts` - Replaced `useStrapiAuth().logout()` + `navigateTo()` with `useLogout()`

## Decisions Made
- **useLogout resets appStore, meStore, searchStore** before calling `strapiLogout()` — ensures clean user state on every logout path
- **`import { useStrapiAuth, navigateTo } from '#imports'`** — same pattern as website composable, required for Nuxt auto-import interception
- **articlesStore skipped** — session-only cache, no user auth data, cleared automatically on page reload
- **Removed redundant navigation** from all call sites — composable handles `navigateTo('/auth/login')` internally, eliminating duplication

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `useLogout.ts` composable is the foundation for Phase 092 (Cookie Domain Migration)
- Phase 092 will add `document.cookie = "waldo_jwt=; path=/; max-age=0"` to this composable (and the website's equivalent) before `strapiLogout()` — single-file change, no scattered call sites to hunt
- No blockers.

---
*Phase: 091-dashboard-uselogout-composable*
*Completed: 2026-03-16*
