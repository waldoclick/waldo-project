# Feature Landscape

**Domain:** Cross-subdomain shared authentication session — multi-app cookie SSO
**Project:** Waldo — Classified ads platform (Strapi v5 + Nuxt 4)
**Researched:** 2026-03-16
**Milestone scope:** Subsequent milestone. Platform already has cookie-based JWT auth with `cookieName: "waldo_jwt"` in both apps, `@nuxtjs/strapi` v2 `useStrapiAuth()` for login/logout, `guard.global.ts` in dashboard checks manager role, and `useLogout` composable that resets all stores.

---

## Critical Context: What Already Exists

Everything below is verified from direct code inspection (HIGH confidence).

| Concern | Current State |
|---------|--------------|
| **Cookie name** | Both apps use `cookieName: "waldo_jwt"` in `nuxt.config.ts` |
| **Cookie config** | `cookie: { path: "/", maxAge: 604800 }` — no `domain` attribute. Without `domain`, the browser scopes the cookie to the exact host that set it. `waldo.click` and `dashboard.waldo.click` are different hosts → each app operates with its own isolated `waldo_jwt` cookie. |
| **Token storage** | `useStrapiToken()` in `@nuxtjs/strapi` v2 calls `useCookie(config.strapi.cookieName, config.strapi.cookie)`. The `cookie` object is passed directly to Nuxt's `useCookie()`, which accepts full `CookieOptions` including `domain`. |
| **Logout (website)** | `useLogout` composable: resets 6 stores → calls `strapiLogout()` → calls `setToken(null)` → sets `cookie.value = null`. This clears the cookie. But: clearing a cookie requires matching `name + path + domain`. If the cookie was set without `domain`, it can only be cleared without `domain`. |
| **Logout (dashboard)** | `guard.global.ts` calls `const { logout } = useStrapiAuth(); await logout()`. Same mechanism — no store resets, just token clear. |
| **Role enforcement** | `guard.global.ts`: checks `user.value?.role?.name?.toLowerCase() === "manager"`. Non-managers are logged out immediately. |
| **Token internals** | `useStrapiAuth().logout()` → `setToken(null)` → `setUser(null)`. No HTTP call to Strapi, no server-side session invalidation. JWT is stateless — revocation only happens by deleting the cookie. |
| **`@nuxtjs/strapi` CookieOptions** | `cookie?: CookieOptions` in `ModuleOptions` — accepts Nuxt's `CookieOptions`, which includes `domain`. Adding `domain: ".waldo.click"` to the `cookie` config in both apps is the minimal mechanical change required. |
| **Domain structure** | Website: `waldo.click`. Dashboard: `dashboard.waldo.click`. Same registrable domain (`waldo.click`) → shared domain cookie `.waldo.click` is browser-allowed (RFC 6265: a server at `waldo.click` can set `Domain=.waldo.click` for itself and all subdomains). |

---

## Table Stakes

Features users expect. Missing = the shared session feels broken or confusing.

| Feature | Why Expected | Complexity | Dependency |
|---------|--------------|------------|------------|
| **Cookie domain attribute** | Without `domain: ".waldo.click"`, the cookie never crosses the subdomain boundary. This is the foundational mechanical requirement. Users who log in on `waldo.click` will not be recognized on `dashboard.waldo.click`, and vice versa. | **Low** — one-line change in both `nuxt.config.ts` files. | None — prerequisite for everything else. |
| **Session persistence on cross-app navigation** | A user logged in on the website who navigates to the dashboard URL should already be recognized (if they have the manager role). The `guard.global.ts` middleware already reads from `useStrapiUser()` which reads from the shared cookie. With the cookie domain fixed, this works automatically — no additional code. | **None** — automatic once domain is set. | Cookie domain attribute. |
| **Logout clears session across both apps** | When a user logs out in the website, the next visit to the dashboard should require re-login (and vice versa). Today, the website's `useLogout` calls `strapiLogout()` which sets `cookie.value = null`. For this to clear the shared cookie, the logout call must include the same `domain` attribute that was used to create the cookie. If a cookie was created with `domain: ".waldo.click"`, it must be cleared with `domain: ".waldo.click"`. | **Low** — if cookie config is symmetric (both apps use same `domain` in their `strapi.cookie` config), logout automatically clears the shared cookie. No code change beyond the domain config. | Cookie domain attribute must be present in both apps' cookie config. |
| **Dashboard role enforcement unchanged** | After sharing the session, the dashboard's `guard.global.ts` must still block non-manager users. A regular website user who happens to have a valid JWT should be logged out of the dashboard immediately. The existing role check already handles this — it calls `logout()` and redirects to `/auth/login` when `roleName !== "manager"`. No change needed. | **None** — existing behavior preserved automatically. | Cookie domain attribute. |

