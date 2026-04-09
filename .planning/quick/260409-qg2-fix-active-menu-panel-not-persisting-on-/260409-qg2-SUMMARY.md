---
quick_id: 260409-qg2
status: complete
date: 2026-04-09
---

# Summary: Fix Active Menu Panel Not Persisting on Page Refresh

## What Changed

`apps/dashboard/app/layouts/dashboard.vue`:
- Added `resolveActiveMenu(path)` — maps `/users*` → `"users"`, `/maintenance*` → `"maintenance"`, else `"default"`
- `activeMenu` now initialized from `resolveActiveMenu(route.path)` instead of hardcoded `"default"`
- Added `watch(route.path)` to keep panel in sync on programmatic navigation

## Behavior After Fix

- Hard refresh on `/users` → Users panel stays active
- Hard refresh on `/maintenance/categories` → Maintenance panel stays active  
- Hard refresh on `/` → Default panel stays active
- Clicking rail button still overrides panel (user intent takes precedence)
- Navigating via NuxtLink auto-syncs panel to route
