# Project Research Summary

**Project:** Waldo — Email Auth Flows Milestone
**Domain:** Strapi v5 auth plugin overrides + MJML email templates + Nuxt 4 frontend auth UX
**Researched:** 2026-03-13
**Confidence:** HIGH — all critical findings verified from installed plugin source code

## Executive Summary

This milestone completes Waldo's email authentication story across three self-contained deliverables: (1) replacing Strapi's plain-text password reset email with a branded MJML email that routes each user to the correct app's reset page based on their role, (2) enabling Strapi's built-in email confirmation on registration and rebuilding the frontend UX to handle the no-JWT response correctly, and (3) ensuring all auth emails match the MJML standard already in use for every other user-facing email. The project already has the MJML pipeline (`sendMjmlEmail`, Nunjucks, 15+ templates, Mailgun), the auth controller factory wrapper pattern, and partial frontend forms — nothing greenfield is needed; this is extension of existing infrastructure.

The recommended implementation approach follows two independent tracks that must be sequenced but not parallelized: **Track A** (MJML password reset + context routing) is a self-contained improvement that fixes a live broken UX today — dashboard admins get a reset link pointing to the website — while **Track B** (email confirmation on registration) is a larger atomic change where all pieces must land simultaneously or users will be locked out. The most critical architectural constraint is that Strapi's `forgotPassword` and `sendConfirmationEmail` each call `strapi.plugin('email').service('email').send()` internally; any wrapper that also calls the original will double-send. Full controller replacement (not wrapping) is mandatory for both email overrides.

The single highest-risk operation in the entire milestone is enabling the `email_confirmation` toggle in the Strapi Admin Panel. A single click locks out every existing user whose `confirmed` field is `false` — which is all of them under the current schema default. A database migration setting `confirmed = true` for all existing users is a hard prerequisite that must be run and verified before the toggle is flipped. All frontend changes for Track B (`FormRegister.vue` guard, `FormLogin.vue` error handling in both apps, `/registro/confirmar` page, confirmation success banner) must be deployed and verified before the toggle is activated.

## Key Findings

### Recommended Stack

No new npm packages are required. All capabilities exist in the installed stack. The MJML email service (`sendMjmlEmail`) is already production-proven with 15+ templates, Nunjucks layout inheritance, and non-fatal error handling. The Strapi auth controller extension pattern (factory wrap in `strapi-server.ts`) is already established and in production for `register`, `connect`, and `callback`. The `@nuxtjs/strapi` v2 SDK covers all needed auth calls from both Nuxt apps.

**Core technologies:**
- `mjml@^4.16.1` + `nunjucks@^3.2.4`: MJML → Nunjucks → HTML email rendering — already installed and working; all new templates extend `layouts/base.mjml`
- `@strapi/plugin-users-permissions@5.36.1`: provides `email_confirmation` toggle, `forgotPassword`, `sendConfirmationEmail` — behavior verified from installed source at `node_modules/`
- `@nuxtjs/strapi` v2 (website + dashboard): `useStrapiAuth()` covers all auth operations; extra body fields require `as any` TypeScript cast but pass through to Strapi correctly
- `crypto` (Node built-in): token generation — `randomBytes(20).toString('hex')` for confirmation, `randomBytes(64).toString('hex')` for password reset, matching Strapi's own sizes exactly
- One new env var required: `DASHBOARD_URL` (e.g. `https://dashboard.waldo.click`) for context routing in `overrideForgotPassword`

### Expected Features

**Must have (table stakes):**
- **MJML password reset email** — all other user-facing emails are branded MJML; the plain-text reset email is jarringly inconsistent; requires full `forgotPassword` controller replacement
- **Password reset context routing** — dashboard admins must receive reset links pointing to `dashboard.waldo.click/auth/reset-password`, not the website; tightly coupled to the MJML override since both are implemented in the same function
- **Enable Strapi email confirmation** — the existing `FormRegister.vue` already shows "we sent you a confirmation email" (Swal message) but confirmation is disabled; the UI message is a lie today
- **Post-registration confirmation screen** (`/registro/confirmar`) — redirecting to `/login` immediately after register leaves users confused when login fails with a vague error; dedicated page with email displayed + resend button
- **Login block handling for unconfirmed users** — when confirmation is enabled, Strapi returns HTTP 400 with `"Your account email is not confirmed"`; must surface an actionable message with a resend option, not a generic error Swal
- **Resend confirmation email button** — native Strapi endpoint `POST /api/auth/send-email-confirmation` available with no custom code; add 60-second UI cooldown (same pattern as `FormVerifyCode.vue`)

