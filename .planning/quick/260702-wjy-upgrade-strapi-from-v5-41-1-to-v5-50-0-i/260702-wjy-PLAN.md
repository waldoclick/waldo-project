---
phase: quick
plan: 260702-wjy
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/package.json
  - pnpm-lock.yaml
autonomous: true
requirements: []
must_haves:
  truths:
    - "apps/strapi/package.json declares 5.50.0 (exact, no caret) for all 9 core @strapi/* packages and 5.4.0 (exact) for @strapi/sdk-plugin"
    - "pnpm install resolves node_modules to the declared versions with no peer-dependency errors"
    - "tsc --noEmit in apps/strapi exits 0 (no new type errors introduced by the bump)"
    - "npx jest --maxWorkers=2 in apps/strapi shows no NEW failing suites beyond the known pre-existing baseline (ad.approve.zoho.test.ts, indicador.test.ts, general.utils.test.ts, userController.test.ts)"
    - "No client-constructed filters in apps/website using dollar-in with more than roughly 20 items (v5.49.0 now throws ValidationError instead of silently truncating oversized in-arrays) or, if one is found, it is flagged for a manual post-upgrade smoke test rather than silently ignored"
  artifacts:
    - path: "apps/strapi/package.json"
      provides: "All @strapi dependencies pinned to 5.50.0 (sdk-plugin to 5.4.0)"
    - path: "pnpm-lock.yaml"
      provides: "Lockfile updated to match the new resolved versions"
  key_links:
    - from: "apps/strapi/package.json"
      to: "node_modules/@strapi/strapi"
      via: "pnpm install"
      pattern: "at-strapi-strapi-colon-5-50-0"
---

<objective>
Upgrade Strapi from 5.41.1 to 5.50.0 across all @strapi packages in apps/strapi (production backend, self-hosted via PM2), per 260702-wjy-RESEARCH.md. This is a routine minor-to-minor jump with zero documented breaking changes affecting this codebase: no codemods, no DB migrations, no config-schema changes required.

Purpose: Stay current on a weekly-release-cadence dependency, closing 9 minor releases (5.42 through 5.50) of bug fixes and hardening (including a JWT algorithm-confusion hardening default in 5.50.0) without introducing regressions.

Output: apps/strapi/package.json and pnpm-lock.yaml updated, tsc --noEmit clean, full Jest suite run with no new failures vs. the documented baseline, and a verified/flagged check of the one behavioral change in range (oversized dollar-in arrays now throw instead of truncating).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/260702-wjy-upgrade-strapi-from-v5-41-1-to-v5-50-0-i/260702-wjy-RESEARCH.md

Current apps/strapi/package.json relevant lines (verified 2026-07-02):

- "@strapi/cloud-cli": "^5.21.0"
- "@strapi/plugin-sentry": "^5.15.0"
- "@strapi/plugin-users-permissions": "5.41.1"
- "@strapi/provider-email-mailgun": "5.41.1"
- "@strapi/provider-upload-cloudinary": "^5.20.0"
- "@strapi/sdk-plugin": "^5.2.7"
- "@strapi/strapi": "5.41.1"
- "@strapi/utils": "5.41.1"
- "@strapi/database": "5.41.1" (devDependencies)
- "@strapi/typescript-utils": "5.41.1" (devDependencies)

Target versions (from RESEARCH.md, all verified published on npm registry as of 2026-07-02):

- @strapi/strapi to 5.50.0 (exact)
- @strapi/plugin-users-permissions to 5.50.0 (exact)
- @strapi/provider-email-mailgun to 5.50.0 (exact)
- @strapi/utils to 5.50.0 (exact)
- @strapi/database to 5.50.0 (exact, devDep)
- @strapi/typescript-utils to 5.50.0 (exact, devDep)
- @strapi/cloud-cli to 5.50.0 (exact, was ^5.21.0, drop the caret)
- @strapi/plugin-sentry to 5.50.0 (exact, was ^5.15.0, drop the caret)
- @strapi/provider-upload-cloudinary to 5.50.0 (exact, was ^5.20.0, drop the caret)
- @strapi/sdk-plugin to 5.4.0 (exact, was ^5.2.7; this is the LAST 5.x release, NOT the published 6.1.1 major line, out of scope per research, do not pull 6.x)

CRITICAL: Do NOT run the existing pnpm strapi:upgrade script (defined as NPM_CONFIG_REGISTRY=... npx --yes @strapi/upgrade@latest latest). It targets latest, which resolves past 5.50.0 and would drag @strapi/sdk-plugin toward the unresearched 6.x major line. Edit package.json by hand and run pnpm install instead.

