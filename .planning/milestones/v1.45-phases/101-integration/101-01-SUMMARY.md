---
phase: 101-integration
plan: "01"
subsystem: ui
tags: [google-one-tap, nuxt-middleware, referer, onboarding, vitest]

# Dependency graph
requires:
  - phase: 099-onboarding-pages
    provides: "/onboarding and /onboarding/thankyou pages plus onboarding-guard middleware"
  - phase: 100-onboarding-guard
    provides: "appStore.setReferer(to.fullPath) called before redirect to /onboarding (INTEG-03)"
provides:
  - "Google One Tap suppressed on /onboarding and /onboarding/thankyou (INTEG-01)"
  - "Referer middleware excludes /onboarding prefix from persisted referer (INTEG-02)"
  - "INTEG-03 confirmed: onboarding-guard saves pre-redirect URL to appStore.referer"
affects:
  - "Post-onboarding back navigation — appStore.referer correctly holds pre-onboarding URL"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vi.hoisted() mutable ref pattern for per-test route path control in plugin tests"
    - "global.defineNuxtRouteMiddleware passthrough + dynamic import for middleware unit tests"

key-files:
  created:
    - apps/website/tests/middleware/referer.test.ts
  modified:
    - apps/website/app/plugins/google-one-tap.client.ts
    - apps/website/app/middleware/referer.global.ts
    - apps/website/tests/plugins/google-one-tap.test.ts

key-decisions:
  - "One Tap route guard extended with startsWith('/onboarding') — single condition covers /onboarding and /onboarding/thankyou"
  - "Referer exclusion via startsWith('/onboarding') — consistent with existing /cuenta and /login exclusion pattern"
  - "INTEG-03 requires no code change — already implemented in onboarding-guard.global.ts line 33"
  - "mockRoutePath hoisted mutable ref replaces hardcoded useRoute mock — allows per-test path control without separate vi.mock factories"

patterns-established:
  - "Mutable hoisted ref pattern: extract mockRoutePath = vi.hoisted(() => ({ value: '/' })) and reset in beforeEach — controls useRoute() path per test"
  - "Middleware test pattern: global.defineNuxtRouteMiddleware = (fn) => fn + dynamic import in beforeAll — ensures globals set before module evaluation"

requirements-completed: [INTEG-01, INTEG-02, INTEG-03]

# Metrics
duration: 11min
completed: 2026-03-19
---

# Phase 101 Plan 01: Integration Wiring Summary

**One Tap suppressed on /onboarding via startsWith guard; referer middleware excludes /onboarding prefix; 6 new tests confirm INTEG-01, INTEG-02, INTEG-03**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-03-19T23:46:37Z
- **Completed:** 2026-03-19T23:48:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Extended One Tap route guard to return early on `/onboarding` prefix — prompt() never fires during onboarding flow
- Added `/onboarding` prefix exclusion to referer middleware — navigating through onboarding does not pollute appStore.referer
- Confirmed INTEG-03 (onboarding-guard already calls `appStore.setReferer(to.fullPath)` before redirect) — no code change needed
- Added 6 new tests (2 for One Tap, 4 for referer middleware); all 19 plan-related tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: One Tap onboarding suppression (INTEG-01)** - `068d73e2` (feat)
2. **Task 2: Referer middleware onboarding exclusion (INTEG-02 + INTEG-03 verify)** - `39551940` (feat)

**Plan metadata:** (docs commit below)

_Note: TDD tasks — RED phase confirmed before each GREEN implementation._

## Files Created/Modified

- `apps/website/app/plugins/google-one-tap.client.ts` - Route guard extended: `|| route.path.startsWith("/onboarding")`
- `apps/website/app/middleware/referer.global.ts` - Added `!from.fullPath.startsWith("/onboarding")` to if condition
- `apps/website/tests/plugins/google-one-tap.test.ts` - Refactored to use mutable `mockRoutePath` hoisted ref; added 2 INTEG-01 tests
- `apps/website/tests/middleware/referer.test.ts` - New file with 4 tests covering baseline, /onboarding, /onboarding/thankyou, /registro

## Decisions Made

- Used `startsWith("/onboarding")` (not exact match) so both `/onboarding` and `/onboarding/thankyou` are covered by a single check
- Refactored existing `useRoute` mock to use `vi.hoisted()` mutable ref — avoids duplicate `vi.mock` factory and keeps tests in a single `describe` block
- INTEG-03 verification: confirmed via existing `onboarding-guard.test.ts` line "redirects authenticated incomplete-profile user to /onboarding and saves referer" — no production code change needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing test failures in unrelated suites (useOrderById, FormLogin.website, FormRegister, ResumeOrder, recaptcha-proxy) were present before this plan's changes. These are out of scope and logged for deferred attention.

## Self-Check: PASSED

All files created/modified confirmed present. Both task commits verified in git log.

## Next Phase Readiness

- All three INTEG requirements (INTEG-01, INTEG-02, INTEG-03) satisfied
- v1.45 User Onboarding milestone complete — One Tap does not interfere with onboarding flow; "Volver a Waldo" returns to correct pre-onboarding URL
- No blockers

---
*Phase: 101-integration*
*Completed: 2026-03-19*
