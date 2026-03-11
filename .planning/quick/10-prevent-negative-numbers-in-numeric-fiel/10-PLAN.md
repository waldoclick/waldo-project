---
phase: quick-10
plan: 10
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/components/FormCreateTwo.vue
  - apps/website/app/components/FormCreateFour.vue
autonomous: true
requirements: []

must_haves:
  truths:
    - "Price field rejects negative values at HTML, Yup, and paste levels"
    - "Year field rejects negative values at HTML and Yup levels"
    - "Decimal fields (weight, width, height, depth) sanitize pasted negative values"
    - "Form cannot be submitted with any negative numeric value"
    - "Spanish validation messages shown when a negative value is entered"
  artifacts:
    - path: "apps/website/app/components/FormCreateTwo.vue"
      provides: "price field with min=0 HTML attribute and paste-safe sanitization"
    - path: "apps/website/app/components/FormCreateFour.vue"
      provides: "year with min=0 + Yup .min(0); decimal fields with paste sanitization"
  key_links:
    - from: "FormCreateTwo.vue price <Field>"
      to: "handlePriceInput + Yup .positive()"
      via: "min=0 HTML attribute + existing keydown + input sanitization"
      pattern: "min=\"0\""
    - from: "FormCreateFour.vue year <Field>"
      to: "Yup year schema"
      via: "min=0 HTML attribute + .min(0) Yup rule"
      pattern: "min.*0.*año"
    - from: "FormCreateFour.vue decimal fields"
      to: "handleDecimalInput sanitizer"
      via: "@input event on weight, width, height, depth"
      pattern: "handleDecimalInput"
---

<objective>
Complete negative-number prevention in all numeric fields of the ad creation form by adding `min="0"` HTML attributes, a Yup `.min(0)` rule on `year`, and paste-event sanitization on decimal fields.

Purpose: Quick task 9 blocked the `-` key via keydown handlers. However, three gaps remain: (1) the price `<Field>` has no `min="0"` HTML attribute; (2) the year `<Field>` has no `min="0"` attribute and its Yup schema has no `.min(0)` rule, so a pasted negative year passes validation; (3) the decimal fields (weight, width, height, depth) have `min="0"` and Yup `.min(0)` but no `@input` sanitizer, so pasting a negative decimal bypasses keydown blocking and only fails at submit time.

Output: Updated FormCreateTwo.vue (min="0" on price) and FormCreateFour.vue (min="0" + Yup .min(0) on year; @input paste sanitizer on all decimal fields).
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/9-restrict-numeric-fields-in-ad-creation-f/9-SUMMARY.md

<interfaces>
<!-- Current state after quick task 9 — no changes needed to these patterns -->

FormCreateTwo.vue — price field (lines 74-84):
```html
<Field
  v-model="form.price"
  name="price"
  type="number"
  class="form-control"
  maxlength="10"
  inputmode="numeric"
  @keydown="handlePriceKeydown"
  @input="handlePriceInput"
/>
```
handlePriceInput already sanitizes paste with `/\D/g` — strips all non-digits including `-`.
Yup: .positive() rejects ≤ 0. Missing: min="0" HTML attribute.

FormCreateFour.vue — year field (lines 96-107):
```html
<Field
  v-model="form.year"
  name="year"
  type="number"
  class="form-control"
  maxlength="4"
  inputmode="numeric"
  @keydown="handleIntegerKeydown"
/>
```
Yup year schema: .nullable() .integer() .max(currentYear) — NO .min(0). Missing: min="0" HTML attr + Yup .min(0).

FormCreateFour.vue — decimal fields (weight, width, height, depth): already have min="0" HTML and Yup .min(0), but NO @input sanitizer for paste. A pasted negative value reaches the Yup check and shows error only at submit time.

handleDecimalKeydown (already exists):
```ts
const handleDecimalKeydown = (event: KeyboardEvent) => {
  const blocked = ['e', 'E', '+', '-']
  if (blocked.includes(event.key)) {
    event.preventDefault()
  }
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add min="0" to price field in FormCreateTwo</name>
  <files>apps/website/app/components/FormCreateTwo.vue</files>
  <action>
The price field is already guarded by `handlePriceKeydown` (blocks `-`) and `handlePriceInput` (strips non-digits from paste via `/\D/g`). The only gap is the missing `min="0"` HTML attribute, which provides a browser-native guard for assistive technology, programmatic input, and browser validation.

**One change only:**

Add `min="0"` to the price `<Field>` in the template (line 74–83). The field currently has `maxlength="10"` and `inputmode="numeric"`. Add `min="0"` after `maxlength`:

```html
<Field
  v-model="form.price"
  name="price"
  type="number"
  class="form-control"
  min="0"
  maxlength="10"
  inputmode="numeric"
  @keydown="handlePriceKeydown"
  @input="handlePriceInput"
