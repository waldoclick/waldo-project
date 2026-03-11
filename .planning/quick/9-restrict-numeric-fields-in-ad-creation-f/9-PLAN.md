---
phase: quick-9
plan: 9
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
    - "Users cannot type letters or symbols in price, year, weight, width, height, or depth fields"
    - "Browser number input special keys (e, +, -) are blocked on integer-only fields"
    - "Decimal point is blocked on integer fields (price, year, addressNumber)"
    - "Decimal point is allowed on decimal fields (weight, width, height, depth)"
    - "Yup validation rejects non-numeric values and displays a Spanish error message"
    - "Mobile users see a numeric keypad (inputmode=numeric)"
  artifacts:
    - path: "apps/website/app/components/FormCreateTwo.vue"
      provides: "price field with numeric-only enforcement via keydown + input sanitization"
    - path: "apps/website/app/components/FormCreateFour.vue"
      provides: "year, weight, width, height, depth fields with keydown enforcement"
  key_links:
    - from: "FormCreateTwo.vue price Field"
      to: "handlePriceInput + handlePriceKeydown"
      via: "@keydown and @input event handlers"
      pattern: "handlePriceKeydown"
    - from: "FormCreateFour.vue numeric Fields"
      to: "handleIntegerKeydown / handleDecimalKeydown"
      via: "@keydown event handlers on year and dimension fields"
      pattern: "handleIntegerKeydown|handleDecimalKeydown"
---

<objective>
Prevent non-numeric characters from being entered in numeric fields of the ad creation form.

Purpose: The ad creation multi-step form has several `type="number"` fields (price, year, weight, width, height, depth) that accept letters like `e`, `E`, `+`, `-`, `.` due to browser quirks with number inputs. This causes invalid data to be typed before validation runs.

Output: Updated FormCreateTwo.vue and FormCreateFour.vue with `@keydown` handlers blocking forbidden characters, `inputmode="numeric"` for mobile, and updated Yup schema messages for clarity.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Block non-numeric keys in FormCreateTwo (price field)</name>
  <files>apps/website/app/components/FormCreateTwo.vue</files>
  <action>
The `price` field uses `type="number"` but the browser allows `e`, `E`, `+`, `-`, and `.` as valid keystrokes. The existing `handlePriceInput` only caps the max value — it doesn't strip letters.

**Changes to make:**

1. Add `@keydown="handlePriceKeydown"` and `inputmode="numeric"` to the price `<Field>`:
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

2. Add `handlePriceKeydown` function in `<script setup>` (after `handlePriceInput`):
   ```js
   // Block non-numeric keys: e, E, +, -, . (price is integer-only)
   const handlePriceKeydown = (event: KeyboardEvent) => {
     const blocked = ['e', 'E', '+', '-', '.']
     if (blocked.includes(event.key)) {
       event.preventDefault()
     }
   }
   ```

3. Update the `handlePriceInput` to also strip any non-digit characters that slip through (paste, autofill):
   ```js
   const handlePriceInput = (event: Event) => {
     const input = event.target as HTMLInputElement
     // Remove any non-digit characters (handles paste/autofill edge cases)
     const sanitized = input.value.replace(/[^\d]/g, '')
     form.value.price = sanitized === '' ? '' : Number(sanitized)
     if (form.value.price > 9999999999) {
       form.value.price = 9999999999
     }
   }
   ```

4. Add TypeScript event types to existing handlers. The file uses `<script setup>` without `lang="ts"` — add `lang="ts"` to the script tag since the project uses TypeScript strict mode. Check if the existing handlers already have types; if not, add `(event: Event)` signatures.

**Note on `handlePriceInput` current signature:** The current function takes no arguments and reads `form.value.price` directly. Replace it with the event-based version above so it can sanitize pasted content.

