# Architecture Research: Payment Gateway Abstraction

*Based on direct codebase analysis — HIGH confidence across all recommendations.*

---

## Recommended Architecture

Introduce a thin adapter layer between the payment-domain services (`AdService`, `PackService`) and the concrete gateway implementations (`TransbankService`). The existing code is already structured for this — `TransbankService` is a class with two clear methods. The task is to extract a shared interface, wrap the existing service behind it, and route calls through a registry instead of direct imports.

### Visual Overview

```
HTTP Request
     |
     v
PaymentController   (src/api/payment/controllers/payment.ts)  [UNCHANGED]
     |
     v
AdService / PackService   (src/api/payment/services/)  [MINIMAL CHANGE — import swap only]
     |
     v  calls interface methods, not concrete class
IPaymentGateway   (src/services/payment-gateway/types/gateway.interface.ts)
     ^               ^
     |               |
TransbankAdapter    FutureAdapter
(src/services/payment-gateway/adapters/)
     |
     v
TransbankService  (src/services/transbank/)  [UNCHANGED]
```

---

## Component Boundaries

| Component | Responsibility | File Location | Communicates With |
|-----------|---------------|---------------|-------------------|
| `IPaymentGateway` interface | Contract all gateways must satisfy | `src/services/payment-gateway/types/gateway.interface.ts` | All adapters |
| `IGatewayInitResponse` / `IGatewayCommitResponse` | Normalized gateway-agnostic response shapes | same file | Interface + callers |
| `TransbankAdapter` | Wraps `TransbankService` behind `IPaymentGateway` | `src/services/payment-gateway/adapters/transbank.adapter.ts` | `TransbankService` |
| `PaymentGatewayRegistry` | Returns active gateway instance based on env config | `src/services/payment-gateway/registry.ts` | All adapters |
| `AdService` (modified) | Replaces direct `TransbankServices` import with registry call | `src/api/payment/services/ad.service.ts` | `PaymentGatewayRegistry` |
| `PackService` (modified) | Same as AdService | `src/api/payment/services/pack.service.ts` | `PaymentGatewayRegistry` |
| `PaymentController` | Routes HTTP, handles redirect logic — unchanged | `src/api/payment/controllers/payment.ts` | `AdService`, `PackService` |
| `TransbankService` | Existing SDK wrapper — NOT modified | `src/services/transbank/services/transbank.service.ts` | Transbank SDK |

---

## Interface Definition

Signatures match `TransbankService`'s existing public API exactly:

```typescript
// src/services/payment-gateway/types/gateway.interface.ts

export interface IGatewayInitResponse {
  success: boolean;
  token?: string;
  url?: string;
  error?: any;
}

export interface IGatewayCommitResponse {
  success: boolean;
  response?: any;
  error?: any;
}

export interface IPaymentGateway {
  createTransaction(
    amount: number,
    orderId: string,
    sessionId: string,
    returnUrl: string
  ): Promise<IGatewayInitResponse>;

  commitTransaction(token: string): Promise<IGatewayCommitResponse>;
}
```

## TransbankAdapter (thin wrapper — zero behavior change)

```typescript
// src/services/payment-gateway/adapters/transbank.adapter.ts

import { TransbankService } from "../../transbank/services/transbank.service";
import { IPaymentGateway, IGatewayInitResponse, IGatewayCommitResponse } from "../types/gateway.interface";

export class TransbankAdapter implements IPaymentGateway {
  private service: TransbankService;

  constructor() {
    this.service = new TransbankService();
  }

  async createTransaction(amount, orderId, sessionId, returnUrl): Promise<IGatewayInitResponse> {
    return this.service.createTransaction(amount, orderId, sessionId, returnUrl);
  }

  async commitTransaction(token: string): Promise<IGatewayCommitResponse> {
    return this.service.commitTransaction(token);
  }
}
```

## Registry (reads PAYMENT_GATEWAY env var)

