---
phase: quick-29
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/InputAutocomplete.vue
  - apps/dashboard/app/scss/components/_input.scss
  - apps/dashboard/app/scss/app.scss
  - apps/dashboard/app/components/FormGift.vue
autonomous: true
requirements: [QUICK-29]

must_haves:
  truths:
    - "InputAutocomplete renders a text input with form__control styling"
    - "Typing filters the dropdown list in real time"
    - "Clicking a dropdown item emits update:modelValue and closes the dropdown"
    - "Free text entry alone does NOT emit a value"
    - "FormGift uses InputAutocomplete instead of the separate search input + select"
    - "The userId Field in FormGift still validates correctly via vee-validate"
  artifacts:
    - path: "apps/dashboard/app/components/InputAutocomplete.vue"
      provides: "Reusable autocomplete input component"
      exports: ["modelValue", "options", "placeholder"]
    - path: "apps/dashboard/app/scss/components/_input.scss"
      provides: "BEM styles for input--autocomplete"
      contains: "input--autocomplete"
    - path: "apps/dashboard/app/scss/app.scss"
      provides: "SCSS entry point with _input.scss imported"
      contains: "@use \"components/input\""
  key_links:
    - from: "apps/dashboard/app/components/InputAutocomplete.vue"
      to: "apps/dashboard/app/components/FormGift.vue"
      via: "v-model binding on InputAutocomplete sets form.userId"
      pattern: "InputAutocomplete.*v-model"
---

<objective>
Create the `InputAutocomplete.vue` component — a reusable text input that shows a filtered dropdown as the user types and only emits a value when the user selects an item. Then replace the two-field "Buscar usuario + select" pattern in FormGift with this single component.

Purpose: Simplify the user-selection UX in FormGift and provide a generic autocomplete primitive for future forms.
Output: InputAutocomplete.vue, _input.scss, updated app.scss import, updated FormGift.vue
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

@apps/dashboard/app/components/FormGift.vue
@apps/dashboard/app/scss/components/_form.scss
@apps/dashboard/app/scss/abstracts/_variables.scss
@apps/dashboard/app/scss/app.scss

<interfaces>
<!-- Key shape used in FormGift today -->
interface IAuthUser {
  id: number;
  firstName: string;
  lastName: string;
}

<!-- InputAutocomplete props contract -->
interface InputAutocompleteProps {
  modelValue: string;       // selected value (the option's `value` field)
  options: { label: string; value: string }[];
  placeholder?: string;
}

<!-- InputAutocomplete emits -->
emit('update:modelValue', value: string)  // only on explicit item selection
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create InputAutocomplete.vue component</name>
  <files>apps/dashboard/app/components/InputAutocomplete.vue</files>
  <action>
Create `apps/dashboard/app/components/InputAutocomplete.vue` using `<script setup lang="ts">` with the following behaviour:

**Props:**
```ts
const props = defineProps<{
  modelValue: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();
```

**Internal state:**
- `query` ref — tracks what the user has typed in the input
- `isOpen` ref — controls dropdown visibility
- `inputRef` — template ref on the `<input>` for focus management

**Filtering:**
```ts
const filtered = computed(() =>
  props.options.filter(o =>
    o.label.toLowerCase().includes(query.value.trim().toLowerCase())
  )
);
```

**Template structure** (BEM: block=`input`, modifier=`autocomplete`):
```html
<div class="input input--autocomplete">
  <input
    ref="inputRef"
    v-model="query"
    type="text"
    class="form__control"
    :placeholder="placeholder"
    autocomplete="off"
    @focus="isOpen = true"
    @blur="handleBlur"
  />
  <ul v-if="isOpen && filtered.length > 0" class="input--autocomplete__dropdown">
    <li
      v-for="option in filtered"
      :key="option.value"
      class="input--autocomplete__dropdown__item"
      @mousedown.prevent="selectOption(option)"
    >
      {{ option.label }}
    </li>
  </ul>
  <p v-if="isOpen && query && filtered.length === 0" class="input--autocomplete__empty">
    Sin resultados
  </p>
</div>
```

**Key implementation details:**
- Use `@mousedown.prevent` on list items (not `@click`) so the `@blur` fires AFTER the selection is captured.
- `handleBlur`: `setTimeout(() => { isOpen.value = false; }, 150)` — gives mousedown time to fire first.
- `selectOption(option)`: sets `query.value = option.label`, emits `update:modelValue` with `option.value`, sets `isOpen.value = false`.
- When `modelValue` prop changes to `''` (form reset), also reset `query` to `''`. Use a `watch(() => props.modelValue, ...)` for this.

Do NOT emit on free text — only `selectOption` triggers the emit.
  </action>
  <verify>
    <automated>cd apps/dashboard && yarn nuxt typecheck 2>&1 | grep -i "InputAutocomplete" | head -20 || echo "No typecheck errors for InputAutocomplete"</automated>
  </verify>
  <done>InputAutocomplete.vue exists, filters options on input, only emits on item click, resets on external modelValue clear</done>
