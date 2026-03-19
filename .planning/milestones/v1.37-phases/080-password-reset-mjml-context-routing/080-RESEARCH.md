# Phase 080: Password Reset MJML + Context Routing — Research

**Researched:** 2026-03-14
**Domain:** Strapi v5 plugin controller factory override + MJML email infrastructure + Nuxt 4 form body extension
**Confidence:** HIGH — all findings verified against installed source code in this repository

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PWDR-01 | User receives a branded MJML email when requesting a password reset | `overrideForgotPassword()` fully replaces `forgotPassword` in the auth factory; calls `sendMjmlEmail()` with `reset-password.mjml` template |
| PWDR-02 | Password reset email link points to the website's reset page when requested from the website | `context: 'website'` body param → `${FRONTEND_URL}/restablecer-contrasena?token=<TOKEN>` |
| PWDR-03 | Password reset email link points to the dashboard's reset page when requested from the dashboard | `context: 'dashboard'` body param → `${DASHBOARD_URL}/auth/reset-password?token=<TOKEN>` |
</phase_requirements>

---

## Summary

Phase 080 is almost entirely designed. The project's `.planning/research/STACK.md` (2026-03-13) is a source-verified, HIGH-confidence document that answers every technical question for this phase by reading the **installed** `@strapi/plugin-users-permissions@5.36.1` source code. No new packages are required. All infrastructure — MJML compilation, Nunjucks templating, Mailgun transport, auth factory wrapper — already exists in production.

The work is three coordinated changes: (1) add `overrideForgotPassword()` to `authController.ts` and wire it into `strapi-server.ts` via the existing factory wrapper pattern; (2) create `reset-password.mjml` following the established `verification-code.mjml` structure; (3) add `context: 'website'` / `context: 'dashboard'` to each app's `FormForgotPassword.vue` `forgotPassword()` call. The `DASHBOARD_URL` env var must also be added to `.env.example` and production `.env`.

**Primary recommendation:** Full-replacement controller (not wrapper) for `forgotPassword` — wrapping the original sends two emails. Wire into existing factory block in `strapi-server.ts`. Frontend changes are two-line additions (one per app). Token field name (`?token=`) and `route.query.token → code` body field mapping are already correct in both `FormResetPassword.vue` files — no frontend reset-page changes needed.

---

## Standard Stack

### Core (all already installed — no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `mjml` | `^4.16.1` | Compiles `.mjml` → inline-CSS HTML | Already powering verification-code emails |
| `nunjucks` | `^3.2.4` | Variable injection in `.mjml` template files | Configured via `nunjucks.configure()` in `src/services/mjml/index.ts` |
| `@strapi/plugin-users-permissions` | `5.36.1` | Provides `forgotPassword` controller; factory pattern already wrapped | Installed plugin — same version as production |
| `@nuxtjs/strapi` v2 | v2 | `useStrapiAuth().forgotPassword()` in both Nuxt apps | Already used by both `FormForgotPassword.vue` files |
| `crypto` (Node built-in) | built-in | `crypto.randomBytes(64).toString('hex')` for reset token | Used by built-in `forgotPassword` — matches token size |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Full replacement `overrideForgotPassword` | Wrap original + MJML | ❌ Wrap sends two emails — built-in also calls `strapi.plugin('email').service('email').send()` |
| `context` in request body | `context` in query param | ❌ Query params lost after form POST; body extension is established pattern (`recaptchaToken` already uses `as any`) |
| Single global URL (website only) | Two separate endpoints | ❌ Dashboard admins get website reset page — wrong UX; dual endpoints duplicate logic |

---

## Architecture Patterns

### Pattern 1: Auth Factory Full Replacement (established in this project)

**What:** Wrap `plugin.controllers.auth` factory, set `instance.forgotPassword` to a fully new function that handles token generation, DB update, and MJML send.

**When to use:** Any time the original Strapi method must be completely replaced (not extended) — wrapping causes double behavior.

**Implementation in `strapi-server.ts` (existing block, add one line):**
```typescript
// Source: apps/strapi/src/extensions/users-permissions/strapi-server.ts
const originalAuthFactory = plugin.controllers.auth;
plugin.controllers.auth = (context) => {
  const instance = originalAuthFactory(context);
  instance.register = registerUserLocal(instance.register.bind(instance));
  instance.connect  = registerUserAuth(instance.connect.bind(instance));
  instance.callback = overrideAuthLocal(instance.callback.bind(instance));
  instance.forgotPassword = overrideForgotPassword();   // ← ADD THIS (no .bind — full replacement)
  return instance;
};
```

