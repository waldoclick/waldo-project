# Feature Landscape

**Domain:** Email authentication flows — email verification on registration + MJML auth emails + password reset context routing
**Project:** Waldo — Classified ads platform (Strapi v5 + Nuxt 4)
**Researched:** 2026-03-13
**Milestone scope:** Subsequent milestone. Platform already has 2-step login (v1.36), Google OAuth, password reset, and a working MJML email system.

---

## Critical Context: What Already Exists

Before cataloguing features, understand what the codebase does today. Everything below is verified from direct code inspection (HIGH confidence).

| Concern | Current State |
|---------|--------------|
| **Registration (form)** | `FormRegister.vue` calls Strapi `register()`, shows Swal "Te enviamos un correo para confirmar tu dirección de correo electrónico." then `router.push('/login')`. Strapi email confirmation is **NOT enabled** in `plugins.ts` — users get a JWT immediately. The Swal message is a lie: no confirmation email is actually sent today. |
| **Registration (Google OAuth)** | `registerUserAuth` wraps the OAuth callback, creates reservations, returns JWT. OAuth = email already verified by Google. Must never require email confirmation. |
| **Login (2-step)** | `overrideAuthLocal` intercepts `POST /api/auth/local` — returns `{ pendingToken, email }` instead of JWT. User enters 6-digit code at `/login/verificar`. Code verified via `POST /api/auth/verify-code`. |
| **Password reset (website)** | `FormForgotPassword.vue` calls `forgotPassword()` from `useStrapiAuth()`. Strapi sends its **built-in plain-text** reset email. Link goes to the URL configured in Strapi Admin → Advanced Settings → "Reset password page". Currently set to the website's `/restablecer-contrasena`. |
| **Password reset (dashboard)** | Identical `forgotPassword()` call from `apps/dashboard/app/components/FormForgotPassword.vue`. **Same single Strapi config** → same plain-text email → same website link. Dashboard admins get sent to the website to reset, then land on the website homepage. Broken UX. |
| **MJML email system** | `sendMjmlEmail()` + Nunjucks templates live in `apps/strapi/src/services/mjml/`. 15 templates exist (ad lifecycle, verification-code, gift-reservation, etc.). All user-facing emails use MJML **except** the password reset email and the email confirmation email — those use Strapi's native plain-text system. |
| **Strapi `confirmed` field** | Every `plugin::users-permissions.user` has a `confirmed: boolean`. When "Enable email confirmation" is OFF in Strapi admin (current state), `confirmed` is `true` by default on registration and login is unrestricted. When ON, `confirmed` starts `false`; Strapi blocks `POST /api/auth/local` with HTTP 400 `"Your account email is not confirmed"` before the 2-step code flow even runs. |
| **Reset password URL in Strapi** | One global config in **Users & Permissions → Advanced Settings → "Reset password page"**. Strapi embeds this URL in the reset email token query string as `?token=TOKEN`. It is a single value for the entire platform. |
| **`overrideAuthLocal` and the `confirmed` field** | The function only sees the Strapi response. If login fails (wrong credentials OR unconfirmed email), `ctx.response.body?.jwt` is null → function returns early, no `pendingToken`. So email confirmation and 2-step login interact correctly at the Strapi level, but the frontend has no way to distinguish "wrong password" from "email not confirmed" without parsing the error message. |
| **Strapi email confirmation endpoint** | `GET /api/auth/email-confirmation?confirmation=TOKEN` — Strapi native. Confirms account, sets `confirmed: true`, redirects to "Redirection url" from Advanced Settings. |
| **Resend confirmation endpoint** | `POST /api/auth/send-email-confirmation` with `{ email }` — Strapi native. No custom code needed. |

---

## Table Stakes

