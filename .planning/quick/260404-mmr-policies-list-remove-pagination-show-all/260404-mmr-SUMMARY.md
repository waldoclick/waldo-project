---
phase: quick
plan: 260404-mmr
subsystem: dashboard
tags: [drag-and-drop, policies, vuedraggable, pagination, reorder]
dependency_graph:
  requires: []
  provides: [policies-drag-reorder, policies-no-pagination]
  affects: [PoliciesDefault.vue]
tech_stack:
  added: [vuedraggable@4.1.0]
  patterns: [vuedraggable tag=template inside existing tbody, Promise.all for batch PUT updates]
key_files:
  created: []
  modified:
    - apps/dashboard/app/components/PoliciesDefault.vue
    - apps/dashboard/app/scss/components/_policies.scss
    - apps/dashboard/package.json
    - yarn.lock
decisions:
  - Used tag="template" for draggable (not tag="tbody") because TableDefault already renders its own tbody — nested tbody would be invalid HTML
  - pageSize: 200 as the fetch-all sentinel — sufficient ceiling for policies content type
  - Promise.all for concurrent PUT updates rather than sequential — acceptable for small policy sets
metrics:
  duration: 15min
  completed: "2026-04-04T19:29:31Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 4
---

# Quick Task 260404-mmr: Policies List — Remove Pagination and Add Drag-and-Drop Reorder

**One-liner:** Removed pagination from policies list, fetch all 200 in one request, added vuedraggable rows with GripVertical handle persisting 1-based order to Strapi via PUT on drop.

## What Was Built

### Task 1: Remove pagination, fetch all policies
- Removed `PaginationDefault` component and all pagination state (`paginationMeta`, `totalPages`, `totalRecords`)
- Removed `pageSize` and `currentPage` from the watch array
- Fetch now uses `pagination: { pageSize: 200 }` — a single request for all policies
- Removed `paginatedPolicies` computed — template uses `allPolicies` directly
- Removed `:page-sizes` prop from `FilterDefault` (sort options retained for viewing)
- Added `documentId: string` to the `Policy` interface

### Task 2: Drag-and-drop reorder with Strapi persistence
- Installed `vuedraggable@4.1.0` (vuedraggable@next for Vue 3)
- Wrapped table rows in `<draggable tag="template">` — uses `template` not `tbody` because `TableDefault` already renders a `<tbody>` in its own template; nested tbody would be invalid HTML
- `GripVertical` icon from `lucide-vue-next` as drag handle per column
- `handleReorder` assigns 1-based sequential order to ALL policies after every drop, then `Promise.all` sends concurrent PUT requests to `/api/policies/:documentId`
- On failure, re-fetches from server to restore consistent state
- `isDraggable` computed disables handles when `searchTerm` is active
- Note displayed below header when drag is disabled: "El arrastre para reordenar no esta disponible mientras se filtra."
- Saving indicator: "Guardando orden..." shown during persist
- Pagination SCSS block (`&__pagination`) removed; added `&__drag`, `&__drag-note`, `&__saving` styles using brand color `$davys_grey`

## Commits

| Hash | Message |
|------|---------|
| e608ebc8 | feat(quick-260404-mmr): remove pagination and add drag-and-drop reorder to policies list |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used tag="template" instead of tag="tbody" for draggable**
- **Found during:** Task 2 — plan instructed to check TableDefault before implementing
- **Issue:** `TableDefault` already wraps slot content in `<tbody class="table--default__body">`. Using `tag="tbody"` would produce nested `<tbody>` elements (invalid HTML) and break table rendering.
- **Fix:** Used `tag="template"` so draggable renders no wrapper element; rows slot directly into the existing tbody.
- **Files modified:** apps/dashboard/app/components/PoliciesDefault.vue
- **Commit:** e608ebc8

## Known Stubs

None — all policies data is fetched from Strapi and the order field is persisted back on every drag.

## Self-Check: PASSED

- [x] `apps/dashboard/app/components/PoliciesDefault.vue` — exists and committed
- [x] `apps/dashboard/app/scss/components/_policies.scss` — exists and committed
- [x] `apps/dashboard/package.json` — contains `"vuedraggable": "^4.1.0"`
- [x] Commit e608ebc8 — verified present in git log
- [x] TypeScript typecheck passes (`yarn workspace waldo-dashboard exec -- npx nuxi typecheck` — clean)
