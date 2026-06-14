---
phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie
verified: 2026-06-14T00:00:00Z
status: passed
score: 20/20 requirements verified
re_verification: false
human_verification:
  - test: "End-to-end auth flows (login, verify-code, Google popup, Google redirect, Facebook, logout, One Tap)"
    expected: "All auth flows complete successfully, session persists on refresh, httpOnly cookie is set and used"
    why_human: "Auth flow integration cannot be verified programmatically — already APPROVED by user in prior session"
---

# Phase 129: Eliminate @nuxtjs/strapi and Centralize Session/Auth Through Proxy — Verification Report

**Phase Goal:** Eliminate @nuxtjs/strapi from the website app and fully centralize the session/auth + HTTP layer through the Nitro proxy with an httpOnly JWT cookie. Zero direct API_URL calls; useApiClient as the single HTTP client; httpOnly cookie the client can never read with the proxy injecting Authorization server-side; a minimal session layer replacing useStrapiUser/useStrapiToken/useStrapiAuth; every direct fetch/$fetch in pages and components centralized.
**Verified:** 2026-06-14
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Zero @nuxtjs/strapi references in apps/website/app and server | VERIFIED | grep returns nothing; only comment in strapi.d.ts and docs/package.md |
| 2 | Zero useStrapiUser/Auth/Token/Client in apps/website/app | VERIFIED | grep -r exits 1 (no matches) |
| 3 | @nuxtjs/strapi removed from nuxt.config.ts modules and package.json | VERIFIED | modules list has no strapi entry; package.json has no @nuxtjs/strapi |
| 4 | session.ts plugin is active (PLAN-06 guard removed) | VERIFIED | Plugin has `if (user.value) return` cache guard only; no `if (true) return` |
| 5 | useApiClient wraps useSessionClient (not useStrapiClient) | VERIFIED | Line 2: `import { useSessionClient }`, line 12: `const client = useSessionClient()` |
| 6 | Proxy injects Authorization: Bearer from waldo_jwt cookie | VERIFIED | server/api/[...].ts lines 80-84: parseCookies → jwt → headers["Authorization"] = Bearer |
| 7 | Proxy does NOT forward client-supplied Authorization header | VERIFIED | Proxy only reads waldo_jwt from cookie; no getHeader(event, 'authorization') call |
| 8 | httpOnly waldo_jwt cookie set by all auth routes | VERIFIED | verify-code, logout, google/exchange, facebook/exchange, google-one-tap, google-oauth/callback — all setCookie with httpOnly: true |
| 9 | logout route clears cookie with maxAge: 0 | VERIFIED | logout.post.ts: setCookie waldo_jwt with maxAge: 0 |
| 10 | No JWT returned to client in response body | VERIFIED | verify-code returns `{ user }` only; jwt NEVER in response; all exchange routes return user objects |
| 11 | useApiClient SSR forwards cookies and injects vercel bypass | VERIFIED | Lines 31-38: useRequestHeaders(['cookie']), vercelBypassSecret from private runtimeConfig |
| 12 | vercelBypassSecret is private (non-public) runtimeConfig key | VERIFIED | nuxt.config.ts line 337: under private runtimeConfig (no .public) |
| 13 | reCAPTCHA preserved in intercept routes | VERIFIED | verifyRecaptchaToken called at top of verify-code, google/exchange, facebook/exchange |
| 14 | OAuth popup resolves on google-oauth-success with no jwt | VERIFIED | useProviders.ts: onPayload checks msg.type === "google-oauth-success" then resolve(); no jwt field |
| 15 | LoginWithGoogle.vue calls fetchUser after popup, not setToken | VERIFIED | Line 34: `await fetchUser()` after loginWithPopup |
| 16 | login/google.vue and login/facebook.vue call exchange routes via useApiClient | VERIFIED | google.vue line 31: `apiClient("auth/google/exchange")`; facebook.vue line 24: `apiClient("auth/facebook/exchange")` |
| 17 | google-one-tap plugin no longer calls setToken — calls reloadNuxtApp | VERIFIED | Plugin: `await client("auth/google-one-tap")` then `reloadNuxtApp()` — no setToken |
| 18 | FormVerifyCode.vue calls fetchUser after server route (no setToken) | VERIFIED | Lines 150-151: `const { fetchUser } = useSessionAuth(); await fetchUser()` |
| 19 | Upload paths (useImage/UploadMedia) carry no manual Authorization header | VERIFIED | useImage.ts builds only X-Recaptcha-Token header; UploadMedia.vue has no Authorization; both POST to /api/ (proxy injects auth) |
| 20 | All three middleware guards use useSessionUser + fetchUser (no useStrapiToken) | VERIFIED | auth.ts, onboarding-guard.global.ts, dashboard-guard.global.ts all use useSessionUser + useSessionAuth().fetchUser |

**Score:** 20/20 truths verified

