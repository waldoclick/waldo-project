---
phase: 104
slug: cancellation-account-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 104 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (Strapi) + Vitest (website) |
| **Config file** | `apps/strapi/jest.config.ts` |
| **Quick run command** | `yarn workspace apps/strapi test --testPathPattern="pro-cancellation\|oneclick.service\|subscription-charge"` |
| **Full suite command** | `yarn workspace apps/strapi test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace apps/strapi test --testPathPattern="pro-cancellation|oneclick.service|subscription-charge"`
- **After every plan wave:** Run `yarn workspace apps/strapi test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 104-01-01 | 01 | 1 | CANC-01 | unit | `yarn workspace apps/strapi test --testPathPattern="pro-cancellation"` | ❌ W0 | ⬜ pending |
| 104-01-02 | 01 | 1 | CANC-02 | unit | `yarn workspace apps/strapi test --testPathPattern="pro-cancellation"` | ❌ W0 | ⬜ pending |
| 104-01-03 | 01 | 1 | CANC-03 | unit | `yarn workspace apps/strapi test --testPathPattern="oneclick.service"` | Partial | ⬜ pending |
| 104-01-04 | 01 | 1 | CANC-04 | unit | `yarn workspace apps/strapi test --testPathPattern="subscription-charge"` | Partial | ⬜ pending |
| 104-02-01 | 02 | 2 | FRNT-03 | manual | N/A | ❌ W0 | ⬜ pending |
| 104-02-02 | 02 | 2 | FRNT-04 | manual | N/A | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/src/api/payment/services/__tests__/pro-cancellation.service.test.ts` — stubs for CANC-01, CANC-02
- [ ] Additional test cases in `apps/strapi/src/services/oneclick/tests/oneclick.service.test.ts` — covers CANC-03 (`deleteInscription` method)
- [ ] Additional test cases in `apps/strapi/src/cron/subscription-charge.cron.test.ts` — covers CANC-04 (expired cancelled sweep)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Account page shows subscription status, card info, next charge date | FRNT-03 | Visual/layout verification | Navigate to /cuenta as PRO user, verify status badge, masked card number, and next charge date are visible |
| Cancel button visible only for active subscribers | FRNT-04 | UI conditional rendering | Check button appears for `pro_status: active`, hidden for `cancelled` and `inactive` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
