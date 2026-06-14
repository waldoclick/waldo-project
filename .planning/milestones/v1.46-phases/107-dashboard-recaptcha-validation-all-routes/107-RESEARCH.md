# Phase 107: dashboard-recaptcha-validation-all-routes - Research

**Researched:** 2026-03-29
**Domain:** reCAPTCHA v3 / Nuxt 4 Nitro proxy / dashboard Strapi client
**Confidence:** HIGH

## Summary

The website app already has a complete, battle-tested reCAPTCHA v3 implementation that validates every POST, PUT, and DELETE request at the Nitro proxy layer. The dashboard has the same infrastructure in place (plugin, server/utils/recaptcha.ts, server/api/[...].ts) but its `isRecaptchaProtectedRoute` only guards three auth-only POST routes instead of all mutating methods.

The core fix is a two-part change: (1) update the server-side guard in `apps/dashboard/server/utils/recaptcha.ts` to match the website's approach — protect all POST/PUT/DELETE regardless of path — and (2) add a `useApiClient` composable to the dashboard that auto-injects the `X-Recaptcha-Token` header on mutating calls, then migrate every `useStrapiClient()` call to use it. The `useStrapi()` SDK calls (`strapi.create`, `strapi.update`, `strapi.delete`) go through the same Nitro proxy on the client side (because `runtimeConfig.public.strapi.url` points to BASE_URL/proxy), so they also need token injection, which requires replacing them with `useStrapiClient()` calls wrapped in `useApiClient`.

There is one pre-existing bug noted in STATE.md: `FormForgotPassword.vue` in the dashboard does NOT send a reCAPTCHA token (the comment says this is from v1.37). However, the current code DOES send the token — it calls `$recaptcha.execute("submit")` and passes `"X-Recaptcha-Token"`. This is already working and should be left alone. The server-side guard for `auth/forgot-password` is currently in `RECAPTCHA_PROTECTED_ROUTES` and will remain protected after the migration.

**Primary recommendation:** Add `useApiClient` composable to the dashboard (copy from website with no modifications needed), update `server/utils/recaptcha.ts` to protect all mutating methods, then replace every `useStrapiClient()` and `strapi.create/update/delete` call in components and pages with `useApiClient`.

---

## Current State Audit

### What Already Exists in Dashboard

| File | Status |
|------|--------|
| `app/plugins/recaptcha.client.ts` | EXISTS — identical to website (loads script, provides `$recaptcha`) |
| `server/utils/recaptcha.ts` | EXISTS — but only guards 3 auth POSTs via allowlist |
| `server/api/[...].ts` | EXISTS — calls `isRecaptchaProtectedRoute` + `verifyRecaptchaToken` |
| `app/composables/useApiClient.ts` | MISSING — does not exist in dashboard |

### What Differs: Server-Side Guard

**Website (`server/utils/recaptcha.ts`):**
```typescript
// Protects ALL POST, PUT, DELETE — no allowlist
const RECAPTCHA_PROTECTED_METHODS = ["POST", "PUT", "DELETE"];
export function isRecaptchaProtectedRoute(_fullPath: string, method: string): boolean {
  return RECAPTCHA_PROTECTED_METHODS.includes(method.toUpperCase());
}
```

**Dashboard (`server/utils/recaptcha.ts`):**
```typescript
// Allowlist of 3 auth routes, POST only
export const RECAPTCHA_PROTECTED_ROUTES = [
  "auth/local",
  "auth/forgot-password",
  "auth/reset-password",
] as const;
export function isRecaptchaProtectedRoute(fullPath: string, method: string): boolean {
  if (method !== "POST") return false;
  return RECAPTCHA_PROTECTED_ROUTES.some((route) => fullPath.startsWith(route));
}
```

**Required change:** Replace the dashboard's allowlist approach with the website's method-based approach.

### What Differs: Client-Side Token Injection

**Website:** Has `useApiClient` composable — auto-injects `X-Recaptcha-Token` on POST/PUT/DELETE.

**Dashboard:** Does NOT have `useApiClient`. Each component that already does reCAPTCHA manually calls `$recaptcha.execute("submit")` and passes the header. Components that do NOT do reCAPTCHA call `useStrapiClient()` directly without any token.

---

## Complete Call-Site Inventory

### Components with manual `$recaptcha` + `useStrapiClient` (already send token — correct pattern, but should be migrated to `useApiClient` for consistency)

