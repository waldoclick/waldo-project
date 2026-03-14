# Technology Stack Research

**Project:** Waldo — Email Auth Flows Milestone
**Researched:** 2026-03-13
**Scope:** MJML auth emails + email verification on registration + password reset context routing

---

## Scope Statement

This file answers three precise questions about the Strapi v5.36.1 / `@strapi/plugin-users-permissions@5.36.1` codebase as installed in this project:

1. How does `email_confirmation: true` work, and what APIs does it expose?
2. Does `forgotPassword` support custom email templates? How to override the email it sends?
3. Can a custom `url` parameter be passed to `forgotPassword` so the reset link points to a specific app?

All findings are based on the **installed** plugin source at
`node_modules/@strapi/plugin-users-permissions/server/` — **HIGH confidence** (reading actual runtime code, not docs).

---

## Question 1 — Email Confirmation on Registration

### How the built-in mechanism works (source-verified)

**Config flag:** `email_confirmation` stored in the plugin's database store (`pluginStore.get({ key: 'advanced' })`).
Set via **Strapi Admin Panel → Settings → Users & Permissions → Advanced Settings → "Enable email confirmation: TRUE"**.
There is no code-level way to set it in `config/plugins.ts`; it is a DB-persisted value seeded at bootstrap with default `false`.

**Registration flow change (`auth.js` `register` method, line 603–611):**

```javascript
if (settings.email_confirmation) {
  await getService('user').sendConfirmationEmail(sanitizedUser);
  return ctx.send({ user: sanitizedUser });  // ← NO JWT returned
}
// Normal path: return { jwt, user }
```

**Key consequence:** When `email_confirmation: true`, `POST /api/auth/local/register` returns `{ user }` only — **no JWT**. The user cannot log in until they confirm. The `confirmed` field on the user record is set to `false` at creation.

**Login enforcement (`auth.js` `callback` method, lines 84–89):**

```javascript
const requiresConfirmation = _.get(advancedSettings, 'email_confirmation');
if (requiresConfirmation && user.confirmed !== true) {
  throw new ApplicationError('Your account email is not confirmed');
}
```

This check runs on `POST /api/auth/local` — unconfirmed users get a 400 error.

**`sendConfirmationEmail` (`user.js`, lines 133–195):**
- Generates a random `confirmationToken` via `crypto.randomBytes(20).toString('hex')`
- Saves it to `user.confirmationToken` in DB
- Reads the email template from the plugin store (Admin Panel → Email Templates → "Email address confirmation")
- Template variables: `URL`, `SERVER_URL`, `ADMIN_URL`, `USER` (object), `CODE`
- `URL` is hardcoded to: `${server.absoluteUrl}${apiPrefix}/auth/email-confirmation`
- Uses Lodash `_.template()` — **NOT Nunjucks/MJML**
- Sends via `strapi.plugin('email').service('email').send()`

**Confirmation endpoint:**
`GET /api/auth/email-confirmation?confirmation=<TOKEN>`
Sets `confirmed: true`, clears `confirmationToken`, then redirects to `email_confirmation_redirection` (set in Admin Panel Advanced Settings) or `/`.

**Resend confirmation endpoint:**
`POST /api/auth/send-email-confirmation` with `{ email }` — resends for unconfirmed, non-blocked users.

### Integration with existing `registerUserLocal` wrapper

`registerUserLocal` (`authController.ts`) calls `await registerController(ctx)`, then reads `ctx.response.body?.user`. When `email_confirmation: true`, the body still contains `user` — so `createUserReservations(user)` will still fire correctly. **No changes needed to the wrapper.**

However, the website's `FormRegister.vue` currently expects a JWT back from `useStrapiAuth().register()`. With confirmation enabled, no JWT is returned — **the website's `FormRegister.vue` must handle the no-JWT response gracefully** (show "check your email" instead of auto-logging in).

### Overriding the confirmation email with MJML

The built-in `sendConfirmationEmail` sends a plain Lodash-templated HTML email. To replace it with an MJML email, override `sendConfirmationEmail` on the `plugin.services.user` factory instance using the same factory-wrapper pattern already used for `plugin.controllers.auth` in `strapi-server.ts`.

**`plugin.services.user` is a factory function** — same structure as `plugin.controllers.auth`. The pattern is identical:

```typescript
// In strapi-server.ts — add after existing controller factory override:
const originalUserServiceFactory = plugin.services.user;
plugin.services.user = (context) => {
  const instance = originalUserServiceFactory(context);
  instance.sendConfirmationEmail = overrideConfirmationEmail();
  return instance;
};
```

**Full replacement (not wrapping) is required** because the original method also sends an email — wrapping would double-send. The override replicates the token-generation logic and sends MJML instead:

```typescript
// authController.ts — export overrideConfirmationEmail
export const overrideConfirmationEmail = () => async (user) => {
  const confirmationToken = require('crypto').randomBytes(20).toString('hex');
  await strapi.db.query('plugin::users-permissions.user').update({
    where: { id: user.id },
    data: { confirmationToken },
  });
  const apiUrl = process.env.APP_URL || 'http://localhost:1337';
  const apiPrefix = strapi.config.get('api.rest.prefix') as string;
  const confirmationUrl = `${apiUrl}${apiPrefix}/auth/email-confirmation?confirmation=${confirmationToken}`;
  await sendMjmlEmail(
    strapi,
    'email-confirmation',
    user.email,
    'Confirma tu correo electrónico',
    { name: user.firstname || user.username || user.email, confirmationUrl }
  );
};
```

**The confirmation link still points to Strapi's backend** (`GET /api/auth/email-confirmation?confirmation=TOKEN`), which confirms the user and then redirects to `email_confirmation_redirection` set in Admin Panel. Set that field to the website login page (e.g. `https://waldo.click/login`).

---

## Question 2 — forgotPassword Custom Email Templates

### How forgotPassword works (auth.js lines 458–517, source-verified)

```javascript
async forgotPassword(ctx) {
  const { email } = await validateForgotPasswordBody(ctx.request.body);

  const emailSettings = await pluginStore.get({ key: 'email' });
  const advancedSettings = await pluginStore.get({ key: 'advanced' });

  // advancedSettings.email_reset_password is the URL from Admin Panel
  const resetPasswordToken = crypto.randomBytes(64).toString('hex');
  const emailBody = await getService('users-permissions').template(
    resetPasswordSettings.message,   // ← Lodash template from Admin Panel
    {
      URL: advancedSettings.email_reset_password,   // ← global Admin Panel setting
      SERVER_URL: strapi.config.get('server.absoluteUrl'),
      USER: userInfo,
      TOKEN: resetPasswordToken,
    }
  );

  // Saves token first, THEN sends email
  await getService('user').edit(user.id, { resetPasswordToken });
  await strapi.plugin('email').service('email').send(emailToSend);

  ctx.send({ ok: true });
}
```

**Key findings:**
- The built-in `forgotPassword` uses Lodash `_.template()`, not MJML
- `URL` is taken from `advancedSettings.email_reset_password` — a single global Admin Panel setting, not a per-request parameter
- The default template renders the link as `<%= URL %>?code=<%= TOKEN %>`
- There is **no `url` parameter in the request body** — the built-in code never reads one

### Overriding with MJML (full replacement recommended)

`forgotPassword` is a method on the `plugin.controllers.auth` factory instance. The project already wraps this factory. Add `instance.forgotPassword` to the block in `strapi-server.ts`:

```typescript
instance.forgotPassword = overrideForgotPassword();
// No .bind(instance) — full replacement, not wrapping
```

**Full replacement in `authController.ts` (avoids double email send):**

```typescript
export const overrideForgotPassword = () => async (ctx) => {
  const { email } = ctx.request.body as { email?: string };

  if (!email) return ctx.badRequest('Email is required');

  const user = await strapi.db.query('plugin::users-permissions.user')
    .findOne({ where: { email: email.toLowerCase() } });

  // Matches built-in behavior: silent success for unknown/blocked users
  if (!user || user.blocked) return ctx.send({ ok: true });

  const resetPasswordToken = require('crypto').randomBytes(64).toString('hex');

  // Save token before sending email (matches built-in ordering)
  await strapi.db.query('plugin::users-permissions.user').update({
    where: { id: user.id },
    data: { resetPasswordToken },
  });

  // Build reset URL (see Question 3 for context routing)
  const resetUrl = `${process.env.FRONTEND_URL}/restablecer-contrasena?token=${resetPasswordToken}`;

  try {
    await sendMjmlEmail(
      strapi,
      'reset-password',
      user.email,
      'Restablece tu contraseña',
      { name: user.firstname || user.username || user.email, resetUrl }
    );
  } catch (_) {
    // Non-fatal: token is saved; admin can retrieve it; user can re-request
  }

  ctx.send({ ok: true });
};
```

**Why token in query param must be `?token=`** — both `FormResetPassword.vue` implementations (website `/restablecer-contrasena` and dashboard `/auth/reset-password`) read `route.query.token`, then pass it to `resetPassword({ code: route.query.token, ... })`. The `POST /api/auth/reset-password` body field is named `code`. So:
- Email link must use `?token=<TOKEN>` (matching `route.query.token`)
- Frontend form reads `route.query.token` and passes it as the `code` body field
- Strapi `resetPassword` controller looks up `resetPasswordToken === code` in DB ✅

---

