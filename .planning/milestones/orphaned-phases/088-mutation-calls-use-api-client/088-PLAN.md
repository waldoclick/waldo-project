# Phase 88: Migrate Mutation Calls to useApiClient — Plan

**Planned:** 2026-03-15
**Phase directory:** `.planning/phases/088-mutation-calls-use-api-client/`
**Scope:** `apps/website` only — NO dashboard, NO FormDev.vue, NO useImage.ts

---

## Goal

Migrate all 15 remaining mutation calls in `apps/website` to `useApiClient`, ensuring every POST/PUT/DELETE flows through the reCAPTCHA-injecting composable. Fix the AGENTS.md violation in `deactivateAd` (numeric `id` → `documentId`).

---

## What we are NOT doing

- **No changes to `apps/dashboard`** — locked out of scope
- **No changes to `FormDev.vue`** — dev-only component, explicitly excluded
- **No changes to `useImage.ts`** — uses `fetch()` native with FormData, justified exception
- **No new test files** — Phase 087's `useApiClient.test.ts` covers the composable; this phase is a mechanical refactor verified by typecheck

---

## Critical: Response Shape Rules

When migrating from `strapi.create()` / `strapi.update()` (SDK methods), the SDK wraps responses in `{ data }`. `useApiClient` returns raw bodies. **Every `.data` accessor must be removed.**

When migrating from `useStrapiClient()` raw calls, the response shape is unchanged (both return raw bodies).

---

## Wave 1 — Type fix (prerequisite)

### Task 1.1 — Add `documentId` to `Ad` interface

**File:** `apps/website/app/types/ad.d.ts`

**Why first:** `deactivateAd` migration requires `Ad.documentId` to be typed. This unblocks Task 5.1 and the call-site fix.

**Change:** Add `documentId: string` to the `Ad` interface.

```typescript
export interface Ad {
  id: number;
  documentId: string;   // ADD — Strapi v5 document identifier used for write operations
  title: string;
  // ... rest unchanged
}
```

**Verification:** `yarn nuxt typecheck` from `apps/website` — no new errors.

---

## Wave 2 — Category A: strapi.update() → useApiClient

### Task 2.1 — Migrate `stores/me.store.ts`

**File:** `apps/website/app/stores/me.store.ts`

**Call being migrated:** `strapi.update("users/username", data)` (line 46)

**Changes in `<script>` (TypeScript):**

1. Add `const apiClient = useApiClient()` at store root level, alongside existing `const strapi = useStrapi()`.
2. In `saveUsername`: Replace `strapi.update("users/username", data)` with `apiClient` call.

**Before:**
```typescript
const strapi = useStrapi();
// ...
const saveUsername = async (data: { username: string }) => {
  try {
    const response = await strapi.update("users/username", data);
    return response;
  } catch (error) {
    console.error("Error al guardar el username:", error);
    throw error;
  }
};
```

**After:**
```typescript
const strapi = useStrapi();
const apiClient = useApiClient();
// ...
const saveUsername = async (data: { username: string }) => {
  try {
    const response = await apiClient("/api/users/username", {
      method: "PUT",
      body: data as Record<string, unknown>,
    });
    return response;
  } catch (error) {
    console.error("Error al guardar el username:", error);
    throw error;
  }
};
```

**Note:** `strapi` is still used for `strapi.find("users/me", ...)` in `loadMe` — keep it.

**Verification:** `yarn nuxt typecheck` — no errors.

---

### Task 2.2 — Migrate `components/UploadAvatar.vue`

**File:** `apps/website/app/components/UploadAvatar.vue`

**Calls being migrated:**
- `strapi.update("users/avatar", { avatar: image.id })` (line 160) — in `updateUserAvatar`
- `strapi.update("users/avatar", { avatarId: null })` (line 197) — in `removeImage`

**Current problem:** Both calls instantiate `const strapi = useStrapi()` inside the function body — violating the rule that composables must be called at setup level.

**Changes in `<script setup>` (JavaScript):**

1. Remove the two `const strapi = useStrapi()` lines inside function bodies.
2. Add `const apiClient = useApiClient()` at the top of `<script setup>`, alongside existing composable calls.
3. Replace both `strapi.update(...)` calls.

