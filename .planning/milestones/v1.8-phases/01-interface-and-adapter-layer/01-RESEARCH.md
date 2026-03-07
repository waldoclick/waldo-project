# Phase 1: Interface and Adapter Layer - Research

**Researched:** 2026-03-03
**Domain:** TypeScript service abstraction — payment gateway adapter pattern
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAY-01 | El sistema define una interfaz `IPaymentGateway` con métodos `createTransaction` y `commitTransaction` con firmas normalizadas | Interface signatures derived 1-to-1 from existing `TransbankService` public API; `gatewayRef` replaces `token` for protocol-agnostic design |
| PAY-02 | El sistema define tipos de respuesta normalizados `IGatewayInitResponse` e `IGatewayCommitResponse` | Shapes mirrored from existing `IWebpayInitResponse` and `IWebpayCommitResponse` in `transbank/types/index.ts`; verified they cover all data ad.service.ts and pack.service.ts depend on |
| PAY-03 | El sistema provee un `TransbankAdapter` que implementa `IPaymentGateway` delegando al `TransbankService` existente sin cambiar su comportamiento | `TransbankService` is a plain class, constructor-injectable; adapter wraps it with zero behavioral change |
| PAY-04 | El sistema provee un `PaymentGatewayRegistry` (factory) que retorna la pasarela activa según la variable de entorno `PAYMENT_GATEWAY` (default: `"transbank"`) | Pattern confirmed: `process.env.PAYMENT_GATEWAY ?? "transbank"`; registry is a plain module function matching existing service patterns |
| PAY-05 | El registry valida que las env vars requeridas estén presentes al instanciar el adapter, lanzando un error claro al startup si faltan | Required Transbank env vars confirmed: `WEBPAY_COMMERCE_CODE`, `WEBPAY_API_KEY`, `WEBPAY_ENVIRONMENT`; validation belongs in registry, throws at instantiation time |
</phase_requirements>

---

## Summary

Phase 1 introduces a gateway-agnostic abstraction layer as a pure-TypeScript module. The codebase already has everything needed: `TransbankService` is a well-defined class with two clear public methods (`createTransaction`, `commitTransaction`), and the existing `transbank/types/index.ts` provides the exact shapes (`IWebpayInitResponse`, `IWebpayCommitResponse`) the normalized interface will mirror.

The deliverable is four files under `apps/strapi/src/services/payment-gateway/`: a types file with the interface and normalized response types, a `TransbankAdapter` wrapping the existing service with zero behavior change, a registry with startup env var validation, and an index barrel. No packages installed, no Strapi DI, no existing files modified. The pattern to follow is the `src/services/transbank/` directory, which is structured identically (types, services, config, factories, index).

The critical design decision for this phase is the `gatewayRef` vs `token` naming in the interface. The project decision log confirms `gatewayRef` is the locked choice — protocol-agnostic naming where `TransbankAdapter` maps Transbank's `token` to `gatewayRef` internally. All callers use `gatewayRef`; adapters translate internally.

**Primary recommendation:** Build the three components in dependency order — types first, adapter second, registry third. All are pure TypeScript with no external dependencies. The test suite uses Jest + ts-jest and already has a `jest.setup.js` for env var seeding; a lightweight unit test for the registry validation logic is all that's needed.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | `@strapi/typescript-utils/tsconfigs/server` (via tsconfig) | Interface + type definitions | Already in use across entire codebase |
| Jest | `^29.7.0` | Unit tests | Already configured with ts-jest, existing tests in services |
| ts-jest | `^29.2.5` | TypeScript test runner | Already configured in `jest.config.js` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | — | — | No new packages required |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain TypeScript interface | Zod schema | Overkill — compile-time types are sufficient; no runtime validation needed at interface level |
| Factory function (`getPaymentGateway()`) | Strapi DI / `strapi.service()` | Strapi DI adds coupling to Strapi lifecycle; existing TransbankService doesn't use it either |
| Constructor injection for TransbankService in adapter | Module-level singleton (current transbank/index.ts pattern) | Constructor injection makes adapter testable without Transbank env vars present |

