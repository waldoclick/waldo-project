# Quick Task 5 Summary: Fix pagar/gracias redirect

**Date:** 2026-03-11
**Commit:** bdaaafa

## What was done

Fixed the Webpay checkout flow to redirect correctly to `/pagar/gracias?order=<documentId>`.

**Root causes:**
1. `checkout.service.ts processWebpayReturn` never created an order DB record — it just returned the Webpay internal `buy_order` string as `orderId`
2. `webpayResponse` controller built the redirect with both `?ad=<numericId>` and `?order=<buy_order_string>` — neither correct

**Fixes:**
- `checkout.service.ts`: Added `OrderUtils` import, added step 11 to create an order via `OrderUtils.createAdOrder` using the Webpay response data, added `orderDocumentId` to `ProcessResult` and return value
- `payment.ts`: Changed `webpayResponse` redirect to `?order=${result.orderDocumentId ?? result.orderId}` — no `?ad=`

## Files Changed

- `apps/strapi/src/api/payment/services/checkout.service.ts`
- `apps/strapi/src/api/payment/controllers/payment.ts`
