# Phase 099: Onboarding UI - Research

**Researched:** 2026-03-19
**Domain:** Nuxt 4 layouts, Vue 3 component patterns, profile form refactoring
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAYOUT-01 | `/onboarding` and `/onboarding/thankyou` use a dedicated `onboarding` layout with centered Waldo logo, no header, no footer, no navigation | New `layouts/onboarding.vue` — simpler than `auth.vue` (no `LightboxCookies`/`LightboxAdblock` needed); logo via existing `LogoBlack.vue` component |
| LAYOUT-02 | `OnboardingDefault` component uses BEM classes `onboarding onboarding--default` with logo centered above the form | New component in `app/components/`; SCSS added to `app/scss/components/_onboarding.scss` and imported in `app.scss` |
| LAYOUT-03 | `OnboardingThankyou` component uses BEM classes `onboarding onboarding--thankyou` with thank you message and 2 action buttons | Same SCSS file; uses existing `btn--primary` and `btn--secondary` button classes |
| FORM-01 | `/onboarding` page reuses `FormProfile` for profile completion | Page simply mounts `OnboardingDefault` which embeds `FormProfile`; data loading pattern mirrors `perfil/editar.vue` |
| FORM-02 | `FormProfile` emits a `@success` event (or accepts `redirectTo` prop) so parent controls post-submit navigation | Currently hardcodes `window.location.href = "/cuenta/perfil"` on line 687 — must add `emit('success')` and make redirect conditional |
| FORM-03 | Existing `FormProfile` behavior at `/cuenta/perfil/editar` is unchanged (backward compatible) | `AccountEdit.vue` does not listen to `@success`; existing redirect fires when no listener is attached — backward compatible by default |
| THANK-01 | `/onboarding/thankyou` displays "Muchas gracias por registrarte" with descriptive text | Static content in `OnboardingThankyou.vue` |
| THANK-02 | Primary button "Crear mi primer anuncio" navigates to `/anunciar` | `<NuxtLink to="/anunciar">` with `btn btn--primary` classes |
| THANK-03 | Secondary button "Volver a Waldo" navigates to `appStore.referer`, defaulting to `/` | `useAppStore().getReferer` read in `OnboardingThankyou`; `navigateTo(referer || '/')` |
</phase_requirements>

---

## Summary

Phase 099 delivers the onboarding UI entry point: a stripped-down page at `/onboarding` that renders only the Waldo logo and the existing profile form, plus a `/onboarding/thankyou` confirmation screen with two action buttons. No new API calls or Strapi changes are required — this is a pure frontend UI phase.

The most significant code change is a small refactor of `FormProfile.vue`: the component currently hardcodes `window.location.href = "/cuenta/perfil"` after a successful save. Adding an `emit('success')` event call (executed before the fallback redirect) lets `/onboarding` intercept and redirect to `/onboarding/thankyou` instead, while `perfil/editar.vue` continues to behave exactly as before because its parent `AccountEdit.vue` does not listen for `@success`.

The new `onboarding` layout should be a net-new file (`layouts/onboarding.vue`). The existing `auth.vue` layout adds `LightboxCookies` and `LightboxAdblock` — the STATE.md note about reusing `layout: "auth"` was a hypothesis to verify. Since the onboarding pages must not show any chrome at all, a dedicated layout with only `<slot />` is cleaner and avoids inheriting lightbox side effects. The layout difference is minimal (< 10 lines), so creating it is lower risk than auditing lightbox behavior.

