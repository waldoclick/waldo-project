# Phase 105: PRO Subscription Checkout Page - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Dedicated checkout page for suscripciones PRO. Currently "Hazte PRO" calls the API directly — this phase adds an intermediate checkout page (`/pro/pagar`) that collects boleta/factura preference, shows the payment gateway, and creates an order record with Facto document. The cron mensual also gets order + Facto document creation per charge.

</domain>

<decisions>
## Implementation Decisions

### Page structure and URL
- **D-01:** New page at `/pro/pagar` — replicated from `/pagar/index.vue` pattern
- **D-02:** Only two sections visible: boleta/factura (open by default) and pasarela de pagos (Oneclick only, no selector)
- **D-03:** No ad preview, no packs, no featured, no resumen de compra — only title + text contextual PRO, boleta/factura, and gateway
- **D-04:** Success page at `/pro/pagar/gracias` — replicated from `/pagar/gracias.vue` with `ResumePro` (replicated from `ResumeOrder`)

### Component naming — strict replication
- **D-05:** Every component is a replica of its `/pagar` counterpart with `Pro` suffix and `--pro` BEM modifier:
  - `CheckoutDefault` → `CheckoutPro` (class: `checkout checkout--pro`)
  - `FormCheckout` → `FormPro` (class: `form form--pro`)
  - `BarCheckout` → `BarPro` (class: `bar bar--pro`)
  - `PaymentInvoice` → `PaymentProInvoice` (class: `payment payment--pro-invoice`)
  - `PaymentGateway` → `PaymentProGateway` (class: `payment payment--pro-gateway`)
  - `ResumeOrder` → `ResumePro` (class: `resume resume--pro`) — NOTE: `ResumePro.vue` already exists at `/pro/gracias`, must be repurposed or renamed
- **D-06:** No new SCSS files — add `--pro` modifiers to existing `_checkout.scss`, `_form.scss`, `_bar.scss`, `_payment.scss`, `_resume.scss`
- **D-07:** No new colors, no new design patterns — exact visual replication

### Navigation flow
- **D-08:** `MemoPro.vue` "Hazte PRO" button now navigates to `/pro/pagar` instead of calling `POST /payments/pro` directly
- **D-09:** Flow: MemoPro → `/pro/pagar` → user picks boleta/factura → click pagar → `POST /payments/pro` → Transbank redirect → `/pro/pagar/gracias?order={documentId}`

### Backend — order + Facto document
- **D-10:** `POST /payments/pro` now creates an order record (like `OrderUtils.createAdOrder()` but for PRO) with `is_invoice` flag from frontend
- **D-11:** Order includes Facto-generated boleta or factura depending on user choice
- **D-12:** The monthly charge cron also creates an order + Facto document per charge (boleta by default since user preference is not stored — or reuse last preference)
- **D-13:** Success redirect uses `order.documentId` — same identity rule as ad payments
- **D-14:** Facto service already exists and handles both boleta and factura — reuse as-is

### Claude's Discretion
- Technical implementation of how `is_invoice` preference is passed to `POST /payments/pro`
- Whether cron uses boleta by default or stores/reuses user's last invoice preference
- Exact task breakdown and plan structure
- How to handle existing `ResumePro.vue` naming conflict (rename old one or merge)

</decisions>

<specifics>
## Specific Ideas

- "Es una réplica de `/pagar` — si el componente se llama BarCreate, acá se llama BarPro. Si la clase es `bar bar--create`, acá es `bar bar--pro`. Se agrega el modificador nuevo al mismo SCSS"
- "No inventes colores ni componentes nuevos — solo replicar"
- Boleta/factura section must be open by default (not collapsed like in ad checkout)
- Only Oneclick as gateway — no gateway selector needed

</specifics>

<canonical_refs>
## Canonical References

