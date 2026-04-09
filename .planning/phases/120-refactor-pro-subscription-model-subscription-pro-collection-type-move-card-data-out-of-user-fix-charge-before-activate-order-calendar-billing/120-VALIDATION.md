---
phase: 120
slug: refactor-pro-subscription-model-subscription-pro-collection-type-move-card-data-out-of-user-fix-charge-before-activate-order-calendar-billing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-08
---

# Phase 120 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | `apps/strapi/jest.config.js` |
| **Quick run command** | `cd apps/strapi && yarn jest --testPathPattern="subscription-pro"` |
| **Full suite command** | `cd apps/strapi && yarn jest` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/strapi && yarn jest --testPathPattern="subscription-pro"`
- **After every plan wave:** Run `cd apps/strapi && yarn jest`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 120-01-01 | 01 | 1 | subscription-pro schema | unit | `cd apps/strapi && yarn jest --testPathPattern="subscription-pro"` | ❌ W0 | ⬜ pending |
| 120-01-02 | 01 | 1 | tbk_user migration | unit | `cd apps/strapi && yarn jest --testPathPattern="subscription-pro"` | ❌ W0 | ⬜ pending |
| 120-02-01 | 02 | 2 | charge-before-activate fix | unit | `cd apps/strapi && yarn jest --testPathPattern="payment"` | ❌ W0 | ⬜ pending |
| 120-02-02 | 02 | 2 | pro boolean field removal | integration | `cd apps/strapi && yarn jest` | ❌ W0 | ⬜ pending |
| 120-03-01 | 03 | 3 | calendar billing verify | unit | `cd apps/strapi && yarn jest --testPathPattern="subscription-charge"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/tests/api/subscription-pro/subscription-pro.service.test.ts` — stubs for subscription-pro collection CRUD
- [ ] `apps/strapi/tests/api/payment/payment-pro-response.test.ts` — stubs for charge-before-activate fix
- [ ] `apps/strapi/tests/cron/subscription-charge.cron.test.ts` — stubs for calendar billing verification

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PRO subscription activation end-to-end | subscription-pro flow | Requires Webpay test credentials | Activate PRO with a test card, verify subscription-pro record created and user has no tbk_user field |
| Charge failure redirect | charge-before-activate | Requires simulating card charge failure | Simulate failed charge, verify user NOT activated and redirected to `/pro/error?reason=charge-failed` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
