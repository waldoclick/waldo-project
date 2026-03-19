# Project Research Summary

**Project:** Google One Tap Sign-In — waldo.click
**Domain:** Federated social authentication overlay for Nuxt 4 SSR + Strapi v5
**Researched:** 2026-03-18
**Confidence:** HIGH

## Executive Summary

Google One Tap is a non-blocking overlay UI rendered by Google's GIS library that signs users in with a single tap — no redirect, no full page reload. The correct implementation for waldo.click requires two parallel tracks: a **Nuxt client-side plugin** that initializes the GIS SDK and calls `prompt()` on public pages for unauthenticated users, and a **new dedicated Strapi endpoint** (`POST /api/auth/google-one-tap`) that verifies the Google ID token server-side using `google-auth-library`, upserts the user, and returns a Waldo JWT in the same `{ jwt, user }` shape as all existing auth flows.

The recommended approach is deliberately minimal: the GIS SDK is already loaded globally in `nuxt.config.ts`, `google-auth-library` is already available as a transitive dependency of `googleapis`, and JWT cookie persistence is handled by `@nuxtjs/strapi` automatically after `setToken(jwt)`. **Zero new npm packages are needed on the website; only `yarn add google-auth-library` may be needed in Strapi** (verify first with `yarn why`). The biggest risk is the existing `useGoogleOneTap.ts` composable — it uses a fragile redirect hack (passing a Google ID token as an OAuth access token) that silently fails, has a broken global flag that prevents `prompt()` from firing on subsequent SPA pages, and calls FedCM-deprecated notification methods. The composable must be **rewritten**, not patched.

The critical mitigation strategy is to build the Strapi endpoint first, independently test it, then rewrite the frontend composable against the real endpoint. One hard constraint to enforce throughout: always look up users by Google's `sub` field (not email) as the unique identifier — Google explicitly prohibits using email as a primary key, and the security implications of getting this wrong (account merging, potential escalation) are severe.

---

## Key Findings

### Recommended Stack

