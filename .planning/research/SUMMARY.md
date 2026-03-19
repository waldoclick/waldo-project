# Project Research Summary

**Project:** User Onboarding Flow — Waldo.click (v1.45)
**Domain:** Forced profile-completion onboarding for a classified ads / marketplace platform
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

This milestone adds a mandatory profile-completion gate to the Waldo website. When a newly registered user navigates anywhere after login, a global Nuxt 4 route middleware intercepts the request, detects that their profile is incomplete, saves the intended URL, and redirects them to a locked `/onboarding` page. The user fills in the required fields via the existing `FormProfile.vue` component, lands on a thank-you page, and is then offered clear next steps (create a listing or return to where they were going). This pattern is industry standard across MercadoLibre, LinkedIn, Airbnb, OLX, and Facebook Marketplace — dedicated URL, minimal layout, no navigation escape, clear CTA after completion.

The recommended implementation requires no new dependencies and no new Strapi content types beyond one boolean field. All capabilities already exist in the codebase: `isProfileComplete()` in `useMeStore`, `appStore.referer` for URL preservation, the `auth` layout for minimal chrome, and the `wizard-guard.ts` pattern for client-only route guards. The scope is 7 new files and 2 surgical modifications. One Strapi schema addition (`onboarding_completed` boolean on User) is needed to avoid retroactively gating pre-existing users with incomplete profiles — a migration seeder must set this flag to `true` for all existing accounts, consistent with the `user-confirmed-migration.ts` precedent from v1.37.

The primary risk is middleware misconfiguration: the onboarding guard must be client-only (Pinia stores are empty on SSR), must carry explicit escape routes for `/onboarding`, `/login`, and `/registro` paths to prevent infinite redirect loops, and must check authentication before checking profile completeness to avoid conflicting with the existing `guard.global.ts`. All three risks are fully mitigated by strictly following the `wizard-guard.ts` precedent already in the codebase.

---

## Key Findings

### Recommended Stack

No new packages are required. The full onboarding flow is buildable from the Nuxt 4 + Pinia + `@nuxtjs/strapi` v2 stack already in place. See `STACK.md` for the complete capability mapping.

**Existing capabilities that cover all needs:**
- `layouts/auth.vue` — logo-only layout with no navigation escape; already correct for onboarding
- `middleware/guard.global.ts` + `wizard-guard.ts` — client-only guard template to copy exactly
- `FormProfile.vue` — full profile form with Yup validation (~740 lines); must be reused, not duplicated
- `appStore.referer` / `setReferer()` / `clearReferer()` — URL preservation already persisted to localStorage
- `useMeStore.isProfileComplete()` — checks 5 fields: `firstname`, `lastname`, `rut`, `phone`, `commune`

**New artifacts required (7 files, 2 modifications):**
- `middleware/onboarding-guard.global.ts` (new)
- `layouts/onboarding.vue` (new — or reuse `auth` layout directly; see Gaps)
- `pages/onboarding/index.vue` (new)
- `pages/onboarding/thankyou.vue` (new)
- `components/OnboardingDefault.vue` (new)
- `components/OnboardingThankyou.vue` (new)
- `scss/_onboarding.scss` (new)
- `components/FormProfile.vue` (modify — add `@success` emit)
- `middleware/referer.global.ts` (modify — exclude `/onboarding` routes)

### Expected Features

**Must have (table stakes):**
- Locked `/onboarding` page with minimal layout — prevents navigation escape; use `layout: "auth"` and `middleware: "auth"`
- `OnboardingDefault` component wrapping `FormProfile.vue` — consistent form fields with no duplication
- Post-submit redirect to `/onboarding/thankyou` — requires `FormProfile.vue` to emit `@success` instead of hardcoding `window.location.href`
- `/onboarding/thankyou` page with "Crear mi primer anuncio" and "Volver a Waldo" CTAs
- `onboarding-guard.global.ts` middleware — client-only, escapes for unauthenticated users and onboarding/login/registro routes
- `onboarding_completed` boolean on Strapi User + migration seeder to set `true` for all pre-existing accounts
- Update `login/google.vue` redirect from `/cuenta/perfil/editar` to `/onboarding`

