---
phase: 04-split-legal-pages-into-4-documents-with-dashboard-management
plan: 08
subsystem: ui
tags: [nuxt, vue, seo, routing, reserved-usernames]

# Dependency graph
requires: []
provides:
  - "/terminos-y-condiciones-de-uso page (renamed from /condiciones-de-uso via git mv)"
  - "301 redirect /condiciones-de-uso -> /terminos-y-condiciones-de-uso"
  - "RESERVED_USERNAMES synced in both apps/website and apps/strapi with new legal slugs"
  - "LightboxCookies.vue pointing to /politicas-de-cookies"
  - "sitemap.vue entries for Términos, Cookies, Seguridad"
affects: [04-01, 04-02, 04-03, 04-04, 04-05, 04-06, 04-07, 04-09]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - apps/website/app/pages/terminos-y-condiciones-de-uso.vue
    - apps/website/app/components/TermsDefault.vue
    - apps/website/nuxt.config.ts
    - apps/website/app/shared/constants.ts
    - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
    - apps/website/app/components/FormRegister.vue
    - apps/website/app/components/FormTerms.vue
    - apps/website/app/components/LightboxCookies.vue
    - apps/website/app/components/MenuAbout.vue
    - apps/website/app/components/MenuFooter.vue
    - apps/website/app/pages/sitemap.vue

key-decisions:
  - "Kept condiciones-de-uso in RESERVED_USERNAMES (protects old redirect-source slug from being claimed) while adding terminos-y-condiciones-de-uso, politicas-de-cookies, politicas-de-seguridad"
  - "LightboxCookies.vue link + prose both updated to Política de Cookies for consistency (link target changed from privacidad to cookies)"
  - "No new nav entries added to MenuAbout/MenuFooter for Cookies/Seguridad — scope was rename-only per plan"

patterns-established:
  - "git mv for Nuxt page rename, redirect + reference updates as follow-on commits (2-commit CLAUDE.md pattern, done as 3 atomic task commits within this single plan)"

requirements-completed: [LEGAL-SPLIT-08, LEGAL-SPLIT-09]

# Metrics
duration: 25min
completed: 2026-07-01
---

# Phase 04 Plan 08: Rename condiciones-de-uso to terminos-y-condiciones-de-uso Summary

**Renamed `/condiciones-de-uso` to `/terminos-y-condiciones-de-uso` via `git mv` with a 301 redirect, relabeled every visible "Condiciones de uso" reference to "Términos y Condiciones de Uso" across 8 files, kept `RESERVED_USERNAMES` in lockstep between website and Strapi, repointed `LightboxCookies.vue` to the new dedicated Cookies page, and added 3 sitemap entries.**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-07-01
- **Tasks:** 3 completed
- **Files modified:** 11

## Accomplishments
- Page renamed with Git history preserved (`git mv`); SEO title/description/url and structured data updated to the new URL and Spanish label
- `TermsDefault.vue` H1 and hero prose updated to "Términos y Condiciones de Uso"
- 301 redirect added in `nuxt.config.ts` routeRules for the old public URL
- `RESERVED_USERNAMES` updated in both `apps/website/app/shared/constants.ts` and `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — kept in lockstep with 3 new slugs added, old slug retained
- All reference points updated: `FormRegister.vue`, `FormTerms.vue` (checkbox link/label/yup messages), `LightboxCookies.vue` (link target + prose now reference Política de Cookies), `MenuAbout.vue`, `MenuFooter.vue` (nav label/link rename), `sitemap.vue` (3 new entries + `IconScrollText` import)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename condiciones-de-uso.vue and update its content/labels + TermsDefault.vue H1** - `e0a80776` (refactor)
2. **Task 2: Add 301 redirect in nuxt.config.ts and update RESERVED_USERNAMES in both apps** - `fc7088d2` (feat)
3. **Task 3: Update all reference-point files (FormRegister, FormTerms, LightboxCookies, MenuAbout, MenuFooter, sitemap)** - `3ef4d71d` (refactor)

## Files Created/Modified
- `apps/website/app/pages/terminos-y-condiciones-de-uso.vue` - renamed page, SEO block updated to new URL/label
- `apps/website/app/components/TermsDefault.vue` - H1 + hero paragraph relabeled
- `apps/website/nuxt.config.ts` - added public 301 redirect entry in routeRules
- `apps/website/app/shared/constants.ts` - RESERVED_USERNAMES: kept old slug, added 3 new slugs
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` - RESERVED_USERNAMES Set kept in lockstep
- `apps/website/app/components/FormRegister.vue` - checkbox link/label + yup error messages updated
- `apps/website/app/components/FormTerms.vue` - checkbox link/label updated
- `apps/website/app/components/LightboxCookies.vue` - link target + prose now point to Política de Cookies
- `apps/website/app/components/MenuAbout.vue` - nav link/label/aria-label/title renamed
- `apps/website/app/components/MenuFooter.vue` - footer link/label renamed
- `apps/website/app/pages/sitemap.vue` - added IconScrollText import + 3 new sitemap entries (Términos, Cookies, Seguridad)

## Decisions Made
- Kept `condiciones-de-uso` in both `RESERVED_USERNAMES` lists (protects the redirect-source slug from being claimed as a username) while adding the 3 new slugs, per plan instruction
- `LightboxCookies.vue`'s body prose sentence was updated alongside the link target for internal consistency (both now reference "Política de Cookies")
- No new About/Footer nav entries added for the Cookies/Seguridad pages — plan scoped this file set to rename-only

## Deviations from Plan

None - plan executed exactly as written. All 3 task-level automated verification checks passed as specified in the plan.

## Issues Encountered

**Worktree isolation gap (pre-execution):** This plan's phase directory (`04-split-legal-pages-into-4-documents-with-dashboard-management/`) did not exist in this parallel-executor worktree — it existed only as untracked files in the main worktree (`/home/gab/Code/waldo-project`), alongside sibling plans 04-01 through 04-09 for other parallel agents. Copied only the phase directory into this worktree to read the plan/research files; verified every target file's current content against the plan's quoted "current content" before editing (all matched exactly). Per orchestrator guidance, the copied sibling planning files (04-01 through 04-07, 04-09, CONTEXT, RESEARCH, DISCUSSION-LOG) were deliberately left untracked/unstaged and were never added to any commit — only this plan's actual code changes plus this SUMMARY were committed.

**TypeScript verification not run:** No `node_modules` exist anywhere in this worktree (confirmed via search), so `vue-tsc --noEmit` could not be executed here. This is reported honestly rather than claimed as passed — the orchestrator or a follow-up CI run should verify typecheck passes after merge. All edits are simple string/label changes with no type-shape changes, so risk is low, but this was not empirically verified in this session.

**Sibling routes not yet present:** `/politicas-de-cookies` and `/politicas-de-seguridad` (referenced by `LightboxCookies.vue` and `sitemap.vue` in this plan) are created by sibling plans 04-01 through 04-07, which were not present/executed in this worktree. This is expected — this plan is independent (`depends_on: []`) and only adds link references; the routes will resolve once the sibling plans are merged.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- This plan's scope (URL rename + reference updates) is fully complete and self-contained
- Depends on sibling plans 04-01–04-07 landing (new Cookies/Seguridad content-types + pages) for the newly-referenced routes to resolve at runtime — no action needed from this plan, just a merge-order note
- `vue-tsc --noEmit` should be run once in an environment with `node_modules` installed to confirm zero type errors before this branch merges

---
*Phase: 04-split-legal-pages-into-4-documents-with-dashboard-management*
*Completed: 2026-07-01*
