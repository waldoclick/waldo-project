---
phase: 04-auth-tokens-base
plan: "07"
subsystem: website/auth/recovery
tags: [auth, lucide, recover, reset, visual]
dependency_graph:
  requires: ["04-02", "04-03"]
  provides: [recover-page-restyled, reset-page-restyled]
  affects: [recuperar-contrasena, restablecer-contrasena, FormForgotPassword, FormResetPassword]
tech_stack:
  added: []
  patterns: [lucide-vue-next icons in pages, auth__form__description paragraph class]
key_files:
  created: []
  modified:
    - apps/website/app/pages/recuperar-contrasena.vue
    - apps/website/app/pages/restablecer-contrasena.vue
    - apps/website/app/components/FormForgotPassword.vue
    - apps/website/app/components/FormResetPassword.vue
decisions:
  - "Adopted mockup button labels: Enviar enlace (forgot) and Guardar contraseña (reset) as required by must_haves"
  - "Kept existing h2 title Restablece tu contraseña on reset page (plan overrides mockup h2)"
  - "auth__form__description paragraph class added without SCSS — styling expected from 04-02/03 deps"
metrics:
  duration: "~10 min"
  completed: "2026-06-16T21:00:54Z"
  tasks: 3
  files_modified: 4
---

# Phase 04 Plan 07: Recover + Reset Screens Restyle Summary

Recover and reset pages updated with lucide ChevronLeft back links, mockup description copy, and dead-import cleanup; FormForgotPassword and FormResetPassword updated with correct button labels (Enviar enlace, Guardar contraseña) and lucide Sparkles replacing the ✦ literal in the generate-password button.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | recuperar-contrasena.vue lucide back + description + dead imports removed | f691c464 | recuperar-contrasena.vue |
| 2 | restablecer-contrasena.vue lucide back + description + dead vars removed | 754ee15b | restablecer-contrasena.vue |
| 3 | FormForgotPassword/FormResetPassword button labels + Sparkles icon | 3df0022a | FormForgotPassword.vue, FormResetPassword.vue |

## Deviations from Plan

None — plan executed exactly as written. Button label updates treated as required (must_haves truth: "amber 'Enviar enlace' button" and "amber 'Guardar contrasena' button"), not optional.

## Known Stubs

None.

## Gaps Noted (non-blocking)

- `.auth__form__description` class has no SCSS rule yet — paragraph renders unstyled until 04-02/04-03 parallel plans define it in `_auth.scss`.
- `PasswordStrength.vue` and FormResetPassword do not render a password helper note or repeat match note (mockup line 248/257). These are not present in existing code and out of scope for this plan.

## Self-Check: PASSED

Files modified:
- FOUND: apps/website/app/pages/recuperar-contrasena.vue
- FOUND: apps/website/app/pages/restablecer-contrasena.vue
- FOUND: apps/website/app/components/FormForgotPassword.vue
- FOUND: apps/website/app/components/FormResetPassword.vue

Commits:
- FOUND: f691c464
- FOUND: 754ee15b
- FOUND: 3df0022a