**Before (`updateUserAvatar`):**
```javascript
const updateUserAvatar = async (image) => {
  try {
    const strapi = useStrapi();
    await strapi.update("users/avatar", {
      avatar: image.id,
    });
    const { fetchUser } = useStrapiAuth();
    await fetchUser();
  } catch { ... }
};
```

**After (`updateUserAvatar`):**
```javascript
const updateUserAvatar = async (image) => {
  try {
    await apiClient("/api/users/avatar", {
      method: "PUT",
      body: { avatar: image.id },
    });
    const { fetchUser } = useStrapiAuth();
    await fetchUser();
  } catch { ... }
};
```

**Before (`removeImage`):**
```javascript
const removeImage = async (image) => {
  isProcessing.value = true;
  document.body.style.cursor = "wait";
  try {
    const strapi = useStrapi();
    await strapi.update("users/avatar", {
      avatarId: null,
    });
    // ...
  } catch { ... }
};
```

**After (`removeImage`):**
```javascript
const removeImage = async (image) => {
  isProcessing.value = true;
  document.body.style.cursor = "wait";
  try {
    await apiClient("/api/users/avatar", {
      method: "PUT",
      body: { avatarId: null },
    });
    // ...
  } catch { ... }
};
```

**Where to add `apiClient` declaration:** After the existing composable declarations at the top of `<script setup>`:
```javascript
const user = useStrapiUser();
const { transformUrl, uploadFile } = useImageProxy();
const apiClient = useApiClient();   // ADD HERE
```

**Verification:** `yarn nuxt typecheck` — no errors.

---

### Task 2.3 — Migrate `components/UploadCover.vue`

**File:** `apps/website/app/components/UploadCover.vue`

**Calls being migrated:**
- `strapi.update("users/cover", { cover: image.id })` (line 157) — in `updateUserCover`
- `strapi.update("users/cover", { coverId: null })` (line 194) — in `removeImage`

**Same pattern as Task 2.2.** Both calls instantiate `useStrapi()` inside function bodies.

**Changes in `<script setup>` (JavaScript):**

1. Remove the two `const strapi = useStrapi()` lines inside function bodies.
2. Add `const apiClient = useApiClient()` at setup level after existing declarations.
3. Replace both `strapi.update(...)` calls.

**After (`updateUserCover`):**
```javascript
const updateUserCover = async (image) => {
  try {
    await apiClient("/api/users/cover", {
      method: "PUT",
      body: { cover: image.id },
    });
    const { fetchUser } = useStrapiAuth();
    await fetchUser();
  } catch { ... }
};
```

**After (`removeImage`):**
```javascript
const removeImage = async (image) => {
  isProcessing.value = true;
  document.body.classList.add("cursor-wait");
  try {
    await apiClient("/api/users/cover", {
      method: "PUT",
      body: { coverId: null },
    });
    // ...
  } catch { ... }
};
```

**Where to add `apiClient` declaration:**
```javascript
const user = useStrapiUser();
const { transformUrl, uploadFile } = useImageProxy();
const apiClient = useApiClient();   // ADD HERE
```

**Verification:** `yarn nuxt typecheck` — no errors.

---

## Wave 3 — Category B: strapi.create() → useApiClient

### Task 3.1 — Migrate `components/CheckoutDefault.vue`

**File:** `apps/website/app/components/CheckoutDefault.vue`

**Call being migrated:** `create("payments/checkout", {...})` (line 58)

**Changes in `<script setup lang="ts">`:**

1. Replace `const { create } = useStrapi()` with `const apiClient = useApiClient()`.
2. In `handlePayClick`: Replace the `create(...)` call and fix the `.data` accessor.

**Before:**
```typescript
const { create } = useStrapi();
// ...
const response = await create<{ url: string; token: string }>(
  "payments/checkout",
  {
    pack: packValue,
    ad_id: adStore.ad.ad_id,
    featured: adStore.featured,
    is_invoice: adStore.is_invoice,
  } as unknown as Parameters<typeof create>[1],
);
const { url, token } = response.data ?? {};  // ← .data accessor — SDK wrapper
```