Features users expect. Missing = platform feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **MJML password reset email** | All other user-facing emails are MJML-based (ad approved, ad rejected, verification code, gift reservation). Sending a plain-text password reset email when everything else is branded HTML is jarringly inconsistent. | Medium | Requires overriding Strapi's `forgotPassword` endpoint. The challenge: Strapi generates the reset token internally. Override must generate the token via `strapi.plugins['users-permissions'].services.user.generateResetPasswordToken(user)` (or equivalent), build the URL, and call `sendMjmlEmail()` with a new `password-reset.mjml` template. |
| **Post-registration confirmation screen** | After registering, users need clear visual feedback: "Check your inbox." Redirecting to `/login` (current behavior) leaves users confused — they try to log in and get a vague error. The Swal message on registration currently says a confirmation email was sent, but it was not. | Low | New page `/registro/confirmar` in website only. Shows email address, instructions, spam folder reminder, and a "Resend" button. Pure frontend — no backend change. |
| **Enable Strapi email confirmation** | Must be toggled ON in Strapi Admin panel (Users & Permissions → Advanced Settings → "Enable email confirmation: TRUE"). Without this, the confirmation email system doesn't fire. This is a configuration change, not a code change. | Near-zero | Config-only. MUST be done together with items below or the UX breaks. |
| **Login block handling for unconfirmed users** | When confirmation is enabled and a user tries to log in before confirming, `FormLogin.vue` receives a Strapi 400. Current catch shows a generic Swal "Hubo un error." Users need a specific actionable message: "Tu cuenta no ha sido confirmada. Revisa tu correo." with a "Reenviar confirmación" link/button. | Low-Medium | Detect the specific Strapi error string `"Your account email is not confirmed"` in the catch block of `FormLogin.vue` (website and dashboard). Show a targeted message. The email is already in the form state for the resend call. |
| **Resend confirmation email button** | Users miss emails. Every email verification flow must provide a resend path. | Low | A button calling `POST /api/auth/send-email-confirmation` with `{ email }`. Strapi native endpoint — no custom backend code. Add a 60-second UI cooldown (same pattern as `FormVerifyCode.vue`). |
| **Password reset context routing** | Dashboard admins clicking "Forgot password" get a reset link pointing to the website's `/restablecer-contrasena`. After resetting, they land on the website homepage — not the dashboard. Must route dashboard reset emails to `dashboard.waldo.click/auth/reset-password`. | Medium | See Feature Deep-Dive section below. |

---

## Differentiators

