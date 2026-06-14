# Phase 128: Allow Google-only users to create a local password — Research

**Researched:** 2026-06-13
**Domain:** Strapi v5 users-permissions auth flow — provider field semantics, reset-password mechanism, MJML email templating
**Confidence:** HIGH

## Summary

Google-only users (those who signed up exclusively via Google OAuth or Google One Tap) are stored with `provider: "google"` in the Strapi users table. The existing `overrideForgotPassword` already generates a `resetPasswordToken` and the existing `overrideResetPassword` already validates it and delegates to the built-in `resetPassword` controller — both are usable as-is.

The key findings are: (1) the built-in local `callback` controller filters by `provider: 'local'` explicitly — a user with `provider: 'google'` cannot log in locally even with a valid password until their provider is flipped; (2) the built-in `providers.js` `connect()` function looks up existing users by `email` (no `provider` filter) via `findMany`, then does `_.find(users, { provider })` on the result set — if no user with `provider: 'google'` is found but `unique_email` is enabled, it throws "Email is already taken." This means flipping a user from `provider: 'google'` to `provider: 'local'` **breaks** the standard OAuth grant flow; (3) however, the project does NOT use the standard OAuth grant flow — it uses Google One Tap exclusively, and the `GoogleOneTapService.findOrCreateUser()` looks up by `google_sub` first, then by `email` with no provider filter — the `provider` field is irrelevant to One Tap login; (4) the built-in `resetPassword` controller returns the user object in its response body, which `overrideResetPassword` (the project wrapper) can inspect after calling the original to flip `provider` to `"local"`.

The implementation is therefore: (A) in `overrideForgotPassword`, after finding the user, check `user.provider === 'google'` — if so, send a `create-password.mjml` email with different copy, otherwise send the existing `reset-password.mjml` — same token mechanism in both paths; (B) in `overrideResetPassword`, after calling the original controller succeeds, use `ctx.response.body.user.id` to look up the user and if their provider was `'google'`, flip it to `'local'`. The public endpoint never reveals which path was taken (both return `{ ok: true }`).

**Primary recommendation:** Two targeted changes to `authController.ts` (the provider detection in `overrideForgotPassword` + provider flip in `overrideResetPassword`) plus one new MJML template `create-password.mjml`. No frontend changes, no new pages, no Strapi schema changes.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GOAUTH-128-01 | `overrideForgotPassword` detects Google-only users silently (no public signal) | Detection via `user.provider === 'google'` after the existing `findOne`; silent success preserved — both paths return `{ ok: true }` |
| GOAUTH-128-02 | Google-only users receive a "crear contraseña" MJML email (different template, same token mechanism) | New `create-password.mjml` template, passed to `sendMjmlEmail` in a conditional branch; token generation/save is identical |
| GOAUTH-128-03 | `overrideResetPassword` sets provider to "local" after password creation | Built-in `resetPassword` response body contains `{ jwt, user }` — the user's `id` is available to perform a `db.query(...).update(provider: 'local')` after success |
| GOAUTH-128-04 | After flow completes, user can log in with email/password AND Google OAuth | Google One Tap (`GoogleOneTapService.findOrCreateUser`) looks up by `google_sub` first, then email — NOT filtered by `provider` field, so provider='local' does not break it. Standard grant OAuth does filter by provider (risk), but project does not use standard grant for Google |
| GOAUTH-128-05 | Silent success preserved — endpoint never reveals provider or existence | The existing silent-success pattern in `overrideForgotPassword` is unchanged; the provider detection only changes which template is sent |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `mjml` + `nunjucks` | already installed | MJML email rendering via the project's `sendMjmlEmail` wrapper | Project standard — all transactional emails use `src/services/mjml/` |
| Strapi `strapi.db.query` | Strapi v5 | Database operations | All DB access in project uses `db.query` (Phase 122 migration complete) |

### No New Dependencies
This phase requires zero new npm packages.

---

## Architecture Patterns

### Existing Files Modified
```
apps/strapi/src/extensions/users-permissions/controllers/authController.ts
  — overrideForgotPassword: add Google-only detection + conditional template selection
  — overrideResetPassword: add provider flip after successful reset

apps/strapi/src/services/mjml/templates/create-password.mjml  <- NEW
```

