---
quick: 51
type: execute
autonomous: true
files_modified:
  # Dashboard
  - apps/dashboard/app/components/FormVerifyCode.vue
  - apps/dashboard/app/components/AdsTable.vue
  - apps/dashboard/app/components/RegionsDefault.vue
  - apps/dashboard/app/components/ReservationsFree.vue
  - apps/dashboard/app/components/FaqsDefault.vue
  - apps/dashboard/app/components/FeaturedFree.vue
  - apps/dashboard/app/components/CommunesDefault.vue
  - apps/dashboard/app/components/ReservationsUsed.vue
  - apps/dashboard/app/components/LightBoxArticles.vue
  # Website
  - apps/website/app/components/FormVerifyCode.vue
  - apps/website/app/components/HeaderDefault.vue
  - apps/website/app/components/MobileBar.vue
  - apps/website/app/components/LightboxLogin.vue
  - apps/website/app/components/LightboxSearch.vue
  - apps/website/app/components/FilterResults.vue
  - apps/website/app/components/SearchDefault.vue
  - apps/website/app/components/SearchIcon.vue
  - apps/website/app/components/LinkLogin.vue
  - apps/website/app/components/FormProfile.vue
  - apps/website/app/components/CardProfileAd.vue
  - apps/website/app/components/FormContact.vue
---

<objective>
Fix all `getActivePinia() was called but there was no active Pinia` SSR crashes that result from calling `useXxxStore()` at the top level of `<script setup>` in components that render on the server.

Purpose: Pinia 3 (dashboard) throws instead of silently failing when stores are accessed before Pinia is initialized. Every top-level store call in a component that SSR-renders must either be lazy (moved inside a handler/callback) or guarded with `import.meta.client`.

Output: All store calls fixed using one of two safe patterns; zero runtime crashes during SSR; TypeScript compiles clean.
</objective>

<context>
@.planning/STATE.md
@.planning/quick/51-fix-all-getactivepinia-ssr-crashes-acros/51-PLAN.md

Relevant source files listed in `files_modified` above.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix dashboard FormVerifyCode dangling appStore reference</name>
  <files>apps/dashboard/app/components/FormVerifyCode.vue</files>
  <action>
The import and `const appStore = useAppStore()` were already removed from this file in a previous fix, but `appStore.clearReferer()` on line 152 inside `handleVerify()` was left behind as a dangling reference. This is a runtime `ReferenceError` (not an SSR crash, but it breaks the verify flow). Fix it:

1. Add `import { useAppStore } from "@/stores/app.store"` back to the imports block (alongside the existing imports).
2. Inside `handleVerify()`, just before `appStore.clearReferer()` is called, add:
   ```typescript
   const appStore = useAppStore();
   ```
   This lazy-instantiates the store inside the async handler (safe — runs client-side only, never during SSR component setup).
3. Do NOT add `const appStore = useAppStore()` at the top-level of `<script setup>`.
  </action>
  <verify>TypeScript check: `yarn workspace @waldo/dashboard typecheck 2>&1 | grep FormVerifyCode` → no errors. Confirm `appStore` is not declared at setup root.</verify>
  <done>`handleVerify()` calls `appStore.clearReferer()` successfully; store is instantiated lazily inside the function; no top-level store call in `<script setup>`.</done>
</task>

<task type="auto">
  <name>Task 2: Fix dashboard admin components — lazy-init settingsStore, searchStore, articlesStore</name>
  <files>
    apps/dashboard/app/components/AdsTable.vue,
    apps/dashboard/app/components/RegionsDefault.vue,
    apps/dashboard/app/components/ReservationsFree.vue,
    apps/dashboard/app/components/FaqsDefault.vue,
    apps/dashboard/app/components/FeaturedFree.vue,
    apps/dashboard/app/components/CommunesDefault.vue,
    apps/dashboard/app/components/ReservationsUsed.vue,
    apps/dashboard/app/components/LightBoxArticles.vue
  </files>
  <action>
These dashboard admin components call `useSettingsStore()`, `useSearchStore()`, or `useArticlesStore()` at the top level of `<script setup>`. They bind store state directly in the template (`:model-value`, `:current-page`, `v-for`, etc.), so moving the call inside a handler is not possible.

