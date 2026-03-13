# Requirements: Waldo Project — v1.35 Gift Reservations to Users

**Defined:** 2026-03-13
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.35 Requirements

Requirements for milestone v1.35. Each maps to roadmap phases.

### Gift UI (Dashboard)

- [ ] **GIFT-01**: Administrator can open a "Gift Reservations" lightbox from the ad-reservation detail page
- [ ] **GIFT-02**: Administrator can open a "Gift Featured Reservations" lightbox from the featured-reservation detail page
- [ ] **GIFT-03**: Gift lightbox contains a numeric input to specify the number of reservations to gift (min: 1)
- [ ] **GIFT-04**: Gift lightbox contains a searchable user select showing only Authenticated-role users, displaying first name + last name per option
- [ ] **GIFT-05**: A Swal confirmation dialog appears before the gift is created asking the admin to confirm

### Gift Backend (Strapi)

- [ ] **GIFT-06**: `POST /api/ad-reservations/gift` endpoint creates N ad-reservation records assigned to the selected user
- [ ] **GIFT-07**: `POST /api/ad-featured-reservations/gift` endpoint creates N featured-reservation records assigned to the selected user
- [ ] **GIFT-08**: `GET /api/users/authenticated` endpoint returns all users with the Authenticated role (id, firstName, lastName) — server-side filtered via `strapi.db.query`

### Gift Email (Strapi)

- [ ] **GIFT-09**: After successful gift creation, an email is sent to the recipient informing them they received gifted ad reservations or featured ad reservations

## Future Requirements

*(None identified for this milestone)*

## Out of Scope

| Feature | Reason |
|---------|--------|
| Gifting to non-Authenticated users (e.g. Public role) | Admin-only tool; gifting to unregistered users has no business value |
| Gift history / audit log | Not requested; can be added in a future milestone |
| User notification in-app (bell/badge) | No in-app notification system exists yet |
| Bulk gift from list view (not detail page) | Deferred; detail-page-only scope confirmed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GIFT-01 | Phase 076 | Pending |
| GIFT-02 | Phase 076 | Pending |
| GIFT-03 | Phase 076 | Pending |
| GIFT-04 | Phase 076 | Pending |
| GIFT-05 | Phase 076 | Pending |
| GIFT-06 | Phase 075 | Pending |
| GIFT-07 | Phase 075 | Pending |
| GIFT-08 | Phase 075 | Pending |
| GIFT-09 | Phase 075 | Pending |

**Coverage:**
- v1.35 requirements: 9 total
- Mapped to phases: 9 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after initial definition*
