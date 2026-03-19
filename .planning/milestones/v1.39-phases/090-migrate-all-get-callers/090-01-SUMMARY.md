---
phase: 090-migrate-all-get-callers
plan: "01"
subsystem: api
tags: [useApiClient, pinia, strapi-sdk, stores, migration]

# Dependency graph
requires:
  - phase: 089-get-support-in-useapiclient
    provides: GET method support with params passthrough in useApiClient
provides:
  - filter.store.ts commune and category filter fetching via useApiClient
  - regions.store.ts region list fetching via useApiClient
  - communes.store.ts commune list fetching via useApiClient
  - conditions.store.ts condition list and single-condition fetching via useApiClient
  - faqs.store.ts FAQ list fetching via useApiClient
affects: [090-migrate-all-get-callers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Setup store GET migration: const client = useApiClient() at store root level; client('/api/path', { method: 'GET' })"
    - "Options API store GET migration: const client = useApiClient() inside each action body"
    - "Params cast: { ... } as unknown as Record<string, unknown> for Strapi query params"
    - "Response cast preserved: response as unknown as SomeType — raw body shape matches SDK shape"

key-files:
  created: []
  modified:
    - apps/website/app/stores/filter.store.ts
    - apps/website/app/stores/regions.store.ts
    - apps/website/app/stores/communes.store.ts
    - apps/website/app/stores/conditions.store.ts
    - apps/website/app/stores/faqs.store.ts

key-decisions:
  - "Setup stores (filter, faqs): client = useApiClient() at store root level — composable rules require setup-level instantiation"
  - "Options API stores (regions, communes, conditions): useApiClient() inside each action — Options API actions are regular methods, not setup context"
  - "All /api/ prefixes added: useApiClient calls useStrapiClient which prepends Strapi base URL, so paths must start with /api/"
  - "Response casts unchanged: client returns raw body with same shape as strapi.find — no .data accessor removal needed here"

patterns-established:
  - "Reference data stores: use useApiClient with /api/{collection} paths and same params structure as SDK"

requirements-completed:
  - API-01

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 090 Plan 01: Migrate Reference Data Stores Summary

**Migrated 5 reference-data stores (filter, regions, communes, conditions, faqs) from strapi.find() to useApiClient with /api/ prefixed URLs and identical response shapes**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T15:08:50Z
- **Completed:** 2026-03-15T15:13:03Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- `filter.store.ts`: `loadFilterCommunes` and `loadFilterCategories` use `client('/api/filter/communes')` and `client('/api/filter/categories')`; `const client = useApiClient()` at store root level
- `regions.store.ts`: `loadRegions` uses `client('/api/regions', { method: 'GET', params: { pagination } })`; `useStrapi()` removed
- `communes.store.ts`: `loadCommunes` uses `client('/api/communes', { method: 'GET', params: { pagination, populate, sort } })`; `useStrapi()` removed
- `conditions.store.ts`: `loadConditions` and `loadConditionById` each use `client('/api/conditions', { method: 'GET', params })`; two separate `useStrapi()` calls removed
- `faqs.store.ts`: `loadFaqs` uses `client('/api/faqs', { method: 'GET', params: { pagination, populate, sort } })`; root-level `const strapi = useStrapi()` replaced with `const client = useApiClient()`

## Task Commits

Each task was committed atomically (note: prior session committed these as part of other plan batches):

1. **Task 1: Migrate filter.store.ts** — `65d5135` (feat, included in 090-04 batch commit)
2. **Task 2: Migrate regions, communes, conditions, faqs stores** — `f452aff` (feat, included in 090-03 batch commit)
3. **Task 3: Verify wave 1 stores — typecheck + grep gate** — no code changes; verification confirmed zero strapi.find/findOne references and no new TypeScript errors

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `apps/website/app/stores/filter.store.ts` — `loadFilterCommunes` + `loadFilterCategories` use `client('/api/filter/communes')` and `client('/api/filter/categories')`
- `apps/website/app/stores/regions.store.ts` — `loadRegions` uses `client('/api/regions')` with pagination params
- `apps/website/app/stores/communes.store.ts` — `loadCommunes` uses `client('/api/communes')` with pagination/populate/sort
- `apps/website/app/stores/conditions.store.ts` — `loadConditions` + `loadConditionById` use `client('/api/conditions')` with respective param sets
- `apps/website/app/stores/faqs.store.ts` — `loadFaqs` uses `client('/api/faqs')` with pagination/populate/sort

## Decisions Made

- **Setup vs Options API placement**: Setup stores (filter, faqs) get `const client = useApiClient()` at the store root; Options API stores (regions, communes, conditions) get it inside each action body — both satisfy Nuxt composable rules
- **URL prefix**: All paths use `/api/` prefix since `useApiClient` calls `useStrapiClient()` which prepends the Strapi base URL
- **Response casts unchanged**: Raw body from `useApiClient` has identical shape to `strapi.find()` response — `{ data: T[], meta: {...} }` for collection endpoints; existing `as unknown as SomeType` casts remain valid

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

TypeScript typecheck has 4 pre-existing errors in `mis-anuncios.vue` and `mis-ordenes.vue` (`.data` and `.meta` on `{}` type from `loadUserAds`/`loadUserOrders` return type). These errors existed before this plan and are unrelated to the 5 stores migrated here — they are in scope for a future plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 reference-data stores migrated; zero `strapi.find()` calls remain in filter, regions, communes, conditions, faqs stores
- Requirement API-01 satisfied
- Pre-existing TypeScript errors (4) in mis-anuncios.vue and mis-ordenes.vue do not affect plan success criteria — no new errors introduced

## Self-Check: PASSED

- `apps/website/app/stores/filter.store.ts` — FOUND, zero strapi references
- `apps/website/app/stores/regions.store.ts` — FOUND, zero strapi references
- `apps/website/app/stores/communes.store.ts` — FOUND, zero strapi references
- `apps/website/app/stores/conditions.store.ts` — FOUND, zero strapi references
- `apps/website/app/stores/faqs.store.ts` — FOUND, zero strapi references
- `.planning/phases/090-migrate-all-get-callers/090-01-SUMMARY.md` — FOUND
- Commits `65d5135` (filter.store.ts), `f452aff` (regions/communes/conditions/faqs) — BOTH FOUND

---
*Phase: 090-migrate-all-get-callers*
*Completed: 2026-03-15*
