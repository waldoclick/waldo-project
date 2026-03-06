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
autonomous: true
requirements:
  - UTIL-02
  - UTIL-07
must_haves:
  truths:
    - "No inline formatDate definition in components (Batch A)"
    - "Components use imported formatDate"
    - "Typecheck passes"
  artifacts: []
  key_links: []
---

<objective>
Replace inline `formatDate` functions in dashboard components (Batch A: Ads-Orders) with the new centralized utility from `apps/dashboard/app/utils/date.ts`.

Purpose: Eliminate code duplication and standardize date formatting.
Output: Modified component files with inline function removed and utility imported.
</objective>

<execution_context>
@/home/gabriel/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/phases/09-date-utilities/09-01-SUMMARY.md
@.planning/REQUIREMENTS.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace inline formatDate in components (Batch A)</name>
  <files>
    apps/dashboard/app/components/AdsTable.vue,
    apps/dashboard/app/components/CategoriesDefault.vue,
    apps/dashboard/app/components/CommunesDefault.vue,
    apps/dashboard/app/components/ConditionsDefault.vue,
    apps/dashboard/app/components/FaqsDefault.vue,
    apps/dashboard/app/components/FeaturedFree.vue,
    apps/dashboard/app/components/FeaturedUsed.vue,
    apps/dashboard/app/components/OrdersDefault.vue
  </files>
  <action>
    For each component listed:
    1. Read the file content.
    2. Remove the inline `const formatDate = ...` definition entirely.
    3. Ensure `formatDate` is NOT imported explicitly (Nuxt auto-imports from `utils/`).
    4. If the file uses `formatDateShort`, replace/remove its definition too if present.
    5. Verify usages like `{{ formatDate(item.createdAt) }}` remain untouched (they will now use the auto-imported function).
    
    Note: The new `formatDate` handles `undefined` input gracefully ("--").
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
`grep -r "const formatDate =" apps/dashboard/app/components/AdsTable.vue` should return empty (and others in list).
</verification>

<success_criteria>
- No inline `formatDate` in target components.
- Typecheck passes.
</success_criteria>

<output>
After completion, create `.planning/phases/09-date-utilities/09-02-SUMMARY.md`
</output>
