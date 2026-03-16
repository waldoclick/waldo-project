# Pitfalls Research

**Domain:** Adding cross-subdomain cookie sharing to existing Nuxt 4 + @nuxtjs/strapi v2 auth
**Milestone:** Shared authentication session across `waldo.click` subdomains (website + dashboard)
**Researched:** 2026-03-16
**Confidence:** HIGH — all critical claims verified against @nuxtjs/strapi v2 source (`useStrapiToken.ts`, `useStrapiAuth.ts`), Nuxt 4 `useCookie` docs, and MDN cookie specification

---

## Critical Pitfalls

Mistakes that cause broken sessions, zombie cookies, or users locked out after logout.

---

### Pitfall 1: Logout Doesn't Clear the Old Cookie — Two Cookies Now Exist

**What goes wrong:**
The existing `waldo_jwt` cookie is set **without** a `domain` attribute:

```ts
// nuxt.config.ts — current state (both website and dashboard)
cookie: {
  path: "/",
  maxAge: 604800,
},
```

When `domain: ".waldo.click"` is added, `useStrapiToken` calls `useCookie(cookieName, config.strapi.cookie)`, which sets a **new cookie** with `Domain=.waldo.click`. The browser now has **two separate cookies** with the name `waldo_jwt`:

1. `waldo_jwt` — no domain attribute (host-only, scoped to `www.waldo.click`)
2. `waldo_jwt` — `Domain=.waldo.click` (visible to all subdomains)

Both are sent to the server on requests from `www.waldo.click`. When `useStrapiAuth().logout()` calls `setToken(null)`, it sets `cookie.value = null` through the `useCookie` ref that was created with `Domain=.waldo.click` — this clears only cookie #2. Cookie #1 (the old host-only one) remains untouched in the browser and continues to be sent on requests. From the user's perspective, they are still "logged in" after logout.

**Why it happens:**
RFC 6265 treats cookies with and without a `Domain` attribute as distinct entries. Setting `Domain=.waldo.click` creates a different cookie than the one without a domain, even if the name is identical. The browser sends both, and clearing the domain-scoped one does not affect the host-only one.

