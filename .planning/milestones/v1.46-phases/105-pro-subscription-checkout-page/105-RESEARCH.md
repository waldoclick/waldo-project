# Phase 105: PRO Subscription Checkout Page - Research

**Researched:** 2026-03-21
**Domain:** Nuxt 4 checkout page replication + Strapi PRO payment flow + Facto document generation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Page structure and URL**
- D-01: New page at `/pro/pagar` — replicated from `/pagar/index.vue` pattern
- D-02: Only two sections visible: boleta/factura (open by default) and pasarela de pagos (Oneclick only, no selector)
- D-03: No ad preview, no packs, no featured, no resumen de compra — only title + text contextual PRO, boleta/factura, and gateway
- D-04: Success page at `/pro/pagar/gracias` — replicated from `/pagar/gracias.vue` with `ResumePro` (replicated from `ResumeOrder`)

**Component naming — strict replication**
- D-05: Every component is a replica of its `/pagar` counterpart with `Pro` suffix and `--pro` BEM modifier:
  - `CheckoutDefault` → `CheckoutPro` (class: `checkout checkout--pro`)
  - `FormCheckout` → `FormPro` (class: `form form--pro`)
  - `BarCheckout` → `BarPro` (class: `bar bar--pro`)
  - `PaymentInvoice` → `PaymentProInvoice` (class: `payment payment--pro-invoice`)
  - `PaymentGateway` → `PaymentProGateway` (class: `payment payment--pro-gateway`)
  - `ResumeOrder` → `ResumePro` (class: `resume resume--pro`) — NOTE: `ResumePro.vue` already exists at `/pro/gracias`, must be repurposed or renamed
- D-06: No new SCSS files — add `--pro` modifiers to existing `_checkout.scss`, `_form.scss`, `_bar.scss`, `_payment.scss`, `_resume.scss`
- D-07: No new colors, no new design patterns — exact visual replication

**Navigation flow**
- D-08: `MemoPro.vue` "Hazte PRO" button now navigates to `/pro/pagar` instead of calling `POST /payments/pro` directly
- D-09: Flow: MemoPro → `/pro/pagar` → user picks boleta/factura → click pagar → `POST /payments/pro` → Transbank redirect → `/pro/pagar/gracias?order={documentId}`

**Backend — order + Facto document**
- D-10: `POST /payments/pro` now creates an order record (like `OrderUtils.createAdOrder()` but for PRO) with `is_invoice` flag from frontend
- D-11: Order includes Facto-generated boleta or factura depending on user choice
- D-12: The monthly charge cron also creates an order + Facto document per charge (boleta by default since user preference is not stored — or reuse last preference)
- D-13: Success redirect uses `order.documentId` — same identity rule as ad payments
- D-14: Facto service already exists and handles both boleta and factura — reuse as-is

### Claude's Discretion
- Technical implementation of how `is_invoice` preference is passed to `POST /payments/pro`
- Whether cron uses boleta by default or stores/reuses user's last invoice preference
- Exact task breakdown and plan structure
- How to handle existing `ResumePro.vue` naming conflict (rename old one or merge)

### Deferred Ideas (OUT OF SCOPE)
- Email receipt for monthly PRO charges — already listed as out of scope in REQUIREMENTS.md
- Storing user's boleta/factura preference for cron reuse — could be added later
</user_constraints>

---

## Summary

Phase 105 adds a dedicated checkout page (`/pro/pagar`) to the PRO subscription flow. Currently `MemoPro.vue` calls `POST /payments/pro` directly (which starts a Transbank Oneclick inscription) without collecting boleta/factura preference. This phase inserts an intermediate page before the Transbank redirect, replicating the ad checkout UI pattern with only two accordion sections (invoice + gateway).

The backend changes are equally important: `proCreate` must accept `is_invoice` from the request body, and `proResponse` must create an order record + Facto document after successful inscription, then redirect with `order.documentId` (not the old `/pro/gracias`). The monthly charge cron (`SubscriptionChargeService`) must also create an order + Facto document per successful charge.

The most complex naming issue: `ResumePro.vue` already exists and currently shows card enrollment data on `/pro/gracias`. The new `ResumePro` (D-05) should show payment receipt data. These are two different concerns — the existing component must either be renamed (`ResumeProCard`) or merged/repurposed. Because D-05 says "replicated from `ResumeOrder`", the cleanest path is to rename the existing component and create a new `ResumePro` that mirrors `ResumeOrder`.

