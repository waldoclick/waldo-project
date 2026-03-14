---
phase: quick-39
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/services/mjml/templates/email-confirmation.mjml
  - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
  - apps/strapi/src/extensions/users-permissions/strapi-server.ts
autonomous: false
requirements: [QUICK-39]

must_haves:
  truths:
    - "User receives a branded MJML confirmation email on registration"
    - "Resend button on /registro/confirmar sends the branded MJML email"
    - "Confirmation link in the email is correct and activates the account"
  artifacts:
    - path: "apps/strapi/src/services/mjml/templates/email-confirmation.mjml"
      provides: "Branded MJML template with confirmation link button"
    - path: "apps/strapi/src/extensions/users-permissions/controllers/authController.ts"
      provides: "overrideSendEmailConfirmation and updated registerUserLocal with MJML send"
    - path: "apps/strapi/src/extensions/users-permissions/strapi-server.ts"
      provides: "sendEmailConfirmation wired into auth factory override"
  key_links:
    - from: "registerUserLocal"
      to: "sendMjmlEmail('email-confirmation', ...)"
      via: "confirmationToken fetched after registerController(ctx)"
      pattern: "confirmationToken"
    - from: "overrideSendEmailConfirmation"
      to: "sendMjmlEmail('email-confirmation', ...)"
      via: "user fetched by email, confirmationToken used to build URL"
      pattern: "send-email-confirmation"
---

<objective>
Replace Strapi's default confirmation email with a branded MJML email for both initial registration and resend flows.

Purpose: Every transactional email in the platform uses the custom MJML pipeline — email confirmation was the only exception. This makes it consistent.
Output: New `email-confirmation.mjml` template, `overrideSendEmailConfirmation` controller, updated `registerUserLocal` to MJML-send the confirmation email after registration.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md
@apps/strapi/src/extensions/users-permissions/strapi-server.ts
@apps/strapi/src/extensions/users-permissions/controllers/authController.ts
@apps/strapi/src/services/mjml/send-email.ts
@apps/strapi/src/services/mjml/templates/reset-password.mjml

<interfaces>
<!-- Key patterns extracted from codebase for executor reference -->

sendMjmlEmail signature (send-email.ts):
```ts
sendMjmlEmail(strapi, template: string, to: string, subject: string, data: Record<string, any>): Promise<void>
```
Auto-injects: `year`, `frontendUrl`, `appUrl` — do NOT pass these manually.

overrideForgotPassword pattern (authController.ts):
- Full replacement (not wrapper) — avoids double email
- Fetches user by email from DB
- Generates/saves token
- Calls sendMjmlEmail
- Returns ctx.send({ ok: true })

registerUserLocal pattern:
- Wraps registerController(ctx)
- Reads user from ctx.response.body?.user after call
- ctx.response.body has `jwt` only when email_confirmation is OFF

Strapi DB query for user with confirmationToken:
```ts
const userWithToken = await strapi.db
  .query("plugin::users-permissions.user")
  .findOne({ where: { id: user.id }, select: ["confirmationToken", "email", "username", "firstname"] });
```

Confirmation URL format (Strapi standard):
```ts
const confirmationUrl = `${process.env.FRONTEND_URL || "https://waldo.click"}/api/auth/email-confirmation?confirmation=${userWithToken.confirmationToken}`;
```
Note: This hits Strapi's built-in `/api/auth/email-confirmation` endpoint which validates the token and confirms the user. The `FRONTEND_URL` env var points to the public website but the confirmation URL must go to `/api/` (Strapi). Use `process.env.APP_URL || "http://localhost:1337"` for the Strapi base instead.

Strapi's sendEmailConfirmation controller signature (native):
- POST /api/auth/send-email-confirmation
- Body: { email: string }
- Strapi internally: finds user by email, checks if already confirmed, calls getService('user').sendConfirmationEmail(user)
- Our override must FULLY REPLACE (not wrap) to avoid double email on resend
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create email-confirmation.mjml MJML template</name>
  <files>apps/strapi/src/services/mjml/templates/email-confirmation.mjml</files>
  <action>
