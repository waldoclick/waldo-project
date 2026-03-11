# Phase 54: Redirección desde Flujos Existentes - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire existing payment entry points to redirect to `/pagar` when `hasToPay === true`. Move payment execution logic from `resumen.vue` to `CheckoutDefault.vue` (which already has it). The pack purchase flow (`packs/comprar.vue` → `BuyPack.vue`) also redirects to `/pagar`. `/pagar` becomes the single payment execution point for all paid flows.

</domain>

<decisions>
## Implementation Decisions

### resumen.vue role after redirect
- When `hasToPay === true`: redirect to `/pagar` instead of executing payment inline
- When `hasToPay === false` (free pack): keep executing the free payment flow directly in `resumen.vue` — free ad flow skips draft call and goes straight to `payments/ad` (v1.21 decision preserved)
- `resumen.vue` retains the "Ir a pagar" / "Crear anuncio" button and the Swal confirmation dialog
- For paid flows: on confirm, redirect to `/pagar` via `navigateTo('/pagar')` — no payment logic in `resumen.vue` for paid packs
- Dead code cleanup: `handlePayClick` paid path and `handleRedirect` can be removed from `resumen.vue` once moved to `CheckoutDefault`

### Pack purchase flow
- `BuyPack.vue` currently navigates to `/anunciar/resumen` on confirm — change to navigate to `/pagar` directly
- The pack flow does not go through `resumen.vue` (it's a different product — buying ad credits, not creating an ad)
- `CheckoutDefault.vue` must handle the pack payment case too, or `BuyPack.vue` calls its own payment logic — Claude's Discretion on implementation detail

### Payment logic consolidation
- `CheckoutDefault.vue` already has the full payment implementation (draft + webpay + free path + error handling)
- No new payment logic needs to be written — this is purely a redirect + cleanup task
- After redirect wiring, `resumen.vue` should have no duplicate `handlePayClick` for paid flows

### Claude's Discretion
- Whether to keep or remove the `begin_checkout` analytics event from `resumen.vue` after redirect (it fires `onMounted` currently — may want to move it to `/pagar` page arrival)
- Exact cleanup scope of dead code in `resumen.vue` post-redirect
- Whether `BuyPack.vue` redirect goes to `/pagar` with query params or relies on store state already in `adStore`

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CheckoutDefault.vue`: already has complete payment logic (draft call, `payments/ad`, webpay redirect, free path, error handling) — this is the destination, not something to rewrite
- `FormCheckout.vue`: the form inside `CheckoutDefault` — fully built in Phase 53
- `useAdPaymentSummary()`: composable providing `hasToPay`, `packPart`, `totalAmount`, `paymentSummaryText` — used in both `resumen.vue` and `CheckoutDefault`
- `adStore`: holds all ad state (`pack`, `featured`, `is_invoice`, `ad`) — shared between `resumen.vue` and `/pagar` via Pinia persistence; no data passing needed on redirect

### Established Patterns
- `navigateTo('/pagar')` is the correct Nuxt 4 programmatic navigation (not `router.push`)
- Free pack flow uses `pack === "free"` guard — never calls `ads/draft`; goes straight to `payments/ad`
- `adStore` is localStorage-persisted; state survives the redirect from `resumen.vue` to `/pagar`
- `onMounted` is allowed for analytics-only (non-data-fetching) — confirmed pattern in v1.18

### Integration Points
- `resumen.vue` → remove paid flow execution, add `navigateTo('/pagar')` on confirm when `hasToPay`
- `BuyPack.vue` → change `router.push('/anunciar/resumen')` to `navigateTo('/pagar')` (or equivalent)
- `CheckoutDefault.vue` → already connected to `FormCheckout` via `@form-submitted`; should already handle both ad and pack payment cases (verify)
- `/pagar/index.vue` → already renders `CheckoutDefault`; no changes needed to page shell

</code_context>

<specifics>
## Specific Ideas

- No specific references — scope is clear from ROADMAP.md: "resumen.vue redirige a /pagar cuando hasToPay === true; flujo de compra de packs redirige a /pagar; lógica de pago movida a CheckoutDefault"
- User did not want to discuss gray areas — implementation follows directly from v1.22 decisions and existing codebase

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 54-redireccion-desde-flujos-existentes*
*Context gathered: 2026-03-08*