**Primary recommendation:** Treat this as six discrete work streams: (1) MemoPro navigation change, (2) new frontend pages + components, (3) SCSS modifiers, (4) `proCreate` + `proResponse` backend changes, (5) cron order+Facto creation, (6) rename conflict resolution.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt 4 | 4.1.3 | SSR framework | Project standard |
| Vue 3 Composition API | — | Component authoring (`<script setup>`) | Project standard |
| TypeScript strict | — | Type safety | Project standard (`typeCheck: true`) |
| vee-validate `Form` | — | Form validation wrapper | Used in `FormCheckout.vue` — must match |
| `@nuxtjs/strapi` | v2 | API calls via `useApiClient()` | Project standard |
| `lucide-vue-next` | — | Icons (`CheckCircle`, `ChevronDownIcon`) | Used in all existing payment components |
| `useAsyncData` | — | SSR-safe data fetching in pages | Project rule — sole trigger in pages |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useSweetAlert2` / Swal | — | Confirmation dialogs | Same pattern as `CheckoutDefault.vue` for pay confirmation |
| `useOrderById` | composable | Fetch order from Strapi by documentId | Reused directly in `/pro/pagar/gracias` |
| `useStrapiAuth` / `useStrapiUser` | — | User data access | Same as `MemoPro.vue` |
| `generalUtils.generateFactoDocument` | — | Facto boleta/factura creation | Reused directly from existing `general.utils.ts` |
| `documentDetails` (user.utils.ts) | — | Billing data extraction | Reused directly |
| `OrderUtils.createAdOrder` | — | Order persistence | Replicated for PRO order creation |

**Installation:** No new packages required — all dependencies already present.

---

## Architecture Patterns

### Recommended Project Structure

```
apps/website/app/
├── pages/
│   └── pro/
│       ├── pagar/
│       │   ├── index.vue          # New: /pro/pagar checkout page
│       │   └── gracias.vue        # New: /pro/pagar/gracias success page
│       ├── gracias.vue            # Existing: updated to use renamed ResumeProCard
│       └── error.vue              # Unchanged
├── components/
│   ├── CheckoutPro.vue            # New: replica of CheckoutDefault
│   ├── FormPro.vue                # New: replica of FormCheckout (2 sections only)
│   ├── BarPro.vue                 # New: replica of BarCheckout
│   ├── PaymentProInvoice.vue      # New: replica of PaymentInvoice (no adStore)
│   ├── PaymentProGateway.vue      # New: replica of PaymentGateway (Oneclick label)
│   ├── ResumePro.vue              # New: replica of ResumeOrder (payment receipt)
│   └── ResumeProCard.vue          # Renamed from ResumePro.vue (card enrollment display)
└── scss/components/
    ├── _checkout.scss             # Add --pro modifier
    ├── _form.scss                 # Add --pro modifier
    ├── _bar.scss                  # Add --pro modifier
    ├── _payment.scss              # Add --pro-invoice and --pro-gateway modifiers
    └── _resume.scss               # resume--pro already exists in multi-selector block

apps/strapi/src/api/payment/
├── controllers/payment.ts         # proCreate: add is_invoice + order; proResponse: create order+Facto, redirect to /pro/pagar/gracias
└── cron/subscription-charge.cron.ts # chargeUser: add order + Facto document on success
```

### Pattern 1: Page replication (Nuxt page composition only)
**What:** Pages contain zero HTML — they import and arrange components only.
**When to use:** Every new page.
**Example:**
```vue
<!-- apps/website/app/pages/pro/pagar/index.vue -->
<template>
  <div class="page">
    <HeaderDefault />
    <CheckoutPro />
  </div>
</template>

<script setup lang="ts">
import HeaderDefault from "@/components/HeaderDefault.vue";
import CheckoutPro from "@/components/CheckoutPro.vue";