**Installation:** No new packages. All dependencies already present.

---

## Architecture Patterns

### Recommended Project Structure

```
apps/strapi/src/services/payment-gateway/
├── types/
│   └── gateway.interface.ts     # IPaymentGateway, IGatewayInitResponse, IGatewayCommitResponse
├── adapters/
│   └── transbank.adapter.ts     # TransbankAdapter implements IPaymentGateway
├── registry.ts                  # getPaymentGateway() factory with env var validation
└── index.ts                     # barrel export
```

This mirrors the existing `src/services/transbank/` structure exactly:
```
apps/strapi/src/services/transbank/
├── config/
│   └── transbank.config.ts
├── factories/
│   └── transbank.factory.ts
├── services/
│   └── transbank.service.ts
├── types/
│   └── index.ts                 # IWebpayInitResponse, IWebpayCommitResponse
└── index.ts                     # barrel export
```

### Pattern 1: Protocol-Agnostic Interface with `gatewayRef`

**What:** The `IPaymentGateway` interface uses `gatewayRef` (opaque string) instead of `token`. The `createTransaction` method returns `{ gatewayRef, url }`. The `commitTransaction` method accepts `gatewayRef`. Each adapter translates internally between `gatewayRef` and the gateway's native identifier.

**When to use:** Everywhere in the interface. `TransbankAdapter.createTransaction()` returns `token` from Transbank SDK mapped to `gatewayRef`. `TransbankAdapter.commitTransaction(gatewayRef)` passes `gatewayRef` directly to `TransbankService.commitTransaction(token)` since they are the same value for Webpay.

**Why:** The current `ad.service.ts` flow passes `token` from `processPaidPayment` back through the controller to `processPaidWebpay`. Naming it `gatewayRef` at the interface level means adding a second gateway (e.g., MercadoPago, which uses a `payment_id`) requires zero interface changes.

```typescript
// Source: derived from apps/strapi/src/services/transbank/types/index.ts
// apps/strapi/src/services/payment-gateway/types/gateway.interface.ts

export interface IGatewayInitResponse {
  success: boolean;
  gatewayRef?: string;   // gateway-agnostic reference (replaces Transbank's "token")
  url?: string;
  error?: any;
}

export interface IGatewayCommitResponse {
  success: boolean;
  response?: any;        // raw gateway response — callers use .response.buy_order etc.
  error?: any;
}

export interface IPaymentGateway {
  createTransaction(
    amount: number,
    orderId: string,
    sessionId: string,
    returnUrl: string
  ): Promise<IGatewayInitResponse>;

  commitTransaction(gatewayRef: string): Promise<IGatewayCommitResponse>;
}
```

### Pattern 2: Thin Adapter with Constructor-Injected Service

**What:** `TransbankAdapter` instantiates `TransbankService` in its constructor (not at module load time). This avoids the module-level singleton in `transbank/index.ts`, which reads `WEBPAY_*` env vars at module load — untestable without those vars present.

**When to use:** In `TransbankAdapter`'s constructor. This is the ONLY behavioral difference from the current pattern; everything else delegates to the existing service unchanged.

