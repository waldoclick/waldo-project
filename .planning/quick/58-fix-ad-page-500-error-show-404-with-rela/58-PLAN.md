---
quick: 58
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/pages/anuncios/[slug].vue
  - apps/website/app/scss/components/_page.scss
autonomous: true
requirements: []

must_haves:
  truths:
    - "Visiting a non-public or non-existent ad slug returns a 404 page, not a 500 error"
    - "The 404 page shows a friendly 'Anuncio no encontrado' message with explanation"
    - "Recent/active ads are displayed below the 404 message"
    - "Header and footer render correctly on the not-found state"
  artifacts:
    - path: "apps/website/app/pages/anuncios/[slug].vue"
      provides: "Ad detail page with graceful not-found branch"
      contains: "v-else-if=\"!pending\""
    - path: "apps/website/app/scss/components/_page.scss"
      provides: "page--not-found modifier styles"
      contains: "page--not-found"
  key_links:
    - from: "apps/website/app/pages/anuncios/[slug].vue"
      to: "useAdsStore().loadAds()"
      via: "onMounted or watch in not-found branch"
      pattern: "loadAds"
    - from: "template v-else-if"
      to: "adsStore.ads"
      via: "storeToRefs or direct binding"
      pattern: "ads\\.value|adsStore\\.ads"
---

<objective>
Fix the ad detail page 500 crash when a non-public ad slug is visited. Instead of throwing `createError({ fatal: true })` inside a watcher (which causes the SSR-context crash and `obj.hasOwnProperty is not a function` error), show a graceful 404 state with a friendly message and a list of recent active ads.

Purpose: Users who land on a link to an inactive/private ad get a helpful experience rather than a blank 500 page.
Output: Modified `[slug].vue` with a not-found branch; `_page.scss` with the `page--not-found` modifier.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/website/app/pages/anuncios/[slug].vue
@apps/website/app/scss/components/_page.scss
@apps/website/app/scss/components/_emptystate.scss
@apps/website/app/stores/ads.store.ts

<interfaces>
<!-- Key stores and refs available in [slug].vue -->

From apps/website/app/stores/ads.store.ts:
```typescript
// loadAds with no args fetches active ads (defaults: page 1, size 20)
const loadAds = async (
  filtersParams: Record<string, any> = {},
  paginationParams: { page: number; pageSize: number } = { page: 1, pageSize: 20 },
  sortParams: string[] = [],
): Promise<void>

// State refs
const ads = ref<Ad[]>([]);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
```

Existing imports already in [slug].vue:
- `useAdsStore` from `@/stores/ads.store`
- `useRelatedStore` from `@/stores/related.store`
- `RelatedAds` component from `~/components/RelatedAds.vue`
- `HeaderDefault`, `FooterDefault` components

Current template problem — entire template is wrapped in `v-if="adComputed"`:
```html
<div v-if="adComputed" class="page page--contact">
  <HeaderDefault :show-search="true" />
  ...
  <FooterDefault />
</div>
```
Header and footer are INSIDE the v-if, so when adComputed is null nothing renders.

Current script problem — fatal error thrown from watcher:
```js
watchEffect(() => {
  if (!pending.value && !adData.value) {
    throw createError({ ..., fatal: true });  // ← crashes SSR
  }
});
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Restructure template and remove fatal error watcher</name>
  <files>apps/website/app/pages/anuncios/[slug].vue</files>
  <action>
Restructure the template and script to handle the not-found state gracefully.

**Template changes:**

Unwrap the template so `HeaderDefault` and `FooterDefault` are always rendered at the top level. Replace the single `v-if="adComputed"` root with a top-level `<div>` containing three branches:

```html
<template>
  <div>
    <HeaderDefault :show-search="true" />

    <!-- Ad found -->
    <div v-if="adComputed" class="page page--contact">
      <HeroAnnouncement ... />
      <AdSingle ... />
      <RelatedAds v-if="relatedAds && relatedAds.length > 0" ... />
    </div>

    <!-- Not found -->
    <div v-else-if="!pending" class="page page--not-found">
      <div class="page--not-found__content">
        <h1 class="page--not-found__title">Anuncio no encontrado</h1>
        <p class="page--not-found__description">
          Lo sentimos, el anuncio que buscas no existe o ya no está disponible.
        </p>
        <NuxtLink to="/anuncios" class="button button--primary">
          Ver todos los anuncios
        </NuxtLink>
      </div>

      <RelatedAds
        v-if="recentAds && recentAds.length > 0"
        :ads="recentAds"
        :loading="recentLoading"
        :error="null"
      />
    </div>

    <!-- Loading (pending) — empty slot, SSR renders nothing while hydrating -->

    <FooterDefault />
  </div>
