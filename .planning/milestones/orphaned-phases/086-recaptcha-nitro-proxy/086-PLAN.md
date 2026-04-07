# Phase 86: Mover validación reCAPTCHA v3 a Nuxt Nitro proxy — Plan

**Planned:** 2026-03-15
**Confidence:** HIGH
**Granularity:** coarse

---

## Objective

Move reCAPTCHA v3 token validation from the (already-disabled) Strapi middleware to the Nuxt Nitro proxy catch-all handlers in both `apps/website` and `apps/dashboard`. Frontend components stop sending the token in the request body and start sending it in `X-Recaptcha-Token` header. The proxy validates and strips the header before proxying to Strapi.

---

## Scope Summary

**Files to modify:**
- `apps/website/nuxt.config.ts` — add server-only `recaptchaSecretKey`
- `apps/website/server/api/[...].ts` — add reCAPTCHA validation logic
- `apps/dashboard/nuxt.config.ts` — add server-only `recaptchaSecretKey`
- `apps/dashboard/server/api/[...].ts` — add reCAPTCHA validation logic
- `apps/website/app/components/FormLogin.vue` — header instead of body
- `apps/website/app/components/FormRegister.vue` — header instead of body
- `apps/website/app/components/FormForgotPassword.vue` — header + direct client call
- `apps/website/app/components/FormResetPassword.vue` — header + direct client call
- `apps/website/app/components/FormContact.vue` — header + direct client call
- `apps/website/app/types/strapi.d.ts` — remove stale `recaptchaToken` augmentation
- `apps/dashboard/app/components/FormLogin.vue` — header instead of body
- `apps/dashboard/app/components/FormForgotPassword.vue` — header + direct client call
- `apps/dashboard/app/components/FormResetPassword.vue` — header + direct client call
- `apps/dashboard/app/types/strapi.d.ts` — remove stale `recaptchaToken` augmentation

**Files to create:**
- `apps/website/tests/server/recaptcha-proxy.test.ts` — proxy unit tests

**No new packages required** — uses only h3 built-ins (`getHeader`, `createError`, `proxyRequest`) and `$fetch` (Nitro-native).

---

## Waves

### Wave 0 — Config & test scaffolding

#### Task 0.1: Add `recaptchaSecretKey` to both nuxt.config.ts files

**File:** `apps/website/nuxt.config.ts`

In the `runtimeConfig` section, add `recaptchaSecretKey` as a server-only key (root level, not under `.public`):

```typescript
runtimeConfig: {
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY, // server-only — for Nitro proxy
  public: {
    // ... existing public keys unchanged
  },
  devUsername: process.env.DEV_USERNAME,
  devPassword: process.env.DEV_PASSWORD,
},
```

**File:** `apps/dashboard/nuxt.config.ts`

Same addition:
```typescript
runtimeConfig: {
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY, // server-only — for Nitro proxy
  public: {
    // ... existing public keys unchanged
  },
  devUsername: process.env.DEV_USERNAME,
  devPassword: process.env.DEV_PASSWORD,
},
```

**Verify:** `yarn workspace website nuxt typecheck` and `yarn workspace dashboard nuxt typecheck` pass.

---

#### Task 0.2: Create proxy unit test scaffold

**File:** `apps/website/tests/server/recaptcha-proxy.test.ts` (new file)

Create a Vitest unit test file that tests the reCAPTCHA validation logic in isolation using mocked `$fetch`. The tests should cover RCP-01 through RCP-05 from the requirements:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock $fetch for Google siteverify calls
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock h3 utilities
vi.mock('h3', () => ({
  getHeader: vi.fn(),
  createError: vi.fn((opts) => Object.assign(new Error(opts.statusMessage), opts)),
  proxyRequest: vi.fn().mockResolvedValue({}),
  defineEventHandler: vi.fn((fn) => fn),
}))

// Import the utility function extracted from the proxy (see Task 1.1)
import { verifyRecaptchaToken, RECAPTCHA_PROTECTED_ROUTES } from '~/server/utils/recaptcha'