**Primary recommendation:** Create `layouts/onboarding.vue` (slot-only), new components `OnboardingDefault.vue` and `OnboardingThankyou.vue`, add `emit('success')` to `FormProfile.vue` with conditional redirect, and add a new SCSS file `_onboarding.scss` imported in `app.scss`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt 4.1.3 | 4.1.3 | File-based routing, layouts, SSR | Project stack |
| Vue 3 Composition API | — | `<script setup>`, `defineEmits`, `defineProps` | Project standard |
| Pinia | — | `useAppStore` for `referer` state | Already used for referer persistence |
| vee-validate + yup | — | Form validation inside `FormProfile` | Already in `FormProfile.vue` — no change |
| Sass | — | BEM component styles | Project SCSS convention |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@nuxtjs/strapi` | v2 | `useStrapiUser`, `useStrapiAuth` | Already used in `FormProfile.vue`; no new calls needed |
| `NuxtLink` / `navigateTo` | — | Navigation from thankyou buttons | Use `NuxtLink` for static routes, `navigateTo` for programmatic referer redirect |

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
apps/website/app/
├── layouts/
│   └── onboarding.vue              # New: slot-only layout with no header/footer
├── pages/
│   └── onboarding/
│       ├── index.vue               # New: /onboarding — definePageMeta layout: "onboarding", middleware: "auth"
│       └── thankyou.vue            # New: /onboarding/thankyou — definePageMeta layout: "onboarding", middleware: "auth"
├── components/
│   ├── OnboardingDefault.vue       # New: logo + FormProfile wrapper
│   └── OnboardingThankyou.vue      # New: thank you message + 2 buttons
└── scss/components/
    └── _onboarding.scss            # New: BEM styles for onboarding and onboarding--default/thankyou
```

`app.scss` gets one new line: `@use "components/onboarding";`

### Pattern 1: Nuxt Layout (slot-only)

**What:** A layout that renders only `<slot />` — no header, footer, navigation, or lightboxes.
**When to use:** Pages that need a completely blank canvas (onboarding, full-screen forms).

```vue
<!-- layouts/onboarding.vue -->
<template>
  <div class="layout layout--onboarding">
    <slot />
  </div>
</template>
```

No `<script setup>` needed. No lightbox components — the onboarding page is deliberately free of any overlays.

### Pattern 2: Page with layout + middleware via definePageMeta

**What:** Nuxt 4 pattern for declaring layout and auth protection on a page.
**When to use:** Every authenticated page.

```vue
<!-- pages/onboarding/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: "onboarding",
  middleware: "auth",
});
</script>
```

Note: `useAsyncData` must pre-load regions and communes, exactly as `perfil/editar.vue` does (line 18-22 of that file). Use key `'onboarding-regions-communes'` (unique per page rule).

### Pattern 3: FormProfile @success emit (backward-compatible refactor)

**What:** Add `emit('success')` to `FormProfile.vue` so the parent can intercept post-submit navigation.
**When to use:** When the form is embedded in a context that needs to control where the user goes after saving.

Current code in `FormProfile.vue` (line 687):
```javascript
window.location.href = "/cuenta/perfil";
```

Refactored pattern:
```vue
<!-- FormProfile.vue <script setup> — add at top level -->
const emit = defineEmits<{ success: [] }>();

// Inside handleSubmit, after Swal.fire success:
emit("success");
// Fallback redirect only if no parent listened (for backward compat with AccountEdit.vue)
if (!getCurrentInstance()?.vnode.props?.onSuccess) {
  window.location.href = "/cuenta/perfil";
}
```

Simpler alternative (preferred — avoids instance introspection):

```vue
const props = defineProps<{ redirectTo?: string }>();
const emit = defineEmits<{ success: [] }>();

// Inside handleSubmit after Swal:
emit("success");
if (!props.redirectTo) {
  window.location.href = "/cuenta/perfil";
} else {
  navigateTo(props.redirectTo);
}
```

`AccountEdit.vue` continues to use `<FormProfile />` with no props, so the fallback fires and behavior is unchanged. `OnboardingDefault.vue` passes `@success="onSuccess"` to capture the event.

**Recommendation:** Use the `emit` + fallback approach (no `redirectTo` prop) — it is simpler, keeps `FormProfile` as the navigation owner for the existing use case, and the onboarding parent can call `navigateTo('/onboarding/thankyou')` in its `onSuccess` handler.

