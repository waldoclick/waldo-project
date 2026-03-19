# Phase 082: Email Verification Backend Activation — Research

**Researched:** 2026-03-14
**Domain:** Strapi v5 users-permissions plugin — email_confirmation toggle, DB migration, Admin Panel configuration
**Confidence:** HIGH — all findings verified by reading installed plugin source (`node_modules/@strapi/plugin-users-permissions/dist/server/`) and project codebase directly

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REGV-01 | User who registers via form must confirm their email address before they can log in | Strapi's built-in `email_confirmation` toggle enforces this at the `callback` controller level — no custom code needed; DB migration (REGV-06) must run first |
| REGV-02 | User who registers via Google OAuth is not required to confirm email (bypassed automatically) | Verified in `providers.js` L91: OAuth user creation hardcodes `confirmed: true` — entirely independent of the `email_confirmation` toggle |
| REGV-06 | All existing users are migrated to `confirmed = true` before email confirmation is activated | Must run `UPDATE "up_users" SET confirmed = TRUE WHERE confirmed = FALSE OR confirmed IS NULL` via Strapi's `strapi.db.query` ORM before toggling — or via direct SQL; idempotent |
</phase_requirements>

---

## Summary

Phase 082 is an **operational phase** — there are zero code changes to write. It consists of three atomic, ordered steps executed in a single production session:

1. **DB migration** — set `confirmed = true` on all existing users (prevents lockout)
2. **Admin Panel config** — set `email_confirmation_redirection` to `https://waldo.click/login`
3. **Toggle** — enable `email_confirmation: true` in Strapi Admin Panel → Advanced Settings

All three are irreversible in the sense that toggling activates the enforcement on the next registration/login cycle. The only code artifact this phase may produce is an idempotent migration script (a Strapi seeder or one-shot cron-runner task) that the planner can document as a runbook step.

**CRITICAL gate:** Phase 081 (frontend deployed and verified — score 8/8 ✅) MUST be complete before this phase. The verification report is at `.planning/phases/081-email-verification-frontend/081-VERIFICATION.md`. Reversing the order causes `setToken(undefined)` to corrupt auth state for any user who registers between toggle-on and frontend deploy.

**Primary recommendation:** Use a Strapi `strapi.db.query.updateMany()` migration (same pattern as `ad-draft-migration.ts`) executed via the existing `cron-runner` endpoint or a one-time bootstrap flag. Direct SQL (`psql`/`mysql`) is the faster alternative when direct DB access is available in production.

---

## Standard Stack

### Core (no new packages needed)

| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Strapi Admin Panel | v5.36.1 | Toggle `email_confirmation` and set `email_confirmation_redirection` | These are DB-persisted plugin store values — only configurable via Admin Panel UI (no `config/plugins.ts` override) |
| `strapi.db.query` ORM | Strapi v5 | Run idempotent `updateMany` to set `confirmed=true` on existing users | Established project pattern (`ad-draft-migration.ts`); no raw SQL needed |
| `POST /api/cron-runner/:name` | existing | Trigger migration script manually from Admin Panel or curl | Already wired; safer than direct DB access for auditable one-shots |

### The Two Admin Panel Settings (Advanced Settings page)

| Setting | Field Name | Value to Set | Notes |
|---------|-----------|-------------|-------|
| Enable email confirmation | `email_confirmation` | `true` (toggle ON) | Only after migration + redirect URL is set |
| Redirection URL | `email_confirmation_redirection` | `https://waldo.click/login` | Full URL accepted — Yup regex: `(^$)\|((.*://.*)/?.*)` |

**Verified (source):** `schema.js` in plugin dist: `email_confirmation_redirection` uses `yup.string().matches(URL_REGEX).required()` when `email_confirmation: true` — the regex `(^$)|((.+:\\/\\/.*)(d*)\\/?(.*))` accepts any string containing `://`. A full URL with path like `https://waldo.click/login` passes validation. ✅

**Pre-flight concern resolved:** The STATE.md noted a gap — "need to verify whether `email_confirmation_redirection` accepts a full URL with query params or only a path." The field accepts any URL matching `.*://.*` — including `https://waldo.click/login`. Query params (`?confirmed=true`) are also valid by the regex, but REGV-F01 (confirmation success banner) is deferred to v2, so use the plain `/login` URL.

---

## Architecture Patterns

### How the Toggle Works (source-verified)

**Registration path** — `auth.js` lines 524–543 (installed source):

