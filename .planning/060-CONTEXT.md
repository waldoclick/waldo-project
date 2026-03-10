# Phase: Mostrar comprobante Webpay - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning
**Source:** User-provided objective, standard Webpay fields

<domain>
## Phase Boundary

This phase delivers a compliant, user-visible Webpay/Transbank payment receipt, rendered on /pagar/gracias after a successful payment. All legally and contractually required fields must be present, correct, and shown with Spanish labels, reflecting actual data from the Webpay/Transbank backend. Receipt is not rendered in print/email context—only Web UI post-payment.
</domain>

overrides: []

<decisions>
## Implementation Decisions

### Receipt Content
- Show these fields: Monto, Código de autorización, Fecha y hora de pago, Tipo de pago, Últimos 4 dígitos de la tarjeta, Número de orden/compra, Nombre/RUT/ID de comercio, Webpay branding
- All values shown precisely as returned by Webpay—no masking/redaction

### Display Context
- Only shown on /pagar/gracias after success
- If any field missing, show placeholder or warning
- No download/print, no alternative gateways in scope

### Claude's Discretion
- Technical implementation details
- UI/UX details if not specified by requirements or regulatory sources
</decisions>

<specifics>
## Specific Ideas
- Follow official Transbank/Webpay guidance for receipt layout/order if available
</specifics>

<deferred>
## Deferred Ideas
- Download/print button (future)
- Multi-gateway receipt (future)

---

*Phase: Mostrar comprobante Webpay*
*Context gathered: 2026-03-09*
