---
phase: 080-password-reset-mjml-context-routing
verified: 2026-03-13T23:58:00Z
status: passed
score: 13/13 must-haves verified
re_verification: false
---

# Phase 080: Password Reset MJML + Context Routing — Verification Report

**Phase Goal:** Dashboard admins receive a branded MJML password reset email pointing to the dashboard's reset page; website users receive one pointing to the website's reset page
**Verified:** 2026-03-13T23:58:00Z
**Status:** ✅ PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `overrideForgotPassword` sends exactly one MJML email per request (`sendMjmlEmail` called once) | ✓ VERIFIED | Test: "calls sendMjmlEmail exactly once with reset-password template" — PASSES; impl wraps call in try/catch, never calls original |
| 2 | Email send failure does not propagate — ctx still returns `{ ok: true }` | ✓ VERIFIED | Test: "returns { ok: true } even when sendMjmlEmail throws" — PASSES; try/catch in authController.ts:398-408 |
| 3 | `context: 'website'` produces a resetUrl containing `FRONTEND_URL + 'restablecer-contrasena'` | ✓ VERIFIED | Test: "builds correct website reset URL" — PASSES; authController.ts:394 `"restablecer-contrasena"` |
| 4 | `context: 'dashboard'` produces a resetUrl containing `DASHBOARD_URL + 'auth/reset-password'` | ✓ VERIFIED | Test: "builds correct dashboard reset URL" — PASSES; authController.ts:394 `"auth/reset-password"` |
| 5 | Unknown or blocked user receives `{ ok: true }` silently (no email, no DB write) | ✓ VERIFIED | Tests: "returns { ok: true } silently for unknown email" + "for blocked user" — both PASS; authController.ts:378 |
| 6 | Token is saved to DB before `sendMjmlEmail` is called | ✓ VERIFIED | Test: "calls userUpdate before sendMjmlEmail" with callOrder guard — PASSES; authController.ts:383-386 (await update) before 399 (await sendMjmlEmail) |
| 7 | Missing context defaults to website URL (`FRONTEND_URL`) | ✓ VERIFIED | Test: "defaults to FRONTEND_URL path when context is undefined" — PASSES; authController.ts:388-391 ternary |
| 8 | `reset-password.mjml` renders with `{{ name }}` and `{{ resetUrl }}` variables | ✓ VERIFIED | File exists; line 2 `{{ name }}`, line 12 `href="{{ resetUrl }}"` |
| 9 | `reset-password.mjml` has an `mj-button` CTA pointing to `{{ resetUrl }}` | ✓ VERIFIED | reset-password.mjml lines 7-15: `<mj-button ... href="{{ resetUrl }}">` |
| 10 | Website `FormForgotPassword.vue` sends `context: 'website'` in the forgotPassword call body | ✓ VERIFIED | FormForgotPassword.vue:65 `context: "website"` inside existing `as any` cast |
| 11 | Dashboard `FormForgotPassword.vue` sends `context: 'dashboard'` in the forgotPassword call body | ✓ VERIFIED | FormForgotPassword.vue:64 `context: "dashboard"` with `as any` cast (line 65) |
| 12 | Strapi factory wired — `instance.forgotPassword = overrideForgotPassword()` | ✓ VERIFIED | strapi-server.ts:49 exact match |
| 13 | `DASHBOARD_URL` env var documented in `.env.example` | ✓ VERIFIED | .env.example:14 `DASHBOARD_URL=https://dashboard.waldo.click` |

**Score:** 13/13 truths verified

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` | `overrideForgotPassword` export | ✓ VERIFIED | Lines 365-411: full implementation exported, wired, tested |
| `apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts` | `describe("overrideForgotPassword")` with 10 test cases | ✓ VERIFIED | Lines 559-793: 10 `it()` cases — all PASS |
| `apps/strapi/src/extensions/users-permissions/strapi-server.ts` | Factory wire-up `instance.forgotPassword = overrideForgotPassword()` | ✓ VERIFIED | Line 49: exact assignment present |
| `apps/strapi/.env.example` | `DASHBOARD_URL=` entry | ✓ VERIFIED | Line 14: `DASHBOARD_URL=https://dashboard.waldo.click` |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/src/services/mjml/templates/reset-password.mjml` | MJML template with `{{ name }}` + `{{ resetUrl }}` | ✓ VERIFIED | 22-line template; extends base.mjml; mj-button with href="{{ resetUrl }}" |
| `apps/website/app/components/FormForgotPassword.vue` | `context: 'website'` in forgotPassword call | ✓ VERIFIED | Line 65; within existing `as any` cast |
| `apps/dashboard/app/components/FormForgotPassword.vue` | `context: 'dashboard'` with `as any` cast | ✓ VERIFIED | Lines 64-65; new `as any` cast added |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `strapi-server.ts` | `authController.ts` | `import { overrideForgotPassword }` | ✓ WIRED | strapi-server.ts:9 imports; :49 wires `instance.forgotPassword = overrideForgotPassword()` |
| `authController.ts overrideForgotPassword` | `sendMjmlEmail` | `sendMjmlEmail(strapi, 'reset-password', ...)` | ✓ WIRED | authController.ts:399-405: called with template `"reset-password"`, email, subject, `{ name, resetUrl }` |
| `authController.ts overrideForgotPassword` | `strapi.db.query(...).update` | saves `resetPasswordToken` before email | ✓ WIRED | authController.ts:383-386: `await strapi.db.query(...).update({ where: { id: user.id }, data: { resetPasswordToken } })` — before sendMjmlEmail at :399 |
| `reset-password.mjml` | `sendMjmlEmail(strapi, 'reset-password', ...)` | template name `'reset-password'` → file `reset-password.mjml` | ✓ WIRED | nunjucks.configure() auto-discovers; controller passes `"reset-password"` (authController.ts:401) |
| `FormForgotPassword.vue (website)` | `POST /api/auth/forgot-password` | `forgotPassword({ email, recaptchaToken, context: 'website' } as any)` | ✓ WIRED | website FormForgotPassword.vue:62-66 |
| `FormForgotPassword.vue (dashboard)` | `POST /api/auth/forgot-password` | `forgotPassword({ email, context: 'dashboard' } as any)` | ✓ WIRED | dashboard FormForgotPassword.vue:62-65 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PWDR-01 | 080-01, 080-02 | User receives a branded MJML email when requesting a password reset | ✓ SATISFIED | `overrideForgotPassword` calls `sendMjmlEmail` with `reset-password.mjml` template; non-fatal failure; silent for unknown/blocked users; token saved first |
| PWDR-02 | 080-01, 080-02 | Password reset email link points to website's reset page when requested from website | ✓ SATISFIED | `context: 'website'` → `${FRONTEND_URL}/restablecer-contrasena?token=…`; website FormForgotPassword.vue sends `context: 'website'` |
| PWDR-03 | 080-01, 080-02 | Password reset email link points to dashboard's reset page when requested from dashboard | ✓ SATISFIED | `context: 'dashboard'` → `${DASHBOARD_URL}/auth/reset-password?token=…`; dashboard FormForgotPassword.vue sends `context: 'dashboard'` |

