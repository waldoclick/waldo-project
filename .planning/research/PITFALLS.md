# Domain Pitfalls: User Onboarding Flow on Nuxt 4

**Domain:** Adding forced onboarding to existing SSR Nuxt 4 app with auth middleware, Google One Tap, FormProfile reuse
**Researched:** 2026-03-19
**Sources:** Direct codebase analysis of middleware, stores, components, and plugins

---

## Critical Pitfalls

### 1. SSR-executed middleware reads empty Pinia store

**Risk:** HIGH
**Phase:** Middleware implementation

`useMeStore().me` is always `null` on SSR because `me.store.ts` has no `persist` key and data is loaded asynchronously. If the onboarding middleware runs on server, it will always see an incomplete profile and redirect every authenticated user to `/onboarding`.

**Prevention:**
- Use `if (import.meta.server) return` guard (client-only middleware), consistent with `wizard-guard.ts` pattern
- OR call `await meStore.loadMe()` in the middleware (makes it async-aware but adds latency)
- Client-only guard is simpler and sufficient — auth guard already protects server-side

**Warning signs:** All authenticated users redirected to `/onboarding` on every page load; redirect happens before client hydration.

---

### 2. Redirect loop between onboarding and auth middleware

**Risk:** HIGH
**Phase:** Middleware implementation

`guard.global.ts` redirects unauthenticated users to `/login`. `onboarding-guard.global.ts` redirects incomplete-profile users to `/onboarding`. Without proper escape routes, infinite redirect loops can occur.

**Prevention:** Explicit escape routes list in onboarding guard:
```
/onboarding/**  → already on onboarding, skip
/login/**       → auth flow, skip
/registro/**    → registration flow, skip
/logout         → logout, skip
```

**Decision tree:**
1. Server? → skip (client-only)
2. No user? → skip (auth guard handles)
3. Target is onboarding/login/register? → skip
4. Profile complete? → skip
5. Otherwise → save referer, redirect to /onboarding

**Warning signs:** Browser shows "too many redirects" error; network tab shows 302 ping-pong between `/login` and `/onboarding`.

---

### 3. `FormProfile.vue` hardcoded redirect on submit

**Risk:** MEDIUM
**Phase:** Component reuse

`FormProfile.vue` line ~687 hardcodes `window.location.href = '/cuenta/perfil'` in the submit handler. This cannot be overridden from the parent component.

**Prevention:**
- Add `redirectTo` prop (defaults to `'/cuenta/perfil'`) — simplest approach
- OR emit `@success` event and let parent handle routing — more flexible
- Either way, existing behavior at `/cuenta/perfil/editar` must remain unchanged (backward compatible)

**Warning signs:** After completing onboarding form, user is sent to `/cuenta/perfil` instead of `/onboarding/thankyou`.

---

### 4. `isProfileComplete()` field list may be too lenient

**Risk:** MEDIUM
**Phase:** Guard logic

`me.store.ts` `isProfileComplete()` checks only 5 fields: `firstname, lastname, rut, phone, commune`. But `FormProfile.vue` Yup schema requires additional fields like `birthdate`, `address`, `region`, `is_company`.

**Prevention:**
- Decide intentionally: is onboarding about the **minimum viable profile** (5 fields) or the **full form** (all required fields)?
- If minimum → keep `isProfileComplete()` as-is, but FormProfile will show more fields than needed
- If full → align `isProfileComplete()` with FormProfile Yup required fields
- Document the decision either way

**Warning signs:** Users complete onboarding but profile is still "incomplete" by other measures; or guard lets users through who haven't filled all required fields.

---

### 5. Google One Tap prompts on `/onboarding` pages

**Risk:** LOW
**Phase:** Integration cleanup

`useGoogleOneTap.ts` and `google-one-tap.client.ts` suppress One Tap on private route prefixes (`/cuenta/*`, `/pagar/*`, `/anunciar/*`, `/login/*`). `/onboarding` is not in this list.

**Prevention:**
- Add `/onboarding` to `PRIVATE_PREFIXES` in both `useGoogleOneTap.ts` and `google-one-tap.client.ts`
- One Tap on the onboarding page would be confusing (user is already authenticated)

**Warning signs:** Google One Tap overlay appears on top of the onboarding form.

---

### 6. Pre-onboarding URL lost after One Tap `reloadNuxtApp()`

**Risk:** LOW
**Phase:** Return navigation

Google One Tap login triggers `window.location.reload()` (v1.44). If the user was viewing an ad → One Tap fires → page reloads → onboarding guard redirects to `/onboarding`. The original ad URL must survive this chain.

**Prevention:**
- `appStore.referer` is persisted to localStorage → survives reload
- The onboarding guard must call `appStore.setReferer(to.fullPath)` BEFORE redirecting
- The thank-you page reads `appStore.referer` for "Volver a Waldo"

**Warning signs:** "Volver a Waldo" button always goes to home page instead of the ad they were viewing.

---

## Phase-Specific Pitfall Map

| Phase | Pitfalls to Address |
|-------|-------------------|
| Middleware | #1 (SSR empty store), #2 (redirect loop) |
| FormProfile reuse | #3 (hardcoded redirect) |
| Guard logic | #4 (field list alignment) |
| Pages & components | #5 (One Tap suppression), #6 (referer preservation) |

---

*Pitfalls research for: User Onboarding Flow (website only)*
*Researched: 2026-03-19*
