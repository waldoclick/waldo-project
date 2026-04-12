---
phase: quick-260411-sox
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/composables/useRut.ts
  - apps/website/app/components/FormProfile.vue
autonomous: false
requirements:
  - SOX-01  # Onboarding submit button must enable when form is valid
  - SOX-02  # RUT formatter must not produce malformed values
  - SOX-03  # Onboarding mode must not require hasChanges to submit

must_haves:
  truths:
    - "User completing the onboarding form with valid data can click Actualizar/Continuar and submit"
    - "RUT input never displays a value with more than one verification digit (e.g. no '11.777.709-2752')"
    - "formatRut always produces a well-formed Chilean RUT string (max 9 clean chars: 8 digit body + 1 DV)"
    - "In onboarding mode, the submit button is enabled when meta.valid is true, regardless of hasChanges"
    - "If the stored user.rut is invalid, the watcher normalizes it on first mount so validateRut can succeed once user corrects it"
  artifacts:
    - path: "apps/website/app/composables/useRut.ts"
      provides: "formatRut that caps input to 9 clean chars and validateRut that returns a clear boolean"
      contains: "slice(0, 9)"
    - path: "apps/website/app/components/FormProfile.vue"
      provides: "Submit button enabled when onboardingMode && meta.valid (hasChanges only gates profile-edit mode)"
      contains: "onboardingMode"
  key_links:
    - from: "FormProfile.vue submit button :disabled"
      to: "meta.valid from vee-validate + props.onboardingMode"
      via: "computed disabled state"
      pattern: ":disabled=\"!meta.valid \\|\\| sending \\|\\| \\(!props.onboardingMode && !hasChanges\\)\""
    - from: "FormProfile.vue watch(form.value.rut)"
      to: "useRut.formatRut"
      via: "watcher that reformats on every input"
      pattern: "formatRut"
---

<objective>
Fix the onboarding blocker where the submit button stays disabled even though all fields look filled in.

Purpose: A first-login user on `/onboarding` cannot proceed past the profile form. Root causes identified:
1. `formatRut` in `useRut.ts` does not cap the cleaned RUT to 9 characters, so any prefilled or pasted value longer than 9 clean chars (e.g. seeded junk like `117777092752K`) produces a malformed string like `11.777.709-2752` that silently fails `validateRut` — the button stays disabled with no visible error tied to the RUT field.
2. In `FormProfile.vue`, the submit button is gated by `!hasChanges`. In onboarding mode, if `user.value.rut` was pre-seeded with an invalid value and the user types no other changes, `hasChanges` stays `false` and blocks submission even when the rest of the form is valid.
3. Onboarding mode should NOT require `hasChanges` — a fresh user may legitimately submit the form without having "changed" anything compared to whatever half-populated data Strapi returned.

Output: Users on `/onboarding` can submit the form as soon as all validation passes; RUT field is always clamped to a valid Chilean RUT shape; `!hasChanges` only gates the profile-edit flow (`/cuenta/perfil/editar`), not onboarding.
</objective>

<context>
@.planning/STATE.md
@CLAUDE.md
@apps/website/app/composables/useRut.ts
@apps/website/app/components/FormProfile.vue
@apps/website/app/components/OnboardingDefault.vue
@apps/website/app/pages/onboarding/index.vue
@apps/website/tests/components/FormProfile.onboarding.test.ts

<interfaces>
Key contracts the executor needs. Extracted from codebase.

From `apps/website/app/composables/useRut.ts`:
```ts
export function useRut(): {
  formatRut: (rut: string) => string;   // currently does NOT cap length
  validateRut: (rut: string) => boolean; // rejects length < 8 or > 9 cleaned chars
};
```

Current `formatRut` behaviour (the bug):
```ts
rut = rut.replace(/[^\dKk]/g, "");
// NO length cap here — needs rut = rut.slice(0, 9) BEFORE the slice/dot logic
if (rut.length > 1) {
  rut = rut.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + rut.slice(-1);
}
return rut.toUpperCase();
```

From `apps/website/app/components/FormProfile.vue`:
```vue
<button
  :disabled="!meta.valid || sending || !hasChanges"
  type="submit"
  class="btn btn--block btn--buy"
>
```

Prop contract:
```ts
defineProps({ onboardingMode: { type: Boolean, default: false } });
```

`hasChanges` computed compares every key in `form.value` against `initialFormValues.value`.

From `apps/website/tests/components/FormProfile.onboarding.test.ts` — existing tests assert:
- `onboardingMode` prop defaults to `false` (FORM-02)
- When `onboardingMode === true`, no redirect after success (FORM-02)
- When `onboardingMode === false`, redirect to `/cuenta/perfil` (FORM-03)

