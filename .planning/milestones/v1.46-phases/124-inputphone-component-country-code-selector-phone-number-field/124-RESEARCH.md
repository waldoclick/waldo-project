# Phase 124: InputPhone Component — Research

**Researched:** 2026-04-12
**Domain:** Vue 3 custom input component, country dial-code selector, phone number composition
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Storage:** Option A — emit combined value `+56912345678` into existing `phone` string field. No Strapi schema changes, no new fields.
- **Data source:** Static JSON hardcoded — no external libraries. Schema: `{ name, iso2, dialCode }` (~250 entries). Chile (`+56`, `cl`) is the default.
- **Component API:** v-model emits the full combined number. On receiving an existing value with prefix, decompose it to populate selector + number separately.
- **Scope:** Dashboard: replace `FormProfile.vue` (and any other dashboard form with phone). Website: check and replace all forms with phone input. Component lives in `components/` of each app — duplicate if necessary (no shared layer this phase).
- **Styling:** BEM block `input`, modifier `phone` → root classes `class="input input--phone"`. Native `<select>` (no UI libraries). Project color palette only.

### Claude's Discretion
- Exact filename and location of the countries JSON file within the project
- Whether the component needs its own SCSS or can extend existing styles (it needs its own — `_input.scss` in each app)
- Parsing fallback: if no dialCode matches, default to `+56` (Chile)
- Country order: Chile first, rest alphabetical

### Deferred Ideas (OUT OF SCOPE)
- Per-country phone number format validation (min/max length by country)
- Shared component package between website and dashboard
- Autocomplete/search in the country selector
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PHONE-01 | `InputPhone` component with dial-code `<select>` + phone `<input>`, default Chile +56 | InputAutocomplete.vue pattern; `input--autocomplete` block in `_input.scss` |
| PHONE-02 | v-model emits combined value `+56XXXXXXXXX`; decomposes stored value to pre-populate | defineProps/emit pattern from InputAutocomplete.vue |
| PHONE-03 | Static JSON data source (`{ name, iso2, dialCode }`) — no external deps | Confirmed no phone library in either app's package.json |
| PHONE-04 | Replace phone field in website `FormProfile.vue`, website `FormCreateThree.vue`, and website `FormContact.vue` | Grep confirmed — 3 website files + 1 dashboard file |
| PHONE-05 | Replace phone field in dashboard `FormProfile.vue` (website app, the one under apps/website) | Both FormProfile files confirmed — same file exists only in website, dashboard has no FormProfile |
</phase_requirements>

---

## Summary

This phase introduces `InputPhone`, a composite Vue 3 component that encapsulates a country dial-code `<select>` and a phone `<input>` into a single `v-model`-compatible unit. The component emits the full combined string (e.g. `+56912345678`) and decomposes an existing stored value back into prefix + number on mount. No Strapi schema changes are needed — `phone` is already a plain `string` field in the user schema.

The project has exactly one existing custom input component pattern to follow: `InputAutocomplete.vue` in the dashboard. It uses `defineProps<{ modelValue: string; ... }>()` + `emit('update:modelValue', value)`, wrapped in a `<div class="input input--autocomplete">` root element. The SCSS lives in `_input.scss` with the `.input` block and `.input--autocomplete` modifier. This is the exact pattern to replicate for `.input--phone`.

Four files across both apps currently collect a phone number with a bare `<input>`/`<Field>`: website `FormProfile.vue`, website `FormCreateThree.vue`, website `FormContact.vue`, and — notably — there is no `FormProfile.vue` under `apps/dashboard/app/components/`. The website `FormProfile.vue` lives at `apps/website/app/components/FormProfile.vue` and is the primary replacement target.

**Primary recommendation:** Create `InputPhone.vue` in `apps/website/app/components/` and `apps/dashboard/app/components/`, add `input--phone` styles to each app's `_input.scss`, and replace all four bare phone inputs one by one.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 `defineProps` / `emit` | (bundled) | v-model contract | Native Vue pattern — no extra deps |
| vee-validate `Field` / `ErrorMessage` | (already in project) | Form validation integration | Both apps use vee-validate + yup already |
| yup | (already in project) | Phone schema validation | Already validates phone in all target forms |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Static JSON (project asset) | n/a | Country dial-code data | Imported directly in component |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static JSON | `libphonenumber-js` or `intl-tel-input` | External lib adds ~100 KB; CONTEXT.md locks this as static JSON |
| Native `<select>` | Custom dropdown with search | Deferred by CONTEXT.md |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended Project Structure

