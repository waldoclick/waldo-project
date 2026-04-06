---
phase: 114
slug: fix-codacy-best-practice-warnings-replace-any-with-unknown-function-type-and-require-statements-across-monorepo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 114 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (website/dashboard), jest (strapi) |
| **Config file** | `apps/website/vitest.config.ts`, `apps/dashboard/vitest.config.ts`, `apps/strapi/jest.config.js` |
| **Quick run command** | `yarn workspace @waldo/website typecheck && yarn workspace @waldo/dashboard typecheck` |
| **Full suite command** | `yarn turbo typecheck && yarn codacy` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace @waldo/<app> typecheck`
- **After every plan wave:** Run `yarn turbo typecheck`
- **Before `/gsd:verify-work`:** Full suite must be green + `yarn codacy` clean
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| per-task | varies | varies | Codacy best-practice | typecheck | `yarn turbo typecheck` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — no new test files needed. TypeScript typecheck and Codacy analysis are the verification mechanism.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Codacy warnings cleared | Codacy best-practice | Codacy runs on CI/push only | Push branch and verify Codacy report shows 0 `@typescript-eslint/no-explicit-any`, `@typescript-eslint/ban-types`, violations in source files |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
