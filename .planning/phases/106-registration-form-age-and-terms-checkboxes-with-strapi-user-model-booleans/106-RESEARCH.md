# Phase 106: Registration Form Age and Terms Checkboxes with Strapi User Model Booleans - Research

**Researched:** 2026-03-29
**Domain:** Nuxt 4 form validation (vee-validate + yup), Strapi v5 user schema extension, boolean fields in registration flow
**Confidence:** HIGH

---

## Summary

Phase 106 adds two consent checkboxes to the registration form: one confirming the user is of legal age and one confirming acceptance of terms and privacy policy. Both consents are stored as boolean fields on the Strapi user model so they can be audited later.

The registration form is a two-step flow in `FormRegister.vue` (step 1: personal info, step 2: email/password). The checkboxes belong on **step 2**, immediately before the submit button, as they are final-confirmation consent fields. They must be required (validated `true`) before the form can submit.

The Strapi side requires: (1) adding `accepted_age_confirmation` and `accepted_terms` boolean fields to the user schema, and (2) updating the `registerUserLocal` controller in `authController.ts` to accept and forward these fields. Both fields are NOT protected by `protect-user-fields.ts` (that middleware targets PUT /api/users/:id, not the register endpoint) and are write-once at registration — no user-editable update path is needed.

**Primary recommendation:** Add two yup boolean `.oneOf([true])` validators in the step-2 schema of `FormRegister.vue`, store fields in the Strapi user schema, pass them through `registerUserLocal`, and update `FormRegister` type + test mocks.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vee-validate | ^4.13.2 (installed: 4.15.1) | Form validation + Field/Form/ErrorMessage components | Already used in FormRegister.vue |
| yup | ^1.4.0 (installed: 1.7.1) | Schema validation | Already used in FormRegister.vue |
| Vitest | ^3.0.9 | Unit testing | Already configured in apps/website/vitest.config.ts |
| Jest | (Strapi app) | Unit testing | Already used for Strapi controller tests |

### No New Dependencies Required
All required libraries are already installed. This phase introduces no new package dependencies.

**Installation:** None required.

---

## Architecture Patterns

### Current FormRegister.vue Two-Step Structure

Step 1 (personal info): `is_company`, `firstname`, `lastname`, `rut`
Step 2 (credentials): `email`, `password`, `confirm_password`
Step 3 (new): checkboxes `accepted_age_confirmation`, `accepted_terms` added to **step 2 schema**

The checkboxes render at the bottom of the `step === 2` div, above the `form__send` buttons. They are NOT a third step — they are consent fields appended to step 2.

### Recommended Project Structure

No new files required beyond the schema JSON addition. Modifications:

```
apps/strapi/src/extensions/users-permissions/
├── content-types/user/schema.json     # add 2 boolean fields
└── controllers/authController.ts      # accept + forward 2 new fields

apps/website/app/
├── components/FormRegister.vue        # add 2 checkbox Fields + validation
├── types/form-register.d.ts           # add 2 boolean fields to FormRegister interface
└── tests/components/FormRegister.test.ts  # update yup mock + add test cases
```

### Pattern 1: Yup boolean required-true validation

**What:** Validate a checkbox must be checked using `yup.boolean().oneOf([true], "message")`
**When to use:** Any required consent checkbox that must be `true` to proceed

```typescript
// Source: vee-validate + yup docs (HIGH confidence — established pattern)
accepted_age_confirmation: yup
  .boolean()
  .oneOf([true], "Debes confirmar que eres mayor de edad")
  .required("Debes confirmar que eres mayor de edad"),
accepted_terms: yup
  .boolean()
  .oneOf([true], "Debes aceptar los términos y políticas de privacidad")
  .required("Debes aceptar los términos y políticas de privacidad"),
```

This must be added to the step 2 `yup.object({...})` in `getSchema()`.

### Pattern 2: vee-validate Field as checkbox

**What:** Using vee-validate's `<Field>` component with `type="checkbox"` and `:value="true"` / `v-model` on a ref boolean.
**When to use:** All checkbox fields in the form.