### Pattern 4: Reading appStore.referer in OnboardingThankyou

**What:** The "Volver a Waldo" button uses the stored referer URL from before onboarding started.
**When to use:** Any component that needs the pre-redirect origin URL.

```vue
<!-- OnboardingThankyou.vue -->
<script setup lang="ts">
const appStore = useAppStore();
const returnUrl = computed(() => appStore.getReferer || "/");
</script>

<template>
  <!-- Primary: go create an ad -->
  <NuxtLink to="/anunciar" class="btn btn--primary btn--block">
    Crear mi primer anuncio
  </NuxtLink>

  <!-- Secondary: go back to where they were -->
  <NuxtLink :to="returnUrl" class="btn btn--secondary btn--block">
    Volver a Waldo
  </NuxtLink>
</template>
```

`appStore.referer` is persisted to localStorage (see `app.store.ts` line 80-83), so it survives page reloads. No new store changes needed.

### Pattern 5: useAsyncData key uniqueness

**What:** Per CLAUDE.md, `useAsyncData` keys must be unique per page.
**When to use:** Every page that calls `useAsyncData`.

```typescript
// pages/onboarding/index.vue
await useAsyncData("onboarding-regions-communes", async () => {
  await regionsStore.loadRegions();
  await communesStore.loadCommunes();
});
```

Key format: `'<page>-<data>'` — matches project convention.

### Anti-Patterns to Avoid

- **Reusing `auth.vue` layout for onboarding:** `auth.vue` imports `LightboxCookies` and `LightboxAdblock`. While harmless, it adds unnecessary overhead and couples onboarding to auth-page chrome that may change. Create a dedicated layout.
- **watch({ immediate: true }) in onboarding page:** CLAUDE.md says this is the loading trigger for dashboard components. Nuxt pages use `useAsyncData`.
- **Pairing `await storeAction()` with `useAsyncData`:** Would cause double-fetch on SSR + hydration. Use `useAsyncData` exclusively.
- **Instance introspection to detect listeners:** Checking `getCurrentInstance()?.vnode.props?.onSuccess` is fragile. Use the emit-with-fallback pattern based on a boolean condition instead.
- **Adding box-shadow or transform: scale:** Per CLAUDE.md — forbidden. Buttons use standard `btn` classes only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | Existing yup schema in `FormProfile.vue` | Already complete — do not duplicate |
| Logo rendering | New SVG inline | `LogoBlack.vue` component | Already exists, uses `NuxtImg` with correct alt/title |
| Region/commune cascading dropdowns | New dropdowns | `FormProfile.vue` (unchanged) | Existing logic handles cascading and pre-loading |
| Post-submit success dialog | Custom modal | Existing `Swal.fire` call in `FormProfile.vue` | SweetAlert2 already integrated via `useSweetAlert2()` |
| Referer tracking | Custom localStorage | `appStore.referer` (already persisted) | Already in `app.store.ts` with `setReferer` / `getReferer` |

---

## Common Pitfalls

### Pitfall 1: Double-fetch on onboarding page

**What goes wrong:** Regions and communes are fetched twice — once on server, once on client.
**Why it happens:** Pairing `await regionsStore.loadRegions()` directly in page setup (outside `useAsyncData`) with `useAsyncData`.
**How to avoid:** Wrap all store preloads inside a single `useAsyncData` call (same as `perfil/editar.vue` lines 18-22).
**Warning signs:** Network tab shows duplicate requests to `/api/regions` and `/api/communes` on navigation.

### Pitfall 2: FormProfile backward compatibility broken

**What goes wrong:** `perfil/editar.vue` (via `AccountEdit.vue`) stops redirecting to `/cuenta/perfil` after save.
**Why it happens:** Removing the `window.location.href` fallback instead of making it conditional.
**How to avoid:** Keep the fallback `window.location.href = "/cuenta/perfil"` when no `@success` handler is present. The emit fires first; only execute the fallback if the parent has not intercepted it.
**Warning signs:** After saving profile at `/cuenta/perfil/editar`, user stays on the form or sees no navigation.

