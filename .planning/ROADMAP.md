# Roadmap: Waldo Project

- ⛔ v1.25 Unified Checkout — forcibly closed 2026-03-09. All outstanding work abandoned by user request. See `.planning/milestones/v1.25-ROADMAP.md` for archived details.

---

## Milestone: v1.26 Mostrar comprobante Webpay en /pagar/gracias

**Goal:** Display a compliant Webpay/Transbank digital receipt with all required fields on /pagar/gracias immediately after successful payment.

**Status:** Planning → Execution

**Requirements:** See `.planning/REQUIREMENTS.md`
- **RCP-01:** Display all 8 required receipt fields (amount, authorization code, date/time, payment type, last 4 card digits, order number, merchant code, status)
- **RCP-02:** All labels in Spanish, "No disponible" placeholders for missing data
- **RCP-03:** ~~Webpay branding (logo)~~ — Removed per user decision (CONTEXT.md line 29)

### Phase 060: Mostrar comprobante Webpay

**Goal:** Implement on-screen Webpay receipt component with all mandatory fields (amount, authorization code, date/time, payment type, last 4 card digits, order number, merchant info, Webpay branding) using Spanish labels and handling missing data gracefully.

**Plans:** 3/3 plans complete

Plans:
- [x] 060-00-PLAN.md — Create test scaffolds for ResumeOrder and gracias.vue (Wave 0) — ✅ 2026-03-11
- [ ] 060-01-PLAN.md — Extend prepareSummary() and add CardInfo fields to ResumeOrder (Wave 1)
- [x] 060-02-PLAN.md — Fix backend redirect to use order.documentId (Wave 1) — ✅ 2026-03-10 (completed earlier)
