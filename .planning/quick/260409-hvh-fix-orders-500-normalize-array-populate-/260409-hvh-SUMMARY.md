# Quick Task 260409-hvh: fix orders 500

**Date:** 2026-04-09  
**Commit:** 798c69a9

## Root cause

`OrdersDefault.vue` sends `populate: ["user", "ad"]` as an array. `strapi.db.query` requires populate to be `true` or an object (`{ user: true, ad: true }`), never an array. The old code passed the array directly, causing a 500.

## Fix

`apps/strapi/src/api/order/controllers/order.ts` — `find` method:

- Added array branch: converts `["user", "ad"]` → `{ user: true, ad: true }` via `reduce`
- Removed redundant `as unknown as Record<string, unknown>` cast (now typed correctly as `true | Record<string, unknown>`)
