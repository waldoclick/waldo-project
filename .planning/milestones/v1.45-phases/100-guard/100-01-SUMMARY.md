---
phase: 100-guard
plan: "01"
subsystem: ui
tags: [nuxt, middleware, pinia, vitest, onboarding, guard]

# Dependency graph
requires:
  - phase: 099-onboarding-ui
    provides: OnboardingDefault, OnboardingThankyou components, onboarding pages, FormProfile emit pattern, appStore.referer
provides:
  - Global client-only onboarding guard middleware (onboarding-guard.global.ts)
  - Unit tests covering GUARD-01 through GUARD-04 (10 tests)
  - meStore cache invalidation after profile save in FormProfile
affects: [101-integ, any phase using FormProfile or global navigation guards]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Global Nuxt route middleware with import.meta.server bail for SSR safety"
    - "AUTH_EXEMPT_PATHS Set checked before async work (fail fast for auth pages)"
    - "Dynamic import pattern in Vitest for testing middleware that uses global auto-imports"
    - "global.defineNuxtRouteMiddleware = (fn) => fn pattern for middleware unit tests"

key-files:
  created:
    - apps/website/app/middleware/onboarding-guard.global.ts
    - apps/website/tests/middleware/onboarding-guard.test.ts
  modified:
    - apps/website/app/components/FormProfile.vue
    - apps/website/tests/components/FormProfile.onboarding.test.ts

key-decisions:
  - "AUTH_EXEMPT_PATHS contains only /login, /registro, /logout — NOT /onboarding; reverse guard (GUARD-02) requires /onboarding* to pass through the logic"
  - "Loop prevention for incomplete users: check to.path.startsWith('/onboarding') and return without redirect, not via exempt set"
  - "Dynamic import (beforeAll + await import()) pattern required for middleware tests — static imports are hoisted before globals are set"
  - "useMeStore().reset() called after fetchUser() in FormProfile to prevent post-onboarding redirect loop from stale cache"

patterns-established:
  - "Middleware global test pattern: set global.defineNuxtRouteMiddleware and global.navigateTo before dynamic import"
  - "FormProfile save sequence: updateUserProfile → fetchUser() → useMeStore().reset() → Swal → emit/redirect"

requirements-completed: [GUARD-01, GUARD-02, GUARD-03, GUARD-04]

# Metrics
duration: 12min
completed: 2026-03-19
---

# Phase 100 Plan 01: Onboarding Guard Summary

**SSR-safe global route middleware redirecting incomplete-profile users to /onboarding, with loop prevention and meStore cache invalidation after profile save**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-19T18:21:00Z
- **Completed:** 2026-03-19T18:33:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Global onboarding guard middleware (`onboarding-guard.global.ts`) with full GUARD-01..04 coverage
- 10 unit tests using dynamic import pattern to avoid ESM hoisting issues with global auto-imports
- `useMeStore().reset()` added to FormProfile after profile save to prevent post-onboarding redirect loop

## Task Commits

Each task was committed atomically:

1. **Task 1: Create onboarding guard tests and middleware (TDD)** - `23d409f4` (feat)
2. **Task 2: Fix meStore cache invalidation in FormProfile after profile save** - `586634c7` (fix)

**Plan metadata:** (docs commit follows)

_Note: TDD task has single commit (RED failed with module-not-found, GREEN passed all 10 tests)_

## Files Created/Modified
- `apps/website/app/middleware/onboarding-guard.global.ts` - Global client-only guard: AUTH_EXEMPT_PATHS bail, useStrapiUser() auth check, isProfileComplete() async check, setReferer+redirect for incomplete users, reverse guard for complete users at /onboarding
- `apps/website/tests/middleware/onboarding-guard.test.ts` - 10 unit tests covering all guard behaviors (GUARD-01 through GUARD-04) using dynamic import pattern
- `apps/website/app/components/FormProfile.vue` - Added `useMeStore().reset()` after `fetchUser()` on successful profile save
- `apps/website/tests/components/FormProfile.onboarding.test.ts` - Added `useMeStore` mock with `reset` function to support the new cache invalidation call

## Decisions Made
- `AUTH_EXEMPT_PATHS = new Set(["/login", "/registro", "/logout"])` — deliberately excludes `/onboarding` so the reverse guard (GUARD-02) can fire for complete-profile users
- Loop prevention via `if (to.path.startsWith('/onboarding')) return` inside the incomplete-profile branch, not via exempt set — this allows GUARD-02 to still check complete users at `/onboarding`
- Dynamic import pattern (`beforeAll` + `await import()`) for middleware tests — needed because static ESM `import` statements are hoisted before `global.xxx = ...` assignments, causing `defineNuxtRouteMiddleware is not defined` at module evaluation time
- `useMeStore().reset()` (not `loadMe()`) chosen to invalidate cache — sets `me.value = null` so `isProfileComplete()` re-fetches fresh data on next navigation without eagerly triggering an API call

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added useMeStore mock to FormProfile.onboarding.test.ts**
- **Found during:** Task 2 (FormProfile cache invalidation fix)
- **Issue:** Adding `useMeStore().reset()` to FormProfile caused 2 FormProfile tests to fail because `useMeStore` was not mocked in the test file — calling `.reset()` on undefined threw an error
- **Fix:** Added `global.useMeStore = vi.fn(() => ({ reset: mockMeReset }))` to both the top-level setup and the `beforeEach` re-registration block
- **Files modified:** `apps/website/tests/components/FormProfile.onboarding.test.ts`
- **Verification:** `yarn vitest run tests/components/FormProfile.onboarding.test.ts` — 5/5 pass
- **Committed in:** `586634c7` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in test mock coverage introduced by plan change)
**Impact on plan:** Necessary fix to maintain test integrity. No scope creep.

## Issues Encountered
- ESM module hoisting prevented static `import guard from "@/middleware/onboarding-guard.global"` from working with `global.defineNuxtRouteMiddleware` set inline. Resolved by switching to dynamic `await import()` inside `beforeAll`, which runs after all top-level setup code including global assignments.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Guard is live and intercepts all client-side navigations
- Incomplete-profile users will be redirected to `/onboarding` on any non-exempt page
- Complete-profile users are protected from re-entering `/onboarding`
- meStore cache correctly invalidated after profile save — no post-onboarding loop
- Phase 101 (integration) can proceed: `referer.global.ts` should exclude `/onboarding*` paths to prevent overwriting the guard-set referer (tracked in RESEARCH.md Pitfall 5)

---
*Phase: 100-guard*
*Completed: 2026-03-19*

## Self-Check: PASSED

- FOUND: `apps/website/app/middleware/onboarding-guard.global.ts`
- FOUND: `apps/website/tests/middleware/onboarding-guard.test.ts`
- FOUND: `.planning/phases/100-guard/100-01-SUMMARY.md`
- FOUND commit: `23d409f4` (feat: guard middleware + tests)
- FOUND commit: `586634c7` (fix: meStore cache invalidation)
