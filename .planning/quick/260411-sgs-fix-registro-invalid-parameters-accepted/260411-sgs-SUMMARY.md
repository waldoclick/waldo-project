---
phase: 260411-sgs
plan: "01"
subsystem: strapi/auth
tags: [bug-fix, registration, users-permissions, consent]
dependency_graph:
  requires: []
  provides: [working-user-registration-with-consent-persistence]
  affects: [apps/website FormRegister.vue registration flow]
tech_stack:
  added: []
  patterns: [strapi-db-query-post-register-update, strip-then-persist-consent-fields]
key_files:
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
decisions:
  - Strip accepted_* fields from the forwardBody sent to the built-in register action; persist them via strapi.db.query update on the created user after the original controller succeeds
metrics:
  duration: "~5 minutes"
  completed_date: "2026-04-12"
  tasks_completed: 1
  files_modified: 1
---

# Phase 260411-sgs Plan 01: Fix registro Invalid parameters accepted Summary

Strip-then-persist pattern in registerUserLocal eliminates "Invalid parameters: accepted_age_confirmation, accepted_terms" error by excluding consent booleans from the built-in register body and writing them directly on the created user row via strapi.db.query.

## What Was Done

### Task 1 — Fix registerUserLocal to strip consent fields before registration and persist them after

**Commit:** ee9567bc

The `registerUserLocal` wrapper in `authController.ts` was broken in two ways:

1. `accepted_age_confirmation` and `accepted_terms` were included in the object assigned to `ctx.request.body` before calling Strapi's built-in `registerController`. Strapi v5 validates the body against a strict allow-list and rejects custom schema attributes with `Invalid parameters: <field-list>`.
2. `accepted_usage_terms` (added in quick task 260405-tf1) was never destructured, never validated in the guard, and never persisted.

**Fix applied:**
- Added `accepted_usage_terms` to the destructuring block.
- Extended the required-fields guard: also rejects when `accepted_usage_terms !== true`.
- Replaced `userData` (which leaked all three `accepted_*` fields) with `forwardBody` — an object containing only the fields native to the built-in register action (`is_company`, `firstname`, `lastname`, `rut`, `email`, `password`, `username`).
- After `await registerController(ctx)` succeeds and `user.id` is available, persists all three consent booleans via `strapi.db.query("plugin::users-permissions.user").update(...)`.
- Consent persistence runs BEFORE `createUserReservations(user)` as required.
- Updated JSDoc to document the strip-then-persist pattern per CLAUDE.md middleware rule.
- All existing side-effects (ad reservations, MJML email confirmation) remain intact in the same order.

**TypeScript:** `cd apps/strapi && yarn tsc --noEmit` exits with no errors.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- File `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` confirmed modified.
- Commit `ee9567bc` confirmed in git log.
- `git grep accepted_usage_terms authController.ts` returns lines 72, 95, 109, 145 (comment, destructure, guard, update call).
- `git grep "ctx.request.body = " authController.ts` returns only line 129 (`forwardBody` assignment — no `accepted_*` keys).
- TypeScript compiles clean.

## Checkpoint: Awaiting Human Verification

Task 2 requires end-to-end manual registration test. See plan for steps.