Create the branded MJML template for email confirmation. Follow the exact same structure as `reset-password.mjml` (extends base layout, block content). Template variables:
- `{{ name }}` — user's firstname or username
- `{{ confirmationUrl }}` — the full URL to click to confirm the account

Template content (in Spanish, matching platform tone):
- Greeting with `{{ name }}`
- Explanation: "Para activar tu cuenta en Waldo.click®, haz clic en el botón:"
- Orange button (`background-color="#f5a623"`) labeled "Confirmar correo electrónico" linking to `{{ confirmationUrl }}`
- Disclaimer: "Si no creaste esta cuenta, ignora este correo."
- Validity note: "El enlace es válido hasta que confirmes tu correo."
- Sign-off with "El equipo de Waldo.click®"
  </action>
  <verify>File exists and renders — run: `node -e "const {renderEmail}=require('./apps/strapi/src/services/mjml'); console.log(renderEmail('email-confirmation',{name:'Test',confirmationUrl:'https://example.com'}).substring(0,100))"` from repo root (adjust if ts-node needed)</verify>
  <done>Template file exists with correct Nunjucks variables `{{ name }}` and `{{ confirmationUrl }}`, extends base layout</done>
</task>

<task type="auto">
  <name>Task 2: Add overrideSendEmailConfirmation and update registerUserLocal</name>
  <files>apps/strapi/src/extensions/users-permissions/controllers/authController.ts</files>
  <action>
