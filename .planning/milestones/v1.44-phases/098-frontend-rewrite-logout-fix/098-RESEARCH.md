# Phase 098: Frontend Rewrite + Logout Fix — Research

**Researched:** 2026-03-19
**Domain:** Nuxt 4 / Google Identity Services (GIS) / Vue 3 Composition API / Pinia
**Confidence:** HIGH — all findings verified against actual codebase files; no unverified external sources required for core architecture decisions

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GTAP-07 | `useGoogleOneTap.ts` rewritten — redirect hack eliminated, global flag eliminated, deprecated FedCM methods removed | See "Current State Analysis" — exact lines to delete identified |
| GTAP-08 | `google-one-tap.client.ts` plugin created — initializes GIS once with auth-state guard; SSR-safe via `.client.ts` suffix | See "Plugin Architecture" — pattern from recaptcha.client.ts confirms approach |
| GTAP-09 | One Tap appears automatically on public pages for unauthenticated users | See "Route Classification" — public pages mapped; `useStrapiUser()` is the auth guard |
| GTAP-10 | One Tap does NOT appear on private routes (`/cuenta/*`, `/pagar/*`, `/anunciar/*`) | See "Route Classification" — all private routes use `middleware: "auth"` in `definePageMeta` |
| GTAP-11 | Completing One Tap calls `setToken(jwt)` + `fetchUser()` and sets `waldo_jwt` cookie | See "Auth Flow" — `useStrapiAuth()` provides both methods; `@nuxtjs/strapi` manages cookie |
| GTAP-12 | `useLogout.ts` calls `window.google?.accounts?.id?.disableAutoSelect()` before `strapiLogout()` | See "Logout Fix" — insertion point is line 31, before `await strapiLogout()` |
</phase_requirements>

---

## Summary

Phase 098 is a pure frontend change in `apps/website`. The Strapi endpoint (`POST /api/auth/google-one-tap`) is already live from Phase 097. The backend contract is stable: send `{ credential: string }`, receive `{ jwt, user }`. The website only needs to:

1. **Rewrite `useGoogleOneTap.ts`** — strip the redirect hack (`window.location.href = /login/google?access_token=...`), strip the `googleOneTapInitialized` global flag, strip the deprecated `use_fedcm_for_prompt` / `isNotDisplayed` / `getNotDisplayedReason` methods, and replace with a clean callback that calls the Strapi endpoint directly.
2. **Create `google-one-tap.client.ts`** — a client-only plugin that calls `google.accounts.id.initialize()` once on app start (with auth-state guard), and calls `google.accounts.id.prompt()` on each navigation for unauthenticated users on public routes.
3. **Fix `useLogout.ts`** — insert `window.google?.accounts?.id?.disableAutoSelect()` before `strapiLogout()`.

The route guard for "don't show on private routes" is already handled by Nuxt middleware (`middleware: "auth"` in `definePageMeta`). The plugin reads `useStrapiUser()` to check auth state — if user exists, skip `prompt()`.

**Primary recommendation:** Create a single `.client.ts` plugin that owns GIS initialization and prompt logic. Keep the composable thin — it exports only `prompt()` for per-navigation use. Fix `useLogout.ts` in one targeted line insertion.

---

## Current State Analysis (What Exists, What to Change)

### `apps/website/app/composables/useGoogleOneTap.ts` — Current Problems

**File:** `apps/website/app/composables/useGoogleOneTap.ts` (90 lines)

| Problem | Line(s) | Fix |
|---------|---------|-----|
| Redirect hack: `window.location.href = /login/google?access_token=...` | 27 | Replace with `useApiClient()` POST to `/auth/google-one-tap` + `setToken()` + `fetchUser()` |
| Global flag `window.googleOneTapInitialized` prevents re-prompt on SPA nav | 6–8, 73 | Delete both checks; move initialization to plugin |
| `use_fedcm_for_prompt: true` — deprecated GIS config option | 49 | Remove the key entirely |
| `isNotDisplayed()` / `getNotDisplayedReason()` — deprecated FedCM notification methods | 54–56 | Remove; keep `isSkippedMoment()` and `isDismissedMoment()` for UX logging |
| `initialize()` called inside composable (runs on every page that calls it) | 44 | Move `initialize()` to plugin; composable only calls `prompt()` |
| `typeof window === "undefined"` guard + 500ms + polling setTimeout | 3, 84, 79 | Not needed in plugin (`.client.ts` suffix guarantees browser context) |

