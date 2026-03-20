# Requirements: Waldo Project

**Defined:** 2026-03-20
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.46 Requirements

Requirements for PRO Subscriptions (Webpay Oneclick) milestone. Each maps to roadmap phases.

### Inscription

- [x] **INSC-01**: "Hazte PRO" button redirects user to Transbank Oneclick inscription page
- [x] **INSC-02**: After card enrollment, `tbk_user` token is stored on the user record and `pro_status` is set to `active`
- [x] **INSC-03**: User's card type and masked card number are stored for display
- [x] **INSC-04**: Failed or cancelled inscription redirects to an error page with a retry option

### Charging

- [ ] **CHRG-01**: Daily cron job charges users with `pro_status: active` whose `pro_expires_at` has passed
- [ ] **CHRG-02**: Each successful charge creates a `subscription-payment` record and extends `pro_expires_at` by 30 days
- [ ] **CHRG-03**: Failed charges are retried over 3 days before deactivating the subscription
- [ ] **CHRG-04**: Charge amount is read from `PRO_MONTHLY_PRICE` env var (not hardcoded)
- [ ] **CHRG-05**: Idempotency guard prevents double-charging for the same billing period

### Cancellation

- [ ] **CANC-01**: User can cancel their PRO subscription from their account page
- [ ] **CANC-02**: Cancelled subscription remains active until `pro_expires_at` (period-end expiry)
- [ ] **CANC-03**: Card inscription is deleted from Transbank on cancellation
- [ ] **CANC-04**: After period expires, `pro_status` is set to `inactive` and PRO features are disabled

### Frontend

- [x] **FRNT-01**: `MemoPro.vue` redirects to Oneclick inscription (replaces Flow redirect)
- [x] **FRNT-02**: Return page after successful inscription shows confirmation with card info
- [ ] **FRNT-03**: Account page shows subscription status (active/cancelled), card info, and next charge date
- [ ] **FRNT-04**: Cancel button with Swal confirmation available on account page for active subscribers

## Future Requirements

(None deferred for this milestone)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Flow subscription integration | Kept as code but replaced by Oneclick; no dual-gateway support |
| Prorated charges on mid-cycle cancellation | Period-end expiry is simpler; no refunds needed |
| Multiple subscription tiers | Single PRO tier at fixed price; tiers add complexity without value |
| Annual billing option | Monthly only for v1; annual can be added later |
| Dashboard admin subscription management | Admin can toggle `pro` directly in Strapi admin panel |
| Email receipt for each monthly charge | Deferred to future; payment record in DB is sufficient for now |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INSC-01 | Phase 102 | Complete |
| INSC-02 | Phase 102 | Complete |
| INSC-03 | Phase 102 | Complete |
| INSC-04 | Phase 102 | Complete |
| CHRG-01 | Phase 103 | Pending |
| CHRG-02 | Phase 103 | Pending |
| CHRG-03 | Phase 103 | Pending |
| CHRG-04 | Phase 103 | Pending |
| CHRG-05 | Phase 103 | Pending |
| CANC-01 | Phase 104 | Pending |
| CANC-02 | Phase 104 | Pending |
| CANC-03 | Phase 104 | Pending |
| CANC-04 | Phase 104 | Pending |
| FRNT-01 | Phase 102 | Complete |
| FRNT-02 | Phase 102 | Complete |
| FRNT-03 | Phase 104 | Pending |
| FRNT-04 | Phase 104 | Pending |

**Coverage:**
- v1.46 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 — traceability completed during roadmap creation*