**Why no `.bind(instance)`:** `overrideAuthLocal` is wrapped (it calls `originalController` internally); `overrideForgotPassword` is a full replacement that does NOT call the original — binding is unnecessary and misleading.

### Pattern 2: MJML Template (Nunjucks block inheritance)

**What:** New `reset-password.mjml` extends `layouts/base.mjml`, fills `{% block content %}`, receives `{ name, resetUrl }` as template variables.

**Template structure (modeled on `verification-code.mjml`):**
```mjml
{% extends "layouts/base.mjml" %} {% block content %}
<mj-text font-size="16px"> Hola {{ name }}, </mj-text>
<mj-text>
  Recibimos una solicitud para restablecer la contraseña de tu cuenta en
  <b>Waldo.click®</b>. Haz clic en el botón para continuar:
</mj-text>
<mj-button
  background-color="#f5a623"
  color="#ffffff"
  font-size="16px"
  border-radius="4px"
  href="{{ resetUrl }}"
>
  Restablecer contraseña
</mj-button>
<mj-text>
  Si no solicitaste este cambio, ignora este correo. Tu contraseña no será
  modificada.
</mj-text>
<mj-text>
  Este enlace es válido por <b>24 horas</b>.
</mj-text>
<mj-text> Saludos,<br />El equipo de <b>Waldo.click®</b> </mj-text>
{% endblock %}
```

**Variables provided automatically by `sendMjmlEmail()`:** `year`, `frontendUrl`, `appUrl` — no need to pass these manually.

### Pattern 3: `overrideForgotPassword()` Controller

**What:** Full-replacement controller that generates token, saves to DB, builds context-aware URL, sends MJML.

**Complete implementation (verbatim from STACK.md, HIGH confidence):**
```typescript
// Source: .planning/research/STACK.md (source-verified against installed plugin)
// In: apps/strapi/src/extensions/users-permissions/controllers/authController.ts

export const overrideForgotPassword = () => async (ctx) => {
  const { email, context } = ctx.request.body as {
    email?: string;
    context?: 'website' | 'dashboard';
  };

  if (!email) return ctx.badRequest('Email is required');

  const user = await strapi.db
    .query('plugin::users-permissions.user')
    .findOne({ where: { email: email.toLowerCase() } });

  // Silent success for unknown/blocked users (matches built-in behavior)
  if (!user || user.blocked) return ctx.send({ ok: true });

  const resetPasswordToken = crypto.randomBytes(64).toString('hex');

  // Save token before sending email (matches built-in ordering)
  await strapi.db.query('plugin::users-permissions.user').update({
    where: { id: user.id },
    data: { resetPasswordToken },
  });

  const baseUrl = context === 'dashboard'
    ? (process.env.DASHBOARD_URL || 'https://dashboard.waldo.click')
    : (process.env.FRONTEND_URL || 'https://waldo.click');

  const resetPath = context === 'dashboard'
    ? 'auth/reset-password'
    : 'restablecer-contrasena';

  const resetUrl = `${baseUrl}/${resetPath}?token=${resetPasswordToken}`;

  try {
    await sendMjmlEmail(
      strapi,
      'reset-password',
      user.email,
      'Restablece tu contraseña',
      { name: user.firstname || user.username || user.email, resetUrl }
    );
  } catch (_) {
    // Non-fatal: token is saved; user can request again
  }

  ctx.send({ ok: true });
};
```

**Import to add at top of `authController.ts`:** `crypto` is already imported (`import crypto from "crypto";` — line 2).

### Pattern 4: Frontend Body Extension (`as any` cast)

**What:** `@nuxtjs/strapi` v2 `forgotPassword()` type only accepts `{ email }`. Extra fields require a cast.

**Website `FormForgotPassword.vue` (change `forgotPassword` call):**
```typescript
// Change from:
await forgotPassword({ email: values.email, recaptchaToken: token } as any);
// Change to:
await forgotPassword({ email: values.email, recaptchaToken: token, context: 'website' } as any);
```

**Dashboard `FormForgotPassword.vue` (add `context` field):**
```typescript
// Change from:
await forgotPassword({ email: values.email as string });
// Change to:
await forgotPassword({ email: values.email as string, context: 'dashboard' } as any);
```

Note: The dashboard version currently has NO `as any` cast. The cast is required because `context` is not in the `@nuxtjs/strapi` v2 type definition. Also note: the dashboard currently passes no `recaptchaToken` — this is intentional and unchanged.

### Anti-Patterns to Avoid

