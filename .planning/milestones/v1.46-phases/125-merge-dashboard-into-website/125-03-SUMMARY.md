---
phase: 125-merge-dashboard-into-website
plan: "03"
subsystem: components
tags: [component-migration, rename, nuxt-auto-import, collision-prevention]
dependency_graph:
  requires: [125-02]
  provides: [dashboard-components-in-website, collision-free-namespace]
  affects: [apps/website/app/components, apps/dashboard/app/components]
tech_stack:
  added: []
  patterns: [rename-before-copy, Dashboard-suffix]
key_files:
  created: []
  modified:
    - apps/website/app/components/ (95 flat components + 3 icons added)
    - apps/website/app/layouts/dashboard.vue (renamed component tags)
    - apps/dashboard/app/components/ (27 renames + all flat moved out)
    - apps/dashboard/app/pages/ (stale tag references updated)
    - apps/dashboard/app/layouts/ (stale tag references updated)
decisions:
  - "HeroDefault→HeroDefaultDashboard (not HeroDashboard) — HeroDashboard.vue is a pre-existing unrelated component; append-style keeps namespaces separate"
  - "Website dashboard.vue layout updated in same Task 1 commit — it references dashboard-versioned components (MenuDefault→MenuDefaultDashboard, etc.)"
  - "comm -12 collision check returns only IconX.vue after Task 2 — the single expected collision (identical files, website version kept)"
metrics:
  duration: ~25 minutes
  completed: "2026-06-10T15:52:00Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 130+
---

# Phase 125 Plan 03: Component Collision Resolution + Migration Summary

Renamed 27 colliding dashboard components with `Dashboard` suffix via `git mv`, updated all internal references, then moved all 95 flat components + 3 exclusive icons into `apps/website/app/components/`. Nuxt 4 auto-import namespace is now collision-free — no dashboard component silently shadows a website component.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rename 27 colliding dashboard components + update references | 695aa780 | 27 renames, 80+ reference updates across pages/components/layouts |
| 2 | Copy non-colliding components + dashboard-exclusive icons to website | ffa763f8 | 98 files moved (95 components + 3 icons) |

## Decisions Made

1. **HeroDefault→HeroDefaultDashboard (not HeroDashboard)** — The plan examples showed `HeroDefault→HeroDashboard` but `HeroDashboard.vue` was already a pre-existing component in dashboard. The append-style rule (`FULL PascalCase + Dashboard`) was applied consistently: `HeroDefault→HeroDefaultDashboard`. The existing `HeroDashboard.vue` moved to website separately via Task 2's bulk move and satisfies the `must_haves` artifact on its own.

2. **Website `dashboard.vue` layout updated in Task 1** — The layout referenced 4 renamed components (`MenuDefault`, `MenuMobile`, `HeaderDefault`, `FooterDefault`) and was updated in the same Task 1 commit alongside dashboard pages/components, keeping the rename-reference update atomic.

3. **dashboard.vue layout in `apps/dashboard/app/layouts/` also updated** — Both copies (dashboard's own and website's migrated copy) were updated in Task 1 to reference the new Dashboard-suffixed names.

## Verification Results

- `comm -12` of all component basenames returns only `IconX.vue` (single expected collision — identical files)
- `ls apps/dashboard/app/components/*.vue | wc -l` returns 0 (all flat components moved)
- Renamed components confirmed: `HeroDashboard.vue`, `HeaderDefaultDashboard.vue`, `FormLoginDashboard.vue` all exist in `apps/website/app/components/`
- Dashboard-exclusive icons confirmed: `IconGtm.vue`, `iconBetterStack.vue`, `iconCloudflare.vue` in `apps/website/app/components/icons/`
- Zero stale old-name tag references remain in `apps/dashboard/app/` or `apps/website/app/layouts/dashboard.vue`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `HeroDefaultDashboard` vs `HeroDashboard` plan example**
- **Found during:** Task 1 planning
- **Issue:** Plan examples said `HeroDefault→HeroDashboard` but a pre-existing `HeroDashboard.vue` component already existed in dashboard (confirmed by `git log` showing it was created in phase 114). Applying the example mapping would create a collision with the pre-existing component.
- **Fix:** Applied the stated rule ("append Dashboard to the FULL PascalCase name") consistently: `HeroDefault→HeroDefaultDashboard`. The pre-existing `HeroDashboard.vue` moved cleanly to website in Task 2.
- **Files modified:** All staged renames use append-style
- **Commit:** 695aa780

## Known Stubs

None. This plan performs file moves and renames only — no new component implementations. Component bodies still reference `useSessionX` composables (not yet available in website) but that is deferred to Plans 04–06 per plan specification.

## Self-Check: PASSED

- `apps/website/app/components/HeroDashboard.vue` — FOUND
- `apps/website/app/components/HeaderDefaultDashboard.vue` — FOUND
- `apps/website/app/components/icons/iconBetterStack.vue` — FOUND
- Commits `695aa780` and `ffa763f8` — FOUND in git log
- `comm -12` returns only `IconX.vue` — VERIFIED
