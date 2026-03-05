---
phase: 06-performance
plan: 01
subsystem: api
tags: [strapi, aggregate, performance, n+1, category, order]

# Dependency graph
requires:
  - phase: 05-type-safety
    provides: canonical domain types (Ad, Order, Category) used by consuming dashboard components
provides:
  - GET /api/categories/ad-counts — returns ad counts grouped by category in a single round trip
  - GET /api/orders/sales-by-month — returns 12 monthly order totals for a given year without client pagination
affects:
  - dashboard components (CategoriesDefault.vue, ChartSales.vue) that will consume these endpoints

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Parallel server-side DB count queries (Promise.all) to replace N sequential client requests
    - Server-side aggregation with limit:-1 to avoid client pagination loops
    - Custom route registered before generic path routes to avoid Strapi path-conflict issues

key-files:
  created: []
  modified:
    - apps/strapi/src/api/category/controllers/category.ts
    - apps/strapi/src/api/category/routes/category.ts
    - apps/strapi/src/api/order/controllers/order.ts
    - apps/strapi/src/api/order/routes/01-order-me.ts

key-decisions:
  - "Parallel Promise.all for per-category ad counts — reduces N sequential network round trips from client to 1, with N parallel DB queries server-side"
  - "limit:-1 on findMany for salesByMonth — fetches all orders for the year in one query, aggregated server-side by month index"
  - "GET /categories/ad-counts placed first in routes array to prevent Strapi matching it as a named :id segment"
  - "GET /orders/sales-by-month placed before /orders/me in 01-order-me.ts — both specific paths, no conflict risk"

patterns-established:
  - "Aggregate endpoint pattern: fetch all with limit:-1, aggregate in JS on server, return pre-computed result"
  - "Custom Strapi route ordering: specific paths before parameterized paths"

requirements-completed: [PERF-01, PERF-02]

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 6 Plan 01: Strapi Aggregate Endpoints Summary

**Two new Strapi aggregate endpoints eliminate N+1 network round trips — `/api/categories/ad-counts` uses parallel server-side DB counts and `/api/orders/sales-by-month` aggregates 12 monthly totals server-side without client pagination**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-05T18:04:44Z
- **Completed:** 2026-03-05T18:09:44Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added `adCounts` controller method using `Promise.all` to count ads per category in parallel, returning `{ data: [{ categoryId, count }] }` in a single HTTP round trip
- Added `salesByMonth` controller method fetching all orders for a given year via `limit: -1`, aggregating amounts by UTC month index server-side, returning `{ data: [{ month, total }], meta: { year } }`
- Registered both routes in their respective route files, both verified TypeScript-clean with no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Add GET /api/categories/ad-counts endpoint** - `e1abf9f` (feat)
2. **Task 2: Add GET /api/orders/sales-by-month endpoint** - `d26f602` (feat)

## Files Created/Modified
- `apps/strapi/src/api/category/controllers/category.ts` - Added `adCounts` method
- `apps/strapi/src/api/category/routes/category.ts` - Added GET /categories/ad-counts route as first entry
- `apps/strapi/src/api/order/controllers/order.ts` - Added `salesByMonth` method inside `createCoreController` callback
- `apps/strapi/src/api/order/routes/01-order-me.ts` - Added GET /orders/sales-by-month route before /orders/me

## Decisions Made
- Parallel `Promise.all` chosen for ad counts instead of raw SQL GROUP BY — simpler, compatible with Strapi entityService abstraction, and already eliminates the network N+1 problem (N DB queries still fire but server-side latency is negligible vs N HTTP round trips)
- `limit: -1` on `findMany` for the sales endpoint avoids pagination loops while keeping code within entityService patterns rather than raw SQL
- Route ordering: `/categories/ad-counts` must precede `/categories/:id` to avoid Strapi matching "ad-counts" as an id param

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both aggregate endpoints are ready for consumption by dashboard components (CategoriesDefault.vue, ChartSales.vue)
- Plan 06-02 can now update the dashboard components to call these endpoints instead of performing N+1 client loops

---
*Phase: 06-performance*
*Completed: 2026-03-05*