```javascript
const newUser = {
  ...params,
  role: role.id,
  email: email.toLowerCase(),
  username,
  confirmed: !settings.email_confirmation  // ← false when toggle is ON
};
const user = await getService('user').add(newUser);

if (settings.email_confirmation) {
  await getService('user').sendConfirmationEmail(sanitizedUser);
  return ctx.send({ user: sanitizedUser });  // ← NO JWT returned
}
// Normal path: return { jwt, user }
```

**Login enforcement path** — `auth.js` lines 85–89:

```javascript
const requiresConfirmation = _.get(advancedSettings, 'email_confirmation');
if (requiresConfirmation && user.confirmed !== true) {
  throw new ApplicationError('Your account email is not confirmed');
}
```

**Email confirmation link path** — `GET /api/auth/email-confirmation?confirmation=TOKEN`:
```javascript
await userService.edit(user.id, { confirmed: true, confirmationToken: null });
// Then:
ctx.redirect(settings.email_confirmation_redirection || '/');
```
The redirect target is `email_confirmation_redirection` (stored in plugin store) or `/` if null.

**Key consequence for existing users:** When the toggle is ON, ANY user with `confirmed = false` or `confirmed = NULL` will be rejected at login with `"Your account email is not confirmed"`. The DB migration MUST run before the toggle is flipped.

### Google OAuth — Why It's Unaffected (source-verified)

`providers.js` L86–92 (installed source):

```javascript
const newUser = {
  ...profile,
  email,
  provider,
  role: defaultRole.id,
  confirmed: true  // ← hardcoded, not gated on email_confirmation setting
};
```

The `email_confirmation` toggle only affects the `register` controller path. OAuth flows go through `connect` → `callback` → `providers.connect()` which creates users with `confirmed: true` always. The login enforcement check (`requiresConfirmation && user.confirmed !== true`) also passes because `confirmed = true`.

**Google OAuth is 100% unaffected by this phase.** No code change needed, no configuration needed. ✅

### Existing `registerUserLocal` Wrapper — No Change Needed (source-verified)

`authController.ts` L108–114: `registerUserLocal` wraps the original register controller and reads `ctx.response.body?.user`. When `email_confirmation: true`, the response body still contains `user` (no JWT). `createUserReservations(user)` fires correctly. **No changes to `registerUserLocal`.**

### DB Migration Pattern (established in project)

`ad-draft-migration.ts` is the canonical pattern for idempotent data migrations:

```typescript
// Pattern: findMany targeting unmigrated records → updateMany
const unconfirmedUsers = await strapi.db
  .query("plugin::users-permissions.user")
  .findMany({
    where: {
      $or: [
        { confirmed: { $eq: false } },
        { confirmed: { $null: true } },
      ],
    },
    select: ["id"],
  });

if (unconfirmedUsers.length === 0) {
  console.log("✅ All users already confirmed — migration skipped");
  return;
}

const ids = unconfirmedUsers.map((u) => u.id);

await strapi.db
  .query("plugin::users-permissions.user")
  .updateMany({
    where: { id: { $in: ids } },
    data: { confirmed: true },
  });

console.log(`✅ Migration complete: ${ids.length} users set to confirmed=true`);
```

**Equivalent raw SQL** (for direct DB access):
```sql
UPDATE "up_users"
SET confirmed = TRUE
WHERE confirmed = FALSE OR confirmed IS NULL;
```
Table name `up_users` confirmed by `schema.json` `collectionName` field. Column name `confirmed` confirmed by schema attributes.

### Three-Step Activation Runbook