**After:**
```typescript
const apiClient = useApiClient();
// ...
const response = await apiClient<{ url: string; token: string }>("/api/payments/checkout", {
  method: "POST",
  body: {
    pack: packValue,
    ad_id: adStore.ad.ad_id,
    featured: adStore.featured,
    is_invoice: adStore.is_invoice,
  },
});
const { url, token } = response;  // ← direct access — useApiClient returns raw body
```

**Verification:** `yarn nuxt typecheck` — no errors. Smoke test: initiate a checkout flow.

---

### Task 3.2 — Migrate `components/MemoPro.vue`

**File:** `apps/website/app/components/MemoPro.vue`

**Call being migrated:** `create("payments/pro", {})` (line 43)

**Changes in `<script setup>` (JavaScript):**

1. Remove `const { create } = useStrapi()`.
2. Remove `import { useNuxtApp } from "#app"` if it's only there for legacy reasons (check: it IS imported on line 22 but only `useNuxtApp` — verify if used elsewhere in the component; if not, remove).
3. Add `const apiClient = useApiClient()` at setup level.
4. Replace the `create(...)` call and fix the response destructure.

**Before:**
```javascript
const { create } = useStrapi();
// ...
const { data } = await create("payments/pro", {});
if (data?.url && data?.token) {
  const redirectUrl = `${data.url}?token=${data.token}`;
  // ...
}
```

**After:**
```javascript
const apiClient = useApiClient();
// ...
const response = await apiClient("/api/payments/pro", {
  method: "POST",
  body: {},
});
if (response?.url && response?.token) {
  const redirectUrl = `${response.url}?token=${response.token}`;
  // ...
}
```

**Note:** The `console.error` on the else branch currently logs `data` — update to log `response`.

**Verification:** `yarn nuxt typecheck` — no errors.

---

### Task 3.3 — Migrate `pages/anunciar/resumen.vue`

**File:** `apps/website/app/pages/anunciar/resumen.vue`

**Calls being migrated (3):**
- Line 134: `create("ads/save-draft", { ad })` → save draft before navigating to `/pagar` (paid flow)
- Line 162: `create("ads/save-draft", { ad })` → save draft before free creation (free flow)
- Line 183: `create("payments/free-ad", { ad_id, pack })` → create free ad

**Changes in `<script setup lang="ts">`:**

1. Replace `const { create } = useStrapi()` with `const apiClient = useApiClient()`.
2. Fix all three call sites and their `.data` accessors.

**Before (paid draft, line 130-148):**
```typescript
const { create } = useStrapi();
// ...
const draftResponse = await create<{ id: number }>("ads/save-draft", {
  ad: adStore.ad,
} as unknown as Parameters<typeof create>[1]);
adStore.updateAdId(draftResponse.data.id);  // ← .data.id
```

**After:**
```typescript
const apiClient = useApiClient();
// ...
const draftResponse = await apiClient<{ id: number; documentId: string }>("/api/ads/save-draft", {
  method: "POST",
  body: { ad: adStore.ad },
});
adStore.updateAdId(draftResponse.id);  // ← direct .id
```

**Before (free draft, line 160-175):**
```typescript
const draftResponse = await create<{ id: number }>("ads/save-draft", {
  ad: adStore.ad,
} as unknown as Parameters<typeof create>[1]);
adStore.updateAdId(draftResponse.data.id);  // ← .data.id
await handleFreeCreation();
```

**After:**
```typescript
const draftResponse = await apiClient<{ id: number; documentId: string }>("/api/ads/save-draft", {
  method: "POST",
  body: { ad: adStore.ad },
});
adStore.updateAdId(draftResponse.id);  // ← direct .id
await handleFreeCreation();
```

**Before (free-ad, line 183-193):**
```typescript
const freeAdResponse = await create<{
  ad?: { documentId?: string; id?: number };
}>("payments/free-ad", {
  ad_id: adStore.ad.ad_id,
  pack: adStore.pack,
} as unknown as Parameters<typeof create>[1]);

await fetchUser();
const adDocumentId = (
  freeAdResponse as unknown as { data?: { ad?: { documentId?: string } } }
).data?.ad?.documentId;
router.push("/anunciar/gracias?ad=" + (adDocumentId || adStore.ad.ad_id));
```

