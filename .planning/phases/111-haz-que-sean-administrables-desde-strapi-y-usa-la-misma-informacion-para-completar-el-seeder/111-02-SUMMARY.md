---
phase: 111-haz-que-sean-administrables-desde-strapi-y-usa-la-misma-informacion-para-completar-el-seeder
plan: 02
subsystem: ui
tags: [nuxt, pinia, strapi, vue, vitest, typescript]

# Dependency graph
requires:
  - phase: 111-01
    provides: Strapi Policy content type with title, text (richtext), order fields and /api/policies endpoint

provides:
  - Policy and PolicyResponse TypeScript interfaces in app/types/policy.d.ts
  - usePoliciesStore Pinia store with 1-hour cache guard and localStorage persistence
  - PoliciesDefault.vue refactored to accept typed policies prop (no hardcoded data)
  - politicas-de-privacidad.vue loading policies from Strapi via useAsyncData + usePoliciesStore

affects: [seeder, content-migration, 111-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - usePoliciesStore mirrors useFaqsStore pattern (useApiClient + cache guard + persistedState.localStorage)
    - Page uses useAsyncData with default:()=>[] to eliminate T|undefined per CLAUDE.md rule
    - TDD Wave 0 stubs written before production code, turned GREEN after implementation

key-files:
  created:
    - apps/website/app/types/policy.d.ts
    - apps/website/app/stores/policies.store.ts
    - apps/website/tests/stores/policies.store.test.ts
    - apps/website/tests/components/PoliciesDefault.test.ts
  modified:
    - apps/website/app/components/PoliciesDefault.vue
    - apps/website/app/pages/politicas-de-privacidad.vue

key-decisions:
  - "policy.d.ts uses order: number | null instead of featured: boolean — policies have explicit ordering, not featured flag"
  - "PAGE_SIZE=50 in usePoliciesStore to accommodate growth beyond the 16 original hardcoded policies"
  - "default: () => [] added to useAsyncData in politicas-de-privacidad.vue per CLAUDE.md rule (FAQ page omits this but the standard requires it)"

patterns-established:
  - "usePoliciesStore: mirrors faqs.store.ts pattern exactly — useApiClient at setup scope, CACHE_DURATION=3600000, lastFetchTimestamp ref, persistedState.localStorage"

requirements-completed: [POL-04, POL-05, POL-06]

# Metrics
duration: 12min
completed: 2026-04-04
---

# Phase 111 Plan 02: Wire Policies Frontend to Strapi Summary

**Pinia store with 1-hour cache fetching from /api/policies, replacing 280-line hardcoded array in PoliciesDefault.vue with typed prop binding and SSR-ready useAsyncData in the page**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-04T18:15:09Z
- **Completed:** 2026-04-04T18:27:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Created Policy/PolicyResponse TypeScript interfaces matching Strapi schema (title, text, order)
- Built usePoliciesStore with 1-hour cache guard, order:asc server-side sort, and localStorage persistence
- Removed 280-line hardcoded faqs array from PoliciesDefault.vue; replaced with typed policies prop
- Page now fetches from Strapi via useAsyncData with server:true for full SSR support
- 5 unit tests (3 store + 2 component) all GREEN after implementation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Wave 0 test stubs for store and component** - `46792287` (test)
2. **Task 2: Create Policy type and Pinia store** - `76e8734d` (feat)
3. **Task 3: Refactor page and component to use store data** - `531199f2` (feat)

## Files Created/Modified

- `apps/website/app/types/policy.d.ts` - Policy and PolicyResponse interfaces (order replaces featured)
- `apps/website/app/stores/policies.store.ts` - Pinia store: useApiClient, cache guard, order:asc sort, localStorage persist
- `apps/website/tests/stores/policies.store.test.ts` - POL-04 (API call), POL-05 (cache guard) unit tests
- `apps/website/tests/components/PoliciesDefault.test.ts` - POL-06 prop binding and empty state tests
- `apps/website/app/components/PoliciesDefault.vue` - Replaced hardcoded array with `defineProps<{ policies: Policy[] }>()`
- `apps/website/app/pages/politicas-de-privacidad.vue` - Added usePoliciesStore + useAsyncData with SSR

## Decisions Made

- `policy.d.ts` uses `order: number | null` (not `featured: boolean`) — policies have explicit ordering, not a featured/unfeatured concept
- `PAGE_SIZE = 50` in store to accommodate growth beyond the 16 original policies
- Added `default: () => []` to `useAsyncData` per CLAUDE.md rule — eliminates `T | undefined` from return type; the FAQ page omits this but the documented standard requires it

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. The 13 pre-existing test failures (FormLogin, ResumeOrder, recaptcha-proxy, useOrderById) are unrelated to this plan and were present before execution.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Frontend is fully wired to Strapi for policies
- /api/policies endpoint must be seeded with the 16 existing policy items to restore visual parity
- The seeder task (plan 03) can use the hardcoded array from git history as its source data

---
*Phase: 111-haz-que-sean-administrables-desde-strapi-y-usa-la-misma-informacion-para-completar-el-seeder*
*Completed: 2026-04-04*

## Self-Check: PASSED

All created files exist on disk. All 3 task commits verified in git log.
