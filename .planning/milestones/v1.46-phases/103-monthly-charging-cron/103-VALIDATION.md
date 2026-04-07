---
phase: 103
slug: monthly-charging-cron
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 103 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7.0 + ts-jest |
| **Config file** | `apps/strapi/jest.config.js` |
| **Quick run command** | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` |
| **Full suite command** | `cd apps/strapi && yarn test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/strapi && yarn test --testPathPattern=subscription-charge`
- **After every plan wave:** Run `cd apps/strapi && yarn test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 103-01-01 | 01 | 1 | CHRG-01 | unit | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` | ❌ W0 | ⬜ pending |
| 103-01-02 | 01 | 1 | CHRG-02 | unit | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` | ❌ W0 | ⬜ pending |
| 103-01-03 | 01 | 1 | CHRG-03 | unit | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` | ❌ W0 | ⬜ pending |
| 103-01-04 | 01 | 1 | CHRG-04 | unit | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` | ❌ W0 | ⬜ pending |
| 103-01-05 | 01 | 1 | CHRG-05 | unit | `cd apps/strapi && yarn test --testPathPattern=subscription-charge` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/src/cron/subscription-charge.cron.test.ts` — stubs for CHRG-01 through CHRG-05
- [ ] `apps/strapi/src/services/oneclick/tests/oneclick.service.test.ts` — extend with `authorizeCharge` tests

*Existing infrastructure covers test framework — no new packages needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cron runs at 5 AM daily | CHRG-01 | Cron scheduling is config-based, not unit-testable | Verify `cron-tasks.ts` registers at `0 5 * * *` |
| Transbank sandbox authorize call | CHRG-02 | External API call | Use cron-runner API with sandbox credentials |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
