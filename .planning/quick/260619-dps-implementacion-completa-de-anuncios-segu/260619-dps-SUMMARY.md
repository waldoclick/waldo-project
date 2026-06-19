---
phase: quick-260619-dps
plan: 01
subsystem: website/anuncios
tags: [filter, sidebar, layout, pagination, ux]
key-decisions:
  - "condition filter uses relation slug query ({ slug: { $eq: 'nuevo' } }) not string equality — matches Strapi schema where condition is a relation to api::condition.condition"
  - "3-column card grid (not 4) is correct per mockup: 828px content column with minmax(224px,1fr) fits exactly 3 columns"
  - "FilterResults renamed to filter--toolbar entirely; filter--announcement class eliminated app-wide"
  - "AdArchive retains container div (not changed) — works correctly inside listing--anuncios__content 1fr column"
  - "SSR guard pattern (import.meta.client + isClient ref) from FilterResults applied identically to FilterSidebar for store-backed lists"
key-files:
  created:
    - apps/website/app/components/FilterSidebar.vue
  modified:
    - apps/website/app/pages/anuncios/index.vue
    - apps/website/app/components/FilterResults.vue
    - apps/website/app/components/AdArchive.vue
    - apps/website/app/components/HeroResults.vue
    - apps/website/app/scss/components/_filter.scss
    - apps/website/app/scss/components/_announcement.scss
    - apps/website/app/scss/components/_hero.scss
metrics:
  duration: ~3 minutes
  completed: 2026-06-19
  tasks: 3
  files: 7
---

# Quick Task 260619-dps: Full /anuncios Listing Redesign — Summary

**One-liner:** Full /anuncios redesign: left filter sidebar (5 sections), 2-col grid layout, condition/price/year relation-aware server-side filters, slim toolbar, 224px card grid track, PaginationDefault paginator, hero search min-width fix.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create FilterSidebar + filter--sidebar SCSS | cd458a2c | FilterSidebar.vue, _filter.scss |
| 2 | Refactor index.vue layout + FilterResults toolbar + SCSS | 2fbf7bbb | index.vue, FilterResults.vue, _filter.scss, _announcement.scss |
| 3 | Card grid track, PaginationDefault, hero search min-width | 37ed31b4 | AdArchive.vue, HeroResults.vue, _announcement.scss, _hero.scss |

## What Was Built

### FilterSidebar.vue (new)
- Left filter sidebar with 5 sections: Categoría (single-select checkbox), Condición (radio), Precio (radio), Año (radio), Ubicación (native select)
- SSR-safe: `import.meta.client` guard for filterStore + `isClient` ref for v-if on store-backed lists
- All params written to URL via `router.push({ query: { ...route.query, X, page: 1 } })`
- Limpiar resets all filter params preserving `?s=` if present
- BEM: `filter--sidebar__header`, `__header__title`, `__header__clear`, `__section`, `__section__label`, `__section__row`, `__section__row__inner`, `__section__row__check`, `__section__row__name`, `__section__row__count`, `__location`, `__location__chevron`

### anuncios/index.vue (modified)
- New 2-col layout: `<section class="listing listing--anuncios">` wrapping sidebar + content
- FilterSidebar and FilterResults render UNCONDITIONALLY (no `v-if`) so filter UI stays visible at zero results
- condition/price/year added to: useAsyncData key template literal, watch array, filtersParams
- condition uses relation slug query: `{ slug: { $eq: 'nuevo' } }` — correct for Strapi v5 relation field

### FilterResults.vue (modified)
- Slimmed to `filter--toolbar`: count span + Ordenar-por select only
- Removed: commune select, selectedCommune ref, commune watch, IconFilter import, useFilterStore import/var
- Root changed from `<section class="filter filter--announcement">` to `<div class="filter filter--toolbar">`

### AdArchive.vue (modified)
- vue-awesome-paginate replaced with PaginationDefault
- Props: `:current-page`, `:total-pages`, `:total-records`, `:page-size`; event: `@page-change="onClickHandler"`
- Existing `onClickHandler` unchanged (pushes ?page, scrolls to top)

### HeroResults.vue (modified)
- `class="hero--results__search"` added to SearchDefault

### SCSS changes
- `_filter.scss`: new `&--sidebar` block (sticky, cream bg, BEM children); `&--announcement` renamed to `&--toolbar` with dead sub-rules removed (`__group`, `__selector`, `__selector__icon`, `__container` @extend)
- `_announcement.scss`: grid track 280px→224px; new `.listing--anuncios` block (266px+1fr grid, 42px gap)
- `_hero.scss`: `&__search { min-width: min(540px, 100%); flex-shrink: 0; }` under `&--results`

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

**Note on grid column count:** The plan prose says "~4 columns desktop" but the `verified_facts` block confirms 3 columns is correct per the mockup spec. With 828px content column and `minmax(224px,1fr)` + 22px gap, 3 columns fit (3×224 + 2×22 = 716px) but 4 do not (4×224 + 3×22 = 962px). Screenshot confirmed 3-column layout — this is a PASS.

## Visual Verification

Screenshot taken at localhost:3000/anuncios (1440×900):
- Sidebar visible on left with Filtros header, Limpiar button, all 5 sections
- 3-column card grid to the right of sidebar
- Toolbar shows result count left + Ordenar por select right
- PaginationDefault visible at bottom (Anterior / pages / Siguiente)
- Hero search box retains comfortable width

## Known Stubs

None — all data is live from the Strapi API.

## Self-Check: PASSED

Files created:
- apps/website/app/components/FilterSidebar.vue — FOUND
- .planning/quick/260619-dps-implementacion-completa-de-anuncios-segu/260619-dps-SUMMARY.md — this file

Commits:
- cd458a2c — feat: FilterSidebar + filter--sidebar SCSS
- 2fbf7bbb — feat: index.vue layout + FilterResults toolbar + SCSS
- 37ed31b4 — feat: card grid track + PaginationDefault + hero search min-width

All verification checks:
- vue-tsc --noEmit: exit 0 (no output = clean)
- filter--announcement: no references found app-wide
- vue-awesome-paginate in AdArchive: not found (clean)
