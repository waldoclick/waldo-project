# Stack Research

**Domain:** Google One Tap Sign-In integration for Nuxt 4 website
**Researched:** 2026-03-18
**Confidence:** HIGH — all claims verified against official Google Identity Services documentation (updated 2025–2026) and direct codebase inspection.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| GIS script tag (CDN) | N/A — always latest from `accounts.google.com` | Loads `window.google.accounts.id` API in the browser | Google's **official and only supported** delivery method. Self-hosting or npm bundling is explicitly unsupported — the CDN ensures automatic security updates and FedCM compatibility patches. **Already loaded** in `app.head.script` in `apps/website/nuxt.config.ts` (lines 261–265). Zero addition needed on the website. |
| `google-auth-library` | `^10.6.2` (current, published 2026-03-16) | Server-side JWT verification in Strapi | Google's official Node.js client. `OAuth2Client.verifyIdToken()` verifies RS256 signature, `aud`, `iss`, and `exp` in one call, with built-in public-key caching and rotation handling. Required in Strapi because the browser GIS SDK is client-only — the server must independently verify the credential JWT. Built-in TypeScript declarations. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@types/google-one-tap` | ❌ DO NOT INSTALL | TypeScript types for `window.google.accounts.id` | Already covered in `app/types/window.d.ts`. The website has hand-written `GoogleOneTapNotification` and `window.google.accounts.id` types. Installing `@types/google-one-tap` would create duplicate global declarations and cause TypeScript conflicts. |

### No New Nuxt Module Needed

| Decision | Rationale |
|----------|-----------|
| No `nuxt-google-signin` or similar Nuxt module | The GIS script tag is already loaded globally via `app.head.script` in `nuxt.config.ts`. A Nuxt wrapper module would add a layer around the same CDN script without adding value. Consistent with how GTM, LogRocket, and Hotjar are loaded in this project (direct script injection, no modules). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Existing `app/types/window.d.ts` | TypeScript types for `window.google` | Already declares `google.accounts.id.initialize`, `google.accounts.id.prompt`, `GoogleOneTapNotification`, and `window.googleOneTapInitialized`. Extend with `disableAutoSelect()` if used in logout (recommended). |

---

## Installation

```bash
# Strapi only — adds server-side JWT verification
# Run from: apps/strapi/
yarn add google-auth-library

# Website — NOTHING to install
# GIS SDK already loaded via script tag in nuxt.config.ts
# No npm package needed or desired
```

---

## CSP Header Changes (`nuxt-security`)

The existing `nuxt.config.ts` CSP already covers most Google domains from the existing OAuth redirect flow. Here is the exact status of each directive relevant to One Tap:

### `script-src` — ✅ Already present, no change needed
`https://accounts.google.com` is in `script-src` (line 67 of current `nuxt.config.ts`). The GIS client library loads from `https://accounts.google.com/gsi/client`.

### `frame-src` — ✅ Already present, no change needed
`https://accounts.google.com` is in `frame-src` (line 121). One Tap renders an iframe from `accounts.google.com/gsi/`.

### `connect-src` — ❌ MISSING — must be added
Google Identity Services makes XHR/fetch calls to `https://accounts.google.com/gsi/` for status checks, token exchange, and FedCM flows. The official CSP guide requires the **parent path** `https://accounts.google.com/gsi/` (not individual sub-URLs — adding the parent avoids breakage on GIS updates).

**Required addition:**
```typescript
"connect-src": [
  // ... existing entries ...
  "https://accounts.google.com/gsi/",  // ← ADD THIS for One Tap / FedCM XHR calls
],
```

Without this, Chrome DevTools will show:
```
[GSI_LOGGER]: FedCM get() rejects with NetworkError: Refused to connect to
'https://accounts.google.com/gsi/fedcm.json' because it violates the document's
Content Security Policy.
```

### `style-src` — Optional addition
Google's stylesheet `https://accounts.google.com/gsi/style` controls One Tap UI appearance. Currently absent. The prompt renders without custom styling if omitted (browser default styles apply). Add if visual consistency matters:

```typescript
"style-src": [
  "'self'",
  "'unsafe-inline'",
  "https://css.zohocdn.com",
  "https://accounts.google.com/gsi/style",  // ← OPTIONAL: One Tap UI styles
],
```

### FedCM / `Cross-Origin-Opener-Policy`
FedCM (active by default in Chrome 117+) eliminates the popup mode that required `COOP: same-origin-allow-popups`. `nuxt-security` does not set COOP headers, and no change is needed — FedCM handles sign-in without popups entirely.

---

## Strapi-Side Changes

### Why Strapi needs changes

One Tap delivers a **credential JWT** to the browser callback — a signed Google ID token. This is **not** the same as the OAuth authorization code handled by Strapi's existing `GET /auth/google/callback`. A new endpoint is required to:

1. Accept `{ credential: string }` (the Google ID token)
2. Verify it server-side with `google-auth-library`
3. Find-or-create a Strapi user by email
4. Issue a Strapi JWT
5. Return `{ jwt, user }` — same shape as `verify-code` and OAuth callback responses

### New components to create

