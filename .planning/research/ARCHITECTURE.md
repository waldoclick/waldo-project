# Architecture Research

**Domain:** Cross-subdomain shared authentication session via cookies — Nuxt 4 + Strapi v5 monorepo
**Researched:** 2026-03-16
**Confidence:** HIGH — All findings sourced from direct codebase and dependency source inspection

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Browser (waldo.click domain)                          │
│                                                                          │
│  ┌──────────────────────┐        ┌──────────────────────────────────┐   │
│  │  www.waldo.click      │        │  dashboard.waldo.click            │   │
│  │  (apps/website)       │        │  (apps/dashboard)                 │   │
│  │  Nuxt 4 / SSR         │        │  Nuxt 4 / SSR                    │   │
│  │                       │        │                                   │   │
│  │  strapi.cookie:       │        │  strapi.cookie:                   │   │
│  │   domain:.waldo.click │        │   domain:.waldo.click             │   │
│  └──────────┬────────────┘        └───────────────┬──────────────────┘   │
│             │  Cookie: waldo_jwt (Domain=.waldo.click)                   │
│             └──────────────────────────────────────┘                     │
│                         Shared browser cookie store                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    POST /api/auth/local (body: { pendingToken, email })
                    GET  /users/me (Authorization: Bearer <jwt>)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    api.waldo.click (apps/strapi)                         │
│                    Strapi v5 — issues JWT in JSON body                   │
│                    NO cookie involvement (stateless)                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `apps/website/nuxt.config.ts` | Writes/reads `waldo_jwt` cookie with `domain: .waldo.click` | `strapi.cookie: { path, maxAge, domain }` |
| `apps/dashboard/nuxt.config.ts` | Same cookie config — reads the same `waldo_jwt` written by website | Identical `strapi.cookie` block |
| `@nuxtjs/strapi` `useStrapiToken` | Calls `useCookie(cookieName, config.strapi.cookie)` — all options including `domain` forwarded verbatim | Confirmed in source: `useCookie(config.strapi.cookieName, config.strapi.cookie)` |
| Nuxt `useCookie` (SSR path) | Reads value from `Cookie` request header (browser sends automatically); writes via `Set-Cookie` response header | `parse(getRequestHeader(event, "cookie"))` for reads; `setCookie(event, name, value, opts)` for writes |
| `useStrapiAuth().logout()` | Calls `setToken(null)` → `token.value = null` → Nuxt serializes with `maxAge: -1` + domain → browser deletes cookie on `.waldo.click` | Confirmed: `logout = () => { setToken(null); setUser(null); }` |
| `COOKIE_DOMAIN` env var | Provides `.waldo.click` value to both app configs at runtime; empty/absent in local dev | New env var; set in each app's `.env` independently |

---

## Recommended Project Structure

```
apps/
├── website/
│   ├── nuxt.config.ts       # MODIFIED: conditional domain spread in strapi.cookie
│   └── .env.example         # MODIFIED: COOKIE_DOMAIN=.waldo.click documented
├── dashboard/
│   ├── nuxt.config.ts       # MODIFIED: same change as website
│   └── .env.example         # MODIFIED: same env var documented
```

**No new files.** Two config files and two env example files — the entire change surface.

### Structure Rationale

- **One env var, two consumers:** Both apps deploy independently via Laravel Forge with separate `.env` files. Each must set `COOKIE_DOMAIN=.waldo.click` in production. The value is identical; the deployment is separate.
- **No new composables or plugins:** The change is entirely at the config layer. `@nuxtjs/strapi` already forwards the `cookie` options object verbatim to Nuxt's `useCookie`, and `CookieOptions` (which extends `CookieSerializeOptions` from `cookie-es`) already includes `domain?: string`.

---

## Architectural Patterns

### Pattern 1: Conditional Domain Spread in `strapi.cookie`

**What:** Add a conditional spread `...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})` to the existing `strapi.cookie` block in `nuxt.config.ts`. If `COOKIE_DOMAIN` is unset (local dev), the key is absent entirely — no domain restriction. In production with `COOKIE_DOMAIN=.waldo.click`, the `Set-Cookie` header includes `Domain=.waldo.click`, making the browser send the cookie to both `www.waldo.click` and `dashboard.waldo.click`.

