---
phase: 069-strapi-schema
plan: 01
subsystem: database
tags: [strapi, schema, typescript, article]

# Dependency graph
requires: []
provides:
  - source_url field in Article Strapi schema (schema.json)
  - source_url: string | null in website Article TypeScript interface
affects:
  - 070-dashboard-form-detail

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Optional string fields in Strapi schema follow pattern: type=string, required=false, no extra constraints"
    - "Nullable TypeScript fields for Strapi optional strings: string | null (not undefined)"

key-files:
  created: []
  modified:
    - apps/strapi/src/api/article/content-types/article/schema.json
    - apps/website/app/types/article.d.ts

key-decisions:
  - "No unique/maxLength constraints on source_url — kept minimal like seo_title and seo_description"
  - "Field is nullable (string | null) not optional (string | undefined) because Strapi returns null for unset fields"

patterns-established:
  - "Optional Strapi string field: { type: string, required: false } — no additional constraints"
  - "Website TypeScript nullable Strapi field: string | null"

requirements-completed: [ARTC-01]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 069 Plan 01: Strapi Schema Summary

**Added `source_url` string field to Article Strapi schema.json and `source_url: string | null` to website TypeScript interface**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T11:11:10Z
- **Completed:** 2026-03-13T11:12:46Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `source_url` attribute added to Article Strapi schema with `{ "type": "string", "required": false }`
- `source_url: string | null` added to website `Article` TypeScript interface between `seo_description` and `publishedAt`
- TypeScript check (`nuxt typecheck`) passes with no new errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add source_url attribute to Article schema.json** - `bd9a54e` (feat)
2. **Task 2: Add source_url to Article TypeScript interface (website)** - `4485c65` (feat)

**Plan metadata:** `(pending)` (docs: complete plan)

## Files Created/Modified
- `apps/strapi/src/api/article/content-types/article/schema.json` - Added `source_url` attribute to `attributes` object
- `apps/website/app/types/article.d.ts` - Added `source_url: string | null` to `Article` interface

## Decisions Made
- No `unique`, `maxLength`, or other constraints on `source_url` — kept minimal, matching existing optional string fields (`seo_title`, `seo_description`)
- Field typed as `string | null` (not `string | undefined`) because Strapi returns `null` for unset optional string fields, not `undefined`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `source_url` field exists in Strapi schema — Phase 070 (Dashboard Form & Detail) can safely add form fields and detail view consuming `source_url`
- Strapi's core serializer will include `source_url` in `GET /api/articles/:id` responses automatically
- TypeScript interface is ready for components consuming the field

## Self-Check: PASSED

- `apps/strapi/src/api/article/content-types/article/schema.json` — FOUND
- `apps/website/app/types/article.d.ts` — FOUND
- Commit `bd9a54e` (Task 1) — FOUND
- Commit `4485c65` (Task 2) — FOUND

---
*Phase: 069-strapi-schema*
*Completed: 2026-03-13*
