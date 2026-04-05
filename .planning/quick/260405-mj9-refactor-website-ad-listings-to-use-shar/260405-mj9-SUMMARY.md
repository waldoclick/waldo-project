---
phase: quick
plan: 260405-mj9
subsystem: ads
tags: [refactor, role-based-access, strapi, website, store]
dependency_graph:
  requires: []
  provides: [role-based-ad-filtering-in-shared-endpoints]
  affects: [apps/strapi/src/api/ad/services/ad.ts, apps/strapi/src/api/ad/controllers/ad.ts, apps/website/app/stores/user.store.ts, apps/website/app/pages/cuenta/mis-anuncios.vue]
tech_stack:
  added: []
  patterns: [role-based-access-control, status-endpoint-mapping]
key_files:
  created: []
  modified:
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/website/app/stores/user.store.ts
    - apps/website/app/pages/cuenta/mis-anuncios.vue
decisions:
  - "userId passed through controller -> service -> query layer; non-managers see only their own ads via user.id filter"
  - "STATUS_ENDPOINT_MAP in user.store.ts maps status string to endpoint; cleanly replaces ads/me for listing"
  - "ads/me and ads/me/counts endpoints preserved for backward compatibility; only ads/me listing calls removed from website"
metrics:
  duration: ~10 minutes
  completed_date: "2026-04-05"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 4
---

# Quick Task 260405-mj9: Refactor Website Ad Listings to Use Shared Endpoints Summary

**One-liner:** Added userId-based role filtering to Strapi shared ad endpoints and updated website store to call status-specific endpoints instead of ads/me.

## Objective

Consolidate ad listing logic by having Strapi's shared status-specific endpoints (ads/actives, ads/pendings, etc.) filter by user ID for non-manager callers, eliminating the duplicate filtering logic in ads/me.

## Tasks Completed

### Task 1: Add userId parameter to Strapi service and controllers
**Commit:** `ae9b5faa`

- Added `userId: number | null = null` parameter to `getAdvertisements` helper function
- Inside `getAdvertisements`, added role-based user filter: when `!isManager && userId`, adds `filters.user = { id: { $eq: userId } }` to the DB query
- Updated all six service methods (`activeAds`, `pendingAds`, `archivedAds`, `bannedAds`, `rejectedAds`, `draftAds`) to accept and forward `userId` as the third parameter
- Updated all six controller methods to extract `ctx.state.user?.id ?? null` and pass it to the service
- Strapi build passed cleanly

### Task 2: Update website store and page to use shared status-specific endpoints
**Commit:** `cf045415`

- Added `STATUS_ENDPOINT_MAP` constant in `user.store.ts` mapping status strings to their shared endpoints
- Replaced `loadUserAds(filters, pagination, sort)` with `loadUserAds(status, pagination, sort)` — first param now a status string instead of filters object
- Store now calls `ads/actives`, `ads/pendings`, `ads/archiveds`, `ads/rejecteds`, or `ads/banneds` based on the status
- Updated `mis-anuncios.vue` to pass `currentFilter.value` directly instead of `{ status: currentFilter.value }`
- Website typecheck passed cleanly

## Verification

1. Strapi build: passed
2. Website typecheck: passed (no TypeScript errors)
3. `grep "ads/me" apps/website/app/pages/cuenta/mis-anuncios.vue` — returns nothing (correct)
4. `grep "ads/actives|ads/pendings..." apps/website/app/stores/user.store.ts` — returns all five status mappings
5. Dashboard: no code changed — managers still see all ads (isManager=true suppresses userId filter)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/strapi/src/api/ad/services/ad.ts` — modified (userId param added to getAdvertisements and six service methods)
- `apps/strapi/src/api/ad/controllers/ad.ts` — modified (userId extracted and passed in six controller methods)
- `apps/website/app/stores/user.store.ts` — modified (STATUS_ENDPOINT_MAP added, loadUserAds signature updated)
- `apps/website/app/pages/cuenta/mis-anuncios.vue` — modified (status string passed directly to loadUserAds)
- Commits verified: `ae9b5faa` (Task 1), `cf045415` (Task 2)
