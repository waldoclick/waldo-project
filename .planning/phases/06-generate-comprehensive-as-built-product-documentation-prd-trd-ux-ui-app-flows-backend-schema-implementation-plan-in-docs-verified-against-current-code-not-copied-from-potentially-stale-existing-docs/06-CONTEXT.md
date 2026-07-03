# Phase 6: Generate comprehensive as-built product documentation - Context

**Gathered:** 2026-07-02 (auto mode)
**Status:** Ready for planning

<domain>
## Phase Boundary

Produce six professional-grade Markdown documents in `/docs`, named by acronym, describing the Waldo Project **as it exists today**: PRD, TRD, UX/UI Design, App Flow (with Mermaid diagrams), Backend Schema, and Implementation Plan. This is retrospective/as-built documentation, not a from-scratch build spec — content must be verified against live code (not copied from `.planning/codebase/*` or existing `/docs/*.md`, which are dated leads only). No code changes in this phase. Any drift, ambiguity, or unanswered question found during verification is recorded in a "Preguntas abiertas" section rather than silently assumed.

</domain>

<decisions>
## Implementation Decisions

### Document set & naming
- **D-01:** Six documents in `/docs`, acronym filenames: `PRD.md`, `TRD.md`, `UXD.md` (UX/UI Design), `FLOWS.md` (App Flow), `BSD.md` (Backend Schema Document), `IPD.md` (Implementation Plan Document). [auto-selected: matches user's literal request for acronym names]
- **D-02:** Each document is self-contained with its own table of contents, per the user's "índice correspondiente" instruction.

### Framing (as-built vs greenfield)
- **D-03:** PRD's "MVP y futuras iteraciones" section = current shipped baseline + a forward-looking backlog (drawn from `.planning/ROADMAP.md` shipped milestones + any open backlog/todos), not a from-zero MVP definition.
- **D-04:** IPD's "Roadmap por fases / Épicas / Historias de usuario" = a retrospective account of how the product was actually built (phases 1–129+ per `.planning/milestones/`), reframed as reusable delivery patterns for future work — not a fictitious build-from-scratch plan. Explicitly note this reframing at the top of IPD.md.
- **D-05:** "Criterios de aceptación" in PRD = behaviors already verified as shipped (cross-referenced to code/tests), not speculative acceptance criteria.

### Flow verification (highest-priority area per user emphasis)
- **D-06:** Every flow in FLOWS.md must be re-derived from current source, not from `.planning/codebase/*` or `.planning/milestones/*` prose alone — those are leads to confirm, not sources of truth. Minimum flow set: (1) authentication (JWT via httpOnly proxy cookie `waldo_jwt`, Google One Tap, two-step verification, email auth), (2) ad creation → moderation → publish lifecycle, (3) payment/checkout (Webpay + gateway-agnostic, `order.documentId` identity per CLAUDE.md payment rules), (4) reservation system (ad + featured reservations, restore-on-reject/ban), (5) CRUD + audit-log (Phase 5, logger-based envelope `{actor, actor_type, data}`), (6) cron jobs (adCron, userCron, backupCron, cleanupCron).
- **D-07:** Each flow gets a Mermaid diagram (sequence or flowchart, whichever fits) plus prose covering happy path, error states, and role-gated branches.
- **D-08:** The dashboard-is-merged-into-website discrepancy (CLAUDE.md/AGENTS.md say separate `apps/dashboard`; actual repo has dashboard routes under `apps/website/app/pages/dashboard/**` per `pnpm-workspace.yaml` and `.planning/codebase/ARCHITECTURE.md`) must be explicitly called out in TRD's architecture section and in a top-level "Inconsistencias detectadas" note — do not silently normalize it away.

### Handling gaps/ambiguity
- **D-09:** Every document carries a "Preguntas abiertas" section per the user's explicit instruction. Populate it with genuine unknowns surfaced during verification (e.g., anything that can't be confirmed from code/tests/existing docs within reasonable effort) — do not leave it as a stub if nothing was found; state "ninguna identificada" explicitly if true.
- **D-10:** Where `.planning/codebase/*` or `/docs/*.md` conflict with current code, current code wins; note the correction inline (short note, not a changelog).

### Audience & depth
- **D-11:** Senior/staff-engineer level depth, per the user's framing ("Staff Software Engineer / Senior Full Stack Architect" persona) — technical precision over hand-holding, but Spanish UX copy stays quoted verbatim where relevant (per CLAUDE.md: UI strings shown to end users are Spanish).
- **D-12:** Document body content in English (repo-wide convention: all technical/project artifacts in English per global CLAUDE.md), except direct quotes of Spanish UI strings.