**After:**
```typescript
const freeAdResponse = await apiClient<{ ad?: { documentId?: string; id?: number } }>("/api/payments/free-ad", {
  method: "POST",
  body: {
    ad_id: adStore.ad.ad_id,
    pack: adStore.pack,
  },
});

await fetchUser();
const adDocumentId = freeAdResponse.ad?.documentId;  // ← direct access, no .data wrapper
router.push("/anunciar/gracias?ad=" + (adDocumentId || adStore.ad.ad_id));
```

**Note:** `const { fetchUser } = useStrapiAuth()` is already declared at the top level of the script (line 38) — keep it. Only remove `const { create } = useStrapi()`.

**Verification:** `yarn nuxt typecheck` — no errors. Smoke test: publish a free ad and a paid ad (verify redirect URLs are correct).

---

## Wave 4 — Category C: useStrapiClient() → useApiClient

### Task 4.1 — Migrate `pages/registro/confirmar.vue`

**File:** `apps/website/app/pages/registro/confirmar.vue`

**Call being migrated:** POST `/auth/send-email-confirmation` (line 110)

**Changes in `<script setup lang="ts">`:**

1. Replace `const client = useStrapiClient()` with `const apiClient = useApiClient()`.
2. In `handleResend`: Replace `client(...)` with `apiClient(...)`.

**Before:**
```typescript
const client = useStrapiClient();
// ...
await client("/auth/send-email-confirmation", {
  method: "POST",
  body: { email: registrationEmail.value },
});
```

**After:**
```typescript
const apiClient = useApiClient();
// ...
await apiClient("/auth/send-email-confirmation", {
  method: "POST",
  body: { email: registrationEmail.value },
});
```

**Response shape:** Not used — no changes needed beyond the rename.

**Verification:** `yarn nuxt typecheck` — no errors.

---

### Task 4.2 — Migrate `components/FormVerifyCode.vue`

**File:** `apps/website/app/components/FormVerifyCode.vue`

**Calls being migrated:**
- POST `/auth/verify-code` (line 119) — response `.jwt` is accessed
- POST `/auth/resend-code` (line 158) — response not used

**Changes in `<script setup>` (JavaScript):**

1. Replace `const client = useStrapiClient()` with `const apiClient = useApiClient()`.
2. In `handleVerify`: Replace `client(...)` with `apiClient(...)`.
3. In `handleResend`: Replace `client(...)` with `apiClient(...)`.

**Before (`handleVerify`):**
```javascript
const client = useStrapiClient();
// ...
const responseRaw = await client("/auth/verify-code", {
  method: "POST",
  body: { pendingToken: pendingToken.value, code: code.value.trim() },
});
const { setToken, fetchUser } = useStrapiAuth();
setToken(responseRaw.jwt);
```

**After (`handleVerify`):**
```javascript
const apiClient = useApiClient();
// ...
const responseRaw = await apiClient("/auth/verify-code", {
  method: "POST",
  body: { pendingToken: pendingToken.value, code: code.value.trim() },
});
const { setToken, fetchUser } = useStrapiAuth();
setToken(responseRaw.jwt);  // ← same raw response shape, no change needed
```

**Before (`handleResend`):**
```javascript
await client("/auth/resend-code", {
  method: "POST",
  body: { pendingToken: pendingToken.value },
});
```

**After (`handleResend`):**
```javascript
await apiClient("/auth/resend-code", {
  method: "POST",
  body: { pendingToken: pendingToken.value },
});
```

**Verification:** `yarn nuxt typecheck` — no errors.

---

## Wave 5 — Category D: useStrapiAuth().changePassword() → useApiClient

### Task 5.1 — Migrate `components/FormPassword.vue`

**File:** `apps/website/app/components/FormPassword.vue`

**Call being migrated:** `changePassword(data)` (line 112)

