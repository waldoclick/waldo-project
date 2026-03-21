---
phase: quick
plan: 260321-hje
subsystem: strapi-middleware
tags: [security, middleware, pro-subscription, privilege-escalation]
dependency_graph:
  requires: []
  provides: [protect-user-fields-middleware]
  affects: [PUT /api/users/:id]
tech_stack:
  added: []
  patterns: [Koa middleware, Strapi global middleware registration]
key_files:
  created:
    - apps/strapi/src/middlewares/protect-user-fields.ts
    - apps/strapi/src/middlewares/protect-user-fields.test.ts
  modified:
    - apps/strapi/config/middlewares.ts
decisions:
  - Middleware placed BEFORE global::user-registration so it runs on the request side (before next()) — user-registration runs after next() on the response side
  - Handles both body.data wrapper and flat body format for forward-compatibility
  - console.warn chosen for stripped-field audit log (consistent with Strapi default logger, no logtail dependency needed for a middleware this lightweight)
metrics:
  duration: ~12 minutes
  completed: "2026-03-21"
  tasks_completed: 2
  files_changed: 3
---

# Quick Task 260321-hje: protect-user-fields middleware Summary

Koa middleware that strips 14 protected fields from `PUT /api/users/:id` before the Strapi handler processes the request, preventing privilege escalation via the public user update endpoint.

## What Was Built

### Task 1: protect-user-fields middleware + tests (TDD)

**RED:** 8 failing Jest tests written first covering all scenarios.

**GREEN:** Middleware implemented at `apps/strapi/src/middlewares/protect-user-fields.ts`:
- Fires only on `PUT` requests matching `/^\/api\/users\/\d+$/`
- Strips the 14 protected fields listed in `PROTECTED_USER_FIELDS` from `ctx.request.body.data` (Strapi convention) or flat `ctx.request.body`
- Emits `console.warn` with userId and stripped field names for audit trail
- Always calls `await next()` — request is never blocked, only sanitized

Protected fields (14 total):
- PRO subscription: `pro`, `pro_status`, `pro_expires_at`, `tbk_user`, `pro_card_type`, `pro_card_last4`, `pro_inscription_token`
- Dedicated endpoints: `username` (90-day cooldown), `avatar`, `cover`
- Auth/system: `role`, `provider`, `confirmed`, `blocked`

All 8 tests pass.

### Task 2: Middleware registration + PRO flow verification

Registered `global::protect-user-fields` in `apps/strapi/config/middlewares.ts` before `global::user-registration`.

**Verified payment controller (`payment.ts` line 488):**
```
pro: true  // inside strapi.entityService.update("plugin::users-permissions.user", ...)
```
This is server-side code in a Strapi controller — it calls `strapi.entityService.update` directly, which bypasses HTTP middleware entirely. The middleware does NOT interfere.

**Verified subscription cron (`subscription-charge.cron.ts` line 157):**
```
pro: false  // inside strapi.entityService.update("plugin::users-permissions.user", ...)
```
Same: server-side cron calls `entityService.update` directly. Unaffected by the middleware.

TypeScript compiles without errors.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

Files exist:
- `apps/strapi/src/middlewares/protect-user-fields.ts` — FOUND
- `apps/strapi/src/middlewares/protect-user-fields.test.ts` — FOUND
- `apps/strapi/config/middlewares.ts` — FOUND (modified)

Commits:
- `f041fc5c` — test: RED phase (8 failing tests)
- `8df9ecdb` — feat: GREEN phase (middleware implementation)
- `795950f2` — chore: middleware registration in config
