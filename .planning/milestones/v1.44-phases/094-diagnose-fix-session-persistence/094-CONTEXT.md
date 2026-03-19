# Phase 094: Diagnose & Fix Session Persistence - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the bug where `guard.global.ts` redirects an authenticated dashboard user to `/auth/login` after a page refresh following the 2-step verify-code login flow. The fix is confined to the verify-code → cookie → guard stack. No new features.

</domain>

<decisions>
## Implementation Decisions

### Root Cause Hypothesis (priority order)

Three plausible causes, ranked by likelihood. The plan must **diagnose first**, then fix:

1. **`fetchUser()` silently clears the token on SSR** — `useStrapiAuth.fetchUser()` wraps `/users/me` in a try/catch that calls `setToken(null)` on any error. If `/users/me` fails during SSR (timeout, populate error, Strapi not ready), the token is actively destroyed before the guard runs. This is the most likely cause.

2. **`nuxt._cookies` cache stale across requests** — `useStrapiToken` caches the cookie ref in `nuxt._cookies[cookieName]`. If the ref was created as `null` during SSR and `setToken()` in `FormVerifyCode.vue` wrote to that same cached (now-stale) ref, the written value never reaches `useCookie()` properly.

3. **`setToken()` in `FormVerifyCode.vue` doesn't persist** — `setToken(value)` does `token.value = value` on the cached ref. If the cookie write succeeds client-side but doesn't survive a full hard refresh (wrong `path`, `maxAge`, or `domain` options applied at wrong timing), the cookie is absent on the next request.

### Diagnosis Approach

- Add a **temporary `console.log`** before `setToken(response.jwt)` in `FormVerifyCode.vue` to confirm the JWT is arriving
- After successful verify-code, inspect **DevTools → Application → Cookies** for `waldo_jwt`: confirm it exists, has `path=/`, correct `maxAge`, and no unexpected domain constraint
- Add a **temporary `console.log`** at the top of `guard.global.ts` to log `useStrapiUser().value` and `useStrapiToken().value` on each navigation — confirm what state the guard actually sees after refresh
- Check **Strapi logs** for any `/users/me` errors during the SSR of the post-login page

### Fix Location

Fix lives in **one of two places** depending on what diagnosis reveals:

- **If cause #1 (fetchUser clears token):** Fix `fetchUser()` behavior — either make the populate query more resilient (reduce populate options), or restructure `FormVerifyCode.vue` so `setToken()` is called before any code that could throw, and the cookie is written before `router.push('/')` triggers SSR.
- **If cause #2 or #3 (cookie not persisting):** Fix is in `nuxt.config.ts` cookie options or in how `useStrapiToken` is invoked post-verify.

The fix must **not** touch `guard.global.ts` role-check logic — the existing `if (!roleName) return` SSR guard is correct and must stay.

### Verification

Manual walkthrough in local dev:
1. Login form → submit credentials → verify-code page → enter 6-digit code
2. After redirect to `/`, open DevTools → Application → Cookies → confirm `waldo_jwt` is present with `path=/`
3. Hard refresh (Ctrl+Shift+R) → confirm dashboard loads authenticated, no redirect to `/auth/login`
4. SESS-01: Root cause documented in SUMMARY.md
5. SESS-02: Cookie visible in DevTools after refresh
6. SESS-03: Guard does not redirect after refresh
7. SESS-04: Full end-to-end flow works

### Regression Scope

These flows must remain unbroken after the fix:
- Direct login bypass (manager already authenticated — no verify-code loop)
- Non-manager redirect (guard still sends non-managers to login)
- Password reset flow (unrelated to verify-code path)
- OAuth callback (`ctx.method === "GET"` guard in `overrideAuthLocal` already bypasses 2-step)
- `useLogout.ts` composable behavior (clears token, redirects — must not interfere with fix)

### Claude's Discretion

