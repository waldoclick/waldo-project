---
phase: 110
slug: fix-ssr-data-loading-in-ads-detail-page-and-dashboard-home-stats
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 110 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + happy-dom |
| **Config file** | `apps/dashboard/vitest.config.ts`, `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace waldo-dashboard vitest run` |
| **Full suite command** | `yarn workspace waldo-dashboard vitest run && yarn workspace waldo-website vitest run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace waldo-dashboard vitest run`
- **After every plan wave:** Run `yarn workspace waldo-dashboard vitest run && yarn workspace waldo-website vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 110-01-01 | 01 | 1 | SSR bug fix | grep | `grep -c "onMounted" apps/dashboard/app/components/StatisticsDefault.vue` (expect 0) | ✅ | ⬜ pending |
| 110-01-02 | 01 | 1 | SSR bug fix | grep | `grep -c "onMounted" apps/dashboard/app/components/StatsDefault.vue` (expect 0) | ✅ | ⬜ pending |
| 110-01-03 | 01 | 1 | SSR bug fix | grep | `grep -n "useAdsStore" apps/website/app/pages/anuncios/\[slug\].vue` (must appear before useAsyncData) | ✅ | ⬜ pending |
| 110-01-04 | 01 | 1 | Regression | regression | `yarn workspace waldo-dashboard vitest run` | ✅ | ⬜ pending |
| 110-01-05 | 01 | 1 | Regression | regression | `yarn workspace waldo-website vitest run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — no new test files needed. These are structural/pattern corrections verifiable by grep and type checking.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dashboard home stats render correctly on SSR | SSR bug fix | Requires browser + network inspection | Load dashboard home page with JS disabled or check network tab for pre-rendered HTML containing stat values |
| Ad detail page loads without store context error | SSR bug fix | Requires SSR environment | Open `/anuncios/[slug]` and verify no Nuxt context composable errors in server logs |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
