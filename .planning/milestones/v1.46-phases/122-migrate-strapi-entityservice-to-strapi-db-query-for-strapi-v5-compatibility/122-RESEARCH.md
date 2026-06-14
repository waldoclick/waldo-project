# Phase 122: Migrate strapi.entityService to strapi.db.query — Research

**Researched:** 2026-04-08
**Domain:** Strapi v5 database API migration
**Confidence:** HIGH

## Summary

`strapi.entityService` does not exist in Strapi v5 and causes "Cannot read properties of undefined" runtime crashes on every call site. The replacement is `strapi.db.query(uid)` which has an established and well-understood API. This project already uses `strapi.db.query()` extensively — many files already have both patterns co-existing, with `strapi.db.query` having been introduced incrementally. The migration is a mechanical substitution at 28 files, with three categories of complexity: simple CRUD controllers (high volume, low risk), complex query files in the cron/payment layer (lower volume, higher care needed), and lifecycle hooks (simple findOne replacements).

The project's own test file for `subscription-charge.cron.ts` already mocks `strapi.entityService` on the global `strapi` object — those mocks will need to be updated to `strapi.db.query` mocks after the migration. TypeScript cast patterns (`as Parameters<typeof strapi.entityService.xxx>[N]`) must be removed cleanly; they were workarounds for the broken type and are not needed with `strapi.db.query`.

**Primary recommendation:** Migrate in three waves — (1) the 6 simple CRUD controllers (faq, commune, region, condition, category, ad-pack) and the 5 lifecycle hooks, (2) the payment utils and ad service files, (3) the cron files and test updates. Verify TypeScript after each wave.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `strapi.db.query(uid)` | Strapi v5 built-in | Database access layer | The only supported low-level DB API in Strapi v5 |
| `strapi.documents(uid)` | Strapi v5 built-in | Document service (higher-level) | For document-level operations with locale/status support |

### API Difference Reference
| entityService (v4, broken in v5) | db.query (v5, correct) |
|----------------------------------|------------------------|
| `findOne(uid, id, { populate })` | `.findOne({ where: { id }, populate })` |
| `findMany(uid, { filters, populate, sort, limit, start })` | `.findMany({ where: filters, populate, orderBy: sort, limit, offset: start })` |
| `create(uid, { data })` | `.create({ data })` |
| `update(uid, id, { data })` | `.update({ where: { id }, data })` |
| `delete(uid, id)` | `.delete({ where: { id } })` |
| `count(uid, { filters })` | `.count({ where: filters })` |

**Note on `start` vs `offset`:** `entityService.findMany` uses `start` for offset-based pagination. `db.query().findMany` uses `offset`. This must be translated in every paginated `findMany` call.

**Note on `sort` vs `orderBy`:** `entityService` uses `sort`; `db.query` uses `orderBy`. The value format is the same (object like `{ createdAt: 'desc' }`).

**Note on `pagination` parameter:** `entityService.findMany` accepted a `pagination: { pageSize: -1 }` shorthand. `db.query().findMany` uses `limit: -1` directly (no pagination wrapper). All `pagination: { pageSize: -1 }` must become `limit: -1`.

**Note on `fields` parameter:** `entityService.findMany` accepted a `fields` array to select specific columns. `db.query().findMany` uses `select` instead of `fields`. This affects `ad-free-reservation-restore.cron.ts` (which uses `fields: ['id', 'username', 'email']`) and `order.ts` (`salesByMonth` uses `fields: ['amount', 'createdAt']`).

## Architecture Patterns

### Recommended Migration Structure

Each call site transforms according to a mechanical rule:

```typescript
// BEFORE (entityService — broken in v5)
const result = await strapi.entityService.findMany("api::foo.foo", {
  filters: { active: true },
  populate: ["user"],
  sort: { createdAt: "desc" },
  start: 0,
  limit: 25,
  pagination: { pageSize: -1 },
});

// AFTER (db.query — correct in v5)
const result = await strapi.db.query("api::foo.foo").findMany({
  where: { active: true },
  populate: ["user"],
  orderBy: { createdAt: "desc" },
  offset: 0,
  limit: 25,
  // for "all records": limit: -1 (no pagination wrapper)
});
```

