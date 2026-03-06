---
phase: 15-links-redirects-build-verification
plan: 02
subsystem: ui
tags: [vue, nuxt, router, navigation, url-localization]

# Dependency graph
requires:
  - phase: 15-links-redirects-build-verification
    provides: "Plan 01 (MenuDefault sidebar NuxtLink updates) established English route targets"
provides:
  - "All 17 Vue components and router plugin use English router.push/NuxtLink paths"
  - "faqs/[id]/edit.vue and packs/[id]/edit.vue page files active (renamed from editar.vue)"
affects: [15-links-redirects-build-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "router.push uses English URL segments only — no Spanish path strings in JS"
    - "git mv preserves file history when renaming page files that define Nuxt routes"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/AdsTable.vue
    - apps/dashboard/app/components/UserAnnouncements.vue
    - apps/dashboard/app/components/OrdersDefault.vue
    - apps/dashboard/app/plugins/router.client.ts
    - apps/dashboard/app/components/FormRegion.vue
    - apps/dashboard/app/components/RegionsDefault.vue
    - apps/dashboard/app/components/FormCategory.vue
    - apps/dashboard/app/components/CategoriesDefault.vue
    - apps/dashboard/app/components/FormCondition.vue
    - apps/dashboard/app/components/ConditionsDefault.vue
    - apps/dashboard/app/components/FormCommune.vue
    - apps/dashboard/app/components/CommunesDefault.vue
    - apps/dashboard/app/components/FeaturedFree.vue
    - apps/dashboard/app/components/FeaturedUsed.vue
    - apps/dashboard/app/components/UserFeatured.vue
    - apps/dashboard/app/components/ReservationsFree.vue
    - apps/dashboard/app/components/ReservationsUsed.vue
    - apps/dashboard/app/components/UserReservations.vue
    - apps/dashboard/app/components/FaqsDefault.vue
    - apps/dashboard/app/components/PacksDefault.vue
    - apps/dashboard/app/pages/faqs/[id]/edit.vue
    - apps/dashboard/app/pages/packs/[id]/edit.vue
    - apps/dashboard/app/pages/faqs/[id]/index.vue
    - apps/dashboard/app/pages/packs/[id]/index.vue

key-decisions:
  - "External public website link in AdsTable (websiteUrl + /anuncios/[slug]) intentionally preserved — it is an href to waldo.click, not a dashboard route"
  - "Used git mv for faqs and packs page renames to preserve git history while creating the /edit route segment"

patterns-established:
  - "External hrefs using websiteUrl are exempt from route localization — only dashboard router.push/NuxtLink :to are in scope"

requirements-completed: [LINK-02]

# Metrics
duration: 14min
completed: 2026-03-06
---

# Phase 15 Plan 02: Component & Plugin Router Path Localization Summary

**17 Vue components and router.client.ts plugin updated: all router.push() and NuxtLink :to paths converted from Spanish to English; faqs/packs editar.vue page files renamed to edit.vue via git mv**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-06T03:14:13Z
- **Completed:** 2026-03-06T03:28:46Z
- **Tasks:** 3
- **Files modified:** 24

## Accomplishments
- Updated 4 files in Task 1: AdsTable, UserAnnouncements (/anuncios→/ads), OrdersDefault (/ordenes→/orders), router.client.ts (/cuenta→/account prefix check)
- Updated 16 component files in Task 2: 6 form+default pairs for regions/categories/conditions/communes (/editar→/edit sub-paths included), 6 featured/reservation components (/destacados→/featured, /reservas→/reservations), FaqsDefault and PacksDefault (/editar→/edit)
- Task 3: Renamed faqs/[id]/editar.vue → edit.vue and packs/[id]/editar.vue → edit.vue via git mv; updated both index.vue NuxtLinks to use /edit

## Task Commits

Each task was committed atomically:

1. **Task 1: Update AdsTable, UserAnnouncements, OrdersDefault, router plugin** - `739772b` (feat)
2. **Task 2: Update form/default components for regions, categories, conditions, communes, featured, reservations** - `44b61a3` (feat)
3. **Task 3: Rename faqs/[id]/editar.vue and packs/[id]/editar.vue to edit.vue, update index links** - `8a95dfd` (feat)

## Files Created/Modified
- `apps/dashboard/app/components/AdsTable.vue` — router.push /anuncios→/ads (external websiteUrl href preserved)
- `apps/dashboard/app/components/UserAnnouncements.vue` — router.push /anuncios→/ads
- `apps/dashboard/app/components/OrdersDefault.vue` — NuxtLink :to /ordenes→/orders
- `apps/dashboard/app/plugins/router.client.ts` — startsWith /cuenta→/account
- `apps/dashboard/app/components/FormRegion.vue` — /regiones→/regions (3 pushes)
- `apps/dashboard/app/components/RegionsDefault.vue` — /regiones→/regions, /editar→/edit
- `apps/dashboard/app/components/FormCategory.vue` — /categorias→/categories (3 pushes)
- `apps/dashboard/app/components/CategoriesDefault.vue` — /categorias→/categories, /editar→/edit
- `apps/dashboard/app/components/FormCondition.vue` — /condiciones→/conditions (3 pushes)
- `apps/dashboard/app/components/ConditionsDefault.vue` — /condiciones→/conditions, /editar→/edit
- `apps/dashboard/app/components/FormCommune.vue` — /comunas→/communes (3 pushes)
- `apps/dashboard/app/components/CommunesDefault.vue` — /comunas→/communes, /editar→/edit
- `apps/dashboard/app/components/FeaturedFree.vue` — /destacados→/featured
- `apps/dashboard/app/components/FeaturedUsed.vue` — /destacados→/featured
- `apps/dashboard/app/components/UserFeatured.vue` — /destacados→/featured
- `apps/dashboard/app/components/ReservationsFree.vue` — /reservas→/reservations
- `apps/dashboard/app/components/ReservationsUsed.vue` — /reservas→/reservations
- `apps/dashboard/app/components/UserReservations.vue` — /reservas→/reservations
- `apps/dashboard/app/components/FaqsDefault.vue` — /faqs/[id]/editar→/faqs/[id]/edit
- `apps/dashboard/app/components/PacksDefault.vue` — /packs/[id]/editar→/packs/[id]/edit
- `apps/dashboard/app/pages/faqs/[id]/edit.vue` — renamed from editar.vue (git mv)
- `apps/dashboard/app/pages/packs/[id]/edit.vue` — renamed from editar.vue (git mv)
- `apps/dashboard/app/pages/faqs/[id]/index.vue` — NuxtLink /editar→/edit
- `apps/dashboard/app/pages/packs/[id]/index.vue` — NuxtLink /editar→/edit

## Decisions Made
- External public website link in AdsTable (`websiteUrl + /anuncios/[slug]`) intentionally preserved — it is an `href` pointing to waldo.click (the public website), not a dashboard route, and must not be changed
- Used `git mv` for faqs and packs page renames to preserve git history while establishing the `/edit` route segment via Nuxt file-based routing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- LINK-02 requirement complete: all programmatic navigation in dashboard components now uses English URL paths
- Ready for Plan 03 (build verification / remaining tasks in phase 15)

---
*Phase: 15-links-redirects-build-verification*
*Completed: 2026-03-06*
