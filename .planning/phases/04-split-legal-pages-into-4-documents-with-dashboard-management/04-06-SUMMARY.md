---
phase: 04-split-legal-pages-into-4-documents-with-dashboard-management
plan: 06
subsystem: ui
tags: [dashboard, vue, nuxt, vee-validate, vuedraggable, security-policy]

# Dependency graph
requires:
  - phase: 04-03
    provides: security-policy.d.ts TypeScript interface, useSecurityPoliciesStore, settings.store.ts securityPolicies section (state, getters, actions)
  - phase: 04-01
    provides: Strapi api::security-policy content-type with reorder endpoint (POST /security-policies/reorder)
provides:
  - SecurityPoliciesDashboard.vue admin list component (search, filter, drag-and-drop reorder)
  - FormSecurityPolicy.vue create/edit form component (title/text/order fields, auto-increment order)
  - 4 dashboard route files under pages/dashboard/maintenance/security/ (index, new, [id]/index, [id]/edit)
affects: [04-07 (nav wiring), 04-09 (permission grant + verification)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "documentId-string filtering for [id] detail/edit pages (fix-forward vs. pre-existing Number(id) bug in terms/policies)"

key-files:
  created:
    - apps/website/app/components/SecurityPoliciesDashboard.vue
    - apps/website/app/components/FormSecurityPolicy.vue
    - apps/website/app/pages/dashboard/maintenance/security/index.vue
    - apps/website/app/pages/dashboard/maintenance/security/new.vue
    - "apps/website/app/pages/dashboard/maintenance/security/[id]/index.vue"
    - "apps/website/app/pages/dashboard/maintenance/security/[id]/edit.vue"
  modified: []

key-decisions:
  - "New [id] pages filter by documentId (string) instead of replicating the pre-existing Number(id) bug in terms/[id] and policies/[id] pages — fix-forward per plan's explicit resolved decision, scoped only to this new content-type"
  - "index.vue does not import the unused TermsDefault component that terms/index.vue mistakenly imports — dead import not replicated"
  - "BEM block kept as unhyphenated noun security (security--dashboard, form--security), not security-policies — per CLAUDE.md BEM rule and phase's revised naming guidance"

patterns-established:
  - "Security dashboard CRUD vertical slice mirrors Terms/Policies dashboard exactly, substituting term->securityPolicy, terms->securityPolicies, /terms->/security-policies endpoint, .terms--dashboard->.security--dashboard, form--term->form--security"

requirements-completed: [LEGAL-SPLIT-07]

# Metrics
duration: 25min
completed: 2026-07-01
---

# Phase 04 Plan 06: Security Policies Dashboard CRUD Summary

**Full admin CRUD vertical slice for the Política de Seguridad legal document — list/search/filter/drag-and-drop reorder, create, view, edit — mirroring the existing Términos dashboard exactly, with documentId-based filtering fixed forward instead of replicating the legacy Number(id) bug.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-07-01T00:00:00Z
- **Completed:** 2026-07-01T00:25:00Z
- **Tasks:** 2 completed
- **Files modified:** 6 created

## Accomplishments
- `SecurityPoliciesDashboard.vue` — list view wired to `settingsStore.securityPolicies`, `GET security-policies`, and `POST /security-policies/reorder`, with search, sort/filter, and vuedraggable drag-and-drop reorder
- `FormSecurityPolicy.vue` — vee-validate/yup create/edit form for `title`/`text`/`order`, auto-increments `order` on create by querying the last row sorted `order:desc`
- 4 route files under `pages/dashboard/maintenance/security/`: `index.vue`, `new.vue`, `[id]/index.vue`, `[id]/edit.vue`
- `[id]` pages correctly filter by `documentId` (string) via `filters: { documentId: { $eq: documentId } }` — fixes forward the pre-existing `Number(id)` bug found in `terms/[id]/*` and `policies/[id]/*`, without touching those existing files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SecurityPoliciesDashboard.vue and FormSecurityPolicy.vue** - `9564848f` (feat)
2. **Task 2: Create security dashboard route files with documentId filtering** - `5f030fc5` (feat)

**Plan metadata:** (pending — committed alongside this SUMMARY)

## Files Created/Modified
- `apps/website/app/components/SecurityPoliciesDashboard.vue` - list/search/filter/drag-and-drop reorder admin component
- `apps/website/app/components/FormSecurityPolicy.vue` - create/edit form component, exports `SecurityPolicyData` interface
- `apps/website/app/pages/dashboard/maintenance/security/index.vue` - list page (no dead `TermsDefault` import)
- `apps/website/app/pages/dashboard/maintenance/security/new.vue` - create page
- `apps/website/app/pages/dashboard/maintenance/security/[id]/index.vue` - detail view, documentId-filtered
- `apps/website/app/pages/dashboard/maintenance/security/[id]/edit.vue` - edit page, documentId-filtered

## Decisions Made
- Followed the plan's `<interfaces>` block verbatim for `SecurityPoliciesDashboard.vue` (already fully specified) and adapted `FormTerm.vue`'s exact structure for `FormSecurityPolicy.vue` per the plan's provided template — no design decisions required, this was a mechanical mirror of an existing verified pattern.
- Confirmed via read of `FormTerm.vue` that `useApiClient`, `useSweetAlert2`, `vee-validate`, and `yup` imports in the plan's provided code match the current codebase exactly — no adaptation needed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `vue-tsc --noEmit` could not be run cleanly in this worktree: no `node_modules` present locally, and running the main checkout's `vue-tsc` binary against this worktree's `apps/website` produces a large set of `Cannot find name 'definePageMeta'/'useAsyncData'/'useApiClient'`, `Cannot find module '@/...'`, and `TS1378 top-level await` errors. These are caused by the missing generated `.nuxt/` types directory (never run `nuxi prepare`/install in this worktree), not by the new code.
  - **Verified environmental, not a regression:** the identical error signature (same error codes, same missing-name/module patterns) appears against `FormTerm.vue` and `terms/[id]/index.vue` — both pre-existing files already merged into `develop` and previously typechecked clean there. Since known-good files produce the same failure class, the cause is the worktree's missing Nuxt-generated types, not the Security dashboard files added in this plan.
  - Per the same precedent documented in Phase 04-08's SUMMARY ("vue-tsc could not be run in its worktree... flagged, not fabricated as passing"), this is flagged here rather than claimed as a passing typecheck. A fresh `vue-tsc --noEmit` should be run once these changes are merged into a tree with full `node_modules`/`.nuxt` present (main repo or a freshly-installed worktree).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Security dashboard CRUD is complete and ready for Plan 04-07 (nav wiring — adding a "Seguridad" link to the dashboard maintenance menu) and Plan 04-09 (Strapi permission grant for the `security-policies` content-type + end-to-end verification).
- `vue-tsc --noEmit` should be re-run in a tree with full dependencies installed before merging to confirm zero errors from this plan's files specifically (isolate via `grep -E "SecurityPolic|/security/"` on the output, comparing against the same grep on `terms`/`FormTerm` as a control, as done in this plan).

---
*Phase: 04-split-legal-pages-into-4-documents-with-dashboard-management*
*Completed: 2026-07-01*
