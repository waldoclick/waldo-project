---
phase: 074
slug: lightboxarticles-dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 074 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + @nuxt/test-utils (dashboard) |
| **Config file** | `apps/dashboard/vitest.config.ts` |
| **Quick run command** | `yarn workspace @waldo/dashboard typecheck` |
| **Full suite command** | `yarn workspace @waldo/dashboard typecheck && yarn workspace @waldo/dashboard lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace @waldo/dashboard typecheck`
- **After every plan wave:** Run `yarn workspace @waldo/dashboard typecheck && yarn workspace @waldo/dashboard lint`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 074-01-01 | 01 | 1 | LB-01, LB-02, LB-03, LB-04, LB-05, LB-06, LB-07, LB-08 | typecheck | `yarn workspace @waldo/dashboard typecheck` | ❌ created in task | ⬜ pending |
| 074-01-02 | 01 | 1 | SCSS-01 | manual | Visual inspection of compiled CSS | ✅ exists | ⬜ pending |
| 074-02-01 | 02 | 2 | INT-01 | typecheck + manual | `yarn workspace @waldo/dashboard typecheck` | ✅ exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No Wave 0 needed — TypeScript checker is already configured and `yarn workspace @waldo/dashboard typecheck` runs without additional setup.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 3-step lightbox opens and renders correctly | LB-01, LB-02 | Visual UI — no DOM testing infra for component interaction | Open articles page, click "Generar artículo", verify modal opens at Step 1 |
| Buscar calls Tavily and renders results | LB-03 | HTTP call to Strapi required, not unit-testable in isolation | Type query, press Buscar, verify result list renders |
| Selecting article fetches HTML + advances to Step 2 | LB-04, LB-05 | External fetch (URL HTML) + state transition | Click a result, verify Step 2 shows title/url/date |
| Generar artículo calls Gemini and advances to Step 3 | LB-06, LB-07 | HTTP call to Strapi Gemini endpoint | Press Generar artículo, verify Step 3 shows generated content |
| Back navigation preserves state | LB-08 | State persistence — requires interactive testing | Click back from Step 3 → Step 2 → Step 1 without losing data |
| SCSS `--articles` modifier renders correctly | SCSS-01 | Visual/CSS output | Inspect modal in browser devtools — BEM classes match |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