```
Step 1 — DB Migration (HARD GATE)
  [ ] Verify Phase 081 VERIFICATION.md is status: passed
  [ ] Run migration via cron-runner or direct DB access
  [ ] Verify: SELECT COUNT(*) FROM up_users WHERE confirmed = FALSE OR confirmed IS NULL → must return 0
  [ ] Take note of user count migrated (for incident log)

Step 2 — Configure Redirect URL
  [ ] Strapi Admin Panel → Settings → Users & Permissions → Advanced Settings
  [ ] Set "Redirection url" field to: https://waldo.click/login
  [ ] Click Save — verify no validation error

Step 3 — Enable Toggle (IRREVERSIBLE until manually undone)
  [ ] On the same Advanced Settings page
  [ ] Enable "Enable email confirmation" toggle → ON
  [ ] Click Save
  [ ] Verify: new test registration triggers confirmation email (not login redirect)
  [ ] Verify: existing user can still log in (confirmed=true)
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email confirmation enforcement at login | Custom middleware or controller check | Strapi's native `email_confirmation` toggle | Built into `auth.callback` at line 85–89; runs automatically when toggle is ON |
| Confirmation email sending | Custom `sendMjmlEmail` call on register | Strapi's native `sendConfirmationEmail` | Native Lodash-templated email is acceptable for v1; MJML override is v2 work (MJML-F01) |
| Confirmation link routing | Custom Strapi API endpoint | Native `GET /api/auth/email-confirmation` | Already exists; sets `confirmed=true` and redirects to `email_confirmation_redirection` |
| Resend confirmation email | Custom endpoint | Native `POST /api/auth/send-email-confirmation` | Already used by Phase 081 frontend code in both `confirmar.vue` and `FormLogin.vue` |
| Google OAuth confirmed bypass | Custom middleware guard | Nothing needed | OAuth `providers.js` hardcodes `confirmed: true` at user creation |
| Migration runner | New cron job | One-time execution via `cron-runner` or direct DB | Migration is idempotent; no persistent cron needed; adds complexity for no gain |

**Key insight:** This phase is deliberately zero-code. Every mechanism needed (enforcement, resend, redirect, OAuth bypass) is either native Strapi behavior or was already implemented in Phases 079–081. The only "code" is an idempotent migration script that uses the `strapi.db.query.updateMany()` pattern already established in the project.

---

## Common Pitfalls

### Pitfall 1: Toggle Before Migration
**What goes wrong:** Any user with `confirmed = false` (or NULL) cannot log in after toggle-on. There are N existing users registered before this phase — they all have `confirmed = NULL` or `false` (the schema default is `false`). Toggling without migration locks out the entire existing user base.
**Why it happens:** The login enforcement check is unconditional once the toggle is on.
**How to avoid:** DB migration is a HARD GATE. Verify `COUNT(*) WHERE confirmed != true = 0` before setting the toggle.
**Warning signs:** Login fails with "Your account email is not confirmed" for any existing user.

### Pitfall 2: Toggle Before Frontend Deploy (Phase 081)
**What goes wrong:** Registration returns `{ user }` (no JWT). The old `FormRegister.vue` calls `setToken(undefined)`, corrupting the auth cookie. New users get a broken auth state and cannot proceed.
**Why it happens:** `@nuxtjs/strapi v2`'s `register()` composable blindly calls `setToken(response.jwt)`.
**How to avoid:** Phase 081 VERIFICATION.md must be `status: passed` before this phase starts. Already verified (8/8 truths, 2026-03-14). **This gate is already satisfied.**
**Warning signs:** New registrations result in users being logged in as anonymous or with corrupted session.

### Pitfall 3: Wrong Redirect URL Format
**What goes wrong:** Setting `email_confirmation_redirection` to a path-only value like `/login` (no protocol) — the Yup regex `(.+:\\/\\/.*)` requires `://` — the field will fail validation and cannot be saved.
**How to avoid:** Use the full URL: `https://waldo.click/login`. Verified by reading `schema.js` validation regex and the placeholder example `https://yourfrontend.com/email-confirmation`.
**Warning signs:** Admin Panel shows a validation error when saving Advanced Settings.

### Pitfall 4: Ordering Steps 2 and 3
**What goes wrong:** Enabling the toggle (Step 3) before setting the redirect URL (Step 2). New registrations send the confirmation email. When the user clicks the link, `GET /api/auth/email-confirmation` confirms the user then calls `ctx.redirect(settings.email_confirmation_redirection || '/')`. If the URL is null, it redirects to `/` (Strapi backend root), not the website login page.
**How to avoid:** Always set the redirect URL first, then enable the toggle. Both settings are on the same Admin Panel page — set both before clicking Save.
**Warning signs:** Clicking confirmation link lands the user on the Strapi backend root page instead of the website login.

### Pitfall 5: Migration Idempotency Not Verified
**What goes wrong:** Running the migration twice (e.g., via cron-runner bug) — second run finds 0 unconfirmed users and is a no-op, which is safe. But if the check condition is wrong (e.g., only checking `confirmed = false` but not `confirmed IS NULL`), some users may remain unconfirmed.
**How to avoid:** Migration must filter for BOTH `confirmed = false` AND `confirmed IS NULL`. The schema default is `false`, but any historically-null entries must also be covered.
**Warning signs:** After migration, `SELECT COUNT(*) FROM up_users WHERE confirmed IS NULL` returns > 0.

### Pitfall 6: `overrideAuthLocal` and Unconfirmed User Interaction
**What goes wrong:** Confusion about whether the 2-step login (`overrideAuthLocal`) interferes with unconfirmed users.
**Reality:** `overrideAuthLocal` only intercepts when a JWT is present in the response body (`if (!jwt) return`). The `email_confirmation` enforcement throws before returning a JWT. So unconfirmed users get the original error response, `overrideAuthLocal` returns early, and the error passes through to the frontend correctly. **No interaction, no change needed.** (Verified in STACK.md integration notes.)

