# Architecture Patterns: Email Auth Flows

**Project:** Waldo — Email verification on registration + MJML auth emails + password reset context routing
**Researched:** 2026-03-13
**Confidence:** HIGH — All findings sourced from direct codebase inspection

---

## Existing Architecture (Relevant Systems)

### 1. Auth Controller Extension Pattern

**File:** `apps/strapi/src/extensions/users-permissions/strapi-server.ts`

The `plugin.controllers.auth` is a **factory function** in Strapi v5 — not a plain object. Setting properties directly on the factory has no effect (the registry calls the factory with `{ strapi }` to create a fresh instance; the instance never sees properties set on the function object).

**Established fix:** Wrap the factory so overrides are applied to the resulting instance before it is cached:

```typescript
const originalAuthFactory = plugin.controllers.auth;
plugin.controllers.auth = (context) => {
  const instance = originalAuthFactory(context);
  instance.register = registerUserLocal(instance.register.bind(instance));
  instance.connect  = registerUserAuth(instance.connect.bind(instance));
  instance.callback = overrideAuthLocal(instance.callback.bind(instance));
  return instance;
};
```

**Pattern:** Each override is a higher-order function: `(originalController) => async (ctx) => { ... }`.

**Critical constraint:** Do NOT try to add new routes via `plugin.routes["content-api"].routes.push()` — that array is also a factory function; pushed routes are set as properties on the function object and ignored when `instantiateRouterInputs` calls the factory during bootstrap. New auth-adjacent routes MUST go in `src/api/` (standard content-API domain).

---

### 2. Registration Flow

**Entry:** `POST /api/auth/local/register`
**Controller wrapper:** `registerUserLocal` in `controllers/authController.ts`

What happens today:
1. Validate custom fields (`is_company`, `firstname`, `lastname`, `rut`, etc.)
2. Call original `registerController(ctx)`
3. Extract newly created user from `ctx.response.body?.user || ctx.state.user`
4. Call `createUserReservations(user)` — fire-and-forget (no `await`)
5. Return original response as-is

**Post-controller side effect (middleware):** `src/middlewares/user-registration.ts` intercepts `POST /api/auth/local/register` (status 200) AFTER the controller responds, creating 3 free `ad-reservation` records, 3 free `ad-featured-reservation` records, and a Zoho CRM contact.

**Key gap identified:** The success `Swal.fire` in `FormRegister.vue` already shows "Te hemos enviado un correo para confirmar tu dirección de correo electrónico" — but Strapi's built-in email confirmation is not enabled (`confirmed: boolean` field exists in `user/schema.json`, but `confirmationToken` is only populated when `users-permissions` config enables email confirmation). No `confirmed` check blocks login today. The user flow claims confirmation is sent but no email actually goes out.

---

### 3. MJML Email Service

**Files:** `apps/strapi/src/services/mjml/` — `index.ts`, `send-email.ts`, `templates/`

**Rendering:** Nunjucks templates + MJML → HTML. `env.configure("src/services/mjml/templates")` — templates at `templates/{name}.mjml`, layout inheritance via Nunjucks `{% extends "layouts/base.mjml" %}`.

**Sending:** `sendMjmlEmail(strapi, template, to, subject, data)` — uses Mailgun via `strapi.plugins["email"].services.email.send()`. Auto-prefixes subject with `"Waldo.click®: "`. Auto-injects `year`, `frontendUrl`, `appUrl` into template data. Non-fatal (try/catch returns `false`, does not rethrow).

**Base layout:** `templates/layouts/base.mjml` — Waldo orange background (`#ffd699`), white content card, header + footer partials. All custom templates extend this layout.

**Existing templates:** `verification-code`, `ad-approved`, `ad-rejected`, `ad-banned`, `ad-creation-user`, `ad-creation-admin`, `contact-admin`, `contact-user`, `gift-reservation`, `report-*` (3 cron reports).

**Adding a new template:** Drop a `.mjml` file in `templates/`, reference template name (without `.mjml`) in `sendMjmlEmail(strapi, "new-template-name", ...)`.

---

### 4. 2-Step Login (Already Implemented)

**Strapi side:**
- `verification-code` content type (5 fields: `userId`, `code`, `expiresAt`, `attempts`, `pendingToken`)
- `overrideAuthLocal` wraps `instance.callback` — on valid credentials, intercepts JWT response, creates a `verification-code` record, sends `verification-code.mjml` email, returns `{ pendingToken, email }` instead of JWT
- `POST /api/auth/verify-code` and `POST /api/auth/resend-code` registered in `src/api/auth-verify/` (standard content-API; not plugin routes, because plugin routes are a factory function — see constraint above)
- Logic: `verifyCode()` and `resendCode()` in `authController.ts`, re-exported via `src/api/auth-verify/controllers/auth-verify.ts`

