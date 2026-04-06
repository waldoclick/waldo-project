---
phase: quick
plan: 260405-uxm
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/plugins/gtm.client.ts
autonomous: true
requirements: [codacy-best-practice]
must_haves:
  truths:
    - "no-inner-declarations ESLint violation is resolved"
    - "GTM plugin behavior is unchanged"
  artifacts:
    - path: "apps/website/app/plugins/gtm.client.ts"
      provides: "GTM client plugin without inner function declaration"
  key_links: []
---

<objective>
Fix Codacy ESLint no-inner-declarations violation in gtm.client.ts by converting the `gtag` function declaration inside the `if` block to a const arrow function expression.

Purpose: Resolve Codacy best-practice linter warning.
Output: Clean gtm.client.ts with no inner function declarations.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/website/app/plugins/gtm.client.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Convert gtag function declaration to arrow function expression</name>
  <files>apps/website/app/plugins/gtm.client.ts</files>
  <action>
    On line 17 of gtm.client.ts, change:
    ```
    function gtag(...args: any[]) {
    ```
    to:
    ```
    const gtag = (...args: any[]) => {
    ```

    This converts the function declaration (which triggers no-inner-declarations when inside an if block) to a function expression assigned to a const, which is valid inside block scope.

    Everything else in the file stays exactly the same.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx vue-tsc --noEmit --project apps/website/tsconfig.json 2>&1 | tail -5</automated>
  </verify>
  <done>gtag is a const arrow function expression, no-inner-declarations violation is gone, TypeScript compiles clean</done>
</task>

</tasks>

<verification>
- `npx vue-tsc --noEmit` passes for website app
- No function declarations inside block scope in gtm.client.ts
</verification>

<success_criteria>
- gtm.client.ts has `const gtag = (...args: any[]) =>` instead of `function gtag(...args: any[])`
- TypeScript compilation succeeds
- GTM functionality unchanged (same runtime behavior)
</success_criteria>

<output>
After completion, create `.planning/quick/260405-uxm-move-function-declaration-to-function-bo/260405-uxm-SUMMARY.md`
</output>