**When to use:** Always — this is the only required config change.

**Trade-offs:**
- Conditional spread (key absent) is safer than `domain: undefined` or `domain: ""`. The `cookie-es` library passes the value to `Set-Cookie` header serialization — an empty string may serialize as `Domain=;`. A missing key omits the attribute entirely.
- The pattern mirrors the existing conditional spread used for `security` config in the website: `...(process.env.NODE_ENV !== "local" && { security: {...} })`.

**Example (identical change in both apps):**
```typescript
// apps/website/nuxt.config.ts
// apps/dashboard/nuxt.config.ts — same change
strapi: {
  // ...url, prefix, version, auth unchanged...
  cookie: {
    path: "/",
    maxAge: process.env.SESSION_MAX_AGE
      ? Number.parseInt(process.env.SESSION_MAX_AGE)
      : 604800,
    // Add domain only when env var is set; absent key = no domain attr in dev
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  },
  cookieName: "waldo_jwt",
},
```

### Pattern 2: Env Var Documentation in `.env.example`

**What:** Add `COOKIE_DOMAIN=.waldo.click` to both `.env.example` files. Local `.env` files leave this unset (no line, or `COOKIE_DOMAIN=`) to preserve the current cookie behavior in development.

**When to use:** Any time an optional cookie attribute needs to be absent locally but present in production.

**Example:**
```bash
# apps/website/.env.example  (add after SESSION_MAX_AGE line)
# apps/dashboard/.env.example — same addition

# Cookie domain — set to .waldo.click in production for cross-subdomain session sharing
# Leave unset in local development
COOKIE_DOMAIN=.waldo.click
```

### Pattern 3: Logout Cookie Clearing — No Changes Required

**What:** The existing logout paths already correctly delete the domain-scoped cookie, because `setToken(null)` triggers `token.value = null` on the `useCookie` ref that was created with the full `config.strapi.cookie` options (now including `domain`). Nuxt serializes a null value with `maxAge: -1`, producing a `Set-Cookie` header that includes `Domain=.waldo.click` — the browser deletes the cookie across all subdomains.

**When to use:** No action needed — this is automatic.

**Confirmed in source:**
```javascript
// @nuxtjs/strapi: useStrapiToken.js
const cookie = useCookie(config.strapi.cookieName, config.strapi.cookie);
// config.strapi.cookie = { path, maxAge, domain } — forwarded verbatim
// When token.value = null, Nuxt writes: Set-Cookie: waldo_jwt=; Domain=.waldo.click; Max-Age=-1

// @nuxtjs/strapi: useStrapiAuth.js
const logout = () => { setToken(null); setUser(null); };
```

**Files confirmed requiring NO changes:**
- `apps/website/app/composables/useLogout.ts` — `strapiLogout()` triggers `setToken(null)` transparently
- `apps/dashboard/app/middleware/guard.global.ts` — `useStrapiAuth().logout()` same
- `apps/dashboard/app/components/DropdownUser.vue` — same
- `apps/website/app/components/FormVerifyCode.vue` — `setToken(jwt)` writes with domain automatically
- `apps/dashboard/app/components/FormVerifyCode.vue` — same

---

## Data Flow

### Login Flow (website → cookie written with domain)

```
User submits credentials on www.waldo.click
    ↓
POST /api/auth/local → Strapi returns { pendingToken, email }
    ↓
POST /api/auth/verify-code → Strapi returns { jwt }
    ↓
setToken(jwt) in FormVerifyCode.vue
    ↓
useStrapiToken(): token.value = jwt
    ↓
Nuxt useCookie writes Set-Cookie response header:
  waldo_jwt=<jwt>; Path=/; Max-Age=604800; Domain=.waldo.click; SameSite=Lax
    ↓
Browser stores cookie scoped to .waldo.click
    ↓
Cookie is now accessible at dashboard.waldo.click (same eTLD+1, different subdomain)
```

### SSR Cookie Reading (both apps — unchanged behavior)

