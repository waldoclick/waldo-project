---
phase: quick
plan: 8
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/pages/anunciar/index.vue
  - apps/website/app/types/ad.types.ts
  - apps/website/tests/pages/anunciar/index.test.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "Numeric fields in the ad form enforce min/max constraints."
    - "Only valid numeric inputs are accepted."
    - "Edge and incorrect inputs do not break the form."
  artifacts:
    - path: "apps/website/pages/anunciar/index.vue"
      provides: "Ad creation form with updated numeric validation."
      min_lines: 150
    - path: "apps/website/app/types/ad.types.ts"
      provides: "TypeScript type updates for numeric fields, including constraints."
      min_lines: 10
    - path: "apps/website/tests/pages/anunciar/index.test.ts"
      provides: "Test suite for numeric validation logic and boundary cases."
      min_lines: 40
  key_links:
    - from: "apps/website/pages/anunciar/index.vue"
      to: "apps/website/app/types/ad.types.ts"
      via: "import type AdFormValues"
      pattern: "import.*AdFormValues"
    - from: "apps/website/pages/anunciar/index.vue"
      to: "apps/website/tests/pages/anunciar/index.test.ts"
      via: "numeric input selectors"
      pattern: "document.querySelector.*numeric"
---

<objective>
Restrict numeric fields in the ad creation form to enforce input constraints like minimum and maximum values.

Purpose: Prevent user errors and improve data integrity for numeric fields.
Output: Numeric restrictions enforced on the ad creation form, validation tests included.
</objective>

<execution_context>
@planning/STATE.md
</execution_context>

<tasks>

<task type="auto">
  <name>Task 1: Add numeric input constraints to ad creation page</name>
  <files>apps/website/pages/anunciar/index.vue</files>
  <action>
    - Add `min` and `max` attributes to numeric `<input>` fields in the ad form.
    - Ensure `type="number"` is used consistently for numeric fields.
    - Use Vue's validation helpers or bind `min`/`max` using props or data variables where appropriate.
  </action>
  <verify>
    <automated>npm run dev && visit http://localhost:3000/anunciar, manually test numeric bounds</automated>
  </verify>
  <done>All numeric fields enforce their specified minimum and maximum values, verified with valid and invalid inputs.</done>
</task>

<task type="auto">
  <name>Task 2: Update TypeScript types for numeric field constraints</name>
  <files>apps/website/app/types/ad.types.ts</files>
  <action>
    - Locate the `AdFormValues` interface/type declaration.
    - Add fields or comments specifying the numerical constraints (e.g., `views: { type: number; min: 1; max: 100 }`).
    - Ensure constraints match the form inputs in index.vue.
  </action>
  <verify>
    <automated>tsc --noEmit</automated>
  </verify>
  <done>`AdFormValues` includes numeric constraint metadata consistent with the form.</done>
</task>

<task type="auto">
  <name>Task 3: Add boundary and invalid input tests to ad creation form</name>
  <files>apps/website/tests/pages/anunciar/index.test.ts</files>
  <action>
    - Add integration tests (using `@nuxt/test-utils` and Vitest) to verify numeric fields enforce:
      - Minimum value rejection.
      - Maximum value rejection.
      - Successful submission within bounds.
    - Utilize selectors to identify numeric inputs.
    - Include specific tests for empty and non-numeric input cases.
  </action>
  <verify>
    <automated>vitest run apps/website/tests/pages/anunciar/index.test.ts</automated>
  </verify>
  <done>Numeric fields properly enforce input constraints, verified through automated tests.</done>
</task>

</tasks>

<success_criteria>
The ad creation form enforces numeric field constraints as defined in the `AdFormValues` type. Tests cover valid, invalid, boundary conditions, ensuring no failures for edge cases.
</success_criteria>

<output>
After completion, create `.planning/quick/8-restrict-numeric-fields-in-ad-creation-f/8-SUMMARY.md`
</output>