**Fix pattern for template-reactive cases:**

Replace the bare top-level `const settingsStore = useSettingsStore()` with a guarded call:

```typescript
// BEFORE
const settingsStore = useSettingsStore();

// AFTER
const settingsStore = import.meta.client ? useSettingsStore() : ({} as ReturnType<typeof useSettingsStore>);
```

This returns an empty object cast to the store type during SSR (so TypeScript is satisfied and no store is accessed), and the real store on the client. Template bindings will resolve to `undefined` on SSR, which is acceptable — these admin components are always accessed client-side after hydration.

Apply this same pattern to:
- `AdsTable.vue`: `const settingsStore = useSettingsStore()`
- `RegionsDefault.vue`: `const settingsStore = useSettingsStore()`
- `ReservationsFree.vue`: `const settingsStore = useSettingsStore()`
- `FaqsDefault.vue`: `const settingsStore = useSettingsStore()`
- `FeaturedFree.vue`: `const settingsStore = useSettingsStore()`
- `CommunesDefault.vue`: `const settingsStore = useSettingsStore()`
- `ReservationsUsed.vue`: `const settingsStore = useSettingsStore()`
- `LightBoxArticles.vue`: apply to both `const searchStore = useSearchStore()` and `const articlesStore = useArticlesStore()`

**Do NOT** change how the store is used after initialization — only the initialization line changes.

> Note: storeToRefs() calls on guarded stores (if any) must also be guarded: `const { field } = import.meta.client ? storeToRefs(store) : { field: ref(undefined) }`. Check if any of these files use storeToRefs and guard accordingly.
  </action>
  <verify>
    <automated>cd apps/dashboard && yarn nuxi typecheck 2>&1 | grep -E "AdsTable|RegionsDefault|ReservationsFree|FaqsDefault|FeaturedFree|CommunesDefault|ReservationsUsed|LightBoxArticles" | head -20</automated>
  </verify>
  <done>All 8 dashboard admin components have guarded store initialization; no TypeScript errors; no top-level unguarded useXxxStore() calls remain.</done>
</task>

<task type="auto">
  <name>Task 3: Fix website components — lazy-init all top-level store calls</name>
  <files>
    apps/website/app/components/FormVerifyCode.vue,
    apps/website/app/components/HeaderDefault.vue,
    apps/website/app/components/MobileBar.vue,
    apps/website/app/components/LightboxLogin.vue,
    apps/website/app/components/LightboxSearch.vue,
    apps/website/app/components/FilterResults.vue,
    apps/website/app/components/SearchDefault.vue,
    apps/website/app/components/SearchIcon.vue,
    apps/website/app/components/LinkLogin.vue,
    apps/website/app/components/FormProfile.vue,
    apps/website/app/components/CardProfileAd.vue,
    apps/website/app/components/FormContact.vue
  </files>
  <action>
All these website components call `useXxxStore()` at the top level of `<script setup>`. Apply the fix per usage pattern:

---

**Pattern A — Store only used in event handlers / async functions (lazy init):**
Move `const xxxStore = useXxxStore()` inside the function(s) where it's called. Remove the top-level declaration and its import if no longer needed at the top.

- **FormVerifyCode.vue** (`appStore`, `meStore`): both stores are only used inside `handleVerify()` (appStore: `closeLoginLightbox`, `getReferer`, `clearReferer`; meStore: `isProfileComplete`). Move both `const appStore = useAppStore()` and `const meStore = useMeStore()` inside `handleVerify()`. Keep imports at the top of `<script setup>`.
- **SearchIcon.vue** (`appStore`): only used in `handleOpenLightbox()`. Move `const appStore = useAppStore()` inside `handleOpenLightbox()`.
- **LinkLogin.vue** (`appStore`): only used in `handleClick()`. Move `const appStore = useAppStore()` inside `handleClick()`.
- **FormContact.vue** (`appStore`): only used in `handleSubmit()`. Move `const appStore = useAppStore()` inside `handleSubmit()`.
- **CardProfileAd.vue** (`adStore`, `communesStore`, `userStore`): all used in async handlers (not template). Move all three store inits inside their respective handler functions.
- **SearchDefault.vue** (`filterStore`, `appStore`): `filterStore` is used in `useAsyncData` callback AND `handleSubmit`; `appStore` is used only in `handleSubmit`. Move `filterStore` init inside the `useAsyncData` callback AND inside `handleSubmit`. Move `appStore` init inside `handleSubmit` only.

