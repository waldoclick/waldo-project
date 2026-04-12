---
phase: 260412-lm7
plan: "01"
subsystem: website
tags: [validation, form, yup, hard-cap]
key-files:
  modified:
    - apps/website/app/components/FormProfile.vue
decisions:
  - Event-based handler (event: Event) used for number fields instead of v-model watcher pattern because type="number" requires setting event.target.value to prevent momentary display of the 6th character
metrics:
  duration: "< 5 min"
  completed: "2026-04-12"
  tasks: 1
  files: 1
---

# Quick Task 260412-lm7: FormProfile — 5-char hard-cap on address_number fields

One-liner: Added dual-layer 5-char validation (yup `.max(5)` + `@input` hard-cap handler) to `address_number` and `business_address_number` fields in `FormProfile.vue`.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Add 5-char validation and hard-cap to address_number fields | d563c5f2 |

## Changes Made

### apps/website/app/components/FormProfile.vue

- Added `@input="handleAddressNumberInput"` to `address_number` Field (persona natural)
- Added `@input="handleBusinessAddressNumberInput"` to `business_address_number` Field (empresa)
- Updated yup schema for `address_number`: added `.max(5, "El Número de Dirección no puede tener más de 5 caracteres")`
- Updated yup schema for `business_address_number` `.when("is_company")` block: added `.max(5, "El Número de Dirección Empresa no puede tener más de 5 caracteres")` inside `then`
- Added `handleAddressNumberInput(event: Event)` handler: slices to 5 chars, assigns both `form.value.address_number` and `event.target.value`
- Added `handleBusinessAddressNumberInput(event: Event)` handler: same pattern for business field

## Deviations from Plan

None — plan executed exactly as written. The only minor adaptation: handlers typed as `(event: Event)` with `event.target as HTMLInputElement` cast, consistent with TypeScript strict mode. The plan's pseudocode showed `(event)` untyped but strict TS requires the cast.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/website/app/components/FormProfile.vue` exists and contains `.max(5` twice (address_number + business_address_number schemas)
- Commit d563c5f2 exists in git log
- Linter passed clean (no errors, no warnings)
