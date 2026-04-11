---
phase: quick
plan: 260411-mpl
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/FormVerifyCode.vue
  - apps/dashboard/app/scss/components/_verify-code.scss
autonomous: true
requirements: [quick-260411-mpl]

must_haves:
  truths:
    - "Typing a digit in any field auto-advances focus to the next field"
    - "Pressing backspace on an empty field moves focus to the previous field"
    - "Pasting a 6-digit code fills all 6 fields and auto-submits"
    - "Arrow keys left/right navigate between fields"
    - "The assembled 6-digit string submits identically to the old single-input behavior"
    - "The 6 boxes are visually centered, each showing one character"
  artifacts:
    - path: "apps/dashboard/app/components/FormVerifyCode.vue"
      provides: "6 individual digit input fields with auto-advance, paste, keyboard nav"
      contains: "inputRefs"
    - path: "apps/dashboard/app/scss/components/_verify-code.scss"
      provides: "BEM styles for the 6-digit code input row"
      contains: "form--verify__digits"
  key_links:
    - from: "FormVerifyCode.vue digit inputs"
      to: "code ref (assembled string)"
      via: "computed or watcher that joins all 6 digit refs"
      pattern: "code\\.value"
    - from: "code ref"
      to: "handleVerify()"
      via: "isCodeValid computed + button click / auto-submit on 6th digit"
      pattern: "isCodeValid"
---

<objective>
Replace the single 6-digit text input in FormVerifyCode.vue with 6 individual single-digit input fields that auto-advance on type, support backspace navigation, paste distribution, and arrow key movement. The assembled string feeds into the existing verify/submit logic unchanged.

Purpose: Better UX for verification code entry -- individual digit boxes are the standard OTP pattern users expect.
Output: Updated FormVerifyCode.vue component and _verify-code.scss styles.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/dashboard/app/components/FormVerifyCode.vue
@apps/dashboard/app/scss/components/_verify-code.scss
@apps/dashboard/app/scss/components/_form.scss
@apps/dashboard/app/pages/auth/verify-code.vue

<interfaces>
<!-- The page (verify-code.vue) uses FormVerifyCode via template ref and calls these exposed members: -->
From apps/dashboard/app/components/FormVerifyCode.vue:
```typescript
defineExpose({ handleResend, resendCooldown, resending });
```
<!-- This contract MUST NOT change. The page is NOT modified. -->

