# Quick Task 24 — Add Image Upload Component to Article Form

**Date:** 2026-03-12
**Status:** Complete

## What Was Done

Added `UploadMedia.vue` — a reusable image upload component — to the dashboard article form, enabling editors to attach a cover image and gallery images to articles.

## Files Changed

### New Files
- `apps/dashboard/app/components/UploadMedia.vue` — reusable upload component with v-model (MediaItem[]), maxFiles prop, hint prop, thumbnail preview, remove with confirmation, spinner during upload
- `apps/dashboard/app/scss/components/_upload.scss` — BEM styles for `.upload-media` block

### Modified Files
- `apps/dashboard/app/scss/app.scss` — added `@use "components/upload"`
- `apps/dashboard/app/components/FormArticle.vue` — added `cover` and `gallery` fields (MediaItem[]) to form state, hydrateForm, and save payload; added two `<UploadMedia>` inputs in template
- `apps/dashboard/app/pages/articles/[id]/edit.vue` — added `MediaItem` interface and `cover`/`gallery` to `ArticleData`; added `populate: ["cover", "gallery"]` to Strapi queries

## Key Technical Details

- Upload endpoint: `/api/upload` (via existing dashboard proxy `apps/dashboard/server/api/[...].ts` → Strapi)
- Auth: `useStrapiToken()` bearer token in `Authorization` header
- FormData key: `files` (Strapi v5 standard)
- Strapi relation payload: array of numeric media IDs (e.g. `cover: [123]`, `gallery: [124, 125]`)
- URL resolution: handles `/uploads/` paths via proxy or direct `apiUrl` depending on `apiDisableProxy` config
- TypeScript: zero typecheck errors (`yarn nuxt typecheck` passes clean)