```typescript
// src/services/payment-gateway/registry.ts

import { IPaymentGateway } from "./types/gateway.interface";
import { TransbankAdapter } from "./adapters/transbank.adapter";

type GatewayId = "transbank";

const registry: Record<GatewayId, () => IPaymentGateway> = {
  transbank: () => new TransbankAdapter(),
};

export function getPaymentGateway(): IPaymentGateway {
  const id = (process.env.PAYMENT_GATEWAY ?? "transbank") as GatewayId;
  const factory = registry[id];
  if (!factory) {
    throw new Error(`Unknown payment gateway: "${id}". Valid: ${Object.keys(registry).join(", ")}`);
  }
  return factory();
}
```

---

## Call Site Changes (minimal)

**Before:**
```typescript
import TransbankServices from "../../../services/transbank";
await TransbankServices.transbank.createTransaction(...)
```

**After:**
```typescript
import { getPaymentGateway } from "../../../services/payment-gateway/registry";
const gateway = getPaymentGateway();
await gateway.createTransaction(...)
```

---

## Data Flow: Paid Ad Creation

```
POST /api/payments/ad
  PaymentController.adCreate
    -> adService.processPaidPayment(adId)
         -> getPaymentGateway()          // reads PAYMENT_GATEWAY env, defaults "transbank"
         -> gateway.createTransaction(amount, orderId, sessionId, returnUrl)
         <- { success: true, token, url }
  <- HTTP 200 { data: { webpay: { token, url } } }

User completes payment at gateway URL

GET /api/payments/ad-response?token_ws=<token>
  PaymentController.adResponse
    -> adService.processPaidWebpay(token)
         -> getPaymentGateway()
         -> gateway.commitTransaction(token)
         <- { success: true, response: { status: "AUTHORIZED", buy_order, amount } }
         -> extract userId, adId from buy_order
         -> update reservations, ad dates
    -> generate Facto document
    -> create Order (payment_method: process.env.PAYMENT_GATEWAY ?? "transbank")
    -> redirect /anunciar/gracias?ad=<id>
```

---

## New File Structure

```
apps/strapi/src/services/payment-gateway/
  index.ts
  registry.ts
  types/
    gateway.interface.ts
  adapters/
    transbank.adapter.ts
```

**Files that change (minimally):**
- `src/api/payment/services/ad.service.ts` — swap import + call (x2 methods)
- `src/api/payment/services/pack.service.ts` — swap import + call (x2 methods)
- `src/api/payment/controllers/payment.ts` — `"webpay"` → `process.env.PAYMENT_GATEWAY ?? "transbank"` (x2)

**Files that do NOT change:**
- `src/services/transbank/` — entire directory untouched
- `src/services/flow/` — entire directory untouched
- All routes, policies, utils, types in `src/api/payment/`

---

## Build Order

1. **Define interface** (`gateway.interface.ts`) — pure types, no logic. Everything depends on this.
2. **Build TransbankAdapter** — validates the interface is implementable without touching existing service.
3. **Build Registry** — only after adapters exist. Start with just `"transbank"` registered.
4. **Swap imports in AdService + PackService** — after registry is stable. E2E behavior must be identical.
5. **Fix hardcoded `"webpay"` in controller** — last, lowest risk, data-correctness only.

---

## Adding a Future Gateway

1. Create `src/services/payment-gateway/adapters/newgateway.adapter.ts` implementing `IPaymentGateway`
2. Register it in `registry.ts`
3. Extend `GatewayId` type
4. Set `PAYMENT_GATEWAY=newgateway` in env

**Zero changes to any existing file.**

---

## Anti-Patterns to Avoid

| Anti-pattern | Why Not |
|--------------|---------|
| Fat interface with webhooks/subscriptions/refunds | `ProService`/`FlowService` is a separate domain — stays outside this abstraction |
| Make registry a Strapi plugin | No Strapi dependencies needed — plain TS module like the 9 existing `src/services/` directories |
| One adapter for multiple gateways | One adapter per gateway, registry handles selection |
| Modifying `TransbankService` | Keep untouched — adapter is the conformance layer |
