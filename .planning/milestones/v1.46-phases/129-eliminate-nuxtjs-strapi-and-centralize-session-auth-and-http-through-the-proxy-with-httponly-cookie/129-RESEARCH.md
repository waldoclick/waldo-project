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

**Primary recommendation:** Write new server routes first (the login/verify-code/google-one-tap intercepts + the OAuth callback handlers + logout), then update the proxy cookie-to-Authorization injection, then replace composable usage across the 60 files, then simplify middleware guards, and finally update tests. This order ensures the auth foundation exists before any component migration attempts to use it.

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
├── [...].ts                        MODIFY — cookie → Authorization injection; remove client authHeader forwarding
├── auth/
│   ├── login.post.ts               NEW — intercept /auth/local, run reCAPTCHA, set httpOnly cookie
│   ├── verify-code.post.ts         NEW — intercept verify-code, run reCAPTCHA, set httpOnly cookie
│   ├── google-one-tap.post.ts      NEW — intercept one-tap, run reCAPTCHA, set httpOnly cookie
│   ├── google-oauth/
│   │   └── callback.get.ts         NEW — Google OAuth POPUP callback (sets cookie, sends BroadcastChannel)
│   ├── google/
│   │   └── callback.get.ts         NEW — Google OAuth REDIRECT callback (sets cookie, redirects)
│   ├── facebook/
│   │   └── callback.get.ts         NEW — Facebook OAuth callback (sets cookie, redirects)
│   └── logout.post.ts              NEW — clear httpOnly cookie server-side
├── dev-login.post.ts               UNCHANGED
└── images/[...].ts                 UNCHANGED
```

**Why the catch-all cannot handle auth:** `proxyRequest()` streams the Strapi response body. To extract `{ jwt }` and call `setCookie()`, we must consume the body with `$fetch()` ourselves. Dedicated routes match before the catch-all.

**Why the catch-all must be modified:** Currently at lines 85-89 it reads the `waldo_jwt` cookie and sets `Cookie: waldo_jwt=<value>` in the Strapi-bound request. Strapi does not authenticate via a Cookie header — it expects `Authorization: Bearer <jwt>`. This means **the catch-all today does not actually authenticate Strapi requests from the proxy.** It works currently only because the `@nuxtjs/strapi` client also sends `Authorization` from the client. After module removal the proxy must inject it.

### Two Parallel Google OAuth Flows — BOTH Are Live

Confirmed by reading source files:

**Flow A: Google popup** (`LoginWithGoogle.vue` → `useProviders.loginWithPopup`)
- Calls Strapi's custom `POST /api/auth/google/initiate` → receives `{ url }` (Google OAuth URL)
- Opens popup → Google auth → Strapi's `auth-google.callback` at `FRONTEND_URL/api/auth/google-oauth/callback`
- This callback currently forwards through the catch-all to Strapi → returns popup HTML with `{ jwt }` via BroadcastChannel
- **Needs:** `server/api/auth/google-oauth/callback.get.ts` — dedicated Nitro handler that intercepts before catch-all, sets httpOnly cookie, sends BroadcastChannel WITHOUT jwt

**Flow B: Google redirect** (`login/index.vue`, `registro/index.vue`, `LightboxLogin.vue` → `getProviderAuthenticationUrl("google")`)
- Redirects browser to `BASE_URL/api/connect/google` (excluded from proxy → goes directly to Strapi)
- Strapi redirects to `BASE_URL/api/connect/google/callback?access_token=<token>` (currently excluded from proxy → direct to Strapi)
- Strapi redirects to `BASE_URL/login/google?access_token=<token>`
- `login/google.vue` receives `access_token` in URL, calls `authenticateProvider("google", access_token)`
- **Needs:** `server/api/auth/google/callback.get.ts` — receives `?access_token=`, calls Strapi `/auth/google/callback`, sets httpOnly cookie, redirects to `/login/google` (clean URL)

**Facebook redirect** (`LoginWithFacebook.vue` → `useProviders.redirectToProvider("facebook")`)
- Same as Flow B but for Facebook
- **Needs:** `server/api/auth/facebook/callback.get.ts`

### reCAPTCHA — MUST Be Present in Every New POST Route

**Critical:** `isRecaptchaProtectedRoute` in `server/utils/recaptcha.ts` checks method only (line 78: `RECAPTCHA_PROTECTED_METHODS.has(method.toUpperCase())`), not path. Today the catch-all runs reCAPTCHA on ALL POST requests including `/auth/local`, `/auth/verify-code`, `/auth/google-one-tap`. The new dedicated `.post.ts` routes match BEFORE the catch-all — reCAPTCHA in the catch-all never runs for them.

Additionally, `useApiClient` injects `X-Recaptcha-Token` on POST/PUT/DELETE from the client. But `useSessionAuth.login` calls `$fetch('/api/auth/login')` directly (not through `useApiClient`) — the client half also drops the token.

**Every new auth POST route must call `verifyRecaptchaToken` itself:**

```typescript
// server/api/auth/login.post.ts (and verify-code, google-one-tap)
import { verifyRecaptchaToken } from "../../utils/recaptcha";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // reCAPTCHA — required; this route bypasses the catch-all's reCAPTCHA check
  if (config.recaptchaEnabled) {
    const recaptchaToken = getHeader(event, "x-recaptcha-token");
    await verifyRecaptchaToken(recaptchaToken, config.recaptchaSecretKey as string);
  }

  const apiUrl = process.env.API_URL || "http://localhost:1337";
  const body = await readBody(event);

  const strapiResponse = await $fetch<{ jwt: string; user: unknown }>(
    `${apiUrl}/api/auth/local`,
    {
      method: "POST",
      body,
      headers: { "X-Proxy-Key": config.proxySecretWeb as string },
    },
  );

  setCookie(event, "waldo_jwt", strapiResponse.jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",        // lax required: OAuth redirect flows are top-level navigations
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 604800,         // 7 days — matches SESSION_MAX_AGE in .env.example
  });

  return { user: strapiResponse.user };  // jwt never returned to client
});
```

**Rate limiting is preserved automatically.** `server/middleware/auth-rate-limit.ts` already covers `/api/auth/local`, `/api/auth/verify-code`, `/api/auth/google-one-tap` (confirmed in lines 12-19). Nitro middleware runs before ALL API routes including dedicated ones — no action needed.

**Client-side reCAPTCHA token injection.** When the client calls the new routes via `useApiClient`, the existing `X-Recaptcha-Token` injection in `useApiClient.ts` covers it automatically. When calling via raw `$fetch` (e.g. in `useSessionAuth.login`), the client must obtain and pass the token. Recommendation: `useSessionAuth.login` should call `useApiClient` rather than raw `$fetch`, or accept and forward a reCAPTCHA token param.

### Proxy Modification Pattern

```typescript
// server/api/[...].ts — changes needed
// 1. Remove: authHeader forwarding (lines 75-78) — proxy owns Authorization, never client
// 2. Replace Cookie injection with Authorization injection:
const cookies = parseCookies(event);
const jwt = cookies["waldo_jwt"];
if (jwt) {
  headers["Authorization"] = `Bearer ${jwt}`;
  // Remove: headers["Cookie"] = `waldo_jwt=${jwt}`;
}
```

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

### Google OAuth Popup Callback — architectural redesign required

The Strapi custom `auth-google.callback` handler (at `apps/strapi/src/api/auth-google/controllers/auth-google.ts`) currently:
1. Receives `?code=` from Google
2. Exchanges it for an id_token via `google-auth-library`
3. Calls `popupResponse()` which renders HTML with BroadcastChannel posting `{ type: "google-oauth-success", jwt }`

This HTML response is rendered at `FRONTEND_URL/api/auth/google-oauth/callback` — currently the catch-all forwards this to Strapi which returns the HTML. The browser renders it in the popup and the BroadcastChannel fires.

**With the new architecture,** `server/api/auth/google-oauth/callback.get.ts` must intercept BEFORE the catch-all:

```typescript
// server/api/auth/google-oauth/callback.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = process.env.API_URL || "http://localhost:1337";
  const frontendUrl = process.env.BASE_URL || "http://localhost:3000";
  const query = getQuery(event);
  const code = query.code as string;

  if (!code) {
    setHeader(event, "Content-Type", "text/html");
    return renderPopupHtml({ type: "google-oauth-error" }, frontendUrl);
  }

  try {
    // Call Strapi custom endpoint in JSON mode (requires ?json=true Strapi change — see Open Questions)
    const result = await $fetch<{ jwt: string }>(
      `${apiUrl}/api/auth/google-oauth/callback?code=${encodeURIComponent(code)}&json=true`,
      { headers: { "X-Proxy-Key": config.proxySecretWeb as string } },
    );

    setCookie(event, "waldo_jwt", result.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 604800,
    });

    setHeader(event, "Content-Type", "text/html");
    // NO jwt in payload — client receives success signal, calls fetchUser()
    return renderPopupHtml({ type: "google-oauth-success" }, frontendUrl);
  } catch {
    setHeader(event, "Content-Type", "text/html");
    return renderPopupHtml({ type: "google-oauth-error" }, frontendUrl);
  }
});

