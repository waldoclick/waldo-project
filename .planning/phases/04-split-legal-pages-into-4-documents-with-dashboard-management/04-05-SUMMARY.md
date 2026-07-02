---
phase: 04-split-legal-pages-into-4-documents-with-dashboard-management
plan: 05
subsystem: ui
tags: [nuxt, vue, dashboard, cms, cookie-policy, bem]

# Dependency graph
requires:
  - phase: 04-split-legal-pages-into-4-documents-with-dashboard-management
    provides: "Plan 03's settings.store.ts cookiePolicies section, CookiePolicy TS interface, /cookie-policies + /cookie-policies/reorder endpoints (Plan 01)"
provides:
  - "Full dashboard admin CRUD section for the Cookies legal document: list/search/filter/drag-and-drop reorder, create, view, edit"
affects: [04-06, 04-07, 04-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dashboard legal-document CRUD mirrors TermsDashboard.vue/FormTerm.vue byte-for-byte with UID substitution"
    - "New [id] route pages filter by documentId (string), not Number(id) — fix-forward pattern for new content-types"

key-files:
  created:
    - apps/website/app/components/CookiePoliciesDashboard.vue
    - apps/website/app/components/FormCookiePolicy.vue
    - apps/website/app/pages/dashboard/maintenance/cookies/index.vue
    - apps/website/app/pages/dashboard/maintenance/cookies/new.vue
    - "apps/website/app/pages/dashboard/maintenance/cookies/[id]/index.vue"
    - "apps/website/app/pages/dashboard/maintenance/cookies/[id]/edit.vue"
  modified: []

key-decisions:
  - "New [id] pages filter by documentId (string) instead of Number(id) — fixes forward the pre-existing terms/policies bug without touching those out-of-scope files"
  - "index.vue does not import the CookiePoliciesDefault (public display) component or any TermsDefault-style dead import"
  - "BEM block kept as the single unhyphenated noun `cookies` (cookies--dashboard), form modifier `form--cookie` — never `cookie-policies--` or `form--cookie-policy`"

patterns-established:
  - "Legal-document dashboard CRUD sections (Terms, Policies, Cookies, Security) all share one exact structural pattern — only naming substitution differs"

requirements-completed: [LEGAL-SPLIT-07]

# Metrics
duration: 25min
completed: 2026-07-02
---

# Phase 04 Plan 05: Cookie Policies Dashboard CRUD Summary

**Full dashboard admin CRUD for the Cookies legal document — list/search/filter/drag-reorder, create, view, edit — mirroring the existing Terms dashboard pattern exactly, with documentId-based filtering fixed forward on the new [id] route pages.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-07-02T00:10:00Z
- **Completed:** 2026-07-02T00:35:00Z
- **Tasks:** 2
- **Files modified:** 6 (all new)

## Accomplishments
- `CookiePoliciesDashboard.vue` — list/search/filter/drag-and-drop reorder UI wired to `settingsStore.cookiePolicies` and `/cookie-policies` + `/cookie-policies/reorder`
- `FormCookiePolicy.vue` — create/edit form (title/text/order) with auto-incrementing order on create
- 4 route files under `pages/dashboard/maintenance/cookies/` (index, new, `[id]/index`, `[id]/edit`), with the two `[id]` pages using `documentId`-based filtering (fix-forward, not replicating the pre-existing `Number(id)` bug from terms/policies)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CookiePoliciesDashboard.vue and FormCookiePolicy.vue** - `257a27f0` (feat)
2. **Task 2: Create cookies dashboard route files with documentId filtering** - `18fac604` (feat)

**Plan metadata:** pending (docs: complete plan — recorded after this summary commit)

## Files Created/Modified
- `apps/website/app/components/CookiePoliciesDashboard.vue` - Dashboard list/search/filter/drag-reorder table for cookie-policy rows
- `apps/website/app/components/FormCookiePolicy.vue` - Create/edit form for a single cookie-policy row
- `apps/website/app/pages/dashboard/maintenance/cookies/index.vue` - List page, wires CookiePoliciesDashboard
- `apps/website/app/pages/dashboard/maintenance/cookies/new.vue` - Create page, wires FormCookiePolicy
- `apps/website/app/pages/dashboard/maintenance/cookies/[id]/index.vue` - Detail/view page, documentId filter
- `apps/website/app/pages/dashboard/maintenance/cookies/[id]/edit.vue` - Edit page, documentId filter

## Decisions Made
- Followed the plan's pre-written verbatim templates exactly (transcription, not design) — no deviation from the interfaces block.
- Confirmed via diff against the real `TermsDashboard.vue`/`FormTerm.vue`/`terms/**` files before transcribing, to guard against plan/reality drift; found zero drift.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- This worktree's branch (`worktree-agent-a653d5cdbe08ebc5f`) predated the phase 04 planning commits and Plans 04-01/04-02/04-03/04-08 implementation work (28 commits ahead on `develop`). Fast-forward merged `develop` into the worktree branch before starting, to bring in the required dependencies (`cookie-policy` content-type, `CookiePolicy` TS type, `useCookiePoliciesStore`, `settings.store.ts` cookiePolicies section). No conflicts — clean fast-forward.
- Website `node_modules` was absent in this worktree; ran `pnpm install --frozen-lockfile` at repo root before verification. `vue-tsc` binary must be invoked directly via shell (`./node_modules/.bin/vue-tsc`), not via `node <path>` — the shim is a POSIX shell script, not JS, matching prior STATE.md note about worktree quirks.
- Initial grep-based verification of the `documentId: { $eq: documentId }` pattern failed due to shell interpolation of `$eq` inside double-quoted arguments; confirmed correct file content via direct `Read` and a fixed-string (`grep -F`) re-check. Not a real defect — verification-script quoting only.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Cookies dashboard CRUD (Plan 05) complete; Plan 06 (Security dashboard CRUD, same pattern) can proceed independently.
- `vue-tsc --noEmit` exits 0 for the full website app after these changes.
- No SCSS was added in this plan (not in `files_modified` per plan frontmatter) — a `_terms.scss` partial with `.terms--dashboard` styles exists, but no `.cookies--dashboard`/`.form--cookie` styles exist yet. The new dashboard pages will render unstyled (structurally correct, no BEM violations) until a styling pass covers the `cookies`/`form--cookie` blocks — flagging for awareness, not blocking, since it was out of this plan's declared scope.

---
*Phase: 04-split-legal-pages-into-4-documents-with-dashboard-management*
*Completed: 2026-07-02*
