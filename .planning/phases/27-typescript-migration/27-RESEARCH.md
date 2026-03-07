# Phase 27 Research: TypeScript Migration

**Date:** 2026-03-07
**Phase:** 27 — TypeScript Migration
**Requirements:** TS-01, TS-02, TS-03

## Objective

Migrate all 18 website pages from `<script setup>` to `<script setup lang="ts">`, and eliminate
`any` type annotations in the 3 critical stores and 3 critical composables identified in the v1.9
requirements.

Phase 26 is a prerequisite — all pages modified during data-fetching cleanup are now stable, so
adding `lang="ts"` to them is safe.

## Page Audit (TS-01)

### Pages already using lang="ts" (14 — no action needed)

| File | Notes |
|------|-------|
| `anuncios/index.vue` | Already lang="ts" |
| `contacto/index.vue` | Already lang="ts" |
| `cuenta/mis-anuncios.vue` | Already lang="ts" (fixed in Phase 25) |
| `cuenta/mis-ordenes.vue` | Already lang="ts" (fixed in Phase 25) |
| `dev.vue` | Already lang="ts" |
| `index.vue` | Already lang="ts" |
| `login/facebook.vue` | Already lang="ts" |
| `login/google.vue` | Already lang="ts" |
| `login/index.vue` | Already lang="ts" |
| `packs/index.vue` | Already lang="ts" |
| `preguntas-frecuentes.vue` | Already lang="ts" |
| `recuperar-contrasena.vue` | Already lang="ts" |
| `registro.vue` | Already lang="ts" |
| `sitemap.vue` | Already lang="ts" |

### Pages needing migration to lang="ts" (18 — TS-01 scope)

| File | Lines | Complexity | Type annotations needed |
|------|-------|------------|------------------------|
| `[slug].vue` | 189 | Medium | `useAsyncData` return types, `Ad`/`User` types for params |
| `anunciar/error.vue` | 57 | Simple | None (no complex logic) |
| `anunciar/gracias.vue` | 236 | Medium | `handleError` param type, `useAsyncData` return |
| `anunciar/index.vue` | 216 | Medium | Analytics items array type |
| `anunciar/resumen.vue` | 209 | Medium | `prepareSummary` store param type |
| `anuncios/[slug].vue` | 263 | Complex | `Ad` + price data extension type |
| `contacto/gracias.vue` | 53 | Simple | None |
| `cuenta/avatar.vue` | 45 | Simple | None |
| `cuenta/cambiar-contrasena.vue` | 44 | Simple | None |
| `cuenta/cover.vue` | 45 | Simple | None |
| `cuenta/index.vue` | 33 | Simple | None |
| `cuenta/perfil/editar.vue` | 44 | Simple | None |
| `cuenta/perfil/index.vue` | 33 | Simple | None |
| `cuenta/username.vue` | 45 | Simple | None |
| `packs/comprar.vue` | 25 | Simple | None |
| `packs/error.vue` | 46 | Simple | None |
| `packs/gracias.vue` | 121 | Medium | `handleError` param type, `Pack` return type |
| `politicas-de-privacidad.vue` | 33 | Simple | None |

**Simple pages (11):** Just add `lang="ts"` — no code changes needed. TypeScript will infer all
types correctly because these pages have minimal logic, only call auto-typed composables, and use
no untyped function parameters.

**Medium pages (5):** Add `lang="ts"` + add type annotations to function parameters and/or
explicitly type `useAsyncData` return values.

**Complex pages (2):** `[slug].vue` and `anuncios/[slug].vue` — may need to extend existing types
or add inline interfaces for extended data shapes.

## Detailed Page Analysis

### Simple pages — just add lang="ts"

`anunciar/error.vue`, `contacto/gracias.vue`, `cuenta/avatar.vue`, `cuenta/cambiar-contrasena.vue`,
`cuenta/cover.vue`, `cuenta/index.vue`, `cuenta/perfil/editar.vue`, `cuenta/perfil/index.vue`,
`cuenta/username.vue`, `packs/comprar.vue`, `packs/error.vue`, `politicas-de-privacidad.vue`

No type annotations needed — TS can infer everything.

### Medium pages — annotations required

**`anunciar/index.vue`:**
- `onMounted(() => {...})` uses `analyticsItems` array — already typed as inferred object array
- `analyticsItems` can use `AnalyticsItem[]` from `useAdAnalytics` if exported, or inline interface
- Fix: import `AnalyticsItem` from composable or declare inline `interface`

