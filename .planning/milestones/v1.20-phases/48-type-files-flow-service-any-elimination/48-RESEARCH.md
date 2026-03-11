# Phase 48: Type Files + Flow Service any Elimination - Research

**Researched:** 2026-03-08
**Domain:** TypeScript `any` elimination in shared type files and Flow payment service layer
**Confidence:** HIGH

## Summary

Phase 48 targets five files: `order.types.ts`, `filter.types.ts`, `flow.factory.ts`, `flow.types.ts`, and `flow.service.ts`. All files have been read in full. There are **no `catch` block `any`s** in scope (out of scope per REQUIREMENTS.md). Every `any` occurrence falls into one of five patterns: (1) query param bags (`filters?`, `sort?`, `populate?`) in type files, (2) data fields (`payment_response`, `document_details`) in `order.types.ts`, (3) filter operator values in `filter.types.ts`, (4) `type Strapi = any` alias in both `flow.factory.ts` and `flow.service.ts`, and (5) `(data as any).message` casts and `Record<string, any>` param bags in `flow.service.ts`.

The `flow.service.ts` and `flow.factory.ts` each define `type Strapi = any` — a workaround comment reads "Use 'any' for Strapi type if the specific import is causing issues". The correct fix is `import type { Core } from "@strapi/strapi"` and using `Core.Strapi`. This is confirmed: `@strapi/strapi`'s `index.d.ts` re-exports `export type * from '@strapi/types'`, and `@strapi/types/dist/index.d.ts` exports `export type * as Core from './core'`, and `./core/strapi.d.ts` has `export interface Strapi`. So `Core.Strapi` is a valid type for the `strapi` parameter.

The `(data as any).message` casts in `flow.service.ts` appear in error-handling branches inside Axios catch blocks. The `data` variable has already been narrowed to `object && !== null` in every occurrence — the fix is to cast to `{ message?: string }` or `Record<string, unknown>` with a `typeof data.message === "string"` guard. The `Record<string, any>` params bags (for `signRequest` and all `params` locals) should become `Record<string, string>` since all values stored are strings (apiKey, token, etc.) and this satisfies both `Object.keys()` mapping and `URLSearchParams()` constructor (which accepts `Record<string, string>`).

The `tsc --noEmit` currently passes with zero errors. All Phase 48 changes are in-place edits to 5 files — no new files, no new packages.

**Primary recommendation:** Fix `type Strapi = any` → `import type { Core } from "@strapi/strapi"` (works for both factory and service); replace `Record<string, any>` params with `Record<string, string>`; replace `(data as any).message` with `(data as Record<string, unknown>).message`; replace `any` fields in type files with `unknown`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TSANY-08 | `order.types.ts` — `filters?`, `sort?`, `populate?`, `payment_response`, `document_details` → `unknown` | `QueryParams` interface has 3 `any` fields; `Order` interface has 2 `any` fields. All 5 are data containers — `unknown` is safe. |
| TSANY-09 | `filter.types.ts` — all `StrapiFilter` operator fields and `icon?` → `unknown` | `StrapiFilter` has 12 operator fields typed as `any` or `any[]`; `Category.icon?: any` needs `unknown`. `$in` and `$nin` become `unknown[]`. |
| TSANY-10 | `flow.factory.ts` — `type Strapi = any` → `Core.Strapi` or `unknown` | `Core.Strapi` confirmed available via `import type { Core } from "@strapi/strapi"`. The `strapi` param is only passed through to `FlowService` constructor — no methods called on it. `unknown` also works but `Core.Strapi` is more expressive. |
| TSANY-11 | `flow.types.ts` — `discount?`, `invoices?[]`, `items?[]`, `chargeAttemps?[]` → `unknown` or stub interfaces | 4 fields in `IFlowSubscriptionResponse` and `IFlowInvoice`. Also `IFlowPaymentStatusResponse.optional?: Record<string, any>` → `Record<string, unknown>`. |
| TSANY-12 | `flow.service.ts` — `(responseData as any).message` and `(data as any).message` casts → typed narrowing | 5 occurrences of `(data as any).message`. Plus `type Strapi = any` and `Record<string, any>` param bags. All fixable without runtime change. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.x (via Strapi) | Static typing | Already in use |
| `@strapi/strapi` | 5.x | `Core.Strapi` type for Strapi instance param | Already imported in many files via `factories` |
| `koa` | Strapi peer dep | `Context` type for controllers | Project standard — confirmed in Phase 47 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@strapi/strapi` (type import) | 5.x | `Core.Strapi` for strapi param type | Only when file needs to type a `strapi` parameter |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `Core.Strapi` | `unknown` | `unknown` works but loses type info — `Core.Strapi` is correct and available |
| `Record<string, string>` for params | `Record<string, unknown>` | `URLSearchParams` constructor accepts `Record<string, string>` — more precise; `signRequest` maps `params[key]` to string concat which works with `string` values |
| `(data as Record<string, unknown>).message` | Create `FlowErrorResponse` interface | Inline cast is simpler for 5 occurrences in error-handling branches |

**Installation:** No new packages — `@strapi/strapi` already installed.

## Architecture Patterns

### Recommended Project Structure
```
apps/strapi/src/
├── api/
│   ├── filter/types/filter.types.ts    # Target (TSANY-09)
│   └── order/types/order.types.ts      # Target (TSANY-08)
└── services/flow/
    ├── factories/flow.factory.ts        # Target (TSANY-10)
    ├── types/flow.types.ts              # Target (TSANY-11)
    └── services/flow.service.ts         # Target (TSANY-12)
