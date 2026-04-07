# Phase 87: useApiClient reCAPTCHA Composable — Research

**Researched:** 2026-03-15
**Domain:** Nuxt 4 composable patterns, reCAPTCHA v3 interception, `useStrapiClient` wrapping
**Confidence:** HIGH

---

## Summary

The goal is to centralise the reCAPTCHA token-injection pattern that is currently duplicated across 8 components. All relevant infrastructure already exists: the `$recaptcha` plugin injects a typed `execute(action)` function, the Nitro proxy validates `X-Recaptcha-Token` on the `RECAPTCHA_PROTECTED_ROUTES` list, and `server/utils/recaptcha.ts` **already** checks score ≥ 0.5. The phase therefore consists of three orthogonal tasks:

1. **Create `useApiClient`** — a thin composable that wraps `useStrapiClient()` and automatically injects `X-Recaptcha-Token` on POST / PUT / DELETE, falling back gracefully when `$recaptcha` is unavailable (SSR, adblocker).
2. **Migrate components** — replace the `$recaptcha.execute() → client(…, { headers: … })` pattern with a single `apiClient(path, options)` call.
3. **Verify `recaptcha.ts`** — the score check is already correct (`result.score <= 0.5`). No code change needed, but the task must confirm this and optionally surface the actual score in the error for easier debugging.

**Primary recommendation:** Build `useApiClient` with a `try/catch` around `$recaptcha.execute()` so it degrades silently on SSR/adblocker, then migrate all 8 affected components in a single wave.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `useStrapiClient()` | `@nuxtjs/strapi` v2 | Low-level HTTP client to Strapi | Already in use; respects `API_DISABLE_PROXY` |
| `useNuxtApp()` | Nuxt 4 built-in | Access to `$recaptcha` plugin | Standard Nuxt plugin access pattern |
| TypeScript strict | project-wide | Type safety on composable signature | `typeCheck: true` in both apps |

### No new dependencies required
The full stack is already installed. This phase adds zero new packages.

---

## Architecture Patterns

### Recommended composable structure

```
apps/website/app/composables/
├── useApiClient.ts        ← NEW: wraps useStrapiClient + reCAPTCHA injection
├── useImage.ts            ← UNCHANGED (uses raw fetch, not Strapi client)
└── ...
```

### Pattern: Composable wrapping useStrapiClient

`useStrapiClient()` returns a typed function `(url, options) => Promise<T>`.
`useApiClient` returns the same signature, adding reCAPTCHA header injection before calling through.

```typescript
// Source: direct codebase analysis of apps/website/app/components/FormLogin.vue
export function useApiClient() {
  const client = useStrapiClient()
  const { $recaptcha } = useNuxtApp()

  const MUTATING_METHODS = ['POST', 'PUT', 'DELETE'] as const

  return async function apiClient<T = unknown>(
    url: string,
    options?: Parameters<typeof client>[1],
  ): Promise<T> {
    const method = (options?.method ?? 'GET').toUpperCase()

    if (MUTATING_METHODS.includes(method as (typeof MUTATING_METHODS)[number])) {
      let recaptchaToken: string | undefined

      try {
        // $recaptcha is undefined on SSR and may be undefined if plugin failed
        recaptchaToken = await $recaptcha?.execute('submit')
      } catch {
        // adblocker / reCAPTCHA unavailable — proceed without token
        // Server proxy will reject the request if the route requires reCAPTCHA
      }

      return client<T>(url, {
        ...options,
        headers: {
          ...(options?.headers ?? {}),
          ...(recaptchaToken ? { 'X-Recaptcha-Token': recaptchaToken } : {}),
        },
      })
    }

    return client<T>(url, options)
  }
}
```

### Key design decisions

| Decision | Rationale |
|----------|-----------|
| `$recaptcha?.execute()` optional chaining | Plugin only exists client-side; SSR returns `undefined` |
| `try/catch` around execute | reCAPTCHA v3 can throw if script blocked by adblocker |
| Header merge (`...options?.headers`) | Callers can still pass additional headers (e.g. `Authorization`) |
| No token = no header (omit entirely) | Server proxy skips validation for routes not in `RECAPTCHA_PROTECTED_ROUTES` |
| Hard-code `'submit'` action | All current usages pass `'submit'`; action is informational only |
| Returns same `Promise<T>` as `useStrapiClient` | Drop-in replacement for callers |

### Anti-Patterns to Avoid

