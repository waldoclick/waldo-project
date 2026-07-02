---
phase: 06-generate-comprehensive-as-built-product-documentation-prd-trd-ux-ui-app-flows-backend-schema-implementation-plan-in-docs-verified-against-current-code-not-copied-from-potentially-stale-existing-docs
plan: 03
subsystem: docs
tags: [documentation, architecture, trd, monorepo, cron, as-built]

# Dependency graph
requires:
  - phase: 06-01
    provides: docs/BSD.md (21-entity schema truth, cross-linked for data layer)
  - phase: 06-02
    provides: docs/FLOWS.md (6 verified runtime flows, cross-linked for runtime behavior)
provides:
  - docs/TRD.md — as-built Technical Requirements Document
  - Verified 2-package monorepo topology stated as a top-level correction note
  - Verified 6-active+1-manual cron count stated as a top-level correction note
affects: [06-04 (PRD), 06-05 (UXD — references TRD's public-vs-dashboard split)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cross-link instead of duplicate: TRD references BSD.md for schema and FLOWS.md for runtime flows rather than re-deriving them"
    - "Inconsistencias detectadas as a top-level section (not buried) for stale-doc corrections"

key-files:
  created:
    - docs/TRD.md
  modified: []

key-decisions:
  - "Verified package topology directly against pnpm-workspace.yaml and ls apps/ rather than transcribing CLAUDE.md's stale 3-app claim"
  - "Verified stack versions directly from apps/website/package.json and apps/strapi/package.json rather than assuming .planning/codebase/STACK.md's dated snapshot is current"
  - "Flagged docs/env-vars.md and docs/deployment.md as themselves containing stale apps/dashboard sections, in the Preguntas abiertas section, rather than silently rewriting those pre-existing docs (out of this plan's scope)"

patterns-established: []

requirements-completed: [D-01, D-02, D-08, D-09, D-10, D-11, D-12]

# Metrics
duration: 12min
completed: 2026-07-02
---

# Phase 06 Plan 03: TRD.md (Technical Requirements Document) Summary

**Produced docs/TRD.md documenting the real 2-package monorepo (apps/strapi + apps/website only), explicitly correcting both the stale "3-app" claim and the stale "4 cron jobs" claim in a top-level Inconsistencias detectadas note, verified directly against pnpm-workspace.yaml, package.json manifests, and live middleware/cron source rather than copied from CLAUDE.md or .planning/codebase/ARCHITECTURE.md.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-07-02T19:10:00Z (approx, first file read)
- **Completed:** 2026-07-02T19:22:18Z
- **Tasks:** 1/1 completed
- **Files modified:** 1 (docs/TRD.md, created)

## Accomplishments

- Verified the monorepo is exactly 2 packages (`apps/strapi`, `apps/website`) directly against `pnpm-workspace.yaml`, contradicting `CLAUDE.md`/`AGENTS.md`'s "three apps" framing, and additionally discovered (not previously flagged in 06-CONTEXT.md/06-RESEARCH.md) that `docs/env-vars.md` and `docs/deployment.md` themselves still carry stale standalone `apps/dashboard` sections — flagged in Preguntas abiertas.
- Verified the 6-active-plus-1-manual cron count against `apps/strapi/config/cron-tasks.ts`'s registry (cross-checked, consistent with docs/FLOWS.md Flow 6's own independently-verified table), correcting `CLAUDE.md`'s "four active cron jobs" claim.
- Verified stack versions directly from `package.json` (Nuxt `^4.1.3`, Strapi `5.41.1`, Vite `^6.2.5`, etc.) rather than trusting `.planning/codebase/STACK.md`'s 2026-06-10 snapshot.
- Verified the httpOnly-cookie proxy architecture (`waldo_jwt`, `X-Proxy-Key` header, `PROXY_SECRET_WEB`/`PROXY_SECRET_APP`) directly against `apps/website/server/api/[...].ts` and `apps/strapi/src/middlewares/proxy-auth.ts` source, not from prose.
- Verified the reCAPTCHA v3 method-based guard (`ctx.method === "POST" | "PUT"`) directly in `apps/strapi/src/middlewares/recaptcha.ts`.
- Cross-linked docs/BSD.md (schema/data layer) and docs/FLOWS.md (all 6 runtime flows) throughout rather than duplicating their content, per the plan's explicit "cross-link, don't duplicate" instruction.

## Task Commits

1. **Task 1: Write docs/TRD.md — stack, architecture, integrations, NFRs, Inconsistencias detectadas** - `18c7ab86` (docs)

**Plan metadata:** (this commit, to follow)

## Files Created/Modified

- `docs/TRD.md` (195 lines) - Technical Requirements Document: TOC, Inconsistencias detectadas (dashboard-merge + cron-count corrections), Technology Stack (website + Strapi + monorepo tooling), Architecture (2-package topology, httpOnly session, public-vs-dashboard split, data-layer/flow cross-links), Integrations (16 verified integrations table), Non-Functional Requirements (security, caching, backups, observability), Preguntas abiertas

## Decisions Made

- Verified package topology directly against `pnpm-workspace.yaml` and `ls apps/` — matches 06-CONTEXT.md's D-08/corrected_facts, confirmed independently rather than transcribed.
- Verified stack versions from `package.json` files directly rather than `.planning/codebase/STACK.md` (dated lead) — caught no material drift, but confirms the verification-before-write pattern the phase mandates.
- Additional finding beyond the plan's corrected_facts block: `docs/env-vars.md` and `docs/deployment.md` (pre-existing `/docs/*.md`, not touched by this phase) both still contain full standalone `apps/dashboard` sections describing a separate deployed app / env-var set. Per D-10 ("note the correction inline, short note, not a changelog") and this plan's explicit scope (`files_modified: [docs/TRD.md]` only), this is noted in TRD.md's Preguntas abiertas as a flag for a future doc-cleanup pass, not fixed in this plan.

## Deviations from Plan

None - plan executed exactly as written. Task 1 was the plan's sole task; all acceptance criteria (file exists, "Inconsistencias detectadas" present, dashboard-guard/dashboard-path reference present, 6-cron reference present, BSD.md + FLOWS.md cross-links present, "Preguntas abiertas" present, TOC present, ≥180 lines) verified passing before commit.

## Known Stubs

None. This is a documentation-only deliverable; there is no application code or data-wiring in scope.

## Issues Encountered

None blocking. Minor: the shell's `grep` alias (`ugrep`) does not support the plan's literal `grep -qE "6 (active |)cron|6 cron"` pattern (errors on the empty alternation branch) — re-ran with `/usr/bin/grep` directly to confirm the same command passes with standard POSIX grep, which is what CI/verification tooling would use. No file changes were needed; this was a local shell-alias quirk, not a content defect.

## Self-Check: PASSED

- FOUND: docs/TRD.md
- FOUND: commit 18c7ab86 (docs(06-03): add TRD.md — as-built architecture, stack, integrations, NFRs)
