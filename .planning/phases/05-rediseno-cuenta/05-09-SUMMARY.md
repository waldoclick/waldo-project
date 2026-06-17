---
phase: 05-rediseno-cuenta
plan: "09"
subsystem: website-frontend
tags: [stats, chart-js, modal, kpi, vue-chartjs, TDD]
dependency_graph:
  requires: [05-08, 05-02, 05-03]
  provides: [StatsAdModal, loadAdStats, loadPanelViewsTotal, real-panel-kpis]
  affects: [account-panel, account-announcements]
tech_stack:
  added: []
  patterns: [vue-chartjs-Bar, buildStatsChartData-util, TDD-RED-GREEN, shared-store-action]
key_files:
  created:
    - apps/website/app/components/StatsAdModal.vue
    - apps/website/app/utils/stats.ts
    - apps/website/tests/utils/stats.test.ts
  modified:
    - apps/website/app/stores/user.store.ts
    - apps/website/app/components/AccountMain.vue
    - apps/website/app/components/CardProfileAd.vue
    - apps/website/app/scss/components/_account.scss
decisions:
  - "loadPanelViewsTotal folded into AccountMain useAsyncData Promise.all to avoid SSR double-fetch (CLAUDE.md rule)"
  - "StatsAdModal kept self-contained per CardProfileAd (not lifted to AccountAnnouncements) to stay in declared scope and not disturb existing test"
  - "totalContacts derived from published ad contact_count field (no /ads/me/contacts-total endpoint in 05-08); documented in Known Stubs"
  - "buildStatsChartData uses deterministic index-based labels to avoid Date.now() flakiness in tests"
  - "Badge in StatsAdModal uses BEM modifier classes (stats--ad__badge--{status}) not inline style"
metrics:
  duration: "~45 min"
  completed: "2026-06-17"
  tasks_completed: 3
  files_modified: 7
---

# Phase 05 Plan 09: Stats Frontend Summary

Per-ad stats modal (14-day chart.js bar chart) + Panel KPIs wired to real 05-08 aggregation endpoints. StatsAdModal.vue opened from CardProfileAd dropdown and AccountMain triage "Ver estadísticas". TDD RED→GREEN on buildStatsChartData util (4 tests).

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `1cb27187` | feat | buildStatsChartData util + loadAdStats/loadPanelViewsTotal store actions |
| `6bced364` | feat | StatsAdModal.vue + .stats--ad SCSS block |
| `347e56d2` | feat | Wire StatsAdModal + real KPIs into AccountMain and CardProfileAd |

## Tasks Completed

### Task 1: Store Actions + Utility (TDD)

**RED:** `tests/utils/stats.test.ts` — 4 tests covering labels.length===series.length, dataset.data===series, last-bar color differs, empty/single-element edge cases.

**GREEN:** Two new files:

**Util (`app/utils/stats.ts`):**
- `buildStatsChartData(series)` → `{ labels, datasets: [{ data, backgroundColor, borderRadius }] }`
- Labels are deterministic index-based strings (`-13d … -1d, Hoy`), no `Date.now()` flakiness
- All bars `#f2dbaa` (light amber), last bar `#efb85c` (amber_hover) — matches mockup emphasis

**Store (`app/stores/user.store.ts`):**
- `loadAdStats(documentId, days=14)` → `GET /api/ads/{documentId}/stats?days={n}` → unwraps `{ data: { total, series, contacts, conversion, avgPerDay } }`
- `loadPanelViewsTotal()` → `GET /api/ads/me/views-total` → unwraps `{ data: { total } }`
- Both handle errors gracefully (return zero defaults)

### Task 2: StatsAdModal.vue + SCSS

**Component (`app/components/StatsAdModal.vue`):**
- Props: `open: boolean`, `ad: { documentId, name, category?, status? } | null`; emits `close`
- `watch([open, ad.documentId], { immediate: true })` triggers `loadAdStats` on modal open
- BEM block `stats--ad`: backdrop teleported to body, dialog, header (eyebrow + title + status badge + category), 3 KPI tiles (Vistas totales / Contactos / Conversión), chart section (heading + "Prom. X / día" + `<Bar>`), info note, Cerrar footer
- `<Bar>` from vue-chartjs with local ChartJS.register (CategoryScale, LinearScale, BarElement, Tooltip) — no annotation plugin needed, no new deps
- 0 static `style=` attributes in template; badge uses BEM modifier class