| Component | Calls | Token sent? |
|-----------|-------|-------------|
| `FormLogin.vue` | `client("/auth/local", POST)` | YES — manual |
| `FormForgotPassword.vue` | `client("/auth/forgot-password", POST)` | YES — manual |
| `FormResetPassword.vue` | `client("/auth/reset-password", POST)` | YES — manual |

### Components using `useStrapiClient` WITHOUT reCAPTCHA token (must migrate)

| Component | Calls | HTTP Method |
|-----------|-------|-------------|
| `FormEdit.vue` | `client("/users/${id}", PUT)` | PUT |
| `FormVerifyCode.vue` | `client("/auth/verify-code", POST)` | POST |
| `FormVerifyCode.vue` | `client("/auth/resend-code", POST)` | POST |
| `FormGift.vue` | `client("/${endpoint}/gift", POST)` | POST |
| `LightBoxArticles.vue` | `client("/search/tavily", POST)` | POST |
| `LightBoxArticles.vue` | `client("/ia/groq", POST)` | POST |
| `LightBoxArticles.vue` | `client("/articles?status=draft", POST)` | POST |
| `FormArticle.vue` | `client("/articles?status=draft", POST)` | POST |
| `pages/ads/[id].vue` | `strapiClient("/ads/${id}/approve", PUT)` | PUT |
| `pages/ads/[id].vue` | `strapiClient("/ads/${id}/reject", PUT)` | PUT |
| `pages/ads/[id].vue` | `strapiClient("/ads/${id}/banned", PUT)` | PUT |

### Components using `useStrapi()` SDK (`strapi.create`, `strapi.update`, `strapi.delete`) WITHOUT reCAPTCHA token (must migrate)

The `useStrapi()` SDK routes requests through the Nitro proxy on the client side (because `runtimeConfig.public.strapi.url` = BASE_URL). So these calls also pass through the proxy and will be rejected once the guard is broadened.

| Component | SDK Call | HTTP Method |
|-----------|----------|-------------|
| `FormArticle.vue` | `strapi.update("articles", docId, payload)` | PUT |
| `ArticlesDefault.vue` | `strapi.delete("articles", docId)` | DELETE |
| `FormFaq.vue` | `strapi.update("faqs", ...)` | PUT |
| `FormFaq.vue` | `strapi.create("faqs", payload)` | POST |
| `FormCommune.vue` | `strapi.update("communes", ...)` | PUT |
| `FormCommune.vue` | `strapi.create("communes", payload)` | POST |
| `FormRegion.vue` | `strapi.update("regions", ...)` | PUT |
| `FormRegion.vue` | `strapi.create("regions", payload)` | POST |
| `FormCategory.vue` | `strapi.update("categories", ...)` | PUT |
| `FormCategory.vue` | `strapi.create("categories", payload)` | POST |
| `FormPack.vue` | `strapi.update("ad-packs", ...)` | PUT |
| `FormPack.vue` | `strapi.create("ad-packs", payload)` | POST |
| `FormCondition.vue` | `strapi.update("conditions", ...)` | PUT |
| `FormCondition.vue` | `strapi.create("conditions", payload)` | POST |
| `FormPassword.vue` | `strapi.update("users", id, payload)` | PUT |
| `me.store.ts` | `strapi.update("users/username", data)` | PUT |
| `pages/articles/[id]/edit.vue` | `strapi.update("articles", docId, ...)` | PUT |
| `pages/ads/[id].vue` | `strapi.update("ads", docId, payload)` | PUT |
| `pages/ads/[id].vue` | `strapi.delete("upload/files", id)` | DELETE |

### Special cases to exclude from migration

| Component | Why excluded |
|-----------|--------------|
| `FormDev.vue` | Calls `/api/dev-login` via raw `fetch()` — this is a Nitro server route, not a Strapi proxy route. Not subject to reCAPTCHA guard. |
| `UploadMedia.vue` | Calls `/api/upload` via raw `fetch()` with `FormData`. The proxy already handles this; reCAPTCHA does not apply to file uploads (not a Strapi content route). Behavior unchanged. |
| `useImage.ts` (uploadFile) | Same as `UploadMedia.vue` — uses raw `fetch()` for file upload to `/api/ads/upload`. Excluded. |

---

## Architecture Patterns

### Pattern 1: `useApiClient` composable (website reference)

