---
phase: quick
plan: 260404-mbi
subsystem: dashboard
tags: [maintainer, policies, crud, dashboard]
dependency_graph:
  requires: []
  provides: [policy-crud-dashboard]
  affects: [dashboard-menu, dashboard-settings-store]
tech_stack:
  added: []
  patterns: [FAQ-pattern-replication, settings-store-extension, lucide-icon]
key_files:
  created:
    - apps/dashboard/app/components/PoliciesDefault.vue
    - apps/dashboard/app/components/FormPolicy.vue
    - apps/dashboard/app/scss/components/_policies.scss
    - apps/dashboard/app/pages/policies/index.vue
    - apps/dashboard/app/pages/policies/new.vue
    - apps/dashboard/app/pages/policies/[id]/index.vue
    - apps/dashboard/app/pages/policies/[id]/edit.vue
  modified:
    - apps/dashboard/app/stores/settings.store.ts
    - apps/dashboard/app/components/MenuDefault.vue
    - apps/dashboard/app/scss/app.scss
key_decisions:
  - Replicated FAQ pattern exactly — PoliciesDefault mirrors FaqsDefault, FormPolicy mirrors FormFaq
  - Removed BadgeDefault from policies table (no featured field); uses plain text for order column
  - Shield icon from lucide-vue-next chosen for Policies menu item
  - Tooltip global styles NOT duplicated in _policies.scss (already declared in _faqs.scss)
metrics:
  duration: 15m
  completed: "2026-04-04"
  tasks_completed: 2
  files_created: 7
  files_modified: 3
---

# Phase quick Plan 260404-mbi: Privacy Policy Maintainer in Dashboard Summary

Full CRUD maintainer for privacy policies in the dashboard using the FAQ pattern — policy list table with search/filter/pagination, create/edit form with title, text (richtext), and order fields, wired to Strapi `policies` endpoint.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create PoliciesDefault, FormPolicy, policies SCSS | e060632e | PoliciesDefault.vue, FormPolicy.vue, _policies.scss, app.scss |
| 2 | Create policy pages, extend settings store and sidebar menu | c7aa35f1 | 4 pages, settings.store.ts, MenuDefault.vue |

## What Was Built

### Components

**PoliciesDefault.vue** — Policy listing table replicating FaqsDefault pattern:
- Search by title/text, sort options, page size filter
- Table columns: ID, Título, Contenido, Orden (plain integer, no badge), Fecha, Acciones
- View/edit action buttons navigating to `/policies/{id}` and `/policies/{id}/edit`
- Wired to `settingsStore.policies` for persistent filter/pagination state
- Calls Strapi `policies` endpoint via `useApiClient`

**FormPolicy.vue** — Create/edit form replicating FormFaq pattern:
- Fields: title (required), text/richtext (required, rows=8), order (number, nullable)
- Yup validation schema with title/text required, order nullable number
- Edit mode: looks up by documentId filter, then falls back to numeric id
- PUT/POST to Strapi `policies` endpoint via `useApiClient`
- Emits `saved` event, navigates to detail page after success

### Pages

- `policies/index.vue` — List page with hero "Politicas de Privacidad" and "Agregar Politica" CTA
- `policies/new.vue` — Create page with FormPolicy
- `policies/[id]/index.vue` — Detail page showing title, text, order, and timestamps
- `policies/[id]/edit.vue` — Edit page with FormPolicy pre-filled from API

### Store Extension

`settings.store.ts` — Added `policies: SectionSettings` to:
- Interface `SettingsState`
- `const policies = ref<SectionSettings>`
- `getPoliciesFilters` computed getter
- `getSectionSettings` switch case
- Return object (state + getters)

### Menu Extension

`MenuDefault.vue` — Added Politicas link under Mantenedores:
- Shield icon imported from `lucide-vue-next`
- `isMantenedoresActive` computed includes `/policies`
- Auto-expand watch includes `/policies` path

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data is wired to Strapi `policies` endpoint via `useApiClient`.

## Self-Check: PASSED

Files verified:
- apps/dashboard/app/components/PoliciesDefault.vue — FOUND
- apps/dashboard/app/components/FormPolicy.vue — FOUND
- apps/dashboard/app/scss/components/_policies.scss — FOUND
- apps/dashboard/app/pages/policies/index.vue — FOUND
- apps/dashboard/app/pages/policies/new.vue — FOUND
- apps/dashboard/app/pages/policies/[id]/index.vue — FOUND
- apps/dashboard/app/pages/policies/[id]/edit.vue — FOUND

Commits verified:
- e060632e — FOUND (Task 1)
- c7aa35f1 — FOUND (Task 2)
