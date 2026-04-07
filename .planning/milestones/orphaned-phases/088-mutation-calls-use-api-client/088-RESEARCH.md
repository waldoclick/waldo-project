# Phase 88: Migrate Mutation Calls to useApiClient — Research

**Researched:** 2026-03-15
**Domain:** Nuxt 4 composables, Pinia stores, `useApiClient`, `useStrapiClient`, `useStrapiAuth`, `$fetch`
**Confidence:** HIGH

---

## Summary

Phase 087 created `useApiClient` and migrated the 5 "header-pattern" components (FormLogin, FormRegister, etc.). Phase 088 completes the migration by targeting **15 mutation calls** in 9 files that still bypass `useApiClient`. These fall into five categories, each with a distinct migration pattern.

The core composable is already in production and tested. This phase is purely a mechanical refactor — no new infrastructure is needed. The key complexity is in Pinia stores (must call `useApiClient()` at store-setup level, not inside async callbacks) and in replacing the `$fetch`-based `deactivateAd` (which also uses a numeric `id` instead of `documentId`, violating AGENTS.md).

`useApiClient` returns an async function with the same `(url, options) => Promise<T>` signature as `useStrapiClient`. For `strapi.update()` calls the equivalent is `PUT /api/{resource}/{id}` (but these custom endpoints use non-standard paths like `users/username`, `users/avatar`, `users/cover`). For `strapi.create()` calls it is `POST /api/{resource}`. The Strapi SDK wraps responses in `{ data, meta }` — callers must be checked to see if they access `.data` on the response.

**Primary recommendation:** Migrate all 15 calls in a single wave, grouped by file. Use `useApiClient()` at setup context level in every file. For `deactivateAd`, switch to `documentId` and update the `Ad` type and call site.

---

## Standard Stack

### Core (already installed — zero new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `useApiClient` | Phase 087 | Mutating HTTP calls with reCAPTCHA token injection | Established project standard as of this phase |
| `useStrapiClient` | `@nuxtjs/strapi` v2 | Low-level Strapi HTTP client | Already in use everywhere |
| `useStrapi` | `@nuxtjs/strapi` v2 | Higher-level Strapi SDK (`find`, `create`, `update`) | Already in use |

### Response Shape Awareness

`useStrapiClient` and therefore `useApiClient` return raw response bodies — they do NOT wrap in `{ data }`. The higher-level `useStrapi().create()` and `useStrapi().update()` DO wrap in `{ data }`. This is the critical distinction when migrating.

| SDK Method | Response shape | useApiClient equivalent |
|------------|---------------|-------------------------|
| `strapi.update("users/username", data)` | `{ data: User }` | `apiClient("/api/users/username", { method: "PUT", body: data })` → raw `User` |
| `strapi.create("payments/checkout", data)` | `{ data: { url, token } }` | `apiClient("/api/payments/checkout", { method: "POST", body: data })` → raw `{ url, token }` |
| `strapi.create("ads/save-draft", data)` | `{ data: { id, documentId } }` | `apiClient("/api/ads/save-draft", { method: "POST", body: data })` → raw `{ id, documentId }` |

**CRITICAL:** Callers that access `.data` on the SDK response must be updated to access the field directly when switching to `useApiClient`.

---

## Architecture Patterns

### Pattern: useApiClient in Pinia stores

Pinia setup stores (function form) run in Vue's setup context. `useApiClient()` must be called **at the store root level**, not inside async action functions.

```typescript
// Source: apps/website/app/stores/user.store.ts (updateUserProfile — already correct example)
export const useMeStore = defineStore("me", () => {
  const apiClient = useApiClient()  // ← called at setup level ✅

  const saveUsername = async (data: { username: string }) => {
    // ← NOT calling useApiClient() here
    return apiClient("/api/users/username", {
      method: "PUT",
      body: data,
    });
  };
});
```

