# Webpay Oneclick Mall Research

**Researched:** 2026-03-20
**Confidence:** HIGH (source: actual `transbank-sdk` v5.0.0 source code in node_modules)
**SDK version:** `transbank-sdk@5.0.0` (already installed)

---

## Executive Summary

Webpay Oneclick Mall enables recurring card-on-file payments through Transbank. Unlike Webpay Plus (single transaction per redirect), Oneclick Mall registers a card once (inscription) and then allows server-initiated charges without further user interaction. This is the correct product for monthly PRO subscriptions.

The project already has `transbank-sdk@5.0.0` installed and working for Webpay Plus. The SDK includes full Oneclick Mall support via `Oneclick.MallInscription` and `Oneclick.MallTransaction` classes. No new dependencies are needed.

**Important context:** The current PRO subscription flow uses **Flow** (a different Chilean payment gateway). This research covers migrating/adding Webpay Oneclick Mall as an alternative or replacement.

---

## 1. Oneclick Mall Architecture

Oneclick Mall has two main components:

### 1.1 MallInscription (Card Registration)
Handles the one-time process of registering a user's card.

| Method | HTTP | Endpoint | Purpose |
|--------|------|----------|---------|
| `start(username, email, responseUrl)` | POST | `/rswebpaytransaction/api/oneclick/v1.2/inscriptions` | Initiates card enrollment, returns `token` + `urlWebpay` |
| `finish(token)` | PUT | `/rswebpaytransaction/api/oneclick/v1.2/inscriptions/{token}` | Finalizes enrollment after user returns, returns `tbkUser` + card info |
| `delete(tbkUser, username)` | DELETE | `/rswebpaytransaction/api/oneclick/v1.2/inscriptions` | Removes a registered card |

### 1.2 MallTransaction (Charging)
Handles actual payments against a registered card. No user interaction needed.

| Method | HTTP | Endpoint | Purpose |
|--------|------|----------|---------|
| `authorize(username, tbkUser, parentBuyOrder, details[])` | POST | `/rswebpaytransaction/api/oneclick/v1.2/transactions` | Charges the registered card |
| `status(buyOrder)` | GET | `/rswebpaytransaction/api/oneclick/v1.2/transactions/{buyOrder}` | Check transaction status |
| `refund(buyOrder, childCommerceCode, childBuyOrder, amount)` | POST | `/rswebpaytransaction/api/oneclick/v1.2/transactions/{buyOrder}/refunds` | Refund a charge |
| `capture(childCommerceCode, childBuyOrder, authorizationCode, captureAmount)` | PUT | `/rswebpaytransaction/api/oneclick/v1.2/transactions/capture` | Capture deferred transaction |

---

## 2. Complete Flow Diagrams

### 2.1 Inscription Flow (One-Time Card Registration)

```
USER                          FRONTEND (Nuxt)              BACKEND (Strapi)           TRANSBANK
 |                                |                            |                         |
 |-- clicks "Hazte PRO" -------->|                            |                         |
 |                                |-- Swal confirmation ------>|                         |
 |                                |                            |                         |
 |                                |-- POST /payments/pro ----->|                         |
 |                                |                            |-- inscription.start() ->|
 |                                |                            |   (username, email,     |
 |                                |                            |    responseUrl)          |
 |                                |                            |                         |
 |                                |                            |<-- { token, urlWebpay } |
 |                                |<-- { url, token } --------|                         |
 |                                |                            |                         |
 |<-- redirect to urlWebpay -----|                            |                         |
 |                                                             |                         |
 |-- enters card data on Transbank page ------------------------------------------>|
 |                                                             |                         |
 |<-- Transbank redirects to responseUrl (with TBK_TOKEN) -----|<------------------------|
 |                                |                            |                         |
 |                                |                            |-- inscription.finish() ->|
 |                                |                            |   (token)               |
 |                                |                            |                         |
 |                                |                            |<-- { response_code,     |
 |                                |                            |      tbk_user,          |
 |                                |                            |      authorization_code, |
 |                                |                            |      card_type,         |
 |                                |                            |      card_number }      |
 |                                |                            |                         |
 |                                |                            |-- STORE tbk_user in DB  |
 |                                |                            |   (user record)         |
 |                                |                            |                         |
 |<-- redirect to success page --|<-- redirect ----------------|                         |
```

