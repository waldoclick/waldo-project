---
phase: quick-29
plan: 01
subsystem: dashboard/components
tags: [autocomplete, component, form, ux, refactor]
dependency_graph:
  requires: []
  provides: [InputAutocomplete.vue, _input.scss]
  affects: [FormGift.vue]
tech_stack:
  added: []
  patterns: [BEM input--autocomplete, hidden Field for vee-validate, mousedown.prevent + blur-timeout for dropdown selection]
key_files:
  created:
    - apps/dashboard/app/components/InputAutocomplete.vue
    - apps/dashboard/app/scss/components/_input.scss
  modified:
    - apps/dashboard/app/scss/app.scss
    - apps/dashboard/app/components/FormGift.vue
decisions:
  - "Hidden <Field> used to bridge InputAutocomplete v-model with vee-validate schema validation for userId"
  - "mousedown.prevent + 150ms blur timeout ensures dropdown item selection fires before blur closes dropdown"
  - "form__group--upload modifier applied to autocomplete group so form__label renders position:static per AGENTS.md rule"
metrics:
  duration: "~4 minutes"
  completed_date: "2026-03-13"
  tasks_completed: 3
  files_changed: 4
---

# Quick Task 29: InputAutocomplete Vue Component — Summary

## One-liner

Reusable `InputAutocomplete.vue` with filtered dropdown that only emits on selection, replacing the two-field search+select pattern in `FormGift.vue`.

## What Was Built

### InputAutocomplete.vue
- Text input with BEM classes `input input--autocomplete` (root) and `form__control` (input element)
- Real-time filtering of `options` prop as user types (case-insensitive substring match)
- Dropdown (`input--autocomplete__dropdown`) with items (`input--autocomplete__dropdown__item`)
- "Sin resultados" empty state (`input--autocomplete__empty`) when no matches
- Only emits `update:modelValue` when user clicks/selects a list item — free text alone does NOT emit
- `@mousedown.prevent` + 150ms blur timeout ensures reliable selection before dropdown closes
- Watches `modelValue` prop: resets internal query display when parent clears to `''`

### _input.scss
- BEM SCSS file for `input--autocomplete` block with dropdown, item, and empty state styles
- Uses `$charcoal` and `$platinum` variables from project's `_variables.scss`
- Absolute positioning for dropdown, `z-index: 10`, `max-height: 200px` with scroll

### app.scss
- Added `@use "components/input"` import after the `upload` line

### FormGift.vue (refactored)
- Removed `userSearch` ref and `filteredUsers` computed (filtering now internal to `InputAutocomplete`)
- Added `userOptions` computed that maps `IAuthUser[]` to `{ label, value }[]`
- Replaced two `form__group` divs (search input + Field select) with single `form__group form__group--upload`
- Hidden `<Field name="userId" v-model="form.userId" type="hidden" />` bridges autocomplete value into vee-validate schema
- `form.userId` reset on `isOpen` watch still works — `InputAutocomplete` watcher on `modelValue` clears query display

## Commits

| Hash | Description |
|------|-------------|
| `75dfd0c` | feat(quick-29-01): create InputAutocomplete.vue component |
| `71549d8` | feat(quick-29-01): add _input.scss with input--autocomplete BEM styles |
| `a079dc0` | refactor(quick-29-01): replace two-field pattern in FormGift with InputAutocomplete |

## Verification

- `yarn nuxt typecheck` in `apps/dashboard` passes with no new errors
- `yarn nuxt build` completes successfully with SCSS compiling without errors
- All BEM classes follow AGENTS.md conventions: block `input`, modifier `autocomplete`, element nesting under modifier namespace

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All files confirmed present on disk. All 3 task commits verified in git log.