### Pattern 1: Google-only Detection in `overrideForgotPassword`
**What:** After `findOne({ where: { email } })`, check `user.provider === 'google'` to determine which MJML template to send.
**When to use:** Always — the check is silent, both code paths return `{ ok: true }`.
**Example:**
```typescript
// Source: auth.js local callback filter (line 60-65) confirms provider is the right discriminator.
// After the existing user lookup (line ~539 in authController.ts):
const isGoogleOnly = user.provider === 'google';
const template = isGoogleOnly ? 'create-password' : 'reset-password';
const subject = isGoogleOnly ? 'Crea tu contraseña' : 'Restablece tu contraseña';
```

**Important:** The existing `findOne` in `overrideForgotPassword` has no `select` clause — `strapi.db.query` returns all fields by default including `provider` and `password`. No change needed to make detection work.

### Pattern 2: Provider Flip in `overrideResetPassword`
**What:** After the `resetPasswordController(ctx)` call succeeds (i.e., no early return), the response body contains `{ jwt, user }` where `user.id` is the user who was just updated. Use this `id` to check and flip `provider` if it was `'google'`.
**When to use:** Only when `ctx.response.body?.user?.id` is present (i.e., reset succeeded).
**Example:**
```typescript
// After: return resetPasswordController(ctx);
// The wrapper must become async and NOT immediately return — instead:

await resetPasswordController(ctx);

// Flip provider to 'local' if the user was Google-only
const updatedUserId = (ctx.response.body as { user?: { id?: number } })?.user?.id;
if (updatedUserId) {
  const targetUser = await strapi.db
    .query("plugin::users-permissions.user")
    .findOne({ where: { id: updatedUserId }, select: ["id", "provider"] });
  if (targetUser?.provider === "google") {
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: updatedUserId },
      data: { provider: "local" },
    });
  }
}
```

**Note on response body vs return value:** The built-in `resetPassword` controller uses `ctx.send({ jwt, user })` to set the response, NOT a return value. The controller framework reads `ctx.body` directly, not what the controller function returns. `FormResetPassword.vue` ignores the response body entirely (it shows a success alert and redirects to `/`) — so returning the built-in's `{ jwt, user }` body is harmless and correct. This is the same pattern already proven in `overrideAuthLocal`.

**Recommended approach:** Use the response body `user.id` (it is always present on success — confirmed in auth.js line 287-320). Look up provider by id, flip if `'google'`.

### Pattern 3: `create-password.mjml` Template
**What:** A copy of `reset-password.mjml` with different copy for users creating their first password (not resetting one they forgot).
**When to use:** `sendMjmlEmail(strapi, 'create-password', ...)` — identical call signature.
```mjml
{% extends "layouts/base.mjml" %} {% block content %}
<mj-text font-size="16px"> Hola {{ name }}, </mj-text>
<mj-text>
  Tu cuenta en <b>Waldo.click®</b> está vinculada a Google. Haz clic en el botón
  para crear una contraseña y poder iniciar sesión también con tu correo y contraseña:
</mj-text>
<mj-button
  background-color="#ffd699"
  color="#313338"
  font-size="16px"
  border-radius="4px"
  href="{{ resetUrl }}"
>
  Crear contraseña
</mj-button>
<mj-text>
  Si no solicitaste esto, ignora este correo. Tu cuenta no será modificada.
</mj-text>
<mj-text> El enlace es válido por 1 hora. </mj-text>
<mj-text> Saludos,<br />El equipo de <b>Waldo.click®</b> </mj-text>
{% endblock %}
```
**Variables:** `{{ name }}`, `{{ resetUrl }}` — same as `reset-password.mjml`.

