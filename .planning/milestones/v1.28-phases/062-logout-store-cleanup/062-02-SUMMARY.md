---
phase: 062-logout-store-cleanup
plan: 02
subsystem: auth
tags: [nuxt, vue, composables, logout, refactor]

# Dependency graph
requires:
  - phase: 062-logout-store-cleanup
    provides: useLogout composable with 6-store reset sequence
provides:
  - MenuUser.vue using useLogout() instead of inline useStrapiAuth logout
  - MobileBar.vue using useLogout() instead of inline useStrapiAuth logout
  - SidebarAccount.vue using useLogout() instead of inline useStrapiAuth logout
  - All three logout entry points fully connected to centralized cleanup pipeline
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Components call useLogout().logout() — no inline auth calls or post-logout navigation"

key-files:
  created: []
  modified:
    - apps/website/app/components/MenuUser.vue
    - apps/website/app/components/MobileBar.vue
    - apps/website/app/components/SidebarAccount.vue

key-decisions:
  - "Remove router.push('/') from all three components — navigation is handled inside useLogout composable"
  - "Remove appStore.closeMobileMenu() from MobileBar logout handler — useAppStore.$reset() inside useLogout handles it"
  - "Remove useRouter import/variable where it became unused after the refactor"

patterns-established:
  - "Component logout handlers: call await logout() only — no post-logout navigation or store calls"

requirements-completed: [QUAL-01]

# Metrics
duration: 2min
completed: 2026-03-12
---

# Phase 62 Plan 2: Component Logout Migration Summary

**Three logout entry-point components (MenuUser, MobileBar, SidebarAccount) migrated from inline useStrapiAuth calls to useLogout() composable, eliminating all duplicated logout logic**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-12T22:12:07Z
- **Completed:** 2026-03-12T22:15:05Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Replaced `const { logout } = useStrapiAuth()` with `const { logout } = useLogout()` in all three components
- Removed `router.push("/")` from all three logout handlers — navigation now handled inside `useLogout`
- Removed `appStore.closeMobileMenu()` from MobileBar logout handler — `useAppStore.$reset()` inside the composable handles it
- Removed unused `useRouter` imports and variables from MenuUser and MobileBar
- TypeScript typecheck passes with zero errors (`nuxt typecheck` exits 0)
- `useLogout.test.ts` (4 tests) continues to pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace inline logout in MenuUser.vue, MobileBar.vue, SidebarAccount.vue** - `e5d9b3b` (feat)
2. **Task 2: TypeScript typecheck** - no files changed (verification-only task, typecheck passed on first run)

## Files Created/Modified

- `apps/website/app/components/MenuUser.vue` — Replaced `useStrapiAuth` logout with `useLogout()`; removed `useRouter` import, `const router` and `router.push("/")`
- `apps/website/app/components/MobileBar.vue` — Replaced `useStrapiAuth` logout with `useLogout()`; removed `useRouter` from import, `const router`, `router.push("/")`, and `appStore.closeMobileMenu()` from logout handler
- `apps/website/app/components/SidebarAccount.vue` — Replaced `useStrapiAuth` logout with `useLogout()`; removed `const router` and `router.push("/")`

## Decisions Made

- **No router.push after logout:** The plan explicitly states navigation is handled inside `useLogout` — all three components previously called `router.push("/")` after `await logout()`. All removed.
- **No closeMobileMenu in logout handler:** MobileBar previously called `appStore.closeMobileMenu()` before `await logout()`. Since `useAppStore.$reset()` inside `useLogout` resets `isMobileMenuOpen` to false, this explicit call is redundant. Removed per plan instructions.
- **appStore kept in MobileBar:** `appStore` is still used extensively in the template (nav link click handlers, backdrop click, header close button, `handleMenuClick`) — only the logout handler usage was removed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing test failures in `useOrderById.test.ts`, `ResumeOrder.test.ts`, and `FormLogin.spec.ts` are unrelated to this plan's changes. `useLogout.test.ts` (the tests directly related to this phase) passes with all 4 tests. Per scope boundary rules, pre-existing failures are out of scope and not fixed here.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 062 complete: all logout entry points connected to centralized `useLogout` composable
- Zero TypeScript errors, useLogout tests passing
- QUAL-01 requirement fully satisfied: no inline logout logic remains in any of the three components

---
*Phase: 062-logout-store-cleanup*
*Completed: 2026-03-12*

## Self-Check: PASSED

- ✓ `apps/website/app/components/MenuUser.vue` exists with `useLogout()`
- ✓ `apps/website/app/components/MobileBar.vue` exists with `useLogout()`
- ✓ `apps/website/app/components/SidebarAccount.vue` exists with `useLogout()`
- ✓ `062-02-SUMMARY.md` exists
- ✓ Commit `e5d9b3b` exists (feat: component logout migration)
