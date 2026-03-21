---
phase: quick
plan: 260321-k2b
subsystem: strapi-ad-sorting
tags: [sort, featured, pro, ads, lifecycle, denormalization]
dependency_graph:
  requires: []
  provides: [sort_priority-field, computeSortPriority-helper, featured-pro-sort]
  affects: [api::ad.ad, ad-featured-reservation, subscription-charge-cron, payment-controller, website-anuncios]
tech_stack:
  added: []
  patterns: [denormalized-sort-field, lifecycle-hooks, bootstrap-backfill]
key_files:
  created:
    - apps/strapi/src/api/ad-featured-reservation/content-types/ad-featured-reservation/lifecycles.ts
  modified:
    - apps/strapi/src/api/ad/content-types/ad/schema.json
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/index.ts
    - apps/strapi/src/cron/subscription-charge.cron.ts
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/website/app/pages/anuncios/index.vue
decisions:
  - Denormalized sort_priority integer (0/1/2) chosen over relation-based sort because strapi.db.query orderBy cannot resolve relation paths
  - Bootstrap backfill runs on every Strapi start to keep sort_priority consistent across deployments
  - transformSortParameter now handles array inputs for multi-field ordering
metrics:
  duration: 12m
  completed: 2026-03-21
  tasks_completed: 3
  files_changed: 7
---

# Quick Task 260321-k2b: Add sort_priority Field to Ads for Featured+PRO Ordering

**One-liner:** Denormalized integer `sort_priority` (0=featured+PRO, 1=featured, 2=default) with lifecycle hooks and bootstrap backfill replaces broken relation-based sort in /anuncios listing.

## What Was Done

### Task 1: Add sort_priority field to ad schema and computeSortPriority helper (544e163f)

Added `sort_priority` integer field (default 2, required) to the ad schema. Exported two new functions from `apps/strapi/src/api/ad/services/ad.ts`:

- `computeSortPriority(ad)` — returns 0 for featured+PRO, 1 for featured+normal, 2 for not featured
- `recalculateSortPriorities()` — batch backfill for all existing ads

Updated `transformSortParameter` to support array inputs so multi-field ordering (`["sort_priority:asc", "createdAt:desc"]`) passes through correctly to `strapi.db.query().findMany()`.

Updated `apps/strapi/src/index.ts` bootstrap to call `recalculateSortPriorities()` on every Strapi start (outside the seeders gate so it always runs).

### Task 2: Add lifecycle hooks to recalculate sort_priority on relevant events (e4d506cf)

Created `apps/strapi/src/api/ad-featured-reservation/content-types/ad-featured-reservation/lifecycles.ts` with `afterCreate`, `afterUpdate`, and `afterDelete` hooks. Each hook reads the `ad` relation from the event result, fetches the full ad with populated relations, calls `computeSortPriority`, and updates `sort_priority` if it changed.

Added `computeSortPriority` import and recalculation block to:
- `subscription-charge.cron.ts` — after deactivating a user's PRO status (priority 0 → 1 for their featured ads)
- `payment.ts` (proResponse) — after activating a user's PRO status (priority 1 → 0 for their featured ads)

### Task 3: Fix sort params in website anuncios page (679271a1)

Replaced both occurrences of `"ad_featured_reservation.id:desc"` in `apps/website/app/pages/anuncios/index.vue` with `"sort_priority:asc"` — the main listing sort and the related-ads fallback sort.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- apps/strapi/src/api/ad/content-types/ad/schema.json — sort_priority field verified via node -e
- apps/strapi/src/api/ad-featured-reservation/content-types/ad-featured-reservation/lifecycles.ts — file exists, contains computeSortPriority
- apps/strapi/src/cron/subscription-charge.cron.ts — contains computeSortPriority
- apps/strapi/src/api/payment/controllers/payment.ts — contains computeSortPriority
- apps/website/app/pages/anuncios/index.vue — 2x sort_priority:asc, 0x ad_featured_reservation.id:desc
- TypeScript compilation passes with no errors (npx tsc --noEmit)
- No remaining ad_featured_reservation.id:desc references in codebase

Commits:
- 544e163f feat(260321-k2b): add sort_priority field to ad schema and computeSortPriority helper
- e4d506cf feat(260321-k2b): add lifecycle hooks to recalculate sort_priority on relevant events
- 679271a1 fix(260321-k2b): use sort_priority:asc instead of broken relation sort in anuncios page
