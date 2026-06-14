---
phase: 117
slug: enforce-root-level-tests-directory-for-website-move-all-test-files-to-apps-website-tests-following-the-mandatory-testing-directory-rule-preserve-mirrored-folder-structure-zero-test-logic-changes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 117 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @nuxt/test-utils |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `cd apps/website && yarn test --run` |
| **Full suite command** | `cd apps/website && yarn test --run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/website && yarn test --run`
- **After every plan wave:** Run `cd apps/website && yarn test --run`
- **Before `/gsd:verify-work`:** Full suite must match baseline (107 passing, 17 pre-existing failures unchanged)
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 117-01-01 | 01 | 1 | STRUCT-117 | structural | `find apps/website/tests -name "*.test.ts" \| wc -l` | ✅ | ⬜ pending |
| 117-01-02 | 01 | 1 | STRUCT-117 | unit | `cd apps/website && yarn test --run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — test files already in `tests/` after Phase 116.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Zero test files under `app/` | STRUCT-117 | File system check | `find apps/website/app -name "*.test.ts"` must return empty |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