- **Wrapping original `forgotPassword` with `instance.forgotPassword.bind(instance)`:** The original method calls `strapi.plugin('email').service('email').send()` — wrapping sends two emails. Use full replacement only.
- **Using query param for `context`:** Query params are stripped on form POST in some browser/framework combinations. Use request body.
- **Hardcoding reset URLs:** `DASHBOARD_URL` and `FRONTEND_URL` env vars drive the URLs. No hardcoded production domains in source code.
- **Using `documentId` for user updates in this override:** User ID lookup for `resetPasswordToken` update uses `where: { id: user.id }` (numeric), consistent with the installed plugin source. The AGENTS.md `documentId` preference applies to content-API collections — `plugin::users-permissions.user` is a plugin entity, not a content-API document.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MJML compilation | Custom template renderer | `mjml` + `nunjucks` via `src/services/mjml/index.ts` | Already in place; handles inline CSS, email client compat |
| Email transport | Direct Mailgun HTTP calls | `sendMjmlEmail()` via `src/services/mjml/send-email.ts` | Handles prefix, replyTo, from, error logging — one call |
| Token generation | Custom random string | `crypto.randomBytes(64).toString('hex')` | Matches Strapi's built-in size; cryptographically secure |
| Auth factory override | Modifying plugin source | `strapi-server.ts` factory wrapper pattern | Pattern already in production; survives plugin upgrades |

**Key insight:** The project already has the complete MJML pipeline. Adding password reset email requires only a new template file and a controller function — zero infrastructure work.

---

## Common Pitfalls

### Pitfall 1: Double Email Send
**What goes wrong:** The override wraps the original `forgotPassword` and calls it first, then sends MJML — resulting in two emails per request (one Lodash-template plain HTML, one MJML).
**Why it happens:** The original `forgotPassword` unconditionally sends an email as its final step. `overrideAuthLocal` can wrap safely because it checks `if (!jwt) return` — but `forgotPassword` has no analogous early-exit condition.
**How to avoid:** Full replacement — do NOT call the original controller inside `overrideForgotPassword`. The factory assignment is `instance.forgotPassword = overrideForgotPassword()` (no `.bind(instance)`, no call to original).
**Warning signs:** Receiving two password reset emails in testing.

### Pitfall 2: `?token=` vs `?code=` Query Param Mismatch
**What goes wrong:** Email link uses `?code=TOKEN` but `FormResetPassword.vue` reads `route.query.token`, so the token is always `undefined`.
**Why it happens:** The Strapi `POST /api/auth/reset-password` body field is `code`, but the URL query param the frontend reads is `token`.
**How to avoid:** Email link MUST use `?token=<TOKEN>`. Both `FormResetPassword.vue` files (website + dashboard) already read `route.query.token` and pass it as `code` in the body — this mapping is correct and must not be changed.
**Warning signs:** Reset form shows 404 (because `onMounted` checks `route.query.token` and calls `showError` if missing).

### Pitfall 3: Missing `as any` Cast on Dashboard `forgotPassword`
**What goes wrong:** TypeScript error — `context` property not in `@nuxtjs/strapi` v2 `forgotPassword()` parameter type.
**Why it happens:** `@nuxtjs/strapi` v2 types `forgotPassword` as accepting only `{ email: string }`. The dashboard's current call (`await forgotPassword({ email: values.email as string })`) has no existing cast to extend.
**How to avoid:** Change to `await forgotPassword({ email: values.email as string, context: 'dashboard' } as any)`. The website already uses `as any` for `recaptchaToken`.
**Warning signs:** TypeScript compilation error in dashboard app during `yarn typecheck`.

### Pitfall 4: `DASHBOARD_URL` Missing from `.env.example`
**What goes wrong:** The env var falls back to hardcoded `https://dashboard.waldo.click` — the fallback works in production but the env var is undiscoverable by new contributors.
**How to avoid:** Add `DASHBOARD_URL=https://dashboard.waldo.click` to `apps/strapi/.env.example` and ensure it's set in the production `.env`.
**Warning signs:** Dashboard reset link works by accident via fallback; env var missing from documentation.

### Pitfall 5: `nunjucks.configure()` Path is Relative to Strapi CWD
**What goes wrong:** Template not found at render time if path is wrong.
**Why it happens:** `nunjucks.configure("src/services/mjml/templates", ...)` is relative to Strapi's working directory (project root when started via `yarn dev` from `apps/strapi/`). New templates placed in `src/services/mjml/templates/` are auto-discovered — no config change needed.
**How to avoid:** Place `reset-password.mjml` in `apps/strapi/src/services/mjml/templates/` (same folder as `verification-code.mjml`). Call `sendMjmlEmail(strapi, 'reset-password', ...)` — the template name maps to `reset-password.mjml`.