```typescript
// BEFORE
await strapi.entityService.findOne("api::foo.foo", id, { populate: ["user"] });
// AFTER
await strapi.db.query("api::foo.foo").findOne({ where: { id }, populate: ["user"] });
```

```typescript
// BEFORE
await strapi.entityService.create("api::foo.foo", { data });
// AFTER
await strapi.db.query("api::foo.foo").create({ data });
```

```typescript
// BEFORE
await strapi.entityService.update("api::foo.foo", id, { data });
// AFTER
await strapi.db.query("api::foo.foo").update({ where: { id }, data });
```

```typescript
// BEFORE
await strapi.entityService.delete("api::foo.foo", id);
// AFTER
await strapi.db.query("api::foo.foo").delete({ where: { id } });
```

```typescript
// BEFORE
await strapi.entityService.count("api::foo.foo", { filters });
// AFTER
await strapi.db.query("api::foo.foo").count({ where: filters });
```

### TypeScript Cast Removal

The old code used two cast patterns to satisfy TypeScript when `entityService` types were incomplete. Both must be removed:

**Pattern A — inline cast on parameter:**
```typescript
// BEFORE (remove all these casts)
await strapi.entityService.findMany("api::foo.foo" as Parameters<
  typeof strapi.entityService.findMany
>[0], { ... })

// AFTER (no cast needed)
await strapi.db.query("api::foo.foo").findMany({ ... })
```

**Pattern B — function alias for create/update on unregistered content types:**
```typescript
// BEFORE (in subscription-charge.cron.ts)
const subPaymentCreate = strapi.entityService.create as (
  _uid: string,
  _params: { data: Record<string, unknown> }
) => Promise<unknown>;
await subPaymentCreate("api::subscription-payment.subscription-payment", { data });

// AFTER (direct, no alias needed)
await strapi.db.query("api::subscription-payment.subscription-payment").create({ data });
```

**Pattern C — cast on data param in update:**
```typescript
// BEFORE
await strapi.entityService.update("api::foo.foo", id, {
  data: { ... } as unknown as Parameters<typeof strapi.entityService.update>[2]["data"],
});

// AFTER (no cast needed)
await strapi.db.query("api::foo.foo").update({
  where: { id },
  data: { ... },
});
```

### File-by-File Migration Inventory

#### Group 1: Simple CRUD Controllers (identical pattern ×5)
These 6 files follow an exact template — `find`, `findOne`, `create`, `update`, `delete`. Pagination uses `start + limit` from entityService.

| File | entityService calls | Key issue |
|------|--------------------|-----------| 
| `api/faq/controllers/faq.ts` | findMany, count, findOne, create, update, delete | `start` → `offset`, no `pagination` wrapper, `sort` → `orderBy` |
| `api/commune/controllers/commune.ts` | findMany, count, findOne, create, update, delete | same |
| `api/region/controllers/region.ts` | findMany, count, findOne, create, update, delete | same |
| `api/condition/controllers/condition.ts` | findMany, count, findOne, create, update, delete | same |
| `api/ad-pack/controllers/ad-pack.ts` | findMany, count, findOne, create, update, delete | same |
| `api/category/controllers/category.ts` | findMany, count, findOne, create, update, delete + `adCounts` already uses `strapi.db.query` — skip that method |

**Exact template for CRUD controllers:**
```typescript
// find() method
const results = await strapi.db.query("api::xxx.xxx").findMany({
  where: filters,
  populate: query.populate || "*",
  orderBy: query.sort || { name: "asc" },
  offset: (page - 1) * pageSize,
  limit: pageSize,
});
const total = await strapi.db.query("api::xxx.xxx").count({ where: filters });

// findOne() method
const item = await strapi.db.query("api::xxx.xxx").findOne({
  where: { id },
  populate: ["region"], // or whatever relation
});

// create() method
const item = await strapi.db.query("api::xxx.xxx").create({ data });

// update() method
const item = await strapi.db.query("api::xxx.xxx").update({ where: { id }, data });

// delete() method
const item = await strapi.db.query("api::xxx.xxx").delete({ where: { id } });
```