### Pitfall 3: SCSS not loaded

**What goes wrong:** `_onboarding.scss` exists but BEM classes render without styles.
**Why it happens:** Forgetting to add `@use "components/onboarding";` to `app/scss/app.scss`.
**How to avoid:** Add the import line immediately after the last `@use` in `app.scss` (after `@use "components/checkout";`).
**Warning signs:** Onboarding page renders correctly but is unstyled.

### Pitfall 4: BEM namespace collision with auth component

**What goes wrong:** Onboarding styles bleed into auth pages or vice versa.
**Why it happens:** Using `.auth` classes in onboarding components instead of the `.onboarding` BEM block.
**How to avoid:** All onboarding SCSS must live under `.onboarding` block. Never reference `.auth__form` or `.auth__introduce` from onboarding components.

### Pitfall 5: SSR hydration mismatch on referer

**What goes wrong:** `appStore.referer` is `null` on SSR but populated on client (persisted to localStorage).
**Why it happens:** `app.store.ts` uses `persistedState.localStorage` — localStorage is client-only.
**How to avoid:** `OnboardingThankyou.vue` must access `appStore.getReferer` inside `<client-only>` or use `computed` that reads it after hydration. Since the buttons are interactive, they naturally hydrate before the user can click them.

### Pitfall 6: /onboarding/thankyou accessible without auth

**What goes wrong:** Unauthenticated user navigates directly to `/onboarding/thankyou` and sees a broken page.
**Why it happens:** `middleware: "auth"` omitted from `thankyou.vue`.
**How to avoid:** Both `/onboarding/index.vue` and `/onboarding/thankyou.vue` must declare `middleware: "auth"` in `definePageMeta`.

---

## Code Examples

### Layout file

```vue
<!-- apps/website/app/layouts/onboarding.vue -->
<template>
  <div class="layout layout--onboarding">
    <slot />
  </div>
</template>
```

### OnboardingDefault component structure

```vue
<!-- apps/website/app/components/OnboardingDefault.vue -->
<template>
  <div class="onboarding onboarding--default">
    <div class="onboarding--default__logo">
      <LogoBlack />
    </div>
    <div class="onboarding--default__form">
      <FormProfile @success="handleSuccess" />
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ success: [] }>();
const handleSuccess = () => emit("success");
</script>
```

### OnboardingThankyou component structure

```vue
<!-- apps/website/app/components/OnboardingThankyou.vue -->
<template>
  <div class="onboarding onboarding--thankyou">
    <div class="onboarding--thankyou__content">
      <h1 class="onboarding--thankyou__title title">
        Muchas gracias por registrarte
      </h1>
      <p class="onboarding--thankyou__text paragraph">
        Tu perfil está completo. Ya puedes publicar tu primer anuncio en
        Waldo.click® y comenzar a conectar con compradores y vendedores.
      </p>
      <div class="onboarding--thankyou__actions">
        <NuxtLink to="/anunciar" class="btn btn--primary btn--block">
          Crear mi primer anuncio
        </NuxtLink>
        <NuxtLink :to="returnUrl" class="btn btn--secondary btn--block">
          Volver a Waldo
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const appStore = useAppStore();
const returnUrl = computed(() => appStore.getReferer || "/");
</script>
```

### FormProfile emit patch (minimal change)

```javascript
// FormProfile.vue — add at the top of <script setup>:
const emit = defineEmits(["success"]);

// Inside handleSubmit, replace the current line 687:
//   window.location.href = "/cuenta/perfil";
// With:
emit("success");
// Fallback for existing usage (AccountEdit.vue does not listen to @success)
// Use a microtask so Vue can propagate the event before the hard redirect fires
await nextTick();
if (!getCurrentInstance()?.vnode.props?.onSuccess) {
  window.location.href = "/cuenta/perfil";
}
```