function renderPopupHtml(data: Record<string, unknown>, origin: string): string {
  const json = JSON.stringify(data);
  return `<!DOCTYPE html><html><head><script data-cfasync="false">
(function(){var d=${json};
try{var c=new BroadcastChannel('google-oauth');c.postMessage(d);c.close();}catch(e){}
if(window.opener){window.opener.postMessage(d,'${origin}');}
window.close();setTimeout(function(){window.location.href='${origin}';},200);
})();
</script></head><body></body></html>`;
}
```

### Google OAuth Redirect Callback

```typescript
// server/api/auth/google/callback.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = process.env.API_URL || "http://localhost:1337";
  const query = getQuery(event);
  const accessToken = query.access_token as string;

  if (!accessToken) return sendRedirect(event, "/login?error=oauth", 302);

  try {
    const result = await $fetch<{ jwt: string; user: unknown }>(
      `${apiUrl}/api/auth/google/callback?access_token=${encodeURIComponent(accessToken)}`,
      { headers: { "X-Proxy-Key": config.proxySecretWeb as string } },
    );

    setCookie(event, "waldo_jwt", result.jwt, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined, maxAge: 604800,
    });

    // Redirect to /login/google WITHOUT access_token — page calls fetchUser()
    return sendRedirect(event, "/login/google", 302);
  } catch {
    return sendRedirect(event, "/login?error=oauth", 302);
  }
});
```

**BUT WAIT — the proxy currently EXCLUDES `connect/google/callback`.** The current proxy redirects `BASE_URL/api/connect/google/callback` directly to Strapi (`apiUrl/api/connect/google/callback`). Strapi then redirects to `BASE_URL/login/google?access_token=<token>`. With the new Nitro callback route, we want the access_token to be received by Nitro, not by the `login/google.vue` page directly. Options:
- Keep the proxy exclude for `connect/google/callback` (Strapi redirects to `login/google?access_token=`) → the Nitro handler at `/api/auth/google/callback` is NOT on the redirect path
- Remove the proxy exclude → Nitro intercepts `/api/connect/google/callback`, extracts the access_token from Strapi's redirect response... this is complex

**Simpler approach:** Keep proxy exclusion for `connect/google/callback`. Instead, make `login/google.vue` a page-level handler that POSTs to a new server route `/api/auth/google/exchange` which accepts `{ access_token }` in body, calls Strapi, sets the httpOnly cookie, and returns `{ user }`. `login/google.vue` calls this route instead of `authenticateProvider()`.

```typescript
// server/api/auth/google/exchange.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = process.env.API_URL || "http://localhost:1337";
  const { access_token } = await readBody<{ access_token: string }>(event);

  const result = await $fetch<{ jwt: string; user: unknown }>(
    `${apiUrl}/api/auth/google/callback?access_token=${encodeURIComponent(access_token)}`,
    { headers: { "X-Proxy-Key": config.proxySecretWeb as string } },
  );

  setCookie(event, "waldo_jwt", result.jwt, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined, maxAge: 604800,
  });

  return { user: result.user };
});
```

Same for Facebook: `server/api/auth/facebook/exchange.post.ts`.

`login/google.vue` and `login/facebook.vue` become:
```typescript
// After redirect lands at /login/google?access_token=<token>
const result = await $fetch("/api/auth/google/exchange", {
  method: "POST",
  body: { access_token: route.query.access_token },
});
// Cookie is set. fetchUser() or use result.user directly for navigation logic.
```

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
      // On SSR: useApiClient forwards cookie header so proxy can read waldo_jwt
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

  const logout = async () => {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
  };

  // No setToken — httpOnly means client can never set the cookie
  // No authenticateProvider — handled by server routes (exchange.post.ts)
  // No login — callers use useApiClient to POST to /api/auth/login (gets reCAPTCHA from useApiClient)

  const getProviderAuthenticationUrl = (provider: string): string => {
    const config = useRuntimeConfig();
    // Replicates @nuxtjs/strapi's getProviderAuthenticationUrl:
    // returns config.strapi.url + config.strapi.prefix + /connect/<provider>
    // = BASE_URL/api/connect/<provider>
    return `${config.public.baseUrl}/api/connect/${provider}`;
  };

  return { fetchUser, logout, getProviderAuthenticationUrl };
};
```