**Consequences:**
- After logout, `useStrapiUser()` returns the old user object on next SSR render (the old cookie's JWT is sent to Strapi and validates)
- Users cannot fully log out — the old cookie survives until its 7-day `maxAge` expires
- On the dashboard, admins can appear to be logged out in the UI but their JWT is still active

**Prevention:**
The logout must **explicitly clear the old host-only cookie** in the same operation. Before removing the domain attribute from the cookie config, add a one-time client-side cleanup:

```ts
// In useLogout.ts — add BEFORE calling strapiLogout()
// Step 1: Clear the old host-only cookie (no domain attribute)
if (import.meta.client) {
  // Set Max-Age=0 on the old cookie — must match EXACT original attributes
  document.cookie = `waldo_jwt=; path=/; max-age=0`
}
// Step 2: Clear the new domain-scoped cookie via the reactive ref
await strapiLogout()
```

Or via a Nitro server route that issues both `Set-Cookie` headers simultaneously.

**The permanent fix:** After all existing users' old cookies have expired (7 days after the domain migration is deployed), the cleanup code can be removed.

**Warning signs:**
- After logout, `document.cookie` still contains `waldo_jwt` in browser DevTools
- After logout, `GET /api/users/me` returns a 200 with user data instead of 401
- `document.cookie` shows two `waldo_jwt` values when inspected from `www.waldo.click`

**Phase to address:** Domain migration phase — the cleanup must be in the same commit as the domain attribute change. Cannot be split.

---

### Pitfall 2: `nuxt-security` May Block `Set-Cookie` with Cross-Subdomain Domain Attributes

**What goes wrong:**
Both apps use `nuxt-security` which adds security headers including a strict CSP. The `nuxt-security` module also has cookie-hardening features. If any `nuxt-security` config applies `httpOnly: true` globally to cookies, or if Strapi's Nitro proxy route (`/api/*`) rewrites `Set-Cookie` headers, the `Domain=.waldo.click` attribute may be stripped.

More critically: the website's `nuxt-security` config is **disabled in `local` mode** (`process.env.NODE_ENV !== "local"`):

```ts
// apps/website/nuxt.config.ts
...(process.env.NODE_ENV !== "local" ? ["nuxt-security"] : []),
```

This means security headers — including any that affect cookie policy — are only active in production. A cross-subdomain cookie that works in local dev may fail in production due to security header conflicts, or vice versa.

**Why it happens:**
`nuxt-security` can modify HTTP response headers including `Set-Cookie` attributes. The interaction between the module's cookie hardening and a custom `Domain` attribute is not always predictable.

**Consequences:**
- The `Domain` attribute is silently stripped in production, breaking subdomain sharing
- Or: `nuxt-security` adds `SameSite=Strict` to the cookie, which (combined with the domain attribute) prevents the cookie from being sent on cross-subdomain navigations

**Prevention:**
1. After deploying to staging, inspect the raw `Set-Cookie` response header in browser DevTools → Network tab — verify `Domain=.waldo.click` is present
2. Check `nuxt-security`'s cookie-related config (`security.headers.crossOriginResourcePolicy`, etc.) to ensure no rewrites affect `Set-Cookie`
3. Test the full login/logout flow from both `www.waldo.click` AND `admin.waldo.click` in staging (not just `localhost`)

**Warning signs:**
- Cookie in browser DevTools shows no `Domain` attribute despite config change
- Login works on subdomain A but not B

**Phase to address:** Staging verification phase — mandatory cross-browser, cross-subdomain smoke test.

---

### Pitfall 3: `SameSite=Lax` (the Browser Default) Breaks Cross-Subdomain Requests on Some Flows

**What goes wrong:**
Modern browsers default cookies to `SameSite=Lax` when no `SameSite` attribute is set. Under `SameSite=Lax`:
- The cookie **is sent** on top-level navigations (clicking a link from `admin.waldo.click` to `www.waldo.click`)
- The cookie **is NOT sent** on cross-origin subresource requests (AJAX, `fetch()`, XHR from one subdomain to another)

The current cookie config sets no `sameSite` attribute. This is technically fine for the main use case (each app communicates with its own Nitro server which proxies to Strapi). However, if any future code makes direct cross-subdomain `fetch()` calls (e.g., website calls a dashboard API route, or vice versa), the JWT cookie will be silently absent.

Additionally: `SameSite=None` **requires** `Secure=true`. If the team wants to enable `SameSite=None` (to guarantee the cookie is sent in all cross-site contexts), `Secure: true` must also be set — which breaks local HTTP development (see Pitfall 4).

**Why it happens:**
`SameSite` semantics are commonly misunderstood. `waldo.click` subdomains ARE same-site (same registrable domain), so `SameSite=Lax` does NOT block them from seeing the cookie — this is NOT a problem for the primary use case. The confusion is that developers may try to set `SameSite=None` unnecessarily, which then requires `Secure` and breaks localhost.

**Consequences:**
- Setting `SameSite=None` without `Secure` causes the browser to silently ignore the cookie
- The default `SameSite=Lax` is actually correct for subdomain sharing (subdomains are same-site)
- Unnecessary changes to `SameSite` create new problems that didn't exist before

**Prevention:**
- **Do NOT change `SameSite`** from its current unset state. The default browser behavior (Lax) is compatible with subdomain sharing.
- If `SameSite=None` is ever needed (for third-party/cross-site embedding scenarios), pair it with `Secure: true` and test in HTTPS environments only.
- Explicitly document in code that `SameSite` is intentionally absent: `// sameSite intentionally unset — browser defaults to Lax, which is correct for same-site subdomain sharing`

**Warning signs:**
- Cookie disappears from requests after adding `SameSite=None` without `Secure`
- Browser console shows: "Cookie 'waldo_jwt' has been rejected because it has the 'SameSite=None' attribute but is missing the 'secure' attribute"

**Phase to address:** Domain migration phase — add the comment, do not change the attribute.

---

### Pitfall 4: `Secure: true` Breaks Local HTTP Development

**What goes wrong:**
If `Secure: true` is added to the cookie config (required for `SameSite=None`, or as a general security hardening step), the cookie will not be set over HTTP connections. Local development runs on `http://localhost:3000` and `http://localhost:3001`. After adding `Secure: true`, the `waldo_jwt` cookie is never stored by the browser on localhost, making login impossible in local dev.

The Nuxt docs explicitly warn about this:
> "Be careful when setting this to true, as compliant clients will not send the cookie back to the server in the future if the browser does not have an HTTPS connection. **This can lead to hydration errors.**"

The website already conditionally excludes `nuxt-security` for `NODE_ENV=local`. The same conditional logic would need to apply to the cookie's `Secure` flag.

**Why it happens:**
Developers add `Secure: true` as a security best-practice without realizing it blocks local HTTP dev.

**Consequences:**
- `waldo_jwt` cookie is never set in local dev — all auth flows silently fail
- No error is shown — the login appears to succeed but the cookie is not stored
- SSR hydration mismatches: server renders authenticated content, client sees no cookie

**Prevention:**
If `Secure` is ever added, it must be environment-conditional:

```ts
// nuxt.config.ts
cookie: {
  path: "/",
  maxAge: 604800,
  // Only require Secure flag in non-local environments
  ...(process.env.NODE_ENV !== "local" && { secure: true }),
},
```

**Warning signs:**
- Login appears successful but protected routes redirect to `/login` immediately
- Browser DevTools → Application → Cookies shows no `waldo_jwt` entry after login on localhost
- `useStrapiUser()` returns `null` immediately after successful `useStrapiAuth().login()` on localhost

**Phase to address:** If `Secure` is added — must be in same commit as the environment conditional.

---

### Pitfall 5: SSR Hydration Mismatch When Domain Cookie Is Not Present on First Load

**What goes wrong:**
When a user visits a subdomain app (e.g., `admin.waldo.click`) for the first time after the domain-scoped cookie is introduced, the server renders the page using the `waldo_jwt` cookie sent in the request. If the cookie exists (user was previously logged in on `www.waldo.click`), the server-rendered HTML shows authenticated content. However, if there is a timing window where the cookie is set but the reactive state hasn't hydrated correctly on the client, Vue's hydration will fail with a mismatch.

The specific failure mode: `useStrapiToken()` caches the cookie ref in `nuxt._cookies[cookieName]`. On SSR, this ref is populated from the incoming request cookie. On hydration, Vue expects the client-side DOM to match the server-rendered HTML. If the cookie resolution differs between server and client (e.g., the cookie was set with `Domain=.waldo.click` on the website but the old host-only version is what the browser sends), the hydration comparison fails.

**Why it happens:**
`useStrapiToken` uses `useCookie` which is SSR-aware — but it reads the cookie from `nuxt._cookies` cache. If two cookies with the same name exist (old host-only + new domain-scoped), the server sees whichever the browser sends first in the `Cookie` header. The browser sends them in an unspecified order when both match the request domain. Server and client may resolve to different cookie values.

**Consequences:**
- Vue hydration warnings in browser console: "Hydration attribute mismatch"
- Authenticated state flickers: page renders as logged-in on SSR, flashes to logged-out on client hydration (or vice versa)
- `useStrapiUser()` returns different values on server vs client during the migration period

**Prevention:**
1. Plan for a migration window: the old host-only cookie and new domain-scoped cookie will coexist for up to 7 days (maxAge)
2. During this window, log and monitor for hydration errors in Sentry
3. The fastest resolution: after deploying the domain change, add a server-side middleware to Nitro that explicitly clears the old host-only cookie when both are present:

```ts
// server/middleware/cookie-migration.ts
export default defineEventHandler((event) => {
  const cookies = parseCookies(event)
  // If the request has waldo_jwt, we assume the domain-scoped cookie is now canonical
  // Instruct the browser to delete the host-only version
  if (cookies['waldo_jwt']) {
    deleteCookie(event, 'waldo_jwt', { path: '/', domain: undefined })
  }
})
```

**Warning signs:**
- Vue console warnings about "Hydration text content mismatch"
- User sees a flash of logged-out state on page load even though they were logged in
- `useStrapiUser()` is non-null on SSR but null on first client-side read

**Phase to address:** Domain migration phase + 7-day monitoring window after deployment.

---

## Moderate Pitfalls

---

### Pitfall 6: The Dashboard Logout Composable Does Not Exist — Store Resets Won't Fire

**What goes wrong:**
The website has a centralized `useLogout` composable (created in v1.28) that resets all 6 user stores before calling `useStrapiAuth().logout()`. The **dashboard does not have an equivalent** — no `useLogout` composable was found in `apps/dashboard/app/composables/`. Dashboard logout is likely scattered across individual components.

When the domain cookie is added, the logout behavior change (Pitfall 1 — clearing the old host-only cookie) must be applied to **both** apps. If the dashboard has no centralized logout, the fix must be applied to every individual logout call site.

**Why it matters:**
- A fix applied only to the website composable does not affect the dashboard
- The old host-only cookie persists after dashboard logout, allowing session fixation

**Prevention:**
Before implementing the domain cookie change, create `apps/dashboard/app/composables/useLogout.ts` mirroring the website pattern. Wire all dashboard logout call sites to use it. This is a prerequisite, not an afterthought.

**Warning signs:**
- Logging out from the dashboard still shows the user as logged in when navigating to the website

**Phase to address:** Must be a prerequisite step within the domain migration phase.

---

### Pitfall 7: `@nuxtjs/strapi` v2 `cookie` Config Is Passed Directly to `useCookie` — No Domain Sanitization

**What goes wrong:**
`useStrapiToken` passes `config.strapi.cookie` directly as the options object to `useCookie`:

```ts
const cookie = useCookie<string | null>(config.strapi.cookieName, config.strapi.cookie)
```

This means `domain`, `secure`, `sameSite`, `httpOnly`, and `maxAge` from `nuxt.config.ts` are all passed through without any validation or sanitization. If a misconfigured `domain` value is passed (e.g., `domain: "waldo.click"` instead of `domain: ".waldo.click"`), the module will silently create a cookie that does not share across subdomains.

RFC 6265 specifies: when a server sets `Domain=waldo.click` (without the leading dot), browsers MAY interpret it as `waldo.click` only (not subdomains). The spec says leading dot is optional but most browsers treat `Domain=example.com` as equivalent to `.example.com` for subdomain sharing. However, the leading dot in `.waldo.click` is the explicit, unambiguous way to declare subdomain scope.

**Why it matters:**
The difference between `domain: "waldo.click"` and `domain: ".waldo.click"` is invisible in most tests but can fail in specific browsers or reverse proxies that follow the RFC strictly.

**Prevention:**
Always use the leading-dot form: `domain: ".waldo.click"`. Verify in at least Chrome, Firefox, and Safari that the cookie appears in `Application → Cookies` with `Domain: .waldo.click`.

**Warning signs:**
- Cookie sharing works in Chrome but not Safari
- The cookie appears in DevTools without the leading dot: `Domain: waldo.click`

**Phase to address:** Domain migration phase — explicitly document the leading dot in `nuxt.config.ts` comments.

---

### Pitfall 8: Pinia Stores with `persist` Leak Cross-User State When Cookie Is Shared

**What goes wrong:**
The website has 14 stores with `persist: true` (backed by localStorage). Currently, user A on `www.waldo.click` and user B on `admin.waldo.click` are fully isolated because they run in different browser origins. After adding `domain: ".waldo.click"` to the JWT cookie, a user logged in on the website who navigates to the dashboard sends their JWT to the dashboard's Nitro server.

The Pinia store data (`me.store.ts`, `user.store.ts`, `ad.store.ts`, etc.) is stored in **localStorage**, which remains origin-scoped (`www.waldo.click` vs `admin.waldo.click`). So the JWT is shared but the Pinia state is not. This creates an asymmetric state: the dashboard sees a valid JWT and can authenticate the user but starts with empty stores — correct behavior.

The risk is the **reverse**: a user who was previously on the dashboard (as an admin) navigates to the website with the dashboard's JWT still in the shared cookie. The website will authenticate them as an admin user. Most website stores only cache non-sensitive data (categories, regions) but `me.store.ts` and `user.store.ts` will load the admin user's profile data.

**Why it matters:**
This is expected behavior for shared auth — but it means the logout flow on the dashboard MUST clear the shared cookie properly. If a dashboard admin does not explicitly log out and a non-admin user then opens the website in the same browser, the admin's JWT remains active.

**Prevention:**
- Ensure the dashboard logout composable (Pitfall 6) clears the domain-scoped cookie completely
- Consider adding a role check on the website's `auth` middleware: if `useStrapiUser()` has `role.type === "authenticated"` or above, allow; if somehow an admin role leaks, handle gracefully
- Document in code: "The domain cookie is shared between website and dashboard. Any user with a valid JWT on either subdomain will be authenticated on both."

**Phase to address:** Domain migration phase — the store isolation analysis must be done before deployment.

---

### Pitfall 9: `redirect` Cookie in Auth Middleware Has No Domain — Will Not Round-Trip Across Subdomains

**What goes wrong:**
The website's `auth.ts` middleware saves the attempted route in a cookie before redirecting to login:

```ts
// apps/website/app/middleware/auth.ts
useCookie("redirect", { path: "/" }).value = to.fullPath;
return navigateTo("/login");
```

This `redirect` cookie has no domain attribute (host-only, `www.waldo.click` only). If the website ever tries to redirect through the dashboard login (or vice versa), the `redirect` cookie will not survive the cross-subdomain round-trip. This is not a current problem but will become one if cross-subdomain authenticated redirects are added later.

**Why it matters:**
Low severity now, but the pattern establishes a trap. Any new cookies created without the domain attribute during this milestone will not be visible cross-subdomain.

**Prevention:**
If any new cookies are created during this milestone, audit whether they need cross-subdomain visibility. If they do, add `domain: ".waldo.click"`. If they don't (like this `redirect` cookie), leave them host-only and document why.

**Phase to address:** Domain migration phase — audit all `useCookie()` calls during the implementation to categorize each cookie's intended scope.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Add domain without clearing old cookie | Fast to deploy | 7-day window of dual cookies, zombie sessions | Never — always pair with old cookie cleanup |
| Set `domain: "waldo.click"` (no leading dot) | Works in most browsers | Fails in strict RFC implementations, Safari edge cases | Never — always use `.waldo.click` |
| Add `Secure: true` without environment conditional | Better security posture | Breaks all local HTTP development | Never — must be conditional on `NODE_ENV` |
| Skip creating dashboard `useLogout` composable | Saves time | Cookie cleanup fix is scattered across components, easy to miss one | Never — centralize logout before the domain change |
| Defer cookie migration cleanup to "after it expires" | No immediate work | The 7-day zombie session period is a real UX bug | Acceptable only if explicitly monitored and scheduled |

---

## Integration Gotchas

Common mistakes when connecting to external services or the module ecosystem.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `@nuxtjs/strapi` v2 `useStrapiToken` | Assuming `setToken(null)` clears the domain-scoped cookie correctly | It does clear the new cookie — but does NOT clear the old host-only one. Manual cleanup required. |
| `@nuxtjs/strapi` v2 `useStrapiAuth().logout()` | Trusting it handles all cookie cleanup | `logout()` only calls `setToken(null)` and `setUser(null)`. No HTTP `Set-Cookie` header is sent. Cookie clearing happens via `useCookie` ref assignment. |
| Nitro `server/` routes | Forgetting that `getCookie(event, 'waldo_jwt')` returns the FIRST match when two same-name cookies exist | Browser sends cookies in arbitrary order when multiple match. Server sees only one value. |
| `nuxt-security` module | Assuming security headers don't affect cookie attributes | `nuxt-security` can modify `Set-Cookie` headers. Always verify the raw response header in staging. |
| Laravel Forge deployment | Assuming HTTPS is already configured before testing Secure flag | Verify HTTPS certificate is valid on all subdomains before enabling `Secure: true`. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Two same-name cookies on every request | Every request to the server carries double the JWT payload (2× ~500 bytes) | Clear the old cookie immediately on deployment | During the 7-day migration window |
| `fetchUser()` called twice on subdomain navigation | Extra API call on first cross-subdomain page load | The `nuxt._cookies` cache in `useStrapiToken` prevents this — but only within the same Nuxt app instance | Not a concern — each app has its own instance |

---

## Security Mistakes

Domain-specific security issues introduced by cross-subdomain cookie sharing.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Setting `domain: ".waldo.click"` without `Secure` in production | JWT sent over HTTP if any subdomain is ever accidentally accessed via HTTP | Add `Secure: true` for non-local environments only |
| Not revoking JWT server-side on logout | After logout, the old host-only cookie (if not cleared) still grants valid access to Strapi APIs | Clear the old cookie client-side AND consider adding a server-side token revocation endpoint in Strapi |
| Sharing domain cookie between website (public) and dashboard (admin) | A compromised website subdomain (XSS) can steal the admin JWT if `httpOnly` is not set | `httpOnly` is not currently set — understand and accept this risk or add it. Note: `httpOnly: true` prevents `useStrapiToken`'s client-side JS from reading it. |
| Subdomain takeover via dangling DNS | If any `*.waldo.click` subdomain is ever abandoned with active DNS, an attacker could host there and steal the cookie | Only add `Domain=.waldo.click` to cookies that must be shared. Keep non-auth cookies host-only. |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Domain cookie added:** Often missing — cleanup of old host-only cookie. Verify: `document.cookie` in DevTools shows only ONE `waldo_jwt` after login, not two.
- [ ] **Logout works:** Often missing — verification on BOTH subdomains. Verify: log in on website, log out on dashboard (or vice versa), navigate back to website, confirm `useStrapiUser()` returns null.
- [ ] **`Secure` flag conditional:** Often missing — environment guard for local dev. Verify: local HTTP dev login still works after adding `Secure: true`.
- [ ] **Dashboard `useLogout` composable:** Often missing — dashboard logout may still use raw `useStrapiAuth().logout()` without store resets or old-cookie cleanup. Verify: all dashboard logout call sites use the composable.
- [ ] **Staging test on HTTPS:** Often missing — subdomain sharing may work on localhost but fail on production due to `nuxt-security` or proxy stripping the `Domain` attribute. Verify: inspect raw `Set-Cookie` header in staging Network tab.
- [ ] **Old cookies expired in users' browsers:** Often forgotten — after 7 days, the old host-only cookie has expired for all users. After that point, the old-cookie cleanup code can be removed. Set a calendar reminder.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Zombie cookies (Pitfall 1) after deploy | LOW | Deploy a Nitro server middleware that sets `waldo_jwt=; path=/; max-age=0` (no domain) on every response — forces all browsers to clear the old cookie within one page load |
| All users appear logged in after logout | LOW | Same as above — the middleware fix is non-breaking |
| Hydration mismatches (Pitfall 5) | MEDIUM | Add `nuxt.config.ts: ssr: false` temporarily on affected page(s) to suppress hydration while cookie migration window passes; re-enable after 7 days |
| `Secure` flag breaks local dev | LOW | Remove `Secure: true` from cookie config, add environment conditional, redeploy |
| `nuxt-security` strips `Domain` attribute | MEDIUM | Add explicit cookie configuration in `nuxt-security` options to allowlist the `Domain` attribute; or switch to Nitro server middleware for cookie setting |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Zombie cookies after logout (Pitfall 1) | Domain cookie migration phase | After login, verify ONE `waldo_jwt` in DevTools. After logout, verify ZERO. |
| `nuxt-security` stripping Domain attribute (Pitfall 2) | Staging verification phase | Inspect raw `Set-Cookie` header in staging Network tab |
| Unnecessary `SameSite=None` change (Pitfall 3) | Domain migration phase | Keep `SameSite` unset; add comment explaining why |
| `Secure: true` breaking local dev (Pitfall 4) | Domain migration phase | Login works on `http://localhost:3000` after change |
| SSR hydration mismatch during transition (Pitfall 5) | Domain migration phase + 7-day monitoring | No Vue hydration warnings in Sentry during the transition week |
| Dashboard missing `useLogout` composable (Pitfall 6) | Prerequisite step in domain migration phase | All dashboard logout call sites use the new composable |
| Leading dot in domain config (Pitfall 7) | Domain migration phase | Cookie appears as `.waldo.click` in DevTools, not `waldo.click` |
| Pinia store leakage analysis (Pitfall 8) | Domain migration phase — analysis step | Documented decision on which stores need cross-subdomain awareness |
| New `redirect` cookie scoping (Pitfall 9) | Domain migration phase — audit step | All new `useCookie()` calls documented with intended scope |

---

## Sources

- `@nuxtjs/strapi` v2 source, `useStrapiToken.ts` (verified 2026-03-16): `https://github.com/nuxt-modules/strapi/blob/main/src/runtime/composables/useStrapiToken.ts` — HIGH confidence
- `@nuxtjs/strapi` v2 source, `useStrapiAuth.ts` (verified 2026-03-16): `https://github.com/nuxt-modules/strapi/blob/main/src/runtime/composables/useStrapiAuth.ts` — HIGH confidence
- Nuxt 4 `useCookie` documentation (verified 2026-03-16): `https://nuxt.com/docs/api/composables/use-cookie` — HIGH confidence (official, current)
- MDN HTTP Cookies — Domain attribute semantics (verified 2026-03-16): `https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies` — HIGH confidence
- RFC 6265 cookie specification — Domain matching: `https://datatracker.ietf.org/doc/html/rfc6265#section-5.2.3` — HIGH confidence
- Project codebase (direct inspection, 2026-03-16):
  - `apps/website/nuxt.config.ts` — cookie config: `{ path: "/", maxAge: 604800, cookieName: "waldo_jwt" }` — no domain attribute
  - `apps/dashboard/nuxt.config.ts` — same cookie config (identical)
  - `apps/website/app/composables/useLogout.ts` — calls `useStrapiAuth().logout()` after store resets
  - `apps/website/app/middleware/auth.ts` — `redirect` cookie without domain attribute
  - `apps/dashboard/app/composables/` — no `useLogout.ts` found

---
*Pitfalls research for: Cross-subdomain cookie sharing, Nuxt 4 + @nuxtjs/strapi v2*
*Researched: 2026-03-16*
