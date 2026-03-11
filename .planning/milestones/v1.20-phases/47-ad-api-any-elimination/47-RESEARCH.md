# Phase 47: Ad API any Elimination - Research

**Researched:** 2026-03-08
**Domain:** TypeScript `any` elimination in Strapi v5 service + controller
**Confidence:** HIGH

## Summary

Phase 47 targets all `any` types in `apps/strapi/src/api/ad/services/ad.ts` and `apps/strapi/src/api/ad/controllers/ad.ts`. The files have been read in full. There are **no `any` types related to `catch` blocks** (those are explicitly out of scope). All `any` usages fall into four patterns: (1) options/query parameter bags, (2) `computeAdStatus(ad: any)` and `transformSortParameter(sort: any)`, (3) `ctx: any` controller params, and (4) inline `filters`, `sort`, `populate`, `filterClause` locals.

The project already uses `Context` from `koa` in every other controller — `payment.ts`, `related.ts`, `cache.ts`, `recaptcha.ts`, `user-registration.ts`, `userUpdateController.ts`. The established pattern is `import { Context } from "koa"`. There is **no** `@strapi/strapi` `Context` type in use anywhere in this codebase; the project's standard is Koa's `Context`.

The existing test file `ad.approve.zoho.test.ts` has one `(global as any).strapi` cast (line 33) which is **in scope for this phase** per the `any` audit. However, the REQUIREMENTS.md scope for Phase 47 covers only TSANY-01 through TSANY-07 (service + controller). The test file cast is covered by Phase 51 (TSANY-35). This phase must NOT modify the test file.

**Primary recommendation:** Replace all `any` in service/controller with `unknown` (for type-narrowed inputs) and typed interfaces (for structured query options). Use `import { Context } from "koa"` for all `ctx` params — matching every other controller in this codebase.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TSANY-01 | All method `options: any` params in `ad.ts` service → `unknown` | 8 methods use `options: any = {}`: `findOne`, `findMany`, `activeAds`, `pendingAds`, `archivedAds`, `bannedAds`, `rejectedAds`, `abandonedAds`. Plus the `getAdvertisements` helper. Use a typed `AdQueryOptions` interface with `unknown` for dynamic fields. |
| TSANY-02 | `computeAdStatus(ad: any)` → `ad: unknown` with type narrowing | Function already uses runtime property checks (`Object.prototype.hasOwnProperty.call`, boolean checks) — narrowing is safe with `ad: unknown`. |
| TSANY-03 | `transformSortParameter(sort: any): any` → `sort: unknown`, return `unknown` | Function uses `typeof sort === "string"` and `typeof sort === "object"` — already correctly narrows. Return type `unknown` is safe since callers only pass it to `orderBy`. |
| TSANY-04 | Internal `filters?: any` and `postProcessFilter` params in `ad.ts` service → typed or `unknown` | `getAdvertisements` params: `options: any`, `defaultFilters: any` → use `AdQueryOptions` / `Record<string, unknown>`. The `postProcessFilter` callback already typed correctly (`ads: any[]` → `unknown[]`). |
| TSANY-05 | All `ctx: any` params in `ad.ts` controller → `Context` | 11 controller methods use `ctx: any`. Project standard: `import { Context } from "koa"`. |
| TSANY-06 | `options: any`, `filterClause: any`, `ads.map((ad: any) =>)` in controller → `unknown` with narrowing | `options` locals in 7 action methods (actives, pendings, archiveds, banneds, rejecteds, abandoneds, me). `filterClause` in `me()`. `ads.map((ad: any) =>)` in `me()`. |
| TSANY-07 | Inline `filters?: any`, `sort?: any`, `populate?: any` locals in controller → typed or `unknown` | The `QueryParams` interface already declared at top of controller with `filters?: any`, `sort?: any`, `populate?: any`. Promote these three fields to `unknown`. The `filters as any` casts in `meCounts` (lines 353, 356, 363, 375, 378) need to become `filters as unknown as Parameters<...>`. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.x (via Strapi) | Static typing | Already in use; `strict: false` in base tsconfig |
| `koa` | Already a Strapi peer dep | `Context` type for controller params | Used by every other controller in codebase |
| `@strapi/strapi` | 5.36.1 | `factories` for service/controller creation | Already imported in both files |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `koa` `Context` | Strapi peer dep | Controller parameter type | All controller method `ctx` params |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `import { Context } from "koa"` | `Core.Strapi` controller context | Project uses Koa Context everywhere — do not deviate |
| `unknown` with narrowing | Properly typed Strapi entity interfaces | Entity types are auto-generated and not reliable in Strapi v5; `unknown` with narrowing is the correct approach per REQUIREMENTS.md |

**Installation:** No new packages needed — `koa` is already a peer dependency of Strapi.

## Architecture Patterns

