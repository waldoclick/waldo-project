---
phase: quick
plan: 260411-mpl
subsystem: dashboard/auth
tags: [otp, ux, form, verify-code]
dependency_graph:
  requires: []
  provides: [FormVerifyCode OTP digit inputs]
  affects: [apps/dashboard/app/components/FormVerifyCode.vue, apps/dashboard/app/scss/components/_verify-code.scss]
tech_stack:
  added: []
  patterns: [OTP digit input pattern, inputRefs array with setInputRef, computed join from digits array]
key_files:
  created: []
  modified:
    - apps/dashboard/app/components/FormVerifyCode.vue
    - apps/dashboard/app/scss/components/_verify-code.scss
decisions:
  - "code is computed (not ref) joining digits array — downstream isCodeValid and handleVerify work unchanged"
  - "digits reset to empty array on verify error for UX improvement"
  - "Auto-focus first input on mount via nextTick after pendingToken guard"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-11"
  tasks_completed: 2
  files_modified: 2
---

# Phase quick Plan 260411-mpl: Split Verification Code Input into 6 Individual Digit Inputs Summary

**One-liner:** Replaced single 6-char code input with 6 individual OTP digit boxes using inputRefs, computed join, and full keyboard/paste navigation.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite FormVerifyCode template and script for 6-digit OTP inputs | f2cb5033 | FormVerifyCode.vue |
| 2 | Add BEM styles for the 6-digit input row | 8a6eb900 | _verify-code.scss |

## What Was Built

### Task 1: FormVerifyCode.vue OTP rewrite

Replaced the single `<input id="code" maxlength="6">` with 6 individual inputs rendered via `v-for` over a `digits: string[]` ref. Key changes:

- `digits = ref<string[]>(['','','','','',''])` — one slot per character
- `inputRefs = ref<HTMLInputElement[]>([])` with `setInputRef(el, i)` for tracking DOM refs
- `code = computed(() => digits.value.join(''))` — replaces old `code = ref('')`; `isCodeValid` and `handleVerify` consume `code.value` identically
- `handleDigitInput`: strips non-digits, sets digit slot, auto-advances focus, triggers `handleVerify` when all 6 filled
- `handleDigitKeydown`: Backspace moves focus to previous empty field; ArrowLeft/Right navigate; non-digit keys blocked
- `handleDigitPaste`: distributes up to 6 digits across slots, focuses last filled slot, auto-submits on 6 chars
- `onMounted`: focuses first input after `nextTick` (after pendingToken guard)
- Error case in `handleVerify` catch: resets `digits.value` to 6 empty strings (UX improvement over old no-reset behavior)
- `defineExpose({ handleResend, resendCooldown, resending })` — contract unchanged

### Task 2: _verify-code.scss BEM styles

Added styles scoped under `.form--verify`:

- `&__label` — static centered label above digit row (replaces floating `form__label`)
- `&__digits` — flex row, `justify-content: center`, `gap: 10px`, `margin-bottom: 30px`
- `&__digits__input` — 48x48px boxes, border `$platinum`, focus border `$charcoal`, centered `font-size: 22px`, no box-shadow, no transform

All colors are brand palette only: `$platinum`, `$charcoal`.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx nuxi typecheck apps/dashboard` — passed, no new errors
- `npx nuxi build apps/dashboard` — build complete
- ESLint + Prettier — passed (pre-commit hook)

## Known Stubs

None — all 6 digit inputs are wired to `digits` ref; `code` computed feeds live into `handleVerify`.

## Self-Check: PASSED

- [x] `apps/dashboard/app/components/FormVerifyCode.vue` — exists and modified
- [x] `apps/dashboard/app/scss/components/_verify-code.scss` — exists and modified
- [x] Commit f2cb5033 — exists
- [x] Commit 8a6eb900 — exists
