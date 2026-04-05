---
phase: quick
plan: 260405-njc
subsystem: strapi-api, website-store, website-sitemap
tags: [public-endpoint, catalog, ad-listing, sitemap, auth-false]
dependency_graph:
  requires: []
  provides: [public-catalog-endpoint, website-public-listing, sitemap-ads]
  affects: [ads.store.ts, sitemap.xml.ts, ad controller, ad routes]
tech_stack:
  added: []
  patterns: [auth:false route, isManager bypass, activeAds delegation]
key_files:
  created: []
  modified:
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/strapi/src/api/ad/routes/00-ad-custom.ts
    - apps/website/app/stores/ads.store.ts
    - apps/website/server/routes/sitemap.xml.ts
decisions:
  - Pass isManager=true and userId=null to activeAds() to bypass user filtering for public catalog
  - Route registered with auth:false to allow unauthenticated access without JWT
  - user.store.ts left unchanged — authenticated users continue to use /ads/actives with userId filtering
metrics:
  duration: ~5 minutes
  completed: 2026-04-05
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Quick Task 260405-njc: Add Public /ads/catalog Endpoint Summary

**One-liner:** Public GET /ads/catalog endpoint in Strapi bypasses user filtering via isManager=true; website store and sitemap updated to use it instead of /ads/actives.

## Objective

Restore the public website's ad listing and sitemap after the `/ads/actives` refactor added role-based userId filtering, which broke unauthenticated access. A dedicated `/ads/catalog` endpoint provides all active ads publicly without requiring authentication.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add catalog controller method and public route in Strapi | ff64cbd3 | apps/strapi/src/api/ad/controllers/ad.ts, apps/strapi/src/api/ad/routes/00-ad-custom.ts |
| 2 | Update website store and sitemap to use /ads/catalog | caff3e0b | apps/website/app/stores/ads.store.ts, apps/website/server/routes/sitemap.xml.ts |

## What Was Built

### Task 1: Strapi - catalog controller + route

Added `catalog` controller method to `ad.ts` following the exact same pagination extraction pattern as `actives`. Delegates to `activeAds(options, true, null)` — passing `isManager: true` to bypass user filtering and `userId: null` since no user context is needed.

Registered `GET /ads/catalog` with `config: { auth: false }` in `00-ad-custom.ts`, placed before `/ads/actives`. This mirrors the pattern used by `/ads/slug/:slug`.

### Task 2: Website - store and sitemap

- `ads.store.ts` line 44: changed `ads/actives` to `ads/catalog` in `loadAds()`
- `sitemap.xml.ts` line 81: changed `/api/ads/actives` to `/api/ads/catalog`
- `user.store.ts` — left untouched, still calls `ads/actives` for authenticated user's own ads

## Verification

- Strapi builds without errors (admin panel + TypeScript compile clean)
- Website typechecks clean (no TypeScript errors)
- `grep -r "ads/actives" apps/website/` only shows `user.store.ts` (authenticated usage)
- `grep -r "ads/catalog" apps/website/` shows `ads.store.ts` and `sitemap.xml.ts`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- ff64cbd3 exists in git log
- caff3e0b exists in git log
- apps/strapi/src/api/ad/controllers/ad.ts modified with catalog method
- apps/strapi/src/api/ad/routes/00-ad-custom.ts modified with /ads/catalog route
- apps/website/app/stores/ads.store.ts uses ads/catalog
- apps/website/server/routes/sitemap.xml.ts uses /api/ads/catalog
