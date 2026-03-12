---
gsd_state_version: 1.0
milestone: v1.28
milestone_name: Logout Store Cleanup
current_phase: null
status: defining_requirements
stopped_at: Milestone v1.28 started 2026-03-12
last_updated: "2026-03-12T00:00:00.000Z"
last_activity: "2026-03-12 — Milestone v1.28 started"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12 after v1.28 milestone start)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase: Not started (defining requirements)

## Position

**Milestone:** v1.28 — IN PROGRESS
**Status:** Defining requirements

**Stopped at:** Milestone v1.28 started. Requirements being defined.

## Session Log

- 2026-03-12: Milestone v1.28 started — Logout Store Cleanup

### Blockers/Concerns

None.

### Accumulated Context

- Website has 3 logout entry points: `MenuUser.vue`, `MobileBar.vue`, `SidebarAccount.vue` — all call `useStrapiAuth().logout()` with no store cleanup
- `useMeStore` and `useUserStore` have no `persist` but hold in-memory user state that should be reset on logout
- Stores with `persist: localStorage` that must be cleared on logout: `useAdStore` (ad wizard), `useAdsStore` (listings cache), `useHistoryStore` (browsing history), `useAppStore` (referer/contactFormSent)
- Centralizing logout in a `useLogout` composable will eliminate the 3-way code duplication