`user.store.ts` already has a correct `useApiClient()` usage in `updateUserProfile` (line 102) — this confirms the pattern works in stores.

### Pattern: useApiClient in Vue components (Composition API)

```typescript
// At script setup level (top of <script setup>)
const apiClient = useApiClient()

// Inside async handler
const handleSubmit = async () => {
  const response = await apiClient("/api/payments/checkout", {
    method: "POST",
    body: { ... },
  })
  // response is raw — no .data wrapper
}
```

### Pattern: Replacing strapi.update()

`strapi.update(resource, data)` maps to `PUT /api/{resource}` (Strapi convention adds `/api/` prefix).
`useApiClient` calls `useStrapiClient` which uses the same base URL and prefix rules.

```typescript
// Before
const response = await strapi.update("users/username", data)
// response.data = User — SDK wraps in { data }

// After
const response = await apiClient("/api/users/username", {
  method: "PUT",
  body: data,
})
// response = User — useApiClient returns raw body
```

**Verification:** `useStrapiClient` path: the `@nuxtjs/strapi` module prepends `/api` only for SDK methods like `create`/`update`/`find`. For raw `useStrapiClient()` calls, the path is used verbatim. So `/api/users/username` is the correct path.

### Pattern: Replacing strapi.create()

```typescript
// Before
const response = await create("payments/checkout", payload)
const { url, token } = response.data ?? {}  // SDK wraps in { data }

// After
const response = await apiClient<{ url: string; token: string }>("/api/payments/checkout", {
  method: "POST",
  body: payload,
})
const { url, token } = response  // raw body — no .data
```

### Pattern: Replacing raw useStrapiClient() calls

These are already using the raw client, so migration is a direct rename:

```typescript
// Before
const client = useStrapiClient()
await client("/auth/send-email-confirmation", { method: "POST", body: { email } })

// After
const apiClient = useApiClient()
await apiClient("/auth/send-email-confirmation", { method: "POST", body: { email } })
```

No response shape change — both return raw body.

### Pattern: Replacing useStrapiAuth().changePassword()

`changePassword()` is an SDK helper that calls `POST /api/auth/change-password` internally. It does not support custom headers. Replacement:

```typescript
// Before
const { changePassword } = useStrapiAuth()
await changePassword({ currentPassword, password, passwordConfirmation, recaptchaToken: token })

// After
const apiClient = useApiClient()
await apiClient("/api/auth/change-password", {
  method: "POST",
  body: { currentPassword, password, passwordConfirmation },
  // recaptchaToken is now injected as X-Recaptcha-Token header by useApiClient automatically
})
```

**Note:** The `recaptchaToken` body field is no longer needed in the body — `useApiClient` injects it as a header. Remove the `$recaptcha.execute()` call and body field entirely.

### Pattern: Replacing $fetch with useApiClient (deactivateAd)

`deactivateAd` currently uses `$fetch` with manual JWT injection and a numeric `id`. Replace with `useApiClient` using `documentId`:

```typescript
// Before
const deactivateAd = async (adId: number, reason?: string) => {
  const token = useCookie("waldo_jwt").value
  const apiUrl = process.env.API_DISABLE_PROXY === "true"
    ? config.public.apiUrl : config.public.baseUrl
  await $fetch(`${apiUrl}/api/ads/${adId}/deactivate`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: { reason_for_deactivation: reason ?? null },
  })
}

// After
const deactivateAd = async (adDocumentId: string, reason?: string) => {
  return apiClient(`/api/ads/${adDocumentId}/deactivate`, {
    method: "PUT",
    body: { reason_for_deactivation: reason ?? null },
  })
}
```

**JWT injection:** `useStrapiClient` (and therefore `useApiClient`) automatically injects the `Authorization: Bearer` header from the stored JWT cookie. The manual `useCookie("waldo_jwt")` and Authorization header are no longer needed.

**`API_DISABLE_PROXY`:** `useStrapiClient` already handles this via the `@nuxtjs/strapi` module configuration. The manual `apiUrl` logic is not needed.

