---
phase: 115
slug: fix-remaining-any-and-function-type-violations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 115 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @nuxt/test-utils |
| **Config file** | `apps/dashboard/vitest.config.ts`, `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace @waldo/dashboard typecheck` |
| **Full suite command** | `yarn turbo typecheck` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace @waldo/dashboard typecheck`
- **After every plan wave:** Run `yarn turbo typecheck`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 115-01-01 | 01 | 1 | TYPE-001 | typecheck | `yarn workspace @waldo/website typecheck` | ✅ | ⬜ pending |
| 115-01-02 | 01 | 1 | TYPE-001 | typecheck | `yarn workspace @waldo/dashboard typecheck` | ✅ | ⬜ pending |
| 115-01-03 | 01 | 2 | TYPE-002 | typecheck | `yarn workspace @waldo/dashboard typecheck` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Zero `any`/`Function` grep matches | TYPE-001 | Requires grep scan | Run: `grep -rn ": any\|as any\|Array<any>\|ref<any>" apps/ --include="*.ts" --include="*.vue"` — expect 0 matches |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
