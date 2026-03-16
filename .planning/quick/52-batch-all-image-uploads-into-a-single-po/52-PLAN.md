---
phase: quick-52
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/composables/useImage.ts
  - apps/website/app/pages/anunciar/resumen.vue
autonomous: true
requirements: []
must_haves:
  truths:
    - "All pending images are sent in a single POST request to /api/ads/upload"
    - "The for...of loop in uploadPendingImages is gone — replaced by a single await uploadFiles(...)"
    - "Upload still returns an array of GalleryItems correctly mapped from the batch response"
    - "uploadFile (singular) is removed from useImageProxy — no dead exports"
  artifacts:
    - path: apps/website/app/composables/useImage.ts
      provides: "uploadFiles(files, type) — single-request batch upload returning UploadResult[]"
    - path: apps/website/app/pages/anunciar/resumen.vue
      provides: "uploadPendingImages using uploadFiles, no loop"
  key_links:
    - from: resumen.vue
      to: useImage.ts
      via: "uploadFiles(files, 'gallery')"
      pattern: "uploadFiles\\("
    - from: useImage.ts
      to: /api/ads/upload
      via: "single fetch with FormData containing multiple files[] entries"
      pattern: "formData\\.append.*files.*file"
---

<objective>
Replace the per-image upload loop with a single batched POST request.

Purpose: The Cloudflare rate limit of 2 POST/PUT/DELETE per 10 seconds blocks uploads of 3+ images. Sending all files in one request eliminates the rate-limit problem entirely.

Output: `uploadFile` replaced by `uploadFiles` in useImage.ts; `resumen.vue` calls it once with all pending files.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/website/app/composables/useImage.ts
@apps/website/app/pages/anunciar/resumen.vue

<interfaces>
<!-- Strapi /api/ads/upload already handles files as array or single file.
     ctx.request.files["files"] branches on Array.isArray — both paths work.
     Response: array of uploaded Strapi file objects, e.g.:
       [ { id, url, formats: { thumbnail: { url } }, ... }, ... ]
     Current uploadFile returns result[0] (first element only).
     New uploadFiles must return the full array. -->

From apps/website/app/types/ad.ts (inferred from usage in resumen.vue):
```typescript
export interface GalleryItem {
  id: string;
  url: string;
  formats?: Record<string, { url: string }>;
  pending?: boolean;
}
```

usePendingUploads.getPendingFiles() returns: Array<{ file: File }>
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace uploadFile with uploadFiles in useImage.ts</name>
  <files>apps/website/app/composables/useImage.ts</files>
  <action>
Replace the existing `uploadFile(file: File, type: string)` function with `uploadFiles(files: File[], type: string)`.

Key changes:
- Parameter changes from a single `File` to `File[]`
- Loop over files array appending each with `formData.append("files", file)` (same key "files" for every entry — multipart allows duplicate keys)
- `formData.append("type", type)` appended once (unchanged)
- Single `fetch(uploadUrl, { method: "POST", body: formData, headers })` call — unchanged
- Return `result` directly (the full array), not `result[0]`
- Return type: `Promise<Array<{ id: number; url: string; formats?: Record<string, { url: string }> }>>` (infer from usage)
- Remove the old `uploadFile` export entirely — do not keep it as a wrapper
- Update the returned object from `{ transformUrl, uploadFile }` to `{ transformUrl, uploadFiles }`

Do NOT change: reCAPTCHA token logic, Authorization header logic, proxy URL logic, `transformUrl`.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "useImage|uploadFile|uploadFiles" || echo "No type errors in useImage"</automated>
  </verify>
  <done>useImage.ts exports `uploadFiles(files: File[], type: string)`, no `uploadFile` export, TypeScript clean.</done>
</task>

<task type="auto">
  <name>Task 2: Update uploadPendingImages in resumen.vue to use uploadFiles</name>
  <files>apps/website/app/pages/anunciar/resumen.vue</files>
  <action>
In the `uploadPendingImages` function, replace the `for...of` loop with a single batch call:

**Before (lines 142–151):**
```typescript
const uploadedItems: GalleryItem[] = [];
for (const { file } of pending) {
  const result = await uploadFile(file, "gallery");
  uploadedItems.push({
    id: String(result.id),
    url: transformUrl(result.formats?.thumbnail?.url || result.url),
    formats: result.formats,
  });
}
```

**After:**
```typescript
const files = pending.map(({ file }) => file);
const results = await uploadFiles(files, "gallery");
const uploadedItems: GalleryItem[] = results.map((result) => ({
  id: String(result.id),
  url: transformUrl(result.formats?.thumbnail?.url || result.url),
  formats: result.formats,
}));
```

Also update the destructure on line 42:
- Before: `const { uploadFile, transformUrl } = useImageProxy();`
- After: `const { uploadFiles, transformUrl } = useImageProxy();`

No other changes to resumen.vue.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxt typecheck 2>&1 | grep -E "resumen|uploadFile|uploadFiles" || echo "No type errors in resumen"</automated>
  </verify>
  <done>resumen.vue calls `uploadFiles(files, 'gallery')` once, no loop, TypeScript clean. `uploadFile` reference removed from destructure.</done>
</task>

</tasks>

<verification>
After both tasks, run a full typecheck to confirm zero new errors:

```bash
cd apps/website && yarn nuxt typecheck
```

Manual smoke test (optional): Start the dev server, navigate to `/anunciar`, add 3+ images, reach `/anunciar/resumen`, click confirm — network tab should show exactly ONE POST to `/api/ads/upload` containing all files.
</verification>

<success_criteria>
- `uploadFile` no longer exists in useImage.ts
- `uploadFiles` accepts `File[]`, appends all to single FormData, returns full results array
- `resumen.vue` calls `uploadFiles` once — no loop over pending files
- `yarn nuxt typecheck` passes with zero errors in modified files
- Uploading 3 images triggers 1 POST, not 3
</success_criteria>

<output>
After completion, create `.planning/quick/52-batch-all-image-uploads-into-a-single-po/52-SUMMARY.md`
</output>
