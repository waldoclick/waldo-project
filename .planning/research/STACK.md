# Stack Research

**Domain:** Cross-subdomain cookie sharing — Nuxt 4 + @nuxtjs/strapi v2
**Researched:** 2026-03-16
**Confidence:** HIGH

## Scope Statement

This file answers the precise questions for the shared authentication session milestone:

1. Does `useCookie()` in Nuxt 4 support a `domain` option?
2. Does `@nuxtjs/strapi` v2's `cookie` config object accept `domain`?
3. Are there any version constraints or required package updates?
4. Are there Nitro/h3 changes needed for server-side cookie writes?
5. What is NOT needed (avoid adding)?

All findings are based on: installed package source at `node_modules/`, official Nuxt 4 docs, and `@nuxtjs/strapi` v2 GitHub source.

---

## Executive Answer

**Zero new packages required.** The entire cross-subdomain cookie sharing implementation is a pure configuration change to both `nuxt.config.ts` files. The chain works as follows:

```
nuxt.config.ts strapi.cookie.domain
  → useStrapiToken.js: useCookie(cookieName, config.strapi.cookie)
    → Nuxt useCookie() accepts CookieSerializeOptions including domain
      → Set-Cookie: waldo_jwt=...; Domain=.waldo.click; Path=/
```

---

## Key Findings

### Finding 1 — `useCookie()` natively supports `domain` (HIGH confidence)

**Source:** Official Nuxt 4 docs, `nuxt.com/docs/api/composables/use-cookie` (verified 2026-03-16)

`useCookie()` extends `CookieSerializeOptions` from `cookie-es`. The `domain` option is documented:

> Sets the `Domain` `Set-Cookie` attribute. By default, no domain is set, and most clients will consider applying the cookie only to the current domain.

Usage:
```typescript
const token = useCookie('waldo_jwt', {
  path: '/',
  maxAge: 604800,
  domain: '.waldo.click',  // ← dot-prefixed = all subdomains
})
```

The `.waldo.click` (leading dot) format is the correct RFC 6265 convention for matching all subdomains of `waldo.click`.

