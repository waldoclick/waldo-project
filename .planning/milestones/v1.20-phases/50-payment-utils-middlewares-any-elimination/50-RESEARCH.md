# Phase 50: Payment Utils + Middlewares any Elimination - Research

**Researched:** 2026-03-08
**Domain:** TypeScript `any` elimination — payment types, utils, controller, Strapi middlewares
**Confidence:** HIGH

## Summary

Phase 50 is the second-to-last phase in the v1.20 TypeScript `any` elimination milestone. It covers 9 files across three areas: (1) the `payment.type.ts` type definition file and 4 payment utility files, (2) the `payment.ts` controller, and (3) three Strapi global middlewares. All files have been read in full; every `any` occurrence has been catalogued.

The established pattern from Phases 47–49 applies uniformly: replace `any` with `unknown` for opaque data blobs, use typed interfaces for structured data that has known access patterns, and apply narrowing casts at call sites. No new packages are needed. The `catch (error)` block parameter types are explicitly out of scope per REQUIREMENTS.md.

The `metadata?: Record<string, any>` in `OrderData` is a special case — it should become `Record<string, unknown>`. The `[key: string]: any` index signatures on `OrderData` and `PackData` must be removed or changed to `[key: string]: unknown`, but the index signature on `User` in `user-registration.ts` needs to become `[key: string]: unknown`. The `strapi: any` param in `user-registration.ts` becomes `{ strapi: Core.Strapi }` using the same import pattern established in Phase 48.

**Primary recommendation:** Apply `unknown` uniformly for all opaque data fields; introduce named interfaces only where call-site access patterns require it (`FactoDocumentData.userDetails` → `BillingDetails` import).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TSANY-24 | `payment.type.ts` — `ad?: any`, reservation fields, `[key: string]: any`, `order?: any` → typed or `unknown` | Direct file read confirms all occurrences |
| TSANY-25 | `order.utils.ts` — `payment_response?: any`, `document_details?: any`, `items?: any[]`, `document_response?: any`, `documentResponse: any` → `unknown` | Direct file read confirms all occurrences |
| TSANY-26 | `user.utils.ts` — `commune?: any`, `business_commune?: any`, `flowData: any` → `unknown` | Direct file read confirms all occurrences |
| TSANY-27 | `ad.utils.ts` — `details?: any` in `adData` union → `unknown` | Direct file read confirms all occurrences |
| TSANY-28 | `general.utils.ts` — `userDetails: any` → `unknown` | Direct file read confirms all occurrences |
| TSANY-29 | `payment.ts` controller — `error: any` in `errorHandler` → `unknown`; `(result as any)` cast → typed | Direct file read confirms both occurrences |
| TSANY-30 | `image-uploader.ts` — `file: any` params → `unknown` with narrowing | Direct file read confirms 4 occurrences |
| TSANY-31 | `cache.ts` — `operation: () => Promise<any>` → `Promise<unknown>` | Direct file read confirms 1 occurrence |
| TSANY-32 | `user-registration.ts` — `[key: string]: any` index signature → `unknown`; `strapi: any` → typed | Direct file read confirms both occurrences |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@strapi/strapi` | v5 | `Core.Strapi` type, `Context` type | Already used in flow.factory.ts, flow.service.ts (Phase 48 established) |
| `koa` | (Strapi bundled) | `Context` type | Already imported in payment.ts controller, user.utils.ts |
| TypeScript | (Strapi bundled) | `unknown`, narrowing, `Record<K,V>` | Project standard — strict mode |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `BillingDetails` (local) | — | Already defined in `user.utils.ts` | Import into `general.utils.ts` to replace `userDetails: any` in `FactoDocumentData` |
| `soap` | (Strapi dep) | `soap.Client` type | Already used in Phase 49 for `facto.config.ts` |

## Architecture Patterns

### Established Pattern: `unknown` for opaque data blobs
```typescript
// Pattern from Phase 48/49 — use for payment_response, document_details, etc.
payment_response?: unknown;
document_details?: unknown;
items?: unknown[];
document_response?: unknown;
```

### Established Pattern: `Core.Strapi` for strapi parameter
```typescript
// From flow.factory.ts (Phase 48) — apply to user-registration.ts
import type { Core } from "@strapi/strapi";
// ...
{ strapi }: { strapi: Core.Strapi }
```

### Established Pattern: `unknown` with cast for narrowed access
```typescript
// From Phase 49 transbank handleError
private errorHandler = (ctx: Context, error: unknown) => {
  const e = error as { message?: string };
  ctx.body = { success: false, message: e?.message };
};
```

### Established Pattern: Remove `[key: string]: any` index signature
```typescript
// OrderData and PackData have [key: string]: any — these must become:
[key: string]: unknown;
// OR remove the index signature entirely if no dynamic access patterns exist
```

### Pattern: Import `BillingDetails` across files
`BillingDetails` is defined in `user.utils.ts`. It represents the shape of `userDetails` passed to `generateFactoDocument` in `general.utils.ts`. Instead of leaving it as `any`, import the interface:
```typescript
// general.utils.ts
import { BillingDetails } from "../utils/user.utils";