**Observations from code review:**
- `const { changePassword } = useStrapiAuth()` (line 74) — remove after migration
- `const { $recaptcha } = useNuxtApp()` (line 75) — remove after migration (token now injected by useApiClient as header)
- `const { login } = useStrapiAuth()` (line 96) — **dead import** (`login` is never used in the component) — remove
- `import { useNuxtApp } from "#app"` (line 71) — remove if `$recaptcha` was the only usage (it is)
- The `recaptchaToken` body field is removed — `useApiClient` injects it as `X-Recaptcha-Token` header

**Changes in `<script setup lang="ts">`:**

1. Remove: `import { useNuxtApp } from "#app"`
2. Remove: `const { changePassword } = useStrapiAuth()`
3. Remove: `const { $recaptcha } = useNuxtApp()`
4. Remove: `const { login } = useStrapiAuth()` (dead import)
5. Add: `const apiClient = useApiClient()` at setup level
6. In `handleSubmit`: Remove `const token = await $recaptcha!.execute("submit")`; replace `changePassword(data)` call; remove `recaptchaToken` from the body.

**Before:**
```typescript
import { useNuxtApp } from "#app";

const user = useStrapiUser();
const { changePassword } = useStrapiAuth();
const { $recaptcha } = useNuxtApp();
// ...
const router = useRouter();
const { login } = useStrapiAuth();  // dead import

const handleSubmit = async (values: any) => {
  loading.value = true;
  try {
    const token = await $recaptcha!.execute("submit");
    const data = {
      currentPassword: values.current_password,
      password: values.password,
      passwordConfirmation: values.password_confirmation,
      recaptchaToken: token,
    };
    await changePassword(data);
    Swal.fire("", "La contraseña se ha cambiado con éxito.", "success");
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};
```

**After:**
```typescript
const user = useStrapiUser();
const apiClient = useApiClient();
// ...
const router = useRouter();

const handleSubmit = async (values: any) => {
  loading.value = true;
  try {
    await apiClient("/api/auth/change-password", {
      method: "POST",
      body: {
        currentPassword: values.current_password,
        password: values.password,
        passwordConfirmation: values.password_confirmation,
        // recaptchaToken removed — useApiClient injects X-Recaptcha-Token header automatically
      },
    });
    Swal.fire("", "La contraseña se ha cambiado con éxito.", "success");
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};
```

**Verification:** `yarn nuxt typecheck` — no errors. Smoke test: change password in account settings.

---

## Wave 6 — Category E: $fetch → useApiClient

### Task 6.1 — Migrate `stores/user.store.ts` — deactivateAd

**File:** `apps/website/app/stores/user.store.ts`

**Call being migrated:** `$fetch(...)` (line 148) — AGENTS.md violation (numeric `id` + manual JWT)

**Prerequisite:** Task 1.1 (Ad type with `documentId`) must be complete first.

**Changes in `stores/user.store.ts`:**

1. `useApiClient()` is already called at store level in `updateUserProfile` (line 102: `const client = useApiClient()`). Add `apiClient` alias **or** reuse the existing `client` variable — check if variable is named `client` (it is, line 102). Reuse it.
2. In `deactivateAd`: Replace entire function body. Change parameter from `adId: number` to `adDocumentId: string`.
3. Remove `useCookie("waldo_jwt")` usage — `useApiClient`/`useStrapiClient` handles JWT automatically.
4. Remove the `apiUrl` / `API_DISABLE_PROXY` logic — `useStrapiClient` handles base URL.
5. Remove `config` usage if it's only used here (check: `config` is also NOT used elsewhere in this store — line 14 declares it but only `deactivateAd` uses it).

**Before:**
```typescript
const config = useRuntimeConfig();
// ...
const deactivateAd = async (adId: number, reason?: string) => {
  try {
    const token = useCookie("waldo_jwt").value;
    const apiUrl =
      process.env.API_DISABLE_PROXY === "true"
        ? config.public.apiUrl
        : config.public.baseUrl;
    const response = await $fetch(`${apiUrl}/api/ads/${adId}/deactivate`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: { reason_for_deactivation: reason ?? null },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
```

**After:**
```typescript
// Remove: const config = useRuntimeConfig();  (only used in deactivateAd)
// ...
const deactivateAd = async (adDocumentId: string, reason?: string) => {
  try {
    const response = await client(`/api/ads/${adDocumentId}/deactivate`, {
      method: "PUT",
      body: { reason_for_deactivation: reason ?? null },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
```

