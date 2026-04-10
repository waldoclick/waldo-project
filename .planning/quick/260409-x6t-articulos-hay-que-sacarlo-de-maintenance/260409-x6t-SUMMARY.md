---
phase: 260409-x6t
plan: 01
subsystem: dashboard-navigation
tags: [navigation, articles, refactor, rail-menu]
dependency_graph:
  requires: []
  provides: [/articles top-level route, MenuMain Newspaper rail icon]
  affects: [MenuMain, MenuMaintenance, MenuMobile, ToolbarDefault, FormArticle]
tech_stack:
  added: []
  patterns: [git-mv-rename, flat-rail-link-pattern]
key_files:
  created: []
  modified:
    - apps/dashboard/app/pages/articles/index.vue
    - apps/dashboard/app/pages/articles/new.vue
    - apps/dashboard/app/pages/articles/[id]/index.vue
    - apps/dashboard/app/pages/articles/[id]/edit.vue
    - apps/dashboard/app/components/MenuMain.vue
    - apps/dashboard/app/components/MenuMaintenance.vue
    - apps/dashboard/app/components/MenuMobile.vue
    - apps/dashboard/app/components/ToolbarDefault.vue
    - apps/dashboard/app/components/FormArticle.vue
decisions:
  - Articles promoted to top-level /articles route via git mv (preserves rename history) — no copy+delete
  - Newspaper rail link added as flat NuxtLink (no panel, no activeMenu union change) — follows dashboard home icon pattern
  - resolveActiveMenu in dashboard.vue not modified — /articles falls through to "default" (correct, no panel)
metrics:
  duration: ~10 minutes
  completed: 2026-04-09
  tasks: 3
  files: 9
---

# Quick Task 260409-x6t: Promote Articles from /maintenance/articles to /articles

**One-liner:** Articles maintainer relocated from maintenance sub-route to top-level /articles with a Newspaper rail icon in MenuMain using git mv to preserve rename history.

## Objective

Move the articles maintainer out of `/maintenance` into a top-level `/articles` route, add a Newspaper icon in the MenuMain rail linking to it, and remove the Artículos entry from MenuMaintenance. Articles is high-traffic content already pinned in MenuMobile and ToolbarDefault — promoting it reduces clicks and aligns with the established rail-based navigation pattern.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Move /maintenance/articles pages to /articles using git mv | 09fc3d9e | articles/index.vue, articles/new.vue, articles/[id]/index.vue, articles/[id]/edit.vue |
| 2 | Add Newspaper rail icon to MenuMain, remove Artículos from MenuMaintenance | f8394a7e | MenuMain.vue, MenuMaintenance.vue |
| 3 | Repoint remaining /maintenance/articles refs to /articles | 162dfdb2 | MenuMobile.vue, ToolbarDefault.vue, FormArticle.vue |

## Changes Made

### Task 1 — Page relocation (git mv)

Used `git mv` to relocate all four page files from `maintenance/articles/` to `articles/`, preserving Git rename history. After relocation, updated internal route strings:

- `articles/index.vue`: `to="/maintenance/articles/new"` → `to="/articles/new"`
- `articles/new.vue`: breadcrumb `to="/maintenance/articles"` → `to="/articles"`
- `articles/[id]/index.vue`: edit link `:to="/maintenance/articles/${id}/edit"` → `/articles/${id}/edit`; breadcrumb `to="/maintenance/articles"` → `to="/articles"`
- `articles/[id]/edit.vue`: already had `/articles` in breadcrumbs — no change needed

### Task 2 — MenuMain and MenuMaintenance

**MenuMain.vue:**
- Added `Newspaper` to lucide-vue-next import
- Added flat `NuxtLink to="/articles"` with Newspaper icon between Dashboard home and Users links
- Did NOT modify `defineProps<{ activeMenu }>()` union — articles has no panel, falls to `"default"` in resolveActiveMenu

**MenuMaintenance.vue:**
- Removed entire Artículos `<li>` block (NuxtLink to="/maintenance/articles" + Newspaper icon)
- Removed `"/maintenance/articles"` from `knownSubRoutes` array
- Removed `Newspaper` from lucide-vue-next import (no longer referenced)

### Task 3 — Remaining component references

- `MenuMobile.vue`: `to="/maintenance/articles"` → `to="/articles"`
- `ToolbarDefault.vue`: `to="/maintenance/articles"` → `to="/articles"`
- `FormArticle.vue`: fallback `router.push("/maintenance/articles")` → `router.push("/articles")`

## Verification

- Zero `/maintenance/articles` references remain in `apps/dashboard/app/` or `apps/dashboard/server/`
- `yarn nuxt typecheck` clean (zero errors, only expected localhost warning from nuxt-site-config)
- Pre-commit hooks (ESLint + Prettier) passed on all three commits
- `git log --follow` works on moved files (rename history preserved)

## Deviations from Plan

None — plan executed exactly as written.

Note: `articles/[id]/edit.vue` breadcrumbs already referenced `/articles` (not `/maintenance/articles`) before this task — it was created in a prior session with the new path pre-applied. No additional change was needed for that file.

## Known Stubs

None — all routes are wired, all links point to real destinations.

## Self-Check: PASSED

- `apps/dashboard/app/pages/articles/index.vue` — FOUND
- `apps/dashboard/app/pages/articles/new.vue` — FOUND
- `apps/dashboard/app/pages/articles/[id]/index.vue` — FOUND
- `apps/dashboard/app/pages/articles/[id]/edit.vue` — FOUND
- Commits 09fc3d9e, f8394a7e, 162dfdb2 — all present in git log
