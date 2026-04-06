---
phase: 115-fix-remaining-any-and-function-type-violations
plan: 01
subsystem: ui
tags: [typescript, vue, nuxt, type-safety]

# Dependency graph
requires:
  - phase: 114-fix-codacy-best-practice-warnings
    provides: zero any/Function violations in most dashboard/website files; these 12 files were the residual gap
provides:
  - Zero Array<any> or ref<any> violations across all website and dashboard source files
  - Typed interfaces for 10 dashboard detail pages (FaqRecord, Pack, FeaturedRecord, ReservationRecord, PolicyRecord, ConditionRecord, RegionRecord, CategoryRecord, TermRecord, CommuneRecord)
affects: [codacy, future-type-refactors]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Extend FormXxx data interface with a local XxxRecord interface for detail pages (adds createdAt/updatedAt/slug)"
    - "Use Omit<Base, field> when a child interface needs to override a property shape from the base"
    - "Cast useAsyncData result on assignment when the return type is too wide to match the typed ref"

key-files:
  created: []
  modified:
    - apps/website/app/components/IntroduceAuth.vue
    - apps/dashboard/app/components/IntroduceAuth.vue
    - apps/dashboard/app/pages/faqs/[id]/index.vue
    - apps/dashboard/app/pages/packs/[id]/index.vue
    - apps/dashboard/app/pages/featured/[id].vue
    - apps/dashboard/app/pages/reservations/[id].vue
    - apps/dashboard/app/pages/policies/[id]/index.vue
    - apps/dashboard/app/pages/conditions/[id]/index.vue
    - apps/dashboard/app/pages/regions/[id]/index.vue
    - apps/dashboard/app/pages/categories/[id]/index.vue
    - apps/dashboard/app/pages/terms/[id]/index.vue
    - apps/dashboard/app/pages/communes/[id]/index.vue

key-decisions:
  - "CommuneRecord uses Omit<CommuneData, 'region'> to override the region shape — CommuneData has region.id but the detail page needs region.name for display"
  - "FeaturedRecord and ReservationRecord defined inline (no exportable form interface for these domain types)"
  - "Cast useAsyncData.value as TypedInterface on assignment for pages where the async return includes unknown[] elements"

patterns-established:
  - "XxxRecord extends XxxData pattern: import form component data interface, extend with createdAt/updatedAt/slug for detail view display"
  - "Omit<Base, field> override pattern for property shape conflicts in interface extension"

requirements-completed: [TYPE-001, TYPE-002]

# Metrics
duration: 25min
completed: 2026-04-06
---

# Phase 115 Plan 01: Fix Remaining any Type Violations Summary

**Eliminated all 12 residual `any` violations — 2 `Array<any>` props and 10 `ref<any>(null)` reactive state declarations — replacing with concrete TypeScript interfaces across website and dashboard**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-06T00:00:00Z
- **Completed:** 2026-04-06T00:25:00Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Replaced `Array<any>` with `string[]` in both `IntroduceAuth.vue` (website and dashboard)
- Replaced `ref<any>(null)` with typed refs in 10 dashboard detail pages using the `XxxRecord extends XxxData` pattern established in Phase 114 edit pages
- Dashboard typecheck passes with zero errors; all 59 existing tests pass unchanged

## Task Commits

1. **Task 1: Fix Array<any> prop in both IntroduceAuth.vue files** - `b48b4e15` (fix)
2. **Task 2: Fix ref<any>(null) in 10 dashboard detail pages** - `c083aa11` (fix)

## Files Created/Modified

