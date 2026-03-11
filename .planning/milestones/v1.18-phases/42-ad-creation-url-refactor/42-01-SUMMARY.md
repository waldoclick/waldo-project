---
phase: 42-ad-creation-url-refactor
plan: 01
subsystem: ui
tags: [nuxt, vue, routing, analytics, pinia]

# Dependency graph
requires: []
provides:
  - Four new dedicated step pages for the ad creation wizard (steps 2–5)
  - URL-based routing for /anunciar/datos-del-producto, /anunciar/datos-personales, /anunciar/ficha-de-producto, /anunciar/galeria-de-imagenes
  - adStore.step synced on mount for each page
  - Google Ecommerce-compatible analytics stepView events on each page
affects:
  - 42-ad-creation-url-refactor (subsequent plans: CreateAd.vue routing, index.vue simplification, resumen.vue back fix)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Each step gets its own page file with onMounted for updateStep + stepView — no watchers"
    - "ClientOnly wrapping of FormCreate* components in step pages"
    - "definePageMeta({ middleware: 'auth' }) + useSeoMeta({ robots: 'noindex, nofollow' }) on all private pages"

key-files:
  created:
    - apps/website/app/pages/anunciar/datos-del-producto.vue
    - apps/website/app/pages/anunciar/datos-personales.vue
    - apps/website/app/pages/anunciar/ficha-de-producto.vue
    - apps/website/app/pages/anunciar/galeria-de-imagenes.vue
  modified: []

key-decisions:
  - "Used onMounted (not watcher) for updateStep + stepView — each page mounts on navigation, so mount is the correct trigger; avoids overcounting"
  - "No query param logic in new pages — URL path is the navigation source of truth"
  - "galeria-de-imagenes form-submitted routes to /anunciar/resumen (final step in the wizard)"

patterns-established:
  - "Step page pattern: ClientOnly > div.step--N > FormCreateN — consistent structure across all 4 new pages"

requirements-completed:
  - ROUTE-02
  - ROUTE-04
  - STATE-01
  - STATE-02
  - ANA-01
  - ANA-02

# Metrics
duration: 1min
completed: 2026-03-08
---

# Phase 42 Plan 01: Ad Creation URL Refactor — Step Pages Summary

**Four dedicated Nuxt pages for ad wizard steps 2–5, each syncing adStore.step and firing Google Ecommerce stepView analytics on mount**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-08T00:31:31Z
- **Completed:** 2026-03-08T00:32:47Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `datos-del-producto.vue` — Step 2 page hosting FormCreateTwo with correct navigation and analytics
- Created `datos-personales.vue`, `ficha-de-producto.vue`, `galeria-de-imagenes.vue` — Steps 3–5 following the same pattern
- Full navigation chain established: `/anunciar` → `datos-del-producto` → `datos-personales` → `ficha-de-producto` → `galeria-de-imagenes` → `/anunciar/resumen`
- Back navigation chain is the correct reverse of the above
- All pages protected with `auth` middleware and `noindex, nofollow` robots meta

## Task Commits

Each task was committed atomically:

1. **Task 1: Create step 2 page — datos-del-producto.vue** - `e6586a3` (feat)
2. **Task 2: Create step pages 3, 4, and 5** - `699e672` (feat)

**Plan metadata:** _(docs commit below)_

## Files Created/Modified
- `apps/website/app/pages/anunciar/datos-del-producto.vue` — Step 2 page: FormCreateTwo, updateStep(2), stepView(2, "General")
- `apps/website/app/pages/anunciar/datos-personales.vue` — Step 3 page: FormCreateThree, updateStep(3), stepView(3, "Personal Information")
- `apps/website/app/pages/anunciar/ficha-de-producto.vue` — Step 4 page: FormCreateFour, updateStep(4), stepView(4, "Product Sheet")
- `apps/website/app/pages/anunciar/galeria-de-imagenes.vue` — Step 5 page: FormCreateFive, updateStep(5), stepView(5, "Image Gallery")

## Decisions Made
- Used `onMounted` (not a watcher) for both `adStore.updateStep(N)` and `adAnalytics.stepView(N, "...")` — consistent with `index.vue` step 1 pattern; each page mounts fresh on navigation so mount is the correct trigger and avoids overcounting
- No `?step=` query param logic in new pages — URL path is the navigation source of truth per v1.18 design
- `galeria-de-imagenes.vue` `@form-submitted` routes to `/anunciar/resumen` (the final destination after step 5)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All four step pages are live and ready for subsequent plans
- Next: Plan 42-02 should simplify `index.vue` to only host Step 1 (remove multi-step watcher logic), update `CreateAd.vue` navigation from `?step=N` to named route pushes, and fix `resumen.vue` back button to point to `/anunciar/galeria-de-imagenes`

---
*Phase: 42-ad-creation-url-refactor*
*Completed: 2026-03-08*

## Self-Check: PASSED

- FOUND: apps/website/app/pages/anunciar/datos-del-producto.vue
- FOUND: apps/website/app/pages/anunciar/datos-personales.vue
- FOUND: apps/website/app/pages/anunciar/ficha-de-producto.vue
- FOUND: apps/website/app/pages/anunciar/galeria-de-imagenes.vue
- FOUND commit: e6586a3 feat(42-01): create step 2 page — datos-del-producto.vue
- FOUND commit: 699e672 feat(42-01): create step pages 3, 4, and 5