**Should have (differentiators):**
- Context-aware "Volver a Waldo" routing — returns user to the specific ad or page they were browsing, not just home
- Button label "Guardar y Continuar" instead of "Actualizar" — semantically correct in onboarding context
- Add `/onboarding` to One Tap suppression list in `useGoogleOneTap.ts` and `google-one-tap.client.ts`
- `profile_complete` analytics event on `/onboarding/thankyou` — closes GA4 funnel gap between `sign_up` and first listing step

**Defer (v2+):**
- Progressive profile completion — completeness percentage vs. boolean; requires significant form logic rework
- Multi-step onboarding wizard — `FormProfile.vue` already has good grouped UX; splitting adds complexity without clear payoff
- A/B test forced vs. prompted onboarding — requires feature flag infrastructure not yet in codebase

**Anti-features to avoid:**
- Retroactive gate for existing users — gate only users where `onboarding_completed = false`; set existing users to `true` via migration
- Multi-step wizard splitting `FormProfile.vue` — adds maintenance cost with no UX gain for this form structure
- Onboarding modal/overlay — modals can be dismissed; full-page flow is required for compliance-critical profile data
- Skip/remind-me-later option — business requirement is forced completion; a skip option defeats the purpose
- Server-side `isProfileComplete()` check in middleware — `wizard-guard.ts` pattern exists for a reason; client-only is correct

### Architecture Approach

The onboarding flow slots cleanly into Nuxt 4's existing middleware, layout, and routing systems. Global middleware executes alphabetically, so `onboarding-guard.global.ts` runs after `guard.global.ts` (auth check) and before `referer.global.ts` by design — no ordering changes needed. `FormProfile.vue` is modified minimally: adding an optional `@success` emit that the parent (`OnboardingDefault`) listens to for routing, while the existing `window.location.href` redirect is preserved as a fallback when no listener is present (backward compatible with `AccountEdit.vue`). The Strapi layer requires only a boolean field and a migration seeder.

**Major components and responsibilities:**

1. `onboarding-guard.global.ts` — global interceptor; client-only; checks auth, escape routes, and profile completeness; saves `appStore.referer` before redirect
2. `pages/onboarding/index.vue` — pre-loads regions/communes via `useAsyncData`; renders `OnboardingDefault`; declares `layout: "auth"` and `middleware: "auth"`
3. `components/OnboardingDefault.vue` — BEM block `onboarding onboarding--default`; wraps `FormProfile.vue`; listens to `@success` emit; navigates to `/onboarding/thankyou`
4. `pages/onboarding/thankyou.vue` — reads `appStore.getReferer`; renders `OnboardingThankyou`; clears referer after use
5. `components/OnboardingThankyou.vue` — BEM block `onboarding onboarding--thankyou`; two CTAs: `/anunciar` and `appStore.referer || '/'`
6. `FormProfile.vue` (modified) — adds optional `@success` emit; existing navigation behavior preserved when no listener
7. `middleware/referer.global.ts` (modified) — adds `/onboarding` to excluded referer routes

**Data flow:**
```
Registration → Login → Any page
                         |
              onboarding-guard.global.ts
                         | (profile incomplete)
              appStore.setReferer(currentUrl)
                         |
              /onboarding (OnboardingDefault + FormProfile)
                         | (@success emit)
              /onboarding/thankyou (OnboardingThankyou)
                         |
              "Crear mi primer anuncio" → /anunciar
              "Volver a Waldo" → appStore.referer || /
```

### Critical Pitfalls

1. **SSR-executed middleware reads empty Pinia store** (RISK: HIGH) — `me.store.ts` has no `persist` key; `me` is always `null` on SSR. If the guard runs server-side, every authenticated user gets redirected to `/onboarding` on every page load. Prevention: `if (import.meta.server) return` — identical to `wizard-guard.ts`.

2. **Redirect loop between onboarding and auth middleware** (RISK: HIGH) — without explicit escape routes, the browser throws "too many redirects." Prevention: guard must skip when `!user.value`, when `to.path.startsWith('/onboarding')`, and for `/login` and `/registro` routes.

3. **`FormProfile.vue` hardcoded redirect on submit** (RISK: MEDIUM) — line ~687 hardcodes `window.location.href = '/cuenta/perfil'` and cannot be overridden from a parent. Prevention: add `@success` emit; parent handles navigation; existing `AccountEdit.vue` behavior is unchanged.

