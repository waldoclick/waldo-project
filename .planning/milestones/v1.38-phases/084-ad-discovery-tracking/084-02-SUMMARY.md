---
phase: 084-ad-discovery-tracking
plan: "02"
subsystem: ui
tags: [ga4, analytics, gtm, nuxt, vue3, composables, ecommerce-events]

# Dependency graph
requires:
  - phase: 084-ad-discovery-tracking
    plan: "01"
    provides: "useAdAnalytics composable with viewItemListPublic, viewItem, search functions"
provides:
  - "view_item_list event fires on /anuncios when ads load (DISC-01)"
  - "view_item event fires on /anuncios/[slug] when ad detail loads (DISC-02)"
  - "search event fires on /anuncios when keyword or commune filter changes (DISC-03)"
affects:
  - 085-contact-auth-blog-events

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "watch(dataRef, callback, { immediate: true }) for SSR-safe analytics firing"
    - "viewItemFired ref guard + slug watcher reset for Nuxt component reuse across dynamic routes"
    - "lastSearchTerm dedup guard prevents double-fire on search watcher"
    - "resolveSearchTerm() resolves commune ID to human-readable name from filterStore"

key-files:
  created: []
  modified:
    - apps/website/app/pages/anuncios/index.vue
    - apps/website/app/pages/anuncios/[slug].vue

key-decisions:
  - "watch({ immediate: true }) on adsData in index.vue — ensures event fires even when data is already loaded on SSR hydration"
  - "No { immediate: true } on search watcher — search events should only fire on explicit user action, not page load"
  - "viewItemFired boolean guard in [slug].vue prevents double-fire when adData watcher triggers multiple times for same slug"
  - "Slug change watcher resets viewItemFired to false — enables re-fire when user navigates to a different ad detail page"
  - "resolveSearchTerm uses filterStore.filterCommunes to map commune ID → name for human-readable GA4 search_term"

patterns-established:
  - "Analytics wiring added at END of <script setup> block, after all existing watchers"
  - "Guard pattern: boolean ref + reset watcher for events that must fire once per navigation"
  - "Dedup pattern: lastSearchTerm ref comparison prevents redundant search events"

requirements-completed: [DISC-01, DISC-02, DISC-03]

# Metrics
duration: 5min
completed: 2026-03-14
---

# Phase 084 Plan 02: Ad Discovery Tracking — Page Wiring Summary

**GA4 view_item_list, view_item, and search events wired into anuncios pages via useAdAnalytics composable with guard patterns preventing double-fire and component reuse across dynamic routes**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-14T15:46:52Z
- **Completed:** 2026-03-14T15:47:45Z
- **Tasks:** 2 auto + 1 checkpoint (approved)
- **Files modified:** 2

## Accomplishments

- Wired `view_item_list` + `search` events into `anuncios/index.vue` (DISC-01 and DISC-03)
- Wired `view_item` event into `anuncios/[slug].vue` with slug-reset guard (DISC-02)
- All 7 GA4 Realtime checks passed — events confirmed working in production on waldo.click

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire view_item_list and search in anuncios/index.vue** — `a904bef` (feat)
2. **Task 2: Wire view_item in anuncios/[slug].vue with slug reset guard** — `f32ff25` (feat)
3. **Task 3: Human verification checkpoint** — approved (no commit)

## Files Created/Modified

- `apps/website/app/pages/anuncios/index.vue` — Added useAdAnalytics import, DISC-01 view_item_list watcher (immediate, guarded by `ads.length > 0`), DISC-03 search watcher with lastSearchTerm dedup and resolveSearchTerm commune resolver (+42 lines)
- `apps/website/app/pages/anuncios/[slug].vue` — Added useAdAnalytics import, DISC-02 view_item watcher with viewItemFired guard, slug-change reset watcher (+25 lines)

## Decisions Made

- `{ immediate: true }` on `adsData` watcher in index.vue — ensures `view_item_list` fires even when data was already resolved during SSR hydration
- No `{ immediate: true }` on search watcher — search events are user-action triggered only, not page-load triggered
- `viewItemFired` boolean ref guard in `[slug].vue` prevents double-fire when the `adData` watcher triggers multiple times for the same slug
- Slug-change watcher resets `viewItemFired` to `false` — Nuxt reuses the component across `[slug]` navigations, so the guard must be explicitly reset
- `resolveSearchTerm()` maps commune ID → name via `filterStore.filterCommunes` for human-readable `search_term` in GA4

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- DISC-01, DISC-02, DISC-03 all complete and verified in GA4 Realtime
- Phase 084 (Ad Discovery Tracking) is complete — all 2 plans done
- Ready for Phase 085: Contact, Auth & Blog Events (CONT-01, CONT-02, AUTH-01, AUTH-02, BLOG-01)

---
*Phase: 084-ad-discovery-tracking*
*Completed: 2026-03-14*
