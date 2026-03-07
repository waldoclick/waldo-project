---
phase: 40-users-filter-authenticated
plan: "02"
subsystem: ui
tags: [vue, nuxt, dashboard, users, table]

# Dependency graph
requires:
  - phase: 40-users-filter-authenticated
    plan: "01"
    provides: Strapi server-side role filtering; role data no longer exposed in list response
provides:
  - UsersDefault.vue with 6-column table (no Rol column)
  - searchParams without populate:role
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Surgical deletion pattern: remove broken/unused UI columns when backend no longer provides data"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/UsersDefault.vue

key-decisions:
  - "Removed Rol column entirely since it always showed '-' (content-API sanitizer strips populate:role for regular JWTs)"
  - "Did not remove users--default__role SCSS class (out of scope per plan)"

patterns-established:
  - "Remove populate keys from searchParams when backend filtering makes them redundant"

requirements-completed:
  - FILTER-04

# Metrics
duration: 1min
completed: 2026-03-07
---

# Phase 40 Plan 02: Remove Rol Column from Users Table Summary

**Removed broken "Rol" column and its unused `populate: { role }` fetch key from UsersDefault.vue — table now shows 6 clean columns matching actual API response**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-07T21:20:04Z
- **Completed:** 2026-03-07T21:21:43Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Removed `populate: { role: { fields: ["name"] } }` from `searchParams` — the property was silently stripped by the content-API sanitizer anyway
- Removed `{ label: "Rol" }` from `tableColumns` — users table now has 6 columns: ID, Usuario, Correo electrónico, Nombre, Fecha, Acciones
- Removed the role `<TableCell>` (with `users--default__role` div) from the template — no stale `-` display
- TypeScript typecheck passes cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove populate:role from searchParams and drop Rol column** - `afa7114` (feat)

**Plan metadata:** `8dfadee` (docs: complete plan)

## Files Created/Modified
- `apps/dashboard/app/components/UsersDefault.vue` - Removed Rol column header, role TableCell, and populate:role from searchParams

## Decisions Made
- Kept `users--default__role` SCSS class in the stylesheet (out of scope — the plan explicitly stated not to remove it from SCSS)
- No other logic changes: pagination, sorting, search, and all remaining 6 columns remain intact

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 02 complete. The users table now has 6 columns and no broken role data.
- Phase 40 is ready for any remaining plans or phase close.

---
*Phase: 40-users-filter-authenticated*
*Completed: 2026-03-07*

## Self-Check: PASSED
- `apps/dashboard/app/components/UsersDefault.vue` — FOUND on disk
- `.planning/phases/40-users-filter-authenticated/40-02-SUMMARY.md` — FOUND on disk
- Commit `afa7114` — FOUND in git log

