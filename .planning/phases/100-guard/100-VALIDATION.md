---
phase: 100
slug: guard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 100 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | apps/website/vitest.config.ts |
| **Quick run command** | `yarn --cwd apps/website vitest run --reporter=verbose` |
| **Full suite command** | `yarn --cwd apps/website vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn --cwd apps/website vitest run --reporter=verbose`
- **After every plan wave:** Run `yarn --cwd apps/website vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 100-01-01 | 01 | 1 | GUARD-01 | unit | `yarn --cwd apps/website vitest run` | ❌ W0 | ⬜ pending |
| 100-01-02 | 01 | 1 | GUARD-02 | unit | `yarn --cwd apps/website vitest run` | ❌ W0 | ⬜ pending |
| 100-01-03 | 01 | 1 | GUARD-03 | unit | `yarn --cwd apps/website vitest run` | ❌ W0 | ⬜ pending |
| 100-01-04 | 01 | 1 | GUARD-04 | unit | `yarn --cwd apps/website vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/middleware/onboarding-guard.test.ts` — stubs for GUARD-01, GUARD-02, GUARD-03, GUARD-04
- [ ] Test fixtures for mocking `useMeStore` and navigation

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SSR page refresh does not flash wrong page | GUARD-04 | Requires real browser SSR | Load page with incomplete profile, verify no content flash before redirect |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
