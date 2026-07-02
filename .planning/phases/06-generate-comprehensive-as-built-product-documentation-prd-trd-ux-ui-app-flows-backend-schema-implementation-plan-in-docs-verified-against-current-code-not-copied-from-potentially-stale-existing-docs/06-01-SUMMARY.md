---
phase: 06-generate-comprehensive-as-built-product-documentation-prd-trd-ux-ui-app-flows-backend-schema-implementation-plan-in-docs-verified-against-current-code-not-copied-from-potentially-stale-existing-docs
plan: 01
subsystem: docs
tags: [strapi, schema, mermaid, erDiagram, documentation, backend]

# Dependency graph
requires: []
provides:
  - "docs/BSD.md — Backend Schema Document: 21-entity ER diagram, per-entity field/relation tables, API endpoint reference"
affects: [06-02, 06-03, 06-04, 06-05, 06-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [Mermaid erDiagram for schema visualization, verified-against-live-schema.json documentation pattern]

key-files:
  created: [docs/BSD.md]
  modified: []

key-decisions:
  - "Derived all 21 entities directly from live schema.json files (20 under apps/strapi/src/api/*, User under apps/strapi/src/extensions/users-permissions/) rather than extending docs/data-model.md's stale 16-entity table"
  - "AdPack-to-Order relationship modeled as a soft/logical link in the ER diagram since Order.items is untyped JSON with no formal Strapi relation attribute to AdPack — flagged in Preguntas abiertas rather than assumed"
  - "API Endpoint Reference covers only non-CRUD custom routes (payments, ad moderation, cron-runner, auth, gift reservations); standard CRUD routes cross-link docs/permissions.md instead of being duplicated"

patterns-established:
  - "BSD.md is the schema source of truth other Wave 2 docs (TRD, PRD, IPD) cross-reference instead of re-deriving entity/field facts"

requirements-completed: [D-01, D-02, D-09, D-10, D-11, D-12]

# Metrics
duration: 12min
completed: 2026-07-02
---

# Phase 06 Plan 01: Backend Schema Document (BSD.md) Summary

**Produced docs/BSD.md — a 466-line, 21-entity Backend Schema Document with a Mermaid erDiagram, per-entity field tables, and a custom API endpoint reference, all derived from live schema.json files rather than the stale 16-entity docs/data-model.md.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-02T19:03:20Z
- **Completed:** 2026-07-02T19:15:00Z
- **Tasks:** 2
- **Files modified:** 1 (new file)

## Accomplishments
- Enumerated and read all 20 `apps/strapi/src/api/*/content-types/*/schema.json` files plus the 21st entity (`User`) at `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json`, which the `api/*` glob alone misses
- Built a single Mermaid `erDiagram` covering all 21 entities with cardinality derived from each schema's `relation` attribute (`oneToOne`, `oneToMany`, `manyToOne`, `manyToMany`)
- Wrote 21 per-entity field/relation reference tables, each with inline short corrections against `docs/data-model.md` where that doc's fields/entities were wrong or missing (e.g. `Faq.text` not `answer`, `Condition.name` not `title`, `SubscriptionPro` has no `status`/`period_end`/`card_number` fields)
- Added an API Endpoint Reference table covering verified custom non-CRUD routes: 7 payment routes, ad moderation routes (approve/reject/banned/deactivate), cron-runner manual trigger, 2-step auth routes, gift-reservation routes, AI provider routes — cross-linking `docs/permissions.md` instead of duplicating its full permission matrix
- Added Table of Contents and a substantive "Preguntas abiertas" section (2 genuine open items, not a stub)

## Task Commits

Both tasks were authored as a single new file (`docs/BSD.md`) and committed atomically since Task 2 appended to content Task 1 had not yet been committed:

1. **Task 1 + Task 2: BSD.md (ER diagram/entity tables + API endpoint reference)** - `4979bd82` (docs)

**Plan metadata:** commit pending (this SUMMARY + STATE/ROADMAP update)

## Files Created/Modified
- `docs/BSD.md` - Backend Schema Document: intro, TOC, 21-entity Mermaid `erDiagram`, 21 entity reference subsections, API Endpoint Reference table, Preguntas abiertas section

## Decisions Made
- Derived every entity/field fact from the live `schema.json` files, not from `docs/data-model.md` (which lists only 16 entities and predates Phase 4's `cookie-policy`/`security-policy` additions) — corrections noted inline per entity rather than as a separate changelog
- Modeled `AdPack`↔`Order` as a soft/logical ER link (Order.items is untyped JSON, no formal Strapi relation) and flagged the ambiguity explicitly in Preguntas abiertas rather than inventing a relation that doesn't exist in schema.json
- API Endpoint Reference intentionally omits enumerating every auto-generated CRUD route (avoids duplicating `docs/permissions.md`'s exhaustive table) — only custom/non-CRUD routes verified from route files are listed

## Deviations from Plan

None — plan executed exactly as written. Both tasks target the same new file (`docs/BSD.md`); since the file did not exist before this plan, Task 1's content (ER diagram + entity tables) and Task 2's content (API endpoint reference) were authored together in one `Write` call and committed as a single atomic commit rather than two sequential edits to a pre-existing file. This is a mechanical consequence of the file being newly created, not a scope or content deviation — every acceptance criterion for both Task 1 and Task 2 was independently verified against the final file.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
`docs/BSD.md` is committed and ready to be cross-referenced by Wave 2 documents (TRD.md, PRD.md, IPD.md) per the phase's cross-document dependency graph. No blockers for plan 06-02 (running in parallel) or subsequent Wave 2 plans.

---
*Phase: 06-generate-comprehensive-as-built-product-documentation-prd-trd-ux-ui-app-flows-backend-schema-implementation-plan-in-docs-verified-against-current-code-not-copied-from-potentially-stale-existing-docs*
*Completed: 2026-07-02*

## Self-Check: PASSED

- FOUND: docs/BSD.md
- FOUND: .planning/phases/06-.../06-01-SUMMARY.md
- FOUND commit: 4979bd82
