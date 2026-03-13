---
phase: 070-dashboard-form-detail
plan: 01
subsystem: ui
tags: [nuxt, vue, dashboard, articles, strapi, forms]

# Dependency graph
requires:
  - phase: 069-strapi-schema
    provides: source_url field added to Article Strapi schema + TypeScript interface
provides:
  - Draft/publish toggle in FormArticle.vue sending publishedAt null/ISO string
  - source_url URL field in FormArticle.vue for article origin tracking
  - source_url rendered as clickable link in article detail page sidebar
affects: [070-dashboard-form-detail]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "publishedAt null/ISO string toggle pattern for Strapi v5 draft/publish"
    - "v-if conditional card--info block for optional sidebar data"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/FormArticle.vue
    - apps/dashboard/app/pages/articles/[id]/index.vue

key-decisions:
  - "Toggle uses a checkbox (form.published boolean) mapped to publishedAt on submit, not a direct v-model on publishedAt — avoids complexity of storing ISO strings in form state"
  - "source_url re-syncs to form.value after successful update to keep local state consistent"
  - "Detail page source_url uses same card--info pattern as Cuerpo body block (not CardInfo) since it requires a custom <a> element, not a plain string description"

patterns-established:
  - "publishedAt toggle: boolean form field → null (draft) or new Date().toISOString() (published) on submit"

requirements-completed: [ARTF-01, ARTF-02, ARTF-03, ARTF-04, ARTF-05]

# Metrics
duration: 3min
completed: 2026-03-13
---

# Phase 070 Plan 01: Dashboard Form Detail Summary

**Draft/publish toggle and source_url URL field added to FormArticle.vue, with conditional clickable link on article detail sidebar**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T11:23:44Z
- **Completed:** 2026-03-13T11:26:41Z
- **Tasks:** 2 (+ 1 human-verify checkpoint)
- **Files modified:** 2

## Accomplishments
- FormArticle.vue now sends `publishedAt: null` (draft) or ISO timestamp (published) on create and update
- source_url field added to form with URL validation, trims and sends null when empty
- Toggle hydrates correctly from existing article's publishedAt on edit
- Article detail page shows source_url as `<a target="_blank" rel="noopener noreferrer">` in sidebar, hidden when absent

## Task Commits

Each task was committed atomically:

1. **Task 1: Add source_url and draft/publish toggle to FormArticle.vue** - `f001677` (feat)
2. **Task 2: Show source_url as clickable link on article detail page** - `2f4cd4b` (feat)

**Plan metadata:** _(pending — will be added with docs commit)_

## Files Created/Modified
- `apps/dashboard/app/components/FormArticle.vue` — Added source_url field, published boolean toggle, publishedAt payload mapping, yup URL validation
- `apps/dashboard/app/pages/articles/[id]/index.vue` — Added source_url to ArticleData interface, conditional source_url link card in sidebar

## Decisions Made
- Toggle uses a boolean `form.published` mapped to `publishedAt` on submit (null vs ISO string) — cleaner than binding directly to the ISO string in form state
- source_url field re-syncs after update to keep local form state consistent with saved payload
- Detail page source_url uses the existing `card--info` pattern (same as body text block) rather than `CardInfo` component, because `CardInfo` only accepts plain string descriptions and can't render an `<a>` element

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 070 plan 01 complete
- Human verification checkpoint pending — user must confirm toggle and source_url behavior in the running dashboard
- Once verified: phase 070 complete, milestone v1.31 Article Manager Improvements complete

---
*Phase: 070-dashboard-form-detail*
*Completed: 2026-03-13*
