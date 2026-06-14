---
phase: 121-clean-subscription-data-model
plan: "02"
subsystem: strapi/cron
tags: [subscription, cron, billing, period_end, refactor]
dependency_graph:
  requires: ["121-01"]
  provides: ["cron-period-end-driven-billing"]
  affects: ["api::subscription-payment.subscription-payment", "plugin::users-permissions.user"]
tech_stack:
  added: []
  patterns:
    - "subscription-payment period_end as billing period source of truth"
    - "Set<number> deduplication for cancelled users with multiple approved rows"
    - "Self-guarding query replaces idempotency check (period_end in future = already charged)"
key_files:
  modified:
    - apps/strapi/src/cron/subscription-charge.cron.ts
decisions:
  - "Self-guarding query pattern: Step 1 queries subscription-payments by period_end <= today; once a charge succeeds, the new record has period_end in the future, so it won't appear again — no explicit idempotency check needed"
  - "chargeUser periodEnd parameter replaces periodStart: the old period_end is the input, newPeriodEnd is computed from it (first of next month)"
  - "Step 4 deduplicates cancelled users with Set<number> to handle edge case of multiple past approved rows per user"
metrics:
  duration: "2m 12s"
  completed: "2026-04-09"
  tasks_completed: 2
  files_modified: 1
---

# Phase 121 Plan 02: Refactor subscription charge cron to use period_end Summary

Refactored the subscription charge cron to query `subscription-payment.period_end` exclusively instead of `user.pro_expires_at`. Zero `pro_expires_at` references remain; all 4 subscription-payment data payloads (2 creates + 2 updates) now write `period_end`.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Rewrite Step 1 + chargeUser to use period_end from subscription-payment | cb29f99a | apps/strapi/src/cron/subscription-charge.cron.ts |
| 2 | Rewrite Step 4 cancelled-expiry sweep to query subscription-payments | cb29f99a | apps/strapi/src/cron/subscription-charge.cron.ts |

Note: Both tasks were implemented in a single atomic write to the same file and committed together.

## What Changed

### Step 1 (New charges)
- **Before:** Queried `plugin::users-permissions.user` with `pro_status=active AND pro_expires_at <= today`, then ran a separate idempotency check per user against subscription-payment
- **After:** Queries `api::subscription-payment.subscription-payment` with `status=approved AND period_end <= today AND user.pro_status=active`. No idempotency check needed — the query is self-guarding (renewed records have `period_end` in the future).

### chargeUser method
- **Before:** `periodStart: string` parameter sourced from `user.pro_expires_at.split("T")[0]`; wrote `pro_expires_at` on user after successful charge
- **After:** `periodEnd: string` parameter (old period's end date); computes `newPeriodEnd` (first of next month from old end) and `newPeriodStart` (= old `periodEnd`); writes `period_end` on all 4 subscription-payment data payloads; does NOT update user

### Step 2 (Retries)
- Changed to pass `record.period_end` to `chargeUser` (was `record.period_start`)
- Added `period_end: string` to `FailedPaymentRecord` interface

### Step 3 (Deactivation)
- Removed `pro_expires_at: null` from user deactivation update

### Step 4 (Cancelled expiry sweep)
- **Before:** Queried `plugin::users-permissions.user` with `pro_status=cancelled AND pro_expires_at <= today`; user update set `pro_status: "inactive", pro_expires_at: null`
- **After:** Queries `api::subscription-payment.subscription-payment` with `status=approved AND period_end <= today AND user.pro_status=cancelled`; deduplicates by `user.id` using `Set<number>`; user update sets only `pro_status: "inactive"`

### Interfaces
- `ProUser`: removed `pro_expires_at: string`
- `FailedPaymentRecord`: added `period_end: string`
- `DuePaymentRecord`: new interface for Step 1 query results
- `CancelledUser`: removed (no longer needed)

## Verification Results

- `grep -c "pro_expires_at" apps/strapi/src/cron/subscription-charge.cron.ts` → **0**
- `grep -c "period_end" apps/strapi/src/cron/subscription-charge.cron.ts` → **14**
- Step 1 queries `api::subscription-payment.subscription-payment` — confirmed
- Step 4 queries `api::subscription-payment.subscription-payment` with deduplication — confirmed
- `chargeUser` has no `user.pro_expires_at` update — confirmed

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- File exists: apps/strapi/src/cron/subscription-charge.cron.ts — FOUND
- Commit cb29f99a — FOUND