**Installed version:** `cookie-es@2.0.0` (in project's `node_modules/`), which is the underlying serializer Nuxt uses. Supports `domain` in `CookieSerializeOptions`. ✅

### Finding 2 — `@nuxtjs/strapi` v2 `cookie` config accepts `domain` (HIGH confidence)

**Source:** `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiToken.js` (installed, read directly)

```javascript
// useStrapiToken.js line 10 — the entirety of cookie creation:
const cookie = useCookie(config.strapi.cookieName, config.strapi.cookie);
```

The `cookie` option object from `nuxt.config.ts` is passed **directly and entirely** to `useCookie()`. There is no filtering or stripping.

**Module type definition** (`module.ts` from GitHub source, verified):
```typescript
export interface ModuleOptions {
  cookie?: CookieOptions  // ← Nuxt's own CookieOptions type — includes domain
}
```

`CookieOptions` is imported from `nuxt/app` — the same type used by `useCookie()` itself. Therefore, `domain` is a valid, typed field.

**Currently installed version:** `@nuxtjs/strapi@2.1.1` — this behavior is present in the installed version. ✅

**What this means:** Adding `domain: '.waldo.click'` to the `cookie` block in both `nuxt.config.ts` files is all that is needed for `@nuxtjs/strapi` to emit cookies with the correct domain attribute.

### Finding 3 — `SameSite` must be set to `'lax'` or unset (HIGH confidence)

**Source:** RFC 6265bis; MDN Cookie docs; browser behavior (well-established)

A cookie with `Domain=.waldo.click` and `SameSite=Strict` will NOT be sent on cross-subdomain navigation (e.g., website → dashboard redirects or link clicks). The current config does not set `sameSite`, which defaults to browser default — typically `Lax` in modern browsers. `Lax` is the correct value for cross-subdomain within the same eTLD+1.

**Current state in `nuxt.config.ts`:** Neither app sets `sameSite` in the `cookie` config block. This is correct — do not add `sameSite: 'strict'`. Do not add `sameSite: 'none'` (that is for cross-site, not cross-subdomain, and requires `secure: true`).

No change needed on `sameSite`.

### Finding 4 — h3 `setCookie()` supports `domain` in server routes (HIGH confidence)

**Source:** h3 GitHub source `src/utils/cookie.ts` (verified 2026-03-16)

```typescript
export function setCookie(
  event: H3Event,
  name: string,
  value: string,
  options?: CookieSerializeOptions,  // ← includes domain
): void
```

`CookieSerializeOptions` is from `cookie-es` and includes `domain`. If any Nitro server routes in `apps/website/server/` or `apps/dashboard/server/` manually set the JWT cookie, they will need the `domain` option added to their `setCookie()` call.

**Current state:** No server routes in either app manually set `waldo_jwt`. The `@nuxtjs/strapi` module handles all JWT cookie writes. No Nitro/h3 changes needed today.

### Finding 5 — `nuxt-security@2.4.0` does NOT interfere with cookie domain (HIGH confidence)

**Source:** `node_modules/nuxt-security/dist/defaultConfig.mjs` (read directly)

`nuxt-security` only sets HTTP response security headers (CSP, HSTS, etc.). It does not set, modify, or strip `Set-Cookie` headers. No conflict with `Domain` attribute.

**Exception to watch:** `strictTransportSecurity.includeSubdomains: true` is nuxt-security's default. This means all subdomains of `waldo.click` require HTTPS. The JWT cookie with `Domain=.waldo.click` must also be secure in production (which it is — both apps run on HTTPS via Forge). In development (HTTP), the cookie will still be set but not transmitted in secure contexts — this is expected behavior.

### Finding 6 — Both apps already use identical `cookieName: "waldo_jwt"` (HIGH confidence)

**Source:** Both `nuxt.config.ts` files read directly

```typescript
// apps/website/nuxt.config.ts
cookieName: "waldo_jwt",

// apps/dashboard/nuxt.config.ts
cookieName: "waldo_jwt",
```

The cookie name is already identical across apps — this is a prerequisite for cross-subdomain sharing. Both apps reading the same name means once `Domain=.waldo.click` is set at login, the other app will automatically read it. ✅

---

## Recommended Stack

### Core Technologies (unchanged — no additions)

| Technology | Version | Purpose | Notes |
|------------|---------|---------|-------|
| `nuxt` | `^4.1.3` | SSR framework | Already installed — `useCookie` domain support built-in |
| `@nuxtjs/strapi` | `^2.1.1` | Strapi integration + JWT cookie | Already installed — `cookie` config passes through to `useCookie` |
| `cookie-es` | `2.0.0` | Cookie serialization | Already installed (transitive) — supports `domain` in `CookieSerializeOptions` |
| `h3` | (Nuxt bundled) | Server-side cookie utils | Already installed (via Nitro) — `setCookie` supports `domain` |

### Supporting Libraries (unchanged)

No additions required.

---

## Installation

No new packages to install.

---

## The Exact Config Change

**Both apps — add `domain` to `strapi.cookie` block in `nuxt.config.ts`:**

```typescript
// apps/website/nuxt.config.ts
strapi: {
  url: ...,
  prefix: '/api',
  version: 'v5',
  cookie: {
    path: '/',
    maxAge: process.env.SESSION_MAX_AGE
      ? Number.parseInt(process.env.SESSION_MAX_AGE)
      : 604800,
    domain: process.env.COOKIE_DOMAIN || undefined,  // ← ADD THIS
  },
  cookieName: 'waldo_jwt',
  // ...
},
```

```typescript
// apps/dashboard/nuxt.config.ts
strapi: {
  url: ...,
  prefix: '/api',
  version: 'v5',
  cookie: {
    path: '/',
    maxAge: process.env.SESSION_MAX_AGE
      ? Number.parseInt(process.env.SESSION_MAX_AGE)
      : 604800,
    domain: process.env.COOKIE_DOMAIN || undefined,  // ← ADD THIS
  },
  cookieName: 'waldo_jwt',
  // ...
},
```

**New env var in both `.env` and `.env.example`:**

```bash
# Cookie domain for cross-subdomain sharing
# Production: .waldo.click or .waldoclick.dev
# Local dev: leave unset (undefined = current domain only)
COOKIE_DOMAIN=.waldo.click
```

**Why `|| undefined` instead of a fallback string:** When `domain` is `undefined`, `useCookie` / `cookie-es` omits the `Domain` attribute entirely, so the cookie is scoped to the exact domain that set it. This is the correct behavior for local development where both apps run on `localhost` (not subdomains). Setting `domain: '.localhost'` has inconsistent browser support and is not needed.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `domain` in `strapi.cookie` config | `js-cookie` library client-side workaround | `js-cookie` doesn't run on SSR; strapi module handles both sides correctly |
| `domain` in `strapi.cookie` config | Custom Nitro middleware to rewrite `Set-Cookie` | Over-engineering; strapi module already exposes the right hook |
| `COOKIE_DOMAIN` env var | Hardcoded `.waldo.click` in config | Hardcoding breaks local dev; env var lets each environment opt in |
| `sameSite: 'lax'` (browser default, unset) | `sameSite: 'none'` | `none` requires `secure: true` and is for cross-origin, not cross-subdomain |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `js-cookie` for domain setting | Already in both apps as `js-cookie@3.0.5` but SSR-unaware; `useCookie` is the correct SSR-safe API | `useCookie` via `@nuxtjs/strapi` |
| Custom Nitro middleware rewriting `Set-Cookie` | Over-engineering; fragile; would need to track all cookie writes | `strapi.cookie.domain` config |
| `sameSite: 'none'` with `secure: true` | For cross-site contexts (third-party cookies); subdomains of same root domain are same-site | Leave `sameSite` unset (defaults to `Lax`) |
| Separate auth session per app | Defeats the purpose; users would need to log in twice | Single `waldo_jwt` with domain scope |
| `httpOnly: true` on `waldo_jwt` | Would prevent `useStrapiToken` from reading the cookie client-side (JavaScript access required for Nuxt SSR hydration) | Keep `httpOnly` unset (defaults to `false`) |

---

## Version Compatibility

| Package | Version | Compatibility Notes |
|---------|---------|---------------------|
| `@nuxtjs/strapi@2.1.1` | Installed | `cookie?: CookieOptions` — typed as Nuxt's own `CookieOptions`; `domain` field valid and passes through |
| `nuxt@^4.1.3` | Installed | `useCookie` `domain` option documented and stable since Nuxt 3; no version constraint |
| `cookie-es@2.0.0` | Installed (transitive) | `CookieSerializeOptions.domain: string` — supported |
| `nuxt-security@2.4.0` | Installed | No cookie attribute manipulation; no conflict |

No version upgrades required.

---

## Strapi CORS Note (not blocking, but verify)

If the Strapi backend sets the JWT cookie directly in any response (e.g., the custom `overrideAuthLocal` returns a cookie via `ctx.set('Set-Cookie', ...)`), that server response must also include `Domain=.waldo.click`. However, in the current architecture, Strapi only returns JWT values in the JSON body (`{ jwt, user }`), and the Nuxt apps write the cookie via `useStrapiToken`'s `setToken()` → `useCookie` assignment. Strapi does not write the cookie directly. No Strapi change needed.

---

## Sources

| Source | Type | Confidence |
|--------|------|------------|
| `nuxt.com/docs/api/composables/use-cookie` (fetched 2026-03-16) | Official Nuxt 4 docs | HIGH |
| `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiToken.js` | Installed package source | HIGH |
| `github.com/nuxt-modules/strapi/raw/main/src/module.ts` | Package author source (fetched 2026-03-16) | HIGH |
| `github.com/h3js/h3/blob/main/src/utils/cookie.ts` | h3 package source (fetched 2026-03-16) | HIGH |
| `node_modules/nuxt-security/dist/defaultConfig.mjs` | Installed package source | HIGH |
| `apps/website/nuxt.config.ts`, `apps/dashboard/nuxt.config.ts` | Project config (read directly) | HIGH |

---

*Stack research for: cross-subdomain cookie sharing, Nuxt 4 + @nuxtjs/strapi v2*
*Researched: 2026-03-16*
