---
quick_id: 260504-ue0
phase: 260504-ue0
plan: "01"
description: Email confirmation auto-resend + SSR verification
date: 2026-05-04
tags: [email-confirmation, ssr, strapi, nuxt, auth]
dependency_graph:
  requires: [260504-t98]
  provides: [email-confirmation-auto-resend, activar-ssr-compatible]
  affects: [apps/strapi, apps/website]
tech_stack:
  patterns:
    - crypto.randomBytes(64).toString("hex") for new confirmationToken generation
    - useAsyncData with discriminated union ConfirmationResult for SSR-safe page
    - onMounted for client-only side effects (Swal + navigateTo) — no import.meta.client needed
key_files:
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
    - apps/website/app/pages/registro/activar.vue
decisions:
  - "Return { resent: true } on already-confirmed token — distinct from { ok: true } so frontend can branch"
  - "Non-fatal email send catch — token persisted first, user can retry via /auth/send-email-confirmation"
  - "default: (): ConfirmationResult => ({ error: true }) typed annotation used to satisfy strict narrowing"
metrics:
  duration: "~10 minutes"
  completed_date: 2026-05-04
  tasks_completed: 2
  files_modified: 2
---

# Quick Task 260504-ue0: Email Confirmation Auto-Resend + SSR Verification Summary

**One-liner:** `overrideEmailConfirmation` now auto-resends a fresh MJML token when user is already confirmed (`{ resent: true }`); `/registro/activar.vue` rewritten as SSR-compatible page using `useAsyncData` with three-outcome discriminated union handling.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | overrideEmailConfirmation auto-resend branch | `0ad7d187` | `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` |
| 2 | Rewrite activar.vue SSR-compatible with three-outcome handling | `bcef2a18` | `apps/website/app/pages/registro/activar.vue` |

## Changes Made

### Task 1 — Strapi: overrideEmailConfirmation auto-resend

**File:** `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`

- Expanded `select` array in user lookup to include `email`, `username`, `firstname` (needed for email send)
- Replaced `badRequest("Token already used")` branch with auto-resend logic:
  - Generates new `confirmationToken` via `crypto.randomBytes(64).toString("hex")`
  - Persists new token to DB before sending email (same ordering pattern as `overrideForgotPassword`)
  - Sends MJML `email-confirmation` template via `sendMjmlEmail` (already imported)
  - Non-fatal `try/catch` — logs error but proceeds; token already saved
  - Returns `{ resent: true }` (200 OK) instead of 400 error
- Three terminal branches preserved: `badRequest` (missing/blocked), `{ resent: true }` (confirmed), `{ ok: true }` (unconfirmed → now confirmed)

### Task 2 — Website: activar.vue SSR-compatible rewrite

**File:** `apps/website/app/pages/registro/activar.vue`

- Removed bare `confirm()` function called at setup scope (client-only, caused hydration flash)
- Introduced `useAsyncData("activar-email-confirmation", ..., { default: (): ConfirmationResult => ({ error: true }) })` — runs during SSR
- Discriminated union type `ConfirmationResult = { ok: true } | { resent: true } | { error: true }` — strict TypeScript, no `any`
- Short-circuit: missing `confirmation` query → returns `{ error: true }` without HTTP call
- All errors inside callback collapsed to `{ error: true }` — SSR never throws
- `onMounted` handles all side effects (Swal + navigateTo) — client-only by definition in Nuxt 4
- Three Swal outcomes: success (`ok`), info (`resent`), error (missing/invalid)
- Template block unchanged

## Deviations from Plan

None — plan executed exactly as written. ESLint reformatted `ConfirmationResult` type to single line during pre-commit hook (cosmetic, no behavior change).

## Verification

- `cd apps/strapi && yarn tsc --noEmit` — clean
- `cd apps/website && yarn nuxt typecheck` — clean (site-config localhost warning is pre-existing, unrelated)
- `grep -c "ctx.send({ resent: true })" authController.ts` → 1

## Self-Check: PASSED

- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — FOUND, modified
- `apps/website/app/pages/registro/activar.vue` — FOUND, modified
- Commit `0ad7d187` — FOUND
- Commit `bcef2a18` — FOUND
