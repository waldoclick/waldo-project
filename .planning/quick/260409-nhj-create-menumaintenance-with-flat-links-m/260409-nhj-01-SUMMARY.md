---
phase: 260409-nhj
plan: "01"
subsystem: dashboard-nav
tags: [navigation, menu, refactor, routing]
dependency_graph:
  requires: []
  provides: [MenuMaintenance, /maintenance/* routes]
  affects: [dashboard layout, MenuDefault, MenuMain]
tech_stack:
  added: []
  patterns: [BEM modifier encapsulation, activeMenu ref pattern, git mv renames]
key_files:
  created:
    - apps/dashboard/app/components/MenuMaintenance.vue
  modified:
    - apps/dashboard/app/components/MenuDefault.vue
    - apps/dashboard/app/components/MenuMain.vue
    - apps/dashboard/app/layouts/dashboard.vue
    - apps/dashboard/app/scss/components/_menu.scss
    - apps/dashboard/app/pages/maintenance/** (36 files renamed via git mv)
decisions:
  - activeMenu ref lives in dashboard.vue and flows down as prop to MenuMain; MenuMain emits select event
  - MenuMaintenance has no accordion — flat list only, per spec
  - Settings/Tag/FileCheck/Box/MapPin/Building/Newspaper/Scale/HelpCircle/Shield/ScrollText icons removed from MenuDefault (unused after section removal)
metrics:
  duration: "~20min"
  completed: "2026-04-09"
  tasks: 4
  files: 41
---

# Phase 260409-nhj Plan 01: Create MenuMaintenance with flat links — Summary

Split the dashboard nav into two panels: MenuDefault (core ops) and MenuMaintenance (all 9 maintenance/legal sections). The Mantenedores rail icon now toggles between panels; Dashboard and Usuarios icons restore MenuDefault.

## Tasks Completed

| # | Task | Commit |
|---|------|--------|
| 1 | Create MenuMaintenance.vue with flat 9-link list | 5e6e243e |
| 2 | git mv 9 page directories into pages/maintenance/ + update internal route refs | 5e6e243e |
| 3 | Strip Mantenedores + Legales sections from MenuDefault.vue | 5e6e243e |
| 4 | Wire MenuMain active state + dashboard.vue panel switching + _menu.scss styles | 5e6e243e |

## What Was Built

**MenuMaintenance.vue** — New SFC with flat `<ul class="menu--maintenance__list">` containing 9 NuxtLinks under the `menu--maintenance` BEM namespace. No accordion, no sublists. Emits `close` on route change (same contract as MenuDefault). Icons: Tag, FileCheck, Box, MapPin, Building, Newspaper, HelpCircle, Shield, ScrollText.

**9 page directories moved** via `git mv` (preserves rename history as `R` entries):
- articles, categories, communes, conditions, faqs, packs, policies, regions, terms
- All moved to `apps/dashboard/app/pages/maintenance/{section}/`
- Internal route refs updated: `to="/articles/new"` → `to="/maintenance/articles/new"`, template literals `:to="\`/section/${id}/edit\`"` → `/maintenance/section/`, breadcrumb `to:` paths updated. Strapi content-type identifiers in `apiClient(...)` calls untouched. Spanish labels untouched.

**MenuDefault.vue** — Removed Mantenedores `<li>` block (6 subitems), Legales `<li>` block (3 subitems), `isMantenedoresActive` computed, `isLegalesActive` computed, mantenedores + legales watch branches, and 11 unused icon imports (Settings, Tag, FileCheck, Box, MapPin, Building, Newspaper, Scale, HelpCircle, Shield, ScrollText).

**MenuMain.vue** — Added `activeMenu: "default" | "maintenance"` prop and `select` emit. Dashboard + Usuarios buttons emit `select("default")`. Mantenedores button emits `select("maintenance")` and receives `menu--main__btn--active` class when `activeMenu === "maintenance"`.

**dashboard.vue** — Added `activeMenu` ref (default `"default"`), imported MenuMaintenance, wired `<MenuMain :active-menu="activeMenu" @select="activeMenu = $event" />`, conditional rendering of MenuDefault vs MenuMaintenance.

**_menu.scss** — Added `&__btn--active` modifier inside `&--main` block; added full `&--maintenance` block mirroring `&--default` structure (flat only, no sublist rules).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/dashboard/app/components/MenuMaintenance.vue` — exists
- `apps/dashboard/app/pages/maintenance/categories/index.vue` — exists
- `apps/dashboard/app/pages/maintenance/articles/index.vue` — exists
- Commit `5e6e243e` — exists (41 files changed, 324 insertions, 235 deletions)
- `yarn nuxt typecheck` — passed (no TypeScript errors)
