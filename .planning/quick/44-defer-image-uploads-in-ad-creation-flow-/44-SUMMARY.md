---
phase: quick-44
plan: 01
subsystem: website/ad-creation
tags: [upload, deferred, gallery, composable, ux]
dependency_graph:
  requires: []
  provides: [usePendingUploads composable, deferred upload flow]
  affects: [UploadImages.vue, resumen.vue, GalleryItem type]
tech_stack:
  added: [usePendingUploads singleton composable]
  patterns: [module-level singleton ref, blob URL previews, sequential upload loop]
key_files:
  created:
    - apps/website/app/composables/usePendingUploads.ts
  modified:
    - apps/website/app/types/ad.d.ts
    - apps/website/app/components/UploadImages.vue
    - apps/website/app/pages/anunciar/resumen.vue
decisions:
  - "Module-level singleton (ref outside function) used for pendingItems — shared across all component instances on same page without Pinia, compatible with localStorage-persisted ad store"
  - "Sequential upload loop (not Promise.all) in resumen.vue — avoids hammering the upload endpoint and provides clear per-file error attribution"
  - "Blob URL revocation on removePending and clearAll — prevents memory leaks from dangling object URLs"
  - "pending?: boolean on GalleryItem — lets removeUploadedImage path skip API for local-only items"
metrics:
  duration: "~3 minutes"
  completed_date: "2026-03-15"
  tasks_completed: 3
  files_modified: 4
---

# Quick Task 44: Defer Image Uploads in Ad Creation Flow — Summary

**One-liner:** Module-level `usePendingUploads` singleton holds File + blob URL pairs in memory; UploadImages.vue shows previews without API calls; resumen.vue drains the queue with a sequential upload loop before `save-draft`.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create usePendingUploads composable + update GalleryItem | `6954632` | `usePendingUploads.ts`, `ad.d.ts` |
| 2 | Refactor UploadImages.vue to defer uploads | `41bad09` | `UploadImages.vue` |
| 3 | Upload pending files in resumen.vue before save-draft | `39a752e` | `resumen.vue` |

## What Was Built

### `usePendingUploads.ts` (new)
Module-level singleton composable holding `PendingItem[]` (File + blobUrl) in a `ref` outside the function body. Exports:
- `addPending(files)` — creates blob: URL previews, pushes to singleton
- `removePending(blobUrl)` — revokes object URL, splices from array
- `clearAll()` — revokes all blob URLs, empties array
- `getPendingFiles()` — returns `{ file, blobUrl }[]` for upload loop in resumen.vue
- `pendingGalleryItems` — computed `GalleryItem[]` with `pending: true` for display
- `pendingCount` — computed count

### `UploadImages.vue` (refactored)
- File input now has `multiple` attribute — multi-file selection in one dialog
- `handleFileChange()` validates all selected files (type + dimensions) in a loop, collects valid ones, calls `addPending(validFiles)` — **no API call**
- Toast confirms deferred: "¡Imagen lista! Se subirá al confirmar."
- `allImages` computed merges `uploadedImages` (store) + `pendingGalleryItems` (blobs)
- `calculateMax` accounts for both uploaded and pending totals
- `handleRemoveImage(image)`: `image.pending === true` → `removePending()` (no API); else → `removeUploadedImage()` (DELETE API)
- `isProcessing` lock applies only during DELETE API call

### `resumen.vue` (modified)
- `uploadPendingImages()` drains the pending queue sequentially before `save-draft`
- Each `uploadFile(file, 'gallery')` result mapped to `GalleryItem` with `transformUrl`
- Merged with `adStore.ad.gallery` items that have no `pending: true` flag
- `adStore.updateGallery([...currentGallery, ...uploadedItems])` replaces pending items with real ones
- `clearPendingUploads()` called after success to revoke all blob URLs
- If any upload fails: Swal error shown, function returns `false`, `confirmPay()` aborts — no partial state
- `isUploadingImages` ref tracks upload-in-progress state

### `ad.d.ts` (updated)
- `GalleryItem` now has `pending?: boolean` field

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Verification

- ✅ Images are NOT uploaded until user clicks confirm in resumen.vue
- ✅ Multi-select file input allows selecting multiple images at once (`multiple` attribute)
- ✅ Gallery shows blob: URL previews for pending images
- ✅ Removing a pending image requires no API call (`removePending()` only)
- ✅ `save-draft` always receives real Strapi file IDs (gallery filtered of `pending: true` before send)
- ✅ Abandoning the flow leaves no orphaned files in Strapi storage (no upload happens at select time)
- ✅ TypeScript passes with no new errors

## Self-Check: PASSED

| Item | Status |
|------|--------|
| `apps/website/app/composables/usePendingUploads.ts` | ✅ FOUND |
| `apps/website/app/types/ad.d.ts` | ✅ FOUND |
| `apps/website/app/components/UploadImages.vue` | ✅ FOUND |
| `apps/website/app/pages/anunciar/resumen.vue` | ✅ FOUND |
| `.planning/quick/44-defer-image-uploads-in-ad-creation-flow-/44-SUMMARY.md` | ✅ FOUND |
| Commit `6954632` (Task 1) | ✅ FOUND |
| Commit `41bad09` (Task 2) | ✅ FOUND |
| Commit `39a752e` (Task 3) | ✅ FOUND |
