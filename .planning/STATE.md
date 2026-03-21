---
gsd_state_version: 1.0
milestone: v1.46
milestone_name: PRO Subscriptions (Webpay Oneclick)
status: executing
stopped_at: Completed 103.1-02-PLAN.md
last_updated: "2026-03-21T18:56:50.194Z"
last_activity: 2026-03-21
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 6
  completed_plans: 5
  percent: 44
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-20)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 103.1 — remove-pro-boolean-use-pro-status-as-single-source-of-truth

## Position

Phase: 104 of 104 (cancellation + account management)
Plan: Not started
Status: In progress
Last activity: 2026-03-21

```
Progress: [█████░░░░░] 44%
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

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260321-hje | Protect pro fields in user update endpoint and verify oneclick pro status management | 2026-03-21 | 9768011b | [260321-hje-protect-pro-fields](./quick/260321-hje-protect-pro-fields-in-user-update-endpoi/) |
| 260321-k2b | Add sort_priority field to ads for featured+PRO ordering in /anuncios listing | 2026-03-21 | 679271a1 | [260321-k2b-add-sort-priority](./quick/260321-k2b-add-sort-priority-field-to-ads-for-featu/) |

### Roadmap Evolution

- Phase 103.1 inserted after Phase 103: Remove pro boolean — use pro_status as single source of truth (URGENT)

### Blockers/Concerns (open)

- Oneclick Mall must be contracted separately with Transbank for production (separate from Webpay Plus)

## Session Continuity

Last session: 2026-03-21T18:56:50.191Z
Stopped at: Completed 103.1-02-PLAN.md
Resume file: None