```
apps/website/app/
├── components/
│   └── InputPhone.vue            # new component
├── data/
│   └── countries.json            # new static data file (or utils/)
└── scss/components/
    └── _input.scss               # add .input--phone modifier (file exists)

apps/dashboard/app/
├── components/
│   └── InputPhone.vue            # duplicate (same logic, same SCSS block)
└── scss/components/
    └── _input.scss               # add .input--phone modifier (file exists)
```

> The `data/` folder is at Claude's discretion. Alternatively, the JSON can live in `utils/` or be inlined as a `const` in a `composables/useCountries.ts` auto-imported file. Preferred: `app/data/countries.json` imported with `import countries from '~/data/countries.json'` — Vite handles static JSON imports natively.

### Pattern 1: v-model Custom Component (matches InputAutocomplete.vue)

**What:** `defineProps<{ modelValue: string }>()` + `emit('update:modelValue', combined)`. Internal state splits the combined value into `dialCode` and `localNumber` refs.

**When to use:** Always — this is the Vue 3 v-model contract for custom inputs.

```typescript
// Source: apps/dashboard/app/components/InputAutocomplete.vue (existing pattern)
const props = defineProps<{
  modelValue: string;
  // optional: placeholder?, disabled?
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
```

For `InputPhone`, the internal logic:
- On mount / watch `props.modelValue`: parse prefix by trying each country's `dialCode` from longest to shortest, assign `selectedDialCode` + `localNumber`.
- On any change to `selectedDialCode` or `localNumber`: `emit('update:modelValue', selectedDialCode + localNumber)`.

### Pattern 2: BEM Block Structure (matches `input--autocomplete`)

**What:** Root element carries both block and modifier classes. All children are namespaced under the modifier.

```html
<!-- Source: apps/dashboard/app/components/InputAutocomplete.vue -->
<div class="input input--phone">
  <select class="input--phone__select">...</select>
  <input class="input--phone__number" type="tel" />
</div>
```

SCSS structure in `_input.scss`:
```scss
// Source: apps/dashboard/app/scss/components/_input.scss (existing file)
.input {
  &--phone {
    display: flex;
    align-items: stretch;
    border: 2px solid $platinum;
    border-radius: 4px;
    background: white;
    transition: 0.3s;

    &:focus-within {
      border-color: $charcoal;
    }

    &__select {
      // dial-code selector portion
      border: none;
      background: transparent;
      // ...
    }

    &__number {
      // phone number input portion
      border: none;
      flex: 1;
      // ...
    }
  }
}
```

### Pattern 3: vee-validate Integration

Both apps use vee-validate's `<Form>` + `<Field>` + `<ErrorMessage>`. For custom components, `<Field>` can accept `v-slot` or the component can be bound with `v-model` on a reactive ref that `<Field>` is also bound to.

The **existing approach** in both FormProfile files: `<Field v-model="form.phone" name="phone" ... />` — vee-validate's Field component uses `modelValue`/`onUpdate:modelValue` internally, so replacing `<Field ... type="phone" />` with `<InputPhone v-model="form.phone" />` inside a `<Field v-slot="{ field }">` wrapper is the correct pattern.

Concretely:
```html
<!-- Replace bare <Field> for phone with: -->
<div class="form__group">
  <label class="form__label" for="phone">Teléfono *</label>
  <Field v-slot="{ field, meta }" name="phone">
    <InputPhone
      v-bind="field"
      :class="{ 'is-invalid': !meta.valid && meta.touched }"
    />
  </Field>
  <ErrorMessage name="phone" />
</div>
```

Or simpler (since form uses `v-model="form.phone"` and separately passes the Field): keep the existing pattern of binding `form.phone` directly and let yup validate the combined string value.

> **Recommendation:** Use the simpler pattern already in both FormProfile files — `v-model="form.phone"` on `<InputPhone>`. Yup validation rules stay on `form.phone`. The component is just a smart input that happens to emit a formatted combined string.

### Pattern 4: Decomposing Stored Value