```typescript
// Source: derived from apps/strapi/src/services/transbank/services/transbank.service.ts
// apps/strapi/src/services/payment-gateway/adapters/transbank.adapter.ts

import { TransbankService } from "../../transbank/services/transbank.service";
import { IPaymentGateway, IGatewayInitResponse, IGatewayCommitResponse } from "../types/gateway.interface";

export class TransbankAdapter implements IPaymentGateway {
  private service: TransbankService;

  constructor() {
    this.service = new TransbankService();
  }

  async createTransaction(
    amount: number,
    orderId: string,
    sessionId: string,
    returnUrl: string
  ): Promise<IGatewayInitResponse> {
    const result = await this.service.createTransaction(amount, orderId, sessionId, returnUrl);
    return {
      success: result.success,
      gatewayRef: result.token,   // map Transbank "token" -> gateway-agnostic "gatewayRef"
      url: result.url,
      error: result.error,
    };
  }

  async commitTransaction(gatewayRef: string): Promise<IGatewayCommitResponse> {
    // For Transbank, gatewayRef IS the token — pass through directly
    return this.service.commitTransaction(gatewayRef);
  }
}
```

### Pattern 3: Registry with Startup Validation

**What:** The registry reads `PAYMENT_GATEWAY` at call time (not module load time), validates the gateway exists in the registry map, instantiates the adapter, and validates required env vars before returning. If validation fails, it throws a clear startup error.

**When to use:** `getPaymentGateway()` is called at the start of every paid transaction. Validation runs on each call (lightweight — just env var presence checks).

