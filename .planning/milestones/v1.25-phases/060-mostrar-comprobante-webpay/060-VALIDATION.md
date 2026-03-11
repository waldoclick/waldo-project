---
phase: 060
slug: mostrar-comprobante-webpay
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-09
updated: 2026-03-10
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
| 060-00-01 | 00 | 0 | Create ResumeOrder test scaffold | unit | `yarn test tests/components/ResumeOrder.test.ts` | ✅ W0 | ⬜ pending |
| 060-00-02 | 00 | 0 | Create gracias.vue test scaffold | unit | `yarn test tests/pages/gracias.test.ts` | ✅ W0 | ⬜ pending |
| 060-01-01 | 01 | 1 | Extend prepareSummary() | unit | `yarn test tests/pages/gracias.test.ts && yarn nuxt typecheck` | ✅ W0 | ⬜ pending |
| 060-01-02 | 01 | 1 | Add CardInfo for Webpay fields | unit | `yarn test tests/components/ResumeOrder.test.ts && yarn nuxt typecheck` | ✅ W0 | ⬜ pending |
| 060-02-01 | 02 | 1 | Fix adResponse redirect | unit | `yarn workspace @waldo/strapi tsc --noEmit` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/website/tests/components/ResumeOrder.test.ts` — unit tests for ResumeOrder Webpay fields (created in 060-00)
- [x] `apps/website/tests/pages/gracias.test.ts` — unit tests for gracias prepareSummary() (created in 060-00)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Spanish labels render correctly | RCP-02 | Visual verification of UI | Run dev server, complete payment, verify Spanish labels display |
| "No disponible" placeholders work | RCP-02 | Visual check with missing data | Mock payment_response with missing fields, verify placeholders |
| All 8 fields display after payment | RCP-01 | End-to-end flow | Complete Webpay payment, verify all fields visible on /pagar/gracias |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ approved (revision complete 2026-03-10)