**`anunciar/resumen.vue`:**
- `prepareSummary(store)` — `store` param needs type: use `ReturnType<typeof useAdStore>` or import `AdStore`
- Actually simpler: use the store directly instead of as param (it's always `adStore`)
- Fix: remove the `store` parameter, reference `adStore` directly inside the function body

**`anunciar/gracias.vue`:**
- `handleError(type, updatedAt = null)` — `type` is `'INVALID_URL' | 'EXPIRED' | 'NOT_FOUND'`
- Fix: type as `type: keyof typeof errorMessages` or explicit union

**`packs/gracias.vue`:**
- `handleError(type)` — same pattern, `type: 'INVALID_URL' | 'NOT_FOUND'`
- `formatPrice(price)` — `price: number`

### Complex pages

**`[slug].vue` (user profile page):**
- Uses `useAsyncData` that returns `{ user, ads, pagination }` — needs interface
- `adsData` return shape: define `ProfileData` interface inline or import types

**`anuncios/[slug].vue` (ad detail page):**
- Ad gets extended with `priceData` field not in the `Ad` interface — needs `AdWithPriceData` extension
- `route.params.slug` needs cast to `string` (params can be `string | string[]`)

## Store any Type Audit (TS-02)

### `ad.store.ts` — `view_item_list: [] as any[]`

The `analytics.view_item_list` field is typed as `any[]`. The `AnalyticsItem` interface is already
defined in the same file. Fix: change `[] as any[]` to `[] as AnalyticsItem[]`.

Also: `updateViewItemList(items: any[])` → `updateViewItemList(items: AnalyticsItem[])`.

### `me.store.ts` — `me = ref(null)`

The `me` ref is `ref(null)` with no type argument — TypeScript infers it as `Ref<null>`.
The response from `strapi.find("users/me", ...)` returns a `Strapi5ResponseMany<...>` type.

Fix: import `User` type and type as `ref<User | null>(null)`. The `strapi.find` for `users/me`
actually returns a single user object (not an array), but the Strapi v5 SDK types it as
`Strapi5ResponseMany`. Use `as unknown as User` cast (established Strapi SDK v5 pattern).

### `user.store.ts` — `loadUser(slug: any)`, `updateUserProfile(userId: string, userData: any)`

- `loadUser(slug: any)` → `loadUser(slug: string)` — slug is always a string (URL param)
- `updateUserProfile(userId: string, userData: any)` → userData is an object matching `User` fields
  — use `Partial<User>` or `Record<string, unknown>` (safer, since it includes recaptchaToken)

### `me.store.ts` — `saveUsername(data: any)`

- `saveUsername(data: any)` → `saveUsername(data: { username: string })` — only field used is username

### `ads.store.ts` — `filtersParams: Record<string, any>`

- Already uses `Record<string, any>` which is acceptable as a generic filter container
- But it causes LSP errors because of Strapi SDK strict typing on `filters`
- Fix: `filtersParams: Record<string, unknown>` or keep as-is with explicit cast at call site
- Since `ads.store.ts` already has 6 LSP errors from Strapi SDK type mismatches (TS-02 scope), 
  this will be fixed as part of the store any-elimination work

## Composable any Type Audit (TS-03)

### `useAdAnalytics.ts` — `const eventData: any = {...}`

The `pushEvent` function builds an `eventData` object with `event`, `flow`, and optional `ecommerce`.
Fix: define inline `interface DataLayerEvent` and use it instead of `any`.

### `useAdPaymentSummary.ts` — `const p = selectedPack.value as any`

`selectedPack.value` is already typed as `Pack | null` (from `packsStore.packs.find()`).
The `as any` cast is unnecessary — `p.total_ads` and `p.price` exist on `Pack`.
Fix: remove the `as any` cast, use `selectedPack.value` directly (already non-null at this point
due to the `if (selectedPack.value)` guard).

### `usePackPaymentSummary.ts` — `const pack = selectedPack.value as any`

Same pattern — `selectedPack.value` is `Pack | null`, the `as any` is unnecessary.
Fix: remove `as any`, use `selectedPack.value` directly.

## Fix Strategy

### TS-01: Adding lang="ts" approach

For each page:
1. Change `<script setup>` to `<script setup lang="ts">`
2. Remove redundant `import { ... } from "vue"` for auto-imported composables (Vue 3 auto-imports)
3. Add type annotations only where TypeScript produces errors

**Key patterns to watch for:**
- `route.params.slug` → `route.params.slug as string` (params can be string | string[])
- `route.query.foo` → `route.query.foo as string` or `?.toString()` (query values can be string | string[] | undefined)
- `useAsyncData` return type may need explicit generic: `useAsyncData<SomeType>(...)`
- Function parameters without types → add minimal type annotations

### TS-02: Store any elimination

1. **`ad.store.ts`**: Change `[] as any[]` → `[] as AnalyticsItem[]`, `items: any[]` → `items: AnalyticsItem[]`
2. **`me.store.ts`**: Change `const me = ref(null)` → `const me = ref<User | null>(null)`, import User type; `saveUsername(data: any)` → `saveUsername(data: { username: string })`
3. **`user.store.ts`**: `loadUser(slug: any)` → `loadUser(slug: string)`, `updateUserProfile(userId: string, userData: any)` → `updateUserProfile(userId: string, userData: Record<string, unknown>)`
4. **`ads.store.ts`**: The Strapi SDK type errors here are deeper — the `@/types/strapi.interface` import is missing (`StrapiResponse` type from that file). This will need investigation.

### TS-03: Composable any elimination

1. **`useAdAnalytics.ts`**: `const eventData: any` → define `DataLayerEvent` interface
2. **`useAdPaymentSummary.ts`**: remove `as any` from `selectedPack.value as any`
3. **`usePackPaymentSummary.ts`**: remove `as any` from `selectedPack.value as any`

## Wave Structure Recommendation

Given the mix of trivial (just add lang="ts") and non-trivial work (type annotations + store fixes):

**Wave 1 — Simple page migrations (batch):**
- 12 simple pages: just change `<script setup>` to `<script setup lang="ts">`
- One commit per batch (not per file — too granular)

**Wave 2 — Store and composable any elimination:**
- TS-02: Fix `any` in `ad.store.ts`, `me.store.ts`, `user.store.ts`  
- TS-03: Fix `any` in `useAdAnalytics.ts`, `useAdPaymentSummary.ts`, `usePackPaymentSummary.ts`
- One commit

**Wave 3 — Complex page migrations:**
- `[slug].vue` (user profile) — needs interface
- `anuncios/[slug].vue` (ad detail) — needs type extension
- `anunciar/index.vue` — analytics items type
- `anunciar/resumen.vue` — prepareSummary refactor
- `anunciar/gracias.vue` — handleError type
- `packs/gracias.vue` — handleError + formatPrice types
- One commit

**Verification after each wave:** `nuxt typecheck` to confirm zero new errors.

## Risk Assessment

**Low risk:** Simple pages — adding `lang="ts"` to pages with no untyped code is trivially safe.

**Medium risk:** Store changes — changing `ref(null)` to `ref<User | null>(null)` could affect
consumers of `meStore.me` that assume it can be `null`. All existing code already guards with
`if (!me.value)` patterns.

**Low risk:** Composable `as any` removal — the types are already correct at runtime; removing
`as any` just tells TypeScript what it already knows.

**Note on `ads.store.ts`:** The import `@/types/strapi.interface` that doesn't exist is a separate
pre-existing bug. It either needs the file created or the import changed to `@/types/strapi`. This
is within TS-02 scope since it's the `ads` store, but requires checking what `StrapiResponse` type
is expected there vs. what exists.

## Files to modify per task

**Task 1 (TS-01, Wave 1 — simple pages):**
12 files: anunciar/error.vue, contacto/gracias.vue, cuenta/avatar.vue, cuenta/cambiar-contrasena.vue,
cuenta/cover.vue, cuenta/index.vue, cuenta/perfil/editar.vue, cuenta/perfil/index.vue,
cuenta/username.vue, packs/comprar.vue, packs/error.vue, politicas-de-privacidad.vue

**Task 2 (TS-02 + TS-03 — stores and composables):**
- `apps/website/app/stores/ad.store.ts`
- `apps/website/app/stores/me.store.ts`
- `apps/website/app/stores/user.store.ts`
- `apps/website/app/composables/useAdAnalytics.ts`
- `apps/website/app/composables/useAdPaymentSummary.ts`
- `apps/website/app/composables/usePackPaymentSummary.ts`

**Task 3 (TS-01, Wave 2 — complex/medium pages):**
- `apps/website/app/pages/[slug].vue`
- `apps/website/app/pages/anunciar/index.vue`
- `apps/website/app/pages/anunciar/resumen.vue`
- `apps/website/app/pages/anunciar/gracias.vue`
- `apps/website/app/pages/anuncios/[slug].vue`
- `apps/website/app/pages/packs/gracias.vue`