---

## Differentiators

Features that improve UX beyond the mechanical requirement.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Website auto-detects when session is invalidated** | If a dashboard admin changes a user's role or Strapi invalidates a JWT, the website should gracefully degrade to the logged-out state (not break). Today, `useStrapiAuth().fetchUser()` is called on app init — if the token is invalid, it calls `setToken(null)`. This already works. Explicitly testing this edge case ensures no regression. | Low — testing, not code. | Verify `fetchUser()` error path clears token on 401. |
| **`SameSite: Lax` on shared cookie** | The current cookie config has no explicit `SameSite` attribute. Nuxt's `useCookie` defaults to `SameSite: Lax`. For cross-subdomain cookies with `Domain=.waldo.click`, `SameSite=Lax` is correct: it allows the cookie to be sent on top-level navigations (user clicks a link from website to dashboard) but blocks third-party request embedding. This is both secure and UX-correct. Explicitly setting `sameSite: "lax"` documents the intent. | Near-zero — one additional field in cookie config. | Best practice to document, not strictly required (Lax is already the default). |
| **Cookie `Secure: true` on production** | With `domain: ".waldo.click"`, a cookie that is accessible across all subdomains is a higher-value target. Ensuring `secure: true` is set on non-local environments limits exposure to HTTPS connections only. The current config does not explicitly set `secure`. | Low — conditional in `nuxt.config.ts`, same pattern as the existing `NODE_ENV !== "local"` CSP guard. | Best practice for production. |

---

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Custom SSO redirect flow** | This is not a cross-organization SSO problem (no SAML, no OAuth exchange needed). Both apps share the same Strapi backend and the same JWT issuer. A shared cookie is the correct, minimal solution. Building a redirect-based SSO adds complexity with zero benefit. | Just add `domain: ".waldo.click"` to cookie config. |
| **Server-side session invalidation (session store)** | Strapi JWTs are stateless. The token is valid until expiry regardless of what Strapi does (no server-side session to invalidate). Building a session blacklist or Redis session store is a significant architectural change that is out of scope. | Accept the stateless model. When a user's role changes, the dashboard's `guard.global.ts` will catch it on the next page navigation and force re-login. This is acceptable behavior. |
| **`__Host-` prefixed cookie** | The `__Host-` prefix prevents the `Domain` attribute from being set — meaning the cookie is locked to the exact host, preventing cross-subdomain sharing. Using this prefix would defeat the entire milestone. | Use a plain `waldo_jwt` cookie name (as it already is) with `domain: ".waldo.click"`. |
| **Two separate cookies (one per app)** | Having `waldo_jwt` for website and `waldo_jwt_dashboard` for dashboard means logout from one app does not affect the other. Users would be confused seeing themselves logged in on one app after logging out on another. | Use the same cookie name (`waldo_jwt`) with the same `domain` attribute in both apps. The shared cookie is read by both `useStrapiToken()` instances transparently. |
| **Cookie-clearing Nitro endpoint** | Implementing a server-side `/api/logout` endpoint that manually sets `Max-Age: 0` is unnecessary overhead. The `useStrapiAuth().logout()` → `setToken(null)` → `cookie.value = null` path already correctly clears the cookie when the `domain` attribute is symmetric. | Let the existing client-side logout clear the cookie. No new endpoint needed. |
| **Wildcard subdomain matching in CSP** | The current CSP in both apps scopes `connect-src` to specific URLs. Changing this to `*.waldo.click` to accommodate the shared session would over-expand the attack surface. | Keep the existing specific CSP entries. The shared session cookie does not change which endpoints are called — only which hosts can read the cookie. |

---

## Feature Deep-Dives

### Feature 1: The Cookie Domain Mechanics

**What needs to change (HIGH confidence — verified from `@nuxtjs/strapi` source and MDN):**

```typescript
// In BOTH apps/website/nuxt.config.ts AND apps/dashboard/nuxt.config.ts
strapi: {
  cookieName: "waldo_jwt",
  cookie: {
    path: "/",
    maxAge: process.env.SESSION_MAX_AGE
      ? Number.parseInt(process.env.SESSION_MAX_AGE)
      : 604800,
    // ADD THIS:
    domain: process.env.NODE_ENV !== "local" ? ".waldo.click" : undefined,
    // Optional but explicit best practice:
    secure: process.env.NODE_ENV !== "local",
    sameSite: "lax",
  },
}
```

