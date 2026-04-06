---
quick_task: 260406-r0g
subsystem: dashboard
tags: [orders, pagination, search, server-side-filtering, watch-pattern]
key-files:
  modified:
    - apps/dashboard/app/components/OrdersDefault.vue
decisions:
  - Replace useAsyncData+client-filteredOrders with watch(immediate:true)+fetchOrders matching AdsTable.vue pattern
  - Server-side $containsi filters on searchTerm so totalPages/totalRecords reflect filtered dataset
metrics:
  duration: ~5m
  completed: 2026-04-06T23:30:35Z
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 260406-r0g: Fix Pagination Not Resetting to Page 1 on Search

## One-liner

Replace client-side filteredOrders computed and useAsyncData with server-side $containsi filtering via watch(immediate:true)+fetchOrders pattern, matching AdsTable.vue.

## What Was Done

### Task 1: Refactor OrdersDefault.vue to server-side filtering with watch pattern

**Root cause addressed:** `useAsyncData` used a `queryKey` that omitted `searchTerm`, so when `currentPage` was already 1, changing the search term produced the same key and no re-fetch fired. Even when a re-fetch did fire, the server returned an unfiltered total, making `totalPages` incorrect.

**Changes made to `apps/dashboard/app/components/OrdersDefault.vue`:**

- Removed: `useAsyncData`, `queryKey` computed, `ordersResponse` ref, `orders` computed, `filteredOrders` computed, `paginatedOrders` (old version), `sortParam` computed
- Removed: `OrdersListResponse` from type imports (no longer needed)
- Removed: `useAsyncData` from `nuxt/app` import
- Added: `ref`, `computed`, `watch` from `vue`
- Added: `allOrders` ref, `loading` ref, `paginationMeta` ref
- Added: `fetchOrders()` function with Strapi `$containsi` filters when `searchTerm` is set
- Added: `watch(immediate: true)` watching `searchTerm`, `sortBy`, `pageSize`, `currentPage`
- Updated: `paginatedOrders` computed now returns `allOrders.value` directly (server already paginates)
- Updated: `totalPages` and `totalRecords` derived from `paginationMeta` (reflects filtered server count)
- Updated: empty-state condition from `filteredOrders.length === 0` to `paginatedOrders.length === 0 && !loading`

**Commit:** `246b1233`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- File exists: `/home/gab/Code/waldo-project/apps/dashboard/app/components/OrdersDefault.vue` — FOUND
- Commit `246b1233` — FOUND
- TypeScript typecheck: PASSED (zero errors)
