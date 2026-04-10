---
phase: quick
plan: 260409-ujs
subsystem: dashboard-menu
tags: [dashboard, menu, navigation, integrations, lucide]
dependency_graph:
  requires: []
  provides: [integrations-menu-section, integrations-route]
  affects: [MenuMain.vue, dashboard.vue]
tech_stack:
  added: []
  patterns: [rail-panel-menu-pattern, BEM-modifier-namespace]
key_files:
  created:
    - apps/dashboard/app/components/MenuIntegrations.vue
    - apps/dashboard/app/pages/integrations/index.vue
  modified:
    - apps/dashboard/app/components/MenuMain.vue
    - apps/dashboard/app/layouts/dashboard.vue
    - apps/dashboard/app/scss/components/_menu.scss
decisions:
  - Replicated MenuUsers.vue pattern verbatim for MenuIntegrations to maintain consistency
  - Added &--integrations SCSS block inside existing _menu.scss (no new CSS file)
  - Extended activeMenu union type in both MenuMain and dashboard.vue atomically
metrics:
  duration: ~5 minutes
  completed: 2026-04-09
  tasks_completed: 2
  files_created: 2
  files_modified: 3
---

# Phase quick Plan 260409-ujs: Add Integrations Section to Dashboard Summary

**One-liner:** Plug icon rail button + MenuIntegrations side panel + /integrations page wired into dashboard layout following the established rail+panel pattern.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update MenuMain and create MenuIntegrations | 7f614341 | MenuMain.vue, MenuIntegrations.vue, _menu.scss |
| 2 | Wire layout and create integrations page | 7f614341 | dashboard.vue, integrations/index.vue |

## What Was Built

- **MenuMain.vue** — Added `Plug` lucide icon button as fourth rail button. Prop and emit union types extended to include `"integrations"`. Active state (`menu--main__btn--active`) applies when `activeMenu === 'integrations'`.

- **MenuIntegrations.vue** — New component following MenuUsers.vue pattern exactly. Single `<li>` linking to `/integrations` with Plug icon and label "Integraciones". Emits `close` on route change via `watch({ immediate: true })`.

- **_menu.scss** — Added `&--integrations` block inside `.menu` block, duplicating `&--users` namespace verbatim. No visual changes, only BEM namespace added.

- **dashboard.vue** — Imported MenuIntegrations. `resolveActiveMenu` extended to return `"integrations"` for paths starting with `/integrations`. `activeMenu` ref type updated to include `"integrations"`. `<MenuIntegrations v-else-if="activeMenu === 'integrations'" @close="isSidebarOpen = false" />` added after MenuMaintenance block.

- **pages/integrations/index.vue** — Blank page with `HeroDefault title="Integraciones"`, breadcrumb `[{ label: "Integraciones" }]`, `layout: "dashboard"`.

## Deviations from Plan

None — plan executed exactly as written. Both tasks were committed in a single atomic commit because the pre-commit hook (prettier + eslint) ran across all staged files together.

## Verification

- `yarn nuxi typecheck` in apps/dashboard exits with 0 errors
- MenuMain renders 4 rail buttons (Dashboard / Usuarios / Mantenedores / Integraciones)
- Clicking Plug opens side panel with single "Integraciones" link
- Navigating to /integrations auto-activates the Plug button (menu--main__btn--active)
- Page at /integrations shows HeroDefault with title "Integraciones"

## Self-Check: PASSED

- MenuIntegrations.vue: FOUND
- integrations/index.vue: FOUND
- Commit 7f614341: FOUND
- TypeScript typecheck: 0 errors