#### Group 2: Lifecycle Hooks (identical pattern ×5)
These hooks use `findOne` to check if a name changed before regenerating a slug. All share the same structure.

| File | Call |
|------|------|
| `article/content-types/article/lifecycles.ts` | `findOne` in `beforeUpdate` |
| `api/commune/content-types/commune/lifecycles.ts` | `findOne` in `beforeUpdate` |
| `api/region/content-types/region/lifecycles.ts` | `findOne` in `beforeUpdate` |
| `api/category/content-types/category/lifecycles.ts` | `findOne` in `beforeUpdate` |
| `api/condition/content-types/condition/lifecycles.ts` | `findOne` in `beforeCreate` (not `findOne` call) and `beforeUpdate` |

**Note:** `condition/lifecycles.ts` has `beforeCreate` with no `entityService` call — only `beforeUpdate` needs migration.

**Template for lifecycle findOne:**
```typescript
// BEFORE
const existing = await strapi.entityService.findOne("api::xxx.xxx", where.id, {
  fields: ["name"],
});

// AFTER
const existing = await strapi.db.query("api::xxx.xxx").findOne({
  where: { id: where.id },
  select: ["name"],
});
```

**Important:** `fields` becomes `select` in `db.query`. This affects the lifecycle hooks.

#### Group 3: Payment Utilities
| File | Calls | Notes |
|------|-------|-------|
| `api/payment/utils/ad.utils.ts` | `update` ×4 | Simple updates; `updateAd`, `updateAdReservation`, `updateAdFeaturedReservation`, `publishAd`, `updateAdDates` |
| `api/payment/utils/general.utils.ts` | `findMany`, `create` | `ensureFreeReservations` method; `$or: [{ ad: null }]` filter needs care |
| `api/payment/utils/featured.utils.ts` | `create` | `createAdFeaturedReservation` |
| `api/payment/utils/reservation.utils.ts` | `findMany`, `create` | `getReservationByUser`, `createAdReservation` |
| `api/payment/utils/order.utils.ts` | `create`, `findOne`, `update` | `createAdOrder`, `getOrderById`, `updateOrderDocumentResponse` |
| `api/payment/services/pack.service.ts` | `findOne` | Zoho CRM sync in `processPaidWebpay` |

**Null relation filter difference:** In `entityService`, `{ ad: null }` works. In `db.query`, null-relation checks use `{ ad: null }` directly in `where` — this is confirmed to work in this codebase (reservation.utils.ts already uses `strapi.db.query().findOne` with `ad: null`). The `$or: [{ ad: null }, { ad: { ... } }]` pattern in `general.utils.ts` may need to become `$or: [{ ad: { id: { $null: true } } }, { ad: { ... } }]` — use the same pattern as `ad-free-reservation-restore.cron.ts` which already has the correct form for `db.query` null checks.

#### Group 4: Cron Files
| File | Calls | Notes |
|------|-------|-------|
| `cron/subscription-charge.cron.ts` | `findMany` ×4 (Steps 1–4), `update` ×2 (user + payment), `create`/`update` aliased calls in `chargeUser` | The alias pattern (`subPaymentCreate`, `subPaymentUpdate`) must be replaced with direct `db.query` calls |
| `cron/ad-expiry.cron.ts` | `findMany` ×3, `update`, `create` | `decrementRemainingDays` and `sendUpdatedAdsReport`; note `sort: { id: "desc" }` → `orderBy: { id: "desc" }` |
| `cron/ad-free-reservation-restore.cron.ts` | `findMany` ×2, `create` | `restoreFreeAds` (all users) and `restoreUserFreeReservations`; pagination `{ pageSize: -1 }` → `limit: -1`; `fields: ['id', 'username', 'email']` → `select: ['id', 'username', 'email']` |

#### Group 5: Controllers with complex queries
| File | Calls | Notes |
|------|-------|-------|
| `api/order/controllers/order.ts` | `findMany` ×4, `count` ×2 | `find`, `me`, `salesByMonth`, `exportCsv` all use `findMany`; `fields: ['amount', 'createdAt']` → `select: ['amount', 'createdAt']`; `start` → `offset`; `sort` → `orderBy` |
| `api/ad/controllers/ad.ts` | `count` ×5 | `count` action uses `filters:` key — becomes `where:` |
| `api/ad/services/ad.ts` | none remaining (already uses `strapi.db.query` exclusively) | Confirmed: `getAdvertisements`, `recalculateSortPriorities` already migrated |