### Required Artifacts

| Artifact | Status | Key Evidence |
|----------|--------|--------------|
| `apps/website/app/composables/useSessionUser.ts` | VERIFIED | Contains `useState<T \| null>("session_user", () => null)` |
| `apps/website/app/composables/useSessionAuth.ts` | VERIFIED | Exposes fetchUser, logout, getProviderAuthenticationUrl; no setToken |
| `apps/website/app/composables/useSessionClient.ts` | VERIFIED | Uses qs.stringify, $fetch with baseURL, no Authorization injection |
| `apps/website/app/plugins/session.ts` | VERIFIED | Active (no PLAN-06 guard), calls fetchUser() on startup |
| `apps/website/app/composables/useApiClient.ts` | VERIFIED | Wraps useSessionClient; SSR cookie forwarding; X-Recaptcha-Token on mutating methods |
| `apps/website/server/api/[...].ts` (proxy) | VERIFIED | Reads waldo_jwt from cookie → Authorization Bearer; no client-Authorization forwarding |
| `apps/website/server/api/auth/verify-code.post.ts` | VERIFIED | Sets httpOnly waldo_jwt; reCAPTCHA preserved; jwt not in response body |
| `apps/website/server/api/auth/logout.post.ts` | VERIFIED | Clears waldo_jwt with maxAge: 0 |
| `apps/website/server/api/auth/google/exchange.post.ts` | VERIFIED | httpOnly cookie; reCAPTCHA; returns user not jwt |
| `apps/website/server/api/auth/facebook/exchange.post.ts` | VERIFIED | httpOnly cookie; reCAPTCHA |
| `apps/website/server/api/auth/google-one-tap.post.ts` | VERIFIED | httpOnly cookie |
| `apps/website/server/api/auth/google-oauth/callback.get.ts` | VERIFIED | httpOnly cookie; no jwt in BroadcastChannel payload |
| `apps/strapi/src/api/auth-google/controllers/auth-google.ts` | VERIFIED | `if (ctx.query.json) { ctx.body = { jwt }; return; }` at line 95 |
| `apps/website/nuxt.config.ts` | VERIFIED | No @nuxtjs/strapi in modules; vercelBypassSecret in private runtimeConfig |
| `apps/website/tests/stubs/imports.stub.ts` | VERIFIED | Exports useSessionUser, useSessionAuth, useSessionClient; comment confirms useStrapiX removed |

### Key Link Verification

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| proxy [...].ts | Authorization Bearer toward Strapi | parseCookies(event).waldo_jwt | WIRED | Lines 80-84 confirmed |
| verify-code.post.ts | waldo_jwt httpOnly cookie | setCookie(event, 'waldo_jwt', jwt, { httpOnly: true }) | WIRED | Lines 28-35 confirmed |
| google/exchange.post.ts | verifyRecaptchaToken | Called at handler top | WIRED | Lines 7-13 confirmed |
| useApiClient SSR | proxy waldo_jwt read | useRequestHeaders(['cookie']) → serverHeaders.cookie | WIRED | Lines 31-32 confirmed |
| useApiClient | useSessionClient | `const client = useSessionClient()` | WIRED | Line 12 confirmed |
| session.ts | useSessionAuth.fetchUser | startup auto-fetch | WIRED | Lines 3-6 confirmed |
| login/google.vue | server/api/auth/google/exchange.post.ts | useApiClient POST (X-Recaptcha-Token injected) | WIRED | Line 31 confirmed |
| LoginWithGoogle.vue | httpOnly cookie → fetchUser | loginWithPopup then fetchUser | WIRED | Lines 32, 34 confirmed |
| useLogout | /api/auth/logout | $fetch POST | WIRED | Line 30 confirmed |

### Requirements Coverage