The longest-match algorithm avoids ambiguity (e.g. `+1` for USA vs `+1868` for Trinidad):

```typescript
// Pseudocode for parsePhone(value: string): { dialCode: string; localNumber: string }
function parsePhone(value: string): { dialCode: string; localNumber: string } {
  if (!value.startsWith('+')) return { dialCode: '+56', localNumber: value }
  // Sort countries by dialCode length descending to try longest match first
  const sorted = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length)
  for (const country of sorted) {
    if (value.startsWith(country.dialCode)) {
      return { dialCode: country.dialCode, localNumber: value.slice(country.dialCode.length) }
    }
  }
  // Fallback
  return { dialCode: '+56', localNumber: value }
}
```

### Anti-Patterns to Avoid
- **Binding both `v-model` and `value`:** Pick one — use `v-model` on `InputPhone` from the parent, emit `update:modelValue` from within.
- **Using `form-group` / `form-label` classes inside InputPhone:** The component is a leaf input. The surrounding `<div class="form__group">` and label belong to the parent form, not to `InputPhone`.
- **Using a hyphenated standalone class:** Never `phone-input` or `input-phone` — the BEM block is `input`, modifier is `phone`.
- **Inline styles for layout:** Use SCSS only; no `style` bindings for layout concerns.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Country data | Manual list of 20 countries | Full ~250-country JSON | Users change countries; partial list creates support burden |
| Phone regex | Complex per-country regex | Simple yup `.matches(/^[\d\s()+-]+$/)` | Per-country format validation is deferred — simple regex covers the current need |
| Dropdown with search | Custom filterable select | Native `<select>` | Deferred by CONTEXT.md; native select works for ~250 options |

**Key insight:** The combined value (`+56912345678`) is already the format the existing yup schema validates — minimal changes to validation rules needed.

---

## Existing Phone Field Audit (all files to replace)

### Confirmed files with bare phone inputs

| App | File | Class system | Phone binding | Yup rule |
|-----|------|-------------|---------------|----------|
| website | `app/components/FormProfile.vue` | `form-group` / `form-control` | `v-model="form.phone"` | `.min(11).max(20).matches(...)` |
| website | `app/components/FormCreateThree.vue` | `form-group` / `form-control` | `v-model="form.phone"` | `.min(11).max(20).matches(...)` |
| website | `app/components/FormContact.vue` | `form-group` / `form-control` | `v-model="form.phone"` | optional, `.max(20).matches(...)` |
| dashboard | (no FormProfile found) | — | — | — |

> **Important finding:** `apps/dashboard/app/components/FormProfile.vue` does NOT exist. The FormProfile used by the dashboard is the one at `apps/website/app/components/FormProfile.vue` — the website app serves both contexts, or the dashboard onboarding uses the website's component via a shared Nuxt layer. Verify this before planning dashboard tasks.

### SCSS note: class inconsistency between apps

- Dashboard `FormProfile.vue` uses `form__group` / `form__control` (BEM double-underscore)
- Website `FormProfile.vue` and `FormCreateThree.vue` use `form-group` / `form-control` (hyphen, legacy Bootstrap-style)

Both styles already exist in the SCSS files:
- Dashboard `_form.scss`: defines `.form__group`, `.form__label`, `.form__control`
- Website `_form.scss`: defines `.form-group`, `.form-label`, `.form-control`

`InputPhone` should not use either class internally — it manages only `.input--phone__select` and `.input--phone__number`. The parent form wraps it in whatever `form-group` class it already uses.

---

## Strapi `phone` Field Confirmation

Source: `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json`

```json
"phone": {
  "type": "string"
}
```

Confidence: HIGH — verified by reading the schema file directly. No changes needed. The field accepts any string; storing `+56912345678` is valid.

The `userUpdateController.ts` validates `phone` as a required field (`baseRequiredFields` array includes `"phone"`). No format validation happens server-side — the combined string passes through as-is.

---

## Common Pitfalls

### Pitfall 1: Longest-match not applied when decomposing
**What goes wrong:** `+1868912345` parsed as `+1` (USA) + `868912345` instead of `+1868` (Trinidad) + `912345`
**Why it happens:** Iterating countries in arbitrary order, first `+1` wins
**How to avoid:** Sort countries by `dialCode.length` descending before matching
**Warning signs:** Users from small Caribbean/Pacific nations see wrong prefix on edit