The website's `useApiClient` is the exact pattern to replicate in the dashboard. It is a thin wrapper around `useStrapiClient()` that:
- Intercepts POST, PUT, DELETE
- Calls `$recaptcha.execute("submit")` via `nuxtApp.$recaptcha`
- Injects `X-Recaptcha-Token` header
- Falls back gracefully when `$recaptcha` is unavailable (SSR, adblocker)
- Preserves all caller-supplied headers and options

**Source:** `apps/website/app/composables/useApiClient.ts` (copy verbatim to `apps/dashboard/app/composables/useApiClient.ts` — no changes needed)

### Pattern 2: `strapi.create/update/delete` → `useApiClient` migration

The `useStrapi()` SDK methods do not accept custom headers. They must be replaced with `useApiClient()` calls that replicate the equivalent HTTP call:

```typescript
// BEFORE
const strapi = useStrapi();
await strapi.create("faqs", payload as unknown as Parameters<typeof strapi.create>[1]);

// AFTER
const apiClient = useApiClient();
await apiClient("/faqs", { method: "POST", body: { data: payload } });
```

```typescript
// BEFORE
await strapi.update("regions", documentId, payload as unknown as Parameters<typeof strapi.update>[2]);

// AFTER
const apiClient = useApiClient();
await apiClient(`/regions/${documentId}`, { method: "PUT", body: { data: payload } });
```

```typescript
// BEFORE
await strapi.delete("articles", article.documentId || String(article.id));

// AFTER
const apiClient = useApiClient();
await apiClient(`/articles/${article.documentId || article.id}`, { method: "DELETE" });
```

**Note:** Strapi v5 SDK `create` wraps payload in `{ data: payload }` automatically. When migrating to `useStrapiClient`, you must add `{ data: payload }` explicitly if the endpoint expects Strapi v5 format.

### Pattern 3: Server-side guard update

Replace the allowlist approach with the method-based approach from the website:

```typescript
// apps/dashboard/server/utils/recaptcha.ts — NEW content
import { createError } from "h3";

const RECAPTCHA_PROTECTED_METHODS = ["POST", "PUT", "DELETE"];

export async function verifyRecaptchaToken(
  token: string | null | undefined,
  secretKey: string,
): Promise<void> {
  // ... identical to website version (add error-codes logging)
}

export function isRecaptchaProtectedRoute(
  _fullPath: string,
  method: string,
): boolean {
  return RECAPTCHA_PROTECTED_METHODS.includes(method.toUpperCase());
}
```

The `RECAPTCHA_PROTECTED_ROUTES` export can be removed — it is only referenced within the file itself.

### Pattern 4: Auth forms stay as-is

`FormLogin.vue`, `FormForgotPassword.vue`, and `FormResetPassword.vue` already manually call `$recaptcha.execute("submit")` and pass `X-Recaptcha-Token`. They work correctly today. They should be migrated to `useApiClient` for consistency (removes manual token management), but this is not strictly required for correctness — the server guard will still validate their tokens.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token injection on mutating calls | Custom per-component token logic | `useApiClient` composable | Already implemented in website — copy verbatim |
| reCAPTCHA verification | Inline $fetch to siteverify | `verifyRecaptchaToken` in server/utils | Already exists in dashboard, just needs guard logic updated |
| Strapi API calls with headers | Custom fetch wrapper | `useStrapiClient` wrapped in `useApiClient` | SDK doesn't support custom headers; composable approach is established pattern |

**Key insight:** The entire implementation already exists in the website app. This phase is about propagating the pattern to the dashboard, not building anything new.

---

## Common Pitfalls

### Pitfall 1: `strapi.create` payload wrapping
**What goes wrong:** `strapi.create("faqs", payload)` wraps payload as `{ data: payload }` automatically. When you migrate to `useStrapiClient`, calling `client("/faqs", { method: "POST", body: payload })` sends the payload unwrapped — Strapi v5 requires `{ data: payload }` in the request body.
**How to avoid:** Always use `body: { data: payload }` when replacing `strapi.create()` with `apiClient()`.
**Warning signs:** 400 errors from Strapi with "data is required" or missing fields.

### Pitfall 2: `strapi.update` uses `documentId` not numeric `id`
**What goes wrong:** Some existing calls use `item.value!.id` (numeric) instead of `item.value!.documentId`. Strapi v5 requires `documentId` for updates.
**How to avoid:** Always use `documentId` in the URL when migrating `strapi.update` calls. CLAUDE.md rule: "Prefer `documentId` over numeric `id` for content updates and deletes in Strapi v5."
**Warning signs:** 404 from Strapi on update/delete.