**Should have (differentiators):**
- **Confirmation success banner on login** — `?confirmed=true` query param on Strapi redirect → green banner "¡Tu cuenta ha sido confirmada! Ya puedes iniciar sesión." on `/login`
- **Already-confirmed guard** — second click of confirmation link redirects with Strapi error params; landing page shows "Ya confirmada — inicia sesión" instead of broken state
- **Fix `verification-code.mjml` copy** — template says "5 minutos" but `CODE_EXPIRY_MS = 15 * 60 * 1000`; low-effort fix while touching the MJML service

**Defer (v2+):**
- **MJML account-confirmation email** — Strapi's native `sendConfirmationEmail` sends before a wrapper can intercept cleanly; requires a `plugin.services.user` service factory override (identical pattern to the existing `plugin.controllers.auth` override, fully documented in STACK.md); acceptable interim is customizing Strapi's native template via Admin UI
- **Confirmation token expiry** — Strapi v5 confirmation tokens do not expire by default; not a blocking issue; admins can manually set `confirmed: true`

**Anti-features (explicitly avoid):**
- Require confirmation before browsing the public site — block only authenticated actions; the `confirmed` check on login handles this
- Email confirmation for Google OAuth users — Google proves email ownership; `confirmed: true` is set automatically by Strapi's OAuth callback
- Duplicate confirmation email sends — Strapi's native system + custom MJML would double-send; pick one approach
- Custom confirmation token content type — Strapi's native `confirmed` and `confirmationToken` fields are first-class; don't build a parallel system
- `?origin=dashboard` query param on the forgot-password form URL — this param is lost after the form submits; the routing context must travel in the POST request body

### Architecture Approach

The entire milestone operates within three existing architectural patterns: the Strapi auth controller factory wrapper in `strapi-server.ts`, the `sendMjmlEmail(strapi, template, to, subject, data)` email service, and Nuxt 4 pages with `definePageMeta({ layout: 'auth', middleware: ['guest'] })` for token-based auth actions. No new patterns are introduced. The key structural decision is whether to use **Strapi's built-in email confirmation** (simpler: Admin Panel toggle + `email_confirmation_redirection` URL, native endpoint, plain-text interim email) or a **custom `email-confirmation` content type** (more complex: new schema + endpoint + MJML from day one). Research recommends the built-in approach with MJML confirmation email deferred to v2, since it eliminates 3 new files and 1 new content type at the cost of a temporarily plain-text confirmation email.

**Major components:**
1. `overrideForgotPassword` (Strapi — NEW) — factory-wraps `instance.forgotPassword` in `strapi-server.ts`; generates token, looks up user role, builds context-specific reset URL, sends `password-reset.mjml`; does NOT call original controller (avoids double email)
2. `password-reset.mjml` + `email-confirmation.mjml` (Strapi — NEW) — extend `layouts/base.mjml`; use Nunjucks variables; must be tested via direct `renderEmail()` call before wiring
3. `/registro/confirmar` page (Website — NEW) — post-registration landing; shows email address, resend button (`POST /api/auth/send-email-confirmation`), link to login; pure frontend
4. `FormRegister.vue` update (Website — MODIFIED) — `if (response.jwt)` guard before `setToken()`; redirect to `/registro/confirmar?email=...` on success instead of `/login`
5. `FormLogin.vue` updates (Website + Dashboard — MODIFIED) — detect `"Your account email is not confirmed"` error string; show Swal with resend option using `POST /api/auth/send-email-confirmation`
6. `FormForgotPassword.vue` updates (Website + Dashboard — MODIFIED) — pass `context: 'website'` / `context: 'dashboard'` in forgotPassword POST body (cast as `as any`)

### Critical Pitfalls

1. **Enabling `email_confirmation` immediately locks out all existing users** — the schema default is `confirmed: false`; the toggle activates a live check in `auth.js` `callback()` that throws before `overrideAuthLocal` runs; run `UPDATE up_users SET confirmed = TRUE WHERE confirmed = FALSE OR confirmed IS NULL` BEFORE flipping the toggle; verify with a pre-existing account login immediately after
2. **`setToken(undefined)` produces a persistent broken auth state** — when `email_confirmation: true`, Strapi returns `{ user }` with no `jwt`; calling `setToken(response.jwt)` unconditionally calls `setToken(undefined)`, which `@pinia-plugin-persistedstate/nuxt` persists to localStorage as the string `"undefined"`; guard every registration handler with `if (response.jwt)` before touching the token
3. **Double email send if original `forgotPassword` controller is called** — Strapi's `forgotPassword` saves the token AND sends the plain email atomically; calling `await originalController(ctx)` then `sendMjmlEmail` sends two emails to the user; use full replacement — do not call the original; the token generation is ~10 lines of code
4. **Extra body field (`context`) may fail Strapi's `validateForgotPasswordBody` Yup validation** — strip `context` from `ctx.request.body` before passing to the original controller using destructuring, identical to the pattern already used in `registerUserLocal` for stripping `confirm_password`; if using full replacement (recommended), this is moot
5. **MJML template errors are invisible** — `sendMjmlEmail` catches all errors and returns `false`; typos in Nunjucks variables, wrong template name, broken `{% extends %}` paths, and missing template files all silently fail; test each new template via direct `renderEmail()` call and verify in Mailgun logs before wiring to the live controller flow

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: MJML Templates
**Rationale:** Both password reset and email confirmation (v2) depend on rendered templates. Creating and validating templates in isolation first means they can be verified independently before being wired to controllers. Zero risk — no Strapi restart, no DB changes, no frontend changes.
**Delivers:** `password-reset.mjml` template (and `email-confirmation.mjml` if targeting v2 MJML confirmation); fix `verification-code.mjml` "5 minutos" → "15 minutos" copy error
**Addresses:** Foundation for all email features; existing minor inconsistency fix
**Avoids:** Pitfall 5 (template errors invisible) — validate `renderEmail()` with expected variables before any controller wiring