```

No new files. All changes are in-place edits to 5 existing files.

### Pattern 1: `type Strapi = any` → `Core.Strapi` import

**What:** Replace the local type alias with a proper import from `@strapi/strapi`
**When to use:** `flow.factory.ts` and `flow.service.ts`
**Example:**
```typescript
// BEFORE (both files)
// Use 'any' for Strapi type if the specific import is causing issues
type Strapi = any;

// AFTER (both files)
import type { Core } from "@strapi/strapi";

// Usage:
function flowServiceFactory(strapi: Core.Strapi, ...): FlowService
class FlowService {
  private strapi: Core.Strapi;
  constructor(config: IFlowConfig, strapi: Core.Strapi) { ... }
}
```
Source: `node_modules/@strapi/strapi/dist/index.d.ts` → `export type * from '@strapi/types'` → `export type * as Core from './core'` → `export interface Strapi` in `./core/strapi.d.ts`

### Pattern 2: `Record<string, any>` params bags → `Record<string, string>`

**What:** All `params` locals in `flow.service.ts` used for signing and `URLSearchParams` hold only string/number values that are coerced to string. Use `Record<string, string>` for full type safety.
**When to use:** `signRequest`, and all `const params: Record<string, any>` in `createPaymentOrder`, `getPaymentStatus`, `createSubscription`, `createCustomer`, `getInvoice`, `getCustomerSubscriptions`
**Example:**
```typescript
// BEFORE
private signRequest(params: Record<string, any>): string { ... }
const params: Record<string, any> = { apiKey: this.config.apiKey, ... };

// AFTER
private signRequest(params: Record<string, string>): string { ... }
const params: Record<string, string> = {
  apiKey: this.config.apiKey,
  commerceOrder: orderData.commerceOrder,
  subject: orderData.subject,
  amount: String(Math.round(orderData.amount)),  // number → string cast needed
  email: orderData.email,
  urlConfirmation: orderData.urlConfirmacion,
  urlReturn: orderData.urlRetorno,
};
```
**Note:** Numeric values (`amount`, `invoiceId`, `start`, `limit`) must be cast to `String(...)` when assigned into `Record<string, string>`.

### Pattern 3: `(data as any).message` → typed narrowing

**What:** After `data` is verified as `typeof data === "object" && data !== null`, cast to `Record<string, unknown>` and check `typeof (data as Record<string, unknown>).message === "string"` before using.
**When to use:** All 5 occurrences in Axios catch blocks in `flow.service.ts`
**Example:**
```typescript
// BEFORE
if (data) {
  detail = JSON.stringify(data);
  if (
    typeof data === "object" &&
    data !== null &&
    (data as any).message
  ) {
    detail = (data as any).message;
  }
}

// AFTER
if (data) {
  detail = JSON.stringify(data);
  if (typeof data === "object" && data !== null) {
    const dataObj = data as Record<string, unknown>;
    if (typeof dataObj.message === "string") {
      detail = dataObj.message;
    }
  }
}
```

### Pattern 4: Query param bag `any` in type files → `unknown`

**What:** Replace `filters?: any`, `sort?: any`, `populate?: any` in `QueryParams` and data fields in `Order` with `unknown`
**When to use:** `order.types.ts`
**Example:**
```typescript
// BEFORE
export interface QueryParams {
  filters?: any;
  pagination?: { page?: string; pageSize?: string; };
  sort?: any;
  populate?: any;
}
export interface Order {
  payment_response: any;
  document_details: any;
}

