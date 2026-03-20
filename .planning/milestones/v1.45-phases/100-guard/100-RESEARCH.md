# Phase 100: Guard - Research

**Researched:** 2026-03-19
**Domain:** Nuxt 4 route middleware, client-only guard patterns, `isProfileComplete` integration
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GUARD-01 | Authenticated users with incomplete profiles are redirected to `/onboarding` on any non-exempt page navigation | Global route middleware using `defineNuxtRouteMiddleware`; `useMeStore().isProfileComplete()` checks five required fields; `navigateTo('/onboarding')` with `appStore.setReferer` saves return URL |
| GUARD-02 | Users with complete profiles cannot access `/onboarding` (redirected to home) | Same middleware checks `to.path.startsWith('/onboarding')` and returns `navigateTo('/')` when profile is complete |
| GUARD-03 | Onboarding guard is client-only (SSR-safe) and runs after auth guard | `if (import.meta.server) return;` at top of middleware — identical to `wizard-guard.ts` pattern; global middleware runs after named middleware declared in `definePageMeta` |
| GUARD-04 | Auth pages (`/login`, `/registro`, `/logout`) are exempt from onboarding redirect | Exempt set includes `/login`, `/registro`, `/logout`, `/onboarding` — checked before any async work |
</phase_requirements>

---

## Summary

Phase 100 implements a single global route middleware file — `onboarding-guard.global.ts` — that intercepts every navigation and enforces the onboarding flow for authenticated users whose profiles are incomplete. The guard is client-only (SSR skipped via `import.meta.server` guard), checks `useMeStore().isProfileComplete()` asynchronously, and redirects incomplete-profile users to `/onboarding` while saving their intended URL to `appStore.referer`. It also enforces the reverse: users with complete profiles who land on `/onboarding` are redirected to home.

The existing codebase already provides all the building blocks: `useMeStore().isProfileComplete()` performs the five-field check, `useAppStore().setReferer()` persists the return URL, and the `wizard-guard.ts` file establishes the SSR-safe guard pattern. The only new file is `onboarding-guard.global.ts`; no store changes, no page changes, and no Strapi changes are needed.

There are two timing concerns to research carefully: (1) `isProfileComplete()` makes an API call on first use if `me.value` is null — the guard must not block SSR or cause hydration mismatches; (2) the guard runs on every navigation, so after a user completes onboarding the `me.value` cache in `useMeStore` must reflect the updated profile or the guard will loop. The `useStrapiAuth().fetchUser()` call (or `meStore.loadMe()`) after profile save in Phase 099 handles this via `me.value` being populated, so the cache issue is already addressed.

**Primary recommendation:** Create `apps/website/app/middleware/onboarding-guard.global.ts` as a client-only global middleware using the `wizard-guard.ts` pattern, calling `useMeStore().isProfileComplete()` and `useAppStore().setReferer()`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt 4 route middleware | 4.1.3 | `defineNuxtRouteMiddleware` + global naming convention | Project stack — all guards use this pattern |
| Pinia (`useMeStore`) | — | `isProfileComplete()` checks five profile fields | Already implemented in `me.store.ts` |
| Pinia (`useAppStore`) | — | `setReferer()` persists pre-redirect URL to localStorage | Already implemented in `app.store.ts` |
| `@nuxtjs/strapi` | v2 | `useStrapiUser()` for cheap authenticated-user check | Avoids unnecessary `isProfileComplete()` API call for unauthenticated users |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `navigateTo` | Nuxt built-in | Programmatic redirect inside middleware | Use for all guard redirects |
| `import.meta.server` / `import.meta.client` | Nuxt built-in | SSR safety guard | Always check at top of global middleware that reads localStorage stores |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Global middleware (`*.global.ts`) | Named middleware on every page | Global runs automatically on all routes; named requires adding `middleware: ['onboarding-guard']` to every page — not scalable |
| `useMeStore().isProfileComplete()` | `useStrapiUser()` field check inline | `isProfileComplete()` already owns the field list and cache logic; duplicating it in middleware violates DRY |
| `appStore.setReferer(to.fullPath)` | Custom cookie | `appStore.referer` is already persisted to localStorage and the onboarding thankyou page already reads it via `getReferer` |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
apps/website/app/
└── middleware/
    └── onboarding-guard.global.ts   # New: global client-only onboarding guard