### `apps/website/app/types/window.d.ts` — Needs `disableAutoSelect`

The `Window.google.accounts.id` interface (lines 11–15) declares `initialize` and `prompt` but **not** `disableAutoSelect`. This method must be added so TypeScript doesn't reject the logout fix.

**Current:**
```typescript
id: {
  initialize: (config: Record<string, unknown>) => void;
  prompt: (callback: (notification: GoogleOneTapNotification) => void) => void;
};
```

**Must become:**
```typescript
id: {
  initialize: (config: Record<string, unknown>) => void;
  prompt: (callback: (notification: GoogleOneTapNotification) => void) => void;
  disableAutoSelect: () => void;
};
```

### `apps/website/app/layouts/default.vue` — Commented-out Code

Lines 22–26 have the old `useGoogleOneTap` call commented out. These dead comment lines should be removed (purely subtractive) once the plugin is in place.

### `apps/website/app/layouts/auth.vue` — Same

Lines 14–18 have the same commented-out block. Remove when done.

---

## Standard Stack

### Core (already in project — no new installs)
| Library | Version | Purpose | Role in Phase 098 |
|---------|---------|---------|-------------------|
| `@nuxtjs/strapi` | v2 | Auth state, cookie management | `useStrapiUser()` for auth guard; `useStrapiAuth().setToken()` + `fetchUser()` for post-login |
| `pinia` | current | Store resets on logout | Already used in `useLogout.ts` |
| `useApiClient` | internal | POST to Strapi with reCAPTCHA header | Use to call `/auth/google-one-tap` |
| GIS script | CDN | Google Identity Services | Already loaded via `nuxt.config.ts` `app.head.script` |

**No new npm packages required.** The GIS library is already loaded via `<script async defer src="https://accounts.google.com/gsi/client">` in `nuxt.config.ts` line 262–267.

**No new Strapi changes required.** Endpoint is live (Phase 097).

### Strapi Endpoint Contract (from Phase 097)
```
POST /api/auth/google-one-tap
Body: { credential: string }   // Google ID token from GIS callback
Response: { jwt: string, user: StrapiUser }
Auth: false (public endpoint)
```

---

## Architecture Patterns

### Pattern 1: Client Plugin for GIS Initialization (GTAP-08)

**What:** A `.client.ts` plugin initializes `google.accounts.id` once on app startup. SSR exclusion is automatic via filename suffix — no `if (import.meta.client)` guard needed.

**Reference pattern:** `apps/website/app/plugins/recaptcha.client.ts` — loads an external script, provides functionality via `nuxtApp.provide()`. The GIS plugin is simpler because the script is already loaded by `nuxt.config.ts`.

**The plugin structure:**
```typescript
// apps/website/app/plugins/google-one-tap.client.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const clientId = config.public.googleClientId;
  if (!clientId) return;

  // Wait for GIS script to be ready (it's async/defer in head)
  const initialize = () => {
    if (!window.google?.accounts?.id) {
      setTimeout(initialize, 100);
      return;
    }

    const { setToken, fetchUser } = useStrapiAuth();
    const client = useApiClient();

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        try {
          const result = await client<{ jwt: string; user: unknown }>(
            'auth/google-one-tap',
            { method: 'POST', body: { credential: response.credential } }
          );
          setToken(result.jwt);
          await fetchUser();
        } catch (error) {
          console.error('[OneTap] Authentication failed:', error);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      // No use_fedcm_for_prompt — removed (deprecated)
    });
  };
  initialize();
});
```

**Key architectural decision (from STATE.md):**
> `google-one-tap.client.ts` plugin suffix ensures SSR exclusion automatically — no `if (import.meta.client)` guard needed inside the plugin (GTAP-08)

> Global `googleOneTapInitialized` flag in existing composable must be removed — it prevents `prompt()` from firing on subsequent SPA pages; `initialize()` moves to plugin (once on startup), `prompt()` stays in composable (per-page) (GTAP-07)

### Pattern 2: Composable Calls `prompt()` Per Navigation (GTAP-09, GTAP-10)

