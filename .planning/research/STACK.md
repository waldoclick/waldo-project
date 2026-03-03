# Stack Research: Payment Gateway Abstraction

## Key Findings

**No new npm packages needed.** The abstraction is purely structural TypeScript.

**Do NOT use Strapi plugins or `strapi.service()`.** The correct layer is `src/services/payment-gateway/` as a plain TypeScript module — matching the exact pattern of the existing `src/services/transbank/` module.

---

## Recommended Stack

### Layer: Plain TypeScript Service Module

| Choice | Rationale | Confidence |
|--------|-----------|-----------|
| `src/services/payment-gateway/` directory | Mirrors existing `src/services/transbank/` pattern — consistent, no Strapi magic | HIGH |
| TypeScript interface (`IPaymentGateway`) | Compile-time safety, no runtime overhead | HIGH |
| Factory function `getPaymentGateway()` | Lazy singleton, reads `PAYMENT_GATEWAY` env var at runtime | HIGH |
| `process.env.PAYMENT_GATEWAY` for selection | Consistent with how Transbank credentials are already configured | HIGH |

### What NOT to Use

| Approach | Why Not |
|----------|---------|
| Strapi plugin system | Overkill for an internal abstraction — adds complexity without benefit |
| `strapi.service()` / Strapi DI | The existing Transbank service doesn't use Strapi DI either — stay consistent |
| External payment abstraction libraries | None are Strapi-aware; adds dependency for something easily built in 50 lines |

---

## File Structure

**New files to create:**
```
apps/strapi/src/services/payment-gateway/
  types.ts                      ← IPaymentGateway interface + PaymentInitRequest/Response/Error types
  adapters/
    transbank.adapter.ts        ← TransbankAdapter (thin wrapper around existing TransbankService)
  index.ts                      ← getPaymentGateway() factory (lazy singleton, reads env var)
```

**Files that change (import swap only):**
```
apps/strapi/src/api/payment/services/ad.service.ts      ← swap direct Transbank import → getPaymentGateway()
apps/strapi/src/api/payment/services/pack.service.ts    ← swap direct Transbank import → getPaymentGateway()
```

**Files that do NOT change:**
```
apps/strapi/src/services/transbank/   ← untouched, adapter delegates to it
```

---

## Interface Design

Derived 1-to-1 from `TransbankService`'s two methods (`createTransaction`, `commitTransaction`):

```typescript
interface IPaymentGateway {
  initiatePayment(request: PaymentInitRequest): Promise<PaymentInitResponse>;
  confirmPayment(token: string): Promise<PaymentConfirmResponse>;
}

interface PaymentInitRequest {
  amount: number;
  orderId: string;
  returnUrl: string;
  sessionId?: string;
}

interface PaymentInitResponse {
  url: string;
  token: string;
}

interface PaymentConfirmResponse {
  status: 'authorized' | 'rejected' | 'failed';
  transactionId?: string;
  amount?: number;
  raw?: unknown; // original gateway response
}
```

**`TransbankAdapter`** is a thin wrapper that delegates 100% to `TransbankService` — zero behavior change, zero risk to the current integration.

---

## Environment Configuration

```bash
# Default (Transbank, current behavior)
PAYMENT_GATEWAY=transbank

# Future gateway example
PAYMENT_GATEWAY=mercadopago
```

Gateway defaults to `"transbank"` if env var is not set.
