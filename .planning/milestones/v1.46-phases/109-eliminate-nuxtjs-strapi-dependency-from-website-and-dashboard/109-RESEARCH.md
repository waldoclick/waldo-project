# Phase 109: Eliminate @nuxtjs/strapi dependency from dashboard - Research

**Researched:** 2026-03-29
**Domain:** Nuxt 4 / @nuxtjs/strapi v2 / session management / custom composables / $fetch
**Confidence:** HIGH

## Summary

After Phase 108, every Strapi content API call in the dashboard goes through `useApiClient`. The `@nuxtjs/strapi` module is now used in the dashboard for exactly four concerns:

1. **`useStrapiClient`** — underlying `$fetch` wrapper used *inside* `useApiClient`. The only call site is `apps/dashboard/app/composables/useApiClient.ts`.
2. **`useStrapiUser`** — a thin `useState("strapi_user")` wrapper. Used in 7 files for reactive session user state (middlewares, components, plugin).
3. **`useStrapiToken`** — a `useCookie(cookieName)` wrapper. Used in `useImage.ts` for the `Authorization` header on raw `fetch()` uploads.
4. **`useStrapiAuth`** — provides `setToken`, `fetchUser`, and `logout`. Used in 4 files: `FormVerifyCode.vue`, `FormLogin.vue`, `FormEdit.vue`, and `useLogout.ts`. Also auto-invoked by the module's startup plugin to populate `useStrapiUser` on page load.

**None of these are complex.** The implementations in `@nuxtjs/strapi/dist/runtime/composables/` are 3–55 lines each. They can be replaced by project-owned composables in the dashboard with no behavior change.

**Primary recommendation:** Create three composables (`useSession`, `useSessionToken`, `useSessionClient`) that replicate the functionality of `useStrapiUser`, `useStrapiToken`, and `useStrapiClient` respectively; create a replacement startup plugin; update `useApiClient` to use `useSessionClient`; update all 11 affected files; remove `@nuxtjs/strapi` from `nuxt.config.ts` modules and `package.json`.

---

## Complete Inventory of @nuxtjs/strapi Usage After Phase 108

### `useStrapiClient` — 1 file
| File | Usage | Replacement |
|------|-------|-------------|
| `app/composables/useApiClient.ts` | `const client = useStrapiClient()` — underlying HTTP dispatcher | `useSessionClient()` custom composable |

### `useStrapiUser` — 7 files
| File | Usage | Replacement |
|------|-------|-------------|
| `app/middleware/guard.global.ts` | `useStrapiUser() as Ref<User \| null>` — auth guard | `useSessionUser()` |
| `app/middleware/guest.ts` | `useStrapiUser() as Ref<User \| null>` — redirect if logged in | `useSessionUser()` |
| `app/plugins/sentry.ts` | `useStrapiUser()` — set Sentry user context | `useSessionUser()` |
| `app/components/HeaderDefault.vue` | `useStrapiUser()` — display user in header | `useSessionUser()` |
| `app/components/HeroDashboard.vue` | `useStrapiUser()` — display user greeting | `useSessionUser()` |
| `app/components/AvatarDefault.vue` | `useStrapiUser()` — user avatar | `useSessionUser()` |
| `app/components/DropdownUser.vue` | `useStrapiUser() as Ref<User \| null>` — user menu | `useSessionUser()` |
| `app/components/FormEdit.vue` | `useStrapiUser() as Ref<User \| null>` — pre-fill profile form | `useSessionUser()` |
| `app/components/FormPassword.vue` | `useStrapiUser() as Ref<User \| null>` — identify user for PUT | `useSessionUser()` |
| `app/components/FormVerifyCode.vue` | `useStrapiUser() as Ref<User \| null>` — role check after login | `useSessionUser()` |