### Recommended Project Structure
```
src/api/ad/
├── services/
│   ├── ad.ts              # Service — PRIMARY target
│   └── __tests__/
│       └── ad.approve.zoho.test.ts  # Existing tests — DO NOT MODIFY
└── controllers/
    └── ad.ts              # Controller — PRIMARY target
```

No new files are needed. All changes are in-place edits to the two existing files.

### Pattern 1: `ctx: any` → `import { Context } from "koa"`

**What:** Replace every controller method's `ctx: any` with `ctx: Context`
**When to use:** All 11 controller methods
**Example:**
```typescript
// BEFORE
import { factories } from "@strapi/strapi";
// ...
async findOne(ctx: any) { ... }

// AFTER
import { factories } from "@strapi/strapi";
import { Context } from "koa";
// ...
async findOne(ctx: Context) { ... }
```
Source: Verified pattern in `payment.ts` (line 1), `related.ts` (line 1), `cache.ts`, etc.

### Pattern 2: `options: any` → Typed `AdQueryOptions` Interface

**What:** Define a typed interface for the query options bag accepted by all service methods
**When to use:** `getAdvertisements`, `findOne`, `findMany`, `activeAds`, `pendingAds`, `archivedAds`, `bannedAds`, `rejectedAds`, `abandonedAds`
**Example:**
```typescript
// Define at top of service file
interface AdQueryOptions {
  filters?: unknown;
  populate?: unknown;
  page?: string | number;
  pageSize?: string | number;
  sort?: unknown;
  orderBy?: unknown;
  pagination?: {
    page?: string;
    pageSize?: string;
  };
  [key: string]: unknown;
}

// Usage
async activeAds(options: AdQueryOptions = {}) { ... }
async findOne(id: string | number, options: AdQueryOptions = {}) { ... }
```

### Pattern 3: `computeAdStatus(ad: any)` → `ad: unknown` with narrowing

**What:** Change parameter to `unknown`; existing code already uses property-existence guards
**When to use:** `computeAdStatus` function (service file, line 26)
**Example:**
```typescript
// BEFORE
function computeAdStatus(ad: any): AdStatus { ... }

// AFTER
function computeAdStatus(ad: unknown): AdStatus {
  if (!ad || typeof ad !== "object") return "unknown";
  const adObj = ad as Record<string, unknown>;

  const hasReservationKey = Object.prototype.hasOwnProperty.call(adObj, "ad_reservation");

  if (adObj.rejected) return "rejected";
  if (adObj.banned) return "banned";
  if (adObj.active && !adObj.banned && !adObj.rejected && (adObj.remaining_days as number) > 0) return "active";
  // ... etc
}
```

### Pattern 4: `transformSortParameter(sort: any): any` → `unknown`

**What:** Widen both parameter and return type to `unknown`
**When to use:** `transformSortParameter` function (service file, line 80)
**Example:**
```typescript
// BEFORE
function transformSortParameter(sort: any): any { ... }

// AFTER
function transformSortParameter(sort: unknown): unknown {
  if (!sort) return { createdAt: "desc" };
  if (typeof sort === "object" && !Array.isArray(sort)) return sort;
  if (typeof sort === "string") {
    const sortParts = sort.split(":");
    if (sortParts.length === 2) {
      const [field, direction] = sortParts;
      return { [field]: direction.toLowerCase() };
    }
    return { [sort]: "asc" };
  }
  return { createdAt: "desc" };
}
```

### Pattern 5: `filters?: any` in `QueryParams` interface and `filterClause: any` → `unknown`

**What:** Fix the `QueryParams` interface already defined in the controller; replace `filterClause: any`
**When to use:** Controller file `QueryParams` interface + `me()` method
**Example:**
```typescript
// BEFORE
interface QueryParams {
  filters?: any;
  pagination?: { page?: string; pageSize?: string; };
  sort?: any;
  populate?: any;
}

// AFTER
interface QueryParams {
  filters?: unknown;
  pagination?: { page?: string; pageSize?: string; };
  sort?: unknown;
  populate?: unknown;
}
```

For `filterClause`:
```typescript
// BEFORE
const filterClause: any = { user: userId };

// AFTER
const filterClause: Record<string, unknown> = { user: userId };
```

### Pattern 6: `filters as any` casts in `meCounts`

**What:** The `meCounts` method uses `filters: { ... } as any` in 5 places for `strapi.entityService.count`
**When to use:** Lines 353, 356, 363, 375, 378 of controller
**Example:**
```typescript
// BEFORE
strapi.entityService.count("api::ad.ad", {
  filters: { user: userId, active: true, ... } as any,
})

// AFTER (per AGENTS.md SDK v5 cast pattern)
strapi.entityService.count("api::ad.ad", {
  filters: { user: userId, active: true, ... } as unknown as Record<string, unknown>,
})
```
Source: AGENTS.md — "Strapi SDK v5 cast patterns: `filters: { ... } as unknown as Record<string, unknown>`"

