# Requirements: Waldo Project

**Defined:** 2026-03-20
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.46 Requirements

Requirements for PRO Subscriptions (Webpay Oneclick) milestone. Each maps to roadmap phases.

### Inscription

- [ ] **INSC-01**: "Hazte PRO" button redirects user to Transbank Oneclick inscription page
- [ ] **INSC-02**: After card enrollment, `tbk_user` token is stored on the user record and `pro_status` is set to `active`
- [ ] **INSC-03**: User's card type and masked card number are stored for display
- [ ] **INSC-04**: Failed or cancelled inscription redirects to an error page with a retry option

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

- [ ] **FRNT-01**: `MemoPro.vue` redirects to Oneclick inscription (replaces Flow redirect)
- [ ] **FRNT-02**: Return page after successful inscription shows confirmation with card info
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
| INSC-01 | — | Pending |
| INSC-02 | — | Pending |
| INSC-03 | — | Pending |
| INSC-04 | — | Pending |
| CHRG-01 | — | Pending |
| CHRG-02 | — | Pending |
| CHRG-03 | — | Pending |
| CHRG-04 | — | Pending |
| CHRG-05 | — | Pending |
| CANC-01 | — | Pending |
| CANC-02 | — | Pending |
| CANC-03 | — | Pending |
| CANC-04 | — | Pending |
| FRNT-01 | — | Pending |
| FRNT-02 | — | Pending |
| FRNT-03 | — | Pending |
| FRNT-04 | — | Pending |

**Coverage:**
- v1.46 requirements: 17 total
- Mapped to phases: 0
- Unmapped: 17

---
*Requirements defined: 2026-03-20*
*Last updated: 2026-03-20 after initial definition*
