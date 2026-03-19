---
phase: 096-csp-environment-setup
verified: 2026-03-18T06:30:00Z
status: passed
score: 3/3 must-haves verified
re_verification: false
---

# Phase 096: CSP & Environment Setup — Verification Report

**Phase Goal:** The infrastructure prerequisites for One Tap are in place — CSP allows GIS network traffic and Strapi has the Google Client ID it needs to verify tokens
**Verified:** 2026-03-18T06:30:00Z
**Status:** ✅ PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                                                                          | Status     | Evidence                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| 1   | CSP headers include `https://accounts.google.com/gsi/` in both `connect-src` and `frame-src` — FedCM One Tap network calls are not blocked                    | ✓ VERIFIED | `nuxt.config.ts` line 118 (`connect-src`) and line 123 (`frame-src`), both with inline comment |
| 2   | Strapi `process.env.GOOGLE_CLIENT_ID` resolves to a non-empty string at runtime                                                                               | ✓ VERIFIED | `apps/strapi/.env` line 55: `GOOGLE_CLIENT_ID=1036690194999-a156segg9rdl46mp9vb1jce6mkanhi8k.apps.googleusercontent.com` — valid `googleusercontent.com` format |
| 3   | `.env.example` documents `GOOGLE_CLIENT_ID` under a comment that names both OAuth sign-in and One Tap token verification                                      | ✓ VERIFIED | `apps/strapi/.env.example` lines 35–36: `# Google OAuth / One Tap configuration` + `GOOGLE_CLIENT_ID=your_google_client_id  # Used for OAuth sign-in AND One Tap token verification` |

**Score:** 3/3 truths verified

---

### Required Artifacts

| Artifact                     | Provides                                    | Status     | Details                                                                                                                                   |
| ---------------------------- | ------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/website/nuxt.config.ts`| `connect-src` and `frame-src` GIS entries   | ✓ VERIFIED | Contains `"https://accounts.google.com/gsi/"` at lines 118 (connect-src) and 123 (frame-src). File is substantive (463 lines), wired via `nuxt-security` module. |
| `apps/strapi/.env`           | `GOOGLE_CLIENT_ID` runtime value            | ✓ VERIFIED | Line 55 contains a real OAuth client ID (`1036690194999-...apps.googleusercontent.com`). Gitignored as expected — local-only secret.      |
| `apps/strapi/.env.example`   | Developer documentation for `GOOGLE_CLIENT_ID` | ✓ VERIFIED | Lines 35–36 updated from `# Gmail configuration` to `# Google OAuth / One Tap configuration` with dual-use inline comment.              |

---

### Key Link Verification

| From                                                  | To                               | Via                     | Status     | Details                                                                                                               |
| ----------------------------------------------------- | -------------------------------- | ----------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| `apps/website/nuxt.config.ts` `security.contentSecurityPolicy` | Browser CSP headers   | `nuxt-security` module  | ✓ WIRED    | `nuxt-security` conditionally loaded when `NODE_ENV !== "local"` (line 20). GIS path `https://accounts.google.com/gsi/` present in both `connect-src` (line 118) and `frame-src` (line 123). |
| `apps/strapi/.env`                                    | `process.env.GOOGLE_CLIENT_ID`   | Strapi dotenv loader    | ✓ WIRED    | `GOOGLE_CLIENT_ID` is set to actual value. Strapi's default dotenv loader picks this up at startup. No custom wiring needed. |

---

### Requirements Coverage

| Requirement | Source Plan  | Description                                                                                                                      | Status       | Evidence                                                                          |
| ----------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| GTAP-01     | 096-01-PLAN  | `connect-src` in `nuxt.config.ts` includes `https://accounts.google.com/gsi/` AND `frame-src` includes `https://accounts.google.com/gsi/` | ✓ SATISFIED  | Both entries confirmed in `nuxt.config.ts` (lines 118, 123). Marked `[x]` in REQUIREMENTS.md. |
| GTAP-02     | 096-01-PLAN  | `GOOGLE_CLIENT_ID` is present in `apps/strapi/.env` and documented in `.env.example`                                            | ✓ SATISFIED  | `.env` has real value at line 55; `.env.example` has updated comment at lines 35–36. Marked `[x]` in REQUIREMENTS.md. |

