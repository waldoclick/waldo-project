---
phase: 05-type-safety
plan: 03
subsystem: ui
tags: [typescript, vue, nuxt, types]

# Dependency graph
requires:
  - phase: 05-01
    provides: Shared domain type files in app/types/ (user.ts, order.ts, category.ts, pack.ts)

provides:
  - UsersDefault, OrdersDefault, CategoriesDefault, PacksDefault use shared types from app/types/
  - usuarios/[id].vue uses ref<User|null> with typed normalizeUser and getRelationName
  - ordenes/[id].vue uses ref<Order|null> with typed normalizeOrder and formatFullName
  - No inline domain interfaces remain in these six files

affects: [06-performance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Import domain types via `import type { T } from "@/types/domain"` pattern in components and pages
    - Strapi query params typed as Record<string, unknown> instead of any
    - normalize functions typed with (response: unknown): T | null using object narrowing

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/UsersDefault.vue
    - apps/dashboard/app/components/OrdersDefault.vue
    - apps/dashboard/app/components/CategoriesDefault.vue
    - apps/dashboard/app/components/PacksDefault.vue
    - apps/dashboard/app/pages/usuarios/[id].vue
    - apps/dashboard/app/pages/ordenes/[id].vue

key-decisions:
  - "normalizeUser/normalizeOrder typed as (response: unknown): T | null with object type narrowing — avoids any while handling varied Strapi response shapes"
  - "formatFullName in ordenes/[id].vue uses minimal inline structural type { firstname?: string; lastname?: string } — utility function, not a domain binding"
  - "Strapi query searchParams typed as Record<string, unknown> — replaces any for non-domain API call params"

patterns-established:
  - "Pattern 1: replace any on list component searchParams with Record<string, unknown>"
  - "Pattern 2: replace any on detail page refs with ref<DomainType | null>"
  - "Pattern 3: normalize functions typed (response: unknown): T | null with in-operator narrowing"

requirements-completed: [TYPE-02]

# Metrics
duration: 2min
completed: 2026-03-05
---

# Phase 5 Plan 03: Type Safety — Users/Orders/Categories/Packs Summary

**Four list components and two detail pages migrated to shared domain types from app/types/, eliminating all inline interfaces and ref<any> for domain data**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-05T04:57:59Z
- **Completed:** 2026-03-05T04:59:39Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Replaced inline User, Order, Category, and Pack interface blocks in four list components with shared type imports
- Replaced ref<any> in usuarios/[id].vue with ref<User|null> and typed getRelationName/normalizeUser
- Replaced ref<any> in ordenes/[id].vue with ref<Order|null> and typed formatFullName/normalizeOrder
- Eliminated all : any on Strapi searchParams (now Record<string, unknown>) in three components
- All normalize functions now use typed (response: unknown): T | null with type narrowing instead of any

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace inline interfaces in the four list components** - `dc585dd` (feat)
2. **Task 2: Replace any in user and order detail pages** - `9881b6c` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified
- `apps/dashboard/app/components/UsersDefault.vue` - Imports User from @/types/user, searchParams: Record<string, unknown>
- `apps/dashboard/app/components/OrdersDefault.vue` - Imports Order and OrdersListResponse from @/types/order, sort cast to string
- `apps/dashboard/app/components/CategoriesDefault.vue` - Imports Category from @/types/category, searchParams: Record<string, unknown>
- `apps/dashboard/app/components/PacksDefault.vue` - Imports Pack from @/types/pack, searchParams: Record<string, unknown>
- `apps/dashboard/app/pages/usuarios/[id].vue` - Imports User and UserRelation, item: ref<User|null>, typed normalizeUser/getRelationName
- `apps/dashboard/app/pages/ordenes/[id].vue` - Imports Order, order: ref<Order|null>, typed normalizeOrder/formatFullName

## Decisions Made
- normalizeUser/normalizeOrder typed as (response: unknown): T | null using `"data" in response` / `"id" in response` narrowing — avoids any while remaining safe for unknown Strapi response shapes
- formatFullName in ordenes/[id].vue uses a minimal inline structural type `{ firstname?: string; lastname?: string }` — this is a utility function parameter, not a domain binding, so an inline type is appropriate per the plan
- Strapi query searchParams typed as `Record<string, unknown>` — accurate for dynamic API query params that are not domain objects

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- TYPE-02 complete for all four domains (User, Order, Category, Pack)
- All six target files now use shared types from app/types/ with no inline domain interfaces
- Ready to proceed with Phase 6 (Performance) or any remaining type-safety plans

---
*Phase: 05-type-safety*
*Completed: 2026-03-05*
