# Feature Research: User Onboarding Flow

**Domain:** Forced profile completion onboarding for a classified ads / marketplace platform
**Researched:** 2026-03-19
**Confidence:** HIGH (sourced from direct codebase analysis + domain knowledge from established classified ads patterns)

---

## Context: What Already Exists

This is a subsequent milestone. These pieces are built and must NOT be re-implemented:

| Existing Piece | Location | How Onboarding Uses It |
|----------------|----------|------------------------|
| `isProfileComplete()` async method | `useMeStore` — checks `firstname`, `lastname`, `rut`, `phone`, `commune` | Middleware calls this to decide whether to gate |
| `FormProfile.vue` | `apps/website/app/components/FormProfile.vue` | Reused as the onboarding form (no modifications needed) |
| Profile edit page with full regions/communes loading | `cuenta/perfil/editar.vue` — `useAsyncData` loads both stores before render | Pattern to copy for `/onboarding` page data loading |
| `auth` middleware | `middleware/auth.ts` — stores `redirect` cookie, sends to `/login` | `/onboarding` must declare `middleware: "auth"` to enforce login |
| `referer.global.ts` middleware | Records `appStore.referer` on every non-auth navigation | Onboarding reads this to know where to send user after completion |
| `appStore.referer` / `clearReferer()` | `app.store.ts` — persisted in localStorage | Used for "Volver a Waldo" post-onboarding routing |
| `layout: "auth"` | `layouts/auth.vue` — logo only, no header/footer, has lightbox slots | The minimal layout required; no new layout needed |
| `wizard-guard.ts` pattern | `middleware/wizard-guard.ts` — `if (import.meta.server) return;` guard, client-only store check | Template for the new onboarding-guard middleware |
| `login/google.vue` incomplete-profile redirect | Redirects to `/cuenta/perfil/editar` when `isProfileComplete()` is false | Pattern to replace: must now redirect to `/onboarding` instead |
| `CreateAd.vue` incomplete-profile alert | Shows `AlertDefault` with link to `/cuenta/perfil/editar` | Must be updated to point to `/onboarding` |
| `FormVerifyCode.vue` post-action routing | Calls `isProfileComplete()` post-login, routes accordingly | Reference pattern; Google One Tap callback follows same logic |

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that must exist for the onboarding flow to be coherent. Missing any of these makes the feature feel broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Locked `/onboarding` page with minimal layout | Marketplace standard: new users cannot access core features until profile is complete. Prevents "ghost" accounts with no contact info. | LOW | Use existing `layout: "auth"` — already has logo-only UI. Declare `middleware: "auth"` to prevent unauthenticated access. |
| `OnboardingDefault` component wrapping `FormProfile` | Users expect the same form fields they'd see in profile edit. Rebuilding form fields creates inconsistency and doubles maintenance. | LOW | Wrap existing `FormProfile.vue` inside a new BEM block `onboarding onboarding--default`. Do NOT modify `FormProfile.vue` internals. |
| Post-submit redirect to `/onboarding/thankyou` | Completing a major action (profile) needs a distinct confirmation state, not a silent redirect. Standard in onboarding flows (LinkedIn, MercadoLibre, etc.). | LOW | `FormProfile.vue`'s `handleSubmit` currently navigates to `/cuenta/perfil`. In onboarding context it must navigate to `/onboarding/thankyou` instead. Needs a prop or emit. |
| `/onboarding/thankyou` page with "Crear mi primer anuncio" CTA | First-time users expect a clear next step. MercadoLibre, Facebook Marketplace, OLX all funnel new users directly to listing creation after registration. | LOW | Two buttons: `navigateTo('/anunciar')` and `navigateTo(appStore.getReferer || '/')` with `clearReferer()` after. |
| Middleware to block incomplete-profile users from the platform | Without this, the locked layout is decorative — users can navigate away via URL bar. Standard in marketplace onboarding (e.g., Airbnb host registration, MercadoLibre vendor setup). | MEDIUM | New `onboarding-guard.global.ts` middleware — runs client-only (localStorage stores). Must check `isProfileComplete()` and redirect to `/onboarding` if false. Must not redirect users who are already on `/onboarding` or `/onboarding/thankyou` (infinite loop prevention). Must not run for unauthenticated users (let `auth` middleware handle those). |
| Escape prevention from `/onboarding` | Minimal layout must not contain navigation links that let users exit onboarding. The entire interaction is "fill this form, continue." | LOW | `layout: "auth"` has no navigation — this is already handled. Verify no back button or links to `/` are rendered by the layout. |
| Pre-onboarding URL storage | "Volver a Waldo" button needs to know where the user was going. Without this, users who registered mid-browse lose their context (e.g., they were looking at a specific ad). | LOW | `appStore.referer` already exists and is set by `referer.global.ts`. Onboarding guard stores the current `to.fullPath` before redirecting to `/onboarding`. Pattern already used in `auth.ts` middleware via `redirect` cookie. |

