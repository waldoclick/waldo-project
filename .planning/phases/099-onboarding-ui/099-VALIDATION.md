---
phase: 099
slug: onboarding-ui
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-19
---

# Phase 099 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (happy-dom environment) |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `cd apps/website && yarn vitest run` |
| **Full suite command** | `cd apps/website && yarn vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/website && yarn vitest run`
- **After every plan wave:** Run `cd apps/website && yarn vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 099-00-01 | 00 | 0 | LAYOUT-02, LAYOUT-03, FORM-01, FORM-02, FORM-03, THANK-01, THANK-02, THANK-03 | scaffold | `cd apps/website && yarn vitest run tests/components/OnboardingDefault.test.ts tests/components/OnboardingThankyou.test.ts tests/components/FormProfile.onboarding.test.ts` | Wave 0 | ⬜ pending |
| 099-01-02 | 01 | 1 | FORM-02, FORM-03 | unit | `cd apps/website && yarn vitest run tests/components/FormProfile.onboarding.test.ts` | Wave 0 | ⬜ pending |
| 099-02-01 | 02 | 2 | LAYOUT-02, LAYOUT-03, FORM-01, THANK-01, THANK-02, THANK-03 | unit | `cd apps/website && yarn vitest run tests/components/OnboardingDefault.test.ts tests/components/OnboardingThankyou.test.ts` | Wave 0 | ⬜ pending |
| 099-02-02 | 02 | 2 | LAYOUT-01 | manual-only | N/A — layout structure verified by visual inspection | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/website/tests/components/OnboardingDefault.test.ts` — stubs for LAYOUT-02, FORM-01 (created by Plan 00)
- [x] `apps/website/tests/components/OnboardingThankyou.test.ts` — stubs for LAYOUT-03, THANK-01, THANK-02, THANK-03 (created by Plan 00)
- [x] `apps/website/tests/components/FormProfile.onboarding.test.ts` — stubs for FORM-02, FORM-03 (created by Plan 00)

*Wave 0 plan (099-00-PLAN.md) creates all three test stub files with it.todo() entries.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/onboarding` pages use layout with no header/footer | LAYOUT-01 | Layout slot rendering requires a real browser or full Nuxt test environment — vitest happy-dom does not render layout wrappers | Navigate to `/onboarding`, verify only Waldo logo visible with no header/footer/nav |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (Wave 0 plan created)
