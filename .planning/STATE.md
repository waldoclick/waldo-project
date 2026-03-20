---
gsd_state_version: 1.0
milestone: v1.46
milestone_name: PRO Subscriptions (Webpay Oneclick)
status: defining_requirements
last_updated: "2026-03-20"
last_activity: "2026-03-20 — Milestone v1.46 started"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-20)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Defining requirements for v1.46 PRO Subscriptions

## Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-20 — Milestone v1.46 started

```
Progress: [░░░░░░░░░░] 0%
```

## Accumulated Context

### Key Decisions (carry forward)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- `transbank-sdk@5.0.0` already installed — includes Oneclick Mall support via `Oneclick.MallInscription` and `Oneclick.MallTransaction`
- Oneclick Mall requires separate commerce codes from Webpay Plus — `ONECLICK_COMMERCE_CODE` and `ONECLICK_CHILD_COMMERCE_CODE`
- `username` parameter must be identical across inscription.start(), transaction.authorize(), and inscription.delete() — use `user-{documentId}`
- Flow service kept but unused — Oneclick replaces Flow for PRO subscriptions
- `pro` boolean field already exists on User schema
- `MemoPro.vue` already calls `POST /payments/pro` with Swal confirmation
- Price set via `PRO_MONTHLY_PRICE` env var (not hardcoded)
- Sandbox credentials available in SDK for integration testing

### Blockers/Concerns (open)

- Oneclick Mall must be contracted with Transbank for production (separate from Webpay Plus)
