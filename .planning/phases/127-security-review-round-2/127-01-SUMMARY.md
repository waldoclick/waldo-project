---
phase: 127-security-review-round-2
plan: 01
subsystem: strapi-payment
tags: [security, payment, idempotency, amount-validation, ad-ownership, fail-closed]
dependency_graph:
  requires: []
  provides: [SEC2-PAYMENT]
  affects: [checkout.service.ts, pack.service.ts, order/schema.json]
tech_stack:
  added: []
  patterns: [fail-closed-env-var, idempotency-lookup, amount-revalidation, ownership-guard]
key_files:
  created:
    - apps/strapi/tests/api/payment/services/checkout.service.test.ts
  modified:
    - apps/strapi/src/api/payment/services/checkout.service.ts
    - apps/strapi/src/api/payment/services/pack.service.ts
    - apps/strapi/src/api/order/content-types/order/schema.json
decisions:
  - "Fail-closed applied to BOTH initiation and commit paths — || 10000 fallback removed everywhere in checkout.service.ts and pack.service.ts"
  - "Idempotency guard placed before featuredPrice check so replays return early even when AD_FEATURED_PRICE is unset"
  - "Ad ownership check runs after amount validation — amount mismatch exits first (cheaper check)"
  - "buy_order unique:true in schema.json provides DB-level duplicate protection as defense-in-depth"
metrics:
  duration: ~30 min
  completed: 2026-06-12T18:38:00Z
  tasks_completed: 2
  files_modified: 4
---

# Phase 127 Plan 01: Payment Integrity (SEC2-PAYMENT) Summary

Closes SEC2-PAYMENT: Webpay return handler in `checkout.service.ts` now validates amount, rejects replays, verifies ad ownership, and fails closed on missing `AD_FEATURED_PRICE`.

## Tasks Completed

### Task 1 — Write failing regression tests (RED)

**Commit:** `4e6527a1`

Created `apps/strapi/tests/api/payment/services/checkout.service.test.ts` with 4 failing test cases covering the security gaps:

| Test | Scenario | What it asserts |
|------|----------|-----------------|
| SEC2-PAYMENT Test 1 | Amount mismatch | `success: false`, `publishAd` not called |
| SEC2-PAYMENT Test 2 | Replay/idempotency | Short-circuit to existing `orderDocumentId`, no second grant |
| SEC2-PAYMENT Test 3 | Ad ownership mismatch | `success: false`, `publishAd` not called |
| SEC2-PAYMENT Test 4 | Missing `AD_FEATURED_PRICE` | Throws or returns `success: false`, no 10000 fallback |

All 4 tests were RED (failing) against the pre-fix code.

### Task 2 — Implement fixes (GREEN)

**Commit:** `95999c1e`

All 4 security guards implemented and all tests pass:

1. **Schema** (`order/schema.json`): Added `"unique": true` to `buy_order` attribute for DB-level replay protection.

2. **Idempotency** (`checkout.service.ts`): After parsing `buy_order` and BEFORE any benefit grant, performs a `strapi.db.query("api::order.order").findOne({ where: { buy_order: buyOrder } })`. Returns `{ success: true, orderDocumentId: existingOrder.documentId }` on duplicate — no second benefit granted.

3. **Fail-closed price** (`checkout.service.ts`, `pack.service.ts`): All occurrences of `Number(process.env.AD_FEATURED_PRICE) || 10000` removed. Both the initiation and commit paths now throw if `AD_FEATURED_PRICE` is unset.

4. **Amount validation** (`checkout.service.ts`): After `AUTHORIZED` + idempotency check, recomputes expected amount from pack DB lookup + featured price. Rejects `actualAmount !== expectedAmount` with `{ success: false, message: "Payment amount mismatch" }`. Covers both the `packId === 0` (featured-only) and normal pack paths.

5. **Ad ownership** (`checkout.service.ts`): When `adId > 0`, loads ad with `populate: { user: true }` and asserts `String(ad.user.id) === String(userId)`. Mirrors `free-ad.service.ts` ownership pattern.

6. **pack.service.ts amount validation**: Same amount-validation block added at the `AUTHORIZED` branch in `processPaidWebpay`.

## Acceptance Criteria Verified

```
OK: "unique": true present in schema.json
OK: "Payment amount mismatch" in checkout.service.ts
OK: "AD_FEATURED_PRICE env var is not set" in checkout.service.ts
OK: "Ad ownership verification failed" in checkout.service.ts
OK: buy_order: buyOrder idempotency lookup present
OK: No remaining AD_FEATURED_PRICE) || 10000 anywhere in checkout.service.ts or pack.service.ts
OK: All 4 regression tests pass (exit 0)
```

## Deviations from Plan

### Auto-fixed (Rule 2): Fail-closed applied to initiation path

The plan specified fail-closed at commit time. During implementation it was discovered that `initiateCheckout` also used `|| 10000` at 3 locations (lines 52, 76, 123) — the "free" pack branch, the "paid" pack branch, and the featured-add-on. These create a Webpay transaction for the wrong amount if `AD_FEATURED_PRICE` is unset, and that transaction would then fail amount validation on return. The cleaner fix is to fail-closed at both points:

- `initiateCheckout`: throws `"AD_FEATURED_PRICE env var is not set — refusing to initiate payment"`
- `processWebpayReturn`: throws `"AD_FEATURED_PRICE env var is not set — refusing to process payment"`

This goes slightly beyond the plan spec (commit-path only) but is the correct security posture — a misconfigured `AD_FEATURED_PRICE` is surfaced at the earliest possible point.

## Open Questions / Known Gaps

**Transaction atomicity (from RESEARCH Open Question 1):** The idempotency lookup + benefit grant + order creation are NOT wrapped in a Knex transaction. The unique constraint on `buy_order` provides DB-level protection against concurrent duplicates, but there is a small window where two concurrent requests both pass the idempotency check before either creates the order record. A full Knex transaction wrapping all three steps is the recommended follow-up.

## Manual Pre-Deploy Checks

### 1. Duplicate buy_order check (REQUIRED before deploy)

Run this SQL before deploying the `unique:true` constraint if the database has been in production:

```sql
SELECT buy_order, COUNT(*) 
FROM orders 
GROUP BY buy_order 
HAVING COUNT(*) > 1;
```

If any rows are returned, resolve duplicates before deploying. Strapi will fail to start if `buy_order` has duplicates and the unique constraint is applied.

### 2. AD_FEATURED_PRICE env var (REQUIRED)

Ensure `AD_FEATURED_PRICE` is set in all environments (staging + production). The service will now throw rather than silently using 10000.

### 3. Integration test (manual, optional)

End-to-end verification: complete a Webpay checkout, then replay the return URL. The second request should return `{ success: true, message: "Already processed", orderDocumentId: "<existing-id>" }` with no new reservations or published ads created.

## Self-Check: PASSED

- `apps/strapi/tests/api/payment/services/checkout.service.test.ts` — exists, 4 tests
- Commit `4e6527a1` exists (Task 1 RED)
- Commit `95999c1e` exists (Task 2 GREEN)
- All 4 tests pass against current code