describe('reCAPTCHA proxy validation', () => {
  beforeEach(() => vi.clearAllMocks())

  // RCP-01: Proxy rejects missing token
  it('throws 400 when X-Recaptcha-Token header is missing', async () => {
    await expect(verifyRecaptchaToken(undefined, 'fake-secret')).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  // RCP-02: Valid token passes
  it('resolves when Google returns success=true and score > 0.5', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, score: 0.9 })
    await expect(verifyRecaptchaToken('valid-token', 'fake-secret')).resolves.toBeUndefined()
  })

  // RCP-03: Low score rejects
  it('throws 400 when Google returns score <= 0.5', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, score: 0.4 })
    await expect(verifyRecaptchaToken('low-score-token', 'fake-secret')).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  // RCP-04/RCP-05: Protected routes list is correct
  it('includes all expected protected routes', () => {
    expect(RECAPTCHA_PROTECTED_ROUTES).toContain('auth/local')
    expect(RECAPTCHA_PROTECTED_ROUTES).toContain('auth/local/register')
    expect(RECAPTCHA_PROTECTED_ROUTES).toContain('auth/forgot-password')
    expect(RECAPTCHA_PROTECTED_ROUTES).toContain('auth/reset-password')
    expect(RECAPTCHA_PROTECTED_ROUTES).toContain('contacts')
  })
})
```

**Note:** This test depends on Task 1.1 extracting `verifyRecaptchaToken` to a shared utility. Create the test file now as a scaffold — it will pass after Task 1.1 is done.

---

### Wave 1 — Website proxy + shared utility

#### Task 1.1: Extract reCAPTCHA utility + update website proxy

**File 1 (new):** `apps/website/server/utils/recaptcha.ts`

Extract the validation logic into a testable utility:

```typescript
// apps/website/server/utils/recaptcha.ts

export const RECAPTCHA_PROTECTED_ROUTES = [
  'auth/local',
  'auth/local/register',
  'auth/forgot-password',
  'auth/reset-password',
  'contacts',
] as const

/**
 * Verifies a reCAPTCHA v3 token against Google's siteverify API.
 * Throws createError(400) if token is missing, invalid, or score <= 0.5.
 */
export async function verifyRecaptchaToken(
  token: string | null | undefined,
  secretKey: string,
): Promise<void> {
  if (!token || !token.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'reCAPTCHA token is required' })
  }

  const result = await $fetch<{ success: boolean; score: number; 'error-codes'?: string[] }>(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  )

  if (!result.success || result.score <= 0.5) {
    throw createError({ statusCode: 400, statusMessage: 'reCAPTCHA verification failed. Please try again.' })
  }
}

export function isRecaptchaProtectedRoute(fullPath: string, method: string): boolean {
  if (method !== 'POST') return false
  return RECAPTCHA_PROTECTED_ROUTES.some((route) => fullPath.startsWith(route))
}
```

**File 2 (modify):** `apps/website/server/api/[...].ts`

Add reCAPTCHA validation after the OAuth check, before building the target URL. Full updated file:

```typescript
import { verifyRecaptchaToken, isRecaptchaProtectedRoute } from '../utils/recaptcha'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiUrl = process.env.API_URL || 'http://localhost:1337'
  const frontendUrl = process.env.BASE_URL || 'http://localhost:3000'

  const fullPath = event.node.req.url?.replace('/api/', '') || ''

  // OAuth routes: redirect directly to Strapi (unchanged)
  const oauthRoutes = [
    'connect/google',
    'connect/google/callback',
    'connect/facebook',
    'connect/facebook/callback',
  ]
  const isOAuthRoute = oauthRoutes.some((route) => fullPath.startsWith(route))

  if (isOAuthRoute) {
    const targetUrl = `${apiUrl}/api/${fullPath}`
    const query = getQuery(event)
    if (fullPath.includes('connect/google')) {
      query.frontend_url = frontendUrl
      query.redirect_url = `${frontendUrl}/api/connect/google/callback`
    }
    const queryString = new URLSearchParams(query as Record<string, string>).toString()
    const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl
    return sendRedirect(event, finalUrl, 302)
  }

  // reCAPTCHA validation for protected routes
  if (isRecaptchaProtectedRoute(fullPath, event.method ?? '')) {
    const recaptchaToken = getHeader(event, 'x-recaptcha-token')
    await verifyRecaptchaToken(recaptchaToken, config.recaptchaSecretKey as string)
    // Token is valid — proceed. X-Recaptcha-Token is NOT added to forwarded headers below.
  }

  // Build target URL
  const targetUrl = `${apiUrl}/api/${fullPath}`

  // Forward only whitelisted headers — X-Recaptcha-Token is deliberately excluded
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