| Component | Location | Responsibility |
|-----------|----------|---------------|
| `google-one-tap.service.ts` | `apps/strapi/src/services/google-one-tap/` | Wraps `OAuth2Client.verifyIdToken()`. Validates `aud` = `GOOGLE_CLIENT_ID`. Returns decoded payload (`sub`, `email`, `given_name`, `family_name`, `picture`). Throws `ApplicationError` on invalid token. |
| `google-one-tap.types.ts` | `apps/strapi/src/services/google-one-tap/` | `IGoogleOneTapPayload` interface: `sub`, `email`, `email_verified`, `given_name`, `family_name`, `picture`, `aud`, `iss`, `exp`. |
| `index.ts` | `apps/strapi/src/services/google-one-tap/` | Exports singleton + `verifyCredential()` named export. Follows GeminiService / TavilyService singleton pattern established in this codebase. |
| `google-one-tap.controller.ts` | `apps/strapi/src/api/auth-one-tap/controllers/` | Receives `POST /api/auth/google-one-tap` with `{ credential }`. Delegates to service. Calls `findOrCreateUser()`. Calls `createUserReservations()` for new users. Returns `{ jwt, user }`. |
| `google-one-tap.routes.ts` | `apps/strapi/src/api/auth-one-tap/routes/` | Public route (no auth middleware) — same as `verify-code` route pattern. |

### What does NOT change in Strapi

| Existing Component | Status |
|--------------------|--------|
| `GET /auth/google/callback` (OAuth redirect flow) | **Unchanged** — different flow for the existing `/login/google` redirect button. One Tap uses a separate endpoint. |
| `overrideAuthLocal` 2-step verification | **Unchanged** — One Tap bypasses 2-step entirely. One Tap credential is Google-cryptographically-verified; running a 6-digit SMS/email code after Google already verified the identity is redundant and degrades UX. Pattern is consistent with the existing `ctx.method === "GET"` guard for OAuth callbacks. |
| `createUserReservations()` in `authController.ts` | **Reused** — called for new users created via One Tap, same as existing OAuth and local registration flows. |
| `registerUserAuth` wrapper | **Not reused** — One Tap uses a new endpoint, not the `connect` handler, because the credential format differs (JWT vs. OAuth code exchange). |
| `google-auth-library` is not yet in `apps/strapi/package.json` | Needs `yarn add google-auth-library` — this is the **one new dependency**. |

### New environment variable in Strapi

