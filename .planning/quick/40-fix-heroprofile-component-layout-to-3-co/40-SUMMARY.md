---
phase: quick-40
plan: 01
subsystem: website/components
tags: [layout, scss, grid, account, vue]
dependency_graph:
  requires: []
  provides: [AccountMain 2-column announcements banner]
  affects: [apps/website/app/components/AccountMain.vue, apps/website/app/scss/components/_account.scss]
tech_stack:
  added: []
  patterns: [CSS Grid 2-column layout, BEM __text wrapper element]
key_files:
  modified:
    - apps/website/app/components/AccountMain.vue
    - apps/website/app/scss/components/_account.scss
decisions:
  - Grid replaces flex on __announcements: `1fr auto` gives text full available width while button takes natural size, eliminating need for `margin-left: auto` hack
  - __text wrapper groups __own + __pack as a single flex-column container so they stack vertically as a unit within the left grid column
  - box-shadow hover rule removed from __announcements per AGENTS.md prohibition on box-shadow additions
metrics:
  duration: "< 5 minutes"
  completed: "2026-03-14"
  tasks_completed: 2
  files_changed: 2
---

# Quick-40: Fix AccountMain Announcements Banner to 2-Column Grid Layout

**One-liner:** CSS grid (`1fr auto`) replaces flex on `.account--main__announcements`, with a new `__text` wrapper grouping ad-count and promo text on the left and the Comprar button on the right.

## What Was Done

Refactored the AccountMain.vue announcements banner from a 3-sibling flex row to a 2-column grid layout. The ad count text (`__own`) and promo text (`__pack`) are now grouped inside a new `__text` wrapper div that occupies the left grid column (`1fr`), while the "Comprar" button sits in the right column (`auto`). On mobile (≤768px) the grid collapses to a single column so all elements stack vertically.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Wrap `__own` and `__pack` in `__text` div in AccountMain.vue | 2898d11 |
| 2 | Update `_account.scss` to grid layout with `__text` child element | 2898d11 |

## Changes Made

### AccountMain.vue
- Added `<div class="account--main__announcements__text">` wrapper around `__own` and `__pack`
- `.btn--buy` nuxt-link remains a direct sibling of `__text` (second grid column)
- No script or other template changes

### _account.scss (`&__announcements`)
- `display: flex` → `display: grid; grid-template-columns: 1fr auto`
- Mobile breakpoint: `grid-template-columns: 1fr` (single column stacking)
- Removed `flex-direction: column; align-items: flex-start` from mobile (grid handles it)
- Added `&__text { display: flex; flex-direction: column; gap: 12px; }`
- Removed `max-width: 300px` from `&__own` (grid column handles width)
- Removed `margin-left: auto` from `.btn--buy` (grid placement handles it)
- Removed `&:hover { box-shadow: ... }` rule (prohibited by AGENTS.md)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- ✅ `account--main__announcements__text` wrapper exists in AccountMain.vue (line 20)
- ✅ `grid-template-columns: 1fr auto` present in _account.scss (line 56)
- ✅ `margin-left: auto` removed from `.btn--buy` in announcements context
- ✅ `box-shadow` hover rule removed
- ✅ Commit 2898d11 exists and passes pre-commit hooks (Prettier + ESLint)