**Verify:**
- `yarn workspace website test --run` (proxy tests pass: RCP-01 through RCP-05)
- `yarn workspace website nuxt typecheck`

---

### Wave 2 — Dashboard proxy

#### Task 2.1: Update dashboard proxy

The dashboard only protects auth routes (no public contacts or registration endpoint).

**File 1 (new):** `apps/dashboard/server/utils/recaptcha.ts`

```typescript
// apps/dashboard/server/utils/recaptcha.ts
// Dashboard only protects auth routes — no contacts or public registration

export const RECAPTCHA_PROTECTED_ROUTES = [
  'auth/local',
  'auth/forgot-password',
  'auth/reset-password',
] as const

export async function verifyRecaptchaToken(
  token: string | null | undefined,
  secretKey: string,
): Promise<void> {
  if (!token || !token.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'reCAPTCHA token is required' })
  }

  const result = await $fetch<{ success: boolean; score: number }>(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  )

  if (!result.success || result.score <= 0.5) {
    throw createError({ statusCode: 400, statusMessage: 'reCAPTCHA verification failed. Please try again.' })
  }
}

export function isRecaptchaProtectedRoute(fullPath: string, method: string): boolean {
  if (method !== 'POST') return false
  return RECAPTCHA_PROTECTED_ROUTES.some((route) => fullPath.startsWith(route))
}
```

**File 2 (modify):** `apps/dashboard/server/api/[...].ts`

Full updated file:

```typescript
import { verifyRecaptchaToken, isRecaptchaProtectedRoute } from '../utils/recaptcha'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiUrl = process.env.API_URL || 'http://localhost:1337'

  const fullPath = event.node.req.url?.replace('/api/', '') || ''

  // reCAPTCHA validation for protected routes
  if (isRecaptchaProtectedRoute(fullPath, event.method ?? '')) {
    const recaptchaToken = getHeader(event, 'x-recaptcha-token')
    await verifyRecaptchaToken(recaptchaToken, config.recaptchaSecretKey as string)
  }

  // Build target URL
  const targetUrl = `${apiUrl}/api/${fullPath}`

  // Forward only whitelisted headers — X-Recaptcha-Token is deliberately excluded
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

**Verify:**
- `yarn workspace dashboard nuxt typecheck`

---

### Wave 3 — Website frontend components

#### Task 3.1: FormLogin.vue (website) — header migration

**File:** `apps/website/app/components/FormLogin.vue`

Change `handleSubmit` to send token in header, remove from body:

```typescript
const handleSubmit = async (values) => {
  sending.value = true
  try {
    const token = await $recaptcha.execute('submit')

    const response = await client('/auth/local', {
      method: 'POST',
      headers: { 'X-Recaptcha-Token': token ?? '' },
      body: {
        identifier: values.email,
        password: values.password,
        // recaptchaToken removed — now sent as header
      },
    })

    pendingToken.value = response.pendingToken
    router.push('/login/verificar')
  } catch (error) {
    // ... error handling unchanged
  } finally {
    sending.value = false
  }
}
```

**Verify:** Update `apps/website/tests/components/FormLogin.website.test.ts` — the mock for `client` should verify it's called with `headers: { 'X-Recaptcha-Token': 'fake-recaptcha-token' }` and body WITHOUT `recaptchaToken`. Run `yarn workspace website test --run`.

---

#### Task 3.2: FormRegister.vue (website) — header migration

**File:** `apps/website/app/components/FormRegister.vue`

Change the `client('/auth/local/register', ...)` call:

```typescript
const response = (await client('/auth/local/register', {
  method: 'POST',
  headers: { 'X-Recaptcha-Token': token ?? '' },
  body: {
    ...form.value,
    // recaptchaToken removed — now sent as header
  },
})) as { jwt?: string; user?: { id: number } }
```

**Verify:** `yarn workspace website nuxt typecheck`

---

#### Task 3.3: FormForgotPassword.vue (website) — replace SDK call with direct client

**File:** `apps/website/app/components/FormForgotPassword.vue`

Replace `useStrapiAuth().forgotPassword()` with a direct `client` call:

Add `useStrapiClient` import and replace the submission logic:

```typescript
// Add client ref (alongside other refs at top of <script setup>)
const client = useStrapiClient()

