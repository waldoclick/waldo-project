---
phase: 108-dashboard-replace-nuxtjs-strapi-sdk-with-useapiclient-for-all-reads
plan: 02
subsystem: ui
tags: [nuxt, vue, strapi, useApiClient, composables, dashboard]

# Dependency graph
requires:
  - phase: 107-dashboard-recaptcha-and-api-client-migration
    provides: useApiClient composable and apiClient call pattern for dashboard
provides:
  - All 19 dashboard detail pages migrated from strapi.find/findOne to useApiClient
  - Zero remaining strapi.find() or strapi.findOne() calls in dashboard pages
affects: [108-01, phase-109, any future dashboard page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useApiClient() called at setup scope (outside useAsyncData), captured variable used inside callbacks
    - apiClient(collection, { method: GET, params }) for list queries with filters
    - apiClient(`collection/${id}`, { method: GET, params }) for single-item fallback
    - params cast as `unknown as Record<string, unknown>` for TypeScript compatibility

key-files:
  created: []
  modified:
    - apps/dashboard/app/pages/articles/[id]/edit.vue
    - apps/dashboard/app/pages/articles/[id]/index.vue
    - apps/dashboard/app/pages/categories/[id]/edit.vue
    - apps/dashboard/app/pages/categories/[id]/index.vue
    - apps/dashboard/app/pages/communes/[id]/edit.vue
    - apps/dashboard/app/pages/communes/[id]/index.vue
    - apps/dashboard/app/pages/conditions/[id]/edit.vue
    - apps/dashboard/app/pages/conditions/[id]/index.vue
    - apps/dashboard/app/pages/faqs/[id]/edit.vue
    - apps/dashboard/app/pages/faqs/[id]/index.vue
    - apps/dashboard/app/pages/featured/[id].vue
    - apps/dashboard/app/pages/packs/[id]/edit.vue
    - apps/dashboard/app/pages/packs/[id]/index.vue
    - apps/dashboard/app/pages/regions/[id]/edit.vue
    - apps/dashboard/app/pages/regions/[id]/index.vue
    - apps/dashboard/app/pages/reservations/[id].vue
    - apps/dashboard/app/pages/ads/[id].vue
    - apps/dashboard/app/pages/orders/[id].vue
    - apps/dashboard/app/pages/users/[id].vue

key-decisions:
  - "useApiClient() must be at setup scope even when strapi was called inside useAsyncData — captured variable is used inside the callback"
  - "users/[id].vue normalizeUser() handles direct response shape from /users/:id endpoint — no wrapper needed"
  - "articles/[id]/edit.vue had strapi kept from Phase 107 for reads only — removed entirely now that reads migrate too"

patterns-established:
  - "Dual find+findOne pattern: apiClient(collection, { method: GET, params: { filters: { documentId: { $eq: id } } } }) then apiClient(`collection/${id}`, { method: GET }) as fallback"

requirements-completed: [RDR-108-01, RDR-108-02, RDR-108-03]

# Metrics
duration: 3min
completed: 2026-03-29
---

# Phase 108 Plan 02: Dashboard Pages Migration Summary

**All 19 dashboard detail pages migrated from strapi.find/findOne SDK calls to useApiClient GET requests, eliminating dual-SDK reads**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-29T23:24:00Z
- **Completed:** 2026-03-29T23:27:01Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments
- Migrated 16 dual find+findOne pattern pages (articles, categories, communes, conditions, faqs, featured, packs, regions, reservations) to apiClient
- Migrated 3 single-call pages (ads, orders, users) to apiClient
- Zero remaining strapi.find() or strapi.findOne() calls in any dashboard page
- useApiClient() correctly placed at setup scope in all 19 pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate dual find+findOne pages (16 files)** - `5ace5a6c` (feat)
2. **Task 2: Migrate single-call pages (ads, orders, users)** - `7b3be8f3` (feat)

## Files Created/Modified
- `apps/dashboard/app/pages/faqs/[id]/index.vue` - Replaced strapi.find/findOne with apiClient GET
- `apps/dashboard/app/pages/faqs/[id]/edit.vue` - Replaced strapi.find/findOne with apiClient GET
- `apps/dashboard/app/pages/articles/[id]/index.vue` - Replaced strapi.find/findOne with apiClient GET (with populate)
- `apps/dashboard/app/pages/articles/[id]/edit.vue` - Removed useStrapi(), replaced reads with apiClient GET (strapi kept for reads in Phase 107, now removed)
- `apps/dashboard/app/pages/categories/[id]/index.vue` - Replaced strapi.find/findOne with apiClient GET (with populate icon)
- `apps/dashboard/app/pages/categories/[id]/edit.vue` - Replaced strapi.find/findOne with apiClient GET (with populate icon)
- `apps/dashboard/app/pages/communes/[id]/index.vue` - Replaced strapi.find/findOne with apiClient GET (with populate region)
- `apps/dashboard/app/pages/communes/[id]/edit.vue` - Replaced strapi.find/findOne with apiClient GET (with populate region)
- `apps/dashboard/app/pages/conditions/[id]/index.vue` - Replaced strapi.find/findOne with apiClient GET
- `apps/dashboard/app/pages/conditions/[id]/edit.vue` - Replaced strapi.find/findOne with apiClient GET
- `apps/dashboard/app/pages/featured/[id].vue` - Replaced strapi.find/findOne with apiClient GET (complex populate)
- `apps/dashboard/app/pages/packs/[id]/index.vue` - Replaced strapi.find/findOne with apiClient GET
- `apps/dashboard/app/pages/packs/[id]/edit.vue` - Replaced strapi.find/findOne with apiClient GET
- `apps/dashboard/app/pages/regions/[id]/index.vue` - Replaced strapi.find/findOne with apiClient GET
- `apps/dashboard/app/pages/regions/[id]/edit.vue` - Replaced strapi.find/findOne with apiClient GET
- `apps/dashboard/app/pages/reservations/[id].vue` - Replaced strapi.find/findOne with apiClient GET (complex populate)
- `apps/dashboard/app/pages/ads/[id].vue` - Replaced strapi.findOne in fetchAd() with apiClient GET, removed useStrapi()
- `apps/dashboard/app/pages/orders/[id].vue` - Added useApiClient() at setup scope, replaced strapi.findOne with apiClient GET
- `apps/dashboard/app/pages/users/[id].vue` - Added useApiClient() at setup scope, replaced strapi.findOne with apiClient GET

## Decisions Made
- `useApiClient()` must be declared at setup scope (outside `useAsyncData`) because composables cannot be called inside async callbacks — the captured `apiClient` variable is passed into the callback
- `users/[id].vue`: The `/users/:id` endpoint returns the user object directly (not wrapped in `{ data: T }`). The existing `normalizeUser()` helper already handles both `{ data: User }` and direct `User` shapes, so no response handling changes were needed
- `articles/[id]/edit.vue` had `useStrapi()` retained from Phase 107 (used for reads while mutations moved to apiClient). Now that reads also migrate, `useStrapi()` is removed entirely from this file

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All dashboard pages now use useApiClient for all HTTP reads
- Combined with Plan 01 (components/stores), Phase 108 will eliminate the @nuxtjs/strapi SDK dependency from the dashboard entirely
- Ready for phase-level verification (zero strapi.find/findOne across entire dashboard)

## Self-Check: PASSED

- All 19 modified files exist on disk
- Commits 5ace5a6c and 7b3be8f3 verified in git log
- Zero strapi.find/findOne calls remain in any dashboard page
- Zero useStrapi() calls remain in any dashboard page

---
*Phase: 108-dashboard-replace-nuxtjs-strapi-sdk-with-useapiclient-for-all-reads*
*Completed: 2026-03-29*