#### Group 6: Other files
| File | Calls | Notes |
|------|-------|-------|
| `extensions/users-permissions/controllers/userUpdateController.ts` | `update` ×1 | Simple update with data cast to remove |
| `middlewares/user-registration.ts` | `findMany`, `create` ×2 | `createInitialFreeReservations` function (standalone at bottom of file, not inside middleware export) |
| `api/ad-reservation/controllers/ad-reservation.ts` | `create` ×1 | `gift` action |
| `api/ad-featured-reservation/controllers/ad-featured-reservation.ts` | `create` ×1 | `gift` action |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pagination offset | Custom page-to-offset math | Already in each controller as `(page - 1) * pageSize` | Logic is already correct, just rename `start` to `offset` |
| Null relation checks | Custom SQL-style null check | `db.query where: { relation: null }` or `{ relation: { id: { $null: true } } }` | Strapi handles both; pick the pattern that matches the existing codebase |
| TypeScript types for db.query | New type interfaces | Remove entityService casts entirely | `db.query()` is already typed in Strapi v5; no cast needed |

## Common Pitfalls

### Pitfall 1: Forgetting `start` → `offset` rename
**What goes wrong:** `db.query().findMany({ start: 0 })` — `start` is silently ignored; results return from the beginning regardless of page.
**Why it happens:** `entityService` used `start`, `db.query` uses `offset`.
**How to avoid:** Search for `start:` in each migrated file after conversion; verify it's been renamed to `offset:`.
**Warning signs:** Paginated lists always return page 1 regardless of requested page.

### Pitfall 2: Forgetting `fields` → `select` rename
**What goes wrong:** `db.query().findMany({ fields: ['id', 'name'] })` — `fields` is ignored; all columns returned.
**Why it happens:** `entityService` used `fields`, `db.query` uses `select`.
**How to avoid:** Search for `fields:` in each migrated file. Affected files: `ad-free-reservation-restore.cron.ts`, `order.ts` (salesByMonth), article/commune/region/category/condition lifecycles.
**Warning signs:** More data than expected in results (no visible error).

### Pitfall 3: Leaving TypeScript cast artifacts
**What goes wrong:** After migration, leaving `as unknown as Parameters<typeof strapi.entityService.xxx>[N]` casts — TypeScript errors because `strapi.entityService` no longer exists at type level.
**Why it happens:** The casts were workarounds; they reference a type that is now gone.
**How to avoid:** After converting each call, delete all surrounding casts. The `data` param in `db.query().create/update` accepts `Record<string, unknown>` directly.
**Warning signs:** TypeScript compile errors referencing `strapi.entityService`.

### Pitfall 4: `pagination: { pageSize: -1 }` not mapping to `limit: -1`
**What goes wrong:** `db.query().findMany({ pagination: { pageSize: -1 } })` — `pagination` key is ignored; default limit applied; not all records returned.
**Why it happens:** `entityService` had a `pagination` convenience option; `db.query` has no such wrapper.
**How to avoid:** All `pagination: { pageSize: -1 }` must become `limit: -1`. Search for `pagination:` in all migrated cron files.
**Warning signs:** Cron processes only first 25 records instead of all records — silent data processing gap.

### Pitfall 5: `sort` → `orderBy` not renamed
**What goes wrong:** `db.query().findMany({ sort: { createdAt: 'desc' } })` — `sort` silently ignored; results in database insertion order.
**Why it happens:** `entityService` used `sort`, `db.query` uses `orderBy`.
**How to avoid:** Global search for `sort:` in migrated files; rename every occurrence.
**Warning signs:** Order-sensitive features (daily report, paginated lists) return results in wrong order.

