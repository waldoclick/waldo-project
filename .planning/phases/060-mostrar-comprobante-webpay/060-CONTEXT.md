# Phase 060: Mostrar comprobante Webpay - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Display compliant Webpay receipt fields on `/pagar/gracias` after payment success. Extend existing `ResumeOrder` component to show all mandatory Transbank fields. No print/email/download features.

</domain>

<decisions>
## Implementation Decisions

### Component Strategy
- Extend existing `ResumeOrder.vue` component, not create new component
- Add missing Webpay fields to existing "Comprobante de pago" section
- Use existing `CardInfo` pattern for field display

### Required Fields (Webpay/Transbank compliance)
- Monto (amount) — ✅ already exists
- Código de autorización (authorization_code) — ❌ add
- Fecha/hora de pago (date/time) — ✅ already exists
- Tipo de pago (payment_type_code) — ❌ add
- Últimos 4 dígitos (card_detail.card_number last 4) — ❌ add
- Número de orden (buy_order) — ✅ already exists
- Código de comercio (commerce_code) — ❌ add
- NO logo de Webpay (removed from requirements)

### Backend Fix Required
- Fix `adResponse` controller (line 292) to redirect with `order` documentId instead of `ad` id
- `webpayResponse` already correct (line 361-365)
- Ensure Order entity has payment_metadata populated from Webpay response

### Data Mapping
- Update `prepareSummary()` in `gracias.vue` to extract all fields from `payment_metadata`
- Use nullish coalescing (`??`) for missing fields, show "No disponible"
- Map `payment_metadata` structure:
  - `authorization_code` → Código de autorización
  - `payment_type_code` → Tipo de pago
  - `card_detail.card_number` → Últimos 4 dígitos
  - `commerce_code` → Código de comercio

### Spanish Labels
- All labels in Spanish (already established pattern)
- Placeholder: "No disponible" for missing fields

### Claude's Discretion
- Exact field ordering in grid
- Label wording refinements (keep consistent with existing labels)
- Error handling for malformed payment_metadata

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ResumeOrder.vue` — Already displays payment receipt with CardInfo grid pattern
- `CardInfo` component — Displays title/description pairs
- `prepareSummary()` function in `gracias.vue` — Maps Order data to ResumeOrder props
- `payment_metadata` field in Order entity — Contains full Webpay response

### Established Patterns
- BEM SCSS with `.resume--order__*` classes
- `CardInfo` grid for key-value pairs
- `v-if` conditionals for optional fields
- Spanish labels throughout

### Integration Points
- `gracias.vue` line 122-137 — `prepareSummary()` function to extend
- `ResumeOrder.vue` line 26-34 — Grid to add new CardInfo entries
- Backend: `payment.controller.ts` line 292 — Fix redirect query param

</code_context>

<specifics>
## Specific Ideas

- Keep existing "Comprobante de pago" structure
- Add 4 new CardInfo rows for missing Webpay fields
- No visual redesign, just add fields
- Reuse exact same grid layout pattern

</specifics>

<deferred>
## Deferred Ideas

- Webpay logo display (user explicitly removed)
- Print/email receipt functionality
- PDF download
- Receipt for other payment gateways (Flow, etc)

</deferred>

---

*Phase: 060-mostrar-comprobante-webpay*
*Context gathered: 2026-03-10*
