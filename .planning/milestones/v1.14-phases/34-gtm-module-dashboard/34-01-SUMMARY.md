---
phase: 34-gtm-module-dashboard
plan: 01
subsystem: ui
tags: [gtm, google-tag-manager, nuxt, nuxt-module, dashboard]

# Dependency graph
requires:
  - phase: 33-gtm-module-migration
    provides: "@saslavik/nuxt-gtm pattern — top-level gtm config + runtimeConfig.public.gtm.id"
provides:
  - "@saslavik/nuxt-gtm@0.1.3 installed in dashboard"
  - "GTM fires page_view on every SPA navigation in dashboard via enableRouterSync: true"
  - "Legacy gtmId flat field removed from dashboard runtimeConfig"
affects: []

# Tech tracking
tech-stack:
  added: ["@saslavik/nuxt-gtm@0.1.3"]
  patterns:
    - "Module-based GTM injection (not hand-rolled plugin) in dashboard"
    - "runtimeConfig.public.gtm.id nested field replaces flat gtmId"

key-files:
  created: []
  modified:
    - apps/dashboard/package.json
    - apps/dashboard/nuxt.config.ts
  deleted:
    - apps/dashboard/app/plugins/gtm.client.ts

key-decisions:
  - "Used double-quote module string consistent with existing modules array style"
  - "Pre-existing formatDate typecheck errors (54 errors) logged as deferred — not caused by GTM migration"

patterns-established:
  - "Dashboard GTM config mirrors website: gtm: { id, enableRouterSync: true, debug: false } top-level block"

requirements-completed: [GTM-DASH-01, GTM-DASH-02, GTM-DASH-03]

# Metrics
duration: 5min
completed: 2026-03-07
---

# Phase 34 Plan 01: GTM Module Dashboard Summary

**`@saslavik/nuxt-gtm@0.1.3` installed in dashboard, hand-rolled `gtm.client.ts` plugin deleted, `runtimeConfig.public.gtmId` replaced with `gtm.id` — mirroring Phase 33 website migration**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-07T15:14:29Z
- **Completed:** 2026-03-07T15:20:14Z
- **Tasks:** 2
- **Files modified:** 3 (nuxt.config.ts, package.json, yarn.lock) + 1 deleted (gtm.client.ts)

## Accomplishments

- Installed `@saslavik/nuxt-gtm@0.1.3` in `apps/dashboard` devDependencies
- Registered `@saslavik/nuxt-gtm` in the modules array of `nuxt.config.ts`
- Added top-level `gtm: { id, enableRouterSync: true, debug: false }` config block
- Replaced `runtimeConfig.public.gtmId` flat field with `runtimeConfig.public.gtm.id`
- Deleted 64-line hand-rolled `gtm.client.ts` plugin (replaced by the module)
- Nuxt `prepare` ran successfully — `.nuxt` types generated including `$gtm: GtmSupport`

## Task Commits

Each task was committed atomically:

1. **Task 1: Install module, update nuxt.config.ts, delete gtm.client.ts** - `cd9be8f` (feat)
2. **Task 2: TypeScript verification + deferred issue documentation** - `8e7f3cd` (chore)

**Plan metadata:** `(pending)` (docs: complete plan)

## Files Created/Modified

- `apps/dashboard/package.json` — Added `@saslavik/nuxt-gtm@0.1.3` to devDependencies
- `apps/dashboard/nuxt.config.ts` — Module registered + gtm config block + runtimeConfig updated
- `apps/dashboard/app/plugins/gtm.client.ts` — DELETED (hand-rolled plugin removed)
- `.planning/phases/34-gtm-module-dashboard/deferred-items.md` — Created (pre-existing typecheck issues logged)

## Decisions Made

- Used double-quote string `"@saslavik/nuxt-gtm"` consistent with the rest of the modules array style (other entries use double quotes in this codebase)
- Pre-existing `formatDate` typecheck failures (54 errors, unrelated to GTM) logged in `deferred-items.md` rather than fixed — they were present before Phase 34 and none of the failing components were touched by our changes

## Deviations from Plan

### Auto-fixed Issues

None - plan executed exactly as written.

### Out-of-Scope Issues Logged

**Pre-existing TypeScript errors — `formatDate` auto-import not resolved in template context**
- **Found during:** Task 2 (TypeScript verification)
- **Nature:** 54 pre-existing `TS2339: Property 'formatDate' does not exist` errors across 28+ Vue components
- **Root cause:** `vue-tsc` template type checker sees component's own `setup()` return type rather than Nuxt global auto-imports for utility functions
- **Relationship to our changes:** NONE — confirmed by `git diff c70f518..cd9be8f` showing zero changes to any failing component
- **Evidence GTM IS integrated:** Error messages include `$gtm: GtmSupport` in the component type, confirming module injection works
- **Action taken:** Logged in `deferred-items.md` per scope boundary rule

---

**Total deviations:** 0 auto-fixed.
**Out-of-scope issues:** 1 pre-existing (logged to deferred-items.md).
**Impact on plan:** GTM migration requirements GTM-DASH-01, GTM-DASH-02, GTM-DASH-03 all satisfied. Pre-existing typecheck failure predates this phase.

## Issues Encountered

- The plan's verification check used single quotes `grep -q "'@saslavik/nuxt-gtm'" apps/dashboard/nuxt.config.ts` but the codebase uses double quotes — verified correctly with double-quote grep
- `yarn add -D` output only showed `jpeg-js` and `ofetch` as new deps (resolution lock artifacts), but confirmed `@saslavik/nuxt-gtm` was added to `package.json` devDependencies
- STATE.md context said "Dashboard has no `gtm.client.ts` plugin to delete" — this was incorrect; the file DID exist and was deleted as planned

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 34 (1/1 plans) is complete
- Both website (Phase 33) and dashboard (Phase 34) now use `@saslavik/nuxt-gtm` module consistently
- v1.14 milestone complete
- Pre-existing `formatDate` typecheck errors should be addressed in a future refactoring phase

---
*Phase: 34-gtm-module-dashboard*
*Completed: 2026-03-07*
