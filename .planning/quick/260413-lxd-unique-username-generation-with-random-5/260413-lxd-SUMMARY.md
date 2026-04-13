---
phase: 260413-lxd
plan: "01"
subsystem: strapi-auth
tags: [auth, registration, username, uniqueness, collision]
dependency_graph:
  requires: []
  provides: [unique-username-on-registration]
  affects: [apps/strapi/src/extensions/users-permissions/controllers/authController.ts]
tech_stack:
  added: []
  patterns: [crypto.randomInt for suffix, strapi.db.query findOne for collision check]
key_files:
  created: []
  modified:
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
    - apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts
decisions:
  - ensureUniqueUsername exported (not private) to allow direct Jest unit testing without controller wrapping
  - MAX_ATTEMPTS = 10 hardcoded inside ensureUniqueUsername to avoid shadowing module-level MAX_ATTEMPTS constant (used in verifyCode)
  - crypto not re-imported; existing import at top of file reused
  - Tests do not mock crypto.randomInt so suffix values are real — regex assertion /^gonzalo\d{5}$/ is sufficient
metrics:
  duration_seconds: 156
  completed_date: "2026-04-13"
  tasks_completed: 2
  files_modified: 2
---

# Phase 260413-lxd Plan 01: Unique Username Generation with Random 5-Digit Suffix Summary

JWT auth controller patched with `ensureUniqueUsername` helper that appends a random 5-digit numeric suffix on collision, plus 4 Jest unit tests covering all collision paths.

## What Was Built

### ensureUniqueUsername helper (authController.ts)

Added exported async function directly above `registerUserLocal`:

- Queries `plugin::users-permissions.user` for the base username
- If no collision: returns base unchanged
- If collision: retries up to 10 times with `crypto.randomInt(10000, 100000)` suffixes (5-digit range 10000–99999)
- After 10 failed retries: throws `Error("Could not generate unique username after 10 attempts")`

### Wiring into registerUserLocal

Inserted two lines after the required-field validation block and before `forwardBody` construction:

```ts
// Resolve username collisions by appending a random 5-digit suffix.
// Strapi is the single source of truth — enforce uniqueness here, not on the client.
const uniqueUsername = await ensureUniqueUsername(username);
```

`forwardBody.username` updated to use `uniqueUsername` instead of `username`.

`registerUserAuth` (OAuth) and `apps/website/app/components/FormRegister.vue` were intentionally left untouched per plan scope.

### Jest tests (authController.test.ts)

Added `ensureUniqueUsername` to the import and a new top-level `describe("ensureUniqueUsername")` block with 4 tests:

| Test | Scenario | findOne calls | Result |
|------|----------|---------------|--------|
| 1 | No collision | 1 | Returns base unchanged |
| 2 | Single collision | 2 | Returns `gonzaloXXXXX` matching `/^gonzalo\d{5}$/` |
| 3 | Multiple collisions | 3 | Returns `gonzaloXXXXX` after two retries |
| 4 | Max attempts exceeded | 11 (1+10) | Throws `"Could not generate unique username after 10 attempts"` |

All 4 new tests pass. Pre-existing 4 failures (verifyCode x2, overrideForgotPassword x1, registerUserLocal x1) were confirmed pre-existing before this task and are out of scope.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` contains `ensureUniqueUsername` and `uniqueUsername` wiring.
- Task 1 commit: `ca119c57`
- Task 2 commit: `7d19ca47`
- `yarn build` passes cleanly.
- 4 new tests pass; 4 pre-existing failures unchanged.
