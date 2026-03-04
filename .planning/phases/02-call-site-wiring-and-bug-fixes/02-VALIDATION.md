---
phase: 2
slug: call-site-wiring-and-bug-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7.0 + ts-jest 29.2.5 |
| **Config file** | `apps/strapi/jest.config.js` |
| **Quick run command** | `cd apps/strapi && npx jest src/api/payment --no-coverage` |
| **Full suite command** | `cd apps/strapi && npx jest --no-coverage` |
| **TypeScript check** | `cd apps/strapi && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/strapi && npx jest src/api/payment --no-coverage`
- **After every plan wave:** Run `cd apps/strapi && npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | WIRE-01 | unit | `cd apps/strapi && npx jest src/api/payment/services/ad --no-coverage` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 0 | WIRE-02 | unit | `cd apps/strapi && npx jest src/api/payment/services/pack --no-coverage` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 0 | WIRE-03 | unit | `cd apps/strapi && npx jest src/api/payment/controllers --no-coverage` | ❌ W0 | ⬜ pending |
| 2-01-04 | 01 | 0 | WIRE-04 | unit | `cd apps/strapi && npx jest src/api/payment/controllers --no-coverage` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 1 | WIRE-01 | unit+compile | `cd apps/strapi && npx tsc --noEmit && npx jest src/api/payment/services/ad --no-coverage` | ✅ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | WIRE-02 | unit+compile | `cd apps/strapi && npx tsc --noEmit && npx jest src/api/payment/services/pack --no-coverage` | ✅ W0 | ⬜ pending |
| 2-02-03 | 02 | 1 | WIRE-03 | unit | `cd apps/strapi && npx jest src/api/payment/controllers --no-coverage` | ✅ W0 | ⬜ pending |
| 2-02-04 | 02 | 1 | WIRE-04 | unit | `cd apps/strapi && npx jest src/api/payment/controllers --no-coverage` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/src/api/payment/services/__tests__/ad.service.test.ts` — stubs for WIRE-01
- [ ] `apps/strapi/src/api/payment/services/__tests__/pack.service.test.ts` — stubs for WIRE-02
- [ ] `apps/strapi/src/api/payment/controllers/__tests__/payment.controller.test.ts` — stubs for WIRE-03, WIRE-04

Mock pattern for all service tests:
```typescript
jest.mock("../../../services/payment-gateway", () => ({
  getPaymentGateway: jest.fn().mockReturnValue({
    createTransaction: jest.fn().mockResolvedValue({
      success: true,
      gatewayRef: "ref-123",
      url: "https://webpay.cl",
    }),
    commitTransaction: jest.fn().mockResolvedValue({
      success: true,
      response: { status: "AUTHORIZED", buy_order: "order-123", amount: 1000 },
    }),
  }),
}));
```

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `payment_method` in live order record reflects `PAYMENT_GATEWAY` env var | WIRE-03 | Requires database write + read | Set `PAYMENT_GATEWAY=transbank`, complete a payment flow in dev, query the order record and confirm `payment_method` is `"transbank"` not `"webpay"` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