```

One new file. No other files change.

### Pattern 1: SSR-Safe Global Middleware (from wizard-guard.ts)

**What:** Nuxt global middleware that bails early on the server to avoid reading client-only state.
**When to use:** Any guard that depends on Pinia stores persisted to localStorage.

```typescript
// apps/website/app/middleware/onboarding-guard.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  // ... guard logic
});
```

`wizard-guard.ts` uses this exact pattern (line 20). `dev.global.ts` uses `typeof window === "undefined"` instead — the `import.meta.server` form is preferred in Nuxt 4 (transformed by the `nuxt-meta-client-stub` Vite plugin in tests).

### Pattern 2: Exempt Route Check (before async work)

**What:** Check the destination path against an exempt set before doing any async operations.
**When to use:** Any guard with async checks — fail fast for exempt routes.

```typescript
const EXEMPT_PATHS = new Set([
  "/onboarding",
  "/onboarding/thankyou",
  "/login",
  "/registro",
  "/logout",
]);

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  // Bail immediately for exempt routes — no async work
  if (EXEMPT_PATHS.has(to.path)) return;

  // ... rest of guard
});
```

Using a `Set` matches the pattern in `referer.global.ts` (line 2-7). Checking before async avoids unnecessary API calls on auth pages.

### Pattern 3: Auth Check Before Profile Check

**What:** Use `useStrapiUser()` for a cheap synchronous check before calling the async `isProfileComplete()`.
**When to use:** When a guard applies only to authenticated users — avoids API call for guests.

```typescript
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;
  if (EXEMPT_PATHS.has(to.path)) return;

  const user = useStrapiUser();
  if (!user.value) return; // Unauthenticated — auth.ts handles redirect if needed

  const meStore = useMeStore();
  const profileComplete = await meStore.isProfileComplete();

  if (!profileComplete) {
    const appStore = useAppStore();
    appStore.setReferer(to.fullPath);
    return navigateTo("/onboarding");
  }

  // Reverse guard: complete profile cannot visit /onboarding
  if (to.path.startsWith("/onboarding")) {
    return navigateTo("/");
  }
});
```

### Pattern 4: Reverse Guard for /onboarding

**What:** Redirect complete-profile users away from `/onboarding` to prevent re-entry.
**When to use:** Required by GUARD-02.

The check `to.path.startsWith("/onboarding")` covers both `/onboarding` and `/onboarding/thankyou`. This runs **after** the incomplete-profile check — if the profile is complete, there is no reason to be on the onboarding path.

Note: `/onboarding` and `/onboarding/thankyou` are NOT in `EXEMPT_PATHS` for unauthenticated users (the `auth` middleware on the page handles that). They are in `EXEMPT_PATHS` only to prevent the incomplete-profile guard from redirecting someone who is *already* at `/onboarding` — otherwise they would be in a redirect loop. The correct approach is:

- `/onboarding*` is NOT in `EXEMPT_PATHS` (incomplete-profile users need the reverse guard to be checked there)
- Instead, for incomplete users already at `/onboarding`, the guard simply returns without redirecting

Refined logic:

```typescript
const AUTH_EXEMPT_PATHS = new Set(["/login", "/registro", "/logout"]);

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;
  if (AUTH_EXEMPT_PATHS.has(to.path)) return;

  const user = useStrapiUser();
  if (!user.value) return;

  const meStore = useMeStore();
  const profileComplete = await meStore.isProfileComplete();

  if (!profileComplete) {
    // Already heading to onboarding — do not redirect again
    if (to.path.startsWith("/onboarding")) return;

    const appStore = useAppStore();
    appStore.setReferer(to.fullPath);
    return navigateTo("/onboarding");
  }

  // Complete profile cannot visit onboarding
  if (to.path.startsWith("/onboarding")) {
    return navigateTo("/");
  }
});
```

This is the correct loop-free implementation. Separate the auth exemptions from the onboarding-path check.

### Pattern 5: Middleware Execution Order in Nuxt 4

**What:** Nuxt runs middleware in this order: global middleware (alphabetical) → named middleware (page-level).
**When to use:** Understanding this is critical to GUARD-03.

Global middleware files run **before** page-level `middleware: "auth"`. However, `onboarding-guard.global.ts` starts with `o` alphabetically, which means it runs after `dev.global.ts` and `referer.global.ts`. The auth check `if (!user.value) return` inside the guard means it safely no-ops for unauthenticated users. The page-level `auth` middleware (which redirects unauthenticated users to `/login`) still runs after global middleware — this is fine because global guards return early for unauthenticated users.

**Verified:** `wizard-guard.ts` is a named middleware (not global) that runs after `auth` via page-level declaration. The onboarding guard is intentionally global so it applies to all pages without modification.

### Anti-Patterns to Avoid

- **Running async code on server:** Calling `isProfileComplete()` without `if (import.meta.server) return` causes SSR fetch errors because Pinia stores hydrate from localStorage (client-only).
- **Exempting `/onboarding*` from all logic:** If `/onboarding` is in the exempt set, GUARD-02 (complete-profile redirect away from `/onboarding`) can never fire. The exempt set must contain only auth pages (`/login`, `/registro`, `/logout`).
- **Not saving referer before redirect:** If `appStore.setReferer(to.fullPath)` is omitted, the `/onboarding/thankyou` "Volver a Waldo" button always defaults to `/`. Save before `navigateTo`.
- **Calling `meStore.loadMe()` unconditionally:** `isProfileComplete()` already has a cache-check (`if (!me.value) await loadMe()`). Calling `loadMe()` separately in the guard makes an extra API call on every navigation after the first.
- **Using `to.path === "/onboarding"` instead of `startsWith`:** Misses `/onboarding/thankyou`. Use `to.path.startsWith("/onboarding")`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Profile completeness check | Inline field checks in middleware | `useMeStore().isProfileComplete()` | Already checks all 5 fields with null/empty guard; owned by me.store.ts |
| Return URL tracking | Custom cookie or query param | `appStore.setReferer(to.fullPath)` | Already persisted to localStorage; already read by OnboardingThankyou |
| Authenticated user check | Manual JWT inspection | `useStrapiUser()` | `@nuxtjs/strapi` manages the Strapi JWT session token |

**Key insight:** All three supporting concerns (profile check, return URL, auth check) are already solved by existing stores and composables. The guard file itself is purely orchestration — no new logic needs to be invented.

---

## Common Pitfalls

### Pitfall 1: Redirect Loop on `/onboarding`

**What goes wrong:** Incomplete-profile user navigates to `/onboarding`, guard fires, sees incomplete profile, redirects to `/onboarding` again — infinite loop.
**Why it happens:** Not bailing early when `to.path.startsWith('/onboarding')` for incomplete-profile users.
**How to avoid:** Check `if (to.path.startsWith('/onboarding')) return;` before calling `navigateTo('/onboarding')`.
**Warning signs:** Browser console shows "Maximum call stack" or "Too many redirects" error.

### Pitfall 2: SSR Hydration Mismatch

**What goes wrong:** Server renders the requested page; client immediately redirects — causes flash of incorrect content or hydration errors.
**Why it happens:** Running `isProfileComplete()` on the server where localStorage is unavailable, causing Pinia to always see empty state and always redirect.
**How to avoid:** `if (import.meta.server) return;` must be the very first line after the function signature.
**Warning signs:** Console error about hydration mismatch; pages briefly flash before redirect.

### Pitfall 3: Guard Intercepts Login Flow

**What goes wrong:** A newly registered user at `/login` triggers the incomplete-profile guard and gets redirected to `/onboarding` before authentication completes.
**Why it happens:** `/login` not in the exempt set, or exempt check placed after the `useStrapiUser()` check.
**How to avoid:** Exempt set check (`AUTH_EXEMPT_PATHS.has(to.path)`) must come before any other logic, including the `useStrapiUser()` check.
**Warning signs:** Users cannot log in — they are immediately redirected when arriving at `/login`.

### Pitfall 4: stale `me.value` After Profile Save

**What goes wrong:** User completes onboarding, guard runs on the next navigation, sees the old (incomplete) `me.value`, redirects back to `/onboarding` in a loop.
**Why it happens:** `me.store.ts` caches `me.value`; after `FormProfile` saves, the cached value is stale.
**How to avoid:** `FormProfile.vue` calls `useStrapiAuth().fetchUser()` after save (confirmed in existing code via `mockFetchUser`). This updates `useStrapiUser()`. However, `meStore.me` is separate — after profile save, `meStore.reset()` or `meStore.loadMe()` must be called so the cache reflects the new profile. **Verify in Phase 099 output that FormProfile refreshes meStore, or add `meStore.reset()` after successful save in FormProfile.**
**Warning signs:** After completing onboarding, navigating to any page redirects back to `/onboarding`.

### Pitfall 5: `setReferer` Overwrites Useful Referer

**What goes wrong:** User was at `/anuncios/producto-123`, gets redirected to `/onboarding`, completes profile, clicks "Volver a Waldo" — but referer now points to `/onboarding` (the page navigated away from during form submit).
**Why it happens:** `referer.global.ts` also runs on navigation and updates `appStore.referer`. After the guard sets the referer to the original page, subsequent navigations inside `/onboarding` may overwrite it.
**How to avoid:** `referer.global.ts` already excludes certain paths — but `/onboarding` is not in its exclusion list. Phase 101 (INTEG-02) explicitly handles this — the guard must not rely on Phase 101 being done. For Phase 100, the guard sets `appStore.setReferer(to.fullPath)` before redirect. The `referer.global.ts` will then record `/onboarding` as the next referer when navigating within the onboarding flow. This is acceptable for Phase 100 — Phase 101 will exclude `/onboarding` from `referer.global.ts`.
**Warning signs:** "Volver a Waldo" on thankyou page navigates to `/onboarding` instead of the original page.

---

## Code Examples

### Complete `onboarding-guard.global.ts`

```typescript
// apps/website/app/middleware/onboarding-guard.global.ts

