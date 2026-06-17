---
phase: 06-cierre-cuenta
plan: 02
subsystem: website/header
tags: [redesign, scss, header, sticky, blur, amber-cta]
dependency_graph:
  requires: []
  provides: [HDR-01]
  affects: [apps/website/app/components/HeaderDefault.vue, apps/website/app/scss/components/_header.scss]
tech_stack:
  added: []
  patterns: [BEM block--modifier__element, phase-04 SCSS tokens, sticky header with backdrop-filter]
key_files:
  modified:
    - apps/website/app/components/HeaderDefault.vue
    - apps/website/app/scss/components/_header.scss
decisions:
  - "Added header--default__inner wrapper div to apply max-width:1200px centering without constraining the full-bleed blur bar"
  - "Removed standalone __avatar block and AvatarDefault import — MenuUser handles avatar in plan 06-03"
  - "Scoped .btn--announcement amber styles under .header--default__announcement to override existing _button.scss rule without touching it"
  - "Plus icon added as default; Pencil retained for in-progress draft state (existing logic preserved)"
metrics:
  duration: 25min
  completed: "2026-06-17"
  tasks: 1
  files: 2
---

# Phase 06 Plan 02: Header Restyle Summary

**One-liner:** Sticky 70px header with backdrop-filter blur(14px), $line hairline, and amber $amber CTA pill using phase-04 tokens over an inner max-width:1200px container.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Restyle header--default to mockup, preserving all conditional slots | fd7e3e0d | HeaderDefault.vue, _header.scss |

## What Was Built

### HeaderDefault.vue
- Added `header--default__inner` wrapper div (`max-width:1200px; margin:0 auto; padding:0 32px; height:70px`) around `__left` and `__right` so the blur bar spans full-bleed while content is centered
- Removed `header--default__avatar` block and its `AvatarDefault` import (standalone avatar redundant; MenuUser owns avatar in 06-03)
- Removed unused `MobileBar` import
- Added `Plus as IconPlus` from lucide-vue-next as the default CTA icon; `IconPencil` retained for in-progress draft state
- All conditional slots preserved: `showSearch`, `showMenu`, `v-if="!user"` MenuAuth, `v-if="user"` MenuUser

### _header.scss
- `position: fixed` → `position: sticky; top: 0`
- Removed `padding: 20px` from `.header--default`; height comes from `__inner` at 70px
- `background: transparent` + `backdrop-filter: blur(14px) saturate(1.06)` + `-webkit-backdrop-filter: blur(14px) saturate(1.06)`
- `border-bottom: 1px solid $line` replaces `1px solid rgba(black, 0.1)`
- `__inner`: `max-width: 1200px; margin: 0 auto; padding: 0 32px; height: 70px; display: flex; align-items: center`
- `__logo img`: `height: 28px; width: auto` (removed `min-width: 140px` / `min-width: 120px`)
- `__right`: `margin-left: auto; gap: 14px`
- `__announcement .btn--announcement`: amber pill — `display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14.5px; color: $ink; background: $amber; padding: 11px 18px; border-radius: 4px` with hover `background: $amber_hover`
- Removed `__avatar` element styles
- Scroll modifiers (`--scrolled-dark`, `--scrolled-light`) preserved as-is

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written, with one clarification:

**Structural decision — `__inner` wrapper:** The plan mentions wrapping content so `max-width:1200` centering applies. The `__inner` div was added as the solution, with flex/sizing moved there from the outer `<header>`. This is the documented approach from the plan's action section.

### Known Limitation (noted for orchestrator)

The `--scrolled-dark` and `--scrolled-light` modifiers set `background-color: rgba(...)` which overrides the transparent+blur base after 50px scroll. This means the blur effect is partially overridden on scroll. Modifiers were preserved per plan instructions ("Keep the existing scroll modifier classes"). The orchestrator's pixel check may surface this as a visual deviation.

## Acceptance Criteria Results

| Criterion | Result |
|-----------|--------|
| `70px` in _header.scss ≥ 1 | 1 (PASS) |
| `backdrop-filter` in _header.scss ≥ 2 | 4 (PASS) |
| `1px solid $line` in _header.scss ≥ 1 | 1 (PASS) |
| `max-width: 1200px` in _header.scss ≥ 1 | 1 (PASS) |
| `showSearch` in HeaderDefault.vue ≥ 1 | 3 (PASS) |
| `MenuAuth` in HeaderDefault.vue ≥ 1 | 2 (PASS) |
| `MenuUser` in HeaderDefault.vue ≥ 1 | 2 (PASS) |
| No `box-shadow`/`transform: scale` added | 0 (PASS) |
| No static inline `style="..."` | none (PASS) |
| `npx nuxt typecheck` exit code | 0 (PASS) |

## Known Stubs

None.

## Self-Check: PASSED

Files exist:
- FOUND: apps/website/app/components/HeaderDefault.vue
- FOUND: apps/website/app/scss/components/_header.scss

Commits exist:
- FOUND: fd7e3e0d (feat(06-02): restyle HeaderDefault to mockup — sticky 70px bar, blur, amber CTA)
