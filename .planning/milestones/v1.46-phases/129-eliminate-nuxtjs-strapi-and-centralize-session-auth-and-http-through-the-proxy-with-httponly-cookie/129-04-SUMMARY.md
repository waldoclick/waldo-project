---
phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie
plan: "04"
subsystem: auth
tags: [oauth, google, facebook, recaptcha, httponly-cookie, nitro, popup, broadcastchannel, useApiClient]

# Dependency graph
requires:
  - phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie
    provides: "Plan 01: useSessionAuth, useSessionUser, useSessionClient composables"
  - phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie
    provides: "Plan 02: google/exchange.post.ts, facebook/exchange.post.ts, google-oauth/callback.get.ts, google-one-tap.post.ts Nitro routes"
provides:
  - "useProviders.ts: loginWithPopup returns void (no jwt); getProviderAuthenticationUrl from useSessionAuth"
  - "LoginWithGoogle.vue: popup success → fetchUser() via useSessionAuth (no setToken)"
  - "login/google.vue: POST auth/google/exchange via useApiClient client-side (X-Recaptcha-Token injected)"
  - "login/facebook.vue: POST auth/facebook/exchange via useApiClient client-side (X-Recaptcha-Token injected)"
  - "google-one-tap.client.ts: setToken removed; cookie set by Nitro; reloadNuxtApp() triggers session"
affects:
  - "129-06 (cutover plan — these 5 files are now ready for module removal)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "loginWithPopup returns Promise<void> — no jwt in BroadcastChannel payload; cookie set server-side"
    - "Exchange route callers use useApiClient (not raw $fetch) so X-Recaptcha-Token is injected on POST"
    - "SSR guard: authenticate() calls wrapped in if (import.meta.client) — reCAPTCHA is client-only"

key-files:
  created: []
  modified:
    - apps/website/app/composables/useProviders.ts
    - apps/website/app/components/LoginWithGoogle.vue
    - apps/website/app/pages/login/google.vue
    - apps/website/app/pages/login/facebook.vue
    - apps/website/app/plugins/google-one-tap.client.ts

key-decisions:
  - "authenticate() in login/google.vue and login/facebook.vue guarded with import.meta.client — bare <script setup> top-level call runs on SSR; reCAPTCHA is client-only and the exchange route rejects without X-Recaptcha-Token"
  - "loginWithPopup return type changed to Promise<void> — no jwt field; Pitfall 5 avoided: BroadcastChannel sends only { type: google-oauth-success }"
  - "useApiClient() (not raw $fetch) used for exchange POSTs — automatically injects X-Recaptcha-Token; raw $fetch would omit the token and the route would reject with 400"
  - "useSessionAuth replaces useStrapiAuth in all 5 files; useStrapiUser replaced by useSessionUser in One Tap plugin"

patterns-established:
  - "All client-side callers of JWT-issuing Nitro POST routes must use useApiClient, not raw $fetch"
  - "Top-level async calls in <script setup> that depend on client-only APIs must be guarded with import.meta.client"

requirements-completed: [OAUTH-POPUP-NOJWT, OAUTH-EXCHANGE-ROUTES, ONETAP-NO-SETTOKEN]

# Metrics
duration: 15min
completed: 2026-06-14
---

# Phase 129 Plan 04: OAuth Client Surface Migration Summary

**Five Google/Facebook OAuth files migrated to httpOnly model: popup carries no jwt, redirect pages call exchange routes via useApiClient (sending X-Recaptcha-Token), One Tap relies on server cookie — zero setToken/authenticateProvider remain**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-06-14T05:20:00Z
- **Completed:** 2026-06-14T05:35:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- `useProviders.ts`: `loginWithPopup` now returns `Promise<void>` (no jwt); `getProviderAuthenticationUrl` sourced from `useSessionAuth` instead of `useStrapiAuth`
- `LoginWithGoogle.vue`: `setToken` removed; after popup, calls `fetchUser()` from `useSessionAuth` — cookie was set server-side by Nitro callback
- `login/google.vue` and `login/facebook.vue`: `authenticateProvider` replaced by `apiClient("auth/{provider}/exchange", { method: "POST" })` with client-side guard (`import.meta.client`) to ensure reCAPTCHA runs only on the browser
- `google-one-tap.client.ts`: `setToken` and `useStrapiAuth` removed; `useStrapiUser` replaced by `useSessionUser`; callback no longer destructures jwt from response

