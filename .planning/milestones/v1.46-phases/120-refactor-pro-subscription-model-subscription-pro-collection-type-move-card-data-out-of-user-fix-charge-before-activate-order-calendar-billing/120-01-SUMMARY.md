---
phase: 120-refactor-pro-subscription-model
plan: "01"
subsystem: payments
tags: [strapi, subscription, oneclick, tbk, schema, migration]

requires:
  - phase: 120-00
    provides: research and design decisions for PRO subscription refactor

provides:
  - subscription-pro Strapi collection type with oneToOne relation to user
  - user schema updated with subscription_pro inverse relation and orphaned pro boolean removed
  - idempotent bootstrap migration copying card enrollment data to subscription-pro records

affects:
  - 120-02: charge-before-activate fix (reads subscription-pro)
  - 120-03: migrate write paths (updates subscription-pro instead of user card fields)

tech-stack:
  added: []
  patterns:
    - "bootstrap migration pattern: idempotent, logged, wrapped in try/catch in src/index.ts"
    - "oneToOne relation pattern: subscription-pro owns FK (inversedBy), user has mappedBy"

key-files:
  created:
    - apps/strapi/src/api/subscription-pro/content-types/subscription-pro/schema.json
    - apps/strapi/src/bootstrap/migrate-subscription-pro.ts
  modified:
    - apps/strapi/src/extensions/users-permissions/content-types/user/schema.json
    - apps/strapi/src/index.ts

key-decisions:
  - "subscription-pro owns the FK — inversedBy on subscription-pro, mappedBy on user — Strapi oneToOne convention"
  - "pro boolean removed immediately (orphaned since Phase 103.1); card fields (tbk_user, pro_card_*) kept on user until Plan 03 migrates write paths"
  - "Migration is idempotent via findOne check before create — safe on every Strapi restart"

patterns-established:
  - "Bootstrap migrations: create in src/bootstrap/, import in src/index.ts, wrap in try/catch"

requirements-completed: [SUB-SCHEMA-01, SUB-SCHEMA-02, SUB-SCHEMA-03, SUB-MIGRATE-01]

duration: 15min
completed: 2026-04-09
---

# Phase 120 Plan 01: Subscription-PRO Schema and Bootstrap Migration Summary

**subscription-pro Strapi collection type with oneToOne user relation and idempotent card data migration on bootstrap**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-09T00:42:37Z
- **Completed:** 2026-04-09T00:57:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `subscription-pro` collection type schema with 6 attributes (user, tbk_user, card_type, card_last4, inscription_token, pending_invoice)
- Established oneToOne relation between subscription-pro and user — subscription-pro owns the FK with `inversedBy`, user has `mappedBy`
- Removed orphaned `pro` boolean field from user schema (dead since Phase 103.1)
- Added inverse `subscription_pro` relation to user schema after `orders`
- Created idempotent bootstrap migration that copies card enrollment data from active/cancelled users to subscription-pro records on every Strapi startup

## Task Commits

Each task was committed atomically:

1. **Task 1: Create subscription-pro collection type schema and update user schema** - `f9aa0716` (feat)
2. **Task 2: Create bootstrap migration for existing PRO users** - `9c0f76c7` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `apps/strapi/src/api/subscription-pro/content-types/subscription-pro/schema.json` - New collection type schema
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` - Added subscription_pro relation, removed pro boolean
- `apps/strapi/src/bootstrap/migrate-subscription-pro.ts` - Idempotent card data migration function
- `apps/strapi/src/index.ts` - Import and call migrateSubscriptionPro() in bootstrap

## Decisions Made

- **subscription-pro owns the FK:** `inversedBy: "subscription_pro"` on the subscription-pro side, `mappedBy: "user"` on the user side — standard Strapi oneToOne convention where the owning side holds the FK column.
- **pro boolean removed now:** The field has been orphaned since Phase 103.1 (pro_status is the source of truth). Removing it in Plan 01 keeps the schema clean while card fields are kept temporarily.
- **Card fields kept on user until Plan 03:** `tbk_user`, `pro_card_type`, `pro_card_last4`, `pro_inscription_token`, `pro_pending_invoice` remain on user so the subscription-charge cron and cancellation service continue working without changes.
- **Migration uses strapi global:** Follows the same pattern as cron jobs (strapi as ambient global, not passed parameter), consistent with existing Strapi service code.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- subscription-pro schema is live; Strapi will create the `subscription_pros` table on next boot
- Bootstrap migration will auto-populate records for all active/cancelled PRO users with tbk_user on next restart
- Plan 02 can now update subscription-payment relations and the charge-before-activate logic to use subscription-pro
- Plan 03 can migrate write paths (inscription, cancellation) from user card fields to subscription-pro

---
*Phase: 120-refactor-pro-subscription-model*
*Completed: 2026-04-09*
