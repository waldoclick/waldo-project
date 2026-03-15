# Quick Task 46 Summary: Replace `any` types with proper typed interfaces

**Date:** 2026-03-15  
**Commit:** c84eb2d  
**Status:** Complete

## What was done

Replaced 14 Codacy `unexpected any` violations across 3 files with proper TypeScript types.

### New interfaces added

**`order.ts`:**
- `StrapiOrder { createdAt: string; amount: string | number }` — for `salesByMonth` loop

**`media-cleanup.cron.ts`:**
- `StrapiUploadFile { id, url, secure_url?, name, createdAt }` — for upload file entities
- `StrapiAd { gallery?: StrapiUploadFile[] }` — for ad entities with gallery

**`ad-expiry.cron.ts`:**
- Reused existing `Remaining` interface (already defined in the file)

### Replacements per file

| File | Fixes |
|------|-------|
| `order/controllers/order.ts` | `pagination as Record<string, string>`, `sort: Record<string, unknown>`, `populate: string \| Record<string, unknown>`, filters cast updated, `orders as StrapiOrder[]`, `ctx: Context` |
| `cron/media-cleanup.cron.ts` | `getStrapiImages(): Promise<StrapiUploadFile[]>`, 3× array casts, `image: StrapiUploadFile`, `findOrphans` signature, `deleteOrphanImages` param |
| `cron/ad-expiry.cron.ts` | `remaining: Remaining` in filter + map callbacks |

## Verification

`tsc --noEmit` passes with zero errors.