**What:** After the plugin initializes GIS, the composable's only job is calling `google.accounts.id.prompt()` when conditions are met. The plugin calls `prompt()` after initialization; the composable enables per-route calls.

**Auth guard:** `useStrapiUser()` returns `null` for unauthenticated users. Check this before calling `prompt()`.

**Route guard:** The private routes (`/cuenta/*`, `/pagar/*`, `/anunciar/*`) already declare `middleware: "auth"` via `definePageMeta`. The composable checks `useRoute()` to detect private prefixes.

**Rewritten composable:**
```typescript
// apps/website/app/composables/useGoogleOneTap.ts
export const useGoogleOneTap = () => {
  const promptIfEligible = () => {
    // Auth guard: skip if already logged in
    const user = useStrapiUser();
    if (user.value) return;

    // Route guard: skip on private routes
    const route = useRoute();
    const PRIVATE_PREFIXES = ['/cuenta', '/pagar', '/anunciar', '/packs'];
    if (PRIVATE_PREFIXES.some((p) => route.path.startsWith(p))) return;

    // GIS guard: skip if library not ready
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.prompt((notification) => {
      if (notification.isSkippedMoment()) {
        console.log('[OneTap] Skipped:', notification.getSkippedReason());
      } else if (notification.isDismissedMoment()) {
        console.log('[OneTap] Dismissed:', notification.getDismissedReason());
      }
    });
  };

  return { promptIfEligible };
};
```

**Note on open question from STATE.md:**
> `prompt()` calling frequency: Whether `prompt()` should be called on every route change or only on initial app load is unresolved.

**Research recommendation:** Call `prompt()` on initial app load only (from the plugin, after `initialize()`). Don't hook into every route change — GIS's own cooldown and suppression logic (skipped/dismissed state) handles repeat visitors. Hooking every route navigation creates noise and can cause double-prompts. The plugin fires `prompt()` once at startup; the composable is used by pages that want to trigger it explicitly.

**Alternative if per-page is required:** Add `promptIfEligible()` call in `app.vue` or a global layout in a `watch(() => route.path, ...)` — but this is more complex and not needed for MVP.

### Pattern 3: Logout Fix — `disableAutoSelect()` (GTAP-12)

**What:** `window.google.accounts.id.disableAutoSelect()` clears the `g_state` cookie that GIS uses to remember "this user approved auto sign-in." Without this call, GIS will re-prompt immediately after logout.

**Where to insert:** `apps/website/app/composables/useLogout.ts`, line 31 — before `await strapiLogout()`.

**Current `useLogout.ts` lines 27–32:**
```typescript
if (import.meta.client) {
  document.cookie = "waldo_jwt=; path=/; max-age=0";
}

await strapiLogout();
```

**After fix:**
```typescript
if (import.meta.client) {
  document.cookie = "waldo_jwt=; path=/; max-age=0";
  // Clear GIS auto-sign-in state — prevents One Tap from re-prompting immediately after logout
  window.google?.accounts?.id?.disableAutoSelect();
}

await strapiLogout();
```

**Why inside `import.meta.client` block:** `disableAutoSelect()` is a browser-only call. The existing `if (import.meta.client)` guard is the correct place — it already wraps the cookie cleanup.

**STATE.md confirms:**
> `disableAutoSelect()` must be called before `strapiLogout()` in `useLogout.ts` — clears GIS `g_state` cookie; prerequisite before `auto_select: true` can ever be enabled safely (GTAP-12)

---

## Route Classification (for GTAP-09, GTAP-10)

### Private Routes — One Tap MUST NOT fire
These pages use `middleware: "auth"` in `definePageMeta`. An unauthenticated user is redirected before the page mounts.

| Route | Middleware |
|-------|-----------|
| `/cuenta/*` (all 8 pages) | `auth` |
| `/pagar/*` (index, gracias, error) | `auth` |
| `/anunciar/*` (all 7 pages) | `auth` |
| `/packs` | `auth` |

### Public Routes — One Tap SHOULD fire for unauthenticated users
| Route | File |
|-------|------|
| `/` (home) | `pages/index.vue` |
| `/anuncios` (listing) | `pages/anuncios/index.vue` |
| `/anuncios/[slug]` (detail) | `pages/anuncios/[slug].vue` |
| `/blog` | `pages/blog/index.vue` |
| `/blog/[slug]` | `pages/blog/[slug].vue` |
| `/[slug]` (catch-all static) | `pages/[slug].vue` |
| `/preguntas-frecuentes` | public |
| `/contacto` | public |