**Why `domain: ".waldo.click"` (with leading dot) matters:**
- RFC 6265 / browser behavior: a server at `waldo.click` can set a cookie for `.waldo.click` (itself + all subdomains) or for `waldo.click` (exact host only). The leading dot is the conventional prefix meaning "all subdomains."
- Modern browsers (RFC 6265 compliant) treat `Domain=waldo.click` and `Domain=.waldo.click` identically — both include subdomains. But using the dot prefix is explicit and unambiguous.
- `Domain=dashboard.waldo.click` would be rejected by `waldo.click` (a server can only set `Domain` to its own domain or a parent, not a sibling subdomain).

**Why `undefined` for local (not `.localhost`):**
- `Domain=.localhost` is unreliable across browsers. Some browsers reject it, some accept only `localhost`.
- Local dev runs on `localhost:3000` (website) and `localhost:3001` (dashboard) — these are different origins. In local dev, the shared session does not work and doesn't need to. Cross-app auth is only relevant in production/staging where real subdomain DNS exists.
- Setting `domain: undefined` in local mode leaves the cookie host-scoped to the exact origin, which is the correct dev behavior.

**The logout symmetry requirement:**
- Nuxt's `useCookie` with `cookie.value = null` sends `Set-Cookie: waldo_jwt=; Max-Age=0; Path=/; Domain=.waldo.click` if `domain: ".waldo.click"` is configured.
- If the cookie was created with `domain: ".waldo.click"`, it **must** be cleared with `domain: ".waldo.click"`. A mismatch means the browser has two cookies: one scoped to `.waldo.click` (the original) and a new zero-size one scoped to the host-only — the original persists. This is a known logout-breaking bug.
- Solution: ensure both apps' `strapi.cookie` config are **identical** in the `domain` field. Since `@nuxtjs/strapi` uses the same `config.strapi.cookie` for both create and clear operations, this is automatically correct when the config is symmetric.

---

### Feature 2: Dashboard Role Enforcement After Session Sharing

**Scenario: Regular website user visits `dashboard.waldo.click`**

With the shared cookie, a logged-in website user now has their JWT readable by the dashboard. The existing `guard.global.ts` flow:

```typescript
const user = useStrapiUser() as Ref<User | null>;
if (!user.value) {
  // Redirect to login — JWT is present but user hasn't been fetched yet
}
const roleName = user.value?.role?.name?.toLowerCase() || null;
if (roleName !== "manager") {
  const { logout } = useStrapiAuth();
  await logout();
  return navigateTo("/auth/login");
}
```

**What happens now (HIGH confidence — verified from source):**
1. Website user has `waldo_jwt` cookie (shared `domain: ".waldo.click"`).
2. User navigates to `dashboard.waldo.click`.
3. Dashboard's Nuxt SSR server calls `fetchUser()` via the cookie → Strapi returns user with `role: { name: "Authenticated" }`.
4. `guard.global.ts` finds `roleName !== "manager"` → calls `logout()` → clears cookie → redirects to `/auth/login`.
5. **Side effect**: the shared cookie is now cleared for BOTH apps. The user is logged out of the website too.

**Is this acceptable behavior?**
- For most multi-app setups: YES. Attempting to access a privileged app with wrong credentials should terminate the session platform-wide. This is consistent with how enterprise SSO (OAuth/SAML) works — one logout, all apps.
- If the desired behavior is "log out of dashboard only, keep website session", that requires separate cookie names or a post-logout re-issue mechanism — significantly more complex and not a standard pattern.

**Recommendation:** Accept the current behavior. Document it explicitly: "Accessing the dashboard with a non-manager account terminates the shared session."

**One nuance:** The dashboard's `guard.global.ts` calls `useStrapiAuth().logout()` which does NOT call `useLogout` (the website composable that resets Pinia stores). This is correct — the dashboard has no website stores to reset. The website stores will reset naturally when the user next loads the website and Pinia initializes fresh (persisted stores will have stale data until `fetchUser()` fails and clears the token).

**Optional improvement:** After the guard calls `logout()` for a non-manager, the website's persisted Pinia stores still hold the user's cached data until the user loads the website. This is a minor inconsistency but not a security issue (no sensitive data exposed — the JWT is cleared). If this causes visible stale data on the website, the fix would be a post-logout redirect to the website that triggers store resets. This is a differentiator, not a table stake.

---

### Feature 3: SameSite and Security Considerations

**SameSite behavior for cross-subdomain navigation (MEDIUM confidence — MDN + RFC 6265bis):**

`SameSite=Lax` (the current default) does NOT treat `waldo.click` and `dashboard.waldo.click` as cross-site. Per browser same-site definition:
- "Same site" = same registrable domain (eTLD+1). `waldo.click` has registrable domain `waldo.click`.
- Both `waldo.click` and `dashboard.waldo.click` share the same eTLD+1.
- Therefore, navigation between them is `same-site`, and `SameSite=Lax` cookies ARE sent.

