---
phase: 04-split-legal-pages-into-4-documents-with-dashboard-management
plan: 02
subsystem: api
tags: [strapi, seeders, legal-content, content-types, bootstrap]

# Dependency graph
requires:
  - phase: 04-01
    provides: cookie-policy and security-policy content-types (UIDs referenced by new seeders; not required for this plan's tsc pass since strapi.db.query UIDs are runtime strings, not compile-time unions)
provides:
  - Four independent, non-overlapping legal-doc seeders (term, policy, cookie-policy, security-policy) each sourced 1:1 from its own humanized docs/*.md file
  - policies.ts surgically split — Cookies/Seguridad content removed, leaving only Privacidad rows
  - Bootstrap wiring for all 4 seeders in src/index.ts
affects: [04-03, 04-04, 04-05, 04-06, 04-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "populate{X}(strapi) delete-then-recreate seeder pattern, one file per content-type, wired into bootstrap's APP_RUN_SEEDERS-gated try block"

key-files:
  created:
    - apps/strapi/seeders/cookie-policies.ts
    - apps/strapi/seeders/security-policies.ts
  modified:
    - apps/strapi/seeders/policies.ts
    - apps/strapi/seeders/terms.ts
    - apps/strapi/src/index.ts

key-decisions:
  - "cookie-policies.ts uses 13 rows (1:1 with docs/politica-de-cookies.md's 13 `##` headings) rather than preserving the old mixed array's 14-row intro/definition split — per RESEARCH.md's explicit resolution to follow the MD literally"
  - "Cross-document links converted from markdown relative paths to live site routes: terms.ts row 16 -> /politicas-de-privacidad, policies.ts row 18 -> /politicas-de-cookies"

requirements-completed: [LEGAL-SPLIT-01, LEGAL-SPLIT-03]

duration: 35min
completed: 2026-07-01
---

# Phase 04 Plan 02: Split legal-doc seeders into 4 independent, humanized files Summary

**Split the structurally mislabeled 53-row `policies.ts` (which secretly contained 3 different legal documents concatenated together) into 4 correct, non-overlapping seeders — one per content-type — each reworded from its own humanized markdown source in `docs/`.**

## Performance

- **Duration:** 35 min
- **Tasks:** 3
- **Files modified:** 5 (2 created, 3 modified)

## Accomplishments
- Created `apps/strapi/seeders/cookie-policies.ts` (13 rows) and `apps/strapi/seeders/security-policies.ts` (19 rows), both new, targeting the new `cookie-policy`/`security-policy` content-types from Plan 01
- Removed 33 mislabeled rows (14 Cookies + 19 Seguridad) from `policies.ts`, leaving exactly 20 Privacidad-only rows, reworded to match `docs/politica-de-privacidad.md`'s humanized tone
- Reworded all 27 rows of `terms.ts` to match `docs/terminos-y-condiciones.md`'s humanized tone (row count unchanged)
- Wired both new seeders into `apps/strapi/src/index.ts` bootstrap sequence
- Fixed a syntax bug (unescaped quote) introduced during Task 1 authoring, caught by `tsc --noEmit`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create cookie-policies.ts and security-policies.ts seeders** - `4122663b` (feat)
2. **Task 2: Split policies.ts and reword terms.ts** - `2409f5ef` (refactor)
3. **Task 3: Wire both new seeders into bootstrap** - `8060ded6` (feat)
4. **Fix: escape unescaped quote in cookie-policies.ts** - `e3872164` (fix)

## Files Created/Modified
- `apps/strapi/seeders/cookie-policies.ts` - New seeder, `populateCookiePolicies(strapi)`, 13 rows targeting `api::cookie-policy.cookie-policy`
- `apps/strapi/seeders/security-policies.ts` - New seeder, `populateSecurityPolicies(strapi)`, 19 rows targeting `api::security-policy.security-policy`
- `apps/strapi/seeders/policies.ts` - `policiesData` reduced from 53 to 20 rows (Cookies/Seguridad blocks + comment separators removed); reworded to humanized tone; cookie cross-link updated to `/politicas-de-cookies`
- `apps/strapi/seeders/terms.ts` - `termsData` reworded (still 27 rows); privacy cross-link updated to `/politicas-de-privacidad`
- `apps/strapi/src/index.ts` - 2 new imports + 2 new `await` calls inside the existing seeders try block

## Decisions Made
- Followed RESEARCH.md's explicit resolution for the Cookies row-count ambiguity: 13 rows (1:1 with the MD's 13 `##` headings), not 14 (the old mixed array's intro/definition split has no MD equivalent)
- Kept existing row titles from the old mixed `policiesData`/`termsData` arrays where they already matched RESEARCH.md's mapping tables — only reworded the `text` bodies to the humanized register, preserving 1:1 section correspondence

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Unescaped double quote broke cookie-policies.ts syntax**
- **Found during:** Post-Task-3 `tsc --noEmit` verification (row 6, "¿Cómo funciona el consentimiento?")
- **Issue:** The text field was a double-quoted string literal containing an unescaped `"sí"`, causing `TS1005` parse errors
- **Fix:** Switched that string literal to single quotes (matching existing precedent in the same file for strings containing double-quoted text)
- **Files modified:** `apps/strapi/seeders/cookie-policies.ts`
- **Verification:** `npx tsc --noEmit` from `apps/strapi` shows zero errors in any of the 5 files touched by this plan
- **Committed in:** `e3872164`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary correctness fix, caught by the plan's own verification step. No scope creep.

## Issues Encountered
None beyond the syntax fix above.

`npx tsc --noEmit` from `apps/strapi` reports 7 pre-existing errors in `src/middlewares/upload.ts` (file-type/mimetype typing) and `src/utils/ia.ts` (missing `opik` module) — confirmed via `git stash` to predate this plan's changes entirely (present at commit `4ffa1273`, before any Plan 02 work). None of these touch the 5 files modified by this plan. Plan 01 (parallel wave, sibling worktree) had not yet run in this worktree, so the `api::cookie-policy.cookie-policy` / `api::security-policy.security-policy` UIDs reference content-types not yet defined locally — verified empirically that this causes zero `tsc` errors, since `strapi.db.query()`'s UID argument is not a compile-time-checked union in this codebase's type setup.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 legal-doc seeders (term, policy, cookie-policy, security-policy) are correct, non-overlapping, and wired into bootstrap
- Row counts verified: terms 27, policies 20, cookie-policies 13, security-policies 19 (79 total)
- Ready for Plan 03+ (dashboard CRUD extraction for the 2 new content-types, frontend page wiring, cross-reference updates)
- Content-type schemas for `cookie-policy`/`security-policy` must land (Plan 01) before these seeders can actually run against a live Strapi instance — this plan only adds the seeder code, consistent with the Wave-1 parallel-plan design

---
*Phase: 04-split-legal-pages-into-4-documents-with-dashboard-management*
*Completed: 2026-07-01*
