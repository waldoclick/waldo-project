---
phase: quick-52
plan: "01"
subsystem: website/image-upload
tags: [upload, batch, cloudflare, rate-limit, composable]
dependency_graph:
  requires: []
  provides: [uploadFiles batch API in useImage.ts]
  affects: [apps/website/app/composables/useImage.ts, apps/website/app/pages/anunciar/resumen.vue]
tech_stack:
  added: []
  patterns: [single batched FormData POST with repeated "files" key]
key_files:
  modified:
    - apps/website/app/composables/useImage.ts
    - apps/website/app/pages/anunciar/resumen.vue
    - apps/website/app/types/ad.d.ts
decisions:
  - "uploadFiles returns the full Strapi response array directly — no result[0] slicing"
  - "Media.formats made optional to match Strapi upload response shape (freshly-uploaded images may not yet have all formats generated)"
  - "All files share the same FormData key 'files' — multipart allows duplicate keys, Strapi /api/ads/upload already handles Array.isArray branching"
metrics:
  duration: ~5 minutes
  completed: "2026-03-16T01:42:58Z"
  tasks_completed: 2
  files_changed: 3
---

# Quick 52: Batch all image uploads into a single POST request

**One-liner:** Replace per-image `uploadFile` loop with a single batched `uploadFiles(files[])` call to eliminate Cloudflare rate-limit failures on 3+ image uploads.

## What Was Done

Cloudflare's rate limit of 2 POST/PUT/DELETE requests per 10 seconds blocks the ad creation flow when users upload 3 or more images (each triggered a separate POST). The fix batches all pending files into a single multipart POST request.

### Task 1: Replace `uploadFile` with `uploadFiles` in useImage.ts

- Renamed `uploadFile(file: File, type: string)` → `uploadFiles(files: File[], type: string)`
- Loop appends each file with `formData.append("files", file)` (same key per entry — multipart protocol allows this; Strapi's `Array.isArray(ctx.request.files["files"])` branch handles it)
- Returns full `result` array instead of `result[0]`
- Explicit return type: `Promise<Array<{ id: number; url: string; formats?: { thumbnail: { url: string }; medium?: { url: string } } }>>`
- Dead `uploadFile` export removed entirely
- Returned object updated: `{ transformUrl, uploadFiles }`

### Task 2: Update `uploadPendingImages` in resumen.vue to use `uploadFiles`

- Destructure changed: `uploadFile` → `uploadFiles`
- `for...of` loop replaced with single `await uploadFiles(files, "gallery")`
- Results mapped via `.map()` identically to the old per-item `push()`
- Zero change to error handling, Swal, clearPendingUploads, or any other logic

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Made `Media.formats` optional in `ad.d.ts`**
- **Found during:** Task 1 (typecheck after initial implementation)
- **Issue:** `uploadFiles` return type set `formats?` as optional, but `GalleryItem extends Media` and `Media.formats` was required. TypeScript TS2322 error on the `.map()` in resumen.vue because `result.formats` could be `undefined`.
- **Fix:** Changed `Media.formats` from required to optional (`formats?:`). Accurately reflects the Strapi upload response — freshly-uploaded images may not have thumbnail/medium renditions generated yet.
- **Files modified:** `apps/website/app/types/ad.d.ts`
- **Commit:** 3ed19cb (same commit, bundled)

## Verification

`yarn workspace waldo-website nuxi typecheck` passes with zero errors after all changes.

## Self-Check: PASSED

- `apps/website/app/composables/useImage.ts` — modified, `uploadFile` removed, `uploadFiles` exported ✓
- `apps/website/app/pages/anunciar/resumen.vue` — modified, no loop, single `uploadFiles` call ✓
- `apps/website/app/types/ad.d.ts` — modified, `formats` now optional ✓
- Commit `3ed19cb` exists ✓
