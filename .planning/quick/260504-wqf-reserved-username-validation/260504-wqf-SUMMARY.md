---
phase: 260504-wqf
plan: 01
type: quick
subsystem: auth
tags: [reserved-usernames, registration, route-collision, validation]
dependency_graph:
  requires: []
  provides: [RESERVED_USERNAMES constant, frontend reserved-username validation, backend reserved-username rejection]
  affects: [apps/website/app/shared/constants.ts, apps/website/app/components/FormRegister.vue, apps/website/app/components/FormUsername.vue, apps/website/app/pages/[slug].vue, apps/strapi/src/extensions/users-permissions/controllers/authController.ts]
tech_stack:
  added: []
  patterns: [yup .test() for reserved validation, Set for O(1) backend lookup, runtime guard in handleSubmit]
key_files:
  created: []
  modified:
    - apps/website/app/shared/constants.ts
    - apps/website/app/components/FormRegister.vue
    - apps/website/app/components/FormUsername.vue
    - apps/website/app/pages/[slug].vue
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
decisions:
  - RESERVED_USERNAMES is a frontend const array (for includes type narrowing) and a backend Set (for O(1) lookup) — no cross-app import
  - Backend owns its own copy of the list; duplication is intentional (defence-in-depth, no coupling)
  - FormRegister uses a runtime guard in handleSubmit (not yup) because username is derived programmatically from email, not from a schema field
  - OAuth suffix uses Math.random().toString(36).slice(2,6) — 4-char alphanumeric, ~1.7M combinations, avoids extra DB query
  - [slug].vue now uses RESERVED_USERNAMES import — eliminates dual-maintenance and adds 9 missing slugs
metrics:
  duration_seconds: 200
  completed_date: "2026-05-05"
  tasks_completed: 2
  files_changed: 5
---

# Phase 260504-wqf Plan 01: Reserved Username Validation Summary

**One-liner:** RESERVED_USERNAMES constant + frontend Yup/guard validation + Strapi 400 rejection + OAuth auto-rename suffix for 18 first-level route slugs.

## What Was Built

Prevents route collisions on `waldo.click/[slug]` — if a user could register with `username = "blog"`, the `/blog` page would become unreachable. This plan adds three-layer protection:

1. **Single source of truth (frontend):** `RESERVED_USERNAMES` exported from `apps/website/app/shared/constants.ts` with all 18 first-level page slugs.

2. **FormUsername.vue (username change):** Yup `.test('reserved', ...)` chained after `.matches()` — shows "Este nombre de usuario no está disponible" inline before the API is called.

3. **FormRegister.vue (new registration):** Runtime guard in `handleSubmit` after `form.value.username = emailParts[0]`. Fires Swal error and resets `loading.value` before the API call.

4. **[slug].vue (route guard):** Replaced the incomplete inline `excludedRoutes` array (10 slugs, missing 8) with `RESERVED_USERNAMES` import (18 slugs). Single maintenance point.

5. **authController.ts — registerUserLocal:** `RESERVED_USERNAMES.has(username.toLowerCase())` check between required-fields validation and `validatePasswordStrength`. Returns `ctx.badRequest('Username not available')`.

6. **authController.ts — registerUserAuth (OAuth):** Post-creation rename: if the OAuth-derived username is reserved, append a 4-char random alphanumeric suffix, update the DB row, and reflect the corrected name in the response body.

## Commits

| Task | Commit | Files |
|------|--------|-------|
| 1: Add RESERVED_USERNAMES + wire frontend | 75de0899 | constants.ts, FormRegister.vue, FormUsername.vue, [slug].vue |
| 2: Backend reserved-username validation | 88881641 | authController.ts |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Deferred Issues

- **Username change endpoint has no backend guard:** `FormUsername.vue` → `meStore.saveUsername()` has frontend Yup validation only. A direct API caller could bypass it by patching `/users/me` with a reserved username. Adding backend protection for the update flow requires modifying the me-update middleware — this is out of scope for this plan (Rule 4 candidate) and documented here for future attention.

- **Pre-existing users with reserved usernames are not migrated.** Any user who registered `username = "blog"` before this fix will now have an unreachable profile at `/blog` (the slug guard will throw 404). The plan is preventative-only; a one-time migration script would be needed to fix existing collisions.

## Self-Check: PASSED

- `apps/website/app/shared/constants.ts` — FOUND: exports `RESERVED_USERNAMES` with 18 slugs
- `apps/website/app/components/FormUsername.vue` — FOUND: `.test('reserved', ...)` chained after `.matches()`
- `apps/website/app/components/FormRegister.vue` — FOUND: `RESERVED_USERNAMES.includes(...)` guard in `handleSubmit`
- `apps/website/app/pages/[slug].vue` — FOUND: uses `RESERVED_USERNAMES` import, no inline `excludedRoutes`
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — FOUND: `RESERVED_USERNAMES` Set + check in `registerUserLocal` + rename logic in `registerUserAuth`
- Commit 75de0899 — FOUND
- Commit 88881641 — FOUND
- TypeScript checks: website (nuxt typecheck) — no errors; strapi (tsc --noEmit) — no errors
