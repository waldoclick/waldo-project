---
phase: 03-validacion-ia-de-campos-de-texto-libre-en-el-registro-boolean-por-campo-fail-open
plan: 01
subsystem: api
tags: [ai, field-validation, fail-open, jest, tdd, strapi, typescript]

# Dependency graph
requires:
  - phase: 02-mover-ia-a-endpoints-de-dominio
    provides: ai-provider orchestrator with Cerebras default + 5-provider fallback chain
provides:
  - validateFields(fields) — generic fail-open AI boolean-per-field validator
  - generate(prompt) — additive generic export on ai-provider (reused by field-validation)
  - field-validation service directory (types/config/service/index) per CLAUDE.md convention
affects:
  - 03-02 (registration controller that will consume validateFields)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - withTimeout() helper with Promise.race + clearTimeout in finally (no dangling handles)
    - allTrue(fields) fail-open default — every failure path returns all-true, never throws
    - stripFences() removes ``` code fences from fallback-provider responses before JSON.parse
    - parsed[key] !== false — only literal false blocks; missing/non-boolean → true
    - generateArticleDraft delegates to generate() — shared orchestration in one method

key-files:
  created:
    - apps/strapi/src/services/field-validation/field-validation.types.ts
    - apps/strapi/src/services/field-validation/field-validation.config.ts
    - apps/strapi/src/services/field-validation/field-validation.service.ts
    - apps/strapi/src/services/field-validation/index.ts
    - apps/strapi/tests/services/field-validation/field-validation.service.test.ts
  modified:
    - apps/strapi/src/services/ai-provider/ai-provider.types.ts
    - apps/strapi/src/services/ai-provider/ai-provider.service.ts
    - apps/strapi/src/services/ai-provider/index.ts

key-decisions:
  - "withTimeout clears the timer in finally — no dangling handles across all 9 test paths"
  - "validateFields iterates REQUESTED keys (not parsed keys) — guarantees missing fields default to true without extra logic"
  - "generateArticleDraft delegates to generate() — shared fallback chain, zero behavior change to article generation"
  - "JSON.parse result cast to Record<string, unknown> — no any anywhere in new files"

patterns-established:
  - "withTimeout<T>(promise, ms) pattern: Promise.race + clearTimeout in finally — use for all future AI timeout wrappers"
  - "Fail-open service pattern: try/catch outer + nested inner catch for parse; all paths resolve, never reject"
  - "Fence-stripping before JSON.parse: strip /^```(?:json)?/i from fallback provider responses"

requirements-completed: []

# Metrics
duration: 6min
completed: 2026-06-15
---

# Phase 03 Plan 01: Field Validation Service Summary

**Generic fail-open AI field validator (validateFields) with 3.5s timeout, JSON fence-stripping, and 9-case TDD test matrix — explicit false is the only thing that can block a registration**

## Performance

- **Duration:** 6 min
- **Started:** 2026-06-15T21:50:46Z
- **Completed:** 2026-06-15T21:57:03Z
- **Tasks:** 2 (3 commits: feat + test/RED + feat/GREEN)
- **Files modified:** 8

## Accomplishments
- Added additive `generate(prompt)` method to `AiProviderService` and its interface; `generateArticleDraft` delegates to it — zero behavior change, 5 existing tests still green
- Created `field-validation` service directory with types/config/service/index following CLAUDE.md Strapi convention; zero `any` in all new files
- Implemented `validateFields` with `withTimeout` (clears timer in `finally`), `allTrue` fail-open default, `stripFences` for fallback-provider fenced JSON, and `parsed[key] !== false` invariant
- Full 9-case TDD test matrix green: explicit false preserved, all-true passthrough, fail-open on throw/timeout/unparseable JSON, fence-stripping, missing field defaults to true, empty input no-op, non-boolean as true

## Task Commits

Each task was committed atomically:

1. **Task 1: Add additive generate() export to ai-provider** - `3f3d06a7` (feat)
2. **Task 2 RED: Failing test matrix for field-validation** - `28ad73db` (test)
3. **Task 2 GREEN: Implement validateFields** - `55e28f91` (feat)

**Plan metadata:** _(docs commit follows)_

_Note: Task 2 is TDD — test commit (RED) followed by implementation commit (GREEN)_

## Files Created/Modified
- `apps/strapi/src/services/ai-provider/ai-provider.types.ts` - Added `generate(prompt)` to `IAiProviderService` interface
- `apps/strapi/src/services/ai-provider/ai-provider.service.ts` - Extracted loop into `generate()`; `generateArticleDraft` delegates
- `apps/strapi/src/services/ai-provider/index.ts` - Added `export const generate` alongside `generateArticleDraft`
- `apps/strapi/src/services/field-validation/field-validation.types.ts` - `FieldMap`, `ValidationResult`, `IFieldValidationService`
- `apps/strapi/src/services/field-validation/field-validation.config.ts` - `TIMEOUT_MS = 3500`, `buildValidationPrompt(fields)`
- `apps/strapi/src/services/field-validation/field-validation.service.ts` - `validateFields`, `withTimeout`, `allTrue`, `stripFences`
- `apps/strapi/src/services/field-validation/index.ts` - Re-exports per CLAUDE.md convention
- `apps/strapi/tests/services/field-validation/field-validation.service.test.ts` - 9-case test matrix with fake timer for timeout test

## Decisions Made
- `withTimeout` clears the `setTimeout` timer in a `finally` block — avoids open handles that would otherwise hang `jest` (Tests 1-3, 5-9 all resolve immediately but still need cleanup)
- REQUESTED keys iteration (`Object.keys(fields)`) rather than parsed-response keys — one expression handles missing-key-defaults-true (Test 7) and non-boolean-as-true (Test 9) without branching
- `generateArticleDraft` delegates to `generate()` rather than duplicating the loop — DRY; only one place to change the fallback chain; byte-identical behavior confirmed by 5 existing tests
- `JSON.parse(...) as Record<string, unknown>` cast — follows CLAUDE.md no-any rule; avoids `any` from `JSON.parse` return type

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None — all 9 tests passed on the first GREEN implementation.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- `validateFields` is ready for plan 03-02 to wire into the registration controller/middleware
- Caller (03-02) will pass `{ firstname: user.firstname, lastname: user.lastname }` and check if any value is `false`
- The service stays generic — it does not hardcode which fields to validate

---
*Phase: 03-validacion-ia-de-campos-de-texto-libre-en-el-registro-boolean-por-campo-fail-open*
*Completed: 2026-06-15*
