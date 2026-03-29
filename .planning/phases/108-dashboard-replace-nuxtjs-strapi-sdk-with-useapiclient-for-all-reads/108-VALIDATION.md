---
phase: 108
slug: dashboard-replace-nuxtjs-strapi-sdk-with-useapiclient-for-all-reads
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-29
---

# Phase 108 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @nuxt/test-utils |
| **Config file** | `apps/dashboard/vitest.config.ts` |
| **Quick run command** | `yarn workspace dashboard typecheck` |
| **Full suite command** | `yarn workspace dashboard test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace dashboard typecheck`
- **After every plan wave:** Run `yarn workspace dashboard test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 108-01-01 | 01 | 1 | SDK->useApiClient store + forms | typecheck | `yarn workspace dashboard typecheck` | yes | pending |
| 108-01-02 | 01 | 1 | SDK->useApiClient list/table components | typecheck | `yarn workspace dashboard typecheck` | yes | pending |
| 108-01-03 | 01 | 1 | SDK->useApiClient stats/dropdown components | typecheck | `yarn workspace dashboard typecheck` | yes | pending |
| 108-01-04 | 01 | 1 | SDK->useApiClient user/reservation components | typecheck | `yarn workspace dashboard typecheck` | yes | pending |
| 108-02-01 | 02 | 1 | SDK->useApiClient dual-pattern pages | typecheck | `yarn workspace dashboard typecheck` | yes | pending |
| 108-02-02 | 02 | 1 | SDK->useApiClient single-call pages | typecheck | `yarn workspace dashboard typecheck` | yes | pending |
| 108-03-01 | 03 | 2 | No remaining strapi.find/findOne + full suite | grep + vitest | `grep -rn "strapi\.find" apps/dashboard/app/ && yarn workspace dashboard test` | yes | pending |

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements -- vitest and typecheck are already configured in the dashboard app.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| useApiClient called at component setup scope | Architecture | Static analysis can't detect all call sites inside callbacks | Review each migrated file to ensure `useApiClient()` is called at `<script setup>` top level, not inside `useAsyncData` or `watch` callbacks |
| Runtime data loads correctly | Functional | E2E not set up | Open dashboard pages in browser and verify data renders without errors |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
