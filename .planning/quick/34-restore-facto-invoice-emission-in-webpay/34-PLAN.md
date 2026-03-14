---
phase: 34-restore-facto-invoice-emission-in-webpay
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/api/payment/controllers/payment.ts
  - apps/strapi/src/api/payment/services/checkout.service.ts
autonomous: true
requirements:
  - FACTO-WEBPAY-01
must_haves:
  truths:
    - "Webpay checkout encodes is_invoice in buy_order (6th segment)"
    - "processWebpayReturn decodes is_invoice from buy_order"
    - "Facto document is emitted (boleta or factura) after ad publication, before order creation"
    - "createAdOrder receives document_details, items, and document_response"
    - "Facto errors are non-fatal — checkout completes even if Facto fails"
  artifacts:
    - path: "apps/strapi/src/api/payment/controllers/payment.ts"
      provides: "is_invoice accepted in checkoutCreate body, encoded as 6th buy_order segment"
    - path: "apps/strapi/src/api/payment/services/checkout.service.ts"
      provides: "processWebpayReturn with full Facto emission pattern matching adResponse"
  key_links:
    - from: "checkoutCreate (controller)"
      to: "initiateCheckout (checkout.service.ts)"
      via: "is_invoice passed in payload, encoded in buyOrder string"
      pattern: "order-.*-.*-.*-.*-[01]"
    - from: "processWebpayReturn"
      to: "generateFactoDocument"
      via: "try/catch non-fatal call after publishAd, before createAdOrder"
      pattern: "generateFactoDocument"
    - from: "processWebpayReturn"
      to: "createAdOrder"
      via: "document_details, items, document_response passed to createAdOrder"
      pattern: "document_details.*document_response"
---

<objective>
Restore Facto invoice/ticket emission in the unified Webpay checkout flow (`POST /payments/checkout` → `GET /payments/webpay`).

Purpose: The legacy `adResponse` flow emits Facto documents correctly. The new `processWebpayReturn` flow is missing `is_invoice` propagation and all Facto calls, causing orders to be created without billing documents.

Output: `checkoutCreate` encodes `is_invoice` in buy_order; `processWebpayReturn` decodes it and runs the identical Facto wiring pattern from `adResponse` (lines 217–268 of payment.ts).
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Gold-standard pattern: adResponse in payment.ts lines 168–301 -->
<!-- Port the Facto block (lines 217–268) verbatim into processWebpayReturn -->
</context>

<interfaces>
<!-- Key types and contracts needed by the executor. No codebase exploration required. -->

From apps/strapi/src/api/payment/utils/order.utils.ts:
```typescript
interface CreateOrderParams {
  amount: number;
  buy_order: string;
  userId: number;
  is_invoice: boolean;
  payment_method: string;
  payment_response?: unknown;
  document_details?: unknown;
  adId?: number;
  items?: unknown[];
  document_response?: unknown;
}
```

From apps/strapi/src/api/payment/utils/general.utils.ts:
```typescript
// Already exported from general.utils.ts — import in checkout.service.ts
generalUtils.PaymentDetails(pack: PackType, featured: FeaturedType, userId: string, adId: string): Promise<{ items: TaxItem[] }>
generalUtils.generateFactoDocument({ isInvoice, userDetails, items }): Promise<unknown>
```

From apps/strapi/src/api/payment/utils/user.utils.ts:
```typescript
// Already exported — import in checkout.service.ts
documentDetails(userId: string | number, is_invoice: boolean): Promise<BillingDetails>
```

From apps/strapi/src/api/payment/types/payment.type.ts:
```typescript
export type PackType = "free" | "paid" | true | false | number;
export type FeaturedType = "free" | true | false;
```

checkout.service.ts current buy_order format (line 73):
```
"order-{userId}-{packId}-{adId}-{featured}"
// Parts: [0]=order [1]=userId [2]=packId [3]=adId [4]=featured
```