definePageMeta({ middleware: "auth" });
useSeoMeta({ robots: "noindex, nofollow" });
</script>
```

### Pattern 2: Checkout wrapper (CheckoutPro)
**What:** Section element with `checkout checkout--pro` classes. Contains `<ClientOnly>` wrapping `FormPro`. Handles the pay button click: Swal confirm → POST `/payments/pro` with `is_invoice` → redirect to Transbank URL.
**When to use:** Mirrors `CheckoutDefault.vue` exactly, replacing ad-store references with a local `isInvoice` reactive ref.

**Key difference from `CheckoutDefault`:** Instead of reading `is_invoice` from `adStore`, `CheckoutPro` owns a local `isInvoice` ref that `FormPro` emits back up, then passes it to the API call.

```typescript
// Redirect pattern for Oneclick (GET redirect, not POST form submit)
// Oneclick uses GET with TBK_TOKEN in URL — different from Webpay Plus (POST with token_ws)
window.location.href = `${response.data.urlWebpay}?TBK_TOKEN=${response.data.token}`;
```

### Pattern 3: FormPro (stripped accordion)
**What:** `Form` from vee-validate with class `form form--pro`. Two accordion fields only: boleta/factura (open by default) + gateway. No ad preview, no featured, no method selector. Emits `is_invoice` to parent via `update:isInvoice` event or via form submit values.
**When to use:** Exact replica of `FormCheckout.vue` sections, removing the 3 ad-specific sections.

```typescript
// open state: invoice starts open, gateway starts closed
const open = reactive({
  invoice: true,   // open by default per D-02
  gateway: false,
});
```

### Pattern 4: PaymentProInvoice (no adStore dependency)
**What:** Replica of `PaymentInvoice.vue` but instead of reading/writing `adStore.is_invoice`, it emits `update:modelValue` to the parent. Uses `v-model` pattern.
**Key difference:** `PaymentInvoice` currently has `shouldShowInvoice` computed that gates display on `adStore.featured` or pack — `PaymentProInvoice` always shows (no gate needed).

```typescript
// PaymentProInvoice — always visible, uses modelValue prop instead of adStore
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", value: boolean): void }>();
```

### Pattern 5: Success page (/pro/pagar/gracias)
**What:** Mirrors `/pagar/gracias.vue` exactly. Reads `?order={documentId}` from URL, calls `useOrderById(documentId)`, renders `ResumePro` (new payment receipt component).

```typescript
// Same useAsyncData pattern as /pagar/gracias.vue
const { data, pending, error } = await useAsyncData(
  "pro-pagar-gracias",
  async (): Promise<OrderData | { error: string }> => {
    const documentId = route.query.order as string;
    if (!documentId) return { error: "INVALID_URL" };
    try {
      return await useOrderById(documentId) as OrderData;
    } catch {
      return { error: "NOT_FOUND" };
    }
  },
  { server: true, lazy: false }
);
```

### Pattern 6: Backend — proCreate modification
**What:** `proCreate` currently accepts `body: { data: {} }`. Must accept `is_invoice` boolean. The Oneclick `startInscription` is unchanged — `is_invoice` is stored on the user record temporarily (or passed through state) so `proResponse` can use it to create the order+Facto.

**Recommended approach for `is_invoice` threading:** Store `is_invoice` on the user record (as a temporary field like `pro_pending_invoice`) when `proCreate` is called, then read it in `proResponse`. This avoids changing the Transbank callback URL or relying on URL params (which Transbank ignores). Alternative: add a new field `pro_pending_invoice: boolean` to the User content type.

```typescript
// proCreate: store is_invoice alongside pro_inscription_token
await strapi.entityService.update("plugin::users-permissions.user", user.id, {
  data: {
    pro_inscription_token: String(result.token),
    pro_pending_invoice: Boolean(data?.is_invoice ?? false),
  } as unknown as Parameters<typeof strapi.entityService.update>[2]["data"],
});
```

### Pattern 7: Backend — proResponse modification
**What:** After successful inscription, before redirect: (1) get `pro_pending_invoice` from user, (2) call `documentDetails(user.id, isInvoice)`, (3) call `generateFactoDocument(...)`, (4) call `OrderUtils.createAdOrder(...)` with PRO item, (5) redirect to `/pro/pagar/gracias?order={order.documentId}`.

**PRO order item:**
```typescript
const proMonthlyPrice = parseInt(process.env.PRO_MONTHLY_PRICE ?? "0", 10);
const items = [{ name: "Suscripción PRO mensual", price: proMonthlyPrice, quantity: 1 }];
```

**Buy order for PRO inscription order:** Unlike ad orders, there is no Transbank buy_order at inscription time (that's only at charge time). Use a generated identifier: `pro-inscription-${user.id}-${Date.now()}`.

### Pattern 8: Cron — order + Facto per charge
**What:** In `SubscriptionChargeService.chargeUser()`, after a successful charge (the `result.success` branch), add order + Facto document creation before extending `pro_expires_at`.

```typescript
// After result.success === true in chargeUser():
const userDocumentDetails = await documentDetails(user.id, false); // boleta by default
const items = [{ name: "Suscripción PRO mensual", price: amount, quantity: 1 }];
try {
  const factoDoc = await generalUtils.generateFactoDocument({
    isInvoice: false,
    userDetails: userDocumentDetails,
    items,
  });
  await OrderUtils.createAdOrder({
    amount,
    buy_order: parentBuyOrder,
    userId: user.id,
    is_invoice: false,
    payment_method: process.env.PAYMENT_GATEWAY ?? "transbank",
    payment_response: result.rawResponse,
    document_details: userDocumentDetails,
    items,
    document_response: factoDoc,
  });
} catch (orderError) {
  logger.error("SubscriptionChargeService: order/Facto creation failed", { userId: user.id, error: orderError });
  // Non-fatal: charge was successful, order creation failure should not block pro_expires_at extension
}
```

### Anti-Patterns to Avoid
- **Using `adStore` in PRO components:** PRO checkout has no ad context — never read `adStore.is_invoice`, `adStore.featured`, or `adStore.pack` from PRO components.
- **POST form submission for Oneclick redirect:** Oneclick uses a GET redirect (`window.location.href`), not a POST form like Webpay Plus. `CheckoutDefault` uses `handleRedirect()` with a form POST — `CheckoutPro` must use `window.location.href` instead.
- **Redirecting to `/pro/gracias` from `proResponse`:** After this phase, `proResponse` must redirect to `/pro/pagar/gracias?order={documentId}`. The old `/pro/gracias` still exists for users who enrolled before this phase (it reads from user object, not order).
- **Omitting `publishedAt` in `createAdOrder`:** The existing `OrderUtils.createAdOrder` sets `publishedAt: new Date()` — this is required for Strapi v5 to publish the record. Do not omit it.
- **Double-fetching in Nuxt pages:** Use `useAsyncData` only — never pair with `onMounted` store calls.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Order persistence | Custom Strapi insert | `OrderUtils.createAdOrder()` | Already handles publishedAt, typing, error handling |
| Facto document generation | Direct factoService calls | `generalUtils.generateFactoDocument()` | Wraps tax calculation, item formatting, Facto API |
| Billing data extraction | User query + field mapping | `documentDetails(userId, isInvoice)` from `user.utils.ts` | Handles both boleta (personal) and factura (company) data |
| Order fetch from frontend | New composable | `useOrderById(documentId)` | Already exists, handles 404/error cases |
| Invoice/boleta UI | New radio toggle | Replicate `PaymentInvoice.vue` → `PaymentProInvoice.vue` | Existing radio + disabled logic + company check already correct |

---

## ResumePro Naming Conflict — Analysis

**Current state:**
- `ResumePro.vue` exists and shows card enrollment data (card type + last 4 digits)
- Used by `/pro/gracias.vue` which redirects to `/cuenta` if `pro_status !== "active"`
- D-05 mandates a new `ResumePro` that shows payment order receipt (mirrors `ResumeOrder`)

**Two options:**

| Option | Approach | Risk |
|--------|----------|------|
| A (recommended) | Rename existing `ResumePro.vue` → `ResumeProCard.vue`; update `/pro/gracias.vue` import; create new `ResumePro.vue` as payment receipt | Requires `/pro/gracias.vue` update — low risk |
| B | Merge both into one component with a prop switch | Violates single-responsibility; complex prop API |

**Recommendation:** Option A. Rename to `ResumeProCard.vue`, update the one import in `/pro/gracias.vue`, then create the new `ResumePro.vue` mirroring `ResumeOrder.vue`.

**SCSS impact:** `_resume.scss` already includes `resume--pro` in the multi-selector block (`&--default, &--order, &--pro`). The new `ResumePro.vue` uses `resume resume--pro` class — no SCSS change needed for the resume block itself. `ResumeProCard.vue` can keep the same `resume--pro` class since the SCSS is identical.

---

## Common Pitfalls

### Pitfall 1: Oneclick redirect mechanism
**What goes wrong:** Developer uses the POST form submit pattern from `CheckoutDefault.handleRedirect()` for Oneclick.
**Why it happens:** `CheckoutDefault` submits a form POST with `token_ws` field (Webpay Plus). Oneclick inscription uses a GET redirect with `TBK_TOKEN` as a query parameter.
**How to avoid:** `CheckoutPro` must call `window.location.href = \`\${urlWebpay}?TBK_TOKEN=\${token}\`` — same pattern already in `MemoPro.vue`.
**Warning signs:** Transbank shows "invalid request" or the inscription flow never starts.

