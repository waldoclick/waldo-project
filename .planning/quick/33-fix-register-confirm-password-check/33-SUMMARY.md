# Quick Task 33: Fix registration broken by confirm_password check in registerUserLocal

**Date:** 2026-03-13
**Commit:** 3b2262e

## Root cause

`FormRegister.vue` intentionally calls `delete form.value.confirm_password` before
sending the registration payload — passwords are validated client-side (yup schema).
The `registerUserLocal` controller wrapper had `!confirm_password` as a required field
check, which always failed (no `confirm_password` in the payload → "All fields are required").

This bug was **latent before phase 077** — the old property-on-factory pattern silently
failed to apply the wrapper, so `registerUserLocal` never ran. Once the factory wrapper
was correctly implemented, `registerUserLocal` started running and the check began blocking
all registrations.

## Fix

Removed `confirm_password` extraction and validation from `registerUserLocal`. The password
match validation is already handled client-side in `FormRegister.vue` via yup schema.
