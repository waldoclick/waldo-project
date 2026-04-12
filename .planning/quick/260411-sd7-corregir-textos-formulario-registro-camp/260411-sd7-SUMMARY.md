---
phase: 260411-sd7
plan: "01"
subsystem: website
tags: [copy-fix, form-validation, spanish, yup]
dependency_graph:
  requires: []
  provides: [correct-registration-form-error-messages]
  affects: [apps/website/app/components/FormRegister.vue]
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - apps/website/app/components/FormRegister.vue
decisions:
  - "Only the three explicitly requested strings were changed; 'El Giro es requerida' was left untouched per CLAUDE.md 'never change Spanish UI labels' rule"
metrics:
  duration: "~2 minutes"
  completed: "2026-04-11"
  tasks_completed: 1
  files_modified: 1
---

# Phase 260411-sd7 Plan 01: Corregir textos formulario registro Summary

Three yup error message strings corrected in FormRegister.vue: typo "Appelido" → "Apellido", plus missing article "El" added to both RUT validation messages.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Fix Apellido typo and RUT messages in FormRegister.vue | b300acad |

## Changes Made

### apps/website/app/components/FormRegister.vue (lines 262, 271, 272)

1. `"El Appelido es requerido"` → `"El Apellido es requerido"` — fixed double-p typo
2. `.required("RUT es requerido")` → `.required("El RUT es requerido")` — added missing article
3. `.test("is-valid-rut", "RUT no es válido", ...)` → `.test("is-valid-rut", "El RUT no es válido", ...)` — added missing article

## Verification Results

```
grep -c "El Apellido es requerido" apps/website/app/components/FormRegister.vue   # 1
grep -c "El RUT es requerido"      apps/website/app/components/FormRegister.vue   # 1
grep -c "El RUT no es válido"      apps/website/app/components/FormRegister.vue   # 1
grep    "Appelido"                 apps/website/app/components/FormRegister.vue   # (no output)
grep    '"RUT es requerido"'       apps/website/app/components/FormRegister.vue   # (no output)
grep    '"RUT no es válido"'       apps/website/app/components/FormRegister.vue   # (no output)
yarn --cwd apps/website lint                                                       # Done (no errors)
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- File `apps/website/app/components/FormRegister.vue` exists and contains all three corrected strings.
- Commit `b300acad` exists in git log.
- Stale strings absent from file.
