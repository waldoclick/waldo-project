# Domain Pitfalls

**Domain:** Email auth flows on existing Strapi v5 + Nuxt 4 app
**Milestone:** Adding email verification on registration + MJML auth emails + password reset context routing
**Researched:** 2026-03-13
**Confidence:** HIGH — all critical claims verified against Strapi v5 source code (`auth.js`, `user.js` from `github.com/strapi/strapi/main`)

---

## Critical Pitfalls

Mistakes that cause user lockout, data loss, or silent broken flows.

---

### Pitfall 1: Enabling `email_confirmation` Immediately Locks Out All Existing Users

**What goes wrong:**
Enabling "Enable email confirmation" in the Strapi admin panel Advanced Settings activates a live check in the `callback` controller (the one already wrapped by `overrideAuthLocal`):

```js
// Strapi v5 auth.js — verified source
const requiresConfirmation = _.get(advancedSettings, 'email_confirmation');
if (requiresConfirmation && user.confirmed !== true) {
  throw new ApplicationError('Your account email is not confirmed');
}
```

All existing users have `confirmed: false` (the schema default). The moment the toggle is flipped in the admin panel, **every existing user is locked out** at `POST /api/auth/local` — website login, dashboard login, everything. The `ApplicationError` is thrown inside the original `callback` controller before `overrideAuthLocal`'s code can run (because `overrideAuthLocal` calls `await originalController(ctx)` first, and that call throws).

**Root cause:**
The `confirmed` field defaults to `false` in Strapi's user schema. Existing apps running without `email_confirmation` never backfill it to `true`.

**Consequences:**
- All existing users cannot log in immediately after the flag is flipped
- Dashboard admins cannot log in (lockout of operations team)
- The `ApplicationError` propagates through `overrideAuthLocal` as an unhandled throw — the 2-step flow never reaches the pendingToken logic
- Google OAuth users in the `callback()` path are affected the same way (if any use the local `callback`)

**Prevention:**
Run a database migration **before** flipping the toggle. Either approach works:

```sql
-- SQL migration — run against the Strapi database BEFORE enabling email_confirmation
UPDATE up_users SET confirmed = TRUE WHERE confirmed = FALSE OR confirmed IS NULL;
```

Or via Strapi bootstrap (run once, then remove):
```ts
// apps/strapi/src/index.ts — temporary bootstrap, remove after first deploy
async bootstrap({ strapi }) {
  await strapi.db.query('plugin::users-permissions.user').updateMany({
    where: { $or: [{ confirmed: false }, { confirmed: null }] },
    data: { confirmed: true },
  });
}
```

**Detection:**
After enabling the flag in any environment, attempt a login with a pre-existing account. The error `"Your account email is not confirmed"` (HTTP 400) confirms the lockout is active.

**Phase:** The migration must be the first step in any phase that enables `email_confirmation`. Enable the flag only after verifying the migration ran successfully.

---

### Pitfall 2: `email_confirmation` Changes the Register Response Shape — Frontend Breaks Silently

**What goes wrong:**
`registerUserLocal` wraps the original `register` controller and reads `ctx.response.body?.user` after calling it. This works either way. The problem is the **frontend** (`FormRegister.vue` on website and dashboard).

When `email_confirmation: true` is set, Strapi's `register` controller sends `{ user }` with **no JWT**:

```js
// Strapi v5 auth.js register() — verified source
if (settings.email_confirmation) {
  await getService('user').sendConfirmationEmail(sanitizedUser);
  return ctx.send({ user: sanitizedUser }); // ← NO jwt field
}
// Without email_confirmation:
const jwt = getService('jwt').issue(_.pick(user, ['id']));
return ctx.send({ jwt, user: sanitizedUser }); // ← jwt present
```