</task>

<task type="auto">
  <name>Task 2: Add _input.scss and import in app.scss</name>
  <files>
    apps/dashboard/app/scss/components/_input.scss
    apps/dashboard/app/scss/app.scss
  </files>
  <action>
Create `apps/dashboard/app/scss/components/_input.scss`:

```scss
@use "../abstracts/variables" as *;

.input {
  &--autocomplete {
    position: relative;
    width: 100%;

    &__dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background-color: white;
      border: 2px solid $charcoal;
      border-top: none;
      border-radius: 0 0 4px 4px;
      list-style: none;
      margin: 0;
      padding: 0;
      z-index: 10;
      max-height: 200px;
      overflow-y: auto;

      &__item {
        padding: 10px 12px;
        font-size: 14px;
        color: $charcoal;
        cursor: pointer;
        transition: background-color 0.15s ease;

        &:hover {
          background-color: $platinum;
        }
      }
    }

    &__empty {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background-color: white;
      border: 2px solid $charcoal;
      border-top: none;
      border-radius: 0 0 4px 4px;
      padding: 10px 12px;
      font-size: 14px;
      color: rgba($charcoal, 0.5);
      z-index: 10;
      margin: 0;
    }
  }
}
```

Then add the import to `apps/dashboard/app/scss/app.scss` after the `upload` line:
```scss
@use "components/input";
```
  </action>
  <verify>
    <automated>cd apps/dashboard && yarn nuxt build 2>&1 | grep -i "scss\|sass\|input" | grep -i "error" | head -10 || echo "SCSS compiles OK"</automated>
  </verify>
  <done>_input.scss exists with input--autocomplete BEM styles, app.scss imports it without errors</done>
</task>

<task type="auto">
  <name>Task 3: Replace two-field pattern in FormGift with InputAutocomplete</name>
  <files>apps/dashboard/app/components/FormGift.vue</files>
  <action>
Update `FormGift.vue` to replace the "Buscar usuario" input + "Usuario" select with a single `InputAutocomplete`.

**Changes:**

1. Remove the `userSearch` ref and `filteredUsers` computed entirely — the component handles filtering internally.

2. Build an `options` computed from the `users` array:
```ts
const userOptions = computed(() =>
  users.value.map(u => ({
    label: `${u.firstName} ${u.lastName}`,
    value: String(u.id),
  }))
);
```

3. Replace the two `form__group` divs (search + select) with one group:
```html
<div class="form__group form__group--upload">
  <label class="form__label">Usuario</label>
  <InputAutocomplete
    v-model="form.userId"
    :options="userOptions"
    :placeholder="usersLoading ? 'Cargando usuarios...' : 'Buscar usuario...'"
  />
  <ErrorMessage name="userId" />
</div>
```

Use `form__group--upload` modifier so the label renders `position: static` (not floating) — per AGENTS.md rule: "Never use `form__label` directly on upload, gallery, or other non-input blocks".

4. Remove unused imports: `userSearch` ref usage, `filteredUsers`. Keep `Field` import only for the quantity field.

5. The `form.userId` reset in the `watch` block (`form.value = { quantity: '1', userId: '' }`) remains — InputAutocomplete's internal watcher on `modelValue` will clear its query display automatically.

6. The vee-validate `Field` for `userId` is removed from the template; validation now relies on the hidden value in `form.userId`. Since vee-validate's `Form` component validates via the schema, ensure the userId field is still validated: keep `name="userId"` on a hidden `Field` or use `useField('userId')` approach. Simplest: keep a hidden `<Field name="userId" v-model="form.userId" type="hidden" />` so vee-validate tracks the value.

TypeScript: no `any`, import `InputAutocomplete` is auto-imported by Nuxt so no explicit import needed.
  </action>
  <verify>
    <automated>cd apps/dashboard && yarn nuxt typecheck 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20 || echo "Typecheck passed"</automated>
  </verify>
  <done>FormGift has a single InputAutocomplete for user selection; selecting a user populates form.userId; vee-validate still enforces userId is required; free text alone does not enable submission</done>
</task>

</tasks>

<verification>
1. `yarn nuxt typecheck` in apps/dashboard passes with no new errors
2. InputAutocomplete filters options as the user types
3. Selecting a user sets form.userId and closes the dropdown
4. Clearing selection (or form reset) clears the input display
5. Submitting FormGift with no user selected shows the vee-validate error
</verification>

<success_criteria>
- InputAutocomplete.vue exists and is a generic reusable component
- BEM classes `input input--autocomplete` on root element, `form__control` on the input
- _input.scss added and imported in app.scss
- FormGift uses one InputAutocomplete field replacing the two prior fields
- No TypeScript errors introduced
</success_criteria>

<output>
After completion, create `.planning/quick/29-create-inputautocomplete-vue-component-w/29-SUMMARY.md` following the summary template.
</output>
