---
gsd_state_version: 1.0
milestone: v1.29
milestone_name: News Manager
status: in_progress
stopped_at: Defining requirements
last_updated: "2026-03-12T00:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12 after v1.29 milestone start)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.29 — News Manager (defining requirements)

## Position

**Milestone:** v1.29 — IN PROGRESS
**Phase:** Not started (defining requirements)
**Status:** Defining requirements

**Progress:** [░░░░░░░░░░] 0%

**Stopped at:** Defining requirements

## Session Log

- 2026-03-12: Milestone v1.28 complete — Logout Store Cleanup shipped
- 2026-03-12: Milestone v1.29 started — News Manager

### Key Decisions

None yet.

### Blockers/Concerns

None.

### Accumulated Context

**From v1.28:**
- `useLogout` composable in `apps/website/app/composables/` — single responsibility: reset all user stores then call `useStrapiAuth().logout()`, then `navigateTo('/')`
- `reset()` action pattern for Composition API stores (no built-in `$reset()`)
- `#imports` alias in vitest.config.ts for Nuxt auto-import mocking in bare Vitest environment
