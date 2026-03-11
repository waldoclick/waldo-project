# Deferred Items — Phase 34 GTM Module Dashboard

## Pre-existing TypeScript Errors in Dashboard

**Discovered during:** Task 2 (TypeScript verification)
**Status:** Pre-existing — not caused by Phase 34 changes

### Issue

`yarn workspace waldo-dashboard exec nuxt typecheck` fails with ~50+ errors of the form:

```
Property 'formatDate' does not exist on type '{...component setup context...}'
```

Affected files include: `AdsTable.vue`, `CategoriesDefault.vue`, `CommunesDefault.vue`,
`ConditionsDefault.vue`, `FaqsDefault.vue`, `FeaturedFree.vue`, `FeaturedUsed.vue`,
`OrdersDefault.vue`, `PacksDefault.vue`, `RegionsDefault.vue`, `ReservationsFree.vue`,
`ReservationsUsed.vue`, `UserAnnouncements.vue`, `UserFeatured.vue`, `UserReservations.vue`,
`UsersDefault.vue`, `ads/[id].vue`, `categories/*`, `communes/*`, `conditions/*`, `faqs/*`,
`featured/[id].vue`, `orders/[id].vue`, `packs/*`, `regions/*`, `reservations/[id].vue`, `users/[id].vue`.

### Root Cause

`formatDate` and `formatDateShort` are exported from `app/utils/date.ts` and ARE included
in `.nuxt/types/imports.d.ts` as auto-imports. However, `vue-tsc` template type checking
does not resolve these auto-imports in the component template context — it only sees the
component's own `setup()` return type.

This is a pre-existing issue unrelated to the GTM module migration (confirmed: none of the
failing components were modified by Phase 34 changes).

### Evidence

- `git diff c70f518..cd9be8f -- apps/dashboard/app/components/*.vue` returns no output
- The errors reference `$gtm: GtmSupport` (our new addition) in error messages, confirming
  the GTM module IS integrated, but the `formatDate` issue is structural
- Same errors appear when running typecheck against the pre-Phase-34 .nuxt directory

### Proposed Fix (for a future phase)

Each affected component needs to either:
1. Add an explicit import: `import { formatDate } from '~/utils/date'`
2. Or use `const { formatDate } = useNuxtApp().$utils` pattern

Alternatively, investigate if `typeCheck: false` → `nuxt typecheck` workflow can be
configured to exclude auto-import globals from template checks.

### Priority

Medium — build succeeds (only typecheck fails), runtime behavior unaffected.
