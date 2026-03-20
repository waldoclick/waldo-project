# Phase 101: Integration - Research

**Researched:** 2026-03-19
**Domain:** Nuxt 4 middleware, Nuxt client plugins, Pinia referer tracking, Google Identity Services (GIS)
**Confidence:** HIGH

## Summary

Phase 101 integrates three behaviorally distinct pieces that were left out of Phases 099–100: suppressing Google One Tap on onboarding pages (INTEG-01), preventing onboarding URLs from being stored as the return destination in `appStore.referer` (INTEG-02), and ensuring the onboarding guard saves the pre-redirect URL before it redirects (INTEG-03).

All three requirements involve files that already exist and are fully understood. INTEG-03 is already implemented — the guard already calls `appStore.setReferer(to.fullPath)` before `navigateTo("/onboarding")`. INTEG-01 and INTEG-02 each require a one-line change in already-existing files (`google-one-tap.client.ts` and `referer.global.ts`). Test files for both the plugin and the guard already exist and already exercise the relevant branches; new test cases must be added to each.

**Primary recommendation:** Make targeted, minimal changes to the three existing files. Do not create new files. Add test cases to the existing test files, not new test files.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INTEG-01 | Google One Tap is suppressed on `/onboarding` pages | `google-one-tap.client.ts` already has a route guard pattern (`/login/` check); extend it to cover `/onboarding` |
| INTEG-02 | `/onboarding` pages excluded from `referer.global.ts` | `referer.global.ts` has an `excludedRefererRoutes` Set and prefix-based guards; add `/onboarding` prefix guard |
| INTEG-03 | Onboarding guard saves pre-redirect URL to `appStore.referer` before redirecting | Already implemented in `onboarding-guard.global.ts` — `appStore.setReferer(to.fullPath)` fires before `navigateTo("/onboarding")` |
</phase_requirements>

## Standard Stack

### Core (already in use — no new dependencies)

| File | Current State | What Changes |
|------|--------------|--------------|
| `app/plugins/google-one-tap.client.ts` | Route guard checks `route.path.startsWith("/login/")` | Add `route.path.startsWith("/onboarding")` to same guard |
| `app/middleware/referer.global.ts` | Excludes `/registro`, `/404`, `/recuperar-contrasena`, `/restablecer-contrasena`, `/cuenta`, `/login` | Add `/onboarding` to prefix exclusions |
| `app/middleware/onboarding-guard.global.ts` | Already calls `appStore.setReferer(to.fullPath)` before redirect | No change needed — INTEG-03 is already satisfied |

**Installation:** None required. No new libraries.

## Architecture Patterns

### Pattern 1: Plugin Route Guard (INTEG-01)

**What:** `google-one-tap.client.ts` already uses `useRoute()` to bail out on certain paths. The existing pattern is a single `if` check that returns early from the plugin.

**When to use:** When One Tap should be silenced for the entire lifetime of that page load.

**Existing code (lines 32–34):**
```typescript
// Route guard — skip on auth pages where One Tap should not appear
const route = useRoute();
if (route.path.startsWith("/login/")) return;
```

**Extension for INTEG-01:**
```typescript
// Route guard — skip on auth pages and onboarding pages where One Tap should not appear
const route = useRoute();
if (route.path.startsWith("/login/") || route.path.startsWith("/onboarding")) return;
```

Note: The plugin is a client plugin that runs once on app load. If the user navigates to `/onboarding` later (via SPA navigation), the plugin has already run and `window.google.accounts.id.prompt()` has already been called or skipped. Because One Tap is initialized once, the suppression only needs to work when the user first lands on `/onboarding`. If users land directly on `/onboarding` (the primary case — the guard redirects them there), the plugin guard fires correctly. SPA navigation to `/onboarding` does not re-run the plugin, so One Tap will not re-prompt mid-session anyway (GIS handles its own session suppression).

Confidence: HIGH — verified by reading the existing plugin source.

### Pattern 2: Referer Middleware Exclusion (INTEG-02)

**What:** `referer.global.ts` uses two mechanisms: a `Set` for exact-match routes and `startsWith()` checks for prefix-based exclusions. Adding `/onboarding` to the prefix guards is consistent with how `/conta` and `/login` are already excluded.

