---
phase: 101
slug: integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 101 — Validation Strategy

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
| 101-01-01 | 01 | 1 | INTEG-01 | unit | `yarn --cwd apps/website vitest run tests/plugins/google-one-tap.test.ts` | ✅ | ⬜ pending |
| 101-01-02 | 01 | 1 | INTEG-02 | unit | `yarn --cwd apps/website vitest run tests/middleware/referer.test.ts` | ❌ W0 | ⬜ pending |
| 101-01-03 | 01 | 1 | INTEG-03 | unit | `yarn --cwd apps/website vitest run tests/middleware/onboarding-guard.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/middleware/referer.test.ts` — stubs for INTEG-02

*Existing test files cover INTEG-01 and INTEG-03.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
