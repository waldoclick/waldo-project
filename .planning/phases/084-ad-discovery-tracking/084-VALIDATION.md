---
phase: 084
slug: ad-discovery-tracking
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 084 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest v3.2.4 |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn vitest run app/composables/useAdAnalytics.test.ts` (from `apps/website/`) |
| **Full suite command** | `yarn vitest run` (from `apps/website/`) |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn vitest run app/composables/useAdAnalytics.test.ts`
- **After every plan wave:** Run `yarn vitest run` (from `apps/website/`)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 084-01-01 | 01 | 1 | DISC-01, DISC-02, DISC-03 | unit | `yarn vitest run app/composables/useAdAnalytics.test.ts` | ✅ | ⬜ pending |
| 084-01-02 | 01 | 1 | DISC-01, DISC-02, DISC-03 | unit | `yarn vitest run app/composables/useAdAnalytics.test.ts` | ✅ | ⬜ pending |
| 084-02-01 | 02 | 2 | DISC-01, DISC-03 | unit | `yarn vitest run` | ✅ | ⬜ pending |
| 084-02-02 | 02 | 2 | DISC-02 | unit | `yarn vitest run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. New tests are additions to `useAdAnalytics.test.ts`, which already exists and runs (17 tests passing from Phase 083).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `view_item` fires distinct event per ad navigation | DISC-02 | GA4 Realtime only; slug-reset guard verified by SSR navigation | Open 2 different ad detail pages, check GA4 Realtime shows 2 distinct `view_item` events |
| `search` fires on commune filter selection | DISC-03 | Route query change via filter component | On `/anuncios`, select a commune from dropdown; check GA4 Realtime shows `search` event with commune name as `search_term` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