```html
<!-- Source: vee-validate 4.x docs — Field as checkbox (HIGH confidence) -->
<div class="form-group form-group--checkboxes">
  <label class="form-check-label" for="accepted_age_confirmation">
    <Field
      id="accepted_age_confirmation"
      v-model="form.accepted_age_confirmation"
      name="accepted_age_confirmation"
      type="checkbox"
      class="form-check-input"
      :value="true"
      :unchecked-value="false"
    />
    Confirmo que soy mayor de edad
  </label>
  <ErrorMessage name="accepted_age_confirmation" />
</div>
```

### Pattern 3: Strapi user schema boolean field addition

**What:** Add a boolean field to the users-permissions user schema extension.
**When to use:** Any new user-level boolean that should be persisted.

```json
// Source: /apps/strapi/src/extensions/users-permissions/content-types/user/schema.json
// Pattern established by is_company, pro, pro_pending_invoice fields (HIGH confidence)
"accepted_age_confirmation": {
  "type": "boolean",
  "default": false
},
"accepted_terms": {
  "type": "boolean",
  "default": false
}
```

### Pattern 4: registerUserLocal — accept new fields

**What:** Add the two new fields to the destructured body and the `userData` object in `registerUserLocal`.
**Current code location:** `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`, function `registerUserLocal`.

```typescript
// Source: authController.ts line 77–105 (directly observed — HIGH confidence)
const { is_company, firstname, lastname, email, rut, password, username,
        accepted_age_confirmation, accepted_terms } = ctx.request.body;

// Validation: require both to be true
if (
  is_company === undefined ||
  !firstname || !lastname || !email || !rut || !password || !username ||
  accepted_age_confirmation !== true || accepted_terms !== true
) {
  return ctx.badRequest("All fields are required");
}

const userData = {
  is_company,
  firstname,
  lastname,
  rut,
  email,
  password,
  username,
  accepted_age_confirmation,
  accepted_terms,
};
```

### Pattern 5: FormRegister type extension

**What:** Add two boolean fields to `FormRegister` interface.
**Current file:** `apps/website/app/types/form-register.d.ts`

```typescript
// Source: apps/website/app/types/form-register.d.ts (directly observed — HIGH confidence)
export interface FormRegister {
  is_company: boolean;
  firstname: string;
  lastname: string;
  email: string;
  rut: string;
  password: string;
  confirm_password?: string;
  username: string;
  accepted_age_confirmation: boolean;   // NEW
  accepted_terms: boolean;              // NEW
}
```

### Anti-Patterns to Avoid

- **Adding checkboxes to step 1:** The consent fields are final-confirmation items, not personal info. They belong at the bottom of step 2 before submit.
- **Using `form-label` class on checkbox groups:** Per CLAUDE.md and existing SCSS, `form-label` is `position: absolute; top: -6px` — it floats over input borders. For checkbox groups use a wrapper approach. The existing `form-group--checkboxes` modifier exists in `_form.scss` (`flex-direction: row`) and can be adapted.
- **Using `form-check-input` and `form-check-label` with a separate absolute label:** Checkbox labels are inline — use the standard `form-check` / `form-check-input` / `form-check-label` pattern already present in `_form.scss` (lines 340–371).
- **Making accepted_age_confirmation / accepted_terms protected fields in protect-user-fields.ts:** These are write-once at registration time via the register endpoint (not PUT /api/users/:id), so they need no protection in that middleware. They should be editable only during registration.
- **Sending `accepted_age_confirmation` and `accepted_terms` in the existing form state before the checkbox UI is added:** The `handleSubmit` sends `...form.value` — so the fields must exist in `form` state initialized to `false`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Boolean-must-be-true validation | Custom validator | `yup.boolean().oneOf([true])` | Already in dependency, one-liner |
| Checkbox-to-boolean binding | Custom v-model wrapper | `vee-validate Field type="checkbox" :value="true" :unchecked-value="false"` | Works natively with vee-validate 4.x |
| Server-side consent validation | Separate validation middleware | Simple `!== true` guard in `registerUserLocal` | Field validated client-side first; server guard is a safety net only |

---

## Common Pitfalls

