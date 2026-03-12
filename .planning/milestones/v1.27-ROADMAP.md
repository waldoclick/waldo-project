# Roadmap: Waldo Project

- ⛔ v1.25 Unified Checkout — forcibly closed 2026-03-09. All outstanding work abandoned by user request. See `.planning/milestones/v1.25-ROADMAP.md` for archived details.

---

## Milestone: v1.26 Mostrar comprobante Webpay en /pagar/gracias

**Goal:** Display a compliant Webpay/Transbank digital receipt with all required fields on /pagar/gracias immediately after successful payment.

**Status:** ✅ Complete (2026-03-11)

**Requirements:** See `.planning/REQUIREMENTS.md`
- **RCP-01:** Display all 8 required receipt fields (amount, authorization code, date/time, payment type, last 4 card digits, order number, merchant code, status)
- **RCP-02:** All labels in Spanish, "No disponible" placeholders for missing data
- **RCP-03:** ~~Webpay branding (logo)~~ — Removed per user decision (CONTEXT.md line 29)

### Phase 060: Mostrar comprobante Webpay

**Goal:** Implement on-screen Webpay receipt component with all mandatory fields (amount, authorization code, date/time, payment type, last 4 card digits, order number, merchant info, Webpay branding) using Spanish labels and handling missing data gracefully.

**Plans:** 3/3 plans complete
**Status:** ✅ Complete (2026-03-11)
**Verification:** Passed (14/14 must-haves verified)

Plans:
- [x] 060-00-PLAN.md — Create test scaffolds for ResumeOrder and gracias.vue (Wave 0) — ✅ 2026-03-11
- [x] 060-01-PLAN.md — Extend prepareSummary() and add CardInfo fields to ResumeOrder (Wave 1) — ✅ 2026-03-11
- [x] 060-02-PLAN.md — Fix backend redirect to use order.documentId (Wave 1) — ✅ 2026-03-10 (completed earlier)

---

## Milestone: v1.27 Reparar eventos GA4 ecommerce en flujo de pago unificado

**Goal:** Fix GA4 ecommerce tracking after the unified payment flow consolidation so that purchase events fire correctly on /pagar/gracias, begin_checkout fires for the pack-only flow, and all event values (total, items, transaction_id) are non-undefined.

**Status:** ✅ Complete (2026-03-12)

**Requirements:**
- **GA-01:** `purchase` event fires on `/pagar/gracias` with correct `transaction_id`, `value`, `currency`, and `items` from order data
- **GA-02:** `begin_checkout` fires when entering `/pagar` from the packs flow (currently only fires from `/anunciar/resumen`)
- **GA-03:** All GA4 ecommerce events send non-undefined `value`/`total` — order `amount` field used correctly
- **GA-04:** Event `flow` discriminator distinguishes `ad_creation` vs `pack_purchase` flows correctly

### Phase 061: Fix GA4 ecommerce events

**Goal:** Repair GA4 ecommerce event tracking after unified checkout: fire `purchase` on /pagar/gracias using order data, fire `begin_checkout` on /pagar entry for the pack-only flow, and ensure no undefined values in any event payload.

**Plans:** 2/2 plans complete
**Status:** ✅ Complete (2026-03-12)

Plans:
- [x] 061-01-PLAN.md — Extend useAdAnalytics with purchase() method and flow discriminator (Wave 1) — ✅ 2026-03-11
- [x] 061-02-PLAN.md — Wire purchase event in gracias.vue and begin_checkout in pagar/index.vue (Wave 2) — ✅ 2026-03-12