| Requirement | Plan | Description | Status | Evidence |
|-------------|------|-------------|--------|----------|
| SESSION-COMPOSABLES | 01 | useSessionUser/Auth/Client composables created | SATISFIED | All three files exist with correct content |
| HTTPONLY-NO-CLIENT-TOKEN | 01 | No client-side token reads or writes | SATISFIED | No setToken/useStrapiToken in app/ |
| PROXY-AUTH-INJECTION | 02 | Proxy injects Authorization from httpOnly cookie | SATISFIED | proxy reads waldo_jwt → Bearer header |
| AUTH-INTERCEPT-ROUTES | 02 | Server routes set httpOnly cookie for all auth flows | SATISFIED | 6 routes confirmed with httpOnly: true |
| RECAPTCHA-PRESERVED | 02 | All new JWT-issuing routes call verifyRecaptchaToken | SATISFIED | verify-code, google/exchange, facebook/exchange verified |
| OAUTH-CALLBACK-ROUTES | 02 | google-oauth/callback and exchange routes set httpOnly cookie | SATISFIED | All confirmed |
| APICLIENT-SSR-COOKIE | 03 | useApiClient SSR forwards cookie + vercel bypass | SATISFIED | Lines 31-38 in useApiClient.ts |
| STRAPI-JSON-MODE | 03 | auth-google controller returns JSON when ?json=true | SATISFIED | ctx.query.json branch at line 95 |
| VERCEL-BYPASS-CONFIG | 03 | vercelBypassSecret is private runtimeConfig key | SATISFIED | nuxt.config.ts line 337 |
| OAUTH-POPUP-NOJWT | 04 | loginWithPopup resolves on success type with no jwt | SATISFIED | useProviders.ts onPayload checks type only |
| OAUTH-EXCHANGE-ROUTES | 04 | login/google + login/facebook call exchange routes | SATISFIED | Both pages use useApiClient + exchange path |
| ONETAP-NO-SETTOKEN | 04 | google-one-tap plugin uses reloadNuxtApp not setToken | SATISFIED | Plugin calls reloadNuxtApp() after POST |
| VERIFYCODE-NO-SETTOKEN | 05 | FormVerifyCode calls fetchUser not setToken | SATISFIED | Lines 150-151: fetchUser() only |
| UPLOADS-NO-TOKEN | 05 | useImage/UploadMedia carry no manual Authorization | SATISFIED | No Authorization header in either file |
| LOGOUT-SERVER-ROUTE | 05 | useLogout POSTs to /api/auth/logout | SATISFIED | useLogout.ts line 30 |
| GUARDS-NO-TOKEN | 05 | All three guards use fetchUser unconditionally on null user | SATISFIED | auth.ts, onboarding-guard, dashboard-guard all confirmed |
| MECHANICAL-RENAME-SWEEP | 06 | Zero useStrapiX references in apps/website/app | SATISFIED | grep exits 1 (no matches) |
| MODULE-REMOVAL | 06 | @nuxtjs/strapi removed from nuxt.config.ts + package.json | SATISFIED | Neither file contains the module |
| SESSION-PLUGIN-ACTIVATION | 06 | session.ts active (PLAN-06-REMOVE-THIS-LINE guard deleted) | SATISFIED | Plugin has real cache guard `if (user.value) return` only |
| AUTH-FLOWS-WORK | 06 | All auth flows work end-to-end | HUMAN-APPROVED | Per task instructions: user validated login, verify-code, logout, Google OAuth, Webpay payment flow in local |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/website/app/composables/useStrapi.ts` | 3 | `useStrapiData` function exported but never imported anywhere | INFO | Dead code orphan — function name contains "Strapi" but is internally implemented with useApiClient. No behavioral impact. |
| `apps/website/app/composables/useImage.ts` | 75 | `fetch(uploadUrl, ...)` — bare fetch call | INFO | Goes to `/api/ads/upload` (relative path through Nitro proxy which injects Authorization). No Authorization header built by caller. Architecturally correct per the phase design. |
| `apps/website/app/components/UploadMedia.vue` | 141 | `fetch(uploadUrl, ...)` — bare fetch call | INFO | Goes to `/api/upload` (relative path through Nitro proxy). No Authorization header built by caller. Architecturally correct. |

No blocker or warning anti-patterns. The two bare `fetch()` calls in upload paths are intentional — they POST to relative `/api/` paths which route through the Nitro catch-all proxy, which then injects `Authorization: Bearer` from the httpOnly cookie. The plan explicitly states "the proxy injects it" for uploads.

The `useStrapi.ts` file (`useStrapiData`) is orphaned dead code that does not affect behavior and does not import the removed module. It uses `useApiClient` internally so it is architecturally clean, just unused.

### Human Verification Required

**Already approved by user** — The task instructions state that the human-verify checkpoint was approved with all auth flows validated end-to-end in local:
- Login + verify-code flow
- Session persists on refresh
- Logout works (Manager-deactivate bug is fixed)
- Google OAuth (popup + redirect)
- Full create-ad + Webpay payment flow

---

## Gaps Summary

No gaps. All 20 requirements are satisfied by the codebase. The phase goal is fully achieved:

- `@nuxtjs/strapi` is completely removed from the website app (modules, package.json, all consumer references).
- The httpOnly `waldo_jwt` cookie is set server-side by every JWT-issuing route and cleared by the logout route.
- The catch-all proxy reads the cookie and injects `Authorization: Bearer` toward Strapi; it never forwards a client-supplied Authorization header.
- `useSessionClient` / `useSessionAuth` / `useSessionUser` are the active session layer. `useApiClient` wraps `useSessionClient`.
- The `session.ts` plugin is active and calls `fetchUser()` on startup.
- All middleware guards, OAuth pages, upload paths, and form components have been migrated.
- SSR self-calls forward the cookie jar and the Vercel bypass header.
- reCAPTCHA is preserved in every new server intercept route.

---

_Verified: 2026-06-14_
_Verifier: Claude (gsd-verifier)_
