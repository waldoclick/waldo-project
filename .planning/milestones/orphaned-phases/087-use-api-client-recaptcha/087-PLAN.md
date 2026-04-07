# Phase 87: useApiClient reCAPTCHA Composable — Plan

**Planned:** 2026-03-15
**Phase directory:** `.planning/phases/087-use-api-client-recaptcha/`
**Scope:** `apps/website` only

---

## Goal

Centralise the reCAPTCHA token-injection pattern (currently duplicated across 5 components) into a single composable `useApiClient` that auto-injects `X-Recaptcha-Token` on POST/PUT/DELETE, then migrate all clean-migration components to use it.

---

## What we are NOT doing

- **No changes to `apps/dashboard`** — locked out of scope.
- **No changes to `useImage.ts` / `UploadImages.vue`** — uses raw `fetch` + FormData; token is passed as a form field, not a header. Incompatible with `useApiClient` design.
- **No changes to `FormProfile.vue` / `FormPassword.vue` / `FormUsername.vue`** — these pass `recaptchaToken` in the request body to SDK methods (`changePassword`, `strapi.update`) or store actions (`updateUserProfile`, `saveUsername`) that don't support custom header injection. Out of scope.
- **No changes to `recaptcha.ts` score validation** — already correctly rejects `score <= 0.5` at line 40. No code change needed; confirmed during research.

---

## Wave 0 — Test scaffolding

### Task 0.1 — Create `useApiClient.test.ts`

**File:** `apps/website/app/composables/useApiClient.test.ts`
**Action:** Create with the following test structure (stubs mocked; implementation doesn't exist yet).

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Nuxt auto-imports
const mockClient = vi.fn()
const mockExecute = vi.fn()

vi.mock('#imports', () => ({
  useStrapiClient: () => mockClient,
  useNuxtApp: () => ({ $recaptcha: { execute: mockExecute } }),
}))

// Import after mock
const { useApiClient } = await import('./useApiClient')

describe('useApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockClient.mockResolvedValue({ ok: true })
    mockExecute.mockResolvedValue('test-token-abc')
  })

  it('injects X-Recaptcha-Token on POST', async () => {
    const apiClient = useApiClient()
    await apiClient('/auth/local', { method: 'POST', body: { foo: 'bar' } })
    expect(mockExecute).toHaveBeenCalledWith('submit')
    expect(mockClient).toHaveBeenCalledWith('/auth/local', expect.objectContaining({
      headers: expect.objectContaining({ 'X-Recaptcha-Token': 'test-token-abc' }),
    }))
  })

  it('injects X-Recaptcha-Token on PUT', async () => {
    const apiClient = useApiClient()
    await apiClient('/users/1', { method: 'PUT', body: {} })
    expect(mockExecute).toHaveBeenCalled()
    expect(mockClient).toHaveBeenCalledWith('/users/1', expect.objectContaining({
      headers: expect.objectContaining({ 'X-Recaptcha-Token': 'test-token-abc' }),
    }))
  })

  it('injects X-Recaptcha-Token on DELETE', async () => {
    const apiClient = useApiClient()
    await apiClient('/items/1', { method: 'DELETE' })
    expect(mockExecute).toHaveBeenCalled()
    expect(mockClient).toHaveBeenCalledWith('/items/1', expect.objectContaining({
      headers: expect.objectContaining({ 'X-Recaptcha-Token': 'test-token-abc' }),
    }))
  })

  it('does NOT inject header on GET', async () => {
    const apiClient = useApiClient()
    await apiClient('/items', { method: 'GET' })
    expect(mockExecute).not.toHaveBeenCalled()
    const callArgs = mockClient.mock.calls[0][1]
    expect(callArgs?.headers?.['X-Recaptcha-Token']).toBeUndefined()
  })

  it('defaults to GET when method is not specified', async () => {
    const apiClient = useApiClient()
    await apiClient('/items')
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('preserves caller-supplied headers alongside reCAPTCHA header', async () => {
    const apiClient = useApiClient()
    await apiClient('/auth/local', {
      method: 'POST',
      headers: { 'X-Custom-Header': 'my-value' },
      body: {},
    })
    expect(mockClient).toHaveBeenCalledWith('/auth/local', expect.objectContaining({
      headers: expect.objectContaining({
        'X-Custom-Header': 'my-value',
        'X-Recaptcha-Token': 'test-token-abc',
      }),
    }))
  })

  it('proceeds without token when $recaptcha.execute throws (adblocker)', async () => {
    mockExecute.mockRejectedValue(new Error('reCAPTCHA blocked'))
    const apiClient = useApiClient()
    await expect(
      apiClient('/auth/local', { method: 'POST', body: {} })
    ).resolves.toEqual({ ok: true })
    // Header should be absent, not throw
    const callArgs = mockClient.mock.calls[0][1]
    expect(callArgs?.headers?.['X-Recaptcha-Token']).toBeUndefined()
  })

  it('proceeds without token when $recaptcha is undefined (SSR)', async () => {
    vi.mock('#imports', () => ({
      useStrapiClient: () => mockClient,
      useNuxtApp: () => ({}), // no $recaptcha
    }))
    // Re-import with new mock
    vi.resetModules()
    const { useApiClient: useApiClientSSR } = await import('./useApiClient')
    const apiClient = useApiClientSSR()
    await expect(
      apiClient('/auth/local', { method: 'POST', body: {} })
    ).resolves.toEqual({ ok: true })
  })
})
```

---

## Wave 1 — Create composable

### Task 1.1 — Create `useApiClient.ts`

**File:** `apps/website/app/composables/useApiClient.ts`
**Action:** Create new file.

```typescript
/**
 * useApiClient — drop-in replacement for useStrapiClient() that automatically
 * injects X-Recaptcha-Token on POST, PUT and DELETE requests.
 *
 * Falls back gracefully when $recaptcha is unavailable (SSR, adblocker).
 * Caller-supplied headers are always preserved.
 */