**Part A — Add `overrideSendEmailConfirmation` export** (fully replaces Strapi's native `sendEmailConfirmation`):

```ts
export const overrideSendEmailConfirmation = () => async (ctx) => {
  const { email } = ctx.request.body as { email?: string };

  if (!email) return ctx.badRequest("Email is required");

  const user = await strapi.db
    .query("plugin::users-permissions.user")
    .findOne({
      where: { email: email.toLowerCase() },
      select: ["id", "email", "username", "firstname", "confirmed", "blocked", "confirmationToken"],
    });

  // Silent success if user not found or already confirmed (matches Strapi built-in behavior)
  if (!user || user.confirmed || user.blocked) return ctx.send({ ok: true });

  const confirmationUrl = `${process.env.APP_URL || "http://localhost:1337"}/api/auth/email-confirmation?confirmation=${user.confirmationToken}`;
  const name = user.firstname || user.username || user.email;

  try {
    await sendMjmlEmail(
      strapi,
      "email-confirmation",
      user.email,
      "Confirma tu correo electrónico",
      { name, confirmationUrl }
    );
  } catch (err) {
    strapi.log.error(
      `[overrideSendEmailConfirmation] Failed to send confirmation email to ${user.email}: ${err?.message ?? err}`
    );
  }

  ctx.send({ ok: true });
};
```

**Part B — Update `registerUserLocal`** to send the branded MJML confirmation email after registration when email_confirmation is enabled (no JWT in response). Add this block AFTER `createUserReservations(user)` and BEFORE `return ctx.response`:

```ts
// If email confirmation is enabled, Strapi sends its built-in template.
// Also send our branded MJML template (Admin Panel template must be cleared to avoid duplicate).
if (!ctx.response.body?.jwt && user?.id) {
  try {
    const userWithToken = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: user.id },
        select: ["confirmationToken", "email", "username", "firstname"],
      });

    if (userWithToken?.confirmationToken) {
      const confirmationUrl = `${process.env.APP_URL || "http://localhost:1337"}/api/auth/email-confirmation?confirmation=${userWithToken.confirmationToken}`;
      const name = userWithToken.firstname || userWithToken.username || userWithToken.email;

      await sendMjmlEmail(
        strapi,
        "email-confirmation",
        userWithToken.email,
        "Confirma tu correo electrónico",
        { name, confirmationUrl }
      );
    }
  } catch (err) {
    // Non-fatal — Strapi's built-in already sent a confirmation email
    strapi.log.error(`[registerUserLocal] Failed to send MJML confirmation email: ${err?.message ?? err}`);
  }
}
```

Export `overrideSendEmailConfirmation` at the module level so it can be imported by `strapi-server.ts`.
  </action>
  <verify>TypeScript compiles — run: `yarn workspace @waldo/strapi tsc --noEmit` from repo root. Zero new errors.</verify>
  <done>`overrideSendEmailConfirmation` exported from authController.ts; `registerUserLocal` sends MJML after registration when no JWT; no TS errors</done>
</task>

<task type="auto">
  <name>Task 3: Wire overrideSendEmailConfirmation into strapi-server.ts</name>
  <files>apps/strapi/src/extensions/users-permissions/strapi-server.ts</files>
  <action>
1. Add `overrideSendEmailConfirmation` to the import from `./controllers/authController`:

```ts
import {
  registerUserLocal,
  registerUserAuth,
  overrideAuthLocal,
  overrideForgotPassword,
  overrideSendEmailConfirmation,
} from "./controllers/authController";
```

2. Inside the `plugin.controllers.auth = (context) => { ... }` factory wrapper, add the override alongside the other auth controller overrides:

```ts
instance.sendEmailConfirmation = overrideSendEmailConfirmation();
```

Add this line after `instance.forgotPassword = overrideForgotPassword();`.

The `sendEmailConfirmation` method maps to `POST /api/auth/send-email-confirmation` — Strapi uses the method name on the auth controller instance to resolve the handler. Verify the method name matches Strapi v5's auth controller by checking the built-in source if needed (it's `sendEmailConfirmation` in Strapi v5).
  </action>
  <verify>TypeScript compiles — run: `yarn workspace @waldo/strapi tsc --noEmit` from repo root. Zero new errors. Also start Strapi and confirm no startup errors: `yarn workspace @waldo/strapi develop --no-watch-admin 2>&1 | head -20`</verify>
  <done>strapi-server.ts imports and wires `overrideSendEmailConfirmation`; Strapi starts without errors</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
  - email-confirmation.mjml branded template
  - overrideSendEmailConfirmation controller (handles POST /api/auth/send-email-confirmation with MJML)
  - registerUserLocal updated to send MJML confirmation on registration
  - strapi-server.ts wired with sendEmailConfirmation override

  IMPORTANT manual step before testing: In Strapi Admin Panel → Settings → Users & Permissions → Advanced Settings → Email templates → "Email address confirmation" — clear the body/content so Strapi's built-in template sends nothing (or set it to a single space). This prevents double emails on registration. The MJML override handles everything.
  </what-built>
  <how-to-verify>
  1. Register a new user at https://waldo.click/registro with a real email address
  2. Confirm the page redirects to /registro/confirmar with email shown
  3. Check inbox — verify a branded Waldo.click® confirmation email arrived (NOT Strapi's default plain template)
  4. Click the confirmation link — verify account is confirmed and you can log in
  5. Register another test user → wait 60s → click "Reenviar enlace" on /registro/confirmar
  6. Check inbox — verify the resend also uses the branded MJML template
  </how-to-verify>
  <resume-signal>Type "approved" if both initial and resend emails use the MJML template, or describe any issues</resume-signal>
</task>

</tasks>

<verification>
- `yarn workspace @waldo/strapi tsc --noEmit` passes with zero new errors
- Strapi starts without handler-not-found or import errors
- Registration flow sends branded MJML email (not Strapi's default admin template)
- Resend endpoint sends branded MJML email
- Confirmation link activates account correctly
</verification>

<success_criteria>
- New user registering on /registro receives a branded Waldo.click® MJML confirmation email
- Clicking "Reenviar enlace" on /registro/confirmar sends the branded MJML email
- The confirmation link in both emails correctly activates the user account
- No double emails (Admin Panel template cleared)
- TypeScript compiles clean
</success_criteria>

<output>
After completion, create `.planning/quick/39-fix-post-registration-redirect-and-missi/39-SUMMARY.md`
</output>