/**
 * Onboarding guard — redirects authenticated users with incomplete profiles to /onboarding.
 * Also prevents complete-profile users from accessing /onboarding.
 *
 * Must run client-side only: useMeStore depends on Strapi API calls and Pinia stores
 * that are hydrated from localStorage — unavailable during SSR.
 *
 * Exempt routes: /login, /registro, /logout — auth pages must never trigger this guard.
 * /onboarding* paths are NOT in the exempt set: the reverse guard (GUARD-02) must still fire.
 */

const AUTH_EXEMPT_PATHS = new Set(["/login", "/registro", "/logout"]);

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  // Exempt auth pages immediately — no async work
  if (AUTH_EXEMPT_PATHS.has(to.path)) return;

  // Skip unauthenticated users — auth middleware handles login redirect
  const user = useStrapiUser();
  if (!user.value) return;

  const meStore = useMeStore();
  const profileComplete = await meStore.isProfileComplete();

  if (!profileComplete) {
    // User is already heading to onboarding — allow through to avoid redirect loop
    if (to.path.startsWith("/onboarding")) return;

    // Save return URL before redirecting (consumed by OnboardingThankyou "Volver a Waldo")
    const appStore = useAppStore();
    appStore.setReferer(to.fullPath);
    return navigateTo("/onboarding");
  }

  // GUARD-02: Complete-profile users cannot access /onboarding
  if (to.path.startsWith("/onboarding")) {
    return navigateTo("/");
  }
});
```

### Unit Test Structure for the Guard

```typescript
// apps/website/tests/middleware/onboarding-guard.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