### Differentiators (Competitive Advantage)

Features beyond the minimum that improve the onboarding experience for this platform.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Context-aware "Volver a Waldo" routing | After onboarding, user lands where they were going — not at `/`. Most classified platforms just redirect to home, losing the ad the user was browsing. | LOW | Read `appStore.getReferer` on `/onboarding/thankyou`, show it as the secondary button destination. Clear after use. |
| Onboarding triggered only for new registrations, not returning users | Users who registered before this milestone exists (with incomplete profiles) should NOT be force-gated. This is a policy call that affects trust — blindly gating all users with incomplete profiles is disruptive. | MEDIUM | Requires a strategy: either (a) only trigger if user was created after a certain date, or (b) trigger based on a `onboarding_completed` flag in Strapi user schema. Option (b) is correct and clean. Adds one boolean field to User. |
| Same-page validation before redirect | If the onboarding middleware gates too eagerly (e.g., on first page load before auth hydrates), it creates a flash of redirect. | LOW | Client-only guard (`if (import.meta.server) return`) is already the established pattern from `wizard-guard.ts`. Must be replicated exactly. |
| `OnboardingDefault` submit button labeled "Guardar y Continuar" not "Actualizar" | Form semantics differ: in profile edit, the user is updating. In onboarding, they are completing a required step. Label must reflect the intent. | LOW | Prop on `FormProfile.vue` for button label, or override via slot. Or a simpler `isOnboarding` prop that changes the button text and post-submit navigation target. |
| Analytics: `sign_up` event already fires on registration; profile completion should fire a distinct event | Post-onboarding, marketplaces typically fire a `complete_registration` or `profile_complete` event for funnel tracking. GA4 already has custom events. | LOW | Fire `pushEvent('profile_complete', ...)` from `onboarding/thankyou.vue` `onMounted`. Uses existing `useAdAnalytics` or a new minimal `pushEvent` call. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Interrupting existing logged-in users (retroactive gate) | "All incomplete profiles should be forced through onboarding" sounds correct at policy level | Existing users with incomplete profiles registered before this feature. Gating them silently without communication feels like a bug, not a feature. Creates support tickets and churn. | Gate only users where `onboarding_completed = false` on the User record. Set `onboarding_completed = true` for all pre-existing users via a migration seeder (same pattern as `user-confirmed-migration.ts` in v1.37). |
| Multi-step onboarding wizard (split form into steps) | Step-by-step flows feel lighter and less overwhelming for long forms | `FormProfile.vue` is already a single-page form with grouped sections (Datos Personales, Datos de Empresa). Splitting it requires significant form logic refactoring. The existing form already has good UX with section labels. | Keep single-page form. The complexity is in the middleware and routing, not in the form UI. |
| Onboarding modal/overlay instead of dedicated page | Modals are "lighter" — user stays on the page they were browsing | Modals cannot be forced with a route guard. User can close them. For compliance-critical profile data (RUT, legal contact info), a modal is insufficient. Airbnb/Mercadolibre use full-page flows for required onboarding. | Dedicated `/onboarding` page with locked layout. Full-page commitment matches the seriousness of the requirement. |
| Skip/remind-me-later option | Users hate being blocked | This platform requires RUT for legal ad posting compliance. The product decision (from PROJECT.md: v1.45 goal) is forced completion. A skip option defeats the entire purpose of the feature. | None — this is a business requirement. Document it in the implementation as intentional. |
| Storing the pre-onboarding URL in a Pinia store field dedicated to onboarding | Clean separation of concerns | `appStore.referer` already exists, is persisted, and is already used for post-login redirects. A second storage mechanism creates inconsistency. | Use `appStore.referer` — it is already the canonical URL-storage mechanism in this codebase. The onboarding guard sets it before redirecting, same as `auth.ts` middleware does. |
| Server-side `isProfileComplete()` check in middleware | Sounds more robust | `isProfileComplete()` in `useMeStore` uses `useApiClient` which requires Pinia to be active. Pinia stores that use `localStorage` are empty on SSR. `wizard-guard.ts` already established the correct pattern: `if (import.meta.server) return;`. | Client-only guard. The SSR render shows the page briefly before the guard fires — this is acceptable and matches the existing wizard flow behavior. |

---

## Feature Dependencies