### Pitfall 2: proResponse redirect target not updated
**What goes wrong:** `proResponse` still redirects to `/pro/gracias` after this phase.
**Why it happens:** The old redirect is on line 531 of `payment.ts` (`ctx.redirect(\`${process.env.FRONTEND_URL}/pro/gracias\``).
**How to avoid:** Update redirect to `/pro/pagar/gracias?order=${order.documentId}` after creating the order record.
**Warning signs:** Success page shows card info instead of payment receipt; no `?order=` param in URL.

### Pitfall 3: `is_invoice` not available in proResponse
**What goes wrong:** `proResponse` is a GET callback from Transbank — no request body, no JWT. The `is_invoice` preference chosen on `/pro/pagar` is lost.
**Why it happens:** Transbank redirects without carrying any frontend state.
**How to avoid:** Store `is_invoice` on the user record during `proCreate` (as `pro_pending_invoice` field). Clear it in `proResponse` after use, alongside `pro_inscription_token`.
**Warning signs:** All PRO orders are created as boleta regardless of user choice.

### Pitfall 4: Cron order creation fails and blocks pro_expires_at extension
**What goes wrong:** If `generateFactoDocument` or `createAdOrder` throws, and it's not caught, the charge succeeds but `pro_expires_at` is never extended — user loses PRO access despite paying.
**Why it happens:** `chargeUser` throws on Facto/order error, short-circuiting the `pro_expires_at` update.
**How to avoid:** Wrap order+Facto creation in a try/catch that logs the error but does not rethrow. The charge was successful — order creation is informational, not transactional with the payment.
**Warning signs:** User charged but `pro_expires_at` not updated; user sees PRO deactivated next day.

