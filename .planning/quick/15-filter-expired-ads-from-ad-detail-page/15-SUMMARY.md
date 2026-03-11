---
quick_task: 15
subsystem: website/stores
tags: [ads, filtering, 404, expiry]
dependency_graph:
  requires: []
  provides: [loadAdBySlug active+remaining_days filters]
  affects: [anuncios/[slug].vue, Strapi ads endpoint]
tech_stack:
  added: []
  patterns: [Strapi $eq/$gt filter operators]
key_files:
  modified:
    - apps/website/app/stores/ads.store.ts
decisions:
  - "Added active.$eq:true and remaining_days.$gt:0 to loadAdBySlug filters so Strapi returns empty for expired ads, leveraging existing watchEffect 404 handler in [slug].vue"
metrics:
  duration: "< 5 minutes"
  completed: "2026-03-11"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 15: Filter Expired Ads from Ad Detail Page — Summary

**One-liner:** Added `active: { $eq: true }` and `remaining_days: { $gt: 0 }` filters to `loadAdBySlug` so expired/inactive ads return 404 instead of displaying with a misleading warning.

## What Was Done

Extended the `filters` object in `loadAdBySlug` inside `apps/website/app/stores/ads.store.ts` to include two additional Strapi filter conditions alongside the existing `slug` filter:

```typescript
filters: {
  slug: { $eq: slug },
  active: { $eq: true },
  remaining_days: { $gt: 0 },
},
```

When an expired ad's URL is visited (`/anuncios/{slug}`), Strapi returns an empty result set. The existing `else` branch throws `"Ad not found"`, and the existing `watchEffect` in `[slug].vue` (lines 174–178) catches this and calls `showError({ statusCode: 404, ... })` — no page changes needed.

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add active and remaining_days filters to loadAdBySlug | 787b13d | apps/website/app/stores/ads.store.ts |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `apps/website/app/stores/ads.store.ts` modified with correct filters
- [x] Commit 787b13d exists
- [x] TypeScript check passed with no new errors