#### useSessionClient — verified against Phase 109 implementation
```typescript
// app/composables/useSessionClient.ts
// Source: verified against Phase 109 RESEARCH.md useSessionClient implementation
import { stringify } from "qs";
import type { FetchOptions } from "ofetch";

export const useSessionClient = () => {
  const config = useRuntimeConfig();
  const baseURL = `${(config.public as { baseUrl: string }).baseUrl}/api`;

  return async <T = unknown>(url: string, fetchOptions: FetchOptions = {}): Promise<T> => {
    // qs.stringify is required for Strapi's nested filter/populate params.
    // $fetch's native serialization does not handle nested objects.
    if (fetchOptions.params) {
      const params = stringify(fetchOptions.params as object, { encodeValuesOnly: true });
      if (params) {
        url = `${url}?${params}`;
      }
      delete fetchOptions.params;
    }

    return $fetch<T>(url, {
      retry: 0,
      baseURL,
      ...fetchOptions,
      headers: {
        ...(fetchOptions.headers as Record<string, string> | undefined ?? {}),
      },
    });
  };
};
```

Note: No `Authorization` header injected here — the proxy handles it from the httpOnly cookie. This is a key difference from Phase 109's `useSessionClient` which injected `Authorization: Bearer ${token.value}`.

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
  const { cookie } = useRequestHeaders(["cookie"]);
  if (cookie) serverHeaders["cookie"] = cookie;

  // Bypass Vercel Deployment Protection on staging self-calls
  const bypass = useRuntimeConfig().vercelBypassSecret as string | undefined;
  if (bypass) serverHeaders["x-vercel-protection-bypass"] = bypass;

  // X-Proxy-Key is now handled by the catch-all proxy — REMOVE from useApiClient
}
```

`VERCEL_AUTOMATION_BYPASS_SECRET` must be exposed via `runtimeConfig` (private key, not `.public`) — confirmed present in `.env.example` (line 16: `# VERCEL_AUTOMATION_BYPASS_SECRET=`).

