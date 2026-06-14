---
phase: 114-fix-codacy-best-practice-warnings
plan: 02
subsystem: ui
tags: [typescript, codacy, any, unknown, chart.js, vee-validate, dashboard, vue]

requires: []
provides:
  - Zero any type annotations in dashboard app source files (components, stores, plugins, pages)
  - chart.js typed callbacks in ChartSales using TooltipItem<"bar"> and Chart
  - User type propagation to AvatarDefault, HeroDashboard via UserWithAvatar extension
  - AdGalleryItem replacing inline any-based image type in GalleryDefault
  - Exported FaqData, PackData, PolicyData, ConditionData, RegionData, CategoryData, TermData, CommuneData interfaces
  - Edit pages fully typed with XxxRecord interfaces extending form data types with timestamps
affects:
  - 114-03
  - Any future components importing from dashboard Form components

tech-stack:
  added: []
  patterns:
    - "vee-validate handlers use (values: Record<string, unknown>) with per-field as casts at use sites"
    - "chart.js callbacks typed via import type { Chart, TooltipItem } from 'chart.js'"
    - "window global augmentation uses (window as unknown as Record<string, unknown>).DOMPurify pattern"
    - "Form component interfaces exported for use in edit pages"
    - "Edit pages extend form interfaces with XxxRecord { createdAt?: string; updatedAt?: string }"
    - "catch (error: unknown) with instanceof narrowing for typed error handling"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/FormFaq.vue
    - apps/dashboard/app/components/FormForgotPassword.vue
    - apps/dashboard/app/components/FormCommune.vue
    - apps/dashboard/app/components/FormEdit.vue
    - apps/dashboard/app/components/FormRegion.vue
    - apps/dashboard/app/components/FormCategory.vue
    - apps/dashboard/app/components/FormTerm.vue
    - apps/dashboard/app/components/FormPack.vue
    - apps/dashboard/app/components/FormPolicy.vue
    - apps/dashboard/app/components/FormResetPassword.vue
    - apps/dashboard/app/components/FormCondition.vue
    - apps/dashboard/app/components/FormPassword.vue
    - apps/dashboard/app/plugins/site-health.client.ts
    - apps/dashboard/app/plugins/gtm.client.ts
    - apps/dashboard/app/plugins/dompurify.client.ts
    - apps/dashboard/app/composables/useSanitize.ts
    - apps/dashboard/app/stores/me.store.ts
    - apps/dashboard/nuxt.config.ts
    - apps/dashboard/server/api/dev-login.post.ts
    - apps/dashboard/app/components/ChartSales.vue
    - apps/dashboard/app/components/AvatarDefault.vue
    - apps/dashboard/app/components/GalleryDefault.vue
    - apps/dashboard/app/components/HeroDashboard.vue
    - apps/dashboard/app/types/ad.ts
    - apps/dashboard/app/pages/packs/[id]/edit.vue
    - apps/dashboard/app/pages/faqs/[id]/edit.vue
    - apps/dashboard/app/pages/policies/[id]/edit.vue
    - apps/dashboard/app/pages/conditions/[id]/edit.vue
    - apps/dashboard/app/pages/regions/[id]/edit.vue
    - apps/dashboard/app/pages/categories/[id]/edit.vue
    - apps/dashboard/app/pages/terms/[id]/edit.vue
    - apps/dashboard/app/pages/communes/[id]/edit.vue

key-decisions:
  - "vee-validate (values: Record<string, unknown>) with per-property as casts is the standard pattern for typed form handlers"
  - "UserWithAvatar extends User to add optional avatar field absent from base User type"
  - "Form component interfaces exported so edit pages can import typed handlers without duplicating interface definitions"
  - "Edit pages use XxxRecord extends XxxData with timestamps to avoid ref<any> while keeping date field access"
  - "AdGalleryItem gains optional id? field to support template :key binding in GalleryDefault"
  - "(window as unknown as Record<string, unknown>).DOMPurify pattern used since no window.d.ts exists for DOMPurify"

requirements-completed: [CBP-02]

duration: 22min
completed: 2026-04-06
---

# Phase 114 Plan 02: Dashboard Any-Type Elimination Summary

**Eliminated ~35 any type violations across 31 dashboard files by typing vee-validate handlers, chart.js callbacks, window globals, plugin args, and all edit page refs**

