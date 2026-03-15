# Phase 86: Mover validación reCAPTCHA v3 a Nuxt Nitro proxy — Research

**Researched:** 2026-03-15
**Domain:** Nuxt 4 Nitro server handlers, reCAPTCHA v3 Google verification, HTTP header forwarding
**Confidence:** HIGH

---

## Summary

The current architecture validates reCAPTCHA tokens inside a Strapi global middleware (`global::recaptcha`), which has already been disabled (`// "global::recaptcha"` in `config/middlewares.ts`). The reCAPTCHA token travels in the **request body** as `recaptchaToken`, either at the top level (auth routes) or inside `data.recaptchaToken` (contacts). The goal is to move this validation into the **Nuxt Nitro proxy layer** so Strapi never sees reCAPTCHA tokens, and the verification happens before the request is proxied.

Both `apps/website` and `apps/dashboard` have functionally identical Nitro catch-all proxies at `server/api/[...].ts`. Both apps already have the `$recaptcha` plugin, runtime config with `recaptchaSiteKey`, and frontend components that currently send `recaptchaToken` in the body.

The migration has three sub-concerns:
1. **Proxy layer**: Add reCAPTCHA verification logic to the catch-all handlers in both apps
2. **Config**: Add `recaptchaSecretKey` as a server-only runtime config key in both `nuxt.config.ts`
3. **Frontend components**: Change from `body.recaptchaToken` to `header['X-Recaptcha-Token']`

**Primary recommendation:** Modify both proxy catch-all handlers to (a) detect protected routes, (b) extract the `X-Recaptcha-Token` header, (c) call Google's `siteverify` API, (d) reject with 400 if invalid, (e) forward the request to Strapi with the recaptcha header stripped. Update all frontend components to send the token via header, not body. Add `recaptchaSecretKey` as server-only config.

---

## User Constraints (from CONTEXT.md)

No CONTEXT.md exists for this phase. All constraints come directly from the user prompt.

### Locked Decisions
- Protected routes: `/api/auth/local`, `/api/auth/local/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/contacts`
- Token transport: `X-Recaptcha-Token` header (not body)
- Validation: Proxy calls Google before forwarding to Strapi
- Invalid token → return HTTP 400, never reach Strapi
- Valid token → strip header before proxying to Strapi
- Apply in **both** website AND dashboard
- Secret key from `useRuntimeConfig()` (server-only, NOT `.public`)

### Claude's Discretion
- Exact implementation of the Google verify call (fetch vs axios)
- How to cleanly strip headers in `proxyRequest`
- TypeScript typing approach

### Deferred Ideas (OUT OF SCOPE)
- None specified

---

## Current State Inventory

### Strapi middleware (ALREADY DISABLED)
- File: `apps/strapi/src/middlewares/recaptcha.ts`
- Registration: `"global::recaptcha"` — **commented out** in `config/middlewares.ts` with comment `// "global::recaptcha", // Movido a Nuxt Nitro proxy`
- The middleware reads from `ctx.request.body?.data?.recaptchaToken` OR `ctx.request.body?.recaptchaToken`
- The middleware uses `GoogleServices.recaptcha.verifyToken(token)` which calls `https://www.google.com/recaptcha/api/siteverify` via axios with `secret` + `response` params
- Score threshold: `score > 0.5`

