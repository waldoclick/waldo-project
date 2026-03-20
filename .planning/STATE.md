---
gsd_state_version: 1.0
milestone: v1.46
milestone_name: PRO Subscriptions (Webpay Oneclick)
status: executing
stopped_at: Completed 102-02-PLAN.md — awaiting human verification checkpoint (Task 3)
last_updated: "2026-03-20T07:47:48.489Z"
last_activity: "2026-03-20 — Completed 102-01: OneclickService + inscription API routes (9 files, 7 tests passing)"
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
  percent: 10
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-20)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 102 — Oneclick Service + Inscription Flow

## Position

Phase: 102 of 104 (Oneclick Service + Inscription Flow)
Plan: 02 complete — awaiting human verification (Task 3 checkpoint), then ready for Phase 103
Status: In progress
Last activity: 2026-03-20 — Completed 102-02: Frontend Oneclick wiring (MemoPro.vue + /pro/gracias page)

```
Progress: [██████████] 100%
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

### Blockers/Concerns (open)

- Oneclick Mall must be contracted separately with Transbank for production (separate from Webpay Plus)

## Session Continuity

Last session: 2026-03-20T07:47:48.486Z
Stopped at: Completed 102-02-PLAN.md — awaiting human verification checkpoint (Task 3)
Resume file: None
