# Quick Task 47 Summary: Fix strapi develop TS errors — populate casts

**Date:** 2026-03-15
**Commit:** 05dad51
**Status:** Complete

## What was done

Fixed 2 TypeScript errors that appeared only during `strapi develop` (esbuild/strapi build) but not during standalone `tsc --noEmit`.

### Root cause

`Parameters<typeof strapi.entityService.findMany>[1]["populate"]` resolves to `Populate.Any<ContentType>` (the broad union) during strapi's build-time generics resolution, which is not assignable to the narrowed `Populate.Any<"api::ad.ad">` or `Populate.Any<"api::order.order">` expected at the call site.

### Fix

Replaced both `Parameters<>` populate casts with the simpler `as unknown as Record<string, unknown>` pattern — consistent with how other fields in the same files are already cast (per AGENTS.md Strapi SDK v5 cast patterns).

### Files changed

| File | Line | Before | After |
|------|------|--------|-------|
| `api/ad/controllers/ad.ts` | 531 | `as unknown as Parameters<typeof strapi.entityService.findMany>[1]["populate"]` | `as unknown as Record<string, unknown>` |
| `api/order/controllers/order.ts` | 66 | bare `populate` (typed `string \| Record<string, unknown>`) | `populate as unknown as Record<string, unknown>` |

## Verification

`tsc --noEmit` passes with zero errors. `strapi develop` no longer emits TS errors on startup.