Simpler pattern avoiding instance inspection (preferred):

```javascript
// FormProfile.vue — add at top of <script setup>:
const emit = defineEmits(["success"]);
const props = defineProps({ onboardingMode: { type: Boolean, default: false } });

// Inside handleSubmit after Swal.fire success:
emit("success");
if (!props.onboardingMode) {
  window.location.href = "/cuenta/perfil";
}
```

`OnboardingDefault.vue` passes `:onboarding-mode="true"` and handles navigation in its `@success` handler. `AccountEdit.vue` does not pass the prop, so fallback fires as before.

### Onboarding page (index.vue)

```vue
<!-- pages/onboarding/index.vue -->
<template>
  <div class="page">
    <OnboardingDefault @success="navigateTo('/onboarding/thankyou')" />
  </div>
</template>

<script setup lang="ts">
import { useRegionsStore } from "@/stores/regions.store";
import { useCommunesStore } from "@/stores/communes.store";

const regionsStore = useRegionsStore();
const communesStore = useCommunesStore();

await useAsyncData("onboarding-regions-communes", async () => {
  await regionsStore.loadRegions();
  await communesStore.loadCommunes();
});

definePageMeta({
  layout: "onboarding",
  middleware: "auth",
});

useSeoMeta({ robots: "noindex, nofollow" });
</script>
```

### SCSS skeleton

```scss
// apps/website/app/scss/components/_onboarding.scss
@use "../abstracts/mixins" as *;
@use "../abstracts/variables" as *;

.onboarding {
  &--default {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 40px 20px;
    background-color: white;

    &__logo {
      margin-bottom: 40px;
    }

    &__form {
      width: 100%;
      max-width: 700px;
    }
  }

  &--thankyou {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px 20px;
    background-color: white;

    &__content {
      width: 100%;
      max-width: 500px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    &__title {
      text-align: center;
    }

    &__text {
      text-align: center;
    }

    &__actions {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 20px;
    }
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Nuxt 3 `layouts/` at root | Nuxt 4 `app/layouts/` | Nuxt 4 migration (already done) | Layouts live in `apps/website/app/layouts/` |
| Options API `emits: []` | `defineEmits<{ ... }>()` with TypeScript generics | Vue 3 / Nuxt 4 | Use typed emit in any new `.vue` files; `FormProfile.vue` is plain JS so `defineEmits(["success"])` is fine |

**Existing patterns confirmed working:**
- `layout: "auth"` declared in `definePageMeta` — used by `login/index.vue` (confirmed)
- `layout: "account"` — used by `cuenta/perfil/editar.vue` (confirmed)
- `middleware: "auth"` — string form, not array — used by `anunciar/gracias.vue` (confirmed)

---

## Open Questions

1. **Should `OnboardingDefault` emit `success` upward or handle the navigation internally?**
   - What we know: The page (`/onboarding/index.vue`) is the correct owner of routing decisions per Nuxt convention.
   - What's unclear: Whether `FormProfile.vue` or `OnboardingDefault.vue` should call `navigateTo`.
   - Recommendation: `FormProfile` emits `success`; `OnboardingDefault` re-emits it; `onboarding/index.vue` calls `navigateTo('/onboarding/thankyou')`. This keeps routing in the page layer.

2. **Should `appStore.clearReferer()` be called after the user clicks "Volver a Waldo"?**
   - What we know: The referer is persisted to localStorage. If not cleared, the same referer is used the next time the user onboards.
   - What's unclear: Whether this causes any problem in practice (guard is Phase 100 scope).
   - Recommendation: Do not clear in Phase 099 — the guard that sets the referer belongs to Phase 101. Clearing logic can be added when the full guard flow is in place.

3. **What descriptive text should appear below the "Muchas gracias" heading on `OnboardingThankyou`?**
   - What we know: THANK-01 requires descriptive text but does not specify the copy.
   - Recommendation: Use "Tu perfil está completo. Ya puedes publicar tu primer anuncio en Waldo.click® y comenzar a conectar con compradores y vendedores." This matches brand tone from existing UI copy.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (happy-dom environment) |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `cd apps/website && yarn vitest run` |
| Full suite command | `cd apps/website && yarn vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAYOUT-01 | `/onboarding` pages use layout with no header/footer | manual-only | N/A — layout structure verified by visual inspection | N/A |
| LAYOUT-02 | `OnboardingDefault` renders BEM classes `onboarding onboarding--default` | unit | `cd apps/website && yarn vitest run tests/components/OnboardingDefault.test.ts` | ❌ Wave 0 |
| LAYOUT-03 | `OnboardingThankyou` renders BEM classes `onboarding onboarding--thankyou` with 2 buttons | unit | `cd apps/website && yarn vitest run tests/components/OnboardingThankyou.test.ts` | ❌ Wave 0 |
| FORM-01 | `/onboarding` mounts `FormProfile` inside `OnboardingDefault` | unit (covered by LAYOUT-02 test) | same as LAYOUT-02 | ❌ Wave 0 |
| FORM-02 | `FormProfile` emits `success` on save | unit | `cd apps/website && yarn vitest run tests/components/FormProfile.onboarding.test.ts` | ❌ Wave 0 |
| FORM-03 | Existing `AccountEdit` usage unchanged — fallback redirect fires when no `@success` listener | unit | same test file, separate describe block | ❌ Wave 0 |
| THANK-01 | `OnboardingThankyou` renders thank you heading and description text | unit (covered by LAYOUT-03 test) | same as LAYOUT-03 | ❌ Wave 0 |
| THANK-02 | Primary button links to `/anunciar` | unit (covered by LAYOUT-03 test) | same as LAYOUT-03 | ❌ Wave 0 |
| THANK-03 | Secondary button uses `appStore.referer` or `/` as fallback | unit | `cd apps/website && yarn vitest run tests/components/OnboardingThankyou.test.ts` | ❌ Wave 0 |

