---
phase: quick
plan: 260410-lhq
subsystem: strapi/cache
tags: [redis, cache, ttl, performance]
dependency_graph:
  requires: []
  provides: [collection-specific-ttl-config]
  affects: [apps/strapi/src/middlewares/cache.ts]
tech_stack:
  added: []
  patterns: [url-prefix-longest-match-ttl]
key_files:
  modified:
    - apps/strapi/src/middlewares/cache.ts
decisions:
  - "ONE_DAY and ONE_MINUTE constants added as named multipliers for readability and reuse"
  - "Record<string, number> type annotation added to CACHE_CONFIG to satisfy TypeScript dynamic key indexing"
  - "8 mantenedor collections configured at 24h; active invalidation on PUT/POST/DELETE already clears stale entries"
  - "ads at 1 minute to ensure catalog freshness without hammering Strapi"
  - "indicators at 1 hour (moderate freshness — dashboard analytics)"
metrics:
  duration: 5m
  completed: "2026-04-10"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 260410-lhq: Configure Collection-Specific TTLs Summary

## One-liner

Per-collection Redis TTL map: 24h for 8 mantenedor routes, 1 min for ads catalog, 1h for indicators — default 4h unchanged.

## What Was Done

Updated `CACHE_CONFIG` in `apps/strapi/src/middlewares/cache.ts` to replace a commented-out placeholder block with a live, typed TTL map organized by collection type.

### TTL Configuration Applied

| Route prefix | TTL | Rationale |
|---|---|---|
| `/api/categories` | 24h | Mantenedor — rarely changes, active invalidation on edit |
| `/api/conditions` | 24h | Mantenedor |
| `/api/ad-packs` | 24h | Mantenedor |
| `/api/regions` | 24h | Mantenedor |
| `/api/communes` | 24h | Mantenedor |
| `/api/faqs` | 24h | Mantenedor |
| `/api/policies` | 24h | Mantenedor |
| `/api/terms` | 24h | Mantenedor |
| `/api/ads` | 1 min | High-traffic catalog — freshness critical |
| `/api/indicators` | 1h | Analytics — moderate freshness |
| `default` | 4h | All other unspecified routes (unchanged) |

### Code Changes

- Added `ONE_DAY = ONE_HOUR * 24` and `ONE_MINUTE = 60` constants above `CACHE_CONFIG`
- Added explicit `Record<string, number>` type to `CACHE_CONFIG` so TypeScript resolves `CACHE_CONFIG[matchingRoute]` without error
- Removed old commented-out block (dead code)
- No changes to `shouldNotCache`, `getCacheTTL`, `invalidateCollectionCache`, or the middleware export function

## Commits

| Task | Commit | Message |
|---|---|---|
| 1 | 77c2c14b | feat(quick-260410-lhq): configure collection-specific TTLs in Redis cache middleware |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/strapi/src/middlewares/cache.ts` — FOUND, contains all 8 mantenedor entries + ads + indicators + default
- Commit 77c2c14b — FOUND in git log
- TypeScript compiled without errors