### Claude's Discretion
- Exact section ordering within each document beyond what the user specified.
- Whether ER diagram + endpoint tables live in BSD.md only or are cross-linked from TRD.md (avoid duplication — single source of truth, cross-reference).
- Which Mermaid diagram type (flowchart vs sequenceDiagram vs stateDiagram) fits each flow best.
- Whether to produce one PLAN per document or fewer PLANs covering multiple documents, in the execute-phase step.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level source of truth (read first, treat as authoritative)
- `CLAUDE.md` (repo root) — coding/project conventions; contains at least one known stale claim (apps/dashboard as separate app) — verify every architectural claim against code, don't just transcribe
- `.planning/PROJECT.md` — core value, validated requirements history (long list of shipped increments — useful for PRD "problema que resuelve" and IPD retrospective)
- `.planning/STATE.md` — current milestone/phase pointer and roadmap evolution log

### Codebase maps (leads only — verify, don't copy)
- `.planning/codebase/ARCHITECTURE.md` — dated 2026-06-10; contains the dashboard-merge fact already (line ~12, ~185-190) — use as a lead to confirm in code
- `.planning/codebase/STACK.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `INTEGRATIONS.md`, `TESTING.md`, `CONCERNS.md` — same caveat

### Existing /docs content (leads only — verify against live code before reuse)
- `docs/data-model.md`, `docs/payment-flow.md`, `docs/permissions.md`, `docs/ad-statuses.md`, `docs/reservation-system.md`, `docs/analytics-events.md`, `docs/cache.md`, `docs/deployment.md`, `docs/env-vars.md` — scaffolding for BSD/TRD/FLOWS; must be cross-checked against current source before inclusion

### Flow history (for FLOWS.md and IPD.md retrospective)
- `.planning/milestones/` — shipped milestone roadmaps, especially v1.36 (two-step login), v1.37 (email auth flows), v1.40 (shared auth session), v1.44 (Google One Tap), v1.46 (PRO subscriptions + post-merge hardening incl. httpOnly proxy)
- `.planning/ROADMAP.md` — full phase history for IPD.md

### Live code (primary source — required reading for verification)
- `apps/strapi/src/api/payment/controllers/payment.ts` — payment flow, `order.documentId` identity rule
- `apps/website/app/middleware/` (`auth.ts`, `dashboard-guard.global.ts`) — auth + role gating
- `apps/website/server/api/` — Nitro proxy layer (httpOnly JWT cookie injection)
- `apps/strapi/src/index.ts` (bootstrap, audit-log subscriber from Phase 5) — CRUD/audit-log flow
- `apps/strapi/src/**/*.cron.ts` — the 4 cron jobs
- `apps/strapi/src/api/*/content-types/*/schema.json` — entity/field source for BSD.md ER diagram

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.planning/codebase/*.md` — six pre-built analysis docs (arch, stack, structure, conventions, integrations, testing, concerns) that shortcut a from-scratch codebase scan; use as a research starting map, then verify each claim
- `/docs/*.md` — nine existing feature-level docs (data model, payment flow, permissions, ad statuses, reservations, analytics, cache, deployment, env vars) already close to BSD/TRD/FLOWS content; largely reusable after verification

### Established Patterns
- Monorepo is actually 2 packages (`apps/strapi`, `apps/website`) per `pnpm-workspace.yaml`, not 3 as CLAUDE.md describes — dashboard is `/dashboard/**` routes inside `apps/website`, gated by `dashboard-guard.global.ts`
- Strapi v5 is the sole business-logic layer; website is SSR/Nitro-proxy client only

### Integration Points
- New docs live at `/docs/PRD.md`, `/docs/TRD.md`, `/docs/UXD.md`, `/docs/FLOWS.md`, `/docs/BSD.md`, `/docs/IPD.md` — additive, no existing file collisions (existing `/docs/*.md` files keep their names and become source material / cross-links)

</code_context>

<specifics>
## Specific Ideas

- User asked twice, with emphasis, to get the flows right and keep them current ("necesito que esté lo más actualizada posible. Sobre todo revisa bien el tema de los flujos. Ordenalo bien") — flows are the highest-scrutiny deliverable in this phase.
- User wants the acronym-named files specifically in `/docs` (not `.planning/`).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (No scope-creep signals in the original request; it was a single, bounded documentation-generation ask.)

</deferred>

---

*Phase: 06-generate-comprehensive-as-built-product-documentation*
*Context gathered: 2026-07-02*
