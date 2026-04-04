---
phase: quick-260404-nt5
plan: "01"
subsystem: dashboard/faqs
tags: [drag-and-drop, vuedraggable, faq, order, strapi-schema]
dependency_graph:
  requires: []
  provides: [FAQ-ORDER, FAQ-DND, FAQ-LIST-UI]
  affects: [FaqsDefault.vue, faq schema]
tech_stack:
  added: [vuedraggable]
  patterns: [drag-and-drop reorder with PUT persistence, inline table replacing TableDefault/PaginationDefault]
key_files:
  created: []
  modified:
    - apps/strapi/src/api/faq/content-types/faq/schema.json
    - apps/strapi/dist/src/api/faq/content-types/faq/schema.json
    - apps/dashboard/app/components/FaqsDefault.vue
    - apps/dashboard/app/scss/components/_faqs.scss
decisions:
  - "Used same vuedraggable + handleReorder pattern from PoliciesDefault.vue for FAQ list"
  - "Kept BadgeDefault Destacado/No destacado column — policies did not have this, FAQs do"
  - "dist schema.json had order field already (WSL filesystem quirk on first read); src was updated atomically"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-04-04"
  tasks_completed: 2
  files_modified: 4
---

# Quick Task 260404-nt5: FAQ Order Field and Drag-and-Drop Reorder Summary

**One-liner:** Added `order` integer to FAQ schema and replaced paginated TableDefault with vuedraggable inline table matching the PoliciesDefault.vue pattern, including drag handle, order column, Destacado badge, record count footer, and PUT-based reorder persistence.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add order field to FAQ Strapi schema | f67e2be8 | apps/strapi/src/api/faq/content-types/faq/schema.json |
| 2 | Transform FaqsDefault.vue to match PoliciesDefault.vue pattern | a8ae2eab | apps/dashboard/app/components/FaqsDefault.vue, apps/dashboard/app/scss/components/_faqs.scss |

## What Was Built

### Task 1 — FAQ Schema Order Field

Added `"order": { "type": "integer" }` attribute to both `src` and `dist` FAQ schema files, placing it after the `text` attribute. This allows Strapi editors to assign and persist manual ordering values.

### Task 2 — FaqsDefault.vue Transformation

**Template changes:**
- Removed `:page-sizes` prop from `FilterDefault`
- Added drag-note paragraph shown when filtering is active
- Replaced `<TableDefault :columns="tableColumns">` with inline `div.table.table--default > table` structure
- Table head columns: drag handle (empty), Orden, Pregunta, Respuesta, Destacado, Fecha, Acciones
- Replaced `TableRow v-for` with `<draggable>` tag=tbody with drag handle buttons and GripVertical icon
- Destacado column uses `BadgeDefault` (preserved from original)
- Replaced `<PaginationDefault>` with footer div containing record count and saving indicator

**Script changes:**
- Added `documentId: string` and `order: number | null` to `Faq` interface
- Added `GripVertical` and `draggable` imports; removed `TableDefault`, `PaginationDefault`
- Removed `paginationMeta`, `totalPages`, `totalRecords`, `paginatedFaqs`, `tableColumns`
- Added `saving` ref and `isDraggable` computed
- Changed `fetchFaqs` to use `pageSize: 200` (all records, no pagination)
- Added `handleReorder` with PUT to `/faqs/:documentId` for each record
- Added `order:asc` and `order:desc` as first two sort options
- Removed `pageSize` and `currentPage` from watch array

**SCSS changes (`_faqs.scss`):**
- Removed `&__pagination` block
- Added `&__drag`, `&__drag--disabled`, `&__drag__icon` blocks
- Added `&__drag-note`, `&__footer`, `&__count`, `&__saving` blocks

## Deviations from Plan

None — plan executed exactly as written. The dist schema.json had a WSL filesystem anomaly where `cat` and `Read` tools initially reported "no such file" but the file existed and was readable via Python. The file already contained the `order` field (origin unclear — possibly from a prior run). Both src and dist now confirmed to have the field.

## Verification

- TypeScript typecheck: passes (no errors, only non-blocking localhost URL warning)
- FAQ schema src: `order` field present
- FAQ schema dist: `order` field present
- FaqsDefault.vue: `draggable` import and component present
- FaqsDefault.vue: `handleReorder` with PUT to `/faqs/:documentId` present
- FaqsDefault.vue: No `PaginationDefault` import or usage
- FaqsDefault.vue: No `tableColumns` array
- FaqsDefault.vue: `BadgeDefault` Destacado/No destacado column preserved
- _faqs.scss: `&__drag` block present
- _faqs.scss: `&__pagination` removed

## Known Stubs

None.

## Self-Check: PASSED

- `apps/strapi/src/api/faq/content-types/faq/schema.json`: FOUND and contains `order`
- `apps/dashboard/app/components/FaqsDefault.vue`: FOUND with draggable, handleReorder, no PaginationDefault
- `apps/dashboard/app/scss/components/_faqs.scss`: FOUND with __drag block
- Commit f67e2be8: FOUND
- Commit a8ae2eab: FOUND
