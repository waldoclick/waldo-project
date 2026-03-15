---
phase: 086
plan: "01"
subsystem: security
tags: [recaptcha, nitro-proxy, security, authentication]
dependency_graph:
  requires: []
  provides: [recaptcha-nitro-proxy]
  affects: [website-proxy, dashboard-proxy, website-forms, dashboard-forms]
tech_stack:
  added: []
  patterns: [header-based-token-validation, nitro-server-utilities]
key_files:
  created:
    - apps/website/server/utils/recaptcha.ts
    - apps/dashboard/server/utils/recaptcha.ts
    - apps/website/tests/server/recaptcha-proxy.test.ts
  modified:
    - apps/website/nuxt.config.ts
    - apps/dashboard/nuxt.config.ts
    - apps/website/server/api/[...].ts
    - apps/dashboard/server/api/[...].ts
    - apps/website/app/components/FormLogin.vue
    - apps/website/app/components/FormRegister.vue
    - apps/website/app/components/FormForgotPassword.vue
    - apps/website/app/components/FormResetPassword.vue
    - apps/website/app/components/FormContact.vue
    - apps/website/app/types/strapi.d.ts
    - apps/dashboard/app/components/FormLogin.vue
    - apps/dashboard/app/components/FormForgotPassword.vue
    - apps/dashboard/app/components/FormResetPassword.vue
    - apps/dashboard/app/types/strapi.d.ts
    - apps/website/tests/components/FormLogin.website.test.ts
decisions:
  - "verifyRecaptchaToken and isRecaptchaProtectedRoute extracted to server/utils/recaptcha.ts for testability"
  - "Import createError from h3 explicitly in utility (Nitro auto-import not available in Vitest context)"
  - "X-Recaptcha-Token header travels browser→Nuxt server (same origin, no CORS), then Nuxt→Strapi (server-to-server, CORS not applied) — no Strapi CORS config change needed"
  - "FormForgotPassword and FormResetPassword replaced useStrapiAuth() SDK calls with direct useStrapiClient() calls — SDK doesn't support custom headers"
  - "FormContact replaced strapi.create() with useStrapiClient() direct call for same reason"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-03-15"
  tasks_completed: 9
  files_modified: 15
  files_created: 3
---

# Phase 86 Plan 01: reCAPTCHA v3 Nitro Proxy Validation — Summary

**One-liner:** Moved reCAPTCHA v3 validation from Strapi middleware to Nuxt Nitro proxies — token travels as `X-Recaptcha-Token` header, validated and stripped at the proxy layer before reaching Strapi.

## What Was Built

- **`apps/website/server/utils/recaptcha.ts`** — Shared utility with `verifyRecaptchaToken()`, `isRecaptchaProtectedRoute()`, and `RECAPTCHA_PROTECTED_ROUTES` constant. Validates token against Google siteverify API (score threshold: > 0.5).
- **`apps/dashboard/server/utils/recaptcha.ts`** — Dashboard equivalent (auth-only protected routes: no `/contacts` or `/register`).
- **Both Nitro proxies** (`server/api/[...].ts`) — Intercept POST requests to protected routes, read `X-Recaptcha-Token` header, validate, and strip before proxying to Strapi.
- **8 frontend components** — Migrated from body-based `recaptchaToken` to `X-Recaptcha-Token` header. FormForgotPassword, FormResetPassword, and FormContact in both apps replaced SDK methods (`useStrapiAuth().forgotPassword/resetPassword`, `useStrapi().create`) with direct `useStrapiClient()` calls (SDK doesn't support custom request headers).
- **Both `strapi.d.ts` files** — Removed stale `recaptchaToken` augmentations from Strapi SDK type declarations.

## Protected Routes

| App | Routes |
|-----|--------|
| Website | `auth/local`, `auth/local/register`, `auth/forgot-password`, `auth/reset-password`, `contacts` |
| Dashboard | `auth/local`, `auth/forgot-password`, `auth/reset-password` |

## Tests

- **RCP-01:** Proxy rejects missing token (400) ✅
- **RCP-02:** Valid token (score > 0.5) passes ✅
- **RCP-03:** Low score token (score <= 0.5) rejected (400) ✅
- **RCP-04/05:** Protected routes list is correct ✅
- **FormLogin:** X-Recaptcha-Token header sent, recaptchaToken excluded from body ✅

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Explicit h3 import for `createError` in utility**
- **Found during:** Task 1.1 (running proxy tests)
- **Issue:** `createError` is a Nitro auto-import not available in Vitest environment; tests failed with `ReferenceError: createError is not defined`
- **Fix:** Added `import { createError } from 'h3'` explicitly to both `server/utils/recaptcha.ts` files. Since the test already mocks `h3`, the mock's `createError` is used in tests, and Nitro uses its own auto-import in production (explicit import doesn't conflict).
- **Files modified:** `apps/website/server/utils/recaptcha.ts`, `apps/dashboard/server/utils/recaptcha.ts`
- **Commit:** Part of `9026051` / `cc5c7dd`

## Pre-existing Test Failures (Out of Scope)

The following test files have failures that pre-date this plan (confirmed by audit):
- `app/components/FormLogin.spec.ts` — missing component stub
- `tests/components/FormRegister.test.ts` — `useAdAnalytics is not defined` in test stub
- `tests/components/ResumeOrder.test.ts` — missing component features
- `app/composables/useOrderById.test.ts` — pre-existing mock issues
- `waldo-dashboard` test suite — `vitest-environment-nuxt` incompatibility (pre-existing infrastructure issue)

These failures existed before this plan and are unrelated to reCAPTCHA migration.

## Self-Check

Files created/modified as expected:
- ✅ `apps/website/server/utils/recaptcha.ts` — exists
- ✅ `apps/dashboard/server/utils/recaptcha.ts` — exists
- ✅ `apps/website/tests/server/recaptcha-proxy.test.ts` — exists
- ✅ Both `nuxt.config.ts` files have `recaptchaSecretKey`
- ✅ Both proxy handlers import and call `verifyRecaptchaToken`
- ✅ All 8 form components migrated to header
- ✅ Both `strapi.d.ts` files cleaned up

Commits:
- ✅ `7ff150f` — chore(086-01): config + test scaffold
- ✅ `9026051` — feat(086-01): website proxy utility
- ✅ `cc5c7dd` — feat(086-02): dashboard proxy
- ✅ `33a80ca` — feat(086-03): website FormLogin
- ✅ `9ce3ed2` — feat(086-04): website FormRegister
- ✅ `8d69254` — feat(086-05): website FormForgotPassword/ResetPassword/Contact
- ✅ `eae7cef` — chore(086-06): website strapi.d.ts cleanup
- ✅ `ed383d7` — feat(086-07): dashboard form components
- ✅ `f415d1a` — chore(086-08): dashboard strapi.d.ts cleanup

## Self-Check: PASSED
