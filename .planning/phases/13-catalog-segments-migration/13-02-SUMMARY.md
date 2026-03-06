---
phase: 13-catalog-segments-migration
plan: 02
subsystem: ui
tags: [nuxt, vue, routing, url-migration, communes, conditions]

# Dependency graph
requires:
  - phase: 12-ads-migration
    provides: Established git mv + route-ref update pattern for Spanish→English URL migration
provides:
  - communes/ route tree at /communes with index, new, [id]/index, [id]/edit
  - conditions/ route tree at /conditions with index, new, [id]/index, [id]/edit
affects: [13-catalog-segments-migration, 15-redirects]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "git mv for directory renames to preserve Git history"
    - "Two-commit pattern: rename dirs first, update route refs second"

key-files:
  created: []
  modified:
    - apps/dashboard/app/pages/communes/index.vue
    - apps/dashboard/app/pages/communes/new.vue
    - apps/dashboard/app/pages/communes/[id]/index.vue
    - apps/dashboard/app/pages/communes/[id]/edit.vue
    - apps/dashboard/app/pages/conditions/index.vue
    - apps/dashboard/app/pages/conditions/new.vue
    - apps/dashboard/app/pages/conditions/[id]/index.vue
    - apps/dashboard/app/pages/conditions/[id]/edit.vue

key-decisions:
  - "Task 1 (directory renames via git mv) was already completed in commit 1725cb0 as part of a batch rename; proceeded directly to Task 2 (route ref updates)"
  - "Breadcrumb labels updated from Spanish (Comunas/Condiciones) to English (Communes/Conditions) to match new route paths"

patterns-established:
  - "Route ref update pattern: NuxtLink :to bindings, breadcrumb to: values, and dynamic template literal paths all updated in same task commit"

requirements-completed: [URL-04, URL-05]

# Metrics
duration: 3min
completed: 2026-03-06
---

# Phase 13 Plan 02: Communes and Conditions URL Migration Summary

**Renamed comunas→communes and condiciones→conditions route trees, updated all internal NuxtLink and breadcrumb route references from Spanish /comunas/ and /condiciones/ paths to English /communes/ and /conditions/**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-06T02:37:13Z
- **Completed:** 2026-03-06T02:40:19Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- communes/ directory with index.vue, new.vue, [id]/index.vue, [id]/edit.vue now serves /communes/ routes
- conditions/ directory with index.vue, new.vue, [id]/index.vue, [id]/edit.vue now serves /conditions/ routes
- All 8 files updated: NuxtLink bindings, breadcrumb `to:` values, and dynamic template literal paths converted from Spanish to English
- Old comunas/ and condiciones/ directories deleted; editar.vue files renamed to edit.vue

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename comunas and condiciones directories and files** - `1725cb0` (feat) — *already committed in batch rename commit*
2. **Task 2: Update internal route references in communes and conditions pages** - `6578a2f` (feat)

**Plan metadata:** *(pending docs commit)*

## Files Created/Modified
- `apps/dashboard/app/pages/communes/index.vue` — NuxtLink `/comunas/new` → `/communes/new`
- `apps/dashboard/app/pages/communes/new.vue` — breadcrumb `/comunas` → `/communes`
- `apps/dashboard/app/pages/communes/[id]/index.vue` — NuxtLink `/comunas/[id]/editar` → `/communes/[id]/edit`; breadcrumb updated
- `apps/dashboard/app/pages/communes/[id]/edit.vue` — breadcrumbs `/comunas` → `/communes`
- `apps/dashboard/app/pages/conditions/index.vue` — NuxtLink `/condiciones/new` → `/conditions/new`
- `apps/dashboard/app/pages/conditions/new.vue` — breadcrumb `/condiciones` → `/conditions`
- `apps/dashboard/app/pages/conditions/[id]/index.vue` — NuxtLink `/condiciones/[id]/editar` → `/conditions/[id]/edit`; breadcrumb updated
- `apps/dashboard/app/pages/conditions/[id]/edit.vue` — breadcrumbs `/condiciones` → `/conditions`

## Decisions Made
- Task 1 (directory renames) was already completed in commit `1725cb0` as part of a batch rename that included multiple catalog segments. Proceeded directly to Task 2 (route reference updates).
- Breadcrumb labels updated from Spanish (Comunas/Condiciones) to English (Communes/Conditions) to match the new English route paths.

## Deviations from Plan

None - plan executed exactly as written. Task 1 was already completed in a prior commit; Task 2 proceeded as specified.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- /communes/ and /conditions/ route trees are fully migrated to English paths
- Fulfils URL-04 and URL-05 requirements
- Ready for Phase 15 (redirects) to add /comunas/ → /communes/ and /condiciones/ → /conditions/ redirect rules

## Self-Check: PASSED

All key files verified on disk. Task commit 6578a2f confirmed in git history.

---
*Phase: 13-catalog-segments-migration*
*Completed: 2026-03-06*
