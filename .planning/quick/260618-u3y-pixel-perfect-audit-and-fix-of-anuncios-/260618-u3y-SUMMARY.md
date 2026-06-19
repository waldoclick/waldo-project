---
phase: 260618-u3y
plan: 01
type: quick-task
subsystem: website/hero
tags: [hero, search, visual, pixel-perfect]
key-files:
  modified:
    - apps/website/app/components/HeroResults.vue
    - apps/website/app/pages/anuncios/index.vue
    - apps/website/app/scss/components/_hero.scss
decisions:
  - "Pass empty string from index.vue when no category (not #f0f0f0) so HeroResults can distinguish no-category vs category states"
  - "Decouple hero--results__container from @extend .container to explicit 1200px + responsive padding — keeps other blocks using @extend untouched"
  - "Remove queryValue computed and useRoute import from HeroResults.vue — the 'Resultados para:' display is replaced by the heroSub paragraph passed from the page"
  - "Load filterCategories inside existing adsData useAsyncData callback (not a separate one) to avoid N+1 fetches"
metrics:
  duration: 25m
  completed: 2026-06-18
  tasks_completed: 2
  files_modified: 3
---

# Phase 260618-u3y Plan 01: Pixel-perfect audit and fix of /anuncios hero — Summary

**One-liner:** Hero /anuncios fixed: cream fallback bg, 1200px explicit container, subtitle paragraph, and SearchDefault in hero row with working autocomplete.

## What Was Changed

### Task 1 — Fix hero background color fallback and container width

**HeroResults.vue (`heroStyle` computed):**

Before (broken): `bgColorWithTransparency(props.bgColor || '#f0f0f0')` — both states produced an rgba tint, so "no category" looked like a near-transparent grey instead of the solid `$cream` (#F6F4F1).

After: `props.bgColor ? bgColorWithTransparency(props.bgColor) : '#F6F4F1'` — empty string triggers the cream fallback; a real hex triggers the rgba tint.

**anuncios/index.vue (template bindings):**

Changed `:bg-color="categoryData?.color || '#f0f0f0'"` → `|| ''` so an absent category sends an empty string rather than the grey placeholder.

**_hero.scss (`hero--results__container`):**

Replaced `@extend .container` with explicit `max-width: 1200px; margin: 0 auto; padding-left/right: 32px` plus `@include screen-small { padding: 0 18px }`. The `.container` class already was 1200px so this is a layout-decoupling change (removes the SCSS extend dependency), not a size change. Other hero modifiers using `@extend .container` are untouched.

### Task 2 — Add hero subtitle and SearchDefault integration

**HeroResults.vue:**

- Added `sub?: string` and `categories?: FilterCategory[]` props
- Imported `SearchDefault` and `FilterCategory` type
- Restructured template: wrapped title block and `<SearchDefault>` in `<div class="hero--results__row">` (flex row, title left, search right)
- Added `<p v-if="sub" class="hero--results__sub">{{ sub }}</p>` below the row
- Removed `queryValue` computed and `useRoute` / `{ useRoute }` import (no longer needed — subtitle replaces the "Resultados para:" display)

**_hero.scss:**

- Added `&__row { display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; flex-wrap: wrap; }`
- Added `&__sub { margin: 10px 0 0; font-size: 15px; color: $ink2; line-height: 1.5; }`
- Removed dead `&__query` block (element removed from template)

**anuncios/index.vue:**

- Added `import type { FilterCategory } from "@/types/filter"`
- Added `await filterStore.loadFilterCategories()` inside the existing `adsData` useAsyncData callback (alongside `loadFilterCommunes`)
- Added `heroSub` computed: category-specific text when category active, generic industry text when no category
- Updated `<HeroResults>` usage to pass `:sub="heroSub"` and `:categories="filterStore.filterCategories as FilterCategory[]"`

## Screenshot Observations

**Before (not captured — as-found state):** Hero background was a near-transparent grey rgba tint in both states (no-category and category). No subtitle text. No search box in the hero area.

**After Task 1 — /anuncios (no category):** Hero background is solid cream (#F6F4F1). Title "Anuncios" prominent. Toolbar below hero.

**After Task 1 — /anuncios?category=mineria:** Hero background shows the Minería category color as an rgba tint. Icon tile visible. Different bg from no-category state confirms two-state logic works.

**After Task 2 — /anuncios (no category):** Hero row: "Anuncios" h1 on left, SearchDefault (input + "Buscar" button) on right. Subtitle "Explora equipos, vehículos, repuestos e insumos de toda la industria." below.

**After Task 2 — /anuncios?category=mineria:** Hero row: category icon tile + "Minería" h1 on left, SearchDefault on right. Subtitle "Minería publicados en Waldo.click." below. Category color tint background.

**Autocomplete test (focus + typing):** On focus, dropdown opens showing categories (Agricultura, Alimentación, Construcción, etc.). On typing "tractor", dropdown shows "Buscar 'tractor' en el buscador" row. Working correctly.

## Deviations from Plan

### Auto-removed — "Resultados para: {term}" display

The old `hero--results__query` div that showed "Resultados para: **{term}**" was removed (and its `queryValue` computed + `useRoute` import). The subtitle paragraph from the page now handles all contextual messaging below the h1. This is an **intentional deviation per the plan** — the subtitle replaces the query display.

**Rule applied:** Subtractive refactor (CLAUDE.md) — removing dead code rather than keeping it behind a v-if.

## Intentional Non-Changes

Per the plan objective and STATE.md 08-01:

- **Pagination:** `vue-awesome-paginate` kept as-is. The mockup has no pagination (client-side prototype). The app's server-side pagination is correct behavior.
- **Left sidebar filter panel:** Deferred per decision 08-01. `FilterResults` toolbar (ubicación + orden) stays as-is.
- **Card design:** Owned by 08-01. `CardAnnouncement` not touched.
- **FilterResults toolbar:** Kept as-is. The mockup's "Filtros" button has no app behavior.

## Commits

| Task | Hash | Message |
|------|------|---------|
| Task 1 | 8ca51dff | fix(260618-u3y): hero bg cream fallback and 1200px container decoupled from @extend |
| Task 2 | 8486cc64 | feat(260618-u3y): add hero subtitle, SearchDefault integration, and hero__row layout |

## Self-Check

- [x] `/anuncios` hero bg is solid cream (#F6F4F1) — confirmed via screenshot
- [x] `/anuncios?category=mineria` hero bg shows category color tint — confirmed via screenshot
- [x] Subtitle visible below h1 in both states — confirmed via screenshots
- [x] SearchDefault renders in hero row, autocomplete dropdown works — confirmed via Playwright focus test
- [x] Container is explicit 1200px (not @extend) — confirmed in SCSS
- [x] vue-tsc --noEmit passes (exit 0) — confirmed
- [x] No unused imports or variables — queryValue/route/useRoute all removed
- [x] HeroResults.vue: 8486cc64 exists in git log
- [x] anuncios/index.vue: 8486cc64 exists in git log
- [x] _hero.scss: 8486cc64 exists in git log

## Self-Check: PASSED