### Phase 2: MJML Password Reset + Context Routing
**Rationale:** Fully independent of email confirmation; fixes a live broken UX today (dashboard admins get wrong reset link); self-contained backend + frontend change with no atomicity risk. Can ship to production before Phase 3 is ready. Depends only on Phase 1.
**Delivers:** `overrideForgotPassword` in `authController.ts`; factory wire in `strapi-server.ts`; `DASHBOARD_URL` env var; `FormForgotPassword.vue` context param in both apps; dashboard admins receive correct MJML reset email pointing to `dashboard.waldo.click/auth/reset-password`
**Addresses:** MJML password reset email (table stake); password reset context routing (table stake)
**Avoids:** Pitfall 3 (full controller replacement, not wrapping); Pitfall 4 (strip context from body before original); Pitfall 5 (template tested first); Pitfall 6 (save token to DB before email send); Pitfall 7 (context in body, not query param); Pitfall 9 (no double email); Pitfall 14 (explicit `resetUrl` variable, not auto-injected `frontendUrl`)

### Phase 3: Email Confirmation — Frontend First
**Rationale:** All frontend changes must be deployed before the Admin Panel toggle is flipped. Deploy frontend, verify in staging, then activate the backend toggle in Phase 4 as a separate operational step. Shipping frontend and toggle together is high-risk — if the toggle activates before `FormRegister.vue` is updated, every new registration produces a broken persistent auth state.
**Delivers:** `/registro/confirmar` page in website; `FormRegister.vue` with `if (response.jwt)` guard + redirect to `/registro/confirmar`; `FormLogin.vue` (website + dashboard) with unconfirmed error handling + resend Swal; confirmation success banner on `/login?confirmed=true`
**Addresses:** Post-registration confirmation screen (table stake); login block handling for unconfirmed users (table stake); resend confirmation button (table stake); confirmation success differentiator
**Avoids:** Pitfall 2 (`setToken(undefined)` broken auth state — guarded before toggle is enabled)

### Phase 4: Email Confirmation — Backend Activation
**Rationale:** Only after Phase 3 frontend is deployed and verified. This phase is the risky atomic operation — mostly operational steps, not new code. The pre-flight migration is a hard gate.
**Delivers:** All existing users migrated to `confirmed = true`; Strapi `email_confirmation_redirection` configured to `${FRONTEND_URL}/login?confirmed=true`; `email_confirmation` toggled ON in Admin Panel; end-to-end flow verified (register → confirmation email → click link → login with banner)
**Addresses:** Enable Strapi email confirmation (table stake)
**Avoids:** Pitfall 1 (existing user lockout — migration verified before toggle); Pitfall 10 (redirection URL configured before toggle)

### Phase 5: Cleanup and Polish
**Rationale:** After both tracks are live, address edge cases and secondary differentiators. Already-confirmed guard (second link click), any remaining polish. No cleanup cron needed if using Strapi's built-in email confirmation — Strapi manages its own confirmation token lifecycle.
**Delivers:** Already-confirmed guard on confirmation redirect; already-confirmed guard on confirmation redirect page; any remaining copy or UX polish
**Addresses:** Should-have differentiators

### Phase Ordering Rationale

- **Templates before controllers** — MJML templates must exist before `sendMjmlEmail` references them; the failure mode is silent (Pitfall 5), so early isolated validation is essential
- **Password reset before email confirmation** — Phase 2 is independent and fixes a live broken UX; shipping it first delivers immediate user value and de-risks the milestone if Phase 3/4 is delayed
- **Frontend before backend toggle** — the `email_confirmation` toggle is a live database key-value that takes effect immediately; frontend must be deployed first (reversed order triggers Pitfall 2)
- **Migration as explicit phase gate in Phase 4** — the DB migration (Pitfall 1) is a hard prerequisite for the toggle, not a code change; making it an explicit step ensures it cannot be skipped under delivery pressure
- **Context routing in Phase 2, not separate** — the `context` param and MJML override are implemented in the same function; splitting them creates a half-implemented controller that routes incorrectly

