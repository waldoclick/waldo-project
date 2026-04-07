---
phase: quick
plan: 260406-raw
subsystem: dashboard
tags: [responsive, scss, layout, mobile, bottom-tab-bar, BEM]
dependency_graph:
  requires: []
  provides: [mobile-layout, bottom-tab-bar]
  affects: [apps/dashboard]
tech_stack:
  added: []
  patterns: [BEM menu--mobile modifier, fixed bottom nav bar, screen-small mixin for show/hide, toolbar hidden via screen-small]
key_files:
  created:
    - apps/dashboard/app/components/MenuMobile.vue
  modified:
    - apps/dashboard/app/layouts/dashboard.vue
    - apps/dashboard/app/scss/components/_layout.scss
    - apps/dashboard/app/scss/components/_header.scss
    - apps/dashboard/app/scss/components/_menu.scss
    - apps/dashboard/app/scss/components/_toolbar.scss
decisions:
  - Fixed bottom tab bar (MenuMobile.vue) replaces slide-in sidebar on mobile — avoids z-index overlay complexity on phones
  - menu--mobile modifier lives in _menu.scss alongside --default — same BEM block, single file
  - Hamburger hidden on mobile via screen-small nested inside screen-large; toolbar hidden via _toolbar.scss screen-small
  - padding-bottom: 64px on layout__main at screen-small prevents content hiding behind bottom bar
metrics:
  duration: ~20min
  completed_date: "2026-04-06"
  tasks_completed: 7
  tasks_total: 7
  files_modified: 5
  files_created: 1
---

# Quick Task 260406-raw: Mobile Bottom Tab Bar for Dashboard Layout

**One-liner:** New MenuMobile.vue fixed bottom tab bar (BEM menu--mobile) replaces slide-in sidebar on phones; hamburger and toolbar hidden on mobile; layout gets 64px bottom padding to clear the bar.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Revert previous executor SCSS changes | ab584cd5 | _layout.scss, _header.scss, _menu.scss |
| 2 | Create MenuMobile.vue | ab584cd5 | MenuMobile.vue |
| 3 | Add menu--mobile SCSS to _menu.scss | ab584cd5 | _menu.scss |
| 4 | Add MenuMobile to dashboard.vue layout | ab584cd5 | dashboard.vue |
| 5 | Update _header.scss for mobile | ab584cd5 | _header.scss |
| 6 | Update _toolbar.scss hide on mobile | ab584cd5 | _toolbar.scss |
| 7 | Update _layout.scss padding-bottom on mobile | ab584cd5 | _layout.scss |

## Changes Made

### Reverted (Task 1)
Removed the 3 changes added by the previous executor:
- `width: 100vw` on `&__menu` inside `@include screen-small` in `_layout.scss`
- `@include screen-small` block with reduced padding in `_menu.scss`
- `justify-content: space-between` and nested `@include screen-small` padding in `_header.scss`

### MenuMobile.vue (Task 2)
New component at `apps/dashboard/app/components/MenuMobile.vue`. Root element is `<nav class="menu menu--mobile">`. Shows 6 nav items: Dashboard, Ordenes, Anuncios, Reservas, Usuarios, Configurar. Each item uses `isRouteActive()` to apply `menu--mobile__link--active`. No emits, no sidebar close behavior. Icons from lucide-vue-next (LayoutDashboard, ShoppingCart, FileText, Calendar, Users, Settings).

### _menu.scss (Task 3)
Added `&--mobile` modifier block after `&--default`. The modifier is `display: none` at desktop/tablet. Inside `@include screen-small` it becomes a fixed bottom bar: `position: fixed; bottom: 0; left: 0; right: 0; height: 64px`. Items use `flex: 1` to fill the bar equally. Links are column-flex with icon above and 10px label below.

### dashboard.vue (Task 4)
Added `<MenuMobile />` after `layout--dashboard__content` div. Imported `MenuMobile` from `@/components/MenuMobile.vue`. CSS handles showing it only on mobile.

### _header.scss (Task 5)
Inside the `@include screen-large` block, added a nested `@include screen-small` that sets `justify-content: flex-start` (so DropdownUser sits at left), `padding: 0 16px`, and `&__left { display: none }` to hide the hamburger button.

### _toolbar.scss (Task 6)
Added `@include screen-small { display: none; }` inside `&--default` to hide the entire toolbar on phones.

### _layout.scss (Task 7)
Inside the `@include screen-large` block's `&__main`, added `@include screen-small { padding-bottom: 64px; }` so page content does not hide behind the fixed bottom bar.

## Deviations from Plan

None — all 7 tasks executed exactly as specified.

## Verification

- `yarn nuxt typecheck --cwd apps/dashboard` passes (exit 0, only non-blocking localhost URL warning from nuxt-site-config)
- No TypeScript errors introduced

## Self-Check: PASSED

- MenuMobile.vue: FOUND at apps/dashboard/app/components/MenuMobile.vue
- Commit ab584cd5: FOUND
- _menu.scss menu--mobile block: present
- _layout.scss padding-bottom 64px at screen-small: present
- _toolbar.scss display:none at screen-small: present
- _header.scss screen-small block hiding hamburger: present
