---
phase: 42-ad-creation-url-refactor
plan: 03
subsystem: ui
tags: [nuxt, vue, routing, analytics, pinia]

# Dependency graph
requires:
  - phase: 42-ad-creation-url-refactor
    provides: "Four dedicated step pages (42-01) with route-based navigation targets"
provides:
  - "CreateAd.vue routes to named paths (/anunciar/datos-del-producto, etc.) instead of ?step=N"
  - "index.vue simplified — step watcher removed, step 1 analytics fire once on mount only"
  - "No ?step= query param references anywhere in wizard flow"
affects:
  - 42-ad-creation-url-refactor (plan 04 — resumen.vue back button fix)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "stepRoutes: Record<number, string> map for step-to-path routing in CreateAd.vue"
    - "Route-based navigation via router.push(path) instead of router.push({ query: { step: N } })"
    - "Per-page analytics: each step page fires its own stepView on mount; no centralized watcher"

key-files:
  created: []
  modified:
    - apps/website/app/components/CreateAd.vue
    - apps/website/app/pages/anunciar/index.vue

key-decisions:
  - "Kept CreateAd.vue step 2–5 v-if divs as dead code — removing them is a separate cleanup concern"
  - "Added lang='ts' to CreateAd.vue <script setup> for TypeScript strictness"
  - "handleFormBack goes back to step N-1 (minimum step 1); never navigates below /anunciar"

patterns-established:
  - "stepRoutes map pattern: explicit Record<number, string> for step-to-URL mapping — avoids magic strings"

requirements-completed:
  - ROUTE-01
  - ROUTE-03
  - STATE-01
  - QUAL-01
  - QUAL-02

# Metrics
duration: 3min
completed: 2026-03-08
---

# Phase 42 Plan 03: Ad Creation URL Refactor — CreateAd.vue + index.vue Wiring Summary

**CreateAd.vue converted from `?step=N` query params to named route pushes via stepRoutes map; index.vue step watcher removed so each dedicated page fires its own analytics**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-08T00:37:32Z
- **Completed:** 2026-03-08T00:41:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Removed `useRoute`, `route.query.step` sync, and all `?step=` query param navigation from `CreateAd.vue`
- Replaced with `stepRoutes` Record map + `router.push(path)` for both forward and back navigation
- Removed multi-step analytics watcher from `index.vue` — prevents double-firing since each step page now fires its own `stepView` on mount
- `nuxt typecheck` passes with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Simplify CreateAd.vue — replace query param navigation with route pushes** - `69e1d63` (feat)
2. **Task 2: Simplify index.vue — remove step watcher** - `ea9c14c` (feat)

**Plan metadata:** _(docs commit below)_

## Files Created/Modified
- `apps/website/app/components/CreateAd.vue` — Removed useRoute/query param sync; added stepRoutes map; handleFormBack/handleFormSubmitted push to named routes; added lang="ts"
- `apps/website/app/pages/anunciar/index.vue` — Removed "Observar cambios en el step" watcher; step 1 analytics still fire once in onMounted

## Decisions Made
- Kept `CreateAd.vue` step 2–5 `v-if` divs intact (they become dead code once navigation routes to dedicated pages, but removal is a separate cleanup concern)
- Added `lang="ts"` to `CreateAd.vue` `<script setup>` for consistency with TypeScript strictness requirements
- `handleFormBack` uses minimum step 1 (not `adStore.step` unchanged) — aligns with plan spec

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Navigation wiring complete: step 1 → `/anunciar/datos-del-producto` → `datos-personales` → `ficha-de-producto` → `galeria-de-imagenes` → `/anunciar/resumen`
- Next: Plan 42-04 should fix `resumen.vue` back button from `/anunciar?step=5` to `/anunciar/galeria-de-imagenes`

---
*Phase: 42-ad-creation-url-refactor*
*Completed: 2026-03-08*

## Self-Check: PASSED

- FOUND: apps/website/app/components/CreateAd.vue
- FOUND: apps/website/app/pages/anunciar/index.vue
- FOUND: .planning/phases/42-ad-creation-url-refactor/42-03-SUMMARY.md
- FOUND commit: 69e1d63 feat(42-03): replace query param navigation with route pushes in CreateAd.vue
- FOUND commit: ea9c14c feat(42-03): remove step watcher from index.vue — analytics per step page
