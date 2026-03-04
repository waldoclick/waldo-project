# Phase 2: Call Site Wiring and Bug Fixes - Research

**Researched:** 2026-03-04
**Domain:** TypeScript service refactor — replacing direct Transbank imports with gateway abstraction, controller bug fixes
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WIRE-01 | `ad.service.ts` usa `getPaymentGateway()` de la factory en lugar de importar `TransbankServices` directamente | Two call sites confirmed: `processPaidPayment` (createTransaction) and `processPaidWebpay` (commitTransaction). Response field `.token` must become `.gatewayRef`. |
| WIRE-02 | `pack.service.ts` usa `getPaymentGateway()` de la factory en lugar de importar `TransbankServices` directamente | Two call sites confirmed: `packPurchase` (createTransaction) and `processPaidWebpay` (commitTransaction). Response field `.token` must become `.gatewayRef`. Controller passes `.webpay` from service return — that key stays unchanged. |
| WIRE-03 | El controller reemplaza el string hardcodeado `"webpay"` con `process.env.PAYMENT_GATEWAY ?? "transbank"` al crear el registro de orden | Two hardcoded `"webpay"` occurrences found in `payment.ts`: `adResponse` (line 213) and `packResponse` (line 303). Both `OrderUtils.createAdOrder` calls need `payment_method` updated. |
| WIRE-04 | Se agrega `return` después de `ctx.redirect` en el flujo fallido de `packResponse` para evitar ejecución continua | Bug confirmed in `payment.ts` `packResponse` handler (line 272-273): `ctx.redirect(…)` called on failure but no `return`. Execution falls through to `documentDetails`, `generateFactoDocument`, and `createAdOrder` on a failed payment. |
</phase_requirements>

---

## Summary

Phase 2 is a pure refactor-and-bugfix phase. All four changes are surgical: two service files replace one import with one function call (and rename one response field), and one controller file receives two `payment_method` string fixes and one missing `return` statement. No new files need to be created. No packages need to be installed. No database schema or API routes change.

The abstraction layer (Phase 1) is fully in place. The barrel export at `apps/strapi/src/services/payment-gateway/index.ts` already exposes `getPaymentGateway` and the three types. Phase 2 callers import from there and remove the `TransbankServices` import. The only non-obvious change is the rename of `.token` to `.gatewayRef` in `processPaidPayment` (ad service) — where the controller result object key `webpay` wraps the response and the inner field name changes from `.token` to `.gatewayRef`. Both controllers access the returned object by key (`.webpay.token` in ad flow via the `token` variable passed into `processPaidWebpay`); the token variable in `adResponse` is a query-string value, not from the service response, so it is unaffected.

The missing-`return` bug (WIRE-04) in `packResponse` is the only latent bug risk. Without the fix, a payment rejection causes `ctx.redirect` to fire but execution continues: `documentDetails` is called with a potentially-null `userId`, `generateFactoDocument` runs with bad data, and `createAdOrder` is called with `result.webpay` which is `undefined` (causing a crash). The fix is a single `return` keyword.

**Primary recommendation:** Implement all four changes in a single wave with one commit per file changed. The changes are small enough (total diff under 20 lines) that no intermediate test is needed between files — run the full compile + test check after all changes land.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | (project tsconfig) | Type-safe refactor; compile check validates correctness | Already in use; `npx tsc --noEmit` is the primary correctness gate |
| Jest 29.7.0 + ts-jest 29.2.5 | (existing) | Unit tests for service behavior | Already configured; same pattern used in Phase 1 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none new) | — | — | No new packages required |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Calling `getPaymentGateway()` once per method | Caching the gateway instance in a module-level variable | Per-call is the established pattern from Phase 1 registry design; avoids stale instances in tests |

**Installation:** No new packages. All dependencies already present.

---

## Architecture Patterns

### What Gets Changed (Exact Diff Map)

#### `apps/strapi/src/api/payment/services/ad.service.ts`

**Remove** (line 3):
```typescript
import TransbankServices from "../../../services/transbank";
```

**Add** (top of file):
```typescript
import { getPaymentGateway } from "../../../services/payment-gateway";
```

