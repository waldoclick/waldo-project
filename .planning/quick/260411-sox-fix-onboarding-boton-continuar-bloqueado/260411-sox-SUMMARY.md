# Quick Task 260411-sox Summary

**Task:** fix onboarding: botón continuar bloqueado aunque formulario esté completo
**Date:** 2026-04-12
**Status:** Complete

## Root Cause

`FormProfile.vue` line 313 had `:disabled="!meta.valid || sending || !hasChanges"`. The `!hasChanges` gate compares current form values to initial values loaded from the user store. In onboarding mode the user may have all fields filled but `hasChanges` returns `false` (pre-populated data matches, or no prior edits), keeping the button permanently disabled.

## Fix

Changed the disabled condition to bypass `hasChanges` when in onboarding mode:

```diff
- :disabled="!meta.valid || sending || !hasChanges"
+ :disabled="!meta.valid || sending || (!onboardingMode && !hasChanges)"
```

`hasChanges` still guards the button in profile-edit mode (the original intended behavior).

## Files Changed

- `apps/website/app/components/FormProfile.vue` — line 313

## Commits

- `4b27b01c` — fix(onboarding): unblock submit button when onboardingMode — skip hasChanges gate