### Pattern 7: `ads.map((ad: any) =>)` in `me()` → typed

**What:** The mapped `ad` in `ads.map((ad: any) => ...)` in controller `me()` method
**When to use:** Line 522 of controller
**Example:**
```typescript
// BEFORE
const adsWithStatus = ads.map((ad: any) => ({
  ...ad,
  status: status || "unknown",
}));

// AFTER
const adsWithStatus = ads.map((ad) => ({
  ...ad,
  status: status || "unknown",
}));
```
The `findMany` return type is already inferred from Strapi's entity service — the explicit `ad: any` annotation can simply be removed since the lambda parameter type is inferred.

### Pattern 8: `postProcessFilter` param in `getAdvertisements`

**What:** `postProcessFilter?: (ads: any[]) => any[]` → use `unknown[]`
**When to use:** `getAdvertisements` helper function signature
**Example:**
```typescript
// BEFORE
async function getAdvertisements(
  options: any,
  defaultFilters: any,
  status: string,
  postProcessFilter?: (ads: any[]) => any[]
) { ... }

// AFTER
async function getAdvertisements(
  options: AdQueryOptions,
  defaultFilters: Record<string, unknown>,
  status: string,
  postProcessFilter?: (ads: unknown[]) => unknown[]
) { ... }
```

### Anti-Patterns to Avoid
- **Don't use `@strapi/strapi` `Context` import:** The project exclusively uses `Context` from `koa` — deviation would break consistency with 10+ other files.
- **Don't introduce `any` in catch blocks:** `catch (error)` — without annotation — is fine. `catch (error: any)` is out of scope.
- **Don't modify the test file** `ad.approve.zoho.test.ts` — its `(global as any).strapi` cast is Phase 51 (TSANY-35).
- **Don't introduce new files:** All changes are in-place edits to `ad.ts` service and `ad.ts` controller only.
- **Don't widen `ads.map` return to `unknown[]`** if it breaks callers — prefer removing explicit annotation and letting TypeScript infer.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Context type for controllers | Custom controller context interface | `Context` from `koa` | Already the project standard in 10+ files |
| Strapi filter cast | Custom filter types | `as unknown as Record<string, unknown>` | AGENTS.md documented Strapi SDK v5 cast pattern |
| Sort parameter narrowing | New sort utility | Narrowing in `transformSortParameter` | Function already has correct branching — just widen the type signature |

**Key insight:** All the logic is already correct — this phase is purely a type-annotation change. No runtime behavior changes.

## Common Pitfalls

### Pitfall 1: `super.findOne(ctx)` call in `findOne` controller method
**What goes wrong:** `findOne` calls `super.findOne(ctx)` — Strapi's base `createCoreController` expects a Koa-compatible context. Using `Context` from `koa` is exactly what Strapi's core controller uses internally.
**Why it happens:** The `super` call passes `ctx` to the generated base controller.
**How to avoid:** `Context` from `koa` is compatible — this is the correct type.
**Warning signs:** TypeScript error on `super.findOne(ctx)` would indicate wrong import source.

### Pitfall 2: `error.message` access in catch blocks
**What goes wrong:** In `approveAd` and `rejectAd` controllers, the catch block uses `error.message` — with `strict: false`, this works even with untyped catch variables.
**Why it happens:** Strapi's tsconfig has `strict: false`, so `noImplicitAny` is off. The existing `catch (error)` pattern (without annotation) is fine and out of scope.
**How to avoid:** Do NOT annotate catch variables — leave them as `catch (error)`.

### Pitfall 3: `options.page` and `options.pageSize` with `unknown` type
**What goes wrong:** When `options` becomes `AdQueryOptions` with `page?: string | number`, calls to `parseInt(options.page)` may need adjustment since `parseInt` accepts `string`.
**Why it happens:** The service uses `parseInt(options.page)` — TypeScript will flag `unknown` going into `parseInt`.
**How to avoid:** Define `page` and `pageSize` as `string | number | undefined` in `AdQueryOptions`, or cast: `parseInt(String(options.page))`.

### Pitfall 4: `[key: string]: unknown` index signature in `AdQueryOptions`
**What goes wrong:** Adding an index signature `[key: string]: unknown` to `AdQueryOptions` causes TypeScript to require all named properties to also be `unknown` — which would prevent `page?: string | number`.
**Why it happens:** TypeScript index signature constraint: all named props must be assignable to the index type.
**How to avoid:** Either don't add the index signature (the spread `...options` in `getAdvertisements` will still work since it spreads into an untyped object), or use a separate `Record<string, unknown>` for the spread.

