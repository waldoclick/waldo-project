---
phase: 29
plan: "01"
subsystem: website/typescript
tags: [typescript, typecheck, type-declarations, nuxt4]
dependency_graph:
  requires: [phase-28]
  provides: [TS-04]
  affects: [apps/website]
tech_stack:
  added: []
  patterns:
    - window.d.ts for global Window interface extension
    - plugins.d.ts for NuxtApp injectable type augmentation
    - StrapiUser module augmentation in strapi.d.ts
    - Non-null assertions for bounds-checked string indexing
    - useAsyncData with typed default option
key_files:
  created:
    - apps/website/app/types/window.d.ts
    - apps/website/app/types/plugins.d.ts
  modified:
    - apps/website/app/types/strapi.d.ts
    - apps/website/app/types/filter.d.ts
    - apps/website/app/types/ad.d.ts
    - apps/website/app/types/category.d.ts
    - apps/website/app/plugins/seo.ts
    - apps/website/app/plugins/microdata.ts
    - apps/website/app/plugins/recaptcha.client.ts
    - apps/website/app/stores/user.store.ts
    - apps/website/app/stores/packs.store.ts
    - apps/website/app/composables/useColor.ts
    - apps/website/app/composables/useRut.ts
    - apps/website/app/pages/index.vue
    - apps/website/app/pages/[slug].vue
    - apps/website/app/pages/anunciar/gracias.vue
    - apps/website/app/pages/anunciar/index.vue
    - apps/website/app/pages/anunciar/resumen.vue
    - apps/website/app/pages/anuncios/[slug].vue
    - apps/website/app/pages/anuncios/index.vue
    - apps/website/app/pages/contacto/gracias.vue
    - apps/website/app/pages/contacto/index.vue
    - apps/website/app/pages/cuenta/avatar.vue
    - apps/website/app/pages/cuenta/cover.vue
    - apps/website/app/pages/cuenta/username.vue
    - apps/website/app/pages/login/facebook.vue
    - apps/website/app/pages/packs/gracias.vue
    - apps/website/app/pages/packs/index.vue
    - apps/website/app/pages/preguntas-frecuentes.vue
    - apps/website/app/components/AccountMain.vue
    - apps/website/app/components/AccountOrders.vue
    - apps/website/app/components/AdArchive.vue
    - apps/website/app/components/CardAnnouncement.vue
    - apps/website/app/components/FormContact.vue
    - apps/website/app/components/FormForgotPassword.vue
    - apps/website/app/components/FormRegister.vue
    - apps/website/app/components/FormResetPassword.vue
    - apps/website/app/components/HeroResults.vue
    - apps/website/app/components/MenuAuth.vue
    - apps/website/app/components/MenuUser.vue
    - apps/website/app/components/MobileBar.vue
    - apps/website/app/components/SearchDefault.vue
    - apps/website/app/components/SidebarAccount.vue
    - apps/website/nuxt.config.ts
    - apps/strapi/types/generated/contentTypes.d.ts
decisions:
  - "window.d.ts consolidates all Window globals (dataLayer, google, googleOneTapInitialized, handleCredentialResponse) in one place — avoids per-file declare global"
  - "plugins.d.ts uses #app NuxtApp augmentation for $cookies, $checkSiteHealth, $recaptcha — standard Nuxt 4 pattern"
  - "StrapiUser augmented in strapi.d.ts — one declaration makes custom fields (firstname, lastname, pro, etc.) available everywhere useStrapiUser() is called without a generic"
  - "Ad.category and Ad.commune widened to union types (number | object) — models populated vs. unpopulated Strapi responses correctly"
  - "createError description -> statusMessage — NuxtError has no description property; statusMessage is the correct H3Error field"
  - "useAsyncData default option used in index.vue — eliminates T | undefined without changing runtime behavior"
  - "Non-null assertions (!) used in useColor.ts and useRut.ts where loop bounds guarantee index validity"
  - "typeCheck: false comment removed — typeCheck: true is now the permanent setting"
metrics:
  duration: "~4 hours"
  completed: "2026-03-07"
  tasks_completed: 26
  files_modified: 43
---

# Phase 29 Plan 01: TypeScript Strict Errors Summary

**One-liner:** Fixed all 183 typecheck errors across 55 files via type declarations and call-site corrections, then enabled `typeCheck: true` in nuxt.config.ts.

## What Was Built

Phase 29 resolved every TypeScript error discovered when running `nuxt typecheck` against the website app, then enabled `typeCheck: true` so all future builds enforce full type checking.

The 183 errors fell into six waves of fixes:

**Wave 1 — Global type declarations (~65 errors)**
- Created `window.d.ts` extending the `Window` interface with `dataLayer`, `google`, `googleOneTapInitialized`, and `handleCredentialResponse` — fixed errors in `gtm.client.ts`, `useAdAnalytics.ts`, `LightboxCookies.vue`, `useGoogleOneTap.ts`
- Created `plugins.d.ts` augmenting the Nuxt `#app` module with `$cookies`, `$checkSiteHealth`, and `$recaptcha` — fixed errors in 5 form components and 3 lightbox components
- Augmented `StrapiUser` in `strapi.d.ts` with all custom fields (`firstname`, `lastname`, `rut`, `phone`, `pro`, `is_company`, `commune`, `avatar`, `cover`, etc.) — fixed errors in `AccountMain.vue` and `cuenta/*.vue` pages
- Added `url?: string` to `$setSEO` type signature in `seo.ts` — fixed excess property errors across ~18 pages
- Added `color?`, `icon?`, `count?` to `FilterCategory` in `filter.d.ts` — fixed errors in `CategoryArchive.vue` and `SearchDefault.vue`