Target buy_order format after this task:
```
"order-{userId}-{packId}-{adId}-{featured}-{isInvoice}"
// Parts: [0]=order [1]=userId [2]=packId [3]=adId [4]=featured [5]=isInvoice
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add is_invoice to CheckoutPayload and encode in buy_order (controller + service initiateCheckout)</name>
  <files>
    apps/strapi/src/api/payment/controllers/payment.ts
    apps/strapi/src/api/payment/services/checkout.service.ts
  </files>
  <action>
**In `apps/strapi/src/api/payment/controllers/payment.ts` — `checkoutCreate` handler (lines 304–341):**

1. Extend the destructured type to include `is_invoice`:
   ```typescript
   // Before:
   const { data } = ctx.request.body as {
     data?: { pack?: string; ad_id?: number; featured?: boolean };
   };
   // After:
   const { data } = ctx.request.body as {
     data?: { pack?: string; ad_id?: number; featured?: boolean; is_invoice?: boolean };
   };
   ```

2. Pass `is_invoice` to `initiateCheckout`:
   ```typescript
   // Before:
   const result = await checkoutService.initiateCheckout(
     { pack: data.pack, ad_id: data.ad_id, featured: data.featured },
     userId
   );
   // After:
   const result = await checkoutService.initiateCheckout(
     { pack: data.pack, ad_id: data.ad_id, featured: data.featured, is_invoice: data.is_invoice },
     userId
   );
   ```

**In `apps/strapi/src/api/payment/services/checkout.service.ts` — `CheckoutPayload` interface and `initiateCheckout`:**

1. Add `is_invoice` to `CheckoutPayload` interface:
   ```typescript
   interface CheckoutPayload {
     pack: string;
     ad_id?: number;
     featured?: boolean;
     is_invoice?: boolean; // ADD THIS
   }
   ```

2. Encode `is_invoice` as 6th segment in `buyOrder` (currently line 73):
   ```typescript
   // Before:
   const buyOrder = `order-${userId}-${packData.id}-${adId}-${featuredFlag}`;
   // After:
   const invoiceFlag = payload.is_invoice ? 1 : 0;
   const buyOrder = `order-${userId}-${packData.id}-${adId}-${featuredFlag}-${invoiceFlag}`;
   ```
  </action>
  <verify>
    <automated>cd apps/strapi && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>TypeScript compiles without errors. buy_order now has 6 segments. is_invoice flows from frontend body through controller → initiateCheckout → Webpay transaction.</done>
</task>

<task type="auto">
  <name>Task 2: Decode is_invoice in processWebpayReturn and add full Facto emission</name>
  <files>
    apps/strapi/src/api/payment/services/checkout.service.ts
  </files>
  <action>
**In `apps/strapi/src/api/payment/services/checkout.service.ts` — top of file, add imports:**

```typescript
import { documentDetails } from "../utils/user.utils";
import generalUtils from "../utils/general.utils";
import { PackType, FeaturedType } from "../types/payment.type";
```

**In `processWebpayReturn` — Step 3: Parse buy_order (currently lines 117–124):**

Update the comment and add `is_invoice` parsing:
```typescript
// 3. Parse buy_order
// Format: "order-{userId}-{packId}-{adId}-{featured}-{isInvoice}"
const buyOrder = wepbayResponse.response.buy_order as string;
const parts = buyOrder.split("-");
const userId = parts[1];
const packId = Number(parts[2]);
const adId = Number(parts[3]); // 0 means no ad
const featured = parts[4] === "1";
const is_invoice = parts[5] === "1"; // ADD THIS
```

**After Step 10 (publishAd, currently line 219) and BEFORE Step 11 (createAdOrder, currently line 222), insert Facto emission block:**

```typescript
      // 10b. Fetch billing details and emit Facto document (non-fatal)
      let userDocumentDetails: Awaited<ReturnType<typeof documentDetails>> | undefined;
      let paymentItems: unknown[] = [];
      let documentResponse: unknown;

      try {
        userDocumentDetails = await documentDetails(userId, is_invoice);

        const paymentDetails = await generalUtils.PaymentDetails(
          packId as unknown as PackType,
          featured as unknown as FeaturedType,
          String(userId),
          String(adId)
        );
        paymentItems = paymentDetails.items;

        documentResponse = await generalUtils.generateFactoDocument({
          isInvoice: is_invoice,
          userDetails: userDocumentDetails,
          items: paymentItems,
        });

        logger.info("Documento Facto generado exitosamente (checkout)", {
          adId,
          isInvoice: is_invoice,
        });
      } catch (factoError) {
        logger.error("Error generando documento Facto (checkout) — pago no afectado", {
          adId,
          error: (factoError as { message?: string }).message,
        });
      }
```

**Update Step 11 `createAdOrder` call to pass Facto data:**

```typescript
        const orderResult = await OrderUtils.createAdOrder({
          amount: wepbayResponse.response?.amount ?? 0,
          buy_order: buyOrder,
          userId: Number(userId),
          is_invoice,                          // decoded from buy_order (was hardcoded false)
          payment_method: process.env.PAYMENT_GATEWAY ?? "transbank",
          payment_response: wepbayResponse.response,
          adId: adId > 0 ? adId : undefined,
          document_details: userDocumentDetails, // ADD
          items: paymentItems,                   // ADD
          document_response: documentResponse,   // ADD
        });
```
  </action>
  <verify>
    <automated>cd apps/strapi && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>
    TypeScript compiles without errors.
    `processWebpayReturn` decodes `is_invoice` from buy_order part[5].
    Facto block runs after `publishAd`, before `createAdOrder`, wrapped in non-fatal try/catch.
    `createAdOrder` receives `document_details`, `items`, and `document_response`.
    Pattern matches `adResponse` gold standard (payment.ts lines 217–268).
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. `cd apps/strapi && npx tsc --noEmit` — zero errors
2. Grep confirms 6-segment buy_order: `grep -n "invoiceFlag\|is_invoice" apps/strapi/src/api/payment/services/checkout.service.ts`
3. Grep confirms Facto imports added: `grep -n "documentDetails\|generalUtils" apps/strapi/src/api/payment/services/checkout.service.ts`
4. Grep confirms createAdOrder receives all 3 new fields: `grep -n "document_details\|document_response\|paymentItems" apps/strapi/src/api/payment/services/checkout.service.ts`
</verification>

<success_criteria>
- `checkoutCreate` body accepts `is_invoice?: boolean` and passes it to `initiateCheckout`
- `initiateCheckout` encodes it as the 6th segment of buy_order (`-0` or `-1`)
- `processWebpayReturn` decodes part[5] as `is_invoice`
- Facto document emission runs after `publishAd`, before `createAdOrder`, in a non-fatal try/catch
- `createAdOrder` passes `is_invoice`, `document_details`, `items`, `document_response`
- TypeScript strict-mode compiles with zero errors
</success_criteria>

<output>
After completion, create `.planning/quick/34-restore-facto-invoice-emission-in-webpay/34-SUMMARY.md`
</output>