This means:
- A user navigating from `waldo.click` to `dashboard.waldo.click` via a link: cookie is sent. ✓
- A third-party site embedding an iframe of `waldo.click` and trying to steal the shared session: `SameSite=Lax` blocks this. ✓
- No `SameSite=None` (with its `Secure` requirement) is needed.

**CSRF considerations:**
- Both apps use Nitro proxy to communicate with Strapi. State-changing requests go through `POST /api/...` on the Nitro server.
- The OWASP guidance for API-driven apps recommends custom headers or `SameSite` as CSRF mitigation. `SameSite=Lax` is sufficient for navigational access.
- Adding `Secure: true` in production is standard hygiene for any auth cookie.

---

## Feature Dependencies

```
1. Add domain: ".waldo.click" to strapi.cookie in BOTH nuxt.config.ts files
   ↓ [prerequisite for everything below]

2. Cookie is now shared across waldo.click and dashboard.waldo.click
   ↓ automatically enables →
   ├─ Website login recognized on dashboard visit
   ├─ Dashboard login recognized on website (user sees their data immediately)
   ├─ Logout from either app clears the shared session
   └─ Dashboard guard.global.ts still enforces manager role (unchanged behavior)

3. Optional: Add secure: true (production only) and sameSite: "lax" to document intent
   [independent, can ship together or separately]
```

---

## MVP Recommendation

**The entire table stakes requirement is a single, symmetric config change in both `nuxt.config.ts` files.**

```
Change in apps/website/nuxt.config.ts:
  strapi.cookie → add domain: process.env.NODE_ENV !== "local" ? ".waldo.click" : undefined

Change in apps/dashboard/nuxt.config.ts:
  strapi.cookie → add domain: process.env.NODE_ENV !== "local" ? ".waldo.click" : undefined
```

**Test matrix (required before shipping):**

| Scenario | Expected Outcome |
|----------|-----------------|
| Log in on website → visit dashboard (manager) | Dashboard recognizes session, no re-login required |
| Log in on website → visit dashboard (non-manager) | Dashboard `guard.global.ts` logs out, redirects to `/auth/login`; website session also cleared |
| Log out on website → visit dashboard | Dashboard shows `/auth/login` (no cookie to authenticate) |
| Log out on dashboard → visit website | Website shows logged-out state (cookie cleared) |
| Log in on dashboard → visit website | Website `useStrapiUser()` populates from shared cookie |
| Verify local dev unaffected | Both apps function independently as before (no shared session in local dev) |

**What NOT to ship:**
- Custom SSO redirect flows
- Server-side session store or JWT blacklist
- Separate per-app cookies
- New API endpoints for logout

**Defer:**
- Post-logout store reset synchronization (website stores show stale data after dashboard forced-logout): minor UX issue, not a security concern, deferred to a future polish milestone.

---

## Sources

| Source | Confidence | Reference |
|--------|------------|-----------|
| MDN — HTTP cookies, `Domain` attribute | HIGH | https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies#define_where_cookies_are_sent |
| MDN — `Set-Cookie` header | HIGH | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie |
| RFC 6265 — HTTP State Management Mechanism | HIGH | https://datatracker.ietf.org/doc/html/rfc6265 |
| OWASP CSRF Prevention — SameSite and CORS guidance | HIGH | https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html |
| `@nuxtjs/strapi` v2 source — `useStrapiToken.js`, `useStrapiAuth.js` | HIGH | `/node_modules/@nuxtjs/strapi/dist/runtime/composables/` (direct inspection) |
| `@nuxtjs/strapi` v2 `ModuleOptions` types — `cookie?: CookieOptions` | HIGH | `/node_modules/@nuxtjs/strapi/dist/module.d.mts` (direct inspection) |
| Codebase — `apps/website/nuxt.config.ts` | HIGH | `strapi.cookie` = `{ path: "/", maxAge: 604800 }` — no `domain` attribute (direct inspection) |
| Codebase — `apps/dashboard/nuxt.config.ts` | HIGH | Same cookie config; `cookieName: "waldo_jwt"` identical in both apps (direct inspection) |
| Codebase — `apps/website/app/composables/useLogout.ts` | HIGH | `strapiLogout()` → `setToken(null)` → `cookie.value = null` — cookie clear path (direct inspection) |
| Codebase — `apps/dashboard/app/middleware/guard.global.ts` | HIGH | Role check + `useStrapiAuth().logout()` — non-manager forced logout (direct inspection) |
