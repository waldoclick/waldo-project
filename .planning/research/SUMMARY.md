# Project Research Summary

**Project:** Waldo — Cross-subdomain shared authentication session (v1.40)
**Domain:** Cookie-based SSO across `waldo.click` + `dashboard.waldo.click`
**Researched:** 2026-03-16
**Confidence:** HIGH

## Executive Summary

This milestone enables a shared JWT session between `waldo.click` (website) and `dashboard.waldo.click` (dashboard) so users logged in on one app are automatically recognized on the other — without any redirect-based SSO, custom session store, or new packages. The entire mechanism is a pure config change: adding `domain: ".waldo.click"` to the `strapi.cookie` block in both `nuxt.config.ts` files. The `@nuxtjs/strapi` v2 module passes the cookie options object verbatim to Nuxt's `useCookie()`, which already supports the `domain` attribute natively via `cookie-es`. Both apps already use the identical cookie name `waldo_jwt`, so once the domain attribute is set, the browser's shared cookie store handles the rest automatically.

The recommended approach is a minimal, dependency-free config change guarded by a `COOKIE_DOMAIN` env var (set to `.waldo.click` in production, unset in local dev). This preserves full local-dev functionality while enabling cross-subdomain sharing in all deployed environments. No new composables, Nitro middleware, or library additions are required for the core feature. The only code change beyond config is a one-time old-cookie cleanup in `useLogout.ts` and the creation of a centralized `useLogout` composable on the dashboard (which currently lacks one).

The primary risk is a 7-day zombie-cookie window immediately after deployment: existing users carry a host-only `waldo_jwt` cookie (set without a domain attribute) alongside the new domain-scoped one. If the old cookie is not explicitly cleared at logout, users cannot fully log out. This cleanup must land in the same commit as the domain change — it is a prerequisite, not a polish step. Secondary risks include `nuxt-security` silently stripping the `Domain` attribute in production (verify raw `Set-Cookie` header in staging) and SSR hydration mismatches during the dual-cookie migration window.

---

## Key Findings

### Recommended Stack

Zero new packages required. All necessary APIs are already installed and version-compatible. The `@nuxtjs/strapi@2.1.1` module's `cookie` config field accepts Nuxt's own `CookieOptions` type (which extends `CookieSerializeOptions` from `cookie-es@2.0.0`), and the `domain` field is valid and typed. `nuxt-security@2.4.0` does not interfere with cookie domain attributes (it only sets HTTP response security headers). The correct implementation pattern is a conditional spread — `...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})` — which omits the `domain` key entirely when the env var is unset, safer than passing `undefined` or an empty string.

**Core technologies (unchanged — no additions):**
- `@nuxtjs/strapi@2.1.1`: JWT cookie management — `cookie` config passes through to `useCookie` verbatim; `domain` field is typed and supported
- `nuxt@^4.1.3`: `useCookie()` — domain option documented and stable; SSR reads from `Cookie` request header via `cookie-es` parse
- `cookie-es@2.0.0`: Cookie serialization (transitive dep) — `CookieSerializeOptions.domain?: string` fully supported
- `h3` (Nitro bundled): `setCookie()` supports `domain` in `CookieSerializeOptions` — relevant only if server routes ever manually write the JWT (none do currently)

### Expected Features

The entire table stakes requirement is a single symmetric config change in both `nuxt.config.ts` files. All downstream behaviors (session persistence on cross-app navigation, cross-app logout, dashboard role enforcement) activate automatically once the domain attribute is in place — no additional logic required.

**Must have (table stakes):**
- **Cookie domain attribute** — `domain: ".waldo.click"` in both apps' `strapi.cookie` config; without this, cross-subdomain session sharing is architecturally impossible
- **Session persistence on cross-app navigation** — automatic once domain is set; `guard.global.ts` already reads from `useStrapiUser()` which reads the shared cookie
- **Logout clears session across both apps** — automatic when cookie config is symmetric; `setToken(null)` issues `Set-Cookie: waldo_jwt=; Domain=.waldo.click; Max-Age=-1`, which deletes the cookie for all subdomains
- **Dashboard role enforcement unchanged** — existing `guard.global.ts` manager check is unaffected; non-manager website users are forced-logged-out on dashboard access (side effect: shared cookie is cleared, logging user out of website too — documented and acceptable)