- `apps/website/app/components/IntroduceAuth.vue` - `list` prop changed from `Array<any>` to `string[]`
- `apps/dashboard/app/components/IntroduceAuth.vue` - `list` prop changed from `Array<any>` to `string[]`
- `apps/dashboard/app/pages/faqs/[id]/index.vue` - `ref<FaqRecord | null>` via `FaqRecord extends FaqData`
- `apps/dashboard/app/pages/packs/[id]/index.vue` - `ref<Pack | null>` via import from types/pack
- `apps/dashboard/app/pages/featured/[id].vue` - `ref<FeaturedRecord | null>` via inline interface
- `apps/dashboard/app/pages/reservations/[id].vue` - `ref<ReservationRecord | null>` via inline interface
- `apps/dashboard/app/pages/policies/[id]/index.vue` - `ref<PolicyRecord | null>` via `PolicyRecord extends PolicyData`
- `apps/dashboard/app/pages/conditions/[id]/index.vue` - `ref<ConditionRecord | null>` via `ConditionRecord extends ConditionData` (adds slug)
- `apps/dashboard/app/pages/regions/[id]/index.vue` - `ref<RegionRecord | null>` via `RegionRecord extends RegionData` (adds slug)
- `apps/dashboard/app/pages/categories/[id]/index.vue` - `ref<CategoryRecord | null>` via `CategoryRecord extends CategoryData`
- `apps/dashboard/app/pages/terms/[id]/index.vue` - `ref<TermRecord | null>` via `TermRecord extends TermData`
- `apps/dashboard/app/pages/communes/[id]/index.vue` - `ref<CommuneRecord | null>` via `CommuneRecord extends Omit<CommuneData, 'region'>`

## Decisions Made

- `CommuneRecord` uses `Omit<CommuneData, 'region'>` to override the region property shape — `CommuneData.region` has shape `{ id?: number }` (for form submission) but the detail page displays `commune.region.name`, requiring a different shape. The Omit pattern avoids a conflicting interface extension error.
- `FeaturedRecord` and `ReservationRecord` defined inline because no exportable form interface exists for these domain types (their list/detail components don't export a data interface).
- Cast `useAsyncData.value as TypedInterface | null` on assignment for `packs`, `featured`, and `reservations` pages — the async function returns `unknown[]` array elements or `unknown` fallback data, which TypeScript infers as `{} | null`, too wide for the concrete typed ref.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CommuneRecord region shape conflict required Omit<> pattern**
- **Found during:** Task 2 (fix ref<any> in 10 dashboard detail pages)
- **Issue:** `CommuneRecord extends CommuneData` caused TS2430 because `CommuneData.region` is `{ id?: number }` but `CommuneRecord.region` needed `{ name: string }` for display — TypeScript disallows incompatible override without Omit
- **Fix:** Changed to `CommuneRecord extends Omit<CommuneData, 'region'>` and redeclared `region?: { id?: number; name?: string }`
- **Files modified:** `apps/dashboard/app/pages/communes/[id]/index.vue`
- **Verification:** `npx vue-tsc --noEmit` exits 0
- **Committed in:** `c083aa11` (Task 2 commit)

**2. [Rule 1 - Bug] useAsyncData return type too wide for typed ref assignment in packs/featured/reservations**
- **Found during:** Task 2 (fix ref<any> in 10 dashboard detail pages)
- **Issue:** TS2322 — `featuredData.value`, `packData.value`, `reservationData.value` typed as `{} | null` by vue-tsc because async functions return `unknown[]` array elements; direct assignment to typed ref fails
- **Fix:** Added `as TypedInterface | null` cast on the assignment line (`item.value = (featuredData.value as FeaturedRecord | null) ?? null`)
- **Files modified:** `featured/[id].vue`, `packs/[id]/index.vue`, `reservations/[id].vue`
- **Verification:** `npx vue-tsc --noEmit` exits 0
- **Committed in:** `c083aa11` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (Rule 1 - both were type errors surfaced by running typecheck)
**Impact on plan:** Both fixes necessary to make the typed refs compile correctly. No scope creep.

## Issues Encountered

None beyond the two type errors resolved above.

## Known Stubs

None.

## Next Phase Readiness

- Zero `Array<any>` or `ref<any>` violations remain across website and dashboard
- Dashboard typecheck passes; website typecheck passes; all 59 tests pass
- Codacy best-practice sweep for `any` violations is complete across all three apps

---
*Phase: 115-fix-remaining-any-and-function-type-violations*
*Completed: 2026-04-06*
