---
phase: 099
slug: onboarding-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| 099-01-01 | 01 | 0 | LAYOUT-02, FORM-01 | unit | `cd apps/website && yarn vitest run tests/components/OnboardingDefault.test.ts` | ❌ W0 | ⬜ pending |
| 099-01-02 | 01 | 0 | LAYOUT-03, THANK-01, THANK-02, THANK-03 | unit | `cd apps/website && yarn vitest run tests/components/OnboardingThankyou.test.ts` | ❌ W0 | ⬜ pending |
| 099-01-03 | 01 | 0 | FORM-02, FORM-03 | unit | `cd apps/website && yarn vitest run tests/components/FormProfile.onboarding.test.ts` | ❌ W0 | ⬜ pending |
| 099-02-01 | 02 | 1 | LAYOUT-01 | manual-only | N/A — layout structure verified by visual inspection | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/website/tests/components/OnboardingDefault.test.ts` — stubs for LAYOUT-02, FORM-01
- [ ] `apps/website/tests/components/OnboardingThankyou.test.ts` — stubs for LAYOUT-03, THANK-01, THANK-02, THANK-03
- [ ] `apps/website/tests/components/FormProfile.onboarding.test.ts` — stubs for FORM-02, FORM-03

*Existing infrastructure covers all framework requirements — no new framework setup needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/onboarding` pages use layout with no header/footer | LAYOUT-01 | Layout slot rendering requires a real browser or full Nuxt test environment — vitest happy-dom does not render layout wrappers | Navigate to `/onboarding`, verify only Waldo logo visible with no header/footer/nav |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