---

## Code Examples

### `overrideForgotPassword` export + import wiring

```typescript
// authController.ts — ADD this export
export const overrideForgotPassword = () => async (ctx) => {
  // ... (full implementation in Architecture Patterns above)
};
```

```typescript
// strapi-server.ts — ADD import
import {
  registerUserLocal,
  registerUserAuth,
  overrideAuthLocal,
  overrideForgotPassword,   // ← ADD
} from "./controllers/authController";

// strapi-server.ts — ADD to factory block (already exists, add one line)
plugin.controllers.auth = (context) => {
  const instance = originalAuthFactory(context);
  instance.register     = registerUserLocal(instance.register.bind(instance));
  instance.connect      = registerUserAuth(instance.connect.bind(instance));
  instance.callback     = overrideAuthLocal(instance.callback.bind(instance));
  instance.forgotPassword = overrideForgotPassword();  // ← ADD
  return instance;
};
```

### `sendMjmlEmail` call signature (already established)

```typescript
// Source: apps/strapi/src/services/mjml/send-email.ts
await sendMjmlEmail(
  strapi,
  'reset-password',          // template name → maps to reset-password.mjml
  user.email,                // recipient
  'Restablece tu contraseña', // subject (prefix "Waldo.click®: " added automatically)
  { name: '...', resetUrl: '...' }  // template variables
);
// Auto-injected: year, frontendUrl, appUrl
```

### `FormResetPassword.vue` token consumption (unchanged — shown for reference)

