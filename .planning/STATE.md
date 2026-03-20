---
gsd_state_version: 1.0
milestone: v1.46
milestone_name: PRO Subscriptions (Webpay Oneclick)
status: ready_to_plan
last_updated: "2026-03-20"
last_activity: "2026-03-20 — Roadmap created, 3 phases defined (102–104)"
progress:
  total_phases: 3
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-20)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 102 — Oneclick Service + Inscription Flow

## Position

Phase: 102 of 104 (Oneclick Service + Inscription Flow)
Plan: — (not yet planned)
Status: Ready to plan
Last activity: 2026-03-20 — Roadmap created for v1.46 PRO Subscriptions

```
Progress: [░░░░░░░░░░] 0%
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

### Blockers/Concerns (open)

- Oneclick Mall must be contracted separately with Transbank for production (separate from Webpay Plus)

## Session Continuity

Last session: 2026-03-20
Stopped at: Roadmap written — ready to plan Phase 102
Resume file: None