### 2.2 Authorization Flow (Monthly Charge via Cron)

```
CRON JOB                         BACKEND (Strapi)           TRANSBANK
 |                                   |                         |
 |-- triggers at scheduled time ---->|                         |
 |                                   |                         |
 |   for each active subscription:   |                         |
 |                                   |-- transaction.authorize() -->|
 |                                   |   (username, tbkUser,       |
 |                                   |    parentBuyOrder,          |
 |                                   |    [TransactionDetail])     |
 |                                   |                              |
 |                                   |<-- { response_code: 0,      |
 |                                   |      authorization_code,     |
 |                                   |      buy_order,              |
 |                                   |      details: [{             |
 |                                   |        status, amount,       |
 |                                   |        authorization_code,   |
 |                                   |        payment_type_code,    |
 |                                   |        response_code         |
 |                                   |      }] }                    |
 |                                   |                              |
 |                                   |-- Create order record        |
 |                                   |-- Update subscription date   |
 |                                   |-- Send receipt email         |
```

### 2.3 Cancellation Flow

```
USER                          FRONTEND                    BACKEND (Strapi)           TRANSBANK
 |                                |                            |                         |
 |-- clicks "Cancelar PRO" ----->|                            |                         |
 |                                |-- DELETE /subscription --->|                         |
 |                                |                            |-- inscription.delete() ->|
 |                                |                            |   (tbkUser, username)   |
 |                                |                            |                         |
 |                                |                            |<-- (empty 204 response) |
 |                                |                            |                         |
 |                                |                            |-- Update user record:   |
 |                                |                            |   remove tbk_user,      |
 |                                |                            |   set pro = false       |
 |                                |                            |   (at period end)       |
 |                                |<-- success ----------------|                         |
```

---

## 3. SDK Usage in TypeScript

### 3.1 Configuration

```typescript
import { Oneclick, Options, Environment, TransactionDetail } from "transbank-sdk";

// Option A: Instance-based (recommended for this project -- matches existing pattern)
const oneclickInscription = new Oneclick.MallInscription(
  new Options(
    process.env.ONECLICK_COMMERCE_CODE,    // Mall parent code
    process.env.ONECLICK_API_KEY,          // Same API key as Webpay Plus in production
    process.env.WEBPAY_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Integration
  )
);

const oneclickTransaction = new Oneclick.MallTransaction(
  new Options(
    process.env.ONECLICK_COMMERCE_CODE,
    process.env.ONECLICK_API_KEY,
    process.env.WEBPAY_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Integration
  )
);

// Option B: Static configuration (global -- not recommended for multi-product)
Oneclick.configureForProduction(commerceCode, apiKey);
// Then instances use the global config automatically
```

### 3.2 Inscription Start

```typescript
// username: unique identifier for the user (max 40 chars, trimmed)
// email: user's email (max 100 chars)
// responseUrl: where Transbank redirects after card enrollment (max 255 chars)
const response = await oneclickInscription.start(
  `user-${user.documentId}`,  // username -- use Strapi documentId, NOT numeric id
  user.email,
  `${process.env.APP_URL}/api/payments/oneclick-return`
);
// response: { token: string, url_webpay: string }
```

### 3.3 Inscription Finish

```typescript
// Called when user returns to responseUrl with TBK_TOKEN query param
const result = await oneclickInscription.finish(token);
// result: {
//   response_code: number,      // 0 = success
//   tbk_user: string,           // THE KEY -- store this securely
//   authorization_code: string,
//   card_type: string,           // "Visa", "Mastercard", etc.
//   card_number: string          // masked, e.g., "XXXXXXXXXXXX1234"
// }
```