const onSubmit = async (values: any) => {
  loading.value = true
  try {
    const token = await $recaptcha.execute('submit')

    await client('/auth/forgot-password', {
      method: 'POST',
      headers: { 'X-Recaptcha-Token': token ?? '' },
      body: { email: values.email, context: 'website' },
    })

    Swal.fire('Éxito', 'Código de restablecimiento enviado con éxito.', 'success')
    router.push('/')
  } catch {
    Swal.fire('Error', 'Hubo un error. Por favor, inténtalo de nuevo.', 'error')
  } finally {
    loading.value = false
  }
}
```

Remove `const { forgotPassword } = useStrapiAuth()` since it's no longer used.

**Verify:** `yarn workspace website nuxt typecheck`

---

#### Task 3.4: FormResetPassword.vue (website) — replace SDK call with direct client

**File:** `apps/website/app/components/FormResetPassword.vue`

Replace `useStrapiAuth().resetPassword()` with a direct `client` call:

```typescript
const client = useStrapiClient()

const onSubmit = async (values: any) => {
  loading.value = true
  try {
    const token = await $recaptcha.execute('submit')

    await client('/auth/reset-password', {
      method: 'POST',
      headers: { 'X-Recaptcha-Token': token ?? '' },
      body: {
        code: values.code,
        password: values.password,
        passwordConfirmation: values.password,
        // recaptchaToken removed — now sent as header
      },
    })

    Swal.fire('Éxito', 'Contraseña restablecida con éxito.', 'success')
    router.push('/')
  } catch {
    Swal.fire('Error', 'Hubo un error. Por favor, inténtalo de nuevo.', 'error')
  } finally {
    loading.value = false
  }
}
```

Remove `const { resetPassword } = useStrapiAuth()`.

**Verify:** `yarn workspace website nuxt typecheck`

---

#### Task 3.5: FormContact.vue (website) — replace strapi.create with direct client

**File:** `apps/website/app/components/FormContact.vue`

Replace `strapi.create("contacts", formData)` with a direct client call:

```typescript
// Add client ref (alongside $recaptcha destructuring)
const client = useStrapiClient()

const submitToStrapi = async (values: any, token: string) => {
  try {
    await client('/contacts', {
      method: 'POST',
      headers: { 'X-Recaptcha-Token': token },
      body: {
        data: {
          fullname: values.name,
          email: values.email,
          company: values.company,
          phone: values.phone,
          message: values.message,
          // recaptchaToken removed — now validated at proxy layer
        },
      },
    })
    sending.value = false
    appStore.setContactFormSent()
    router.push('/contacto/gracias')
  } catch (error) {
    sending.value = false
    console.error(error)
    Swal.fire('Error', 'Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.', 'error')
  }
}
```

Remove `const strapi = useStrapi()` since it's no longer used for this call.

**Verify:** `yarn workspace website nuxt typecheck`

---

#### Task 3.6: Clean up website strapi.d.ts type augmentations

**File:** `apps/website/app/types/strapi.d.ts`

Remove the `recaptchaToken` fields from the Strapi SDK type augmentations since the token is no longer sent in the body:

```typescript
declare module "@nuxtjs/strapi" {
  // ... keep pagination/meta/response types

