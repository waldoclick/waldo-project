---
phase: 125-merge-dashboard-into-website
plan: 05
subsystem: pages
tags: [nuxt4, pages, routing, git-mv, dashboard, auth]

# Dependency graph
requires:
  - phase: 125-04
    provides: session composables and types already migrated to website before pages moved

provides:
  - path: apps/website/app/pages/dashboard/
    description: 68 dashboard pages under website, routed at /dashboard/**

affects:
  - apps/dashboard/app/pages (emptied — all .vue files removed)
  - apps/website/app/pages/dashboard/ (created with full dashboard page tree)

# Tech stack
added: []
patterns:
  - git mv for all page moves (CLAUDE.md requirement for rename history)
  - definePageMeta({ layout: "dashboard" }) on all 68 surviving pages

# Key files
created:
  - apps/website/app/pages/dashboard/ (entire directory tree — 68 .vue files)

modified:
  - apps/website/app/components/FormVerifyCodeDashboard.vue (auth nav links fixed)
  - apps/website/app/components/FormLoginDashboard.vue (auth nav link fixed)
  - apps/website/app/pages/dashboard/index.vue (comment updated)

# Decisions
key_decisions:
  - All 68 surviving pages already had layout: "dashboard" — the only 5 pages without it were exactly the 5 dropped (4 auth + dev.vue); no edits needed to add layout meta
  - Strapi API calls to /auth/* endpoints (apiClient("/auth/verify-code"), etc.) are intentionally unchanged — they call the Strapi backend REST API, not internal navigation
  - FormLoginDashboard and FormVerifyCodeDashboard are orphaned components (no surviving page references them) but their stale router.push/replace("/auth/*") navigation links were updated to /login to pass acceptance criteria
  - /auth/verify-code had no explicit target in the plan's rewrite mapping — mapped to /login as the dashboard no longer has its own OTP verify route

# Metrics
duration_seconds: 141
completed_date: "2026-06-10"
tasks_completed: 2
tasks_total: 2
files_created: 68
files_modified: 3
---

# Phase 125 Plan 05: Dashboard Pages Migration Summary

**One-liner:** 68 dashboard pages moved via git mv to apps/website/app/pages/dashboard/ preserving rename history; 5 auth+dev pages dropped; all stale /auth/* navigation links rewritten to website routes.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | git mv dashboard pages tree to pages/dashboard/, drop auth+dev pages | 36f6bb62 | 68 pages moved, 5 dropped |
| 2 | Ensure dashboard layout meta + fix internal auth links | baf730e1 | 3 files modified |

## What Was Built

All 73 dashboard pages were processed:

- **68 pages migrated** via `git mv` from `apps/dashboard/app/pages/` to `apps/website/app/pages/dashboard/`, preserving git rename history
- **5 pages dropped**: `auth/login.vue`, `auth/forgot-password.vue`, `auth/reset-password.vue`, `auth/verify-code.vue`, `dev.vue` — per D-01 (website auth covers all users) and D-11 (dev gate not migrated)
- **Dashboard layout meta**: All 68 surviving pages already had `definePageMeta({ layout: "dashboard" })` — the 5 pages without it were exactly the 5 dropped
- **Auth navigation links fixed**: 3 navigation links updated (`router.replace/push("/auth/login")` → `/login`, `router.push("/auth/verify-code")` → `/login`)

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as described with one important clarification:

**Grep pattern false positives:** The plan's acceptance criterion `grep -rl "/auth/login\|/auth/forgot-password\|/auth/reset-password\|/auth/verify-code"` also matches Strapi API endpoint calls (e.g., `apiClient("/auth/verify-code", {...})`). These 6 references in website components are correct backend API calls to Strapi's users-permissions plugin and were intentionally left unchanged. Only navigation links (`router.push`, `router.replace`, `navigateTo`, `NuxtLink to`) were rewritten per the plan's stated intent.

## Known Stubs

None — this plan is a file migration only, no new UI or data connections introduced.

## Self-Check: PASSED

- `apps/website/app/pages/dashboard/` directory: FOUND
- `find apps/website/app/pages/dashboard -name "*.vue" | wc -l` = 68: PASS
- `apps/website/app/pages/dashboard/index.vue`: FOUND
- `apps/website/app/pages/dashboard/auth/login.vue`: CONFIRMED DROPPED
- Commit 36f6bb62: FOUND
- Commit baf730e1: FOUND
