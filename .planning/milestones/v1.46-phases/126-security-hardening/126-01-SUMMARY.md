---
phase: 126-security-hardening
plan: "01"
subsystem: strapi-users-permissions
tags: [security, idor, policy, ownership]
dependency_graph:
  requires: []
  provides: [is-users-owner-policy]
  affects: [PUT /api/users/:id]
tech_stack:
  added: []
  patterns: [strapi-v5-route-policy, ownership-check, manager-bypass]
key_files:
  created:
    - apps/strapi/src/extensions/users-permissions/policies/is-users-owner.ts
    - apps/strapi/tests/extensions/users-permissions/is-users-owner.test.ts
  modified:
    - apps/strapi/src/extensions/users-permissions/strapi-server.ts
decisions:
  - "Policy omits third strapi dep param — argsIgnorePattern: ^_ in root .eslintrc.json means _deps is safe; added to satisfy Strapi policy signature for test type compatibility"
  - "Route lookup uses handler === user.update with PUT+path fallback — double guard handles potential Strapi version naming differences"
  - "email and password kept out of PROTECTED_USER_FIELDS — ownership check alone fixes the IDOR without breaking self-service flows"
metrics:
  duration: ~8 minutes
  completed: "2026-06-12"
  tasks_completed: 2
  files_changed: 3
---

# Phase 126 Plan 01: User IDOR Ownership Policy Summary

**One-liner:** Strapi v5 `is-users-owner` route policy on `PUT /api/users/:id` blocks cross-user account-takeover via ownership comparison with manager role bypass.

## What Was Built

Closed a HIGH-severity IDOR vulnerability where any authenticated user could modify any other user's record via `PUT /api/users/:id`. The fix adds a route-level policy that:

1. Runs AFTER users-permissions authentication (so `ctx.state.user` is populated)
2. Compares `String(params.id) === String(user.id)` — rejects (403) mismatches
3. Bypasses for `role.name === "manager"` — managers can update any user record
4. Returns false immediately for unauthenticated requests

## Files

### Created
- `apps/strapi/src/extensions/users-permissions/policies/is-users-owner.ts` — Strapi v5 boolean policy function; pure logic, no Strapi bootstrap required
- `apps/strapi/tests/extensions/users-permissions/is-users-owner.test.ts` — 5 Jest regression tests (cross-user/false, self/true, string-number/true, manager/true, no-user/false)

### Modified
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — Added policy registration block that locates `user.update` route in `plugin.routes["content-api"].routes` and pushes `plugin::users-permissions.is-users-owner` to `config.policies`

## Non-Breaking Guarantees

The three live partial-body callers are ALL self-service (they target the caller's own id):
- `FormPasswordDashboard.vue` → `{ password, currentPassword }` — own user
- `FormEdit.vue` → `{ firstname, lastname, email, username }` — own user
- `user.store.ts updateUserProfile` → full profile — own user

All three pass the ownership check. No behavior change for legitimate callers.

`email` and `password` were deliberately NOT added to `PROTECTED_USER_FIELDS` — the ownership check alone fixes the IDOR for these fields.

## Deviations from Plan

None — plan executed exactly as written.

The plan noted potential Codacy conflict with `_`-prefixed params, but root `.eslintrc.json` has `argsIgnorePattern: "^_"` configured, so `_config` and `_deps` are safe to use.

## Test Results

```
PASS tests/extensions/users-permissions/is-users-owner.test.ts
  is-users-owner policy
    ✓ denies cross-user PUT (returns false)
    ✓ allows self PUT (returns true)
    ✓ allows self PUT with string/number id mismatch (String-safe compare)
    ✓ allows manager for any user id (returns true)
    ✓ denies when no authenticated user (returns false)

Tests: 5 passed, 5 total
```

## Self-Check: PASSED