### Simplified Middleware Guards

All three middleware files currently check `useStrapiToken()` before calling `fetchUser()`. With httpOnly, the token is unreadable on the client. Guards must check user state only:

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

The SSR fail-open comment in `auth.ts` (explaining why SSR is skipped) becomes obsolete — SSR can now safely call `fetchUser()` because the proxy is the only exit. The SSR skip can remain as a performance optimization.

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

Replace `useStrapiClient()` → `useSessionClient()`. Remove SSR `X-Proxy-Key` injection (catch-all proxy now handles this). Add SSR cookie forwarding. Keep reCAPTCHA injection logic unchanged.

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

The `client` call goes to `/api/auth/google-one-tap` which matches the new dedicated Nitro route (before the catch-all). The Nitro route runs reCAPTCHA verification (via the `x-recaptcha-token` header that `useApiClient` injects), calls Strapi, sets the httpOnly cookie, and returns `{ user }`. Plugin removes `setToken` import entirely.

### FormVerifyCode.vue — Remove setToken + remove cache-bust

```typescript
// BEFORE
const { setToken, fetchUser } = useStrapiAuth();
setToken(responseRaw.jwt);  // set cookie client-side
// nuxt._cookies cache-bust (Phase 109 pitfall) — no longer needed
await fetchUser();

// AFTER
const { fetchUser } = useSessionAuth();
// Server route /api/auth/verify-code already set the httpOnly cookie
await fetchUser();
```

The `nuxt._cookies` cache-bust from Phase 109 is removed. It was specific to the client-readable cookie — httpOnly cookies don't populate `nuxt._cookies`.

### LoginWithGoogle.vue — BroadcastChannel redesign

```typescript
// BEFORE
const { jwt } = await loginWithPopup("google");
setToken(jwt);
await fetchUser();

// AFTER
await loginWithPopup("google"); // popup returns no jwt; cookie set server-side by Nitro callback
await fetchUser();              // reads from httpOnly cookie via proxy
```

`useProviders.ts` changes: `loginWithPopup` no longer returns `{ jwt }`. It resolves on `{ type: "google-oauth-success" }` (no jwt field) from BroadcastChannel.

### login/google.vue and login/facebook.vue — Exchange route replaces authenticateProvider