### Pitfall 1: Yup `boolean().oneOf([true])` fails with `undefined` initial value

**What goes wrong:** If `form.accepted_age_confirmation` is initialized as `undefined` (not `false`), yup's `oneOf([true])` check may pass on first render before the user touches the field, or produce confusing validation errors.
**Why it happens:** Yup treats `undefined` differently from `false` depending on `.required()` chaining.
**How to avoid:** Initialize both fields as `false` in the `form` ref: `accepted_age_confirmation: false, accepted_terms: false`.
**Warning signs:** The submit button is enabled before both checkboxes are checked.

### Pitfall 2: Step 1 schema does not know about step 2 fields

**What goes wrong:** vee-validate's `Form` validates against the current `schema.value`. If the schema does not include `accepted_age_confirmation` and `accepted_terms` in step 2, the form will be valid without them.
**Why it happens:** `getSchema()` returns a fresh yup object per step — if the step 2 schema object() doesn't include the new fields, validation is skipped.
**How to avoid:** Add both fields explicitly to the `yup.object({...})` returned when `step.value === 2`.

### Pitfall 3: `confirm_password` delete before submit breaks field initialization

**What goes wrong:** `handleSubmit` does `delete form.value.confirm_password` before sending. If `accepted_age_confirmation` or `accepted_terms` are similarly removed at submit time, they won't reach Strapi.
**Why it happens:** The current code explicitly deletes `confirm_password` to avoid sending it to Strapi. The new fields should NOT be deleted.
**How to avoid:** Don't add them to any deletion list — they should remain in the spread `...form.value` that goes to the API body.

### Pitfall 4: FormRegister.test.ts yup mock needs boolean extension

**What goes wrong:** The existing yup mock in `FormRegister.test.ts` mocks `yup.boolean()` returning an object with `.required()` only. The new validation uses `.oneOf()` chained after `.boolean()`, which isn't in the mock.
**Why it happens:** The mock was built for the existing `is_company: yup.boolean().required(...)` only.
**How to avoid:** Extend the yup mock to add `.oneOf()` to the boolean chain: `boolean: vi.fn(() => ({ required: vi.fn().mockReturnThis(), oneOf: vi.fn().mockReturnThis() }))`.

### Pitfall 5: Strapi registration endpoint strips unknown fields

**What goes wrong:** Strapi's built-in `register` controller only passes through a known set of fields. Custom fields added to the body but not to `userData` in `registerUserLocal` are silently dropped.
**Why it happens:** `registerUserLocal` explicitly constructs `userData` — any field not in that object is never written to the DB.
**How to avoid:** Explicitly add `accepted_age_confirmation` and `accepted_terms` to the `userData` object in `registerUserLocal`.

---

## Code Examples

### Verified: Current form ref initialization (step to follow)

```typescript
// Source: apps/website/app/components/FormRegister.vue lines 154–162 (directly observed)
const form = ref<FormRegister>({
  is_company: false,
  firstname: "",
  lastname: "",
  email: "",
  rut: "",
  password: "",
  username: "",
  // Add:
  accepted_age_confirmation: false,
  accepted_terms: false,
});
```

### Verified: Existing checkbox SCSS classes in _form.scss

```scss
// Source: apps/website/app/scss/components/_form.scss lines 340–371 (directly observed)
.form-check {
  display: flex;
  align-items: center;
  margin-right: 20px;

  &-input {
    height: 20px;
    width: 20px;
    border: 2px solid $charcoal;
    border-radius: 100%;
    -webkit-appearance: none;
    cursor: pointer;
    &:checked { background: $light_peach; }
  }

  &-label {
    font-size: 14px;
    font-weight: 600;
    color: $charcoal;
    padding-left: 10px;
  }
}

.form-group--checkboxes {
  flex-direction: row;
}
```

**Note:** `form-check-input` uses `border-radius: 100%` — it renders as a circle, not a square. This is the established visual style for all checkboxes in this project.

### Verified: Existing registerUserLocal field destructuring and validation

