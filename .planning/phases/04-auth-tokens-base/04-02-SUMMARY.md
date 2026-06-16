---
phase: 04-auth-tokens-base
plan: 02
subsystem: website/scss
tags: [scss, auth, tokens, form, strength-meter]
dependency_graph:
  requires: ["04-01"]
  provides: ["auth-scoped form overrides", "strength meter feedback tokens"]
  affects: ["apps/website/app/scss/components/_form.scss", "apps/website/app/scss/components/_strength.scss"]
tech_stack:
  added: []
  patterns: [".auth scoped SCSS overrides", "BEM nested under context class"]
key_files:
  created: []
  modified:
    - apps/website/app/scss/components/_form.scss
    - apps/website/app/scss/components/_strength.scss
decisions:
  - "PasswordStrength is used outside auth (FormPassword, FormPasswordDashboard), so strength recolor is scoped under .auth in _strength.scss, not via direct color replacement"
  - "Task 2 overrides both hyphen (.form-control) and underscore (.form__control) variants to cover all auth and non-auth form components that may appear inside .auth"
  - "Register step indicator SCSS defined now (.form--register__steps__pill/label) per plan; markup comes in Plan 05"
metrics:
  duration: "~12 minutes"
  completed: "2026-06-16T20:53:58Z"
  tasks_completed: 3
  files_changed: 2
---

# Phase 04 Plan 02: Auth Form Primitives + Strength Meter SCSS Summary

Auth form primitive overrides scoped under `.auth` plus 4-bar strength meter recolored with semantic feedback tokens.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Remove duplicate .form--verify from _form.scss | `631ca614` | `_form.scss` (-39 lines) |
| 2 | Add .auth-scoped override block to _form.scss | `421a0383` | `_form.scss` (+164 lines) |
| 3 | Recolor strength meter with feedback tokens | `6f96d38d` | `_strength.scss` (+43 lines) |

## What Was Built

**Task 1 (subtractive):** Removed the trailing `.form--verify { ... }` block from `_form.scss` (39 lines). Canonical owner is `_verify-code.scss`, which has the fuller version including `&__resend` and `::placeholder` rules.

**Task 2 (auth form overrides):** Added a top-level `.auth { ... }` block (164 lines) to `_form.scss` containing:
- Inputs (`.form-control`, `.form__control`): `1px solid $line` border, `7px` radius, `14px 15px` padding, `$ink` text, `$placeholder` placeholder. Focus/hover/active: `$amber_hover` border + `0 0 0 3px rgba(247, 201, 126, 0.25)` box-shadow.
- Labels (`.form-label`, `.form__label`): Static positioning, `13px/600`, `$muted` color, `8px` margin-bottom.
- Primary button (`.btn--primary`): `$amber` background, `$amber_hover` on hover, `$ink` text, `9px` radius.
- Secondary button (`.btn--secondary`): White background, `1px $line` border, `7px` radius, `$cream` on hover.
- Separator (`.auth__form__separator`): `$line` pseudo-lines, `$muted` center text `12.5px/500`.
- Password toggle: `$ink2` color, hover `$ink`, `13px/600`.
- Generate button: `$ink` color, underlined, `12.5px/700`.
- Checkboxes: `accent-color: $amber_hover`, label `$ink2/500`, links `$ink/700/underline`.
- Register step pills: `.form--register__steps__pill` (28×4px, `99px` radius, `$amber`) + `.form--register__steps__label` (`12.5px/$muted/500`).

**Task 3 (strength meter):** Added `.auth .strength__bar[--levelN]` and `.auth .strength__label[--levelN]` overrides with feedback tokens. Global `.strength` block left intact (non-auth password forms unchanged). Color mapping: `level1=$error, level2=$warning, level3=$success, level4=$success_strong`; empty bar `$strength_empty`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] PasswordStrength scoped under .auth instead of direct recolor**
- **Found during:** Task 3
- **Issue:** Plan assumed PasswordStrength is auth-only ("confirm with grep before editing"). Grep found it in `FormPassword.vue` (user account) and `FormPasswordDashboard.vue` (dashboard profile page), both outside the `.auth` context.
- **Fix:** Added `.auth .strength` override block to `_strength.scss` rather than modifying the global `.strength__bar--levelN` rules. Non-auth meters keep `$gainsboro`/`$red_salsa`/`$light_peach`/`$magic_mint`; auth meters use feedback tokens.
- **Files modified:** `apps/website/app/scss/components/_strength.scss`
- **Commit:** `6f96d38d`

**2. [Rule 2 - Missing hover override] Added :hover to input focus-ring**
- **Found during:** Task 2
- **Issue:** Global `.form-control:hover` applies `border: 2px solid $charcoal` which would show charcoal border on hover inside auth even if focus was overridden.
- **Fix:** Auth override targets `:hover, :active, :focus` together with the amber treatment.
- **Commit:** `421a0383`

**3. [Rule 2 - Convention coverage] Both .form-control and .form__control overridden**
- **Found during:** Task 2
- **Issue:** Auth forms use hyphen-style (`.form-control`); non-auth forms may render PasswordStrength inside auth context with underscore-style (`.form__control`).
- **Fix:** Override blocks target both conventions (`form-control` and `form__control`, `form-label` and `form__label`, etc.).
- **Commit:** `421a0383`

**4. [Rule 3 - Verify format] `.form--register__steps__pill` written as literal selector**
- **Found during:** Task 2
- **Issue:** Initial BEM nesting via `&__pill` inside `.form--register__steps` prevented literal string match required by plan's verify grep.
- **Fix:** Wrote step indicator children as explicit selectors (`.form--register__steps__pill`, `.form--register__steps__label`) directly nested under `.auth`. This still compiles to the correct `.auth .form--register__steps__pill` selector.
- **Commit:** `421a0383`

## Known Stubs

None. This plan is SCSS-only (no data or UI rendering stubs).

## Self-Check: PASSED

- `_form.scss` exists: FOUND
- `_strength.scss` exists: FOUND
- Commit `631ca614` exists: FOUND
- Commit `421a0383` exists: FOUND
- Commit `6f96d38d` exists: FOUND
- `grep -c '.form--verify' _form.scss` returns 0: CONFIRMED
- `rgba(247, 201, 126, 0.25)` in `_form.scss`: CONFIRMED
- `$success_strong` in `_strength.scss`: CONFIRMED
- Global `border: 2px solid $platinum` still present: CONFIRMED
