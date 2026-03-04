---
phase: 03-quick-wins
plan: 02
subsystem: ui
tags: [vue, vue-router, dependencies, middleware, nuxt]

# Dependency graph
requires: []
provides:
  - "Deterministic vue@3.5.25 and vue-router@4.6.3 pins in package.json"
  - "Dead packages vue-recaptcha, vue3-recaptcha-v2, and fs removed"
  - "Redundant auth.ts middleware deleted (guard.global.ts handles all auth)"
affects: [04-component-consolidation, 05-type-safety]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Exact semver pins (no 'latest') for critical framework dependencies"
    - "Single global middleware (guard.global.ts) for auth enforcement — no named auth middleware"

key-files:
  created: []
  modified:
    - apps/dashboard/package.json
  deleted:
    - apps/dashboard/app/middleware/auth.ts

key-decisions:
  - "Pin vue to 3.5.25 and vue-router to 4.6.3 (exact installed versions) to ensure deterministic installs"
  - "Delete auth.ts — confirmed zero page references via grep; guard.global.ts provides equivalent global protection"
  - "Remove vue-recaptcha and vue3-recaptcha-v2 — recaptcha.client.ts plugin loads Google SDK directly, npm packages unused"
  - "Remove fs polyfill — Node built-in fs is never imported anywhere in dashboard app code"

patterns-established:
  - "Exact version strings for framework packages — no 'latest' or broad range specifiers"

requirements-completed: [QUICK-03, QUICK-06]

# Metrics
duration: 2min
completed: 2026-03-04
---

# Phase 3 Plan 02: Dependency Hygiene Summary

**Pinned vue@3.5.25 and vue-router@4.6.3 to exact versions, removed 3 dead npm packages (vue-recaptcha, vue3-recaptcha-v2, fs), and deleted the redundant auth.ts middleware duplicating guard.global.ts**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-04T20:13:47Z
- **Completed:** 2026-03-04T20:15:48Z
- **Tasks:** 2
- **Files modified:** 2 (package.json modified, yarn.lock updated, auth.ts deleted)

## Accomplishments

- vue and vue-router are now pinned to exact versions — fresh installs are deterministic
- Three dead packages removed from package.json: vue-recaptcha (unused npm pkg), vue3-recaptcha-v2 (unused npm pkg), fs (Node built-in polyfill, never imported)
- auth.ts middleware deleted — confirmed no page references it via grep; guard.global.ts covers all auth globally
- yarn install completed successfully after changes, lockfile updated with deterministic resolution keys

## Task Commits

Each task was committed atomically:

1. **Task 1: Pin vue/vue-router and remove dead dependencies** - `80fe26b` (chore)
2. **Task 2: Delete redundant auth middleware** - `9aa2f43` (chore)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `apps/dashboard/package.json` - Pinned vue/vue-router, removed vue-recaptcha, vue3-recaptcha-v2, fs entries
- `yarn.lock` - Updated resolution keys to include exact version strings
- `apps/dashboard/app/middleware/auth.ts` - DELETED (dead code; guard.global.ts handles auth globally)

## Decisions Made

- Used exact version strings (`3.5.25`, `4.6.3`) discovered from installed node_modules rather than semver ranges — eliminates "latest" non-determinism
- Deleted auth.ts after confirming with `grep -rn "middleware.*auth\b" apps/dashboard/app/pages/` returned no matches
- Removed vue-recaptcha and vue3-recaptcha-v2 because recaptcha.client.ts uses the Google reCAPTCHA SDK directly (no npm package needed)
- Removed fs because it is a Node.js built-in — the npm polyfill package `fs@^0.0.1-security` was never imported

## Deviations from Plan

None — plan executed exactly as written. The package.json dependency changes (vue/vue-router pinning and dead package removal) had already been applied in commit `b61cd2b` from a parallel plan 03-03 execution. The yarn.lock update (Task 1 commit `80fe26b`) reflects running `yarn install` to make lockfile keys deterministic. auth.ts deletion proceeded as planned.

## Issues Encountered

None. yarn install succeeded without `--frozen-lockfile` flag — lockfile was updated to reflect the new exact version resolution keys. This is expected behavior when changing version specifiers.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 4 (Component Consolidation) and Phase 5 (Type Safety) can proceed without dependency concerns
- Dashboard will now install deterministically — consistent vue version across all environments
- Middleware directory is clean: guard.global.ts, dev.global.ts, guest.ts (no dead auth.ts)

## Self-Check: PASSED

- FOUND: apps/dashboard/package.json (vue pinned to 3.5.25, vue-router to 4.6.3, dead packages absent)
- FOUND: auth.ts correctly deleted
- FOUND: 03-02-SUMMARY.md created
- FOUND commit: 80fe26b (Task 1 — pin versions and remove dead deps)
- FOUND commit: 9aa2f43 (Task 2 — delete auth.ts)

---
*Phase: 03-quick-wins*
*Completed: 2026-03-04*