### Routes Where One Tap Should NOT Fire (but aren't "auth" protected)
| Route | Reason |
|-------|--------|
| `/login` | User is in active login flow |
| `/registro` | User is registering (guest middleware) |
| `/recuperar-contrasena` | Password flow |
| `/restablecer-contrasena` | Password flow |
| `/login/google` | OAuth callback page |
| `/login/verificar` | 2-step verification |

**Recommendation:** The PRIVATE_PREFIXES guard in the composable covers `/cuenta`, `/pagar`, `/anunciar`, `/packs`. The login/registro pages use `middleware: "guest"` which redirects authenticated users — unauthenticated users could theoretically see One Tap there, but it's harmless because completing One Tap will redirect them away from those pages anyway. If needed, add `/login` and `/registro` to PRIVATE_PREFIXES.

---

## Auth Flow (for GTAP-11)

**How `@nuxtjs/strapi` auth works in this project:**

1. `setToken(jwt)` — sets the `waldo_jwt` cookie with `path=/`, `maxAge=604800` (from `nuxt.config.ts` strapi.cookie config), and optional `domain` from `COOKIE_DOMAIN` env var. This is what triggers the shared-session across website/dashboard.
2. `fetchUser()` — calls `GET /api/users/me?populate=role,commune,...` (with auth.populate from `nuxt.config.ts` lines 296–305) and populates `useStrapiUser()` reactive ref.
3. After both calls complete, `useStrapiUser().value` is non-null — the header shows the user's name/avatar, and the user is on the same page (no redirect).

**`useStrapiAuth()` API (from existing usage):**
```typescript
const { setToken, fetchUser, logout } = useStrapiAuth();
```

**Important:** `useApiClient()` adds the reCAPTCHA `X-Recaptcha-Token` header automatically. The `/auth/google-one-tap` endpoint is **not** in the Nitro proxy's reCAPTCHA protected routes — it goes directly to Strapi. But using `useApiClient()` is fine because: (a) it falls back gracefully if reCAPTCHA is unavailable, and (b) it will route through the Nitro proxy like all other API calls.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie management after login | Custom cookie writing | `useStrapiAuth().setToken(jwt)` | Already handles path, maxAge, domain from nuxt.config.ts strapi.cookie config |
| User state after login | Manual Pinia store update | `useStrapiAuth().fetchUser()` | Populates `useStrapiUser()` with auth.populate — header auto-updates |
| SSR safety for client-only code | `if (import.meta.client)` guards everywhere | `.client.ts` plugin suffix | Nuxt guarantees client-only execution for `.client.ts` plugins |
| GIS script loading | Dynamic script injection | Already in `nuxt.config.ts` head.script | Script already loaded globally via `<script async defer src="...">` |
| Route detection for auth | Custom route checking | `useStrapiUser()` from `@nuxtjs/strapi` + route prefix check | `useStrapiUser()` is null for unauthenticated — the canonical auth state |

---

## Common Pitfalls

### Pitfall 1: Re-initialization on Every Route Change
**What goes wrong:** If `google.accounts.id.initialize()` is called on every navigation (e.g., from a composable called in multiple pages), GIS may behave unexpectedly — re-initialization with the same client_id is technically allowed but the callback reference is replaced.
**Why it happens:** The old composable mixed `initialize()` and `prompt()` in the same function.
**How to avoid:** `initialize()` goes in the `.client.ts` plugin (once on app start). `prompt()` is the per-page or per-navigation call.
**Warning signs:** One Tap callback fires but `setToken()` was called with a stale closure.

### Pitfall 2: SSR Crash from `window` Access
**What goes wrong:** Any code touching `window.google` on the server throws `ReferenceError: window is not defined`.
**Why it happens:** Composable called in `<script setup>` runs on SSR.
**How to avoid:** All GIS code lives in `google-one-tap.client.ts` (plugin suffix). The composable only wraps `prompt()` — and must guard with `if (!window.google?.accounts?.id) return`.
**Warning signs:** TypeScript will not catch this. Test by running `yarn dev` and checking server logs.

