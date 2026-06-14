---
phase: 126-security-hardening
plan: "03"
subsystem: strapi-payment
tags: [security, idor, authorization, free-ad, jest]
dependency_graph:
  requires: []
  provides: [SEC-IDOR-FREEAD]
  affects: [apps/strapi/src/api/payment/services/free-ad.service.ts]
tech_stack:
  added: []
  patterns: [ownership-guard, string-safe-compare, jest-mock-paymentutils]
key_files:
  created:
    - apps/strapi/tests/api/payment/services/free-ad.service.test.ts
  modified:
    - apps/strapi/src/api/payment/services/free-ad.service.ts
decisions:
  - "String-safe compare (String(ad.user?.id) !== String(userId)) handles number/string id mismatches from Strapi db.query"
  - "Guard inserted between Step 1 (load) and Step 2 (credit validation) so no mutation can run for a foreign ad"
  - "Return message 'Forbidden: ad does not belong to user' distinguishes IDOR rejection from other failure modes in logs"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-12"
  tasks_completed: 2
  files_changed: 2
requirements: [SEC-IDOR-FREEAD]
---

# Phase 126 Plan 03: Free-Ad Ownership IDOR Fix Summary

**One-liner:** Ownership assertion (`String(ad.user?.id) !== String(userId)`) blocks foreign-ad free-publish before any mutation, with 3-case Jest regression coverage.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add ownership assertion before mutations in free-ad.service.ts | bf0b191c | apps/strapi/src/api/payment/services/free-ad.service.ts |
| 2 | Jest regression test for free-ad ownership | 8648bc45 | apps/strapi/tests/api/payment/services/free-ad.service.test.ts |

## What Was Built

### Task 1 — Ownership guard in free-ad.service.ts

Inserted an ownership check immediately after the `getAdById` null-guard and before Step 2 (credit validation), ensuring none of `updateAdReservation`, `updateAdDates`, or `publishAd` can execute for a foreign ad:

```ts
// Ownership guard (SEC-IDOR-FREEAD): a user may only free-publish their own ad.
const ad = result.ad as { user?: { id?: number | string } };
if (String(ad.user?.id) !== String(userId)) {
  return {
    success: false,
    message: "Forbidden: ad does not belong to user",
  };
}
```

The `String()` wrap on both sides handles the `number` (from Strapi `db.query`) vs `string` (from JWT `userId`) mismatch safely.

### Task 2 — Jest regression tests (3 cases)

- **Foreign ad → forbidden**: `ad.user.id = 999`, `userId = "123"` → `success: false`, `message` matches `/Forbidden/`, all three mutation functions NOT called.
- **Owned ad → publishes**: `ad.user.id = 123`, `userId = "123"` → `success: true`, `publishAd` called with `1`.
- **String/number match**: `ad.user.id = 123` (number), `userId = "123"` (string) → treated as same owner → `success: true`, `publishAd` called.

All 3 tests pass: `3 passed, 0 failed`.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all functionality is fully wired.

## Verification

- `grep "ad does not belong to user" apps/strapi/src/api/payment/services/free-ad.service.ts` — FOUND
- `grep "String(userId)" apps/strapi/src/api/payment/services/free-ad.service.ts` — FOUND
- `cd apps/strapi && pnpm exec jest tests/api/payment/services/free-ad.service.test.ts` — 3 passed, 0 failed
- Ownership check is textually before `updateAdReservation`, `updateAdDates`, and `publishAd` — verified by reading the file