<!-- The existing form__control style from _form.scss: -->
```scss
input.form__control {
  height: 48px;
}
.form__control {
  border: 2px solid $platinum;
  border-radius: 4px;
  background: white;
  &:active, &:focus, &:hover {
    border: 2px solid $charcoal;
  }
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rewrite FormVerifyCode template and script for 6-digit OTP inputs</name>
  <files>apps/dashboard/app/components/FormVerifyCode.vue</files>
  <action>
Replace the single input with 6 individual inputs. Keep ALL existing logic (handleVerify, handleResend, pendingToken guard, defineExpose, imports) completely untouched.

Template changes:
- Remove the existing single `<input id="code">` and its `<div class="form__group">` wrapper.
- Add a new `<div class="form--verify__digits">` containing 6 `<input>` elements.
- Each input: `type="text"`, `inputmode="numeric"`, `maxlength="1"`, `autocomplete="one-time-code"` (only on first input), class `form--verify__digits__input`, `:ref="el => setInputRef(el, i)"` where i is 0-5.
- Keep the label `Codigo de verificacion` above the digits row using a `<label class="form--verify__digits__label">`.
- Keep the existing button block exactly as-is below.

Script changes (replace the code ref and input handlers only):
- Create `const digits = ref<string[]>(['', '', '', '', '', ''])`.
- Create `const inputRefs = ref<HTMLInputElement[]>([])` and a `setInputRef(el, i)` function.
- Create `const code = computed(() => digits.value.join(''))` -- this replaces the old `code` ref. The existing `isCodeValid` computed and `handleVerify` use `code.value` and will work unchanged.
- `handleDigitInput(index: number, event: Event)`:
  - Get typed value, strip non-digits, take first char.
  - Set `digits.value[index]` to that char.
  - If char is a digit and index < 5, focus `inputRefs.value[index + 1]`.
  - If all 6 digits filled, call `handleVerify()`.
- `handleDigitKeydown(index: number, event: KeyboardEvent)`:
  - Backspace: if field is empty and index > 0, focus `inputRefs.value[index - 1]`.
  - ArrowLeft: if index > 0, focus previous, `e.preventDefault()`.
  - ArrowRight: if index < 5, focus next, `e.preventDefault()`.
  - Block non-digit keys (same allowed list as current: Backspace, Delete, Tab, arrows, Ctrl+a/c/v/x).
- `handleDigitPaste(event: ClipboardEvent)`:
  - `e.preventDefault()`.
  - Get pasted text, strip non-digits, take first 6 chars.
  - Distribute each char to `digits.value[i]`.
  - Focus the field after the last filled digit (or the last field).
  - If 6 digits pasted, call `handleVerify()`.
- In `handleVerify` catch block, after Swal.fire, reset `digits.value` to `['', '', '', '', '', '']` (replaces the old `code.value = ''` behavior -- though the old code didn't reset, this is a UX improvement for the error case).
- On `onMounted`, after the pendingToken guard, focus `inputRefs.value[0]` with `nextTick`.

CRITICAL: Do NOT touch handleVerify internals, handleResend, defineExpose, pendingToken, resendCooldown, startCountdown, onUnmounted, or any imports beyond what is needed. The `code` computed replaces the `code` ref -- all downstream consumers (isCodeValid, handleVerify body referencing `code.value`) work identically.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx nuxi typecheck apps/dashboard 2>&1 | tail -20</automated>
  </verify>
  <done>FormVerifyCode.vue renders 6 individual digit inputs with auto-advance, backspace, paste, and arrow key support. The assembled code string feeds into the unchanged isCodeValid/handleVerify logic. defineExpose contract unchanged.</done>
</task>

<task type="auto">
  <name>Task 2: Add BEM styles for the 6-digit input row</name>
  <files>apps/dashboard/app/scss/components/_verify-code.scss</files>
  <action>
Add styles under the existing `.form--verify` block in _verify-code.scss. Follow BEM from CLAUDE.md -- all classes scoped under `form--verify`.

Add these rules:

```scss
&__digits {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;

  &__label {
    // Static label above the digits row (not the floating form__label)
    display: block;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.25px;
    color: $charcoal;
    margin-bottom: 10px;
    text-align: center;
  }

  &__input {
    width: 48px;
    height: 48px;
    border: 2px solid $platinum;
    border-radius: 4px;
    background: white;
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: $charcoal;
    outline: none;
    transition: border-color 0.2s;
    padding: 0;
    caret-color: $charcoal;

    &::placeholder {
      color: $platinum;
      font-weight: normal;
    }

    &:focus {
      border-color: $charcoal;
    }
  }
}
```

Wrap the `&__digits__label` outside the flex container in the template -- actually, looking at the template structure, the label should be a sibling above `&__digits`, so place the label styles as `&__label` at the `form--verify` level (which already exists as the `&__resend` sibling area). Actually, to keep proper BEM: the label sits inside a wrapper. Let me reconsider.

The template structure will be:
```html
<div class="form form--verify">
  <label class="form--verify__label">Codigo de verificacion</label>
  <div class="form--verify__digits">
    <input class="form--verify__digits__input" ... /> x6
  </div>
  <button ...>
</div>
```

So add `&__label` as a direct child style of `form--verify` for the static label (not floating):
```scss
&__label {
  display: block;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.25px;
  color: $charcoal;
  margin-bottom: 10px;
}
```

Remove the old `form__group` and `form__label` usage from the template (Task 1 handles that).

Use ONLY brand colors from CLAUDE.md: `$platinum` for borders, `$charcoal` for text and focus borders.

Do NOT add box-shadow or transform: scale (per CLAUDE.md).
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx nuxi build apps/dashboard 2>&1 | tail -5</automated>
  </verify>
  <done>The 6 digit inputs render as a centered row of equal-sized boxes (48x48px) with clean borders, centered text, and focus state highlighting. All classes follow BEM under form--verify namespace. Only brand colors used.</done>
</task>

</tasks>

<verification>
1. `npx nuxi typecheck apps/dashboard` passes with no new errors
2. `npx nuxi build apps/dashboard` completes successfully
3. Visual: navigate to /auth/verify-code -- 6 individual digit boxes render in a centered row
4. Typing a digit auto-advances to next field
5. Backspace on empty field moves to previous field
6. Pasting "123456" fills all 6 fields
7. Arrow left/right navigate between fields
8. Completing all 6 digits triggers verify submit
</verification>

<success_criteria>
- FormVerifyCode.vue renders 6 individual single-digit inputs instead of one 6-char input
- Auto-advance, backspace, paste distribution, and arrow key navigation all work
- The assembled code string passes to existing handleVerify unchanged
- defineExpose contract unchanged (page verify-code.vue is NOT modified)
- All BEM classes scoped under form--verify namespace
- Only brand colors from CLAUDE.md used
- TypeScript compiles clean
</success_criteria>

<output>
After completion, create `.planning/quick/260411-mpl-split-verification-code-input-into-6-ind/260411-mpl-SUMMARY.md`
</output>
