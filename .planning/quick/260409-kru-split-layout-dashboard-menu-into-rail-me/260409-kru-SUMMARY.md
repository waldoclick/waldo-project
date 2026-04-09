---
phase: quick-260409-kru
plan: 01
subsystem: dashboard-layout
tags: [layout, menu, sidebar, scss, vue]
key-files:
  modified:
    - apps/dashboard/app/components/MenuDefault.vue
    - apps/dashboard/app/layouts/dashboard.vue
    - apps/dashboard/app/scss/components/_layout.scss
    - apps/dashboard/app/scss/components/_menu.scss
  created:
    - (MenuMain.vue was already present from prior work)
decisions:
  - logo placed in layout--dashboard__menu__logo in dashboard.vue, not in MenuDefault
  - panels wrapper (layout--dashboard__menu__panels) added as flex-row container below logo
metrics:
  duration: ~10m
  completed: 2026-04-09
---

# Phase quick-260409-kru Plan 01: Split Dashboard Menu into Logo + Rail + Nav Summary

**One-liner:** Dashboard sidebar restructured into a column layout with a 64px logo header above a flex-row panels container holding a 48px icon rail and the full nav list.

## Tasks Completed

| Task | Name | Status |
|------|------|--------|
| 1 | Remove logo from MenuDefault.vue | Done |
| 2 | Create MenuMain.vue with 3 icon-only buttons | Pre-existing — verified correct |
| 3 | Update dashboard.vue layout structure | Done |
| 4 | Update SCSS — _layout.scss and _menu.scss | Done |

## Commits

| Hash | Message | Files |
|------|---------|-------|
| 889b104f | feat(quick-260409-kru): split dashboard menu into logo + rail + nav | MenuDefault.vue, dashboard.vue, _layout.scss, _menu.scss |

## Decisions Made

- Logo ownership moved to `dashboard.vue` (layout level) rather than staying in `MenuDefault.vue`, so the sidebar's structural chrome is controlled by the layout and MenuDefault is purely a nav list.
- `layout--dashboard__menu__panels` wraps the rail + nav as a flex-row, while `layout--dashboard__menu` switches to `flex-direction: column` so logo stacks above panels.
- `&--default__logo` SCSS block removed from `_menu.scss` since its HTML counterpart was deleted.
- `overflow-y: auto` removed from `&__menu` and moved to `&__menu__nav` so only the nav scrolls, not the whole sidebar.

## Deviations from Plan

### Pre-existing Work

`MenuMain.vue` and the `&--main` SCSS block in `_menu.scss` were already present before execution began. Similarly, `&__menu__rail` and `&__menu__nav` blocks existed in `_layout.scss`, and `MenuMain` was already imported in `dashboard.vue`. Only the logo div, the panels wrapper, and the `&--dashboard__menu` direction change were missing.

No unplanned changes were made.

## Known Stubs

None.

## Self-Check: PASSED

- MenuDefault.vue: `menu--default__logo` removed — confirmed
- MenuMain.vue: exists with 3 buttons and correct imports — confirmed
- dashboard.vue: contains `layout--dashboard__menu__logo`, `layout--dashboard__menu__panels`, `layout--dashboard__menu__rail`, `layout--dashboard__menu__nav` — confirmed
- _layout.scss: `&__menu` uses `flex-direction: column`, new logo/panels blocks added — confirmed
- _menu.scss: `&--default__logo` removed, `&--main` block present — confirmed
- TypeScript: no errors (`yarn nuxt typecheck` passed)
- Commit 889b104f: exists
