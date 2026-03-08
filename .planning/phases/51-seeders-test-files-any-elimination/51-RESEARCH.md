# Phase 51: Seeders + Test Files any Elimination - Research

**Researched:** 2026-03-08
**Domain:** TypeScript `any` elimination — seeder files and test files
**Confidence:** HIGH

## Summary

Phase 51 is the final phase of the v1.20 TypeScript `any` elimination milestone. It covers two distinct areas: (1) five seeder files in `apps/strapi/seeders/` that all have `strapi: any` as their function parameter, and (2) four test files that contain various `as any` casts for accessing service return values, the global `strapi` mock, and a controller method.

All seeder files follow an identical pattern — a single exported async function with `strapi: any` as its sole parameter. The fix is uniform: add `import type { Core } from "@strapi/strapi"` and replace `strapi: any` with `strapi: Core.Strapi`. This exact pattern was already established in Phase 48 (`flow.factory.ts`) and Phase 50 (`user-registration.ts`).

The four test files require different approaches:
- `pack.zoho.test.ts`: `(global as any).strapi` → declare a typed interface for the mock object; `(result as any).success` → use typed return interface
- `pack.service.test.ts` and `ad.service.test.ts`: `(await ...) as any` → use typed interfaces for service return values
- `payment.controller.test.ts`: `(controller as any).packResponse` → use direct property access (it's public); `body: undefined as any` → use `undefined as unknown as BodyType` or cast correctly

Note: The tsconfig.json for strapi **excludes test files** (`"**/*.test.*"`) from compilation, so `tsc --noEmit` does not type-check the test files. Verification for test changes must use `yarn test` (Jest + ts-jest) to detect type errors.

**Primary recommendation:** Apply `Core.Strapi` uniformly to all 5 seeders; use typed return interfaces in tests; access `controller.packResponse` directly (no cast needed since it's a public property).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TSANY-33 | All 5 seeder files — `strapi: any` param → `Core.Strapi` | Direct file read confirms identical pattern in all 5; Phase 48/50 established this exact fix |
| TSANY-34 | `pack.zoho.test.ts` — `(global as any).strapi` → typed mock; `(result as any).success` → typed | Direct file read: lines 16, 97, 143, 153 |
| TSANY-35 | `pack.service.test.ts` + `ad.service.test.ts` — `(await ...) as any` casts → typed interfaces | Direct file read: `pack.service.test.ts` line 113; `ad.service.test.ts` line 118 |
| TSANY-36 | `payment.controller.test.ts` — `(controller as any).packResponse` → typed accessor; `body: undefined as any` → typed stub | Direct file read: lines 38, 63, 111, 158 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@strapi/strapi` | v5 | `Core.Strapi` type | Already used in `flow.factory.ts`, `flow.service.ts`, `user-registration.ts` |
| TypeScript | (Strapi bundled) | `unknown`, typed interfaces | Project standard — strict mode |
| Jest + ts-jest | ^29 | Test type-checking | Strapi test runner — `tsconfig.json` excludes test files from `tsc` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `koa` | (Strapi bundled) | `Context` type | Already imported in payment controller and test |

## Architecture Patterns

### Pattern 1: `Core.Strapi` for seeder parameter (established)
```typescript
// Source: apps/strapi/src/services/flow/factories/flow.factory.ts (Phase 48)
import type { Core } from "@strapi/strapi";

const populateX = async (strapi: Core.Strapi): Promise<void> => {
  // strapi.db.query(...) is valid on Core.Strapi
};
```

### Pattern 2: Typed mock interface for global.strapi in tests
```typescript
// Replace (global as any).strapi with a typed interface
interface MockStrapi {
  entityService: {
    findOne: jest.Mock;
  };
}

// Declare global extension for test file scope
declare global {
  // eslint-disable-next-line no-var
  var strapi: MockStrapi;
}

global.strapi = {
  entityService: {
    findOne: jest.fn().mockResolvedValue({ email: "user@example.com" }),
  },
};

// In beforeEach, access without cast:
global.strapi.entityService.findOne.mockResolvedValue({ email: "user@example.com" });
```

### Pattern 3: Typed return interface for service results in tests
```typescript
// For pack.service.test.ts — packPurchase success return shape
interface PackPurchaseResult {
  success: boolean;
  message?: string;
  webpay?: {
    success: boolean;
    gatewayRef: string;
    url: string;
  };
}

const result = await packService.packPurchase(1, "user-1", false) as PackPurchaseResult;
expect(result.success).toBe(true);
```

### Pattern 4: Direct public property access for controller
```typescript
// packResponse is a public class property on PaymentController
// export default new PaymentController() → PaymentController instance
// Access directly without cast:
await controller.packResponse(ctx);

// Instead of: await (controller as any).packResponse(ctx);
```

### Pattern 5: `body: undefined` without cast
```typescript
// Koa context body accepts undefined
// Use explicit undefined for the body field in the test stub
function makeCtx(overrides: Record<string, unknown> = {}) {
  return {
    query: { token_ws: "test-token" },
    state: { user: { id: "user-1" } },
    request: { body: { data: {} } },
    redirect: jest.fn(),
    body: undefined,
    status: 200,
    ...overrides,
  };
}
```

### Anti-Patterns to Avoid
- **`(global as any).strapi`:** Bypasses type system for mocks — use `declare global { var strapi: MockStrapi }` instead
- **`(result as any).success`:** Use typed return interface or narrowing — `(result as PackPurchaseResult).success`
- **`(controller as any).packResponse`:** `packResponse` is public on `PaymentController` — access directly via `controller.packResponse`
- **Changing catch block parameter types:** Explicitly out of scope per REQUIREMENTS.md

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Strapi type for seeders | Redefine or use `unknown` | `Core.Strapi` from `@strapi/strapi` | Phase 48/50 established this exact pattern; `.db.query()` is valid on `Core.Strapi` |
| Global test typing | Complex global augmentation | Simple `declare global { var strapi: MockStrapi }` in test file | Minimal scope, sufficient for test isolation |
| Service return type | Duplicate full union | Local typed result interface in test | Tests need only the success-path shape |

## Common Pitfalls

### Pitfall 1: `tsc --noEmit` does NOT type-check test files
**What goes wrong:** Running `cd apps/strapi && npx tsc --noEmit` will not catch type errors in test files — they are excluded by `tsconfig.json` (`"**/*.test.*"` in excludes).
**Why it happens:** Strapi's TS config intentionally excludes tests to avoid polluting the build.
**How to avoid:** Use `cd apps/strapi && yarn test` to verify test file type correctness (ts-jest performs type checking during test execution).
**Warning signs:** tsc passes but yarn test fails with TS errors.

### Pitfall 2: `declare global` in test files requires `export {}`
**What goes wrong:** `declare global` in a `.ts` file without any `import`/`export` is treated as a script, not a module. The ambient declaration may not work correctly.
**Why it happens:** TypeScript treats files without imports/exports as scripts where `declare global` is unnecessary.
**How to avoid:** `pack.zoho.test.ts` already has `import` statements, so it's already a module. The `declare global` block will work correctly.

### Pitfall 3: `controller.packResponse` type — `controllerWrapper` return type
**What goes wrong:** `packResponse` is typed as the return of `controllerWrapper(async (ctx: Context) => {...})`. The `controllerWrapper` function's return type is `async (ctx: Context) => Promise<void>`. TypeScript knows this is a public property, so direct access works.
**Why it happens:** When `controller` is typed as `PaymentController` (the class), all public properties are accessible. The test imports `controller` as the default export of `payment.ts`, which is `new PaymentController()`.
**How to avoid:** Call `controller.packResponse(ctx)` directly — no cast needed.

### Pitfall 4: `body: undefined as any` in test context stub
**What goes wrong:** `body: undefined as any` was used because the `makeCtx` return type needed to accommodate `ctx.body = { ... }` assignments. Without `as any`, the local `body` field type is `undefined` and reassignment might error.
**Why it happens:** The test stub is a plain object literal, not a typed `Context`. The `body` field is reassigned in the controller under test.
**How to avoid:** Type the stub as `{ body: unknown; ... }` or use a `Record<string, unknown>` for overrides, or simply cast the whole stub to `Partial<Context>`:
```typescript
function makeCtx(overrides: Record<string, unknown> = {}) {
  return {
    query: { token_ws: "test-token" },
    state: { user: { id: "user-1" } },
    request: { body: { data: {} } },
    redirect: jest.fn(),
    body: undefined as unknown,
    status: 200,
    ...overrides,
  };
}
```

### Pitfall 5: Seeder files are not included in tsconfig `include`
**What goes wrong:** The seeders directory is at `apps/strapi/seeders/`, not under `src/`. The tsconfig.json `include` is `["./", "./**/*.ts", ...]` which DOES include them (root glob). But the `exclude` list doesn't mention `seeders/`. So seeders ARE compiled by tsc.
**Why it happens:** Root-level `./` glob includes `seeders/`.
**How to avoid:** Adding `Core.Strapi` import to seeders will be picked up by `tsc --noEmit`.

## Code Examples

Verified patterns from prior phases:

### TSANY-33: Seeder pattern (all 5 files identical fix)
```typescript
// BEFORE (categories.ts, packs.ts, regions.ts, faqs.ts, conditions.ts)
const populateX = async (strapi: any) => {

// AFTER
import type { Core } from "@strapi/strapi";

const populateX = async (strapi: Core.Strapi): Promise<void> => {
```

All seeder files use only `strapi.db.query(...)` which is valid on `Core.Strapi`.

### TSANY-34: pack.zoho.test.ts typed mock
```typescript
// BEFORE
(global as any).strapi = {
  entityService: {
    findOne: jest.fn().mockResolvedValue({ email: "user@example.com" }),
  },
};
// ...
(global as any).strapi.entityService.findOne.mockResolvedValue({...});
// ...
expect((result as any).success).toBe(true);

// AFTER — declare typed interface and use global.strapi directly
interface MockStrapi {
  entityService: {
    findOne: jest.Mock;
  };
}

declare global {
  // eslint-disable-next-line no-var
  var strapi: MockStrapi;
}

global.strapi = {
  entityService: {
    findOne: jest.fn().mockResolvedValue({ email: "user@example.com" }),
  },
};
// ...
global.strapi.entityService.findOne.mockResolvedValue({...});
// ...
// For (result as any).success — processPaidWebpay always returns { success: boolean, ... }
interface ProcessPaidWebpayResult {
  success: boolean;
  message?: string;
  error?: unknown;
}
const result = await packService.processPaidWebpay("pack-token") as ProcessPaidWebpayResult;
expect(result.success).toBe(true);
```

### TSANY-35: pack.service.test.ts typed result
```typescript
// BEFORE
const result = (await packService.packPurchase(1, "user-1", false)) as any;
expect(result.success).toBe(true);
expect(result.webpay).toEqual(expect.objectContaining({...}));

// AFTER
interface PackPurchaseSuccessResult {
  success: boolean;
  message?: string;
  webpay?: {
    success: boolean;
    gatewayRef: string;
    url: string;
  };
}
const result = await packService.packPurchase(1, "user-1", false) as PackPurchaseSuccessResult;
expect(result.success).toBe(true);
expect(result.webpay).toEqual(expect.objectContaining({...}));
```

### TSANY-35: ad.service.test.ts typed result
```typescript
// BEFORE
const result = (await adService.processPaidPayment(1)) as any;

// AFTER
interface ProcessPaidPaymentResult {
  success: boolean;
  message?: string;
  webpay?: {
    success: boolean;
    gatewayRef: string;
    url: string;
  };
}
const result = await adService.processPaidPayment(1) as ProcessPaidPaymentResult;
```

### TSANY-36: payment.controller.test.ts fixes
```typescript
// BEFORE — (controller as any).packResponse
await (controller as any).packResponse(ctx);

// AFTER — direct public property access
await controller.packResponse(ctx);

// BEFORE — body: undefined as any
body: undefined as any,

// AFTER — body typed as unknown
body: undefined as unknown,
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + ts-jest (Strapi) |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && npx tsc --noEmit` (seeders only — tests excluded from tsc) |
| Full suite command | `cd apps/strapi && yarn test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TSANY-33 | 5 seeder files have `Core.Strapi` — no `strapi: any` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ |
| TSANY-34 | `pack.zoho.test.ts` — no `(global as any)`, no `(result as any)` | compile+test | `cd apps/strapi && yarn test --testPathPattern=pack.zoho` | ✅ |
| TSANY-35 | `pack.service.test.ts` + `ad.service.test.ts` — no `as any` casts | compile+test | `cd apps/strapi && yarn test --testPathPattern="pack.service\|ad.service"` | ✅ |
| TSANY-36 | `payment.controller.test.ts` — no `(controller as any)`, no `undefined as any` | compile+test | `cd apps/strapi && yarn test --testPathPattern=payment.controller` | ✅ |

### Sampling Rate
- **Per task commit:** `cd apps/strapi && npx tsc --noEmit`
- **Per wave merge:** `cd apps/strapi && yarn test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
None — existing test infrastructure (tsc + Jest) covers all phase requirements.

## Sources

### Primary (HIGH confidence)
- Direct file reads of all 9 target files (5 seeders + 4 test files) — exact `any` occurrence catalogue
- `apps/strapi/src/services/flow/factories/flow.factory.ts` — `Core.Strapi` import pattern (Phase 48)
- `apps/strapi/src/middlewares/user-registration.ts` — `Core.Strapi` strapi param pattern (Phase 50)
- `apps/strapi/tsconfig.json` — confirms test files are excluded from `tsc --noEmit`
- `apps/strapi/jest.config.js` — confirms ts-jest for test type-checking

### Secondary (MEDIUM confidence)
- `apps/strapi/src/api/payment/controllers/payment.ts` — confirmed `packResponse` is a public property (no `private` modifier), direct access in tests is valid

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, patterns established in Phases 48/50
- Architecture: HIGH — patterns directly applicable, confirmed by code reading
- Pitfalls: HIGH — identified through direct code analysis (especially tsc exclusion of test files)

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable — TypeScript patterns don't change)