```
[onboarding-guard.global.ts middleware]
    └──requires──> [useStrapiUser()] — check if logged in before checking profile
    └──requires──> [useMeStore.isProfileComplete()] — async call to /users/me
    └──requires──> [appStore.setReferer(to.fullPath)] — store URL before redirect
    └──requires──> [client-only execution] — if (import.meta.server) return;
    └──conflicts──> [/onboarding route itself] — must not redirect when already on /onboarding

[/onboarding page]
    └──requires──> [middleware: "auth"] — must be logged in
    └──requires──> [layout: "auth"] — logo-only, no navigation escape
    └──requires──> [OnboardingDefault component]
                       └──requires──> [FormProfile.vue] — reused as-is
                       └──requires──> [useRegionsStore + useCommunesStore pre-loaded] — via useAsyncData in page
                       └──requires──> [isOnboarding prop or emit] — to change submit destination

[/onboarding/thankyou page]
    └──requires──> [middleware: "auth"] — must be logged in
    └──requires──> [layout: "auth"] — same minimal layout
    └──requires──> [appStore.getReferer] — for "Volver a Waldo" button
    └──requires──> [appStore.clearReferer()] — after reading, clean up

[login/google.vue incomplete-profile redirect]
    └──conflicts──> [new onboarding-guard] — currently redirects to /cuenta/perfil/editar
    └──must change to──> [/onboarding] — so new users enter the onboarding flow

[CreateAd.vue AlertDefault]
    └──conflicts──> [new onboarding-guard] — currently shows alert with link to /cuenta/perfil/editar
    └──note──> [onboarding-guard will intercept before CreateAd renders] — AlertDefault may be redundant

[onboarding_completed boolean on User schema (Strapi)]
    └──requires──> [migration seeder] — sets onboarding_completed = true for all pre-existing users
    └──enhances──> [onboarding-guard] — allows targeting only genuinely new accounts
    └──enhances──> [/onboarding/thankyou] — sets onboarding_completed = true via API call on load
```

### Dependency Notes

- **`onboarding-guard` must check `user` first, then `isProfileComplete()`:** Unauthenticated users must not reach the `isProfileComplete()` call (which would trigger `/users/me` for an anonymous user). The guard returns early if no user, letting `auth` middleware handle the redirect to `/login`.
- **`isProfileComplete()` is async:** The middleware must `await` it. Nuxt route middleware supports async handlers. This adds a brief async pause before navigation — consistent with how `login/google.vue` already handles it.
- **`FormProfile.vue` submit currently navigates to `/cuenta/perfil`:** This hardcoded destination must be parameterized. Best approach: emit a `@submitted` event and let the parent (`OnboardingDefault` or `AccountEdit`) handle the navigation. This is the same pattern as `FormCreateOne` emitting `@form-submitted` in the wizard.
- **`appStore.referer` is already set by `referer.global.ts`** before the `onboarding-guard` fires. The guard does not need to set it — it just reads it on the thankyou page. However, `referer.global.ts` excludes `/cuenta` routes; ensure `/onboarding` is also excluded from being saved as a referer.

---

## MVP Definition

### Launch With (v1.45 — this milestone)

- [ ] **`onboarding-guard.global.ts` middleware** — client-only, checks `isProfileComplete()`, redirects to `/onboarding` for logged-in users with incomplete profiles
- [ ] **`/onboarding` page** — `layout: "auth"`, `middleware: "auth"`, pre-loads regions/communes, renders `OnboardingDefault`
- [ ] **`OnboardingDefault.vue` component** — wraps `FormProfile.vue`, changes submit destination to `/onboarding/thankyou`, button label "Guardar y Continuar"
- [ ] **`/onboarding/thankyou` page** — `layout: "auth"`, "Crear mi primer anuncio" + "Volver a Waldo" buttons, clears `appStore.referer` after use
- [ ] **`FormProfile.vue` refactor** — extract submit navigation into an emit or a prop, so parent controls destination (non-breaking: `AccountEdit.vue` continues to work unchanged)
- [ ] **Update `login/google.vue`** — change incomplete-profile redirect from `/cuenta/perfil/editar` to `/onboarding`
- [ ] **`onboarding_completed` field on Strapi User schema** — boolean, default `false` for new users; migration seeder sets `true` for all pre-existing accounts
- [ ] **`isProfileComplete()` updated to check `onboarding_completed`** — or middleware checks it separately to avoid gating returning users

### Add After Validation (v1.x)

- [ ] **Update `CreateAd.vue` `AlertDefault`** — with onboarding-guard in place, the alert may still fire for edge cases; update link to `/onboarding` for consistency
- [ ] **Analytics: `profile_complete` event on `/onboarding/thankyou`** — low effort, closes GA4 funnel gap between `sign_up` and first `step_view`

