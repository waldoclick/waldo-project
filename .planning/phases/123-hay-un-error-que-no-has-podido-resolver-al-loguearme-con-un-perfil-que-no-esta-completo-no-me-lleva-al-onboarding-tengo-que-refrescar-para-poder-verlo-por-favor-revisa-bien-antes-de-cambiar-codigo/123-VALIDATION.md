---
phase: 123
slug: 123-hay-un-error-que-no-has-podido-resolver-al-loguearme-con-un-perfil-que-no-esta-completo-no-me-lleva-al-onboarding-tengo-que-refrescar-para-poder-verlo-por-favor-revisa-bien-antes-de-cambiar-codigo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 123 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @nuxt/test-utils |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace website test --run tests/middleware/ tests/components/` |
| **Full suite command** | `yarn workspace website test --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace website test --run tests/middleware/ tests/components/`
- **After every plan wave:** Run `yarn workspace website test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 123-01-01 | 01 | 1 | fix-navigateTo | unit | `yarn workspace website test --run tests/middleware/onboarding-guard.test.ts` | ✅ | ⬜ pending |
| 123-01-02 | 01 | 1 | fix-FormVerifyCode | unit | `yarn workspace website test --run tests/components/FormVerifyCode.test.ts` | ❌ W0 | ⬜ pending |
| 123-01-03 | 01 | 1 | fix-google | unit | `yarn workspace website test --run tests/components/form-verify-code.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/website/tests/middleware/onboarding-guard.test.ts` — fix broken mocks (add `useStrapiToken`, `useStrapiAuth`), fix `setReferer` removal, fix `startsWith` → `===` for `/onboarding/thankyou`

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Login with incomplete profile → redirected to /onboarding without refresh | root-cause fix | E2E flow requires real Strapi auth + browser | 1. Create user with incomplete profile. 2. Log in via email+code. 3. Confirm redirect to /onboarding happens without manual refresh. |
| Login via Google with incomplete profile → redirected to /onboarding | root-cause fix | E2E flow requires real Google OAuth + browser | 1. Create user via Google OAuth with incomplete profile. 2. Log in. 3. Confirm redirect to /onboarding without refresh. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