### Anti-Patterns to Avoid
- **Do NOT add a new MJML template variable for the URL path:** The reset URL (`/restablecer-contrasena?token=...`) is identical for both flows — the frontend page `restablecer-contrasena.vue` already works for both "reset" and "create" cases.
- **Do NOT change the frontend page or form:** `restablecer-contrasena.vue` and `FormResetPassword.vue` are unchanged. The button label says "Restablecer Contraseña" but that is acceptable — users land there from either email and the flow works identically.
- **Do NOT check `!user.password` as the primary discriminator:** OAuth users in Strapi v5 may or may not get a hashed password. The `provider` field is the safe discriminator.
- **Do NOT call `overrideForgotPassword`'s original controller:** It is already a full replacement (`overrideForgotPassword()` returns a standalone async function — it does not wrap an original). Same pattern must continue.
- **Do NOT use `context` parameter (removed in Phase 125):** The existing code already collapsed the context ternary. Use `FRONTEND_URL` only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom bcrypt logic | Built-in `resetPasswordController` (calls `getService('user').edit`) | The built-in `edit` method handles bcrypt hashing correctly |
| Token generation | New token format | Existing `resetPasswordToken` format (`${Date.now().toString(16)}:${crypto.randomBytes(64).toString('hex')}`) | Already validated by `overrideResetPassword`'s expiry check |
| Email HTML rendering | Manual HTML strings | `sendMjmlEmail(strapi, 'create-password', ...)` | Project standard — all emails go through this wrapper |

---

## Critical Findings

### Finding 1: Local `callback` explicitly filters by `provider: 'local'` (HIGH confidence)
**Source:** `apps/strapi/node_modules/@strapi/plugin-users-permissions/server/controllers/auth.js` lines 60-65
```javascript
const user = await strapi.db.query('plugin::users-permissions.user').findOne({
  where: {
    provider,      // <-- 'local' for email/password login
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  },
});
if (!user) {
  throw new ValidationError('Invalid identifier or password');
}
```
**Implication:** A user with `provider: 'google'` who has a password CANNOT log in via local auth until provider is flipped to `'local'`. GOAUTH-128-03 (provider flip) is mandatory for GOAUTH-128-04 to work.

### Finding 2: Standard grant OAuth (`providers.js`) uses email-only lookup then filters by provider (HIGH confidence)
**Source:** `apps/strapi/node_modules/@strapi/plugin-users-permissions/server/services/providers.js` lines 62-80
```javascript
const users = await strapi.db.query('plugin::users-permissions.user').findMany({
  where: { email },
});
const user = _.find(users, { provider });  // matches user.provider === 'google'
if (_.isEmpty(user) && !advancedSettings.allow_register) {
  throw new Error('Register action is actually not available.');
}
if (!_.isEmpty(user)) {
  return user;  // <- found the google user -> login
}
if (users.length && advancedSettings.unique_email) {
  throw new Error('Email is already taken.');  // <- would fire if provider flipped to 'local'
}
```
**Implication:** If the user's `provider` is flipped from `'google'` to `'local'`, the standard grant OAuth flow would fail: `findMany({ where: { email } })` returns the user, `_.find(users, { provider: 'google' })` finds nothing (user is now `provider: 'local'`), then `unique_email` check fires — "Email is already taken." — **BUT this project does not use the standard grant OAuth for Google** — it uses Google One Tap exclusively.

### Finding 3: Google One Tap lookup is NOT affected by `provider` field (HIGH confidence)
**Source:** `apps/strapi/src/services/google-one-tap/google-one-tap.service.ts` lines 43-64
```typescript
// Step 1: Lookup by google_sub — the stable Google identifier
const byGoogleSub = await strapi.db
  .query("plugin::users-permissions.user")
  .findOne({ where: { google_sub: sub } });
if (byGoogleSub) return { user: byGoogleSub, isNew: false };

// Step 2: Email fallback — no provider filter
const byEmail = await strapi.db
  .query("plugin::users-permissions.user")
  .findOne({ where: { email: normalizedEmail } });
if (byEmail) {
  const updated = await strapi.db.query(...).update({
    where: { id: byEmail.id },
    data: { google_sub: sub },  // links google_sub; does NOT check provider
  });
  return { user: updated, isNew: false };
}
```
**Implication:** After provider is flipped to `'local'`, Google One Tap login continues to work via the `google_sub` lookup (Step 1). GOAUTH-128-04 is achievable without any changes to the One Tap service.

