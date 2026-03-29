---
gsd_state_version: 1.0
milestone: v1.47
milestone_name: (planning)
status: idle
stopped_at: v1.46 milestone archived
last_updated: "2026-03-29T00:00:00.000Z"
last_activity: 2026-03-29 - Completed quick task 260329-pa1: fix CSP violations in staging
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-29)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Planning next milestone

## Position

Milestone v1.46 PRO Subscriptions archived. Ready to start next milestone.

```
Progress: [          ] 0%
```

## Accumulated Context

### Key Decisions (carry forward)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- `pro_status === "active"` is the single source of truth for PRO membership (no `pro` boolean)
- Oneclick Mall must be contracted separately with Transbank for production (separate from Webpay Plus)

### Blockers/Concerns (open)

- Oneclick Mall must be contracted separately with Transbank for production
- Dashboard "Recuperar contraseña" reCAPTCHA bug: `FormForgotPassword.vue` in dashboard does not send reCAPTCHA token (pre-existing bug from v1.37)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260329-pa1 | fix CSP violations in staging - add missing script-src connect-src worker-src directives for Google GTM reCAPTCHA Hotjar Cloudflare Sentry | 2026-03-29 | f5ead3f9 | [260329-pa1-fix-csp-violations-in-staging-add-missin](./quick/260329-pa1-fix-csp-violations-in-staging-add-missin/) |

## Session Continuity

Last session: 2026-03-29
Stopped at: v1.46 milestone complete — archived to .planning/milestones/v1.46-ROADMAP.md
Resume file: None
