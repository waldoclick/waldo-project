---
phase: 04-auth-tokens-base
plan: "05"
subsystem: website/auth
tags: [auth, register, restyle, lucide, scss, vue]
dependency_graph:
  requires: ["04-02", "04-03"]
  provides: ["AUTH-02", "TOK-03"]
  affects: ["apps/website/app/pages/registro/index.vue", "apps/website/app/pages/registro/confirmar.vue", "apps/website/app/components/FormRegister.vue"]
tech_stack:
  added: []
  patterns: ["lucide-vue-next icons", "dynamic :class binding for step-aware buttons", "form--register__steps BEM step indicator"]
key_files:
  created: []
  modified:
    - apps/website/app/pages/registro/index.vue
    - apps/website/app/pages/registro/confirmar.vue
    - apps/website/app/components/FormRegister.vue
decisions:
  - "Used dynamic :class binding on submit button to switch btn--secondary (step 1) / btn--primary (step 2) without duplicating button markup"
  - "Added IconArrowRight to Siguiente button to consume the import and match the mockup arrow"
  - "Did not remove the forgot-password help link — plan scope only required keeping the Inicia sesion link"
metrics:
  duration: "~8 minutes"
  completed: "2026-06-16"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 3
---

# Phase 04 Plan 05: Register Flow Restyle Summary

**One-liner:** 2-step register restyled to mockup: amber Google first, "o con tus datos" divider, step indicator pills, lucide Sparkles/ArrowRight/ChevronLeft icons, and step-aware amber/secondary buttons — behavior unchanged.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Reorder + restyle registro/index.vue | c56cb16d | apps/website/app/pages/registro/index.vue |
| 2 | Restyle FormRegister.vue (step indicator, generate, button classes) | 47da7480 | apps/website/app/components/FormRegister.vue |
| 3 | confirmar.vue lucide back link | a3be70e3 | apps/website/app/pages/registro/confirmar.vue |

## What Was Built

- **registro/index.vue:** Back link replaced with `<IconChevronLeft>` (lucide), subtitle "Empieza gratis · 3 anuncios incluidos" added, block reordered to: back-link → title → subtitle → social (Google) → separator "o con tus datos" → form fields → help. `mobileMenuClose` import removed.

- **FormRegister.vue:** Two amber-pill step indicator added at top of step 2 (`form--register__steps` + two `form--register__steps__pill` + `form--register__steps__label` "Paso 2 de 2 · acceso"). `✦` glyph replaced with `<IconSparkles :size="13">`. Submit button uses `:class` dynamic binding (`step === 1 ? 'btn--secondary' : 'btn--primary'`). `<IconArrowRight :size="16">` added inside Siguiente. All script logic (yup schemas, RUT formatting, RESERVED_USERNAMES guard, `/auth/local/register` call, email-confirmation branching) byte-identical to original.

- **confirmar.vue:** Back link replaced with `<IconChevronLeft :size="17" :stroke-width="2.2">`. `mobileMenuClose` import removed. Resend countdown logic untouched.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

Files exist:
- FOUND: apps/website/app/pages/registro/index.vue
- FOUND: apps/website/app/pages/registro/confirmar.vue
- FOUND: apps/website/app/components/FormRegister.vue

Commits exist:
- FOUND: c56cb16d
- FOUND: 47da7480
- FOUND: a3be70e3
