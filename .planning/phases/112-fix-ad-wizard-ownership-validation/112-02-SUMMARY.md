---
phase: 112-fix-ad-wizard-ownership-validation
plan: "02"
subsystem: ui
tags: [pinia, localStorage, security, wizard, ownership]

# Dependency graph
requires:
  - phase: 112-fix-ad-wizard-ownership-validation
    provides: Plan 01 added backend ownership guards (saveDraft, update, delete) in Strapi
provides:
  - userId field in AdState interface and ad store state (persisted to localStorage)
  - Ownership guard on wizard entry page that resets store when draft belongs to a different user
affects: [ad-wizard, me-store, localStorage-security]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Ownership guard after useAsyncData — place identity checks after the async data fetch that populates the current user, not before it"
    - "Direct Pinia state mutation for cross-cutting fields — userId written directly as adStore.userId without a dedicated action"

key-files:
  created: []
  modified:
    - apps/website/app/types/ad.d.ts
    - apps/website/app/stores/ad.store.ts
    - apps/website/app/pages/anunciar/index.vue

key-decisions:
  - "Ownership guard placed AFTER useAsyncData (not before) because meStore.loadMe() runs inside useAsyncData — placing the guard before would mean meStore.me is null, causing $reset() to fire for every user on every page load"
  - "userId stored at top-level of AdState (alongside step, pack) not inside the ad object — it is a store-level identity field, not an ad form field"
  - "No dedicated getter or action for userId — Pinia allows direct state mutation from outside the store; adStore.userId read and written directly"

patterns-established:
  - "Post-useAsyncData guard pattern: identity/ownership checks that depend on loaded user data must appear after the await useAsyncData() call"

requirements-completed: [SEC-112-01]

# Metrics
duration: 10min
completed: 2026-04-05
---

# Phase 112 Plan 02: Fix Ad Wizard Ownership Validation Summary

**userId field persisted to localStorage via Pinia and ownership guard in wizard entry page resets store when a different user's draft is detected**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-05T19:15:00Z
- **Completed:** 2026-04-05T19:25:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `userId: number | null` to `AdState` interface and `ad.store.ts` initialState (automatically persisted by existing localStorage persist config)
- Added `this.userId = null` to the store's `reset()` method so ownership clears on full reset
- Added post-useAsyncData ownership guard in `anunciar/index.vue` that calls `adStore.$reset()` when `adStore.userId !== meStore.me?.id` and a draft exists (`adStore.ad.ad_id` is non-null)
- Sets `adStore.userId` to current user on every wizard entry, covering both new and returning draft sessions

## Task Commits

Each task was committed atomically:

1. **Task 1: Add userId field to AdState type and ad store state/reset** - `b28a67ac` (feat)
2. **Task 2: Add ownership guard AFTER useAsyncData and set userId on draft save** - `758442f2` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `apps/website/app/types/ad.d.ts` - Added `userId: number | null` to `AdState` interface
- `apps/website/app/stores/ad.store.ts` - Added `userId` to initialState and `this.userId = null` to reset()
- `apps/website/app/pages/anunciar/index.vue` - Added ownership guard and userId assignment after useAsyncData

## Decisions Made
- Ownership guard placed AFTER `useAsyncData` because `meStore.loadMe()` runs inside that block — before it, `meStore.me` is null and the guard would incorrectly reset every user's legitimate draft
- `userId` stored at store top-level alongside `step`, `pack`, `featured` — it is a store identity field, not part of the ad form data
- No dedicated action or getter for `userId` — direct Pinia state access is idiomatic for this cross-cutting field

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Frontend ownership guard is complete — both backend (Plan 01: saveDraft/update/delete) and frontend (Plan 02: wizard entry) guards are now in place
- No blockers

---
*Phase: 112-fix-ad-wizard-ownership-validation*
*Completed: 2026-04-05*