**Note:** The existing `client` variable at line 102 is `useApiClient()`. Use it directly.

**Call site fix — `components/CardProfileAd.vue`:**

1. Change `userStore.deactivateAd(props.ad.id, reason)` → `userStore.deactivateAd(props.ad.documentId, reason)`.
2. Update the guard: `if (!props.ad?.id)` → `if (!props.ad?.documentId)`.

**File:** `apps/website/app/components/CardProfileAd.vue`

```typescript
// Before (line ~341)
if (!props.ad?.id) return;
// ...
await userStore.deactivateAd(props.ad.id, reason);

// After
if (!props.ad?.documentId) return;
// ...
await userStore.deactivateAd(props.ad.documentId, reason);
```

**Verification:** `yarn nuxt typecheck` — no errors. Smoke test: deactivate an ad from the profile.

---

## Execution Order

```
Wave 1: Type fix (ad.d.ts — adds documentId)       — prerequisite for Wave 6
Wave 2: Category A — strapi.update() (3 files)
Wave 3: Category B — strapi.create() (3 files)
Wave 4: Category C — useStrapiClient raw (2 files)
Wave 5: Category D — changePassword SDK (1 file)
Wave 6: Category E — $fetch (1 file + 1 call site)
```

After all waves: `yarn nuxt typecheck` from `apps/website` — zero new errors.

---

## Files Changed Summary

| File | Wave | Action | Calls migrated |
|------|------|--------|----------------|
| `apps/website/app/types/ad.d.ts` | 1 | MODIFY — add `documentId: string` | — |
| `apps/website/app/stores/me.store.ts` | 2 | MODIFY — `strapi.update` → `apiClient` | 1 |
| `apps/website/app/components/UploadAvatar.vue` | 2 | MODIFY — `strapi.update` × 2 → `apiClient` | 2 |
| `apps/website/app/components/UploadCover.vue` | 2 | MODIFY — `strapi.update` × 2 → `apiClient` | 2 |
| `apps/website/app/components/CheckoutDefault.vue` | 3 | MODIFY — `create` → `apiClient`, fix `.data` | 1 |
| `apps/website/app/components/MemoPro.vue` | 3 | MODIFY — `create` → `apiClient`, fix response | 1 |
| `apps/website/app/pages/anunciar/resumen.vue` | 3 | MODIFY — `create` × 3 → `apiClient`, fix `.data` × 3 | 3 |
| `apps/website/app/pages/registro/confirmar.vue` | 4 | MODIFY — `client` → `apiClient` | 1 |
| `apps/website/app/components/FormVerifyCode.vue` | 4 | MODIFY — `client` → `apiClient` | 2 |
| `apps/website/app/components/FormPassword.vue` | 5 | MODIFY — `changePassword` → `apiClient`, remove `$recaptcha` | 1 |
| `apps/website/app/stores/user.store.ts` | 6 | MODIFY — `$fetch` → `apiClient`, `id` → `documentId` | 1 |
| `apps/website/app/components/CardProfileAd.vue` | 6 | MODIFY — call site `id` → `documentId` | — |

**Total:** 12 files, 15 mutation calls migrated.

---

## Definition of Done

- [ ] All 15 mutation calls use `useApiClient` (verify by grepping for `useStrapi().create`, `useStrapi().update`, `useStrapiClient()`, `$fetch` in the affected files)
- [ ] `deactivateAd` accepts `documentId: string`, not `adId: number`
- [ ] `Ad` type has `documentId: string`
- [ ] `CardProfileAd.vue` passes `props.ad.documentId` to `deactivateAd`
- [ ] No `.data` accessor regressions — raw body access after Category B migrations
- [ ] `FormPassword.vue` no longer imports `useNuxtApp` or calls `$recaptcha` or `changePassword`
- [ ] `UploadAvatar.vue` and `UploadCover.vue` no longer instantiate `useStrapi()` inside function bodies
- [ ] `yarn nuxt typecheck` from `apps/website` passes with zero new errors
- [ ] `yarn vitest run composables/useApiClient.test.ts` — all 8 tests still green (no regression)
