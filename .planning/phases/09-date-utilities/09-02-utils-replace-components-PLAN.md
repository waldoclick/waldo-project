---
phase: 09-date-utilities
plan: 02
type: execute
wave: 2
depends_on: [09-01]
files_modified:
  - apps/dashboard/app/components/AdsTable.vue
  - apps/dashboard/app/components/CategoriesDefault.vue
  - apps/dashboard/app/components/CommunesDefault.vue
  - apps/dashboard/app/components/ConditionsDefault.vue
  - apps/dashboard/app/components/FaqsDefault.vue
  - apps/dashboard/app/components/FeaturedFree.vue
  - apps/dashboard/app/components/FeaturedUsed.vue
  - apps/dashboard/app/components/OrdersDefault.vue
  - apps/dashboard/app/components/PacksDefault.vue
  - apps/dashboard/app/components/RegionsDefault.vue
  - apps/dashboard/app/components/ReservationsFree.vue
  - apps/dashboard/app/components/ReservationsUsed.vue
  - apps/dashboard/app/components/UserAnnouncements.vue
  - apps/dashboard/app/components/UserFeatured.vue
  - apps/dashboard/app/components/UserReservations.vue
  - apps/dashboard/app/components/UsersDefault.vue
autonomous: true
requirements:
  - UTIL-02
  - UTIL-07
must_haves:
  truths:
    - "No inline formatDate definition in components"
    - "Components use imported formatDate"
    - "Typecheck passes"
  artifacts: []
  key_links: []
---

<objective>
Replace inline `formatDate` functions in all dashboard components with the new centralized utility from `apps/dashboard/app/utils/date.ts`.

Purpose: Eliminate code duplication and standardize date formatting.
Output: Modified component files with inline function removed and utility imported.
</objective>

<execution_context>
@/home/gabriel/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/phases/09-date-utilities/09-01-SUMMARY.md
@.planning/REQUIREMENTS.md

# Components to modify:
# apps/dashboard/app/components/AdsTable.vue
# apps/dashboard/app/components/CategoriesDefault.vue
# apps/dashboard/app/components/CommunesDefault.vue
# apps/dashboard/app/components/ConditionsDefault.vue
# apps/dashboard/app/components/FaqsDefault.vue
# apps/dashboard/app/components/FeaturedFree.vue
# apps/dashboard/app/components/FeaturedUsed.vue
# apps/dashboard/app/components/OrdersDefault.vue
# apps/dashboard/app/components/PacksDefault.vue
# apps/dashboard/app/components/RegionsDefault.vue
# apps/dashboard/app/components/ReservationsFree.vue
# apps/dashboard/app/components/ReservationsUsed.vue
# apps/dashboard/app/components/UserAnnouncements.vue
# apps/dashboard/app/components/UserFeatured.vue
# apps/dashboard/app/components/UserReservations.vue
# apps/dashboard/app/components/UsersDefault.vue
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace inline formatDate in components</name>
  <files>
    apps/dashboard/app/components/AdsTable.vue,
    apps/dashboard/app/components/CategoriesDefault.vue,
    apps/dashboard/app/components/CommunesDefault.vue,
    apps/dashboard/app/components/ConditionsDefault.vue,
    apps/dashboard/app/components/FaqsDefault.vue,
    apps/dashboard/app/components/FeaturedFree.vue,
    apps/dashboard/app/components/FeaturedUsed.vue,
    apps/dashboard/app/components/OrdersDefault.vue,
    apps/dashboard/app/components/PacksDefault.vue,
    apps/dashboard/app/components/RegionsDefault.vue,
    apps/dashboard/app/components/ReservationsFree.vue,
    apps/dashboard/app/components/ReservationsUsed.vue,
    apps/dashboard/app/components/UserAnnouncements.vue,
    apps/dashboard/app/components/UserFeatured.vue,
    apps/dashboard/app/components/UserReservations.vue,
    apps/dashboard/app/components/UsersDefault.vue
  </files>
  <action>
    For each component listed:
    1. Read the file content.
    2. Remove the inline `const formatDate = ...` definition entirely.
    3. Ensure `formatDate` is NOT imported explicitly (Nuxt auto-imports from `utils/`).
    4. If the file uses `formatDateShort`, replace/remove its definition too if present (though grep showed only in one page, check just in case).
    5. Verify usages like `{{ formatDate(item.createdAt) }}` remain untouched (they will now use the auto-imported function).
    
    Note: The new `formatDate` handles `undefined` input gracefully ("--"), which matches the requirements.
    
    Warning: If `formatDate` was used inside `<script setup>`, ensure it still works (auto-import works in script setup too).
  </action>
  <verify>
    <automated>grep -L "const formatDate =" apps/dashboard/app/components/AdsTable.vue</automated>
  </verify>
  <done>
    All listed components no longer contain "const formatDate =".
  </done>
</task>

<task type="auto">
  <name>Task 2: Verify typecheck</name>
  <files>apps/dashboard/app/components/AdsTable.vue</files>
  <action>
    Run `npx nuxi typecheck` in `apps/dashboard` to ensure no type errors introduced by the removal.
    If errors occur (e.g. auto-import not picked up), investigate `tsconfig.json` or `nuxt.config.ts` but DO NOT revert to inline.
  </action>
  <verify>
    <automated>cd apps/dashboard && npx nuxi typecheck</automated>
  </verify>
  <done>
    Typecheck passes.
  </done>
</task>

</tasks>

<verification>
`grep -r "const formatDate =" apps/dashboard/app/components` should return empty.
</verification>

<success_criteria>
- No inline `formatDate` in components.
- Typecheck passes.
</success_criteria>

<output>
After completion, create `.planning/phases/09-date-utilities/09-02-SUMMARY.md`
</output>