- **Don't throw when reCAPTCHA unavailable** — degrade silently; the server decides if a token is mandatory.
- **Don't modify `useImage.ts`** — `uploadFile` uses raw `fetch`, not `useStrapiClient`. It passes `recaptchaToken` as form data, not a header. This pattern is outside scope of this phase.
- **Don't wrap `changePassword` from `useStrapiAuth`** — `FormPassword.vue` uses `changePassword()` from the SDK which doesn't accept custom headers. This requires passing `recaptchaToken` in the body as before, or calling `useStrapiClient` directly. **Scope decision: leave FormPassword.vue with its current body-based approach unless the Strapi endpoint is updated to check the header.**
- **Don't touch `user.store.ts`** — `updateUserProfile` uses `$fetch` with a direct URL and manually injects JWT. The reCAPTCHA flow there is via body field `recaptchaToken`. This is a separate concern from `useApiClient`.

---

## Component-by-Component Migration Analysis

| Component | Current pattern | Can migrate? | Notes |
|-----------|----------------|-------------|-------|
| `FormLogin.vue` | `client("/auth/local", { method: "POST", headers: { X-Recaptcha-Token } })` | ✅ YES | Direct drop-in |
| `FormRegister.vue` | Same pattern → `client("/auth/local/register", …)` | ✅ YES | Drop-in |
| `FormForgotPassword.vue` | Same pattern → `client("/auth/forgot-password", …)` | ✅ YES | Drop-in |
| `FormResetPassword.vue` | Same pattern → `client("/auth/reset-password", …)` | ✅ YES | Drop-in |
| `FormContact.vue` | Same pattern → `client("/contacts", …)` | ✅ YES | Drop-in |
| `FormUsername.vue` | Passes `recaptchaToken` in **body** to `meStore.saveUsername()` → Strapi `strapi.update("users/username", data)` | ⚠️ PARTIAL | Store sends token in request body, not header. Need to verify Strapi endpoint checks body or header. Migrate if endpoint checks header; otherwise out-of-scope. |
| `FormProfile.vue` | Passes `recaptchaToken` in **body** to `userStore.updateUserProfile()` → raw `$fetch` | ⚠️ PARTIAL | Same as above. `updateUserProfile` sends to `/api/users/{id}` (PUT) — NOT in `RECAPTCHA_PROTECTED_ROUTES`. Out of scope. |
| `FormPassword.vue` | Passes `recaptchaToken` in **body** to `useStrapiAuth().changePassword()` | ⚠️ PARTIAL | SDK method, no header injection possible. Out of scope. |
| `UploadImages.vue` | Passes `recaptchaToken` as **FormData field** to `uploadFile()` raw fetch | ⚠️ PARTIAL | Uses raw fetch, not Strapi client. Out of scope. |

**Conclusion:** 5 components have a clean direct migration path. 4 use reCAPTCHA in ways incompatible with header-based injection (body fields, FormData, SDK methods). The 4 partial cases are NOT on `RECAPTCHA_PROTECTED_ROUTES`, so they're lower priority anyway.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| reCAPTCHA execution | Custom script loader | `$recaptcha.execute()` from `recaptcha.client.ts` | Already handles `grecaptcha.ready`, site key, error handling |
| HTTP client to Strapi | Custom `$fetch` wrapper | `useStrapiClient()` | Handles `API_DISABLE_PROXY`, JWT injection, base URL |
| Score validation | Custom score threshold | Existing `verifyRecaptchaToken()` in `server/utils/recaptcha.ts` | Already implemented correctly at score ≤ 0.5 |

---

## Common Pitfalls

### Pitfall 1: SSR execution crash
**What goes wrong:** `$recaptcha` plugin is `client:` only. On SSR, `useNuxtApp().$recaptcha` is `undefined`. Calling `.execute()` without null-check throws at render time.
**How to avoid:** Use optional chaining `$recaptcha?.execute()` AND wrap in `try/catch`.
**Warning signs:** `Cannot read properties of undefined (reading 'execute')` in SSR logs.

### Pitfall 2: TypeScript strict null error on `$recaptcha`
**What goes wrong:** `plugins.d.ts` declares `$recaptcha: { execute: (action: string) => Promise<string | undefined> }` (non-optional). Strict TS complains about optional chain.
**How to avoid:** Cast as `(useNuxtApp() as any).$recaptcha` OR update `plugins.d.ts` to `$recaptcha?: …`. Prefer updating the type declaration to be optional since the plugin is client-only.

### Pitfall 3: Header merge clobbers caller headers
**What goes wrong:** `{ headers: { 'X-Recaptcha-Token': token } }` overwrites all caller headers.
**How to avoid:** Always spread caller headers first: `{ ...options?.headers, 'X-Recaptcha-Token': token }`.

