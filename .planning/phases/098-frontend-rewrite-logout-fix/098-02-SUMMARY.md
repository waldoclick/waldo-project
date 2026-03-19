---
phase: 098-frontend-rewrite-logout-fix
plan: "02"
subsystem: ui
tags: [google-one-tap, gis, logout, composables, typescript, vitest]

# Dependency graph
requires:
  - phase: 098-frontend-rewrite-logout-fix
    provides: RED test scaffolds for GTAP-07/09/10/12

provides:
  - "disableAutoSelect() in useLogout before strapiLogout() — GTAP-12 GREEN"
  - "promptIfEligible() composable replacing initializeGoogleOneTap() — GTAP-07/09/10 GREEN"
  - "window.d.ts: disableAutoSelect declared, googleOneTapInitialized/handleCredentialResponse removed"
  - "imports.stub.ts: useStrapiUser and useRoute stubs added for test overrides"

affects:
  - 098-03-PLAN

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Optional chain for window.google calls: window.google?.accounts?.id?.disableAutoSelect() — safe no-op on server"
    - "disableAutoSelect placed outside if(import.meta.client) for testability — optional chain protects SSR safety"

key-files:
  created: []
  modified:
    - apps/website/app/types/window.d.ts
    - apps/website/app/composables/useLogout.ts
    - apps/website/app/composables/useGoogleOneTap.ts
    - apps/website/tests/stubs/imports.stub.ts

key-decisions:
  - "disableAutoSelect() placed outside if(import.meta.client) block — optional chain makes it SSR-safe; required for test testability since import.meta.client is falsy in happy-dom"
  - "promptIfEligible() uses auth guard + route guard + GIS guard before calling prompt() — replaces 90-line spaghetti with 25-line clean composable"
  - "GoogleOneTapNotification slimmed to 4 methods: removed deprecated isNotDisplayed and getNotDisplayedReason"

patterns-established:
  - "window.google?.accounts?.id?.method() optional chain pattern for GIS API calls — safe across SSR and client"

requirements-completed: [GTAP-07, GTAP-09, GTAP-10, GTAP-12]

# Metrics
duration: 6min
completed: 2026-03-19
---

# Phase 098 Plan 02: Frontend Rewrite + Logout Fix (Implementation) Summary

**Three surgical file changes turn all GTAP-07/09/10/12 RED tests GREEN: window.d.ts type cleanup, disableAutoSelect() in logout, and promptIfEligible() composable rewrite**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-19T04:24:46Z
- **Completed:** 2026-03-19T04:31:02Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Updated `window.d.ts`: added `disableAutoSelect: () => void`, removed `googleOneTapInitialized`, `handleCredentialResponse`, and deprecated FedCM notification methods (`isNotDisplayed`, `getNotDisplayedReason`)
- Fixed `useLogout.ts`: added `window.google?.accounts?.id?.disableAutoSelect()` before `strapiLogout()` — GTAP-12 test GREEN (5/5 tests pass)
- Rewrote `useGoogleOneTap.ts`: 90-line legacy code → 25-line clean composable with `promptIfEligible()` and three guards — GTAP-07/09/10 tests GREEN (6/6 test cases pass)
- Added `useStrapiUser` and `useRoute` stubs to `imports.stub.ts` for test mock overrides
- Zero regressions (13 pre-existing failures unchanged before and after)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update window.d.ts + imports stub** - `6826069` (feat)
2. **Task 2: Fix useLogout.ts — disableAutoSelect() before strapiLogout()** - `c4ef93f` (fix)
3. **Task 3: Rewrite useGoogleOneTap.ts — promptIfEligible() with guards** - `c25023f` (feat)

**Plan metadata:** `(docs commit follows)`

## Files Created/Modified

- `apps/website/app/types/window.d.ts` — Added `disableAutoSelect`, removed deprecated globals and FedCM methods
- `apps/website/app/composables/useLogout.ts` — Added `disableAutoSelect()` call via optional chain before `strapiLogout()`
- `apps/website/app/composables/useGoogleOneTap.ts` — Full rewrite: `promptIfEligible()` with auth/route/GIS guards (90 lines → 25 lines)
- `apps/website/tests/stubs/imports.stub.ts` — Added `useStrapiUser` and `useRoute` stubs

## Decisions Made

- **disableAutoSelect outside if(import.meta.client):** Moved outside the client-guard block because `import.meta.client` is falsy in happy-dom test environment. The optional chain `window.google?.accounts?.id?.disableAutoSelect()` is SSR-safe (no-op when `window.google` is undefined), and the behavioral invariant (fires before `strapiLogout()`) is maintained.
- **25-line composable:** Purely subtractive rewrite removes redirect hack, global flag, FedCM deprecated calls, `useRuntimeConfig()`, `setTimeout` polling, and `initialize()` (moved to plugin in Plan 03).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] disableAutoSelect placed outside if(import.meta.client) block**
- **Found during:** Task 2 (Fix useLogout.ts)
- **Issue:** Plan spec said "The call is inside the existing if(import.meta.client) block", but `import.meta.client` evaluates to `undefined` (falsy) in vitest happy-dom environment — test would never see the call
- **Fix:** Moved `disableAutoSelect()` outside the block; optional chain `window.google?.accounts?.id?.disableAutoSelect()` provides SSR safety; behavioral contract (fires before `strapiLogout()`) is preserved
- **Files modified:** `apps/website/app/composables/useLogout.ts`
- **Verification:** 5/5 useLogout tests GREEN including GTAP-12 invocationCallOrder assertion
- **Committed in:** `c4ef93f`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Behavioral contract preserved. Optional chain makes the call SSR-safe. No scope creep.

## Issues Encountered

- Pre-existing test failures (13 tests): `FormLogin.website.test.ts` (5), `FormRegister.test.ts` (4), `ResumeOrder.test.ts` (3), `recaptcha-proxy.test.ts` (1), `google-one-tap.test.ts` (1 — expected RED for Plan 03). All present before this plan's changes began. Zero regressions introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- GTAP-07, GTAP-09, GTAP-10, GTAP-12 all GREEN
- GTAP-11 (plugin tests) remain RED — Plan 03 creates `apps/website/app/plugins/google-one-tap.client.ts`
- `useGoogleOneTap` exports `{ promptIfEligible }` — plugin can call it directly

---
*Phase: 098-frontend-rewrite-logout-fix*
*Completed: 2026-03-19*

## Self-Check: PASSED

- ✅ `apps/website/app/types/window.d.ts` — exists
- ✅ `apps/website/app/composables/useLogout.ts` — exists
- ✅ `apps/website/app/composables/useGoogleOneTap.ts` — exists
- ✅ `apps/website/tests/stubs/imports.stub.ts` — exists
- ✅ `098-02-SUMMARY.md` — exists
- ✅ Commit `6826069` — found (Task 1: window.d.ts + imports stub)
- ✅ Commit `c4ef93f` — found (Task 2: useLogout.ts fix)
- ✅ Commit `c25023f` — found (Task 3: useGoogleOneTap.ts rewrite)
