---
phase: 102
slug: oneclick-inscription
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 102 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + ts-jest |
| **Config file** | `apps/strapi/jest.config.js` |
| **Quick run command** | `cd apps/strapi && yarn test --testPathPattern="oneclick"` |
| **Full suite command** | `cd apps/strapi && yarn test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/strapi && yarn test --testPathPattern="oneclick" --passWithNoTests`
- **After every plan wave:** Run `cd apps/strapi && yarn test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 102-01-01 | 01 | 1 | INSC-01 | unit | `yarn test --testPathPattern="oneclick.service.test"` | ❌ W0 | ⬜ pending |
| 102-01-02 | 01 | 1 | INSC-02 | unit | `yarn test --testPathPattern="oneclick.service.test"` | ❌ W0 | ⬜ pending |
| 102-01-03 | 01 | 1 | INSC-03 | unit | `yarn test --testPathPattern="oneclick.service.test"` | ❌ W0 | ⬜ pending |
| 102-01-04 | 01 | 1 | INSC-04 | unit | `yarn test --testPathPattern="oneclick.service.test"` | ❌ W0 | ⬜ pending |
| 102-02-01 | 02 | 2 | FRNT-01 | manual | — | — | ⬜ pending |
| 102-02-02 | 02 | 2 | FRNT-02 | manual | — | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/strapi/src/services/oneclick/tests/oneclick.service.test.ts` — stubs for INSC-01, INSC-02, INSC-03, INSC-04
- [ ] `apps/strapi/src/services/oneclick/` directory structure — service not yet created

*Existing `jest.config.js`, `jest.setup.js`, and ts-jest infrastructure are in place — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| MemoPro.vue calls `payments/pro-inscription/start` and redirects to `urlWebpay?TBK_TOKEN=token` | FRNT-01 | Browser redirect — cannot automate without E2E framework | 1. Log in as non-PRO user 2. Click "Hazte PRO" 3. Verify redirect to Transbank enrollment page |
| `/pro/gracias` shows card type and last4 from refreshed user data | FRNT-02 | Browser page rendering — requires Transbank sandbox round-trip | 1. Complete inscription on Transbank sandbox 2. Verify redirect to `/pro/gracias` 3. Verify card type and masked number displayed |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
