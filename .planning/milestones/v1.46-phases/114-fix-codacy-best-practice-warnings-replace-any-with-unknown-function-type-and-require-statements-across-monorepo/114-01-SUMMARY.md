---
phase: 114-fix-codacy-best-practice-warnings
plan: 01
subsystem: ui
tags: [typescript, codacy, any, unknown, vue, nuxt]

# Dependency graph
requires: []
provides:
  - Zero any type annotations in website app source files (components, composables, plugins, pages, server)
  - DOMPurify declared on Window interface in window.d.ts
affects: [114-02, 114-03, 114-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "catch (error: unknown) with instanceof Error narrowing for safe error handling"
    - "Record<string, unknown> for vee-validate form handler values with property casts"
    - "import type { Component } from 'vue' for icon props instead of any"
    - "Window interface extension for DOMPurify (window.d.ts) to eliminate window as any casts"

key-files:
  created: []
  modified:
    - apps/website/app/components/FormForgotPassword.vue
    - apps/website/app/components/FormResetPassword.vue
    - apps/website/app/components/FormContact.vue
    - apps/website/app/components/FormPassword.vue
    - apps/website/app/components/FormRegister.vue
    - apps/website/app/components/CardHighlight.vue
    - apps/website/app/components/CardShortcut.vue
    - apps/website/app/components/AccountOrders.vue
    - apps/website/app/components/AccountAnnouncements.vue
    - apps/website/app/components/CardProfileAd.vue
    - apps/website/app/composables/useSanitize.ts
    - apps/website/app/composables/useIcons.ts
    - apps/website/app/plugins/site-health.client.ts
    - apps/website/app/plugins/gtm.client.ts
    - apps/website/app/plugins/dompurify.client.ts
    - apps/website/app/types/user.d.ts
    - apps/website/app/types/window.d.ts
    - apps/website/app/pages/login/google.vue
    - apps/website/app/pages/login/facebook.vue
    - apps/website/app/pages/cuenta/mis-anuncios.vue
    - apps/website/app/pages/anuncios/[slug].vue
    - apps/website/nuxt.config.ts
    - apps/website/server/api/dev-login.post.ts

key-decisions:
  - "Added DOMPurify to Window interface in window.d.ts instead of using (window as any).DOMPurify — enables direct window.DOMPurify usage without any casts"
  - "Used Record<string, unknown> with property casts (values.email as string) for vee-validate form handlers — matches vee-validate's own generic types"
  - "Typed social login error objects as inline interfaces { response?: { data?: { error?: ... } } } — avoids as any while preserving optional chaining"
  - "Removed [key: string]: any index signatures from Order and Announcement interfaces — typed properties are sufficient for usage"

patterns-established:
  - "Pattern: catch (error: unknown) + inline typed interface cast for structured API errors"
  - "Pattern: import type { Component } from 'vue' for all icon props"
  - "Pattern: Record<string, unknown> + property as T casts for vee-validate form handlers"

requirements-completed: [CBP-01]

# Metrics
duration: 15min
completed: 2026-04-05
---

# Phase 114 Plan 01: Fix any types in website app Summary

**Eliminated ~22 Codacy any-type violations across 23 website files using unknown, Record<string, unknown>, and Component from vue — zero runtime changes, TypeScript compiles clean**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-05T00:00:00Z
- **Completed:** 2026-04-05T00:15:00Z
- **Tasks:** 2
- **Files modified:** 23

## Accomplishments
- Replaced all `catch (error: any)` with `catch (error: unknown)` using typed interface narrowing for structured Strapi error objects
- Replaced all vee-validate `(values: any)` with `Record<string, unknown>` with explicit property casts
- Added `DOMPurify` to the Window interface in window.d.ts, enabling `window.DOMPurify` directly (no more `window as any` casts)
- Replaced all `icon: any` prop types with `Component` from vue across 4 components and the mis-anuncios page
- Removed `[key: string]: any` index signatures from Order and Announcement interfaces
- Changed `user.d.ts` ads/orders from `any[]` to `Record<string, unknown>[]`
- Fixed `useIcons.ts` iconMap type from `{ [key: string]: any }` to `Record<string, Component>`

## Task Commits

1. **Task 1: Fix catch blocks, form handlers, plugin params, and DOMPurify casts** - `bc464462` (fix)
2. **Task 2: Fix icon props, index signatures, user types, and composables** - `a6fc6df0` (fix)

## Files Created/Modified
- `apps/website/app/types/window.d.ts` - Added `DOMPurify: typeof DOMPurify` to Window interface
- `apps/website/app/components/FormForgotPassword.vue` - values: any -> Record<string, unknown>
- `apps/website/app/components/FormResetPassword.vue` - values: any -> Record<string, unknown>
- `apps/website/app/components/FormContact.vue` - submitToStrapi values: any -> Record<string, unknown>
- `apps/website/app/components/FormPassword.vue` - values: any, handleError(error: any) -> typed
- `apps/website/app/components/FormRegister.vue` - error as any -> typed interface
- `apps/website/app/components/CardHighlight.vue` - icon: any -> Component
- `apps/website/app/components/CardShortcut.vue` - iconComponent: any -> Component
- `apps/website/app/components/AccountOrders.vue` - removed [key: string]: any index signature
- `apps/website/app/components/AccountAnnouncements.vue` - Announcement any -> Record<string, unknown> & { id: number }, icon any -> Component
- `apps/website/app/components/CardProfileAd.vue` - handlePushImage(response: any) -> GalleryItem typed
- `apps/website/app/composables/useSanitize.ts` - (window as any).DOMPurify -> window.DOMPurify
- `apps/website/app/composables/useIcons.ts` - { [key: string]: any } -> Record<string, Component>
- `apps/website/app/plugins/site-health.client.ts` - removed :any from nuxtApp param
- `apps/website/app/plugins/gtm.client.ts` - ...args: any[] -> ...args: unknown[]
- `apps/website/app/plugins/dompurify.client.ts` - (window as any).DOMPurify -> window.DOMPurify
- `apps/website/app/types/user.d.ts` - ads/orders: any[] -> Record<string, unknown>[]
- `apps/website/app/pages/login/google.vue` - catch(error: any) -> catch(error: unknown) with typed interface
- `apps/website/app/pages/login/facebook.vue` - catch error cast: as any -> typed interface
- `apps/website/app/pages/cuenta/mis-anuncios.vue` - icon: any -> Component in tabs type
- `apps/website/app/pages/anuncios/[slug].vue` - (result as any).meta -> unknown typed cast
- `apps/website/nuxt.config.ts` - } as any -> } as Record<string, unknown> for head config
- `apps/website/server/api/dev-login.post.ts` - catch(error: any) -> catch(error: unknown)