### Anti-Patterns to Avoid

- **Don't call `useApiClient()` inside async functions** — must be called at setup/store root level.
- **Don't add `.data` wrapper access** when switching from `useApiClient` — it returns raw bodies.
- **Don't keep `const { create } = useStrapi()`** after migration — remove the destructure if `create` is the only usage.
- **Don't keep `const client = useStrapiClient()`** — remove and replace with `useApiClient()`.
- **Don't pass `recaptchaToken` in body** for `FormPassword.vue` — `useApiClient` injects it as a header; remove the body field entirely.
- **Don't use numeric `id` for `deactivateAd`** — always use `documentId` per AGENTS.md.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| reCAPTCHA injection | Manual `$recaptcha.execute()` | `useApiClient` | Phase 087 built this exactly |
| JWT injection | `useCookie("waldo_jwt")` + manual header | `useStrapiClient` (via `useApiClient`) | SDK handles JWT automatically |
| Base URL selection | Manual `API_DISABLE_PROXY` check | `useStrapiClient` (via `useApiClient`) | SDK handles env-based base URL |

---

## Common Pitfalls

### Pitfall 1: `.data` response shape mismatch
**What goes wrong:** Callers of `strapi.create()` / `strapi.update()` access `response.data`. After migrating to `useApiClient`, `response` IS the data — accessing `.data` returns `undefined`.
**Why it happens:** SDK methods wrap the raw HTTP response in `{ data, meta }`. `useApiClient`/`useStrapiClient` return raw bodies.
**How to avoid:** For every migrated call, trace what `.data` was used for and remove the `.data` accessor.
**Specific locations:**
- `CheckoutDefault.vue:68` — `const { url, token } = response.data ?? {}`
- `resumen.vue:137` — `draftResponse.data.id`
- `resumen.vue:165` — `draftResponse.data.id`
- `resumen.vue:183-193` — `freeAdResponse.data?.ad?.documentId`

### Pitfall 2: useApiClient() called inside async callback (Pinia store)
**What goes wrong:** Calling `useApiClient()` inside the async action function (not at store setup level) may work but is incorrect pattern — Vue composables must be called synchronously during setup.
**Why it happens:** `user.store.ts` already has the correct pattern (`updateUserProfile`). `me.store.ts` uses `useStrapi()` at setup level — same placement needed for `useApiClient()`.
**How to avoid:** Always place `const apiClient = useApiClient()` at the top of the `defineStore(() => { ... })` factory function, alongside other composable calls.

### Pitfall 3: deactivateAd call site uses .id instead of .documentId
**What goes wrong:** `CardProfileAd.vue:344` calls `userStore.deactivateAd(props.ad.id, reason)`. After changing the store signature to accept `documentId: string`, the call site must also pass `props.ad.documentId`.
**Why it happens:** `Ad` type currently doesn't have `documentId` field — must be added.
**How to avoid:** 
1. Add `documentId: string` to `Ad` interface in `app/types/ad.d.ts`
2. Update `deactivateAd` signature from `adId: number` to `adDocumentId: string`  
3. Update `CardProfileAd.vue` call from `props.ad.id` to `props.ad.documentId`

### Pitfall 4: FormPassword.vue — recaptchaToken body field must be removed
**What goes wrong:** Current code sends `recaptchaToken` in the request body. If migrating to `useApiClient`, the body field should be removed entirely (token goes in header). Leaving the body field is harmless but is noise.
**Why it happens:** Phase 087 left `FormPassword.vue` out-of-scope with `changePassword()` SDK method. Now replacing the SDK call entirely.
**How to avoid:** Remove `recaptchaToken` from the body. Remove `$recaptcha!.execute("submit")` call. Remove `const { $recaptcha } = useNuxtApp()` if only used for this. Remove `const { changePassword } = useStrapiAuth()` if only used for `changePassword`.