### Pitfall 6: Test mocks still reference `strapi.entityService`
**What goes wrong:** Tests that mock `strapi.entityService.findMany` no longer intercept calls after migration; calls fall through to real (undefined) service.
**Why it happens:** The global strapi mock in `subscription-charge.cron.test.ts` explicitly sets up `strapi.entityService` methods. After migration those mocks are unreachable.
**How to avoid:** In the same commit or the final test-update wave, update `subscription-charge.cron.test.ts` to remove `strapi.entityService` from the mock and route all expectations through `strapi.db.query`.
**Warning signs:** Tests start passing erroneously (mock never called) or failing with "entityService is not a function".

### Pitfall 7: `strapi.query()` vs `strapi.db.query()` confusion
**What goes wrong:** Using `strapi.query()` (without `.db`) — this was the v3 API.
**Why it happens:** `user-registration.ts` already uses `strapi.query()` (line 106, 149) for the login/users-me response enrichment. This is different from the entityService calls in `createInitialFreeReservations`. Do NOT migrate `strapi.query()` calls — they are separate.
**How to avoid:** Only touch lines that reference `strapi.entityService`. Leave `strapi.query()` calls untouched — verify they still work post-migration.
**Warning signs:** Breaking login response enrichment while migrating the file.

## Code Examples

### Pattern: Complex findMany with pagination (order.ts find method)

```typescript
// BEFORE
const orders = await strapi.entityService.findMany("api::order.order", {
  filters: filters as unknown as Parameters<typeof strapi.entityService.findMany>[1]["filters"],
  populate: populate as unknown as Record<string, unknown>,
  start: (page - 1) * pageSize,
  limit: pageSize,
  sort: sort as unknown as Parameters<typeof strapi.entityService.findMany>[1]["sort"],
});
const total = await strapi.entityService.count("api::order.order", {
  filters: filters as unknown as Parameters<typeof strapi.entityService.count>[1]["filters"],
});

// AFTER
const orders = await strapi.db.query("api::order.order").findMany({
  where: filters,
  populate: populate as unknown as Record<string, unknown>,
  offset: (page - 1) * pageSize,
  limit: pageSize,
  orderBy: sort,
});
const total = await strapi.db.query("api::order.order").count({ where: filters });
```

### Pattern: Alias replacement in subscription-charge.cron.ts

```typescript
// BEFORE (alias pattern — remove entirely)
const subPaymentCreate = strapi.entityService.create as (
  _uid: string,
  _params: { data: Record<string, unknown> }
) => Promise<unknown>;
const subPaymentUpdate = strapi.entityService.update as (
  _uid: string,
  _id: number,
  _params: { data: Record<string, unknown> }
) => Promise<unknown>;
await subPaymentCreate("api::subscription-payment.subscription-payment", { data });
await subPaymentUpdate("api::subscription-payment.subscription-payment", id, { data });

// AFTER
await strapi.db.query("api::subscription-payment.subscription-payment").create({ data });
await strapi.db.query("api::subscription-payment.subscription-payment").update({ where: { id }, data });
```

### Pattern: Lifecycle findOne with fields/select

```typescript
// BEFORE
const existing = await strapi.entityService.findOne(
  "api::category.category",
  where.id,
  { fields: ["name"] }
);

// AFTER
const existing = await strapi.db.query("api::category.category").findOne({
  where: { id: where.id },
  select: ["name"],
});
```

### Pattern: Test mock update for subscription-charge