### Pitfall 5: FormPro submits without validating invoice selection
**What goes wrong:** `vee-validate Form` validates fields defined via `useField` or `<Field>` — if `PaymentProInvoice` has no validation rules, the form submits regardless.
**Why it happens:** Invoice radio (boleta default) has no required validation — boleta is always valid, so no rule is needed. The gateway is decorative only.
**How to avoid:** No validation rules needed on invoice (always valid since boleta is default). The `BarPro` submit button should never be disabled due to form invalidity — mirror `BarCheckout` with `primaryDisabled` set to `false` always (or omit).

### Pitfall 6: `pro_pending_invoice` Strapi schema field
**What goes wrong:** Writing `pro_pending_invoice` to the user entity without adding it to the Strapi user schema first causes a silent no-op or a Strapi error.
**Why it happens:** Strapi v5 `entityService.update` silently ignores unknown fields, or throws depending on strict mode.
**How to avoid:** Add `pro_pending_invoice` (boolean, default false) to the Users-Permissions user content type before writing to it. This requires a schema change in Strapi.

---

## Code Examples

### Verified: Oneclick frontend redirect (from MemoPro.vue)
```typescript
// Source: apps/website/app/components/MemoPro.vue (lines 110-112)
if (response?.data?.urlWebpay && response?.data?.token) {
  const redirectUrl = `${response.data.urlWebpay}?TBK_TOKEN=${response.data.token}`;
  window.location.href = redirectUrl;
}
```

### Verified: proCreate stores inscription token (from payment.ts)
```typescript
// Source: apps/strapi/src/api/payment/controllers/payment.ts (lines 437-448)
await strapi.entityService.update("plugin::users-permissions.user", user.id, {
  data: {
    pro_inscription_token: String(result.token),
  } as unknown as Parameters<typeof strapi.entityService.update>[2]["data"],
});
```