---

## Code Examples

### Migration Script (Strapi ORM pattern)

```typescript
// Source: ad-draft-migration.ts (project established pattern)
// Idempotent: safe to run multiple times

const runConfirmedMigration = async (strapi): Promise<void> => {
  console.log("🔄 Migrating unconfirmed users to confirmed=true...");

  const unconfirmedUsers = await strapi.db
    .query("plugin::users-permissions.user")
    .findMany({
      where: {
        $or: [
          { confirmed: { $eq: false } },
          { confirmed: { $null: true } },
        ],
      },
      select: ["id"],
    });

  if (unconfirmedUsers.length === 0) {
    console.log("✅ No unconfirmed users found — migration not needed");
    return;
  }

  const ids = unconfirmedUsers.map((u) => u.id);

  await strapi.db
    .query("plugin::users-permissions.user")
    .updateMany({
      where: { id: { $in: ids } },
      data: { confirmed: true },
    });

  console.log(`✅ Migration complete: ${ids.length} users set to confirmed=true`);
};
```

### Verification Query (raw SQL)

```sql
-- Run BEFORE toggle — must return 0
SELECT COUNT(*) FROM up_users
WHERE confirmed = FALSE OR confirmed IS NULL;

-- Run AFTER migration — verifies success
SELECT COUNT(*) as total,
       SUM(CASE WHEN confirmed = TRUE THEN 1 ELSE 0 END) as confirmed_true,
       SUM(CASE WHEN confirmed = FALSE OR confirmed IS NULL THEN 1 ELSE 0 END) as unconfirmed
FROM up_users;
```

### Post-Activation Smoke Test (curl)

```bash
# Test 1: New registration returns { user } (no JWT) — confirms toggle is ON
curl -X POST https://api.waldo.click/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test_...","email":"smoke_test@...","password":"Test1234!","..."}' \
  | jq 'has("jwt")'
# Expected: false

# Test 2: Existing user can log in (confirmed=true after migration)
curl -X POST https://api.waldo.click/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"existing@user.com","password":"..."}' \
  | jq '.pendingToken != null'
# Expected: true (2-step flow works — user is confirmed so login reaches overrideAuthLocal)
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|-----------------|-------|
| Manual DB UPDATE via psql/mysql shell | Strapi ORM `updateMany()` in seeder/migration script | ORM pattern is project-standard; avoids raw SQL dependency on DB client type |
| Single global reset URL in Admin Panel | Already replaced by `overrideForgotPassword` context routing (Phase 080) | `email_reset_password` Admin Panel field is now irrelevant — overridden in code |
| Strapi plain-text confirmation email | Still using Strapi native (acceptable for v1) | MJML override deferred to MJML-F01 (v2) |

**No deprecated patterns in scope for this phase.**

---

## Open Questions

1. **Migration execution method**
   - What we know: Two options — (a) one-time Strapi seeder via new cron-runner task, or (b) direct SQL via DB shell/admin tool
   - What's unclear: Whether the production deployment environment has direct DB shell access or only the cron-runner HTTP endpoint
   - Recommendation: Plan for BOTH options. Document the Strapi ORM method as primary (cron-runner). Document the raw SQL as fallback. Both are idempotent.

2. **`email_confirmation_redirection` — query params for future banner**
   - What we know: REGV-F01 (confirmation success banner on `/login?confirmed=true`) is deferred to v2
   - What's unclear: Whether setting `https://waldo.click/login?confirmed=true` now (v1) would break anything
   - Recommendation: Use plain `https://waldo.click/login` for v1. The query param variant is additive and non-breaking — a separate Admin Panel config change when REGV-F01 is implemented.

3. **Cron cleanup overlap check**
   - What we know: `verificationCodeCleanupCron` runs at 4 AM daily — no overlap with migration
   - What's unclear: Whether the migration is a seeder (gated on `APP_RUN_SEEDERS`) or a standalone endpoint
   - Recommendation: Do NOT use `APP_RUN_SEEDERS=true` — that also triggers all other seeders (categories, regions, packs) which are idempotent but unnecessary in production. Use a dedicated endpoint or direct SQL.

---

## Validation Architecture

