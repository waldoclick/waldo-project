---
gsd_state_version: 1.0
milestone: v1.35
milestone_name: Gift Reservations to Users
current_phase: 075
status: roadmap_ready
last_updated: "2026-03-13T00:00:00Z"
last_activity: "2026-03-13 — Roadmap created (2 phases: 075–076)"
progress:
  total_phases: 2
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13 after v1.35 milestone started)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 075 — Strapi Gift Endpoints

## Position

**Milestone:** v1.35 — Gift Reservations to Users
**Current Phase:** 075 — Strapi Gift Endpoints
**Status:** Roadmap ready — awaiting phase planning

```
Phase 075 ░░░░░░░░░░  0%   Strapi Gift Endpoints
Phase 076 ░░░░░░░░░░  0%   Dashboard Gift Lightbox
Overall   ░░░░░░░░░░  0%   (0/2 phases)
```

Last activity: 2026-03-13 — Roadmap created (2 phases: 075–076)

## Accumulated Context

### Key Decisions (from prior milestones)

- All business logic lives in Strapi; dashboard is a stateless HTTP client
- LightboxRazon.vue pattern: `isOpen` prop + `@close` emit (controlled pattern)
- Swal confirmation used in dashboard for destructive/irreversible actions
- sendMjmlEmail() for all email notifications; email failures wrapped in try/catch (non-fatal)
- `strapi.db.query` for server-side role filtering (not forgeable by clients)
- LightboxArticles.vue: most recent lightbox implementation — reference for structure
- AGENTS.md BEM convention: block + modifier namespace for all SCSS

### Blockers/Concerns

None.