```typescript
// BEFORE
const response = await authenticateProvider("google", String(route.query.access_token || ""));

// AFTER — POST to Nitro exchange route, which sets the httpOnly cookie
const result = await $fetch<{ user: User }>("/api/auth/google/exchange", {
  method: "POST",
  body: { access_token: route.query.access_token },
});
// Cookie set — proceed with navigation using result.user or fetchUser()
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie read in Nitro | Custom cookie parser | `parseCookies(event)` from h3 | Built-in, handles encoding/multi-cookie |
| Cookie write in Nitro | Manual Set-Cookie header string | `setCookie(event, name, value, options)` from h3 | Handles `SameSite`, `HttpOnly`, `Secure`, `Max-Age` encoding |
| Clear httpOnly cookie | `document.cookie = ...max-age=0` | `setCookie(event, name, "", { maxAge: 0, httpOnly: true })` in server route | Client JS cannot modify httpOnly cookies |
| SSR $fetch baseURL | Custom fetch wrapper | `$fetch.create({ baseURL })` or manual `$fetch(url, { baseURL })` | ofetch built-in |
| Query string serialization | Custom encoder | `qs.stringify` (already dep) + manual URL append pattern | Handles nested objects, arrays with Strapi format |
| Proxy request forwarding | Custom fetch loop | `proxyRequest(event, targetUrl, { headers })` | Streams body, preserves method/headers |
| reCAPTCHA verification | Custom verifier | `verifyRecaptchaToken` from `../../utils/recaptcha` | Already exists in this repo |

**Key insight:** The h3 `setCookie` API used by `dev-login.post.ts` already in this codebase (verified at `apps/website/server/api/dev-login.post.ts:20`) is the exact pattern for all new auth routes. Copy that pattern, change the cookie name to `waldo_jwt` and add `httpOnly: true`.

---

## Common Pitfalls

### Pitfall 1: `fetchUser` guarded by `token.value` check
**What goes wrong:** All three middleware files and the old `useStrapiAuth.fetchUser` gate on `if (token.value) { fetchUser() }`. After httpOnly, `useStrapiToken()` (or any cookie ref) returns null client-side always. `fetchUser()` never runs → users appear logged out on every page load.
**Why it happens:** The old guard assumed "no readable token = not logged in." With httpOnly that assumption is inverted: "unreadable token = may still be logged in."
**How to avoid:** Remove ALL `token.value` guards. `fetchUser()` is now unconditional. A 401 from the proxy means "anonymous" — set `user.value = null` silently.
**Warning signs:** Guards returning early, users bounced to login after refresh.

### Pitfall 2: `setToken(null)` side effect in fetchUser error handling
**What goes wrong:** If any `fetchUser` implementation calls a token-clearing function on error (the original `@nuxtjs/strapi` bug), it will try to write the httpOnly cookie client-side — which silently fails. Worse: if using `useCookie("waldo_jwt")` in a non-httpOnly mode anywhere, it would write a JS-readable cookie alongside the httpOnly one, causing split-brain.
**How to avoid:** `fetchUser` in `useSessionAuth` catches errors and does `user.value = null` only. No token operations ever.

### Pitfall 3: SSR self-calls arrive at the proxy without cookies
**What goes wrong:** A page with `useAsyncData` that calls `useApiClient` from SSR sends a bare `$fetch` to `BASE_URL/api/`. Nitro self-calls do not automatically include the incoming request's cookies. The proxy finds no `waldo_jwt` cookie → no Authorization injected → 401 from Strapi → SSR renders logged-out state → hydration mismatch.
**How to avoid:** `useApiClient` must use `useRequestHeaders(["cookie"])` on SSR to forward the browser's cookie jar.
**Warning signs:** Pages that work on client-side navigation but fail on refresh/direct URL load.

### Pitfall 4: `authHeader` forwarding in the catch-all proxy
**What goes wrong:** The current catch-all forwards any `Authorization` header from the incoming client request (lines 75-78 of `server/api/[...].ts`). After module removal, no client sends `Authorization` anymore. But if a rogue client sends `Authorization: Bearer <tampered_token>`, the proxy would forward it and it would override the httpOnly cookie logic.
**How to avoid:** Remove the `authHeader` forwarding block entirely. The proxy only injects Authorization from the httpOnly cookie, never from client-supplied headers.
**Warning signs:** Auth bypass in tests if stubs still inject Authorization headers.

### Pitfall 5: Google popup sends `jwt` through BroadcastChannel — do not forward it
**What goes wrong:** If the Nitro `google-oauth/callback.get.ts` includes `jwt` in the BroadcastChannel payload (for backward compat), `LoginWithGoogle.vue` may call `setToken(jwt)` which does nothing but leaves confusing dead code.
**How to avoid:** The popup HTML must send `{ type: "google-oauth-success" }` with NO `jwt` field. `LoginWithGoogle.vue` removes `setToken` entirely — `useSessionAuth` has no `setToken` method.

### Pitfall 6: `sameSite: "strict"` breaks OAuth redirect flows
**What goes wrong:** After Google/Facebook redirect back to `BASE_URL/login/google?access_token=...`, the browser initiates a cross-origin top-level navigation. `sameSite: "strict"` drops the cookie on cross-origin redirects.
**How to avoid:** Use `sameSite: "lax"`. Under `lax`, the cookie IS sent on top-level GET navigations (OAuth redirects are GET). `lax` still blocks CSRF on cross-site POST/PUT/DELETE.
**Note:** The existing `X-Recaptcha-Token` custom header on POST/PUT/DELETE provides an additional CSRF barrier (custom headers cannot be sent cross-origin without CORS preflight).

### Pitfall 7: `nuxt._cookies` cache-bust no longer needed
**What goes wrong:** Phase 109 added a `nuxt._cookies[cookieName] = useCookie(cookieName)` line to `FormVerifyCode.vue` to bust the Nuxt cookie cache after `setToken`. With httpOnly, this line must be REMOVED. httpOnly cookies never enter `nuxt._cookies`. `parseCookies()` in Nitro reads the actual cookie header directly.

### Pitfall 8: The catch-all proxy currently does NOT authenticate Strapi requests correctly
**What goes wrong:** The existing `headers["Cookie"] = \`waldo_jwt=\${jwt}\`` (lines 85-89) is forwarded to Strapi, but Strapi's users-permissions middleware authenticates via `Authorization: Bearer`, not Cookie. Currently it works ONLY because `@nuxtjs/strapi`'s `$fetch` also sends `Authorization: Bearer <token>`. After module removal without the proxy fix, ALL authenticated API calls return 401.
**How to avoid:** The proxy change (Cookie → Authorization Bearer injection) must be implemented BEFORE removing the module in integration testing.