If any frontend registration handler calls `setToken(response.jwt)` unconditionally, it calls `setToken(undefined)`. With `@pinia-plugin-persistedstate/nuxt`, `undefined` gets persisted to localStorage as the auth token — producing a broken "logged-in-but-not" state that persists across page refreshes. The user registered successfully but cannot use the site.

**Why it happens:**
The existing registration flow was written assuming immediate JWT issuance (no email confirmation). The response shape change is a silent contract break.

**Consequences:**
- Users register successfully but cannot access protected routes
- `useStrapiUser()` returns null even though `useAuthToken()` returns `"undefined"` (the stringified value)
- `createUserReservations(user)` still fires (the user object is present regardless) — reservations are created but the user cannot reach them

**Prevention:**
Before enabling `email_confirmation`, audit ALL registration response handlers:
- `apps/website/app/components/FormRegister.vue` — does it guard `if (response.jwt) setToken(response.jwt)`?
- `apps/dashboard` — does the dashboard even have a registration flow?

The safe frontend pattern:
```ts
const response = await $strapi.register(...)
if (response.jwt) {
  // Immediate login flow (email_confirmation disabled)
  setToken(response.jwt)
  await fetchUser()
} else {
  // Email confirmation flow
  navigateTo('/registro/verifica-tu-email')
}
```

**Phase:** Must be addressed in the same phase as the registration email template. Change the frontend before enabling the backend flag.

---

### Pitfall 3: `forgotPassword` Email Cannot Be Intercepted — Full Controller Override Required

**What goes wrong:**
The Strapi v5 `forgotPassword` controller reads the reset URL from the admin panel's key-value store and sends the email directly — there is no hook, middleware, or override point short of replacing the entire controller:

```js
// Strapi v5 auth.js forgotPassword() — verified source
const emailBody = await getService('users-permissions').template(
  resetPasswordSettings.message,
  {
    URL: advancedSettings.email_reset_password, // ← static string from admin panel config
    SERVER_URL: strapi.config.get('server.absoluteUrl'),
    USER: userInfo,
    TOKEN: resetPasswordToken,
  }
);
await strapi.plugin('email').service('email').send(emailToSend);
```

`advancedSettings.email_reset_password` is set in the Strapi admin panel "Reset password page" field — a single static URL. There is no runtime mechanism to make it dynamic per-request. The email template is a Lodash template stored in the admin panel DB — it cannot use MJML or Nunjucks natively.

**Why it happens:**
Strapi designed `forgotPassword` for a single-frontend use case. The URL is evaluated from config at send time, not derived from the request context.

**Consequences:**
- Cannot send `?app=dashboard` to route reset to the correct app frontend
- Cannot use the existing MJML/Nunjucks email pipeline for the reset email
- The admin panel email template editor has no MJML capability — custom HTML only

**Prevention:**
Use the same factory-wrap pattern already established in `strapi-server.ts` to replace `instance.forgotPassword`:

```ts
// strapi-server.ts (pattern already exists for callback, register, connect)
instance.forgotPassword = forgotPasswordOverride(instance.forgotPassword.bind(instance));
```

The override in `authController.ts`:
1. Reads optional `app` from `ctx.request.body` (`"website"` | `"dashboard"`) and strips it before calling the original controller (see Pitfall 8)
2. After the original controller runs (it saves the token and sends the plain email), intercepts the response — or preferably, **does not call the original at all** and reimplements the logic using `sendMjmlEmail`
3. Builds the reset URL dynamically: `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}` vs `${process.env.APP_DASHBOARD_URL}/auth/reset-password?token=${token}`

If calling the original is preferred (to avoid reimplementing token logic), note that the original already sends the plain email — the override would then send a *second* email (duplicate). Full replacement is cleaner.

**Detection:**
The plain Strapi reset email uses the Lodash template format (`<%= TOKEN %>`). Any MJML-formatted reset email in the inbox confirms the override is active.

**Phase:** Must be the foundation of the password reset email phase. The override must exist before any email template work begins.

---

