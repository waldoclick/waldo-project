---
phase: 04-split-legal-pages-into-4-documents-with-dashboard-management
plan: 03
subsystem: frontend
tags: [nuxt, pinia, typescript, vue-tsc, legal-content]

# Dependency graph
requires:
  - phase: 04-01
    provides: cookie-policy and security-policy Strapi content-types (REST endpoints this plan's stores call)
provides:
  - CookiePolicy/CookiePolicyResponse and SecurityPolicy/SecurityPolicyResponse TypeScript interfaces (documentId included from creation)
  - useCookiePoliciesStore / useSecurityPoliciesStore Pinia stores (load from Strapi, sorted order:asc)
  - settings.store.ts extended with cookiePolicies/securityPolicies sections (mandatory 5-part edit) — unblocks dashboard filter/sort for Plan 04-05
  - documentId additively added to existing Term/Policy interfaces
affects: [04-04, 04-05, 04-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "New orderable/searchable dashboard section registration in settings.store.ts requires editing 5 locations: SettingsState interface, ref declaration (sortBy override), computed getter, getSectionSettings switch-case, and both return-block lists (state + getters)"

key-files:
  created:
    - apps/website/app/types/cookie-policy.d.ts
    - apps/website/app/types/security-policy.d.ts
    - apps/website/app/stores/cookie-policies.store.ts
    - apps/website/app/stores/security-policies.store.ts
  modified:
    - apps/website/app/types/term.d.ts
    - apps/website/app/types/policy.d.ts
    - apps/website/app/stores/settings.store.ts

key-decisions:
  - "documentId: string added to CookiePolicy/SecurityPolicy interfaces from creation (unlike the pre-existing Term/Policy gap), and additively backfilled onto Term/Policy in the same plan since it's purely widening and no consumer currently destructures .documentId off the typed interface"
  - "cookiePolicies/securityPolicies refs in settings.store.ts use sortBy: \"order:asc\" override, matching the faqs/policies/terms precedent for orderable sections"

requirements-completed: [LEGAL-SPLIT-04, LEGAL-SPLIT-05]

duration: 12min
completed: 2026-07-02
---

# Phase 04 Plan 03: Frontend types, stores, and settings.store.ts extension for Cookies/Seguridad Summary

**Created CookiePolicy/SecurityPolicy TypeScript contracts and Pinia stores mirroring terms.store.ts/policies.store.ts exactly, and performed the mandatory 5-part settings.store.ts extension that Plan 04-05's dashboard components depend on to avoid a runtime "Unknown section" crash.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-02T00:00:00Z
- **Completed:** 2026-07-02T00:13:00Z
- **Tasks:** 3
- **Files modified:** 7 (4 created, 3 modified)

## Accomplishments
- `apps/website/app/types/cookie-policy.d.ts` and `security-policy.d.ts` created with `documentId: string` included from day one
- `term.d.ts` and `policy.d.ts` additively gained `documentId: string` on their primary interfaces (zero consumer breakage)
- `useCookiePoliciesStore` and `useSecurityPoliciesStore` created, mirroring `terms.store.ts` byte-for-byte apart from identifier substitution (endpoint, error copy)
- `settings.store.ts` extended with all 5 mandatory parts for `cookiePolicies`/`securityPolicies`: interface fields, refs (`sortBy: "order:asc"`), computed getters, `getSectionSettings` switch-case branches, and both state+getters return-block entries
- `vue-tsc --noEmit` exits 0 with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create cookie-policy.d.ts and security-policy.d.ts types (+ additive documentId fix on term.d.ts/policy.d.ts)** - `d57382c0` (feat)
2. **Task 2: Create cookie-policies.store.ts and security-policies.store.ts** - `ecfd5b7d` (feat)
3. **Task 3: Extend settings.store.ts with cookiePolicies + securityPolicies sections (mandatory 5-part edit)** - `5fffb0da` (feat)

## Files Created/Modified
- `apps/website/app/types/cookie-policy.d.ts` - `CookiePolicy`/`CookiePolicyResponse` interfaces
- `apps/website/app/types/security-policy.d.ts` - `SecurityPolicy`/`SecurityPolicyResponse` interfaces
- `apps/website/app/types/term.d.ts` - additively gained `documentId: string`
- `apps/website/app/types/policy.d.ts` - additively gained `documentId: string`
- `apps/website/app/stores/cookie-policies.store.ts` - `useCookiePoliciesStore` with `loadCookiePolicies()`, GET `cookie-policies` sorted `order:asc`, pageSize 50
- `apps/website/app/stores/security-policies.store.ts` - `useSecurityPoliciesStore` with `loadSecurityPolicies()`, GET `security-policies` sorted `order:asc`, pageSize 50
- `apps/website/app/stores/settings.store.ts` - `cookiePolicies`/`securityPolicies` registered in `SettingsState`, refs, `getCookiePoliciesFilters`/`getSecurityPoliciesFilters` getters, `getSectionSettings` switch-case, and both return-block lists

## Decisions Made
- None beyond what's captured in `key-decisions` above — plan executed exactly as written, using the interfaces block verbatim (no need to re-derive patterns from source files beyond a confirming read).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Pre-commit hooks (prettier + eslint --fix) ran automatically on each commit; eslint reformatted one long import line in `security-policies.store.ts` into a multi-line import (cosmetic only, no logic change) — reviewed and left as-is since it's the project's own auto-fix tooling.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Frontend contracts and stores for Cookies/Seguridad are complete and type-safe (`vue-tsc --noEmit` exits 0)
- `settings.store.ts`'s 5-part registration is verified via grep (each location present exactly once, no duplication)
- Plan 04-04 (public pages) can now import `useCookiePoliciesStore`/`useSecurityPoliciesStore`
- Plan 04-05 (dashboard CRUD) can now safely call `settingsStore.setFilters('cookiePolicies', ...)` / `setFilters('securityPolicies', ...)` without hitting the `Unknown section` throw

---
*Phase: 04-split-legal-pages-into-4-documents-with-dashboard-management*
*Completed: 2026-07-02*
