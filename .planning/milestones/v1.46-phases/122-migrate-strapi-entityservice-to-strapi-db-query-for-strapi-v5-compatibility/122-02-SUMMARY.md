---
phase: 122-migrate-strapi-entityservice-to-strapi-db-query-for-strapi-v5-compatibility
plan: "02"
subsystem: api
tags: [strapi, db.query, entityService, migration, payments, orders]

requires: []
provides:
  - Payment utilities using strapi.db.query for ad/reservation/order operations
  - Ad service reject/ban flows releasing reservations via db.query
  - Order controller with correct offset/orderBy/where/select pagination params
  - Ad controller count() using db.query().count() with where
  - Gift controllers for ad-reservation and ad-featured-reservation using db.query
  - userUpdateController using db.query for user updates
affects:
  - 122-migrate-strapi-entityservice-to-strapi-db-query-for-strapi-v5-compatibility

tech-stack:
  added: []
  patterns:
    - "strapi.db.query(uid).update({ where: { id }, data }) — replaces entityService.update(uid, id, { data })"
    - "strapi.db.query(uid).findMany({ where, populate, limit }) — replaces entityService.findMany(uid, { filters, populate, pagination })"
    - "strapi.db.query(uid).count({ where }) — replaces entityService.count(uid, { filters })"
    - "strapi.db.query(uid).findOne({ where: { id }, populate }) — replaces entityService.findOne(uid, id, { populate })"
    - "strapi.db.query(uid).create({ data }) — replaces entityService.create(uid, { data })"
    - "select: [] replaces fields: [] in db.query findMany"
    - "offset: replaces start:, orderBy: replaces sort: in db.query findMany"
    - "{ id: { $null: true } } pattern for null relation checks inside $or clauses"

key-files:
  created: []
  modified:
    - apps/strapi/src/api/payment/utils/ad.utils.ts
    - apps/strapi/src/api/payment/utils/general.utils.ts
    - apps/strapi/src/api/payment/utils/featured.utils.ts
    - apps/strapi/src/api/payment/utils/reservation.utils.ts
    - apps/strapi/src/api/payment/utils/order.utils.ts
    - apps/strapi/src/api/payment/services/pack.service.ts
    - apps/strapi/src/api/ad-reservation/controllers/ad-reservation.ts
    - apps/strapi/src/api/ad-featured-reservation/controllers/ad-featured-reservation.ts
    - apps/strapi/src/extensions/users-permissions/controllers/userUpdateController.ts
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/strapi/src/api/order/controllers/order.ts

key-decisions:
  - "Use { ad: { id: { $null: true } } } instead of { ad: null } for null relation checks in $or clauses in db.query"
  - "fields: becomes select: in db.query findMany — critical rename for salesByMonth query"
  - "start: becomes offset:, sort: becomes orderBy: in db.query findMany"
  - "All TypeScript cast artifacts (Parameters<typeof strapi.entityService.xxx>) removed — db.query has better type inference"

patterns-established:
  - "db.query update pattern: strapi.db.query(uid).update({ where: { id }, data: { ... } })"
  - "db.query null relation in $or: { relation: { id: { $null: true } } } not { relation: null }"

requirements-completed: [MIG-01, MIG-04]

duration: 15min
completed: 2026-04-08
---

# Phase 122 Plan 02: Migrate Payment Utils, Ad Service, Order Controller Summary

**12 Strapi files migrated from entityService to db.query — payment flows, order pagination, ad operations, gift controllers, all TypeScript cast artifacts removed**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-08T00:00:00Z
- **Completed:** 2026-04-08T00:15:00Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Migrated 9 payment/utility files (ad.utils, general.utils, featured.utils, reservation.utils, order.utils, pack.service, gift controllers x2, userUpdateController) in Task 1
- Migrated 3 complex files (ad service, ad controller, order controller) with parameter renames in Task 2
- Removed all `as unknown as Parameters<typeof strapi.entityService.xxx>` TypeScript cast artifacts
- Applied correct null relation pattern `{ id: { $null: true } }` for $or clauses in general.utils
- Applied all db.query parameter renames: filters->where, start->offset, sort->orderBy, fields->select
- TypeScript compiles cleanly with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate payment utils, pack service, gift controllers, userUpdateController** - `0a73fad0` (feat)
2. **Task 2: Migrate ad service, ad controller, order controller** - `059b4e0f` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `apps/strapi/src/api/payment/utils/ad.utils.ts` - 5 update calls migrated to db.query
- `apps/strapi/src/api/payment/utils/general.utils.ts` - findMany + create migrated; null relation fix applied
- `apps/strapi/src/api/payment/utils/featured.utils.ts` - create migrated to db.query
- `apps/strapi/src/api/payment/utils/reservation.utils.ts` - findMany + create migrated to db.query
- `apps/strapi/src/api/payment/utils/order.utils.ts` - create + findOne + update migrated to db.query
- `apps/strapi/src/api/payment/services/pack.service.ts` - findOne user lookup migrated to db.query
- `apps/strapi/src/api/ad-reservation/controllers/ad-reservation.ts` - gift create migrated to db.query
- `apps/strapi/src/api/ad-featured-reservation/controllers/ad-featured-reservation.ts` - gift create migrated to db.query
- `apps/strapi/src/extensions/users-permissions/controllers/userUpdateController.ts` - update migrated to db.query
- `apps/strapi/src/api/ad/services/ad.ts` - 5 update calls in reject/ban/saveDraft flows migrated to db.query
- `apps/strapi/src/api/ad/controllers/ad.ts` - 5 count() calls in Promise.all migrated to db.query
- `apps/strapi/src/api/order/controllers/order.ts` - 4 findMany + 2 count across find/me/salesByMonth/exportCsv migrated

## Decisions Made
- Used `{ id: { $null: true } }` pattern for null relation checks inside `$or` clauses — the verified db.query pattern for filtering records where a relation is not set
- `fields:` renamed to `select:` in salesByMonth query — this is the correct db.query parameter name
- Kept populate cast `as unknown as Record<string, unknown>` in order controller me() where needed for TypeScript

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 12 files in payment/ad/order domain are now fully migrated to db.query
- Zero entityService references remain in all 12 target files
- TypeScript compiles cleanly
- Plans 01, 03, 04 cover remaining files in Phase 122

---
*Phase: 122-migrate-strapi-entityservice-to-strapi-db-query-for-strapi-v5-compatibility*
*Completed: 2026-04-08*