These tests must keep passing. New tests must NOT change redirect behaviour.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Cap formatRut input to 9 clean chars and add unit tests</name>
  <files>apps/website/app/composables/useRut.ts, apps/website/tests/composables/useRut.test.ts</files>
  <behavior>
    Unit tests for `formatRut`:
    - formatRut("11777709K") → "11.777.709-K"
    - formatRut("117777092") → "11.777.709-2"
    - formatRut("117777092752K") → "11.777.709-2"  (capped to first 9 chars, NOT "11.777.709-2752")
    - formatRut("11.777.709-2") → "11.777.709-2"   (idempotent)
    - formatRut("") → ""
    - formatRut("abc") → ""
    - formatRut("11-777-709-k") → "11.777.709-K"   (strips separators, uppercases K)

    Unit tests for `validateRut` (already exists, just add coverage for the fix path):
    - validateRut("11.111.111-1") → true
    - validateRut("12.345.678-5") → true (or whatever the real DV is — compute it)
    - validateRut("11.777.709-2752") → false  (regression guard: the malformed form from the bug)
    - validateRut("") → false
    - validateRut("123") → false
  </behavior>
  <action>
    1. Open `apps/website/app/composables/useRut.ts`.
    2. In `formatRut`, immediately after `rut = rut.replace(/[^\dKk]/g, "");` add a length cap:
       ```ts
       // Cap to max 9 chars: 8-digit body + 1 DV (digit or K). Prevents malformed
       // values like "11.777.709-2752" from pre-seeded or pasted junk data which
       // silently fail validateRut and block the onboarding submit button.
       if (rut.length > 9) {
         rut = rut.slice(0, 9);
       }
       ```
    3. Do NOT touch `validateRut` logic — it is already correct. Only add tests.
    4. Create `apps/website/tests/composables/useRut.test.ts` following the existing test patterns in `apps/website/tests/` (Vitest + describe/it). Use the existing onboarding test file as a style reference for imports and structure. Relative import path: `../../app/composables/useRut`.
    5. Add tests per the `<behavior>` block. Compute the actual valid DV for any constructed RUT using the standard Chilean mod-11 algorithm — do not hardcode an invalid example.
    6. Run `yarn workspace website test useRut` (or the closest Vitest command) and confirm all new tests pass and existing tests still pass.

    Important per CLAUDE.md:
    - No `any`, no unused vars.
    - Tests live in `apps/website/tests/` mirroring `app/` structure — never co-located.
    - File name: `useRut.test.ts` under `tests/composables/`.
    - English test names.
  </action>
  <verify>
    <automated>cd apps/website && yarn vitest run tests/composables/useRut.test.ts</automated>
  </verify>
  <done>
    - `useRut.ts` caps clean RUT input to 9 chars before formatting.
    - New test file `apps/website/tests/composables/useRut.test.ts` exists with all cases above passing.
    - `formatRut("117777092752K")` returns `"11.777.709-2"` (NOT `"11.777.709-2752"`).
    - No TypeScript errors; no Codacy complaints on the new file.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Unblock onboarding submit — skip hasChanges gate in onboarding mode</name>
  <files>apps/website/app/components/FormProfile.vue, apps/website/tests/components/FormProfile.onboarding.test.ts</files>
  <behavior>
    New test cases added to `FormProfile.onboarding.test.ts`:
    - "submit button is enabled in onboarding mode when form is valid even if hasChanges is false" (FORM-04)
      → mount with `onboardingMode: true`, programmatically set form to a fully valid state that matches `initialFormValues` exactly, wait for validation, assert the submit button has no `disabled` attribute.
    - "submit button is still gated by hasChanges in profile-edit mode (onboardingMode=false)" (FORM-05)
      → mount with `onboardingMode: false`, set form to a valid state equal to initialFormValues, assert button IS disabled.
    - "submit button is disabled in onboarding mode when form is INVALID regardless of changes" (FORM-06)
      → mount with `onboardingMode: true`, leave a required field blank, assert button is disabled.

    Existing FORM-01/02/03 tests must keep passing unchanged.
  </behavior>
  <action>
    1. Open `apps/website/app/components/FormProfile.vue`.
    2. Change the submit button's `:disabled` expression from:
       ```
       :disabled="!meta.valid || sending || !hasChanges"
       ```
       to:
       ```
       :disabled="!meta.valid || sending || (!onboardingMode && !hasChanges)"
       ```
       - `props.onboardingMode` is already declared (line 333). In the template, refer to it as `onboardingMode` (Vue auto-unwraps props in template).
       - This preserves existing profile-edit behaviour (still gated by `hasChanges`) while unblocking onboarding.
    3. Leave `hasChanges` computed as-is — it is still used for profile-edit mode.
    4. Open `apps/website/tests/components/FormProfile.onboarding.test.ts` and add the FORM-04/05/06 cases described in `<behavior>`. Use the existing helpers and `buildWrapper` pattern already in that file. Ensure Spanish UI labels, field names, and validation messages are NOT changed (CLAUDE.md rule).
    5. Run the FormProfile onboarding test file and the whole website test suite to confirm no regressions.
    6. Do a manual smoke check on the running dashboard/website: `yarn workspace website dev`, sign in as a new user, fill the onboarding form with a valid Chilean RUT (e.g. `11.111.111-1`), confirm the Actualizar button enables and the submit succeeds.

    Important per CLAUDE.md:
    - Do NOT rename the button label, Spanish copy, or any BEM classes.
    - Do NOT touch the `validate-on-mount` directive or the yup schema.
    - Do NOT remove `hasChanges` or its watcher — it is still needed for profile-edit.
    - No `any`, no unused imports. Keep the existing `<script setup>` block JS (not TS) — matches the rest of the file.
  </action>
  <verify>
    <automated>cd apps/website && yarn vitest run tests/components/FormProfile.onboarding.test.ts tests/components/OnboardingDefault.test.ts</automated>
  </verify>
  <done>
    - Submit button `:disabled` expression reads `!meta.valid || sending || (!onboardingMode && !hasChanges)`.
    - FORM-04 test passes: onboarding mode + valid form + no changes → button enabled.
    - FORM-05 test passes: profile-edit mode + valid form + no changes → button disabled.
    - FORM-06 test passes: onboarding mode + invalid form → button disabled.
    - Existing FORM-01/02/03 tests still pass.
    - No new TypeScript errors across the app (`yarn workspace website typecheck` if available).
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Manual onboarding smoke test</name>
  <what-built>
    - formatRut now caps RUT input to 9 clean chars (no more "11.777.709-2752" malformed values).
    - Onboarding submit button is enabled as soon as the form is valid, without requiring hasChanges.
    - Profile-edit flow at /cuenta/perfil/editar is unchanged — still gated by hasChanges.
  </what-built>
  <how-to-verify>
    1. `yarn workspace website dev`
    2. Reproduce the original bug path: log in as a user whose `rut` field is empty or malformed, or manually set `user.rut` to `"117777092752K"` in Strapi and refresh.
    3. Visit `/onboarding` (or trigger the onboarding flow on first login).
    4. Confirm the RUT field auto-clamps to at most `NN.NNN.NNN-X` (9 clean chars, one DV).
    5. Fill the form with valid data:
       - Tipo: Persona Natural
       - Fecha de Nacimiento: any date >= 18 years ago
       - Nombres / Apellidos: valid names
       - RUT: a known valid RUT (e.g. `11.111.111-1`)
       - Teléfono: e.g. `56942699999`
       - Dirección / Número
       - Región / Comuna
    6. Confirm the "Actualizar" button becomes enabled and clicking it submits successfully (toast shows "Usuario actualizado correctamente").
    7. Regression check: visit `/cuenta/perfil/editar` with an already-complete profile, do NOT change anything. The Actualizar button MUST remain disabled (this proves hasChanges still gates profile-edit mode).
  </how-to-verify>
  <resume-signal>Type "approved" once both onboarding enables and profile-edit still gates correctly, or describe any remaining issue.</resume-signal>
</task>

</tasks>

<verification>
- `yarn workspace website vitest run tests/composables/useRut.test.ts tests/components/FormProfile.onboarding.test.ts tests/components/OnboardingDefault.test.ts` all green.
- `yarn workspace website typecheck` clean (if available — otherwise `nuxt typecheck`).
- `yarn codacy` from repo root passes for changed files.
- Manual smoke test (Task 3) confirms onboarding unblocks and profile-edit still gates.
</verification>

<success_criteria>
- A user can complete onboarding and click Actualizar once the form is valid — no more "button stuck disabled" bug.
- `formatRut` is defensive against over-long input (pasted, pre-seeded, or past bugs that stored garbage).
- Profile-edit flow unchanged: still refuses to submit when nothing has changed.
- Unit tests lock in both fixes so a future refactor cannot silently reintroduce the bug.
</success_criteria>

<output>
After completion, create `.planning/quick/260411-sox-fix-onboarding-boton-continuar-bloqueado/260411-sox-SUMMARY.md` documenting:
- Root cause analysis (formatRut length cap + hasChanges gating in onboarding)
- Exact lines changed
- Test file added and cases covered
- Manual verification result
</output>
