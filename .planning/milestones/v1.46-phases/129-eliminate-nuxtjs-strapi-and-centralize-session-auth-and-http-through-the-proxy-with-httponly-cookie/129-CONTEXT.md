# Phase 129 — Context & Hard Constraints

**Captured:** 2026-06-13
**Scope:** `apps/website` only (dashboard already merged in Phase 125; `apps/dashboard` deleted).
**Nature:** Architectural migration prioritizing **simplicity and security**. NOT a patch. Everything in ONE phase — nothing deferred to a later phase.

---

## Why this phase exists (root cause)

`@nuxtjs/strapi` is the canonical session system in website. It is the source of a recurring logout bug:

1. Its `fetchUser()` calls `setToken(null)` on ANY error (including 401) — clearing the JWT as a side effect.
2. Its startup plugin auto-runs `fetchUser()` on every SSR render, BEFORE middleware. On SSR it calls Strapi directly (`API_URL`) without `X-Proxy-Key`, so `proxy-auth` rejects with 401 → token wiped.
3. The JWT cookie ends up storing a **serialized Vue ref** (`{"__v_isRef":true,"_value":null,...}`) instead of a plain string — observed in the dev warning: `cookie waldo_jwt was previously set to %7B%22__v_isRef%22... and is being overridden to null`.

Net effect: after any action that triggers `window.location.reload()` (e.g. deactivating an ad), the SSR pass wipes the token and the user is bounced to `/login`.

Phase 109 already designed and executed this exact migration **for the dashboard** (custom `useSession*` composables + startup plugin). Phase 125 (dashboard→website merge) reintroduced `@nuxtjs/strapi` as the canonical system. **Reuse `.planning/phases/109-*/109-RESEARCH.md` as the template.**

---

## Target architecture (decided with user)

### 1. Security model — httpOnly cookie + proxy injects token
- JWT stored in an **httpOnly cookie** the client (JS) can NEVER read → immune to XSS token theft.
- The **Nitro proxy is the single exit point**. It reads the httpOnly cookie server-side and injects `Authorization: Bearer <jwt>` toward Strapi. The client never touches the token.
- Because no component can read the token, ALL Strapi calls are **physically forced** through the centralized proxy — centralization enforced by design, not convention.

### 2. Zero direct calls to `API_URL` — client AND SSR go through the proxy
- Remove the `runtimeConfig.strapi.url = API_URL` hack (current SSR-direct-to-Strapi workaround for Vercel Deployment Protection).
- SSR self-calls to the proxy (`BASE_URL`) carry the Vercel Protection Bypass header:
  `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET`
  so Vercel allows the self-call. The proxy remains the only thing talking to Strapi.
- Flow:
  ```
  Client/SSR → BASE_URL/api/*  (SSR adds x-vercel-protection-bypass)
                 ↓ Vercel allows self-call
               Nitro proxy
                 ↓ injects X-Proxy-Key + Authorization (from httpOnly cookie)
               Strapi (API_URL)
  ```
- Research MUST validate: `VERCEL_AUTOMATION_BYPASS_SECRET` is set in staging AND production; proxy reads the bypass header on SSR and does NOT forward it to Strapi (Strapi only needs `X-Proxy-Key`).

### 3. Single HTTP client
- `useApiClient` stays as THE only HTTP entry point. Make it self-sufficient with `$fetch` + baseURL — remove its dependency on `useStrapiClient()`.
- Keeps existing behavior: inject `X-Recaptcha-Token` on POST/PUT/DELETE; inject `X-Proxy-Key` on SSR.

### 4. Minimal session layer (replaces the module)
- One thin user-state composable (`useState`-based) replaces `useStrapiUser` (54 usages).
- One session/auth composable replaces `useStrapiAuth`: `fetchUser`, `login`, `logout`, plus the OAuth Google provider flow (`getProviderAuthenticationUrl` x4, `authenticateProvider` x2) and verify-code login (`setToken`/`fetchUser`).
- Token is NEVER a Vue ref in the cookie — the cookie is httpOnly and managed server-side. `setToken` semantics must be re-thought: with httpOnly the server (login/verify-code/oauth-callback proxy routes) sets the cookie via `Set-Cookie`, not client JS.
- Keep cookie config (name `waldo_jwt`, `maxAge`, `domain`) in `runtimeConfig`.

### 5. Centralize EVERY remaining direct network call
- Audit every direct `fetch` / `$fetch` / `useFetch` / `useAsyncData`-with-inline-fetch and raw `fetch()` in pages and components.
- Known raw-fetch offenders reading `token.value` for the `Authorization` header: `app/composables/useImage.ts`, `app/components/UploadMedia.vue` (uploads). Reroute through the proxy / `useApiClient`.
- No component or page may call the network directly. The httpOnly token makes this physically enforceable.

---

## Surface area (website)
- `useStrapiUser` — 54 usages (≈49 files)
- `useStrapiAuth` — 30 usages (methods: `fetchUser` 16, `getProviderAuthenticationUrl` 4, `setToken` 3, `authenticateProvider` 2, `logout` 1)
- `useStrapiToken` — 5 usages
- `useStrapiClient` — via `useApiClient` (1 meaningful)
- **~60 files total.** Mechanical rename for most; auth/login/oauth/upload files need real logic changes.
- Remove `@nuxtjs/strapi` from `nuxt.config.ts` modules and `package.json`. Add `qs` as a direct dep if the new client needs it for param serialization.

## Hard constraints (do not violate)
- **Zero direct `API_URL` calls** from client or SSR — everything through the proxy.
- **JWT cookie is httpOnly** — client JS never reads or writes the token.
- **One HTTP client** (`useApiClient`); **no component does its own fetch**.
- Do not split into a follow-up phase — audit + centralize all fetch in THIS phase.
- Preserve existing security headers/CSP behavior (never relax without asking).
- Login / verify-code / Google OAuth flows must keep working end-to-end (these are the highest-risk paths).

## Open questions for research
- With httpOnly, how does the client-side login (`/auth/local`, verify-code, google-one-tap) receive and persist the token? → proxy route returns `Set-Cookie: waldo_jwt` (httpOnly) instead of returning the JWT in the body for the client to store.
- How does `fetchUser()` work when the client can't read the token? → it just calls the proxy `/api/users/me`; the proxy injects auth from the cookie. Client only ever sees the user object, never the token.
- OAuth callback: Strapi `/connect/google` redirect returns `access_token` in the URL — the proxy callback route must capture it and set the httpOnly cookie server-side.
- Confirm `VERCEL_AUTOMATION_BYPASS_SECRET` availability per environment.