### 3.4 Authorization (Charging)

```typescript
const detail = new TransactionDetail(
  amount,                               // Amount in CLP (integer)
  process.env.ONECLICK_CHILD_COMMERCE_CODE,  // Child commerce code
  `sub-${subscriptionId}-${Date.now()}`      // Unique buy order (max 26 chars)
);

const result = await oneclickTransaction.authorize(
  `user-${user.documentId}`,   // Same username used in inscription
  user.tbkUser,                // The tbk_user from inscription.finish()
  `parent-${Date.now()}`,      // Parent buy order (max 26 chars)
  [detail]                     // Array of TransactionDetail
);
// result: {
//   buy_order: string,
//   card_detail: { card_number: string },
//   accounting_date: string,
//   transaction_date: string,
//   details: [{
//     amount: number,
//     status: string,
//     authorization_code: string,
//     payment_type_code: string,
//     response_code: number,     // 0 = approved
//     installments_number: number,
//     commerce_code: string,
//     buy_order: string
//   }]
// }
```

### 3.5 Delete Inscription

```typescript
await oneclickInscription.delete(
  user.tbkUser,                // tbk_user from inscription.finish()
  `user-${user.documentId}`   // Same username used in inscription
);
// Returns void (HTTP 204) on success, throws on error
```

### 3.6 Transaction Status

```typescript
const status = await oneclickTransaction.status(buyOrder);
// Returns transaction details including status
```

### 3.7 Refund

```typescript
const refund = await oneclickTransaction.refund(
  parentBuyOrder,
  childCommerceCode,
  childBuyOrder,
  amount  // CLP amount to refund
);
```

---

## 4. Integration vs Production Environment

### 4.1 Integration (Testing) Credentials

From the SDK source code (`IntegrationCommerceCodes` and `IntegrationApiKeys`):

| Parameter | Value |
|-----------|-------|
| **Mall Commerce Code (parent)** | `597055555541` |
| **Child Commerce Code 1** | `597055555542` |
| **Child Commerce Code 2** | `597055555543` |
| **API Key** | `579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C` |
| **Base URL** | `https://webpay3gint.transbank.cl` |

For deferred capture (NOT needed for subscriptions):

| Parameter | Value |
|-----------|-------|
| **Mall Deferred Commerce Code** | `597055555547` |
| **Child Deferred 1** | `597055555548` |
| **Child Deferred 2** | `597055555549` |

### 4.2 Production Credentials

| Parameter | Source |
|-----------|--------|
| **Mall Commerce Code (parent)** | Provided by Transbank after contracting Oneclick Mall |
| **Child Commerce Code** | Provided by Transbank (at least one required) |
| **API Key** | Generated after successful integration validation |
| **Base URL** | `https://webpay3g.transbank.cl` |

### 4.3 Quick Testing Setup

```typescript
// For testing only -- sets up integration credentials automatically
Oneclick.configureOneclickMallForTesting();
const inscription = new Oneclick.MallInscription();
const transaction = new Oneclick.MallTransaction();
```

### 4.4 Key Differences

| Aspect | Integration | Production |
|--------|-------------|------------|
| Commerce codes | Shared test codes (above) | Unique per merchant |
| API key | Shared test key (above) | Unique per merchant |
| Card numbers | Use test cards only | Real cards |
| Transactions | Not real, no actual charges | Real money |
| URL base | `webpay3gint.transbank.cl` | `webpay3g.transbank.cl` |
| Contracting | None required | Must contract Oneclick Mall with Transbank |

### 4.5 Test Cards for Integration

| Card Number | Behavior |
|-------------|----------|
| `4051 8856 0044 6623` | Always approved |
| `5186 0595 5959 0568` | Always approved (Mastercard) |
| RUT: `11.111.111-1` | Test RUT |
| Password: `123` | Test password |

