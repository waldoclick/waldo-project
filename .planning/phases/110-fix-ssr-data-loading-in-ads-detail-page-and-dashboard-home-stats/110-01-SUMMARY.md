---
phase: 110-fix-ssr-data-loading-in-ads-detail-page-and-dashboard-home-stats
plan: "01"
subsystem: ui
tags: [nuxt, ssr, vue, pinia, composables, watch, onMounted]

# Dependency graph
requires:
  - phase: 109-eliminate-nuxtjs-strapi-from-dashboard
    provides: useApiClient composable used in dashboard stats components
provides:
  - Dashboard home stats (StatisticsDefault.vue, StatsDefault.vue) load during SSR via watch(immediate:true)
  - Website ads detail page (anuncios/[slug].vue) instantiates useAdsStore at setup scope before useAsyncData
affects:
  - dashboard-home
  - website-ads-detail

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "watch(() => true, fn, { immediate: true }) — SSR-compatible data loading in dashboard components (replaces onMounted)"
    - "Store composables instantiated at setup scope, captured by useAsyncData callback — prevents Nuxt context errors"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/StatisticsDefault.vue
    - apps/dashboard/app/components/StatsDefault.vue
    - apps/website/app/pages/anuncios/[slug].vue

key-decisions:
  - "watch(() => true, fn, { immediate: true }) is the correct pattern for SSR data loading in dashboard components — replaces onMounted which is client-only"
  - "useAdsStore() must be instantiated at setup scope before useAsyncData, not inside the callback — composable context is only available at setup time"

patterns-established:
  - "Dashboard components that load data: use watch(immediate:true) — never onMounted"
  - "Store composables in useAsyncData pages: always at setup scope, captured by closure"

requirements-completed: [SSR-110-01, SSR-110-02]

# Metrics
duration: 6min
completed: 2026-03-30
---

# Phase 110 Plan 01: Fix SSR Data Loading Summary

**SSR hydration flash eliminated — dashboard stats now load server-side via watch(immediate:true); useAdsStore moved to setup scope in [slug].vue to prevent Nuxt context errors**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-30T02:05:00Z
- **Completed:** 2026-03-30T02:11:27Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- StatisticsDefault.vue and StatsDefault.vue now use `watch(() => true, fn, { immediate: true })` instead of `onMounted` — data loads during SSR, eliminating the flash of zero values on dashboard home
- useAdsStore() instantiation moved from inside the useAsyncData callback to setup scope in anuncios/[slug].vue — prevents potential "Nuxt instance unavailable" errors
- All 59 dashboard tests pass; pre-existing website test failures (12) confirmed unrelated to this change

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace onMounted with watch(immediate:true) in StatisticsDefault.vue and StatsDefault.vue** - `05a948c7` (fix)
2. **Task 2: Move useAdsStore instantiation to setup scope in [slug].vue** - `3f1a1306` (fix)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `apps/dashboard/app/components/StatisticsDefault.vue` - Replaced `onMounted` with `watch(() => true, fn, { immediate: true })` for SSR-compatible data loading
- `apps/dashboard/app/components/StatsDefault.vue` - Replaced `onMounted` with `watch(() => true, fn, { immediate: true })` for SSR-compatible data loading
- `apps/website/app/pages/anuncios/[slug].vue` - Moved `useAdsStore()` to setup scope before `useAsyncData`

## Decisions Made

- `watch(() => true, fn, { immediate: true })` is the established pattern for SSR data loading in dashboard components — `onMounted` is client-only and causes hydration flash
- Store composables used inside `useAsyncData` must be captured at setup scope — Nuxt composable context is unavailable inside async callbacks

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing website test failures (6 files, 12 tests): `useOrderById`, `FormLogin`, `ResumeOrder`, `recaptcha-proxy`, `AccountAnnouncements`, `FormLogin.spec.ts`. Verified via git stash that these failures existed before this plan's changes. Out of scope per deviation rules.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SSR data loading violations resolved across both dashboard and website
- Dashboard home stats will render with data on first server render, no hydration flash
- Ads detail page safe from Nuxt context errors during SSR

---
*Phase: 110-fix-ssr-data-loading-in-ads-detail-page-and-dashboard-home-stats*
*Completed: 2026-03-30*

## Self-Check: PASSED

- FOUND: apps/dashboard/app/components/StatisticsDefault.vue
- FOUND: apps/dashboard/app/components/StatsDefault.vue
- FOUND: apps/website/app/pages/anuncios/[slug].vue
- FOUND: .planning/phases/110-.../110-01-SUMMARY.md
- FOUND: commit 05a948c7
- FOUND: commit 3f1a1306