### Pitfall 3: `disableAutoSelect()` Not in TypeScript Window Type
**What goes wrong:** TypeScript error `Property 'disableAutoSelect' does not exist on type...` blocks the build.
**Why it happens:** `window.d.ts` currently only declares `initialize` and `prompt` for `google.accounts.id`.
**How to avoid:** Update `apps/website/app/types/window.d.ts` to add `disableAutoSelect: () => void` to the `id` interface. This must be done **before** writing `useLogout.ts` changes.
**Warning signs:** `yarn typecheck` fails.

### Pitfall 4: `useApiClient()` Instantiation in Plugin
**What goes wrong:** `useApiClient()` is a composable — Nuxt enforces that composables are called at setup-level, not inside async callbacks.
**Why it happens:** The GIS callback runs asynchronously when the user taps "Sign in."
**How to avoid:** Instantiate `client = useApiClient()` at plugin root level (synchronous setup phase), then use the returned `client` function inside the callback.

```typescript
// CORRECT — instantiate at plugin root
export default defineNuxtPlugin(() => {
  const client = useApiClient(); // ← setup-level
  window.google.accounts.id.initialize({
    callback: async (response) => {
      await client('auth/google-one-tap', ...); // ← use the ref
    }
  });
});
```

**Warning signs:** Vue/Nuxt warning "composable called outside of setup context."

### Pitfall 5: `useStrapiAuth()` in Plugin
**What goes wrong:** Same as Pitfall 4 — `useStrapiAuth()` is a composable that must be called at setup level.
**How to avoid:** Call `useStrapiAuth()` at plugin root level, destructure `setToken` and `fetchUser`, use them in the callback.

### Pitfall 6: `googleOneTapInitialized` Flag Left in window.d.ts
**What goes wrong:** `window.d.ts` declares `googleOneTapInitialized?: boolean` (line 19). If the flag is removed from the composable/plugin but the type declaration remains, it's harmless dead code — but it's misleading.
**How to avoid:** Remove `googleOneTapInitialized?: boolean` from `window.d.ts` when rewriting the composable.
**Warning signs:** Future developers see the type and re-implement the flag.

### Pitfall 7: Dead Loop Without `disableAutoSelect()`
**What goes wrong:** User logs out → GIS auto-sign-in triggers → user is logged back in silently.
**Why it happens:** GIS stores `g_state` cookie to remember user opted in. Without `disableAutoSelect()`, this cookie remains and GIS re-prompts with `auto_select: true`.
**How to avoid:** GTAP-12 — `disableAutoSelect()` in `useLogout.ts` before `strapiLogout()`.
**Warning signs:** After logout, user is immediately redirected back or One Tap auto-fires.

---

## Code Examples

### Complete `useLogout.ts` After Fix
```typescript
// Source: apps/website/app/composables/useLogout.ts (current) + GTAP-12 addition
import { useAdStore } from "@/stores/ad.store";
import { useHistoryStore } from "@/stores/history.store";
import { useMeStore } from "@/stores/me.store";
import { useUserStore } from "@/stores/user.store";
import { useAdsStore } from "@/stores/ads.store";
import { useAppStore } from "@/stores/app.store";
import { useStrapiAuth, navigateTo } from "#imports";

export const useLogout = () => {
  const logout = async (): Promise<void> => {
    const adStore = useAdStore();
    const historyStore = useHistoryStore();
    const meStore = useMeStore();
    const userStore = useUserStore();
    const adsStore = useAdsStore();
    const appStore = useAppStore();
    const { logout: strapiLogout } = useStrapiAuth();

    adStore.$reset();
    historyStore.$reset();
    meStore.reset();
    userStore.reset();
    adsStore.reset();
    appStore.$reset();

    if (import.meta.client) {
      document.cookie = "waldo_jwt=; path=/; max-age=0";
      // GTAP-12: Clear GIS auto-sign-in state — prevents One Tap dead-loop after logout
      window.google?.accounts?.id?.disableAutoSelect();
    }

    await strapiLogout();
    await navigateTo("/");
  };

  return { logout };
};
```

### `window.d.ts` Update Required
```typescript
// Add disableAutoSelect to the id interface in apps/website/app/types/window.d.ts
id: {
  initialize: (config: Record<string, unknown>) => void;
  prompt: (callback: (notification: GoogleOneTapNotification) => void) => void;
  disableAutoSelect: () => void;  // ← add this line
};
```

