---
phase: 079-website-verify-flow-mjml-fix
verified: 2026-03-13T03:45:00Z
status: human_needed
score: 4/4 must-haves verified (automated); 4 ROADMAP success criteria require human end-to-end testing
re_verification: false
human_verification:
  - test: "Website 2-step login happy path"
    expected: "Log in at /login with email+password → redirect to /login/verificar → enter 6-digit code from email → receive session JWT and redirect to /anuncios (or referer)"
    why_human: "Full browser flow involving Strapi email delivery, transient pendingToken state, and post-login redirect logic cannot be verified by static analysis alone"
  - test: "Resend code button cooldown on /login/verificar"
    expected: "After clicking Reenviar, button shows 60-second countdown and is disabled during that period; re-enables after 60s"
    why_human: "Reactive timer and disabled state are UI behaviors; static code confirms the logic is wired but cannot confirm the UX interaction"
  - test: "Verification email shows '15 minutos'"
    expected: "Email received in inbox reads '15 minutos' (not '5 minutos') in the expiry line"
    why_human: "MJML template is confirmed correct in source, but an actual sent email should be eyeballed to confirm the rendered HTML is correct"
  - test: "Google OAuth login bypasses /login/verificar entirely"
    expected: "Clicking 'Iniciar sesión con Google' completes OAuth and lands on post-login destination without ever visiting /login/verificar"
    why_human: "OAuth callback flow requires live browser session with Google; cannot be traced statically"
---

# Phase 079: Website Verify Flow + MJML Fix — Verification Report

**Phase Goal:** The website's 2-step login verify UX is formally complete and the verification email shows the correct 15-minute expiry  
**Verified:** 2026-03-13T03:45:00Z  
**Status:** human_needed — all automated checks pass; 4 success criteria require live end-to-end testing  
**Re-verification:** No — initial verification

---

## Goal Achievement

### ROADMAP Success Criteria (Phase 079)

The ROADMAP defines 4 success criteria for this phase. PLAN 079-02 only creates a plan for SC #3 (the MJML copy fix); SC #1, #2, #4 are carry-forward code from v1.36 that are "formally executed here" per the ROADMAP note on VSTEP-13–16.

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| 1 | Website user who logs in with email/password is redirected to `/login/verificar` and can complete 2-step verification to receive a session JWT | ✓ VERIFIED (code) | `FormLogin.vue:107–108` sets `pendingToken.value` and calls `router.push("/login/verificar")`; `FormVerifyCode.vue:120–140` POSTs to verify-code, calls `setToken(responseRaw.jwt)` and redirects |
| 2 | Website user can resend verification code from `/login/verificar` with 60-second cooldown enforced in UI | ✓ VERIFIED (code) | `verificar.vue:40–44,75–76` renders cooldown countdown and `resendDisabled` computed; `FormVerifyCode.vue:158` POSTs to resend-code endpoint |
| 3 | Verification email reads "15 minutos" (not "5 minutos") for code expiry | ✓ VERIFIED | `verification-code.mjml:16`: `<b>15 minutos</b>`; no instance of `<b>5 minutos</b>` anywhere in file; confirmed by commit `70cd7f0` |
| 4 | Google OAuth login bypasses verify-code step entirely | ✓ VERIFIED (code) | `apps/website/app/pages/login/google.vue` uses `useStrapiAuth().login("google")` — standard OAuth; no `pendingToken` involved; verify flow never entered |

**Automated score: 4/4 truths verified at code level**  
**Human testing required for all 4 (end-to-end live behavior)**

---

### Plan-Declared Must-Haves (079-02-PLAN.md frontmatter)

#### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The verification email received by the user reads "15 minutos" (not "5 minutos") for the code expiry | ✓ VERIFIED | `verification-code.mjml` line 16: `<mj-text> Este código es válido por <b>15 minutos</b>. </mj-text>` — confirmed; `grep -Pn "(?<![0-9])5 minutos"` returns NO_MATCH |

#### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/src/services/mjml/templates/verification-code.mjml` | Verification code email template with correct 15-minute expiry copy | ✓ VERIFIED | File exists (21 lines), contains `15 minutos` at line 16, does NOT contain standalone `5 minutos`; substantive (full Jinja2 template extending `layouts/base.mjml` with `{{ code }}` and `{{ name }}` variables) |

#### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` | `apps/strapi/src/services/mjml/templates/verification-code.mjml` | `sendMjmlEmail(strapi, 'verification-code', ...)` | ✓ WIRED | `authController.ts:3` imports `sendMjmlEmail`; lines 199–207 call `sendMjmlEmail(strapi, "verification-code", email, ...)` for initial login; lines 341–349 call it again for resend-code endpoint — both wired |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PWDR-04 | 079-02-PLAN.md | `verification-code.mjml` displays the correct 15-minute expiry (fix "5 minutos" → "15 minutos" copy error) | ✓ SATISFIED | `verification-code.mjml:16` contains `<b>15 minutos</b>`; REQUIREMENTS.md marks as `[x]` with status `Complete` at phase 079 |

#### VSTEP-13–16 (v1.36 carry-forward, formally executed in phase 079)