export function useApiClient() {
  const client = useStrapiClient()
  const nuxtApp = useNuxtApp()

  const MUTATING_METHODS = ['POST', 'PUT', 'DELETE'] as const
  type MutatingMethod = (typeof MUTATING_METHODS)[number]

  return async function apiClient<T = unknown>(
    url: string,
    options?: Parameters<typeof client>[1],
  ): Promise<T> {
    const method = ((options?.method as string | undefined) ?? 'GET').toUpperCase()

    if (MUTATING_METHODS.includes(method as MutatingMethod)) {
      let recaptchaToken: string | undefined

      try {
        // $recaptcha is a client-only plugin — undefined on SSR
        recaptchaToken = await (nuxtApp.$recaptcha as { execute: (action: string) => Promise<string> } | undefined)?.execute('submit')
      } catch {
        // reCAPTCHA blocked (adblocker) or script load failure — proceed without token.
        // The Nitro proxy will reject the request only if the route is in
        // RECAPTCHA_PROTECTED_ROUTES and the token is missing.
      }

      return client<T>(url, {
        ...options,
        headers: {
          ...(options?.headers as Record<string, string> | undefined ?? {}),
          ...(recaptchaToken ? { 'X-Recaptcha-Token': recaptchaToken } : {}),
        },
      })
    }

    return client<T>(url, options)
  }
}
```

**Verification:** `yarn vitest run composables/useApiClient.test.ts` from `apps/website` — all 8 tests green.

---

## Wave 2 — Migrate components

For each component:
1. Remove `const { $recaptcha } = useNuxtApp()` (and `import { useNuxtApp } from "#app"` if it's only used for `$recaptcha`)
2. Replace `const client = useStrapiClient()` with `const apiClient = useApiClient()`
3. Remove `const token = await $recaptcha.execute("submit")` call
4. Replace `client(url, { method, headers: { "X-Recaptcha-Token": token ?? "" }, body })` with `apiClient(url, { method, body })`

### Task 2.1 — Migrate `FormLogin.vue`

**File:** `apps/website/app/components/FormLogin.vue`

Changes in `<script setup>`:
- Remove: `const { $recaptcha } = useNuxtApp()`
- Remove: `import { useNuxtApp } from "#app"` (only used for `$recaptcha`)
- Replace: `const client = useStrapiClient()` → `const apiClient = useApiClient()`
- In `handleSubmit`: Remove `const token = await $recaptcha.execute("submit")`
- Replace the `await client("/auth/local", { method: "POST", headers: { "X-Recaptcha-Token": token ?? "" }, body: { … } })` call:

```typescript
const response = await apiClient("/auth/local", {
  method: "POST",
  body: {
    identifier: values.email,
    password: values.password,
  },
});
```

- In `handleResendConfirmation`: Replace `await client("/auth/send-email-confirmation", { … })` with `await apiClient("/auth/send-email-confirmation", { … })` (no reCAPTCHA token needed here, but apiClient will inject one automatically since it's POST — this is fine, the route is not in RECAPTCHA_PROTECTED_ROUTES so the proxy ignores the token).

**Note:** Keep `import { useRouter } from "vue-router"` and `import { useNuxtApp } from "#app"` only if `$recaptcha` was the sole reason for the import. Check for other usages before removing.

**Result:** `$recaptcha` removed, `client` → `apiClient`.

### Task 2.2 — Migrate `FormRegister.vue`

**File:** `apps/website/app/components/FormRegister.vue`

Changes in `<script setup lang="ts">`:
- Remove: `const { $recaptcha } = useNuxtApp()`
- Remove: `import { useNuxtApp } from "#app"` (only used for `$recaptcha`)
- Replace: `const client = useStrapiClient()` → `const apiClient = useApiClient()`
- In `handleSubmit` (step 2 branch): Remove `const token = await $recaptcha.execute("submit")`
- Replace the `await client("/auth/local/register", { method: "POST", headers: { "X-Recaptcha-Token": token ?? "" }, body: { … } })` call:

```typescript
const response = (await apiClient("/auth/local/register", {
  method: "POST",
  body: {
    ...form.value,
  },
})) as { jwt?: string; user?: { id: number } };
```

### Task 2.3 — Migrate `FormForgotPassword.vue`

**File:** `apps/website/app/components/FormForgotPassword.vue`

Changes:
- Remove: `const { $recaptcha } = useNuxtApp()` and `import { useNuxtApp } from "#app"`
- Replace: `const client = useStrapiClient()` → `const apiClient = useApiClient()`
- In `onSubmit`: Remove `const token = await $recaptcha.execute("submit")`
- Replace:

```typescript
await apiClient("/auth/forgot-password", {
  method: "POST",
  body: { email: values.email, context: "website" },
});
```

### Task 2.4 — Migrate `FormResetPassword.vue`

**File:** `apps/website/app/components/FormResetPassword.vue`

Changes:
- Remove: `const { $recaptcha } = useNuxtApp()` and `import { useNuxtApp } from "#app"`
- Replace: `const client = useStrapiClient()` → `const apiClient = useApiClient()`
- In `onSubmit`: Remove `const token = await $recaptcha.execute("submit")`
- Replace:

```typescript
await apiClient("/auth/reset-password", {
  method: "POST",
  body: {
    code: values.code,
    password: values.password,
    passwordConfirmation: values.password,
  },
});
```

### Task 2.5 — Migrate `FormContact.vue`

**File:** `apps/website/app/components/FormContact.vue`

Changes:
- Remove: `const { $recaptcha } = useNuxtApp()` (from `import { useNuxtApp, useStrapiUser } from "#imports"` — keep `useStrapiUser`)
- Replace: `const client = useStrapiClient()` → `const apiClient = useApiClient()`
- In `submitToStrapi`: Change signature to `async (values: any)` (remove `token` parameter)
- Replace:

```typescript
const submitToStrapi = async (values: any) => {
  try {
    await apiClient("/contacts", {
      method: "POST",
      body: {
        data: {
          fullname: values.name,
          email: values.email,
          company: values.company,
          phone: values.phone,
          message: values.message,
        },
      },
    });
    sending.value = false;
    appStore.setContactFormSent();
    router.push("/contacto/gracias");
  } catch (error) {
    sending.value = false;
    console.error(error);
    Swal.fire(
      "Error",
      "Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.",
      "error",
    );
  }
};
```

- In `onSubmit`: Remove `const token = await $recaptcha.execute("submit")` and change `await submitToStrapi(values, token ?? "")` to `await submitToStrapi(values)`.

---

## Wave 3 — TypeScript type update

### Task 3.1 — Mark `$recaptcha` as optional in `plugins.d.ts`

**File:** `apps/website/app/types/plugins.d.ts`

The plugin is `recaptcha.client.ts` (client-only). `$recaptcha` will be `undefined` on SSR. Marking it optional prevents false confidence at call sites.

**Change:**

```typescript
declare module "#app" {
  interface NuxtApp {
    $cookies: CookiesStatic;
    $checkSiteHealth: () => Promise<{
      hasError: boolean;
      errorDetails: Array<{ type: string; message: string }>;
    }>;
    $recaptcha?: {
      execute: (action: string) => Promise<string | undefined>;
    };
  }
}
```

**Note:** After this change, all existing usages of `$recaptcha` outside `useApiClient` will get TypeScript errors if they don't null-check. Review remaining usages in `FormProfile.vue`, `FormPassword.vue`, `FormUsername.vue`, `UploadImages.vue` — they should already be in `onMounted`/submit handlers (client-only), so at runtime they're fine. Add `!` non-null assertion where appropriate for those out-of-scope components, or leave the strict check as a reminder.

---

## Wave 4 — Verify `recaptcha.ts` (documentation task)

### Task 4.1 — Confirm score validation in `recaptcha.ts`

**File:** `apps/website/server/utils/recaptcha.ts`

**Action:** Read file, confirm line 40 already has: `if (!result.success || result.score <= 0.5)`.

**Optional enhancement:** Surface the actual score in the error message for observability:

```typescript
if (!result.success || result.score <= 0.5) {
  throw createError({
    statusCode: 400,
    statusMessage: `reCAPTCHA verification failed. Please try again.${
      result.score !== undefined ? ` (score: ${result.score})` : ''
    }`,
  });
}
```

**Note:** Only add score to error message if it won't expose sensitive data to end users. Since this is a 400 response visible to the frontend, keep the message generic in production. The score surfacing is only useful for server logs. Consider logging with `console.warn` instead of putting it in `statusMessage`.

---

## Execution order

```
Wave 0: Create test file (useApiClient.test.ts)
Wave 1: Create useApiClient.ts composable
        → Run tests: all 8 should pass
