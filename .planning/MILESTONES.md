## v1.27 Reparar eventos GA4 ecommerce en flujo de pago unificado (Shipped: 2026-03-12)

## v1.34 LightBoxArticles (Shipped: 2026-03-13)

**Phases completed:** 2 phases, 4 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.32 Gemini AI Service (Shipped: 2026-03-13)

**Phases completed:** 1 phases, 1 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.31 Article Manager Improvements (Shipped: 2026-03-13)

**Phases completed:** 2 phases, 2 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.30 Blog Public Views (Shipped: 2026-03-13)

**Phases completed:** 4 phases, 8 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.29 News Manager (Shipped: 2026-03-12)

**Phases completed:** 2 phases, 3 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.28 Logout Store Cleanup (Shipped: 2026-03-12)

**Phases completed:** 1 phases, 2 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

**Phases completed:** 1 phase (061), 2 plans
**Timeline:** 2026-03-11 → 2026-03-12 (2 days)
**Git range:** `5e4da12` → `b1de40b`

**Key accomplishments:**
- `purchase()` method + `PurchaseOrderData` interface added to `useAdAnalytics` via TDD (12 tests passing)
- `pushEvent()` flow discriminator param added — distinguishes `ad_creation` vs `pack_purchase` GA4 flows
- `watch(orderData, { immediate: true })` + `purchaseFired` guard wired in `/pagar/gracias.vue` — fires exactly once per visit with all non-undefined values
- `beginCheckout()` wired in `/pagar/index.vue` for pack-only flow (`ad_id === null` guard)
- `adStore.clearAll()` preserved without interfering with event payload (purchase reads from order object, not store)

**Archive:** `.planning/milestones/v1.27-ROADMAP.md` | `.planning/milestones/v1.27-REQUIREMENTS.md`

---

## v1.26 Mostrar comprobante Webpay en /pagar/gracias (Shipped: 2026-03-11)

**Phases completed:** 1 phase (060), 3 plans
**Timeline:** 2026-03-09 → 2026-03-11

**Key accomplishments:**
- Webpay redirect now uses `order.documentId` (not `adId`) — thank-you flow is order-centric
- `prepareSummary()` extended with all 8 mandatory Webpay fields (amount, auth code, date/time, payment type, last 4 digits, order number, merchant info)
- `ResumeOrder.vue` displays `CardInfo` components for all Webpay receipt fields with Spanish labels and "No disponible" fallbacks
- Test scaffolds for `ResumeOrder` and `gracias.vue` created with Vitest; 7/7 tests passing
- Strapi `findOne()` fixed to query by `documentId` (string) not numeric `id`

**Archive:** `.planning/milestones/v1.26-ROADMAP.md` | `.planning/milestones/v1.26-REQUIREMENTS.md`

---
