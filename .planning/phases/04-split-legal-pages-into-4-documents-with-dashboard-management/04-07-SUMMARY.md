---
phase: 04-split-legal-pages-into-4-documents-with-dashboard-management
plan: 07
subsystem: ui
tags: [dashboard, navigation, vue, lucide-vue-next, bem]

# Dependency graph
requires:
  - phase: 04-05
    provides: Cookies dashboard CRUD routes (/dashboard/maintenance/cookies)
  - phase: 04-06
    provides: Security dashboard CRUD routes (/dashboard/maintenance/security)
provides:
  - Dashboard sidebar nav entries linking to Cookies and Security policy CRUD sections
  - Updated Términos y Condiciones de Uso label in dashboard nav (D-06 rename, dashboard-internal copy)
affects: [04-09]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - apps/website/app/components/MenuMaintenance.vue

key-decisions:
  - "Used distinct lucide-vue-next icons (Cookie, ShieldCheck) for the 2 new nav entries, avoiding collision with the existing Shield icon used for Políticas de privacidad"
  - "Términos y Condiciones de Uso label updated only in this dashboard-internal file — separate from the 8 public-facing reference points handled in Plan 08"

patterns-established: []

requirements-completed: [LEGAL-SPLIT-07]

# Metrics
duration: 8min
completed: 2026-07-02
---

# Phase 04 Plan 07: Dashboard Nav Wiring for Cookies and Security Summary

**MenuMaintenance.vue gains 2 new sidebar nav entries (Cookies, Seguridad) wired to their existing dashboard CRUD routes, plus a D-06 label rename for the Términos entry — knownSubRoutes extended to 10 entries with zero duplicates.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-02T00:20:00Z
- **Completed:** 2026-07-02T00:28:54Z
- **Tasks:** 1 completed
- **Files modified:** 1

## Accomplishments
- Added "Política de Cookies" nav entry (`Cookie` icon) linking to `/dashboard/maintenance/cookies`
- Added "Política de Seguridad" nav entry (`ShieldCheck` icon) linking to `/dashboard/maintenance/security`
- Renamed "Condiciones de Uso" nav label to "Términos y Condiciones de Uso" (dashboard's own copy, per D-06)
- Extended `knownSubRoutes` array from 8 to 10 entries — verified no duplicates, preserving correct "Mantenedores" root-active highlighting

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Cookies and Seguridad nav entries, update Términos label, extend knownSubRoutes** - `81dea62b` (feat)

**Plan metadata:** (this commit, docs: complete plan)

## Files Created/Modified
- `apps/website/app/components/MenuMaintenance.vue` - 2 new `<li>` nav entries, `Cookie`/`ShieldCheck` icon imports, renamed Términos label, `knownSubRoutes` extended to 10 entries

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. `vue-tsc --noEmit` exited 0. Grep-based verification confirmed both new routes, both new icon imports, and the updated label are present. Manual confirmation of `knownSubRoutes`: exactly 10 entries, no duplicates.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Dashboard sidebar now fully wired for both new legal document sections (Cookies, Seguridad).
- Ready for Plan 04-09 (manual permission grant + human verification checkpoint) — the final plan in Phase 04.

---
*Phase: 04-split-legal-pages-into-4-documents-with-dashboard-management*
*Completed: 2026-07-02*