4. **`isProfileComplete()` field list may not match the full form** (RISK: MEDIUM) — checks only 5 fields while `FormProfile.vue` Yup schema requires more. Prevention: decide intentionally whether onboarding requires the 5-field minimum or full form alignment; document the decision in code.

5. **Google One Tap overlay appears on `/onboarding` pages** (RISK: LOW) — `/onboarding` is not in `PRIVATE_PREFIXES` in either `useGoogleOneTap.ts` or `google-one-tap.client.ts`. Prevention: add `/onboarding` to both lists.

6. **Pre-onboarding URL lost after One Tap `reloadNuxtApp()`** (RISK: LOW) — `appStore.referer` is persisted to localStorage and survives the reload triggered by One Tap login (v1.44 behavior). The guard must call `appStore.setReferer(to.fullPath)` before redirecting. Prevention: `appStore.referer` persistence already handles this; the guard just needs to set it correctly.

---

## Implications for Roadmap

Based on combined research, the build order follows strict dependency chains. Each phase must complete before the next can be tested end-to-end. The Strapi schema change and `FormProfile.vue` emit refactor are prerequisites for everything else.

### Phase 1: Foundation — Strapi Schema + FormProfile Emit Refactor

**Rationale:** All other phases depend on `FormProfile.vue` emitting `@success` (components cannot be built without it) and on the `onboarding_completed` field existing in Strapi (middleware logic for new-user targeting depends on it). These are the two prerequisites with no UI dependencies.
**Delivers:** Backward-compatible `@success` emit on `FormProfile.vue`; `onboarding_completed` boolean on Strapi User model; migration seeder sets `true` for all pre-existing accounts.
**Addresses:** FEATURES.md table stakes: `FormProfile.vue` refactor, `onboarding_completed` field.
**Avoids:** Pitfall #3 (hardcoded redirect) and the retroactive-gate anti-feature.

### Phase 2: Layout + Components

**Rationale:** Pages import and render components. Components depend on the `@success` emit from Phase 1. SCSS and BEM structure must be in place before pages reference them.
**Delivers:** `layouts/onboarding.vue` (or confirmed reuse of `auth` layout); `OnboardingDefault.vue` and `OnboardingThankyou.vue` with BEM `onboarding--default` / `onboarding--thankyou`; `scss/_onboarding.scss`.
**Implements:** BEM structure per `CLAUDE.md` conventions, layout shell, component wiring to `FormProfile.vue`.
**Uses:** `FormProfile.vue` `@success` emit from Phase 1.

### Phase 3: Pages

**Rationale:** Pages are thin wrappers over components from Phase 2. They define `definePageMeta` (layout, middleware) and pre-load regions/communes via `useAsyncData` following the `cuenta/perfil/editar.vue` pattern exactly.
**Delivers:** `pages/onboarding/index.vue` and `pages/onboarding/thankyou.vue`.
**Implements:** Route definitions, `useAsyncData` data pre-loading, referer read/clear logic on thank-you page.

### Phase 4: Middleware Guard

**Rationale:** The guard can only be tested when the `/onboarding` page exists (Phase 3). Adding it earlier would redirect users to a 404 during development. Phase 4 is also where the most critical pitfalls live — it deserves its own isolated phase.
**Delivers:** `onboarding-guard.global.ts` with client-only guard, full escape route list, `appStore.setReferer()` before redirect.
**Avoids:** Pitfall #1 (SSR empty store), Pitfall #2 (redirect loops).

### Phase 5: Integration Cleanup

**Rationale:** After the core flow works, update existing files that still reference the old incomplete-profile destination. Suppress One Tap on onboarding pages. Update `referer.global.ts` exclusions. These are mechanical changes with no design decisions.
**Delivers:** `login/google.vue` redirect updated to `/onboarding`; `CreateAd.vue` alert link updated; `/onboarding` added to One Tap `PRIVATE_PREFIXES` in both plugin and composable; `/onboarding` exclusion added to `referer.global.ts`; optional `profile_complete` analytics event on thank-you page.
**Avoids:** Pitfall #5 (One Tap on onboarding), Pitfall #6 (referer not preserved after reload).