**Should have (differentiators):**
- **Explicit `sameSite: "lax"` with inline comment** — browser already defaults to Lax; adding the value documents intent and prevents future accidental change to `strict` or `none`
- **`Secure: true` on production** — conditional on `NODE_ENV !== "local"`; best practice for any auth cookie spanning multiple subdomains
- **Centralized `useLogout` composable on dashboard** — mirrors the website pattern; required prerequisite for applying the old-cookie cleanup uniformly across all dashboard logout call sites

**Defer (v2+):**
- Post-logout website store reset when forced-logout originates from the dashboard (minor stale-data UX issue, not a security concern; Pinia stores are origin-scoped to localStorage, not shared)
- Server-side JWT revocation / session blacklist (stateless JWT model is intentional and accepted)

**Anti-features (do not build):**
- Custom SSO redirect flow — not needed; same Strapi backend, same JWT issuer
- Separate per-app cookie names — defeats shared session
- Cookie-clearing Nitro endpoint — existing client-side `setToken(null)` path handles deletion correctly when cookie config is symmetric
- `__Host-` prefixed cookie name — explicitly prevents `Domain` attribute (RFC restriction)
- `domain: ".localhost"` in local dev — inconsistent browser support; local dev does not need cross-subdomain sharing

### Architecture Approach

The change surface is minimal: two config files, two `.env.example` files, and one new composable. No new files in Strapi. The browser's shared cookie store is the only cross-app communication medium — there is no direct app-to-app network communication. Strapi issues JWTs in the JSON response body and never writes cookies; all cookie writes happen via `useStrapiToken` in each Nuxt app.

**Major components:**
1. `apps/website/nuxt.config.ts` — add conditional domain spread to `strapi.cookie` block
2. `apps/dashboard/nuxt.config.ts` — identical change; symmetry is required for logout clearing to work
3. `COOKIE_DOMAIN` env var — production value `.waldo.click`; absent in local dev (absent key = no `Domain` attribute in cookie)
4. `apps/website/app/composables/useLogout.ts` — add explicit client-side clear of old host-only cookie (`document.cookie = "waldo_jwt=; path=/; max-age=0"`) before calling `strapiLogout()`
5. `apps/dashboard/app/composables/useLogout.ts` — new file; centralize dashboard logout; wire all existing call sites to use it

**Data flow:**
```
Login on waldo.click
  → setToken(jwt) → useCookie writes: Set-Cookie: waldo_jwt=<jwt>; Path=/; Domain=.waldo.click; SameSite=Lax
  → browser stores cookie scoped to .waldo.click
  → GET dashboard.waldo.click → browser sends: Cookie: waldo_jwt=<jwt> (automatic — domain matches)
  → Nitro SSR reads Cookie header → fetchUser() → guard.global.ts enforces manager role
```

### Critical Pitfalls

1. **Zombie cookies after deploy** — The existing host-only `waldo_jwt` (no domain attr) coexists with the new domain-scoped cookie for up to 7 days (maxAge). `setToken(null)` clears the new cookie but NOT the old one. Users remain "logged in" after logout. **Prevention:** Add `document.cookie = "waldo_jwt=; path=/; max-age=0"` in `useLogout.ts` before `strapiLogout()`. Must ship in the same commit as the domain change.

2. **`nuxt-security` stripping `Domain` attribute in production** — `nuxt-security` is disabled in local mode (`NODE_ENV=local`). The cookie works locally but may fail in staging/production if the module modifies `Set-Cookie` headers. **Prevention:** Inspect the raw `Set-Cookie` response header in staging Network tab before declaring the milestone complete.

3. **SSR hydration mismatch during migration window** — Two same-name cookies with different scopes are sent in arbitrary browser order; server and client may resolve to different JWT values, causing hydration warnings and auth state flicker. **Prevention:** Optionally add a Nitro server middleware that clears the old host-only cookie on the first post-migration request; monitor Sentry for hydration errors for 7 days post-deploy.

4. **Dashboard missing `useLogout` composable** — Dashboard logout is scattered across individual components. The old-cookie cleanup fix must be applied to every call site, and if there is no centralized composable, it is easy to miss one. **Prevention:** Create `apps/dashboard/app/composables/useLogout.ts` as a prerequisite before the domain cookie change lands.

5. **`Secure: true` breaking local HTTP development** — If added without an environment conditional, the JWT cookie is never stored over `http://localhost`; login silently fails with no error. **Prevention:** Always guard with `...(process.env.NODE_ENV !== "local" && { secure: true })`.

---

## Implications for Roadmap

This is a tightly scoped, low-complexity milestone. The natural decomposition is three sequential phases: one prerequisite, one core change, and one staging verification gate.

