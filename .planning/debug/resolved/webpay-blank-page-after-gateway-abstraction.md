---
status: resolved
trigger: "After Phase 2 rewired ad.service.ts and pack.service.ts to use getPaymentGateway() instead of TransbankServices directly, WebPay redirects to https://webpay3gint.transbank.cl/webpayserver/init_transaction.cgi but shows a blank page."
created: 2026-03-04T00:00:00Z
updated: 2026-03-04T00:01:00Z
---

## Current Focus

hypothesis: CONFIRMED — frontend handleRedirect() reads response.token but API now returns response.gatewayRef, causing token_ws to be undefined
test: Read both frontend components and the full API response chain
expecting: Fix by updating frontend to read response.gatewayRef instead of response.token
next_action: Await human verification that the WebPay redirect now shows the payment form

## Symptoms

expected: User is redirected to Transbank WebPay and sees the payment form
actual: The redirect reaches the Transbank URL but the page is completely blank
errors: No server-side errors visible in logs
reproduction: Trigger any payment flow (ad or pack) — redirect goes to Transbank but blank page
started: After Phase 2 changes (call site wiring). Was working before.

## Eliminated

- hypothesis: TransbankAdapter incorrectly maps token to gatewayRef
  evidence: transbank.adapter.ts line 29 correctly does `gatewayRef: result.token` - the adapter is fine
  timestamp: 2026-03-04T00:01:00Z

- hypothesis: Server-side services fail to forward the response correctly
  evidence: Both ad.service.ts and pack.service.ts return `webpay: transbankResponse` which contains {success, gatewayRef, url}. The controller returns `{ data: payment }` where payment.webpay is the full IGatewayInitResponse. Server side is fine.
  timestamp: 2026-03-04T00:01:00Z

## Evidence

- timestamp: 2026-03-04T00:01:00Z
  checked: IGatewayInitResponse in types/gateway.interface.ts
  found: Interface defines { success, gatewayRef?, url?, error? } — field is named "gatewayRef" not "token"
  implication: All API responses use the name "gatewayRef" for what was previously "token"

- timestamp: 2026-03-04T00:01:00Z
  checked: TransbankAdapter.createTransaction() return value
  found: Returns { success: result.success, gatewayRef: result.token, url: result.url, error: result.error } — correctly maps old .token to new .gatewayRef field name
  implication: The adapter is correct; the token value is preserved under the new name

- timestamp: 2026-03-04T00:01:00Z
  checked: ad.service.ts processPaidPayment() return value
  found: Returns { success: true, webpay: transbankResponse } where transbankResponse is IGatewayInitResponse with .gatewayRef
  implication: Frontend receives payment.webpay.gatewayRef (not payment.webpay.token)

- timestamp: 2026-03-04T00:01:00Z
  checked: pack.service.ts packPurchase() return value
  found: Returns { success: true, webpay: transbankResponse } same pattern as ad.service
  implication: Same problem for pack flow

- timestamp: 2026-03-04T00:01:00Z
  checked: BarResume.vue handleRedirect() — line 113
  found: tokenField.value = response.token — reads .token which is UNDEFINED on new interface
  implication: token_ws POST field is sent as empty string/undefined → WebPay shows blank page

- timestamp: 2026-03-04T00:01:00Z
  checked: FormPack.vue handleRedirect() — line 103
  found: tokenField.value = response.token — same bug as BarResume.vue
  implication: Both ad and pack flows are broken for the same reason

## Resolution

root_cause: The Phase 1 abstraction layer renamed the token field from "token" to "gatewayRef" in IGatewayInitResponse. The frontend components (BarResume.vue and FormPack.vue) were never updated and still read response.token, which is undefined on the new interface. The WebPay redirect form posts token_ws=undefined (empty), causing the blank page at Transbank.
fix: Updated handleRedirect() in BarResume.vue (line 113) and FormPack.vue (line 103) to read response.gatewayRef instead of response.token
verification: Human confirmed — WebPay page now loads correctly with the payment form after the fix
files_changed:
  - apps/website/app/components/BarResume.vue
  - apps/website/app/components/FormPack.vue