**Change in `processPaidPayment`** (lines 291-297):
```typescript
// BEFORE
const transbankResponse =
  await TransbankServices.transbank.createTransaction(
    paymentDetails.amount,
    paymentDetails.buyOrder,
    paymentDetails.sessionId,
    returnUrl
  );

// AFTER
const transbankResponse =
  await getPaymentGateway().createTransaction(
    paymentDetails.amount,
    paymentDetails.buyOrder,
    paymentDetails.sessionId,
    returnUrl
  );
```

**Change in `processPaidPayment`** — the returned object still has `webpay: transbankResponse`. The controller accesses `result.webpay.token` downstream via the `token` query parameter (not from the service response), so the returned object shape is fine. However, `transbankResponse.token` no longer exists on `IGatewayInitResponse` — it is `.gatewayRef`. The controller does NOT read `.token` from the service's returned `webpay` object — the controller reads `ctx.query.token_ws` separately. So no change is needed in the returned object key names in `processPaidPayment`.

**Change in `processPaidWebpay`** (lines 321-323):
```typescript
// BEFORE
const wepbayResponse =
  await TransbankServices.transbank.commitTransaction(token);

// AFTER
const wepbayResponse =
  await getPaymentGateway().commitTransaction(token);
```

The parameter is called `token` (the query string value from Webpay callback), but it is passed as `gatewayRef` to the interface — this is correct, since for Transbank the values are identical. No rename needed here.

#### `apps/strapi/src/api/payment/services/pack.service.ts`

**Remove** (line 2):
```typescript
import TransbankServices from "../../../services/transbank";
```

**Add** (top of file):
```typescript
import { getPaymentGateway } from "../../../services/payment-gateway";
```

**Change in `packPurchase`** (lines 53-59):
```typescript
// BEFORE
const transbankResponse =
  await TransbankServices.transbank.createTransaction(
    amount,
    buyOrder,
    sessionId,
    returnUrl
  );

// AFTER
const transbankResponse =
  await getPaymentGateway().createTransaction(
    amount,
    buyOrder,
    sessionId,
    returnUrl
  );
```

The returned object `{ webpay: transbankResponse }` still works. The controller accesses `result.data.webpay` to pass back to the frontend (it calls `ctx.body = { data: result }`). The frontend uses the `url` field from `transbankResponse` to redirect to Webpay — `IGatewayInitResponse.url` is present, so no change needed.

**Change in `processPaidWebpay`** (lines 90-91):
```typescript
// BEFORE
const wepbayResponse =
  await TransbankServices.transbank.commitTransaction(token);

// AFTER
const wepbayResponse =
  await getPaymentGateway().commitTransaction(token);
```

#### `apps/strapi/src/api/payment/controllers/payment.ts`

**WIRE-03: Fix `payment_method` hardcoding — two occurrences**

In `adResponse` handler (line 213):
```typescript
// BEFORE
payment_method: "webpay",

// AFTER
payment_method: process.env.PAYMENT_GATEWAY ?? "transbank",
```

In `packResponse` handler (line 303):
```typescript
// BEFORE
payment_method: "webpay",

// AFTER
payment_method: process.env.PAYMENT_GATEWAY ?? "transbank",
```

**WIRE-04: Fix missing `return` in `packResponse` failure path**

The bug is on lines 271-273:
```typescript
// BEFORE (no return — execution falls through)
if (!result.success) {
  ctx.redirect(`${process.env.FRONTEND_URL}/packs/error`);
}

// AFTER
if (!result.success) {
  ctx.redirect(`${process.env.FRONTEND_URL}/packs/error`);
  return;
}
```

Without the `return`, on payment failure:
1. `ctx.redirect` fires (correct)
2. Execution continues to `documentDetails(result?.userId, result?.isInvoice)` — `result.userId` is undefined on failure
3. `generateFactoDocument` is called with bad/null `userDetails`
4. `createAdOrder` is called with `result.webpay.amount` — `result.webpay` is `undefined` on failure, causing a TypeError crash

### Anti-Patterns to Avoid

