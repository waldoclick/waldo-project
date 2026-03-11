---
phase: quick-9
plan: 9
subsystem: website/ad-creation-form
tags: [ux, validation, typescript, forms]
dependency_graph:
  requires: []
  provides: [numeric-field-enforcement]
  affects: [FormCreateTwo, FormCreateFour, ad-creation-flow]
tech_stack:
  added: []
  patterns: [keydown-event-blocking, inputmode-attribute, yup-integer-validation]
key_files:
  created: []
  modified:
    - apps/website/app/components/FormCreateTwo.vue
    - apps/website/app/components/FormCreateFour.vue
    - apps/website/app/stores/conditions.store.ts
    - apps/website/app/types/condition.d.ts
decisions:
  - handlePriceInput uses event parameter pattern for paste/autofill sanitization instead of watching form.value.price directly
  - Condition type updated from Strapi v4 attributes-wrapper format to Strapi v5 flat format (unblocked TypeScript)
metrics:
  duration: "354 seconds (~6 minutes)"
  completed: "2026-03-11"
  tasks_completed: 2
  files_modified: 4
---

# Quick Task 9: Restrict Numeric Fields in Ad Creation Form — Summary

**One-liner:** Keydown blocking for `e/E/+/-/.` on all number inputs in FormCreateTwo and FormCreateFour, with `inputmode` for mobile and Yup integer validation on year.

## What Was Done

### Task 1: Block non-numeric keys in FormCreateTwo (price field)
**Commit:** `fea8362`

- Added `lang="ts"` to the `<script setup>` tag
- Added `handlePriceKeydown` function that blocks `e`, `E`, `+`, `-`, `.` via `event.preventDefault()`
- Updated `handlePriceInput` with an `event: Event` parameter and paste/autofill sanitization using `input.value.replace(/[^\d]/g, '')`
- Added `inputmode="numeric"` and `@keydown="handlePriceKeydown"` to the price `<Field>`
- Typed the form ref explicitly (`price: number | string`, `category: number | string`) to fix implicit type inference issues
- Typed `handleSubmit` values parameter as `Record<string, unknown>` with proper casts to store update methods

### Task 2: Block non-numeric keys in FormCreateFour (year, weight, width, height, depth)
**Commit:** `b2b30bb`

- Added `lang="ts"` to the `<script setup>` tag
- Added `handleIntegerKeydown` blocking `e, E, +, -, .` (for year — no decimals)
- Added `handleDecimalKeydown` blocking `e, E, +, -` but allowing `.` (for weight, width, height, depth)
- Added `inputmode="numeric"` on the year field, `inputmode="decimal"` on dimension fields
- Added `@keydown="handleIntegerKeydown"` to year field
- Added `@keydown="handleDecimalKeydown"` to weight, width, height, depth fields
- Added `.integer("El año debe ser un número entero")` to year Yup schema
- Typed `handleSubmit` values parameter as `Record<string, unknown>` with proper casts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing TS types] Form ref type inference conflict in FormCreateTwo**
- **Found during:** Task 1 typecheck
- **Issue:** TypeScript inferred `form.price` as `string` (from initial `""`) causing type errors when assigning `number | ""` in handlers and `number` from store
- **Fix:** Explicitly typed the form ref with `price: number | string` and `category: number | string`
- **Files modified:** `apps/website/app/components/FormCreateTwo.vue`
- **Commit:** `fea8362`

**2. [Rule 1 - Bug] Condition type used Strapi v4 attributes wrapper instead of v5 flat format**
- **Found during:** Task 2 typecheck — `item.name` in template raised TS2339 because type defined `attributes.name`
- **Issue:** `Condition` interface had `attributes: { name, slug, ... }` (v4 pattern) but template and runtime data use flat `{ name, slug, ... }` (v5 pattern)
- **Fix:** Updated `Condition` type to flat Strapi v5 format; updated `getConditionBySlug` getter in `conditions.store.ts` to use `condition.slug` instead of `condition.attributes.slug`
- **Files modified:** `apps/website/app/types/condition.d.ts`, `apps/website/app/stores/conditions.store.ts`
- **Commit:** `b2b30bb`

## Key Decisions

- **Event-based handlePriceInput:** The original handler read `form.value.price` directly (no event parameter). Updated to accept `event: Event` and read `event.target.value` to enable paste/autofill sanitization with `replace(/[^\d]/g, '')`. This is the correct pattern for input sanitization.
- **Condition type migration:** Rather than suppressing the TypeScript error with a cast, migrated the `Condition` interface from Strapi v4 attributes format to v5 flat format, aligning with the `Category` type pattern already in use elsewhere in the project.

## Verification

- `yarn nuxt typecheck` passes with zero errors in FormCreateTwo.vue and FormCreateFour.vue
- All pre-commit hooks (prettier + eslint) pass for all modified files
- Keydown blocking covers: `e`, `E`, `+`, `-` on all numeric fields; `.` additionally blocked on integer-only fields (price, year)
- Decimal (`.`) allowed on dimension fields (weight, width, height, depth)
- Mobile users see numeric keypad via `inputmode="numeric"` on integer fields and `inputmode="decimal"` on decimal fields
- Year Yup schema includes `.integer()` as a fallback validation layer

## Self-Check: PASSED

Files verified:
- `apps/website/app/components/FormCreateTwo.vue` — FOUND (contains handlePriceKeydown, inputmode="numeric")
- `apps/website/app/components/FormCreateFour.vue` — FOUND (contains handleIntegerKeydown, handleDecimalKeydown)
- `apps/website/app/types/condition.d.ts` — FOUND (flat Condition type)
- `apps/website/app/stores/conditions.store.ts` — FOUND (uses condition.slug)

Commits verified:
- `fea8362` — FOUND (feat(quick-9): block non-numeric keys in price field)
- `b2b30bb` — FOUND (feat(quick-9): block non-numeric keys in year/dimensions fields)