// AFTER
export interface QueryParams {
  filters?: unknown;
  pagination?: { page?: string; pageSize?: string; };
  sort?: unknown;
  populate?: unknown;
}
export interface Order {
  payment_response: unknown;
  document_details: unknown;
}
```

### Pattern 5: `StrapiFilter` operator fields → `unknown`

**What:** Replace all operator value types from `any` / `any[]` to `unknown` / `unknown[]`
**When to use:** `filter.types.ts` — `StrapiFilter` interface and `Category.icon`
**Example:**
```typescript
// BEFORE
export interface StrapiFilter {
  [key: string]: {
    $eq?: any; $ne?: any; $lt?: any; $lte?: any;
    $gt?: any; $gte?: any; $in?: any[]; $nin?: any[];
    $contains?: any; $notContains?: any;
    $containsi?: any; $notContainsi?: any;
  };
}
export interface Category extends BaseEntity {
  icon?: any;
}

// AFTER
export interface StrapiFilter {
  [key: string]: {
    $eq?: unknown; $ne?: unknown; $lt?: unknown; $lte?: unknown;
    $gt?: unknown; $gte?: unknown; $in?: unknown[]; $nin?: unknown[];
    $contains?: unknown; $notContains?: unknown;
    $containsi?: unknown; $notContainsi?: unknown;
  };
}
export interface Category extends BaseEntity {
  icon?: unknown;
}
```

### Pattern 6: Flow types `any` fields → `unknown` or stub interfaces

**What:** Replace 4 `any` fields in `flow.types.ts` with `unknown` or typed stubs. Also fix `Record<string, any>` → `Record<string, unknown>`.
**When to use:** `IFlowSubscriptionResponse.discount`, `IFlowSubscriptionResponse.invoices`, `IFlowInvoice.items`, `IFlowInvoice.chargeAttemps`, `IFlowPaymentStatusResponse.optional`
**Example:**
```typescript
// BEFORE (IFlowSubscriptionResponse)
discount?: any;           // Define Discount interface if needed
invoices?: any[];         // Define Invoice interface if needed

// AFTER
discount?: unknown;       // Define Discount interface if needed
invoices?: unknown[];     // Define Invoice interface if needed

// BEFORE (IFlowInvoice)
items?: any[];            // Define Item interface if needed
chargeAttemps?: any[];    // Define ChargeAttempt interface if needed

// AFTER
items?: unknown[];        // Define Item interface if needed
chargeAttemps?: unknown[];// Define ChargeAttempt interface if needed

// BEFORE (IFlowPaymentStatusResponse)
optional?: Record<string, any>;

