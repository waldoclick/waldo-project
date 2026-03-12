---
gsd_state_version: 1.0
milestone: v1.28
milestone_name: Logout Store Cleanup
status: completed
stopped_at: Completed 062-02-PLAN.md
last_updated: "2026-03-12T22:39:10.440Z"
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
  percent: 75
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-12 after v1.28 milestone start)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 062 — Logout Store Cleanup (roadmap ready, planning next)

## Position

**Milestone:** v1.28 — IN PROGRESS
**Phase:** 062 — Logout Store Cleanup
**Status:** v1.28 milestone complete

**Progress:** [████████░░] 75%

**Stopped at:** Completed 062-02-PLAN.md

## Session Log

- 2026-03-12: Milestone v1.28 started — Logout Store Cleanup
- 2026-03-12: Roadmap created — Phase 062 defined (6 requirements, 1 phase, 5 success criteria)

### Key Decisions

- **062-01:** Explicitly import `useStrapiAuth`/`navigateTo` from `#imports` in `useLogout.ts` for Vitest testability. Added `#imports` alias in vitest.config.ts → `tests/stubs/imports.stub.ts`.
- **062-02:** Remove `router.push('/')` from all three logout handlers — navigation handled inside `useLogout` composable. Remove `appStore.closeMobileMenu()` from MobileBar logout handler — `useAppStore.$reset()` handles it.

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
