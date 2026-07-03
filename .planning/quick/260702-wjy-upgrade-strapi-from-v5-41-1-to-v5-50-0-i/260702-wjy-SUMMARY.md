---
phase: quick
plan: 260702-wjy
subsystem: infra
tags: [strapi, dependencies, upgrade, pnpm]

# Dependency graph
requires: []
provides:
  - "Strapi backend (apps/strapi) running on @strapi/* 5.50.0 (sdk-plugin on 5.4.0), 9 minor releases ahead of the prior 5.41.1 baseline"
affects: [apps/strapi, deployment, pm2]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - apps/strapi/package.json
    - pnpm-lock.yaml

key-decisions:
  - "Edited apps/strapi/package.json by hand and ran plain pnpm install, per plan — did NOT run the existing pnpm strapi:upgrade script (targets latest, which would have dragged @strapi/sdk-plugin to the unresearched 6.x major line)"
  - "All 9 core @strapi packages pinned to exact 5.50.0 (dropping pre-existing caret ranges on cloud-cli, plugin-sentry, provider-upload-cloudinary); @strapi/sdk-plugin pinned to exact 5.4.0 (last 5.x release, not 6.x)"
  - "Grepped apps/website for client-built oversized dollar-in filters and bulk-select patterns (selectedIds/selectAll/bulkAction) — zero matches in TS/Vue source; the v5.49.0 qs arrayLimit(20) ValidationError behavior change is closed as a non-issue for this codebase, not just assumed safe"

requirements-completed: []

# Metrics
duration: 24min
completed: 2026-07-03
---

# Quick Task 260702-wjy: Upgrade Strapi from 5.41.1 to 5.50.0 Summary

**All 10 @strapi/* packages in apps/strapi bumped to exact 5.50.0 (sdk-plugin 5.4.0), tsc clean, Jest shows zero regressions beyond the documented 4-suite baseline, and the frontend dollar-in oversized-array risk confirmed closed (no matches found).**

## Performance

- **Duration:** 24 min
- **Started:** 2026-07-03T03:22:47Z
- **Completed:** 2026-07-03T03:46:50Z
- **Tasks:** 3 (1 code change, 2 verification-only)
- **Files modified:** 2 (apps/strapi/package.json, pnpm-lock.yaml)

## Accomplishments
- 9 core @strapi packages (`strapi`, `plugin-users-permissions`, `provider-email-mailgun`, `utils`, `database`, `typescript-utils`, `cloud-cli`, `plugin-sentry`, `provider-upload-cloudinary`) pinned to exact `5.50.0`
- `@strapi/sdk-plugin` pinned to exact `5.4.0` (the last 5.x release; the published `6.1.1` line was explicitly out of scope and was NOT pulled)
- `pnpm install` from repo root resolved the workspace lockfile cleanly — no unresolved peer-dependency conflicts
- `tsc --noEmit` in `apps/strapi` exits 0 — zero new type errors from the 9-minor-version type-definition jump
- Full `npx jest --maxWorkers=2` run: 45/49 suites pass, and the 4 failing suites are exactly the documented pre-existing baseline (no new failures introduced)
- Confirmed via grep that `apps/website` has no client-constructed dollar-in filter arrays or bulk-select/select-all UI patterns that could exceed the v5.49.0 `qs` `arrayLimit` of 20 — closes the one open question left by RESEARCH.md

## Task Commits

1. **Task 1: Bump all @strapi package versions and install** - `b47eaf16` (chore)
2. **Task 2: Verify with typecheck and full Jest suite at limited concurrency** - verification-only, no source changes, no commit
3. **Task 3: Grep for oversized client-built dollar-in filters and flag manual smoke test** - read-only check on apps/website, no modifications, no commit

**Plan metadata:** (this commit) - `docs(260702-wjy): complete Strapi 5.50.0 upgrade quick task`

## Files Created/Modified
- `apps/strapi/package.json` - 9 core @strapi packages + sdk-plugin bumped to exact pinned versions (no carets)
- `pnpm-lock.yaml` - workspace lockfile updated to match resolved 5.50.0/5.4.0 dependency tree

## Decisions Made
- Followed the plan's explicit instruction to hand-edit `package.json` rather than running `pnpm strapi:upgrade` (which targets `latest` and would have crossed into the unresearched Strapi 6.x major line via `@strapi/sdk-plugin`)
- Treated the Task 2 Jest run's 4 failing suites as pre-existing baseline (not regressions) because they exactly match the plan's documented baseline list (`ad.approve.zoho.test.ts`, `indicador.test.ts`, `general.utils.test.ts`, `userController.test.ts`) — no git-stash comparison was needed since there were zero failures outside that list
- Confirmed apps/ workspace topology before grepping (only `apps/strapi` and `apps/website` exist; no `apps/dashboard`), consistent with STATE.md's prior finding that dashboard was merged into website

## Deviations from Plan

None - plan executed exactly as written. `pnpm install` had no peer-dependency conflicts requiring investigation; `tsc --noEmit` had zero new errors; Jest showed no failures beyond the documented baseline, so no git-stash regression-comparison branch of Task 2 was needed.

## Issues Encountered

None. One general `[WARN] Issues with peer dependencies found. Run "pnpm peers check" to list them.` was emitted by `pnpm install`, but `pnpm peers check` showed no `@strapi`-related entries — this is pre-existing workspace peer-dep noise unrelated to this upgrade, out of scope per the plan's boundaries.

## Operational Reminders (IMPORTANT — required before this takes effect in production)

1. **PM2 restart required post-deploy.** `apps/strapi` is self-hosted via PM2. Installing new `node_modules` does NOT hot-reload the running process — PM2 must be restarted (e.g. `pm2 restart <strapi-process-name>` or the project's deploy script) after this change is deployed, or the server will continue running the old 5.41.1 code from its already-loaded module cache.
2. **Manual smoke test recommended after deploy — cannot be automated in this sandbox.** Per RESEARCH.md, this codebase's hand-rolled `apps/strapi/src/extensions/users-permissions/strapi-server.ts` plugin extension is the single most likely place a future silent Strapi internal change could regress without throwing at build/test time. After deploying this upgrade, manually verify:
   - Standard email/password login
   - 2-step verification (2FA) code flow
   - Google OAuth login
   - (Also recommended per the plan's overall verification section, though not this task's narrow focus: one ad-creation + Webpay round trip, one Mailgun email send, one Cloudinary upload)

## User Setup Required

None - no external service configuration required. This is a dependency version bump only.

## Next Phase Readiness
- `apps/strapi/package.json` and `pnpm-lock.yaml` are ready to merge/deploy.
- Before this upgrade takes effect on the running production/staging instance, the PM2 process must be restarted (see Operational Reminders above).
- After deploy, the manual login/2FA/Google-OAuth smoke test above should be performed once as a non-blocking follow-up; nothing in this task's automated verification can substitute for it given the hand-rolled auth extension code.

---
*Phase: quick*
*Completed: 2026-07-03*

## Self-Check: PASSED

- FOUND: apps/strapi/package.json
- FOUND: .planning/quick/260702-wjy-upgrade-strapi-from-v5-41-1-to-v5-50-0-i/260702-wjy-SUMMARY.md
- FOUND: commit b47eaf16