Wave 2: Migrate 5 components (2.1 → 2.5)
        → Manual smoke test: login, register, forgot-password, reset-password, contact form
Wave 3: Update plugins.d.ts ($recaptcha optional)
        → Run yarn typecheck from apps/website
Wave 4: Confirm recaptcha.ts (read-only verification, optional score logging)
```

---

## Files changed summary

| File | Action |
|------|--------|
| `apps/website/app/composables/useApiClient.ts` | CREATE |
| `apps/website/app/composables/useApiClient.test.ts` | CREATE |
| `apps/website/app/components/FormLogin.vue` | MODIFY |
| `apps/website/app/components/FormRegister.vue` | MODIFY |
| `apps/website/app/components/FormForgotPassword.vue` | MODIFY |
| `apps/website/app/components/FormResetPassword.vue` | MODIFY |
| `apps/website/app/components/FormContact.vue` | MODIFY |
| `apps/website/app/types/plugins.d.ts` | MODIFY |
| `apps/website/server/utils/recaptcha.ts` | VERIFY (optional minor tweak) |

**Not changed (out of scope):**
- `FormProfile.vue` — body-based token, `updateUserProfile` store action
- `FormPassword.vue` — SDK `changePassword()` method, no header injection
- `FormUsername.vue` — body-based token, `saveUsername` store action
- `UploadImages.vue` — raw fetch + FormData
- `useImage.ts` — raw fetch
- `apps/dashboard/**` — locked out of scope

---

## Definition of Done

- [ ] `useApiClient.ts` created and all 8 vitest tests pass
- [ ] All 5 migrated components no longer import `$recaptcha` or `useStrapiClient` directly
- [ ] `plugins.d.ts` marks `$recaptcha` as optional
- [ ] `yarn typecheck` passes in `apps/website`
- [ ] Manual smoke test: login form submits successfully (reCAPTCHA token injected via composable)
- [ ] No regressions in other forms (contact, register, forgot-password, reset-password)