## Performance

- **Duration:** 22 min
- **Started:** 2026-04-06T02:42:00Z
- **Completed:** 2026-04-06T03:05:00Z
- **Tasks:** 2
- **Files modified:** 31

## Accomplishments

- All 12 vee-validate form handlers typed as `(values: Record<string, unknown>)` with per-field type casts
- ChartSales.vue fully typed with `Chart`, `TooltipItem<"bar">` from chart.js imports
- AvatarDefault.vue typed with UserWithAvatar interface extending User with optional avatar field
- GalleryDefault.vue typed with AdGalleryItem (added optional `id?` field to type)
- All 8 edit pages typed via exported form interfaces with XxxRecord wrappers adding timestamps
- Plugin patterns fixed: nuxtApp type removed, `...args: unknown[]` for gtag, window cast for DOMPurify
- TypeScript typecheck exits clean with zero errors

## Task Commits

1. **Task 1: Fix form handlers, plugins, DOMPurify, me.store, and nuxt.config** - `770e4758` (fix)
2. **Task 2: Fix ChartSales, AvatarDefault, GalleryDefault, HeroDashboard, and edit pages** - `539d8a3b` (fix)

## Files Created/Modified

- `apps/dashboard/app/components/Form*.vue` (12 files) - handlers typed as Record<string, unknown>
- `apps/dashboard/app/plugins/site-health.client.ts` - removed nuxtApp: any
- `apps/dashboard/app/plugins/gtm.client.ts` - args: any[] -> args: unknown[]
- `apps/dashboard/app/plugins/dompurify.client.ts` - window as unknown as Record<string, unknown>
- `apps/dashboard/app/composables/useSanitize.ts` - window DOMPurify access typed
- `apps/dashboard/app/stores/me.store.ts` - saveUsername data: any -> Record<string, unknown>
- `apps/dashboard/nuxt.config.ts` - } as any -> } as Record<string, unknown>
- `apps/dashboard/server/api/dev-login.post.ts` - catch error: any -> error: unknown
- `apps/dashboard/app/components/ChartSales.vue` - Chart and TooltipItem imports, typed callbacks
- `apps/dashboard/app/components/AvatarDefault.vue` - UserWithAvatar interface, no more any casts
- `apps/dashboard/app/components/GalleryDefault.vue` - AdGalleryItem replacing any-based type
- `apps/dashboard/app/components/HeroDashboard.vue` - User type, user.value?.firstname
- `apps/dashboard/app/types/ad.ts` - added id?: number to AdGalleryItem
- `apps/dashboard/app/pages/*/[id]/edit.vue` (8 files) - XxxRecord types, exported form interfaces

## Decisions Made

- vee-validate form handlers use `(values: Record<string, unknown>)` with `as string` casts at property access sites — this is the correct typing since vee-validate's submit callback actually yields `Record<string, unknown>` at runtime
- UserWithAvatar extends User (not a separate interface) to retain all User type fields while adding avatar
- Form component interfaces are exported from their `.vue` files so edit pages can import them cleanly without duplicating definitions
- AdGalleryItem gains `id?: number` because GalleryDefault uses it as a `:key` binding - it's a real Strapi field

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ChartSales tooltip.dataPoints.find typed callback mismatch**
- **Found during:** Task 2 (ChartSales.vue typing)
- **Issue:** TypeScript rejected `(dp: TooltipItem<"bar">)` in find callback because dataPoints is `TooltipItem<keyof ChartTypeRegistry>[]`
- **Fix:** Removed explicit type annotation on dp in the find callback (let TypeScript infer), and fixed adjacent `bar` possibly undefined error with optional chaining
- **Files modified:** apps/dashboard/app/components/ChartSales.vue
- **Verification:** typecheck exits 0
- **Committed in:** 539d8a3b

---

**Total deviations:** 1 auto-fixed (Rule 1 - type mismatch in Chart.js callback)
**Impact on plan:** Minor type narrowing adjustment. No scope change.

## Issues Encountered

None - typecheck passed clean after each fix iteration.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Dashboard app is fully free of any type annotations
- Ready for plan 114-03 (website any fixes) and 114-04 (strapi any/Function/require fixes)
- All Form interfaces are now exported and reusable for future edit page additions

---
*Phase: 114-fix-codacy-best-practice-warnings*
*Completed: 2026-04-06*