## Task Commits

Each task was committed atomically:

1. **Task 1: useProviders.ts + LoginWithGoogle.vue** - `28e7cfba` (feat)
2. **Task 2: login/google.vue + login/facebook.vue** - `c17ffbab` (feat)
3. **Task 3: google-one-tap.client.ts** - `c3cf0f27` (feat)

## Files Created/Modified
- `apps/website/app/composables/useProviders.ts` - loginWithPopup → void; getProviderAuthenticationUrl from useSessionAuth
- `apps/website/app/components/LoginWithGoogle.vue` - setToken removed; fetchUser from useSessionAuth
- `apps/website/app/pages/login/google.vue` - apiClient("auth/google/exchange") + import.meta.client guard
- `apps/website/app/pages/login/facebook.vue` - apiClient("auth/facebook/exchange") + import.meta.client guard
- `apps/website/app/plugins/google-one-tap.client.ts` - setToken/useStrapiAuth removed; useSessionUser replaces useStrapiUser

## Decisions Made
- **import.meta.client guard on authenticate() calls**: The plan stated "replacing in place keeps it client-side" but the actual code had `authenticate()` as a bare top-level call in `<script setup>` — which runs on SSR. Without the guard, `apiClient` would fire on the server where `$recaptcha` is undefined, sending no `X-Recaptcha-Token`, causing the exchange route to reject with 400. Added `if (import.meta.client) authenticate()` to both login pages.
- **useApiClient (not raw $fetch) for exchange POSTs**: The plan's action section noted raw `$fetch` would omit the token. Used `useApiClient()` consistently — it injects `X-Recaptcha-Token` on POST via the existing reCAPTCHA plugin integration.
- **msg type simplified to `{ type?: string }` in useProviders.ts**: Removed `jwt?` field from the local type — Pitfall 5 compliance; BroadcastChannel payload carries no jwt.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added import.meta.client guard to authenticate() calls**
- **Found during:** Task 2 (login/google.vue + login/facebook.vue)
- **Issue:** Plan action description said "replacing authenticateProvider in place keeps it client-side" but `authenticate()` is a bare top-level `<script setup>` call — this runs on SSR. The new exchange route requires `X-Recaptcha-Token` which `useApiClient` injects only on the client (where `$recaptcha` is defined). SSR invocation would fail with 400 from the exchange route.
- **Fix:** Wrapped `authenticate()` with `if (import.meta.client) authenticate()` in both pages. The plan explicitly says "The exchange call MUST run on the client" and "Do NOT hoist it into useAsyncData or a top-level SSR await" — the guard satisfies this intent.
- **Files modified:** apps/website/app/pages/login/google.vue, apps/website/app/pages/login/facebook.vue
- **Verification:** `grep -q "import.meta.client" app/pages/login/google.vue` passes
- **Committed in:** c17ffbab (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 - missing critical correctness guard)
**Impact on plan:** Essential for correctness — without the guard the exchange route would be called server-side without reCAPTCHA token, causing 400 errors on page load. All acceptance criteria still pass.

## Issues Encountered
None — all acceptance criteria passed on first attempt after applying the client guard.

## Known Stubs
None — these are structural migrations. End-to-end OAuth functionality is intentionally not verified here (plan 06 human-verify checkpoints). The `@nuxtjs/strapi` module remains the active session writer until plan 06's cutover.

## Next Phase Readiness
- All 5 OAuth client files are free of `setToken`/`authenticateProvider`
- Plan 05 (FormVerifyCode + UploadMedia) can proceed in parallel
- Plan 06 (module removal) has all required client-side migration work from this plan

## Self-Check: PASSED
- `apps/website/app/composables/useProviders.ts` — exists, contains `useSessionAuth`, no `msg.jwt`
- `apps/website/app/components/LoginWithGoogle.vue` — exists, contains `useSessionAuth`, no `setToken`
- `apps/website/app/pages/login/google.vue` — exists, contains `auth/google/exchange` and `useApiClient`
- `apps/website/app/pages/login/facebook.vue` — exists, contains `auth/facebook/exchange` and `useApiClient`
- `apps/website/app/plugins/google-one-tap.client.ts` — exists, contains `useSessionUser`, no `setToken`, no `useStrapiAuth`
- Commits 28e7cfba, c17ffbab, c3cf0f27 — confirmed in git log

---
*Phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie*
*Completed: 2026-06-14*