### `useStrapiToken` — 2 files
| File | Usage | Replacement |
|------|-------|-------------|
| `app/composables/useImage.ts` | `useStrapiToken()` — get JWT for `Authorization` header on raw `fetch()` upload | `useSessionToken()` |
| `app/components/UploadMedia.vue` | Calls `useImage.ts` (indirect, no direct SDK import) | No direct change needed |

### `useStrapiAuth` — 4 files
| File | Methods used | Replacement |
|------|-------------|-------------|
| `app/components/FormVerifyCode.vue` | `setToken(jwt)`, `fetchUser()` | `useSessionAuth()` |
| `app/components/FormLogin.vue` | `logout()` (to clear existing website session before new login) | `useSessionAuth()` |
| `app/components/FormEdit.vue` | `fetchUser()` (re-sync user after profile PUT) | `useSessionAuth()` |
| `app/composables/useLogout.ts` | `logout()` | `useSessionAuth()` |

### Module configuration — nuxt.config.ts
| Concern | Current | After removal |
|---------|---------|---------------|
| Cookie name | `strapi.cookieName: "waldo_jwt"` set via module options | Keep in `runtimeConfig.public` (used by custom composables) |
| Cookie options | `strapi.cookie: { path, maxAge, domain }` | Keep in `runtimeConfig.public` (used by custom `useCookie` call) |
| Auth populate | `strapi.auth.populate: ["role", "commune", ...]` | Move into `useSessionAuth.fetchUser()` implementation |
| API URL routing | `strapi.url` / `runtimeConfig.public.strapi.url` | Keep `runtimeConfig.public.strapi.url` — already used by `useStrapiUrl` and needed for custom client baseURL |
| Startup plugin | `@nuxtjs/strapi` auto-plugin calls `fetchUser()` on startup | New `plugins/session.ts` does the same |

---

## Standard Stack

### Core (no new external dependencies)

| Composable | What it replaces | Implementation source |
|------------|-----------------|----------------------|
| `useSessionUser()` | `useStrapiUser()` | `useState("strapi_user")` — 1 line |
| `useSessionToken()` | `useStrapiToken()` | `useCookie(cookieName, cookieOptions)` with `nuxt._cookies` cache — ~15 lines |
| `useSessionClient()` | `useStrapiClient()` | `$fetch` with Bearer header + `qs.stringify` for params — ~30 lines |
| `useSessionAuth()` | `useStrapiAuth()` | `setToken`, `fetchUser`, `logout` using above composables — ~30 lines |

**No new packages required.** `qs` is already a transitive dependency (via `@nuxtjs/strapi`); it must become a direct dependency of `apps/dashboard` after the module is removed.

**Installation after module removal:**
```bash
yarn workspace waldo-dashboard add qs
yarn workspace waldo-dashboard add -D @types/qs
```

---

## Architecture Patterns

### Recommended File Layout for New Composables

```
apps/dashboard/app/
├── composables/
│   ├── useApiClient.ts          # MODIFIED: swap useStrapiClient → useSessionClient
│   ├── useImage.ts              # MODIFIED: swap useStrapiToken → useSessionToken
│   ├── useLogout.ts             # MODIFIED: swap useStrapiAuth → useSessionAuth
│   ├── useSessionUser.ts        # NEW — replaces useStrapiUser
│   ├── useSessionToken.ts       # NEW — replaces useStrapiToken
│   ├── useSessionClient.ts      # NEW — replaces useStrapiClient
│   └── useSessionAuth.ts        # NEW — replaces useStrapiAuth
└── plugins/
    └── session.ts               # NEW — replaces @nuxtjs/strapi startup plugin
```

### Pattern 1: `useSessionUser` — trivial useState wrapper

`useStrapiUser` is exactly `useState("strapi_user")`. The replacement is the same with a different state key to avoid collision if both apps share a domain cookie.

```typescript
// Source: inspected node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiUser.js
export const useSessionUser = <T = User>() => useState<T | null>("session_user", () => null);
```

**Important:** Use a distinct state key (`"session_user"` not `"strapi_user"`) so there is no implicit coupling to the now-removed module.

