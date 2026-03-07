---
phase: 1
slug: interface-and-adapter-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-03
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7.0 + ts-jest 29.2.5 |
| **Config file** | `apps/strapi/jest.config.js` |
| **Quick run command** | `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage` |
| **Full suite command** | `cd apps/strapi && npx tsc --noEmit && npx jest src/services/payment-gateway --no-coverage` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage`
- **After every plan wave:** Run `cd apps/strapi && npx tsc --noEmit && npx jest src/services/payment-gateway --no-coverage`
- **Before `/gsd:verify-work`:** Full TypeScript compile + payment-gateway tests green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| W0-test-stub | 01 | 0 | PAY-01..05 | unit | `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage` | ❌ W0 | ⬜ pending |
| interface-types | 01 | 1 | PAY-01, PAY-02 | compile | `cd apps/strapi && npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| transbank-adapter | 01 | 1 | PAY-03 | unit | `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage` | ❌ W0 | ⬜ pending |
| registry | 01 | 1 | PAY-04, PAY-05 | unit | `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/src/services/payment-gateway/tests/gateway.test.ts` — unit tests covering PAY-01 through PAY-05
  - Interface compile check (via TypeScript)
  - Adapter delegation (mock `TransbankService` via `jest.mock()`)
  - Registry returns `TransbankAdapter` when `PAYMENT_GATEWAY=transbank` and when unset
  - Registry throws descriptive error when `WEBPAY_COMMERCE_CODE` or `WEBPAY_API_KEY` is missing
- [ ] No framework install needed — Jest + ts-jest already configured

**Test implementation notes:**
- Mock `TransbankService` using `jest.mock()` — prevents Transbank SDK initialization during tests
- Manipulate `process.env.PAYMENT_GATEWAY`, `process.env.WEBPAY_COMMERCE_CODE`, `process.env.WEBPAY_API_KEY` in `beforeEach`/`afterEach`
- All tests are pure unit tests — no DB, no Strapi instance, no network

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
