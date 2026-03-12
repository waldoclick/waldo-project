---
gsd_state_version: 1.0
milestone: v1.28
milestone_name: Logout Store Cleanup
current_phase: 062
status: roadmap_ready
stopped_at: Roadmap created — Phase 062 ready for planning
last_updated: "2026-03-12T00:00:00.000Z"
last_activity: "2026-03-12 — Roadmap created for v1.28"
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12 after v1.28 milestone start)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 062 — Logout Store Cleanup (roadmap ready, planning next)

## Position

**Milestone:** v1.28 — IN PROGRESS
**Phase:** 062 — Logout Store Cleanup
**Status:** Roadmap created ▸ awaiting `/gsd-plan-phase 062`

**Progress:** ░░░░░░░░░░ 0/1 phases complete

**Stopped at:** Roadmap created. Phase 062 defined with 5 success criteria covering all 6 requirements. Ready for plan.

## Session Log

- 2026-03-12: Milestone v1.28 started — Logout Store Cleanup
- 2026-03-12: Roadmap created — Phase 062 defined (6 requirements, 1 phase, 5 success criteria)

### Blockers/Concerns

None.

### Accumulated Context

**Architecture decisions locked in:**
- `useLogout` composable in `apps/website/app/composables/` — single responsibility: reset all user stores then call `useStrapiAuth().logout()`, then `navigateTo('/')`
- Store reset order: `useAdStore.$reset()` → `useHistoryStore.$reset()` → `useMeStore.$reset()` → `useUserStore.$reset()` → `useAdsStore.$reset()` → `useAppStore.$reset()` → auth logout → navigate
- Three components to update: `MenuUser.vue`, `MobileBar.vue`, `SidebarAccount.vue` — replace inline `useStrapiAuth().logout()` calls with `useLogout()`
- `typeCheck: true` is enabled in website — phase must end with clean `nuxt typecheck`
- No Strapi changes, no dashboard changes — `apps/website` only
- `useMeStore` and `useUserStore` have no `persist` but hold in-memory state that leaks between sessions; `$reset()` clears them regardless
- Stores with `persist: localStorage` requiring cleanup: `useAdStore` (wizard data), `useAdsStore` (listings cache, RISK-labeled), `useHistoryStore` (browsing history), `useAppStore` (referer/contactFormSent)
- Public/reference stores explicitly out of scope: `useRelatedStore`, `useCategoriesStore`, `useFilterStore`, `useRegionsStore`, `useCommunesStore`, `useConditionsStore`, `useFaqsStore`, `useIndicatorStore`
