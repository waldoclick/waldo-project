---
phase: 120
slug: refactor-pro-subscription-model-subscription-pro-collection-type-move-card-data-out-of-user-fix-charge-before-activate-order-calendar-billing
status: draft
nyquist_compliant: true
wave_0_complete: true
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
| 120-00-01 | 00 | 0 | Wave 0 stubs | unit | `cd apps/strapi && yarn jest --testPathPattern="subscription-pro\|payment-pro-response"` | Created by Plan 00 | ⬜ pending |
| 120-01-01 | 01 | 1 | subscription-pro schema | grep+jest | `cd apps/strapi && yarn jest --testPathPattern="subscription-pro" --no-coverage` | ✅ (W0 stub) | ⬜ pending |
| 120-01-02 | 01 | 1 | tbk_user migration | grep+jest | `cd apps/strapi && yarn jest --testPathPattern="subscription-pro" --no-coverage` | ✅ (W0 stub) | ⬜ pending |
| 120-02-01 | 02 | 2 | charge-before-activate fix | grep+jest | `cd apps/strapi && yarn jest --testPathPattern="payment-pro-response" --no-coverage` | ✅ (W0 stub) | ⬜ pending |
| 120-02-02 | 02 | 2 | charge-failed error page | grep | `grep -c "charge-failed" apps/website/app/pages/pro/error.vue` | N/A (frontend) | ⬜ pending |
| 120-03-01 | 03 | 2 | cron subscription-pro read | grep+jest | `cd apps/strapi && yarn jest --testPathPattern="subscription-charge" --no-coverage` | ✅ (existing) | ⬜ pending |
| 120-03-02 | 03 | 2 | cancellation + middleware | grep+jest | `cd apps/strapi && yarn jest --testPathPattern="pro-cancellation" --no-coverage` | ✅ (existing) | ⬜ pending |
| 120-04-01 | 04 | 3 | test updates | jest | `cd apps/strapi && yarn jest --testPathPattern="subscription-charge\|pro-cancellation" --no-coverage` | ✅ (existing) | ⬜ pending |
| 120-04-02 | 04 | 3 | migration test + middleware test + full sweep | jest | `cd apps/strapi && yarn jest --no-coverage` | Created by Plan 04 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/strapi/tests/api/subscription-pro/subscription-pro.service.test.ts` — stubs for subscription-pro collection CRUD (created by Plan 00)
- [x] `apps/strapi/tests/api/payment/payment-pro-response.test.ts` — stubs for charge-before-activate fix (created by Plan 00)
- [x] `apps/strapi/tests/cron/subscription-charge.cron.test.ts` — already exists, updated by Plan 04

*Wave 0 is covered by Plan 120-00.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PRO subscription activation end-to-end | subscription-pro flow | Requires Webpay test credentials | Activate PRO with a test card, verify subscription-pro record created and user has no tbk_user field |
| Charge failure redirect | charge-before-activate | Requires simulating card charge failure | Simulate failed charge, verify user NOT activated and redirected to `/pro/error?reason=charge-failed` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (Plan 120-00 creates stubs)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