interface FactoDocumentData {
  isInvoice: boolean;
  userDetails: BillingDetails;
  items: TaxItem[];
}
```

### Pattern: Typed interface for `processPaidWebpay` result
The `result` in `adResponse` controller is cast as `any` because `processPaidWebpay` has no explicit return type. The proper fix is to remove the `as any` cast and rely on TypeScript's inferred return type — the property accesses (`result.webpay`, `result.ad`, `result.success`) will be type-safe from the inferred union.

### Pattern: `file: unknown` with type narrowing for sharp/fs operations
```typescript
// image-uploader.ts — the file object from Strapi/Koa multipart
interface UploadFile {
  mimetype: string;
  filepath: string;
  originalFilename: string;
}

const convertToWebP = async (file: unknown): Promise<void> => {
  const f = file as UploadFile;
  // access f.mimetype, f.filepath, etc.
};
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| `BillingDetails` shape | New interface | Import existing `BillingDetails` from `user.utils.ts` | Already defined, exported — DRY |
| Strapi type | Redefine | `Core.Strapi` from `@strapi/strapi` | Phase 48 established pattern |
| File upload shape | Invent | Local `UploadFile` stub interface | Strapi's internal file type not publicly typed; local stub is the established pattern |

## Common Pitfalls

### Pitfall 1: `[key: string]: any` index signatures in `OrderData` and `PackData`
**What goes wrong:** Changing `[key: string]: any` to `[key: string]: unknown` may break assignments if any explicit fields have types narrower than `unknown`. TypeScript requires all explicit properties in an indexed interface to be assignable to the index signature type.
**Why it happens:** `success: boolean` is not assignable to `unknown`... actually `unknown` is the widest type, so `boolean extends unknown` is TRUE. All existing fields are narrower than `unknown`, so this is safe.
**How to avoid:** Just change `any` to `unknown` — all existing typed fields are subtypes of `unknown`.

