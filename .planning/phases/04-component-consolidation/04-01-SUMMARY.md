---
phase: 04-component-consolidation
plan: 01
subsystem: ui
tags: [vue, nuxt, pinia, strapi, component-consolidation]

# Dependency graph
requires:
  - phase: 03-quick-wins
    provides: "Six isolated settings store sections (adsPendings, adsActives, adsArchived, adsBanned, adsRejected, adsAbandoned) and watch(immediate:true) pattern for data loading"
provides:
  - "AdsTable.vue generic component accepting endpoint, section, emptyMessage, showWebLink props"
  - "Single component replacing six duplicated Ads* components (~1,200 lines eliminated)"
affects: [05-type-safety, 06-performance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Generic component with dynamic prop-driven store section access via settingsStore[props.section]"
    - "Conditional action rendering via showWebLink boolean prop instead of component duplication"
    - "Dynamic BEM class binding using :class template literal for section-specific CSS isolation"

key-files:
  created:
    - apps/dashboard/app/components/AdsTable.vue
  modified: []

key-decisions:
  - "AdsTable uses computed sectionSettings = computed(() => settingsStore[props.section]) to access the dynamic section ref — Pinia stores expose refs that auto-unwrap, so dot-access on the computed value works correctly"
  - "showWebLink boolean prop controls ExternalLink rendering instead of a dedicated AdsActives component — keeps a single component for all six statuses"
  - "Dynamic BEM class bindings (:class template literals) preserve section-specific CSS isolation without duplicating stylesheets"

patterns-established:
  - "Generic list component pattern: endpoint prop + section prop drives all dynamic behavior (fetch URL, store access, CSS classes)"
  - "watch(immediate:true) sole data-loading trigger: no onMounted, consistent with Phase 03 decision"

requirements-completed: [COMP-01]

# Metrics
duration: 2min
completed: 2026-03-05
---

# Phase 4 Plan 01: Component Consolidation — AdsTable Generic Component Summary

**Generic AdsTable.vue component consolidating six near-identical Ads* components into one, driven by endpoint and section props with conditional ExternalLink rendering via showWebLink**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-05T03:37:31Z
- **Completed:** 2026-03-05T03:39:31Z
- **Tasks:** 1 completed
- **Files modified:** 1 created

## Accomplishments
- Created AdsTable.vue consolidating six duplicated Ads* components (~1,200 lines of near-identical code eliminated)
- Props: endpoint (Strapi URL), section (settings store key), emptyMessage (fallback text), showWebLink (ExternalLink gate)
- watch(immediate:true) is the sole data-loading trigger — no onMounted, consistent with Phase 03 architectural decision
- Dynamic BEM CSS classes via :class template literals preserve section-specific styling isolation
- ExternalLink action button gated on `showWebLink && ad.slug` — AdsActives usage sets showWebLink=true

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AdsTable.vue generic component** - `134297d` (feat)

**Plan metadata:** _(pending docs commit)_

## Files Created/Modified
- `apps/dashboard/app/components/AdsTable.vue` - Generic ads list component; 306 lines; replaces AdsAbandoned, AdsActives, AdsArchived, AdsBanned, AdsPendings, AdsRejected

## Decisions Made
- Used `computed(() => settingsStore[props.section])` to access the dynamic section ref — Pinia store refs auto-unwrap when accessed via the store object, making `sectionSettings.value.searchTerm` correct
- Used a `showWebLink` boolean prop rather than a slot or separate component to gate the ExternalLink button — simpler API for consumers, matches the plan spec
- Preserved dynamic BEM class binding with template literals so existing section-specific SCSS in `_ads.scss` continues to match rendered class names without changes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — pre-commit hook (ESLint + Prettier) ran successfully and reformatted template whitespace only.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- AdsTable.vue is ready for consumption by the six ads pages (abandonados, activos, archivados, baneados, pendientes, rechazados)
- Phase 4 Plan 02 will update those pages to use AdsTable and delete the six original Ads* components
- No blockers

---
*Phase: 04-component-consolidation*
*Completed: 2026-03-05*

## Self-Check: PASSED

- FOUND: apps/dashboard/app/components/AdsTable.vue
- FOUND: .planning/phases/04-component-consolidation/04-01-SUMMARY.md
- FOUND: commit 134297d