```typescript
// Source: apps/strapi/src/extensions/users-permissions/controllers/authController.ts lines 77–105
// Extend to:
const { is_company, firstname, lastname, email, rut, password, username,
        accepted_age_confirmation, accepted_terms } = ctx.request.body;

if (
  is_company === undefined || !firstname || !lastname || !email || !rut ||
  !password || !username ||
  accepted_age_confirmation !== true || accepted_terms !== true
) {
  return ctx.badRequest("All fields are required");
}
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.0.9 (website) / Jest (Strapi) |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `cd apps/website && yarn test --run tests/components/FormRegister.test.ts` |
| Full suite command | `cd apps/website && yarn test --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REG-01 | Checkboxes are required — submit blocked when unchecked | unit | `cd apps/website && yarn test --run tests/components/FormRegister.test.ts` | Extend existing |
| REG-02 | Checked checkboxes allow form submission with correct body | unit | Same as above | Extend existing |
| REG-03 | registerUserLocal rejects request when accepted_terms != true | unit | `cd apps/strapi && yarn test --testPathPattern=authController` | Extend existing |
| REG-04 | New fields are stored in Strapi user record | integration/manual | Manual Strapi admin check | N/A |

### Wave 0 Gaps

- [ ] `FormRegister.test.ts` yup mock needs `.oneOf` chained method added to the `boolean()` mock
- [ ] `authController.test.ts` needs 1-2 new test cases: (a) missing/false accepted_terms returns 400; (b) both true → registration proceeds

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Bare `<input type="checkbox">` | vee-validate `<Field type="checkbox">` with yup schema | Existing project pattern | Consistent validation UX |
| Schema-less boolean storage | Explicit boolean with `default: false` in schema.json | Already established in this project | Clean DB defaults |

---

## Open Questions

1. **Where should the Privacy Policy link point?**
   - What we know: `/politicas-de-privacidad` page exists
   - What's unclear: Should the label read "Acepto los Términos y Condiciones" or "Acepto las Políticas de Privacidad" — or both together in one label?
   - Recommendation: Use one combined label "Acepto los términos y las [políticas de privacidad](/politicas-de-privacidad)" with a NuxtLink inside the label text. This is common UX for registration forms and avoids two separate checkboxes for closely related concepts. If both are separate legal requirements, keep them separate.

2. **Should the consent timestamp be stored?**
   - What we know: Only boolean fields are described in the phase name — no timestamp fields mentioned
   - What's unclear: Whether audit requirements demand a timestamp alongside the boolean
   - Recommendation: Start with booleans only. A `accepted_terms_at: datetime` field can be added in a follow-up if needed. The `createdAt` Strapi auto-field on the user record effectively serves as the acceptance timestamp for now.

3. **What is the minimum age?**
   - What we know: The checkbox confirms "I am of legal age" — the number is not specified
   - What's unclear: Whether the label says "soy mayor de 18 años" or "soy mayor de edad"
   - Recommendation: Use "soy mayor de edad" (no specific age) for legal flexibility — this is standard Chilean registration form practice.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `apps/website/app/components/FormRegister.vue` — complete form structure, validation pattern, submission handler
- Direct code inspection: `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — current field list, existing boolean field patterns
- Direct code inspection: `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — `registerUserLocal` implementation
- Direct code inspection: `apps/website/app/scss/components/_form.scss` — `form-check`, `form-check-input`, `form-check-label`, `form-group--checkboxes` classes
- Direct code inspection: `apps/website/app/types/form-register.d.ts` — current `FormRegister` interface
- Direct code inspection: `apps/website/tests/components/FormRegister.test.ts` — test structure and existing yup mock

### Secondary (MEDIUM confidence)
- npm registry: vee-validate 4.15.1 (installed), yup 1.7.1 (installed) — current versions confirmed via `npm view`
- vee-validate 4.x docs: `<Field type="checkbox" :value="true" :unchecked-value="false">` — standard checkbox binding pattern

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use
- Architecture patterns: HIGH — derived from direct inspection of existing identical patterns in the codebase
- Pitfalls: HIGH — derived from reading actual code paths that the new feature touches
- Test requirements: HIGH — test infrastructure exists, only mock extension needed

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable stack, 30 days)