These requirement IDs belong to the `v1.36-REQUIREMENTS.md` historical document (not the current `REQUIREMENTS.md`). Per ROADMAP.md and STATE.md, the implementation code was written during v1.36 but the phase was never formally planned/executed. Phase 079 formally closes them. The PLAN frontmatter (`079-02-PLAN.md`) does not claim these IDs — it only claims `PWDR-04`. This is architecturally correct: the VSTEP-13–16 code is pre-existing carry-forward, not net-new work in this phase's plan.

| Requirement | Origin | Description | Status | Evidence |
|-------------|--------|-------------|--------|---------|
| VSTEP-13 | v1.36-REQUIREMENTS.md | `FormLogin` redirects to `/login/verificar` carrying `pendingToken` in transient state on 2-step response | ✓ SATISFIED (carry-forward) | `FormLogin.vue:107–108`: `pendingToken.value = response.pendingToken; router.push("/login/verificar")` |
| VSTEP-14 | v1.36-REQUIREMENTS.md | `/login/verificar` has 6-digit input, "Verificar" button, "Reenviar código" button disabled for 60s | ✓ SATISFIED (carry-forward) | `verificar.vue:35–44`: `resendDisabled` computed, countdown display; `FormVerifyCode.vue` handles 6-digit input |
| VSTEP-15 | v1.36-REQUIREMENTS.md | On success: JWT stored, user redirected per post-login logic (referer → `/anuncios` fallback), profile check | ✓ SATISFIED (carry-forward) | `FormVerifyCode.vue:123–140`: `setToken(responseRaw.jwt)`, profile check → referer → `/anuncios` |
| VSTEP-16 | v1.36-REQUIREMENTS.md | On expiry or max-attempts: Swal error shown, redirect to `/login` | ✓ SATISFIED (carry-forward) | `FormVerifyCode.vue:145–147`: `Swal.fire("Error de verificación", msg, "error"); router.push("/login")` |

**No orphaned requirements.** All IDs declared in the PLAN frontmatter (`PWDR-04`) and all VSTEP-13–16 carry-forwards are accounted for.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | — |

No `TODO`, `FIXME`, `PLACEHOLDER`, `XXX`, or `HACK` comments in `verification-code.mjml`. No stub return patterns. Template is fully substantive (21 lines, Jinja2 inheritance, full Spanish copy).

---

### Commit Verification

| Commit | File | Change | Verified |
|--------|------|--------|----------|
| `70cd7f0` | `apps/strapi/src/services/mjml/templates/verification-code.mjml` | `-<b>5 minutos</b>` → `+<b>15 minutos</b>` (1 insertion, 1 deletion) | ✓ Commit exists, diff matches expected change exactly |

---

### Human Verification Required

#### 1. Website 2-Step Login Happy Path

**Test:** Log in at `/login` with valid email+password credentials → should redirect to `/login/verificar` → enter the 6-digit code received by email → should receive a session JWT and redirect to `/anuncios` (or referer)  
**Expected:** Full login completes without touching `/login/verificar` URL manually; session is established; user lands on correct post-login page  
**Why human:** Requires live Strapi + email delivery (MJML rendering) + browser session management; transient `pendingToken` state cannot be asserted by static analysis

#### 2. Resend Code Button 60-Second Cooldown

**Test:** From `/login/verificar`, click "Haz clic aquí para reenviarlo" → observe button becomes disabled with a countdown timer → wait 60 seconds → button re-enables  
**Expected:** Button shows `Reenviar en Xs` countdown in real-time; re-enables exactly after 60 seconds; clicking again calls the resend-code endpoint  
**Why human:** Reactive UI timer behavior and button state transitions are not testable by static grep

#### 3. Verification Email Renders "15 minutos"

**Test:** Trigger a login with email+password → open the received verification email → read the expiry line  
**Expected:** Email body reads "Este código es válido por **15 minutos**." (not 5 minutos)  
**Why human:** MJML is compiled server-side; the `.mjml` source is confirmed correct but the rendered HTML in a real inbox should be eyeballed once to confirm no MJML compilation issues

#### 4. Google OAuth Bypasses `/login/verificar`

**Test:** Click "Iniciar sesión con Google" → complete Google OAuth → land on post-login destination  
**Expected:** User is logged in directly; `/login/verificar` is never visited; no code required  
**Why human:** OAuth callback requires live browser + Google authentication; cannot be traced statically

---

### Gaps Summary

No gaps. All automated checks pass:

- **Artifact exists and is substantive:** `verification-code.mjml` is a complete 21-line Jinja2 MJML template
- **Correct value in file:** Line 16 contains `<b>15 minutos</b>`; no instance of standalone `<b>5 minutos</b>` remains
- **Wired correctly:** `authController.ts` calls `sendMjmlEmail(strapi, "verification-code", ...)` in two places (initial login + resend)
- **VSTEP-13–16 carry-forward code verified:** All four v1.36 requirements satisfied by pre-existing code in `FormLogin.vue`, `FormVerifyCode.vue`, and `verificar.vue`
- **No anti-patterns:** Clean template, no stubs, no placeholders
- **Commit `70cd7f0` verified:** Exists in git history with correct 1-line diff

The phase is **code-complete**. The 4 human verification items are live end-to-end tests, not blockers to code quality.

---

_Verified: 2026-03-13T03:45:00Z_  
_Verifier: Claude (gsd-verifier)_