Note: LAYOUT-01 is manual-only because layout slot rendering requires a real browser or full Nuxt test environment — the vitest happy-dom config does not render layout wrappers.

### Sampling Rate

- **Per task commit:** `cd apps/website && yarn vitest run`
- **Per wave merge:** `cd apps/website && yarn vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/website/tests/components/OnboardingDefault.test.ts` — covers LAYOUT-02, FORM-01
- [ ] `apps/website/tests/components/OnboardingThankyou.test.ts` — covers LAYOUT-03, THANK-01, THANK-02, THANK-03
- [ ] `apps/website/tests/components/FormProfile.onboarding.test.ts` — covers FORM-02, FORM-03

Existing test infrastructure (vitest.config.ts, stubs, happy-dom) is sufficient — no new framework setup needed.

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection of `apps/website/app/components/FormProfile.vue` — current submit handler and redirect behavior
- Direct code inspection of `apps/website/app/layouts/auth.vue` and `account.vue` — layout patterns
- Direct code inspection of `apps/website/app/stores/app.store.ts` — referer persistence
- Direct code inspection of `apps/website/app/middleware/referer.global.ts` — referer tracking excluded routes
- Direct code inspection of `apps/website/app/pages/cuenta/perfil/editar.vue` — data preloading pattern
- Direct code inspection of `apps/website/app/scss/app.scss` — SCSS import order
- Direct code inspection of `apps/website/vitest.config.ts` — test infrastructure

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — accumulated decisions and notes on `layout: "auth"` reuse hypothesis
- `.planning/REQUIREMENTS.md` — authoritative requirement definitions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use in this exact project
- Architecture: HIGH — patterns are directly derived from existing code in the same repo
- Pitfalls: HIGH — derived from reading the actual FormProfile.vue source; backward compat risk is concrete and verifiable
- Validation: HIGH — vitest config exists and is working

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable — no external library changes expected)
