---
phase: 084-ad-discovery-tracking
plan: "01"
subsystem: analytics
tags: [ga4, analytics, vitest, tdd, composables, dataLayer]

# Dependency graph
requires:
  - phase: 083-ecommerce-bug-fixes
    provides: pushEvent() pattern with flow param and SSR guard
provides:
  - viewItemListPublic() — GA4 view_item_list event for ad listing page with ad_discovery flow
  - viewItem() — GA4 view_item event for ad detail page with ad_discovery flow
  - search() — GA4 search event with search_term and ad_discovery flow
affects:
  - 084-02 (page wiring — will import these three functions)
  - 085-contact-auth-blog-events (same useAdAnalytics composable)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Inline shape types for ad params (avoids importing Ad type into composable)"
    - "typeof guard for category narrowing (object → name, numeric → 'Unknown')"
    - "TDD RED-GREEN cycle: failing tests committed before implementation"

key-files:
  created:
    - apps/website/app/composables/useAdAnalytics.test.ts (new describe blocks appended)
  modified:
    - apps/website/app/composables/useAdAnalytics.ts
    - apps/website/app/composables/useAdAnalytics.test.ts

key-decisions:
  - "Used inline shape type for ad param (not importing Ad type) to keep composable self-contained"
  - "category narrowing: typeof === 'object' && !== null → name, else 'Unknown' (handles numeric IDs from Strapi)"
  - "search() passes empty items array — no ecommerce block emitted (GA4 search events don't use ecommerce)"

patterns-established:
  - "All discovery-flow events use flow='ad_discovery' (not default 'ad_creation')"
  - "Empty guard pattern: viewItemListPublic([]) → return early, no event pushed"

requirements-completed: [DISC-01, DISC-02, DISC-03]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 84 Plan 01: Ad Discovery Tracking — Analytics Composable Summary

**Three GA4 discovery event functions (viewItemListPublic, viewItem, search) added to useAdAnalytics.ts via TDD, with 6 new unit tests (23 total passing)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-14T15:40:33Z
- **Completed:** 2026-03-14T15:42:16Z
- **Tasks:** 2 (RED + GREEN)
- **Files modified:** 2

## Accomplishments
- 6 new Vitest tests written first (RED), all failing correctly before implementation
- viewItemListPublic: maps Ad[] to AnalyticsItem[], guards empty arrays, resolves category to name or 'Unknown'
- viewItem: pushes single-item view_item event with ad_discovery flow
- search: pushes search event with search_term in extraData, no ecommerce block
- All 23 tests now pass (17 pre-existing + 6 new); pre-existing failures in unrelated files confirmed as pre-existing

## Task Commits

Each task was committed atomically:

1. **Task 1: RED — Write failing tests** - `327c545` (test)
2. **Task 2: GREEN — Implement three functions** - `a08fd8a` (feat)

**Plan metadata:** (docs commit below)

_TDD plan: 2 commits (test → feat). No REFACTOR needed — implementation was clean._

## Files Created/Modified
- `apps/website/app/composables/useAdAnalytics.test.ts` — 6 new tests in 4 describe blocks (3 for viewItemListPublic, 2 for viewItem, 1 for search); updated exports test
- `apps/website/app/composables/useAdAnalytics.ts` — Added viewItemListPublic, viewItem, search functions + exports

## Decisions Made
- Used inline shape types for ad params (not importing `Ad` type) — keeps composable self-contained, avoids type coupling
- `category` narrowing uses `typeof === "object" && !== null` guard — handles both numeric category IDs (from Strapi) and object categories
- `search()` passes `[]` as items → no `ecommerce` block added (GA4 search events are not ecommerce events)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing failures in `useOrderById.test.ts`, `FormLogin.spec.ts`, and `ResumeOrder.test.ts` (7 failures total) confirmed pre-existing via git stash — unrelated to this plan's changes. Our `useAdAnalytics.test.ts` file is 23/23 passing.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `viewItemListPublic`, `viewItem`, `search` ready for import in Plan 02 page wiring
- All three functions follow the existing `pushEvent()` pattern — no integration surprises expected
- Requirements DISC-01, DISC-02, DISC-03 complete

---
*Phase: 084-ad-discovery-tracking*
*Completed: 2026-03-14*