### Pattern 2: `useSessionToken` — useCookie wrapper with nuxt._cookies cache

`useStrapiToken` reads the JWT cookie with `useCookie(cookieName, cookieOptions)`. It caches the ref in `nuxt._cookies` to avoid re-creating the ref on every call (Nuxt cookie refs are singleton within a request). This caching logic is critical — `FormVerifyCode.vue` already manually clears `nuxt._cookies[cookieName]` before calling `setToken()` to force a fresh read. The custom implementation must preserve this cache behavior.

```typescript
// Source: inspected node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiToken.js
import { useCookie, useNuxtApp, useRuntimeConfig } from "#imports";

export const useSessionToken = (): Ref<string | null> => {
  const nuxt = useNuxtApp();
  const config = import.meta.server ? useRuntimeConfig() : useRuntimeConfig().public;
  const cookieName: string = config.strapi.cookieName;
  const cookieOptions = config.strapi.cookie;

  nuxt._cookies = nuxt._cookies || {};
  if (nuxt._cookies[cookieName]) {
    return nuxt._cookies[cookieName] as Ref<string | null>;
  }
  const cookie = useCookie<string | null>(cookieName, cookieOptions);
  nuxt._cookies[cookieName] = cookie;
  return cookie;
};
```

**Key:** The cookie name (`"waldo_jwt"`) and options (path, maxAge, domain) stay in `runtimeConfig.public.strapi` — those nuxt.config.ts keys do NOT require the module to be present; they are just config values read via `useRuntimeConfig()`. The module only reads and merges them into runtimeConfig; the actual cookie handling is done by Nuxt's `useCookie`.

### Pattern 3: `useSessionClient` — $fetch with qs.stringify for nested params

This is the most important replacement. `useStrapiClient` uses `qs.stringify` for params serialization, which is required for Strapi's filter syntax (`filters[documentId][$eq]=...`). Native `$fetch` uses `URLSearchParams` which does not handle nested objects — it would serialize `{ filters: { documentId: { $eq: "abc" } } }` as `filters=[object Object]`, breaking all filtered queries.

```typescript
// Source: inspected node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiClient.js
import { stringify } from "qs";
import type { FetchOptions } from "ofetch";
import { useNuxtApp, useRuntimeConfig } from "#imports";

export const useSessionClient = () => {
  const nuxt = useNuxtApp();
  const config = import.meta.server ? useRuntimeConfig() : useRuntimeConfig().public;
  const baseURL = `${config.strapi.url}${config.strapi.prefix}`;
  const token = useSessionToken();

  return async <T = unknown>(url: string, fetchOptions: FetchOptions = {}): Promise<T> => {
    const headers: Record<string, string> = {};
    if (token?.value) {
      headers.Authorization = `Bearer ${token.value}`;
    }

    // qs.stringify is required for Strapi's nested filter/populate params.
    // $fetch's native param serialization does not handle nested objects.
    if (fetchOptions.params) {
      const params = stringify(fetchOptions.params as object, { encodeValuesOnly: true });
      if (params) {
        url = `${url}?${params}`;
      }
      delete fetchOptions.params;
    }

    return $fetch<T>(url, {
      retry: 0,
      baseURL,
      ...fetchOptions,
      headers: {
        ...headers,
        ...(fetchOptions.headers as Record<string, string> | undefined ?? {}),
      },
    });
  };
};
```

**`useApiClient` change is one line:** Replace `useStrapiClient()` with `useSessionClient()`. No other change to `useApiClient.ts`.

### Pattern 4: `useSessionAuth` — setToken, fetchUser, logout

Only three methods are used in the dashboard:
- `setToken(jwt)` — sets the token cookie ref
- `fetchUser()` — calls `/users/me` with `auth.populate` params and writes to `useSessionUser`
- `logout()` — clears token and user

