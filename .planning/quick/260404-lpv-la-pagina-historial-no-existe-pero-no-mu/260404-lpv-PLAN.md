---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/pages/[slug].vue
autonomous: true
requirements: [fix-404-propagation]
must_haves:
  truths:
    - "Visiting /historial (or any non-existent root slug) shows the 404 error page"
    - "Visiting a valid user profile slug still renders the profile page correctly"
  artifacts:
    - path: "apps/website/app/pages/[slug].vue"
      provides: "Error propagation after useAsyncData"
      contains: "error.value"
  key_links:
    - from: "apps/website/app/pages/[slug].vue"
      to: "error.vue"
      via: "throw error.value after useAsyncData"
      pattern: "throw error\\.value"
---

<objective>
Fix the blank page rendered when navigating to non-existent root-level slugs like `/historial`.

Purpose: `useAsyncData` catches errors thrown inside its callback and stores them in `error.value` instead of letting them propagate to Nuxt's `error.vue`. The page template guards with `v-if="adsData && adsData.user"` so when data is null the page renders blank — no 404 shown.

Output: After the fix, any `createError` thrown inside `useAsyncData` is rethrown so Nuxt routes to `error.vue`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/website/app/pages/[slug].vue
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rethrow useAsyncData error so Nuxt shows 404 page</name>
  <files>apps/website/app/pages/[slug].vue</files>
  <action>
After the existing `useAsyncData` call (line 136), add an error propagation check:

```ts
if (error.value) {
  throw error.value;
}
```

This is the standard Nuxt pattern: `useAsyncData` swallows errors thrown inside its callback and stores them in `error.value`. By rethrowing after the await, Nuxt's error handling picks it up and routes to `error.vue`.

Do NOT change anything else in the file — no changes to `excludedRoutes`, template, SEO logic, or the `useAsyncData` callback itself.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx nuxi typecheck apps/website</automated>
  </verify>
  <done>Navigating to /historial or any unknown root slug shows the 404 error page instead of a blank page. Valid user profile slugs continue to render normally.</done>
</task>

</tasks>

<verification>
1. `npx nuxi typecheck apps/website` passes with no new errors
2. Manual: visit `/historial` in browser — should see 404 error page
3. Manual: visit a valid user profile slug — should see profile page as before
</verification>

<success_criteria>
- Non-existent root slugs like /historial display the 404 error page
- Valid user profile pages render correctly with no regressions
- TypeScript typecheck passes
</success_criteria>

<output>
After completion, create `.planning/quick/260404-lpv-la-pagina-historial-no-existe-pero-no-mu/260404-lpv-SUMMARY.md`
</output>