Also remove `googleOneTapInitialized?: boolean` from the `Window` interface (line 19) — the flag is being eliminated.

---

## Test Patterns for This Phase

### Existing Test Infrastructure
- **Framework:** Vitest with `happy-dom` environment
- **Config file:** `apps/website/vitest.config.ts`
- **Quick run command:** `yarn workspace waldo-website test --run`
- **Stubs:** `tests/stubs/imports.stub.ts` and `tests/stubs/app.stub.ts`
- **Pattern:** `vi.mock("#imports", ...)` to mock Nuxt auto-imports

### `useLogout.test.ts` — Extend for GTAP-12
The existing test file (`apps/website/app/composables/useLogout.test.ts`) has 4 tests covering the 6 store resets and navigation. **A new test must be added for GTAP-12.**

**New test case pattern:**
```typescript
// In useLogout.test.ts — add to the vi.hoisted() block and describe block
const mockDisableAutoSelect = vi.fn();

// In beforeEach or globally:
vi.stubGlobal('window', {
  google: { accounts: { id: { disableAutoSelect: mockDisableAutoSelect } } },
  document: { cookie: '' }
});

it("calls disableAutoSelect() before strapiLogout()", async () => {
  const { useLogout } = await import("./useLogout");
  const { logout } = useLogout();
  await logout();

  const disableOrder = mockDisableAutoSelect.mock.invocationCallOrder[0]!;
  const authOrder = mockAuthLogout.mock.invocationCallOrder[0]!;
  expect(disableOrder).toBeLessThan(authOrder);
});
```

**Note:** The existing test mocks `import.meta.client` as truthy implicitly (happy-dom runs in browser environment). The `disableAutoSelect` guard `window.google?.accounts?.id?.disableAutoSelect()` is optional-chained — tests should stub `window.google` to verify the call.

### `useGoogleOneTap.ts` — New Unit Tests
The rewritten composable should have unit tests for:
- Auth guard: does NOT call `prompt()` when `useStrapiUser()` returns a user
- Route guard: does NOT call `prompt()` on `/cuenta`, `/pagar`, `/anunciar`, `/packs` paths
- Happy path: calls `window.google.accounts.id.prompt()` for unauthenticated user on public route

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (happy-dom) |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn workspace waldo-website test --run` |
| Full suite command | `yarn workspace waldo-website test --run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GTAP-07 | `useGoogleOneTap.ts` rewritten — no redirect, no global flag | unit | `yarn workspace waldo-website test --run composables/useGoogleOneTap` | ❌ Wave 0 |
| GTAP-08 | Plugin initializes GIS once | smoke (manual) | Browser DevTools — One Tap overlay appears | N/A (plugin) |
| GTAP-09 | One Tap fires on public pages for unauthenticated users | smoke (manual) | Visit `/` as logged-out user | N/A |
| GTAP-10 | One Tap does NOT fire on `/cuenta/*`, `/pagar/*`, `/anunciar/*` | unit | `yarn workspace waldo-website test --run composables/useGoogleOneTap` | ❌ Wave 0 |
| GTAP-11 | `setToken()` + `fetchUser()` called after One Tap success | unit (plugin test) | `yarn workspace waldo-website test --run plugins/google-one-tap` | ❌ Wave 0 |
| GTAP-12 | `disableAutoSelect()` called before `strapiLogout()` in logout | unit | `yarn workspace waldo-website test --run composables/useLogout` | ✅ (extend existing) |

### Sampling Rate
- **Per task commit:** `yarn workspace waldo-website test --run`
- **Per wave merge:** `yarn workspace waldo-website test --run`
- **Phase gate:** Full suite green + manual smoke test (One Tap visible on `/`) before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `apps/website/app/composables/useGoogleOneTap.test.ts` — covers GTAP-07, GTAP-09, GTAP-10
- [ ] `apps/website/tests/plugins/google-one-tap.test.ts` — covers GTAP-11 (callback posts to Strapi, calls setToken + fetchUser)
- [ ] Extend `apps/website/app/composables/useLogout.test.ts` — covers GTAP-12

---

## State of the Art