```
Browser sends GET dashboard.waldo.click/ads
    ↓
HTTP request includes: Cookie: waldo_jwt=<jwt>
  (browser sends because cookie Domain=.waldo.click matches the host)
    ↓
Nitro server-side: getRequestHeader(event, "cookie") → "waldo_jwt=<jwt>"
    ↓
useStrapiToken() → useCookie("waldo_jwt", { path, maxAge, domain })
  SSR reads via: parse(cookieHeader)["waldo_jwt"] → jwt value
  NOTE: domain option in useCookie opts does NOT affect reading
        Reading is always parse() of the raw Cookie request header
    ↓
useStrapiAuth().fetchUser() → GET /users/me with Bearer <jwt>
    ↓
guard.global.ts: user.value exists, role === "manager" → allow
```

### Logout Flow (cookie deleted across all subdomains)

```
User clicks logout on either www.waldo.click or dashboard.waldo.click
    ↓
strapiLogout() / useStrapiAuth().logout()
    ↓
setToken(null) → token.value = null
    ↓
Nuxt useCookie: null value → serialize with maxAge: -1
    ↓
Set-Cookie: waldo_jwt=; Path=/; Max-Age=-1; Domain=.waldo.click; Expires=<past>
    ↓
Browser deletes waldo_jwt for the .waldo.click domain scope
    ↓
Both www.waldo.click AND dashboard.waldo.click lose the session simultaneously
    ↓
website useLogout.ts: 6 Pinia stores reset → navigateTo("/")
dashboard guard.global.ts: next page load → user === null → redirect /auth/login
```

---

## Integration Points

### Files That Change

| File | Change Type | What Changes |
|------|-------------|--------------|
| `apps/website/nuxt.config.ts` | MODIFIED | Add conditional domain spread to `strapi.cookie` block (lines 282–288) |
| `apps/dashboard/nuxt.config.ts` | MODIFIED | Add conditional domain spread to `strapi.cookie` block (lines 234–240) |
| `apps/website/.env.example` | MODIFIED | Document `COOKIE_DOMAIN=.waldo.click` after `SESSION_MAX_AGE` |
| `apps/dashboard/.env.example` | MODIFIED | Same addition |

### Files That Do NOT Change

| File | Reason |
|------|--------|
| `apps/website/app/composables/useLogout.ts` | `strapiLogout()` already correctly clears via `setToken(null)`; domain forwarded automatically |
| `apps/dashboard/app/middleware/guard.global.ts` | `useStrapiAuth().logout()` — same transparent forwarding |
| `apps/dashboard/app/components/DropdownUser.vue` | Same |
| `apps/website/app/components/FormVerifyCode.vue` | `setToken(jwt)` writes with domain via cookie options object |
| `apps/dashboard/app/components/FormVerifyCode.vue` | Same |
| Any Pinia store | Store reset logic is independent of cookie domain |
| `apps/strapi/` (entire Strapi app) | Strapi issues JWT in JSON body — no cookie involvement whatsoever |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| website ↔ dashboard | Shared browser cookie `waldo_jwt` on `.waldo.click` | No direct app-to-app communication; cookie is the only shared medium |
| Nuxt app ↔ `@nuxtjs/strapi` module | `strapi.cookie` config passed to `useCookie` verbatim | Module reads from `runtimeConfig.public.strapi.cookie` (client-side) and `runtimeConfig.strapi.cookie` (server-side) |
| Nuxt app ↔ Strapi API | JWT in `Authorization: Bearer` header | Unchanged — Strapi never sees cookies |
| Browser ↔ Nuxt SSR | `Cookie` header (reading) + `Set-Cookie` header (writing) | `domain` attr only affects `Set-Cookie` — not `Cookie` header reading |

---

## Suggested Implementation Order

Order is dependency-driven. Step 3 (production deploy) must follow Steps 1–2.

### Step 1: Document env vars in `.env.example` files (both apps)

Non-breaking. No behavior change until Step 2. Add to both files:
```bash
# Cookie domain for cross-subdomain session sharing
# Set to .waldo.click in production; leave unset in local development
COOKIE_DOMAIN=.waldo.click
```

### Step 2: Update `nuxt.config.ts` — website and dashboard

Add conditional spread to `strapi.cookie` block. Identical change in both files:
```typescript
cookie: {
  path: "/",
  maxAge: process.env.SESSION_MAX_AGE
    ? Number.parseInt(process.env.SESSION_MAX_AGE)
    : 604800,
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
},
```

**Local dev:** `COOKIE_DOMAIN` unset → conditional spread adds nothing → behavior identical to today.

