---
phase: 06-performance
plan: 02
subsystem: api
tags: [strapi, dashboard, stats, performance]

requires:
  - phase: 05-type-safety
    provides: Shared domain types and Strapi SDK cast patterns used across the codebase

provides:
  - GET /api/indicators/dashboard-stats endpoint returning all 16 StatisticsDefault counts in one round trip

affects:
  - dashboard StatisticsDefault.vue (consumer of this endpoint)

tech-stack:
  added: []
  patterns:
    - "Parallel server-side DB queries via Promise.all in Strapi controller reduces N network round trips to 1"
    - "Custom Strapi route placed before wildcard /:id to prevent route masking"

key-files:
  created: []
  modified:
    - apps/strapi/src/api/indicator/controllers/indicator.ts
    - apps/strapi/src/api/indicator/routes/indicator.ts

key-decisions:
  - "dashboardStats added to existing plain export object controller (no factory pattern) to match existing file style"
  - "Route inserted between /indicators/convert and /indicators/:id so the static path is not shadowed by the dynamic wildcard"
  - "16 DB count queries run in parallel via Promise.all — same wall-clock latency as slowest query, eliminates 15 HTTP round trips vs. dashboard calling each endpoint individually"

patterns-established:
  - "Aggregate endpoint pattern: run all related counts server-side in Promise.all, return flat data object"

requirements-completed: [PERF-03]

duration: 5min
completed: 2026-03-05
---

# Phase 6 Plan 02: Dashboard Stats Aggregate Endpoint Summary

**Single Strapi endpoint `GET /api/indicators/dashboard-stats` executes 16 DB count queries in parallel and returns them as a flat JSON object, replacing 16 separate network requests from StatisticsDefault.vue**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-05T14:40:00Z
- **Completed:** 2026-03-05T14:45:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Added `dashboardStats` method to the existing indicator controller with all 16 parallel DB count queries
- Registered `GET /indicators/dashboard-stats` route in the indicator routes file, positioned before the `/:id` wildcard to avoid route masking
- All 16 response keys (`pending`, `published`, `archived`, `rejected`, `reservasUsadas`, `reservasLibres`, `destacadosUsados`, `destacadosLibres`, `ordenes`, `usuarios`, `categorias`, `condiciones`, `faqs`, `packs`, `regiones`, `comunas`) match exactly what StatisticsDefault.vue expects

## Task Commits

Each task was committed atomically:

1. **Task 1: Read existing indicator files and implement dashboardStats endpoint** - `c8c9b88` (feat)

## Files Created/Modified

- `apps/strapi/src/api/indicator/controllers/indicator.ts` - Added `dashboardStats` method with 16 parallel `strapi.db.query().count()` calls via Promise.all
- `apps/strapi/src/api/indicator/routes/indicator.ts` - Added `GET /indicators/dashboard-stats` route before `/:id` wildcard

## Decisions Made

- `dashboardStats` placed after `findOne` in the controller object to match existing plain-export style (no factory pattern in this file)
- Route positioned between `/indicators/convert` and `/indicators/:id` so the static segment `dashboard-stats` is not captured by the dynamic `:id` parameter
- Users plugin queried via `plugin::users-permissions.user` (not a standard content type) as documented in the plan

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Endpoint is registered and compiles without TypeScript errors
- StatisticsDefault.vue can now be updated to call `GET /api/indicators/dashboard-stats` once instead of making 16 individual requests (that consumer-side change is outside this plan's scope)

---
*Phase: 06-performance*
*Completed: 2026-03-05*
