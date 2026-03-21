---
gsd_state_version: 1.0
milestone: v1.46
milestone_name: PRO Subscriptions (Webpay Oneclick)
status: executing
stopped_at: Completed 105-01-PLAN.md
last_updated: "2026-03-21T21:50:52.035Z"
last_activity: 2026-03-21
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 11
  completed_plans: 10
  percent: 82
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-20)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 105 — pro-subscription-checkout-page

## Position

Phase: 105 of 105 (pro-subscription-checkout-page)
Plan: 3 of 3 completed
Status: In progress
Last activity: 2026-03-21

```
Progress: [████████░░] 82%
```

## Accumulated Context

### Key Decisions (carry forward)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- `transbank-sdk@5.0.0` already installed — includes `Oneclick.MallInscription` and `Oneclick.MallTransaction`
- Oneclick Mall requires separate commerce codes — `ONECLICK_COMMERCE_CODE` and `ONECLICK_CHILD_COMMERCE_CODE`
- `username` must be identical across inscription.start(), transaction.authorize(), and inscription.delete() — use `user-{documentId}`
- Flow service kept but unused — Oneclick replaces Flow for PRO subscriptions
- `MemoPro.vue` already has Swal + `POST /payments/pro` wired — needs rewiring to Oneclick start endpoint
- Price via `PRO_MONTHLY_PRICE` env var (not hardcoded)
- `pro` boolean already on User schema — extend with `pro_status` enum and `pro_expires_at`
- Cron schedule: 5 AM daily (after existing crons at 1–4 AM); file name: `subscription-charge.cron.ts`
- Idempotency: check for existing `subscription-payment` record for current period before charging
- Sandbox credentials available in SDK source (`597055555541` parent, `597055555542` child)
- [102-01] ONECLICK_API_KEY falls back to WEBPAY_API_KEY in integration (separate for production)
- [102-01] User resolved in proInscriptionFinish via pro_inscription_token DB lookup — no JWT on Transbank GET redirect
- [102-01] buildOneclickUsername exported from types module for Phase 104 (inscription.delete) reuse
- [102-01] pro_inscription_token cleared on finish to prevent token replay
- [102-02] fetchUser comes from useStrapiAuth() not useStrapi() — consistent with all components (resumen.vue, FormProfile.vue, etc.)
- [103-01] MallTransaction instantiated per-call in authorizeCharge() (not singleton) for testability and avoiding module-level state
- [103-01] authorizeCharge() takes parentBuyOrder/childBuyOrder as parameters — caller controls buy_order uniqueness per retry attempt
- [104-01] Cancellation proceeds even if Transbank deleteInscription fails — user intent is cancellation, card deletion is best-effort
- [104-01] pro_expires_at is intentionally NOT cleared on cancellation — subscription expires at period end (CANC-02)
- [104-01] Step 4 in cron sweeps expired cancelled users and deactivates them without calling authorizeCharge (card already deleted)
- [105-02] ResumePro.vue naming conflict resolved by renaming old card enrollment component to ResumeProCard.vue, freeing the name for payment receipt
- [105-02] PRO checkout components use no adStore — state passed via props/emits and v-model for isInvoice
- [105-02] CheckoutPro uses window.location.href GET redirect for Oneclick (not POST form like Webpay Plus)
- [105-01] pro_pending_invoice stored on user to thread is_invoice from proCreate through Transbank GET redirect (no JWT present)
- [105-01] Order+Facto creation is non-fatal in proResponse and chargeUser — subscription/renewal continues on document failure
- [105-01] Cron uses isInvoice=false (boleta) by default — invoice preference storage for recurring charges is deferred
- [105-01] proResponse redirects to /pro/pagar/gracias?order={documentId}; fallback to /pro/gracias if order creation fails

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260321-hje | Protect pro fields in user update endpoint and verify oneclick pro status management | 2026-03-21 | 9768011b | [260321-hje-protect-pro-fields](./quick/260321-hje-protect-pro-fields-in-user-update-endpoi/) |
| 260321-k2b | Add sort_priority field to ads for featured+PRO ordering in /anuncios listing | 2026-03-21 | 679271a1 | [260321-k2b-add-sort-priority](./quick/260321-k2b-add-sort-priority-field-to-ads-for-featu/) |

### Roadmap Evolution

- Phase 103.1 inserted after Phase 103: Remove pro boolean — use pro_status as single source of truth (URGENT)
- Phase 105 added: PRO subscription checkout page

### Blockers/Concerns (open)

- Oneclick Mall must be contracted separately with Transbank for production (separate from Webpay Plus)

## Session Continuity

Last session: 2026-03-21T21:50:52.033Z
Stopped at: Completed 105-01-PLAN.md
Resume file: None