**Orphaned requirements check:** No PWDR-0x IDs appear in REQUIREMENTS.md for phase 080 beyond PWDR-01/02/03. PWDR-04 is mapped to phase 079. All three PWDR requirements accounted for — none orphaned.

---

## Anti-Patterns Found

No anti-patterns found in phase files.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No TODOs, FIXMEs, stubs, or placeholder returns found | — | — |

**Note — Pre-existing test failures (out of scope):**
Two `verifyCode` tests (`VSTEP-04`) fail with `strapi.getModel is not a function` in the test mock. These failures pre-date phase 080 (confirmed in SUMMARY-01 "Deviations" section) and are unrelated to this phase's work. All 10 `overrideForgotPassword` tests PASS. 26/28 tests pass overall.

**Note — Dashboard recaptcha token discarded:**
`apps/dashboard/app/components/FormForgotPassword.vue` calls `$recaptcha.execute("submit")` but does not include `recaptchaToken` in the `forgotPassword` body (only `email` and `context: 'dashboard'` are sent). The token is computed but silently discarded. This is harmless to the phase goal and consistent with the plan specification ("Dashboard does NOT send `recaptchaToken` — that is intentional"). However, the `$recaptcha.execute` call itself is a deviation from the plan (plan showed no recaptcha usage in dashboard). Low severity — no functional impact.

---

## Human Verification Required

### 1. Email renders correctly in real email clients

**Test:** Trigger a forgot-password request from the website pointing to a real mailbox (e.g. staging environment). Open the received email.
**Expected:** Branded Waldo.click® email with orange `mj-button` CTA; link goes to `https://waldo.click/restablecer-contrasena?token=<token>`; no broken images or layout issues.
**Why human:** MJML rendering varies across email clients (Gmail, Outlook, Apple Mail). Cannot verify visually via grep.

### 2. Dashboard reset URL delivered correctly end-to-end

**Test:** Trigger forgot-password from the dashboard. Open received email.
**Expected:** Link goes to `https://dashboard.waldo.click/auth/reset-password?token=<token>`.
**Why human:** Requires live SMTP + DASHBOARD_URL env var configured in staging/production environment.

### 3. Token actually resets password on both reset pages

**Test:** Follow the reset link from each email context; submit a new password.
**Expected:** Password successfully updated; user can log in with new password.
**Why human:** Requires a functioning `/restablecer-contrasena` (website) and `/auth/reset-password` (dashboard) page that reads the `?token=` query param and calls Strapi's reset-password API — those pages are out of scope for phase 080 and may or may not exist.

---

## Commit Verification

All four phase commits confirmed present in git history:

| Commit | Message |
|--------|---------|
| `ca56ec0` | `test(080-01): add failing tests for overrideForgotPassword (RED)` |
| `17a2a27` | `feat(080-01): implement overrideForgotPassword and wire factory (GREEN)` |
| `c74b66d` | `feat(080-02): create reset-password.mjml MJML email template` |
| `8be0d3c` | `feat(080-02): add context routing to FormForgotPassword components` |

---

## Summary

Phase 080 goal is **fully achieved**. All seven artifacts exist, are substantive (no stubs), and are properly wired. The complete chain is verified:

1. **Frontend (website)** → sends `context: 'website'` in POST body
2. **Frontend (dashboard)** → sends `context: 'dashboard'` in POST body
3. **Strapi controller** (`overrideForgotPassword`) → reads `context`, generates token, saves to DB, builds context-aware URL, calls `sendMjmlEmail` with `'reset-password'` template
4. **MJML template** (`reset-password.mjml`) → extends branded base layout, renders `{{ name }}` + `mj-button` pointing to `{{ resetUrl }}`
5. **Factory wire-up** → `instance.forgotPassword = overrideForgotPassword()` registered in Strapi server bootstrap

All 10 `overrideForgotPassword` unit tests pass (10/10). PWDR-01, PWDR-02, PWDR-03 satisfied with implementation evidence.

Human verification of email rendering and end-to-end reset flow is recommended before releasing to production.

---

_Verified: 2026-03-13T23:58:00Z_
_Verifier: Claude (gsd-verifier)_
