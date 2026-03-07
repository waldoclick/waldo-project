---
phase: 20-user-cron-fix-and-docs
plan: 01
subsystem: cron
tags: [bug-fix, cron, free-ads, documentation]
dependency_graph:
  requires: []
  provides: [CRON-01, CRON-05, DOC-03]
  affects: [user.cron, ad deactivation, reservation restore]
tech_stack:
  added: []
  patterns: [two-phase Map-based grouping for multi-entity per-user processing]
key_files:
  created: []
  modified:
    - apps/strapi/src/cron/user.cron.ts
decisions:
  - "Use Map<userId, {user, ads[]}> two-phase approach: collect all expired ads first, then process per user — ensures every ad is deactivated and restoreUserFreeReservations is called exactly once per user"
  - "Remove PaymentUtils import (was never used in this file)"
metrics:
  duration: 77s
  completed: 2026-03-06T22:56:14Z
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 20 Plan 01: user.cron Fix & Docs Summary

**One-liner:** Fixed multi-ad deactivation bug using two-phase userAdMap pattern, removed unused PaymentUtils import, translated all comments to English.

## What Was Built

Rewrote the `restoreFreeAds` method in `apps/strapi/src/cron/user.cron.ts` to correctly process all expired free ads regardless of how many a single user has. The previous implementation used a `processedUsers: Set<string>` with an early-`continue` guard that silently skipped every ad after the first per user — meaning users with multiple expired free ads would retain active-but-expired ads after the cron ran.

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix multi-ad deactivation loop, remove unused import | 7b84fde | apps/strapi/src/cron/user.cron.ts |

## Key Changes

### Bug Fix (CRON-01)
Replaced `processedUsers: Set<string>` + `continue` guard with a two-phase approach:

- **Phase A:** Iterate `expiredFreeAds` and build `userAdMap: Map<string, {user, ads[]}>` — every expired ad is collected, no skipping
- **Phase B:** Iterate `userAdMap` — for each unique user, deactivate every ad in their list, then call `restoreUserFreeReservations` once after all their ads are done

This ensures:
- All expired ads are deactivated in a single cron run
- `restoreUserFreeReservations` is called exactly once per user (not once per ad), preventing duplicate reservation top-ups

### Unused Import Removal (CRON-05)
Deleted `import PaymentUtils from "../api/payment/utils"` — line was never referenced in the file.

### English Documentation (DOC-03)
Replaced all Spanish comments with English equivalents and added new explanatory comments:
- Top of `restoreFreeAds`: explains the query purpose
- Above `userAdMap` build: explains grouping rationale and multi-ad scenario
- Above outer `for...of userAdMap`: explains per-user processing goal
- Above inner `for (const ad of ads)`: explains why each ad must be deactivated individually
- Above `restoreUserFreeReservations` call: explains the once-per-user calling convention
- Above email report block: explains admin notification purpose
- In `restoreUserFreeReservations`: explains reservation count query, the 3-reservation guarantee, and the top-up loop

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| No PaymentUtils import | ✅ PASS |
| No processedUsers Set | ✅ PASS |
| userAdMap present (5 occurrences) | ✅ PASS |
| restoreUserFreeReservations outside inner ad loop | ✅ PASS |
| No Spanish characters in comments | ✅ PASS |
| `npx tsc --noEmit` — no errors in user.cron.ts | ✅ PASS |

## Self-Check: PASSED

All files exist and commit 7b84fde is present in git log.
