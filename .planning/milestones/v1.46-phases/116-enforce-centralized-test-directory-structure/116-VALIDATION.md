---
phase: 116
slug: enforce-centralized-test-directory-structure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 116 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (website/dashboard) + Jest/ts-jest (strapi) |
| **Config file** | `apps/website/vitest.config.ts`, `apps/dashboard/vitest.config.ts`, `apps/strapi/jest.config.js` |
| **Quick run command** | `cd apps/website && yarn test --run` |
| **Full suite command** | `cd apps/website && yarn test --run && cd ../dashboard && yarn test --run && cd ../strapi && yarn test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/website && yarn test --run` (or strapi equivalent for strapi tasks)
- **After every plan wave:** Run full suite
- **Before `/gsd:verify-work`:** Full suite — website must have exactly 17 failing (no new failures), dashboard 59/59 passing
- **Max feedback latency:** 30 seconds

---

## Pre-Move Baseline (MUST maintain)

| App | Total | Passing | Failing | Target |
|-----|-------|---------|---------|--------|
| Website | 124 | 107 | 17 | Failing count stays at 17 |
| Dashboard | 59 | 59 | 0 | All 59 pass |
| Strapi | n/a | n/a | n/a | Same tests pass/fail as before |

---

## Per-Task Verification Map

| Task ID | Plan | Wave | What | Test Type | Automated Command | Status |
|---------|------|------|------|-----------|-------------------|--------|
| 116-01-01 | 01 | 1 | Move website composable tests | structural | `cd apps/website && yarn test --run` | ⬜ pending |
| 116-01-02 | 01 | 1 | Move website component tests + delete dead .ts | structural | `cd apps/website && yarn test --run` | ⬜ pending |
| 116-01-03 | 01 | 1 | Update website import paths | type + unit | `cd apps/website && yarn typecheck && yarn test --run` | ⬜ pending |
| 116-02-01 | 02 | 2 | Rename Strapi __tests__ → tests dirs | structural | `cd apps/strapi && yarn test` | ⬜ pending |
| 116-02-02 | 02 | 2 | Move Strapi flat co-located tests | structural | `cd apps/strapi && yarn test` | ⬜ pending |
| 116-02-03 | 02 | 2 | Update Strapi relative import paths | type + unit | `cd apps/strapi && yarn test` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No new test stubs or framework installs needed.*

---

## Manual-Only Verifications

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| No stray test files remain under `app/` in website | Filesystem check | `find apps/website/app -name "*.test.ts" -o -name "*.spec.ts"` → must return empty |
| No `__tests__/` directories remain in Strapi | Filesystem check | `find apps/strapi/src -name "__tests__" -type d` → must return empty |
| No flat co-located test files in Strapi | Filesystem check | `find apps/strapi/src -maxdepth 4 -name "*.test.ts" -not -path "*/tests/*"` → must return empty |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
