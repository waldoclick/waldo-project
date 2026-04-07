---
phase: 106-registration-form-age-and-terms-checkboxes-with-strapi-user-model-booleans
plan: "01"
subsystem: strapi
tags: [registration, consent, validation, user-schema]
dependency_graph:
  requires: []
  provides: [accepted_age_confirmation field on user, accepted_terms field on user, consent validation in registerUserLocal]
  affects: [apps/strapi/src/extensions/users-permissions]
tech_stack:
  added: []
  patterns: [boolean consent fields in Strapi schema, strict equality validation for consent]
key_files:
  created: []
  modified:
    - apps/strapi/src/extensions/users-permissions/content-types/user/schema.json
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
    - apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts
decisions:
  - Consent fields use strict `=== true` check (not truthiness) to prevent spoofing with non-boolean truthy values
  - Both fields stored on userData and passed to Strapi user creation for audit trail
  - 3 pre-existing test failures (strapi.getModel mock, overrideForgotPassword) are out of scope — unchanged
metrics:
  duration: 222s
  completed: "2026-03-29"
  tasks_completed: 2
  files_modified: 3
---

# Phase 106 Plan 01: Add Consent Boolean Fields to User Schema and Registration Summary

Boolean consent fields `accepted_age_confirmation` and `accepted_terms` added to Strapi user schema with server-side strict validation in `registerUserLocal`, enforced by 4 new unit tests.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add boolean fields to user schema and update registerUserLocal | b50ea520 | schema.json, authController.ts |
| 2 | Add registerUserLocal unit tests for consent validation | c1bd4a4a | authController.test.ts |

## What Was Built

### Task 1: Schema + Controller Changes
- Added `accepted_age_confirmation` boolean field (`default: false`) to `schema.json`
- Added `accepted_terms` boolean field (`default: false`) to `schema.json`
- Updated `registerUserLocal` destructuring to include both consent fields from `ctx.request.body`
- Added strict validation: `accepted_age_confirmation !== true || accepted_terms !== true` returns 400
- Both fields added to `userData` object passed to Strapi user creation

### Task 2: Unit Tests
- Imported `registerUserLocal` in `authController.test.ts`
- Added `describe("registerUserLocal")` block with 4 tests using AAA pattern
- Test suite verifies all required behaviors (400 on missing consent, passthrough on valid consent, userData forwarding)

## Verification

- Schema JSON valid: confirmed via `node -e "JSON.parse(...)"`
- All 4 new tests pass
- 29/32 tests pass total (3 pre-existing failures unchanged — out of scope)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — FOUND with `accepted_age_confirmation` and `accepted_terms`
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — FOUND with `accepted_age_confirmation !== true` guard
- `apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts` — FOUND with `describe("registerUserLocal")`
- Commit b50ea520 — FOUND
- Commit c1bd4a4a — FOUND