### Finding 4: Built-in `resetPassword` response body always contains `{ jwt, user }` on success (HIGH confidence)
**Source:** `apps/strapi/node_modules/@strapi/plugin-users-permissions/server/controllers/auth.js` lines 286-321
```javascript
async resetPassword(ctx) {
  const { password, passwordConfirmation, code } = await validateResetPasswordBody(ctx.request.body, validations);
  // ...
  const user = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { resetPasswordToken: code } });
  if (!user) throw new ValidationError('Incorrect code provided');
  await getService('user').edit(user.id, { resetPasswordToken: null, password });
  // ...
  return ctx.send({
    jwt: getService('jwt').issue({ id: user.id }),
    user: await sanitizeUser(user, ctx),
  });
}
```
**Implication:** After `await resetPasswordController(ctx)` completes successfully (no throw), `ctx.response.body.user.id` is available. The provider flip can use this id. Note: `resetPasswordToken` is cleared before response — cannot look up by token after the fact.

### Finding 5: `overrideResetPassword` is a wrapper (needs restructuring for post-call work) (HIGH confidence)
**Source:** `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` lines 713-737
```typescript
export const overrideResetPassword =
  (resetPasswordController) => async (ctx) => {
    // ... password strength validation ...
    // ... token expiry validation ...
    return resetPasswordController(ctx);  // <- currently returns immediately
  };
```
**Implication:** The current `return resetPasswordController(ctx)` must become `await resetPasswordController(ctx)` followed by the provider flip logic. The function signature stays the same.

### Finding 6: `overrideForgotPassword` findOne returns all fields including `provider` (HIGH confidence)
**Source:** `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` lines 539-541
```typescript
const user = await strapi.db
  .query("plugin::users-permissions.user")
  .findOne({ where: { email: email.toLowerCase() } });
```
No `select` clause — `strapi.db.query` returns all columns by default. The `provider` field is accessible as `user.provider` without any query change.

---

## Key Questions — Closed

These were the original research questions. All are resolved:

**KQ1: How is the Google OAuth user stored? What fields identify a Google-only account?**
`provider: 'google'` in the users table. Detection: `user.provider === 'google'` after the existing `findOne` (no `select` needed — all fields returned by default). Confirmed from `google-one-tap.service.ts` line 86 where new users are created with `provider: 'google'`.

**KQ2: Does Strapi's built-in resetPassword handle accounts with `provider="google"`?**
Yes. The built-in `resetPassword` looks up the user only by `resetPasswordToken` — it has no `provider` filter. It succeeds for any user whose token matches. The local `callback` (login) has the `provider: 'local'` filter, not `resetPassword`.

**KQ3: Does `overrideAuthLocal` need changes?**
No changes needed. `overrideAuthLocal` wraps the built-in `callback` which already has the `provider: 'local'` filter. Once a user's `provider` is flipped to `'local'` by `overrideResetPassword`, the built-in `callback` finds them on their next email/password login. `overrideAuthLocal` then intercepts and starts the 2-step OTP flow as normal.

**KQ4: What does the existing MJML email infrastructure look like?**
`sendMjmlEmail(strapi, templateName, to, subject, data)` in `src/services/mjml/send-email.ts`. To add a new template: create `src/services/mjml/templates/{name}.mjml` using nunjucks + the `layouts/base.mjml` layout. No config changes needed — nunjucks reads from the templates directory automatically.

**KQ5: Are there issues with the two-step login flow (pendingToken) for Google users who get a local password?**
No issues. After the provider flip, the user's first email/password login goes through `overrideAuthLocal` like any other local user. `overrideAuthLocal` intercepts valid credentials and returns `{ pendingToken, email }` for the OTP step. The OTP email uses `firstname/username/email` (all present on Google-created users). The 2-step flow works identically for converted users.

**KQ6: Does the password strength validator in `overrideResetPassword` already handle this case?**
Yes, no changes needed. `validatePasswordStrength` is called at the top of `overrideResetPassword` before the original controller — it runs for all reset-password requests regardless of the user's current `provider`. The 8-char/uppercase/lowercase/digit rules apply to the "create password" path automatically.

---

## Common Pitfalls

