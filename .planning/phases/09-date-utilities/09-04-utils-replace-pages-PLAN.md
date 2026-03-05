---
phase: 09-date-utilities
plan: 04
type: execute
wave: 2
depends_on: [09-01]
files_modified:
  - apps/dashboard/app/pages/anuncios/[id].vue
  - apps/dashboard/app/pages/categorias/[id]/editar.vue
  - apps/dashboard/app/pages/categorias/[id]/index.vue
  - apps/dashboard/app/pages/comunas/[id]/editar.vue
  - apps/dashboard/app/pages/comunas/[id]/index.vue
  - apps/dashboard/app/pages/condiciones/[id]/editar.vue
  - apps/dashboard/app/pages/condiciones/[id]/index.vue
  - apps/dashboard/app/pages/destacados/[id].vue
autonomous: true
requirements:
  - UTIL-02
  - UTIL-07
must_haves:
  truths:
    - "No inline formatDate definition in pages (Batch A)"
    - "No inline formatDateShort definition in pages (Batch A)"
    - "Pages use imported formatDate"
    - "Typecheck passes"
  artifacts: []
  key_links: []
---

<objective>
Replace inline `formatDate` and `formatDateShort` functions in dashboard pages (Batch A: Anuncios-Destacados) with the new centralized utility from `apps/dashboard/app/utils/date.ts`.

Purpose: Eliminate code duplication and standardize date formatting.
Output: Modified page files with inline function removed and utility imported.
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
  <name>Task 1: Replace inline formatDate in pages (Batch A)</name>
  <files>
    apps/dashboard/app/pages/anuncios/[id].vue,
    apps/dashboard/app/pages/categorias/[id]/editar.vue,
    apps/dashboard/app/pages/categorias/[id]/index.vue,
    apps/dashboard/app/pages/comunas/[id]/editar.vue,
    apps/dashboard/app/pages/comunas/[id]/index.vue,
    apps/dashboard/app/pages/condiciones/[id]/editar.vue,
    apps/dashboard/app/pages/condiciones/[id]/index.vue,
    apps/dashboard/app/pages/destacados/[id].vue
  </files>
  <action>
    For each listed page:
    1. Read the file content.
    2. Remove the inline `const formatDate = ...` definition entirely.
    3. Ensure `formatDate` is NOT imported explicitly (Nuxt auto-imports from `utils/`).
    4. Verify usages like `{{ formatDate(item.createdAt) }}` remain untouched.
    
    Note: The new `formatDate` handles `undefined` input gracefully ("--").
  </action>
  <verify>
    <automated>grep -L "const formatDate =" apps/dashboard/app/pages/anuncios/[id].vue</automated>
  </verify>
  <done>
    All listed pages no longer contain "const formatDate =".
  </done>
</task>

<task type="auto">
  <name>Task 2: Verify typecheck</name>
  <files>apps/dashboard/app/pages/anuncios/[id].vue</files>
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
`grep -r "const formatDate =" apps/dashboard/app/pages` should return empty (and others in list).
</verification>

<success_criteria>
- No inline `formatDate` in target pages.
- Typecheck passes.
</success_criteria>

<output>
After completion, create `.planning/phases/09-date-utilities/09-04-SUMMARY.md`
</output>