Features that improve UX but are not strictly required.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Confirmation landing page (`/registro/confirmar`)** | Dedicated page after registration with email displayed, instructions, spam reminder, and resend button. Pattern used by GitHub, Linear, Notion, Mailchimp. Users who land there know exactly what to do next. | Low | Static page + one API call. Only in website (dashboard users don't register). |
| **Confirmation redirect success state** | When a user clicks the confirmation link, Strapi redirects to the "Redirection url" (e.g. `/login?confirmed=true`). The login page detects `?confirmed=true` and shows a success banner: "¡Tu cuenta ha sido confirmada! Ya puedes iniciar sesión." | Low | Pure frontend — a `computed` that reads `route.query.confirmed` in `login/index.vue`. |
| **Already-confirmed guard on the confirmation redirect page** | If a user clicks the confirmation link a second time, Strapi redirects with an error param. The landing page should handle this gracefully: "Tu cuenta ya fue confirmada. Inicia sesión." instead of showing a broken state. | Low | Check for error query params on the redirect page. |
| **MJML account-confirmation email** | Replace Strapi's native plain-text confirmation email with a branded MJML version matching the rest of the platform. | Medium-High | **Complex to implement without duplicate sends.** Strapi's native register controller sends the confirmation email automatically when the feature is enabled. Overriding requires intercepting at exactly the right point to prevent the native send AND still generate a valid confirmation token. The Strapi `email-confirmation` template can be customized via Admin UI as an acceptable interim. Flag as v2. |
| **Typed login error differentiation in dashboard** | Dashboard `FormLogin.vue` also hits `POST /api/auth/local`. If a dashboard admin's email is unconfirmed (rare scenario), they should get an actionable message too. | Low | Same change as website `FormLogin.vue`. |

---

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Require confirmation before browsing the public site** | Users who haven't confirmed can still view listings, profiles, and articles. Blocking browsing adds friction with zero security benefit. | Block only authenticated-only actions: ad creation, viewing contact details. Strapi's `confirmed` check on login already handles this — unconfirmed users can't get a JWT. |
| **Email confirmation for Google OAuth users** | Google OAuth proves email ownership. Strapi sets `confirmed: true` automatically for OAuth users. The existing `ctx.method === "GET"` guard in `overrideAuthLocal` correctly bypasses 2-step for OAuth — do NOT add a confirmation layer on top. | Keep OAuth flow as-is. |
| **Duplicate confirmation email sends** | If email confirmation is enabled in Strapi, Strapi's `register()` controller already sends the native confirmation email. Adding `sendMjmlEmail()` in `registerUserLocal` without suppressing Strapi's native send would send TWO emails. | Either (A) customize Strapi's native email template via Admin UI (plain HTML, acceptable interim), or (B) suppress the native send AND call `sendMjmlEmail()`. Not both. |
| **Custom confirmation token system** | The 2-step login needed a custom `verification-code` content type because Strapi's native `auth.local` had no concept of "pending." Email confirmation is already a first-class Strapi feature with token generation, storage, and expiry. Building a parallel system wastes time and creates confusion. | Use Strapi's native `confirmed` field and token lifecycle. Only intercept the email send if needed. |
| **`?origin=dashboard` query param on the forgot-password form URL** | The forgot-password form is on a protected page. The `source` parameter must survive the email round-trip (sent via form → goes into email → comes back in reset link). Query params on the forgot-password form URL are not sent in the email — they're lost after the form submits. | Send `source` as a field in the `forgotPassword()` POST body. Strapi receives it and encodes it into the reset URL. |
| **Separate Strapi "Reset password page" per app** | Strapi has one global setting. Configuring it to the dashboard URL would break website users. | Use a single neutral reset URL (e.g. website) and handle source-based routing client-side, OR generate the reset URL entirely in a custom controller override so Strapi's config is bypassed. |

---

## Feature Deep-Dives

### Feature 1: Post-Registration UX Flow

**Recommended flow (when email confirmation is enabled):**

```
1. User submits /registro form
2. Strapi creates user (confirmed: false), sends native confirmation email
3. FormRegister.vue receives success → navigates to /registro/confirmar?email=user@domain.com
4. /registro/confirmar page shows:
   - "Hemos enviado un correo a user@domain.com"
   - "Revisa tu bandeja de entrada y la carpeta de spam"
   - "Reenviar correo" button (POST /api/auth/send-email-confirmation)
   - Link back to /login
5. User clicks link in email → Strapi confirms → redirects to /login?confirmed=true
6. /login detects ?confirmed=true → shows banner "¡Cuenta confirmada! Ya puedes iniciar sesión."
```

**What NOT to do:** Show a Swal then `router.push('/login')`. Users arrive at login without knowing they need to confirm. They try to log in, get a vague error, and churn.

**Strapi mechanics (HIGH confidence — verified from official docs + code):**
- `Enable email confirmation: TRUE` in Strapi admin panel Advanced Settings
- Strapi sends `GET /api/auth/email-confirmation?confirmation=TOKEN` link in email
- After confirmation: Strapi redirects to "Redirection url" (set in Advanced Settings → should be `/login?confirmed=true` or `/registro/bienvenida`)
- Resend: `POST /api/auth/send-email-confirmation` with `{ email }` — natively available, no custom code

---

### Feature 2: Login Block UX for Unconfirmed Users

**What Strapi does (HIGH confidence):**
- `POST /api/auth/local` returns HTTP 400 with error message `"Your account email is not confirmed"` BEFORE reaching `overrideAuthLocal`'s JWT check
- `overrideAuthLocal` sees `ctx.response.body?.jwt` is null and returns early → no `pendingToken` issued
- The frontend's generic `catch` currently shows "Hubo un error. Por favor, inténtalo de nuevo." regardless of reason

**Required change in `FormLogin.vue` (both apps):**

```typescript
} catch (error) {
  const msg = (error as any)?.error?.message || '';
  if (msg === 'Your account email is not confirmed') {
    // Show actionable message with resend option
    // email is available from form.value.email
    await Swal.fire({
      title: 'Cuenta sin confirmar',
      text: 'Tu cuenta no ha sido confirmada. Revisa tu bandeja de entrada o haz clic para reenviar el correo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Reenviar correo',
      cancelButtonText: 'Cerrar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        // POST /api/auth/send-email-confirmation
      }
    });
  } else {
    Swal.fire('Error', 'Hubo un error. Por favor, inténtalo de nuevo.', 'error');
  }
}
```

**Important nuance:** The unconfirmed login scenario only occurs AFTER email confirmation is enabled. Both changes (Strapi config + frontend error handling) must ship together.

---

### Feature 3: Password Reset Context Routing

**The problem in detail:**
- Strapi has ONE global "Reset password page" URL setting
- `FormForgotPassword.vue` in **both** apps calls the same `forgotPassword()` from `useStrapiAuth()`
- `useStrapiAuth()` from `@nuxtjs/strapi` calls `POST /api/auth/forgot-password` with just `{ email }`
- Strapi generates a token, builds `<Reset password page>?token=TOKEN`, sends it in the native plain-text email
- Dashboard user gets an email pointing to the website — broken

**Recommended solution: Custom `forgotPassword` controller override + MJML email**

This solution is tightly coupled to the MJML password reset email (also a table stake). When we override the controller to send MJML, we can simultaneously control the URL:

```
1. Dashboard FormForgotPassword sends { email, source: "dashboard" }
   (source field added to form submission, not a query param)

2. Strapi custom forgotPassword controller:
   a. Validates email → finds user
   b. Generates reset token via strapi.plugins['users-permissions'].services.user
   c. Builds reset URL:
      - source === "dashboard" → https://dashboard.waldo.click/auth/reset-password?token=TOKEN
      - else → https://waldo.click/restablecer-contrasena?token=TOKEN
   d. Calls sendMjmlEmail() with password-reset.mjml template + the URL
   e. Does NOT call the original Strapi forgotPassword (avoids double email)

3. User clicks link in MJML email → lands on the correct app's reset page
4. FormResetPassword.vue on each app reads route.query.token as "code" → calls resetPassword()
   (existing FormResetPassword.vue already handles this correctly — no change needed)
5. After reset: redirect to the correct app's login
   - Website: router.push('/login')
   - Dashboard: router.push('/auth/login')
```

**Strapi reset password token generation (MEDIUM confidence — documented in source code patterns):**
The Strapi `users-permissions` service exposes a method to generate reset tokens. The exact method name needs verification at implementation time (`generateResetPasswordToken` or similar). The token is stored directly on the user record (not a separate content type) — this is different from the verification-code system.

**Alternative (simpler, lower risk):**
Set Strapi's "Reset password page" to the website URL (current behavior). On the website's `FormResetPassword.vue`, add a `source` query param forwarding: if `?source=dashboard`, after successful reset call `navigateTo('https://dashboard.waldo.click/auth/login')` instead of `router.push('/')`. The dashboard's `FormForgotPassword.vue` passes `?source=dashboard` as part of a custom redirect URL (but this requires the website to know the dashboard URL, which is stored in `runtimeConfig`).

**Recommendation:** Use the custom controller + MJML approach (option 1). It's cleaner and avoids cross-app URL references. The MJML email is a table stake anyway — solving both problems in one controller override is efficient.

---

### Feature 4: Email Verification Edge Cases

| Edge Case | Strapi Behavior | Required Frontend Handling |
|-----------|----------------|---------------------------|
| User tries to log in before confirming | HTTP 400 `"Your account email is not confirmed"` | Specific Swal + resend button (Feature 2) |
| User clicks confirmation link twice | Strapi returns error in redirect query params to "Redirection url" | Landing page reads error params, shows "Ya confirmada — inicia sesión" |
| User already confirmed tries to re-confirm | Same as above — Strapi returns error | Same handler |
| User re-registers with same email (any confirm state) | Strapi: "Email or Username are already taken" | Existing error handler in `FormRegister.vue` — no change needed |
| Resend called too fast | Strapi native has no built-in rate limiting on resend | Add 60-second UI cooldown on resend button. Same pattern as `FormVerifyCode.vue`. |
| Confirmation token expires | Strapi v5 confirmation tokens do NOT expire by default | Document as known gap. Admin can manually confirm in Strapi admin panel. Not a blocking issue. |
| Google OAuth user — does `confirmed` matter? | Strapi sets `confirmed: true` during OAuth callback automatically | No change needed. OAuth flow is unaffected. |
| Dashboard user (admin) gets unconfirmed error | Admin accounts are typically created via Strapi admin panel (not the public register form) with `confirmed: true` manually set | Low-risk scenario. But add error handling to dashboard `FormLogin.vue` defensively. |
| User registered BEFORE email confirmation was enabled | All pre-existing users have `confirmed: true` (Strapi default). Enabling confirmation does NOT lock out existing users. | No migration needed. Verify `confirmed: true` on existing users before enabling. |

**Pre-migration verification (critical, LOW complexity):**
Before enabling email confirmation in Strapi admin, run a DB check to confirm all existing users have `confirmed: true`. If any have `confirmed: false` (could exist if admin manually created them), bulk-update them before enabling the feature to avoid locking them out.

---

## Feature Dependencies

```
MJML password-reset.mjml template
  ↓
Custom forgotPassword controller override (Strapi)
  ↓
Password reset context routing (source field → correct URL in email)
  ↑
Dashboard FormForgotPassword sends { email, source: "dashboard" }

─────────────────────────────────────────────────────────────

Enable Strapi email confirmation (Admin Settings)
  ↓ [must ship together with ALL of:]
  ├─ /registro/confirmar page (website)
  ├─ FormRegister.vue updated: redirect to /registro/confirmar instead of /login
  ├─ Login error handling for unconfirmed users (FormLogin.vue — website)
  ├─ Login error handling for unconfirmed users (FormLogin.vue — dashboard)
  └─ Resend confirmation button (calls POST /api/auth/send-email-confirmation)

─────────────────────────────────────────────────────────────

MJML account-confirmation email (DEFERRED — v2)
  → Requires suppressing Strapi's native confirmation send
  → Complex to implement without duplicate emails
  → Acceptable interim: style Strapi's native template via Admin UI
```

---

## MVP Recommendation

**Phase A — Password reset (ship first, independent of email confirmation):**

1. `password-reset.mjml` MJML template
2. Custom `forgotPassword` controller override in `authController.ts`
3. Dashboard `FormForgotPassword.vue` sends `{ email, source: "dashboard" }` in POST body
4. Reset URLs route to correct app based on source

**Phase B — Email confirmation (ship as atomic unit):**

1. Pre-flight: verify all existing users have `confirmed: true`
2. Enable Strapi "Email confirmation" in Admin Settings
3. Set "Redirection url" in Strapi to `/login?confirmed=true`
4. Create `/registro/confirmar` page in website
5. Update `FormRegister.vue` to navigate to `/registro/confirmar` on success
6. Update `FormLogin.vue` (website + dashboard) to detect unconfirmed error + show resend UI
7. Enable and test end-to-end

**Ship A first, then B.** Phase A is a self-contained improvement that fixes a real broken UX (dashboard reset). Phase B is a larger change that requires all pieces to land simultaneously.

**Defer:**
- MJML account-confirmation email override (complex, acceptable with styled native template as interim)
- Confirmation token expiry (not a Strapi v5 default feature)
- Bulk backfill of unconfirmed users (not needed if pre-flight check passes)

---

## Sources

| Source | Confidence | Reference |
|--------|------------|-----------|
| Strapi v5 Users & Permissions docs — Advanced Settings, email templates, confirmation endpoint | HIGH | https://docs.strapi.io/dev-docs/plugins/users-permissions |
| Codebase — `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` | HIGH | `overrideAuthLocal`, `registerUserLocal`, token handling |
| Codebase — `apps/strapi/config/plugins.ts` | HIGH | Email confirmation NOT currently configured; Mailgun provider; `allowedFields` |
| Codebase — `apps/website/app/components/FormRegister.vue` | HIGH | Swal message (incorrect — says email sent, but confirmation is disabled) + `router.push('/login')` |
| Codebase — `apps/website/app/components/FormForgotPassword.vue` | HIGH | `forgotPassword()` call, no `source` field, generic catch |
| Codebase — `apps/dashboard/app/components/FormForgotPassword.vue` | HIGH | Identical pattern, same missing `source` field, routes to `/` after success (website homepage via Strapi redirect) |
| Codebase — `apps/website/app/components/FormResetPassword.vue` | HIGH | Reads `route.query.token` as `code`; `resetPassword()` from `useStrapiAuth()` |
| Codebase — `apps/strapi/src/services/mjml/index.ts` | HIGH | `sendMjmlEmail()` — established override pattern for email interception |
| Codebase — `apps/website/app/pages/login/verificar.vue` | HIGH | 60-second resend cooldown pattern via `FormVerifyCode.vue` — reuse for resend confirmation |