### Pitfall 1: Trying to use `!user.password` as Google-only signal
**What goes wrong:** Strapi may store a hashed random password for OAuth users (behavior is version-specific). The `password` field is also not returned by content API sanitize by default, but `db.query` without `select` does return it.
**Why it happens:** Intuition that "if they signed up via Google, they have no password."
**How to avoid:** Use `user.provider === 'google'` as the primary signal. The `provider` field is the canonical source of truth in users-permissions.
**Warning signs:** Tests passing because mock doesn't set password, production failing because field is populated.

### Pitfall 2: Forgetting that `resetPasswordToken` is cleared before `resetPassword` response
**What goes wrong:** Trying to look up the user after `resetPasswordController(ctx)` by their token to flip the provider — the token is already `null` in the DB.
**Why it happens:** Thinking the token can be re-used for a post-reset lookup.
**How to avoid:** Use `ctx.response.body.user.id` (available in response body after successful reset) to identify the user for the provider flip.

### Pitfall 3: Standard OAuth grant flow regression
**What goes wrong:** If someone later re-enables standard Google OAuth grant (not One Tap), existing Google-converted users (`provider: 'local'`, but `google_sub` set) would fail login via the grant flow.
**Why it happens:** `providers.js` does `_.find(users, { provider: 'google' })` after email lookup.
**How to avoid:** Document this as a known limitation. If the grant flow is ever enabled, the Google login path for converted users would need to fall back to `google_sub` lookup. For now, One Tap is the only Google entry point.

### Pitfall 4: Context parameter removal
**What goes wrong:** Using `context: "website"` from the `FormForgotPassword.vue` POST body to drive template selection in the backend.
**Why it happens:** Old design from pre-Phase-125 that was collapsed.
**How to avoid:** The backend detects the Google-only condition internally from the DB; the `context` parameter sent by the frontend is ignored (and already is ignored in the current implementation per STATE.md).

### Pitfall 5: Existing tests for `overrideForgotPassword` asserting template name
**What goes wrong:** The existing test `"calls sendMjmlEmail exactly once with reset-password template"` will fail if the user under test is detected as Google-only.
**Why it happens:** Tests mock a non-Google user (`provider` not set), so the existing assertions pass for the "reset-password" path. New tests for the "create-password" path must add `provider: 'google'` to the mock user.
**How to avoid:** Existing tests continue to use `testUser` without `provider: 'google'`, which will take the `reset-password` path unchanged. New tests use a separate `googleUser` with `provider: 'google'`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (Strapi) |
| Config file | `apps/strapi/jest.config.ts` |
| Quick run command | `cd apps/strapi && npx jest tests/extensions/users-permissions/controllers/authController.test.ts --no-coverage` |
| Full suite command | `cd apps/strapi && npx jest --no-coverage` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GOAUTH-128-01 | `overrideForgotPassword` with `provider:'google'` user — sends `create-password` template, not `reset-password` | unit | `npx jest tests/extensions/.../authController.test.ts -t "GOAUTH-128-01"` | ✅ (add to existing describe) |
| GOAUTH-128-01 | `overrideForgotPassword` with `provider:'local'` user — still sends `reset-password` (no regression) | unit | same file | ✅ (existing test passes) |
| GOAUTH-128-02 | `sendMjmlEmail` called with `'create-password'` template + `'Crea tu contraseña'` subject | unit | same file | ✅ (add assertion) |
| GOAUTH-128-03 | `overrideResetPassword` — after reset, if user.provider was `'google'`, DB update sets provider to `'local'` | unit | same file, new describe | ✅ (add to existing describe) |
| GOAUTH-128-03 | `overrideResetPassword` — if user was already `provider:'local'`, no provider update is made | unit | same file | ✅ (add) |
| GOAUTH-128-04 | One Tap `findOrCreateUser` with `google_sub` — finds user regardless of `provider` field | unit | `npx jest tests/services/google-one-tap/google-one-tap.service.test.ts` | ✅ (file exists — add case for converted user) |
| GOAUTH-128-05 | `overrideForgotPassword` unknown email still returns `{ ok: true }` with no email sent | unit | same file, existing test | ✅ (already passing) |

### Wave 0 Gaps
None — all test files exist:
- `tests/extensions/users-permissions/controllers/authController.test.ts` — covers `overrideForgotPassword` and `overrideResetPassword`; new tests extend existing `describe` blocks
- `tests/services/google-one-tap/google-one-tap.service.test.ts` — exists; add one case asserting `findOrCreateUser` finds a user with `provider: 'local'` via `google_sub`

