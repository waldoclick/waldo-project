# Roadmap: Waldo Project

- ⛔ v1.25 Unified Checkout — forcibly closed 2026-03-09. All outstanding work abandoned by user request. See `.planning/milestones/v1.25-ROADMAP.md` for archived details.

---

## Milestone: v1.26 Mostrar comprobante Webpay en /pagar/gracias

**Goal:** Display a compliant Webpay/Transbank digital receipt with all required fields on /pagar/gracias immediately after successful payment.

**Status:** Planning → Execution

**Requirements:** See `.planning/REQUIREMENTS.md`

### Phase 060: Mostrar comprobante Webpay

**Goal:** Implement on-screen Webpay receipt component with all mandatory fields (amount, authorization code, date/time, payment type, last 4 card digits, order number, merchant info, Webpay branding) using Spanish labels and handling missing data gracefully.

**Plans:** 1 plan

Plans:
- [ ] 060-01-PLAN.md — Create IWebpayReceipt type, ComprobanteWebpay component with BEM styling, integrate into gracias.vue page
