# Quick Task 46: Replace `any` types with proper typed interfaces

**Mode:** quick  
**Date:** 2026-03-15

## Task

Replace all remaining `any` lint violations in three Strapi files with proper types.

### Files affected

1. `apps/strapi/src/api/order/controllers/order.ts`
2. `apps/strapi/src/cron/media-cleanup.cron.ts`
3. `apps/strapi/src/cron/ad-expiry.cron.ts`

### Violations to fix (14 total)

**order.ts:**
- L16: `query.pagination as any` → `as Record<string, string>`
- L24: `let sort: any` → `let sort: Record<string, string> | Array<Record<string, string>>`
- L45: `let populate: any` → `let populate: string | Record<string, unknown>`
- L181: `} as any` (filters in salesByMonth) → `} as unknown as Parameters<...>[1]["filters"]`
- L190: `orders as any[]` → typed via `StrapiOrder` interface
- L212: `ctx: any` → `ctx: Context` (Koa context type from @strapi/strapi)

**media-cleanup.cron.ts:**
- L74: `Promise<any[]>` → `Promise<StrapiUploadFile[]>`
- L102: `images as any[]` → `images as StrapiUploadFile[]`
- L124: `as any[]` → `as StrapiAd[]`
- L131: `image: any` → `image: StrapiUploadFile`
- L156: `strapiImages: any[], dbImages: string[]): any[]` → typed with `StrapiUploadFile`
- L177: `orphanImages: any[]` → `orphanImages: StrapiUploadFile[]`

**ad-expiry.cron.ts:**
- L130: `remaining: any` in filter → typed with `RemainingRecord`
- L131: `remaining: any` in map → same

### Approach

Define minimal inline interfaces in each file for the shapes actually used. Do NOT import from strapi internals — keep interfaces self-contained.