### Pitfall 2: `<Field>` wrapper conflicts with `v-model`
**What goes wrong:** Double binding causes the value to be set by both vee-validate and the parent `form` ref, causing validation to not trigger
**Why it happens:** vee-validate's `<Field>` intercepts `modelValue` — if you also bind `v-model` on the component, you get two controllers
**How to avoid:** Use the simpler approach: bind `v-model="form.phone"` on `InputPhone` directly (no `<Field>` wrapper around it), and use a separate `<Field>` with `name="phone"` hidden or a `useField()` composable approach. Alternatively: use `<Field v-slot="{ field }">` and spread `v-bind="field"` onto `InputPhone`.

### Pitfall 3: `form-label` floating over non-input
**What goes wrong:** Label floats incorrectly (CLAUDE.md documents this explicitly)
**Why it happens:** `.form__label` is `position: absolute; top: -6px` — it relies on its parent being `position: relative` with a border the label overlaps
**How to avoid:** The label wrapping `InputPhone` must be in a `form__group` with `position: relative`. Since `InputPhone` itself has `position: relative` and a border, it will work. Do NOT put the label inside `InputPhone`.

### Pitfall 4: Yup min(11) breaks for new InputPhone users
**What goes wrong:** A user selects `+56` and types `9` — value is `+569`, which fails `.min(11)`
**Why it happens:** The existing yup rule was written for the combined format; `+56` is 3 chars, so `.min(11)` requires 8 local digits minimum
**How to avoid:** The rule is correct for the combined format — `.min(11)` still holds since `+56` + 8 digits = 11 chars. Verify the new component always includes the dial code prefix in the emitted value even when the number field is empty.

### Pitfall 5: TypeScript `<script setup>` requirement
**What goes wrong:** The dashboard's `FormProfile.vue` uses `<script setup>` (no `lang="ts"`) while CLAUDE.md requires TypeScript strict mode
**Why it happens:** The website's `FormProfile.vue` still uses plain `<script setup>` (no `lang="ts"`)
**How to avoid:** Write `InputPhone.vue` with `<script setup lang="ts">` from the start. When wiring into existing forms that use plain `<script setup>`, the component still works — TypeScript errors only surface in the component file itself.

---

## Code Examples

### InputPhone.vue skeleton

```typescript
// Source: pattern derived from apps/dashboard/app/components/InputAutocomplete.vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import countries from '~/data/countries.json'

interface Country {
  name: string
  iso2: string
  dialCode: string
}

const typedCountries = countries as Country[]

// Chile first, rest alphabetical
const sortedCountries = computed(() => {
  const chile = typedCountries.find(c => c.iso2 === 'cl')
  const rest = typedCountries
    .filter(c => c.iso2 !== 'cl')
    .sort((a, b) => a.name.localeCompare(b.name))
  return chile ? [chile, ...rest] : rest
})

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedDialCode = ref('+56')
const localNumber = ref('')

function parsePhone(value: string): { dialCode: string; localNumber: string } {
  if (!value || !value.startsWith('+')) {
    return { dialCode: '+56', localNumber: value ?? '' }
  }
  const sorted = [...typedCountries].sort((a, b) => b.dialCode.length - a.dialCode.length)
  for (const country of sorted) {
    if (value.startsWith(country.dialCode)) {
      return { dialCode: country.dialCode, localNumber: value.slice(country.dialCode.length) }
    }
  }
  return { dialCode: '+56', localNumber: value }
}

watch(
  () => props.modelValue,
  (val) => {
    const parsed = parsePhone(val)
    selectedDialCode.value = parsed.dialCode
    localNumber.value = parsed.localNumber
  },
  { immediate: true }
)

function handleChange() {
  emit('update:modelValue', selectedDialCode.value + localNumber.value)
}
</script>

<template>
  <div class="input input--phone">
    <select
      v-model="selectedDialCode"
      class="input--phone__select"
      @change="handleChange"
    >
      <option
        v-for="country in sortedCountries"
        :key="country.iso2"
        :value="country.dialCode"
      >
        {{ country.iso2.toUpperCase() }} {{ country.dialCode }}
      </option>
    </select>
    <input
      v-model="localNumber"
      type="tel"
      class="input--phone__number"
      placeholder="9 XXXX XXXX"
      @input="handleChange"
    />
  </div>
</template>
```

