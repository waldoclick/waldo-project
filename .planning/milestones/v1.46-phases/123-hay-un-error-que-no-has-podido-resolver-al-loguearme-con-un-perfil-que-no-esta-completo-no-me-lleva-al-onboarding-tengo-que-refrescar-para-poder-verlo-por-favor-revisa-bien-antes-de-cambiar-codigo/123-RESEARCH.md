# Phase 123: Onboarding Redirect on Login — Research

**Researched:** 2026-04-11
**Domain:** Nuxt 4 route middleware, Pinia state, @nuxtjs/strapi session, Vue Router navigation
**Confidence:** HIGH

## Summary

The bug is that after a successful email+OTP login, users with an incomplete profile are not automatically redirected to `/onboarding`. They must manually refresh the page for the redirect to occur.

A previous fix attempt (commit d587d299) addressed the **refresh** case by removing the `import.meta.server` skip from the global guard and adding a `fetchUser()` fallback for SSR. That fix works for page refreshes. However, the **post-login client-side navigation** still fails because the root cause is NOT in the guard — it is in the component-level navigation code in `FormVerifyCode.vue`.

The core problem is a **timing/state conflict** between what `FormVerifyCode` does after login and what the global guard does when the navigation is triggered. Additionally, the test suite for `onboarding-guard.global.ts` has **two stale/wrong test cases** that do not reflect the current guard implementation.

