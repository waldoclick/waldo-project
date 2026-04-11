---
phase: quick-260411-m0h
plan: 01
subsystem: auth-forms
tags: [validation, security, ux, website, dashboard]
dependency_graph:
  requires: []
  provides: [MAXLEN-01]
  affects: [website-auth, dashboard-auth]
tech_stack:
  added: []
  patterns: [dual-layer-validation, yup-max, html-maxlength]
key_files:
  created: []
  modified:
    - apps/website/app/components/FormLogin.vue
    - apps/website/app/components/FormRegister.vue
    - apps/website/app/components/FormForgotPassword.vue
    - apps/website/app/components/FormResetPassword.vue
    - apps/dashboard/app/components/FormLogin.vue
    - apps/dashboard/app/components/FormForgotPassword.vue
    - apps/dashboard/app/components/FormResetPassword.vue
decisions:
  - Dual-layer enforcement: HTML maxlength stops input at browser level, yup .max() validates server-side submission
  - FormRegister password max updated from 20 to 50 to match unified 50-char rule across all auth forms
  - FormVerifyCode already had maxlength="6" and uses regex-based validation (no yup schema) - left unchanged
metrics:
  duration: 10m
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_modified: 7
---

# Quick 260411-m0h: Add maxlength limits to all auth form inputs

Dual-layer maxlength enforcement (HTML attribute + yup .max()) added to all 8 auth form components across website and dashboard apps.

## What Was Built

All auth form inputs now enforce character limits at two levels:
1. **HTML `maxlength` attribute** — browser stops further input immediately
2. **Yup `.max()` schema validation** — server-side form submission blocked if limit exceeded

### Limits Applied

| Field | Limit | Forms |
|-------|-------|-------|
| email | 254 | FormLogin (both), FormRegister, FormForgotPassword (both), FormResetPassword (both) |
| password | 50 | FormLogin (both), FormRegister, FormResetPassword (both) |
| confirm_password | 50 (HTML only) | FormRegister |
| firstname | 50 | FormRegister |
| lastname | 50 | FormRegister |
| rut | 12 | FormRegister |
| code (verify) | 6 | FormVerifyCode (already present, unchanged) |

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add maxlength to website auth forms (4 files) | 5205b28a | FormLogin.vue, FormRegister.vue, FormForgotPassword.vue, FormResetPassword.vue |
| 2 | Add maxlength to dashboard auth forms (4 files) | f54d390f | FormLogin.vue, FormForgotPassword.vue, FormResetPassword.vue (FormVerifyCode unchanged) |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- All 7 modified files exist and were committed
- Commits 5205b28a and f54d390f verified in git log
- grep confirms all maxlength attributes and .max() yup calls are present