### Future Consideration (v2+)

- [ ] **Progressive profile completion** — allow partial fills and prompt at contextually relevant moments (e.g., before posting an ad). Requires rethinking `isProfileComplete()` to return a "completeness percentage" rather than a boolean.
- [ ] **Onboarding A/B test** — test forced vs. prompted onboarding for conversion impact. Requires feature flag infrastructure not present in codebase.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| `onboarding-guard.global.ts` | HIGH | MEDIUM | P1 |
| `/onboarding` page + `OnboardingDefault` | HIGH | LOW | P1 |
| `/onboarding/thankyou` page | HIGH | LOW | P1 |
| `FormProfile.vue` emit refactor | HIGH | LOW | P1 |
| `onboarding_completed` Strapi field + migration | HIGH | LOW | P1 |
| Update `login/google.vue` redirect | MEDIUM | LOW | P1 |
| Update `CreateAd.vue` alert link | LOW | LOW | P2 |
| `profile_complete` analytics event | LOW | LOW | P2 |
| Progressive profile completion | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for this milestone (v1.45)
- P2: Should have, add once P1 is working
- P3: Future consideration only

---

## Existing Pattern Analysis

The codebase has established several patterns this milestone must follow consistently:

### Middleware Pattern (from `wizard-guard.ts`)

```typescript
// Client-only guard pattern — mandatory for localStorage-backed stores
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const user = useStrapiUser();
  if (!user.value) return; // let auth middleware handle unauthenticated users

  // Guard must not redirect when already on onboarding routes (infinite loop prevention)
  if (to.path.startsWith('/onboarding')) return;

  const meStore = useMeStore();
  const complete = await meStore.isProfileComplete();
  if (!complete) {
    return navigateTo('/onboarding');
  }
});
```

### Page Pattern (from `cuenta/perfil/editar.vue`)

```typescript
// Pre-load regions/communes via useAsyncData before FormProfile renders
await useAsyncData('onboarding-regions-communes', async () => {
  await regionsStore.loadRegions();
  await communesStore.loadCommunes();
});

definePageMeta({
  layout: 'auth',      // logo only, no navigation
  middleware: 'auth',  // must be logged in
});
```

### Post-Submit Navigation Pattern (from `FormCreateOne.vue` → `CreateAd.vue`)

```
FormProfile emits @submitted
  └──> OnboardingDefault handles @submitted
           └──> navigateTo('/onboarding/thankyou')

AccountEdit handles @submitted (existing behavior, unchanged)
           └──> window.location.href = '/cuenta/perfil'
```

### Referer Pattern (from `login/google.vue`)

```typescript
// On /onboarding/thankyou
const redirectTo = appStore.getReferer || '/';
appStore.clearReferer();
navigateTo(redirectTo);
```

---

## Competitor Reference: Onboarding in Classified Platforms

(Based on domain knowledge — no web search available)

- **MercadoLibre:** Forces profile completion (name, phone, ID) before first listing. Dedicated full-page flow with minimal header. After completion, returns user to the listing they were creating.
- **OLX:** Required profile fields shown inline on first ad creation attempt; blocks submission until complete. Less explicit about routing but same net behavior.
- **Airbnb (host onboarding):** Dedicated multi-step onboarding flow with its own URL space (`/become-a-host`). Separate from profile edit. Thank-you/confirmation step with clear CTA to dashboard.
- **LinkedIn:** Forces profile minimum (name, headline) before allowing any other actions. Minimal layout, no navigation escape. "Skip" options deliberately hidden until minimum is reached.
- **Facebook Marketplace:** Requires phone verification before listing. Interstitial page, full-screen, no escape. Returns to listing after verification.

**Common pattern across all:** Dedicated URL, minimal layout, no navigation escape, clear CTA after completion. Waldo v1.45 specification maps directly to this established pattern.

---

## Sources

- Direct codebase analysis: `apps/website/app/middleware/wizard-guard.ts`, `auth.ts`, `referer.global.ts`
- Direct codebase analysis: `apps/website/app/components/FormProfile.vue`, `CreateAd.vue`, `login/google.vue`
- Direct codebase analysis: `apps/website/app/stores/me.store.ts`, `app.store.ts`
- Direct codebase analysis: `apps/website/app/layouts/auth.vue`, `apps/website/app/pages/cuenta/perfil/editar.vue`
- `.planning/PROJECT.md` — v1.45 milestone specification
- Domain knowledge: classified ads / marketplace onboarding conventions (HIGH confidence — established industry patterns)

---
*Feature research for: User Onboarding Flow — Waldo.click classified ads platform (v1.45)*
*Researched: 2026-03-19*
