---
phase: quick-10
plan: 10
subsystem: website/forms
tags: [forms, validation, UX, security, negative-numbers]
dependency_graph:
  requires: [quick-9]
  provides: [complete-negative-number-prevention-in-ad-creation-form]
  affects: [FormCreateTwo, FormCreateFour]
tech_stack:
  added: []
  patterns: [HTML min attribute, Yup .min(0), DOM input sanitizer for paste events]
key_files:
  modified:
    - apps/website/app/components/FormCreateTwo.vue
    - apps/website/app/components/FormCreateFour.vue
decisions:
  - "Used input.value.replace(/^-+/, '') instead of Math.abs() to avoid NaN edge cases on partial inputs"
  - "handleDecimalInput only triggers when value starts with '-'; no-op otherwise (no unnecessary DOM writes)"
  - "Year .min(0) placed after .nullable() so null values still pass (year is optional)"
metrics:
  duration: "~2 minutes"
  completed_date: "2026-03-11"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Quick Task 10: Prevent Negative Numbers in Numeric Fields — Summary

**One-liner:** Added `min="0"` HTML attrs, Yup `.min(0)` for year, and `handleDecimalInput` paste sanitizer to seal all negative-number gaps left by quick task 9.

## What Was Done

Quick task 9 blocked the `-` key via keydown handlers. Three gaps remained that allowed negative values to enter through paste, autofill, or programmatic input. This task closes all three.

## Changes

### Task 1 — `apps/website/app/components/FormCreateTwo.vue`

**Commit:** `c4cbf74`

- Added `min="0"` HTML attribute to the price `<Field>`
- Complements existing `handlePriceKeydown` (blocks `-` key) and `handlePriceInput` (strips non-digits on paste via `/\D/g`)
- No Yup change needed — `.positive()` already rejects 0 and negatives

### Task 2 — `apps/website/app/components/FormCreateFour.vue`

**Commit:** `a60c014`

**Gap A — year HTML attribute:**
- Added `min="0"` to the year `<Field>` for browser-native guard

**Gap B — year Yup schema:**
- Added `.min(0, 'El año no puede ser negativo')` after `.nullable()` in the year Yup schema
- Blocks pasted negative values (e.g. `-2020`) that bypassed the keydown handler
- Placed after `.nullable()` so null/empty values still pass (year is optional)

**Gap C — decimal fields paste sanitizer:**
- Added `handleDecimalInput()` function that strips leading minus sign from `input.value` on paste/autofill
- Applied `@input="handleDecimalInput"` to all four decimal fields: weight, width, height, depth
- These fields already had `min="0"` HTML and Yup `.min(0)` — this closes the paste-timing gap where invalid value persisted in the DOM until submit

## Verification

- `yarn nuxt typecheck` — passed with zero TypeScript errors in both files
- ESLint (lint-staged) — passed on both commits
- Manual verification required (see plan):
  - Price: paste `-500` → shows `500` (handlePriceInput strips non-digits)
  - Year: paste `-2020` → Yup error "El año no puede ser negativo"; submit blocked
  - Weight/width/height/depth: paste `-5.5` → leading minus removed immediately; shows `5.5`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `apps/website/app/components/FormCreateTwo.vue` — modified (min="0" on price)
- [x] `apps/website/app/components/FormCreateFour.vue` — modified (min="0" on year, Yup .min(0), handleDecimalInput on all decimal fields)
- [x] Commit `c4cbf74` exists
- [x] Commit `a60c014` exists

## Self-Check: PASSED
