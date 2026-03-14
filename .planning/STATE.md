---
gsd_state_version: 1.0
milestone: v1.37
milestone_name: Email Authentication Flows
current_phase: 080
status: planning
last_updated: "2026-03-14T02:44:07.600Z"
last_activity: "2026-03-14 — 080-02 complete: reset-password.mjml + context routing in both FormForgotPassword.vue"
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 3
  completed_plans: 2
  percent: 97
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14 after v1.36 milestone)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.37 — Email Authentication Flows — starting Phase 079

## Position

**Milestone:** v1.37 — Email Authentication Flows
**Current Phase:** 080
**Status:** In Progress (080-01 remaining)
**Progress:** [██████████] 97%

Last activity: 2026-03-14 — 080-02 complete: reset-password.mjml + context routing in both FormForgotPassword.vue

## Accumulated Context

### Key Decisions (carry forward)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- Auth extension pattern: override plugin controllers in `src/extensions/users-permissions/strapi-server.ts` — same pattern as `registerUserLocal`
- `recaptcha.ts` middleware already intercepts `POST /api/auth/local` — 2-step interception must be at **controller level** (after recaptcha passes), NOT in middleware
- `verification-code` content type fields: `userId` (integer), `code` (string), `expiresAt` (datetime), `attempts` (integer, default 0), `pendingToken` (string, unique)
- Three new routes: `POST /api/auth/local` (override), `POST /api/auth/verify-code` (new), `POST /api/auth/resend-code` (new)
- Google OAuth (`/api/connect/google/callback`) is unaffected — must bypass 2-step entirely
- `sendMjmlEmail()` for all email notifications; email failures wrapped in try/catch (non-fatal)
- `pendingToken` carried in transient state (not URL) between login → verify pages in both frontend apps
- Swal for user-facing errors (code expired, max attempts reached) in both apps
- AGENTS.md BEM convention applies to all new SCSS components
- `plugin.controllers.auth` is a factory function in Strapi v5 — overrides must wrap the factory, not set properties on it
- `overrideAuthLocal` guards `ctx.method === "GET"` to skip 2-step for OAuth callbacks
- `resendCode` cooldown uses `record.updatedAt` timestamp for the 60-second rate-limit window
- Dashboard FormLogin.vue: `Record<string, unknown>` used for vee-validate SubmissionHandler values parameter

### Key Decisions (v1.37 specific)

- `overrideForgotPassword` must FULLY REPLACE Strapi's `forgotPassword` (not wrap it) — calling original + MJML sends two emails
- `context` field in forgot-password POST body (not query param — query params are lost after form submit)
- `DASHBOARD_URL` new env var in Strapi for context routing
- Token generation: `crypto.randomBytes(64).toString('hex')` for password reset (matches Strapi's own size)
- `if (response.jwt)` guard in `FormRegister.vue` before `setToken()` — email confirmation returns no JWT
- `POST /api/auth/send-email-confirmation` is native Strapi — no custom code needed for resend
- DB migration `UPDATE "up_users" SET confirmed = TRUE WHERE confirmed = FALSE OR confirmed IS NULL` is a hard gate before enabling `email_confirmation` toggle
- Frontend (Phase 081) must be deployed and verified BEFORE backend toggle (Phase 082) — reversed order causes broken persistent auth state
- `email_confirmation_redirection` in Strapi Admin Panel set to `${FRONTEND_URL}/login`
- `reset-password.mjml` uses `mj-button` (not plain text link) for CTA — better mobile click target on email clients; no hardcoded expiry (Strapi has no automatic TTL for resetPasswordToken)
- `as any` cast required on dashboard `FormForgotPassword.vue` forgotPassword call — `context` not in @nuxtjs/strapi v2 type signature

### Phase Sequencing Rationale

- **Phase 079 first**: Independent carry-forward (VSTEP-13–16 code exists) + low-risk MJML copy fix; ships immediately
- **Phase 080 second**: Independent of email confirmation; fixes live broken UX (dashboard admins get wrong reset link); self-contained
- **Phase 081 third**: Frontend must be deployed BEFORE the backend toggle; `setToken(undefined)` broken auth state is the critical pitfall
- **Phase 082 last**: Risky atomic operation — DB migration + toggle; mostly operational, not code; CANNOT precede Phase 081

### Known Carry-forward

- VSTEP-13 to VSTEP-16 (website verify flow) — code exists in `FormLogin.vue` + `/login/verificar` + `FormVerifyCode.vue`; Phase 079 formally executes this work
- `auth.callback` dual-path behavior (email/password + OAuth) documented — future auth overrides must guard on `ctx.method`

### Blockers/Concerns

- Phase 082 has a pre-flight check gap: need to verify whether `email_confirmation_redirection` in Strapi Admin Panel accepts a full URL with query params (`https://waldo.click/login?confirmed=true`) or only a path. If only a path, use `/registro/bienvenida` as the redirect target. Verify before activation session.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 29 | Create InputAutocomplete.vue component with integrated search for FormGift | 2026-03-13 | a079dc0 | [29-create-inputautocomplete-vue-component-w](.planning/quick/29-create-inputautocomplete-vue-component-w/) |
| 30 | Fix Strapi Handler not found auth.verifyCode startup error | 2026-03-13 | afb78d6 | [30-fix-strapi-handler-not-found-auth-verify](.planning/quick/30-fix-strapi-handler-not-found-auth-verify/) |
| 31 | Add /auth/verify-code to guard.global.ts publicRoutes | 2026-03-13 | ebf9324 | [31-add-auth-verify-code-to-public-routes](.planning/quick/31-add-auth-verify-code-to-public-routes/) |
| 32 | Restrict verify code input to digits only, max 6, auto-submit on 6th | 2026-03-13 | 2f663d6 | [32-restrict-verify-code-input-digits-only](.planning/quick/32-restrict-verify-code-input-digits-only/) |
| 33 | Fix registration broken by confirm_password check in registerUserLocal | 2026-03-13 | 3b2262e | [33-fix-register-confirm-password-check](.planning/quick/33-fix-register-confirm-password-check/) |
| 34 | Restore Facto invoice emission in unified Webpay checkout flow | 2026-03-14 | 0780984 | [34-restore-facto-invoice-emission-in-webpay](.planning/quick/34-restore-facto-invoice-emission-in-webpay/) |
| 35 | Forward is_invoice to Strapi checkout payload | 2026-03-14 | 3cc00fd | [35-verify-is-invoice-field-flows-from-check](.planning/quick/35-verify-is-invoice-field-flows-from-check/) |
