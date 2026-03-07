---
phase: 41-sentry-production-only
plan: 41
subsystem: infra
tags: [sentry, error-tracking, nuxt, strapi, node-env]

# Dependency graph
requires: []
provides:
  - Sentry only initializes and captures errors in production across all 3 apps
  - DSN set to undefined in dev/staging for website and dashboard sentry configs
  - Strapi sentry plugin disabled entirely when not production
affects: [deployment, error-tracking, staging, development]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Production-only Sentry: gate DSN on isProduction flag, undefined disables SDK with zero overhead"
    - "Strapi plugin guard: enabled: process.env.NODE_ENV === 'production' unloads plugin entirely"

key-files:
  created: []
  modified:
    - apps/dashboard/sentry.server.config.ts
    - apps/website/app/plugins/sentry.ts
    - apps/dashboard/app/plugins/sentry.ts
    - apps/strapi/config/plugins.ts

key-decisions:
  - "Use dsn: undefined pattern (not conditional init) in sentry.*.config.ts files — existing SDK-supported approach that skips all instrumentation with zero overhead"
  - "Match comment style from existing correct files for consistency"

patterns-established:
  - "Sentry production guard: isProduction = process.env.NODE_ENV === 'production', dsn = isProduction ? config.public.sentryDsn : undefined"
  - "Plugin files: if (process.env.NODE_ENV === 'production') before every captureException call"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-03-07
---

# Phase 41: Sentry Production-Only Summary

**Sentry production-only guard applied across all 3 apps — 4 files fixed to prevent dev/staging noise reaching Sentry via DSN-gating, captureException guards, and plugin disabled flag**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-07T23:01:46Z
- **Completed:** 2026-03-07T23:04:15Z
- **Tasks:** 5 (4 wave-1 fixes + 1 wave-2 audit)
- **Files modified:** 4

## Accomplishments

- `dashboard/sentry.server.config.ts` gained the missing `isProduction` guard — DSN now `undefined` in dev/staging
- `website/app/plugins/sentry.ts` fixed: removed `staging ||` condition from both `captureException` guards
- `dashboard/app/plugins/sentry.ts` fixed: same fix as website plugin
- `apps/strapi/config/plugins.ts` fixed: `enabled: true` → `enabled: process.env.NODE_ENV === "production"`
- Wave 2 audit confirmed: no `staging` conditions remain in code (only in comments), all 4 sentry config files have `isProduction` guard, Strapi plugin guard verified

## Task Commits

Each task was committed atomically:

1. **Task 1.1: Fix dashboard/sentry.server.config.ts** - `9aa0d01` (fix)
2. **Task 1.2: Fix website/app/plugins/sentry.ts** - `378d6f7` (fix)
3. **Task 1.3: Fix dashboard/app/plugins/sentry.ts** - `ef0b56c` (fix)
4. **Task 1.4: Fix strapi/config/plugins.ts** - `fe27326` (fix)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `apps/dashboard/sentry.server.config.ts` — Added `isProduction` guard, DSN gated to `undefined` when not production
- `apps/website/app/plugins/sentry.ts` — Removed `staging ||` from two `captureException` conditions
- `apps/dashboard/app/plugins/sentry.ts` — Removed `staging ||` from two `captureException` conditions
- `apps/strapi/config/plugins.ts` — Changed `enabled: true` to `enabled: process.env.NODE_ENV === "production"`

## Decisions Made

- **DSN-gating pattern over conditional init**: Matches existing pattern in the three already-correct files (`sentry.client.config.ts` in both apps + `sentry.server.config.ts` in website). Consistent, and `dsn: undefined` is the official SDK-supported way to disable all instrumentation.
- **Comment style**: Matched the comment style from existing correct files to maintain consistency across the codebase.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 7 Sentry entry points now have production-only guards
- Dev and staging environments will generate zero Sentry traffic
- Phase complete — ready to plan next milestone

---
*Phase: 41-sentry-production-only*
*Completed: 2026-03-07*

## Self-Check: PASSED

- ✅ SUMMARY.md exists at `.planning/phases/41-sentry-production-only/41-41-SUMMARY.md`
- ✅ `apps/dashboard/sentry.server.config.ts` exists
- ✅ `apps/website/app/plugins/sentry.ts` exists
- ✅ `apps/dashboard/app/plugins/sentry.ts` exists
- ✅ `apps/strapi/config/plugins.ts` exists
- ✅ Commit `9aa0d01` found (Task 1.1)
- ✅ Commit `378d6f7` found (Task 1.2)
- ✅ Commit `ef0b56c` found (Task 1.3)
- ✅ Commit `fe27326` found (Task 1.4)