| Old Pattern | New Pattern | Why Changed | Impact |
|-------------|-------------|-------------|--------|
| `window.location.href = /login/google?access_token=...` | `useApiClient().post('/auth/google-one-tap')` | Phase 097 created direct endpoint; redirect causes full page reload | No more page reload after login |
| `window.googleOneTapInitialized` global flag | Plugin handles initialization once | Flag prevented re-prompting across SPA navigation | `prompt()` can fire on each public route visit |
| `use_fedcm_for_prompt: true` | Removed | Deprecated in GIS SDK | Cleaner initialization |
| `isNotDisplayed()` / `getNotDisplayedReason()` | Removed | Deprecated in GIS SDK | Fewer console warnings |
| Initialize + prompt in composable (called per page) | Initialize in plugin, prompt in composable | Separation of concerns; plugin runs once | GIS initialized exactly once per app session |

---

## Open Questions

1. **`prompt()` frequency: once per app load vs. every route change**
   - What we know: STATE.md marks this "unresolved before Phase 098"; existing implementation called `initialize()` + `prompt()` together in the composable (both once per page visit due to `googleOneTapInitialized` flag)
   - What's unclear: Product decision — does the team want One Tap to appear only on the first page the user visits, or on every public page they navigate to?
   - Recommendation: **Per-app-load (once)** — GIS's own suppression handles re-showing after dismissal. The plugin fires `prompt()` after `initialize()`. This is less intrusive and avoids GIS's internal cooldown period being reset. The planner should document this decision in the plan.

2. **`handleCredentialResponse` global function on `window`**
   - What we know: Current composable sets `(window as any).handleCredentialResponse = handleCredentialResponse` (line 37). This was needed for the old redirect pattern.
   - What's unclear: Whether any HTML template or other code calls `window.handleCredentialResponse` directly.
   - Recommendation: Remove from the new composable (it was only needed for the deprecated data-callback HTML attribute pattern). The GIS `initialize()` callback config prop is the modern way.

3. **`useApiClient()` vs `useStrapiClient()` for the One Tap POST**
   - What we know: `useApiClient()` wraps `useStrapiClient()` and adds reCAPTCHA token. The `/auth/google-one-tap` endpoint is not protected by reCAPTCHA middleware (it's a Strapi `auth:false` endpoint, not a Nitro proxy route).
   - What's unclear: Whether adding reCAPTCHA token to this request causes any issues.
   - Recommendation: Use `useApiClient()` — it falls back gracefully when reCAPTCHA is unavailable, and the extra header is ignored by Strapi.

---

## Sources

### Primary (HIGH confidence)
- `apps/website/app/composables/useGoogleOneTap.ts` — exact current implementation (90 lines, all problems identified)
- `apps/website/app/composables/useLogout.ts` — current implementation; insertion point for GTAP-12 identified
- `apps/website/app/types/window.d.ts` — missing `disableAutoSelect` identified
- `apps/website/app/plugins/recaptcha.client.ts` — client plugin pattern reference
- `apps/website/nuxt.config.ts` — confirms GIS script loading, strapi cookie config, `googleClientId` in `runtimeConfig.public`
- `.planning/STATE.md` — key decisions GTAP-07, GTAP-08, GTAP-12 confirmed
- `.planning/REQUIREMENTS.md` — all 6 GTAP requirements (07–12) read directly
- `097-03-SUMMARY.md` — confirms endpoint contract `{ credential } → { jwt, user }`
- All `apps/website/app/pages/**/*.vue` middleware declarations — private route classification

### Secondary (MEDIUM confidence)
- GIS official docs (per 096-01-SUMMARY.md decisions) — `use_fedcm_for_prompt` deprecated pattern; `disableAutoSelect()` for logout loop prevention

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project; no new installs
- Architecture: HIGH — plugin/composable split confirmed by STATE.md decisions; recaptcha.client.ts is direct reference pattern
- Route classification: HIGH — all pages read directly; private/public split confirmed
- Pitfalls: HIGH — most derived from actual code inspection (wrong window type, composable instantiation rules from AGENTS.md)
- Test patterns: HIGH — existing test infrastructure verified (vitest.config.ts, imports.stub.ts, existing useLogout.test.ts)

**Research date:** 2026-03-19
**Valid until:** This research is based on the actual codebase — valid until Phase 098 is started (code doesn't change between now and then)
