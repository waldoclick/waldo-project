---
phase: quick
plan: 260611-pyz
subsystem: ui
tags: [nuxt, vue, components, dead-code, cleanup]

# Dependency graph
requires: []
provides:
  - 19 orphaned Phase 125 migration components deleted from apps/website
  - 2 stale explicit imports removed (FormPassword, FormPack) from dashboard pages
affects: [codacy, vue-tsc]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - apps/website/app/pages/dashboard/account/profile.vue
    - apps/website/app/pages/dashboard/maintenance/packs/new.vue

key-decisions:
  - "FormPassword and FormPack remain active via Nuxt auto-import; only explicit import lines were removed"
  - "PacksDashboard, FormPackDashboard, FormPasswordDashboard left untouched — active components"

requirements-completed: [QUICK-260611-pyz]

# Metrics
duration: 8min
completed: 2026-06-11
---

# Quick Task 260611-pyz: Delete Orphaned Unused Components and Fix Stale Imports Summary

**19 dead dashboard-migration components purged and 2 stale explicit import lines removed; vue-tsc exits 0 clean**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-06-11T00:00:00Z
- **Completed:** 2026-06-11T00:08:00Z
- **Tasks:** 3
- **Files modified:** 21 (2 pages modified, 19 components deleted)

## Accomplishments

- Removed 2 stale explicit imports (FormPassword, FormPack) from dashboard pages — these components are still rendered via Nuxt auto-import, only the now-unnecessary import statements were deleted
- Deleted all 19 orphaned component files left over from Phase 125 dashboard-into-website migration via `git rm` (1380 lines of dead code removed)
- Confirmed vue-tsc --noEmit exits 0 with no errors referencing any deleted file

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove stale explicit imports from two pages** - `26360116` (chore)
2. **Task 2: Delete orphaned Dashboard auth variant and legacy components** - `eec60978` (chore)
3. **Task 3: Verify TypeScript build passes** - (verification only, no commit needed)

## Files Created/Modified

- `apps/website/app/pages/dashboard/account/profile.vue` - Removed unused `import FormPassword from "@/components/FormPassword.vue"` (line 19)
- `apps/website/app/pages/dashboard/maintenance/packs/new.vue` - Removed unused `import FormPack from "@/components/FormPack.vue"` (line 15)

**Deleted (19 files):**
- `apps/website/app/components/FormLoginDashboard.vue`
- `apps/website/app/components/FormForgotPasswordDashboard.vue`
- `apps/website/app/components/FormResetPasswordDashboard.vue`
- `apps/website/app/components/FormVerifyCodeDashboard.vue`
- `apps/website/app/components/IntroduceAuthDashboard.vue`
- `apps/website/app/components/LightboxAdblockDashboard.vue`
- `apps/website/app/components/LightboxCookiesDashboard.vue`
- `apps/website/app/components/AvatarDashboard.vue`
- `apps/website/app/components/LoadingDashboard.vue`
- `apps/website/app/components/FormDevDashboard.vue`
- `apps/website/app/components/LogoWhiteDashboard.vue`
- `apps/website/app/components/PictureDashboard.vue`
- `apps/website/app/components/AccountPacks.vue`
- `apps/website/app/components/AdArchiveProfile.vue`
- `apps/website/app/components/BarResume.vue`
- `apps/website/app/components/MapDefault.vue`
- `apps/website/app/components/ResumeAd.vue`
- `apps/website/app/components/SellerContact.vue`
- `apps/website/app/components/ThanksDefault.vue`

## Decisions Made

- FormPassword and FormPack are active components referenced in templates of their respective pages — only the redundant explicit import statements (which Nuxt auto-import makes unnecessary) were removed
- PacksDashboard.vue, FormPackDashboard.vue, FormPasswordDashboard.vue are active dashboard components and were explicitly preserved

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Dead code eliminated, component surface reduced by 19 files
- Codacy unused-code warnings from these orphaned files will be resolved

---
*Phase: quick*
*Completed: 2026-06-11*
