# Requirements: v1.25 Unified Checkout

## Goal

Replace the broken `POST /payments/pack` endpoint (removed in v1.24) and the legacy `POST /payments/ad` paid-flow with a single unified pair:

- `POST /api/payments/checkout` — initiates payment with Webpay
- `GET /api/payments/webpay` — handles Webpay return and executes all post-payment logic

All paid flows (pack-only, pack+ad, featured+ad) must go through the new endpoints. The free flow (`POST /payments/free-ad`) is unchanged.

---

## Requirements

### CHK-01 — Checkout endpoint exists and accepts the unified payload

`POST /api/payments/checkout` accepts `{ pack?, ad_id?, featured? }` where at least one field must be present.

- `pack` — pack name string (required for any purchase that involves buying packs)
- `ad_id` — numeric ad id (optional; present when an ad is being published as part of the purchase)
- `featured` — boolean or featured type string (optional; present when a featured slot is being purchased)

The endpoint validates that the pack is a real pack (not `"free"`), resolves its price, and initiates a Webpay transaction. It does NOT create any reservations.

**Acceptance:** `POST /api/payments/checkout` with each valid combination returns a Webpay redirect URL with HTTP 200.

---

### CHK-02 — Checkout handles three purchase cases

Three valid input combinations are supported:

1. **Pack-only** (`{ pack }`): User buys a pack without publishing an ad now.
2. **Pack + ad** (`{ pack, ad_id }`): User buys a pack and immediately publishes an existing draft ad.
3. **Pack + featured** (`{ pack, ad_id, featured: true }`): User buys a pack with a featured slot and publishes the ad.

**Acceptance:** Each combination reaches Webpay; the buy_order / session_id encodes enough state to reconstruct the intent in the return handler.

---

### CHK-03 — Webpay return endpoint executes full post-payment logic

`GET /api/payments/webpay` is called by Webpay after the user completes (or cancels) payment.

On **successful** payment it must:

1. Commit the Webpay transaction.
2. Read the pack — obtain `total_ads`, `total_days`, `price`, `total_features`.
3. Create `total_ads` paid ad-reservations for the user (`price != "0"`).
4. If `total_features > 0` — create `total_features` featured reservations for the user.
5. If `ad_id` is present — link one of the new ad-reservations to the ad and set `draft: false`.
6. If `featured` is present — link one of the new featured reservations to the ad.
7. Redirect to `/pagar/gracias`.

On **failed / cancelled** payment — redirect to `/pagar/error`.

**Acceptance:** End-to-end: paying with a test card creates the correct number of reservations, publishes the ad if `ad_id` was present, and redirects to `/pagar/gracias`.

---

### CHK-04 — Webpay return endpoint replaces `payments/ad-response`

The existing `GET /api/payments/ad-response` handler (`adResponse` in `payment.ts`) is superseded by `GET /api/payments/webpay`. The new handler covers all previously separate cases.

**Acceptance:** `GET /api/payments/webpay` is the sole Webpay return URL configured in Transbank; `ad-response` route is removed or left unreachable (no handler).

---

### CHK-05 — New service encapsulates all new checkout logic

A new `checkout.service.ts` in `apps/strapi/src/api/payment/services/` encapsulates:

- `initiateCheckout(ctx)` — build Webpay init payload and return redirect URL
- `processWebpayReturn(ctx)` — commit transaction, create reservations, publish ad

It must NOT modify `ad.service.ts`, `free-ad.service.ts`, or `pack.service.ts`.

**Acceptance:** `tsc --noEmit` exits 0; zero `any` in the new service file.

---

### CHK-06 — `CheckoutDefault.vue` uses the new endpoint for all paid flows

`CheckoutDefault.vue` calls `POST /api/payments/checkout` for both the pack-only branch and the pack+ad branch. The separate `payments/pack` and `payments/ad` calls are removed.

**Acceptance:** Both branches in `CheckoutDefault.vue` point to `payments/checkout`; `nuxt typecheck` exits 0.

---

### CHK-07 — `recaptcha.ts` middleware updated to cover the new endpoint

The hardcoded `/api/payments/pack` path in `apps/strapi/src/middlewares/recaptcha.ts` is replaced with `/api/payments/checkout`.

**Acceptance:** reCAPTCHA verification fires on `POST /api/payments/checkout` and not on the removed `payments/pack` route.

---

### CHK-08 — `nuxt typecheck` passes with zero errors after all frontend changes

All website changes introduced in this milestone compile cleanly.

**Acceptance:** `nuxt typecheck` exits 0 in `apps/website`.

---

## Out of Scope

- `POST /api/payments/free-ad` — untouched
- `ad.service.ts` — untouched
- `free-ad.service.ts` — untouched
- `pack.service.ts` — untouched (dead reference code; left in place)
- Dashboard changes — none required
- Unit tests — deferred to testing milestone

---

## File Impact Summary

| File | Change |
|------|--------|
| `apps/strapi/src/api/payment/services/checkout.service.ts` | **NEW** |
| `apps/strapi/src/api/payment/controllers/payment.ts` | Add `checkoutCreate` + `webpayResponse` handlers |
| `apps/strapi/src/api/payment/routes/payment.ts` | Add `POST /checkout` + `GET /webpay` routes |
| `apps/strapi/src/middlewares/recaptcha.ts` | Replace `/payments/pack` → `/payments/checkout` |
| `apps/website/app/components/CheckoutDefault.vue` | Replace both payment calls with `payments/checkout` |