### Pitfall 3: SSR guard mismatch
**What goes wrong:** `$recaptcha` is a client-only plugin — it is `undefined` on the server. `useApiClient` already handles this gracefully (optional chaining + try/catch). But if the server-side proxy is called directly (e.g., SSR data fetch), the proxy will reject mutating requests without a token.
**How to avoid:** Dashboard data fetching for mutating actions is always triggered by user interaction (button clicks) — it runs client-side only. This is not a real risk for this codebase.

### Pitfall 4: `FormDev.vue` and upload routes must NOT get reCAPTCHA
**What goes wrong:** `FormDev.vue` calls `/api/dev-login` (a dedicated Nitro server route, not the Strapi proxy catch-all). The upload routes `/api/upload` and `/api/ads/upload` are also separate Nitro handlers. The reCAPTCHA guard lives only in `server/api/[...].ts` (the catch-all Strapi proxy), so these routes are automatically unaffected.
**How to avoid:** Do not add reCAPTCHA logic to `/api/dev-login` or upload handlers — they are not in scope.

### Pitfall 5: `verifyRecaptchaToken` logging alignment
**What goes wrong:** The dashboard's `verifyRecaptchaToken` does not log verification failures (unlike the website which logs `success`, `score`, and `error-codes`). When broadening the guard, silent failures will be harder to diagnose.
**How to avoid:** Update `verifyRecaptchaToken` in the dashboard to match the website's logging pattern (add `console.warn` on failure).

---

## Code Examples

### useApiClient composable (copy from website verbatim)
```typescript
// Source: apps/website/app/composables/useApiClient.ts
import { useStrapiClient, useNuxtApp } from "#imports";

export function useApiClient() {
  const client = useStrapiClient();
  const nuxtApp = useNuxtApp();

  const MUTATING_METHODS = ["POST", "PUT", "DELETE"] as const;
  type MutatingMethod = (typeof MUTATING_METHODS)[number];

  return async function apiClient<T = unknown>(
    url: string,
    options?: Parameters<typeof client>[1],
  ): Promise<T> {
    const method = (
      (options?.method as string | undefined) ?? "GET"
    ).toUpperCase();

    if (MUTATING_METHODS.includes(method as MutatingMethod)) {
      let recaptchaToken: string | undefined;

      try {
        recaptchaToken = await (
          nuxtApp.$recaptcha as
            | { execute: (action: string) => Promise<string> }
            | undefined
        )?.execute("submit");
      } catch {
        // reCAPTCHA blocked (adblocker) or script load failure — proceed without token.
      }

      return client<T>(url, {
        ...options,
        headers: {
          ...((options?.headers as Record<string, string> | undefined) ?? {}),
          ...(recaptchaToken ? { "X-Recaptcha-Token": recaptchaToken } : {}),
        },
      });
    }

    return client<T>(url, options);
  };
}
```

### Updated server/utils/recaptcha.ts for dashboard
```typescript
// Source: adapted from apps/website/server/utils/recaptcha.ts
import { createError } from "h3";

const RECAPTCHA_PROTECTED_METHODS = ["POST", "PUT", "DELETE"];

export async function verifyRecaptchaToken(
  token: string | null | undefined,
  secretKey: string,
): Promise<void> {
  if (!token || !token.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: "reCAPTCHA token is required",
    });
  }

  const result = await $fetch<{
    success: boolean;
    score: number;
    "error-codes"?: string[];
  }>("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }).toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!result.success || result.score <= 0.5) {
    console.warn(
      `[recaptcha] Verification failed. success=${result.success}, score=${result.score ?? "n/a"}, error-codes=${(result["error-codes"] ?? []).join(",")}`,
    );
    throw createError({
      statusCode: 400,
      statusMessage: "reCAPTCHA verification failed. Please try again.",
    });
  }
}

export function isRecaptchaProtectedRoute(
  _fullPath: string,
  method: string,
): boolean {
  return RECAPTCHA_PROTECTED_METHODS.includes(method.toUpperCase());
}
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @nuxt/test-utils |
| Config file | `apps/dashboard/vitest.config.ts` |
| Quick run command | `yarn workspace waldo-dashboard vitest run` |
| Full suite command | `yarn workspace waldo-dashboard vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RCP-107-01 | `useApiClient` injects X-Recaptcha-Token on POST | unit | `yarn workspace waldo-dashboard vitest run tests/composables/useApiClient.test.ts` | Wave 0 |
| RCP-107-02 | `useApiClient` injects X-Recaptcha-Token on PUT | unit | same file | Wave 0 |
| RCP-107-03 | `useApiClient` injects X-Recaptcha-Token on DELETE | unit | same file | Wave 0 |
| RCP-107-04 | `useApiClient` does NOT inject header on GET | unit | same file | Wave 0 |
| RCP-107-05 | `isRecaptchaProtectedRoute` returns true for all POST/PUT/DELETE | unit | `yarn workspace waldo-dashboard vitest run tests/server/recaptcha.test.ts` | Wave 0 |
| RCP-107-06 | `isRecaptchaProtectedRoute` returns false for GET | unit | same file | Wave 0 |
| RCP-107-07 | `verifyRecaptchaToken` throws 400 on missing token | unit | same file | Wave 0 |
| RCP-107-08 | `verifyRecaptchaToken` resolves on score > 0.5 | unit | same file | Wave 0 |

