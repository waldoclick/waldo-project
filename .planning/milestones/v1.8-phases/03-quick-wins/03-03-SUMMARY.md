---
phase: 03-quick-wins
plan: "03"
subsystem: infra
tags: [sentry, error-monitoring, logging, nuxt, browser-console]

# Dependency graph
requires: []
provides:
  - "useLogger composable with active Sentry.captureException integration"
  - "Production console plugin that preserves console.error visibility"
affects: [error-monitoring, production-debugging, sentry]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "logError passes errors directly to Sentry.captureException without wrapping (preserves stack trace)"
    - "console.error not suppressed in production — errors reach Sentry browser integration and devtools"

key-files:
  created: []
  modified:
    - apps/dashboard/app/composables/useLogger.ts
    - apps/dashboard/app/plugins/console.client.ts

key-decisions:
  - "Pass error directly to Sentry.captureException(error) — no new Error() wrapping — to preserve original stack traces"
  - "No NODE_ENV guards needed: Sentry SDK only initializes in production per sentry.client.config.ts, so dev calls are no-ops"
  - "Preserve console.error in production to allow Sentry browser SDK to capture errors via its console integration"

patterns-established:
  - "useLogger: always call Sentry methods without conditional env guards — let SDK handle environment"

requirements-completed: [QUICK-04]

# Metrics
duration: 1min
completed: 2026-03-04
---

# Phase 3 Plan 03: Restore Production Error Visibility Summary

**Sentry captureException activated in useLogger and console.error preserved in production — runtime errors now reach Sentry and browser devtools instead of being silently discarded**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-04T00:33:55Z
- **Completed:** 2026-03-04T00:34:54Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Restored `Sentry.captureException(error)` in `useLogger.logError` — errors now reach Sentry in production
- Activated `Sentry.captureMessage(message)` in `useLogger.logInfo`
- Removed `console.error = () => {}` suppression from the production console plugin
- Tightened `logError` parameter type from `any` to `unknown`

## Task Commits

Each task was committed atomically:

1. **Task 1: Restore Sentry error capture in useLogger** - `b61cd2b` (feat)
2. **Task 2: Preserve console.error in production console plugin** - `a8f53eb` (fix)

## Files Created/Modified

- `/home/gabriel/Code/waldo-project/apps/dashboard/app/composables/useLogger.ts` - Uncommented Sentry import, replaced no-op logError/logInfo bodies with active Sentry calls, changed `error: any` to `error: unknown`
- `/home/gabriel/Code/waldo-project/apps/dashboard/app/plugins/console.client.ts` - Removed `console.error = () => {}` suppression line; debug, warn, info suppressions remain

## Decisions Made

- Errors passed directly to `Sentry.captureException(error)` without wrapping in `new Error(...)` — wrapping loses the original stack trace
- No conditional `NODE_ENV` guards added — the Sentry SDK itself is only initialized in production, so calls in development are no-ops by design
- `console.error` preserved in production so Sentry's browser SDK hooks (`window.onerror`, console integration) can observe errors

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Error monitoring is now active end-to-end: `useLogger.logError(err)` sends to Sentry and `console.error` surfaces in browser devtools
- Phase 3 plans 01, 02, and 04 can proceed independently (wave 1 parallel)

---
*Phase: 03-quick-wins*
*Completed: 2026-03-04*
