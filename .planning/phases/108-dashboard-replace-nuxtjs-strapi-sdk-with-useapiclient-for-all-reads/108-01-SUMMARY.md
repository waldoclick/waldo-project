---
phase: 108-dashboard-replace-nuxtjs-strapi-sdk-with-useapiclient-for-all-reads
plan: "01"
subsystem: dashboard
tags: [migration, api-client, strapi-sdk, components, stores]
dependency_graph:
  requires: []
  provides: [useApiClient-for-all-reads]
  affects: [me.store.ts, AdsTable, ArticlesDefault, CategoriesDefault, CommunesDefault, ConditionsDefault, FaqsDefault, OrdersDefault, PacksDefault, RegionsDefault, ChartSales, DropdownPendings, DropdownSales, StatisticsDefault, StatsDefault, FeaturedFree, FeaturedUsed, ReservationsFree, ReservationsUsed, UserAnnouncements, UserFeatured, UserReservations, UsersDefault, FormCategory, FormCommune, FormCondition, FormFaq, FormGift, FormPack, FormRegion]
tech_stack:
  added: []
  patterns: [useApiClient GET pattern with params cast, setup-scope composable instantiation]
key_files:
  created: []
  modified:
    - apps/dashboard/app/stores/me.store.ts
    - apps/dashboard/app/components/FormCategory.vue
    - apps/dashboard/app/components/FormCommune.vue
    - apps/dashboard/app/components/FormCondition.vue
    - apps/dashboard/app/components/FormFaq.vue
    - apps/dashboard/app/components/FormGift.vue
    - apps/dashboard/app/components/FormPack.vue
    - apps/dashboard/app/components/FormRegion.vue
    - apps/dashboard/app/components/AdsTable.vue
    - apps/dashboard/app/components/ArticlesDefault.vue
    - apps/dashboard/app/components/CategoriesDefault.vue
    - apps/dashboard/app/components/CommunesDefault.vue
    - apps/dashboard/app/components/ConditionsDefault.vue
    - apps/dashboard/app/components/FaqsDefault.vue
    - apps/dashboard/app/components/OrdersDefault.vue
    - apps/dashboard/app/components/PacksDefault.vue
    - apps/dashboard/app/components/RegionsDefault.vue
    - apps/dashboard/app/components/ChartSales.vue
    - apps/dashboard/app/components/DropdownPendings.vue
    - apps/dashboard/app/components/DropdownSales.vue
    - apps/dashboard/app/components/StatisticsDefault.vue
    - apps/dashboard/app/components/StatsDefault.vue
    - apps/dashboard/app/components/FeaturedFree.vue
    - apps/dashboard/app/components/FeaturedUsed.vue
    - apps/dashboard/app/components/ReservationsFree.vue
    - apps/dashboard/app/components/ReservationsUsed.vue
    - apps/dashboard/app/components/UserAnnouncements.vue
    - apps/dashboard/app/components/UserFeatured.vue
    - apps/dashboard/app/components/UserReservations.vue
    - apps/dashboard/app/components/UsersDefault.vue
decisions:
  - useApiClient replaces useStrapi for all GET reads in dashboard stores and components — eliminates dual-resource pattern
  - useApiClient() always instantiated at component/store setup scope, never inside callbacks or fetch functions
  - params cast pattern: `params: { ...queryParams } as unknown as Record<string, unknown>` used uniformly
  - FormGift: useApiClient() moved from inside handleSubmit to setup scope — was already a pattern violation pre-migration
metrics:
  duration_seconds: 524
  completed_date: "2026-03-29"
  tasks_completed: 4
  files_modified: 30
---

# Phase 108 Plan 01: Migrate Dashboard Stores and Components to useApiClient for All Reads Summary

**One-liner:** Replace all `strapi.find()`/`strapi.findOne()` read calls in 1 store and 29 components with `apiClient(url, { method: "GET", params })` via `useApiClient()`, eliminating the dual-resource pattern entirely.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Migrate me.store.ts and form components (8 files) | a8619705 | me.store.ts, FormCategory, FormCommune, FormCondition, FormFaq, FormGift, FormPack, FormRegion |
| 2 | Migrate list/table components (9 files) | f7ee0e3e | AdsTable, ArticlesDefault, CategoriesDefault, CommunesDefault, ConditionsDefault, FaqsDefault, OrdersDefault, PacksDefault, RegionsDefault |
| 3 | Migrate stats, dropdown, and featured components (6 files) | ac2ab3ff | ChartSales, DropdownPendings, DropdownSales, StatisticsDefault, StatsDefault, FeaturedFree |
| 4 | Migrate user and reservation components (7 files) | 60dcf117 | FeaturedUsed, ReservationsFree, ReservationsUsed, UserAnnouncements, UserFeatured, UserReservations, UsersDefault |

## Verification

- `grep -r "strapi\.find\|strapi\.findOne" apps/dashboard/app/stores/ apps/dashboard/app/components/` returns zero matches
- `grep -r "useStrapi()" apps/dashboard/app/stores/ apps/dashboard/app/components/` returns zero matches
- `yarn workspace waldo-dashboard vitest run` — 55 tests pass (5 files)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] FormGift had useApiClient() called inside handleSubmit callback**
- **Found during:** Task 1
- **Issue:** `const strapiClient = useApiClient()` was called inside `handleSubmit` function, violating the rule that composables must be called at setup scope
- **Fix:** Moved to setup scope as `const apiClient = useApiClient()` and renamed `strapiClient` references to `apiClient`
- **Files modified:** apps/dashboard/app/components/FormGift.vue
- **Commit:** a8619705

**2. [Rule 1 - Bug] Several components declared `const strapi = useStrapi()` inside fetch functions (not setup scope)**
- **Found during:** Tasks 2, 3, 4
- **Issue:** AdsTable, CategoriesDefault, CommunesDefault, ConditionsDefault, FaqsDefault, PacksDefault, RegionsDefault, ChartSales, StatisticsDefault, StatsDefault, FeaturedFree, FeaturedUsed, ReservationsFree, ReservationsUsed, UserAnnouncements, UserFeatured, UserReservations, UsersDefault all declared `useStrapi()` inside async fetch functions rather than at setup scope
- **Fix:** Added `const apiClient = useApiClient()` at setup scope (top level of `<script setup>`) in each component
- **Files modified:** All components listed above
- **Commits:** f7ee0e3e, ac2ab3ff, 60dcf117

## Known Stubs

None — all data wiring is functional via apiClient GET calls.

## Self-Check: PASSED