### Countries JSON entry format

```json
[
  { "name": "Chile", "iso2": "cl", "dialCode": "+56" },
  { "name": "Argentina", "iso2": "ar", "dialCode": "+54" },
  ...
]
```

### Yup schema — no changes needed

The existing validation in both FormProfile files:
```typescript
phone: yup
  .string()
  .required('Teléfono es requerido')
  .min(11, 'El teléfono debe tener al menos 11 caracteres')
  .max(20, 'El teléfono no puede exceder los 20 caracteres')
  .matches(
    /^[\d\s()+-]+$/,
    'El teléfono solo puede contener números, +, espacios, paréntesis y guiones'
  )
```

This still works — `+56912345678` is 14 chars, matches the regex, passes min/max. No schema changes needed. The `handlePhoneInput` function currently in both forms that strips characters can be removed once `InputPhone` manages its own input filtering.

### Replacing in FormProfile (website)

```html
<!-- BEFORE -->
<div class="form-group">
  <label class="form-label" for="phone">Teléfono *</label>
  <Field
    v-model="form.phone"
    name="phone"
    type="phone"
    placeholder="5694269xxxx"
    class="form-control"
    @input="handlePhoneInput"
  />
  <ErrorMessage name="phone" />
</div>

<!-- AFTER -->
<div class="form-group">
  <label class="form-label" for="phone">Teléfono *</label>
  <InputPhone v-model="form.phone" name="phone" />
  <ErrorMessage name="phone" />
</div>
```

Remove `handlePhoneInput` function from the script block (no longer needed).

---

## SCSS Addition Required

Both apps need `.input--phone` added to their existing `_input.scss`. The dashboard's file already has `.input--autocomplete`; the website has no `_input.scss` at all (no `components/input` import in website `app.scss`).

**Dashboard:** Add to `apps/dashboard/app/scss/components/_input.scss` — file exists, just extend the `.input` block.

**Website:** Create `apps/website/app/scss/components/_input.scss` and add `@use "components/input"` to `apps/website/app/scss/app.scss`. (No `_input.scss` currently exists in website — confirmed by SCSS file listing.)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<input type="phone">` bare field | `InputPhone` composite component | Phase 124 | Consistent UX, correct dial-code capture |
| `type="phone"` (invalid HTML) | `type="tel"` | Phase 124 | Correct HTML attribute; mobile keyboards show numpad |

**Note:** `type="phone"` used in the existing `FormProfile.vue` is not a valid HTML input type — browsers treat it as `type="text"`. `InputPhone` should use `type="tel"` on the number input to trigger the phone keyboard on mobile.

---

## Open Questions

1. **Dashboard FormProfile location**
   - What we know: `apps/dashboard/app/components/FormProfile.vue` does NOT exist (confirmed by glob + read attempt)
   - What's unclear: Does the dashboard use the website's FormProfile via a Nuxt layer? Or does the dashboard not have a profile form at all?
   - Recommendation: Before planning dashboard tasks, run `grep -r "FormProfile" apps/dashboard/` to check if it's referenced anywhere in dashboard pages. If not, dashboard scope for this phase is zero.

2. **`countries.json` location**
   - What we know: Neither app has a `data/` directory or a countries data file
   - What's unclear: Whether to put it in `app/data/` (non-auto-imported), `app/utils/` (auto-imported as functions, not raw data), or directly inside the component as a `const`
   - Recommendation: `app/data/countries.json` imported with `import countries from '~/data/countries.json'` — explicit, Vite handles JSON imports natively, avoids polluting the utils auto-import namespace with data.

3. **`name` prop on InputPhone for vee-validate**
   - What we know: vee-validate's `ErrorMessage` component needs the `name` to match a registered field
   - What's unclear: Whether `InputPhone` should accept and forward a `name` prop to an internal hidden input for vee-validate registration
   - Recommendation: Do NOT put the `name` prop inside `InputPhone`. Keep `<ErrorMessage name="phone" />` in the parent form and let the parent's `<Field>` or yup schema handle validation on the `form.phone` reactive ref. The component is purely a presentation + composition unit.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @vue/test-utils |
| Config file | `vitest.config.ts` in each app |
| Quick run command | `yarn workspace @waldo/website vitest run tests/components/InputPhone.test.ts` |
| Full suite command | `yarn workspace @waldo/website vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PHONE-01 | Renders select + input, select defaults to Chile +56 | unit | `vitest run tests/components/InputPhone.test.ts` | ❌ Wave 0 |
| PHONE-02 | Emits combined value on change | unit | `vitest run tests/components/InputPhone.test.ts` | ❌ Wave 0 |
| PHONE-02 | Decomposes existing `+56912345678` into +56 + 912345678 | unit | `vitest run tests/components/InputPhone.test.ts` | ❌ Wave 0 |
| PHONE-02 | Fallback to +56 when value has no matching prefix | unit | `vitest run tests/components/InputPhone.test.ts` | ❌ Wave 0 |
| PHONE-03 | No external phone library imported | static/grep | `grep -r "libphonenumber\|intl-tel-input" apps/` | manual |
| PHONE-04 | FormCreateThree.vue no longer has bare phone Field | static/grep | `grep -r 'type="phone"\|type="tel"' apps/website/app/components/FormCreateThree.vue` | manual |
| PHONE-05 | FormProfile.vue no longer has bare phone Field | static/grep | `grep -r 'handlePhoneInput' apps/website/app/components/FormProfile.vue` | manual |