/>
```

**Do NOT change:**
- The Yup schema: `.positive()` already rejects 0 and negatives — correct for price (must be > 0).
- `handlePriceInput`: already sanitizes paste with `/\D/g`, stripping `-` from pasted values.
- Any other field or handler.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "FormCreateTwo|error TS" | head -20 || echo "typecheck passed"</automated>
  </verify>
  <done>
    - Price `<Field>` has `min="0"` attribute
    - TypeScript compiles without errors in FormCreateTwo.vue
  </done>
</task>

<task type="auto">
  <name>Task 2: Add min="0" + Yup .min(0) to year, and paste sanitizer to decimal fields in FormCreateFour</name>
  <files>apps/website/app/components/FormCreateFour.vue</files>
  <action>
Three gaps in FormCreateFour:

**Gap A — year field: add `min="0"` HTML attribute**

Update the year `<Field>` (currently lines 96–107) to add `min="0"`:

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
/>
```

**Gap B — year Yup schema: add `.min(0)`**

The current schema for `year` has `.nullable()`, `.integer()`, and `.max(currentYear)` but no lower bound. A pasted `-2024` would pass keydown (it's a paste, not a key) and the Yup schema would accept it (no `.min(0)`).

Update the Yup `year` rule to add `.min(0, 'El año no puede ser negativo')` after `.nullable()`:

```ts
year: yup
  .number()
  .transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null) return null
    return Number(originalValue)
  })
  .nullable()
  .min(0, 'El año no puede ser negativo')
  .integer('El año debe ser un número entero')
  .max(
    new Date().getFullYear(),
    `El año no puede ser mayor a ${new Date().getFullYear()}`,
  )
  .test('len', 'El año debe tener como máximo 4 dígitos', (value) => {
    if (value === null || value === undefined) return true
    return String(value).length <= 4
  }),
```

**Gap C — decimal fields: add `@input` paste sanitizer**

Weight, width, height, and depth already have `min="0"` HTML and Yup `.min(0)`. However, pasting a negative value (e.g. `-5.5`) bypasses the keydown handler and only fails at Yup validation — the invalid value remains in the input until the user submits. Add an `@input` sanitizer that removes the negative sign immediately on paste.

Add `handleDecimalInput` function in `<script setup>` (after `handleDecimalKeydown`):

```ts
// Sanitize paste/autofill for decimal fields — remove leading minus sign
const handleDecimalInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.value.startsWith('-')) {
    input.value = input.value.replace(/^-+/, '')
    // Trigger Vue reactivity — vee-validate reads from DOM on input event
  }
}
```

Add `@input="handleDecimalInput"` to **all four** decimal fields: weight, width, height, depth. Example for weight:

```html
<Field
  v-model="form.weight"
  name="weight"
  type="number"
  class="form-control"
  min="0"
  maxlength="7"
  inputmode="decimal"
  @keydown="handleDecimalKeydown"
  @input="handleDecimalInput"
/>
```

Apply the same `@input="handleDecimalInput"` addition to width, height, and depth fields.

**Do NOT change:**
- The condition, manufacturer, model, serial_number fields — they are not numeric.
- The weight/width/height/depth Yup schemas — `.min(0)` is already present and correct.
- The `handleDecimalKeydown` function — already correct.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "FormCreateFour|error TS" | head -20 || echo "typecheck passed"</automated>
  </verify>
  <done>
    - Year `<Field>` has `min="0"` attribute
    - Year Yup schema has `.min(0, 'El año no puede ser negativo')`
    - `handleDecimalInput` function added to script
    - Weight, width, height, depth fields each have `@input="handleDecimalInput"`
    - TypeScript compiles without errors in FormCreateFour.vue
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. `cd apps/website && yarn nuxt typecheck` — must pass with zero errors in FormCreateTwo.vue and FormCreateFour.vue
2. `cd apps/website && yarn lint` — no new ESLint errors
3. Manual: Open ad creation step 2 — paste `-500` into price field → value should appear as `500` (sanitized by handlePriceInput)
4. Manual: Open ad creation step 4 — paste `-2020` into year field → Yup error "El año no puede ser negativo" must appear; form submit must be blocked
5. Manual: Open ad creation step 4 — paste `-5.5` into weight field → leading minus removed immediately by handleDecimalInput; field shows `5.5`
</verification>

<success_criteria>
- Price `<Field>` has `min="0"` HTML attribute
- Year `<Field>` has `min="0"` HTML attribute and Yup `.min(0, 'El año no puede ser negativo')`
- Decimal fields have `@input="handleDecimalInput"` that strips leading `-` on paste
- TypeScript strict mode passes — `yarn nuxt typecheck` with no new errors
- Form cannot be submitted with a negative value in any numeric field
- Spanish error messages appear when a negative value is entered
</success_criteria>

<output>
After completion, create `.planning/quick/10-prevent-negative-numbers-in-numeric-fiel/10-SUMMARY.md` with what was changed, files modified, and any decisions made.
</output>
