---
phase: 05-type-safety
plan: 05
subsystem: ui
tags: [vue, typescript, types, dashboard]

# Dependency graph
requires:
  - phase: 05-01
    provides: Shared Ad, AdGalleryItem, Order, OrderUser, OrderAd types in app/types/

provides:
  - Four dashboard components migrated to shared domain types (no inline Ad or Order interfaces)
  - formats?: any anti-pattern eliminated from UserAnnouncements.vue gallery field
  - PendingAd narrowing pattern for Strapi API response shape compatibility

affects: [05-type-safety, phase-6-performance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Omit<DomainType, field> & { field?: NarrowShape } for API response narrowing without duplicating full domain interface"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/UserAnnouncements.vue
    - apps/dashboard/app/components/DropdownPendings.vue
    - apps/dashboard/app/components/ChartSales.vue
    - apps/dashboard/app/components/DropdownSales.vue

key-decisions:
  - "PendingAd = Omit<Ad, 'user'> & { user?: { username?: string; email?: string } } for DropdownPendings — preserves full Ad import while narrowing the user field to match the /ads/pendings Strapi endpoint response shape"

patterns-established:
  - "Omit<DomainType, field> narrowing: prefer Omit over full inline re-declaration when only one field differs from canonical type"

requirements-completed: [TYPE-01, TYPE-02]

# Metrics
duration: 2min
completed: 2026-03-05
---

# Phase 05 Plan 05: Inline Ad/Order Interface Gap Closure Summary

**Eliminated all remaining inline Ad and Order interface blocks in dashboard components, replacing formats?: any with typed AdGalleryItem and establishing Omit-based narrowing for API response shape compatibility**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-05T14:13:06Z
- **Completed:** 2026-03-05T14:15:11Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Removed inline `interface Ad` from UserAnnouncements.vue and DropdownPendings.vue; both now import from `@/types/ad`
- Replaced `formats?: any` in UserAnnouncements.vue `getImageUrl` parameter with `AdGalleryItem` — eliminating the last `:any` on a domain entity field
- Removed inline `interface Order` from ChartSales.vue and DropdownSales.vue; both now import from `@/types/order`
- Introduced `PendingAd = Omit<Ad, "user"> & { user?: { username?: string; email?: string } }` in DropdownPendings.vue for API response shape compatibility without duplicating the full Ad definition

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace inline Ad interfaces in UserAnnouncements and DropdownPendings** - `913058c` (feat)
2. **Task 2: Replace inline Order interfaces in ChartSales and DropdownSales** - `c43b130` (feat)

## Files Created/Modified

- `apps/dashboard/app/components/UserAnnouncements.vue` - Removed inline Ad interface; added import of Ad and AdGalleryItem; updated getImageUrl param from `formats?: any` to AdGalleryItem
- `apps/dashboard/app/components/DropdownPendings.vue` - Removed inline Ad interface; added import of Ad; added PendingAd narrowing type; updated refs and cast to PendingAd[]
- `apps/dashboard/app/components/ChartSales.vue` - Removed inline Order interface (amount: number narrowed to number | string in canonical type — already handled by existing typeof check); added import of Order
- `apps/dashboard/app/components/DropdownSales.vue` - Removed inline Order interface; added import of Order (canonical OrderUser has username and email via Pick<User>)

## Decisions Made

- Used `Omit<Ad, "user"> & { user?: { username?: string; email?: string } }` for DropdownPendings rather than accepting a `username: string` mismatch between canonical Ad.user and the Strapi /ads/pendings endpoint response. This avoids a TypeScript error while keeping the component bound to the shared Ad type.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all four components migrated cleanly. ChartSales.vue's existing `typeof order.amount === "string" ? Number.parseFloat(order.amount) : order.amount` check already handles the `number | string` union in the canonical Order type, so no body changes were needed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 5 type-safety success criteria fully satisfied: no inline Ad or Order interfaces remain anywhere in `apps/dashboard/app/components/`, and no `:any` on domain entity fields
- VERIFICATION.md gaps (truths #8 and #9) closed
- Phase 6 (Performance) can proceed without any type-safety blockers

---
*Phase: 05-type-safety*
*Completed: 2026-03-05*