**Yup schema update:** The price validation error message is already good. No change needed there — the `type="number"` ensures the schema receives a number or NaN, and the transform handles empty string.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "FormCreateTwo|error TS" | head -20 || echo "typecheck passed"</automated>
  </verify>
  <done>
    - Price field has `inputmode="numeric"` and `@keydown="handlePriceKeydown"`
    - `handlePriceKeydown` blocks `e`, `E`, `+`, `-`, `.` via `event.preventDefault()`
    - `handlePriceInput` sanitizes pasted non-digit content
    - TypeScript compiles without errors in this file
  </done>
</task>

<task type="auto">
  <name>Task 2: Block non-numeric keys in FormCreateFour (year, weight, width, height, depth)</name>
  <files>apps/website/app/components/FormCreateFour.vue</files>
  <action>
FormCreateFour has 5 `type="number"` fields with NO input handlers at all: `year`, `weight`, `width`, `height`, `depth`. All accept `e`, `E`, `+`, `-` from the browser. Fields `weight`, `width`, `height`, `depth` are decimal values (kg, meters) so `.` should be allowed. `year` is integer-only so `.` must be blocked.

**Changes to make:**

1. Add `lang="ts"` to `<script setup>` tag.

2. Add two keydown handlers in `<script setup>` (after `handleformBack`):
   ```ts
   // Block non-numeric keys for integer fields (year — no decimals allowed)
   const handleIntegerKeydown = (event: KeyboardEvent) => {
     const blocked = ['e', 'E', '+', '-', '.']
     if (blocked.includes(event.key)) {
       event.preventDefault()
     }
   }

   // Block non-numeric keys for decimal fields (weight, width, height, depth — decimal allowed)
   const handleDecimalKeydown = (event: KeyboardEvent) => {
     const blocked = ['e', 'E', '+', '-']
     if (blocked.includes(event.key)) {
       event.preventDefault()
     }
   }
   ```

3. Update the **year** `<Field>` (integer — block all non-numeric including `.`):
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

4. Update **weight**, **width**, **height**, **depth** `<Field>` elements (decimal — allow `.`):
   Add `inputmode="decimal"` and `@keydown="handleDecimalKeydown"` to each. Example for weight:
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
   />
   ```
   Apply the same pattern to `width`, `height`, and `depth` fields.

5. **Yup schema improvement** — add `integer()` validation to `year` so a typed decimal triggers an error message:
   ```ts
   year: yup
     .number()
     .transform((value, originalValue) => {
       if (originalValue === '' || originalValue === null) return null
       return Number(originalValue)
     })
     .nullable()
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
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "FormCreateFour|error TS" | head -20 || echo "typecheck passed"</automated>
  </verify>
  <done>
    - `year` field has `inputmode="numeric"` and `@keydown="handleIntegerKeydown"` (blocks `e E + - .`)
    - `weight`, `width`, `height`, `depth` fields have `inputmode="decimal"` and `@keydown="handleDecimalKeydown"` (blocks `e E + -`, allows `.`)
    - `year` Yup schema includes `.integer()` validation
    - TypeScript compiles without errors in this file
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. Run `cd apps/website && yarn nuxt typecheck` — must complete without TS errors in FormCreateTwo.vue or FormCreateFour.vue
2. Run `yarn lint` from root or `cd apps/website && yarn lint` — no new ESLint errors
3. Manual smoke test: Open ad creation flow, step 2 (datos del producto) — try typing `e`, `+`, `-` in the price field — they must not appear
4. Manual smoke test: Open step 4 (ficha de producto) — try typing `e` in year field — must be blocked; try `1.5` in weight field — decimal should be accepted
</verification>

<success_criteria>
- Typing `e`, `E`, `+`, `-` in price or year fields produces no character in the input
- Typing `.` in price or year fields produces no character (integer-only)
- Typing `.` in weight, width, height, depth fields IS allowed (decimal fields)
- Pasting non-numeric text into price field results in the non-digits being stripped
- TypeScript strict mode passes (`yarn nuxt typecheck`) with no new errors
- Yup validation message appears if somehow an invalid value reaches the schema
</success_criteria>

<output>
After completion, create `.planning/quick/9-restrict-numeric-fields-in-ad-creation-f/9-SUMMARY.md` with what was changed, files modified, and any decisions made.
</output>
