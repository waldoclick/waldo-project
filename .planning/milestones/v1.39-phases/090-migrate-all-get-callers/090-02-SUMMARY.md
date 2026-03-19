---
phase: 090-migrate-all-get-callers
plan: "02"
subsystem: api
tags: [strapi, useApiClient, pinia, stores, vue]

# Dependency graph
requires:
  - phase: 089-get-support-in-useapiclient
    provides: useApiClient with GET method support and params passthrough
provides:
  - ads.store.ts: loadAds, loadAdBySlug, loadAdById via useApiClient
  - related.store.ts: loadRelatedAds via useApiClient
  - articles.store.ts: loadArticles via useApiClient
  - categories.store.ts: loadCategories, loadCategory, loadCategoryById via useApiClient
affects:
  - 090-migrate-all-get-callers (remaining plans)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Setup stores: useApiClient() at root level, not inside actions"
    - "client('/api/endpoint', { method: 'GET', params: {...} as unknown as Record<string, unknown> })"
    - "Response cast as unknown as StrapiResponse<T> or domain-specific response type"

key-files:
  created: []
  modified:
    - apps/website/app/stores/ads.store.ts
    - apps/website/app/stores/related.store.ts
    - apps/website/app/stores/articles.store.ts
    - apps/website/app/stores/categories.store.ts

key-decisions:
  - "useApiClient() placed at store root level for all setup stores (not inside each action)"
  - "sort: ['name:asc'] added to loadCategories per plan spec"
  - "StrapiResponse type imports from @nuxtjs/strapi retained — they describe response shapes, not SDK usage"

patterns-established:
  - "Setup store migration: replace const strapi = useStrapi() with const client = useApiClient() at same location"
  - "Options API store migration: if useStrapi() was inside each action, move single useApiClient() to root level"

requirements-completed:
  - API-01
  - API-02

# Metrics
duration: 3min
completed: 2026-03-15
---

# Phase 090 Plan 02: Content Stores Migration Summary

**4 primary content stores (ads, related ads, articles, categories) migrated from strapi.find() to useApiClient() with root-level client instantiation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-15T15:08:46Z
- **Completed:** 2026-03-15T15:12:40Z
- **Tasks:** 3 (2 migration + 1 verification)
- **Files modified:** 4

## Accomplishments
- ads.store.ts: 3 find calls (loadAds, loadAdBySlug, loadAdById) → useApiClient
- related.store.ts: 1 find call (loadRelatedAds) → useApiClient
- articles.store.ts: 1 find call (loadArticles) → useApiClient
- categories.store.ts: 3 per-action useStrapi() calls consolidated to 1 root-level useApiClient()

## Task Commits

Each task was committed atomically:

1. **Task 1: ads.store.ts + related.store.ts** — `65d5135` + `aad6e5f` + `19d4430` (feat — prior session commits under 090-04 label)
2. **Task 2: articles.store.ts + categories.store.ts** — `7a008ac` (feat)
3. **Task 3: Verify wave 1 content stores** — verification only (no file changes)

**Plan metadata:** (docs commit follows)

_Note: Task 1 store changes were committed in a prior execution session under 090-04 labels; the changes are correct and verified. Task 2 commit is properly labeled 090-02._

## Files Created/Modified
- `apps/website/app/stores/ads.store.ts` — useApiClient at root level; 3 find() calls replaced
- `apps/website/app/stores/related.store.ts` — useApiClient at root level; 1 find() call replaced
- `apps/website/app/stores/articles.store.ts` — useApiClient at root level; 1 find() call replaced
- `apps/website/app/stores/categories.store.ts` — single useApiClient() moved to setup root; 3 per-action useStrapi() instances removed

## Decisions Made
- `useApiClient()` is always placed at setup root level — not inside individual actions. This matches the composable rules for setup stores.
- `StrapiResponse<T>` type imports retained from `@nuxtjs/strapi` — they are TypeScript type-only imports describing response shapes, not SDK usage.
- `sort: ['name:asc']` added to loadCategories per plan specification.

## Deviations from Plan

### Context Note
The `ads.store.ts` and `related.store.ts` changes were committed in a prior execution session under `090-04` labels (commits `65d5135`, `aad6e5f`, `19d4430`). This is not a deviation from the migration itself — the code is correct per the plan spec — but the commit labels differ from the expected `090-02` pattern. The `articles.store.ts` changes were similarly pre-committed under `090-03` (commit `fdbc01b`).

**categories.store.ts** was the only file requiring fresh migration in this session.

**Total deviations:** None — plan executed correctly. Prior session committed subset of Task 1/2 files under different plan labels; outcome is identical.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 core content stores now use useApiClient
- Remaining stores (filter, communes, conditions, regions, history, faqs, me) targeted in subsequent plans
- Ready for 090-03 and beyond

---
*Phase: 090-migrate-all-get-callers*
*Completed: 2026-03-15*