**MEDIUM confidence on test cards** -- these are from training data and should be verified against current Transbank documentation.

---

## 5. Environment Variables Needed

Add to `.env.example` and `.env`:

```bash
# Oneclick Mall configuration
ONECLICK_COMMERCE_CODE=597055555541          # Integration default
ONECLICK_CHILD_COMMERCE_CODE=597055555542    # Integration default
ONECLICK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C  # Integration default

# Subscription configuration
PRO_MONTHLY_PRICE=9990                       # CLP amount (integer, no decimals)
```

**Note:** In production, the API key might be the same as `WEBPAY_API_KEY` if both products are under the same merchant. Verify with Transbank during contracting.

---

## 6. Validation Constraints (from SDK source)

The SDK validates these constraints before making API calls:

| Field | Max Length | Notes |
|-------|-----------|-------|
| `username` | 40 chars | Trimmed. Must be consistent across inscription and authorization |
| `email` | 100 chars | Used only in inscription.start() |
| `responseUrl` | 255 chars | URL Transbank redirects to after card enrollment |
| `token` | 64 chars | Returned by start(), used in finish() |
| `tbk_user` | 40 chars | Returned by finish(), stored for future charges |
| `buy_order` (parent) | 26 chars | Must be unique per authorization |
| `buy_order` (child) | 26 chars | Must be unique per child transaction |
| `commerce_code` | 12 chars | The child commerce code |
| `authorization_code` | 6 chars | Used for capture/refund |

**Critical:** The `username` parameter MUST be identical across `inscription.start()`, `transaction.authorize()`, and `inscription.delete()`. If the username changes, Transbank will reject the operation.

---

## 7. Security Considerations

### 7.1 PCI Compliance

Oneclick Mall is **PCI SAQ-A compliant** -- the user enters card data on Transbank's hosted page, never on your site. The only sensitive data you store is the `tbk_user` token (an opaque reference, not card data).

### 7.2 Token Storage

