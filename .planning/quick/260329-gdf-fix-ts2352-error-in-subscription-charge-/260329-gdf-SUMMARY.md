---
phase: quick
plan: 260329-gdf
subsystem: strapi/cron
tags: [typescript, bugfix, interface, subscription]
dependency_graph:
  requires: []
  provides: [ProUser.pro_pending_invoice typed field]
  affects: [apps/strapi/src/cron/subscription-charge.cron.ts]
tech_stack:
  added: []
  patterns: [interface extension for proper typing instead of unsafe cast]
key_files:
  created: []
  modified:
    - apps/strapi/src/cron/subscription-charge.cron.ts
decisions:
  - "Add pro_pending_invoice as optional boolean to ProUser interface rather than using Record<string, unknown> double-cast"
metrics:
  duration: 5m
  completed_date: "2026-03-29"
  tasks_completed: 1
  files_modified: 1
---

# Quick 260329-gdf: Fix TS2352 Error in subscription-charge.cron.ts Summary

**One-liner:** Added `pro_pending_invoice?: boolean` to `ProUser` interface, eliminating TS2352 unsafe cast on line 395.

## What Was Done

Added the `pro_pending_invoice` optional boolean field to the `ProUser` interface and removed the `(user as Record<string, unknown>)` cast that was required to access the field. TypeScript now resolves the field directly from the interface with no errors.

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add pro_pending_invoice to ProUser interface and remove unsafe cast | 3fee8d76 | apps/strapi/src/cron/subscription-charge.cron.ts |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `tsc --noEmit` produces no TS2352 error for subscription-charge.cron.ts
- ProUser interface properly declares `pro_pending_invoice?: boolean`
- No double-cast workaround remains

## Self-Check: PASSED

- File exists: apps/strapi/src/cron/subscription-charge.cron.ts — FOUND
- Commit 3fee8d76 — FOUND