### Verified: Order creation pattern (from order.utils.ts)
```typescript
// Source: apps/strapi/src/api/payment/utils/order.utils.ts (lines 34-56)
const order = await strapi.entityService.create("api::order.order", {
  data: {
    amount, buy_order, user: userId, is_invoice,
    payment_method, payment_response, document_details,
    ad: adId, items, document_response,
    publishedAt: new Date(),
  } as unknown as Parameters<typeof strapi.entityService.create>[1]["data"],
});
```

### Verified: Facto document generation (from general.utils.ts)
```typescript
// Source: apps/strapi/src/api/payment/utils/general.utils.ts (lines 229-274)
await generalUtils.generateFactoDocument({
  isInvoice: result.ad.details.is_invoice,
  userDetails: userDocumentDetails,   // from documentDetails(userId, isInvoice)
  items: paymentDetails.items,        // [{ name, price, quantity }]
});
```

### Verified: useAsyncData pattern for order fetch (from /pagar/gracias.vue)
```typescript
// Source: apps/website/app/pages/pagar/gracias.vue (lines 101-119)
const { data } = await useAsyncData(
  "pro-pagar-gracias",   // unique key per page
  async (): Promise<OrderData | { error: string }> => {
    const documentId = route.query.order as string;
    if (!documentId) return { error: "INVALID_URL" };
    try {
      return await useOrderById(documentId) as OrderData;
    } catch { return { error: "NOT_FOUND" }; }
  },
  { server: true, lazy: false }
);
```

### Verified: Bar SCSS — adding --pro modifier
```scss
// Source: apps/website/app/scss/components/_bar.scss (lines 6-8)
// Current: &--announcement, &--checkout, &--packs
// Add: &--pro to the same multi-selector block
.bar {
  &--announcement,
  &--checkout,
  &--packs,
  &--pro {   // add here
    // ... all existing styles apply
  }
}
```