| Data | Where to Store | Encryption Required |
|------|----------------|---------------------|
| `tbk_user` | User record in Strapi (`oneclick_tbk_user` field) | Recommended but not strictly required (it's an opaque token, not card data) |
| `card_type` | User record (for UI display) | No |
| `card_number` | User record (masked, e.g., `XXXX1234`) | No (already masked by Transbank) |
| `username` | User record or derived from `documentId` | No |

### 7.3 Error Handling

The SDK throws `TransbankError` on API failures. Key error scenarios:

| Scenario | How to Detect | Action |
|----------|---------------|--------|
| User cancels inscription | `TBK_TOKEN` param absent or finish returns error | Redirect to error page |
| Card declined on authorize | `response_code !== 0` in details | Mark charge as failed, retry later |
| Inscription expired | finish() throws error | Ask user to re-inscribe |
| Network timeout | SDK default timeout: 60s | Retry with idempotent buy_order |
| Invalid tbk_user | authorize() throws | Card may have been deleted, re-inscribe |

### 7.4 Idempotency

- `buy_order` must be unique per transaction. Using the same `buy_order` twice will be rejected by Transbank.
- For cron retries, generate a new `buy_order` for each attempt, but track attempts in a subscription payment record.

---

## 8. Database Schema Additions

### 8.1 User Fields (extend `users-permissions` user)

```
oneclick_tbk_user: string (nullable)     -- The Transbank token for this user's card
oneclick_card_type: string (nullable)    -- "Visa", "Mastercard", etc.
oneclick_card_number: string (nullable)  -- Masked: "XXXXXXXXXXXX1234"
oneclick_username: string (nullable)     -- The username sent to Transbank
pro_status: enum [inactive, active, cancelled_pending]
pro_expires_at: datetime (nullable)      -- When current period ends
```

### 8.2 New Content Type: `subscription-payment`

```json
{
  "kind": "collectionType",
  "collectionName": "subscription_payments",
  "attributes": {
    "user": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
    "amount": { "type": "integer" },
    "parent_buy_order": { "type": "string" },
    "child_buy_order": { "type": "string" },
    "authorization_code": { "type": "string" },
    "response_code": { "type": "integer" },
    "status": { "type": "enumeration", "enum": ["pending", "approved", "rejected", "refunded"] },
    "payment_response": { "type": "json" },
    "period_start": { "type": "date" },
    "period_end": { "type": "date" },
    "charged_at": { "type": "datetime" }
  }
}
```

---

## 9. Cron Job Design for Monthly Charges

### 9.1 Following Existing Pattern

Based on the existing `ad-expiry.cron.ts` pattern, the subscription cron should:

1. Run daily (e.g., 5 AM, after existing crons at 1-4 AM)
2. Query users where `pro_status = 'active'` AND `pro_expires_at <= today`
3. For each: call `transaction.authorize()` with the stored `tbk_user`
4. On success: update `pro_expires_at` to +30 days, create `subscription-payment` record
5. On failure: retry up to 3 times over 3 days, then deactivate

### 9.2 Cron File

Following project naming convention: `subscription-charge.cron.ts`

### 9.3 Idempotency Guard

Same pattern as `ad-expiry.cron.ts` -- check for existing `subscription-payment` record for the current period before charging. This prevents double-charging if the cron runs twice.

### 9.4 Retry Strategy

| Day | Action |
|-----|--------|
| Day 0 (due date) | First charge attempt |
| Day 1 | Second attempt if Day 0 failed |
| Day 3 | Third attempt (final) |
| Day 4 | Deactivate PRO, notify user, delete inscription |

---

## 10. Mall Concept Explained

"Mall" in Transbank means a parent commerce with child commerces. Even for a single subscription product:

- **Parent commerce code**: Your main Oneclick Mall code (identifies your business)
- **Child commerce code**: Identifies the specific product/service being charged
- **Parent buy_order**: Groups child transactions under one authorization call
- **Child buy_order**: Identifies each individual line item

For a single-product subscription, you still need both parent and child codes. The `details` array in `authorize()` will always have exactly one `TransactionDetail` entry.

---

## 11. Comparison: Oneclick Mall vs Flow Subscriptions (Current)

| Aspect | Webpay Oneclick Mall | Flow Subscriptions (Current) |
|--------|---------------------|------------------------------|
| **Subscription management** | You manage everything (cron, retry, cancellation) | Flow manages billing cycle |
| **Card registration** | Separate inscription flow | Part of subscription creation |
| **Monthly charging** | Your cron calls `authorize()` | Flow auto-charges |
| **Retry on failure** | Your logic | Flow handles retries |
| **Plan management** | N/A (charge any amount) | Plans defined in Flow dashboard |
| **Webhooks** | None (poll or cron) | Flow sends webhooks |
| **Complexity** | Higher (you own the billing loop) | Lower (Flow owns the billing loop) |
| **Control** | Full control over timing and amounts | Limited to Flow's billing rules |
| **Market share (Chile)** | Dominant (Transbank) | Secondary |
| **User trust** | Higher (Webpay is well-known) | Good but less recognized |

### Recommendation

**Use Oneclick Mall for inscriptions + your own cron for charging.** This gives you:
1. Full control over subscription lifecycle
2. No dependency on Flow's subscription infrastructure
3. Consistent payment gateway (Transbank for both ads and subscriptions)
4. Higher user trust (Webpay brand recognition in Chile)

The trade-off is more code (cron job, retry logic), but this project already has well-established cron patterns.

---

## 12. Implementation Phases (Suggested)

### Phase 1: Inscription Flow
- Create `oneclick.config.ts` (following `transbank.config.ts` pattern)
- Create `oneclick.service.ts` with `startInscription()`, `finishInscription()`, `deleteInscription()`
- Add Strapi routes: `POST /payments/oneclick-start`, `GET /payments/oneclick-return`
- Add user fields: `oneclick_tbk_user`, `oneclick_card_type`, `oneclick_card_number`
- Frontend: "Hazte PRO" button -> Swal -> redirect to Transbank -> return handling

### Phase 2: Authorization + Cron
- Create `subscription-payment` content type
- Create `subscription-charge.cron.ts`
- Implement `authorize()` call with retry logic
- Implement idempotency guard (check for existing payment this period)
- Add `pro_status` and `pro_expires_at` to user

### Phase 3: Cancellation + Management
- Implement `deleteInscription()` endpoint
- Handle cancellation (set `pro_status = 'cancelled_pending'`, let period expire)
- Dashboard: show subscription status, card info, cancel button
- Handle edge cases: card expired, insufficient funds, etc.

---

## 13. Pitfalls and Warnings

### CRITICAL: Username Consistency
The `username` parameter must be **exactly the same string** across inscription.start(), transaction.authorize(), and inscription.delete(). Use a deterministic format like `user-{documentId}`. Never use mutable fields (name, email) as the username.

### CRITICAL: buy_order Uniqueness
Each `buy_order` (both parent and child) must be globally unique and max 26 characters. Use a format like `sub-{shortId}-{timestamp}` but watch the length.

### CRITICAL: Oneclick Requires Separate Commerce Code
Oneclick Mall uses a **different commerce code** than Webpay Plus. You cannot reuse `WEBPAY_COMMERCE_CODE`. You must contract Oneclick Mall separately with Transbank and receive new commerce codes.

### WARNING: No Webhooks
Unlike Flow, Transbank Oneclick Mall does not push payment notifications. You must poll or use cron jobs. If a charge fails, you only know when your cron runs.

### WARNING: Response URL Handling
When Transbank redirects back after inscription, the method is GET (not POST). The token comes as a query parameter `TBK_TOKEN`. If the user cancels, no token is sent -- handle this gracefully.

### WARNING: Integration Environment Limitations
Integration (sandbox) transactions always succeed with test cards. You cannot test failure scenarios in integration. Only production reveals real card decline behaviors.

---

## Sources

All findings are from direct source code analysis of:
- `transbank-sdk@5.0.0` installed at `/home/gabriel/Code/waldo-project/node_modules/transbank-sdk/`
- Key files examined:
  - `dist/es6/transbank/webpay/oneclick/index.js` (Oneclick namespace)
  - `dist/es6/transbank/webpay/oneclick/mall_inscription.js` (MallInscription class)
  - `dist/es6/transbank/webpay/oneclick/mall_transaction.js` (MallTransaction class)
  - `dist/es6/transbank/webpay/oneclick/requests/*.js` (API endpoints and payloads)
  - `dist/es6/transbank/common/integration_commerce_codes.js` (test credentials)
  - `dist/es6/transbank/common/integration_api_keys.js` (test API key)
  - `dist/es6/transbank/common/api_constants.js` (validation limits)
  - `dist/es6/transbank/webpay/common/environment.js` (URLs)
  - `dist/es6/transbank/webpay/common/transaction_detail.js` (TransactionDetail class)
  - `dist/es5/transbank/webpay/oneclick/*.d.ts` (TypeScript declarations)

Existing project files examined:
- `apps/strapi/src/services/transbank/` (current Webpay Plus integration)
- `apps/strapi/src/services/payment-gateway/` (gateway abstraction layer)
- `apps/strapi/src/api/payment/` (payment controller and services)
- `apps/strapi/src/services/flow/` (current Flow subscription integration)
- `apps/strapi/src/cron/ad-expiry.cron.ts` (cron pattern reference)

**Confidence note:** Test card numbers in Section 4.5 are from training data (MEDIUM confidence). The Transbank integration test credentials (commerce codes, API key, URLs) are HIGH confidence -- read directly from SDK source code.
