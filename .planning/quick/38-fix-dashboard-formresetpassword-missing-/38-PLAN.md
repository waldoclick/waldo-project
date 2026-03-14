---
quick_task: 38
slug: fix-dashboard-formresetpassword-missing-recaptchatoken
description: Fix dashboard FormResetPassword missing recaptchaToken in submit payload
date: 2026-03-14
---

# Quick Task 38: Fix dashboard FormResetPassword missing recaptchaToken in submit payload

## Objective

`FormResetPassword.vue` in the dashboard executed `$recaptcha.execute()` but discarded the returned token — never passing `recaptchaToken` to `resetPassword()`. Since `/api/auth/reset-password` is in `protectedPostPaths`, the recaptcha middleware returned 400 before the controller ran, making password reset fail silently.

## Root Cause

Same pattern as quick task 36 (FormForgotPassword). The website's `FormResetPassword.vue` correctly passes `recaptchaToken: token`, but the dashboard copy did not.

## Fix

**File:** `apps/dashboard/app/components/FormResetPassword.vue`

Add `recaptchaToken: token` to the `resetPassword()` call in `onSubmit`.

## Tasks

1. Add `recaptchaToken: token` to `resetPassword()` call in `FormResetPassword.vue`
