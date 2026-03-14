---
quick_task: 38
slug: fix-dashboard-formresetpassword-missing-recaptchatoken
description: Fix dashboard FormResetPassword missing recaptchaToken in submit payload
date: 2026-03-14
commit: f377ac1
status: complete
---

# Quick Task 38 Summary

## What was done

Added `recaptchaToken: token` to the `resetPassword()` call in `apps/dashboard/app/components/FormResetPassword.vue`.

The form was executing `$recaptcha.execute("submit")` to obtain a token, but then discarding it — calling `resetPassword()` without `recaptchaToken`. Since `POST /api/auth/reset-password` is in Strapi's `protectedPostPaths`, the recaptcha middleware blocked every request with a 400 before the reset-password controller could run.

## Files changed

- `apps/dashboard/app/components/FormResetPassword.vue` — added `recaptchaToken: token` to `resetPassword()` parameters

## Commit

`f377ac1` fix: add recaptchaToken to dashboard FormResetPassword submit payload