### Pitfall 2: `metadata?: Record<string, any>` in `OrderData`
**What goes wrong:** Changing to `Record<string, unknown>` is safe for writes (any value can be assigned to `unknown`), but callers reading from `metadata` will need narrowing.
**How to avoid:** Change to `Record<string, unknown>` — no callers read from `metadata` in the codebase (it's a write-only JSON blob for order creation).

### Pitfall 3: `result as any` cast in `adResponse` controller
**What goes wrong:** `processPaidWebpay` has no explicit return type annotation. TypeScript infers a complex union return. Removing `as any` will expose the inferred type — TypeScript will show the actual shape.
**How to avoid:** Remove the `as any` cast entirely. TypeScript's inferred type from `processPaidWebpay` covers all property accesses used in the controller (`result.webpay`, `result.ad`, `result.success`, `result.ad.user.id`, etc.) — they all come from the inferred union branches.

### Pitfall 4: `user.utils.ts` `commune` and `business_commune` typed as `any`
**What goes wrong:** These are populated relations that return `{ id, name, region: { name } }` shapes. Changing to `unknown` will break property access patterns like `user.commune?.name` and `user.business_commune?.region?.name` in `documentDetails`.
**How to avoid:** Keep `commune` and `business_commune` as `unknown` in the interface definition, and add local stub types for the property access in `documentDetails`:
```typescript
const commune = (userData.commune as { name?: string } | null | undefined);
```
Or alternatively use typed stubs for the nested commune shape. The simplest approach per established pattern is `commune?: unknown` in the interface and a cast at access sites.

### Pitfall 5: `strapi: any` in `user-registration.ts` middleware factory
**What goes wrong:** Changing `{ strapi: any }` to `{ strapi: Core.Strapi }` requires adding `import type { Core } from "@strapi/strapi"`. The `strapi` object is then used for `strapi.query(...)` calls — `Core.Strapi` has `.query()` as part of its API.
**How to avoid:** Add the import at the top of the file. The usage pattern `strapi.query("plugin::users-permissions.user").findOne(...)` is valid on `Core.Strapi`.

### Pitfall 6: `file: any` in `image-uploader.ts` inner function
**What goes wrong:** The `processFile` inner function inside the middleware factory also has `file: any`. There are 4 `any` occurrences for `file` in this file.
**How to avoid:** Define a local `UploadFile` interface and apply it to all 4 occurrences.

## Code Examples

### TSANY-24: `payment.type.ts` fixes
```typescript
// ad?: any in AdReservation → unknown
ad?: unknown;

// availableAdFeaturedReservation?: any, adFeaturedReservation?: any in ReservationResponse → unknown
availableAdFeaturedReservation?: unknown;
adFeaturedReservation?: unknown;

// [key: string]: any in OrderData → unknown
[key: string]: unknown;

// order?: any in OrderResponse → unknown
order?: unknown;

// metadata?: Record<string, any> in OrderData → Record<string, unknown>
metadata?: Record<string, unknown>;

// [key: string]: any in PackData → unknown
[key: string]: unknown;
```

### TSANY-25: `order.utils.ts` fixes
```typescript
interface CreateOrderParams {
  // ...
  payment_response?: unknown;
  document_details?: unknown;
  adId?: number;
  items?: unknown[];
  document_response?: unknown;
}

// updateOrderDocumentResponse param
public async updateOrderDocumentResponse(
  orderId: number,
  documentResponse: unknown
): Promise<OrderResponse>
```

### TSANY-26: `user.utils.ts` fixes
```typescript
// commune and business_commune in UserData
commune?: unknown;
business_commune?: unknown;

// commune in BillingDetails
commune?: unknown;

// flowData param
export const updateUserFlowData = async (
  userId: number | string,
  flowData: unknown
): Promise<UserData>
```

### TSANY-27: `ad.utils.ts` fixes
```typescript
// details?: any → unknown in both method signatures
adData: Partial<AdData> & { details?: unknown; slug?: string; user?: unknown }
```

### TSANY-28: `general.utils.ts` fixes
```typescript
import { BillingDetails } from "../utils/user.utils";

interface FactoDocumentData {
  isInvoice: boolean;
  userDetails: BillingDetails;
  items: TaxItem[];
}
```

### TSANY-29: `payment.ts` controller fixes
```typescript
// errorHandler: error: any → unknown
private errorHandler = (ctx: Context, error: unknown) => {
  const e = error as { message?: string };
  ctx.status = 400;
  ctx.body = { success: false, message: e?.message };
};

// Remove (result as any) cast — use inferred type directly
const result = await adService.processPaidWebpay(token);
```

### TSANY-30: `image-uploader.ts` fixes
```typescript
interface UploadFile {
  mimetype: string;
  filepath: string;
  originalFilename: string;
}

const convertToWebP = async (file: unknown): Promise<void> => {
  const f = file as UploadFile;
  if (f.mimetype.includes("jpeg") || ...) {
    // ...
    f.mimetype = "image/webp";
    f.originalFilename = ...;
  }
};

const processGalleryImage = async (file: unknown): Promise<void> => {
  const f = file as UploadFile;
  // ...
};

const processAvatarImage = async (file: unknown): Promise<void> => {
  const f = file as UploadFile;
  // ...
};

// Inner function in middleware:
const processFile = async (file: unknown) => { ... };
```

### TSANY-31: `cache.ts` fix
```typescript
// BEFORE
const handleRedisOperation = async (operation: () => Promise<any>) => {

// AFTER
const handleRedisOperation = async (operation: () => Promise<unknown>) => {
```

### TSANY-32: `user-registration.ts` fixes
```typescript
import type { Core } from "@strapi/strapi";

interface User {
  id: number;
  email: string;
  username: string;
  firstname?: string;
  lastname?: string;
  is_company?: boolean;
  [key: string]: unknown;
}

export default (
  config: Record<string, unknown>,
  { strapi }: { strapi: Core.Strapi }
) => { ... }
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (Strapi) |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && npx tsc --noEmit` |
| Full suite command | `cd apps/strapi && yarn test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TSANY-24 | `payment.type.ts` has no `any` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ |
| TSANY-25 | `order.utils.ts` has no `any` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ |
| TSANY-26 | `user.utils.ts` has no `any` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ |
| TSANY-27 | `ad.utils.ts` has no `any` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ |
| TSANY-28 | `general.utils.ts` has no `any` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ |
| TSANY-29 | `payment.ts` controller has no `any` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ |
| TSANY-30 | `image-uploader.ts` has no `any` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ |
| TSANY-31 | `cache.ts` has no `any` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ |
| TSANY-32 | `user-registration.ts` has no `any` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ |

### Wave 0 Gaps
None — existing test infrastructure (tsc + Jest) covers all phase requirements.

## Sources

### Primary (HIGH confidence)
- Direct file reads of all 9 target files — exact `any` occurrence catalogue
- Phase 47–49 PLAN.md files — established patterns for this codebase
- `flow.factory.ts`, `flow.service.ts` — `Core.Strapi` import pattern (Phase 48)
- `transbank/types/index.ts` — `IWebpayCommitData` with index signature (Phase 49)
- `zoho.service.ts` — `IZohoContact` interface pattern (Phase 49)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project
- Architecture: HIGH — patterns established in Phases 47–49, directly applicable
- Pitfalls: HIGH — identified through direct code analysis

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable — TypeScript patterns don't change)