**Frontend (dashboard):**
- `FormLogin.vue` → POSTs credentials → receives `{ pendingToken, email }` → stores in `useState('pendingToken')` → navigates to `/auth/verify-code`
- `FormVerifyCode.vue` — 6-digit input, auto-submit on 6 digits, paste handler, 60s resend cooldown, manager role check on success

**Frontend (website):**
- Same pattern: `FormLogin.vue` → `useState('pendingToken')` → `/login/verificar` with `FormVerifyCode.vue`
- Post-login: profile completeness check → referer redirect

**Note in verification-code.mjml:** Template says "válido por 5 minutos" but `CODE_EXPIRY_MS = 15 * 60 * 1000` (15 minutes). This is a discrepancy — template copy is incorrect.

---

### 5. Password Reset Flow (Both Apps)

**Strapi built-in:** `forgotPassword({ email })` → Strapi sends email with link containing `?code=<resetPasswordToken>` → user clicks → redirected to reset page with `?token=` query param → `resetPassword({ code, password, passwordConfirmation })`.

**Dashboard:** `FormForgotPassword.vue` calls `forgotPassword({ email })` via `useStrapiAuth()`. Email with link lands in the user's inbox. Link goes to `/auth/reset-password?token=XXX`. `FormResetPassword.vue` reads `route.query.token` → `form.code = route.query.token` → calls `resetPassword({ code, password, passwordConfirmation })`.

**Website:** Same structure — `FormForgotPassword.vue` calls `forgotPassword({ email, recaptchaToken })`. Link goes to some reset URL — **but there is no `/cuenta/restablecer-contrasena.vue` page in the website**. The website has no password reset landing page. The Strapi `users-permissions` config points reset emails to a `reset_password.link` URL (configurable in Strapi admin panel → Users & Permissions → Advanced Settings). If this URL points to the dashboard's reset page, the token arrives there instead.

**Current email:** Strapi's built-in users-permissions reset email template is used — NOT an MJML template. The email comes from Strapi's internal template system, not `sendMjmlEmail()`.

---

### 6. `user-registration.ts` Middleware

**Scope:** Post-response Koa middleware that intercepts three paths:
- `POST /api/auth/local/register` (status 200) → creates free reservations + Zoho contact
- `POST /api/auth/local` (status 200) → enriches login response with populated `role`, `commune`, `business_region`, `ad_reservations`, `ad_featured_reservations`
- `GET /api/users/me` (status 200) → same enrichment as above
- `GET /api/auth/:provider/callback` (status 200, new user within 10s) → creates free reservations + Zoho contact (deduped via `processedTokens` Set)

**Key observation:** The login enrichment at `POST /api/auth/local` runs AFTER `overrideAuthLocal` has already replaced the response body with `{ pendingToken, email }` — so the middleware's login branch (`loginResponse?.user` check) will silently no-op for 2-step logins because `response.body` is `{ pendingToken, email }`, not `{ jwt, user }`. This is correct behavior — no enrichment needed since no JWT is issued yet.

---

## New Feature: Email Verification on Registration

### What Needs to Happen

After a user registers (`POST /api/auth/local/register`), they should receive an MJML email asking them to verify their email address. The user should not be able to log in until they click the verification link.

### Integration Points

**Option A — Strapi built-in email confirmation (simplest)**

