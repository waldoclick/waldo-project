---
phase: quick-43
plan: 01
subsystem: ad-upload
tags: [strapi, security, file-management, api, frontend]
dependency_graph:
  requires: []
  provides: [secure-image-deletion, ownership-enforcement]
  affects: [UploadImages.vue, ad-controller, ad-custom-routes]
tech_stack:
  added: []
  patterns: [ownership-check-before-delete, api-call-before-ui-update]
key_files:
  created: []
  modified:
    - apps/strapi/src/api/ad/routes/00-ad-custom.ts
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/website/app/components/UploadImages.vue
decisions:
  - "Ownership check via ad-gallery relation query (not file.createdBy) — more reliable as frontend users aren't stored in createdBy (admin field)"
  - "Store update only on API success — prevents UI/server desync on delete failure"
  - "useApiClient auto-injects X-Recaptcha-Token and Authorization — no manual headers in UploadImages.vue"
metrics:
  duration: "~1 minute"
  completed_date: "2026-03-15"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Quick Task 43: Fix Image Deletion Endpoint Call and Security Summary

**One-liner:** Secure image deletion via ownership-checked DELETE /api/ads/upload/:id, wired from UploadImages.vue to actually remove files from Strapi storage.

## What Was Built

Prior to this fix, clicking the "X" button on a gallery image in `UploadImages.vue` **only removed the item from UI state** (adStore) — the physical file persisted in Strapi's media library/storage indefinitely. Additionally, Strapi's default `DELETE /api/upload/files/:id` is unprotected, allowing any authenticated user to delete arbitrary files.

This task delivers:
1. A new **secure Strapi endpoint** `DELETE /api/ads/upload/:id` that enforces file ownership
2. **Frontend wiring** in `UploadImages.vue` to call the real API before updating UI state

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Add DELETE /api/ads/upload/:id route and secure controller handler | fdd3668 | `00-ad-custom.ts`, `controllers/ad.ts` |
| 2 | Wire UploadImages.vue to call DELETE /api/ads/upload/:id | 618d931 | `UploadImages.vue` |

## Changes Made

### Task 1: Strapi — Route + Controller

**`apps/strapi/src/api/ad/routes/00-ad-custom.ts`**
- Added `DELETE /ads/upload/:id` route with handler `ad.deleteUpload` (after existing POST upload route)

**`apps/strapi/src/api/ad/controllers/ad.ts`**
- Added `deleteUpload` method implementing full ownership security:
  - Returns **401** if request is unauthenticated
  - Returns **400** if `:id` is not a valid number
  - Returns **404** if the file does not exist in `plugin::upload.file`
  - Returns **403** if no ad owned by `ctx.state.user.id` has this file in its gallery
  - Calls `strapi.plugin('upload').service('upload').remove(file)` on success
  - Returns `{ success: true }` on success

### Task 2: Frontend — UploadImages.vue

**`apps/website/app/components/UploadImages.vue`**
- Added `import { useApiClient } from "#imports"` to `<script setup>` imports
- Instantiated `const apiClient = useApiClient()` at setup root level
- Updated `removeImage()` to:
  - Await `apiClient('/api/ads/upload/${image.id}', { method: 'DELETE' })` **before** updating store
  - Only call `adStore.removeFromGallery(image)` and show success toast after API success
  - On API failure, catch fires error toast and image stays in gallery (no UI desync)

## Security Model

The ownership check uses the ad-gallery relation query:
```typescript
const ownerAd = await strapi.db.query("api::ad.ad").findOne({
  where: {
    user: { id: userId },
    gallery: { id: fileId },
  },
});
```

This approach is reliable because:
- `file.createdBy` stores the admin user, not the frontend user
- Ad-gallery relations are the source of truth for file ownership in this system
- A user can only delete a file if at least one of their ads references it

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

### Files exist:
- `apps/strapi/src/api/ad/routes/00-ad-custom.ts` — contains `DELETE /ads/upload/:id` ✓
- `apps/strapi/src/api/ad/controllers/ad.ts` — contains `deleteUpload` method ✓
- `apps/website/app/components/UploadImages.vue` — uses `apiClient` in `removeImage` ✓

### Commits exist:
- `fdd3668` — Strapi route + controller ✓
- `618d931` — UploadImages.vue frontend wiring ✓

## Self-Check: PASSED
