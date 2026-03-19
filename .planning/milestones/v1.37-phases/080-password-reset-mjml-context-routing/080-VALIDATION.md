---
phase: 080
slug: password-reset-mjml-context-routing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 080 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7.0 + ts-jest |
| **Config file** | `apps/strapi/jest.config.js` |
| **Quick run command** | `yarn workspace waldo-strapi test --testPathPattern=authController` |
| **Full suite command** | `yarn workspace waldo-strapi test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace waldo-strapi test --testPathPattern=authController`
- **After every plan wave:** Run `yarn workspace waldo-strapi test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 080-01-01 | 01 | 0 | PWDR-01 | unit | `yarn workspace waldo-strapi test --testPathPattern=authController` | ❌ W0 | ⬜ pending |
| 080-01-02 | 01 | 1 | PWDR-01, PWDR-02, PWDR-03 | unit | `yarn workspace waldo-strapi test --testPathPattern=authController` | ❌ W0 | ⬜ pending |
| 080-01-03 | 01 | 1 | PWDR-01 | unit | `yarn workspace waldo-strapi test --testPathPattern=authController` | ❌ W0 | ⬜ pending |
| 080-02-01 | 02 | 1 | PWDR-02 | compile | `yarn workspace waldo-website typecheck` | ✅ | ⬜ pending |
| 080-02-02 | 02 | 1 | PWDR-03 | compile | `yarn workspace waldo-dashboard typecheck` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts` — add `overrideForgotPassword` describe block (file EXISTS; append new suite, do not remove existing tests)

*Existing infrastructure covers the test framework — only the test stubs are missing.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Branded MJML email renders correctly in email client | PWDR-01 | Email rendering requires visual inspection | Trigger forgot-password flow in staging, check received email renders correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