**Production:** `COOKIE_DOMAIN=.waldo.click` → `domain: ".waldo.click"` in cookie options → all writes (login, logout, token refresh) include `Domain=.waldo.click` in `Set-Cookie` header.

### Step 3: Set `COOKIE_DOMAIN=.waldo.click` in production `.env` files (Laravel Forge)

Set in both apps before next deployment. After deploy, all new cookies will carry `Domain=.waldo.click`.

**One-time migration note:** Existing logged-in users will have a `waldo_jwt` cookie without a domain attribute (host-only, scoped to exactly `www.waldo.click` or `dashboard.waldo.click`). The old host-only cookie and the new domain-scoped cookie have different identities from the browser's perspective. The `waldo_jwt` name is the same, but the browser sends both when visiting a matching host — `useStrapiToken` returns the first match from `parse(cookieHeader)`, which in practice will be the new domain-scoped one after the first login post-deploy (or the old one until it expires after 7 days). Users may need to re-login once for the domain-scoped cookie to take effect.

**To force immediate clean migration:** Deploy → instruct users to log out and back in. Or add a one-time server-side cookie clear of the host-only `waldo_jwt` in a Nitro plugin (optional, not required for correctness).

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (2 apps, 2 subdomains) | Single `COOKIE_DOMAIN` env var, 2 config files — sufficient |
| 3+ apps (e.g., `api-client.waldo.click`) | Same pattern — add `domain` to any new Nuxt app's `strapi.cookie` config |
| Multi-tenant (different root domains) | Not applicable — this approach is single-domain only |

---

## Anti-Patterns

### Anti-Pattern 1: `domain: ""` or `domain: undefined`

**What people do:** `domain: process.env.COOKIE_DOMAIN || ""` or `domain: process.env.COOKIE_DOMAIN || undefined`

**Why it's wrong:**
- `domain: ""` serializes as `Domain=;` in `cookie-es` — browser ignores or misbehaves.
- `domain: undefined` may or may not suppress the attribute depending on `cookie-es` version and how the serializer handles `undefined` values in options.

**Do this instead:** Conditional spread — `...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})` — the `domain` key is absent entirely when the env var is unset.

---

### Anti-Pattern 2: Assuming `domain` affects SSR cookie reading

**What people do:** Believe that adding `domain: ".waldo.click"` to `useCookie` options changes how the server reads the JWT from incoming requests, requiring extra validation or re-fetch logic.

**Why it's wrong:** On SSR, Nuxt reads cookies via `parse(getRequestHeader(event, "cookie"))`. This parses the `Cookie` request header — sent automatically by the browser when the cookie's domain matches the request host. The `domain` option in `useCookie` **only affects `Set-Cookie` response headers** (writes). Reading is always from the raw `Cookie` header; the domain option is irrelevant for parsing it.

**Do this instead:** Nothing — SSR reading works identically before and after this change. No extra code, no re-fetch logic, no guard changes.

---

### Anti-Pattern 3: Manually clearing the cookie in logout composables

**What people do:** Add `useCookie("waldo_jwt", { domain: ".waldo.click" }).value = null` explicitly in `useLogout.ts` or `guard.global.ts` to "make sure" the domain-scoped cookie is deleted.

**Why it's wrong:** `useStrapiAuth().logout()` already calls `setToken(null)` on the `useCookie` ref created with `config.strapi.cookie` (which now includes `domain`). The delete `Set-Cookie` header already carries the domain attribute. Manual duplication produces two `Set-Cookie` headers for the same cookie — harmless but unnecessary and fragile.

**Do this instead:** No changes to `useLogout.ts`, `guard.global.ts`, or `DropdownUser.vue`. Domain forwarding is automatic.

---

### Anti-Pattern 4: `COOKIE_DOMAIN=waldo.click` without leading dot

**What people do:** Set `COOKIE_DOMAIN=waldo.click` (no leading dot) in the `.env` file.

**Why it's wrong:** RFC 6265 specifies that when a `Domain` attribute is present, it must match a domain suffix. While modern browsers (Chrome, Firefox) normalize `waldo.click` to match subdomains, `cookie-es` serializes the value as-is. Some environments may not match `www.waldo.click` cookies against `waldo.click` without the dot. The canonical production-safe value is `.waldo.click` with a leading dot.

