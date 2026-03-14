---
phase: quick-39
plan: "01"
subsystem: strapi-auth
tags: [email, mjml, registration, confirmation]
dependency_graph:
  requires: []
  provides: [branded-email-confirmation]
  affects: [users-permissions-extension, mjml-pipeline]
tech_stack:
  added: []
  patterns: [mjml-email-override, strapi-controller-factory-wrap]
key_files:
  created:
    - apps/strapi/src/services/mjml/templates/email-confirmation.mjml
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
    - apps/strapi/src/extensions/users-permissions/strapi-server.ts
decisions:
  - "Use APP_URL (not FRONTEND_URL) for confirmation link base — confirmation hits Strapi /api/auth/email-confirmation, not the frontend"
  - "overrideSendEmailConfirmation fully replaces native handler — no wrapping — to prevent double email on resend"
  - "registerUserLocal sends MJML after registration only when no JWT in response (email_confirmation enabled)"
metrics:
  duration: "2m 32s"
  completed_date: "2026-03-14"
  tasks_completed: 3
  tasks_total: 4
  files_created: 1
  files_modified: 2
---

# Quick Task 39: Email Confirmation MJML Override Summary

**One-liner:** Branded MJML email confirmation template replacing Strapi's default for both registration and resend flows via controller factory override.

## What Was Built

- **`email-confirmation.mjml`** — New branded template with orange CTA button, Spanish content, and Waldo.click® branding; uses `{{ name }}` and `{{ confirmationUrl }}` variables
- **`overrideSendEmailConfirmation`** — Full replacement controller for `POST /api/auth/send-email-confirmation` (resend flow); fetches user by email, sends MJML, silent-success for confirmed/blocked/unknown users
- **`registerUserLocal` update** — After registration, when `email_confirmation` is enabled (no JWT in response), fetches `confirmationToken` from DB and sends MJML confirmation email
- **`strapi-server.ts` wiring** — `instance.sendEmailConfirmation` set to the override in the auth factory wrapper

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create email-confirmation.mjml | b31ff64 | `apps/strapi/src/services/mjml/templates/email-confirmation.mjml` |
| 2 | Add overrideSendEmailConfirmation + update registerUserLocal | 9e32827 | `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` |
| 3 | Wire override into strapi-server.ts | d85e1f7 | `apps/strapi/src/extensions/users-permissions/strapi-server.ts` |

## Awaiting Human Verification (Task 4)

**Status:** Stopped at `checkpoint:human-verify` — tasks 1–3 complete, awaiting functional testing.

**IMPORTANT pre-test step:** In Strapi Admin Panel → Settings → Users & Permissions → Advanced Settings → Email templates → "Email address confirmation" — clear the body/content (or set to a single space) to prevent double emails on registration. The MJML override handles everything.

**Verification steps:**
1. Register a new user at https://waldo.click/registro with a real email address
2. Confirm the page redirects to /registro/confirmar with email shown
3. Check inbox — verify a branded Waldo.click® confirmation email arrived (NOT Strapi's default plain template)
4. Click the confirmation link — verify account is confirmed and you can log in
5. Register another test user → wait 60s → click "Reenviar enlace" on /registro/confirmar
6. Check inbox — verify the resend also uses the branded MJML template

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `apps/strapi/src/services/mjml/templates/email-confirmation.mjml` exists
- [x] `overrideSendEmailConfirmation` exported from authController.ts
- [x] `instance.sendEmailConfirmation` wired in strapi-server.ts
- [x] TypeScript compiles with zero errors (`yarn workspace waldo-strapi tsc --noEmit`)
- [x] Commits b31ff64, 9e32827, d85e1f7 exist

## Self-Check: PASSED