### Suggested Test Cases for `InputPhone.test.ts`

```typescript
// apps/website/tests/components/InputPhone.test.ts
describe('InputPhone', () => {
  describe('PHONE-01: Initial render', () => {
    it('renders a select and an input', ()...)
    it('defaults selected dial code to +56 (Chile) when modelValue is empty', ...)
    it('shows Chile as first option in select', ...)
  })

  describe('PHONE-02: v-model decomposition', () => {
    it('parses +56912345678 into dialCode=+56 and localNumber=912345678', ...)
    it('parses +54912345678 (Argentina) into dialCode=+54 and localNumber=912345678', ...)
    it('uses longest-match: +1868912345 parses as +1868 not +1', ...)
    it('falls back to +56 when value has no matching prefix', ...)
    it('falls back to +56 when value does not start with +', ...)
  })

  describe('PHONE-02: Emit behavior', () => {
    it('emits update:modelValue with combined string when select changes', ...)
    it('emits update:modelValue with combined string when input changes', ...)
    it('emits dialCode + empty string when localNumber is cleared', ...)
  })
})
```

### Sampling Rate
- **Per task commit:** `yarn workspace @waldo/website vitest run tests/components/InputPhone.test.ts`
- **Per wave merge:** `yarn workspace @waldo/website vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/website/tests/components/InputPhone.test.ts` — covers PHONE-01, PHONE-02
- [ ] `apps/website/app/data/countries.json` — data file (not a test file, but needed before component can be implemented)
- [ ] `apps/website/app/scss/components/_input.scss` — new file (website has no input SCSS yet)

---

## Sources

### Primary (HIGH confidence)
- `apps/dashboard/app/components/InputAutocomplete.vue` — canonical existing custom input component pattern
- `apps/dashboard/app/scss/components/_input.scss` — existing `.input` block with `.input--autocomplete` modifier
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — confirmed `phone: { type: "string" }`
- `apps/website/app/components/FormProfile.vue` — confirmed phone field binding and yup schema
- `apps/website/app/components/FormCreateThree.vue` — confirmed phone field binding
- `apps/website/app/components/FormContact.vue` — confirmed phone field (optional)
- `apps/dashboard/app/scss/app.scss` — confirmed `@use "components/input"` already imported
- `apps/website/app/scss/app.scss` — confirmed NO `input` component import (must be added)

### Secondary (MEDIUM confidence)
- CLAUDE.md BEM rules — governs class naming for `input--phone` block structure
- `apps/strapi/src/extensions/users-permissions/controllers/userUpdateController.ts` — confirms `phone` passes through as string with no server-side format enforcement

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from existing project files; no new dependencies
- Architecture: HIGH — directly modeled on InputAutocomplete.vue (existing component in same repo)
- Pitfalls: HIGH — derived from reading actual form code and CLAUDE.md rules
- File scope: HIGH — confirmed by grep + read; one open question about dashboard FormProfile

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable domain — no external library churn)