### Pitfall 4: `overrideAuthLocal` Will Intercept Email Confirmation Login Errors — Wrong Error Semantics

**What goes wrong:**
`overrideAuthLocal` currently interprets `if (!jwt) return` as "invalid credentials — pass through unchanged." This guard works for both the invalid-credentials case (original controller throws a `ValidationError`) and — critically — for the `email_confirmation` lockout case (original controller throws an `ApplicationError` with `"Your account email is not confirmed"`).

The `ApplicationError` throw propagates upward through `overrideAuthLocal` unchanged (because the error is thrown inside `await originalController(ctx)`, which means it bubbles up before the `if (!jwt)` guard is even reached). So the existing guard is irrelevant for `email_confirmation` errors — they propagate correctly.

**However**, if a future change makes the original controller return `{ user }` (without JWT and without throwing — for example, a partial-auth state), the `if (!jwt) return` guard would silently exit `overrideAuthLocal` without setting `ctx.body`, which would return an empty 200 response to the client. This is a latent design trap.

**Why it matters:**
The addition of `email_confirmation` is the first scenario where a "valid user, no JWT" path could be imagined (e.g., a confirmed email check that returns a hint instead of throwing). Understanding the guard's semantics prevents future misuse.

**Consequences:**
- No current breakage
- Future: if anyone modifies the original controller to return `{ user }` without JWT on email confirmation failure (instead of throwing), `overrideAuthLocal` will eat the response silently

**Prevention:**
Add a comment in `overrideAuthLocal` clarifying the guard's contract:

```ts
// If originalController threw, execution never reaches here.
// If no JWT is present in the response, credentials were rejected but no exception
// was thrown (should not happen in Strapi's current auth flow — guard is defensive).
const jwt = ctx.response.body?.jwt;
if (!jwt) return; // pass through error response unchanged
```

**Phase:** Comment-only change, in the same phase as any `overrideAuthLocal` modifications.

---

## Moderate Pitfalls

---

### Pitfall 5: MJML `renderEmail` Throws Inside `sendMjmlEmail`'s Outer `try/catch` — Template Errors Are Invisible

**What goes wrong:**
`renderEmail` calls `nunjucks.render()` and `mjml2html()` — both throw on template errors (undefined variable, broken `{% extends %}` path, malformed MJML, missing template file). The outer `try/catch` in `sendMjmlEmail` catches everything and returns `false`:

```ts
// send-email.ts — current code
export async function sendMjmlEmail(...) {
  try {
    const html = renderEmail(template, dataWithEnv); // ← can throw
    // ...
    await strapi.plugins["email"].services.email.send(emailOptions);
    return true;
  } catch (error) {
    console.error("Error enviando email MJML:", error); // ← logged, not rethrown
    return false; // ← non-fatal, caller continues
  }
}
```

This is the **intended non-fatal pattern** — correct for production, but it makes template development errors invisible. A typo in `forgot-password.mjml`, an undefined Nunjucks variable, or a missing template file all produce the same result: the email silently fails to send, the business operation succeeds, and `console.error` is the only trace.

**Why it happens:**
The non-fatal pattern is a deliberate architectural decision already established across all email-sending code. The risk is that **all new MJML templates** (registration confirmation, forgot password) will have the same invisible failure mode during development.

**Consequences:**
- New MJML templates can have errors that are never caught until a user reports not receiving an email
- Nunjucks variable name mismatches (`{{ resetUrl }}` vs `{{ reset_url }}`) are silent
- Wrong template name in `sendMjmlEmail(strapi, "forgot-password", ...)` vs file `forgot-password-email.mjml` is silent

**Prevention:**
1. For each new auth email template, create a corresponding test call in `test.ts` (the existing test file) that exercises the template with expected variables before wiring to the live flow
2. Check Mailgun logs (not just application logs) when testing new templates in staging — the email may appear to have been called but the log shows the Mailgun API was never reached
3. The `nunjucks.configure("src/services/mjml/templates", ...)` path is relative to CWD at Strapi start. In the Turbo monorepo, Strapi starts from `apps/strapi/` — new templates must be in `apps/strapi/src/services/mjml/templates/`

