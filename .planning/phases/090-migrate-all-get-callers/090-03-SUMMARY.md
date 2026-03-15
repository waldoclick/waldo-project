---
phase: 090-migrate-all-get-callers
plan: "03"
subsystem: api
tags: [useApiClient, pinia, strapi, stores, migration]

# Dependency graph
requires:
  - phase: 088-migrate-all-post-callers
    provides: client = useApiClient() at root level in user.store.ts and apiClient in me.store.ts
  - phase: 089-get-support-in-useapiclient
    provides: GET method support with params passthrough in useApiClient
provides:
  - me.store.ts loadMe fetching via useApiClient('/api/users/me')
  - user.store.ts all 5 GET actions via existing root-level client
  - indicator.store.ts fetchIndicators, fetchIndicator, convertCurrency via useApiClient
affects: [090-migrate-all-get-callers, 091-any-future-store-phase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Store GET migration: client('/api/path', { method: 'GET', params: {...} as unknown as Record<string, unknown> })"
    - "findOne migration: client('/api/resource/${id}', { method: 'GET' }) — raw body returned, same shape as strapi.findOne"
    - "Response shape cast: (response as unknown as { data: T[] }).data for collection endpoints"

key-files:
  created: []
  modified:
    - apps/website/app/stores/me.store.ts
    - apps/website/app/stores/user.store.ts
    - apps/website/app/stores/indicator.store.ts

key-decisions:
  - "me.store.ts: kept existing apiClient variable name (not client) — matches phase 088 naming; no rename needed"
  - "user.store.ts: reused existing root-level client from phase 088 — no second useApiClient() instantiation"
  - "indicator.store.ts: StrapiData/StrapiResponse type imports kept — they describe response shapes, not SDK behavior"
  - "loadUsers response cast: (response as unknown as { data: User[] }).data — Strapi v5 collection endpoints return { data: [], meta: {} }"
  - "loadUser fallback: Array.isArray guard handles both array and wrapped-array response shapes"

patterns-established:
  - "Store GET migration pattern: replace strapi.find/findOne → client('/api/...', { method: 'GET', params }) with same return cast"

requirements-completed:
  - API-01
  - API-02

# Metrics
duration: 2min
completed: 2026-03-15
---

# Phase 090 Plan 03: Migrate User and Indicator Stores Summary

**Migrated 3 user/business stores (me, user, indicator) from strapi.find/findOne to useApiClient, using pre-existing root-level client instances from phase 088**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-15T15:08:47Z
- **Completed:** 2026-03-15T15:11:35Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- `me.store.ts` loadMe migrated: `strapi.find('users/me')` → `apiClient('/api/users/me', { method: 'GET', params })`; `useStrapi()` removed
- `user.store.ts` 5 GET callers migrated: loadUsers, loadUser, loadUserAds, loadUserOrders, loadUserAdCounts all use existing root-level `client`; `useStrapi()` removed
- `indicator.store.ts` 3 callers migrated: fetchIndicators (find), fetchIndicator (findOne), convertCurrency (find); `useStrapi()` replaced with `useApiClient()`

## Task Commits

Each task was committed atomically:

1. **Task 1: me.store.ts** — Already included in prior `feat(090-04)` commit (65d5135)
2. **Task 2: Migrate user.store.ts GET calls** - `f452aff` (feat)
3. **Task 3: Migrate indicator.store.ts** - `fdbc01b` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `apps/website/app/stores/me.store.ts` — Removed `useStrapi()`; `loadMe` uses `apiClient('/api/users/me')`
- `apps/website/app/stores/user.store.ts` — Removed `useStrapi()`; 5 GET calls use existing root-level `client`
- `apps/website/app/stores/indicator.store.ts` — Replaced `useStrapi()` with `useApiClient()`; 3 fetch functions migrated

## Decisions Made

- **me.store.ts naming**: Kept `apiClient` variable name (not renaming to `client`) — it was added in phase 088 and callers depend on it; renaming would be a separate refactor out of scope
- **user.store.ts root-level client**: The plan correctly noted that `client = useApiClient()` already existed from phase 088 mutation migration — we simply removed `strapi` and pointed GET calls to the existing `client`
- **loadUser fallback cast**: Used `Array.isArray` guard to handle both `User[]` and `{ data: User[] }` response shapes — matches the original `(response.data ?? response)` intent
- **StrapiData/StrapiResponse retained**: These type imports from `@nuxtjs/strapi` describe response body shapes, not SDK behavior — valid TypeScript regardless of which HTTP client is used

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 3 store files migrated; zero `useStrapi()` calls remain in me.store.ts, user.store.ts, indicator.store.ts
- Requirements API-01 and API-02 are satisfied by this plan
- Remaining GET callers (composables, other stores) are handled in plans 090-04+

## Self-Check: PASSED

- ✅ `apps/website/app/stores/me.store.ts` — exists, zero strapi.find/findOne references
- ✅ `apps/website/app/stores/user.store.ts` — exists, zero strapi.find/findOne references
- ✅ `apps/website/app/stores/indicator.store.ts` — exists, zero strapi.find/findOne references
- ✅ `.planning/phases/090-migrate-all-get-callers/090-03-SUMMARY.md` — exists
- ✅ `f452aff` — feat(090-03): migrate user.store.ts GET calls to useApiClient
- ✅ `fdbc01b` — feat(090-03): migrate indicator.store.ts to useApiClient
- ✅ `99da301` — docs(090-03): complete migrate-user-and-indicator-stores plan

---
*Phase: 090-migrate-all-get-callers*
*Completed: 2026-03-15*
