# Stack Research

**Domain:** User Onboarding Flow for Nuxt 4 website
**Researched:** 2026-03-19
**Confidence:** HIGH — all findings from direct codebase inspection

---

## Summary

No new packages required. The entire onboarding flow is buildable from existing Nuxt 4 + Pinia + `@nuxtjs/strapi` v2 capabilities already in the codebase.

---

## Recommended Stack

### No New Dependencies Needed

| Capability | Existing Solution | Status |
|-----------|-------------------|--------|
| Layout system | Nuxt 4 `layouts/` directory | 4 layouts exist (`default`, `account`, `auth`, `about`) |
| Route middleware | Nuxt 4 `middleware/` directory | `guard.global.ts`, `wizard-guard.ts` patterns established |
| Profile form | `FormProfile.vue` (~740 lines) | Full validation, all fields, Yup schema |
| Profile completeness check | `isProfileComplete()` in `me.store.ts` | Checks: firstname, lastname, rut, phone, commune |
| URL preservation | `appStore.referer` in `app.store.ts` | Already persisted to localStorage with `setReferer()`/`clearReferer()` |
| SSR-safe auth | `useStrapiUser()` + `useStrapiAuth()` | Available on both server and client |

---

## Key Technical Findings

1. **`appStore.referer` already solves "Volver a Waldo" URL storage.** No new store needed. The field exists, is persisted to localStorage, and has `setReferer()` / `clearReferer()` actions.

2. **SSR middleware safety:** Unlike `wizard-guard.ts` (client-only because `adStore` uses localStorage persist), the onboarding guard needs careful handling. `me.store.ts` has no `persist:` key, but `isProfileComplete()` is async and calls the API — may need client-only guard or sync user field check.

3. **`FormProfile.vue` is reusable with one prop addition.** Adding `redirectTo?: string` (default `/cuenta/perfil`) avoids duplicating ~740 lines of validation logic.

4. **`window.location.href` for post-submit is correct.** Consistent with the v1.44 rationale: full reload ensures `meStore.me` reflects the saved profile without manual store invalidation.

---

## New Artifacts Needed

| Type | File | Description |
|------|------|-------------|
| Layout | `layouts/onboarding.vue` | Logo + slot, no header/footer/lightboxes |
| Middleware | `middleware/onboarding-guard.ts` or `.global.ts` | Redirects incomplete-profile users to `/onboarding` |
| Page | `pages/onboarding/index.vue` | Main onboarding page |
| Page | `pages/onboarding/thankyou.vue` | Post-completion thank you page |
| Component | `components/OnboardingDefault.vue` | Logo + FormProfile wrapper with BEM `onboarding onboarding--default` |
| SCSS | `scss/_onboarding.scss` | BEM styles for `onboarding--default` and `onboarding--thankyou` |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| New npm packages | All capabilities exist in current stack | Existing Nuxt 4 features |
| New Strapi content types | Profile fields already exist on User | `isProfileComplete()` checks existing fields |
| New stores | `meStore` + `appStore` cover all state needs | Existing stores |
| New composables | `isProfileComplete()` is sufficient | Existing method in `me.store.ts` |
| `onboarding_completed` flag on User | Adds Strapi schema complexity; `isProfileComplete()` is the source of truth | Profile field checks directly |

---

## Integration Points

### Middleware ordering with `guard.global.ts`
The existing guard checks auth and redirects unauthenticated users. The onboarding guard must run AFTER auth guard (user must be authenticated first, then checked for profile completeness).

### `FormProfile.vue` reuse
Currently hardcodes `window.location.href = '/cuenta/perfil'` on success. Options:
- Add `redirectTo` prop (simplest)
- Emit `@submitted` event and let parent handle routing (more flexible)

### `appStore.referer` for return navigation
The onboarding middleware should save the current URL to `appStore.referer` before redirecting. The thank-you page "Volver a Waldo" button reads `appStore.referer` and navigates there.

---

*Stack research for: User Onboarding Flow (website only)*
*Researched: 2026-03-19*