</template>
```

**Script changes:**

1. Remove the entire `watchEffect` block (lines 198–208) that throws `createError({ fatal: true })`.

2. Keep `getErrorMessage()` removed (no longer needed without fatal throw).

3. Add adsStore for recent ads — instantiate it inside `useAsyncData` callback is wrong; instead declare it at setup level alongside existing stores:
```ts
const adsStore = useAdsStore();
```

4. Add a watcher to load recent ads when the not-found state is reached:
```ts
watch(
  () => [pending.value, adData.value] as const,
  ([isPending, data]) => {
    if (!isPending && !data) {
      adsStore.loadAds({}, { page: 1, pageSize: 8 });
    }
  },
  { immediate: true },
);
```

5. Expose reactive refs for the template:
```ts
const { ads: recentAds, loading: recentLoading } = storeToRefs(adsStore);
```

**Note:** Do NOT use `adsStore` inside the existing `useAsyncData` callback — a new top-level instance at setup scope is correct per Nuxt composable rules.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxi typecheck 2>&1 | grep -E "error TS|Found [0-9]+ error" | head -20</automated>
  </verify>
  <done>
  - `watchEffect` with `fatal: true` is gone
  - Template has three branches: ad found / not found (v-else-if="!pending") / loading (implicit)
  - Header and footer are always rendered (outside the v-if branches)
  - `recentAds` loaded via `adsStore.loadAds()` when adData is null and not pending
  - TypeScript typecheck passes with no new errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Add page--not-found SCSS styles</name>
  <files>apps/website/app/scss/components/_page.scss</files>
  <action>
Add the `page--not-found` modifier to the existing `.page` block in `_page.scss`. Follow BEM conventions and use only brand palette colors.

Append inside the `.page { }` block, after the existing `&--provider` modifier:

```scss
&--not-found {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 40px;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    max-width: 560px;
    margin-bottom: 48px;
  }

  &__title {
    font-size: 2rem;
    font-weight: 700;
    color: $charcoal;
    line-height: 1.2;
  }

  &__description {
    font-size: 1rem;
    color: $davys_grey;
    line-height: 1.5;
  }
}
```

The `.button--primary` CTA uses the existing button styles already defined in `_button.scss` — no new button styles needed.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxi typecheck 2>&1 | grep -E "error TS|Found [0-9]+" | head -5 || echo "typecheck ok"</automated>
  </verify>
  <done>
  - `.page--not-found`, `__content`, `__title`, `__description` modifiers exist in `_page.scss`
  - Uses only `$charcoal` and `$davys_grey` from the brand palette
  - No box-shadow or transform:scale added
  - File compiles without SCSS errors
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. Start dev server: `cd apps/website && yarn dev`
2. Visit a slug that doesn't exist or belongs to a non-active ad (e.g. `/anuncios/slug-inexistente`)
3. Expected: Page renders with header, "Anuncio no encontrado" heading, explanation text, CTA button, and recent active ads below
4. Expected: No 500 error, no `obj.hasOwnProperty` error in console
5. Visit a valid active ad slug — confirm normal ad detail page still works
</verification>

<success_criteria>
- Non-existent/non-public ad slug → 404-style page with message + recent ads (no 500 crash)
- Valid active ad slug → normal ad detail page unaffected
- TypeScript typecheck passes
- BEM classes follow project conventions
</success_criteria>

<output>
After completion, create `.planning/quick/58-fix-ad-page-500-error-show-404-with-rela/58-SUMMARY.md`
</output>