### Contact controller (Strapi)
- File: `apps/strapi/src/api/contact/controllers/contact.ts`
- Destructures `recaptchaToken` out of `data` and proceeds — so Strapi already ignores the token even in the body (doesn't validate it)
- This means if we move validation to proxy layer, we must also stop sending `recaptchaToken` in the body to avoid confusion

### Website proxy: `apps/website/server/api/[...].ts`
- Handles all `/api/*` routes except OAuth redirects (those go directly to Strapi via `sendRedirect`)
- Manually forwards `Authorization`, `Content-Type`, `Cookie` headers
- Uses `proxyRequest(event, targetUrl, { headers })` — the `headers` object passed here REPLACES/merges with forwarded headers
- **No existing reCAPTCHA logic**

### Dashboard proxy: `apps/dashboard/server/api/[...].ts`
- Simpler version — no OAuth exclusion logic
- Same header-forwarding pattern
- **No existing reCAPTCHA logic**

### Frontend components sending `recaptchaToken` in body

| App | Component | Route | Method | How token is sent |
|-----|-----------|-------|--------|-------------------|
| website | `FormLogin.vue` | `/auth/local` | `client()` | `body.recaptchaToken` |
| website | `FormRegister.vue` | `/auth/local/register` | `client()` | `body.recaptchaToken` (spread with form data) |
| website | `FormForgotPassword.vue` | `forgotPassword()` | `useStrapiAuth()` | `body.recaptchaToken` via Strapi SDK |
| website | `FormResetPassword.vue` | `resetPassword()` | `useStrapiAuth()` | `body.recaptchaToken` via Strapi SDK |
| website | `FormContact.vue` | `strapi.create("contacts", ...)` | `useStrapi()` | `data.recaptchaToken` |
| dashboard | `FormLogin.vue` | `/auth/local` | `client()` | `body.recaptchaToken` |
| dashboard | `FormForgotPassword.vue` | `forgotPassword()` | `useStrapiAuth()` | `body.recaptchaToken` via Strapi SDK |
| dashboard | `FormResetPassword.vue` | `resetPassword()` | `useStrapiAuth()` | `body.recaptchaToken` via Strapi SDK |

### API call methods used
- `useStrapiClient()` → direct `$fetch` wrapper — headers can be passed in options
- `useStrapiAuth().forgotPassword()` / `resetPassword()` → SDK methods that wrap `$fetch` internally; token must be sent as custom header separately since SDK doesn't accept arbitrary headers
- `useStrapi().create()` → SDK create method; same situation

### Key insight on SDK methods
`forgotPassword`, `resetPassword`, and `strapi.create()` from `@nuxtjs/strapi` don't expose a `headers` option directly. The pattern is to use `useFetch`/`useStrapiClient` with explicit options OR to use the `useRequestHeaders` composable. However since these are client-side submissions, the cleanest approach is:
- For `useStrapiAuth().forgotPassword()` / `resetPassword()`: Replace with direct `client('/auth/forgot-password', { method: 'POST', headers: {...}, body: {...} })` calls, removing `recaptchaToken` from the body
- For `useStrapi().create("contacts", data)`: Replace with direct `client('/contacts', { method: 'POST', headers: {...}, body: { data: {...} } })` call, removing `recaptchaToken` from body

### Runtime config gaps
- **website** `nuxt.config.ts`: Has `runtimeConfig.public.recaptchaSiteKey` but NO server-only `recaptchaSecretKey`
- **dashboard** `nuxt.config.ts`: Same gap — has `public.recaptchaSiteKey` but no server-only secret key

---

## Architecture Patterns

### Nitro Event Handler — Header Access Pattern
```typescript
// Source: Nuxt/Nitro official docs — h3 utilities
const token = getHeader(event, 'x-recaptcha-token')
```

### proxyRequest — Stripping a Header
`proxyRequest` from h3/nitro passes headers through. To strip a header before proxying, use the `headers` option to explicitly set it to an empty string or omit it. The cleanest approach:
```typescript
// Build clean headers excluding X-Recaptcha-Token
const cleanHeaders: Record<string, string> = {}
// Forward only the headers we want, skip recaptcha
const authHeader = getHeader(event, 'authorization')
if (authHeader) cleanHeaders['Authorization'] = authHeader
// etc — do NOT include x-recaptcha-token
return proxyRequest(event, targetUrl, { headers: cleanHeaders })
```
The existing proxy already does this pattern (explicitly picking headers), so removing `X-Recaptcha-Token` is natural — just don't add it to the `headers` object.

### Google reCAPTCHA v3 Siteverify — Node.js Pattern
```typescript
// Server-side validation — use $fetch (h3 native) NOT axios
const result = await $fetch<{ success: boolean; score: number; 'error-codes'?: string[] }>(
  'https://www.google.com/recaptcha/api/siteverify',
  {
    method: 'POST',
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }).toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }
)
// Threshold: success && score > 0.5 (matches existing Strapi implementation)
```

### Protected Route Check Pattern
```typescript
const RECAPTCHA_PROTECTED_ROUTES = [
  'auth/local',
  'auth/local/register',
  'auth/forgot-password',
  'auth/reset-password',
  'contacts',
]
// fullPath is the path after /api/
const needsRecaptcha = RECAPTCHA_PROTECTED_ROUTES.some(r => fullPath.startsWith(r))
  && ['POST'].includes(event.method ?? '')
```

### Returning 400 from Nitro Handler
```typescript
throw createError({ statusCode: 400, statusMessage: 'reCAPTCHA verification failed' })
```

### runtimeConfig Server-Only Key Pattern
```typescript
// nuxt.config.ts
runtimeConfig: {
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY, // server-only
  public: {
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,   // client-exposed
  }
}
// In Nitro handler:
const config = useRuntimeConfig(event)
const secretKey = config.recaptchaSecretKey
```

### Frontend — Sending Token as Header via `useStrapiClient`
```typescript
// useStrapiClient wraps $fetch — headers are supported
const token = await $recaptcha.execute('submit')
await client('/auth/local', {
  method: 'POST',
  headers: { 'X-Recaptcha-Token': token ?? '' },
  body: { identifier: values.email, password: values.password },
})
```

### Frontend — Replacing SDK Methods with Direct Client Calls
For `forgotPassword` and `resetPassword` (which wrap $fetch internally and don't expose headers):
```typescript
// BEFORE (SDK):
await forgotPassword({ email: values.email, recaptchaToken: token })

// AFTER (direct client):
const token = await $recaptcha.execute('submit')
await client('/auth/forgot-password', {
  method: 'POST',
  headers: { 'X-Recaptcha-Token': token ?? '' },
  body: { email: values.email },
})
```

For `strapi.create("contacts", formData)`:
```typescript
// BEFORE:
await strapi.create('contacts', { ...formData, recaptchaToken: token })

// AFTER:
const token = await $recaptcha.execute('submit')
await client('/contacts', {
  method: 'POST',
  headers: { 'X-Recaptcha-Token': token ?? '' },
  body: { data: { fullname, email, company, phone, message } },
})
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Google API call | Custom axios/fetch wrapper | `$fetch` (h3 built-in, Nitro-native) with URLSearchParams body |
| Header extraction | Manual `req.headers` parsing | `getHeader(event, 'x-recaptcha-token')` from h3 |
| Error responses | Manual `setResponseStatus` | `throw createError({ statusCode: 400, ... })` |

---

## Common Pitfalls

### Pitfall 1: `proxyRequest` leaks the recaptcha header to Strapi
**What goes wrong:** If the proxy forwards ALL headers (by not specifying `headers`), `X-Recaptcha-Token` reaches Strapi.
**Why it happens:** The existing proxy explicitly builds a `headers` object and only adds Authorization/Content-Type/Cookie — this pattern naturally prevents forwarding. Just don't add X-Recaptcha-Token to that object.
**How to avoid:** The current explicit-whitelist pattern in the proxy already handles this correctly. Do not change to a passthrough strategy.

### Pitfall 2: Using `recaptchaSecretKey` from `config.public`
**What goes wrong:** Secret key visible in client bundle.
**Why it happens:** Accidentally placing the key under `runtimeConfig.public` instead of the root `runtimeConfig`.
**How to avoid:** Add `recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY` at the root level (not under `.public`) in `runtimeConfig`.

### Pitfall 3: `forgotPassword` / `resetPassword` SDK calls don't support custom headers
**What goes wrong:** Developer tries to pass `headers` to `useStrapiAuth().forgotPassword()` — SDK ignores it.
**Why it happens:** The `@nuxtjs/strapi` SDK methods don't expose an `headers` option for these auth calls.
**How to avoid:** Replace SDK calls with direct `useStrapiClient()` calls that fully control request options. Remove the `recaptchaToken` augmentation from `strapi.d.ts` after migration.

### Pitfall 4: Dashboard reCAPTCHA in routes that shouldn't need it
**What goes wrong:** The dashboard shouldn't protect all the same routes — it has no public-facing registration or contact form.
**Why it happens:** Copy-pasting website config blindly.
**How to avoid:** Dashboard only needs to protect: `/api/auth/local`, `/api/auth/forgot-password`, `/api/auth/reset-password`. No `/api/contacts` or `/api/auth/local/register` for dashboard.

### Pitfall 5: Mobile API key bypass
**What goes wrong:** The existing Strapi middleware had a `MOBILE_APP_API_KEYS` bypass for mobile apps. Moving validation to Nitro means mobile apps hitting the Nitro proxy would be blocked.
**Why it happens:** Mobile apps can't run the browser reCAPTCHA challenge.
**How to avoid:** The dashboard doesn't have a mobile client. For the website proxy, the same bypass logic can be added: check for `X-Mobile-App-Api-Key` header and skip reCAPTCHA if valid. This is a detail to implement but is in scope.

### Pitfall 6: TypeScript types for `StrapiForgotPasswordData` / `StrapiResetPasswordData`
**What goes wrong:** After removing `recaptchaToken` from body, the `strapi.d.ts` augmentations become stale.
**Why it happens:** The types were added to satisfy the SDK type checker when token was in body.
**How to avoid:** After migrating, remove `recaptchaToken?` from those interface augmentations in `strapi.d.ts`.

### Pitfall 7: Empty string vs undefined for missing token
**What goes wrong:** Strapi receives the request and something tries to validate an empty/undefined token later.
**Why it happens:** If `getHeader` returns null/undefined, a falsy check is needed before rejecting.
**How to avoid:** Check `!token || token.trim() === ''` and return 400 if truthy condition is missing.

---

## Code Examples

### Complete proxy handler with reCAPTCHA (website)
```typescript
// apps/website/server/api/[...].ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiUrl = process.env.API_URL || 'http://localhost:1337'
  const frontendUrl = process.env.BASE_URL || 'http://localhost:3000'
  const fullPath = event.node.req.url?.replace('/api/', '') || ''

  // OAuth routes: redirect directly to Strapi
  const oauthRoutes = ['connect/google', 'connect/google/callback', 'connect/facebook', 'connect/facebook/callback']
  const isOAuthRoute = oauthRoutes.some((route) => fullPath.startsWith(route))
  if (isOAuthRoute) {
    // ... existing OAuth logic unchanged
  }

  // reCAPTCHA-protected POST routes
  const RECAPTCHA_PROTECTED = ['auth/local', 'auth/local/register', 'auth/forgot-password', 'auth/reset-password', 'contacts']
  const isProtected = event.method === 'POST' && RECAPTCHA_PROTECTED.some(r => fullPath.startsWith(r))

  if (isProtected) {
    const recaptchaToken = getHeader(event, 'x-recaptcha-token')
    if (!recaptchaToken) {
      throw createError({ statusCode: 400, statusMessage: 'reCAPTCHA token is required' })
    }
    const secretKey = config.recaptchaSecretKey as string
    const result = await $fetch<{ success: boolean; score: number }>(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        body: new URLSearchParams({ secret: secretKey, response: recaptchaToken }).toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    )
    if (!result.success || result.score <= 0.5) {
      throw createError({ statusCode: 400, statusMessage: 'reCAPTCHA verification failed' })
    }
  }

  // Build target URL and proxy — X-Recaptcha-Token is NOT added to headers
  const targetUrl = `${apiUrl}/api/${fullPath}`
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': process.env.BASE_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  const authHeader = getHeader(event, 'authorization')
  if (authHeader) headers['Authorization'] = authHeader
  const contentType = getHeader(event, 'content-type')
  if (contentType) headers['Content-Type'] = contentType
  const cookie = getHeader(event, 'cookie')
  if (cookie) headers['Cookie'] = cookie

  return proxyRequest(event, targetUrl, { headers })
})
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @nuxt/test-utils |
| Config file | `apps/website/vitest.config.ts`, `apps/dashboard/vitest.config.ts` |
| Quick run command | `yarn workspace website test --run` |
| Full suite command | `yarn workspace website test --run && yarn workspace dashboard test --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RCP-01 | Proxy rejects missing `X-Recaptcha-Token` on protected routes with 400 | unit | `yarn workspace website test --run tests/server/recaptcha-proxy.test.ts` | ❌ Wave 0 |
| RCP-02 | Proxy passes valid token (score > 0.5) and forwards to Strapi | unit | `yarn workspace website test --run tests/server/recaptcha-proxy.test.ts` | ❌ Wave 0 |
| RCP-03 | Proxy rejects low-score token (score ≤ 0.5) with 400 | unit | `yarn workspace website test --run tests/server/recaptcha-proxy.test.ts` | ❌ Wave 0 |
| RCP-04 | `X-Recaptcha-Token` is NOT forwarded to Strapi after validation | unit | `yarn workspace website test --run tests/server/recaptcha-proxy.test.ts` | ❌ Wave 0 |
| RCP-05 | Unprotected routes bypass reCAPTCHA validation entirely | unit | `yarn workspace website test --run tests/server/recaptcha-proxy.test.ts` | ❌ Wave 0 |
| RCP-06 | FormLogin sends token in header not body (website) | unit | `yarn workspace website test --run tests/components/FormLogin.website.test.ts` | ✅ (update) |
| RCP-07 | FormLogin sends token in header not body (dashboard) | unit | `yarn workspace dashboard test --run` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn workspace website test --run` (or dashboard equivalent)
- **Per wave merge:** `yarn workspace website test --run && yarn workspace dashboard test --run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `apps/website/tests/server/recaptcha-proxy.test.ts` — covers RCP-01 through RCP-05
- [ ] `apps/dashboard/tests/components/FormLogin.dashboard.test.ts` — covers RCP-07

*(Existing `apps/website/tests/components/FormLogin.website.test.ts` covers RCP-06 — needs updating after header migration)*

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `apps/strapi/src/middlewares/recaptcha.ts` — existing implementation to replicate
- Direct code inspection: `apps/website/server/api/[...].ts` — proxy to modify
- Direct code inspection: `apps/dashboard/server/api/[...].ts` — proxy to modify
- Direct code inspection: `apps/strapi/config/middlewares.ts` — confirms middleware is already disabled
- Direct code inspection: All 8 frontend components sending `recaptchaToken`

### Secondary (MEDIUM confidence)
- Google reCAPTCHA v3 siteverify API: `https://www.google.com/recaptcha/api/siteverify` with `application/x-www-form-urlencoded` POST — widely documented, stable API

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use (h3/nitro built-ins, no new deps)
- Architecture: HIGH — proxy pattern fully verified from existing code
- Pitfalls: HIGH — most pitfalls identified directly from existing code (SDK limitations, mobile bypass, type augmentations)

**Research date:** 2026-03-15
**Valid until:** 2026-06-15 (stable APIs, no version sensitivity)