- **Keeping `import TransbankServices`:** The whole point is to remove this import. TypeScript will error if it remains unused, but verify the import is actually gone.
- **Reading `.token` from `IGatewayInitResponse`:** The normalized interface has `.gatewayRef`, not `.token`. Any code that accesses `.token` on the response from `createTransaction` will get a TypeScript error — use `.gatewayRef` instead.
- **Calling `getPaymentGateway()` at module load time (top-level constant):** The registry reads env vars at call time. Keep calls inside method bodies so tests can control env.
- **Fixing WIRE-04 with an `else` instead of `return`:** The current code structure after the `if (!result.success)` block does not have an `else` — everything after it runs regardless. The fix is `return` inside the `if`, not restructuring with `else`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gateway selection | A new env-var switch inside each service | `getPaymentGateway()` from `payment-gateway/index` | Already built and tested in Phase 1 — this is the whole point |
| Type-safe commit response | Re-type the Webpay response shape in services | `IGatewayCommitResponse.response?: any` | Callers access `.response.buy_order`, `.response.status` — these pass through unchanged; typing them gateway-specifically would break abstraction |

---

## Common Pitfalls

### Pitfall 1: Accidentally reading `.token` from `IGatewayInitResponse`

**What goes wrong:** After replacing the import, code tries to access `transbankResponse.token` (the old Transbank field). TypeScript will catch this — `IGatewayInitResponse` has `gatewayRef`, not `token`. But if the developer adds a `// @ts-ignore` or uses `as any`, the bug survives to runtime.

**Why it happens:** The local variable in `processPaidPayment` is named `transbankResponse` and the old `IWebpayInitResponse` had `.token`. The new type is `IGatewayInitResponse` with `.gatewayRef`.

**How to avoid:** After the import swap, run `npx tsc --noEmit` immediately. TypeScript will flag any `.token` accesses on the new type. Fix them to `.gatewayRef` — but note that in this codebase, neither `ad.service.ts` nor `pack.service.ts` actually reads `.token` from `transbankResponse` directly: in `processPaidPayment`, the returned object is `{ webpay: transbankResponse }` and the controller accesses `ctx.query.token_ws` for commit. In `packPurchase`, the returned `{ webpay: transbankResponse }` is forwarded to the frontend as-is. So `.token` vs `.gatewayRef` field naming in the returned object may affect frontend behavior — verify what the frontend reads. Based on code analysis, the frontend likely reads `.webpay.url` (for redirect to Webpay), not `.webpay.token` — so this is safe.

**Warning signs:** TypeScript compile errors referencing `.token` on `IGatewayInitResponse`.

### Pitfall 2: `packResponse` bug fix — using `else` instead of `return`

**What goes wrong:** Developer restructures the failure path as `if (!result.success) { redirect } else { ... all success logic ... }` instead of adding `return`. This works but makes the diff larger and potentially introduces a merge conflict or nesting issue.

**Why it happens:** The `else` approach seems equivalent, but it moves all success-path code into a nested block.

**How to avoid:** Add only `return` after `ctx.redirect`. Minimal diff, same behavior, easier to review.

**Warning signs:** The diff for WIRE-04 is more than 2 lines.

### Pitfall 3: Both `payment_method` occurrences must be fixed

**What goes wrong:** Only one of the two `"webpay"` hardcodings in `payment.ts` is fixed. The `adResponse` fix is done but `packResponse` (or vice versa) is missed.

**Why it happens:** The two handlers are far apart in the file (lines 213 and 303). A search for `"webpay"` would find both — but if the developer fixes by hand they may miss one.

**How to avoid:** After editing, run `grep -n '"webpay"' apps/strapi/src/api/payment/controllers/payment.ts` to confirm zero remaining occurrences.

**Warning signs:** `grep '"webpay"' payment.ts` returns any results.

### Pitfall 4: TypeScript import path depth

**What goes wrong:** The import path from `ad.service.ts` or `pack.service.ts` to `payment-gateway` uses wrong relative depth.

**Why it happens:** Services are at `src/api/payment/services/` — three levels deep. The payment-gateway module is at `src/services/payment-gateway/`. The correct relative path is `../../../services/payment-gateway`.

**How to avoid:** Verify the import compiles with `npx tsc --noEmit`. The path `../../../services/payment-gateway` is confirmed correct — the same depth used by the existing `import TransbankServices from "../../../services/transbank"` that is being replaced.

**Warning signs:** TypeScript error "Cannot find module" on the import.

---

## Code Examples

Verified patterns from direct codebase analysis:

### Complete import replacement (both service files)

```typescript
// Source: apps/strapi/src/services/payment-gateway/index.ts (Phase 1 output)
// Replace this:
import TransbankServices from "../../../services/transbank";

// With this:
import { getPaymentGateway } from "../../../services/payment-gateway";
```