### Phase 1: Prerequisite — Dashboard `useLogout` Composable

**Rationale:** The dashboard has no centralized logout composable (verified from codebase inspection — `apps/dashboard/app/composables/` contains no `useLogout.ts`). The old-cookie cleanup (Pitfall 1) must be applied to ALL logout call sites in both apps simultaneously. Without centralizing dashboard logout first, the cleanup is scattered and easy to miss.

**Delivers:** `apps/dashboard/app/composables/useLogout.ts` mirroring the website pattern; all dashboard logout call sites (components, middleware) wired to use it; Pinia store isolation audit documented.

**Addresses:** Table stakes — logout correctness; Pitfall 6 (missing dashboard composable); Pitfall 8 (Pinia store cross-subdomain analysis).

**Avoids:** Fragmented old-cookie cleanup; silent zombie sessions from missed call sites.

**Research flag:** Standard pattern — mirrors existing `apps/website/app/composables/useLogout.ts`. No phase research needed.

---

### Phase 2: Core — Cookie Domain Migration

**Rationale:** The mechanical change is a single symmetric edit in both `nuxt.config.ts` files plus the `COOKIE_DOMAIN` env var. Several co-shipped elements are mandatory and cannot be split: the old-cookie cleanup in `useLogout.ts`, an inline comment documenting intentional `SameSite` omission, and `.env.example` updates. All must land atomically to avoid the zombie-cookie window.

**Delivers:**
- Conditional domain spread in `strapi.cookie` (both apps): `...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})`
- `COOKIE_DOMAIN=.waldo.click` documented in both `.env.example` files
- Explicit old host-only cookie clear in website `useLogout.ts` and dashboard `useLogout.ts`
- Optional (recommended): `...(process.env.NODE_ENV !== "local" && { secure: true })` and inline `// sameSite intentionally unset — browser defaults to Lax, correct for same-site subdomain sharing` comment

**Uses:** `@nuxtjs/strapi@2.1.1` (already installed), `useCookie` domain option, `cookie-es` serialization.

**Implements:** Conditional domain spread pattern (mirrors existing conditional spread used for `security` config in website).

**Avoids:** Pitfall 1 (zombie cookies — old-cookie cleanup co-shipped), Pitfall 3 (no `SameSite` change needed), Pitfall 4 (`Secure` env-conditional), Pitfall 7 (leading dot in `.waldo.click` value).

**Research flag:** No phase research needed — all stack and API behavior verified from installed package source and official Nuxt 4 docs.

---

### Phase 3: Verification — Staging Smoke Test

**Rationale:** `nuxt-security` is disabled in local dev; the most important validation (Pitfall 2) can only be performed in a staging environment with real subdomains, real HTTPS, and `COOKIE_DOMAIN` set. All 6 test matrix scenarios must pass before declaring the milestone complete. A 7-day Sentry monitoring window should be started after deploy to catch any hydration mismatches during the dual-cookie transition.

**Delivers:** Verified cross-subdomain session sharing in staging; signed-off test matrix; 7-day monitoring window initiated.

**Test matrix:**

| Scenario | Expected |
|----------|---------|
| Login on website → visit dashboard (manager) | Recognized, no re-login required |
| Login on website → visit dashboard (non-manager) | Forced logout; website session also cleared |
| Logout on website → visit dashboard | Dashboard shows `/auth/login` |
| Logout on dashboard → visit website | Website shows logged-out state |
| Login on dashboard → visit website | Website reads shared cookie; user data loaded |
| Local dev login (no `COOKIE_DOMAIN`) | Unaffected; cookie scoped to `localhost` origin only |

**Avoids:** Pitfall 2 (`nuxt-security` silently stripping domain), Pitfall 5 (SSR hydration mismatch).

**Research flag:** No research needed — verification is manual testing, not new code.

---

### Phase Ordering Rationale

- **Phase 1 before Phase 2:** The dashboard `useLogout` composable must exist before the domain cookie change lands — the old-cookie cleanup must cover every logout call site atomically.
- **Phase 2 atomicity:** The domain config change and the old-cookie cleanup are inseparable — deploying one without the other creates a zombie-cookie window that lasts up to 7 days with no recovery except waiting.
- **Phase 3 is non-optional:** `nuxt-security` behavior differs between local and production; the only valid way to confirm Pitfall 2 is a real HTTPS staging deployment.
- **No Phase 4:** The post-logout website store reset (stale Pinia data after dashboard-forced-logout) is a minor UX issue explicitly deferred. Pinia stores are origin-scoped via localStorage; no security exposure.

