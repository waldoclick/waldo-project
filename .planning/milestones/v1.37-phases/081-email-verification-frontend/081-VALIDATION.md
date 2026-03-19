---
phase: 081
slug: email-verification-frontend
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 081 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @nuxt/test-utils |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace waldo-website test` |
| **Full suite command** | `yarn workspace waldo-website test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace waldo-website test`
- **After every plan wave:** Run `yarn workspace waldo-website test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 081-01-01 | 01 | 1 | REGV-03 | unit | `yarn workspace waldo-website test` | ❌ W0 | ⬜ pending |
| 081-01-02 | 01 | 1 | REGV-04 | manual | see Manual-Only table | N/A | ⬜ pending |
| 081-02-01 | 02 | 1 | REGV-05 | unit | `yarn workspace waldo-website test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/website/tests/components/FormRegister.test.ts` — stubs for REGV-03 (redirect to `/registro/confirmar`, no `setToken(undefined)`)
- [ ] `apps/website/tests/components/FormLogin.website.test.ts` — stubs for REGV-05 (unconfirmed error shows resend section)

*Note: Dashboard FormLogin changes are tested via the website test suite patterns; no separate dashboard test framework for Vue components.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/registro/confirmar` shows user email address | REGV-04 | Requires actual registration flow | Complete registration → verify redirect, check email shown |
| Resend button visible with 60s countdown | REGV-04 | Timer-dependent UI | On `/registro/confirmar`, observe cooldown timer active on page load |
| Dashboard unconfirmed user sees resend option | REGV-05 | Requires unconfirmed account in Strapi | Login with unconfirmed account on dashboard, verify resend section visible |
| No auth state corruption after registration without JWT | REGV-03 | Requires email_confirmation toggle (Phase 082) | Post-Phase 082 activation: register new account, verify no auth cookie set |
