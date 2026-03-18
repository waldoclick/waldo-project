---
phase: 093-ad-preview-error-handling
plan: "01"
subsystem: api
tags: [strapi, jest, tdd, error-handling, controller]

# Dependency graph
requires: []
provides:
  - "findBySlug controller wrapped in try/catch — DB errors return clean HTTP 500"
  - "Jest tests for findBySlug: null → notFound, throw → internalServerError, manager → full ad, public → sanitized"
affects: [093-ad-preview-error-handling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "TDD RED-GREEN: test first (unhandled rejection = RED), then try/catch implementation (GREEN)"
    - "strapi.log.error for server-side error logging — stack trace never sent to client"

key-files:
  created:
    - apps/strapi/src/api/ad/controllers/__tests__/ad.findBySlug.test.ts
  modified:
    - apps/strapi/src/api/ad/controllers/ad.ts

key-decisions:
  - "JWT decode block (inner try/catch) kept OUTSIDE the new outer try/catch — already safe, double-nesting would obscure intent"
  - "strapi.log.error (not console.error) — consistent with Strapi v5 logging pattern"
  - "Use factories mock to capture controller extension — avoids importing the full Strapi runtime in tests"

patterns-established:
  - "Controller error guard pattern: try { service call + notFound/send } catch (error) { strapi.log.error + ctx.internalServerError }"

requirements-completed:
  - STRP-01

# Metrics
duration: 2min
completed: 2026-03-18
---

# Phase 093 Plan 01: Ad Preview Error Handling — findBySlug try/catch Summary

**findBySlug controller wrapped in try/catch — DB errors now return clean HTTP 500 with server-side strapi.log.error logging, no stack trace exposed to client**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-18T18:05:57Z
- **Completed:** 2026-03-18T18:08:20Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Wrote 4 failing Jest tests for `findBySlug` (RED) — test B caught the missing try/catch as an unhandled rejection
- Wrapped the service call + response path in `try { } catch (error)` — catch logs via `strapi.log.error` and returns `ctx.internalServerError("Internal server error")`
- All 4 tests pass (GREEN); TypeScript clean; null → notFound path unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Write Jest test scaffold for findBySlug (Wave 0 RED)** - `2a0794a` (test)
2. **Task 2: Add try/catch to findBySlug controller (GREEN)** - `bf0ee50` (feat)

## Files Created/Modified
- `apps/strapi/src/api/ad/controllers/__tests__/ad.findBySlug.test.ts` — 4 Jest tests covering null, throw, manager, public cases
- `apps/strapi/src/api/ad/controllers/ad.ts` — try/catch added around lines 830–846 (service call through ctx.send)

## Decisions Made
- JWT decode inner try/catch kept outside the new outer try — already guarded; nesting would obscure intent
- `strapi.log.error` used (not `console.error`) — aligns with Strapi v5 logging pattern per RESEARCH.md
- Controller captured via factories mock (not runtime import) — avoids Strapi bootstrap in test environment

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- STRP-01 complete — findBySlug now has proper error boundary
- Phase 093 has 1 plan total; this is the only Strapi-side plan
- Ready for phase completion

---
*Phase: 093-ad-preview-error-handling*
*Completed: 2026-03-18*
