---
phase: 120-refactor-pro-subscription-model
plan: "03"
subsystem: strapi/cron, strapi/payment, strapi/middlewares
tags: [subscription, cron, cancellation, middleware, refactor]
dependency_graph:
  requires: ["120-01"]
  provides: [read-path-migration-from-user-to-subscription-pro]
  affects: [subscription-charge-cron, pro-cancellation-service, protect-user-fields-middleware]
tech_stack:
  added: []
  patterns: [dual-write, nested-populate, intersection-type-spread]
key_files:
  created: []
  modified:
    - apps/strapi/src/cron/subscription-charge.cron.ts
    - apps/strapi/src/api/payment/services/pro-cancellation.service.ts
    - apps/strapi/src/middlewares/protect-user-fields.ts
decisions:
  - "Dual-write kept: cancellation clears tbk_user on both subscription-pro and user entity until user schema fields are dropped in a future phase"
  - "chargeUser receives ProUser & { tbk_user: string } intersection via spread to preserve existing authorizeCharge call-site signature"
  - "PROTECTED_USER_FIELDS array unchanged: card fields remain protected as they still exist on user schema"
metrics:
  duration: "~2.5 minutes"
  completed_date: "2026-04-09"
  tasks_completed: 2
  files_modified: 3
---

# Phase 120 Plan 03: Read-path migration — cron and cancellation read card data from subscription-pro

One-liner: Migrated subscription charge cron and cancellation service to source tbk_user from the subscription-pro relation instead of the user entity, completing the read-path migration; protect-user-fields middleware JSDoc updated to document dual-write rationale.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update cron to read tbk_user from subscription-pro | 5eb6e91e | apps/strapi/src/cron/subscription-charge.cron.ts |
| 2 | Update cancellation service and middleware JSDoc | 289794e3 | apps/strapi/src/api/payment/services/pro-cancellation.service.ts, apps/strapi/src/middlewares/protect-user-fields.ts |

## What Was Built

### Task 1: Subscription Charge Cron Migration

- **ProUser interface**: Removed `tbk_user: string` from top level; added `subscription_pro?: { tbk_user?: string } | null`
- **Expired users findMany**: Added `"documentId"` and `"pro_pending_invoice"` to fields (required by chargeUser); added `populate: ["subscription_pro"]`
- **tbkUser guard**: Before each `chargeUser` call, extract `user.subscription_pro?.tbk_user`; skip with `logger.warn` if missing
- **chargeUser spread**: Calls pass `{ ...user, tbk_user: tbkUser }` so the intersection type `ProUser & { tbk_user: string }` is satisfied
- **Retry loop**: Updated `findMany` to use nested populate `{ user: { populate: ["subscription_pro"] } }`; retry loop also extracts and guards `tbkUser`
- **Deactivation cleanup**: After deactivating an exhausted user, the cron now also clears `tbk_user` on the subscription-pro record (inside try/catch to remain non-fatal)

### Task 2: Cancellation Service and Middleware

- **pro-cancellation.service.ts**: Replaced user entity fetch with `strapi.db.query("api::subscription-pro.subscription-pro").findOne(...)` to get `tbk_user`. After Transbank deletion, clears `tbk_user` on the subscription-pro record, then dual-writes `pro_status: "cancelled"` and `tbk_user: null` on user
- **protect-user-fields.ts**: JSDoc updated to document that card enrollment fields remain in `PROTECTED_USER_FIELDS` because they still exist on the user schema (dual-write period). The array itself is unchanged

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- apps/strapi/src/cron/subscription-charge.cron.ts — file exists, contains `subscription_pro` 6 times
- apps/strapi/src/api/payment/services/pro-cancellation.service.ts — file exists, queries `api::subscription-pro.subscription-pro`
- apps/strapi/src/middlewares/protect-user-fields.ts — file exists, `tbk_user` still in PROTECTED_USER_FIELDS
- TypeScript: `npx tsc --noEmit` — no errors
- Commits 5eb6e91e and 289794e3 verified in git log
