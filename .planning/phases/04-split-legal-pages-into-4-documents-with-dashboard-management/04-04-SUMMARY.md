---
phase: 04-split-legal-pages-into-4-documents-with-dashboard-management
plan: 04
subsystem: ui
tags: [nuxt, vue, scss, bem, legal-pages, seo]

# Dependency graph
requires:
  - phase: 04-03
    provides: cookie-policy/security-policy TypeScript types + Pinia stores (useCookiePoliciesStore, useSecurityPoliciesStore)
provides:
  - Public page /politicas-de-cookies rendering cookie-policy accordion
  - Public page /politicas-de-seguridad rendering security-policy accordion
  - CookiePoliciesDefault.vue and SecurityPoliciesDefault.vue display components
  - _cookies.scss and _security.scss BEM partials (--default + --dashboard modifiers) registered in app.scss
affects: [04-05, 04-06, 04-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Legal document page pattern: page.vue (useAsyncData + $setSEO + $setStructuredData) -> XDefault.vue (AccordionDefault wrapper) -> _x.scss (--default + --dashboard modifiers)"

key-files:
  created:
    - apps/website/app/components/CookiePoliciesDefault.vue
    - apps/website/app/components/SecurityPoliciesDefault.vue
    - apps/website/app/pages/politicas-de-cookies.vue
    - apps/website/app/pages/politicas-de-seguridad.vue
    - apps/website/app/scss/components/_cookies.scss
    - apps/website/app/scss/components/_security.scss
  modified:
    - apps/website/app/scss/app.scss

key-decisions:
  - "BEM block names are unhyphenated single nouns .cookies and .security (not .cookie-policies/.security-policies) per explicit task override, even though the underlying content-types/stores/types are named cookie-policy/security-policy"
  - "Both SCSS partials created with full --default and --dashboard modifiers (copied verbatim from _terms.scss) even though only --default is consumed in this plan, since Plan 05 (dashboard) reuses the same partial"

requirements-completed: [LEGAL-SPLIT-04, LEGAL-SPLIT-06]

# Metrics
duration: 25min
completed: 2026-07-01
---

# Phase 04 Plan 04: Cookies & Security Public Pages Summary

**Two new public legal pages (/politicas-de-cookies, /politicas-de-seguridad) with dedicated display components and BEM-compliant SCSS, replicating the existing politicas-de-privacidad pattern exactly**

## Performance

- **Duration:** 25 min
- **Started:** 2026-07-01T20:10:00Z
- **Completed:** 2026-07-01T20:35:00Z
- **Tasks:** 3
- **Files modified:** 7 (6 created, 1 modified)

## Accomplishments
- `/politicas-de-cookies` and `/politicas-de-seguridad` public pages live, each with SSR-safe `useAsyncData` fetch from their respective Pinia store, distinct `$setSEO`/`$setStructuredData` blocks
- `CookiePoliciesDefault.vue` / `SecurityPoliciesDefault.vue` display components wrap `AccordionDefault`, structurally identical to `TermsDefault.vue`/`PoliciesDefault.vue`
- `_cookies.scss` / `_security.scss` mirror `_terms.scss` structure (both `--default` and `--dashboard` modifiers) using unhyphenated BEM blocks `.cookies` and `.security`, registered in `app.scss` via pure insertion (no reordering)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CookiePoliciesDefault.vue + politicas-de-cookies.vue + SCSS partial** - `ac9348b4` (feat)
2. **Task 2: Create SecurityPoliciesDefault.vue + politicas-de-seguridad.vue + SCSS partial** - `eb9d2650` (feat)
3. **Task 3: Register both new SCSS partials in app.scss** - `4d522fac` (feat)

**Plan metadata:** this file (docs: complete plan) — committed alongside STATE.md/ROADMAP.md updates

## Files Created/Modified
- `apps/website/app/components/CookiePoliciesDefault.vue` - display component wrapping AccordionDefault for cookie policies
- `apps/website/app/components/SecurityPoliciesDefault.vue` - display component wrapping AccordionDefault for security policies
- `apps/website/app/pages/politicas-de-cookies.vue` - public page, `layout: about`, SEO for cookies policy
- `apps/website/app/pages/politicas-de-seguridad.vue` - public page, `layout: about`, SEO for security policy
- `apps/website/app/scss/components/_cookies.scss` - `.cookies` BEM block, `--default` + `--dashboard` modifiers
- `apps/website/app/scss/components/_security.scss` - `.security` BEM block, `--default` + `--dashboard` modifiers
- `apps/website/app/scss/app.scss` - added `@use "components/cookies";` and `@use "components/security";` after the existing `@use "components/terms";` line

## Decisions Made
- Followed the task-level override (not the plan's literal file naming) to use `.cookies`/`.security` as unhyphenated BEM block names instead of `.cookie-policies`/`.security-policies`, per CLAUDE.md's "block is a single semantic noun" rule
- No other deviations — plan executed exactly as written otherwise

## Deviations from Plan

None - plan executed exactly as written (aside from the pre-instructed BEM block naming, which was an explicit override supplied in the task brief, not a deviation discovered during execution).

## Issues Encountered
- This worktree's branch was created before Phase 04 landed on `develop` (it only had Phase 01-03 commits). Fast-forward merged the worktree branch to `develop` (`git merge --ff-only develop`, clean ancestor fast-forward, no conflicts) to pull in `04-04-PLAN.md` and its dependencies (04-01/02/03 content-types, types, stores) before starting execution.
- Worktree had no installed `node_modules`; ran `pnpm install --filter waldo-website... --frozen-lockfile` to enable `vue-tsc` and `sass` verification. This is a local, gitignored side effect and does not affect the committed diff.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 04-05/04-06 (dashboard maintainer views for cookie/security policies) can proceed — the `--dashboard` SCSS modifiers already exist in `_cookies.scss`/`_security.scss` from this plan, and the Pinia stores/types from 04-03 are wired.
- No blockers.

---
*Phase: 04-split-legal-pages-into-4-documents-with-dashboard-management*
*Completed: 2026-07-01*
