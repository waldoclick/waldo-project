---
phase: 125-merge-dashboard-into-website
plan: "02"
subsystem: infra
tags: [nuxt, vite, chart.js, vue-chartjs, qs, slugify, highlight.js, vuedraggable, routeRules, robots]

requires:
  - phase: 125-01
    provides: dashboard-guard, onboarding-guard exemption, dashboard.vue layout, search/settings stores

provides:
  - Dashboard-exclusive npm packages installed in website workspace (chart.js, vue-chartjs, chartjs-plugin-annotation, qs, slugify, highlight.js, vuedraggable, @types/qs)
  - website nuxt.config.ts vite.optimizeDeps extended with 4 dashboard chart/qs deps
  - 24 dashboard routeRules migrated with /dashboard/ prefix on both source and target
  - robots /dashboard/ disallow preventing search engine indexing of admin routes

affects: [125-03, 125-04, 125-05, 125-06]

tech-stack:
  added: [chart.js@^4.5.1, vue-chartjs@^5.3.3, chartjs-plugin-annotation@^3.1.0, qs@^6.14.0, slugify@^1.6.6, highlight.js@^11.11.1, vuedraggable@^4.1.0, "@types/qs@^6.9.18"]
  patterns:
    - Dashboard-prefixed routeRules pattern — all migrated rules use /dashboard/* prefix on both source and target to avoid clashing with public website routes

key-files:
  created: []
  modified:
    - apps/website/package.json
    - yarn.lock
    - apps/website/nuxt.config.ts

key-decisions:
  - "24 dashboard routeRules (not 22 as CONTEXT/PLAN stated — actual count from dashboard nuxt.config) migrated with /dashboard/ prefix on both source and target paths per D-14 lock"
  - "@vueform/multiselect NOT added — zero imports in dashboard (dead dependency per RESEARCH.md)"
  - "slugify/highlight.js/vuedraggable installed (Task 1) but NOT added to vite.optimizeDeps — only chart/qs entries per D-10 spec"

patterns-established:
  - "routeRules /dashboard/ prefix pattern: all dashboard Spanish->English redirects scoped under /dashboard/ namespace to prevent collision with public website routes"

requirements-completed: [PKG-01, CFG-01]

duration: 6min
completed: 2026-06-10
---

# Phase 125 Plan 02: Packages + nuxt.config Consolidation Summary

**8 dashboard-exclusive npm packages installed in website workspace; vite.optimizeDeps extended with 4 chart/qs entries; 24 /dashboard/-prefixed routeRules and robots /dashboard/ disallow added to nuxt.config.ts**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-06-10T15:15:56Z
- **Completed:** 2026-06-10T15:21:16Z
- **Tasks:** 2
- **Files modified:** 3 (package.json, yarn.lock, nuxt.config.ts)

## Accomplishments

- All 8 dashboard-exclusive packages (chart.js, vue-chartjs, chartjs-plugin-annotation, qs, slugify, highlight.js, vuedraggable + @types/qs dev) added to website workspace
- vite.optimizeDeps.include extended with qs, vue-chartjs, chart.js, chartjs-plugin-annotation (4 new entries)
- 24 routeRules migrated from dashboard nuxt.config with /dashboard/ prefix on source and target — prevents clashing with public website Spanish routes
- robots disallow /dashboard/ added to non-blocking branch — prevents search engine indexing of admin section

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dashboard-exclusive packages into website workspace** - `451bf62e` (feat)
2. **Task 2: nuxt.config optimizeDeps + routeRules + robots additions** - `4ff0517a` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `apps/website/package.json` — added 7 runtime + 1 dev dashboard-exclusive dependencies
- `yarn.lock` — updated lockfile after yarn workspace add
- `apps/website/nuxt.config.ts` — vite.optimizeDeps 4 new entries, routeRules block (24 rules), robots disallow /dashboard/

## Decisions Made

- **24 vs 22 routeRules:** The plan and CONTEXT.md stated "22" but the actual dashboard nuxt.config contained 24 source keys (7 anuncios, 1 ordenes, 3 reservas, 3 destacados, 2 usuarios, 4 cuenta, plus categorias/condiciones/regiones/comunas). All 24 were migrated. The plan's intent was "migrate all of them" — the number 22 was a miscount in planning docs.
- **@vueform/multiselect excluded:** Confirmed zero imports in dashboard; dead dependency per RESEARCH.md verification.
- **optimizeDeps scope:** Only 4 entries per D-10 spec (qs, vue-chartjs, chart.js, chartjs-plugin-annotation). slugify/highlight.js/vuedraggable installed as packages but not added to optimizeDeps (not in D-10 list).
- **robots value:** Used literal `"/dashboard/"` (not `"/dashboard/**"`) to match the robots disallow array string format used by other entries in the config.

## Deviations from Plan

None - plan executed exactly as written (24-vs-22 routeRules count was a planning doc miscount, not an execution deviation; the plan's instruction was to migrate all of them).

## Issues Encountered

None. yarn workspace add succeeded on first run; all 8 packages present in package.json after install; typecheck reported no nuxt.config errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All dashboard-exclusive packages now installed in website workspace — components and composables using chart.js, vue-chartjs, qs, slugify, highlight.js, vuedraggable will resolve at typecheck/build time
- nuxt.config.ts consolidated — no further config edits needed for the routeRules/robots/optimizeDeps concerns
- Ready for Wave 2+ plans: component moves, SCSS merge, session migration

---
*Phase: 125-merge-dashboard-into-website*
*Completed: 2026-06-10*