```typescript
// Source: inspected node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiAuth.js
import { useRuntimeConfig } from "#imports";
import type { User } from "@/types/user";

export const useSessionAuth = () => {
  const token = useSessionToken();
  const user = useSessionUser<User>();
  const client = useSessionClient();
  const config = import.meta.server ? useRuntimeConfig() : useRuntimeConfig().public;

  const setToken = (value: string | null): void => {
    token.value = value;
  };

  const fetchUser = async (): Promise<typeof user> => {
    if (token.value) {
      try {
        user.value = await client<User>("/users/me", {
          params: config.strapi.auth as Record<string, unknown>,
        });
      } catch {
        setToken(null);
      }
    }
    return user;
  };

  const logout = (): void => {
    setToken(null);
    user.value = null;
  };

  return { setToken, fetchUser, logout };
};
```

**Note:** `config.strapi.auth` is `{ populate: ["role", "commune", "region", "business_region", "business_commune"] }` from `nuxt.config.ts`. This stays exactly where it is — no migration needed for this config value.

### Pattern 5: Startup plugin — replaces @nuxtjs/strapi's auto-plugin

`@nuxtjs/strapi` registers a plugin that auto-calls `fetchUser()` on app startup. Without this, the user is never populated from the cookie on page load and auth state is lost on refresh.

```typescript
// apps/dashboard/app/plugins/session.ts
// Replicates @nuxtjs/strapi/dist/runtime/plugins/strapi.js behavior
export default defineNuxtPlugin(async () => {
  const user = useSessionUser();
  if (!user.value) {
    const { fetchUser } = useSessionAuth();
    await fetchUser();
  }
});
```

This plugin must be registered **before** the app renders so that auth state is available to the route guard middleware.

### Pattern 6: Call-site replacements — mechanical substitution

All consumer files change only their import/call names:

| Old call | New call | Files affected |
|---------|---------|----------------|
| `useStrapiUser()` | `useSessionUser()` | guard.global.ts, guest.ts, sentry.ts, HeaderDefault.vue, HeroDashboard.vue, AvatarDefault.vue, DropdownUser.vue, FormEdit.vue, FormPassword.vue, FormVerifyCode.vue |
| `useStrapiToken()` | `useSessionToken()` | useImage.ts |
| `useStrapiAuth()` | `useSessionAuth()` | FormVerifyCode.vue, FormLogin.vue, FormEdit.vue, useLogout.ts |
| `useStrapiClient()` | `useSessionClient()` | useApiClient.ts (1 line) |

**No behavior changes.** The state key for the user (`"session_user"` vs `"strapi_user"`) differs intentionally — the module is no longer present to populate the old key, so both keys start fresh after the switch.

### Anti-Patterns to Avoid

- **Do NOT use `useState("strapi_user")`** as the key in the new composable. The module is being removed so that key will never be populated. Use `"session_user"` and update all consumers to call `useSessionUser()`.
- **Do NOT skip `qs.stringify`** in `useSessionClient`. Using `$fetch`'s native params will break all filtered queries (filters, populate nested objects). Strapi requires bracket notation.
- **Do NOT remove `runtimeConfig.public.strapi`** block from `nuxt.config.ts`. The custom composables read `config.strapi.url`, `config.strapi.prefix`, `config.strapi.cookieName`, `config.strapi.cookie`, and `config.strapi.auth` at runtime.
- **Do NOT remove `runtimeConfig.strapi`** (server-side copy). `useSessionToken` and `useSessionClient` use `import.meta.server ? useRuntimeConfig() : useRuntimeConfig().public` — the server-side path reads from `runtimeConfig.strapi`, not `runtimeConfig.public.strapi`.
- **Do NOT delete the module options** (`strapi: { ... }` key) from `nuxt.config.ts`. Only remove the `"@nuxtjs/strapi"` entry from `modules`. The config values remain valid `runtimeConfig` keys because they are also declared in the `runtimeConfig.public.strapi` block explicitly.
- **Do NOT break the `nuxt._cookies` cache** in `useSessionToken`. `FormVerifyCode.vue` explicitly clears `nuxt._cookies[cookieName]` before calling `setToken()` — this logic depends on the cache being named by `cookieName`. The implementation must match.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Nested params for Strapi queries | Custom URL builder | `qs.stringify(params, { encodeValuesOnly: true })` | Strapi requires bracket notation (`filters[x][$eq]=`); URLSearchParams fails on nested objects |
| JWT cookie management | Manual `document.cookie` writes | `useCookie(cookieName, cookieOptions)` (Nuxt built-in) | SSR-safe, reactive, type-safe, handles domain/path/maxAge automatically |
| Session state | Custom Pinia store | `useState("session_user")` (Nuxt built-in) | SSR-shared state, already the pattern used by `useStrapiUser` |
| Auth startup logic | `onMounted` in app.vue | Nuxt plugin (runs before render, SSR-safe) | Middleware runs before plugin on SSR — plugin order matters |