**Phase:** At-risk during every new MJML template creation. Acceptance criterion for each template: "template renders without error when called with its expected variables (verified via test.ts or direct renderEmail call)."

---

### Pitfall 6: `forgotPassword` Override — Token Must Be Saved to DB Before Email Is Sent

**What goes wrong:**
In Strapi's original `forgotPassword`, the token is written to the user record **before** the email is sent:

```js
// Strapi v5 auth.js — verified source, comment is Strapi's own
// NOTE: Update the user before sending the email so an Admin can generate the link if the email fails
await getService('user').edit(user.id, { resetPasswordToken });
await strapi.plugin('email').service('email').send(emailToSend); // ← after token saved
```

An override that reverses this order — validates the email send succeeds, then saves the token — will produce a bug: the user receives the reset email, clicks the link, and `POST /api/auth/reset-password` returns `"Incorrect code provided"` because the token was never saved.

**Why it happens:**
Natural instinct when writing the override: "send first, save if successful." Strapi's design is intentionally the opposite, so admins can manually generate links if email fails.

**Prevention:**
In the `forgotPassword` override, always call `getService('user').edit(user.id, { resetPasswordToken })` **before** `sendMjmlEmail`. Treat the email send as non-fatal (the token is already in the DB; the user can request another reset). Add an explicit comment: `// Token must be persisted before email send — matches Strapi's original contract`.

**Phase:** Password reset controller override phase.

---

### Pitfall 7: `?app=dashboard` Cannot Use Query Params — Must Be Request Body

**What goes wrong:**
`POST /api/auth/forgot-password` is a POST endpoint. To differentiate "reset from website" vs "reset from dashboard," passing `?app=dashboard` as a URL query param is technically accessible via `ctx.request.query` but semantically wrong for POST and may be stripped by reverse proxies or future Strapi middleware.

Additionally, Strapi's rate limiter uses `prefixKey: ${userIdentifier}:${requestPath}:${ctx.request.ip}`. If the rate-limit key is ever configured to include query params, `?app=dashboard` creates a separate rate-limit bucket — effectively halving the protection.

**Prevention:**
Pass `app` as a body field:
```json
{ "email": "user@example.com", "app": "dashboard" }
```

The override reads `ctx.request.body.app` (default `"website"`) and strips it from the body before calling the original controller (see Pitfall 8).

**Phase:** Password reset override phase.

---

### Pitfall 8: Extra Body Field (`app`) May Fail Strapi's `validateForgotPasswordBody` Validation

**What goes wrong:**
The `forgotPassword` controller runs `await validateForgotPasswordBody(ctx.request.body)` before any custom code can execute. If Strapi's Yup validation schema uses `.noUnknown()` or strict mode, passing `{ email, app }` throws a `ValidationError: "app is not allowed"` before the override intercepts anything.

**Why it matters:**
Yup's `strict` mode and `stripUnknown` behavior differ — without inspecting the exact validation schema, it is unclear whether extra fields throw or are silently stripped. The safe assumption is that they throw.

**Prevention:**
If the override is a wrapper (calls the original controller), strip `app` from the body before passing to the original:

```ts
export const forgotPasswordOverride = (originalController) => async (ctx) => {
  const app = (ctx.request.body as Record<string, unknown>)?.app ?? 'website';
  // Strip 'app' before the original controller's validateForgotPasswordBody sees it
  const { app: _app, ...cleanBody } = ctx.request.body as Record<string, unknown>;
  ctx.request.body = cleanBody;
  await originalController(ctx); // validateForgotPasswordBody runs here against cleanBody
  // ... build dynamic reset URL using `app`
};
```