### createTransaction call pattern

```typescript
// Source: derived from registry.ts + gateway.interface.ts (Phase 1)
// The call shape is identical — arguments are the same
const transbankResponse = await getPaymentGateway().createTransaction(
  paymentDetails.amount,
  paymentDetails.buyOrder,
  paymentDetails.sessionId,
  returnUrl
);
// transbankResponse: IGatewayInitResponse
// Fields: .success, .gatewayRef (was .token), .url, .error
```

### commitTransaction call pattern

```typescript
// Source: derived from registry.ts + gateway.interface.ts (Phase 1)
// token (Webpay callback query param) is the gatewayRef value for Transbank
const wepbayResponse = await getPaymentGateway().commitTransaction(token);
// wepbayResponse: IGatewayCommitResponse
// Fields: .success, .response (any — contains .status, .buy_order, .amount, etc.), .error
```

### payment_method fix (both occurrences)

```typescript
// Source: apps/strapi/src/api/payment/controllers/payment.ts (line 213 and 303)
// In OrderUtils.createAdOrder calls:
payment_method: process.env.PAYMENT_GATEWAY ?? "transbank",
```

### packResponse failure path fix

```typescript
// Source: apps/strapi/src/api/payment/controllers/payment.ts (lines 271-273)
if (!result.success) {
  ctx.redirect(`${process.env.FRONTEND_URL}/packs/error`);
  return;  // ADD THIS LINE — prevents fall-through to Facto + order creation
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `TransbankServices.transbank.createTransaction(...)` | `getPaymentGateway().createTransaction(...)` | Phase 2 | Call sites become gateway-agnostic; adding a second gateway requires zero service changes |
| `TransbankServices.transbank.commitTransaction(token)` | `getPaymentGateway().commitTransaction(token)` | Phase 2 | Same gateway-agnostic benefit |
| `payment_method: "webpay"` hardcoded string | `payment_method: process.env.PAYMENT_GATEWAY ?? "transbank"` | Phase 2 | Order records correctly reflect active gateway |
| `ctx.redirect` with fall-through on pack failure | `ctx.redirect` + `return` | Phase 2 | Prevents Facto + DB writes on failed payments |

---

## Open Questions

1. **Does the frontend read `.webpay.token` from `packCreate` response?**
   - What we know: `packCreate` returns `{ data: { success, message, webpay: transbankResponse } }`. After the swap, `transbankResponse` is `IGatewayInitResponse` with `.gatewayRef` instead of `.token`.
   - What's unclear: Whether the frontend JavaScript accesses `.token` on this response (it should only need `.url` to redirect to Webpay).
   - Recommendation: This is outside the Strapi scope (frontend is out of scope per REQUIREMENTS.md). The Webpay redirect URL is in `.url` which is unchanged. The `.token` field on `IGatewayInitResponse` is absent (field is `.gatewayRef`) — if the frontend reads `.webpay.token` it will get `undefined` instead of the token string. For the current Transbank integration, the frontend only needs the `url` to redirect the user to Webpay. Verify in the frontend if uncertain, but this is a pre-existing concern, not new to Phase 2.
   - Impact: LOW — the frontend redirect only needs `.url`, not `.token`. The gateway token/ref is only needed server-side for the commit step, which uses `ctx.query.token_ws` from Webpay's callback.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + ts-jest 29.2.5 |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && npx jest src/api/payment --no-coverage` |
| Full suite command | `cd apps/strapi && npx jest --no-coverage` |
| TypeScript check | `cd apps/strapi && npx tsc --noEmit` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WIRE-01 | `ad.service.ts` does not import `TransbankServices`; `processPaidPayment` and `processPaidWebpay` call `getPaymentGateway()` | unit | `cd apps/strapi && npx jest src/api/payment/services/ad --no-coverage` | ❌ Wave 0 |
| WIRE-02 | `pack.service.ts` does not import `TransbankServices`; `packPurchase` and `processPaidWebpay` call `getPaymentGateway()` | unit | `cd apps/strapi && npx jest src/api/payment/services/pack --no-coverage` | ❌ Wave 0 |
| WIRE-03 | `createAdOrder` receives `process.env.PAYMENT_GATEWAY ?? "transbank"` as `payment_method` (not `"webpay"`) | unit | `cd apps/strapi && npx jest src/api/payment/controllers --no-coverage` | ❌ Wave 0 |
| WIRE-04 | After `ctx.redirect` on pack failure, `documentDetails` and `createAdOrder` are NOT called | unit | `cd apps/strapi && npx jest src/api/payment/controllers --no-coverage` | ❌ Wave 0 |