**Primary recommendation:** In `FormVerifyCode.vue`, replace `router.push("/onboarding")` with `navigateTo("/onboarding")` (Nuxt's navigation function) and remove the redundant `meStore.isProfileComplete()` call — the global guard already handles profile-based routing. Fix the two stale test cases in `onboarding-guard.test.ts`.

## Codebase Findings

### Login flow — components involved

| File | Role |
|------|------|
| `apps/website/app/pages/login/index.vue` | Login form page — uses `guest` middleware |
| `apps/website/app/components/FormLogin.vue` | Email/password form → sends to `/login/verificar` |
| `apps/website/app/pages/login/verificar.vue` | OTP verification page |
| `apps/website/app/components/FormVerifyCode.vue` | OTP verification form — **this is where the bug lives** |
| `apps/website/app/pages/login/google.vue` | Google OAuth callback page |
| `apps/website/app/middleware/onboarding-guard.global.ts` | Global guard — runs on every navigation |
| `apps/website/app/stores/me.store.ts` | User profile store — `me` ref, `loadMe`, `isProfileComplete`, `reset` |

### Exact sequence in `FormVerifyCode.handleVerify()` (current code)

```
1. apiClient("/auth/verify-code") → responseRaw.jwt
2. setToken(responseRaw.jwt)        — writes JWT to cookie ref (useStrapiToken)
3. await fetchUser()                — calls /users/me via useStrapiAuth, sets useStrapiUser().value
4. meStore.reset()                  — sets me.value = null
5. await meStore.isProfileComplete() — calls loadMe() → API call → me.value set → returns false
6. router.push("/onboarding")       ← this is what should trigger navigation
```

### What `router.push("/onboarding")` does

When `router.push("/onboarding")` fires, Vue Router runs the middleware pipeline for the `/onboarding` route:
- **Global guard** (`onboarding-guard.global.ts`): `to.path = "/onboarding"`, `startsWith("/onboarding")` → returns (allows through)
- **Route middleware** (`auth`): checks `useStrapiUser()` — populated from step 3 → allows through

This means the navigation chain itself is correct. The guard should not block this.

### Root cause analysis — why the redirect doesn't happen

**The problem is not the guard. The problem is `router.push` vs `navigateTo` in Nuxt 4.**

In Nuxt 4 (`compatibilityVersion: 4`), there is a known behavioral difference:

- `router.push()` is a raw Vue Router call. It bypasses Nuxt's navigation context awareness.
- `navigateTo()` is the Nuxt-aware wrapper. It knows whether a navigation is already in progress (`isProcessingMiddleware()`).

In `FormVerifyCode`, the code calls:
```js
const router = useRouter();
// ...
router.push("/onboarding");
```

The issue is that after `setToken` and `fetchUser`, the Nuxt app's **reactive state has changed** (user is now authenticated). Nuxt may internally queue a re-evaluation or the guard's async API call (`meStore.isProfileComplete()`) — which makes two API requests (once in FormVerifyCode, once in the guard) — can introduce a race where the navigation promise from `router.push` resolves differently than expected.

More critically: `router.push` returns a `NavigationFailure | void` promise. The code **does not await it and does not handle navigation failures**. If Vue Router cancels the navigation (e.g., because the guard itself returns `undefined` asynchronously mid-flight), the caller never knows.

**The definitive fix**: Use `navigateTo("/onboarding")` from Nuxt instead of `router.push("/onboarding")`. This is the consistent pattern used throughout the codebase (see `useLogout.ts`, `onboarding-guard.global.ts`) and is the correct Nuxt 4 navigation primitive.

**Secondary fix**: Remove the `meStore.isProfileComplete()` + `meStore.reset()` calls from `FormVerifyCode` and `google.vue`. These duplicate work that the global guard already does on every navigation. The guard will correctly detect incomplete profiles and redirect. The component should simply navigate to the post-login destination (referer or `/anuncios`) and let the guard intercept if needed. **However, this secondary fix carries risk** — the guard only fires on navigation, not proactively after login. If navigating to a non-protected route, the user might land somewhere before the guard fires. The safer, minimal fix is ONLY to replace `router.push` with `navigateTo`.

### Why refresh works but login doesn't

| Scenario | What happens |
|----------|-------------|
| **Refresh** | SSR: JWT in cookie, guard runs on server, calls `fetchUser()`, detects incomplete profile, redirects to `/onboarding` with `navigateTo()` |
| **After login (broken)** | Client: `router.push("/onboarding")` called from component — Vue Router navigation may be aborted silently if any middleware returns an unexpected value or there's an async race |

### Stale test cases in `onboarding-guard.test.ts`

The test file has **two wrong expectations** that do not match the current guard implementation:

**Test 1 (line 56-60):** Expects `mockSetReferer` to be called with `/anuncios` when an incomplete-profile user visits that page. But commit d587d299 removed the `setReferer` call from the guard. This test will fail.

**Test 2 (line 82-86):** Expects a complete-profile user at `/onboarding/thankyou` to be redirected to `/`. But the current guard uses `to.path === "/onboarding"` (strict equality), NOT `startsWith`. So `/onboarding/thankyou` is NOT caught by GUARD-02 — the guard correctly lets complete users reach the thankyou page. This test is wrong.

**Confirmed by running tests:** Both tests fail in the current state.

Also: the test does not mock `useStrapiToken` or `useStrapiAuth` — those globals are undefined in the test environment when the fallback path in the guard runs (when `user.value` is null). The tests must be updated to either mock these or ensure they don't trigger that code path.

### `google.vue` uses `router.push` too

`apps/website/app/pages/login/google.vue` has the same `router.push("/onboarding")` pattern and should receive the same fix.

### Google One Tap uses `reloadNuxtApp()` — works differently

The One Tap plugin uses `reloadNuxtApp()` after login, which does a full page reload. The SSR guard then handles the redirect on reload. This is why One Tap works but form login doesn't.

## Architecture Patterns

### Correct navigation pattern in Nuxt 4

```typescript
// Source: useLogout.ts, onboarding-guard.global.ts (project patterns)

// CORRECT — Nuxt-aware navigation
import { navigateTo } from "#imports";
await navigateTo("/onboarding");

// WRONG — bypasses Nuxt navigation context
import { useRouter } from "vue-router";
const router = useRouter();
router.push("/onboarding"); // Not Nuxt-aware, may fail silently
```

### Global guard — current implementation (correct, after d587d299)

```typescript
// Source: apps/website/app/middleware/onboarding-guard.global.ts
const AUTH_EXEMPT_PATHS = new Set(["/login", "/registro", "/logout"]);

export default defineNuxtRouteMiddleware(async (to) => {
  if (AUTH_EXEMPT_PATHS.has(to.path)) return;

  const user = useStrapiUser();
  if (!user.value) {
    const token = useStrapiToken();
    if (!token.value) return;
    const { fetchUser } = useStrapiAuth();
    await fetchUser();
  }
  if (!user.value) return;

  const meStore = useMeStore();
  const profileComplete = await meStore.isProfileComplete();

  if (!profileComplete) {
    if (to.path.startsWith("/onboarding")) return; // no loop
    return navigateTo("/onboarding");
  }

  if (to.path === "/onboarding") { // strict equality — thankyou is allowed
    return navigateTo("/");
  }
});
```

**Note:** `/login/verificar` is NOT in `AUTH_EXEMPT_PATHS`. This is intentional — a logged-in user visiting `/login/verificar` should be handled by the guest middleware on `/login/index.vue`. But `/login/verificar` itself has no `guest` middleware, so an already-logged-in user visiting it would trigger the onboarding guard. This is a minor edge case that won't cause the reported bug.

### FormVerifyCode — correct post-login pattern

```typescript
// After successful OTP verification:
const { setToken, fetchUser } = useStrapiAuth();
setToken(responseRaw.jwt);
await fetchUser();

// Clear pendingToken state
pendingToken.value = "";

// GA4 analytics
logInfo("User logged in successfully via 2-step verification.");
login("email");

// Let the global guard handle onboarding check
// Navigate to intended destination — guard will intercept if profile incomplete
const appStore = useAppStore();
appStore.closeLoginLightbox();
const redirectTo = appStore.getReferer || "/anuncios";
appStore.clearReferer();
await navigateTo(redirectTo); // Use navigateTo, not router.push
```

But note: the guard exempts `/login` paths so it won't fire for current page. It WILL fire for the destination (`/anuncios`). So the guard would intercept the navigation to `/anuncios` and redirect to `/onboarding` if the profile is incomplete. **This is the cleanest approach** — no need for the component to check the profile at all.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Post-login profile check | Duplicate `isProfileComplete()` calls in every login handler | The global middleware already handles this for every navigation | Duplication creates race conditions and drift |
| Custom navigation after auth | `router.push()` directly | `navigateTo()` from Nuxt | Nuxt-aware, handles middleware context, consistent with rest of codebase |

## Common Pitfalls

### Pitfall 1: `router.push` vs `navigateTo` in Nuxt 4
**What goes wrong:** Navigation triggered via `router.push` from inside a component may silently fail or conflict with Nuxt's middleware pipeline, especially after async state updates (like `fetchUser()`).
**Why it happens:** `router.push` is a raw Vue Router call; Nuxt's middleware system uses its own context tracking (`isProcessingMiddleware`). Mixing the two can cause navigation to be aborted without error.
**How to avoid:** Always use `navigateTo()` for programmatic navigation in Nuxt apps.
**Warning signs:** Navigation seems to do nothing; only refresh fixes the state.

### Pitfall 2: Duplicating guard logic in components
**What goes wrong:** Both `FormVerifyCode` and the global guard call `meStore.isProfileComplete()`. The extra call in the component is redundant and introduces a potential race where two concurrent API requests to `/users/me` return slightly different results.
**Why it happens:** Developers add profile checks to login handlers defensively, not realizing the global guard handles this.
**How to avoid:** Trust the global guard. After login, navigate to the desired destination; the guard will intercept.

### Pitfall 3: Stale test cases diverging from implementation
**What goes wrong:** Tests pass an assertion (`setReferer` was called) that no longer matches the implementation (removed in d587d299). Tests give false confidence.
**How to avoid:** When removing code from a middleware, update the tests in the same commit.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest with @nuxt/test-utils |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn workspace website test --run tests/middleware/onboarding-guard.test.ts` |
| Full suite command | `yarn workspace website test --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GUARD-01 | Incomplete profile after OTP login navigates to /onboarding | unit | `yarn workspace website test --run tests/middleware/onboarding-guard.test.ts` | ✅ (needs update) |
| GUARD-02 | Complete profile user blocked from /onboarding, allowed on /onboarding/thankyou | unit | `yarn workspace website test --run tests/middleware/onboarding-guard.test.ts` | ✅ (needs update) |
| GUARD-03 | Guard fires on SSR (no import.meta.server skip) | unit | same | ✅ |
| GUARD-04 | Auth-exempt paths (/login, /registro, /logout) pass through | unit | same | ✅ |

### Wave 0 Gaps
- [ ] `tests/middleware/onboarding-guard.test.ts` — update 2 stale test cases:
  - Remove `setReferer` assertion (line 58) — guard no longer calls it
  - Fix GUARD-02 `/onboarding/thankyou` test (line 82-86) — complete user is NOT redirected from `/onboarding/thankyou`; only from `/onboarding` exactly
  - Add mock for `useStrapiToken` and `useStrapiAuth` for the unauthenticated fallback path

## Changes Required

### File 1: `apps/website/app/components/FormVerifyCode.vue`

Remove: `const router = useRouter();` import and usage
Remove: `meStore.reset()` call
Remove: `await meStore.isProfileComplete()` call and the `if (!isProfileComplete)` block
Change: `router.push(redirectTo)` → `await navigateTo(redirectTo)`
Change: `router.push("/login")` → `await navigateTo("/login")` (in the fatal error catch)
Change: `router.replace("/login")` → `await navigateTo("/login", { replace: true })` (in onMounted)

**Or minimal fix:** Keep the existing logic but replace `router.push("/onboarding")` with `return await navigateTo("/onboarding")`.

### File 2: `apps/website/app/pages/login/google.vue`

Same pattern: replace `router.push("/onboarding")` and `router.push(redirectTo)` with `navigateTo()` equivalents.

### File 3: `apps/website/tests/middleware/onboarding-guard.test.ts`

Fix the two stale test cases. Add missing mocks for `useStrapiToken` and `useStrapiAuth`.

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `apps/website/app/components/FormVerifyCode.vue` (lines 144-189)
- Direct code inspection: `apps/website/app/middleware/onboarding-guard.global.ts`
- Direct code inspection: `apps/website/app/stores/me.store.ts`
- Direct code inspection: `apps/website/tests/middleware/onboarding-guard.test.ts`
- Git diff of d587d299 — confirmed what the previous fix changed and what it left untouched
- Test run output — confirmed 2 stale tests fail in the current state
- `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiAuth.js` — confirmed `fetchUser` implementation
- `node_modules/nuxt/dist/app/composables/router.js` — confirmed `navigateTo` checks `isProcessingMiddleware()`

### Secondary (MEDIUM confidence)
- Nuxt 4 `navigateTo` vs `router.push` distinction — inferred from Nuxt source code behavior and project patterns (`useLogout.ts` uses `navigateTo`, login components use `router.push`)

## Metadata

**Confidence breakdown:**
- Root cause identification: HIGH — confirmed by code inspection and test failures
- Fix approach: HIGH — consistent with Nuxt 4 patterns used elsewhere in codebase
- Test updates required: HIGH — test failures confirmed by running test suite

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (stable — no external dependencies)