## Question 3 — Password Reset Context Routing

### The problem

Two apps have reset pages:
- **Website:** `/restablecer-contrasena` (public-facing)
- **Dashboard:** `/auth/reset-password` (admin-facing)

The built-in `forgotPassword` uses a single global URL (`advancedSettings.email_reset_password`) and has no per-request URL override. The website already uses `useStrapiAuth().forgotPassword({ email })` via `@nuxtjs/strapi` v2, which posts to `POST /api/auth/forgot-password`.

### Recommended approach: optional `context` body parameter

With the full-replacement override from Question 2, the controller can read an optional `context` field from the request body and route accordingly:

```typescript
export const overrideForgotPassword = () => async (ctx) => {
  const { email, context } = ctx.request.body as {
    email?: string;
    context?: 'website' | 'dashboard';
  };

  // ...token generation...

  const baseUrl = context === 'dashboard'
    ? (process.env.DASHBOARD_URL || 'https://dashboard.waldo.click')
    : (process.env.FRONTEND_URL || 'https://waldo.click');

  const resetPath = context === 'dashboard'
    ? 'auth/reset-password'
    : 'restablecer-contrasena';

  const resetUrl = `${baseUrl}/${resetPath}?token=${resetPasswordToken}`;

  await sendMjmlEmail(strapi, 'reset-password', user.email, 'Restablece tu contraseña', {
    name: user.firstname || user.username || user.email,
    resetUrl,
  });

  ctx.send({ ok: true });
};
```

**Frontend change — website `FormForgotPassword.vue`:**

```typescript
// Cast required: @nuxtjs/strapi forgotPassword type only accepts { email }
await forgotPassword({ email: values.email, context: 'website' } as any);
```

**Frontend change — dashboard `FormForgotPassword.vue`:**

```typescript
await forgotPassword({ email: values.email, context: 'dashboard' } as any);
```

**Why this approach over alternatives:**

| Approach | Verdict | Reason |
|----------|---------|--------|
| Single global URL (website only) | ❌ | Dashboard users reset on website — different UX context, confusing |
| Two separate Strapi endpoints | ❌ | Extra boilerplate; same logic duplicated; Admin Panel rate-limit config only covers one |
| `context` body param (recommended) | ✅ | One endpoint, one MJML template, context-aware URL; follows body-extension pattern from `overrideAuthLocal` |

**New env var required:**

```
DASHBOARD_URL=https://dashboard.waldo.click
# FRONTEND_URL already exists
```

---

## Current State Summary

| Capability | Status | Notes |
|-----------|--------|-------|
| MJML email infrastructure (`sendMjmlEmail`, Nunjucks, templates) | ✅ EXISTS | `verification-code.mjml` is the reference template |
| Auth factory wrapper pattern (`plugin.controllers.auth`) | ✅ EXISTS | Already wraps `register`, `connect`, `callback` |
| `forgotPassword` MJML override | ❌ NOT DONE | Built-in sends plain Lodash template; needs factory addition |
| Service factory wrapper (`plugin.services.user`) | ❌ NOT DONE | Same factory pattern; needed for `sendConfirmationEmail` override |
| Email confirmation on register | ❌ NOT DONE | `email_confirmation: false` by default; Admin Panel toggle + service override needed |
| Password reset context routing | ❌ NOT DONE | Single global URL; needs `context` param approach |

---

## Stack Additions Required

### No new npm packages needed

All required capabilities exist in the installed stack:

| Package | Installed version | Role |
|---------|------------------|------|
| `mjml` | `^4.16.1` | MJML → HTML compilation |
| `nunjucks` | `^3.2.4` | Template variable injection in `.mjml` files |
| `@strapi/plugin-users-permissions` | `5.36.1` | Auth controllers, factory pattern |
| `@nuxtjs/strapi` (website + dashboard) | v2 | `useStrapiAuth()` — `forgotPassword`, `resetPassword`, `register` |

### New Strapi files

| File | Purpose |
|------|---------|
| `src/services/mjml/templates/email-confirmation.mjml` | MJML template for email verification on registration |
| `src/services/mjml/templates/reset-password.mjml` | MJML template for password reset link |

### Modified Strapi files

| File | Change |
|------|--------|
| `src/extensions/users-permissions/strapi-server.ts` | Add `plugin.services.user` factory override block; add `instance.forgotPassword` to existing auth factory block |
| `src/extensions/users-permissions/controllers/authController.ts` | Add `overrideForgotPassword()` and `overrideConfirmationEmail()` exports |

### Modified Nuxt files — website (`apps/website`)

| File | Change |
|------|--------|
| `app/components/FormRegister.vue` | Handle no-JWT response when `email_confirmation: true` — show "check your email" message instead of auto-login |
| `app/components/FormForgotPassword.vue` | Pass `context: 'website'` in forgotPassword body (cast as `any`) |