---

**Pattern B — Store used reactively in template (guarded init at setup level):**

```typescript
// BEFORE
const appStore = useAppStore();

// AFTER
const appStore = import.meta.client ? useAppStore() : ({} as ReturnType<typeof useAppStore>);
```

- **HeaderDefault.vue** (`adStore`, `appStore`): `adStore.hasFormInProgress` is inside `<ClientOnly>` (already SSR-safe), but `useAdStore()` at top level still runs on server. Apply guarded init to both `adStore` and `appStore`. `appStore` is used in a `watch(scrollY, ...)` — watches don't run during SSR, so the guarded empty object is safe.
- **MobileBar.vue** (`appStore`): `isMobileMenuOpen` is bound in template via `storeToRefs(appStore)`. Apply guarded init to `appStore`, then guard `storeToRefs` too:
  ```typescript
  const appStore = import.meta.client ? useAppStore() : ({} as ReturnType<typeof useAppStore>);
  const { isMobileMenuOpen } = import.meta.client
    ? storeToRefs(appStore as ReturnType<typeof useAppStore>)
    : { isMobileMenuOpen: ref(false) };
  ```
- **LightboxLogin.vue** (`appStore`): `isLoginLightboxActive` computed from `appStore.isLoginLightboxActive`. Apply guarded init. The computed will return `false` during SSR (lightbox hidden on server — correct).
- **LightboxSearch.vue** (`appStore`): `isSearchLightboxActive` computed from `appStore.isSearchLightboxActive`. Apply guarded init. Same as above.
- **FilterResults.vue** (`filterStore`): `filterStore.filterCommunes` used in `v-for` inside a `v-if="isClient"` guard — already protected from rendering on SSR, but `useFilterStore()` still runs during SSR component setup. Apply guarded init.
- **FormProfile.vue** (`regionsStore`, `communesStore`, `userStore`): `communesStore.communes.data` used in a `computed` that feeds the template. Apply guarded init to all three stores. The computed will return `[]` during SSR (empty list — correct).

---

**Imports:** Keep all `import { useXxxStore }` statements at the top of `<script setup>`. Only the `const xxxStore = useXxxStore()` instantiation lines change.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxi typecheck 2>&1 | grep -E "FormVerifyCode|HeaderDefault|MobileBar|LightboxLogin|LightboxSearch|FilterResults|SearchDefault|SearchIcon|LinkLogin|FormProfile|CardProfileAd|FormContact" | head -30</automated>
  </verify>
  <done>All 12 website components have store calls moved into handlers (Pattern A) or guarded with `import.meta.client` (Pattern B). No top-level unguarded `useXxxStore()` calls remain. TypeScript reports zero errors on listed files.</done>
</task>

</tasks>

<verification>
After all three tasks complete:

1. `yarn workspace @waldo/dashboard nuxi typecheck` — zero errors in all modified components
2. `yarn workspace @waldo/website nuxi typecheck` — zero errors in all modified components
3. No file has an unguarded `useXxxStore()` at the top level of `<script setup>`:
   ```bash
   grep -rn "= use.*Store()" apps/dashboard/app/components/ apps/website/app/components/ --include="*.vue"
   ```
   Every match must be either: inside a function body, inside `onMounted`, inside a `watch` callback, OR on the right side of `import.meta.client ?`.
</verification>

<success_criteria>
- Zero `getActivePinia() was called but there was no active Pinia` errors during SSR
- Dashboard FormVerifyCode `handleVerify()` calls `appStore.clearReferer()` without ReferenceError
- All template-reactive store bindings return safe defaults during SSR (false/undefined/[])
- TypeScript compiles clean across both apps for all modified files
</success_criteria>

<output>
After completion, commit with:
```
git add apps/dashboard/app/components/ apps/website/app/components/
git commit -m "fix(ssr): lazy-init all top-level store calls to prevent getActivePinia crashes"
```

Update `.planning/STATE.md` last_activity line to:
`2026-03-16 — Completed quick task 51: fix all getActivePinia SSR crashes across dashboard and website`
</output>