```typescript
// Both apps/website + apps/dashboard FormResetPassword.vue
// Source: apps/website/app/components/FormResetPassword.vue lines 95-97, 113-116
const form = ref({
  code: (route.query.token as string) || "",  // reads ?token= from URL
  // ...
});
await resetPassword({
  code: values.code,           // sends token as 'code' body field
  password: values.password,
  passwordConfirmation: values.password,
});
// Strapi POST /api/auth/reset-password looks up resetPasswordToken === code ✅
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Strapi native `forgotPassword` (Lodash template, single Admin Panel URL) | `overrideForgotPassword` (MJML, context-aware URL) | Phase 080 | Branded emails + correct reset URL per app |
| Dashboard users receive website reset link | Dashboard users receive `dashboard.waldo.click/auth/reset-password` link | Phase 080 | Fixed live broken UX |

**What does NOT change:**
- Both `FormResetPassword.vue` files — they already correctly read `route.query.token` and pass it as `code`
- `POST /api/auth/reset-password` controller — native Strapi handles token lookup
- MJML pipeline (`src/services/mjml/index.ts`, `send-email.ts`) — no changes
- Rate limiting on `POST /api/auth/forgot-password` — koa2-ratelimit middleware still applies at route level

---

## Open Questions

1. **MJML button vs text link for reset email**
   - What we know: `verification-code.mjml` uses `<mj-text>` for the code display; other templates (not yet viewed) may use `<mj-button>`
   - What's unclear: Project design preference for CTA styling
   - Recommendation: Use `<mj-button>` for the reset link (standard for action emails; better click targets on mobile); fall back to plain `<a>` text link as secondary option if project style dictates

2. **Token expiry copy in `reset-password.mjml`**
   - What we know: Strapi's built-in `resetPasswordToken` has no automatic expiry — the token persists until used or overwritten by a new request
   - What's unclear: Whether to communicate an expiry period to the user
   - Recommendation: Do not state an expiry time in the email copy to avoid misleading users; say "el enlace es válido hasta que solicites uno nuevo" or simply omit expiry language

3. **`FRONTEND_URL` fallback for website context**
   - What we know: `send-email.ts` already auto-injects `frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'` into every template; the reset URL is built separately in `overrideForgotPassword`
   - What's unclear: Whether the website reset path `restablecer-contrasena` is subject to future renaming
   - Recommendation: Hardcode the path string in the controller (it's a stable route used in REQUIREMENTS.md); document that a path change requires a controller update

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + ts-jest |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `yarn workspace waldo-strapi test --testPathPattern=authController` |
| Full suite command | `yarn workspace waldo-strapi test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PWDR-01 | `overrideForgotPassword` sends MJML email (not two, not zero) | unit | `yarn workspace waldo-strapi test --testPathPattern=authController` | ❌ Wave 0 |
| PWDR-01 | Email send failure is non-fatal (ctx still returns `{ ok: true }`) | unit | `yarn workspace waldo-strapi test --testPathPattern=authController` | ❌ Wave 0 |
| PWDR-02 | `context: 'website'` → `resetUrl` contains `FRONTEND_URL` + `restablecer-contrasena` | unit | `yarn workspace waldo-strapi test --testPathPattern=authController` | ❌ Wave 0 |
| PWDR-03 | `context: 'dashboard'` → `resetUrl` contains `DASHBOARD_URL` + `auth/reset-password` | unit | `yarn workspace waldo-strapi test --testPathPattern=authController` | ❌ Wave 0 |
| PWDR-01 | Unknown/blocked user → `{ ok: true }` (no email, no error) | unit | `yarn workspace waldo-strapi test --testPathPattern=authController` | ❌ Wave 0 |
| PWDR-01 | Token saved to DB before email sent | unit | `yarn workspace waldo-strapi test --testPathPattern=authController` | ❌ Wave 0 |
| PWDR-02/03 | No `context` → defaults to website URL (`FRONTEND_URL`) | unit | `yarn workspace waldo-strapi test --testPathPattern=authController` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `yarn workspace waldo-strapi test --testPathPattern=authController`
- **Per wave merge:** `yarn workspace waldo-strapi test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts` — add `overrideForgotPassword` test suite (file EXISTS; add new `describe` block, do not remove existing tests)

---

## File Change Map

### Strapi (`apps/strapi`)

| File | Action | Change |
|------|--------|--------|
| `src/extensions/users-permissions/controllers/authController.ts` | MODIFY | Add `overrideForgotPassword()` export |
| `src/extensions/users-permissions/strapi-server.ts` | MODIFY | Add `overrideForgotPassword` to import + factory block |
| `src/services/mjml/templates/reset-password.mjml` | CREATE | New MJML template for password reset |
| `src/extensions/users-permissions/controllers/authController.test.ts` | MODIFY | Add `overrideForgotPassword` test suite |
| `.env.example` | MODIFY | Add `DASHBOARD_URL=https://dashboard.waldo.click` |
| `.env` | MODIFY | Add `DASHBOARD_URL=https://dashboard.waldo.click` (production value) |

### Website (`apps/website`)

| File | Action | Change |
|------|--------|--------|
| `app/components/FormForgotPassword.vue` | MODIFY | Add `context: 'website'` to `forgotPassword()` call |

### Dashboard (`apps/dashboard`)

| File | Action | Change |
|------|--------|--------|
| `app/components/FormForgotPassword.vue` | MODIFY | Add `context: 'dashboard'` to `forgotPassword()` call + add `as any` cast |

**Total files: 8 (2 new, 6 modified)**

---

## Sources

### Primary (HIGH confidence)

- `.planning/research/STACK.md` — source-verified research against `node_modules/@strapi/plugin-users-permissions@5.36.1`; contains exact implementation patterns
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — existing factory wrapper (lines 38-48)
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — existing controller; `overrideForgotPassword` follows the same file structure
- `apps/strapi/src/services/mjml/send-email.ts` — `sendMjmlEmail()` API signature
- `apps/strapi/src/services/mjml/index.ts` — Nunjucks + MJML pipeline
- `apps/strapi/src/services/mjml/templates/verification-code.mjml` — canonical template structure to mirror
- `apps/website/app/components/FormForgotPassword.vue` — current call site (needs `context` added)
- `apps/dashboard/app/components/FormForgotPassword.vue` — current call site (needs `context` + `as any`)
- `apps/website/app/components/FormResetPassword.vue` — confirms `route.query.token` → `code` mapping (unchanged)
- `apps/dashboard/app/components/FormResetPassword.vue` — confirms same mapping (unchanged)
- `apps/strapi/.env.example` — confirms `FRONTEND_URL` exists; `DASHBOARD_URL` missing (must be added)
- `.planning/STATE.md` — key decisions confirming approach (lines 56-65)

### Secondary (MEDIUM confidence)

- None required — all decisions are source-verified

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed and in use
- Architecture: HIGH — patterns are exact copies of production code in this repo
- Pitfalls: HIGH — double-send confirmed by reading installed plugin source; token param confirmed by reading both `FormResetPassword.vue` files
- Test requirements: HIGH — Jest/ts-jest configuration verified; test file structure matches existing `authController.test.ts`

**Research date:** 2026-03-14
**Valid until:** 2026-09-14 (stable stack; `@strapi/plugin-users-permissions@5.36.1` pinned)