---

## Common Pitfalls

### Pitfall 1: Forgetting qs.stringify → all filtered queries break silently
**What goes wrong:** If `useSessionClient` uses `$fetch` with `params` directly (no `qs.stringify`), nested objects serialize as `[object Object]`. Strapi returns all records ignoring the filter. No error is thrown — results just look wrong (unfiltered).
**Why it happens:** `$fetch` (ofetch) uses `URLSearchParams` internally, which calls `.toString()` on objects.
**How to avoid:** Replicate `useStrapiClient`'s `qs.stringify(params, { encodeValuesOnly: true })` logic exactly. Add `qs` as a direct dependency.
**Warning signs:** List pages return all records; `find` by documentId returns no data (falls through to numeric id fallback).

### Pitfall 2: Server-side runtimeConfig path — `import.meta.server` check is required
**What goes wrong:** On SSR, `useRuntimeConfig().public.strapi.url` uses `BASE_URL` (the Nitro proxy). But on the server, the Strapi client should call `API_URL` directly (no self-proxy loop). `useStrapiClient` already handles this with `import.meta.server ? useRuntimeConfig() : useRuntimeConfig().public`.
**How to avoid:** The custom `useSessionClient` and `useSessionToken` must replicate this exact ternary. Do NOT use `useRuntimeConfig().public` unconditionally.
**Warning signs:** SSR pages make requests to `localhost:3001/api/...` instead of `localhost:1337/api/...`; results in a self-referential proxy loop and 500 errors on startup.

