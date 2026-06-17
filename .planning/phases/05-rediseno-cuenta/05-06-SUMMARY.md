# 05-06 SUMMARY — Cambiar contraseña

**Status:** Complete (visually verified)
**Requirement:** ACC-PASSWORD

## What was done
- AccountPassword.vue was already in the redesigned state (markup: `account--password__eyebrow` "Seguridad", `__heading`, `__intro`, `__memo`, `__card` wrapping `<FormPassword/>`, `__note` Google-provider note) from prior work (commit 598aaa3e).
- The view's form styling was incorrectly placed as form-primitive overrides inside `_account.scss` (`account--password__card .form-control` etc.). Moved to `_form.scss` under the shared `.auth, .account` scope (fix 4756722b) — form classes now live in `_form.scss`, layout/card classes stay in `_account.scss`.

## Verification (visual loop)
- Screenshot of `/cuenta/cambiar-contrasena` (logged-in): eyebrow + heading + intro, password card with new-token inputs (1px $line, 7px radius, amber focus), "Generar segura", amber submit, Google-provider note. Matches the mockup. `_variables.scss` unchanged.

## Commit
- `4756722b` fix(05): move account form-primitive overrides to _form.scss
