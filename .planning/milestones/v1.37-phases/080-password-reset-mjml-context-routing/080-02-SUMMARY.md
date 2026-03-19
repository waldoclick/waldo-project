---
phase: 080-password-reset-mjml-context-routing
plan: "02"
subsystem: auth
tags: [mjml, email, nuxt, strapi, password-reset, vue]

# Dependency graph
requires:
  - phase: 080-password-reset-mjml-context-routing
    provides: overrideForgotPassword controller that reads context field and uses reset-password.mjml template (Plan 01)
provides:
  - MJML email template reset-password.mjml with {{ name }} and {{ resetUrl }} variables
  - Website FormForgotPassword.vue sends context 'website' in forgotPassword POST body
  - Dashboard FormForgotPassword.vue sends context 'dashboard' with as-any cast in forgotPassword POST body
affects:
  - 080-01: overrideForgotPassword controller consumes reset-password template by name

# Tech tracking
tech-stack:
  added: []
  patterns:
    - MJML template extending layouts/base.mjml with mj-button CTA for password reset
    - as-any cast on forgotPassword call to pass context field not in @nuxtjs/strapi v2 type definition

key-files:
  created:
    - apps/strapi/src/services/mjml/templates/reset-password.mjml
  modified:
    - apps/website/app/components/FormForgotPassword.vue
    - apps/dashboard/app/components/FormForgotPassword.vue

key-decisions:
  - "mj-button with brand color #f5a623 used for CTA (not plain text link) — better mobile click target"
  - "No hardcoded expiry time in template — Strapi resetPasswordToken has no automatic expiry; wording says 'valid until new one requested'"
  - "Dashboard FormForgotPassword cast to as any — context not in @nuxtjs/strapi v2 forgotPassword type signature"

patterns-established:
  - "MJML templates auto-discovered by nunjucks.configure() path — no config changes needed for new templates"

requirements-completed:
  - PWDR-01
  - PWDR-02
  - PWDR-03

# Metrics
duration: 3min
completed: 2026-03-14
---

# Phase 080 Plan 02: MJML Template + Context Routing Summary

**MJML `reset-password.mjml` template with `{{ name }}` + `{{ resetUrl }}` button, and `context: 'website'/'dashboard'` added to both `FormForgotPassword.vue` components**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-14T02:40:22Z
- **Completed:** 2026-03-14T02:43:15Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `reset-password.mjml` MJML email template following `verification-code.mjml` structure with branded `mj-button` CTA
- Added `context: 'website'` to website `FormForgotPassword.vue` inside the existing `as any` cast
- Added `context: 'dashboard'` to dashboard `FormForgotPassword.vue` with new `as any` cast (type limitation of @nuxtjs/strapi v2)
- Both apps pass TypeScript checks (nuxt typecheck exit 0)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create reset-password.mjml MJML template** - `c74b66d` (feat)
2. **Task 2: Add context routing to both FormForgotPassword.vue components** - `8be0d3c` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `apps/strapi/src/services/mjml/templates/reset-password.mjml` — New MJML email template for password reset with `{{ name }}` greeting and `{{ resetUrl }}` mj-button CTA
- `apps/website/app/components/FormForgotPassword.vue` — Added `context: 'website'` inside existing `as any` forgotPassword call
- `apps/dashboard/app/components/FormForgotPassword.vue` — Added `context: 'dashboard'` with new `as any` cast to forgotPassword call

## Decisions Made
- Used `mj-button` (not plain text link) for the CTA — better mobile click target on email clients
- Omitted any specific expiry time from the email text — Strapi's `resetPasswordToken` has no automatic TTL; copy says "valid until a new one is requested"
- Dashboard required a new `as any` cast because `@nuxtjs/strapi` v2 `forgotPassword` only types `{ email: string }` — consistent with website's existing pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `yarn workspace waldo-website typecheck` failed with "Command not found" — neither website nor dashboard have a `typecheck` script in `package.json`. Used `npx nuxt typecheck` directly instead, which is the correct command for Nuxt 4 projects. Both exited 0.
- Pre-existing LSP error in `apps/strapi/src/extensions/users-permissions/controllers/authController.test.ts` (`Module has no exported member 'overrideForgotPassword'`) — unrelated to this plan's changes; this is the TDD RED test from Plan 01 that will be resolved by Plan 01's GREEN implementation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three artifacts ready: `reset-password.mjml`, website `FormForgotPassword.vue`, dashboard `FormForgotPassword.vue`
- Plan 01 (`overrideForgotPassword` controller) can now consume `reset-password` template by name and read `context` from POST body
- Requirements PWDR-01, PWDR-02, PWDR-03 completed

---
*Phase: 080-password-reset-mjml-context-routing*
*Completed: 2026-03-14*