Workspace topology (verified 2026-07-02, contradicts CLAUDE.md's stale 3-app description): only apps/strapi and apps/website exist per pnpm-workspace.yaml. apps/dashboard was merged into apps/website under /dashboard/** in an earlier phase. The dollar-in grep check in Task 3 targets apps/website only. Do not assume an apps/dashboard directory exists; verify with a directory listing of apps/ first.

Known pre-existing Jest baseline (per STATE.md phase 05 notes, confirmed via git stash re-runs in that phase; do NOT try to fix these, they predate this plan): ad.approve.zoho.test.ts, indicador.test.ts, general.utils.test.ts, userController.test.ts (4 suites). Full-suite run in this sandbox requires --maxWorkers=2 or Jest workers get OOM-killed (each test spins up a full Strapi instance).
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Bump all @strapi package versions and install</name>
  <files>apps/strapi/package.json, pnpm-lock.yaml</files>
  <action>
In apps/strapi/package.json, update the version strings for exactly these 9 packages to the exact pinned values listed in context (no caret ranges on any of them):

dependencies:
- @strapi/cloud-cli: from ^5.21.0 to 5.50.0
- @strapi/plugin-sentry: from ^5.15.0 to 5.50.0
- @strapi/plugin-users-permissions: from 5.41.1 to 5.50.0
- @strapi/provider-email-mailgun: from 5.41.1 to 5.50.0
- @strapi/provider-upload-cloudinary: from ^5.20.0 to 5.50.0
- @strapi/sdk-plugin: from ^5.2.7 to 5.4.0
- @strapi/strapi: from 5.41.1 to 5.50.0
- @strapi/utils: from 5.41.1 to 5.50.0

devDependencies:
- @strapi/database: from 5.41.1 to 5.50.0
- @strapi/typescript-utils: from 5.41.1 to 5.50.0

Do not touch any other dependency in this file (non-@strapi packages are out of scope). Do not run pnpm strapi:upgrade (see context, it targets latest, not 5.50.0).

After editing, run pnpm install from the repo root (workspace-aware, updates root pnpm-lock.yaml). If pnpm install reports unresolvable peer-dependency conflicts, stop and report the exact error rather than force-resolving with flags like --no-strict-peer-dependencies.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && pnpm --filter waldo-strapi list @strapi/strapi @strapi/plugin-users-permissions @strapi/provider-email-mailgun @strapi/utils @strapi/database @strapi/typescript-utils @strapi/cloud-cli @strapi/plugin-sentry @strapi/provider-upload-cloudinary @strapi/sdk-plugin --depth 0</automated>
  </verify>
  <done>
All 9 core @strapi packages resolve to 5.50.0 in pnpm list output; @strapi/sdk-plugin resolves to 5.4.0 (not 6.x); pnpm-lock.yaml is modified with updated versions; pnpm install completed with no unresolved peer-dependency errors.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Verify with typecheck and full Jest suite at limited concurrency</name>
  <files>apps/strapi (verification only, no source changes expected)</files>
  <action>
Run TypeScript typecheck and the full Jest suite against the bumped dependencies to confirm no regressions.

Step 1: From apps/strapi, run the TypeScript compiler in noEmit mode. Per CLAUDE.md, this project enforces strict TypeScript with zero use of any. Any new type error introduced by the @strapi type definition changes must be reported, not silently worked around with a cast, unless it matches the documented Strapi SDK v5 cast pattern already used elsewhere in this codebase.

Step 2: From apps/strapi, run the Jest suite with worker concurrency capped at 2. Do not use default concurrency: each test spins up a full Strapi instance and default worker count OOM-kills this sandbox, per STATE.md's documented constraint.

Step 3: Compare the Jest output against the known pre-existing baseline of 4 failing suites: ad.approve.zoho.test.ts, indicador.test.ts, general.utils.test.ts, userController.test.ts. These are expected to still fail (unrelated, pre-existing). Do not attempt to fix them as part of this plan.

Step 4: If any suite fails that is NOT in the baseline list above, treat it as a potential regression. Stash the package.json and lockfile changes, re-run that specific suite against the pre-upgrade code, and confirm whether it also fails there. If it fails identically pre-upgrade, it is pre-existing drift, not caused by this plan; note it in the SUMMARY as a baseline update rather than a regression. If it only fails post-upgrade, this is a genuine regression: stop, restore the stashed changes, and report the failure with its full error output before proceeding to Task 3.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/strapi && npx tsc --noEmit && echo TSC_OK; npx jest --maxWorkers=2 2>&1 | tail -60</automated>
  </verify>
  <done>
tsc --noEmit exits 0 with no new errors; Jest run completes (does not OOM); only the 4 documented pre-existing suites fail, or any additional failing suite has been confirmed via git stash comparison to also fail pre-upgrade and is logged as a baseline update, not a regression.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Grep for oversized client-built dollar-in filters and flag manual smoke test</name>
  <files>apps/website (read-only check, no modifications expected)</files>
  <action>
Research flagged a v5.49.0 behavior change: REST requests whose filters or populate array (as parsed from the query string) exceed the default qs arrayLimit of 20 now return a 400 ValidationError instead of Strapi silently truncating or mis-parsing them. Server-side Strapi code was already audited in RESEARCH.md and found safe (all dollar-in usages filter 2-3 values). This task closes the one open question RESEARCH.md left: whether the frontend ever builds a dollar-in filter array larger than 20 items client-side.

Step 1: List the apps/ directory to confirm current topology before grepping. Per context, apps/dashboard should NOT exist (merged into apps/website); if it does exist, include it in the grep too.

Step 2: Grep apps/website (recursively, source directories only, excluding node_modules and dist/build output) for the pattern indicating a dollar-in filter being constructed, e.g. searching for the literal substrings "$in" and "filters[" together, and separately for any array literal or user-selection state (such as "selectedIds", "selectAll", "bulk") that gets passed into a Strapi filter object. Look specifically for any bulk-select / bulk-action UI pattern that could pass more than 20 ids in one request.

Step 3: For each match found, inspect the surrounding code to determine the realistic maximum array size (e.g., is it bounded by pagination, a fixed list, or could it genuinely exceed 20 items via a "select all" pattern).

Step 4: If no matches are found, or all matches are demonstrably bounded under 20 items, record that in the SUMMARY as a closed, non-issue. If a genuine unbounded case is found (a client-driven selection that could exceed 20 items), document it explicitly in the SUMMARY with the file/line and flag it as a required manual smoke test after deploying this upgrade, rather than blocking this plan on it (this codebase does not currently have such a case per RESEARCH.md's audit, but this step is the frontend-side half of that audit which RESEARCH.md explicitly left open).

Step 5: Also surface, as a non-blocking manual post-merge note in the SUMMARY (do not attempt to automate): a smoke-test pass of login, 2-step verification, and Google OAuth against the upgraded Strapi instance. RESEARCH.md flags this codebase's hand-rolled users-permissions plugin extension (src/extensions/users-permissions/strapi-server.ts) as fragile-but-untouched by this version range; nothing in this plan changes it, but it is the single most likely place a future silent Strapi internal change could regress without throwing at build time, so it warrants a manual check after this deploy, not an automated one in this environment.
  </action>
  <verify>
    <automated>ls /home/gab/Code/waldo-project/apps/ && grep -rn "\$in" /home/gab/Code/waldo-project/apps/website --include="*.ts" --include="*.vue" | grep -i "filter" || echo "no dollar-in filter usage found in apps/website"</automated>
  </verify>
  <done>
apps/ directory topology confirmed (apps/strapi and apps/website only, unless apps/dashboard is found to still exist). Grep results reviewed and documented in the SUMMARY: either zero risky dollar-in usages found, or specific bounded/unbounded cases documented with file/line references. Manual post-merge smoke-test note (login/2FA/Google OAuth) recorded in the SUMMARY as a non-blocking follow-up.
  </done>
</task>

</tasks>

<verification>
After all 3 tasks:
1. apps/strapi/package.json shows all 9 core @strapi packages at exact 5.50.0 and @strapi/sdk-plugin at exact 5.4.0, with no caret ranges remaining on any of the 10.
2. pnpm-lock.yaml diff shows the corresponding version bumps.
3. tsc --noEmit in apps/strapi exits 0.
4. npx jest --maxWorkers=2 in apps/strapi shows no failing suites beyond the documented (possibly updated) pre-existing baseline.
5. apps/website has been grepped for oversized client-built dollar-in filters; findings (or their absence) are documented.
6. A manual post-merge smoke-test recommendation (login, 2FA, Google OAuth, one ad-creation plus Webpay round trip, one Mailgun email, one Cloudinary upload) is recorded for the user, not executed automatically.
</verification>

<success_criteria>
- All 10 @strapi/* package.json entries (9 core packages plus sdk-plugin) are bumped to their exact researched target versions with no caret ranges.
- pnpm install completes cleanly and pnpm-lock.yaml reflects the new resolved tree.
- tsc --noEmit passes with zero new errors.
- Full Jest suite run (capped at 2 workers to avoid sandbox OOM) shows no regressions beyond the documented pre-existing baseline.
- The frontend dollar-in oversized-array risk from the v5.49.0 qs arrayLimit change has been explicitly checked (not assumed) and documented.
- A manual smoke-test recommendation for login/2FA/Google OAuth is surfaced to the user as a post-merge step, since this codebase's hand-rolled users-permissions plugin extension cannot be verified by automated tests alone in this environment.
- Nothing outside apps/strapi/package.json and pnpm-lock.yaml is modified (apps/website is read-only in this plan).
</success_criteria>

<output>
After completion, create `.planning/quick/260702-wjy-upgrade-strapi-from-v5-41-1-to-v5-50-0-i/260702-wjy-SUMMARY.md`
</output>
