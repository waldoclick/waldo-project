---
phase: 13-catalog-segments-migration
plan: "03"
subsystem: ui
tags: [nuxt, vue, routing, url-migration]

# Dependency graph
requires: []
provides:
  - "Orders list page at /orders (apps/dashboard/app/pages/orders/index.vue)"
  - "Order detail page at /orders/[id] (apps/dashboard/app/pages/orders/[id].vue)"
  - "Users list page at /users (apps/dashboard/app/pages/users/index.vue)"
  - "User detail page at /users/[id] (apps/dashboard/app/pages/users/[id].vue)"
affects:
  - 13-catalog-segments-migration
  - any component linking to /ordenes or /usuarios

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "git mv for directory renames to preserve Git history (same as Phase 12 ads migration)"
    - "Two-commit pattern: rename first, then update internal refs"

key-files:
  created: []
  modified:
    - apps/dashboard/app/pages/orders/index.vue
    - apps/dashboard/app/pages/orders/[id].vue
    - apps/dashboard/app/pages/users/index.vue
    - apps/dashboard/app/pages/users/[id].vue

key-decisions:
  - "Used git mv to rename directories so Git tracks renames cleanly (not deletions + additions)"
  - "Updated breadcrumb labels to English (Orders, Users) alongside route path changes"

patterns-established:
  - "Directory rename pattern: git mv + update route refs in second commit"

requirements-completed:
  - URL-08
  - URL-11

# Metrics
duration: 2min
completed: 2026-03-06
---

# Phase 13 Plan 03: Orders and Users Directory Migration Summary

**`ordenes/` and `usuarios/` directories renamed to `orders/` and `users/` via `git mv`, with breadcrumb route refs updated from `/ordenes` → `/orders` and `/usuarios` → `/users`**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T02:37:17Z
- **Completed:** 2026-03-06T02:38:43Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Renamed `apps/dashboard/app/pages/ordenes/` → `apps/dashboard/app/pages/orders/` using `git mv`
- Renamed `apps/dashboard/app/pages/usuarios/` → `apps/dashboard/app/pages/users/` using `git mv`
- Updated `orders/[id].vue` breadcrumb: `{ label: "Órdenes", to: "/ordenes" }` → `{ label: "Orders", to: "/orders" }`
- Updated `users/[id].vue` breadcrumb: `{ label: "Usuarios", to: "/usuarios" }` → `{ label: "Users", to: "/users" }`
- Git history shows renames (not deletions), preserving blame/history on all 4 files

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename ordenes and usuarios directories** - `1725cb0` (feat)
2. **Task 2: Update internal route references in orders and users pages** - `8f404bc` (feat)

**Plan metadata:** _(pending final commit)_

## Files Created/Modified

- `apps/dashboard/app/pages/orders/index.vue` — Orders list page (renamed from ordenes/index.vue)
- `apps/dashboard/app/pages/orders/[id].vue` — Order detail page; breadcrumb updated to /orders
- `apps/dashboard/app/pages/users/index.vue` — Users list page (renamed from usuarios/index.vue)
- `apps/dashboard/app/pages/users/[id].vue` — User detail page; breadcrumb updated to /users

## Decisions Made

- Used `git mv` for directory renames to preserve Git history cleanly (same pattern as Phase 12 ads migration)
- Updated breadcrumb labels to English (`Orders`, `Users`) alongside route path changes — consistent with the English URL migration convention
- Did not change Strapi API collection names (`orders`, `users`) — those are already English and were untouched

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/orders` and `/users` route trees are now canonical English paths, fulfilling URL-08 and URL-11
- Remaining catalog segment plans (13-01 categories, 13-02 communes/conditions/regions) are the only pending items in this phase
- Phase 15 (redirect rules) should be last after all segment migrations complete

---
*Phase: 13-catalog-segments-migration*
*Completed: 2026-03-06*

## Self-Check: PASSED

- FOUND: apps/dashboard/app/pages/orders/index.vue
- FOUND: apps/dashboard/app/pages/orders/[id].vue
- FOUND: apps/dashboard/app/pages/users/index.vue
- FOUND: apps/dashboard/app/pages/users/[id].vue
- FOUND commit: 1725cb0 (rename directories)
- FOUND commit: 8f404bc (update route references)