### Pitfall 5: imports.stub.ts for Vitest
**What goes wrong:** Phase 087 established that `useApiClient.ts` must explicitly import from `#imports`. Existing test stubs may not export all needed symbols.
**Why it happens:** `tests/stubs/imports.stub.ts` is used by Vitest for `#imports` mock.
**How to avoid:** No new composable files are being created, so this pitfall is already handled by the Phase 087 stub.

### Pitfall 6: FormPassword.vue has two useStrapiAuth() calls
**What goes wrong:** `FormPassword.vue` has both `const { changePassword } = useStrapiAuth()` AND `const { login } = useStrapiAuth()` (line 96). Only `changePassword` is being replaced.
**How to avoid:** Keep the `login` destructure (or re-check if it's actually used — `login` doesn't appear in the template logic, check if it's a dead import).

---

## Code Examples

### Category A: strapi.update() → useApiClient (me.store.ts)

```typescript
// Source: apps/website/app/stores/me.store.ts
// Before
const strapi = useStrapi()
const saveUsername = async (data: { username: string }) => {
  const response = await strapi.update("users/username", data)
  return response
}

// After
const apiClient = useApiClient()
const saveUsername = async (data: { username: string }) => {
  return apiClient("/api/users/username", {
    method: "PUT",
    body: data,
  })
}
```

### Category A: strapi.update() → useApiClient (UploadAvatar.vue)

```typescript
// Before (inside function — wrong pattern)
const updateUserAvatar = async (image) => {
  const strapi = useStrapi()  // ← instantiated inside function
  await strapi.update("users/avatar", { avatar: image.id })
}

// After
// At <script setup> top level:
const apiClient = useApiClient()

// Inside function:
const updateUserAvatar = async (image) => {
  await apiClient("/api/users/avatar", {
    method: "PUT",
    body: { avatar: image.id },
  })
}
```

**Note:** `UploadAvatar.vue` instantiates `useStrapi()` inside the function body (`const strapi = useStrapi()`) — this is an existing AGENTS.md violation. Moving `useApiClient()` to top level corrects this.

### Category B: strapi.create() → useApiClient (CheckoutDefault.vue)

```typescript
// Before
const { create } = useStrapi()
const response = await create<{ url: string; token: string }>(
  "payments/checkout", { pack, ad_id, featured, is_invoice } as unknown as Parameters<typeof create>[1]
)
const { url, token } = response.data ?? {}  // ← .data accessor

// After
const apiClient = useApiClient()
const response = await apiClient<{ url: string; token: string }>("/api/payments/checkout", {
  method: "POST",
  body: { pack: packValue, ad_id: adStore.ad.ad_id, featured: adStore.featured, is_invoice: adStore.is_invoice },
})
const { url, token } = response  // ← direct access, no .data
```

### Category B: strapi.create() → useApiClient (resumen.vue save-draft)

```typescript
// Before
const { create } = useStrapi()
const draftResponse = await create<{ id: number }>("ads/save-draft", {
  ad: adStore.ad,
} as unknown as Parameters<typeof create>[1])
adStore.updateAdId(draftResponse.data.id)  // ← .data.id

// After
const apiClient = useApiClient()
const draftResponse = await apiClient<{ id: number; documentId: string }>("/api/ads/save-draft", {
  method: "POST",
  body: { ad: adStore.ad },
})
adStore.updateAdId(draftResponse.id)  // ← direct .id
```

### Category C: useStrapiClient() → useApiClient (confirmar.vue)

```typescript
// Before
const client = useStrapiClient()
await client("/auth/send-email-confirmation", {
  method: "POST",
  body: { email: registrationEmail.value },
})

// After
const apiClient = useApiClient()
await apiClient("/auth/send-email-confirmation", {
  method: "POST",
  body: { email: registrationEmail.value },
})
```

### Category D: changePassword() → useApiClient (FormPassword.vue)

```typescript
// Before
const { $recaptcha } = useNuxtApp()
const { changePassword } = useStrapiAuth()
const handleSubmit = async (values: any) => {
  const token = await $recaptcha!.execute("submit")
  await changePassword({
    currentPassword: values.current_password,
    password: values.password,
    passwordConfirmation: values.password_confirmation,
    recaptchaToken: token,
  })
}

// After
const apiClient = useApiClient()
// Remove: const { $recaptcha } = useNuxtApp()
// Remove: const { changePassword } = useStrapiAuth()
const handleSubmit = async (values: any) => {
  // No $recaptcha.execute() needed — useApiClient injects header automatically
  await apiClient("/api/auth/change-password", {
    method: "POST",
    body: {
      currentPassword: values.current_password,
      password: values.password,
      passwordConfirmation: values.password_confirmation,
      // No recaptchaToken field — header is injected by useApiClient
    },
  })
}
```

### Category E: $fetch → useApiClient (user.store.ts deactivateAd)

```typescript
// Before
const deactivateAd = async (adId: number, reason?: string) => {
  const token = useCookie("waldo_jwt").value
  const apiUrl = process.env.API_DISABLE_PROXY === "true"
    ? config.public.apiUrl : config.public.baseUrl
  await $fetch(`${apiUrl}/api/ads/${adId}/deactivate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: { reason_for_deactivation: reason ?? null },
  })
}

