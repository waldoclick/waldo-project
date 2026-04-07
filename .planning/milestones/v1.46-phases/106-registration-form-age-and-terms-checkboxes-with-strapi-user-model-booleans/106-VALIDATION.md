---
phase: 106
slug: registration-form-age-and-terms-checkboxes-with-strapi-user-model-booleans
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 106 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.0.9 (website) / Jest (Strapi) |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `cd apps/website && yarn test --run tests/components/FormRegister.test.ts` |
| **Full suite command** | `cd apps/website && yarn test --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/website && yarn test --run tests/components/FormRegister.test.ts`
- **After every plan wave:** Run `cd apps/website && yarn test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 106-01-01 | 01 | 1 | REG-01 | unit | `cd apps/website && yarn test --run tests/components/FormRegister.test.ts` | ✅ extend existing | ⬜ pending |
| 106-01-02 | 01 | 1 | REG-02 | unit | `cd apps/website && yarn test --run tests/components/FormRegister.test.ts` | ✅ extend existing | ⬜ pending |
| 106-01-03 | 01 | 1 | REG-03 | unit | `cd apps/strapi && yarn test --testPathPattern=authController` | ✅ extend existing | ⬜ pending |
| 106-01-04 | 01 | 2 | REG-04 | manual | Manual Strapi admin check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/website/tests/components/FormRegister.test.ts` — add `.oneOf` to yup `boolean()` mock chain; add test cases for required checkbox validation
- [ ] `apps/strapi/src/api/auth/controllers/authController.test.ts` — add test: missing/false `accepted_terms` returns 400; both true → registration proceeds

*Existing infrastructure covers framework needs. Only test extensions required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| New boolean fields stored in Strapi user record | REG-04 | Requires live Strapi + DB — no integration test harness in scope | Register a user via form, check Strapi admin panel that `accepted_age_confirmation` and `accepted_terms` are `true` on the user record |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
