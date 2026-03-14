# Quick Task 32: Restrict verify code input to digits only, max 6, auto-submit on 6th

**Date:** 2026-03-13
**Commit:** 2f663d6

## What was done

`FormVerifyCode.vue` input now:
- Blocks all non-digit key presses at `@keydown` (allows backspace, delete, arrows, ctrl+a/c/v/x)
- Strips non-digits on `@input` (handles autocomplete, IME, browser fill)
- Strips non-digits on `@paste` (handles copy-paste from email)
- Caps at 6 characters
- Auto-submits `handleVerify()` when the 6th digit is entered (via keyboard or paste)
- Button still works normally as fallback

Switched from `v-model` to `:value` + manual `@input` handler to maintain full control over the input value without Vue's reactive binding interfering with the character stripping.