// After
// apiClient declared at store root level
const deactivateAd = async (adDocumentId: string, reason?: string) => {
  return apiClient(`/api/ads/${adDocumentId}/deactivate`, {
    method: "PUT",
    body: { reason_for_deactivation: reason ?? null },
  })
}
```

---

## File-by-File Migration Summary

| # | File | Category | Calls | Response shape change? | Notes |
|---|------|----------|-------|------------------------|-------|
| 1 | `stores/me.store.ts` | A | 1 | No (response not used) | Add `apiClient` at store root; remove `strapi.update` |
| 2 | `components/UploadAvatar.vue` | A | 2 | No (response not used) | Move `useStrapi()` out of function bodies → `useApiClient()` at script setup level |
| 3 | `components/UploadCover.vue` | A | 2 | No (response not used) | Same as UploadAvatar |
| 4 | `components/CheckoutDefault.vue` | B | 1 | YES: `response.data` → `response` | Remove `create` destructure; fix `.data` accessor |
| 5 | `components/MemoPro.vue` | B | 1 | YES: `{ data }` desctructure | Fix response access |
| 6 | `pages/anunciar/resumen.vue` | B | 3 | YES: all 3 use `response.data` | Remove `create`; fix `.data` accessors in 3 places |
| 7 | `pages/registro/confirmar.vue` | C | 1 | No (response not used) | Replace `client` → `apiClient`; remove `useStrapiClient()` |
| 8 | `components/FormVerifyCode.vue` | C | 2 | YES: `responseRaw.jwt` (response used) | Replace `client` → `apiClient`; verify response shape |
| 9 | `components/FormPassword.vue` | D | 1 | N/A (no response used) | Replace `changePassword()`; remove `$recaptcha`, `useNuxtApp`, `recaptchaToken` body field |
| 10 | `stores/user.store.ts` | E | 1 | No (response type unknown) | Replace `$fetch`; use `documentId`; update `Ad` type + call site |

### FormVerifyCode.vue response shape note

```typescript
// Before
const responseRaw = await client("/auth/verify-code", { method: "POST", body: { ... } })
setToken(responseRaw.jwt)  // ← accesses .jwt directly on raw client response

// After — same raw response, no shape change needed
const responseRaw = await apiClient("/auth/verify-code", { method: "POST", body: { ... } })
setToken((responseRaw as { jwt: string }).jwt)
```

`useStrapiClient` and `useApiClient` both return raw bodies — `responseRaw.jwt` access is already correct and doesn't change.

---

## Type Changes Required

### Ad type: add documentId

```typescript
// apps/website/app/types/ad.d.ts — add to Ad interface
export interface Ad {
  id: number;
  documentId: string;   // ← ADD THIS
  // ... rest of fields
}
```

### CardProfileAd.vue: call site update

```typescript
// Before
await userStore.deactivateAd(props.ad.id, reason)

