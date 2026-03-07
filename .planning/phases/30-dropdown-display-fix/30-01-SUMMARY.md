---
phase: 30-dropdown-display-fix
plan: 01
completed: "2026-03-07"
tags: [dashboard, dropdown, display, buyer-name, timestamp]
files_modified:
  - apps/dashboard/app/components/DropdownSales.vue
requirements_satisfied:
  - DROP-01
  - DROP-02
---

# Phase 30 Plan 01 — Summary

## One-liner

Fixed `DropdownSales.vue` to show the buyer's full name and full date+time per order row.

## What Was Built

Updated the "Últimas órdenes" dashboard dropdown so each order entry shows:
- **Title line:** Buyer's full name (`firstname + lastname`), falling back to `username`, then `email` — replacing the raw `buy_order` ID
- **Meta line:** Full date and time (e.g. `"7 mar 2026 • 01:08 a. m."`) — replacing the time-only display

## Changes

### `apps/dashboard/app/components/DropdownSales.vue`
- Added imports: `formatDateShort` from `@/utils/date`, `formatFullName` from `@/utils/string`, `OrderUser` type from `@/types/order`
- Added `getBuyerName(user?: OrderUser): string` helper — calls `formatFullName(firstname, lastname)` and falls back to `username`, then `email`, then `"Usuario"` if all fields are missing
- Template: title span now uses `{{ getBuyerName(order.user) }}` (was `order.buy_order || "Orden #${order.id}"`)
- Template: meta span now uses `{{ formatDateShort(order.createdAt) }} • {{ formatTime(order.createdAt) }}` (was `order.user?.username || ... • formatTime(...)`)
- Inline `formatTime` function kept unchanged

## Verification

- `npx nuxt typecheck` — exit 0, zero type errors (run from `apps/dashboard`)

## Patterns / Decisions

- `formatFullName` takes separate `(firstname, lastname)` params, not a user object — wrapper helper `getBuyerName` handles the object destructuring and fallback chain
- `formatDateShort` already existed in `@/utils/date`; no new utility needed
- Styling, layout, CSS classes, and navigation behavior unchanged

## Requirements Coverage

| Req | Description | Status |
|-----|-------------|--------|
| DROP-01 | Show buyer full name instead of buy_order ID | ✅ |
| DROP-02 | Show full date + time instead of time-only | ✅ |
