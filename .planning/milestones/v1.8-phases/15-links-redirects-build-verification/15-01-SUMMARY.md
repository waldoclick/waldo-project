---
phase: 15-links-redirects-build-verification
plan: 01
subsystem: ui
tags: [nuxt, vue, routing, navigation, links]

# Dependency graph
requires:
  - phase: 14-account-featured-reservations-migration
    provides: "Renamed account/ and featured/ route directories, updated route refs in page components"
  - phase: 13-catalog-segments-migration
    provides: "Renamed communes/, conditions/, categories/, regions/ route directories"
provides:
  - "MenuDefault.vue with all English sidebar navigation routes"
  - "DropdownUser.vue with English account links"
  - "DropdownSales.vue with English order links"
  - "DropdownPendings.vue with English pending-ads links"
  - "StatisticsDefault.vue with English card link routes"
affects: [phase-15-build-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route migration pattern: replace Spanish path strings in NuxtLink `to` props, isRouteActive() calls, and JS key strings"
    - "Spanish UI labels (span text) are preserved; only route path strings and internal JS key strings are updated"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/MenuDefault.vue
    - apps/dashboard/app/components/DropdownUser.vue
    - apps/dashboard/app/components/DropdownSales.vue
    - apps/dashboard/app/components/DropdownPendings.vue
    - apps/dashboard/app/components/StatisticsDefault.vue

key-decisions:
  - "Task 2 components (DropdownUser, DropdownSales, DropdownPendings, StatisticsDefault) were already updated in prior session commit 8a95dfd — only Task 1 (MenuDefault.vue) required new changes"
  - "openMenu keys updated alongside route paths: 'anuncios'→'ads', 'reservas'→'reservations', 'destacados'→'featured' for consistency"
  - "API data field names in StatisticsDefault (reservasUsadas, destacadosLibres, ordenes, etc.) preserved unchanged — they match Strapi API response"

patterns-established:
  - "Route path update pattern: update NuxtLink to, isRouteActive() args, startsWith() checks, and openMenu key strings together in a single pass"

requirements-completed: [LINK-01, LINK-02]

# Metrics
duration: 15min
completed: 2026-03-06
---

# Phase 15 Plan 01: Navigation Components English Route Migration Summary

**All 5 navigation components now use English route paths — MenuDefault sidebar (20+ refs), DropdownUser account links, DropdownSales/Pendings header dropdowns, and StatisticsDefault card links.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-06T03:14:22Z
- **Completed:** 2026-03-06T03:29:22Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- MenuDefault.vue: all 20+ NuxtLink `to` props, isRouteActive() calls, openMenu key strings, and watch block updated to English paths
- DropdownUser.vue: 3 account links updated to /account/profile, /account/profile/edit, /account/change-password
- DropdownSales.vue: /ordenes → /orders and /ordenes/${id} → /orders/${id}
- DropdownPendings.vue: /anuncios/pendientes → /ads/pending and /anuncios/${id} → /ads/${id}
- StatisticsDefault.vue: 14 card link `to` values updated to English paths; API field names preserved

## Task Commits

Each task was committed atomically:

1. **Task 1: Update MenuDefault.vue** - `17f2584` (feat)
2. **Task 2: Update DropdownUser, DropdownSales, DropdownPendings, StatisticsDefault** - `8a95dfd` (feat — completed in prior session)

## Files Created/Modified
- `apps/dashboard/app/components/MenuDefault.vue` - Sidebar navigation: all routes, openMenu keys, watch block updated to English
- `apps/dashboard/app/components/DropdownUser.vue` - Account dropdown: /cuenta/* → /account/*
- `apps/dashboard/app/components/DropdownSales.vue` - Orders dropdown: /ordenes → /orders
- `apps/dashboard/app/components/DropdownPendings.vue` - Pending ads dropdown: /anuncios/* → /ads/*
- `apps/dashboard/app/components/StatisticsDefault.vue` - Statistics cards: all 14 route links updated to English

## Decisions Made
- Task 2 components were already updated in prior session (commit `8a95dfd`) as part of feat(15-02) work — changes verified to be correct and complete, no re-work needed
- API data field names in StatisticsDefault (`reservasUsadas`, `destacadosLibres`, `ordenes`, `categorias`, etc.) are Strapi API response keys — intentionally not renamed as they don't affect routing

## Deviations from Plan

None - plan executed exactly as written. Task 2 components were already at target state from prior session work (commit `8a95dfd`), which counted as completion of that task.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 navigation components now use English routes — ready for build verification
- Phase 15 ready for final verification step (build check, redirect verification)

---
*Phase: 15-links-redirects-build-verification*
*Completed: 2026-03-06*

## Self-Check: PASSED
- MenuDefault.vue: FOUND ✓
- DropdownUser.vue: FOUND ✓
- StatisticsDefault.vue: FOUND ✓
- 15-01-SUMMARY.md: FOUND ✓
- Commit 17f2584 (Task 1): FOUND ✓
- Commit 8a95dfd (Task 2): FOUND ✓