// AFTER
optional?: Record<string, unknown>;
```

### Anti-Patterns to Avoid
- **Don't use `import { Core } from "@strapi/strapi"`** — this is a *type-only* export, must use `import type { Core } from "@strapi/strapi"`. (Although TypeScript with `isolatedModules: false` may accept both, `import type` is the safer and more explicit choice.)
- **Don't change `mockStrapi = {} as any` in `flow.test.ts`** — this is explicitly out of scope per REQUIREMENTS.md ("Test scaffolding; acceptable test cast").
- **Don't widen `Record<string, string>` further** — numeric values must be `String(x)` cast before assignment; don't revert to `Record<string, unknown>` just to avoid casts.
- **Don't introduce new files** — all 5 changes are in-place edits only.
- **Don't remove the comment** "Define X interface if needed" above the `unknown[]` fields in `flow.types.ts` — the comments document intent.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Strapi instance type | Custom `IStrapiInstance` interface | `Core.Strapi` from `@strapi/strapi` | Official type, maintained by Strapi team, already available |
| Flow error message extraction | Custom error response parser | Inline `Record<string, unknown>` cast + `typeof` check | 5 occurrences in catch blocks — inline is sufficient |
| Filter operator typing | Custom operator union types | `unknown` | Operators accept any comparable value — `unknown` with call-site narrowing is correct |

**Key insight:** All the logic in `flow.service.ts` is already correct — this phase is purely type annotation changes. No runtime behavior changes. The `(data as any).message` casts are already guarded by `typeof data === "object" && data !== null` checks.

## Common Pitfalls

### Pitfall 1: `URLSearchParams` constructor rejects `Record<string, string>` with number values
**What goes wrong:** After changing `params` to `Record<string, string>`, assigning `amount: Math.round(orderData.amount)` (a `number`) fails TypeScript's type check.
**Why it happens:** `Record<string, string>` requires all values to be `string`.
**How to avoid:** Cast numeric values: `amount: String(Math.round(orderData.amount))`. Every `params` object in the service must have all values as `string`.
**Warning signs:** TypeScript error "Type 'number' is not assignable to type 'string'" on `params` assignments.

### Pitfall 2: `import type { Core }` vs `import { Core }`
**What goes wrong:** Using `import { Core }` (value import) instead of `import type { Core }` when `Core` is only exported as a type.
**Why it happens:** `@strapi/types` uses `export type * as Core` — this is a type-only re-export.
**How to avoid:** Always use `import type { Core } from "@strapi/strapi"`. If TypeScript complains, the type is still available via `import type`.
**Warning signs:** TypeScript error "'Core' refers to a value but is being used as a type."

### Pitfall 3: `(data as any).message` in AxiosError catch — `data` type
**What goes wrong:** Inside `if (axios.isAxiosError(error))`, `error.response?.data` has type `any` from Axios's definition — meaning the existing `(data as any).message` was actually a no-op cast. After fixing, TypeScript may still not complain because Axios types `data` as `any`.
**Why it happens:** `axios.AxiosResponse.data` is typed as `any` in Axios v0.x/v1.x.
**How to avoid:** The fix is still correct: `const dataObj = data as Record<string, unknown>` with `typeof dataObj.message === "string"` check. This is the idiomatic narrowing pattern and removes the `as any` cast even if Axios typed `data` as `any`.
**Warning signs:** None — this is a non-breaking improvement.

### Pitfall 4: `StrapiFilter` consumers break when operator types change from `any` to `unknown`
**What goes wrong:** Any call site that assigns `filter.$eq = someValue` without a type annotation will now have `unknown` type for `$eq`, which TypeScript won't let you read without narrowing.
**Why it happens:** `unknown` requires explicit narrowing before use.
**How to avoid:** The `StrapiFilter` type is a parameter type for building filter objects — callers *assign into* it, not read from it. Assigning any value to an `unknown` field is valid. Reading requires narrowing, but `StrapiFilter` values are passed directly to Strapi's query layer.
**Warning signs:** TypeScript errors at `StrapiFilter` call sites reading operator values.

### Pitfall 5: `flow.test.ts` `mockStrapi = {} as any` — do NOT touch
**What goes wrong:** Test file uses `const mockStrapi = {} as any` — this is the out-of-scope test scaffolding cast. After `flow.factory.ts` changes `strapi: Strapi` to `strapi: Core.Strapi`, the call `flowServiceFactory(mockStrapi)` will still compile because `{} as any` is assignable to any type.
**Why it happens:** `as any` bypasses all type checks — the test remains valid.
**How to avoid:** Leave `flow.test.ts` completely untouched.

## Code Examples

Verified patterns from project source and type definitions:

### `Core.Strapi` import (verified from @strapi/strapi type chain)
```typescript
// Source: node_modules/@strapi/strapi/dist/index.d.ts → @strapi/types → Core.Strapi
import type { Core } from "@strapi/strapi";

// Usage in factory:
export function flowServiceFactory(
  strapi: Core.Strapi,
  customConfig?: Partial<IFlowConfig>
): FlowService {
  // ...
  return new FlowService(config as IFlowConfig, strapi);
}