**Existing code:**
```typescript
const excludedRefererRoutes = new Set([
  "/registro",
  "/404",
  "/recuperar-contrasena",
  "/restablecer-contrasena",
]);

export default defineNuxtRouteMiddleware((to, from) => {
  if (
    import.meta.client &&
    !excludedRefererRoutes.has(from.fullPath) &&
    !from.fullPath.startsWith("/cuenta") &&
    !from.fullPath.startsWith("/login")
  ) {
    const appStore = useAppStore();
    appStore.setReferer(from.fullPath);
  }
});
```

**Extension for INTEG-02:**
```typescript
  if (
    import.meta.client &&
    !excludedRefererRoutes.has(from.fullPath) &&
    !from.fullPath.startsWith("/cuenta") &&
    !from.fullPath.startsWith("/login") &&
    !from.fullPath.startsWith("/onboarding")
  ) {
```

This uses `from.fullPath` — the page the user is *leaving*. Excluding `/onboarding` from `from.fullPath` means navigating away from any `/onboarding` page will not overwrite the stored referer with an onboarding URL.

Confidence: HIGH — verified by reading the existing middleware source.

### Pattern 3: Guard Referer Save (INTEG-03 — already done)

**What:** The onboarding guard already saves the pre-redirect URL.

**Existing code (lines 28–35 of `onboarding-guard.global.ts`):**
```typescript
if (!profileComplete) {
  // User is already heading to onboarding — allow through to avoid redirect loop
  if (to.path.startsWith("/onboarding")) return;

  // Save return URL before redirecting (consumed by OnboardingThankyou "Volver a Waldo")
  const appStore = useAppStore();
  appStore.setReferer(to.fullPath);
  return navigateTo("/onboarding");
}
```

INTEG-03 is already implemented. No code change required. A test case verifying this behavior already exists in `onboarding-guard.test.ts` (the test "redirects authenticated incomplete-profile user to /onboarding and saves referer").

Confidence: HIGH — verified by reading the existing middleware source and test file.

### Anti-Patterns to Avoid

- **Adding a new `referer.test.ts` file:** There is no existing test file for `referer.global.ts`. Given the minimal scope of this phase (one extra condition in the middleware), adding a full test file may not be warranted unless the planner judges it necessary for coverage. The guard test already covers the referer-save path for INTEG-03.
- **Using `cancelOnTapOutside` or GIS `cancel` API to suppress One Tap:** The correct approach is not to call `prompt()` at all on the excluded routes. Trying to cancel after prompting introduces timing races.
- **Modifying `onboarding-guard.global.ts` for INTEG-03:** It is already correct. Do not add duplicate `setReferer` calls.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route matching for One Tap suppression | Custom route watcher | `useRoute().path.startsWith(...)` in existing plugin | The plugin already uses this pattern; adding one condition is all that's needed |
| Referer exclusion list | New composable or separate store | Extend existing `startsWith` check in `referer.global.ts` | The middleware already has this exact mechanism |

## Common Pitfalls

### Pitfall 1: One Tap Suppression via SPA Navigation

**What goes wrong:** Developers assume the plugin re-runs on every SPA route change and add reactive watchers.
**Why it happens:** Nuxt client plugins run only once at app initialization, not on each navigation.
**How to avoid:** The route guard in the plugin only needs to cover the case where the user's *first page load* is an onboarding page. For users who are redirected there mid-session, `prompt()` has already been called and GIS manages session-level suppression itself.
**Warning signs:** Adding `watch(route, ...)` inside the plugin — this is unnecessary and would be a new pattern inconsistent with the existing plugin.

### Pitfall 2: Referer Uses `from.fullPath` Not `to.fullPath`

**What goes wrong:** Excluding `/onboarding` from `to.fullPath` instead of `from.fullPath`.
**Why it happens:** Confusing "where the user is going" with "what page we're recording as the last visited page."
**How to avoid:** The middleware stores `from.fullPath` — the page being *left*. Excluding `/onboarding` from `from` means leaving an onboarding page will not overwrite the real referer.

### Pitfall 3: INTEG-03 Double Implementation

**What goes wrong:** Adding a second `setReferer` call in the guard because INTEG-03 was not verified as already complete.
**Why it happens:** Requirements list it as "Pending" but the code already satisfies it.
**How to avoid:** Read `onboarding-guard.global.ts` before writing — the behavior is already implemented and tested.

## Code Examples

