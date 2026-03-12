---
gsd_state_version: 1.0
milestone: v1.29
milestone_name: News Manager
status: in_progress
stopped_at: Phase 063 complete — ready to plan Phase 064
last_updated: "2026-03-12T01:00:00.000Z"
progress:
  total_phases: 2
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
  percent: 50
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12 after v1.29 milestone start)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.29 — News Manager (roadmap defined, ready for Phase 063)

## Position

**Milestone:** v1.29 — IN PROGRESS
**Phase:** 064 — Dashboard News UI (not started)
**Status:** Phase 063 complete — ready to plan Phase 064

**Progress:** [█████░░░░░] 50%

**Stopped at:** Phase 063 complete — next step: `/gsd-plan-phase 064`

## Session Log

- 2026-03-12: Milestone v1.28 complete — Logout Store Cleanup shipped
- 2026-03-12: Milestone v1.29 started — News Manager
- 2026-03-12: Roadmap created — Phases 063 (Strapi schema) + 064 (Dashboard UI) defined; 9/9 requirements mapped
- 2026-03-12: Phase 063 complete — News content type created in Strapi (schema.json + controller + routes + service); /api/news endpoint ready

### Key Decisions

- Phase 063 groups all Strapi backend work (NEWS-01, 02, 03, 08) — content type schema + SEO fields + native draft/publish
- Phase 064 groups all dashboard frontend work (NEWS-04, 05, 06, 07, 09) — list/create/edit/delete + SEO input
- Granularity: coarse — 2 phases is the natural delivery boundary for backend-then-frontend

### Blockers/Concerns

None.

### Accumulated Context

**From v1.28:**
- `useLogout` composable in `apps/website/app/composables/` — single responsibility: reset all user stores then call `useStrapiAuth().logout()`, then `navigateTo('/')`
- `reset()` action pattern for Composition API stores (no built-in `$reset()`)
- `#imports` alias in vitest.config.ts for Nuxt auto-import mocking in bare Vitest environment

**For v1.29:**
- Content type name: `News` in Strapi (collection type)
- Relation target: existing `categorias` content type (many-to-many or many-to-one, optional)
- Draft/publish: use Strapi's native `draftAndPublish: true` option — no custom `status` field
- SEO fields: `seo_title` (short text, optional) and `seo_description` (short text, optional) — added to Phase 063 schema
- Dashboard pattern to follow: existing ads/users/orders sections in `apps/dashboard`
- No website public view in this milestone — dashboard-only
