---
phase: quick
plan: 11
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/components/FormCreateFour.vue
autonomous: true
requirements: []
must_haves:
  truths:
    - "Pasting '1e5' into the year field shows nothing (cleared) and vee-validate sees empty value"
    - "Pasting '-5' or 'abc' into the year field shows nothing and vee-validate sees empty value"
    - "Pasting '1e5' into weight/width/height/depth shows '15' (digits only, no e/E/+/-)"
    - "Pasting '1.2.3' into weight/width/height/depth shows '1.23' (only first dot kept)"
    - "Pasting '-3.5' into weight/width/height/depth shows '3.5' (minus stripped)"
    - "vee-validate receives the sanitized value (v-model synced after DOM mutation)"
  artifacts:
    - path: apps/website/app/components/FormCreateFour.vue
      provides: "Paste sanitizers for year (integer) and decimal fields"
      contains: "handleYearInput"
  key_links:
    - from: "year Field element"
      to: "form.value.year"
      via: "@input='handleYearInput' + v-model sync"
    - from: "weight/width/height/depth Field elements"
      to: "form.value.{field}"
      via: "@input='handleDecimalInput' upgraded body"
---

<objective>
Close the two remaining paste-sanitization gaps in FormCreateFour.vue.

Purpose: The @keydown handlers only block manual key presses; paste events bypass them entirely. Year currently has no @input handler at all, so pasted garbage (1e5, -5, abc) renders in the field and remains until Yup rejects on submit. The decimal fields (weight/width/height/depth) only strip a leading minus — pasting "1e5" or "+3" still shows in the field.

Output: FormCreateFour.vue with:
- handleYearInput: strips /[^0-9]/g, syncs form.value.year
- handleDecimalInput (upgraded): strips /[^0-9.]/g then collapses multiple dots to one, syncs the matching v-model field
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/website/app/components/FormCreateFour.vue
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add handleYearInput and wire it to the year Field</name>
  <files>apps/website/app/components/FormCreateFour.vue</files>
  <action>
In the `<script setup>` block, add a new function `handleYearInput` immediately after `handleIntegerKeydown`:

```typescript
// Sanitize paste/autofill for the year field — integer only, no decimals
const handleYearInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const sanitized = input.value.replace(/[^0-9]/g, "");
  input.value = sanitized;
  form.value.year = sanitized === "" ? 0 : Number(sanitized);
};
```

Then in the template, add `@input="handleYearInput"` to the year Field element (which currently only has `@keydown="handleIntegerKeydown"`):

```html
<Field
  v-model="form.year"
  name="year"
  type="number"
  class="form-control"
  min="0"
  maxlength="4"
  inputmode="numeric"
  @keydown="handleIntegerKeydown"
  @input="handleYearInput"
/>
```

Rationale: /[^0-9]/g strips everything that is not a digit — handles e, E, +, -, ., and any non-numeric character pasted. Setting form.value.year syncs v-model so vee-validate sees the sanitized value immediately.
  </action>
  <verify>
    <automated>yarn workspace website typecheck 2>&1 | grep -E "FormCreateFour|error TS" | head -20 || echo "No TypeScript errors in FormCreateFour"</automated>
  </verify>
  <done>Year field: pasting "1e5" or "-5" or "abc" results in empty/digit-only display and vee-validate receives only integer digits</done>
</task>

<task type="auto">
  <name>Task 2: Upgrade handleDecimalInput to full sanitizer</name>
  <files>apps/website/app/components/FormCreateFour.vue</files>
  <action>
Replace the existing `handleDecimalInput` function body. The current implementation only strips a leading minus sign. Upgrade it to:

1. Strip any character that is not a digit or a dot: `/[^0-9.]/g`
2. Collapse multiple dots to keep only the first: `replace(/\.(?=.*\.)/g, "")`
3. Sync the value back to the matching form field via v-model — use `input.name` to key into `form.value`

Replace the current function:

```typescript
// Sanitize paste/autofill for decimal fields — remove leading minus sign
const handleDecimalInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.value.startsWith("-")) {
    input.value = input.value.replace(/^-+/, "");
    // Trigger Vue reactivity — vee-validate reads from DOM on input event
  }
};
```

With:

```typescript
// Sanitize paste/autofill for decimal fields — allow digits and at most one dot
const handleDecimalInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // Strip everything except digits and dots, then collapse multiple dots to one
  const sanitized = input.value
    .replace(/[^0-9.]/g, "")
    .replace(/\.(?=.*\.)/g, "");
  input.value = sanitized;
  // Sync v-model so vee-validate sees the sanitized value
  const fieldName = input.name as keyof typeof form.value;
  if (fieldName in form.value) {
    (form.value as Record<string, unknown>)[fieldName] =
      sanitized === "" ? 0 : Number(sanitized);
  }
};
```

Rationale:
- `/[^0-9.]/g` removes e, E, +, -, and any non-numeric non-dot character in one pass
- `/\.(?=.*\.)/g` uses a lookahead to remove every dot that has another dot after it — keeps only the LAST dot... wait, this keeps only the LAST dot. For natural input we want the FIRST dot kept. Use the following approach instead: after stripping non-numeric/non-dot chars, split on "." to take the first segment plus one decimal portion:

```typescript
const handleDecimalInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // Strip non-numeric non-dot chars
  const stripped = input.value.replace(/[^0-9.]/g, "");
  // Keep only the first dot: split into [integer, decimals...] and rejoin with one dot
  const parts = stripped.split(".");
  const sanitized =
    parts.length > 1 ? parts[0] + "." + parts.slice(1).join("") : parts[0];
  input.value = sanitized;
  // Sync v-model so vee-validate sees the sanitized value
  const fieldName = input.name as keyof typeof form.value;
  if (fieldName in form.value) {
    (form.value as Record<string, unknown>)[fieldName] =
      sanitized === "" ? 0 : Number(sanitized);
  }
};
```

This correctly handles "1.2.3" → "1.23" (all decimal digits preserved, only first dot kept), and "-3.5" → "3.5" (minus stripped), and "1e5" → "15" (e stripped).
  </action>
  <verify>
    <automated>yarn workspace website typecheck 2>&1 | grep -E "FormCreateFour|error TS" | head -20 || echo "No TypeScript errors in FormCreateFour"</automated>
  </verify>
  <done>
    - Pasting "1e5" into any decimal field shows "15"
    - Pasting "1.2.3" shows "1.23"
    - Pasting "-3.5" shows "3.5"
    - Pasting "+3" shows "3"
    - vee-validate receives the numeric value immediately (no need to blur or submit first)
  </done>
</task>

</tasks>

<verification>
After both tasks:
- `yarn workspace website typecheck` passes with no errors in FormCreateFour.vue
- Manual paste test in browser: paste "1e5" into year → field clears; paste "1.2.3" into weight → shows "1.23"
</verification>

<success_criteria>
All numeric fields in FormCreateFour.vue reject invalid paste input immediately at the DOM level:
- year: only digits (0-9), everything else stripped on paste
- weight/width/height/depth: digits and one decimal point only, e/E/+/- and extra dots stripped on paste
- vee-validate v-model sync happens within the same @input handler so validation runs on sanitized value
</success_criteria>

<output>
After completion, create `.planning/quick/11-sanitize-paste-input-in-numeric-fields-o/11-SUMMARY.md` with what was changed, the final function implementations, and confirmation that TypeScript passes.
</output>