### Pitfall 9: Strapi `auth-google.callback` returns HTML, not JSON
**What goes wrong:** The Nitro `server/api/auth/google-oauth/callback.get.ts` calls Strapi's custom callback with `$fetch()`. The handler calls `popupResponse()` which sets `ctx.type = 'html'` — `$fetch` receives HTML, not JSON, and `result.jwt` is undefined.
**How to avoid:** Add `?json=true` to the Strapi custom callback in `apps/strapi/src/api/auth-google/controllers/auth-google.ts`: `if (ctx.query.json) { ctx.body = { jwt }; return; }` before calling `popupResponse`. One-line Strapi change, fully backward-compatible. See Open Questions #1.

### Pitfall 10: New POST auth routes bypass catch-all reCAPTCHA — it MUST be re-added
**What goes wrong:** `server/api/auth/login.post.ts`, `auth/verify-code.post.ts`, and `auth/google-one-tap.post.ts` match BEFORE the catch-all. The catch-all's reCAPTCHA check (which checks method, not path) never runs for these routes. Result: bot protection silently disappears on exactly the endpoints that matter most.
**Why it happens:** `isRecaptchaProtectedRoute` in `recaptcha.ts` checks method only (verified at line 78: `RECAPTCHA_PROTECTED_METHODS.has(method.toUpperCase())`). Dedicated routes bypass the catch-all entirely.
**How to avoid:** Every new auth POST route must call `verifyRecaptchaToken` itself, reading `x-recaptcha-token` from the request header. `useApiClient` already injects this header on the client — so login flows that call `useApiClient` send the token automatically. For `useSessionAuth.logout` (which uses raw `$fetch`), reCAPTCHA is not needed (logout is low-risk). For `login.post.ts`, the verifier call must be explicit.
**Note:** Rate limiting is preserved automatically — `auth-rate-limit.ts` middleware runs before all routes.

---

## Complete Surface Area Inventory

### Files requiring LOGIC CHANGES (not just symbol rename)

| File | What Changes | Why |
|------|-------------|-----|
| `server/api/[...].ts` | Cookie → Authorization injection; remove authHeader forwarding | httpOnly means proxy owns Authorization |
| `app/composables/useApiClient.ts` | Replace `useStrapiClient()` with `useSessionClient()`; add cookie forwarding on SSR; remove X-Proxy-Key injection (proxy handles it) | Client no longer supplies auth header |
| `app/composables/useImage.ts` | Remove `useStrapiToken()` + manual Authorization header in `uploadFiles()` | Token unreadable; proxy injects it |
| `app/composables/useLogout.ts` | Replace `document.cookie = ...max-age=0` + `useStrapiAuth().logout()` with `$fetch('/api/auth/logout', { method: 'POST' })` | Client cannot clear httpOnly cookie |
| `app/composables/useProviders.ts` | Replace `getProviderAuthenticationUrl` from `useSessionAuth`; `loginWithPopup` no longer returns `{ jwt }`, expects `{ type: "google-oauth-success" }` | Module gone; BroadcastChannel payload changes |
| `app/components/FormVerifyCode.vue` | Remove `setToken(responseRaw.jwt)` + nuxt._cookies cache-bust | Server route sets cookie |
| `app/components/LoginWithGoogle.vue` | Remove `setToken(jwt)` call; don't destructure jwt from loginWithPopup | Server route sets cookie |
| `app/components/UploadMedia.vue` | Remove `useStrapiToken()` + Authorization header construction | Proxy injects auth |
| `app/middleware/auth.ts` | Replace `useStrapiToken()` check with unconditional `fetchUser()` | Token unreadable |
| `app/middleware/onboarding-guard.global.ts` | Replace `if (!token.value) return` with user-based check | Token unreadable |
| `app/middleware/dashboard-guard.global.ts` | Replace `if (!token.value) return navigateTo('/login')` | Token unreadable |
| `app/pages/login/google.vue` | Replace `authenticateProvider()` with POST to `/api/auth/google/exchange` | Server route handles token exchange + cookie |
| `app/pages/login/facebook.vue` | Replace `authenticateProvider()` with POST to `/api/auth/facebook/exchange` | Same |
| `app/plugins/google-one-tap.client.ts` | Remove `setToken(result.jwt)` + `useStrapiAuth` import | Server route sets cookie |

