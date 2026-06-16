---
phase: 04-auth-tokens-base
plan: "04"
subsystem: website/auth
tags: [auth, login, ui, lucide, scss, vue]
dependency_graph:
  requires: ["04-02", "04-03"]
  provides: ["login-screen-restyled"]
  affects: ["apps/website/app/pages/login/index.vue", "apps/website/app/components/FormLogin.vue"]
tech_stack:
  added: []
  patterns: ["lucide-vue-next icon in back link", "btn--secondary for form submit", "Google-first ordering"]
key_files:
  created: []
  modified:
    - apps/website/app/pages/login/index.vue
    - apps/website/app/components/FormLogin.vue
decisions:
  - "Login submit uses btn--secondary (white) since Google button is now the amber primary CTA"
  - "Subtitle rendered as .auth__form__description (existing class, no new SCSS needed)"
  - "Separator moved between Google block and fields, text changed to 'o con tu correo'"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-16"
  tasks: 2
  files: 2
requirements: [AUTH-01, TOK-03]
---

# Phase 04 Plan 04: Login Screen Restyle Summary

**One-liner:** Login page reordered to Google-first with lucide ChevronLeft back link, subtitle, and white secondary submit button matching the auth.dc.html mockup.

## What Was Built

Restyled `pages/login/index.vue` and `FormLogin.vue` to match the `design/auth.dc.html` mockup for the login screen. No behavior, validation, or logic was changed.

### Task 1: Reorder + restyle login page markup

- Replaced `mobileMenuClose` img in back link with `<IconChevronLeft :size="17" :stroke-width="2.2" />` from `lucide-vue-next`
- Added subtitle `<p class="auth__form__description">Bienvenido de vuelta a Waldo.click®</p>` below the h1
- Moved `auth__form__social` (LoginWithGoogle) ABOVE `auth__form__fields` (FormLogin)
- Moved `auth__form__separator` BETWEEN the Google button and the fields
- Changed separator text from bare "o" to "o con tu correo"
- Removed unused `mobileMenuClose` import (Codacy compliance)
- All providers/SEO/middleware/structured-data logic left untouched

**Commit:** 350968fd

### Task 2: FormLogin submit becomes white secondary

- Changed submit button class from `btn btn--block btn--primary` to `btn btn--block btn--secondary`
- All script logic preserved: `handleSubmit`, `pendingToken`, `/auth/local` endpoint, `/login/verificar` redirect, resend confirmation flow, password toggle
- No inline styles added

**Commit:** 68ac82a7

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — login functionality is fully wired; only markup/class changes were made.

## Self-Check: PASSED

Files exist:
- FOUND: apps/website/app/pages/login/index.vue
- FOUND: apps/website/app/components/FormLogin.vue

Commits exist:
- FOUND: 350968fd
- FOUND: 68ac82a7
