---
phase: 090-migrate-all-get-callers
plan: "05"
subsystem: api
tags: [nuxt, vue, useApiClient, strapi-sdk, get-migration]

# Dependency graph
requires:
  - phase: 089-get-support-useapiclient
    provides: useApiClient composable with GET support (method, params)
provides:
  - All website pages and components free of direct strapi.find()/strapi.findOne() calls
  - pages/index.vue packs loading via useApiClient
  - pages/packs/index.vue packs loading via useApiClient
  - pages/anunciar/gracias.vue ad confirmation via useApiClient
  - pages/anunciar/index.vue ad creation init data via useApiClient
  - components/FormProfile.vue dead strapi import removed
affects: [090-migrate-all-get-callers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "GET via useApiClient: client('/api/resource', { method: 'GET', params: {...} as unknown as Record<string, unknown> })"
    - "Response is raw body — cast as { data: T } to access nested data property"
    - "useApiClient() instantiated at script setup root level, not inside useAsyncData callback"

key-files:
  created: []
  modified:
    - apps/website/app/pages/index.vue
    - apps/website/app/pages/packs/index.vue
    - apps/website/app/pages/anunciar/gracias.vue
    - apps/website/app/pages/anunciar/index.vue
    - apps/website/app/components/FormProfile.vue

key-decisions:
  - "index.vue and packs/index.vue were already migrated in plan 090-03 (commit fdbc01b) — no duplicate work needed"
  - "anunciar/gracias.vue findOne response destructured via response.data (not { data: ad } destructure) — useApiClient returns raw body"
  - "FormProfile.vue strapi import was truly dead code — purely subtractive removal"

patterns-established:
  - "Promise.all item cast: (await Promise.all([..., client(...)]))[2] as { data: T[] } — cast the Promise.all result, not the client call"

requirements-completed: [API-04]

# Metrics
duration: 5min
completed: 2026-03-15
---

# Phase 090 Plan 05: Migrate Pages and FormProfile Summary

**Migrated 4 pages and 1 component from strapi.find()/findOne() to useApiClient, removing all remaining direct SDK data-fetching calls from the website**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-15T15:08:56Z
- **Completed:** 2026-03-15T15:13:42Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Removed last `strapi.find()` and `strapi.findOne()` calls from all website pages
- Migrated `anunciar/gracias.vue` findOne pattern to `client('/api/ads/${documentId}')` with raw body handling
- Migrated `anunciar/index.vue` Promise.all pattern to use `client('/api/ad-packs')` as third element
- Removed dead `const strapi = useStrapi()` declaration from `FormProfile.vue`

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate pages/index.vue and pages/packs/index.vue** - `fdbc01b` (feat) — *already committed in plan 090-03*
2. **Task 2: Migrate pages/anunciar/gracias.vue and pages/anunciar/index.vue** - `03a9495` (feat)
3. **Task 3: Remove dead strapi import from FormProfile.vue** - `5bc3068` (fix)

## Files Created/Modified

- `apps/website/app/pages/index.vue` — packs loaded via `client('/api/ad-packs', { method: 'GET' })` (committed in 090-03)
- `apps/website/app/pages/packs/index.vue` — packs loaded via `client('/api/ad-packs', { method: 'GET' })` (committed in 090-03)
- `apps/website/app/pages/anunciar/gracias.vue` — ad confirmation loaded via `client('/api/ads/${documentId}', { method: 'GET' })`
- `apps/website/app/pages/anunciar/index.vue` — packs in Promise.all loaded via `client('/api/ad-packs', { method: 'GET' })`
- `apps/website/app/components/FormProfile.vue` — dead `const strapi = useStrapi()` removed

## Decisions Made

- `pages/index.vue` and `pages/packs/index.vue` changes were already present in commit `fdbc01b` from plan 090-03. The task was considered complete as the working tree matched the expected output.
- For `anunciar/gracias.vue`, the `findOne` response is raw body — replaced `const { data: ad } = await strapi.findOne(...)` with `const response = await client(...)` followed by `const ad = response.data`.
- For `anunciar/index.vue` Promise.all pattern, the cast `as { data: Pack[] }` was applied to the `[2]` index result, not to the client call itself, matching the plan's interface contract.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Discovery] Tasks 1 files were already committed in plan 090-03**
- **Found during:** Task 1
- **Issue:** `pages/index.vue` and `pages/packs/index.vue` already had `useApiClient` migration applied in commit `fdbc01b` (feat(090-03): migrate indicator.store.ts). The plan mentioned both pages but they were migrated as part of the prior plan's scope.
- **Fix:** Recognized the working tree was already clean for these files; no duplicate edits applied.
- **Files modified:** None (already done)
- **Verification:** `grep -n "strapi" pages/index.vue packs/index.vue` → PASS

---

**Total deviations:** 1 auto-detected (1 pre-applied change from prior plan)
**Impact on plan:** No scope creep. The net result matches all success criteria exactly.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All website pages and components now free of direct `strapi.find()`/`strapi.findOne()` calls
- Phase 090 is complete: all GET callers migrated to useApiClient across stores, composables, and pages
- Ready for phase transition or milestone completion

---
*Phase: 090-migrate-all-get-callers*
*Completed: 2026-03-15*