```typescript
// Source: derived from apps/strapi/src/services/transbank/config/transbank.config.ts (env var pattern)
// apps/strapi/src/services/payment-gateway/registry.ts

import { IPaymentGateway } from "./types/gateway.interface";
import { TransbankAdapter } from "./adapters/transbank.adapter";

const GATEWAY_ENV_REQUIREMENTS: Record<string, string[]> = {
  transbank: ["WEBPAY_COMMERCE_CODE", "WEBPAY_API_KEY"],
};

const GATEWAY_FACTORIES: Record<string, () => IPaymentGateway> = {
  transbank: () => new TransbankAdapter(),
};

export function getPaymentGateway(): IPaymentGateway {
  const id = process.env.PAYMENT_GATEWAY ?? "transbank";

  const factory = GATEWAY_FACTORIES[id];
  if (!factory) {
    throw new Error(
      `Unknown payment gateway: "${id}". Valid options: ${Object.keys(GATEWAY_FACTORIES).join(", ")}`
    );
  }

  const requiredVars = GATEWAY_ENV_REQUIREMENTS[id] ?? [];
  const missingVars = requiredVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    throw new Error(
      `Payment gateway "${id}" is missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return factory();
}
```

**Required env vars confirmed** (from `apps/strapi/src/services/transbank/config/transbank.config.ts`):
- `WEBPAY_COMMERCE_CODE` — commerce code for Transbank SDK
- `WEBPAY_API_KEY` — API key for Transbank SDK
- `WEBPAY_ENVIRONMENT` — optional, defaults to `"integration"` in config

**Note:** `WEBPAY_ENVIRONMENT` is optional (has a default), so it should NOT be in the required vars list — only `WEBPAY_COMMERCE_CODE` and `WEBPAY_API_KEY` are mandatory.

### Pattern 4: Index Barrel Export

**What:** A single `index.ts` re-exports the public surface of the module. Callers import from `../services/payment-gateway` not from internal paths.

```typescript
// apps/strapi/src/services/payment-gateway/index.ts
export { getPaymentGateway } from "./registry";
export type { IPaymentGateway, IGatewayInitResponse, IGatewayCommitResponse } from "./types/gateway.interface";
```

### Anti-Patterns to Avoid

- **Importing `transbank/index.ts` singleton in the adapter:** The module-level `new TransbankService()` in `transbank/index.ts` reads env vars at import time — instead instantiate `TransbankService` directly in the adapter constructor.
- **Reading `PAYMENT_GATEWAY` at module load time:** Read it inside `getPaymentGateway()` so tests can set env vars before calling the function.
- **Putting `token` in the interface:** Use `gatewayRef` per project decision. The adapter does the translation.
- **Including webhook handling or subscription methods in `IPaymentGateway`:** The interface covers exactly `createTransaction` + `commitTransaction`. FlowService is a separate domain.
- **Using `strapi.service()` or Strapi plugin system:** All existing service directories (`transbank/`, `facto/`, `flow/`, etc.) are plain TypeScript modules. Stay consistent.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript compile-time contracts | Custom runtime type checking | TypeScript `interface` | Zero runtime overhead, IDE support, type errors at build time |
| Gateway selection | Custom eval/dynamic import | Map literal + env var lookup | Simple, predictable, easy to extend by adding a key |
| Env var validation | Third-party config validator | Manual `process.env[v]` check in registry | 3 lines of code; no dependency justified |

**Key insight:** This entire phase is ~80 lines of TypeScript. The complexity is in getting the design right (interface naming, delegation boundary), not in the implementation volume.

---

## Common Pitfalls

### Pitfall 1: Leaking `token` into the normalized interface

**What goes wrong:** Interface uses `token` instead of `gatewayRef` in `IGatewayInitResponse` and `commitTransaction` signature. When a second gateway (e.g., MercadoPago `payment_id`) is added, the interface name is wrong and callers must be updated.

**Why it happens:** `TransbankService` uses `token` throughout. Easiest path is to copy that naming.

**How to avoid:** Use `gatewayRef` everywhere in the interface. The `TransbankAdapter` maps `result.token -> gatewayRef` in `createTransaction`. For `commitTransaction`, the value passed in is already the gatewayRef (which happens to be equal to the Transbank token for Webpay).

**Warning signs:** Interface file contains the word `token` anywhere outside of a comment.

### Pitfall 2: Module-level singleton instantiation breaks testability

**What goes wrong:** `TransbankAdapter` imports from `../../transbank/index` (which does `new TransbankService()` at module load). This requires `WEBPAY_*` env vars to be present when the module is imported in tests, even if you never call the adapter methods.

**Why it happens:** The existing `transbank/index.ts` exports a singleton for convenience. Adapter could just reuse it.

**How to avoid:** Import `TransbankService` class directly from `../../transbank/services/transbank.service`, instantiate in the adapter constructor. Tests can then import the adapter without triggering Transbank SDK initialization.

**Warning signs:** `TransbankAdapter` has `import TransbankServices from "../../transbank"` at the top.

### Pitfall 3: Over-specifying the `response` field in `IGatewayCommitResponse`

**What goes wrong:** Typing `response` as `{ status: string; buy_order: string; amount: number; ... }` ties the normalized type to Transbank's response shape. Other gateways return different fields.

**Why it happens:** `ad.service.ts` and `pack.service.ts` access `wepbayResponse.response.status`, `wepbayResponse.response.buy_order`, etc. — tempting to type these explicitly.

**How to avoid:** Keep `response?: any` in `IGatewayCommitResponse`. The callers already access `.response.buy_order` — they are written for Transbank specifically. The interface doesn't need to enforce the shape of the raw gateway response. This is consistent with the existing `IWebpayCommitResponse` type.

**Warning signs:** `IGatewayCommitResponse` has typed fields mirroring Transbank SDK response properties.

### Pitfall 4: Validating `WEBPAY_ENVIRONMENT` as required

**What goes wrong:** Registry marks `WEBPAY_ENVIRONMENT` as a required env var. Strapi startup fails if it's not set, even though `transbank.config.ts` defaults it to `"integration"` when absent.

**Why it happens:** It's natural to list all Webpay env vars together.

**How to avoid:** Check the actual config: `process.env.WEBPAY_ENVIRONMENT || "integration"` — it has a default. Only `WEBPAY_COMMERCE_CODE` and `WEBPAY_API_KEY` are mandatory. `WEBPAY_ENVIRONMENT` is optional.

**Warning signs:** Registry `GATEWAY_ENV_REQUIREMENTS.transbank` includes `"WEBPAY_ENVIRONMENT"`.

---

## Code Examples

Verified patterns from codebase analysis:

### Existing TransbankService — exact signatures to match

```typescript
// Source: apps/strapi/src/services/transbank/services/transbank.service.ts
// These are the EXACT method signatures the adapter must delegate to:

public async createTransaction(
  amount: number,
  orderId: string,
  sessionId: string,
  returnUrl: string
): Promise<IWebpayInitResponse>
// Returns: { success: boolean; token?: string; url?: string; error?: any }

public async commitTransaction(
  token: string
): Promise<IWebpayCommitResponse>
// Returns: { success: boolean; response?: any; error?: any }
```

### How callers currently use TransbankService (import pattern to NOT break)

```typescript
// Source: apps/strapi/src/api/payment/services/ad.service.ts (line 3, 292-296)
import TransbankServices from "../../../services/transbank";

// createTransaction call:
const transbankResponse = await TransbankServices.transbank.createTransaction(
  paymentDetails.amount,
  paymentDetails.buyOrder,
  paymentDetails.sessionId,
  returnUrl
);
// Accesses: transbankResponse.success, transbankResponse.token, transbankResponse.url

// commitTransaction call:
const wepbayResponse = await TransbankServices.transbank.commitTransaction(token);
// Accesses: wepbayResponse.success, wepbayResponse.response.status,
//           wepbayResponse.response.buy_order, wepbayResponse.error
```

After Phase 1, these callers will be updated in Phase 2 to use `getPaymentGateway()`. The normalized response shapes (`IGatewayInitResponse`, `IGatewayCommitResponse`) must cover all the fields callers access: `.success`, `.gatewayRef` (was `.token`), `.url`, `.response.status`, `.response.buy_order`, `.response.amount`, `.error`.

### Env var pattern (confirmed from transbank.config.ts)

```typescript
// Source: apps/strapi/src/services/transbank/config/transbank.config.ts
// Mandatory (no defaults):
process.env.WEBPAY_COMMERCE_CODE   // passed directly to Options constructor
process.env.WEBPAY_API_KEY         // passed directly to Options constructor

// Optional (has default in config):
process.env.WEBPAY_ENVIRONMENT || "integration"
```

### Existing Jest test pattern (for unit test in Wave 0)

```typescript
// Source: apps/strapi/src/services/facto/tests/facto.test.ts + jest.setup.js
// Test file convention: co-located tests/<name>.test.ts
// jest.setup.js seeds env vars via dotenv + explicit assignments
// ts-jest transforms TypeScript — no babel needed
// testMatch: ["**/?(*.)+(spec|test).ts"]  (from jest.config.js)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct `TransbankServices.transbank.X()` calls | `getPaymentGateway().X()` via interface | Phase 1 (this phase adds the module; Phase 2 wires callers) | Zero behavior change — TransbankAdapter delegates 100% |
| `token` as gateway reference | `gatewayRef` (opaque string) | This interface design | Protocol-agnostic; second gateway can use different ref type |
| No startup validation for payment config | Registry validates required env vars at instantiation | Phase 1 | Clear startup error instead of cryptic SDK failure |

**Not yet changed (Phase 2):**
- `ad.service.ts` and `pack.service.ts` still import `TransbankServices` directly
- `payment.ts` controller still hardcodes `"webpay"` as `payment_method`
- Missing `return` after `ctx.redirect` in `packResponse` failure path

---

## Open Questions

1. **`WEBPAY_ENVIRONMENT` in required env vars check?**
   - What we know: `transbank.config.ts` defaults it to `"integration"` when absent — it is optional
   - What's unclear: Whether the registry should still warn (but not throw) if it's missing in production
   - Recommendation: Do not include in required vars list; the SDK default is safe for integration testing