// After
await userStore.deactivateAd(props.ad.documentId, reason)
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + `@nuxt/test-utils` |
| Config file | `apps/website/vitest.config.ts` (inferred from Phase 087 patterns) |
| Quick run command | `yarn vitest run --reporter=verbose` (from `apps/website`) |
| Full suite command | `yarn test` (from `apps/website`) |
| Typecheck command | `yarn nuxt typecheck` (from `apps/website`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-01 | All 15 mutation calls use `useApiClient` | code review | `yarn nuxt typecheck` | ✅ (typecheck) |
| REQ-02 | `deactivateAd` uses `documentId` string, not `id` number | type check | `yarn nuxt typecheck` | ✅ (via Ad type) |
| REQ-03 | No `.data` accessor regressions (response shape) | manual | smoke test checkout/free-ad/draft flows | N/A |
| REQ-04 | FormPassword change-password works without body token | manual | smoke test password change | N/A |
| REQ-05 | `useApiClient` tests still pass (no regression) | unit | `yarn vitest run composables/useApiClient.test.ts` | ✅ exists |

### Wave 0 Gaps

None — existing test infrastructure covers regressions. New test files are not required for this mechanical refactor. Verification is via `yarn nuxt typecheck` + existing `useApiClient.test.ts`.

*(No missing test files — Phase 087 coverage of `useApiClient` is sufficient for this refactor. Integration smoke testing is manual-only.)*

---

## Open Questions

1. **MemoPro.vue response shape**
   - What we know: `const { data } = await create("payments/pro", {})` — SDK destructure
   - What's unclear: After migrating, `response.url` and `response.token` accessed directly — need to confirm Flow payment API response shape matches
   - Recommendation: Assume raw `{ url, token }` shape (consistent with all other payment endpoints). Destructure `const { url, token } = response` directly.

2. **FormPassword.vue — `login` import from useStrapiAuth**
   - What we know: Line 96 has `const { login } = useStrapiAuth()` — this is NOT the same as changePassword
   - What's unclear: Is `login` actually used anywhere in the component?
   - Recommendation: Grep for usage before removing. If unused, remove the destructure. If used, keep it.

3. **FormVerifyCode.vue — `resend-code` response not used**
   - What we know: `handleResend` makes POST to `/auth/resend-code` and doesn't use the response
   - Recommendation: Straightforward rename, no shape concern.

---

## Sources

### Primary (HIGH confidence)
- Direct file reads: all 9 files with mutation calls — authoritative source of truth
- `apps/website/app/composables/useApiClient.ts` — confirmed Phase 087 implementation
- `apps/website/app/stores/user.store.ts:102` — confirmed `useApiClient()` at store setup level already works
- `apps/website/.planning/phases/087-use-api-client-recaptcha/087-SUMMARY.md` — Phase 087 decisions and deviations
- `apps/website/app/types/ad.d.ts` — confirmed `documentId` absent from `Ad` interface

### Secondary (MEDIUM confidence)
- `@nuxtjs/strapi` v2 SDK behaviour: `create`/`update` wrap response in `{ data }`, `useStrapiClient` returns raw body — inferred from codebase usage patterns (multiple call sites cross-verified)

---

## Metadata

**Confidence breakdown:**
- Migration patterns: HIGH — derived directly from existing code, Phase 087 precedents
- Response shape changes: HIGH — cross-verified across multiple call sites
- `documentId` migration: HIGH — AGENTS.md is explicit, `Ad` type confirmed missing field
- Pinia store pattern: HIGH — `user.store.ts:102` is a live working example

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable codebase)
