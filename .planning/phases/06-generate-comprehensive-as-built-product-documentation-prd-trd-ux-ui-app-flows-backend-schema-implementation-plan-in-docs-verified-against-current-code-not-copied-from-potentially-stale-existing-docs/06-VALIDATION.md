---
phase: 06
slug: generate-comprehensive-as-built-product-documentation-prd-trd-ux-ui-app-flows-backend-schema-implementation-plan-in-docs-verified-against-current-code-not-copied-from-potentially-stale-existing-docs
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-02
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — this phase produces zero executable application code. Verification is structural/content checks on Markdown output via shell (grep/ls/wc), not a test runner. |
| **Config file** | none |
| **Quick run command** | per-document grep/ls checks (see Per-Task Verification Map) |
| **Full suite command** | run all checks in the Phase Requirements → Verification Map sequentially |
| **Estimated runtime** | ~5 seconds (grep/ls only) |

---

## Sampling Rate

- **After every task commit (per document written):** run the structural greps for that specific document immediately.
- **After every plan wave:** run the full structural check table across all 6 docs.
- **Before `/gsd:verify-work`:** all 6 files exist, all 6 have TOCs, FLOWS.md has ≥6 mermaid blocks, all 6 have "Preguntas abiertas" sections, TRD.md contains the "Inconsistencias detectadas" note.
- **Max feedback latency:** ~5 seconds (no build/compile step).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-* | 01 | 1 | D-06/D-07 flow verification | structural | file-map cross-check against RESEARCH.md per-flow tables | ✅ | ⬜ pending |
| 06-02-* | 02 | 2 | D-01 (6 files) | structural | `ls docs/PRD.md docs/TRD.md docs/UXD.md docs/FLOWS.md docs/BSD.md docs/IPD.md` | ✅ | ⬜ pending |
| 06-02-* | 02 | 2 | D-02 (TOC per doc) | structural | `grep -l "^## Table of Contents\|^## Índice" docs/{PRD,TRD,UXD,FLOWS,BSD,IPD}.md` — expect 6 matches | ✅ | ⬜ pending |
| 06-02-* | 02 | 2 | D-07 (Mermaid per flow) | structural | `grep -c '```mermaid' docs/FLOWS.md` — expect ≥6 | ✅ | ⬜ pending |
| 06-02-* | 02 | 2 | BSD entity completeness (21 entities incl. User) | structural | `grep -c "erDiagram" docs/BSD.md` ≥1; diff entity names against `find apps/strapi/src/api/*/content-types/*/schema.json apps/strapi/src/extensions/*/content-types/*/schema.json` | ✅ | ⬜ pending |
| 06-02-* | 02 | 2 | D-09 (Preguntas abiertas per doc) | structural | `grep -l "Preguntas [Aa]biertas" docs/{PRD,TRD,UXD,FLOWS,BSD,IPD}.md` — expect 6 matches | ✅ | ⬜ pending |
| 06-02-* | 02 | 2 | D-08 (dashboard-merge inconsistency documented) | content | `grep -l "Inconsistencias detectadas" docs/TRD.md` + manual read confirming accuracy | ✅ | ⬜ pending |
| 06-01-* | 01 | 1 | Cron count corrected to 6 active (not 4) | content | manual read of FLOWS.md cron section against `apps/strapi/config/cron-tasks.ts` | ✅ | ⬜ pending |
| 06-02-* | 02 | 2 | D-12 (English body, Spanish only in quoted UI strings) | content | spot-check — not automatable, reviewer judgment | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — no test-framework scaffolding needed. All "tests" are ad hoc grep/ls/wc/find commands runnable with zero setup, since the artifacts are Markdown files, not application code.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Flow diagrams accurately reflect current code (not stale docs) | D-06, D-07 | Semantic correctness of a diagram vs. source can't be grep-verified | Executor cross-reads each flow's file map (RESEARCH.md §Per-Flow File Maps) against the Mermaid diagram before marking the task done |
| Body copy is English; UI strings quoted are the real Spanish strings | D-11, D-12 | Language/tone judgment | Reviewer skim of each doc before phase gate |
| "Preguntas abiertas" entries are genuine unknowns, not stubs | D-09 | Requires judgment on what counts as a real open question | Reviewer checks each entry traces to an actual verification gap noted in RESEARCH.md or found during writing |

---

## Validation Sign-Off

- [x] All tasks have automated structural verify or are explicitly manual-only (documented above)
- [x] Sampling continuity: no 3 consecutive tasks without a check — every document-writing task has its own grep/ls check
- [x] Wave 0 covers all MISSING references — N/A, no Wave 0 gaps (see above)
- [x] No watch-mode flags — N/A, no test runner involved
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