// The nuxt-meta-client-stub Vite plugin replaces import.meta.server with false
// in tests, so the SSR bail-out never fires — all guard logic runs.

const mockNavigateTo = vi.fn();
vi.mock("#app", () => ({
  defineNuxtRouteMiddleware: (fn: unknown) => fn,
  navigateTo: mockNavigateTo,
}));

const mockUser = vi.fn(() => ({ value: { id: 1 } }));
global.useStrapiUser = mockUser;

const mockIsProfileComplete = vi.fn();
global.useMeStore = vi.fn(() => ({ isProfileComplete: mockIsProfileComplete }));

const mockSetReferer = vi.fn();
global.useAppStore = vi.fn(() => ({ setReferer: mockSetReferer }));

import guard from "@/middleware/onboarding-guard.global";

const makeTo = (path: string) => ({ path, fullPath: path });

describe("onboarding-guard.global (GUARD-01..04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser.mockReturnValue({ value: { id: 1 } }); // authenticated
    mockIsProfileComplete.mockResolvedValue(false);   // incomplete by default
  });

  it("allows unauthenticated users through (GUARD-01)", async () => {
    mockUser.mockReturnValue({ value: null });
    await (guard as Function)(makeTo("/anuncios"), {});
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("redirects incomplete-profile user to /onboarding (GUARD-01)", async () => {
    await (guard as Function)(makeTo("/anuncios"), {});
    expect(mockSetReferer).toHaveBeenCalledWith("/anuncios");
    expect(mockNavigateTo).toHaveBeenCalledWith("/onboarding");
  });

  it("does not redirect if already heading to /onboarding (GUARD-01 loop)", async () => {
    await (guard as Function)(makeTo("/onboarding"), {});
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("redirects complete-profile user away from /onboarding (GUARD-02)", async () => {
    mockIsProfileComplete.mockResolvedValue(true);
    await (guard as Function)(makeTo("/onboarding"), {});
    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });

  it("allows complete-profile user on non-onboarding page (GUARD-02)", async () => {
    mockIsProfileComplete.mockResolvedValue(true);
    await (guard as Function)(makeTo("/anuncios"), {});
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("exempts /login from guard (GUARD-04)", async () => {
    await (guard as Function)(makeTo("/login"), {});
    expect(mockIsProfileComplete).not.toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("exempts /registro from guard (GUARD-04)", async () => {
    await (guard as Function)(makeTo("/registro"), {});
    expect(mockIsProfileComplete).not.toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("exempts /logout from guard (GUARD-04)", async () => {
    await (guard as Function)(makeTo("/logout"), {});
    expect(mockIsProfileComplete).not.toHaveBeenCalled();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Named middleware added to each page | Global middleware (`*.global.ts`) | Nuxt 4 | Guard applies to all routes without touching page files |
| `typeof window === "undefined"` SSR check | `import.meta.server` | Nuxt 4 (transformed at build time) | Vite tree-shakes server code out of client bundle; `nuxt-meta-client-stub` handles test compatibility |

**No deprecated patterns in scope for this phase.**

---

## Open Questions

1. **Does `FormProfile.vue` reset `meStore.me` after successful save?**
   - What we know: `FormProfile` calls `useStrapiAuth().fetchUser()` after save. This refreshes `useStrapiUser()`, but `useMeStore().me` is a separate ref populated by `loadMe()`.
   - What's unclear: Whether `meStore.me` becomes stale after profile save, causing the guard to redirect the user back to `/onboarding` on the next navigation.
   - Recommendation: Verify during implementation. If `meStore.me` is stale, add `meStore.reset()` (or `meStore.loadMe()`) inside `FormProfile.vue`'s success handler after `fetchUser()`. This is a one-line fix but must be confirmed.

2. **Should `/onboarding/thankyou` be in the `AUTH_EXEMPT_PATHS` or handled by `startsWith('/onboarding')`?**
   - What we know: `to.path.startsWith('/onboarding')` covers both `/onboarding` and `/onboarding/thankyou`.
   - What's unclear: None — `startsWith` is the correct approach. No separate entry needed.
   - Recommendation: Use `startsWith('/onboarding')` everywhere. No edge case.

3. **Is there a `/logout` page that could be navigated to, or is logout only a button action?**
   - What we know: No `/logout` page file exists. Logout is triggered via button in `MenuUser.vue`, `MobileBar.vue`, `SidebarAccount.vue` — all call `useLogout()` which navigates to `/` via `navigateTo('/')`.
   - What's unclear: Whether `@nuxtjs/strapi` has an internal `/logout` route, or whether any future code might add one.
   - Recommendation: Keep `/logout` in the exempt set as defensive coding per STATE.md guidance ("omitting any causes redirect loops"). It costs nothing and protects against future additions.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (happy-dom environment) |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `cd apps/website && yarn vitest run tests/middleware/onboarding-guard.test.ts` |
| Full suite command | `cd apps/website && yarn vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GUARD-01 | Authenticated + incomplete profile → redirect to `/onboarding` with referer saved | unit | `cd apps/website && yarn vitest run tests/middleware/onboarding-guard.test.ts` | ❌ Wave 0 |
| GUARD-02 | Complete profile + visiting `/onboarding` → redirect to home | unit | same | ❌ Wave 0 |
| GUARD-03 | SSR-safe (server path returns immediately) | unit (import.meta.server = false via stub, server bail verified by absence of store calls) | same | ❌ Wave 0 |
| GUARD-04 | `/login`, `/registro`, `/logout` exempt — no API call, no redirect | unit | same | ❌ Wave 0 |

All four requirements can be covered by a single test file using the stub patterns established in Phase 099 tests.

### Sampling Rate

- **Per task commit:** `cd apps/website && yarn vitest run`
- **Per wave merge:** `cd apps/website && yarn vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/website/tests/middleware/onboarding-guard.test.ts` — covers GUARD-01, GUARD-02, GUARD-03, GUARD-04

Existing test infrastructure (vitest.config.ts, stubs, nuxt-meta-client-stub plugin, happy-dom) is fully sufficient — no new setup needed. The `tests/middleware/` directory does not yet exist but no config changes are required to add it.

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection of `apps/website/app/middleware/wizard-guard.ts` — SSR-safe guard pattern with `import.meta.server`
- Direct code inspection of `apps/website/app/middleware/referer.global.ts` — global middleware pattern, `Set` for exempt paths
- Direct code inspection of `apps/website/app/middleware/auth.ts` — named middleware, `useStrapiUser()` pattern
- Direct code inspection of `apps/website/app/middleware/guest.ts` — reverse guard pattern (`user.value` → redirect)
- Direct code inspection of `apps/website/app/stores/me.store.ts` — `isProfileComplete()` implementation and cache logic
- Direct code inspection of `apps/website/app/stores/app.store.ts` — `setReferer`, `getReferer`, localStorage persistence
- Direct code inspection of `apps/website/app/pages/onboarding/index.vue` — confirms `middleware: "auth"` on onboarding pages
- Direct code inspection of `apps/website/vitest.config.ts` — test infrastructure and `nuxt-meta-client-stub` plugin
- `.planning/STATE.md` — accumulated decisions: SSR-safe guard pattern, exempt routes list, `isProfileComplete` ownership

### Secondary (MEDIUM confidence)

- `.planning/REQUIREMENTS.md` — authoritative requirement definitions for GUARD-01 through GUARD-04

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use in this exact project; no new dependencies
- Architecture: HIGH — patterns derived directly from `wizard-guard.ts` and `referer.global.ts` in the same codebase
- Pitfalls: HIGH — loop prevention and SSR safety derived from reading existing guards and STATE.md decisions
- Validation: HIGH — vitest config and stub patterns verified working in Phase 099

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable — no external library changes expected)