```bash
# apps/strapi/.env and .env.example
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

`google-auth-library` `verifyIdToken()` requires the client ID to verify the `aud` claim. **Same client ID as the website** (`runtimeConfig.public.googleClientId`). Must be added to Strapi's env — it does not have it yet (the existing GoogleConfig service is for Sheets API, not authentication).

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `google-one-tap` npm package (community) | Community wrapper that self-hosts the GIS SDK. Google explicitly marks self-hosting unsupported. Security patches won't arrive automatically. Also conflicts with the existing `app.head.script` injection (would load GIS twice). | Direct `window.google.accounts.id` calls — GIS already loaded via script tag. |
| `vue3-google-login` | Vue wrapper library. Opinionated about loading order, conflicts with existing `app.head.script` injection, adds ~10KB for no benefit over direct API calls. | Direct `window.google.accounts.id` API in a `plugin.client.ts`. |
| `@types/google-one-tap` | Creates duplicate `window.google` global declarations conflicting with existing `window.d.ts`. | Extend existing `app/types/window.d.ts` for any missing types (`disableAutoSelect`, `renderButton`). |
| `jsonwebtoken` for server-side verification | Manual JWT verification requires managing Google public key rotation (JWKS endpoint, `Cache-Control` header). Easy to miss `aud`, `iss`, or `exp` checks. | `google-auth-library` `OAuth2Client.verifyIdToken()` — handles key rotation, caching, and all required validation steps. |
| Adding One Tap to the dashboard app | Dashboard is admin-only. Google One Tap is a consumer-facing sign-in UX. Admin access via 2-step local login is appropriate and more secure. | Website-only feature. |
| Re-using `registerUserAuth` (`instance.connect`) for One Tap | `connect` handles OAuth code exchange (redirect flow). One Tap provides a signed JWT directly — different protocol, different verification. | New `google-one-tap.controller.ts` endpoint. |

---

## Integration Points with Existing Stack

### `@nuxtjs/strapi` — how the frontend calls the new endpoint

After the One Tap callback fires in the browser, the frontend calls `POST /api/auth/google-one-tap` via `useApiClient` (which injects `X-Recaptcha-Token`). The response `{ jwt, user }` feeds into `setToken(jwt)` + `fetchUser()` from `useStrapiAuth()` — identical pattern to `FormVerifyCode.vue` (verify-code flow, v1.36).

### Pinia / logout

`useLogout.ts` must call `google.accounts.id.disableAutoSelect()` before `strapiLogout()`. This prevents One Tap from auto-signing-in the next visitor on a shared device. Pattern:

```typescript
// apps/website/composables/useLogout.ts — ADD before strapiLogout():
if (import.meta.client && window.google?.accounts?.id) {
  window.google.accounts.id.disableAutoSelect()
}
```

### `@saslavik/nuxt-gtm` / analytics

Push a `login` GA4 event inside the credential callback:
```typescript
window.dataLayer.push({ event: 'login', method: 'google_one_tap' })
```
Uses the existing `window.dataLayer` typed union (`DataLayerEvent | Record<string, unknown>`).

### 2-Step verification bypass

The new `POST /api/auth/google-one-tap` endpoint issues a Strapi JWT directly, bypassing the `overrideAuthLocal` 2-step intercept. This is correct: Google has already verified the user's identity cryptographically. The existing `ctx.method === "GET"` guard only bypasses for OAuth redirect callbacks — the new endpoint must explicitly skip 2-step by not going through `auth.local` at all.

### `nuxt-security` CSP

Only `connect-src` change required. All other existing CSP entries already cover One Tap domains. See CSP section above.

### `runtimeConfig.public.googleClientId`

Already present in `apps/website/nuxt.config.ts` (line 344). The client plugin reads `useRuntimeConfig().public.googleClientId` for `google.accounts.id.initialize({ client_id })`. No new runtimeConfig key needed.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| GIS loading | Script tag (CDN) — already loaded | `google-one-tap` npm package | Google explicitly unsupported for self-hosting; would load GIS twice |
| Server JWT verification | `google-auth-library` | `jsonwebtoken` + manual JWKS fetch | `google-auth-library` handles key rotation; manual approach is error-prone |
| Nuxt integration | Client-side plugin using `window.google.accounts.id` | Nuxt wrapper module | Script already loaded; module adds no value |
| New Strapi endpoint | Dedicated `api/auth-one-tap/` content-API style | Extending `users-permissions` plugin routes | Plugin route push is a factory-function in Strapi v5 and doesn't work (documented in `strapi-server.ts` comment line 57–61). Dedicated API folder is the established pattern. |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `google-auth-library@10.6.2` | Node.js ≥ 18, TypeScript ≥ 4.7 | Built-in TypeScript declarations (`index.d.ts`). Strapi v5 requires Node.js ≥ 18. No version conflict with existing deps. |
| GIS CDN script | Chrome 117+ (FedCM native), all modern browsers | FedCM is the default since April 2024 in Chrome. The existing CDN script handles FedCM transparently — no configuration change needed to activate it. |
| `nuxt-security@2.4.0` | CSP via `contentSecurityPolicy` config object | Adding `connect-src` entry follows the same array pattern already used for all other CSP directives. |
| `nuxt@^4.1.3` | `app.head.script` injection | Already used for GIS; no Nuxt version constraint on this approach. |

---

## Sources

| Source | What Was Verified | Confidence |
|--------|-------------------|------------|
| `https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#content_security_policy` (updated 2025-10-31) | CSP directives: `connect-src` + `frame-src` + `script-src` required URLs; `https://accounts.google.com/gsi/` as parent path | HIGH |
| `https://developers.google.com/identity/gsi/web/guides/display-google-one-tap` (updated 2025-09-29) | JS callback mode; `CredentialResponse.credential` JWT field; `initialize()` + `prompt()` API | HIGH |
| `https://developers.google.com/identity/gsi/web/guides/verify-google-id-token` (updated 2025-12-22) | `google-auth-library` Node.js `verifyIdToken()` as recommended server-side approach; JWT payload fields (`sub`, `email`, etc.) | HIGH |
| `https://developers.google.com/identity/gsi/web/guides/fedcm-migration` (updated 2026-02-10) | FedCM CSP requirement (`connect-src` mandatory); COOP not needed with FedCM; `use_fedcm_for_prompt` deprecated | HIGH |
| `https://developers.google.com/identity/gsi/web/reference/js-reference` (updated 2026-02-10) | `IdConfiguration`, `CredentialResponse`, `disableAutoSelect()`, `google.accounts.id.initialize` | HIGH |
| `https://www.npmjs.com/package/google-auth-library` (v10.6.2, published 2026-03-16) | Current version; built-in TS types confirmed | HIGH |
| `apps/website/nuxt.config.ts` (direct codebase inspection) | GIS script tag already in `app.head.script`; existing CSP state; `GOOGLE_CLIENT_ID` in `runtimeConfig.public`; `connect-src` missing `accounts.google.com/gsi/` | HIGH |
| `apps/website/app/types/window.d.ts` (direct codebase inspection) | `window.google.accounts.id` typed; `GoogleOneTapNotification` defined; no `@types/google-one-tap` needed | HIGH |
| `apps/strapi/src/extensions/users-permissions/strapi-server.ts` (direct inspection) | `ctx.method === "GET"` bypass for OAuth; plugin route push limitation documented | HIGH |
| `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` (direct inspection) | `createUserReservations()` reusable; `registerUserAuth` uses OAuth code path, not JWT path | HIGH |
| `apps/strapi/package.json` (direct inspection) | `google-auth-library` not currently installed; `googleapis@148.0.0` is for Sheets API (different) | HIGH |

---

*Stack research for: Google One Tap Sign-In integration (website only)*
*Researched: 2026-03-18*