### Pitfall 5: `filterClause.$or = [...]` with `Record<string, unknown>`
**What goes wrong:** Assigning complex nested filter objects to `Record<string, unknown>` keys compiles fine since the values are `unknown`.
**Why it happens:** `$or` values are arrays of filter objects.
**How to avoid:** No issue — `Record<string, unknown>` accepts any value assignment.

## Code Examples

Verified patterns from project source:

### Context import (from existing controllers)
```typescript
// Source: apps/strapi/src/api/payment/controllers/payment.ts line 1
// Source: apps/strapi/src/api/related/controllers/related.ts line 1
import { Context } from "koa";
```

### Strapi SDK v5 filter cast pattern (from AGENTS.md)
```typescript
// Source: AGENTS.md "Strapi SDK v5 cast patterns"
filters: { ... } as unknown as Record<string, unknown>
```

### `unknown` with narrowing (from existing service)
```typescript
// Existing code in computeAdStatus already does property-existence checks:
const hasReservationKey = Object.prototype.hasOwnProperty.call(ad, "ad_reservation");
if (ad.rejected) return "rejected"; // → becomes: if ((adObj as Record<string,unknown>).rejected)
```

### `Record<string, unknown>` for filter objects (from userController.ts)
```typescript
// Source: apps/strapi/src/extensions/users-permissions/controllers/userController.ts line 192
...(clientFilters as Record<string, unknown>),
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `ctx: any` | `ctx: Context` from `koa` | Already done in 10+ files | Now applied to ad.ts controller |
| `options: any` | Typed `AdQueryOptions` interface | Phase 47 | Compile-time safety on query bags |
| `computeAdStatus(ad: any)` | `ad: unknown` with narrowing | Phase 47 | No runtime change; explicit narrowing |

## Open Questions

1. **`strapi.db.query("api::ad.ad").findMany(query)` return type**
   - What we know: The `query` object has `where`, `populate`, `limit`, `offset`, `orderBy`
   - What's unclear: Whether TypeScript will complain about `orderBy: unknown` (returned from `transformSortParameter`)
   - Recommendation: Cast `orderBy` at the call site: `orderBy: transformSortParameter(options.sort) as Record<string, string>`

2. **`options.page` / `options.pageSize` in parseInt calls**
   - What we know: Used as `parseInt(options.page)` — TypeScript requires string for parseInt
   - What's unclear: Whether `string | number` in interface satisfies `parseInt`'s parameter
   - Recommendation: Use `String(options.page ?? "")` or cast as needed; no behavior change.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest (jest.config.js) |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `yarn workspace apps/strapi test --testPathPattern="ad.approve.zoho"` |
| Full suite command | `yarn workspace apps/strapi test` (from root) OR `cd apps/strapi && yarn test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TSANY-01 | `options: unknown` in service methods | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-02 | `computeAdStatus` with `unknown` input | unit | `cd apps/strapi && yarn test --testPathPattern="ad.approve.zoho"` | ✅ |
| TSANY-03 | `transformSortParameter` with `unknown` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-04 | `getAdvertisements` typed params | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-05 | `ctx: Context` in controller | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-06 | `options`/`filterClause`/`ads.map` typed | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-07 | `QueryParams` + `filters` locals typed | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |

### Sampling Rate
- **Per task commit:** `cd apps/strapi && yarn test --testPathPattern="ad.approve.zoho" && npx tsc --noEmit`
- **Per wave merge:** `cd apps/strapi && yarn test`
- **Phase gate:** `tsc --noEmit` passes with zero errors + all Jest tests pass before `/gsd-verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. The existing `ad.approve.zoho.test.ts` provides behavioral coverage for the `computeAdStatus` logic path (via `approveAd`). TypeScript compile check (`tsc --noEmit`) provides coverage for all type annotation changes.

## Sources

### Primary (HIGH confidence)
- Direct file read: `apps/strapi/src/api/ad/services/ad.ts` — all `any` occurrences catalogued
- Direct file read: `apps/strapi/src/api/ad/controllers/ad.ts` — all `any` occurrences catalogued
- Direct file read: `apps/strapi/src/api/payment/controllers/payment.ts` — `Context` import pattern confirmed
- Direct file read: `apps/strapi/src/api/related/controllers/related.ts` — `Context` import pattern confirmed
- Direct file read: `AGENTS.md` — Strapi SDK v5 cast patterns documented
- Direct file read: `apps/strapi/tsconfig.json` + base tsconfig — `strict: false` confirmed

### Secondary (MEDIUM confidence)
- Cross-check across 10 controller files in codebase — all use `import { Context } from "koa"`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all types verified from actual installed packages and project source
- Architecture: HIGH — patterns verified from existing codebase files
- Pitfalls: HIGH — identified from actual code analysis of the two target files

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable TypeScript patterns)