### INTEG-01: Updated route guard in `google-one-tap.client.ts`
```typescript
// Source: existing plugin lines 32-34 + INTEG-01 extension
const route = useRoute();
if (route.path.startsWith("/login/") || route.path.startsWith("/onboarding")) return;
```

### INTEG-02: Updated condition in `referer.global.ts`
```typescript
// Source: existing middleware lines 13-20 + INTEG-02 extension
if (
  import.meta.client &&
  !excludedRefererRoutes.has(from.fullPath) &&
  !from.fullPath.startsWith("/cuenta") &&
  !from.fullPath.startsWith("/login") &&
  !from.fullPath.startsWith("/onboarding")
) {
  const appStore = useAppStore();
  appStore.setReferer(from.fullPath);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A — these are new additions | Route guard in plugin | Phase 101 | Onboarding-specific suppression |
| N/A | Prefix guard in referer middleware | Phase 101 | Onboarding URLs do not pollute referer |

**No deprecated patterns involved in this phase.**

## Open Questions

1. **Should `referer.global.ts` gain a Vitest test file?**
   - What we know: No test file exists for `referer.global.ts` currently. INTEG-02 adds one condition.
   - What's unclear: Whether the project treats middleware test coverage as mandatory for all middleware files.
   - Recommendation: Add a minimal `tests/middleware/referer.test.ts` to cover the `/onboarding` exclusion case, consistent with the pattern used for `onboarding-guard.test.ts`. This avoids leaving the new condition untested.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (no `@nuxt/test-utils` — pure unit tests) |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `cd apps/website && yarn vitest run tests/plugins/google-one-tap.test.ts tests/middleware/onboarding-guard.test.ts` |
| Full suite command | `cd apps/website && yarn vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTEG-01 | One Tap does not prompt when route is `/onboarding` | unit | `yarn vitest run tests/plugins/google-one-tap.test.ts` | Exists — add new `it()` case |
| INTEG-01 | One Tap does not prompt when route is `/onboarding/thankyou` | unit | `yarn vitest run tests/plugins/google-one-tap.test.ts` | Exists — add new `it()` case |
| INTEG-02 | `/onboarding` path is NOT saved as referer when leaving | unit | `yarn vitest run tests/middleware/referer.test.ts` | Does NOT exist — Wave 0 gap |
| INTEG-03 | Guard saves `to.fullPath` to `appStore.referer` before redirecting | unit | `yarn vitest run tests/middleware/onboarding-guard.test.ts` | Exists — already tested (line 57–59) |

### Sampling Rate

- **Per task commit:** `cd apps/website && yarn vitest run tests/plugins/google-one-tap.test.ts tests/middleware/onboarding-guard.test.ts`
- **Per wave merge:** `cd apps/website && yarn vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/middleware/referer.test.ts` — covers INTEG-02; does not exist yet, must be created with the new condition test

## Sources

### Primary (HIGH confidence)

- `/home/gabriel/Code/waldo-project/apps/website/app/plugins/google-one-tap.client.ts` — full plugin source read, route guard pattern confirmed
- `/home/gabriel/Code/waldo-project/apps/website/app/middleware/referer.global.ts` — full middleware source read, exclusion mechanism confirmed
- `/home/gabriel/Code/waldo-project/apps/website/app/middleware/onboarding-guard.global.ts` — INTEG-03 already implemented, confirmed
- `/home/gabriel/Code/waldo-project/apps/website/tests/plugins/google-one-tap.test.ts` — existing test structure confirmed, mock pattern understood
- `/home/gabriel/Code/waldo-project/apps/website/tests/middleware/onboarding-guard.test.ts` — existing test structure confirmed, INTEG-03 coverage confirmed
- `/home/gabriel/Code/waldo-project/.planning/REQUIREMENTS.md` — requirement definitions read
- `/home/gabriel/Code/waldo-project/.planning/STATE.md` — accumulated decisions and context read

### Secondary (MEDIUM confidence)

- Google Identity Services (GIS) plugin lifecycle: plugin is client-only, runs once at app init, not per-navigation — inferred from Nuxt plugin documentation behavior and `defineNuxtPlugin` semantics, consistent with the existing plugin design.

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all files read directly from codebase
- Architecture: HIGH — changes are extensions of existing patterns in existing files
- Pitfalls: HIGH — derived from direct inspection of code, not speculation

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable codebase, no fast-moving dependencies)
