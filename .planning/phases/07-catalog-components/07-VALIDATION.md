---
phase: 7
slug: catalog-components
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest via `@nuxt/test-utils` |
| **Config file** | `apps/dashboard/vitest.config.ts` |
| **Quick run command** | `cd apps/dashboard && yarn build` |
| **Full suite command** | `cd apps/dashboard && yarn build` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Code inspection — confirm `onMounted` is absent from modified file
- **After every plan wave:** `cd apps/dashboard && yarn build` — typeCheck must pass clean
- **Before `/gsd:verify-work`:** Full build must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | DFX-01 | manual (code inspection) | N/A — absence of `onMounted` | N/A | ⬜ pending |
| 7-01-02 | 01 | 1 | DFX-02 | manual (code inspection) | N/A — absence of `onMounted` | N/A | ⬜ pending |
| 7-01-03 | 01 | 1 | DFX-03 | manual (code inspection) | N/A — absence of `onMounted` | N/A | ⬜ pending |
| 7-01-04 | 01 | 1 | DFX-04 | manual (code inspection) | N/A — absence of `onMounted` | N/A | ⬜ pending |
| 7-01-05 | 01 | 1 | DFX-05 | manual (code inspection) | N/A — absence of `onMounted` | N/A | ⬜ pending |
| 7-01-06 | 01 | 1 | DFX-06 | manual (code inspection) | N/A — absence of `onMounted` | N/A | ⬜ pending |
| 7-01-07 | 01 | 1 | All DFX | smoke | `cd apps/dashboard && yarn build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

No new test files required — unit tests for these components are explicitly deferred to a future milestone (TEST-02 per REQUIREMENTS.md). The build gate (`typeCheck: true`) covers TypeScript correctness and code inspection verifies the removal of `onMounted`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PacksDefault fetch fires exactly once on mount | DFX-01 | Unit tests deferred to TEST-02 milestone; network-level verify done by code inspection | Confirm no `onMounted` call in `PacksDefault.vue`; confirm `watch({ immediate: true })` pattern present |
| UsersDefault fetch fires exactly once on mount | DFX-02 | Same as above | Confirm no `onMounted` in `UsersDefault.vue` |
| RegionsDefault fetch fires exactly once on mount | DFX-03 | Same as above | Confirm no `onMounted` in `RegionsDefault.vue` |
| FaqsDefault fetch fires exactly once on mount | DFX-04 | Same as above | Confirm no `onMounted` in `FaqsDefault.vue` |
| CommunesDefault fetch fires exactly once on mount | DFX-05 | Same as above | Confirm no `onMounted` in `CommunesDefault.vue` |
| ConditionsDefault fetch fires exactly once on mount | DFX-06 | Same as above | Confirm no `onMounted` in `ConditionsDefault.vue` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
