---
gsd_state_version: 1.0
milestone: v1.36
milestone_name: Two-Step Login Verification
current_phase: 078
status: planning
last_updated: "2026-03-13T23:19:14.883Z"
last_activity: 2026-03-13 — Executed 078-01 (dashboard login pendingToken handoff)
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 6
  completed_plans: 5
  percent: 100
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13 after v1.36 milestone started)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 078 — Dashboard Verify Flow (1/? plans complete — in progress)

## Position

**Milestone:** v1.36 — Two-Step Login Verification
**Current Phase:** 078
**Status:** In progress

```
Progress: [██████████] 97%
```

Last activity: 2026-03-13 — Completed quick task 33: Fix registration broken by confirm_password check in registerUserLocal

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
- `plugin.controllers.auth.callback` is the Strapi v5 hook for `POST /api/auth/local` (not `auth.local`)
- Existing pending verification-code record for same userId is deleted before creating a new one on re-login
- `resendCode` cooldown uses `record.updatedAt` timestamp for the 60-second rate-limit window
- `verificationCodeCleanupCron` scheduled `0 4 * * *` (daily 4 AM Santiago) — same hour as cleanupCron (Sundays-only), no real conflict since they operate on different collections
- `deleteMany` used for bulk deletion of expired verification-code records (single DB round-trip)
- Dashboard FormLogin.vue: `Record<string, unknown>` used for vee-validate SubmissionHandler values parameter (satisfies GenericObject constraint); property access uses `as string` casts

### Phase Dependency

- Phase 077 (Strapi backend) must complete before Phase 078 (Dashboard) and Phase 079 (Website) can begin
- Phases 078 and 079 are independent of each other — can be planned/executed in parallel

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 29 | Create InputAutocomplete.vue component with integrated search for FormGift | 2026-03-13 | a079dc0 | [29-create-inputautocomplete-vue-component-w](.planning/quick/29-create-inputautocomplete-vue-component-w/) |
| 30 | Fix Strapi Handler not found auth.verifyCode startup error | 2026-03-13 | afb78d6 | [30-fix-strapi-handler-not-found-auth-verify](.planning/quick/30-fix-strapi-handler-not-found-auth-verify/) |
| 31 | Add /auth/verify-code to guard.global.ts publicRoutes | 2026-03-13 | ebf9324 | [31-add-auth-verify-code-to-public-routes](.planning/quick/31-add-auth-verify-code-to-public-routes/) |
| 32 | Restrict verify code input to digits only, max 6, auto-submit on 6th | 2026-03-13 | 2f663d6 | [32-restrict-verify-code-input-digits-only](.planning/quick/32-restrict-verify-code-input-digits-only/) |
| 33 | Fix registration broken by confirm_password check in registerUserLocal | 2026-03-13 | 3b2262e | [33-fix-register-confirm-password-check](.planning/quick/33-fix-register-confirm-password-check/) |