```typescript
// BEFORE (mock in test file)
Object.assign(global, {
  strapi: {
    entityService: {
      findMany: mockFindMany,
      create: mockCreate,
      update: mockUpdate,
    },
    db: { query: mockDbQuery },
  },
});

// AFTER (remove entityService entirely; route all through db.query mock)
// The mockDbQuery function needs to be updated to handle
// "api::subscription-payment.subscription-payment" as well as "api::ad.ad"
Object.assign(global, {
  strapi: {
    db: { query: mockDbQuery },
    log: { ... },
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `strapi.entityService` (v4) | `strapi.db.query(uid)` (v5) | Strapi v5 release | `entityService` is undefined at runtime in v5 |
| `strapi.query()` (v3) | `strapi.db.query(uid)` (v5) | Strapi v4+ | Both v3 and entityService gone in v5 |
| `pagination: { pageSize: -1 }` | `limit: -1` | v5 API change | No pagination wrapper in db.query |
| `fields: [...]` (select columns) | `select: [...]` | v5 API change | Renamed key |
| `sort: {...}` | `orderBy: {...}` | v5 API change | Renamed key |
| `start: N` (offset) | `offset: N` | v5 API change | Renamed key |
| `filters: {...}` | `where: {...}` | v5 API change | Renamed key |

**Deprecated/outdated:**
- `strapi.entityService`: Removed in Strapi v5, do not use.
- TypeScript cast pattern `as Parameters<typeof strapi.entityService.xxx>[N]`: Remove all instances.
- `pagination: { pageSize: -1 }` wrapper: Not supported in db.query.

## Open Questions

1. **`strapi.query()` calls in `user-registration.ts`**
   - What we know: Lines 106 and 149 use `strapi.query("plugin::users-permissions.user").findOne(...)` — NOT `strapi.entityService`. This is a different API call.
   - What's unclear: Whether `strapi.query()` also needs migration in v5 or if it still works.
   - Recommendation: Do NOT touch `strapi.query()` calls in this phase — they are outside scope. The phase only targets `strapi.entityService`. Flag for investigation separately if runtime errors occur on those paths.

2. **`$or: [{ ad: null }, ...]` in `general.utils.ts`**
   - What we know: `reservation.utils.ts` uses `strapi.db.query().findOne` with `ad: null` successfully. The cron `ad-free-reservation-restore.cron.ts` (which still uses entityService) uses `{ ad: { id: { $null: true } } }`.
   - What's unclear: Whether `{ ad: null }` or `{ ad: { id: { $null: true } } }` is the correct form inside a `$or` in `db.query`.
   - Recommendation: Use `{ ad: { id: { $null: true } } }` (the form verified to work in this codebase) inside `$or` clauses for `db.query`. This matches the pattern already used in `ad-free-reservation-restore.cron.ts`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && yarn jest tests/cron/subscription-charge.cron.test.ts --no-coverage` |
| Full suite command | `cd apps/strapi && yarn test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MIG-01 | CRUD controllers use db.query | unit (TypeScript compile) | `cd apps/strapi && npx tsc --noEmit` | ✅ existing |
| MIG-02 | Cron files use db.query | unit | `cd apps/strapi && yarn jest tests/cron/ --no-coverage` | ✅ existing (subscription-charge.cron.test.ts) |
| MIG-03 | Test mocks updated for db.query | unit | `cd apps/strapi && yarn test --no-coverage` | ✅ existing (must be updated) |
| MIG-04 | No entityService references remain | grep audit | `grep -r "entityService" apps/strapi/src/` | manual |

### Sampling Rate
- **Per task commit:** `cd apps/strapi && npx tsc --noEmit`
- **Per wave merge:** `cd apps/strapi && yarn test --no-coverage`
- **Phase gate:** Full suite green + zero entityService grep hits before close

### Wave 0 Gaps
None — existing test infrastructure covers phase requirements. The subscription-charge.cron.test.ts mock will need updating in the final wave (not Wave 0).

## Sources

### Primary (HIGH confidence)
- Direct source code audit: All 28 target files read and inventoried
- Existing `strapi.db.query()` usage in this codebase (user.utils.ts, ad.ts controller, ad service, pack.utils.ts, reservation.utils.ts getFeaturedReservation) — confirmed working pattern
- `apps/strapi/tests/cron/subscription-charge.cron.test.ts` — existing test mock structure analyzed

### Secondary (MEDIUM confidence)
- Strapi v5 migration documentation (implicit from codebase patterns and prior phase decisions)
- STATE.md: "mockImplementation routing pattern used for strapi.db.query in Jest tests to dispatch different mock objects per UID"

## Metadata

**Confidence breakdown:**
- Migration mapping: HIGH — proven in this codebase already (user.utils.ts, pro-cancellation.service.ts already migrated)
- File inventory: HIGH — all files read directly
- Pitfalls: HIGH — derived from actual code patterns observed
- Test mock update: HIGH — test file read and structure understood

**Research date:** 2026-04-08
**Valid until:** Stable — Strapi v5 db.query API is stable