This is exactly the same pattern used in `registerUserLocal`:
```ts
// authController.ts — existing precedent
ctx.request.body = userData; // strips confirm_password before calling registerController(ctx)
```

**Phase:** Password reset override phase — this is the most likely runtime bug if not handled.

---

### Pitfall 9: `forgotPassword` Override Sends TWO Emails If Original Controller Is Called

**What goes wrong:**
If the `forgotPassword` override calls the original controller (to reuse its token generation and DB-write logic) and then also calls `sendMjmlEmail`, the user receives two emails: the plain Strapi reset email AND the MJML email.

**Why it happens:**
The original `forgotPassword` both saves the token AND sends the email in one operation. There is no way to call "only the token-saving part" without reimplementing the token generation logic.

**Prevention:**
Choose one of two approaches — do not mix:
- **Full replacement (recommended)**: Do not call the original controller at all. Reimplement the token generation (`crypto.randomBytes(64).toString('hex')`), call `getService('user').edit()` to save it, and call `sendMjmlEmail`. Only requires ~10 lines of logic.
- **Wrapper with original suppressed**: Call the original controller, then override `ctx.body` with the expected response — but the original email has already been sent. No clean way to suppress it.

**Phase:** Password reset override phase — decide on the approach (full replacement) before implementation begins.

---

### Pitfall 10: Email Confirmation Redirection URL Not Configured in Admin Panel

**What goes wrong:**
When `email_confirmation` is enabled, Strapi sends a confirmation email with a link to `GET /api/auth/email-confirmation?confirmation=TOKEN`. After confirming, the controller redirects to `advancedSettings.email_confirmation_redirection`. If this field is empty (the default for new installs), the redirect goes to `/` — which resolves to Strapi's own server root, not the website.

**Verification:**
From Strapi v5 `auth.js` `emailConfirmation()`:
```js
ctx.redirect(settings.email_confirmation_redirection || '/');
```

**Prevention:**
Configure "Redirection url" in Strapi admin panel → Users & Permissions → Advanced Settings **before** enabling email confirmation. Set it to the website login page with a query param: `https://waldo.click/login?confirmed=true`.

**Phase:** Must be part of the same phase that enables `email_confirmation` — add to the phase checklist.

---

## Minor Pitfalls

---

### Pitfall 11: Google OAuth Users Have `confirmed: false` but Are Not Blocked by `email_confirmation`

OAuth registration via Google goes through `connect()` which does not check `email_confirmation`. Google OAuth users continue to work even without the confirmed migration (Pitfall 1). However, if an OAuth user also sets a local password and tries `POST /api/auth/local`, they will be blocked.

