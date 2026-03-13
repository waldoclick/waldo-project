---
phase: 077-strapi-2-step-backend
verified: 2026-03-13T00:00:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
---

# Phase 077: Strapi 2-Step Backend Verification Report

**Phase Goal:** Strapi intercepts email/password login, issues a `pendingToken` instead of a JWT, stores a time-limited 6-digit code, and provides verify/resend endpoints — Google OAuth flows through unmodified
**Verified:** 2026-03-13
**Status:** ✅ PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                                        | Status     | Evidence                                                                                                    |
|----|--------------------------------------------------------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------------|
| 1  | `POST /api/auth/local` with valid credentials returns `{ pendingToken, email }` — no JWT                    | ✓ VERIFIED | `overrideAuthLocal` in authController.ts: calls original controller, intercepts `ctx.response.body.jwt`, replaces `ctx.body = { pendingToken, email }` |
| 2  | `POST /api/auth/local` with invalid credentials passes through original error unchanged                      | ✓ VERIFIED | `if (!jwt) return;` guard at line 181 — early return when no JWT present; test confirms no DB ops, no email |
| 3  | A verification-code record is created with all 5 fields on successful credential validation                  | ✓ VERIFIED | `strapi.db.query(VC_UID).create({ data: { userId, code, expiresAt, attempts: 0, pendingToken } })` at line 201 |
| 4  | User receives an email with the 6-digit code after successful credential validation                          | ✓ VERIFIED | `sendMjmlEmail(strapi, 'verification-code', email, 'Tu código de verificación', { name, code })` wrapped in try/catch (non-fatal) |
| 5  | `POST /api/auth/verify-code` with valid token + correct code returns `{ jwt, user }` login response         | ✓ VERIFIED | `verifyCode` at line 228: finds record, checks expiry + code, issues JWT via `strapi.plugins["users-permissions"].services.jwt.issue`, sets `ctx.body = { jwt: jwtToken, user: sanitizedUser }` |
| 6  | Wrong code increments attempts; at 3 failures the record is deleted and 401 returned                        | ✓ VERIFIED | Lines 254–264: `newAttempts >= MAX_ATTEMPTS` → delete + 401; otherwise update attempts; test passes all cases |
| 7  | Expired code returns 401 and deletes the record                                                              | ✓ VERIFIED | Lines 247–250: `new Date(record.expiresAt) < new Date()` → delete + `ctx.unauthorized("Verification code has expired")` |
| 8  | `POST /api/auth/resend-code` rate-limits to one resend per 60 seconds; after cooldown regenerates + resends | ✓ VERIFIED | Lines 313–323: `Date.now() - lastUpdate < RESEND_COOLDOWN_MS` → 429; else updates code/expiresAt/attempts + email |
| 9  | Google OAuth (`/api/connect/google/callback`) is NOT modified — `registerUserAuth` wrapping is unchanged     | ✓ VERIFIED | strapi-server.ts line 35: `plugin.controllers.auth.connect = registerUserAuth(plugin.controllers.auth.connect)` intact; `registerUserAuth` function at authController.ts line 142 is unchanged from pre-phase code |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact                                                                                               | Provided                                                         | Status     | Details                                                                                  |
|--------------------------------------------------------------------------------------------------------|------------------------------------------------------------------|------------|------------------------------------------------------------------------------------------|
| `apps/strapi/src/api/verification-code/content-types/verification-code/schema.json`                   | Schema with 5 fields                                             | ✓ VERIFIED | All 5 attributes present: `userId` (integer, required), `code` (string, required), `expiresAt` (datetime, required), `attempts` (integer, default 0), `pendingToken` (string, unique, required); `draftAndPublish: false` |
| `apps/strapi/src/api/verification-code/controllers/verification-code.ts`                               | Scaffolded core controller                                       | ✓ VERIFIED | `factories.createCoreController("api::verification-code.verification-code")`             |
| `apps/strapi/src/api/verification-code/routes/verification-code.ts`                                   | Scaffolded core router                                           | ✓ VERIFIED | `factories.createCoreRouter("api::verification-code.verification-code")`                 |
| `apps/strapi/src/api/verification-code/services/verification-code.ts`                                 | Scaffolded core service                                          | ✓ VERIFIED | `factories.createCoreService("api::verification-code.verification-code")`                |
| `apps/strapi/src/services/mjml/templates/verification-code.mjml`                                      | Spanish MJML email template with prominent 6-digit code         | ✓ VERIFIED | Extends `layouts/base.mjml`; `{{ code }}` at 32px bold centered; "5 minutos" expiry; `{{ name }}` personalization; Spanish copy |
| `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`                          | `overrideAuthLocal`, `verifyCode`, `resendCode` functions        | ✓ VERIFIED | All 3 functions exported (lines 175, 228, 297); existing `registerUserLocal` + `registerUserAuth` preserved untouched |
| `apps/strapi/src/extensions/users-permissions/strapi-server.ts`                                       | All 3 functions wired + new routes registered                    | ✓ VERIFIED | `auth.callback = overrideAuthLocal(...)`, `auth.verifyCode`, `auth.resendCode`; routes for `/auth/verify-code` and `/auth/resend-code` pushed; existing wiring for register/connect intact |
| `apps/strapi/src/cron/verification-code-cleanup.cron.ts`                                              | `VerificationCodeCleanupService` with `cleanExpiredCodes()`      | ✓ VERIFIED | `deleteMany({ where: { expiresAt: { $lt: now } } })` — bulk delete; returns count in result string |
| `apps/strapi/config/cron-tasks.ts`                                                                     | `verificationCodeCleanupCron` registered at 4 AM daily           | ✓ VERIFIED | Entry at line 95 with `rule: "0 4 * * *"` and `tz: "America/Santiago"`                  |
| `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts`                                          | `verification-code-cleanup` in `CRON_NAME_MAP`                   | ✓ VERIFIED | Line 17: `"verification-code-cleanup": "verificationCodeCleanupCron"` + JSDoc updated   |
| `apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts`                     | 17 tests covering all behaviors                                  | ✓ VERIFIED | All 17 tests **PASS** (confirmed by test run); covers VSTEP-01, -02, -04, -05, -07       |

