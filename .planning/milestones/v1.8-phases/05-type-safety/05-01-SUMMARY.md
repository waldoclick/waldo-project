---
phase: 05-type-safety
plan: 01
subsystem: ui
tags: [typescript, interfaces, types, domain-model]

# Dependency graph
requires: []
provides:
  - "Authoritative TypeScript interfaces for Ad, User, Order, Category, and Pack domain entities"
  - "AdStatus union type covering all six ad lifecycle states"
  - "AdGalleryItem interface for typed gallery data"
  - "OrderUser, OrderAd sub-interfaces for nested relation shapes"
  - "UserRole, UserRelation interfaces for user relation fields"
  - "OrdersListResponse interface for paginated API responses"
affects:
  - 05-type-safety/05-02
  - 05-type-safety/05-03

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single source of truth for domain types in app/types/ — one file per entity"
    - "Cross-entity import: order.ts imports from ./user for shared relation shape"
    - "Pick<User, ...> for narrowed sub-interfaces (OrderUser)"

key-files:
  created:
    - apps/dashboard/app/types/ad.ts
    - apps/dashboard/app/types/user.ts
    - apps/dashboard/app/types/order.ts
    - apps/dashboard/app/types/category.ts
    - apps/dashboard/app/types/pack.ts
  modified: []

key-decisions:
  - "All optional fields (slug, status, description, etc.) match codebase usage — no fields forced required unnecessarily"
  - "OrderUser uses Pick<User, ...> to avoid duplicating the user field list and stay in sync with User interface"
  - "AdGalleryItem formats uses index signature [key: string] to accommodate arbitrary Strapi image format names"

patterns-established:
  - "Type files are declaration-only: no implementation logic, no any in type files themselves"
  - "Nested relation objects typed inline for simple relations, extracted as named interface for complex/reused shapes"

requirements-completed: [TYPE-01]

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 05 Plan 01: Domain Type Definitions Summary

**Five authoritative TypeScript interface files covering Ad (with AdStatus union + AdGalleryItem), User (with UserRole/UserRelation), Order (with OrderUser/OrderAd/OrdersListResponse), Category, and Pack domain entities**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-05T04:55:11Z
- **Completed:** 2026-03-05T05:00:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created authoritative Ad interface with AdStatus union type and AdGalleryItem interface for gallery data
- Created User interface covering both list and detail view fields (rut, phone, birthdate, region, commune, etc.)
- Created Order interface with OrderUser (via Pick<User>), OrderAd, and OrdersListResponse for paginated responses
- Created Category and Pack interfaces matching existing inline definitions in their respective components

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Ad, User, and Order type files** - `9d664cb` (feat)
2. **Task 2: Create Category and Pack type files** - `433538d` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified
- `apps/dashboard/app/types/ad.ts` - Ad interface, AdStatus union, AdGalleryItem interface
- `apps/dashboard/app/types/user.ts` - User interface, UserRole, UserRelation interfaces
- `apps/dashboard/app/types/order.ts` - Order interface, OrderUser (Pick<User>), OrderAd, OrdersListResponse
- `apps/dashboard/app/types/category.ts` - Category interface
- `apps/dashboard/app/types/pack.ts` - Pack interface

## Decisions Made
- OrderUser uses `Pick<User, "username" | "email" | "firstname" | "lastname" | "phone">` to keep Order's user shape in sync with the canonical User interface without duplication
- AdGalleryItem `formats` uses an index signature `[key: string]: { url: string } | undefined` to accommodate arbitrary Strapi image format names alongside the named thumbnail/small/medium/large keys
- All fields that appear as optional in any component usage are marked optional — no fields forced required that Strapi may omit

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - ESLint and Prettier ran cleanly on all five new files. The prettier pre-commit hook reformatted `order.ts` (expanded the Pick<> extends clause to multi-line) which is expected and correct.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All five domain type files are ready to import in Plan 02 (component type annotation) and Plan 03 (build-time type check enforcement)
- No blockers

---
*Phase: 05-type-safety*
*Completed: 2026-03-05*
