---
phase: quick
plan: 260321-hje
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/middlewares/protect-user-fields.ts
  - apps/strapi/config/middlewares.ts
  - apps/strapi/src/middlewares/protect-user-fields.test.ts
autonomous: true
requirements: [PROTECT-PRO-FIELDS]
must_haves:
  truths:
    - "PUT /api/users/:id cannot set pro, pro_status, pro_expires_at, tbk_user, pro_card_type, pro_card_last4, or pro_inscription_token"
    - "PUT /api/users/:id cannot set username, avatar, or cover (dedicated endpoints exist for these)"
    - "Oneclick inscription finish sets pro=true on first successful payment"
    - "Subscription charge cron sets pro=false when charge attempts exhausted"
    - "Normal profile fields (firstname, lastname, address, phone, etc.) still update correctly"
  artifacts:
    - path: "apps/strapi/src/middlewares/protect-user-fields.ts"
      provides: "Koa middleware that strips protected fields from PUT /api/users/:id body"
    - path: "apps/strapi/src/middlewares/protect-user-fields.test.ts"
      provides: "Jest tests for the middleware"
  key_links:
    - from: "apps/strapi/config/middlewares.ts"
      to: "apps/strapi/src/middlewares/protect-user-fields.ts"
      via: "Strapi middleware registration"
    - from: "apps/strapi/src/api/payment/controllers/payment.ts"
      to: "plugin::users-permissions.user"
      via: "strapi.entityService.update with pro=true (line 488)"
      pattern: "pro: true"
    - from: "apps/strapi/src/cron/subscription-charge.cron.ts"
      to: "plugin::users-permissions.user"
      via: "strapi.entityService.update with pro=false (line 157)"
      pattern: "pro: false"
---

<objective>
Protect sensitive PRO subscription fields on the user update endpoint to prevent privilege escalation.

Purpose: The standard Strapi `PUT /api/users/:id` endpoint passes all request body fields directly to the database update. A malicious client could set `pro: true` or modify other subscription fields. This plan adds a middleware to strip these fields, ensuring only the payment system and cron can toggle PRO status.

Output: A Strapi middleware that sanitizes user update requests, plus verification that the oneclick and cron flows correctly manage PRO status.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/strapi/src/extensions/users-permissions/strapi-server.ts
@apps/strapi/src/middlewares/user-registration.ts
@apps/strapi/config/middlewares.ts
@apps/strapi/src/api/payment/controllers/payment.ts (lines 475-502 — oneclick finish sets pro=true)
@apps/strapi/src/cron/subscription-charge.cron.ts (lines 147-164 — exhausted deactivation sets pro=false)

<interfaces>
<!-- The standard Strapi PUT /api/users/:id accepts ctx.request.body with arbitrary fields.
     The middleware intercepts BEFORE the default handler and strips protected fields. -->

From apps/strapi/src/middlewares/user-registration.ts (reference pattern for Strapi middleware):
```typescript
export default (
  config: Record<string, unknown>,
  { strapi }: { strapi: Core.Strapi }
) => {
  return async (ctx: Context, next: () => Promise<void>) => {
    // Middleware runs BEFORE next() to modify request, or AFTER to modify response
    await next();
  };
};
```