### Verified: Resume SCSS — --pro already in multi-selector
```scss
// Source: apps/website/app/scss/components/_resume.scss (lines 7-9)
// resume--pro is ALREADY in the multi-selector block:
&--default,
&--order,
&--pro {   // already present — no change needed for container/header/grid/box
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `MemoPro.vue` calls `POST /payments/pro` directly | Navigation to `/pro/pagar` first | Phase 105 | Need to change `handleProSubscription` — remove API call, add `navigateTo('/pro/pagar')` |
| `proResponse` redirects to `/pro/gracias` | Redirects to `/pro/pagar/gracias?order={documentId}` | Phase 105 | `/pro/gracias` kept for backward compat but new flow uses new page |
| No order record for PRO inscription | Order + Facto document created on inscription | Phase 105 | Enables `useOrderById` to work for PRO success page |
| Cron creates `subscription-payment` only | Cron also creates `order` + Facto document | Phase 105 | Monthly charges now produce audit-trail order records |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + @nuxt/test-utils (website), Jest (Strapi) |
| Config file | `apps/strapi/src/cron/subscription-charge.cron.test.ts` (existing) |
| Quick run command | `cd apps/strapi && yarn jest subscription-charge.cron.test.ts` |
| Full suite command | `cd apps/strapi && yarn jest` |

### Phase Requirements → Test Map

This phase introduces new requirements (TBD from REQUIREMENTS.md — not yet assigned IDs). The behaviors that require test coverage:

| Behavior | Test Type | Notes |
|----------|-----------|-------|
| `proCreate` stores `pro_pending_invoice` flag | Unit (Jest) | Mock entityService.update, verify field written |
| `proResponse` creates order record after inscription | Unit (Jest) | Mock `createAdOrder` + `generateFactoDocument`, verify called with PRO item |
| `proResponse` redirects to `/pro/pagar/gracias?order={documentId}` | Unit (Jest) | Mock ctx.redirect, verify URL format |
| Cron `chargeUser` creates order+Facto on success | Unit (Jest) | Extend existing subscription-charge.cron.test.ts |
| Cron order failure does not block `pro_expires_at` extension | Unit (Jest) | Facto throws → verify `pro_expires_at` still updated |
| Frontend: `/pro/pagar` requires auth middleware | Manual / e2e | `definePageMeta({ middleware: "auth" })` |

### Sampling Rate
- **Per task commit:** `cd apps/strapi && yarn jest subscription-charge.cron.test.ts`
- **Per wave merge:** `cd apps/strapi && yarn jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/strapi/src/api/payment/controllers/payment.test.ts` — covers proCreate `pro_pending_invoice` + proResponse order/redirect (does not exist yet)
- [ ] Extend `apps/strapi/src/cron/subscription-charge.cron.test.ts` — add test cases for order+Facto on charge success, and non-fatal error path

---

## Open Questions

1. **`pro_pending_invoice` Strapi schema field**
   - What we know: Strapi v5 user schema is extended via content type builder; `pro_inscription_token` was added in Phase 102 similarly
   - What's unclear: Whether this field needs to be added explicitly to the schema JSON or if `entityService` handles it dynamically
   - Recommendation: Add `pro_pending_invoice: boolean` to the Users-Permissions schema (same process as other `pro_*` fields); initialize to `false`

2. **`/pro/gracias` backward compatibility**
   - What we know: Existing `proResponse` redirects to `/pro/gracias`; existing users have no order records
   - What's unclear: Whether to keep `/pro/gracias` active after this phase or deprecate it
   - Recommendation: Keep `/pro/gracias` functional (no code removed); new `proResponse` redirects to `/pro/pagar/gracias` instead. Users who enrolled pre-Phase 105 retain a working page.

3. **Cron boleta default vs last preference**
   - What we know: CONTEXT.md D-12 says "boleta by default since user preference is not stored"
   - What's unclear: Storing last preference is listed as deferred — boleta default is confirmed
   - Recommendation: Use `isInvoice: false` (boleta) for all cron-initiated orders. Document in code comment that preference storage is deferred.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `apps/website/app/pages/pagar/index.vue` — page composition pattern
- Direct code inspection of `apps/website/app/pages/pagar/gracias.vue` — success page pattern with `useAsyncData` + `useOrderById`
- Direct code inspection of `apps/website/app/components/CheckoutDefault.vue` — wrapper + Swal + handleRedirect pattern
- Direct code inspection of `apps/website/app/components/FormCheckout.vue` — accordion form with reactive `open` state
- Direct code inspection of `apps/website/app/components/BarCheckout.vue` — bottom bar props API
- Direct code inspection of `apps/website/app/components/PaymentInvoice.vue` — radio toggle + adStore integration
- Direct code inspection of `apps/website/app/components/PaymentGateway.vue` — decorative gateway display
- Direct code inspection of `apps/website/app/components/ResumeOrder.vue` — payment receipt layout
- Direct code inspection of `apps/website/app/components/MemoPro.vue` — current Oneclick redirect pattern + cancel flow
- Direct code inspection of `apps/website/app/components/ResumePro.vue` — existing card display (naming conflict)
- Direct code inspection of `apps/website/app/pages/pro/gracias.vue` — existing inscription success page
- Direct code inspection of `apps/strapi/src/api/payment/controllers/payment.ts` — `proCreate`, `proResponse`, order creation pattern
- Direct code inspection of `apps/strapi/src/api/payment/utils/order.utils.ts` — `createAdOrder` interface
- Direct code inspection of `apps/strapi/src/api/payment/utils/general.utils.ts` — `generateFactoDocument`, `documentDetails`
- Direct code inspection of `apps/strapi/src/api/payment/utils/user.utils.ts` — `documentDetails` function
- Direct code inspection of `apps/strapi/src/cron/subscription-charge.cron.ts` — `chargeUser` method + existing order-less charge flow
- Direct code inspection of all SCSS files: `_checkout.scss`, `_form.scss`, `_bar.scss`, `_payment.scss`, `_resume.scss`
- `apps/strapi/src/api/payment/routes/payment.ts` — existing route definitions

### Secondary (MEDIUM confidence)
- `CONTEXT.md` Phase 105 decisions — user-confirmed implementation choices

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use, no new dependencies
- Architecture: HIGH — all patterns replicated from verified existing code
- Pitfalls: HIGH — derived from direct code inspection, not inference
- SCSS changes: HIGH — `_bar.scss` multi-selector and `_resume.scss` state confirmed by file reads

**Research date:** 2026-03-21
**Valid until:** 2026-04-20 (stable stack; no fast-moving dependencies)
