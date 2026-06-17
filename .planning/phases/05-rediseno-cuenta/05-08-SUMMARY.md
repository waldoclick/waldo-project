---
phase: 05-rediseno-cuenta
plan: "08"
subsystem: strapi-api
tags: [stats, aggregation, tdd, ad-view, ad-contact, analytics]
dependency_graph:
  requires: [05-07]
  provides: [GET /ads/:documentId/stats, GET /ads/me/views-total]
  affects: [05-09-frontend-stats-modal]
tech_stack:
  added: []
  patterns: [event-sourcing, group-by-day, TDD-RED-GREEN]
key_files:
  created:
    - apps/strapi/tests/api/ad-view/ad-view.stats.test.ts
  modified:
    - apps/strapi/src/api/ad-view/services/ad-view.ts
    - apps/strapi/src/api/ad-view/controllers/ad-view.ts
    - apps/strapi/src/api/ad-view/routes/00-ad-view-custom.ts
decisions:
  - "total = all-time count() query; series = windowed findMany+group-by-day — consistent with Vistas totales = all-time semantics from mockup"
  - "Static route /ads/me/views-total declared before /ads/:documentId/stats wildcard to prevent router shadowing"
  - "getUserTotalViews guards empty adIds array before issuing count($in:[]) query"
  - "Bucket ordering: oldest-to-newest (index 0 = days-1 ago, last = today) built via Date.now()-i*86400000 loop"
metrics:
  duration: "~25 min"
  completed: "2026-06-17"
  tasks_completed: 1
  files_modified: 4
---

# Phase 05 Plan 08: Stats Aggregation Endpoints Summary

Stats aggregation layer over ad-view/ad-contact event tables — `getAdStats` (14-day daily series + all-time total + contacts + conversion%) and `getUserTotalViews` (panel KPI total), both querying event rows via `strapi.db.query`, never a stored counter. TDD RED→GREEN: 7 new tests + 5 existing recordView tests = 12 passing.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `592b1fd7` | test | TDD RED — 7 failing tests for getAdStats + getUserTotalViews |
| `51c3e041` | feat | GREEN — service methods, controller actions, custom routes |

## Tasks Completed

### Task 1: Stats Aggregation (TDD)

**RED:** `tests/api/ad-view/ad-view.stats.test.ts` — 7 tests covering:
- `getAdStats`: series length=days, sum(series)===total (all in window), oldest→newest ordering, conversion math, zero-division guard, ad-not-found fallback
- `getUserTotalViews`: active-ads filter verified, empty-adIds guard

**GREEN:** Three files modified:

**Service (`services/ad-view.ts`):**
- `getAdStats(adDocumentId, days=14)`: resolves ad by documentId, builds UTC-keyed bucket map oldest→newest, queries `findMany` for windowed rows + separate `count` for all-time total, counts contacts, computes conversion and avgPerDay with zero guards
- `getUserTotalViews(userId)`: queries active ads by user, returns 0 immediately if none (guards `$in:[]`), counts view rows via `count({ ad: { $in: adIds } })`

**Controller (`controllers/ad-view.ts`):** Converted from bare `createCoreController` to extended form with:
- `stats(ctx)`: ownership verification (owner or manager) via independent ad lookup, parses/clamps `?days` 1..90, delegates to `getAdStats`
- `panelViewsTotal(ctx)`: auth-required, reads `ctx.state.user.id`, delegates to `getUserTotalViews`

**Routes (`routes/00-ad-view-custom.ts`):**
- `/ads/me/views-total` at line 13 (static)
- `/ads/:documentId/stats` at line 18 (wildcard)
- Static-before-wildcard ordering is required so "me" is not captured as a documentId

## Decisions Made

1. **total vs series semantics:** `total` = all-time `count()` (not just the window), `series` = windowed `findMany` group-by-day. In tests all fixtures are within the window so `sum(series) === total`; this is a test design choice, not a production guarantee.
2. **UTC day bucketing:** `toISOString().slice(0,10)` used consistently in both the bucket builder and per-row keying, matching `recordView`'s existing dedupe logic.
3. **Ownership in controller:** Controller does its own `findOne(api::ad.ad, {documentId}, populate:["user"])` to check owner/manager. Service receives only the documentId and performs its own resolution — acceptable double-lookup matching the update/delete pattern in the ad controller.
4. **Days parameter:** Parsed from `ctx.query.days` as string, defaulted to 14, clamped 1..90, NaN-safe.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — endpoints return real aggregations from event rows.

## Self-Check: PASSED

- [x] `apps/strapi/tests/api/ad-view/ad-view.stats.test.ts` exists
- [x] `apps/strapi/src/api/ad-view/services/ad-view.ts` contains `getAdStats`, `getUserTotalViews`, `conversion`, `avgPerDay`
- [x] `apps/strapi/src/api/ad-view/routes/00-ad-view-custom.ts` contains `/ads/me/views-total` (line 13) before `/ads/:documentId/stats` (line 18)
- [x] Commits `592b1fd7` and `51c3e041` exist
- [x] 12/12 tests pass (`npx jest tests/api/ad-view/`)
- [x] `tsc --noEmit` clean
