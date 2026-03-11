# Quick Task 5: Fix pagar/gracias redirect

## Problems

1. `webpayResponse` controller redirected to `/pagar/gracias?ad=59&order=order-3-1-59-1`:
   - `ad=59` — numeric ad id, should not be in URL
   - `order=order-3-1-59-1` — Webpay `buy_order` string, not an order `documentId`

2. `checkout.service.ts processWebpayReturn` never created an order record — it just returned `orderId: buyOrder` (the Webpay internal `buy_order` string).

## Fix

**`checkout.service.ts`:**
- Import `OrderUtils`
- After publishing the ad (step 10), call `OrderUtils.createAdOrder` with the Webpay response data
- Add `orderDocumentId` to `ProcessResult` interface and return it

**`payment.ts` `webpayResponse`:**
- Change redirect from `?ad=${result.adId}&order=${result.orderId}` to `?order=${result.orderDocumentId ?? result.orderId}`

## Files

- `apps/strapi/src/api/payment/services/checkout.service.ts`
- `apps/strapi/src/api/payment/controllers/payment.ts`