### Test Strategy Notes

**Service tests (WIRE-01, WIRE-02):** Mock `getPaymentGateway` from the registry module. Verify:
- `getPaymentGateway` is called (not `TransbankServices`)
- `createTransaction` and `commitTransaction` are called with correct arguments
- Returned object shape is preserved

```typescript
// Pattern for service tests
jest.mock("../../../services/payment-gateway", () => ({
  getPaymentGateway: jest.fn().mockReturnValue({
    createTransaction: jest.fn().mockResolvedValue({
      success: true,
      gatewayRef: "ref-123",
      url: "https://webpay.cl",
    }),
    commitTransaction: jest.fn().mockResolvedValue({
      success: true,
      response: { status: "AUTHORIZED", buy_order: "order-123", amount: 1000 },
    }),
  }),
}));
```

**Controller tests (WIRE-03, WIRE-04):** Mock `packService.processPaidWebpay` to return failure. Verify `ctx.redirect` fires and downstream functions (mocked `documentDetails`, `createAdOrder`) are NOT called.

**TypeScript compile check is sufficient for WIRE-01/WIRE-02:** Once the import is swapped and `npx tsc --noEmit` passes, the contract is enforced by the type system. Unit tests add behavioral verification but the compile check is the primary correctness gate.

### Sampling Rate

- **Per task commit:** `cd apps/strapi && npx tsc --noEmit`
- **Per wave merge:** `cd apps/strapi && npx tsc --noEmit && npx jest --no-coverage`
- **Phase gate:** Full TypeScript compile green + full Jest suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `apps/strapi/src/api/payment/services/tests/ad.service.test.ts` — covers WIRE-01
- [ ] `apps/strapi/src/api/payment/services/tests/pack.service.test.ts` — covers WIRE-02
- [ ] `apps/strapi/src/api/payment/controllers/tests/payment.controller.test.ts` — covers WIRE-03, WIRE-04
- [ ] No framework install needed — Jest + ts-jest already configured

**Note:** Given the coarse granularity config and that all four changes are in existing files with no new modules, the planner may choose to fold Wave 0 tests into the same wave as the implementation changes, relying on TypeScript's compile check as the primary correctness gate for WIRE-01 and WIRE-02. WIRE-04 benefits most from an explicit test since it is a behavioral bug (not a type error).

---

## Sources

### Primary (HIGH confidence)

- Direct codebase analysis: `apps/strapi/src/api/payment/services/ad.service.ts` — exact import on line 3, `TransbankServices.transbank.createTransaction` on line 292, `commitTransaction` on line 322
- Direct codebase analysis: `apps/strapi/src/api/payment/services/pack.service.ts` — exact import on line 2, `TransbankServices.transbank.createTransaction` on line 54, `commitTransaction` on line 91
- Direct codebase analysis: `apps/strapi/src/api/payment/controllers/payment.ts` — `payment_method: "webpay"` on lines 213 and 303; missing `return` after `ctx.redirect` on line 272
- Direct codebase analysis: `apps/strapi/src/services/payment-gateway/index.ts` — barrel export confirming `getPaymentGateway` is available
- Direct codebase analysis: `apps/strapi/src/services/payment-gateway/types/gateway.interface.ts` — `IGatewayInitResponse` uses `gatewayRef` not `token`
- Direct codebase analysis: `.planning/STATE.md` — decisions confirming `ad.service.ts` and `pack.service.ts` are the only two call sites; `payment_method` bug and missing `return` documented
- Direct codebase analysis: `apps/strapi/jest.config.js` — test framework config

### Secondary (MEDIUM confidence)

- None required — all findings derived from direct codebase analysis

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; confirmed from codebase
- Architecture (what to change): HIGH — exact line numbers identified from codebase analysis
- Pitfalls: HIGH — all pitfalls derived from concrete code observations
- Test strategy: MEDIUM — test file structure is conventional but files don't exist yet; Wave 0 vs inline test decision left to planner

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable internal codebase, no external API dependency)