### Research Flags

Phases with well-documented patterns (skip research-phase):
- **Phase 1 (MJML Templates):** Template authoring follows established Nunjucks + MJML pattern; 15 reference templates exist; no unknowns
- **Phase 2 (Password Reset):** Full implementation code documented in STACK.md with exact line-level detail; factory pattern is in production; token ordering verified from Strapi source
- **Phase 3 (Frontend First):** Standard Nuxt 4 page + component patterns; error string to detect is verified from Strapi `auth.js` source

Phases needing a brief pre-execution check:
- **Phase 4 (Backend Activation):** Admin Panel configuration steps are manual and environment-specific; verify that `email_confirmation_redirection` accepts a full URL with query params (`https://waldo.click/login?confirmed=true`) before the activation session, since this behavior is documented but not verified in the installed version; confirm migration row count matches expected user count before proceeding

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All findings verified from installed plugin source at `node_modules/@strapi/plugin-users-permissions/server/`; token sizes, factory pattern, email send sequencing all source-confirmed |
| Features | HIGH | Current state verified by direct codebase inspection — FormRegister.vue Swal message is a lie (confirmed: email_confirmation is off), dashboard reset flow is broken (confirmed: single global URL), MJML gap confirmed by tracing sendMjmlEmail call sites |
| Architecture | HIGH | Factory wrapper pattern already in production; MJML service fully understood; all integration points traced from source; one intentional deferral (service factory for MJML confirmation email, v2 path fully documented) |
| Pitfalls | HIGH | All critical pitfalls verified from Strapi v5 `auth.js` and `user.js` source; double-email risk confirmed by reading both `forgotPassword` and `sendConfirmationEmail` implementations; `confirmed` default verified from schema |

**Overall confidence:** HIGH

### Gaps to Address

- **`email_confirmation_redirection` URL format:** Research confirmed the redirect is `ctx.redirect(settings.email_confirmation_redirection || '/')`. Need to verify whether the Strapi Admin Panel UI accepts a full URL with query params (`https://waldo.click/login?confirmed=true`) or only a path. If only a path, the `?confirmed=true` banner approach requires adjustment — use a dedicated page like `/registro/bienvenida` as the redirect target instead, or read a different signal for the success banner.
- **`@nuxtjs/strapi` v2 extra body field passthrough:** Verified structurally that extra fields in `forgotPassword({ email, context })` pass through to the Strapi endpoint without stripping. The only impact is TypeScript — requires `as any` cast. No runtime gap.
- **Strapi built-in `email_confirmation_redirection` behavior for already-confirmed users:** If a user clicks the confirmation link a second time, Strapi returns an error. The exact error format in the redirect params (query string key and value) should be confirmed during Phase 3 implementation to build the already-confirmed guard correctly.

## Sources

### Primary (HIGH confidence — installed source code)
- `node_modules/@strapi/plugin-users-permissions/server/controllers/auth.js` (v5.36.1) — `email_confirmation` registration/login behavior, `forgotPassword` implementation, token ordering, `sendConfirmationEmail` call
- `node_modules/@strapi/plugin-users-permissions/server/services/user.js` (v5.36.1) — `sendConfirmationEmail` implementation, token generation, service factory pattern
- `node_modules/@strapi/plugin-users-permissions/server/bootstrap/index.js` (v5.36.1) — default `confirmed` field value behavior
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — `overrideAuthLocal`, `registerUserLocal`, existing override patterns
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — factory wrapper pattern (production)
- `apps/strapi/src/services/mjml/send-email.ts` — MJML service, non-fatal error pattern, env var usage
- `apps/strapi/config/plugins.ts` — email confirmation NOT configured; Mailgun provider; `allowedFields`
- `apps/website/app/components/FormRegister.vue` — broken Swal message, current redirect behavior
- `apps/website/app/components/FormForgotPassword.vue` — missing context param
- `apps/dashboard/app/components/FormForgotPassword.vue` — missing context param, broken reset destination
- `apps/dashboard/app/components/FormResetPassword.vue` — `route.query.token` → `code` body field mapping (verified)
- `apps/website/app/pages/login/verificar.vue` — 60-second resend cooldown pattern for reuse

### Secondary (HIGH confidence — official docs)
- `https://docs.strapi.io/dev-docs/plugins/users-permissions` — Strapi v5 Users & Permissions plugin docs
- `https://docs.strapi.io/cms/features/users-permissions` — email confirmation endpoint, redirection URL, admin settings
- `https://raw.githubusercontent.com/strapi/strapi/main/packages/plugins/users-permissions/server/controllers/auth.js` — verified against installed version for pitfall documentation

---
*Research completed: 2026-03-13*
*Ready for roadmap: yes*