  interface StrapiForgotPasswordData {
    // recaptchaToken removed — validation moved to Nitro proxy via X-Recaptcha-Token header
    context?: "website" | "dashboard";
  }

  interface StrapiResetPasswordData {
    // recaptchaToken removed — validation moved to Nitro proxy via X-Recaptcha-Token header
  }
}
```

**Verify:** `yarn workspace website nuxt typecheck` — no type errors for FormForgotPassword or FormResetPassword.

---

### Wave 4 — Dashboard frontend components

#### Task 4.1: FormLogin.vue (dashboard) — header migration

**File:** `apps/dashboard/app/components/FormLogin.vue`

Change `handleSubmit` to send token in header, remove from body:

```typescript
const handleSubmit = async (values: Record<string, unknown>) => {
  sending.value = true
  try {
    const token = await $recaptcha.execute('submit')

    const response = await client('/auth/local', {
      method: 'POST',
      headers: { 'X-Recaptcha-Token': token },
      body: {
        identifier: values.email as string,
        password: values.password as string,
        // recaptchaToken removed — now sent as header
      },
    })

    pendingToken.value = (response as { pendingToken: string }).pendingToken
    router.push('/auth/verify-code')
  } catch (error) {
    // ... error handling unchanged
  } finally {
    sending.value = false
  }
}
```

**Verify:** `yarn workspace dashboard nuxt typecheck`

---

#### Task 4.2: FormForgotPassword.vue (dashboard) — replace SDK call with direct client

**File:** `apps/dashboard/app/components/FormForgotPassword.vue`

Same pattern as website equivalent:

```typescript
const client = useStrapiClient()

const onSubmit = async (values: any) => {
  loading.value = true
  try {
    const token = await $recaptcha.execute('submit')

    await client('/auth/forgot-password', {
      method: 'POST',
      headers: { 'X-Recaptcha-Token': token },
      body: { email: values.email as string, context: 'dashboard' },
    })

    Swal.fire('Éxito', 'Código de restablecimiento enviado con éxito.', 'success')
    router.push('/')
  } catch {
    Swal.fire('Error', 'Hubo un error. Por favor, inténtalo de nuevo.', 'error')
  } finally {
    loading.value = false
  }
}
```

Remove `const { forgotPassword } = useStrapiAuth()`.

**Verify:** `yarn workspace dashboard nuxt typecheck`

---

#### Task 4.3: FormResetPassword.vue (dashboard) — replace SDK call with direct client

**File:** `apps/dashboard/app/components/FormResetPassword.vue`

```typescript
const client = useStrapiClient()

const onSubmit = async (values: any) => {
  loading.value = true
  try {
    const token = await $recaptcha.execute('submit')

    await client('/auth/reset-password', {
      method: 'POST',
      headers: { 'X-Recaptcha-Token': token },
      body: {
        code: values.code as string,
        password: values.password as string,
        passwordConfirmation: values.password as string,
        // recaptchaToken removed
      },
    })

    Swal.fire('Éxito', 'Contraseña restablecida con éxito.', 'success')
    router.push('/')
  } catch {
    Swal.fire('Error', 'Hubo un error. Por favor, inténtalo de nuevo.', 'error')
  } finally {
    loading.value = false
  }
}
```

Remove `const { resetPassword } = useStrapiAuth()` and the `as any` cast that was needed for `recaptchaToken`.

**Verify:** `yarn workspace dashboard nuxt typecheck`

---

#### Task 4.4: Clean up dashboard strapi.d.ts type augmentations

**File:** `apps/dashboard/app/types/strapi.d.ts`

Remove `recaptchaToken` from Strapi SDK type augmentations:

```typescript
declare module "@nuxtjs/strapi" {
  interface StrapiForgotPasswordData {
    // recaptchaToken removed — validation moved to Nitro proxy via X-Recaptcha-Token header
    context?: "website" | "dashboard";
  }

