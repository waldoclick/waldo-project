---
phase: quick
plan: 260404-nms
subsystem: dashboard
tags: [policies, fix, numeric-id, routing]
dependency_graph:
  requires: []
  provides: [policy-detail-by-numeric-id, policy-edit-by-numeric-id, policy-save-redirect-numeric]
  affects: [apps/dashboard/app/pages/policies, apps/dashboard/app/components/FormPolicy.vue]
tech_stack:
  added: []
  patterns: [numeric-id filter via id.$eq, useAsyncData default option]
key_files:
  modified:
    - apps/dashboard/app/pages/policies/[id]/index.vue
    - apps/dashboard/app/pages/policies/[id]/edit.vue
    - apps/dashboard/app/components/FormPolicy.vue
decisions:
  - Resolve policyId in FormPolicy from route.params.id directly — no secondary Strapi lookup needed when numeric id is always in the URL
metrics:
  duration: ~8min
  completed: 2026-04-04
  tasks_completed: 2
  files_modified: 3
---

# Quick Task 260404-nms: Policy Detail/Edit Pages Show Empty Data — Summary

**One-liner:** Fix policy detail, edit, and save-redirect flows by replacing documentId-based filters with `id: { $eq: Number(id) }` numeric id filter, consistent with the rest of the dashboard.

## Problem

The policies list navigated to `/policies/{numericId}`, but both detail and edit pages filtered by `documentId` (a UUID string). Since the URL param is a number like "34", Strapi never matched a record and both pages rendered empty. After saving, `FormPolicy` also redirected to the `documentId` UUID, which the detail page again could not resolve.

## Solution

### Task 1 — Policy detail and edit pages (30a16998)

- Replaced `filters: { documentId: { $eq: id } }` with `filters: { id: { $eq: Number(id) } }` in both `index.vue` and `edit.vue`
- Removed the entire fallback `apiClient('policies/id')` block — no fallback needed with numeric id filter
- Added `default: () => null` to both `useAsyncData` calls per CLAUDE.md rule

### Task 2 — FormPolicy post-save navigation (f026572a)

- Removed the `if (!policyId && documentId)` secondary lookup block — `route.params.id` is always the numeric id so no lookup is ever needed
- Changed `policyId` resolution to: `props.policy?.id || Number(route.params.id)`
- Flipped redirect preference from `documentId || id` to `id || documentId` in both PUT (line ~163) and POST (line ~190) paths

## Commits

| Task | Commit | Files |
|------|--------|-------|
| 1 | 30a16998 | policies/[id]/index.vue, policies/[id]/edit.vue |
| 2 | f026572a | components/FormPolicy.vue |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/dashboard/app/pages/policies/[id]/index.vue` — exists, contains `id: { $eq: Number(id) }`
- `apps/dashboard/app/pages/policies/[id]/edit.vue` — exists, contains `id: { $eq: Number(id) }`
- `apps/dashboard/app/components/FormPolicy.vue` — exists, contains `props.policy?.id || Number(route.params.id)` and `responseData?.id || responseData?.documentId`
- Commits 30a16998 and f026572a — confirmed in git log