### Modified Nuxt files — dashboard (`apps/dashboard`)

| File | Change |
|------|--------|
| `app/components/FormForgotPassword.vue` | Pass `context: 'dashboard'` in forgotPassword body (cast as `any`) |

### New env var (Strapi)

| Variable | Example value | Purpose |
|----------|--------------|---------|
| `DASHBOARD_URL` | `https://dashboard.waldo.click` | Base URL for dashboard reset links |

---

## Integration Notes

### Unconfirmed users and the 2-step login (`overrideAuthLocal`)

`overrideAuthLocal` intercepts `POST /api/auth/local` **after** the original controller runs. The original controller throws `ApplicationError('Your account email is not confirmed')` before returning a JWT when `email_confirmation: true` and `user.confirmed !== true`. Since `overrideAuthLocal` only intercepts when `jwt` is present (`if (!jwt) return;`), unconfirmed users pass through cleanly — correct behavior, no change needed.

### `sendConfirmationEmail` and `registerUserLocal` reservation timing

`registerUserLocal` calls `createUserReservations(user)` as a **floating promise** (no `await`). The confirmation email is sent by the original `register` controller before responding. These are independent — no timing conflict.

### Confirmation link routes through Strapi backend first

The MJML email confirmation link must point to the **Strapi backend**:
`GET /api/auth/email-confirmation?confirmation=TOKEN`

Strapi confirms the user, then redirects to `email_confirmation_redirection` (Admin Panel Advanced Settings). Set this to `https://waldo.click/login` so the user lands on the website login page after confirming.

The MJML email links to Strapi, not directly to the Nuxt frontend.

### `resetPassword` token field name consistency

Both apps' `FormResetPassword.vue` read `route.query.token` and pass it as `code` to `resetPassword({ code, password, passwordConfirmation })`. The `POST /api/auth/reset-password` controller looks up `resetPasswordToken === code`.

Therefore:
- Email link → `?token=<TOKEN>` (so `route.query.token` is populated)
- Frontend → `{ code: route.query.token }` → body field matches DB column ✅

### Rate limiting on `POST /api/auth/forgot-password`

The built-in `forgotPassword` is covered by the plugin's default rate limiter (5 requests per 5 minutes). The full-replacement override bypasses the plugin's internal request processing but the **koa2-ratelimit middleware at the route level still applies** because it runs before the controller. No additional rate limiting needed.

---

## Confidence Assessment

| Area | Confidence | Source |
|------|------------|--------|
| `email_confirmation` flag behavior (registration, login enforcement) | HIGH | Read `auth.js` + `user.js` from installed plugin source |
| `forgotPassword` URL comes from Admin Panel setting only | HIGH | Read `auth.js` + `bootstrap/index.js` from installed plugin source |
| Service factory wrapper pattern (`plugin.services.user`) | HIGH | Confirmed by inspecting plugin structure; same pattern as auth factory already in production |
| `context` body param approach | MEDIUM | Pattern inferred from existing body-extension patterns; `@nuxtjs/strapi` v2 SDK behavior for extra fields is type-cast with `as any` |
| MJML double-send issue (wrapping = two emails) | HIGH | Confirmed by reading both `sendConfirmationEmail` and `forgotPassword` — they each call `strapi.plugin('email').service('email').send()` internally |
| `route.query.token` → `code` body field mapping | HIGH | Read both `FormResetPassword.vue` files directly |

---

## Sources

| Source | Type | Confidence |
|--------|------|------------|
| `node_modules/@strapi/plugin-users-permissions/server/controllers/auth.js` (v5.36.1) | Installed source | HIGH |
| `node_modules/@strapi/plugin-users-permissions/server/services/user.js` (v5.36.1) | Installed source | HIGH |
| `node_modules/@strapi/plugin-users-permissions/server/bootstrap/index.js` (v5.36.1) | Installed source | HIGH |
| `apps/strapi/src/extensions/users-permissions/strapi-server.ts` | Project source | HIGH |
| `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` | Project source | HIGH |
| `apps/strapi/src/services/mjml/send-email.ts` | Project source | HIGH |
| `apps/strapi/config/plugins.ts` | Project source | HIGH |
| `apps/dashboard/app/components/FormForgotPassword.vue` | Project source | HIGH |
| `apps/dashboard/app/components/FormResetPassword.vue` | Project source | HIGH |
| `apps/website/app/components/FormForgotPassword.vue` | Project source | HIGH |
| `apps/website/app/pages/restablecer-contrasena.vue` | Project source | HIGH |
| https://docs.strapi.io/dev-docs/plugins/users-permissions | Official Strapi v5 docs | MEDIUM |