**Wave 2 — API name fixes (~30 errors)**
- Replaced `description:` with `statusMessage:` in all `createError`/`showError` calls — `NuxtError` has no `description` property; `statusMessage` is the correct `H3Error` field
- Fixed `microdata.ts`: changed `children` to `innerHTML` in the `useHead` script object
- Fixed `recaptcha.client.ts`: typed `loadRecaptchaScript` return as `Promise<Window["grecaptcha"]>` to eliminate `Promise<unknown>` inference
- Fixed missing/wrong import paths: added `.vue` extensions in `[slug].vue`, `SidebarAccount.vue`, `preguntas-frecuentes.vue`, `contacto/index.vue`; fixed `@/interfaces/user.interface` → `@/types/user` in `MenuUser.vue`; fixed `@/types/user` → `@/types/ad` in `AdArchive.vue`

**Wave 3 — Small per-file fixes (~25 errors)**
- `useColor.ts`: added non-null assertions (`hex[1]!`, `hex[2]!`, etc.) for all hex character accesses — loop bounds guarantee the indexes exist
- `user.store.ts`: added `as unknown as Record<string, unknown>` cast to the username filter object
- `MenuAuth.vue`: cast `cls` to `Record<string, boolean>` inside the `.filter()` callback
- `MenuUser.vue`, `MobileBar.vue`, `SidebarAccount.vue`: destructured `{ isConfirmed }` from Swal `.then()` callback — eliminates implicit `any` on `result`
- `SearchDefault.vue`: removed explicit type annotation from watch callback — TypeScript infers correctly from the source
- `login/facebook.vue`: cast `route.query.access_token as string`; typed caught error as `unknown` with inline cast
- `FormRegister.vue`: used `token ?? ""` for `recaptchaToken` field — eliminates `string | undefined` assignment
- `useRut.ts`: added non-null assertion `body[i]!` — loop bounds guarantee validity

**Wave 4 — Type definition fixes (~20 errors)**
- `ad.d.ts`: widened `Ad.category` to `number | Category` and `Ad.commune` to `number | { id: number; name: string; region?: ... } | null` — models populated Strapi responses correctly
- `category.d.ts`: added `icon?: { url: string }` field
- `AccountOrders.vue`: added `amount` and `is_invoice` to local `Order` interface; replaced `[key: string]: any` index with `[key: string]: unknown`
- `anuncios/index.vue`: removed conflicting local `interface Category` (shadowed the import); typed `relatedAds` as `Ad[]`; added type narrowing for `ad.commune` union type

**Wave 5 — Complex per-file fixes (~43 errors)**
- `anunciar/gracias.vue`: fixed `prepareSummary` returning `null` → `undefined`; cast `route.query.ad as string`; fixed Date arithmetic with `.getTime()`; added `'error' in data.value` type narrowing
- `packs/gracias.vue`: typed `getPackById` return as `Promise<Pack | undefined>` in `packs.store.ts`; cast `route.query.pack as string`; added `packData` computed for clean template access
- `anuncios/[slug].vue`: cast `ad.currency` for `ConvertParams`; fixed `result.data` array access; guarded `convertedPrice` before `Intl.NumberFormat`
- `pages/index.vue`: added `{ default: () => [] }` to all three `useAsyncData` calls — eliminates `T | undefined` without changing runtime behavior
- `cypress/e2e/register.cy.ts`: optional-chained `interception.response?.body`

**Wave 6 — Enable typeCheck**
- `nuxt.config.ts`: changed `typeCheck: false` to `typeCheck: true`; removed the `// Disabled by default, enable when ready` comment

## Verification

```
nuxt typecheck — 0 errors
typeCheck: true in nuxt.config.ts — confirmed
```

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Consolidate Window globals in `window.d.ts` | TypeScript merges all `declare global` blocks; one file avoids per-file duplication |
| Augment `StrapiUser` instead of adding generics at call sites | One declaration makes all custom fields available everywhere; less invasive than changing every call |
| `Ad.category` and `Ad.commune` as union types | Models reality — Strapi returns IDs when not populated, objects when populated with `populate: "*"` |
| `createError statusMessage` not `description` | `NuxtError` extends `H3Error` — `statusMessage` is the correct field; `description` was always wrong |
| Non-null assertions in `useColor.ts` and `useRut.ts` | Loop bounds guarantee validity; `!` is cleaner than null-coalescing for provably-non-null values |
| `typeCheck: false` → `typeCheck: true` permanently | Every future build now enforces TypeScript — TS-04 goal achieved |

## Deviations from Plan

None — plan executed exactly as written. All 26 tasks in the 6-wave structure were completed as specified.

## Self-Check: PASSED

- `apps/website/app/types/window.d.ts` — created ✓
- `apps/website/app/types/plugins.d.ts` — created ✓
- `apps/website/nuxt.config.ts` has `typeCheck: true` — confirmed ✓
- All modified files present in working tree ✓