### Files requiring MECHANICAL RENAME only (useStrapiUser → useSessionUser)

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
| `tests/middleware/dashboard-guard.test.ts` | Stubs `useStrapiToken`, `useStrapiUser`, `useStrapiAuth` | Stub `useSessionUser`, `useSessionAuth` (no token stub needed) |
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

### Reading httpOnly cookie in Nitro proxy and injecting Authorization
```typescript
const cookies = parseCookies(event);
const jwt = cookies["waldo_jwt"];
if (jwt) {
  headers["Authorization"] = `Bearer ${jwt}`;
}
// Old: headers["Cookie"] = `waldo_jwt=${jwt}`;  — REMOVE THIS
```

### Forwarding cookies in SSR useApiClient
```typescript
if (import.meta.server) {
  const { cookie } = useRequestHeaders(["cookie"]);
  if (cookie) serverHeaders["cookie"] = cookie;
  const bypass = useRuntimeConfig().vercelBypassSecret as string | undefined;
  if (bypass) serverHeaders["x-vercel-protection-bypass"] = bypass;
}
```

### reCAPTCHA in dedicated auth POST route
```typescript
import { verifyRecaptchaToken } from "../../utils/recaptcha";
// Inside defineEventHandler:
if (config.recaptchaEnabled) {
  const token = getHeader(event, "x-recaptcha-token");
  await verifyRecaptchaToken(token, config.recaptchaSecretKey as string);
}
```

### Minimal useSessionUser
```typescript
import type { User } from "@/types/user";
export const useSessionUser = () =>
  useState<User | null>("session_user", () => null);
```

