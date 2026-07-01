---
phase: 04-split-legal-pages-into-4-documents-with-dashboard-management
plan: 01
subsystem: api
tags: [strapi, content-type, rest, crud]

# Dependency graph
requires: []
provides:
  - "api::cookie-policy.cookie-policy" Strapi v5 content-type — REST CRUD + reorder
  - "api::security-policy.security-policy" Strapi v5 content-type — REST CRUD + reorder
affects: [04-02 (seeders), 04-03 (frontend types/stores), 04-05, 04-06 (dashboard CRUD), 04-09 (manual permission grant)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hand-rolled content-type controller quadruplet (schema + controller + core router + custom reorder route + pass-through service), replicated verbatim from term/policy"

key-files:
  created:
    - apps/strapi/src/api/cookie-policy/content-types/cookie-policy/schema.json
    - apps/strapi/src/api/cookie-policy/controllers/cookie-policy.ts
    - apps/strapi/src/api/cookie-policy/routes/cookie-policy.ts
    - apps/strapi/src/api/cookie-policy/routes/01-custom-cookie-policy.ts
    - apps/strapi/src/api/cookie-policy/services/cookie-policy.ts
    - apps/strapi/src/api/security-policy/content-types/security-policy/schema.json
    - apps/strapi/src/api/security-policy/controllers/security-policy.ts
    - apps/strapi/src/api/security-policy/routes/security-policy.ts
    - apps/strapi/src/api/security-policy/routes/01-custom-security-policy.ts
    - apps/strapi/src/api/security-policy/services/security-policy.ts
  modified: []

key-decisions:
  - "API ids cookie-policy/security-policy (not bare cookie/security) per 04-RESEARCH.md naming recommendation — avoids collision with existing cookie-consent code and the unrelated ad item-condition content-type"
  - "Controller/route/service logic replicated byte-for-byte from term.ts, only UID strings and local variable names substituted (term→cookiePolicy/securityPolicy)"

patterns-established:
  - "New legal-document content-types follow the term/policy quadruplet exactly: hand-rolled controller (not createCoreController) with manual pagination via strapi.db.query + count, findOne/update/delete via strapi.documents() Document Service API, create via strapi.db.query, and a custom POST /{plural}/reorder route validating {documentId, order}[] and bulk-updating via Promise.all"

requirements-completed: [LEGAL-SPLIT-01, LEGAL-SPLIT-02]

# Metrics
duration: 25min
completed: 2026-07-01
---

# Phase 04 Plan 01: Cookie/Security Policy Content-Type Quadruplets Summary

**Two new Strapi v5 content-types (`cookie-policy`, `security-policy`) with full REST CRUD + custom `/reorder` endpoints, replicated byte-for-byte from the existing `term` pattern**

## Performance

- **Duration:** ~25 min
- **Tasks:** 2 completed
- **Files modified:** 10 created, 0 modified

## Accomplishments
- `apps/strapi/src/api/cookie-policy/` — schema (`cookie_policies` table), hand-rolled controller (find/findOne/create/update/delete/reorder), core router, custom reorder route, pass-through service
- `apps/strapi/src/api/security-policy/` — same 5-file quadruplet for `security_policies`
- Both content-types type-check cleanly; zero collision with the unrelated `condition` (ad item-condition) content-type

## Task Commits

Each task was committed atomically:

1. **Task 1: Create cookie-policy content-type quadruplet** - `9040270f` (feat)
2. **Task 2: Create security-policy content-type quadruplet** - `a34ac25a` (feat)

## Files Created/Modified
- `apps/strapi/src/api/cookie-policy/content-types/cookie-policy/schema.json` - collection `cookie_policies`, fields title/text/order
- `apps/strapi/src/api/cookie-policy/controllers/cookie-policy.ts` - hand-rolled find/findOne/create/update/delete/reorder
- `apps/strapi/src/api/cookie-policy/routes/cookie-policy.ts` - core router registration
- `apps/strapi/src/api/cookie-policy/routes/01-custom-cookie-policy.ts` - `POST /cookie-policies/reorder`
- `apps/strapi/src/api/cookie-policy/services/cookie-policy.ts` - pass-through core service
- `apps/strapi/src/api/security-policy/content-types/security-policy/schema.json` - collection `security_policies`, fields title/text/order
- `apps/strapi/src/api/security-policy/controllers/security-policy.ts` - hand-rolled find/findOne/create/update/delete/reorder
- `apps/strapi/src/api/security-policy/routes/security-policy.ts` - core router registration
- `apps/strapi/src/api/security-policy/routes/01-custom-security-policy.ts` - `POST /security-policies/reorder`
- `apps/strapi/src/api/security-policy/services/security-policy.ts` - pass-through core service

## Decisions Made
- Followed the plan's exact API id choice (`cookie-policy`/`security-policy`) and file layout — no naming deviation.
- Variable names inside controllers renamed to `cookiePolicy(ies)`/`securityPolicy(ies)` for readability (UID substitution alone would leave misleading `term`-named locals); functionally identical to `term.ts`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- This worktree was missing the phase 04 planning directory (`04-*.md` files) and the 4 source `docs/*.md` legal files at task start — another parallel worktree (`ab81527c2a2cd755b`) had already committed them on its own branch. Copied the phase-planning docs (PLAN/RESEARCH/CONTEXT/DISCUSSION-LOG) into this worktree as **untracked, read-only reference** (not committed — matches the pattern already used by the third parallel worktree `af870652154a33390`) purely so the plan/research could be read. The 4 `docs/*.md` legal-source files were copied in error, then deleted before any commit — they belong to plan 04-02, not 04-01, and are not part of this plan's scope or commits.
- `ROADMAP.md` and `STATE.md` in this worktree also lacked the Phase 4 section (never synced from the other worktree). Added the Phase 4 section to `ROADMAP.md` and flipped 04-01 to `[x]` as part of this plan's completion. **Flag for orchestrator:** since every parallel executor working phase 4 touches these two files independently from a divergent base, expect merge conflicts/reconciliation on `ROADMAP.md` and `STATE.md` — this worktree's edits should be treated as one of several equivalent reconciliation points, not sole source of truth.
- `npx tsc --noEmit` in `apps/strapi` surfaces pre-existing, unrelated errors (`src/middlewares/upload.ts` file-type/mimetype issues, `src/utils/ia.ts` missing `opik` module) that predate this plan and are untouched by it. Confirmed via targeted grep that zero tsc errors reference `cookie-policy` or `security-policy`.

## User Setup Required

None - no external service configuration required. (Note: Plan 04-09 will require manual Strapi admin permission grants for these content-types before they are publicly readable — not part of this plan's scope.)

## Next Phase Readiness
- Both REST APIs (`/cookie-policies`, `/security-policies`) are structurally ready for Plan 04-02 (seeders) to populate content, and Plan 04-03+ (frontend types/stores/pages/dashboard) to consume them.
- No blockers. Public permissions still need the manual grant tracked in Plan 04-09.

---
*Phase: 04-split-legal-pages-into-4-documents-with-dashboard-management*
*Completed: 2026-07-01*