### Pitfall 3: State key mismatch — old `"strapi_user"` key never populated
**What goes wrong:** If any file still calls `useStrapiUser()` (old composable) after the module is removed, it will reference `useState("strapi_user")` which is never populated (the module's startup plugin is gone). Auth state appears empty on every page load.
**How to avoid:** After adding `useSessionUser`, do a global grep for `useStrapiUser` and verify zero hits remain in the dashboard app directory.
**Warning signs:** Guard middleware always redirects to login even with a valid cookie.

### Pitfall 4: nuxt._cookies cache — FormVerifyCode depends on the exact cache key
**What goes wrong:** `FormVerifyCode.vue` deletes `nuxt._cookies[config.strapi.cookieName]` before calling `setToken()` to force `useSessionToken()` to re-read the cookie. If `useSessionToken` uses a different internal cache key (e.g., a hardcoded string instead of `config.strapi.cookieName`), the cache-bust will fail and the new token won't be seen.
**How to avoid:** `useSessionToken` must cache using `nuxt._cookies[cookieName]` where `cookieName = config.strapi.cookieName` — exactly matching what `FormVerifyCode.vue` clears.
**Warning signs:** Login via `FormVerifyCode` succeeds (JWT returned) but user remains null; redirect to `/` fails with "access denied".

### Pitfall 5: The strapi config block in nuxt.config.ts must NOT be removed
**What goes wrong:** The `strapi: { ... }` block in `nuxt.config.ts` populates `runtimeConfig.public.strapi` (and `runtimeConfig.strapi` server-side). If this block is removed when removing the module, `config.strapi.url`, `config.strapi.prefix`, `config.strapi.cookieName`, `config.strapi.cookie.maxAge`, etc. become `undefined`, breaking `useSessionClient` and `useSessionToken`.
**How to avoid:** Only remove `"@nuxtjs/strapi"` from the `modules` array. Leave the `strapi: { ... }` block in `nuxt.config.ts` — it is both a module option (for the removed module) AND a runtimeConfig declaration that the custom composables depend on.
**Warning signs:** TypeScript errors `config.strapi is undefined` or `Cannot read properties of undefined (reading 'url')`.

### Pitfall 6: Vitest mock for useStrapiClient becomes stale
**What goes wrong:** `tests/stubs/imports.stub.ts` exports `useStrapiClient` and `useStrapiAuth`. The test for `useApiClient` (`useApiClient.test.ts`) mocks `useStrapiClient` from `#imports`. After switching `useApiClient` to use `useSessionClient`, the mock will target the wrong symbol and the test will fail.
**How to avoid:** Update `imports.stub.ts` to export `useSessionClient` instead of (or in addition to) `useStrapiClient`. Update the `vi.mock("#imports")` in `useApiClient.test.ts` to mock `useSessionClient`.
**Warning signs:** Tests error with `useStrapiClient is not a function` or mock calls are not detected.

---

## Code Examples

### useSessionUser.ts (complete)
```typescript
// apps/dashboard/app/composables/useSessionUser.ts
import type { User } from "@/types/user";

export const useSessionUser = <T = User>() =>
  useState<T | null>("session_user", () => null);
```

### useSessionToken.ts (complete)
```typescript
// apps/dashboard/app/composables/useSessionToken.ts
import { useCookie, useNuxtApp, useRuntimeConfig } from "#imports";
import type { Ref } from "vue";

export const useSessionToken = (): Ref<string | null> => {
  const nuxt = useNuxtApp();
  const config = import.meta.server
    ? useRuntimeConfig()
    : useRuntimeConfig().public;
  const cookieName = config.strapi.cookieName as string;
  const cookieOptions = config.strapi.cookie as Record<string, unknown>;

  nuxt._cookies = nuxt._cookies || {};
  if (nuxt._cookies[cookieName]) {
    return nuxt._cookies[cookieName] as Ref<string | null>;
  }
  const cookie = useCookie<string | null>(cookieName, cookieOptions);
  nuxt._cookies[cookieName] = cookie;
  return cookie;
};
```

### useSessionClient.ts (complete)
```typescript
// apps/dashboard/app/composables/useSessionClient.ts
import { stringify } from "qs";
import type { FetchOptions } from "ofetch";
import { useRuntimeConfig } from "#imports";

export const useSessionClient = () => {
  const config = import.meta.server
    ? useRuntimeConfig()
    : useRuntimeConfig().public;
  const baseURL = `${config.strapi.url as string}${config.strapi.prefix as string}`;
  const token = useSessionToken();

  return async <T = unknown>(
    url: string,
    fetchOptions: FetchOptions = {},
  ): Promise<T> => {
    const headers: Record<string, string> = {};
    if (token?.value) {
      headers.Authorization = `Bearer ${token.value}`;
    }

    if (fetchOptions.params) {
      const params = stringify(fetchOptions.params as object, {
        encodeValuesOnly: true,
      });
      if (params) {
        url = `${url}?${params}`;
      }
      delete fetchOptions.params;
    }

    return $fetch<T>(url, {
      retry: 0,
      baseURL,
      ...fetchOptions,
      headers: {
        ...headers,
        ...((fetchOptions.headers as Record<string, string>) ?? {}),
      },
    });
  };
};
```

### useApiClient.ts change (one import swap)
```typescript
// BEFORE line 1:
import { useStrapiClient, useNuxtApp } from "#imports";
// and line 11:
const client = useStrapiClient();

// AFTER line 1:
import { useNuxtApp } from "#imports";
// and line 11:
const client = useSessionClient();
// (useSessionClient is auto-imported via Nuxt composables directory)
```

### useSessionAuth.ts (complete)
```typescript
// apps/dashboard/app/composables/useSessionAuth.ts
import { useRuntimeConfig } from "#imports";
import type { User } from "@/types/user";

export const useSessionAuth = () => {
  const token = useSessionToken();
  const user = useSessionUser<User>();
  const client = useSessionClient();
  const config = import.meta.server
    ? useRuntimeConfig()
    : useRuntimeConfig().public;

  const setToken = (value: string | null): void => {
    token.value = value;
  };

  const fetchUser = async (): Promise<typeof user> => {
    if (token.value) {
      try {
        user.value = await client<User>("/users/me", {
          params: config.strapi.auth as Record<string, unknown>,
        });
      } catch {
        setToken(null);
      }
    }
    return user;
  };

  const logout = (): void => {
    setToken(null);
    user.value = null;
  };

  return { setToken, fetchUser, logout };
};
```

### session.ts startup plugin (complete)
```typescript
// apps/dashboard/app/plugins/session.ts
export default defineNuxtPlugin(async () => {
  const user = useSessionUser();
  if (!user.value) {
    const { fetchUser } = useSessionAuth();
    await fetchUser();
  }
});
```

### Consumer file change example (FormEdit.vue)
```typescript
// BEFORE:
const { fetchUser } = useStrapiAuth();
const user = useStrapiUser() as Ref<User | null>;

// AFTER:
const { fetchUser } = useSessionAuth();
const user = useSessionUser<User>();
```

### useApiClient.test.ts mock update
```typescript
// BEFORE:
vi.mock("#imports", () => ({
  useStrapiClient: () => mockClient,
  useNuxtApp: () => ({ $recaptcha: { execute: mockExecute } }),
}));

// AFTER:
vi.mock("#imports", () => ({
  useNuxtApp: () => ({ $recaptcha: { execute: mockExecute } }),
}));
// Plus mock useSessionClient in the composables auto-import path:
vi.mock("~/app/composables/useSessionClient", () => ({
  useSessionClient: () => mockClient,
}));
```

Alternatively: declare `useSessionClient` as a global in `tests/stubs/imports.stub.ts` and have the test mock that stub.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Content reads via `useStrapi().find/findOne` | `apiClient(url, { method: "GET", params })` | Phase 108 | Done |
| Mutations via `useStrapi().create/update/delete` | `apiClient(url, { method: "POST/PUT/DELETE", body })` | Phase 107 | Done |
| HTTP transport via `useStrapiClient` inside `useApiClient` | `useSessionClient` (custom, identical behavior) | **Phase 109** | Eliminates module dep |
| Auth session via `useStrapiUser/useStrapiAuth/useStrapiToken` | `useSessionUser/useSessionAuth/useSessionToken` | **Phase 109** | Eliminates module dep |
| Module's startup plugin populates session | Custom `plugins/session.ts` | **Phase 109** | Same behavior, owned by dashboard |

**After Phase 109:** `@nuxtjs/strapi` is removed from `apps/dashboard`. The website still depends on the module (Phase 109 scope is dashboard only).

---

## Open Questions

1. **TypeScript type for `useSessionToken` return**
   - What we know: `useCookie<string | null>` returns `Ref<string | null>`. The type is consistent with `useStrapiToken`'s return type.
   - What's unclear: Whether `nuxt._cookies` has a TypeScript declaration that needs augmentation.
   - Recommendation: Cast `nuxt._cookies[cookieName]` as `Ref<string | null>` with a comment explaining the cache pattern. This matches the original implementation.

2. **Whether to keep `runtimeConfig.strapi` (server-side) after module removal**
   - What we know: The module merges `strapi` options into both `runtimeConfig.public.strapi` AND `runtimeConfig.strapi`. After removal, `runtimeConfig.strapi` is no longer automatically populated from the module.
   - What's unclear: Whether `nuxt.config.ts`'s top-level `strapi: { ... }` key still propagates to `runtimeConfig.strapi` without the module being registered, or whether only `runtimeConfig.public.strapi` (explicitly declared) survives.
   - Recommendation: During implementation, verify by adding `runtimeConfig.strapi` explicitly in `nuxt.config.ts` `runtimeConfig` block (server-only copy), mirroring `runtimeConfig.public.strapi`. This ensures the `import.meta.server` branch in `useSessionClient` and `useSessionToken` works correctly.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + happy-dom |
| Config file | `apps/dashboard/vitest.config.ts` |
| Quick run command | `yarn workspace waldo-dashboard vitest run` |
| Full suite command | `yarn workspace waldo-dashboard vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REQ-109-01 | `useSessionClient` serializes nested params with qs bracket notation | unit | `yarn workspace waldo-dashboard vitest run tests/composables/useSessionClient.test.ts` | NO — Wave 0 gap |
| REQ-109-02 | `useSessionClient` injects `Authorization: Bearer <token>` when token present | unit | same file | NO — Wave 0 gap |
| REQ-109-03 | `useApiClient` still injects X-Recaptcha-Token on POST/PUT/DELETE after switching to useSessionClient | unit | `yarn workspace waldo-dashboard vitest run tests/composables/useApiClient.test.ts` | YES (needs mock update) |
| REQ-109-04 | TypeScript compiles clean after all useStrapiX → useSessionX renames | typecheck | `yarn workspace waldo-dashboard nuxt typecheck` | N/A — build step |
| REQ-109-05 | All 55 existing tests still pass after module removal | regression | `yarn workspace waldo-dashboard vitest run` | YES |

### Sampling Rate
- **Per task commit:** `yarn workspace waldo-dashboard vitest run`
- **Per wave merge:** `yarn workspace waldo-dashboard vitest run`
- **Phase gate:** Full suite green + `nuxt typecheck` passes before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/composables/useSessionClient.test.ts` — covers REQ-109-01 (qs serialization) and REQ-109-02 (Authorization header)
- [ ] Update `tests/composables/useApiClient.test.ts` mock — swap `useStrapiClient` for `useSessionClient` (REQ-109-03)
- [ ] Update `tests/stubs/imports.stub.ts` — remove `useStrapiClient`/`useStrapiAuth`/`useStrapiUser` exports, they are no longer from `#imports`

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `apps/dashboard/app/composables/useApiClient.ts`
- Direct code inspection: `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiAuth.js`
- Direct code inspection: `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiUser.js`
- Direct code inspection: `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiToken.js`
- Direct code inspection: `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiClient.js`
- Direct code inspection: `node_modules/@nuxtjs/strapi/dist/runtime/plugins/strapi.js`
- Direct code inspection: `node_modules/@nuxtjs/strapi/dist/module.mjs` (module defaults and runtimeConfig setup)
- Direct code inspection: `apps/dashboard/nuxt.config.ts` (strapi config block, runtimeConfig structure)
- Direct code inspection: all 11 consumer files (complete grep of `useStrapiUser/Token/Auth/Client` across dashboard app)
- Direct code inspection: `apps/dashboard/tests/stubs/imports.stub.ts` (test infrastructure)
- Direct code inspection: `apps/dashboard/tests/composables/useApiClient.test.ts`
- Direct code inspection: `.planning/STATE.md` — Phase 108 decisions
- Direct code inspection: `.planning/phases/108-.../108-RESEARCH.md`

### Secondary (MEDIUM confidence)
- Phase 108 RESEARCH.md — confirmed scope boundaries and out-of-scope items

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — implementations read directly from installed package source; no external research needed
- Architecture: HIGH — all composable interactions verified by source inspection and grep audit
- Pitfalls: HIGH — derived from actual source code of the module being replaced; not inferred
- Consumer inventory: HIGH — grepped all 11 files; exact methods used verified by file reading

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable — no external dependencies; all analysis is from installed package source)
