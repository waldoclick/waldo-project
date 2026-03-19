# Architecture Research

**Domain:** User Onboarding Flow — Nuxt 4 SSR website
**Researched:** 2026-03-19
**Confidence:** HIGH — all findings from direct codebase inspection

---

## Summary

The onboarding flow integrates with existing Nuxt 4 middleware, layout, and routing systems. 7 new files, 2 modified files. No Strapi changes needed.

---

## New Files (7)

| File | Type | Purpose |
|------|------|---------|
| `middleware/onboarding-guard.global.ts` | Middleware | Global; client-only (`import.meta.server` guard like `wizard-guard.ts`); calls `meStore.isProfileComplete()` async; writes `appStore.setReferer(to.fullPath)` before redirecting to `/onboarding` |
| `layouts/onboarding.vue` | Layout | Minimal shell — Waldo logo centered, no header/footer/lightboxes |
| `pages/onboarding/index.vue` | Page | Sets `layout: 'onboarding'`; pre-loads regions/communes via `useAsyncData` (same pattern as `perfil/editar.vue`) |
| `pages/onboarding/thankyou.vue` | Page | Sets `layout: 'onboarding'`; reads `appStore.getReferer` for "Volver a Waldo" button |
| `components/OnboardingDefault.vue` | Component | BEM: `onboarding onboarding--default`; wraps `FormProfile.vue` and handles `@success` emit |
| `components/OnboardingThankyou.vue` | Component | BEM: `onboarding onboarding--thankyou`; thank you message + 2 buttons |
| `scss/_onboarding.scss` | SCSS | BEM styles for `onboarding--default` and `onboarding--thankyou` |

## Modified Files (2)

| File | Change | Rationale |
|------|--------|-----------|
| `FormProfile.vue` | Add `success` emit; detect if parent listens via `getCurrentInstance()?.vnode.props?.onSuccess`; existing `window.location.href` redirect preserved when no listener | Enables reuse without duplicating 740 lines of validation |
| `middleware/referer.global.ts` | Add `/onboarding` to excluded referer routes | Prevents onboarding pages from being stored as return URLs |

## Unchanged (confirmed)

| File | Why unchanged |
|------|--------------|
| `me.store.ts` | `isProfileComplete()` already exists and checks the right fields |
| `app.store.ts` | `referer` field + `setReferer()`/`clearReferer()` already exist |
| `user.store.ts` | Profile update via `updateUserProfile()` already works |
| `guard.global.ts` | Auth guard runs first (alphabetical); no changes needed |

---

## Middleware Execution Order

Nuxt 4 global middlewares execute alphabetically:

1. `dev.global.ts` — dev mode check
2. `guard.global.ts` — auth check (redirects unauthenticated → login)
3. `onboarding-guard.global.ts` — profile completeness (redirects incomplete → /onboarding)
4. `referer.global.ts` — stores referer URL

This order is correct by design: user must be authenticated before checking profile completeness.

### Onboarding Guard Logic

```
if (import.meta.server) return  // SSR-safe: isProfileComplete() needs user data
if (!user.value) return          // Not logged in → auth guard handles
if (to.path.startsWith('/onboarding')) return  // Already on onboarding
if (to.path is public route) return  // Login, register, etc.
if (await meStore.isProfileComplete()) return  // Profile complete → proceed
appStore.setReferer(to.fullPath)  // Save where they were going
return navigateTo('/onboarding')  // Redirect to onboarding
```

### Reverse Guard (prevent access if profile complete)

```
// Inside onboarding pages
if (import.meta.server) return
if (await meStore.isProfileComplete()) return navigateTo('/')  // Complete → go home
```

---

## Data Flow

```
Registration → Login → Any page
                         ↓
              onboarding-guard.global.ts
                         ↓ (profile incomplete)
              appStore.setReferer(currentUrl)
                         ↓
              /onboarding (OnboardingDefault + FormProfile)
                         ↓ (profile saved successfully)
              /onboarding/thankyou (OnboardingThankyou)
                         ↓
              "Crear mi primer anuncio" → /anunciar
              "Volver a Waldo" → appStore.referer || /
```

---

## Build Order

| Phase | Files | Dependencies |
|-------|-------|-------------|
| 1 | `layouts/onboarding.vue`, `FormProfile.vue` emit, `referer.global.ts` exclusion | None — can be done in parallel |
| 2 | `OnboardingDefault.vue`, `OnboardingThankyou.vue`, `_onboarding.scss` | Depends on layout + FormProfile emit |
| 3 | `pages/onboarding/index.vue`, `pages/onboarding/thankyou.vue` | Depends on components |
| 4 | `onboarding-guard.global.ts` | Depends on pages existing |

---

## Integration Points

### FormProfile Reuse Pattern

`FormProfile.vue` currently hardcodes `window.location.href = '/cuenta/perfil'` on success. The recommended pattern:

- Add optional `@success` emit
- If parent listens → emit event, parent handles navigation
- If no parent listener → existing redirect behavior (backward compatible)
- `OnboardingDefault.vue` listens to `@success` and navigates to `/onboarding/thankyou`

### appStore.referer for Return Navigation

The onboarding guard saves the intended destination URL before redirecting. The thank-you page reads it:
- If `appStore.referer` exists → "Volver a Waldo" navigates there
- If no referer (e.g., direct registration) → fallback to `/` (home)

### Google One Tap Integration

After One Tap login, the user gets authenticated and the page reloads. On reload, `onboarding-guard.global.ts` fires and checks profile completeness. If incomplete → redirected to onboarding. No special One Tap handling needed.

---

*Architecture research for: User Onboarding Flow (website only)*
*Researched: 2026-03-19*