### Sampling Rate
- **Per task commit:** `yarn workspace waldo-dashboard vitest run`
- **Per wave merge:** `yarn workspace waldo-dashboard vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/dashboard/tests/composables/useApiClient.test.ts` — covers RCP-107-01 through RCP-107-04 (copy from website's `useApiClient.test.ts` verbatim)
- [ ] `apps/dashboard/tests/server/recaptcha.test.ts` — covers RCP-107-05 through RCP-107-08 (adapt from website's `recaptcha-proxy.test.ts`, removing `RECAPTCHA_PROTECTED_ROUTES` references)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dashboard: allowlist-based guard (3 auth routes, POST only) | Method-based guard (all POST/PUT/DELETE) | Phase 107 | All mutating API calls now require reCAPTCHA token |
| Dashboard: manual `$recaptcha.execute` in each auth form | `useApiClient` composable auto-injects token | Phase 107 | Consistent pattern, no per-component token management |

---

## Open Questions

1. **`useStrapi()` SDK calls on the server side**
   - What we know: On the server side, `useStrapi()` uses `API_URL` directly (not the proxy). The reCAPTCHA guard only applies to the Nitro proxy catch-all handler. Server-side SDK calls bypass the guard entirely.
   - What's unclear: Are any `strapi.update/create/delete` calls invoked server-side (e.g., in `useAsyncData`)? Looking at the code, all mutations are triggered by user actions (button clicks) → client-side only. No server-side mutations found.
   - Recommendation: No action needed. If a future server-side mutation is added, it must bypass the proxy anyway.

2. **`FormLogin.vue` uses `client` (useStrapiClient) with manual token — after server guard broadening, `client` calls without `useApiClient` wrapper will be blocked for PUT/DELETE**
   - What we know: Auth forms already inject the token manually — they will continue to work after the server-side guard change.
   - What's unclear: Whether to migrate auth forms to `useApiClient` (for consistency) or leave them as-is (minimal change).
   - Recommendation: Migrate auth forms to `useApiClient` for consistency and to eliminate redundant manual token logic. This simplifies `FormLogin.vue`, `FormForgotPassword.vue`, and `FormResetPassword.vue`.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `apps/website/app/composables/useApiClient.ts`
- Direct code inspection of `apps/website/server/utils/recaptcha.ts`
- Direct code inspection of `apps/website/server/api/[...].ts`
- Direct code inspection of `apps/dashboard/server/utils/recaptcha.ts`
- Direct code inspection of `apps/dashboard/server/api/[...].ts`
- Direct code inspection of all dashboard components and pages containing `useStrapiClient` and `useStrapi` SDK calls

### Secondary (MEDIUM confidence)
- `apps/website/app/composables/useApiClient.test.ts` — confirms expected behavior of `useApiClient`
- `apps/website/tests/server/recaptcha-proxy.test.ts` — confirms expected behavior of server-side verifier
- `apps/dashboard/nuxt.config.ts` — confirms proxy routing configuration

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all code is in-repo, no external dependencies to verify
- Architecture: HIGH — direct code inspection of both apps, pattern is established
- Pitfalls: HIGH — identified from code structure and CLAUDE.md rules

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable — no external dependencies change)
