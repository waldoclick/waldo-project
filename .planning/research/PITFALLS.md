# Pitfalls Research: Payment Gateway Abstraction

*Derived from direct codebase analysis — all pitfalls are specific to the existing Waldo code.*

---

## Critical Pitfalls

### 1. Interface designed around Transbank's redirect model
**Warning sign:** Interface response includes `url` + `token` as Transbank concepts, or `confirmPayment(token)` where `token` means "Transbank token."
**Prevention:** Use `gatewayRef` (opaque string) instead of `token`. Each adapter interprets it as needed. The interface must be protocol-agnostic.
**Phase:** Interface definition (Phase 1)

### 2. Orphaned ad after payment initiation failure
**Warning sign:** Ad record exists in DB but `processPaidPayment` was never called — no reservation, no transaction.
**Prevention:** Ad must not be persisted before `initiatePayment` succeeds, or must be explicitly cleaned up on error path.
**Phase:** TransbankAdapter wiring (Phase 2)

### 3. `buy_order` string encodes context (`order-{userId}-{adId}-{uniqueId}`)
**Warning sign:** `extractIdsFromMeta` parses a string echoed back by the gateway. Other gateways don't echo custom strings — context recovery breaks.
**Prevention:** Store context server-side keyed by `gatewayRef` before redirecting. Callback looks up context by ref, not by parsing a gateway-echoed string. For this milestone, the TransbankAdapter preserves this behavior — but don't design the interface assuming it.
**Phase:** Interface design (Phase 1)

### 4. Order creation after potentially-throwing Facto call
**Warning sign:** `commitTransaction` succeeds (payment authorized) but Facto throws → order never created → unreconciled revenue.
**Prevention:** Wrap post-commit operations in try/catch. Log and queue reconciliation if Facto fails after a successful payment.
**Phase:** TransbankAdapter wiring (Phase 2)

### 5. Over-abstracting for imagined future gateways
**Warning sign:** Interface includes webhook handling, refunds, subscription support, or multi-method routing.
**Prevention:** Design the interface for exactly what Transbank does today. Let the second concrete gateway reveal what needs to generalize. YAGNI.
**Phase:** Interface definition (Phase 1)

---

## Moderate Pitfalls

### 6. Module-level Transbank singleton not injectable
**Location:** `src/services/transbank/config/transbank.config.ts` — instantiated at module load time.
**Warning sign:** Can't test the adapter without Transbank env vars present.
**Prevention:** `TransbankAdapter` constructor instantiates `TransbankService` (or receives it). Don't rely on the module-level singleton in the adapter.
**Phase:** TransbankAdapter implementation (Phase 1)

### 7. `payment_method: "webpay"` hardcoded in controller
**Location:** `src/api/payment/controllers/payment.ts` — order records will show `"webpay"` even for other gateways.
**Prevention:** Use `process.env.PAYMENT_GATEWAY ?? "transbank"` when creating the order record.
**Phase:** Wiring phase (Phase 2)

### 8. Missing `return` after `ctx.redirect` in `packResponse`
**Location:** `src/api/payment/controllers/payment.ts` — execution continues into Facto + order creation even when payment failed.
**Prevention:** Add `return` after `ctx.redirect` in the failure path. Fix as part of the refactor.
**Phase:** Wiring phase (Phase 2)

### 9. `strapi` global used directly in utils
**Location:** `src/api/payment/utils/general.utils.ts`
**Prevention:** Note as tech debt — don't block the refactor on this.
**Phase:** Tech debt, fix opportunistically

### 10. Webhook handling divergence between gateways
**Warning sign:** Creating a single `/payment/callback` route that all gateways must conform to.
**Prevention:** Each gateway owns its own callback route. Abstraction is at the service layer, not HTTP routing. Keep `/payment/transbank/callback`, add `/payment/newgateway/webhook` separately when needed.
**Phase:** Architecture design (Phase 1)

---

## Minor Pitfalls

### 11. No idempotency on the commit endpoint
**Warning sign:** Double-submit on the callback URL errors after a successful payment.
**Prevention:** Check if transaction was already committed before calling `commitTransaction`. Future improvement.

### 12. Missing env var validation at startup
**Warning sign:** Missing `WEBPAY_*` vars fail at runtime with cryptic errors.
**Prevention:** Registry should validate required env vars exist when instantiating an adapter. Throw a clear startup error if config is missing.
**Phase:** Registry implementation (Phase 1)