**SCSS (`_account.scss`):**
- New `.stats--ad` block appended after `.account {}` block
- Phase-04 tokens throughout (`$ink`, `$muted`, `$line`, `$cream`, `$white`, `$success`, `$error`, `$independence`)
- Animation: `statsBackdropIn` (opacity) + `statsModalIn` (opacity + translate + scale)
- `_variables.scss` unchanged

### Task 3: AccountMain.vue + CardProfileAd.vue Wiring

**AccountMain.vue:**
- `loadPanelViewsTotal()` added to the existing `Promise.all` inside `useAsyncData("account-panel")` — no new top-level `await`, no double-fetch
- `totalViews` now computed from `panel.value.totalViews` (real data from `/ads/me/views-total`)
- `totalContacts` computed by summing `contact_count` from loaded published ads (see Known Stubs)
- Triage rows: `AttentionItem` gained `actionType: "stats" | "link"` and `adRef` fields; expiring ads get `actionType: "stats"` which triggers `openStatsForAd(item.adRef)` via a `<button>` instead of a `<nuxt-link>`
- `<StatsAdModal :open="statsOpen" :ad="statsAd" @close="statsOpen = false" />` mounted at bottom of template
- All `TODO 05-09` markers removed (0 remaining)

**CardProfileAd.vue:**
- Added `Estadísticas` dropdown item (ChartNoAxesColumn icon) to the published overflow menu
- `statsOpen` ref + `statsModalAd` computed + `handleOpenStats()` function
- `<StatsAdModal>` self-contained per card (teleported to body, so no DOM nesting issue)
- No changes to `AccountAnnouncements.vue` (out of declared scope)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Critical] totalContacts derived rather than fetched**
- **Found during:** Task 3
- **Issue:** 05-08 provides no `/ads/me/contacts-total` endpoint; `views-total` is the only panel aggregation
- **Fix:** `totalContacts` computed from `contact_count` field on published ads (already loaded in Promise.all). If the field is absent the value is 0 — acceptable since contacts data depends on the event table being populated. Documented in Known Stubs.
- **Files modified:** `AccountMain.vue` (sum computed property)

**2. [Rule 2 - Critical] Deterministic chart labels**
- **Found during:** Task 1 (advisor review)
- **Issue:** Plan suggested "last N day short-dates" which would use `new Date()` making tests time-dependent
- **Fix:** Used index-based labels (`-Nd … Hoy`) — labels are relative only, pass deterministically
- **Files modified:** `app/utils/stats.ts`

## Known Stubs

| File | Location | Description |
|------|----------|-------------|
| `AccountMain.vue` | `totalContacts computed` | Derived from `published[i].contact_count ?? 0`. Will be 0 until the ad-contact event table is populated and Strapi exposes the field via the ads/actives populate. A dedicated `/ads/me/contacts-total` endpoint was not implemented in 05-08 — a future plan can add it and replace this derivation. |

## Self-Check: PASSED

- [x] `apps/website/app/components/StatsAdModal.vue` exists
- [x] `apps/website/app/utils/stats.ts` contains `buildStatsChartData`
- [x] `apps/website/tests/utils/stats.test.ts` exists (4 tests pass)
- [x] `apps/website/app/stores/user.store.ts` contains `loadAdStats` and `loadPanelViewsTotal`
- [x] `apps/website/app/components/AccountMain.vue` contains `loadPanelViewsTotal` and `StatsAdModal`
- [x] `apps/website/app/components/CardProfileAd.vue` contains `StatsAdModal` and `handleOpenStats`
- [x] `grep -c "TODO 05-09" AccountMain.vue` returns 0
- [x] `grep -c "style=" StatsAdModal.vue` returns 0 (no static inline styles)
- [x] Commits `1cb27187`, `6bced364`, `347e56d2` exist
- [x] Vitest 4/4 pass
- [x] vue-tsc clean (0 errors)
- [x] `_account.scss` compiles without errors
- [x] `_variables.scss` unchanged
