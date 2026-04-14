# Payment Flow

All payments in Waldo go through Strapi. The website and dashboard are stateless HTTP clients — they initiate payment requests and receive redirects, but all order creation, gateway communication, and state transitions happen server-side in Strapi.

> **Critical rule:** Order identity is always `order.documentId`. Never use a payment gateway reference (`buy_order`, `token_ws`, `TBK_*`, etc.) as an order identifier. Gateway data is stored inside the order record for audit purposes only — it is never used as a primary key or redirect parameter.

---

## Gateways

### Webpay Plus

One-shot payment for ad packs and featured reservations. Provided by Transbank. Enabled in all environments with test/production keys.

### Oneclick Mall

Recurring payment for PRO subscriptions. Provided by Transbank. **Must be contracted separately with Transbank for production** — Oneclick Mall is a distinct commercial agreement from Webpay Plus and is not enabled by default.

---

## Webpay Plus Flow (Packs and Featured)

1. User selects a pack or featured option on the website (`/anunciar` flow).
2. Website calls `POST /api/payments/checkout` with `{ pack, featured, adId }`.
3. Strapi creates an `Order` record with status `draft` and stores `buy_order`, `amount`, and related `Ad`/`Pack` references.
4. Strapi calls Transbank `init` — receives a `token` and redirect URL.
5. Strapi returns the redirect URL to the website.
6. Website redirects the browser to the Transbank payment page.
7. User completes payment at Transbank.
8. Transbank calls `GET /api/payments/webpay` (no auth header — `auth: false` route) with `token_ws` or `TBK_TOKEN`.
9. Strapi calls Transbank `commit` to confirm the transaction.
10. On success: Strapi finalizes the order (sets status `paid`), publishes the ad via `publishAd()`, links the reservation slot.
11. Strapi redirects the browser to `/pagar/gracias?order={order.documentId}`.
12. Website page calls `useOrderById(documentId)` to fetch and display the order confirmation.

On failure or user cancellation, Strapi redirects to `/pagar/gracias?order={order.documentId}` regardless — the page reads the order status from Strapi and shows the appropriate message.

---

## Oneclick Mall Flow (PRO Subscription)

1. User initiates a PRO subscription on the website (`/pro` flow).
2. Website calls `POST /api/payments/pro` with the user's billing data.
3. Strapi starts the Oneclick inscription — receives a redirect URL.
4. User completes card registration at Transbank.
5. Transbank calls `GET /api/payments/pro-response` (no auth header — `auth: false` route).
6. Strapi confirms the inscription, charges the first monthly payment, and creates a `SubscriptionPro` record linked to the user.
7. Strapi creates an `Order` record and a `SubscriptionPayment` record for the first charge.
8. Strapi redirects the browser to `/pro/gracias?order={order.documentId}`.

---

## PackType and FeaturedType

These two fields on the payment request body control how Strapi resolves the payment:

**PackType** — defines the publication slot source:

| Value | Meaning |
| --- | --- |
| `"free"` | Consume the user's available free reservation credits |
| `"paid"` | Consume the user's available paid reservation credits |
| `number` | ID of a specific pack to purchase (triggers Webpay flow) |

**FeaturedType** — defines whether the ad gets featured placement:

| Value | Meaning |
| --- | --- |
| `"free"` | Consume the user's available free featured credits |
| `true` | Activate featured and charge immediately (triggers Webpay flow) |
| `false` | No featured placement |

When both a pack purchase and featured activation are requested in the same checkout, Strapi combines them into a single Webpay transaction.

---

## Free Ad Flow

When the user has free reservation credits and no featured is requested, no Webpay transaction is created. The website calls `POST /api/payments/free-ad` and Strapi assigns the reservation slot directly, then publishes the ad.

---

## Monthly Billing (PRO Subscriptions)

The `subscriptionCron` runs monthly and charges active PRO subscribers via Oneclick Mall:

1. Queries all `SubscriptionPayment` records where `period_end` is in the past and subscription is active.
2. Calls `chargeUser(userId, periodEnd)` for each — `periodEnd` is the old `period_end` value; the new `period_end` is computed as the first of the next calendar month.
3. Creates a new `SubscriptionPayment` record for the new billing period.
4. Deduplicates cancelled users using a `Set<number>` to avoid double-charging.

Calendar billing is the source of truth — renewal always aligns to the first of the month regardless of the exact subscription start date.

---

## Audit Trail

Every order record stores the raw payment gateway data for audit and support purposes:

| Field | Source | Purpose |
| --- | --- | --- |
| `buy_order` | Webpay | Internal Transbank reference |
| `token_ws` | Webpay | Transaction token |
| `authorization_code` | Webpay | Bank authorization code |
| `card_number` | Webpay | Last 4 digits of the card |
| `transaction_date` | Webpay | Timestamp from Transbank |

These fields are **never** used to identify or look up an order. `order.documentId` is always the primary key.

---

## Key Source Files

| Purpose | Path |
| --- | --- |
| Payment controller and routes | `apps/strapi/src/api/payment/` |
| Order service and controller | `apps/strapi/src/api/order/` |
| SubscriptionPro service | `apps/strapi/src/api/subscription-pro/` |
| Website checkout pages | `apps/website/app/pages/pagar/` |
| Website PRO pages | `apps/website/app/pages/pro/` |