### Popup BroadcastChannel — send success WITHOUT jwt
```typescript
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
| Quick run command | `pnpm --filter website vitest run --reporter=verbose` |
| Full suite command | `pnpm turbo test --filter=website` |

### Phase Requirements → Test Map

| Behavior | Test Type | Command |
|----------|-----------|---------|
| `useSessionUser` state initializes null | unit | `vitest run tests/composables/useSessionUser.test.ts` |
| `useSessionAuth.fetchUser` sets user on success | unit | `vitest run tests/composables/useSessionAuth.test.ts` |
| `useSessionAuth.fetchUser` sets null on 401, NO token side effect | unit | same |
| `useApiClient` forwards cookie header on SSR | unit | `vitest run tests/composables/useApiClient.test.ts` |
| `useApiClient` injects reCAPTCHA token on POST | unit | same |
| `dashboard-guard` redirects to login when user is null | unit | `vitest run tests/middleware/dashboard-guard.test.ts` |
| `useLogout` calls POST /api/auth/logout | unit | `vitest run tests/composables/useLogout.test.ts` |
| `google-one-tap` plugin does not call setToken | unit | `vitest run tests/plugins/google-one-tap.test.ts` |
| Login POST route runs reCAPTCHA before Strapi call | unit | `vitest run tests/server/api/auth/login.test.ts` |

### Wave 0 Gaps (test files that need creation or significant update)
- [ ] `tests/composables/useSessionUser.test.ts` — new file, covers useState initialization
- [ ] `tests/composables/useSessionAuth.test.ts` — new file; **CRITICAL**: must assert that 401 sets user=null and does NOT attempt to write any cookie
- [ ] `tests/server/api/auth/login.test.ts` — new file; verifies reCAPTCHA is called before Strapi forward
- [ ] `tests/stubs/imports.stub.ts` — remove useStrapiX exports, add useSessionX
- [ ] `tests/composables/useApiClient.test.ts` — update mock from useStrapiClient to useSessionClient; add SSR cookie forwarding assertion
- [ ] `tests/composables/useLogout.test.ts` — update to mock $fetch POST to /api/auth/logout
- [ ] `tests/middleware/dashboard-guard.test.ts` — remove token stubs, add user stubs
- [ ] `tests/plugins/google-one-tap.test.ts` — remove setToken assertion

---

## Open Questions

1. **Strapi `auth-google.callback` returns HTML — needs `?json=true` mode**
   - What we know: The handler at `apps/strapi/src/api/auth-google/controllers/auth-google.ts` calls `popupResponse()` which returns HTML. `$fetch()` from Nitro would receive HTML, not `{ jwt }`.
   - Recommendation: Add one line to Strapi: `if (ctx.query.json) { ctx.body = { jwt }; return; }` before calling `popupResponse`. Wave 1 task.
   - Alternative: Implement the Google OAuth code exchange natively in Nitro using `google-auth-library` (already in strapi's package.json), then call an internal Strapi endpoint to `findOrCreateUser`. More work but avoids Strapi changes.

2. **`VERCEL_AUTOMATION_BYPASS_SECRET` availability in production**
   - What we know: Confirmed in `.env.example` line 16. SSR self-calls on Vercel staging/production need this header.
   - What's unclear: Whether it's set in Vercel production environment variables.
   - Recommendation: Verify via `vercel env ls --environment=production` before deploying. The `runtimeConfig` key `vercelBypassSecret` must be added as a **private** (non-public) env var in `nuxt.config.ts`.

3. **Facebook OAuth — is the standard Strapi connect flow still configured?**
   - What we know: `LoginWithFacebook.vue` calls `redirectToProvider("facebook")` → `BASE_URL/api/connect/facebook`. The proxy currently excludes `connect/facebook/callback`.
   - What's unclear: Whether Facebook OAuth credentials are still active in Strapi's users-permissions config.
   - Recommendation: Verify during Wave 1 before building `server/api/auth/facebook/exchange.post.ts`.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `@nuxtjs/strapi` module manages session | Custom composables + httpOnly cookie | Eliminates logout bug; XSS-immune |
| Client JS reads JWT from `useStrapiToken()` | No client JS token access | Physical enforcement of proxy centralization |
| `setToken(jwt)` client-side on login | Nitro route returns `Set-Cookie: waldo_jwt; HttpOnly` | No session state in client JS |
| Proxy forwards `Cookie: waldo_jwt=<value>` | Proxy injects `Authorization: Bearer <jwt>` | Correct Strapi auth header |
| OAuth popup sends jwt via BroadcastChannel | Nitro callback handler owns jwt, sends success signal only | Token never in client JS |
| `login/google.vue` calls authenticateProvider client-side | Calls Nitro exchange route, gets `{ user }` back, cookie already set | Token never in client JS |
| reCAPTCHA check in catch-all only | reCAPTCHA in both catch-all AND each dedicated auth POST route | Protection preserved after route extraction |

**Deprecated/replaced:**
- `useStrapiUser` — replaced by `useSessionUser`
- `useStrapiAuth` — replaced by `useSessionAuth` (no setToken, no authenticateProvider, no logout client-side)
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
- Live source files: `apps/website/server/utils/recaptcha.ts` — confirmed `isRecaptchaProtectedRoute` checks method only, not path (line 78)
- Live source files: `apps/website/server/middleware/auth-rate-limit.ts` — confirmed covers `/api/auth/local`, `/api/auth/verify-code`, `/api/auth/google-one-tap` (lines 12-18)
- Live source files: `apps/website/app/composables/useApiClient.ts` — confirmed `X-Recaptcha-Token` injection on POST/PUT/DELETE
- Live source files: `apps/website/app/components/LoginWithFacebook.vue` — confirmed redirect flow is live
- `.planning/phases/109-eliminate-nuxtjs-strapi-dependency-from-website-and-dashboard/109-RESEARCH.md` — Phase 109 `useSessionClient` pattern (qs.stringify URL-append style)
- `apps/website/.env.example` — VERCEL_AUTOMATION_BYPASS_SECRET presence confirmed line 16

### Secondary (MEDIUM confidence)
- Nitro h3 docs: `setCookie`, `parseCookies`, `proxyRequest` APIs — verified consistent with existing usage in repo
- `@nuxtjs/strapi/dist/runtime/composables/useStrapiAuth.js` — inspected for `getProviderAuthenticationUrl` and `authenticateProvider` implementations

### Tertiary (LOW confidence)
- `sameSite: "lax"` behavior for top-level OAuth redirects — standard browser behavior, well-documented, but test in staging before production

---

## Metadata

**Confidence breakdown:**
- Surface area inventory: HIGH — verified via grep, 54/30/5/3 occurrences confirmed
- Architecture patterns: HIGH — derived from reading live code, not assumptions
- reCAPTCHA preservation: HIGH — verified `isRecaptchaProtectedRoute` source; confirmed method-only check
- OAuth popup flow redesign: MEDIUM — Strapi `?json=true` Strapi change is an open question
- OAuth redirect exchange routes: HIGH — pattern is clear; Facebook activation status is LOW
- CSRF risk with sameSite: lax: HIGH — well-understood browser spec; reCAPTCHA provides additional barrier

**Research date:** 2026-06-14
**Valid until:** 2026-07-14 (30 days; stack is stable Nuxt 4.1.3 + Strapi v5)
