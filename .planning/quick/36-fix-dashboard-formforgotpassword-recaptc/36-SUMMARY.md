---
phase: 36-fix-dashboard-formforgotpassword-recaptc
plan: 36
type: quick
subsystem: dashboard/auth
tags: [recaptcha, forgot-password, dashboard, bug-fix]
dependency_graph:
  requires: []
  provides: [recaptchaToken in dashboard forgotPassword payload]
  affects: [apps/dashboard/app/components/FormForgotPassword.vue]
tech_stack:
  added: []
  patterns: [recaptchaToken forwarding in forgotPassword payload]
key_files:
  created: []
  modified:
    - apps/dashboard/app/components/FormForgotPassword.vue
decisions:
  - "Added recaptchaToken: token to forgotPassword payload — mirrors website implementation"
metrics:
  duration: "2 minutes"
  completed: "2026-03-14"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 36: Fix Dashboard FormForgotPassword reCAPTCHA Token

**One-liner:** Add missing `recaptchaToken: token` to dashboard forgotPassword payload so Strapi middleware accepts the request.

## What Was Done

The `FormForgotPassword.vue` component in the dashboard was obtaining a reCAPTCHA token via `$recaptcha.execute("submit")` but never including it in the `forgotPassword()` POST body. The Strapi `recaptcha.ts` middleware validates the token on every forgot-password request — without it, every request was being rejected, making password recovery completely broken for dashboard users.

## Fix Applied

**File:** `apps/dashboard/app/components/FormForgotPassword.vue`

Added `recaptchaToken: token` between `email` and `context` in the `forgotPassword` call:

```typescript
// Before (broken)
await forgotPassword({
  email: values.email as string,
  context: "dashboard",
} as any);

// After (fixed)
await forgotPassword({
  email: values.email as string,
  recaptchaToken: token,
  context: "dashboard",
} as any);
```

The `token` variable was already declared on the line above — it just wasn't being forwarded.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add recaptchaToken to dashboard forgotPassword payload | ac77641 | apps/dashboard/app/components/FormForgotPassword.vue |

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `grep -n "recaptchaToken" apps/dashboard/app/components/FormForgotPassword.vue` returns line 64: `recaptchaToken: token`
- Dashboard and website FormForgotPassword.vue now pass the same fields to `forgotPassword` (email, recaptchaToken, context — differing only in context value)

## Self-Check: PASSED

- [x] `apps/dashboard/app/components/FormForgotPassword.vue` modified with `recaptchaToken: token`
- [x] Commit `ac77641` exists in git log
- [x] ESLint and Prettier passed (pre-commit hook ran successfully)