**Do this instead:** `COOKIE_DOMAIN=.waldo.click` (leading dot) in both production `.env` files.

---

### Anti-Pattern 5: Setting `COOKIE_DOMAIN` in local dev

**What people do:** Set `COOKIE_DOMAIN=localhost` or `COOKIE_DOMAIN=.localhost` in the local `.env` file to "test the feature locally."

**Why it's wrong:** `localhost` is a special domain — browsers do not apply domain-scoped cookies to `localhost` in the same way as real TLDs. The behavior is inconsistent across browsers. Local development should leave `COOKIE_DOMAIN` unset (host-only cookies work perfectly for single-subdomain local dev).

**Do this instead:** Leave `COOKIE_DOMAIN` unset in local `.env` files. Test cross-subdomain behavior in a staging environment with real subdomains (`www.staging.waldo.click`, `dashboard.staging.waldo.click`).

---

## SSR/CSR Cookie Behavior Reference

| Context | How cookie is read | How cookie is written | Effect of `domain` attr |
|---------|-------------------|----------------------|------------------------|
| SSR (first request) | `parse(Cookie: header)` — browser sends all matching cookies automatically | `Set-Cookie` response header — includes `domain: .waldo.click` | **Read:** no effect. **Write:** scopes new cookie to `.waldo.click` |
| CSR (client navigation) | `document.cookie` parse | `document.cookie = serialize(...)` — includes domain | Same as SSR |
| SSR first-load (no cookie) | `token.value === null` — no `fetchUser()` call | Not applicable | Unauthenticated flow unchanged |
| SSR with cross-subdomain cookie | Browser sends `waldo_jwt=<jwt>` in `Cookie` header → Nitro reads it | Cookie already exists — no write on load | **Works correctly** — browser sends the domain-scoped cookie to both subdomains |

---

## Type Safety Verification

The `domain` attribute is fully typed in the dependency chain:

1. `cookie-es/dist/index.d.mts` — `CookieSerializeOptions.domain?: string | undefined` ✓
2. `nuxt/dist/app/composables/cookie.d.ts` — `CookieOptions<T>` extends `CookieSerializeOptions` ✓
3. `@nuxtjs/strapi/dist/module.d.mts` — `ModuleOptions.cookie?: CookieOptions` ✓

No TypeScript casts needed. Adding `domain: process.env.COOKIE_DOMAIN` (string) to the `strapi.cookie` block is fully type-safe.

---

## Sources

- `@nuxtjs/strapi` source (local): `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiToken.js` — confirmed `useCookie(config.strapi.cookieName, config.strapi.cookie)` passes options verbatim (HIGH confidence)
- `@nuxtjs/strapi` source (local): `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiAuth.js` — confirmed `logout()` → `setToken(null)` → `token.value = null` (HIGH confidence)
- `@nuxtjs/strapi` module types (local): `node_modules/@nuxtjs/strapi/dist/module.d.mts` — `cookie?: CookieOptions` where `CookieOptions` extends `CookieSerializeOptions` which includes `domain?: string` (HIGH confidence)
- `cookie-es` types (local): `node_modules/cookie-es/dist/index.d.mts` line 13 — `domain?: string | undefined` in `CookieSerializeOptions` (HIGH confidence)
- Nuxt `useCookie` source (local): `node_modules/nuxt/dist/app/composables/cookie.js` — SSR reads via `parse(getRequestHeader(event, "cookie"))`, writes via `setCookie(event, name, value, opts)` (HIGH confidence)
- Official `@nuxtjs/strapi` docs: https://strapi.nuxtjs.org/setup — `cookie` accepts all Nuxt `CookieOptions` (HIGH confidence — official docs)
- Existing codebase: `apps/website/nuxt.config.ts`, `apps/dashboard/nuxt.config.ts` — current `strapi.cookie` block structure and conditional spread pattern confirmed (HIGH confidence)
- Existing codebase: `apps/website/app/composables/useLogout.ts` — confirmed `strapiLogout()` usage (HIGH confidence)
- Existing codebase: `apps/dashboard/app/middleware/guard.global.ts` — confirmed `useStrapiAuth().logout()` usage (HIGH confidence)

---

*Architecture research for: Cross-subdomain shared authentication session*
*Researched: 2026-03-16*