---

### Key Link Verification

| From                                     | To                                              | Via                                                        | Status     | Details                                                         |
|------------------------------------------|-------------------------------------------------|------------------------------------------------------------|------------|-----------------------------------------------------------------|
| `strapi-server.ts`                       | `authController.ts`                             | `overrideAuthLocal(plugin.controllers.auth.callback)`      | ✓ WIRED    | Line 40–42 in strapi-server.ts; import at line 8               |
| `authController.ts`                      | `verification-code` schema                      | `strapi.db.query('api::verification-code.verification-code')` | ✓ WIRED | `VC_UID` constant used in create/findOne/update/delete calls   |
| `authController.ts`                      | `verification-code.mjml`                        | `sendMjmlEmail(strapi, 'verification-code', ...)`          | ✓ WIRED    | Imported from `../../../services/mjml`; called in overrideAuthLocal + resendCode |
| `cron-tasks.ts`                          | `verification-code-cleanup.cron.ts`             | `import { VerificationCodeCleanupService } from ...`       | ✓ WIRED    | Line 5 import; instantiated and called in task body            |
| `cron-runner.ts`                         | `cron-tasks.ts`                                 | `CRON_NAME_MAP['verification-code-cleanup'] = 'verificationCodeCleanupCron'` | ✓ WIRED | Line 17; maps to key registered in cron-tasks.ts |
| `strapi-server.ts`                       | `authController.ts` (resendCode/verifyCode)     | `plugin.controllers.auth.verifyCode = verifyCode`          | ✓ WIRED    | Lines 45–60 in strapi-server.ts; routes registered accordingly |

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                                                                 | Status      | Evidence                                                                               |
|-------------|-------------|-------------------------------------------------------------------------------------------------------------|-------------|----------------------------------------------------------------------------------------|
| VSTEP-01    | 077-03      | `POST /api/auth/local` does not issue JWT — returns `{ pendingToken, email }` instead                      | ✓ SATISFIED | `overrideAuthLocal` intercepts and replaces response; test confirms no JWT             |
| VSTEP-02    | 077-01, 03  | On valid credentials: 6-digit code stored in `verification-code` content type + sent via MJML email        | ✓ SATISFIED | Schema has all 5 fields; `overrideAuthLocal` creates record + calls `sendMjmlEmail`    |
| VSTEP-03    | 077-03      | `POST /api/auth/verify-code` validates code (correct, not expired, under attempt limit); issues JWT on success | ✓ SATISFIED | `verifyCode` function checks all three conditions; test confirms `{ jwt, user }` returned |
| VSTEP-04    | 077-03      | Failed verify-code increments `attempts`; at 3 → record invalidated                                        | ✓ SATISFIED | `MAX_ATTEMPTS = 3`; delete on `newAttempts >= MAX_ATTEMPTS`; test passes              |
| VSTEP-05    | 077-03      | `POST /api/auth/resend-code` generates new code + resends; 60-second rate limit                            | ✓ SATISFIED | `resendCode` with `RESEND_COOLDOWN_MS = 60_000`; 429 response shape correct; test passes |
| VSTEP-06    | 077-04      | Expired verification-code records cleaned up via cron                                                       | ✓ SATISFIED | `verificationCodeCleanupCron` at `0 4 * * *`; uses `deleteMany` with `$lt` filter     |
| VSTEP-07    | 077-03      | Google OAuth (`/api/connect/google/callback`) unaffected — JWT issued directly                              | ✓ SATISFIED | `plugin.controllers.auth.connect = registerUserAuth(...)` intact; no modification to `registerUserAuth` |
| VSTEP-08    | 077-02      | `verification-code.mjml` in Spanish with 6-digit code prominent, 5-minute expiry, consistent branding      | ✓ SATISFIED | Template extends base layout; `{{ code }}` at `font-size="32px"`, `font-weight="bold"`, `letter-spacing="8px"`; "5 minutos" present |