// Usage in service class:
export class FlowService {
  private strapi: Core.Strapi;
  constructor(config: IFlowConfig, strapi: Core.Strapi) {
    this.config = config;
    this.strapi = strapi;
  }
}
```

### `Record<string, string>` params with String() cast for numbers
```typescript
// Source: flow.service.ts analysis — params values are all string-coercible
const params: Record<string, string> = {
  apiKey: this.config.apiKey,
  commerceOrder: orderData.commerceOrder,
  subject: orderData.subject,
  amount: String(Math.round(orderData.amount)),
  email: orderData.email,
  urlConfirmation: orderData.urlConfirmacion,
  urlReturn: orderData.urlRetorno,
};
params.s = this.signRequest(params);
```

### `(data as Record<string, unknown>).message` narrowing pattern
```typescript
// Pattern: replace (data as any).message in 5 locations
if (data) {
  detail = JSON.stringify(data);
  if (typeof data === "object" && data !== null) {
    const dataObj = data as Record<string, unknown>;
    if (typeof dataObj.message === "string") {
      detail = dataObj.message;
    }
  }
}
```

### `QueryParams` fix (same pattern as Phase 47's controller `QueryParams`)
```typescript
// Source: Phase 47 RESEARCH.md Pattern 5 — identical QueryParams fix
export interface QueryParams {
  filters?: unknown;
  pagination?: { page?: string; pageSize?: string; };
  sort?: unknown;
  populate?: unknown;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `type Strapi = any` | `Core.Strapi` from `@strapi/strapi` | Phase 48 | Proper Strapi instance typing in Flow layer |
| `Record<string, any>` params | `Record<string, string>` | Phase 48 | URLSearchParams type-safe construction |
| `(data as any).message` | `(data as Record<string, unknown>).message` with `typeof` guard | Phase 48 | No runtime change; explicit narrowing |

## Open Questions

1. **`signRequest` param typing after `Record<string, string>` change**
   - What we know: `signRequest` maps `Object.keys(params).sort()` → `params[key]` in string concat. All values are strings.
   - What's unclear: Whether TypeScript will accept `params.s = this.signRequest(params)` where `s` is added to `params` inside the same block
   - Recommendation: `params.s = this.signRequest(params)` works fine — `Record<string, string>` allows adding new string keys. No issue.

2. **`flow.test.ts` compilation after `Core.Strapi` change**
   - What we know: Test passes `{} as any` as `strapi` — `as any` satisfies `Core.Strapi`.
   - What's unclear: Whether tsc excludes test files (it does — tsconfig.json `"exclude": ["**/*.test.*"]`)
   - Recommendation: No concern — test files are excluded from `tsc --noEmit`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest (`apps/strapi/jest.config.js`) |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && yarn test --testPathPattern="flow.test"` |
| Full suite command | `cd apps/strapi && yarn test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TSANY-08 | `QueryParams`/`Order` fields typed | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-09 | `StrapiFilter` operator fields typed | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-10 | `flow.factory.ts` uses `Core.Strapi` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-11 | `flow.types.ts` fields typed | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-12 | `flow.service.ts` `as any` casts removed | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |

### Sampling Rate
- **Per task commit:** `cd apps/strapi && npx tsc --noEmit`
- **Per wave merge:** `cd apps/strapi && yarn test`
- **Phase gate:** `tsc --noEmit` passes with zero errors + all Jest tests pass before `/gsd-verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. `tsc --noEmit` is the primary validation tool for type annotation changes. `flow.test.ts` exists for `FlowService` behavioral coverage.

## Sources

### Primary (HIGH confidence)
- Direct file read: `apps/strapi/src/api/order/types/order.types.ts` — all `any` occurrences catalogued
- Direct file read: `apps/strapi/src/api/filter/types/filter.types.ts` — all `any` occurrences catalogued
- Direct file read: `apps/strapi/src/services/flow/factories/flow.factory.ts` — `type Strapi = any` confirmed
- Direct file read: `apps/strapi/src/services/flow/types/flow.types.ts` — 4 `any` fields + `Record<string, any>` confirmed
- Direct file read: `apps/strapi/src/services/flow/services/flow.service.ts` — all `any` occurrences catalogued (type alias + 6× `Record<string, any>` + 5× `(data as any).message`)
- Direct file read: `node_modules/@strapi/strapi/dist/index.d.ts` → `@strapi/types/dist/index.d.ts` → `@strapi/types/dist/core/strapi.d.ts` — `Core.Strapi` type availability confirmed
- Direct file read: `apps/strapi/tsconfig.json` — test files excluded from compilation confirmed
- `cd apps/strapi && npx tsc --noEmit` — zero errors confirmed (pre-change baseline)

### Secondary (MEDIUM confidence)
- Phase 47 RESEARCH.md patterns — `QueryParams` fix pattern identical to `order.types.ts` fix

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all types verified from installed packages and project source
- Architecture: HIGH — patterns verified from actual code analysis of all 5 target files
- Pitfalls: HIGH — identified from direct inspection of `flow.service.ts` internals

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable TypeScript patterns)
