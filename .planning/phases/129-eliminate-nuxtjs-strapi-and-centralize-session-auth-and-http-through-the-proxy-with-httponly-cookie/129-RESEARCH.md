# Phase 129: Eliminate @nuxtjs/strapi (Website) + httpOnly Session — Research

**Researched:** 2026-06-14
**Domain:** Nuxt 4 / Nitro — session architecture migration with httpOnly JWT cookie
**Confidence:** HIGH (all findings verified against live source files and official Nitro/Nuxt APIs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- JWT stored in an **httpOnly cookie** — client JS can never read or write the token.
- The **Nitro proxy is the single exit point**. It reads the httpOnly cookie server-side and injects `Authorization: Bearer <jwt>` toward Strapi. The client never touches the token.
- Zero direct `API_URL` calls from client or SSR — everything through the proxy (`BASE_URL/api/*`).
- SSR self-calls to the proxy carry `x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET`.
- `useApiClient` stays as the only HTTP entry point.
- Do not split into a follow-up phase — audit + centralize all fetch in THIS phase.
- Preserve existing security headers/CSP behavior (never relax without asking).

### Claude's Discretion
- Internal implementation of new composables (useSessionUser, useSessionAuth, useSessionClient).
- Exact cookie options (`sameSite`, `secure`, `path`, `domain` values).
- How to restructure the Google popup OAuth flow to avoid the BroadcastChannel JWT problem.

### Deferred Ideas (OUT OF SCOPE)
- CSRF token header (beyond `sameSite: lax` + existing reCAPTCHA barrier).
- Facebook OAuth flow redesign (only mechanical replacement needed for now).
- Dashboard changes (already done in Phase 109/125; `apps/dashboard` deleted).
</user_constraints>

---

## Summary

Phase 129 eliminates `@nuxtjs/strapi` from `apps/website` and replaces it with three custom composables (`useSessionUser`, `useSessionAuth`, `useSessionClient`) plus a set of dedicated Nitro server routes that intercept auth responses and set an httpOnly JWT cookie. The existing catch-all proxy (`server/api/[...].ts`) changes from forwarding `Cookie: waldo_jwt=<value>` to injecting `Authorization: Bearer <jwt>` after reading the httpOnly cookie server-side.

This is fundamentally different from Phase 109 (dashboard). Phase 109 was a mechanical rename: the JWT stayed client-readable. Phase 129 removes the client's ability to read or write the token entirely. Roughly a third of the ~60 affected files need real logic changes, not just symbol renames. The highest-risk paths are the three flows that currently call `setToken(jwt)` on the client: email/password login via verify-code, Google One Tap, and the Google OAuth popup. Each requires a dedicated Nitro intercept route.

**Primary recommendation:** Write new server routes first (the login/verify-code/google-one-tap intercepts + the OAuth callback handler + logout), then update the proxy cookie-to-Authorization injection, then replace composable usage across the 60 files, then simplify middleware guards, and finally update tests. This order ensures the auth foundation exists before any component migration attempts to use it.

---

## Standard Stack

### Core (no new dependencies required)

| Library | Current Version | Purpose | Notes |
|---------|----------------|---------|-------|
| `h3` (Nitro built-in) | bundled | `setCookie`, `parseCookies`, `readBody`, `proxyRequest` | All cookie operations use this |
| `qs` | 6.14.0 (direct dep already) | Query string serialization in `useSessionClient` | Already in `vite.optimizeDeps.include` |
| `$fetch` / `ofetch` | bundled with Nuxt | HTTP client for new `useSessionClient` | Replaces `useStrapiClient()` |
| `useState` | Nuxt built-in | `useSessionUser` state | Replaces `useStrapiUser` |

**No `npm install` required.** All needed APIs are in the existing stack. `qs` is already a direct dependency in `apps/website/package.json` (v6.14.0). The `strapi: {}` block stays in `nuxt.config.ts` after module removal — Strapi middleware in `apps/strapi` still reads `runtimeConfig.strapi`.

**Remove from `package.json`:**
```bash
pnpm remove @nuxtjs/strapi --filter website
```

**Remove from `nuxt.config.ts` modules array:** `"@nuxtjs/strapi"` entry only. Keep the `strapi: {}` config block.

---

## Architecture Patterns

### New Server Routes (Nitro) — the load-bearing change

These routes INTERCEPT Strapi auth responses and set the httpOnly cookie before returning to the client. The generic catch-all cannot do this because it pipes the response stream directly.

```
server/api/
├── [...].ts                    MODIFY — cookie → Authorization injection
├── auth/
│   ├── login.post.ts           NEW — intercept /auth/local, set httpOnly cookie
│   ├── verify-code.post.ts     NEW — intercept verify-code, set httpOnly cookie
│   ├── google-one-tap.post.ts  NEW — intercept one-tap, set httpOnly cookie
│   ├── google-oauth/
│   │   └── callback.get.ts     NEW — Google OAuth popup callback (replaces Strapi custom route redirect)
│   └── logout.post.ts          NEW — clear httpOnly cookie server-side
├── dev-login.post.ts           UNCHANGED
└── images/[...].ts             UNCHANGED
```

**Why the catch-all cannot handle auth:** `proxyRequest()` streams the Strapi response body. To extract `{ jwt }` and call `setCookie()`, we must consume the body with `$fetch()` ourselves. Dedicated routes own these auth paths before the catch-all matches.

**Why the catch-all must be modified:** Currently at lines 85-89 it reads the `waldo_jwt` cookie and sets `Cookie: waldo_jwt=<value>` in the Strapi-bound request. Strapi does not authenticate via a Cookie header — it expects `Authorization: Bearer <jwt>`. This means **the catch-all today does not actually authenticate Strapi requests from the proxy.** It works currently only because the `@nuxtjs/strapi` client also sends `Authorization` from the client. After module removal the proxy must inject it.

### Proxy Modification Pattern

```typescript
// server/api/[...].ts — the ONLY change to the proxy body
const cookies = parseCookies(event);
const jwt = cookies["waldo_jwt"];
if (jwt) {
  headers["Authorization"] = `Bearer ${jwt}`;
  // Remove the old: headers["Cookie"] = `waldo_jwt=${jwt}`;
}
```

The existing `authHeader` forwarding (lines 75-78) must also be removed — the proxy now owns Authorization, not the client.

### New Server Route Pattern

```typescript
// Pattern for all auth intercept routes (login, verify-code, google-one-tap)
// Source: verified against Nitro h3 docs + dev-login.post.ts in this repo
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = process.env.API_URL || "http://localhost:1337";
  const body = await readBody(event);

  // Forward to Strapi directly (server-side, no proxy needed)
  const strapiResponse = await $fetch<{ jwt: string; user: unknown }>(
    `${apiUrl}/api/auth/local`,
    {
      method: "POST",
      body,
      headers: { "X-Proxy-Key": config.proxySecretWeb as string },
    },
  );

  const { jwt, user } = strapiResponse;

  setCookie(event, "waldo_jwt", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",        // lax required: OAuth redirect flows are top-level navigations
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 604800,         // 7 days — matches SESSION_MAX_AGE in .env.example
  });

  // Return user without jwt — client never sees the token
  return { user };
});
```

**`sameSite: "lax"` is mandatory** — `"strict"` would drop the cookie on the OAuth callback redirect from Google/Facebook (cross-origin top-level navigation), breaking OAuth flows.

### Logout Route Pattern

```typescript
// server/api/auth/logout.post.ts
export default defineEventHandler((event) => {
  setCookie(event, "waldo_jwt", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 0,  // Immediate expiry
  });
  return { success: true };
});
```

### Google OAuth Popup Flow — architectural redesign required

The current flow:
1. `loginWithPopup("google")` → `$fetch('/api/auth/google/initiate')` → Strapi returns `{ url }` (Google OAuth URL)
2. Opens popup → Google auth → Strapi's `auth-google.callback` → `popupResponse()` sends `{ type: "google-oauth-success", jwt }` via BroadcastChannel
3. Client receives `jwt` from BroadcastChannel → calls `setToken(jwt)` → impossible with httpOnly

The redesign: The Strapi `auth-google.callback` is a CUSTOM Strapi endpoint (not the standard `connect/google/callback`). It sends `{ jwt }` via BroadcastChannel. Under httpOnly, client JS cannot do anything with a JWT. The BroadcastChannel payload must change to a session token or success signal, and the httpOnly cookie must be set server-side.

**Recommended approach:** Add a new Nitro route `server/api/auth/google-oauth/callback.get.ts` that:
1. Receives the `code` query param from Google (same as the Strapi `auth-google.callback` does)
2. Calls Strapi's existing `POST /api/auth/google/initiate` → no, see below

Actually the custom Strapi callback is at `FRONTEND_URL/api/auth/google-oauth/callback` (set as `redirectUri` in the Strapi controller). Since `FRONTEND_URL` is the website, the callback hits Nitro. Currently the catch-all forwards it to Strapi at `apiUrl/api/auth/google-oauth/callback`. With the new architecture:

- Create `server/api/auth/google-oauth/callback.get.ts` as a dedicated handler (matches before catch-all)
- This handler forwards the `code` param to Strapi's custom callback endpoint, receives `{ jwt }`, sets the httpOnly cookie, then renders the popup-close HTML (BroadcastChannel + `window.close()`) with `{ type: "google-oauth-success" }` — NO jwt in the payload
- `LoginWithGoogle.vue` receives `{ type: "google-oauth-success" }` via BroadcastChannel → removes `setToken(jwt)` call → calls `fetchUser()` directly (proxy reads httpOnly cookie) → proceeds with navigation

```typescript
// server/api/auth/google-oauth/callback.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = process.env.API_URL || "http://localhost:1337";
  const frontendUrl = process.env.BASE_URL || "http://localhost:3000";
  const query = getQuery(event);
  const code = query.code as string;

  if (!code) {
    // Render popup-close HTML with error
    setHeader(event, "Content-Type", "text/html");
    return renderPopupHtml({ type: "google-oauth-error" }, frontendUrl);
  }

  try {
    // Call Strapi custom auth-google callback to exchange code for jwt
    const result = await $fetch<{ jwt?: string; error?: string }>(
      `${apiUrl}/api/auth/google-oauth/callback?code=${encodeURIComponent(code)}`,
      { headers: { "X-Proxy-Key": config.proxySecretWeb as string } },
    );

    if (!result.jwt) throw new Error("No JWT from Strapi callback");

    setCookie(event, "waldo_jwt", result.jwt, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined, maxAge: 604800,
    });

    setHeader(event, "Content-Type", "text/html");
    return renderPopupHtml({ type: "google-oauth-success" }, frontendUrl);
  } catch {
    setHeader(event, "Content-Type", "text/html");
    return renderPopupHtml({ type: "google-oauth-error" }, frontendUrl);
  }
});
```

**NOTE:** The Strapi `auth-google.callback` currently calls `popupResponse()` which returns HTML. To make it callable from Nitro as a JSON API, it needs to accept a `?json=true` param and return `{ jwt }` instead of HTML — OR a separate Strapi endpoint that just exchanges the code for JWT. Assess during implementation whether to: (A) add a `?json=true` mode to the Strapi callback, or (B) replicate the code-exchange logic in the Nitro handler using `google-auth-library`. Option A is simpler (one-line Strapi change).

**Alternative if Option A is too invasive:** The Nitro `google-oauth/callback.get.ts` route handles the Google OAuth code exchange natively using the same `google-auth-library` that Strapi uses, then calls the `googleOneTapService.findOrCreateUser()` equivalently via a Strapi endpoint. This avoids Strapi changes but duplicates logic.

### Facebook OAuth Redirect Flow — simpler redesign

`login/facebook.vue` calls `authenticateProvider("facebook", access_token)`. This calls Strapi's standard `/auth/facebook/callback?access_token=<token>` which goes through the proxy normally. The fix: instead of calling `authenticateProvider`, create `server/api/auth/facebook/callback.get.ts` that receives `?access_token=`, calls Strapi, sets the httpOnly cookie, and redirects to a page that calls `fetchUser()` and navigates.

`login/google.vue` uses the same pattern via standard Strapi OAuth connect (`/auth/google/callback?access_token=`). Same server route approach.

### New Composables

#### useSessionUser (identical to Phase 109)
```typescript
// app/composables/useSessionUser.ts
import type { User } from "@/types/user";
export const useSessionUser = () => useState<User | null>("session_user", () => null);
```

#### useSessionAuth — fundamentally different from Phase 109
```typescript
// app/composables/useSessionAuth.ts
import type { User } from "@/types/user";
export const useSessionAuth = () => {
  const user = useSessionUser();

  const fetchUser = async (): Promise<User | null> => {
    try {
      // Calls proxy /api/users/me — proxy injects Authorization from httpOnly cookie
      // On SSR: useApiClient adds x-vercel-protection-bypass automatically
      const client = useApiClient();
      const result = await client<User>("users/me", {
        params: { populate: ["role", "commune", "region", "business_region", "business_commune"] },
      });
      user.value = result;
      return result;
    } catch {
      user.value = null;
      return null;
      // CRITICAL: do NOT call any token-clearing here — there is no client token
    }
  };

  const login = async (identifier: string, password: string) => {
    // Calls new Nitro route that sets httpOnly cookie
    const result = await $fetch<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: { identifier, password },
    });
    user.value = result.user;
    return result;
  };

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
  };

  // No setToken — httpOnly means client can never set the cookie
  // No authenticateProvider — handled by server routes

  const getProviderAuthenticationUrl = (provider: string): string => {
    const config = useRuntimeConfig();
    // getProviderAuthenticationUrl from @nuxtjs/strapi resolves to BASE_URL/api/connect/<provider>
    // With module removed, replicate directly:
    return `${config.public.baseUrl}/api/connect/${provider}`;
  };

  return { fetchUser, login, logout, getProviderAuthenticationUrl };
};
```

#### useSessionClient — minimal ofetch wrapper
```typescript
// app/composables/useSessionClient.ts
import qs from "qs";
export const useSessionClient = () => {
  const config = useRuntimeConfig();
  return $fetch.create({
    baseURL: (config.public.baseUrl as string) + "/api",
    params: { serialize: (params: Record<string, unknown>) => qs.stringify(params) },
  });
};
```

### Session Startup Plugin (replaces @nuxtjs/strapi plugin)

```typescript
// app/plugins/session.ts
export default defineNuxtPlugin(async () => {
  const user = useSessionUser();
  if (user.value) return;
  const { fetchUser } = useSessionAuth();
  // SSR: proxy is reachable, cookie forwarded via useRequestHeaders in useApiClient
  // No token guard needed — fetchUser is unconditional, 401 = anonymous
  try {
    await fetchUser();
  } catch {
    // Strapi unavailable — leave user null, hydration will retry
  }
});
```

**This eliminates the logout bug.** The old plugin called `setToken(null)` on 401. The new `fetchUser()` catches errors and sets `user.value = null` — no cookie side effects.

### SSR Self-Call — Cookie Forwarding

SSR code running inside Nitro cannot read the browser's cookies unless they are explicitly forwarded. `useApiClient` must forward the incoming request's cookies when running server-side:

```typescript
// app/composables/useApiClient.ts — SSR section update
if (import.meta.server) {
  // Forward cookies so the proxy can read waldo_jwt and inject Authorization
  const cookieHeader = useRequestHeaders(["cookie"]).cookie;
  if (cookieHeader) options.headers = { ...options.headers, cookie: cookieHeader };

  // Bypass Vercel Deployment Protection on staging/production self-calls
  const bypass = useRuntimeConfig().vercelBypassSecret as string | undefined;
  if (bypass) {
    options.headers = { ...options.headers, "x-vercel-protection-bypass": bypass };
  }
}
```

`VERCEL_AUTOMATION_BYPASS_SECRET` must be exposed via `runtimeConfig` (private key, not `.public`) — confirmed present in `.env.example` (line 16: `# VERCEL_AUTOMATION_BYPASS_SECRET=`).

### Simplified Middleware Guards

All three middleware files currently check `useStrapiToken()` before calling `fetchUser()`. With httpOnly, the token is unreadable. Guards must check user state only:

```typescript
// BEFORE (auth.ts, onboarding-guard.global.ts, dashboard-guard.global.ts)
const token = useStrapiToken();
if (token.value) { await fetchUser(); }

// AFTER
const user = useSessionUser();
if (!user.value && import.meta.client) {
  const { fetchUser } = useSessionAuth();
  await fetchUser(); // No token guard — just call it. 401 = anonymous.
}
```

The SSR fail-open comment in `auth.ts` (explaining why SSR is skipped) becomes obsolete with the new architecture: SSR can now safely call `fetchUser()` because the proxy is the only exit and the session plugin already ran. However, the SSR skip can remain as a performance optimization (avoid double fetch per request).

### Middleware: `dashboard-guard.global.ts`

The existing check `if (!token.value) return;` that prevents anonymous users from triggering a fetchUser round-trip must change to check `useSessionUser()` instead. Token value is always null client-side.

### Upload Components — Remove Manual Authorization Headers

`UploadMedia.vue` and `useImage.ts` (`uploadFiles()`) build `Authorization: Bearer ${token.value}` headers for raw `fetch()` calls to `/api/upload` and `/api/ads/upload`. With httpOnly, `token.value` is null — but these calls go through the Nitro proxy anyway, and the proxy now injects `Authorization` from the httpOnly cookie. Remove the manual header construction entirely.

```typescript
// BEFORE (UploadMedia.vue, useImage.ts)
const token = useStrapiToken();
const headers = { Authorization: `Bearer ${token.value}` };
const response = await fetch(uploadUrl, { method: "POST", body: formData, headers });

// AFTER
const response = await fetch(uploadUrl, { method: "POST", body: formData });
// Proxy reads waldo_jwt httpOnly cookie and injects Authorization automatically
```

### useApiClient.ts — Minimal Changes

Currently at line ~10: `const strapiClient = useStrapiClient()`. Replace with `useSessionClient()`. Remove the SSR `X-Proxy-Key` injection (proxy handles it now — it's injected inside the catch-all, not in useApiClient). Keep the reCAPTCHA injection logic unchanged.

### Google One Tap Plugin — Remove setToken

```typescript
// BEFORE (plugins/google-one-tap.client.ts)
const result = await client<{ jwt: string; user: unknown }>(...);
setToken(result.jwt);
reloadNuxtApp();

// AFTER (new Nitro route /api/auth/google-one-tap sets the httpOnly cookie)
await client("auth/google-one-tap", { method: "POST", body: { credential: response.credential } });
// Server route already set the cookie — just reload to trigger session plugin
reloadNuxtApp();
```

The `client` call goes to `/api/auth/google-one-tap` which matches the new dedicated Nitro route, not the catch-all. The Nitro route sets the httpOnly cookie and returns `{ user }`. Plugin removes `setToken` import entirely.

### FormVerifyCode.vue — Remove setToken + remove cache-bust

```typescript
// BEFORE
const { setToken, fetchUser } = useStrapiAuth();
setToken(responseRaw.jwt);  // set cookie client-side
// nuxt._cookies cache-bust (Phase 109 pitfall #4) — no longer needed
await fetchUser();

// AFTER
const { fetchUser } = useSessionAuth();
// Server route /api/auth/verify-code already set the httpOnly cookie
await fetchUser();
```

The `useStrapiAuth` import (and its `nuxt._cookies` cache-bust pattern from Phase 109) is removed. The `nuxt._cookies` issue was specific to the client-readable cookie — httpOnly cookies don't populate `nuxt._cookies` and the proxy reads directly via `parseCookies()`.

### LoginWithGoogle.vue — BroadcastChannel redesign

```typescript
// BEFORE
const { jwt } = await loginWithPopup("google");
setToken(jwt);
await fetchUser();

// AFTER
await loginWithPopup("google"); // popup returns no jwt; cookie set server-side
await fetchUser();              // reads from httpOnly cookie via proxy
```

`useProviders.ts` changes `loginWithPopup` to NOT return `{ jwt }`. It expects `{ type: "google-oauth-success" }` from BroadcastChannel (no jwt field).

### login/google.vue and login/facebook.vue — Server route replaces authenticateProvider

```typescript
// BEFORE
const { authenticateProvider } = useStrapiAuth();
const response = await authenticateProvider("google", String(route.query.access_token || ""));

// AFTER — page is loaded after server route sets cookie via redirect
// The page only needs to call fetchUser() and navigate
const { fetchUser } = useSessionAuth();
await fetchUser();
// Proceed with navigation — cookie was set before this page loaded
```

These pages become thin clients. The actual token exchange happens in `server/api/auth/google/callback.get.ts` and `server/api/auth/facebook/callback.get.ts` via a server-side redirect chain.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie read in Nitro | Custom cookie parser | `parseCookies(event)` from h3 | Built-in, handles encoding/multi-cookie |
| Cookie write in Nitro | Manual Set-Cookie header string | `setCookie(event, name, value, options)` from h3 | Handles `SameSite`, `HttpOnly`, `Secure`, `Max-Age` encoding |
| Clear httpOnly cookie | `document.cookie = ...max-age=0` | `setCookie(event, name, "", { maxAge: 0, httpOnly: true })` in server route | Client JS cannot modify httpOnly cookies |
| SSR $fetch baseURL | Custom fetch wrapper | `$fetch.create({ baseURL })` | ofetch built-in |
| Query string serialization | Custom encoder | `qs.stringify` (already dep) | Handles nested objects, arrays with Strapi format |
| Proxy request forwarding | Custom fetch loop | `proxyRequest(event, targetUrl, { headers })` | Streams body, preserves method/headers |

**Key insight:** The h3 `setCookie` API used by `dev-login.post.ts` already in this codebase (verified at `/home/gab/Code/waldo-project/apps/website/server/api/dev-login.post.ts:20`) is the exact pattern for all new auth routes. Copy that pattern, change the cookie name to `waldo_jwt` and add `httpOnly: true`.

---

## Common Pitfalls

### Pitfall 1: `fetchUser` guarded by `token.value` check
**What goes wrong:** All three middleware files and the old `useStrapiAuth.fetchUser` gate on `if (token.value) { fetchUser() }`. After httpOnly, `useStrapiToken()` (or any cookie ref) returns null client-side always. `fetchUser()` never runs → users appear logged out on every page load.
**Why it happens:** The old guard assumed "no readable token = not logged in." With httpOnly that assumption is inverted: "unreadable token = may still be logged in."
**How to avoid:** Remove ALL `token.value` guards. `fetchUser()` is now unconditional. A 401 from the proxy means "anonymous" — set `user.value = null` silently.
**Warning signs:** Guards returning early, users bounced to login after refresh.

### Pitfall 2: `setToken(null)` side effect in fetchUser error handling
**What goes wrong:** If any `fetchUser` implementation calls a token-clearing function on error (the original `@nuxtjs/strapi` bug), it will try to write the httpOnly cookie client-side — which silently fails. Worse: if using `useCookie("waldo_jwt")` in a non-httpOnly mode anywhere, it would write a JS-readable cookie named `waldo_jwt` alongside the httpOnly one, causing split-brain.
**How to avoid:** `fetchUser` in `useSessionAuth` catches errors and does `user.value = null` only. No token operations.

### Pitfall 3: SSR self-calls arrive at the proxy without cookies
**What goes wrong:** A page with `useAsyncData` that calls `useApiClient` from SSR sends a bare `$fetch` to `BASE_URL/api/`. Nitro self-calls do not automatically include the incoming request's cookies. The proxy finds no `waldo_jwt` cookie → no Authorization injected → 401 from Strapi → SSR renders logged-out state → hydration mismatch.
**How to avoid:** `useApiClient` must use `useRequestHeaders(["cookie"])` on SSR to forward the browser's cookie jar. Already partially done (it added `X-Proxy-Key` on SSR); extend to also forward `cookie`.
**Warning signs:** Pages that work on client-side navigation but fail on refresh/direct URL load.

### Pitfall 4: `authHeader` forwarding in the catch-all proxy
**What goes wrong:** The current catch-all forwards any `Authorization` header from the incoming client request (lines 75-78 of `server/api/[...].ts`). After module removal, no client sends `Authorization` anymore. But if a rogue client or a test sends `Authorization: Bearer <tampered_token>`, the proxy would forward it and it would override the httpOnly cookie logic.
**How to avoid:** Remove the `authHeader` forwarding block entirely. The proxy only injects Authorization from the httpOnly cookie, never from client-supplied headers.
**Warning signs:** Auth bypass in tests if stubs still inject Authorization headers.

### Pitfall 5: Google popup sends `jwt` through BroadcastChannel — do not forward it
**What goes wrong:** If `renderPopupHtml` includes `jwt` in the BroadcastChannel payload (to preserve backward compat), `LoginWithGoogle.vue` may try to call `setToken(jwt)` which does nothing client-side but leaves a confusing no-op in the code.
**How to avoid:** The popup HTML rendered by the Nitro callback must send `{ type: "google-oauth-success" }` with NO `jwt` field. `LoginWithGoogle.vue` must remove `setToken` entirely — it doesn't even import `useSessionAuth`'s `setToken` because `useSessionAuth` has no `setToken`.

### Pitfall 6: `sameSite: "strict"` breaks OAuth redirect flows
**What goes wrong:** After Google/Facebook redirect back to `BASE_URL/login/google?access_token=...`, the browser initiates a cross-origin top-level navigation. `sameSite: "strict"` drops the cookie on cross-origin redirects. Users arrive at the callback page with no `waldo_jwt` cookie → proxy sees no JWT → 401.
**How to avoid:** Use `sameSite: "lax"`. Under `lax`, the cookie IS sent on top-level GET navigations (OAuth redirects are GET). Only `sameSite: "strict"` drops cookies on cross-origin navigations.
**Note:** `lax` still blocks CSRF on cross-site POST/PUT/DELETE — mutations are protected. The existing `X-Recaptcha-Token` custom header on POST/PUT/DELETE provides an additional CSRF barrier (custom headers cannot be sent cross-origin without CORS preflight).

### Pitfall 7: `nuxt._cookies` cache-bust no longer needed (but don't confuse with Pitfall 1)
**What goes wrong:** Phase 109 `FormVerifyCode.vue` added a `nuxt._cookies[cookieName] = useCookie(cookieName)` line to bust the Nuxt cookie cache after `setToken`. With httpOnly, there is no `useCookie` reference for `waldo_jwt` on the client. The cache-bust line must be removed, not preserved.
**Why it happens:** `@nuxtjs/strapi`'s `setToken` used `useCookie()` which has a Nuxt SSR cache. httpOnly cookies never enter `nuxt._cookies`. `parseCookies()` in Nitro reads the actual cookie header directly.

### Pitfall 8: The catch-all proxy currently does NOT authenticate Strapi requests
**What goes wrong:** The existing `headers["Cookie"] = \`waldo_jwt=\${jwt}\`` (lines 85-89) is forwarded to Strapi, but Strapi's users-permissions middleware authenticates via `Authorization: Bearer`, not Cookie. This means currently, Strapi API calls from the proxy are ONLY authenticated because `@nuxtjs/strapi`'s `$fetch` also sends `Authorization: Bearer <token>`. After module removal and without the proxy fix, ALL authenticated API calls will return 401.
**How to avoid:** The proxy change (Cookie → Authorization Bearer injection) must be implemented BEFORE removing the module in integration testing.

### Pitfall 9: Strapi `auth-google.callback` returns HTML, not JSON
**What goes wrong:** If the Nitro `server/api/auth/google-oauth/callback.get.ts` calls Strapi's custom callback with `$fetch()`, it receives HTML (the `popupResponse` output), not `{ jwt }`. `$fetch` will parse this as a string, not as JSON, and `result.jwt` will be undefined.
**How to avoid:** Either (A) add `?json=true` to the Strapi custom callback to return `{ jwt }` when called programmatically, or (B) implement the Google code-exchange directly in Nitro using `google-auth-library` (already in `apps/strapi/package.json`). Assess Strapi change feasibility during Wave 1.

---

## Complete Surface Area Inventory

### Files requiring LOGIC CHANGES (not just symbol rename)

| File | What Changes | Why |
|------|-------------|-----|
| `server/api/[...].ts` | Cookie → Authorization injection; remove authHeader forwarding | httpOnly means proxy owns Authorization |
| `app/composables/useApiClient.ts` | Replace `useStrapiClient()` with `useSessionClient()`; add cookie forwarding on SSR; remove X-Proxy-Key (proxy handles it) | Client no longer supplies auth header |
| `app/composables/useImage.ts` | Remove `useStrapiToken()` + manual Authorization header in `uploadFiles()` | Token unreadable; proxy injects it |
| `app/composables/useLogout.ts` | Replace `document.cookie = ...max-age=0` + `useStrapiAuth().logout()` with `$fetch('/api/auth/logout', { method: 'POST' })` | Client cannot clear httpOnly cookie |
| `app/composables/useProviders.ts` | Remove `getProviderAuthenticationUrl` from useStrapiAuth; replicate inline; `loginWithPopup` no longer returns `{ jwt }` | Module gone; BroadcastChannel payload changes |
| `app/components/FormVerifyCode.vue` | Remove `setToken(responseRaw.jwt)` + nuxt._cookies cache-bust | Server route sets cookie; no client token ops |
| `app/components/LoginWithGoogle.vue` | Remove `setToken(jwt)` call; don't destructure jwt from loginWithPopup | Server route sets cookie |
| `app/components/UploadMedia.vue` | Remove `useStrapiToken()` + Authorization header construction | Proxy injects auth |
| `app/middleware/auth.ts` | Replace `useStrapiToken()` check with unconditional `fetchUser()` | Token unreadable |
| `app/middleware/onboarding-guard.global.ts` | Replace `if (!token.value) return` with user-based check | Token unreadable |
| `app/middleware/dashboard-guard.global.ts` | Replace `if (!token.value) return navigateTo('/login')` | Token unreadable |
| `app/pages/login/google.vue` | Remove `authenticateProvider`; page reads user from session (server route sets cookie before page loads) | Server route handles exchange |
| `app/pages/login/facebook.vue` | Same as google.vue | Same reason |
| `app/plugins/google-one-tap.client.ts` | Remove `setToken(result.jwt)`; remove `useStrapiAuth` import; call `fetchUser()` after API call | Server route sets cookie |

### Files requiring MECHANICAL RENAME only (useStrapiUser → useSessionUser, useStrapiAuth → useSessionAuth)

These 45+ files only use `useStrapiUser()` or `useStrapiAuth().fetchUser()` — no token operations:

- All pages: `anunciar/resumen.vue`, `pro/gracias.vue`, and all pages using `useStrapiUser()` as auth guard
- `app/composables/useUser.ts`
- `app/composables/useGoogleOneTap.ts`
- `app/plugins/sentry.ts`
- `app/components/UploadAvatar.vue`
- `app/components/UploadCover.vue`
- ~43 additional files with `useStrapiUser()` only

### Test Files Requiring Update

| Test File | Current Mock | New Mock |
|-----------|-------------|----------|
| `tests/stubs/imports.stub.ts` | Exports `useStrapiAuth`, `useStrapiClient`, `useStrapiUser` | Remove these; add `useSessionUser`, `useSessionAuth` exports |
| `tests/composables/useApiClient.test.ts` | Mocks `useStrapiClient` from `#imports` | Mock `useSessionClient` from composable path |
| `tests/composables/useGoogleOneTap.test.ts` | Mocks `useStrapiUser` from `#imports` | Mock `useSessionUser` |
| `tests/composables/useLogout.test.ts` | Mocks `useStrapiAuth.logout` | Mock `$fetch` call to `/api/auth/logout` |
| `tests/middleware/dashboard-guard.test.ts` | Stubs `useStrapiToken`, `useStrapiUser`, `useStrapiAuth` | Stub `useSessionUser`, `useSessionAuth` (no token stub) |
| `tests/plugins/google-one-tap.test.ts` | Mocks `useStrapiAuth.setToken` + `useStrapiUser` | Remove `setToken` mock; mock `useSessionUser`, `fetchUser` |

---

## Code Examples

### Setting httpOnly cookie in Nitro (verified against dev-login.post.ts in this repo)
```typescript
setCookie(event, "waldo_jwt", jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  domain: process.env.COOKIE_DOMAIN || undefined,
  maxAge: 604800,
});
```

### Reading httpOnly cookie in Nitro proxy (verified against [...].ts lines 85-89)
```typescript
const cookies = parseCookies(event);
const jwt = cookies["waldo_jwt"];
if (jwt) {
  headers["Authorization"] = `Bearer ${jwt}`;
}
```

### Forwarding cookies in SSR useApiClient
```typescript
// Inside useApiClient, SSR branch:
const { cookie } = useRequestHeaders(["cookie"]);
if (cookie) fetchOptions.headers = { ...fetchOptions.headers, cookie };
```

### Minimal useSessionUser
```typescript
import type { User } from "@/types/user";
export const useSessionUser = () =>
  useState<User | null>("session_user", () => null);
```

### Popup BroadcastChannel — send success WITHOUT jwt
```typescript
// In Nitro callback handler (after setting httpOnly cookie):
const json = JSON.stringify({ type: "google-oauth-success" }); // no jwt field
const html = `<!DOCTYPE html><html><head><script data-cfasync="false">
(function(){var d=${json};
try{var c=new BroadcastChannel('google-oauth');c.postMessage(d);c.close();}catch(e){}
if(window.opener){window.opener.postMessage(d,'${frontendUrl}');}
window.close();setTimeout(function(){window.location.href='${frontendUrl}';},200);
})();
</script></head><body></body></html>`;
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (with `@nuxt/test-utils`) |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `cd apps/website && pnpm vitest run --reporter=verbose` |
| Full suite command | `pnpm turbo test --filter=website` |

### Phase Requirements → Test Map

| Behavior | Test Type | Command |
|----------|-----------|---------|
| `useSessionUser` state initializes null | unit | `vitest run tests/composables/useSessionUser.test.ts` |
| `useSessionAuth.fetchUser` sets user on success | unit | `vitest run tests/composables/useSessionAuth.test.ts` |
| `useSessionAuth.fetchUser` sets null on 401, no token side effect | unit | same |
| `useApiClient` forwards cookie header on SSR | unit | `vitest run tests/composables/useApiClient.test.ts` |
| `useApiClient` injects reCAPTCHA token on POST | unit | same |
| `dashboard-guard` redirects to login when no user | unit | `vitest run tests/middleware/dashboard-guard.test.ts` |
| `useLogout` calls POST /api/auth/logout | unit | `vitest run tests/composables/useLogout.test.ts` |
| `google-one-tap` plugin does not call setToken | unit | `vitest run tests/plugins/google-one-tap.test.ts` |

### Wave 0 Gaps (test files that need creation or significant update)
- [ ] `tests/composables/useSessionUser.test.ts` — new file, covers useState initialization
- [ ] `tests/composables/useSessionAuth.test.ts` — new file, covers fetchUser 401 handling (critical)
- [ ] `tests/stubs/imports.stub.ts` — remove useStrapiX exports, add useSessionX
- [ ] `tests/composables/useApiClient.test.ts` — update mock from useStrapiClient to useSessionClient
- [ ] `tests/composables/useLogout.test.ts` — update to mock $fetch instead of useStrapiAuth.logout
- [ ] `tests/middleware/dashboard-guard.test.ts` — remove token stubs, add user stubs
- [ ] `tests/plugins/google-one-tap.test.ts` — remove setToken assertion

---

## Open Questions

1. **Strapi `auth-google.callback` returns HTML — how to call it from Nitro?**
   - What we know: The handler calls `popupResponse()` which sets `ctx.type = 'html'` and returns HTML.
   - What's unclear: Whether adding `?json=true` to return `{ jwt }` instead is safe (it's a custom endpoint, not users-permissions core).
   - Recommendation: During Wave 1, add `if (ctx.query.json) { ctx.body = { jwt }; return; }` to the Strapi callback before calling `popupResponse`. One-line change, fully backward-compatible.

2. **Facebook `authenticateProvider` path — does it use standard Strapi connect or custom route?**
   - What we know: `login/facebook.vue` calls `authenticateProvider("facebook", access_token)` which calls Strapi `/auth/facebook/callback?access_token=` through the proxy. The proxy does NOT exclude facebook routes.
   - What's unclear: Whether Facebook OAuth still works via Strapi's standard users-permissions connect.
   - Recommendation: Create `server/api/auth/facebook/callback.get.ts` that receives `?access_token=`, calls Strapi directly for the jwt, sets httpOnly cookie, redirects to `/login/facebook` (without access_token). `login/facebook.vue` becomes a splash page that calls `fetchUser()`.

3. **`VERCEL_AUTOMATION_BYPASS_SECRET` in production vs. staging**
   - What we know: Confirmed present in `.env.example` (line 16, commented). SSR self-calls on staging need this header.
   - What's unclear: Whether it's configured in Vercel's production environment variables (cannot verify from repo alone).
   - Recommendation: Add a research note in Wave 0 to confirm via `vercel env ls --environment=production` before deploying. The runtimeConfig key `vercelBypassSecret` must be added as a private (non-public) env var.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `@nuxtjs/strapi` module manages session | Custom composables + httpOnly cookie | Eliminates logout bug; XSS-immune |
| Client JS reads JWT from `useStrapiToken()` | No client JS token access | Physical enforcement of proxy centralization |
| `setToken(jwt)` client-side on login | Nitro route returns `Set-Cookie: waldo_jwt; HttpOnly` | No session state in client JS |
| Proxy forwards `Cookie: waldo_jwt=<value>` | Proxy injects `Authorization: Bearer <jwt>` | Correct Strapi auth header |
| OAuth callback excluded from proxy | Nitro handler owns OAuth callback, sets cookie | Token never exposed to client JS |

**Deprecated/replaced:**
- `useStrapiUser` — replaced by `useSessionUser`
- `useStrapiAuth` — replaced by `useSessionAuth` (fundamentally different: no setToken, no authenticateProvider client-side)
- `useStrapiToken` — REMOVED entirely (no client token concept)
- `useStrapiClient` — replaced by `useSessionClient`
- `@nuxtjs/strapi` startup plugin — replaced by `app/plugins/session.ts`
- `runtimeConfig.strapi.url = API_URL` SSR hack — removed (SSR goes through proxy with bypass header)

---

## Sources

### Primary (HIGH confidence)
- Live source files: `apps/website/server/api/[...].ts` — proxy implementation verified line by line
- Live source files: `apps/strapi/src/api/auth-google/controllers/auth-google.ts` — custom OAuth controller verified
- Live source files: `apps/website/app/components/LoginWithGoogle.vue`, `useProviders.ts` — popup flow verified
- Live source files: `apps/website/server/api/dev-login.post.ts` — setCookie pattern verified
- `.planning/phases/109-*/109-RESEARCH.md` — Phase 109 patterns (useSessionUser/Auth/Client implementations)
- `apps/website/.env.example` — VERCEL_AUTOMATION_BYPASS_SECRET presence confirmed line 16

### Secondary (MEDIUM confidence)
- Nitro h3 docs: `setCookie`, `parseCookies`, `proxyRequest` APIs — verified consistent with existing usage in repo
- `@nuxtjs/strapi/dist/runtime/composables/useStrapiAuth.js` — inspected for `getProviderAuthenticationUrl` and `authenticateProvider` implementations

### Tertiary (LOW confidence)
- `sameSite: "lax"` behavior for top-level OAuth redirects — standard browser behavior, well-documented, but test in staging before going to production

---

## Metadata

**Confidence breakdown:**
- Surface area inventory: HIGH — verified via grep, 54/30/5/3 occurrences confirmed
- Architecture patterns: HIGH — derived from reading live code, not assumptions
- OAuth popup flow redesign: MEDIUM — the Strapi callback HTML-vs-JSON gap is an open question requiring a one-line Strapi change
- Proxy Authorization injection: HIGH — verified that Strapi expects Bearer header, not Cookie header
- CSRF risk with sameSite: lax: HIGH — well-understood browser spec; reCAPTCHA provides additional barrier

**Research date:** 2026-06-14
**Valid until:** 2026-07-14 (30 days; stack is stable Nuxt 4.1.3 + Strapi v5)
