---
phase: 105
slug: pro-subscription-checkout-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 105 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (website) / Jest (Strapi) |
| **Config file** | `apps/website/vitest.config.ts` / `apps/strapi/jest.config.ts` |
| **Quick run command** | `yarn workspace website test` / `yarn workspace strapi test` |
| **Full suite command** | `yarn test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick test for affected app
- **After every plan wave:** Run `yarn test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*To be filled after plans are created.*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements — Vitest and Jest are already configured.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Oneclick redirect flow | D-09 | Requires live Transbank sandbox | Navigate MemoPro → /pro/pagar → select boleta → click pagar → verify Transbank redirect → verify /pro/pagar/gracias shows order |
| Facto document generation | D-11 | Requires Facto API sandbox | Complete checkout → verify boleta/factura PDF created in Facto dashboard |
| Monthly cron order creation | D-12 | Requires cron trigger | Trigger cron manually via POST /api/cron-runner → verify order + Facto document created |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