### Research Flags

Phases with standard patterns (skip research-phase):
- **Phase 1:** Mirrors existing `useLogout.ts` on the website — well-understood, no unknowns.
- **Phase 2:** All APIs verified from installed package source and official Nuxt 4 docs; no unknowns. Conditional spread pattern is already used elsewhere in the codebase.
- **Phase 3:** Manual test matrix; no technical unknowns.

No phases require `/gsd-research-phase` during planning. All research findings are HIGH confidence from direct source inspection.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All findings from installed `node_modules/` source (useStrapiToken.js, module.d.mts, cookie-es types, nuxt-security config) and official Nuxt 4 docs; no version upgrades required |
| Features | HIGH | Verified from direct codebase inspection of both `nuxt.config.ts` files, `useLogout.ts`, `guard.global.ts`, and `@nuxtjs/strapi` source; cookie name identity confirmed |
| Architecture | HIGH | Data flow verified from `@nuxtjs/strapi` source; SSR cookie read path (parse of Cookie header) and write path (Set-Cookie via setCookie) both confirmed from Nuxt internals |
| Pitfalls | HIGH | Critical pitfalls sourced from RFC 6265, MDN, browser behavior, codebase audit; dual-cookie zombie scenario is a well-documented HTTP cookie migration trap |

**Overall confidence:** HIGH

### Gaps to Address

- **`nuxt-security` interaction with `Domain` attribute in production:** Confirmed from installed source that `nuxt-security` does not modify `Set-Cookie` headers, but end-to-end behavior in the production security header stack has not been tested. Phase 3 staging verification is the resolution gate.
- **Dashboard logout call sites enumeration:** The research confirmed absence of a `useLogout` composable on the dashboard but did not enumerate every individual component calling `useStrapiAuth().logout()` directly. Phase 1 implementation must audit all call sites before centralizing.
- **Browser cookie ordering during dual-cookie window:** When two same-name cookies match a request, the browser sends them in an unspecified order. The server sees only the first value from `parse(cookieHeader)`. Which takes precedence (old host-only vs. new domain-scoped) is browser-dependent. The 7-day Sentry monitoring window accounts for this uncertainty; the explicit old-cookie cleanup minimizes the duration of this ambiguity.

---

## Sources

### Primary (HIGH confidence — installed source code)
- `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiToken.js` — confirmed verbatim `useCookie(cookieName, config.strapi.cookie)` passthrough
- `node_modules/@nuxtjs/strapi/dist/module.d.mts` — `cookie?: CookieOptions` type confirmed; `CookieOptions` extends `CookieSerializeOptions` which includes `domain?: string`
- `node_modules/cookie-es/dist/index.d.mts` — `CookieSerializeOptions.domain?: string | undefined` confirmed
- `node_modules/nuxt/dist/app/composables/cookie.js` — SSR read path (`parse(getRequestHeader(event, "cookie"))`); write path (`setCookie(event, name, value, opts)`) confirmed
- `node_modules/nuxt-security/dist/defaultConfig.mjs` — confirmed no `Set-Cookie` header manipulation
- `apps/website/nuxt.config.ts`, `apps/dashboard/nuxt.config.ts` — `cookieName: "waldo_jwt"` identical in both; current `strapi.cookie` has no `domain` attribute
- `apps/website/app/composables/useLogout.ts` — logout path confirmed (`strapiLogout()` → `setToken(null)`)
- `apps/dashboard/app/middleware/guard.global.ts` — role enforcement and `useStrapiAuth().logout()` usage confirmed

### Secondary (HIGH confidence — official docs and specifications)
- `nuxt.com/docs/api/composables/use-cookie` — `domain` option documented (fetched 2026-03-16)
- `github.com/nuxt-modules/strapi` — `ModuleOptions.cookie: CookieOptions` confirmed (fetched 2026-03-16)
- `github.com/h3js/h3/blob/main/src/utils/cookie.ts` — `setCookie` accepts `CookieSerializeOptions` with `domain` (fetched 2026-03-16)
- RFC 6265 — Domain attribute semantics and subdomain matching rules
- MDN — HTTP Cookies, `Set-Cookie` header, `SameSite` attribute behavior
- OWASP CSRF Prevention Cheat Sheet — `SameSite=Lax` guidance for same-site subdomain contexts

---
*Research completed: 2026-03-16*
*Ready for roadmap: yes*
