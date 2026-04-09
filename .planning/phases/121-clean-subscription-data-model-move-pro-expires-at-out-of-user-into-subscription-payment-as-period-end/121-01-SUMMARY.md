---
phase: 121-clean-subscription-data-model
plan: 01
subsystem: payments
tags: [strapi, subscription, migration, knex, schema]

# Dependency graph
requires:
  - phase: 120-refactor-pro-subscription-model
    provides: subscription-payment collection type and subscription-pro canonical card data model
provides:
  - period_end field on subscription-payment schema (date, required)
  - DB migration adding period_end column to subscription_payments and dropping pro_expires_at from up_users
  - User schema without pro_expires_at attribute
  - protect-user-fields middleware without pro_expires_at
  - proResponse creates approved subscription-payment row with period_end on first inscription charge
affects: [121-02, userCron, subscription-cron, pro-status-checks]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "period_end on subscription-payment is the canonical source for billing period end — user schema has no expiry field"
    - "proResponse creates subscription-payment record immediately after successful charge before activating user"

key-files:
  created:
    - apps/strapi/database/migrations/2026.04.10T00.00.00.add-period-end-drop-pro-expires-at.ts
  modified:
    - apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json
    - apps/strapi/src/extensions/users-permissions/content-types/user/schema.json
    - apps/strapi/src/middlewares/protect-user-fields.ts
    - apps/strapi/src/api/payment/controllers/payment.ts
    - apps/strapi/src/api/payment/services/pro-cancellation.service.ts

key-decisions:
  - "period_end is date type (not datetime) to match period_start — billing periods are calendar-day granular"
  - "proResponse creates subscription-payment before activating user — charge first, then persist billing record, then update user status"
  - "paymentCreate alias for strapi.entityService.create to distinguish from the existing subProUpdate alias (which is update)"

patterns-established:
  - "Billing period tracking lives exclusively in subscription_payments — user table has no expiry field"
  - "On first PRO inscription: create subscription-payment row with period_end = first day of next month, then set user.pro_status = active"

requirements-completed: [SUB-MODEL-121-01, SUB-MODEL-121-02, SUB-MODEL-121-04]

# Metrics
duration: 12min
completed: 2026-04-09
---

# Phase 121 Plan 01: Schema changes — add period_end to subscription-payment, remove pro_expires_at from user

**period_end added to subscription-payment schema with DB migration and proResponse refactored to create the first subscription-payment record instead of writing pro_expires_at on the user**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-09T01:49:00Z
- **Completed:** 2026-04-09T02:01:31Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added `period_end` (date, required) to subscription-payment schema after `period_start`
- Removed `pro_expires_at` from user schema (3-line attribute block deleted)
- Created DB migration that adds `period_end` column to `subscription_payments` and drops `pro_expires_at` from `up_users`
- Removed `pro_expires_at` from `PROTECTED_USER_FIELDS` in protect-user-fields middleware
- Refactored proResponse to create approved subscription-payment row with `period_end` set to first day of next month instead of writing `pro_expires_at` on the user
- Updated pro-cancellation.service.ts JSDoc to reference period_end instead of pro_expires_at

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema changes + DB migration + middleware update** - `de39cd47` (feat)
2. **Task 2: Refactor proResponse to create subscription-payment with period_end** - `fd5d09ac` (feat)

**Plan metadata:** (committed with SUMMARY and state updates)

## Files Created/Modified
- `apps/strapi/src/api/subscription-payment/content-types/subscription-payment/schema.json` - Added period_end field (date, required) after period_start
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` - Removed pro_expires_at attribute block
- `apps/strapi/database/migrations/2026.04.10T00.00.00.add-period-end-drop-pro-expires-at.ts` - New migration: adds period_end column, drops pro_expires_at column
- `apps/strapi/src/middlewares/protect-user-fields.ts` - Removed pro_expires_at from PROTECTED_USER_FIELDS array and updated JSDoc
- `apps/strapi/src/api/payment/controllers/payment.ts` - proResponse now creates subscription-payment record with period_end; user update only sets pro_status
- `apps/strapi/src/api/payment/services/pro-cancellation.service.ts` - Updated JSDoc comment to reference period_end instead of pro_expires_at

## Decisions Made
- Used `paymentCreate` alias for `strapi.entityService.create` to avoid naming collision with the existing `subProUpdate` alias in the same function scope
- Migration uses `defaultTo(knex.fn.now())` to satisfy NOT NULL constraint for existing rows; application code always provides the explicit value
- Comment referencing `pro_expires_at` removed from payment.ts to ensure zero grep matches as per acceptance criteria

## Deviations from Plan

None — plan executed exactly as written. The comment in the new code initially mentioned `pro_expires_at` but was updated to remove all references to satisfy the acceptance criteria (0 grep matches).

## Issues Encountered
- Minor: The auto-written inline comment `// Activate user — only pro_status (pro_expires_at no longer exists on user)` contained `pro_expires_at` which was caught during verification. Updated comment to reference `period_end` instead. Not a deviation — corrected before commit.

## User Setup Required
None - no external service configuration required. The DB migration will run automatically on next Strapi startup.

## Next Phase Readiness
- Schema foundation is in place for Phase 121 subsequent plans
- period_end field available for cron job queries (userCron subscription expiry checks)
- subscription-payment now has both period_start and period_end for billing cycle tracking
- Any code that previously read `user.pro_expires_at` must be updated in subsequent plans

---
*Phase: 121-clean-subscription-data-model*
*Completed: 2026-04-09*