## Decisions Made
- Added DOMPurify to Window interface rather than using `(window as unknown as Record<string, unknown>).DOMPurify` — cleaner and enables direct window.DOMPurify usage
- Used inline typed interfaces for social login error objects (Google/Facebook) to preserve optional chaining without deep nested Record types that cause TS errors
- Removed `[key: string]: any` from Order/Announcement interfaces — existing typed properties suffice for all usages

## Deviations from Plan

None — plan executed exactly as written. TypeScript compilation errors during implementation were iterative refinements to cast strategies (initial deep Record types were incompatible with TypeScript's property resolution — replaced with inline interface types).

## Issues Encountered
- Initial approach of using `Record<string, Record<string, ...>>` deeply nested types caused TypeScript errors at the leaf level — replaced with inline interface types like `{ response?: { data?: { error?: { message?: string } } } }` which TypeScript resolves correctly

## Next Phase Readiness
- Website app is fully clean of any type annotations in the files listed in this plan
- Two remaining files (AvatarDefault.vue, ProfileDefault.vue) have pre-existing any casts that were out of scope for this plan
- Phase 114-02 (dashboard) and 114-03 (strapi) run in parallel and have their own SUMMARY files

---
*Phase: 114-fix-codacy-best-practice-warnings*
*Completed: 2026-04-05*
