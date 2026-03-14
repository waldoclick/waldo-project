# Requirements: Waldo Project — v1.38

**Defined:** 2026-03-14
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.38 Requirements

### Ecommerce Bug Fixes

- [ ] **ECOM-01**: The `purchase` event reports real transaction value (not always $0) — `order.amount` field name corrected so GA4 ecommerce dashboard shows actual revenue
- [ ] **ECOM-02**: The `purchase` event `item_id` is populated with the real order `documentId` (not empty string)
- [ ] **ECOM-03**: GA4 receives a `purchase` event with `value: 0` when a user successfully creates a free ad (`/anunciar/gracias`) — free ad creation is a conversion and must be tracked alongside paid conversions

### Ad Discovery Tracking

- [ ] **DISC-01**: GA4 receives a `view_item_list` event when a user views the public ad listing (`/anuncios`) — includes item array with visible ads
- [ ] **DISC-02**: GA4 receives a `view_item` event when a user views an ad detail page (`/anuncios/[slug]`) — includes `item_id`, `item_name`, `price`, `item_category`
- [ ] **DISC-03**: GA4 receives a `search` event when a user submits a search query or applies a commune filter — includes `search_term`

### Seller Contact Tracking

- [ ] **CONT-01**: GA4 receives a `contact` event when a logged-in user clicks the seller's email link on an ad detail page — includes `method: "email"`
- [ ] **CONT-02**: GA4 receives a `contact` event when a logged-in user clicks the seller's phone link on an ad detail page — includes `method: "phone"`

### Lead Generation Tracking

- [ ] **LEAD-01**: GA4 receives a `generate_lead` event when a user successfully submits the contact form and reaches `/contacto/gracias`

### User Lifecycle Tracking

- [ ] **AUTH-01**: GA4 receives a `sign_up` event when a user completes registration successfully — includes `method: "email"`
- [ ] **AUTH-02**: GA4 receives a `login` event when a user completes login successfully (including 2-step verification) — includes `method: "email"` or `method: "google"`

### Blog Tracking

- [ ] **BLOG-01**: GA4 receives a custom `article_view` event when a user views a blog article (`/blog/[slug]`) — includes `article_id`, `article_title`, `article_category`

## Future Requirements

### Enhanced Ecommerce

- **ECOM-F01**: `purchase` event `item_name` reflects the actual pack purchased (not hardcoded "Orden de pago")
- **ECOM-F02**: `view_item_list` on `/packs` page fires for direct pack purchases (not just via wizard)
- **ECOM-F01b**: `purchase` event `item_name` reflects the actual pack purchased (not hardcoded "Orden de pago") — moved from v1 scope to future

### Engagement

- **ENG-F01**: `share` event fires when user shares an ad via `ShareDefault.vue`
- **ENG-F02**: Filter interaction event fires when user changes commune or sort order without text search
- **ENG-F03**: `article_view` event for blog listing page (`/blog`)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dashboard analytics | Dashboard is admin-only; GA4 is a user-facing analytics tool |
| Consent Mode default state fix | Pre-existing legal/compliance concern; needs dedicated GTM container work, not a code change |
| GTM container configuration | Out of codebase scope — done in GTM UI |
| `exception` event standardization | Not a user-facing bug; low business impact |
| `step_view` → GA4 standard funnel migration | Would require GTM trigger reconfiguration; no user-facing impact |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ECOM-01 | Phase 083 | Pending |
| ECOM-02 | Phase 083 | Pending |
| ECOM-03 | Phase 083 | Pending |
| DISC-01 | Phase 084 | Pending |
| DISC-02 | Phase 084 | Pending |
| DISC-03 | Phase 084 | Pending |
| CONT-01 | Phase 085 | Pending |
| CONT-02 | Phase 085 | Pending |
| LEAD-01 | Phase 085 | Pending |
| AUTH-01 | Phase 085 | Pending |
| AUTH-02 | Phase 085 | Pending |
| BLOG-01 | Phase 085 | Pending |

**Coverage:**
- v1.38 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 — Roadmap created (phases 083–085 assigned)*