  interface StrapiResetPasswordData {
    // recaptchaToken removed — validation moved to Nitro proxy via X-Recaptcha-Token header
  }
}

export {};
```

**Verify:** `yarn workspace dashboard nuxt typecheck`

---

### Wave 5 — Final verification

#### Task 5.1: Full test suite + typecheck

Run the complete verification:

```bash
# TypeScript checks
yarn workspace website nuxt typecheck
yarn workspace dashboard nuxt typecheck

# Test suites
yarn workspace website test --run
yarn workspace dashboard test --run
```

All must pass with zero errors.

#### Task 5.2: Manual smoke test checklist

Before closing the phase, manually verify these scenarios in a local dev environment:

1. **Website login**: Submit login form → should succeed (token sent as header, proxy validates and strips it)
2. **Website login with bad reCAPTCHA**: Simulate low-score token (temporarily lower threshold to 1.0 in dev) → should get 400 before reaching Strapi
3. **Website register**: Complete registration → should succeed
4. **Website forgot password**: Submit email → should succeed
5. **Website reset password**: Complete reset → should succeed
6. **Website contact form**: Submit message → should succeed
7. **Dashboard login**: Submit login form → should succeed
8. **Dashboard forgot password**: Submit email → should succeed
9. **Dashboard reset password**: Complete reset → should succeed
10. **OAuth flow (website only)**: Click "Login with Google" → should NOT trigger reCAPTCHA (OAuth routes excluded)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `config.recaptchaSecretKey` undefined in production | LOW | HIGH | Check for empty string in validator; env var already exists in Strapi (same name) |
| `X-Recaptcha-Token` blocked by `nuxt-security` CORS headers | MEDIUM | HIGH | Website nuxt.config already has custom `Access-Control-Allow-Headers` — must add `X-Recaptcha-Token` to the `headers` array in Strapi's `config/middlewares.ts` CORS config |
| SSR pre-rendering triggers reCAPTCHA validation | LOW | MEDIUM | reCAPTCHA plugin is `.client.ts` — SSR will never call `$recaptcha.execute()` |
| Dashboard has no reCAPTCHA plugin | ❌ FALSE | — | Dashboard HAS `apps/dashboard/app/plugins/recaptcha.client.ts` |

### CORS header in Strapi (important!)
The Strapi CORS config in `apps/strapi/config/middlewares.ts` only allows specific headers:
```
"Content-Type", "Authorization", "sentry-trace", "baggage", "Origin", "Accept",
"X-Requested-With", "Access-Control-Request-Method", "Access-Control-Request-Headers",
"X-Mobile-App-Api-Key"
```
`X-Recaptcha-Token` is NOT in this list. However, since both Nuxt apps proxy via `server/api/[...].ts`, the header travels from browser → Nuxt server (same origin, no CORS), and from Nuxt server → Strapi (server-to-server, CORS not applied). The Strapi CORS header list only matters for browser → Strapi direct requests, which is not the case here. **No Strapi config change needed.**

---

## Dependency Map

```
Wave 0 (config + test scaffold)
  └─ Wave 1 (website proxy utility)
       └─ Wave 2 (dashboard proxy)
            └─ Wave 3 (website frontend)
                 └─ Wave 4 (dashboard frontend)
                      └─ Wave 5 (final verification)
```

Wave 3 and Wave 4 can be worked in parallel once Wave 2 is done.

---

## Definition of Done

- [ ] Both Nitro proxies validate `X-Recaptcha-Token` before forwarding to Strapi
- [ ] `X-Recaptcha-Token` is never forwarded to Strapi
- [ ] All 8 frontend components send token as header, not body
- [ ] `recaptchaSecretKey` is server-only config in both apps
- [ ] Stale `recaptchaToken` type augmentations removed from both `strapi.d.ts`
- [ ] `yarn workspace website test --run` passes
- [ ] `yarn workspace dashboard test --run` passes
- [ ] `yarn workspace website nuxt typecheck` passes
- [ ] `yarn workspace dashboard nuxt typecheck` passes
- [ ] Manual smoke test checklist completed