2. **Should the registry cache the adapter instance (singleton) or create a new one per call?**
   - What we know: Current `transbank/index.ts` exports a module-level singleton; creating a new `TransbankService` per call is cheap (no I/O in constructor)
   - What's unclear: Whether any future gateway adapter would have expensive initialization
   - Recommendation: Create a new instance per call for simplicity and testability; optimize to singleton later if needed

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + ts-jest 29.2.5 |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage` |
| Full suite command | `cd apps/strapi && npx jest --no-coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAY-01 | `IPaymentGateway` interface compiles with correct method signatures | unit (compile check) | `cd apps/strapi && npx tsc --noEmit` | ❌ Wave 0 |
| PAY-02 | `IGatewayInitResponse` and `IGatewayCommitResponse` cover fields callers depend on | unit | `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage` | ❌ Wave 0 |
| PAY-03 | `TransbankAdapter` implements `IPaymentGateway`; delegates `createTransaction` and `commitTransaction` to `TransbankService` without behavior change | unit (with mock) | `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage` | ❌ Wave 0 |
| PAY-04 | `getPaymentGateway()` returns `TransbankAdapter` when `PAYMENT_GATEWAY=transbank` and when env var is unset | unit | `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage` | ❌ Wave 0 |
| PAY-05 | `getPaymentGateway()` throws with descriptive error when `WEBPAY_COMMERCE_CODE` or `WEBPAY_API_KEY` is missing | unit | `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `cd apps/strapi && npx jest src/services/payment-gateway --no-coverage`
- **Per wave merge:** `cd apps/strapi && npx tsc --noEmit && npx jest src/services/payment-gateway --no-coverage`
- **Phase gate:** Full TypeScript compile (`npx tsc --noEmit`) + payment-gateway tests green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/strapi/src/services/payment-gateway/tests/gateway.test.ts` — covers PAY-01 through PAY-05
  - Tests: interface compile check (via TypeScript), adapter delegation (mock `TransbankService`), registry returns correct adapter, registry throws on missing env vars
- [ ] No framework install needed — Jest + ts-jest already configured

**Test implementation notes for Wave 0:**
- Mock `TransbankService` using Jest's `jest.mock()` — prevents Transbank SDK initialization during tests
- Manipulate `process.env.PAYMENT_GATEWAY`, `process.env.WEBPAY_COMMERCE_CODE`, `process.env.WEBPAY_API_KEY` in `beforeEach`/`afterEach` to test registry validation
- All tests are pure unit tests — no DB, no Strapi instance, no network

---

## Sources

### Primary (HIGH confidence)

- Direct codebase analysis: `apps/strapi/src/services/transbank/services/transbank.service.ts` — exact method signatures, return types
- Direct codebase analysis: `apps/strapi/src/services/transbank/types/index.ts` — `IWebpayInitResponse`, `IWebpayCommitResponse` shapes
- Direct codebase analysis: `apps/strapi/src/services/transbank/config/transbank.config.ts` — env var names and defaults
- Direct codebase analysis: `apps/strapi/src/api/payment/services/ad.service.ts` — call sites, field accesses on response
- Direct codebase analysis: `apps/strapi/src/api/payment/services/pack.service.ts` — call sites, field accesses on response
- Direct codebase analysis: `apps/strapi/src/api/payment/controllers/payment.ts` — `payment_method: "webpay"` hardcoding (Phase 2 fix), full response flow
- Direct codebase analysis: `apps/strapi/jest.config.js` + `jest.setup.js` — test framework configuration
- Direct codebase analysis: `.planning/STATE.md` — locked decision: `gatewayRef` over `token`

### Secondary (MEDIUM confidence)

- GoF Adapter pattern — wrapping existing implementation behind shared interface; universally applicable to this exact structure

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all patterns verified in codebase
- Architecture: HIGH — derived 1-to-1 from existing service structures and call sites
- Interface design: HIGH — `gatewayRef` decision locked in STATE.md; shapes derived from existing Webpay types
- Pitfalls: HIGH — all pitfalls are specific to observed code, not speculative

**Research date:** 2026-03-03
**Valid until:** 2026-04-03 (stable codebase, no external API dependency)