- Exact diagnostic logging format (console.log vs structured)
- Whether to reduce `auth.populate` fields in `nuxt.config.ts` as a preventive measure
- Whether to add a more explicit error surface in `fetchUser()` for future debuggability

</decisions>

<code_context>
## Existing Code Insights

### Key Files

- `apps/dashboard/app/components/FormVerifyCode.vue` — the verify-code success handler: calls `setToken(response.jwt)` → `fetchUser()` → role check → `router.push('/')`. The entire sequence is inside a single `try/catch` where catch redirects to `/auth/login`.
- `apps/dashboard/app/middleware/guard.global.ts` — reads `useStrapiUser()`. If null → redirect login. Already has `if (!roleName) return` SSR guard to skip role check when role not yet populated.
- `apps/dashboard/nuxt.config.ts` — `strapi.cookie: { path: "/", maxAge: 604800 }`, `cookieName: "waldo_jwt"`, `auth.populate` includes `ad_reservations.ad` and `ad_featured_reservations.ad`.

### The Dangerous Pattern in `useStrapiAuth.fetchUser()`

```js
const fetchUser = async () => {
  if (token.value) {
    try {
      user.value = await client("/users/me", { params: config.strapi.auth });
    } catch {
      setToken(null);  // ← silently nukes the token on ANY /users/me error
    }
  }
  return user;
};
```

This is called by the `strapi.js` plugin on every page load (`defineNuxtPlugin(async () => { ... await fetchUser() })`). If `/users/me` throws for any reason on SSR, the token is destroyed before `guard.global.ts` runs.

### `useStrapiToken` Cookie Cache

```js
nuxt._cookies = nuxt._cookies || {};
if (nuxt._cookies[config.strapi.cookieName]) {
  return nuxt._cookies[config.strapi.cookieName];  // returns cached ref
}
const cookie = useCookie(config.strapi.cookieName, config.strapi.cookie);
nuxt._cookies[config.strapi.cookieName] = cookie;
```

Cookie ref is cached per Nuxt app instance. `setToken(value)` writes to this cached ref — if the ref was instantiated with `null` and is stale, writes may not propagate to the actual browser cookie.

### Established Patterns

- `useStrapiAuth()` is the canonical way to call `setToken`, `fetchUser`, `logout` — do not call `useCookie` directly
- `useState('pendingToken')` carries the token between FormLogin and FormVerifyCode — already correctly cleared after verify
- `useLogout()` composable handles full logout (appStore reset + strapiLogout + navigate) — must not be broken by changes

### Integration Points

- `strapi.js` plugin runs before `guard.global.ts` middleware on every page load
- `auth.populate` in `nuxt.config.ts` controls what `/users/me` returns — heavy populate = more likely to fail on SSR
- `COOKIE_DOMAIN` env var (absent in local dev) means cookies are host-only on localhost — correct behavior

</code_context>

<specifics>
## Specific Ideas

- Quick task #53 already fixed a related SSR/cookie issue: `fix dashboard logout on refresh: point strapi.url directly to API_URL to prevent SSR self-proxy loop`. The fix pattern there (configuring strapi.url correctly for SSR vs client) may be relevant context.
- The `auth.populate` array includes deep relations (`ad_reservations.ad`, `ad_featured_reservations.ad`). If a user has many reservations, the `/users/me` response is large and potentially slow — a timeout or Strapi error here would trigger the `setToken(null)` nuke.

</specifics>

<deferred>
## Deferred Ideas

- SESS-05: Session expiry after `maxAge` — deferred per REQUIREMENTS.md
- SESS-06: Logout cookie cleanup (cross-subdomain) — deferred per REQUIREMENTS.md
- POLL-01: Post-logout website Pinia store reset — deferred per REQUIREMENTS.md
- Reducing `auth.populate` relations as a performance optimization — separate concern; only touch if directly implicated in the fix

</deferred>

---

*Phase: 094-diagnose-fix-session-persistence*
*Context gathered: 2026-03-18*