### Pitfall 4: `handleResendConfirmation` in FormLogin
**What goes wrong:** `FormLogin.vue` has a secondary `client()` call (`/auth/send-email-confirmation`) that does NOT currently use reCAPTCHA. After migration, this call goes through `apiClient` and will auto-inject a token — which is fine since the endpoint isn't in `RECAPTCHA_PROTECTED_ROUTES`.
**How to avoid:** Verify this call works with injected token (it will, since proxy ignores the token for non-protected routes).

### Pitfall 5: recaptcha.ts score validation already correct
**What goes wrong:** The task description says "currently only validates that the token is valid" and asks to add score ≥ 0.5. But the current code at line 40 already does: `if (!result.success || result.score <= 0.5)`.
**How to avoid:** Read the file before modifying. The only potential improvement is surfacing the actual score in the error message for observability.

---

## Code Examples

### Current duplicated pattern (to be removed)

```typescript
// Source: FormLogin.vue, FormRegister.vue, FormForgotPassword.vue, FormResetPassword.vue, FormContact.vue
const token = await $recaptcha.execute("submit");
await client("/some/endpoint", {
  method: "POST",
  headers: { "X-Recaptcha-Token": token ?? "" },
  body: { ... },
});
```

### After migration (clean)

```typescript
// Source: new useApiClient.ts composable
const apiClient = useApiClient();
await apiClient("/some/endpoint", {
  method: "POST",
  body: { ... },
});
```

### recaptcha.ts — current state (already has score check)

```typescript
// Source: apps/website/server/utils/recaptcha.ts — line 40
if (!result.success || result.score <= 0.5) {
  throw createError({
    statusCode: 400,
    statusMessage: "reCAPTCHA verification failed. Please try again.",
  });
}
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + `@nuxt/test-utils` |
| Config file | Inferred from `package.json` scripts |
| Quick run command | `yarn vitest run --reporter=verbose` (from `apps/website`) |
| Full suite command | `yarn test` (from `apps/website`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-01 | `useApiClient` injects header on POST/PUT/DELETE | unit | `yarn vitest run composables/useApiClient.test.ts` | ❌ Wave 0 |
| REQ-02 | `useApiClient` passes through GET without header | unit | same | ❌ Wave 0 |
| REQ-03 | `useApiClient` degrades gracefully when `$recaptcha` undefined | unit | same | ❌ Wave 0 |
| REQ-04 | Caller-supplied headers are preserved | unit | same | ❌ Wave 0 |
| REQ-05 | `recaptcha.ts` rejects score < 0.5 | unit | `yarn vitest run utils/recaptcha.test.ts` | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] `apps/website/app/composables/useApiClient.test.ts` — covers REQ-01..04
- [ ] `apps/website/server/utils/recaptcha.test.ts` — covers REQ-05 (verify existing score logic)

---

## Open Questions

1. **`FormUsername.vue` — header vs body for `saveUsername`**
   - What we know: `meStore.saveUsername()` calls `strapi.update("users/username", data)` which sends `recaptchaToken` in the request body.
   - What's unclear: Does the Strapi `users/username` endpoint check `X-Recaptcha-Token` header or body field?
   - Recommendation: Check `apps/strapi` middleware for `users/username`. If it checks header, migrate. If body, leave as-is and note as tech debt.

2. **`FormProfile.vue` / `updateUserProfile` — PUT to `/api/users/{id}`**
   - What we know: This route is NOT in `RECAPTCHA_PROTECTED_ROUTES`.
   - Recommendation: Out of scope. Route is authenticated (JWT required), so bot risk is low.

---

## Sources

### Primary (HIGH confidence)
- Direct file reads: `apps/website/app/plugins/recaptcha.client.ts`, `apps/website/server/utils/recaptcha.ts`, `apps/website/server/api/[...].ts` — authoritative source of truth for current behaviour
- `apps/website/app/types/plugins.d.ts` — TypeScript interface for `$recaptcha`
- All 8 components with manual reCAPTCHA logic — exhaustive grep scan

### Secondary (MEDIUM confidence)
- `@nuxtjs/strapi` v2 source (inferred from composable usage patterns) — `useStrapiClient()` returns callable function with `(url, options)` signature

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all infrastructure already present in codebase
- Architecture: HIGH — pattern directly derived from existing component code
- Pitfalls: HIGH — identified from actual code (SSR, type nullability, header merge, existing score check)
- Migration scope: HIGH — exhaustive grep + file reads of all 8 components

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable codebase, no fast-moving dependencies)