Protected fields that MUST be stripped from PUT /api/users/:id:
- `pro` — only payment system can toggle
- `pro_status` — only payment system / cron can change
- `pro_expires_at` — only payment system / cron can change
- `tbk_user` — Transbank token, set by payment system only
- `pro_card_type` — set by payment system only
- `pro_card_last4` — set by payment system only
- `pro_inscription_token` — set by payment system only
- `username` — has dedicated endpoint (PUT /users/username) with 90-day cooldown
- `avatar` — has dedicated endpoint (PUT /users/avatar)
- `cover` — has dedicated endpoint (PUT /users/cover)
- `role` — must never be changed by user
- `provider` — must never be changed by user
- `confirmed` — must never be changed by user
- `blocked` — must never be changed by user
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create protect-user-fields middleware with tests</name>
  <files>apps/strapi/src/middlewares/protect-user-fields.ts, apps/strapi/src/middlewares/protect-user-fields.test.ts</files>
  <behavior>
    - Test 1: PUT /api/users/123 with `{ data: { pro: true, firstname: "Alice" } }` strips `pro`, keeps `firstname`
    - Test 2: PUT /api/users/123 with `{ data: { pro_status: "active", pro_expires_at: "...", tbk_user: "...", lastname: "Smith" } }` strips all pro fields, keeps `lastname`
    - Test 3: PUT /api/users/123 with `{ data: { username: "hack", avatar: 5, cover: 3, phone: "123" } }` strips username/avatar/cover, keeps `phone`
    - Test 4: PUT /api/users/123 with `{ data: { role: 1, provider: "local", confirmed: true, blocked: true, address: "Main St" } }` strips role/provider/confirmed/blocked, keeps `address`
    - Test 5: GET /api/users/me does NOT trigger the middleware (only PUT /api/users/:id)
    - Test 6: PUT /api/users/123 with only safe fields passes them all through
    - Test 7: Middleware calls next() in all cases (does not block the request)
    - Test 8: PUT /api/users/123 with `{ firstname: "Alice" }` (no `data` wrapper) — body without `data` key is left alone (Strapi handles format)
  </behavior>
  <action>
    Create the middleware at `apps/strapi/src/middlewares/protect-user-fields.ts`:
    - Export default function matching Strapi middleware signature: `(config, { strapi }) => (ctx, next) => {}`
    - BEFORE calling `next()`, check if `ctx.request.method === "PUT"` and `ctx.request.path` matches `/api/users/:id` pattern (regex: `/^\/api\/users\/\d+$/`)
    - If matched, check `ctx.request.body` for a `data` key (the Strapi convention). If `ctx.request.body.data` exists, delete all protected fields from it. If `ctx.request.body` has no `data` key but has fields directly, delete protected fields from `ctx.request.body` directly.
    - Protected fields constant: `PROTECTED_USER_FIELDS = ["pro", "pro_status", "pro_expires_at", "tbk_user", "pro_card_type", "pro_card_last4", "pro_inscription_token", "username", "avatar", "cover", "role", "provider", "confirmed", "blocked"]`
    - Always call `await next()` regardless of path match.
    - Log a warning via `console.warn` when fields are stripped (include userId from path and field names stripped) for audit trail.

    Create tests at `apps/strapi/src/middlewares/protect-user-fields.test.ts`:
    - Jest tests following AAA pattern
    - Mock ctx object with request.method, request.path, request.body
    - Mock next as jest.fn() resolving void
    - No need to mock strapi global (middleware does not use it)
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/strapi && npx jest src/middlewares/protect-user-fields.test.ts --no-coverage</automated>
  </verify>
  <done>All 8 test cases pass. Middleware correctly strips protected fields from PUT /api/users/:id while passing safe fields through.</done>
</task>

<task type="auto">
  <name>Task 2: Register middleware in Strapi config and verify PRO flows</name>
  <files>apps/strapi/config/middlewares.ts</files>
  <action>
    1. Read `apps/strapi/config/middlewares.ts` and add `"global::protect-user-fields"` to the middleware array. Place it BEFORE `"global::user-registration"` so it runs on the request side (before next), while user-registration runs on the response side (after next). The naming convention for custom middlewares in this project is the kebab-case filename without extension.

    2. Verify oneclick sets pro=true: Read `apps/strapi/src/api/payment/controllers/payment.ts` lines 481-499. Confirm it calls `strapi.entityService.update("plugin::users-permissions.user", user.id, { data: { pro: true, pro_status: "active", ... } })`. This is server-side code in a controller, NOT going through the PUT /api/users/:id endpoint, so the middleware does NOT interfere. Document this verification in the summary.

    3. Verify cron sets pro=false: Read `apps/strapi/src/cron/subscription-charge.cron.ts` lines 151-164. Confirm it calls `strapi.entityService.update("plugin::users-permissions.user", user.id, { data: { pro_status: "inactive", pro: false, ... } })`. This is also server-side code, NOT going through the REST endpoint. Document this verification in the summary.

    Note: The middleware only intercepts HTTP requests to `PUT /api/users/:id`. Internal `strapi.entityService.update` calls bypass middleware entirely, so the payment controller and cron job are unaffected.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/strapi && npx tsc --noEmit --pretty 2>&1 | head -30</automated>
  </verify>
  <done>Middleware registered in config. TypeScript compiles without errors. Payment controller and cron confirmed to use strapi.entityService.update directly (not REST endpoint), so they are unaffected by the middleware.</done>
</task>

</tasks>

<verification>
1. `cd apps/strapi && npx jest src/middlewares/protect-user-fields.test.ts --no-coverage` — all tests pass
2. `cd apps/strapi && npx tsc --noEmit` — no type errors
3. Grep confirmation: `grep -n "pro: true" apps/strapi/src/api/payment/controllers/payment.ts` shows line 488
4. Grep confirmation: `grep -n "pro: false" apps/strapi/src/cron/subscription-charge.cron.ts` shows line 157
</verification>

<success_criteria>
- Middleware strips all protected fields (pro, pro_status, pro_expires_at, tbk_user, pro_card_type, pro_card_last4, pro_inscription_token, username, avatar, cover, role, provider, confirmed, blocked) from PUT /api/users/:id
- Safe profile fields (firstname, lastname, address, phone, etc.) pass through unmodified
- Payment controller sets pro=true via strapi.entityService.update (bypasses middleware)
- Subscription cron sets pro=false via strapi.entityService.update (bypasses middleware)
- All tests pass, TypeScript compiles
</success_criteria>

<output>
After completion, create `.planning/quick/260321-hje-protect-pro-fields-in-user-update-endpoi/260321-hje-SUMMARY.md`
</output>
