---
phase: 090-migrate-all-get-callers
plan: "04"
subsystem: api
tags: [useApiClient, composables, strapi-sdk, migration, nuxt]

# Dependency graph
requires:
  - phase: 089-get-support-in-useapiclient
    provides: useApiClient with GET support and raw body response
provides:
  - useStrapi.ts migrated to useApiClient
  - useOrderById.ts migrated to useApiClient
  - usePacksList.ts migrated to useApiClient
affects: [090-migrate-all-get-callers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "GET composables call client(url, { method: 'GET', params }) inside function body (not module level)"
    - "Params cast: { populate: '*' } as unknown as Record<string, unknown> for TypeScript compatibility"
    - "Single-item endpoint response: cast as { data: unknown } — raw body shape is { data: T, meta: {} }"
    - "Collection endpoint response: cast as { data: Pack[] } — same shape from raw body"

key-files:
  created: []
  modified:
    - apps/website/app/composables/useStrapi.ts
    - apps/website/app/composables/useOrderById.ts
    - apps/website/app/composables/usePacksList.ts

key-decisions:
  - "useApiClient() called inside usePacksList factory function (not module level) — composable rules require setup-level instantiation"
  - "response.data cast pattern preserved across all 3 composables — raw body shape identical to SDK for both single-item and collection endpoints"

requirements-completed:
  - API-03

# Metrics
duration: 1min
completed: 2026-03-15
---

# Phase 090 Plan 04: Migrate GET Composables to useApiClient Summary

**Migrated 3 website composables (useStrapi, useOrderById, usePacksList) from @nuxtjs/strapi SDK calls to useApiClient with identical return shapes**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-15T15:08:49Z
- **Completed:** 2026-03-15T15:10:11Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- `useStrapi.ts`: `strapi.find("ads")` → `client('/api/ads', { method: 'GET' })` — return shape unchanged
- `useOrderById.ts`: `strapi.findOne("orders", documentId, params)` → `client('/api/orders/${documentId}', { method: 'GET', params })` — JSDoc and guards preserved
- `usePacksList.ts`: `strapi.find("ad-packs", params)` → `client('/api/ad-packs', { method: 'GET', params })` — module-level TTL cache logic unmodified

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate useStrapi.ts** - `65d5135` (feat)
2. **Task 2: Migrate useOrderById.ts** - `aad6e5f` (feat)
3. **Task 3: Migrate usePacksList.ts** - `19d4430` (feat)

## Files Created/Modified
- `apps/website/app/composables/useStrapi.ts` — Ad data fetch via useApiClient
- `apps/website/app/composables/useOrderById.ts` — Single order fetch by documentId via useApiClient
- `apps/website/app/composables/usePacksList.ts` — Ad packs list with TTL cache via useApiClient

## Decisions Made
- `useApiClient()` placed inside `usePacksList()` factory (not module level) — consistent with Nuxt composable rules requiring setup-level instantiation
- Raw body shapes for both collection (`{ data: T[] }`) and single-item (`{ data: T }`) endpoints are identical to what the Strapi SDK returned, so callers required no changes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 3 more composables migrated; API-03 requirement satisfied
- All callers of these composables (pagar/gracias.vue, PacksDefault.vue, etc.) continue to work — return shapes unchanged
- Ready for remaining GET caller migrations in phase 090

## Self-Check: PASSED

- `apps/website/app/composables/useStrapi.ts` — FOUND
- `apps/website/app/composables/useOrderById.ts` — FOUND
- `apps/website/app/composables/usePacksList.ts` — FOUND
- `.planning/phases/090-migrate-all-get-callers/090-04-SUMMARY.md` — FOUND
- Commits `65d5135`, `aad6e5f`, `19d4430` — ALL FOUND

---
*Phase: 090-migrate-all-get-callers*
*Completed: 2026-03-15*