---

## Code Examples

### Detecting Google-only in `overrideForgotPassword`
```typescript
// Source: auth.js local callback filter (line 60-65) confirms provider is the right discriminator.
// After the existing user lookup (line ~539 in authController.ts):
const isGoogleOnly = user.provider === 'google';
const template = isGoogleOnly ? 'create-password' : 'reset-password';
const subject = isGoogleOnly
  ? 'Crea tu contraseña'
  : 'Restablece tu contraseña';

await sendMjmlEmail(
  strapi,
  template,
  user.email,
  subject,
  { name: user.firstname || user.username || user.email, resetUrl },
);
```

### Provider flip in `overrideResetPassword`
```typescript
// Change: return resetPasswordController(ctx);
// To: await + provider flip below

await resetPasswordController(ctx);

// If reset succeeded, flip Google-only users to provider:'local'
const responseBody = ctx.response.body as { user?: { id?: number } } | undefined;
const userId = responseBody?.user?.id;
if (userId) {
  const user = await strapi.db
    .query("plugin::users-permissions.user")
    .findOne({ where: { id: userId }, select: ["id", "provider"] });
  if (user?.provider === "google") {
    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: userId },
      data: { provider: "local" },
    });
  }
}
```

**Note:** The original `resetPassword` controller sets the response via `ctx.send({ jwt, user })`. The controller framework reads `ctx.body`, not the function return value. `FormResetPassword.vue` ignores the response body entirely (success alert + redirect to `/`), so the `{ jwt, user }` body returned by the built-in passes through unchanged. No response body manipulation needed.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Context-dependent reset URL (website vs dashboard) | Single FRONTEND_URL for all resets | Phase 125 (dashboard merge) | Reset URL is always `/restablecer-contrasena` — no change needed for this phase |
| Standard Google OAuth grant flow | Google One Tap exclusively | Phase 094-098 (v1.44) | `providers.js` is not in the active code path — provider flip is safe |

---

## Sources

### Primary (HIGH confidence)
- `apps/strapi/node_modules/@strapi/plugin-users-permissions/server/controllers/auth.js` — confirmed `provider: 'local'` filter in local callback, confirmed resetPassword response body shape, confirmed forgotPassword built-in is replaced
- `apps/strapi/node_modules/@strapi/plugin-users-permissions/server/services/providers.js` — confirmed Google OAuth grant flow uses `_.find(users, { provider })` which would be broken if provider is flipped (but grant flow is not active)
- `apps/strapi/src/services/google-one-tap/google-one-tap.service.ts` — confirmed `findOrCreateUser` looks up by `google_sub` first (no `provider` filter), then by `email` (no `provider` filter) — provider flip is safe for One Tap
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — confirmed current `overrideForgotPassword` and `overrideResetPassword` structure, confirmed `findOne` has no `select` (all fields returned including `provider`)
- `apps/strapi/src/services/mjml/index.ts` + `send-email.ts` — confirmed `sendMjmlEmail(strapi, templateName, to, subject, data)` signature
- `apps/strapi/src/services/mjml/templates/reset-password.mjml` — confirmed template structure and variable names (`{{ name }}`, `{{ resetUrl }}`)
- `apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts` — confirmed One Tap controller uses `googleOneTapService.findOrCreateUser` (not the grant flow)

### Secondary (MEDIUM confidence)
- `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts` — confirmed test structure and mock setup for `overrideForgotPassword`, confirms new tests can extend existing describe blocks
- `apps/strapi/tests/services/google-one-tap/google-one-tap.service.test.ts` — confirmed file exists; GOAUTH-128-04 has an automated test home

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies; all tools already in use
- Architecture: HIGH — verified from plugin source and project source
- Pitfalls: HIGH — provider filter verified from plugin source (not from training data)
- Google One Tap compat: HIGH — `findOrCreateUser` source read directly; `provider` field not in lookup
- resetPassword response shape: HIGH — read from plugin source directly

**Research date:** 2026-06-13
**Valid until:** 2026-07-13 (Strapi version pinned; no dependency changes expected)