> `workflow.nyquist_validation: true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (Strapi) — but this phase has NO automated unit tests; it is operational |
| Config file | `apps/strapi/jest.config.ts` (if exists) |
| Quick run command | N/A — operational phase |
| Full suite command | `yarn workspace waldo-strapi test` (for regression check) |
| Phase validation | Manual verification steps below |

### Phase Requirements → Validation Map

| Req ID | Behavior | Test Type | Validation Method | Automated? |
|--------|----------|-----------|-------------------|-----------|
| REGV-06 | All users have `confirmed = true` before toggle | database check | `SELECT COUNT(*) FROM up_users WHERE confirmed != TRUE OR confirmed IS NULL` → must return 0 | Manual-SQL |
| REGV-01 | New form registration cannot log in until email confirmed | integration smoke | Register new user → attempt login → expect "not confirmed" error (or `POST /api/auth/local` returns no JWT via 2-step intercept) | Manual-HTTP |
| REGV-02 | Google OAuth registration sets `confirmed=true` automatically | source-verified | Verified in `providers.js` L91: `confirmed: true` hardcoded — no production test needed beyond reading source | Source-verified |
| REGV-01 | Confirmation email link redirects to `waldo.click/login` | integration smoke | Click confirmation link in email → verify landing page is `https://waldo.click/login` | Manual-Browser |

### Sampling Rate

- **Pre-toggle gate:** DB migration count check — `COUNT(*) = 0` is a hard gate
- **Post-toggle smoke:** Manual HTTP test (new registration) + browser test (confirmation link)
- **Phase gate:** All 4 Observable Truths below verified before marking phase complete

### Observable Truths (for VERIFICATION.md)

These are the specific observable truths the verifier must check:

| # | Truth | How to Verify |
|---|-------|--------------|
| 1 | All users have `confirmed = true` (zero lockout risk) | `SELECT COUNT(*) FROM up_users WHERE confirmed != TRUE OR confirmed IS NULL` returns 0 |
| 2 | New form registration: no JWT returned (confirmation required) | `POST /api/auth/local/register` with valid data → response has no `jwt` field |
| 3 | Google OAuth user: `confirmed = true` set at creation | `providers.js` L91 source verification + can query DB for a known OAuth user |
| 4 | Confirmation link redirects to `waldo.click/login` | Click link in confirmation email → lands on `https://waldo.click/login` |

### Wave 0 Gaps

None — this phase has no code files to create. Validation is entirely operational (SQL queries, HTTP smoke tests, browser navigation).

The plan document should include explicit verification steps for each observable truth as part of the runbook.

---

## Sources

### Primary (HIGH confidence)

- `node_modules/@strapi/plugin-users-permissions/dist/server/controllers/auth.js` (v5.36.1) — confirmed email registration path (L524–543), login enforcement (L85–89), emailConfirmation endpoint (L568–598), redirect logic (L597)
- `node_modules/@strapi/plugin-users-permissions/dist/server/services/providers.js` — OAuth user creation with `confirmed: true` (L91)
- `node_modules/@strapi/plugin-users-permissions/dist/server/bootstrap/index.js` — Advanced Settings defaults including `email_confirmation_redirection: null` (L114)
- `node_modules/@strapi/plugin-users-permissions/dist/admin/pages/AdvancedSettings/utils/schema.js` — Yup URL validation regex for `email_confirmation_redirection` (L25–38)
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — `collectionName: "up_users"`, `confirmed` field default `false`
- `apps/strapi/seeders/ad-draft-migration.ts` — canonical ORM migration pattern (`findMany` + `updateMany`)
- `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts` — existing manual task execution endpoint
- `.planning/phases/081-email-verification-frontend/081-VERIFICATION.md` — Phase 081 passed (8/8, 2026-03-14) — prerequisite gate confirmed ✅
- `.planning/research/STACK.md` — `email_confirmation` toggle behavior, `sendConfirmationEmail`, integration notes

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — key decisions: DB migration SQL, ordering rationale, pre-flight gap note
- `apps/strapi/.env.example` — env var reference (`FRONTEND_URL`, `DATABASE_CLIENT`)

---

## Metadata

**Confidence breakdown:**
- DB migration approach: HIGH — same ORM pattern as `ad-draft-migration.ts` already in production
- Toggle behavior: HIGH — verified by reading installed plugin source (`auth.js`, `providers.js`)
- `email_confirmation_redirection` URL format: HIGH — read Yup schema regex from plugin dist
- Pre-flight concern (full URL vs path): RESOLVED — full URL accepted; query params also valid
- Google OAuth bypass: HIGH — hardcoded `confirmed: true` in `providers.js` L91
- Zero code changes needed: HIGH — all mechanisms are native Strapi or already implemented in Phases 079–081

**Research date:** 2026-03-14
**Valid until:** Stable — based on installed plugin v5.36.1; valid until Strapi version upgrade