The integration requires exactly **one new server-side dependency** (`google-auth-library` in Strapi) and zero new frontend packages. The GIS SDK is delivered only via CDN script tag — self-hosting is explicitly unsupported by Google and would conflict with the existing `app.head.script` injection already in `nuxt.config.ts`. `google-auth-library@^10.6.2` (Google's official Node.js client) provides `OAuth2Client.verifyIdToken()` which handles RS256 signature verification, `aud`/`iss`/`exp` checks, and Google JWKS key rotation automatically. The website's `app/types/window.d.ts` already covers `window.google.accounts.id` — `@types/google-one-tap` must NOT be installed (causes duplicate global declarations).

One CSP update is required: `connect-src` in `nuxt.config.ts` is missing `https://accounts.google.com/gsi/` — without it, FedCM silently fails on Chrome 117+ (the majority of users). `script-src` and `frame-src` already cover the necessary Google domains. Adding `https://accounts.google.com/gsi/style` to `style-src` is optional but recommended for visual consistency. One new environment variable — `GOOGLE_CLIENT_ID` — must be added to `apps/strapi/.env` and `.env.example`.

**Core technologies:**
- **GIS SDK (CDN):** Browser-side One Tap rendering — already loaded in `nuxt.config.ts`; no change needed
- **`google-auth-library` (Strapi):** Server-side ID token verification — verify/add to `apps/strapi/`; `OAuth2Client.verifyIdToken()` handles all required validation
- **`@nuxtjs/strapi`:** JWT cookie persistence — handles `waldo_jwt` cookie automatically after `setToken(jwt)`; no custom cookie code needed
- **Nuxt `.client.ts` plugin:** Lifecycle hook ensuring One Tap initializes after hydration on every public page; `.client.ts` suffix excludes it from SSR automatically

### Expected Features

The feature scope is tight and well-defined. The GIS library handles the entire UI; the implementation surface is the callback handler, the Strapi endpoint, and the route/auth guards.

**Must have (table stakes — v1 launch):**
- One Tap Nuxt plugin initializing GIS and calling `prompt()` on public pages only
- Route guard suppressing One Tap on `/cuenta/*`, `/pagar/*`, `/anunciar/*`
- Auth-state guard suppressing One Tap when user already has a Waldo session (`useStrapiUser()`)
- JWT callback → `POST /api/auth/google-one-tap` → `{ jwt, user }` → `setToken` + `fetchUser`
- New Strapi endpoint: verify Google ID token, upsert user by `sub`, call `createUserReservations()` for new users, issue Waldo JWT (bypass 2-step — same as existing `/connect/google`)
- `disableAutoSelect()` called in `useLogout.ts` before `strapiLogout()` to prevent dead-loop

**Should have (add after stable v1):**
- Auto sign-in (`auto_select: true`) — only safe after logout handling confirmed working in production
- ITP support (`itp_support: true`) — Safari/Firefox fallback UX (welcome page + popup)
- Profile completeness redirect (mirrors existing `login/google.vue` behavior via `meStore.isProfileComplete()`)

**Defer (v2+):**
- `state_cookie_domain: "waldo.click"` — only needed if One Tap expands to other waldo.click subdomains
- `context: "signup"` variant on landing pages — minor copy change, low impact

**Anti-features to avoid:**
- Custom One Tap prompt positioning — FedCM (Chrome 117+) controls position; CSS targeting it breaks
- `isNotDisplayed()` / `getNotDisplayedReason()` — removed in FedCM mode; delete from composable
- Using `email` as user identifier — Google prohibits this; use `sub`
- One Tap on the dashboard — consumer-facing UX; admin should use 2-step local login
- `use_fedcm_for_prompt: true` — deprecated, silently ignored; remove from `initialize()` call

### Architecture Approach

The architecture is clean: a Nuxt client-side plugin handles the browser-side lifecycle (initialize once, prompt per page, guard by auth state and route); a new Strapi content API (`src/api/auth-one-tap/`) handles the server-side exchange; a new Strapi service (`src/services/google-one-tap/`) wraps `OAuth2Client.verifyIdToken()` following the singleton service pattern established in this codebase. The existing `useGoogleOneTap.ts` composable is **rewritten** (not extended) to remove the fragile OAuth redirect hack and replace it with a direct POST + `setToken` + `fetchUser` pattern matching `FormVerifyCode.vue`.

**Major components:**
1. **`apps/website/app/plugins/google-one-tap.client.ts`** (NEW) — Auth-state guard + calls `initializeGoogleOneTap()`; runs once after hydration on all routes; `.client.ts` suffix handles SSR exclusion
2. **`apps/website/app/composables/useGoogleOneTap.ts`** (REWRITE) — GIS `initialize()` + route-aware `prompt()` + credential callback → POST to Strapi → `setToken` + `fetchUser` + `navigateTo`; remove redirect hack, broken flag, deprecated methods
3. **`apps/strapi/src/services/google-one-tap/`** (NEW) — `GoogleOneTapService.verifyCredential()` wrapping `OAuth2Client.verifyIdToken()`; singleton pattern; typed via `IGoogleOneTapPayload`
4. **`apps/strapi/src/api/auth-one-tap/`** (NEW) — `POST /api/auth/google-one-tap` controller + public route; validates credential → `findOrCreateUser` by `sub` → `createUserReservations()` for new users → issues Waldo JWT
5. **`apps/website/app/composables/useLogout.ts`** (EXTEND) — Add `google.accounts.id.disableAutoSelect()` call before `strapiLogout()`

**Key structural decision:** New Strapi endpoint uses standard content API (`src/api/`), NOT plugin extension routes — the plugin route factory is documented as broken in Strapi v5 (`strapi-server.ts` lines 56–62). Mirrors the proven `auth-verify/` endpoint pattern.

### Critical Pitfalls

1. **Missing `connect-src https://accounts.google.com/gsi/` in CSP** — One Tap silently never shows on Chrome 117+ (FedCM). No visible user-facing error. Add to `nuxt.config.ts` `connect-src` and `frame-src`; optionally add `/gsi/style` to `style-src`. Use the parent path — not individual GIS endpoint URLs — to future-proof against GIS updates.

2. **Existing `useGoogleOneTap.ts` redirect hack is broken by design** — passes a Google ID token as an OAuth `access_token` to `authenticateProvider()` which Strapi's `tokeninfo` endpoint rejects. This is the most likely reason any past One Tap testing appeared to "not work." The composable must be fully rewritten; do not attempt to patch the redirect approach.

3. **Global `googleOneTapInitialized` flag breaks per-page `prompt()`** — the flag guards both `initialize()` and `prompt()` together. After One Tap shows once per app load, it never shows again during SPA navigation. Fix: move `initialize()` to the plugin (runs once on startup), keep `prompt()` in the composable (called per-page), remove the global flag entirely.

4. **`disableAutoSelect()` missing from logout → dead-loop** — without this call in `useLogout.ts`, the GIS library's `g_state` cookie retains auto-sign-in state. Users who sign out are immediately prompted (or silently re-authenticated if `auto_select: true` is ever enabled). Must be fixed before enabling auto sign-in.

5. **Using `email` as user identifier instead of `sub`** — Google explicitly prohibits email as a unique key. Look up users by a dedicated `google_sub` field first; fall back to email only for account linking. Failure leads to duplicate accounts and potential security escalation if a malicious actor registers an email address previously owned by someone else.

6. **`use_fedcm_for_prompt: true` is deprecated + notification methods broken** — current composable passes this flag (silently ignored in Chrome 117+) and calls `isNotDisplayed()` / `getNotDisplayedReason()` which are not supported in FedCM mode and return `undefined`. Remove both. Use only `isDismissedMoment()` / `getDismissedReason()` for prompt status.

---

## Implications for Roadmap

Based on combined research, the natural build order follows the dependency chain: infrastructure fixes first (CSP, env vars), Strapi endpoint second (can be tested independently), then frontend rewrite against the live endpoint, then polish.

### Phase 1: Infrastructure Prerequisites

**Rationale:** CSP changes and the `GOOGLE_CLIENT_ID` env var in Strapi are prerequisites for any browser-side or server-side testing. Small, isolated, zero risk — must land before any other phase can be validated.

**Delivers:** `connect-src https://accounts.google.com/gsi/` and `frame-src https://accounts.google.com/gsi/` added to `nuxt.config.ts`; optional `style-src` update; `GOOGLE_CLIENT_ID` added to `apps/strapi/.env` and `.env.example`.

**Addresses:** Foundational requirement for all subsequent work.

**Avoids:** Pitfall 1 (missing `connect-src` = silent FedCM failure on Chrome 117+) — the most common debugging time sink.

### Phase 2: Strapi Backend Endpoint

**Rationale:** The new Strapi endpoint has zero frontend dependencies — it can be built, tested, and validated independently via `curl`/Postman before any Nuxt code changes. Establishing the API contract early unblocks frontend work and eliminates the guesswork of building against a mock.

**Delivers:** `POST /api/auth/google-one-tap` that accepts a Google ID token, verifies it with `OAuth2Client.verifyIdToken()`, upserts user by `sub` field (not email), calls `createUserReservations()` for new users, and returns `{ jwt, user }`. Includes `GoogleOneTapService` singleton and `IGoogleOneTapPayload` types.

**Addresses:** Table-stakes: ID token verification, new user auto-creation, bypass 2-step (matching existing `/connect/google` behavior — document explicitly in code), user reservation creation.

**Uses:** `google-auth-library` (verify/add to `apps/strapi/`), standard content API pattern from `auth-verify/`.

**Avoids:** Pitfall 3 (wrong token type — ID token ≠ OAuth access token), Pitfall 6 (email as identifier — use `sub`), Pitfall 8 (missing `createUserReservations` for new One Tap users), Pitfall 9 (2-step bypass — document the decision).

### Phase 3: Nuxt Plugin + Composable Rewrite

**Rationale:** Frontend work depends on Phases 1 and 2. The composable is a complete rewrite — not a patch — which benefits from being a clean-slate implementation against the known API contract established in Phase 2.

**Delivers:** `plugins/google-one-tap.client.ts` (auth-state guard + `initialize()` once on startup); rewritten `useGoogleOneTap.ts` (route-aware `prompt()` + credential callback → POST → `setToken` + `fetchUser` + `navigateTo`); removal of deprecated `use_fedcm_for_prompt` and broken FedCM notification methods; removal of the global `googleOneTapInitialized` flag; `window.d.ts` extended with `cancel(): void`.

**Addresses:** Table-stakes: One Tap overlay on public pages, JWT callback handler, coexistence with existing Google Sign-In redirect button, SSR safety (`.client.ts` suffix).

**Avoids:** Pitfall 2 (deprecated FedCM flag/methods), Pitfall 5 (global flag breaking per-page `prompt()`), Pitfall 7 (SSR hydration via plugin suffix), Pitfall 10 (race condition on auth-guarded pages via route guard).

### Phase 4: Logout Fix

**Rationale:** Small, targeted change that completes the auth lifecycle. `disableAutoSelect()` in logout is critical before any real-user testing — without it, logout followed by a page visit triggers One Tap immediately, which is severely confusing UX and becomes a dead-loop if `auto_select: true` is ever enabled.

**Delivers:** `useLogout.ts` extended with `window.google?.accounts?.id?.disableAutoSelect()` before `strapiLogout()`.

**Addresses:** Table-stakes: `disableAutoSelect()` on logout.

**Avoids:** Pitfall 4 (dead-loop after logout).

### Phase 5: Polish + v1.x Enhancements (post-production validation)

**Rationale:** Add `auto_select: true`, ITP support, and profile completeness redirect only after the base flow is confirmed working in production. `auto_select` is explicitly flagged as risky until logout handling (Phase 4) is verified in production to prevent dead-loops. ITP behavior has its own edge cases (auto sign-in not supported on ITP — explicitly documented by Google).

**Delivers:** Auto sign-in for returning users (`auto_select: true`); ITP browser fallback (`itp_support: true`); profile completeness redirect mirroring `login/google.vue` (via `meStore.isProfileComplete()` and `appStore.getReferer`).

**Addresses:** Differentiator features: zero-click sign-in, cross-browser support, post-login UX parity with existing OAuth flow.

### Phase Ordering Rationale

- **Infrastructure first:** A missing `connect-src` entry causes silent failures with no user-visible error — debugging with this unfixed is a guaranteed time sink.
- **Backend before frontend:** Strapi endpoint can be fully tested with `curl`/Postman before any Nuxt work. Establishing the real API contract eliminates mocking complexity.
- **Composable as complete rewrite:** The existing code has multiple layered bugs (redirect hack, broken flag, deprecated methods). Incremental patching risks leaving one issue while fixing another. A clean rewrite against a known API contract is faster and safer.
- **Logout fix before auto_select:** The dead-loop risk is non-trivial. `disableAutoSelect()` must be confirmed working in production before enabling auto sign-in.
- **v1.x features gated on production validation:** Auto sign-in and ITP support have documented behavioral edge cases — validate core flow in production before layering enhancements.

### Research Flags

Phases with well-documented patterns (deep research not needed during planning):
- **Phase 1 (Infrastructure):** Mechanical — exact CSP values specified in official Google docs and STACK.md.
- **Phase 2 (Strapi endpoint):** Follows the exact `auth-verify/` content API pattern already in the codebase. `OAuth2Client.verifyIdToken()` is thoroughly documented. Build order is clear.
- **Phase 4 (Logout fix):** Trivial change, no design ambiguity.

Phases that may need targeted investigation during planning:
- **Phase 3 (Composable rewrite):** How and when to call `prompt()` during SPA navigation (on every route change? on app load only? from `onMounted` in a layout?) needs a decision. The ARCHITECTURE.md is slightly inconsistent: it recommends calling `prompt()` from "individual page `onMounted()` hooks" but also shows the plugin calling `initializeGoogleOneTap()` globally. Resolve the calling convention before implementation starts.
- **Phase 5 (auto_select + ITP):** Auto sign-in under FedCM has documented quirks (10-minute quiet period, reconfirmation requirement per Chrome instance). ITP popup fallback interacts with COOP headers — audit `nuxt-security` COOP config before shipping.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All claims verified against official Google Identity Services docs (updated 2025–2026) and direct codebase inspection. Single dependency (`google-auth-library`) is Google's official library with built-in TypeScript declarations. |
| Features | HIGH | Sourced from official GIS docs. FedCM behavior, cooldown mechanics, and ITP limitations are clearly documented. Feature scope is narrow and unambiguous. |
| Architecture | HIGH | Build order and component boundaries verified against live codebase. Existing patterns (`auth-verify/`, `FormVerifyCode.vue`) are proven. The broken plugin route factory limitation is confirmed via existing code comment. |
| Pitfalls | HIGH | Critical pitfalls sourced from official docs with version dates. Codebase-specific pitfalls (broken flag, redirect hack, deprecated methods) confirmed via direct inspection of `useGoogleOneTap.ts`. |

**Overall confidence:** HIGH

### Gaps to Address

- **`google_sub` field on Strapi User model:** Research recommends looking up users by `sub` using a dedicated `google_sub` field. The existing OAuth flow may already store `provideridentifier` (which could be `sub`). Verify during Phase 2 implementation: if `provideridentifier` already stores the Google `sub`, a new field may not be needed; if not, add an indexed `google_sub` field to the User content type.

- **`google-auth-library` transitive availability:** ARCHITECTURE.md notes it may already be available as a transitive dep of `googleapis@^148.0.0`. STACK.md notes it's not in `apps/strapi/package.json` as a direct dep. Run `yarn why google-auth-library` in `apps/strapi/` before deciding — either way, add it as an explicit dependency.

- **`prompt()` calling frequency during SPA navigation:** Whether `prompt()` should be called on every route change or only once on initial app load is left unresolved. The architecture doc suggests both approaches in different sections. This is a UX decision (prompt on every page vs. only on entry pages) — resolve before Phase 3 implementation begins.

- **2-step verification policy:** The decision to bypass `overrideAuthLocal` for One Tap (matching existing `/connect/google` behavior) is architecturally correct but should be confirmed with product stakeholders. Document the decision explicitly in the new endpoint code.

- **Account linking edge case:** User registered with email/password, then uses One Tap with the same email. The new endpoint must handle this: link by email on first use, then store `sub` for future lookups. The exact linking logic needs to be designed during Phase 2.

---

## Sources

### Primary (HIGH confidence)
- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#content_security_policy (2025-10-31) — CSP directives; parent path approach for future-proofing
- https://developers.google.com/identity/gsi/web/guides/display-google-one-tap (2025-09-29) — JS callback mode, prompt status moments, `initialize()` + `prompt()` API
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token (2025-12-22) — `google-auth-library` server-side verification; JWT payload fields
- https://developers.google.com/identity/gsi/web/guides/fedcm-migration (2026-02-10) — deprecated methods, FedCM defaults, CSP requirements, removed APIs
- https://developers.google.com/identity/gsi/web/reference/js-reference (2026-02-10) — `IdConfiguration`, `CredentialResponse`, `disableAutoSelect()`, all config fields
- https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out (2025-05-23) — auto_select behavior, FedCM quiet period, disableAutoSelect dead-loop
- https://developers.google.com/identity/gsi/web/guides/features (2025-05-19) — cooldown tables, ITP behavior, auto-dismissal timing
- https://www.npmjs.com/package/google-auth-library (v10.6.2, 2026-03-16) — current version; built-in TypeScript declarations confirmed

### Codebase (HIGH confidence — direct inspection)
- `apps/website/nuxt.config.ts` — GIS script already in `app.head.script`; CSP state; `GOOGLE_CLIENT_ID` in `runtimeConfig.public`; missing `connect-src` entries confirmed
- `apps/website/app/types/window.d.ts` — existing `window.google.accounts.id` types confirmed; `@types/google-one-tap` not needed
- `apps/website/app/composables/useGoogleOneTap.ts` — redirect hack on line 27; broken global flag; deprecated `use_fedcm_for_prompt`; broken notification methods
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — plugin route factory limitation documented (lines 56–62)
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — `createUserReservations()` reusable; `overrideAuthLocal` bypass pattern confirmed
- `apps/strapi/package.json` — `google-auth-library` not listed as direct dep; `googleapis@148.0.0` present (transitive source)

---
*Research completed: 2026-03-18*
*Ready for roadmap: yes*