The existing `overrideAuthLocal` correctly skips 2-step for OAuth via `if (ctx.method === "GET") return originalController(ctx)`. This bypass also bypasses the `email_confirmation` check (the original `connect()` handler is used for OAuth, which doesn't have the check).

**Prevention:** Run the `confirmed: true` migration for all users (Pitfall 1) regardless. No code change needed for OAuth users specifically.

---

### Pitfall 12: `verification-code.mjml` States "válido por 5 minutos" — Mismatch with 15-Minute Actual Expiry

The existing `verification-code.mjml` says "Este código es válido por **5 minutos**" but `CODE_EXPIRY_MS = 15 * 60 * 1000` in `authController.ts`. This is an existing inconsistency in the codebase. Any new auth email templates (registration confirmation, password reset) that display an expiry time must match the actual TTL constant — do not copy this discrepancy.

**Prevention:** When creating new templates, confirm the TTL from the code, not from the template text.

---

### Pitfall 13: Strapi's Built-in Rate Limit Applies to `forgotPassword` — 5 Requests / 5 Minutes Default

Strapi applies `koa2-ratelimit` to auth endpoints. The default is 5 requests per 5-minute window per `${identifier}:${path}:${ip}`. For `forgotPassword`, the identifier is the email. This is intentional but can cause test failures when repeatedly calling the endpoint during development.

**Prevention:** Be aware during testing. Do not add a custom `prefixKey` that includes the request body (would complicate rate-limit behavior).

---

### Pitfall 14: `sendMjmlEmail` Uses `process.env.FRONTEND_URL` for `frontendUrl` — Dashboard Reset URL Requires a Separate Env Var

`send-email.ts` automatically injects `frontendUrl: process.env.FRONTEND_URL` into every template's data. For the password reset email, the correct URL depends on which app initiated the request. If the MJML template for forgot-password uses `{{ frontendUrl }}` directly, dashboard resets will point to the website URL.

**Prevention:** Do not rely on the auto-injected `frontendUrl` in forgot-password templates. Pass the correct `resetUrl` explicitly as a template variable in the `sendMjmlEmail` data argument:

```ts
await sendMjmlEmail(strapi, 'forgot-password', user.email, 'Restablecer contraseña', {
  name: user.firstname || user.username,
  resetUrl: app === 'dashboard'
    ? `${process.env.APP_DASHBOARD_URL}/auth/reset-password?code=${resetPasswordToken}`
    : `${process.env.FRONTEND_URL}/auth/restablecer-contrasena?code=${resetPasswordToken}`,
});
```

**Phase:** Password reset MJML template phase — name the template variable explicitly and document which env var each app uses.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Enable `email_confirmation` flag | All existing users locked out (Pitfall 1) | Run `confirmed = true` migration FIRST; verify before enabling flag |
| Registration email flow | Frontend response shape change — no JWT (Pitfall 2) | Audit `FormRegister.vue` response handler; add `if (response.jwt)` guard |
| `forgotPassword` MJML email | Cannot intercept without full controller override (Pitfall 3) | Factory-wrap `instance.forgotPassword` in `strapi-server.ts` |
| `forgotPassword` override implementation | Two emails sent if original controller is called (Pitfall 9) | Full replacement — do not call `originalController` at all |
| `app` routing in reset URL | Extra body field may fail Yup validation (Pitfall 8) | Strip `app` from body before `originalController` (same pattern as `registerUserLocal`) |
| `app` routing — where to pass it | Query params are wrong for POST endpoints (Pitfall 7) | Pass `app` in request body |
| Reset URL in MJML template | Auto-injected `frontendUrl` points to wrong app (Pitfall 14) | Pass explicit `resetUrl` variable to the template |
| Any new MJML template creation | Template errors swallowed silently (Pitfall 5) | Test `renderEmail()` directly; check Mailgun logs in staging |
| `forgotPassword` token ordering | Token saved after email fails causes "Invalid code" (Pitfall 6) | Always save token to DB before `sendMjmlEmail` |
| Post-implementation | `email_confirmation_redirection` URL not set (Pitfall 10) | Set to `${FRONTEND_URL}/login?confirmed=true` in admin panel before enabling |

---

## Sources

- Strapi v5 `auth.js` controller (verified 2026-03-13): `https://raw.githubusercontent.com/strapi/strapi/main/packages/plugins/users-permissions/server/controllers/auth.js` — HIGH confidence
- Strapi v5 `user.js` service (verified 2026-03-13): `https://raw.githubusercontent.com/strapi/strapi/main/packages/plugins/users-permissions/server/services/user.js` — HIGH confidence
- Strapi v5 Users & Permissions official docs: `https://docs.strapi.io/cms/features/users-permissions` — HIGH confidence
- Strapi v5 Plugins extension docs: `https://docs.strapi.io/cms/plugins-development/plugins-extension` — HIGH confidence
- Project codebase (direct inspection):
  - `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`
  - `apps/strapi/src/extensions/users-permissions/strapi-server.ts`
  - `apps/strapi/src/services/mjml/send-email.ts`
  - `apps/strapi/src/services/mjml/index.ts`
  - `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json`
  - `apps/strapi/config/plugins.ts`
