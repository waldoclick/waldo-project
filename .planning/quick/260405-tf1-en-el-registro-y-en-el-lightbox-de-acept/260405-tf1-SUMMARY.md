---
phase: quick-260405-tf1
plan: 01
subsystem: website, strapi
tags: [consent, registration, terms, lightbox, schema]
dependency_graph:
  requires: []
  provides: [accepted_usage_terms field, usage terms checkbox in registration and lightbox]
  affects: [FormRegister.vue, FormTerms.vue, LightboxTerms.vue, useUser.ts]
tech_stack:
  added: []
  patterns: [yup boolean validation, vee-validate Field checkbox]
key_files:
  created: []
  modified:
    - apps/strapi/src/extensions/users-permissions/content-types/user/schema.json
    - apps/website/app/types/user.d.ts
    - apps/website/app/types/form-register.d.ts
    - apps/website/app/components/FormRegister.vue
    - apps/website/app/components/FormTerms.vue
    - apps/website/app/components/LightboxTerms.vue
    - apps/website/app/composables/useUser.ts
decisions:
  - "Links to legal documents (privacy policy, usage terms) live only in their dedicated checkboxes, not in body text"
  - "accepted_usage_terms is a separate boolean field from accepted_terms — each legal document gets explicit consent"
metrics:
  duration: 12m
  completed_date: "2026-04-05"
  tasks_completed: 2
  files_modified: 7
---

# Quick Task 260405-tf1: Add usage terms checkbox to registration and terms lightbox

**One-liner:** Added `accepted_usage_terms` boolean to Strapi schema and three-checkbox consent flow (age + privacy policy + usage terms) in FormRegister, FormTerms, and LightboxTerms.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add accepted_usage_terms field to Strapi user schema and website types | f636baae | schema.json, user.d.ts, form-register.d.ts |
| 2 | Add condiciones de uso checkbox to FormRegister and FormTerms, update LightboxTerms body text, update useUser composable | 760645bb | FormRegister.vue, FormTerms.vue, LightboxTerms.vue, useUser.ts |

## What Was Built

- **Strapi schema:** `accepted_usage_terms: { type: "boolean", default: false }` added after `accepted_terms` in `user/schema.json`
- **TypeScript types:** `accepted_usage_terms: boolean` added to `User` interface and `FormRegister` interface
- **FormRegister.vue:**
  - `accepted_terms` checkbox label changed to "Acepto las políticas de privacidad" (link to `/politicas-de-privacidad`)
  - New `accepted_usage_terms` checkbox added: "Acepto las condiciones de uso" (link to `/condiciones-de-uso`)
  - `accepted_usage_terms` yup validation: `oneOf([true], "Debes aceptar las condiciones de uso")`
  - `accepted_terms` validation message updated to "Debes aceptar las políticas de privacidad"
  - Form ref initial value includes `accepted_usage_terms: false`
- **FormTerms.vue:**
  - `usageTermsAccepted` ref added
  - `canSubmit` computed now requires all three: `ageConfirmed && termsAccepted && usageTermsAccepted`
  - `accepted_terms` checkbox label updated to match FormRegister
  - New `terms-usage-accepted` checkbox added with link to `/condiciones-de-uso`
- **LightboxTerms.vue:** Body text changed from "aceptar nuestros términos y [link]" to "aceptar los siguientes términos." — no NuxtLink in body
- **useUser.ts:**
  - `hasAcceptedTerms` now checks `accepted_usage_terms === true` alongside existing booleans
  - `acceptTerms` sends `accepted_usage_terms: true` in the profile update payload

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `f636baae` exists: FOUND
- `760645bb` exists: FOUND
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` contains `accepted_usage_terms`: FOUND
- `apps/website/app/types/user.d.ts` contains `accepted_usage_terms`: FOUND
- `apps/website/app/types/form-register.d.ts` contains `accepted_usage_terms`: FOUND
- TypeScript typecheck: no errors
- FormRegister tests (6/6): PASSED
