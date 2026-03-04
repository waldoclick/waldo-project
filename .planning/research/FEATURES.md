# Features Research: Payment Gateway Abstraction

## What the Codebase Reveals

**Two gateways already exist with zero shared interface:**
- `TransbankService` — handles ad + pack one-time payments
- `FlowService` — handles Pro subscriptions (separate domain, separate lifecycle)

**Single coupling point:** `ad.service.ts` and `pack.service.ts` directly import `TransbankServices`.

**Payment lifecycle (both gateways):** Redirect-based
1. `initiatePayment` → returns `{url, token}` → user redirected to gateway
2. User completes payment on gateway
3. Gateway calls back → `confirmPayment(token)` → commits transaction → returns authorized/rejected

**Note:** `FlowService.getPaymentStatus()` is a placeholder returning dummy data — incomplete.

---

## Table Stakes (Must-Have for Abstraction to Work)

| Feature | Complexity | Notes |
|---------|-----------|-------|
| `IPaymentGateway` interface | Low | `initiatePayment` + `confirmPayment` |
| Normalized result envelopes | Low | `PaymentInitResponse`, `PaymentConfirmResponse`, `PaymentError` |
| `TransbankAdapter` implementing the interface | Low | Zero behavioral change — wrap existing service |
| `PaymentGatewayFactory` / registry | Low | Reads `PAYMENT_GATEWAY` env var, returns correct adapter |
| Wire `ad.service.ts` and `pack.service.ts` to use factory | Low | Remove direct Transbank import, call via factory |

**Minimal interface (derived from existing Transbank behavior):**

```typescript
interface IPaymentGateway {
  initiatePayment(request: PaymentInitRequest): Promise<PaymentInitResponse>;
  confirmPayment(token: string): Promise<PaymentConfirmResponse>;
}
```

---

## Differentiators (Nice-to-Have, Future)

| Feature | Complexity | Notes |
|---------|-----------|-------|
| Concrete adapter for a second gateway (e.g., MercadoPago) | Medium | Proves the abstraction works |
| Gateway health-check / fallback | Medium | Auto-switch if primary fails |
| Per-user/per-region gateway routing | High | Complex orchestration |

---

## Anti-Features (Explicitly DO NOT Build in This Pass)

| Feature | Reason |
|---------|--------|
| UI for gateway selection | Not required — transparent to users |
| Abstract Pro subscription lifecycle (Flow) | Separate domain — subscriptions ≠ one-time payments |
| Async webhook pipeline | Current redirect-based flow works, no need to redesign |
| Flow one-time payment adapter | `FlowService.getPaymentStatus()` is an incomplete placeholder |
| Concrete Flow adapter for abstraction layer | Out of scope — add when a second gateway is actually needed |

---

## Scope Summary

**This milestone:** Interface + TransbankAdapter + factory + wire existing services. Zero behavior change.

**Not this milestone:** Subscription abstraction, second concrete adapter, UI changes.