### Phase Ordering Rationale

- Phase 1 must come first because `FormProfile.vue` is imported by `OnboardingDefault.vue` — the emit refactor must exist before the wrapper component is built.
- Phase 2 before Phase 3 because pages import and render components; building a page that references a non-existent component causes build errors.
- Phase 4 last among core phases because activating the guard before Phase 3 would redirect users to a 404; redirects to a working page can only be tested once the destination exists.
- Phase 5 is independent of Phase 4 and could be done in parallel, but separating it keeps diffs focused on cleanup rather than interleaved with core logic.

### Research Flags

Phases with standard, well-documented patterns (no additional research needed during planning):
- **Phase 2 (Layout + Components):** Nuxt 4 layout and BEM component patterns are well-established in this codebase. `auth.vue` and `FormProfile.vue` are the direct templates.
- **Phase 3 (Pages):** `useAsyncData` + `definePageMeta` pattern is directly documented by `cuenta/perfil/editar.vue` in the same app.
- **Phase 5 (Integration cleanup):** Mechanical find-and-replace updates with no design decisions.

Phases that require a design decision before coding begins:
- **Phase 1 (FormProfile emit):** Choose between `redirectTo` prop vs. `@success` emit. Architecture research recommends `@success` emit (consistent with `FormCreateOne` → `CreateAd` pattern). Confirm before implementation.
- **Phase 1 (Strapi schema strategy):** Decide whether the guard checks `onboarding_completed` directly or updates `isProfileComplete()` to include it. Both are valid; the decision affects Phase 4 implementation. FEATURES.md recommends checking the flag separately in the guard.
- **Phase 4 (Middleware):** The exact escape route list must be agreed before coding — omitting one route (e.g., `/logout`) can cause subtle redirect edge cases.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All findings from direct codebase inspection; no external packages involved; every claimed existing capability was verified in source files |
| Features | HIGH | Codebase analysis of existing components + established marketplace onboarding conventions; feature scope is narrow and unambiguous |
| Architecture | HIGH | Build order and component boundaries verified against live codebase; Nuxt 4 middleware execution order confirmed as alphabetical; existing patterns (`wizard-guard.ts`, `FormCreateOne` emit) are proven templates |
| Pitfalls | HIGH | All pitfalls identified from direct code analysis of `wizard-guard.ts`, `google-one-tap.client.ts`, `referer.global.ts`, and `FormProfile.vue`; no speculative risks |

**Overall confidence:** HIGH

### Gaps to Address

- **`layouts/onboarding.vue` vs. reusing `layout: "auth"`:** Architecture research lists `layouts/onboarding.vue` as a new file, but FEATURES.md notes `layout: "auth"` is already correct for onboarding. If `auth.vue` meets all visual requirements (no header, no footer, no lightboxes), the new layout is unnecessary. Verify against `auth.vue` before creating a duplicate.

- **`isProfileComplete()` field alignment:** The 5-field check (`firstname`, `lastname`, `rut`, `phone`, `commune`) may not match the full set of Yup-required fields in `FormProfile.vue`. Decide intentionally which fields constitute "onboarded" for v1.45 and document in code.

- **Guard check strategy for `onboarding_completed`:** Whether the middleware checks the Strapi flag directly (one boolean, clean) or calls the updated `isProfileComplete()` method (existing abstraction) needs to be decided before Phase 4 coding. Both work; the former is recommended.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `apps/website/app/middleware/wizard-guard.ts`, `guard.global.ts`, `referer.global.ts`, `auth.ts`
- `apps/website/app/components/FormProfile.vue`, `CreateAd.vue`, `login/google.vue`
- `apps/website/app/stores/me.store.ts`, `app.store.ts`
- `apps/website/app/layouts/auth.vue`, `apps/website/app/pages/cuenta/perfil/editar.vue`
- `apps/website/app/plugins/google-one-tap.client.ts`, `composables/useGoogleOneTap.ts`
- `.planning/PROJECT.md` — v1.45 milestone specification

### Secondary (MEDIUM confidence)
- Domain knowledge: classified ads / marketplace onboarding conventions (MercadoLibre, OLX, Airbnb, LinkedIn, Facebook Marketplace) — no web search performed; HIGH confidence given established industry patterns

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
