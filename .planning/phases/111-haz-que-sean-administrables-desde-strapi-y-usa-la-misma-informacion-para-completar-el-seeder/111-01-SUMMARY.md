---
phase: 111-haz-que-sean-administrables-desde-strapi-y-usa-la-misma-informacion-para-completar-el-seeder
plan: 01
subsystem: api
tags: [strapi, content-type, seeder, policies]

# Dependency graph
requires: []
provides:
  - "api::policy.policy Strapi collection type with title (string), text (richtext), order (integer)"
  - "policies seeder with 16 items extracted from PoliciesDefault.vue, idempotent by title"
  - "bootstrap registers populatePolicies inside APP_RUN_SEEDERS guard"
affects:
  - "website PoliciesDefault.vue — future plan will replace hardcoded faqs array with API fetch"
  - "any plan connecting /api/policies endpoint to website"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Policy content type follows FAQ pattern: createCoreController / createCoreRouter / createCoreService factories"
    - "Seeder pattern: findMany by title check before create, wrapped in try/catch per item"

key-files:
  created:
    - apps/strapi/src/api/policy/content-types/policy/schema.json
    - apps/strapi/src/api/policy/controllers/policy.ts
    - apps/strapi/src/api/policy/routes/policy.ts
    - apps/strapi/src/api/policy/services/policy.ts
    - apps/strapi/seeders/policies.ts
  modified:
    - apps/strapi/src/index.ts

key-decisions:
  - "Used richtext (not text) for policy text field because content contains multi-paragraph HTML with <p> tags"
  - "order integer field allows editors to control display sequence independently of creation order"
  - "title number 18 preserved as-is (original component skips 16-17 and jumps to 18) — data fidelity over normalization"

patterns-established:
  - "Policy seeder follows exact same structure as FAQ seeder — idempotent upsert by title"

requirements-completed: [POL-01, POL-02, POL-03, POL-07]

# Metrics
duration: 3min
completed: 2026-04-04
---

# Phase 111 Plan 01: Create Policy Content Type and Seeder Summary

**Strapi `api::policy.policy` collection type with richtext field + idempotent seeder containing all 16 policies from PoliciesDefault.vue**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-04T17:42:12Z
- **Completed:** 2026-04-04T17:45:08Z
- **Tasks:** 3 of 3 completed
- **Files modified:** 6

## Accomplishments
- Policy collection type registered in Strapi: title (string, required), text (richtext), order (integer), draftAndPublish disabled
- All 16 policy items extracted verbatim from PoliciesDefault.vue with exact Spanish text and HTML structure
- Seeder is idempotent: queries by title before creating, skips existing records
- Bootstrap calls `populatePolicies` inside the `APP_RUN_SEEDERS` guard after `populateAdDraftMigration`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create policy content type and API scaffold** - `dc8b37e0` (feat)
2. **Task 2: Create policies seeder and register in bootstrap** - `3bce503d` (feat)
3. **Task 3: Enable public access for policies endpoint** - Human-action completed (Strapi admin permissions granted)

## Files Created/Modified
- `apps/strapi/src/api/policy/content-types/policy/schema.json` - Policy collection type schema with title, text (richtext), order (integer)
- `apps/strapi/src/api/policy/controllers/policy.ts` - Core controller via createCoreController factory
- `apps/strapi/src/api/policy/routes/policy.ts` - Core router via createCoreRouter factory
- `apps/strapi/src/api/policy/services/policy.ts` - Core service via createCoreService factory
- `apps/strapi/seeders/policies.ts` - 16-item policy seeder, idempotent by title
- `apps/strapi/src/index.ts` - Import and call populatePolicies in APP_RUN_SEEDERS bootstrap block

## Decisions Made
- Used `richtext` (not `text`) for the policy text field because content contains multi-paragraph HTML with `<p>` and `<a>` tags
- Added `order` integer field to allow editors to control display sequence explicitly from the admin panel
- Preserved "18. Información de contacto" title number as-is (original component skips 16-17 and jumps to 18) — data fidelity over normalization

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — Task 3 (Strapi admin permissions grant) was completed manually by the operator. Public role now has `find` and `findOne` permissions on the `policies` endpoint.

## Next Phase Readiness
- Policy content type is fully registered and appears in Strapi Admin
- Seeder will auto-populate 16 policies when `APP_RUN_SEEDERS=true`
- Public endpoint `/api/policies` is accessible to unauthenticated requests (Task 3 done)
- Website PoliciesDefault.vue can now be updated to fetch from `/api/policies` instead of hardcoded data

---
*Phase: 111-haz-que-sean-administrables-desde-strapi-y-usa-la-misma-informacion-para-completar-el-seeder*
*Completed: 2026-04-04*