**Orphaned requirements:** None. REQUIREMENTS.md maps only GTAP-01 and GTAP-02 to Phase 096 — both claimed in PLAN and both satisfied.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| —    | —    | —       | —        | —      |

No anti-patterns detected. No TODOs, FIXMEs, placeholders, or empty handlers in any modified file.

---

### Human Verification Required

#### 1. CSP in non-local environment

**Test:** Deploy or start the website with `NODE_ENV=production` and open browser DevTools → Network tab. Trigger a One Tap prompt (any public page while logged out). Observe the XHR/fetch calls to `accounts.google.com/gsi/*`.
**Expected:** No `Content Security Policy` blocked requests in the console. GIS FedCM handshake completes without CSP violations.
**Why human:** The CSP `nuxt-security` guard only activates when `NODE_ENV !== "local"`. Cannot verify browser enforcement programmatically.

#### 2. Strapi env in deployed environment

**Test:** Confirm `GOOGLE_CLIENT_ID` is set in staging/production deployment secrets (Railway, fly.io, or equivalent). Phase 097's `OAuth2Client.verifyIdToken()` will fail with `ENOENT` or `invalid_client` if this env var is absent in non-local environments.
**Expected:** Secret manager shows `GOOGLE_CLIENT_ID=1036690194999-a156segg9rdl46mp9vb1jce6mkanhi8k.apps.googleusercontent.com`.
**Why human:** `apps/strapi/.env` is gitignored — the local change cannot propagate automatically. Requires manual secret provisioning per environment.

---

### Verification Notes

**On the `grep -c` count:** The plan's verification command (`grep -c "accounts.google.com/gsi/" apps/website/nuxt.config.ts`) returns `3`, not `2` as the plan expected. The third match (line 264) is the pre-existing `app.head.script[].src` tag for the GIS library loader — it is NOT a CSP directive. The two CSP entries (lines 118 and 123) are correctly placed and are the only ones that matter for security policy enforcement. This is a false positive in the plan's own verification command, not an implementation issue.

**Commits verified:**
- `7bd907e` — `feat(096-01): add GIS connect-src and frame-src to website CSP` (exists, clean 2-line diff)
- `8868880` — `feat(096-01): update Strapi .env.example for Google OAuth / One Tap configuration` (exists, 2-line diff)

---

## Summary

Phase 096 fully achieves its goal. Both infrastructure prerequisites for Google Identity Services One Tap are in place:

1. **CSP unblocked:** `https://accounts.google.com/gsi/` is present in both `connect-src` and `frame-src` within the `nuxt-security` contentSecurityPolicy block. `script-src` was correctly left untouched. FedCM network calls and iframe embeds will not be rejected by the browser.

2. **Strapi has the client ID:** `GOOGLE_CLIENT_ID` in `apps/strapi/.env` holds a real, correctly-formatted OAuth credential (`1036690194999-...apps.googleusercontent.com`) — the same one already in use for the website GIS loader. Phase 097's `OAuth2Client.verifyIdToken()` will find this value at runtime locally.

3. **Documentation updated:** `.env.example` now accurately describes `GOOGLE_CLIENT_ID` as serving both OAuth sign-in and One Tap token verification.

**One operational note (not a gap):** The `.env` change is gitignored. Deployment environments require manual secret provisioning before Phase 097 can work in staging/production. This is expected behavior documented in the SUMMARY and is not a phase defect.

---

_Verified: 2026-03-18T06:30:00Z_
_Verifier: Claude (gsd-verifier)_
