---
phase: 060
slug: mostrar-comprobante-webpay
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-09
updated: 2026-03-09
---

# Phase 060 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^3.0.x + @nuxt/test-utils |
| **Config file** | apps/website/vitest.config.ts |
| **Quick run command** | `yarn test` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn test`
- **After every plan wave:** Run `yarn test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 060-00-01 | 00 | 0 | Create component unit test scaffold | unit | `yarn test tests/components/ComprobanteWebpay.test.ts` | ✅ W0 | ⬜ pending |
| 060-00-02 | 00 | 0 | Create e2e test scaffold | e2e | `yarn test tests/e2e/comprobante.spec.ts` | ✅ W0 | ⬜ pending |
| 060-01-01 | 01 | 1 | Define IWebpayReceipt interface | unit | `tsc --noEmit app/types/webpay-receipt.d.ts` | ✅ W0 | ⬜ pending |
| 060-01-02 | 01 | 1 | Create ComprobanteWebpay component | unit | `yarn test tests/components/ComprobanteWebpay.test.ts` | ✅ W0 | ⬜ pending |
| 060-01-03 | 01 | 1 | Add Webpay logo asset | unit | `yarn test tests/components/ComprobanteWebpay.test.ts` | ✅ W0 | ⬜ pending |
| 060-02-01 | 02 | 2 | Style component with BEM SCSS | unit | `yarn test tests/components/ComprobanteWebpay.test.ts` | ✅ W0 | ⬜ pending |
| 060-02-02 | 02 | 2 | Integrate into gracias.vue | unit | `yarn nuxt typecheck` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/website/tests/components/ComprobanteWebpay.test.ts` — unit tests for receipt component (created in 060-00)
- [x] `apps/website/tests/e2e/comprobante.spec.ts` — e2e tests for receipt visibility (created in 060-00)
- [ ] `apps/website/assets/webpay-logo.svg` — Webpay logo asset for receipt (created in 060-01)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Webpay logo displays correctly | Visual branding | Manual visual check | Run app, complete Webpay flow, verify logo appears |
| Spanish labels rendered correctly | i18n display | Manual verification needed for font/spacing | Run app, check all labels display correctly in Spanish |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ approved (revision complete 2026-03-09)