### Checkout pattern (replicate from)
- `apps/website/app/pages/pagar/index.vue` — Main checkout page structure to replicate
- `apps/website/app/pages/pagar/gracias.vue` — Success page pattern to replicate
- `apps/website/app/components/CheckoutDefault.vue` — Checkout wrapper component
- `apps/website/app/components/FormCheckout.vue` — Form with accordion sections (boleta/factura + gateway)
- `apps/website/app/components/BarCheckout.vue` — Bottom action bar
- `apps/website/app/components/PaymentInvoice.vue` — Boleta/factura toggle + form fields
- `apps/website/app/components/PaymentGateway.vue` — Gateway display
- `apps/website/app/components/ResumeOrder.vue` — Order receipt on success page

### SCSS files (add --pro modifiers to)
- `apps/website/app/scss/components/_checkout.scss` — `.checkout` block
- `apps/website/app/scss/components/_form.scss` — `.form` block
- `apps/website/app/scss/components/_bar.scss` — `.bar` block
- `apps/website/app/scss/components/_payment.scss` — `.payment` block
- `apps/website/app/scss/components/_resume.scss` — `.resume` block

### Backend (order + Facto)
- `apps/strapi/src/api/payment/controllers/payment.ts` — `proCreate()` and `proResponse()` methods to modify
- `apps/strapi/src/api/payment/services/checkout.service.ts` — `OrderUtils.createAdOrder()` pattern to replicate for PRO
- `apps/strapi/src/utils/order.utils.ts` — Order creation utility (if separate)
- `apps/strapi/src/utils/general.utils.ts` — `generateFactoDocument()` and `documentDetails()` functions

### Existing PRO components
- `apps/website/app/components/MemoPro.vue` — Entry point, needs navigation change
- `apps/website/app/components/ResumePro.vue` — Existing component on `/pro/gracias` (naming conflict to resolve)
- `apps/website/app/pages/pro/gracias.vue` — Current success page (may be superseded by `/pro/pagar/gracias`)
- `apps/website/app/pages/pro/error.vue` — Error page (kept as-is)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CheckoutDefault.vue` — wrapper with `checkout--default` modifier, replicate as `checkout--pro`
- `FormCheckout.vue` — accordion form with 5 sections, replicate stripped to 2 sections (invoice + gateway)
- `BarCheckout.vue` — bottom bar with actions, replicate as `BarPro`
- `PaymentInvoice.vue` — boleta/factura radio toggle + factura form fields, replicate as-is
- `PaymentGateway.vue` — gateway display, replicate simplified for Oneclick only
- `ResumeOrder.vue` — order receipt display, replicate for PRO order
- `OrderUtils.createAdOrder()` — order persistence pattern, replicate for PRO orders
- `generalUtils.generateFactoDocument()` — Facto boleta/factura generation, reuse directly
- `generalUtils.documentDetails()` — user billing details extraction, reuse directly

### Established Patterns
- BEM modifier encapsulation: `block block--modifier` with all children under modifier namespace
- Accordion sections in FormCheckout: `form--checkout__field` with toggle/content/chevron
- Order identity: always `order.documentId` for redirects and frontend fetch
- Facto integration: `is_invoice` boolean drives boleta vs factura generation

### Integration Points
- `MemoPro.vue` — change from API call to `navigateTo('/pro/pagar')`
- `POST /payments/pro` — add `is_invoice` parameter, create order + Facto document after Oneclick inscription
- `proResponse()` controller — create order record, redirect with `order.documentId`
- Monthly cron (`SubscriptionChargeService`) — add order + Facto document creation per charge
- `/pro/pagar/gracias` — new page that fetches order by documentId (same as `/pagar/gracias`)

</code_context>

<deferred>
## Deferred Ideas

- Email receipt for monthly PRO charges — already listed as out of scope in REQUIREMENTS.md
- Storing user's boleta/factura preference for cron reuse — could be added later

</deferred>

---

*Phase: 105-pro-subscription-checkout-page*
*Context gathered: 2026-03-21*