Enable `emailConfirmation: true` in `users-permissions` plugin config. Strapi will:
1. Set `confirmed: false` on registration
2. Send a confirmation email (using Strapi's internal template, not MJML)
3. Expose `GET /api/auth/email-confirmation?confirmation=<token>` endpoint
4. Block login for unconfirmed users (`confirmed: false` check in `auth.local` controller)

**Problem:** The confirmation email uses Strapi's default template, not MJML. To use MJML, you'd need to override the email send inside `registerUserLocal` — send your own MJML email and disable Strapi's built-in send, or intercept the template.

**Option B — Custom verification in `registerUserLocal` (fits existing pattern)**

Reuse the `verification-code` content type (or a new `email-confirmation` type) to implement email verification via the existing `registerUserLocal` wrapper:

1. After `registerController(ctx)` succeeds, generate a UUID token, store it in the `verification-code` table (or a new `email-verification` table)
2. Send MJML email with a link: `{frontendUrl}/confirmar-correo?token={uuid}`
3. Create new Strapi endpoint `GET /api/auth/confirm-email?token=XXX` that sets `confirmed: true` on the user
4. In `overrideAuthLocal`, check `user.confirmed` — if `false`, return `{ requiresConfirmation: true }` instead of `{ pendingToken, email }`

**Problem:** This creates a fourth content type (or overloads `verification-code` with a second purpose). The `verification-code` schema has `userId`, `code`, `expiresAt`, `attempts`, `pendingToken` — all of these are specific to 2-step login. Overloading would require schema changes.

**Recommended approach:** A new `email-confirmation` content type with fields `{ userId, token, expiresAt }` — simpler than `verification-code` (no `attempts`, no `pendingToken` — just a UUID token). Avoids overloading. Clean separation.

### New vs. Modified Files (Email Verification)

**NEW — Strapi:**
- `src/api/email-confirmation/content-types/email-confirmation/schema.json` — `{ userId, token, expiresAt }`, `draftAndPublish: false`
- `src/api/email-confirmation/controllers/email-confirmation.ts` — `confirmEmail(ctx)` function
- `src/api/email-confirmation/routes/email-confirmation.ts` — `GET /api/auth/confirm-email` (public, `auth: false`)
- `src/services/mjml/templates/registration-confirmation.mjml` — extends `layouts/base.mjml`, shows a confirmation link button

**MODIFIED — Strapi:**
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`:
  - `registerUserLocal`: after `await registerController(ctx)`, generate UUID token, insert into `email-confirmation` table, call `sendMjmlEmail(strapi, "registration-confirmation", email, "Confirma tu correo", { name, confirmUrl })`
  - `overrideAuthLocal`: before issuing `pendingToken`, check `user.confirmed`. If `false`, return `{ requiresConfirmation: true, email }` (no pendingToken, no JWT)
- **Optionally** `apps/strapi/config/plugins.ts`: if using Strapi built-in email confirmation as a backstop, add `emailConfirmation: true` — but this conflicts with MJML approach if Strapi also sends its own email

**NEW — Website:**
- `apps/website/app/pages/confirmar-correo.vue` — reads `?token=` from URL, calls `GET /api/auth/confirm-email?token=XXX`, shows success/failure
- `apps/website/app/components/FormLogin.vue` — handle the new `requiresConfirmation: true` response state (show "Verifica tu correo antes de continuar" message instead of navigating to `/login/verificar`)

**NEW — Dashboard:** (if dashboard users can register)
- Dashboard has no registration flow — only admin-created accounts. Dashboard `FormLogin.vue` may still need to handle `requiresConfirmation: true` gracefully (show error message).

---

## New Feature: MJML Auth Emails

### Password Reset Email

**Current state:** Strapi's built-in `forgotPassword` endpoint sends the reset email using an internal template (not MJML). The email text, styling, and link format are controlled by Strapi's `users-permissions` plugin.

**To override:** The `users-permissions` plugin exposes a `reset_password` email template configurable via `strapi.config.get('plugin.users-permissions.advanced.email.reset_password')`. However, this is a plain HTML/text template, not MJML.

**Integration approach:** Override the email sending in the `forgotPassword` flow. The cleanest hook is in `overrideAuthLocal` pattern — but `forgotPassword` is a separate controller method (`auth.forgotPassword`). To intercept it:

1. In `strapi-server.ts`, add `instance.forgotPassword = overrideForgotPassword(instance.forgotPassword.bind(instance))`
2. `overrideForgotPassword`: call original controller (which sets `resetPasswordToken` on the user, but does NOT yet send the email — actually in Strapi v5 it DOES send the email internally), then... **Problem:** The original `forgotPassword` controller sends the email internally before returning. To use MJML, you'd need to prevent the built-in email send and send your own.

**Alternative (simpler) approach:** Strapi v5 `users-permissions` plugin config accepts `email_reset_password.template` in advanced settings via the admin panel. A third path: override `emailTemplates` in the plugin config:

```typescript
// In plugins.ts (Strapi config)
"users-permissions": {
  config: {
    // existing config...
    emailTemplates: {
      reset_password: {
        subject: "Restablece tu contraseña",
        text: "...", // plain text
        html: "<p>...</p>", // static HTML — not MJML-dynamic
      }
    }
  }
}
```

**Problem:** `emailTemplates` config accepts static HTML strings, not dynamic template functions. MJML rendering (via `renderEmail(template, data)`) produces HTML at runtime with per-user data injected.

**Best approach for MJML password reset:** Override `instance.forgotPassword` in `strapi-server.ts`. The override must:
1. Generate a reset token (replicate what the original does, or call a service directly)
2. Send MJML email with the token
3. Return success — without calling the original (to prevent double-email)

OR, less invasively: call the original first, then send an additional MJML email. But this would send two emails.

**Realistic approach:** Look up the user by email, generate `resetPasswordToken` manually via `strapi.plugins["users-permissions"].services.user.edit()`, skip the original controller, send the MJML email with the link. This fully replaces the built-in flow.

### New vs. Modified Files (Password Reset MJML)

**NEW — Strapi:**
- `src/services/mjml/templates/password-reset.mjml` — extends base layout, shows reset link as `<mj-button>`, explains link expiry (1 hour)
- Export function `overrideForgotPassword` in `controllers/authController.ts`

**MODIFIED — Strapi:**
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — add `instance.forgotPassword = overrideForgotPassword(instance.forgotPassword.bind(instance))`
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — add `overrideForgotPassword` function

**No frontend changes needed** for password reset email — the link format `{frontendUrl}/cuenta/restablecer-contrasena?code=TOKEN` (or wherever Strapi's `reset_password.link` setting points) remains the same.

---

## New Feature: Password Reset Context Routing

### Problem Statement

Both apps (website and dashboard) have forgot-password and reset-password flows. When Strapi sends a password reset email, the link points to a single URL (configured in Strapi admin → Users & Permissions → Advanced Settings → Reset Password page URL). This means:

- If a **dashboard admin** requests a reset, the link goes to whatever URL is configured — typically the website's reset page or the dashboard's
- If a **website user** requests a reset, same configured URL
- There's no per-request routing: one URL for all

**Context routing goal:** Route admin users to `/auth/reset-password?token=XXX` (dashboard) and regular users to `/cuenta/restablecer-contrasena?token=XXX` (website).

### Current Reset URL Configuration

Strapi `users-permissions` advanced settings → `reset_password.link` is a single global URL. This is what gets embedded in reset emails.

### Integration Architecture for Context Routing

**Option A — Role-based redirect at a neutral endpoint**

Create a new endpoint `GET /api/auth/reset-redirect?code=TOKEN` that:
1. Looks up the user by `resetPasswordToken` to find their role
2. Redirects to dashboard reset URL (if Manager role) or website reset URL (if Authenticated role)
3. Set `reset_password.link` in Strapi admin to point to this endpoint

**Problem:** Exposes user role via unauthenticated redirect — minor security consideration. Also adds an HTTP round-trip.

**Option B — Override `forgotPassword` to embed context in email**

In `overrideForgotPassword`, determine the user's role BEFORE sending the email, then build a context-specific reset URL:

```typescript
const userRole = user.role?.name?.toLowerCase();
const resetBaseUrl = userRole === 'manager'
  ? process.env.DASHBOARD_URL
  : process.env.FRONTEND_URL;
const resetLink = `${resetBaseUrl}/[reset-path]?code=${resetPasswordToken}`;
```

Send MJML email with this context-specific link. No redirect endpoint needed. The token itself is the credential; the URL is just where to present it.

**This is the recommended approach** — clean, no extra round-trip, no separate endpoint, works with the MJML override already needed.

### New vs. Modified Files (Context Routing)

**No new files beyond what MJML override already requires.**

**MODIFIED — Strapi:**
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — in `overrideForgotPassword`, add role lookup before sending email, build role-specific reset URL

**MODIFIED — Website:**
- `apps/website/app/pages/cuenta/restablecer-contrasena.vue` — **this page does not exist yet**. Must be created. Reads `?code=` query param (matches `route.query.token` naming in dashboard's `FormResetPassword.vue`). Calls `resetPassword({ code, password, passwordConfirmation })` via `useStrapiAuth()`.

**No dashboard changes needed** — `/auth/reset-password` page and `FormResetPassword.vue` already exist and work.

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `registerUserLocal` (Strapi) | Wraps `instance.register` — validates extra fields, calls original, triggers email verification | `email-confirmation` table, MJML service |
| `overrideAuthLocal` (Strapi) | Wraps `instance.callback` — intercepts login, issues `pendingToken` OR returns `requiresConfirmation` | `verification-code` table, `users-permissions.user` table, MJML service |
| `overrideForgotPassword` (Strapi — NEW) | Wraps `instance.forgotPassword` — generates reset token, determines role, sends MJML email with context-specific URL | `users-permissions.user` table, MJML service |
| `email-confirmation` API (Strapi — NEW) | `GET /api/auth/confirm-email?token=` sets `confirmed: true` | `email-confirmation` table, `users-permissions.user` table |
| `auth-verify` API (Strapi — existing) | `POST /api/auth/verify-code`, `POST /api/auth/resend-code` | `verification-code` table |
| `user-registration.ts` middleware | Post-response; creates reservations, Zoho contact | `ad-reservation`, `ad-featured-reservation`, Zoho CRM |
| `FormRegister.vue` (website) | 2-step form → `register()` → success message → redirect `/login` | `useStrapiAuth().register()` |
| `confirmar-correo.vue` (website — NEW) | Reads `?token=`, calls confirm-email API, shows result | `GET /api/auth/confirm-email` via Nitro proxy |
| `restablecer-contrasena.vue` (website — NEW) | Reads `?code=`, calls `resetPassword()` | `useStrapiAuth().resetPassword()` |
| `FormLogin.vue` (website — MODIFIED) | Handle `requiresConfirmation: true` response | `useState('pendingToken')` |
| `FormForgotPassword.vue` (both — existing) | Calls `forgotPassword({ email })` | `useStrapiAuth().forgotPassword()` |

---

## Data Flow

### Email Verification on Registration

```
FormRegister.vue
  → POST /api/auth/local/register
    → registerUserLocal (Strapi wrapper)
      → original register controller (creates user, confirmed: false)
      → generate UUID token → INSERT email-confirmation record
      → sendMjmlEmail("registration-confirmation", email, { name, confirmUrl })
      ← return { jwt, user } (original response — user can't login until confirmed)

user-registration.ts middleware (runs after)
  → creates 3 ad-reservations, 3 featured-reservations
  → creates Zoho CRM contact

[User clicks email link]
  → GET /api/auth/confirm-email?token=UUID
    → look up email-confirmation record
    → strapi.db.query('plugin::users-permissions.user').update({ confirmed: true })
    → delete email-confirmation record
    ← 200 OK
  → confirmar-correo.vue shows success, link to /login

[User tries to login before confirming]
  → overrideAuthLocal detects user.confirmed === false
  ← { requiresConfirmation: true, email }
  → FormLogin.vue shows "Verifica tu correo antes de continuar"
```

### MJML Password Reset with Context Routing

```
FormForgotPassword.vue (website or dashboard)
  → useStrapiAuth().forgotPassword({ email })
    → POST /api/auth/forgot-password (users-permissions)
      → overrideForgotPassword (Strapi wrapper)
        → look up user by email (strapi.db.query)
        → IF user not found → return 200 (Strapi convention: no user leak)
        → generate resetPasswordToken (crypto.randomUUID or similar)
        → UPDATE user SET resetPasswordToken = token
        → determine role (user.role?.name)
        → build role-specific resetLink:
            Manager → `${DASHBOARD_URL}/auth/reset-password?code=${token}`
            Authenticated → `${FRONTEND_URL}/cuenta/restablecer-contrasena?code=${token}`
        → sendMjmlEmail("password-reset", email, { name, resetLink })
        ← 200 OK (do NOT call original controller — avoid double email)
    ← 200 OK
  → Swal.fire success → router.push('/')

[User clicks link in email]
  Website user → /cuenta/restablecer-contrasena?code=TOKEN
    → restablecer-contrasena.vue (NEW page)
      → FormResetPassword.vue (adapted from dashboard)
        → resetPassword({ code: route.query.code, password, passwordConfirmation })
        ← 200 OK → Swal.fire success → router.push('/login')

  Dashboard admin → /auth/reset-password?code=TOKEN (EXISTING — no change needed)
```

---

## Patterns to Follow

### Pattern 1: Controller Factory Wrapper

All auth overrides use the higher-order function pattern to wrap Strapi's factory-instantiated controllers.

```typescript
export const overrideForgotPassword =
  (originalController) => async (ctx) => {
    // Custom logic — do NOT call originalController if replacing email behavior entirely
    // OR: await originalController(ctx) first if extending (be careful of double-email)
  };
```

Add to `strapi-server.ts`:
```typescript
instance.forgotPassword = overrideForgotPassword(instance.forgotPassword.bind(instance));
```

### Pattern 2: Standard Content-API for New Endpoints

New endpoints that aren't plugin overrides go in `src/api/`:
```
src/api/email-confirmation/
  content-types/email-confirmation/schema.json
  controllers/email-confirmation.ts
  routes/email-confirmation.ts
```

Routes are `auth: false` (user has no JWT at this point; the token IS the credential).

### Pattern 3: MJML Template

```mjml
{% extends "layouts/base.mjml" %} {% block content %}
<mj-text font-size="16px">Hola {{ name }},</mj-text>
<mj-text>...</mj-text>
<mj-button href="{{ confirmUrl }}">Confirmar correo</mj-button>
<mj-text>Este enlace es válido por <b>24 horas</b>.</mj-text>
{% endblock %}
```

Template variables auto-injected: `year`, `frontendUrl`, `appUrl`. Custom vars: whatever you pass in `data` object to `sendMjmlEmail()`.

### Pattern 4: Website Page for Token-Based Auth Actions

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
const token = route.query.token as string

definePageMeta({
  layout: 'auth',
  middleware: ['guest'],
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Setting Properties Directly on Plugin Controller Factory

**What goes wrong:** `plugin.controllers.auth.forgotPassword = myFn` — sets a property on the factory function object, which is never read when Strapi instantiates the controller.

**Instead:** Wrap the factory (established pattern in `strapi-server.ts`).

### Anti-Pattern 2: Calling `originalController` When Fully Replacing Email Behavior

**What goes wrong:** In `overrideForgotPassword`, calling `await originalController(ctx)` first, then sending your MJML email — sends two emails (one from Strapi's internal template, one MJML).

**Instead:** Skip the original call. Replicate only what you need (token generation + user update). Do NOT call `originalController`.

### Anti-Pattern 3: Pushing Routes onto Plugin Route Factory

**What goes wrong:** `plugin.routes["content-api"].routes.push(...)` — the pushed routes are properties on the factory function, ignored during bootstrap.

**Instead:** Register as standard content-API routes in `src/api/`.

### Anti-Pattern 4: Blocking Registration Response on Email Send

**What goes wrong:** `await sendMjmlEmail(...)` inside `registerUserLocal` that throws will block the entire registration and return a 500 to the user even though the user was created successfully.

**Instead:** Wrap email send in try/catch (non-fatal). User is created; email failure is logged but doesn't roll back registration.

### Anti-Pattern 5: Using `verification-code` Table for Two Purposes

**What goes wrong:** Re-using the 2-step login `verification-code` table for email confirmation — different fields needed, different semantics (no `attempts`, no `pendingToken`, needs link URL not code).

**Instead:** Create a separate `email-confirmation` content type with minimal fields: `{ userId, token, expiresAt }`.

### Anti-Pattern 6: Single Strapi Reset URL for Both Apps

**What goes wrong:** Strapi admin → Advanced Settings → Reset Password URL is global. Dashboard admins land on the website reset page (no manager role check) or vice versa.

**Instead:** Override `forgotPassword` to build per-role URLs inside the email send (see Pattern 1). No global URL configuration needed.

---

## Build Order

Dependencies form a clear DAG. Build in this order:

### Phase 1 — Foundation: MJML Template Infrastructure

**Rationale:** Everything else needs MJML templates. Create them first so they can be verified in isolation via `test.ts`.

**Files (NEW):**
- `src/services/mjml/templates/registration-confirmation.mjml`
- `src/services/mjml/templates/password-reset.mjml`

**Also fix:** `verification-code.mjml` — update copy from "5 minutos" to "15 minutos" to match `CODE_EXPIRY_MS`.

**Gate:** Templates must render without MJML compilation errors.

---

### Phase 2 — `email-confirmation` Content Type

**Rationale:** The `emailConfirmed` endpoint and registration wrapper both depend on this schema existing.

**Files (NEW):**
- `src/api/email-confirmation/content-types/email-confirmation/schema.json` — `{ userId: integer, token: string (unique), expiresAt: datetime }`; `draftAndPublish: false`
- `src/api/email-confirmation/controllers/email-confirmation.ts` — `confirmEmail(ctx)`: look up record by token, check expiry, `UPDATE user SET confirmed = true`, delete record, return 200
- `src/api/email-confirmation/routes/email-confirmation.ts` — `GET /api/auth/confirm-email`, `auth: false`

**Gate:** Strapi restarts cleanly with new content type. Endpoint responds to valid and invalid tokens correctly.

---

### Phase 3 — Registration Email Verification

**Rationale:** Depends on Phase 1 (template) and Phase 2 (content type). The `overrideAuthLocal` change (unconfirmed user check) should be done here too — otherwise confirmed=false users could log in between Phases 3 and the final verification.

**Files (MODIFIED):**
- `src/extensions/users-permissions/controllers/authController.ts`:
  - `registerUserLocal`: after `await registerController(ctx)`, generate UUID, insert `email-confirmation` record, send MJML email (non-fatal)
  - `overrideAuthLocal`: before creating `verification-code` record, check `user.confirmed`. If `false`, set `ctx.body = { requiresConfirmation: true, email }` and return early (no `pendingToken`, no JWT issued)

**Files (NEW — website):**
- `apps/website/app/pages/confirmar-correo.vue` — reads `?token=`, calls `GET /api/auth/confirm-email`, shows success state, links to `/login`

**Files (MODIFIED — website):**
- `apps/website/app/components/FormLogin.vue` — handle `requiresConfirmation: true` in catch/response handling; show inline message instead of navigating to `/login/verificar`

**Files (MODIFIED — dashboard):**
- `apps/dashboard/app/components/FormLogin.vue` — same graceful handling of `requiresConfirmation: true` (display error message; dashboard users can be manually confirmed via Strapi admin)

**Gate:** New user registers → receives MJML confirmation email → clicks link → `confirmed: true` → can now log in through 2-step flow. Unconfirmed user who tries to log in sees clear error.

---

### Phase 4 — MJML Password Reset + Context Routing

**Rationale:** Depends on Phase 1 (password-reset template). Independent of Phases 2 and 3. Could be built in parallel with Phase 3 if two devs, but sequential is safer.

**Files (NEW — Strapi):**
- Export `overrideForgotPassword` from `src/extensions/users-permissions/controllers/authController.ts`

**Files (MODIFIED — Strapi):**
- `src/extensions/users-permissions/strapi-server.ts` — add `instance.forgotPassword = overrideForgotPassword(instance.forgotPassword.bind(instance))`
- `src/extensions/users-permissions/controllers/authController.ts` — implement `overrideForgotPassword`:
  1. Extract email from `ctx.request.body`
  2. Look up user by email (if not found, return 200 — no user leak)
  3. Generate `resetToken = crypto.randomUUID()`
  4. Update user: `strapi.db.query('plugin::users-permissions.user').update({ where: { email }, data: { resetPasswordToken: resetToken } })`
  5. Determine role: `user.role?.name?.toLowerCase()`
  6. Build context-specific URL:
     - `'manager'` → `${process.env.DASHBOARD_URL}/auth/reset-password?code=${resetToken}`
     - default → `${process.env.FRONTEND_URL}/cuenta/restablecer-contrasena?code=${resetToken}`
  7. `sendMjmlEmail(strapi, "password-reset", email, "Restablece tu contraseña", { name, resetLink })` — non-fatal
  8. `ctx.body = { ok: true }`

**Files (NEW — website):**
- `apps/website/app/pages/cuenta/restablecer-contrasena.vue` — auth layout, guest middleware, noindex; reads `?code=` from query; contains `FormResetPassword.vue` (new component mirrored from dashboard)
- `apps/website/app/components/FormResetPassword.vue` — mirrors `apps/dashboard/app/components/FormResetPassword.vue`; reads `route.query.code` (not `route.query.token` — check which param name Strapi uses); calls `resetPassword({ code, password, passwordConfirmation })` via `useStrapiAuth()` (NOT `@nuxtjs/strapi`'s `forgotPassword` variant; uses `code` not `token` in the payload)

**Environment variables needed:**
- `DASHBOARD_URL` — e.g., `https://dashboard.waldo.click` (not `APP_URL` which is Strapi's own URL)
- `FRONTEND_URL` — already exists in `send-email.ts`: `process.env.FRONTEND_URL || "http://localhost:3000"`

**Gate:** Website user requests reset → receives MJML email → link goes to `/cuenta/restablecer-contrasena` → enters new password → redirected to `/login`. Dashboard admin requests reset → link goes to `/auth/reset-password` (existing flow, now with MJML email).

---

### Phase 5 — Cleanup Cron for Email Confirmations

**Rationale:** `email-confirmation` records for users who never confirmed will accumulate. Add a cleanup cron alongside the existing `verification-code-cleanup`.

**Files (MODIFIED — Strapi):**
- Add `email-confirmation-cleanup` cron in the existing cron config — `deleteMany` on `email-confirmation` records where `expiresAt < now()`
- Register in `cron-runner` controller's cron map for manual trigger via `POST /api/cron-runner/email-confirmation-cleanup`

**Gate:** Cron runs without error, deletes only expired records.

---

### Build Order Summary

| Phase | Scope | Files | Depends On |
|-------|-------|-------|------------|
| 1 | MJML templates | 2 new templates + 1 fix | Nothing |
| 2 | `email-confirmation` content type + API | 3 new files | Phase 1 (template for confirm email) |
| 3 | Registration verification flow | 1 Strapi modified, 1 new website page, 2 frontend modified | Phases 1 + 2 |
| 4 | MJML password reset + context routing | 1 Strapi modified, 1 new Strapi function, 2 new website files | Phase 1 |
| 5 | Cleanup cron | 1 Strapi modified | Phase 2 |

Phases 4 and 5 are independent of Phase 3 and can overlap once Phase 1 is done.

---

## New vs. Modified Files (Complete List)

### NEW Files

| File | App | Purpose |
|------|-----|---------|
| `src/services/mjml/templates/registration-confirmation.mjml` | Strapi | Email verification link template |
| `src/services/mjml/templates/password-reset.mjml` | Strapi | MJML-branded password reset email |
| `src/api/email-confirmation/content-types/email-confirmation/schema.json` | Strapi | `{ userId, token, expiresAt }` schema |
| `src/api/email-confirmation/controllers/email-confirmation.ts` | Strapi | `confirmEmail()` handler |
| `src/api/email-confirmation/routes/email-confirmation.ts` | Strapi | `GET /api/auth/confirm-email` public route |
| `apps/website/app/pages/confirmar-correo.vue` | Website | Email confirmation landing page |
| `apps/website/app/pages/cuenta/restablecer-contrasena.vue` | Website | Password reset landing page (missing today) |
| `apps/website/app/components/FormResetPassword.vue` | Website | Reset password form (mirror of dashboard's) |

### MODIFIED Files

| File | App | What Changes |
|------|-----|-------------|
| `src/extensions/users-permissions/controllers/authController.ts` | Strapi | Add `overrideForgotPassword`; update `registerUserLocal` (send confirmation email); update `overrideAuthLocal` (block unconfirmed users) |
| `src/extensions/users-permissions/strapi-server.ts` | Strapi | Wire `instance.forgotPassword = overrideForgotPassword(...)` |
| `src/services/mjml/templates/verification-code.mjml` | Strapi | Fix copy: "5 minutos" → "15 minutos" |
| `apps/website/app/components/FormLogin.vue` | Website | Handle `requiresConfirmation: true` response state |
| `apps/dashboard/app/components/FormLogin.vue` | Dashboard | Handle `requiresConfirmation: true` response state (show error) |

### Files That Do NOT Need Changes

| File | Why Untouched |
|------|---------------|
| `src/api/auth-verify/` (both files) | `verify-code` and `resend-code` already work correctly |
| `apps/dashboard/app/pages/auth/reset-password.vue` | Already exists, reads `?token=` query param correctly |
| `apps/dashboard/app/components/FormResetPassword.vue` | Already works — dashboard reset flow unchanged |
| `apps/dashboard/app/components/FormForgotPassword.vue` | Calls `forgotPassword({ email })` — behavior unchanged from frontend perspective |
| `apps/website/app/components/FormForgotPassword.vue` | Same — no frontend change needed for reset email override |
| `apps/strapi/config/plugins.ts` | Mailgun stays, no `emailConfirmation: true` added (using custom flow) |
| `user-registration.ts` middleware | No changes — post-registration side effects remain correct |

---

## Environment Variables Required

| Variable | Where Used | Notes |
|----------|-----------|-------|
| `FRONTEND_URL` | Already in `send-email.ts` | Already set in env |
| `DASHBOARD_URL` | `overrideForgotPassword` for context routing | NEW — must be added to `.env` and `.env.example` |

---

## Risk Surface

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Double email (MJML + Strapi built-in) on password reset | HIGH | Do NOT call `originalController` in `overrideForgotPassword` — fully replace |
| Unconfirmed user blocked forever if confirmation email fails | HIGH | Confirmation email is non-fatal; user can resend (add resend endpoint or link); Strapi admin can manually set `confirmed: true` |
| `resetPasswordToken` field naming — Strapi uses this internally | MEDIUM | Use `strapi.db.query('plugin::users-permissions.user').update(...)` directly with `resetPasswordToken` field — same field Strapi's original `forgotPassword` writes |
| `email-confirmation` records orphaned if user never clicks | LOW | Phase 5 cleanup cron handles this |
| `verificar.vue` `pendingToken` guard redirects to `/login` on page refresh | LOW — existing behavior | No change needed; expected behavior |

---

## Sources

- Direct inspection: `apps/strapi/src/extensions/users-permissions/strapi-server.ts`
- Direct inspection: `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`
- Direct inspection: `apps/strapi/config/plugins.ts`
- Direct inspection: `apps/strapi/src/services/mjml/` (all files)
- Direct inspection: `apps/strapi/src/middlewares/user-registration.ts`
- Direct inspection: `apps/strapi/src/api/auth-verify/` (controllers + routes)
- Direct inspection: `apps/strapi/src/api/verification-code/content-types/verification-code/schema.json`
- Direct inspection: `apps/website/app/components/FormRegister.vue`, `FormForgotPassword.vue`, `FormVerifyCode.vue`
- Direct inspection: `apps/dashboard/app/components/FormResetPassword.vue`, `FormForgotPassword.vue`, `FormVerifyCode.vue`
- Direct inspection: `apps/dashboard/app/pages/auth/reset-password.vue`, `forgot-password.vue`
- Direct inspection: `apps/website/app/pages/login/verificar.vue`
- Direct inspection: `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json`

---

*Architecture research for: Email Auth Flows — Strapi v5 + Nuxt 4*
*Researched: 2026-03-13*