**All 8 requirements SATISFIED. No orphaned requirements.**

---

### Anti-Patterns Found

| File                        | Line | Pattern                                      | Severity | Impact  |
|-----------------------------|------|----------------------------------------------|----------|---------|
| `authController.ts`         | 87   | Spanish comment (`// Validar que todos...`)  | ℹ️ Info  | Pre-existing code in `registerUserLocal`; not introduced by this phase; no functional impact |

No blockers. No stubs. No TODO/FIXME/placeholder markers in new code.

---

### Human Verification Required

#### 1. Live Login Flow — End-to-End

**Test:** Log in via the website/dashboard with a valid email+password. Observe that:
- Response from `/api/auth/local` is `{ pendingToken, email }` with no `jwt` field
- An email arrives with a large 6-digit code within seconds
- Submitting the code to `/api/auth/verify-code` returns `{ jwt, user }`

**Expected:** Full 2-step login flow completes and user is authenticated
**Why human:** Cannot test live email delivery or real Strapi runtime behavior programmatically

#### 2. Google OAuth Still Works

**Test:** Log in via Google OAuth on the website. Confirm the user is immediately authenticated (no 2-step prompt).
**Expected:** Google OAuth issues JWT directly, bypasses the 2-step flow
**Why human:** Requires a live OAuth handshake with Google

#### 3. Resend Email Delivery

**Test:** After receiving an initial code, call `POST /api/auth/resend-code` with a valid `pendingToken` after 60 seconds. Confirm a new email arrives with a different code.
**Expected:** New email received; old code no longer works; new code works
**Why human:** Requires live email delivery + timing verification

---

### Gaps Summary

No gaps. All 9 observable truths are verified, all 8 requirements are satisfied, all artifacts are substantive and wired, all 17 tests pass, TypeScript compilation is clean.

---

_Verified: 2026-03-13_
_Verifier: Claude (gsd-verifier)_
