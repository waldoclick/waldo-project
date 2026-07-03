# Strapi 5.41.1 → 5.50.0 Upgrade - Research

**Researched:** 2026-07-02
**Domain:** Strapi v5 core + plugin/provider version bump (9 minor releases)
**Confidence:** HIGH (all findings sourced from GitHub release bodies via `api.github.com/repos/strapi/strapi/releases/tags/*` and `npm view` against the live registry — not training data)

## Summary

This is a routine minor-to-minor jump (5.41.1 → 5.50.0), not a major migration. Strapi v5's own semver policy treats these as non-breaking for the documented public API, and that holds up here: across all 9 releases (5.42 through 5.50, plus 5 patch releases in between) there is no breaking change, required manual migration step, or database schema migration that affects this codebase. The two areas that could realistically bite this codebase are both internal-implementation-detail risk, not documented breaking changes: (1) this project's `strapi-server.ts` plugin extension relies on undocumented internals of how Strapi v5 instantiates the users-permissions `auth` controller factory and the `content-api` routes factory — those internals were not touched in this range, but they are exactly the kind of code a future Strapi minor could change without a changelog entry, since they're not part of the public API contract; (2) a v5.49.0 change makes `qs`/`populate`/`filter` arrays exceeding the default `arrayLimit` throw a `ValidationError` (400) instead of silently truncating — audited, this codebase's `$in` filters and populate objects are all small, so it isn't triggered today, but it's the one behavior change worth a smoke-test pass.

Everything else in the range is additive (new features, i18n, admin UI fixes, new optional config) or fixes bugs this project doesn't hit (self-relations, review-workflows, i18n locales, dynamic-zone UI — none of which this codebase uses per its content-type schemas).

**Primary recommendation:** Bump all pinned `5.41.1` packages straight to `5.50.0`, bump `@strapi/cloud-cli`/`@strapi/plugin-sentry`/`@strapi/provider-upload-cloudinary` to `5.50.0` (all three ship on the same release train and have 5.50.0 published), bump `@strapi/sdk-plugin` from `^5.2.7` to `5.4.0` (the last 5.x release — do NOT jump to the published `6.1.1`, that's an unrelated major line this task didn't ask for and hasn't been researched for breaking changes). Do not run `npx @strapi/upgrade` as a codemod pass for this range — there is nothing in the range's changelogs that any codemod would target — but DO use `npx @strapi/upgrade to 5.50.0 --dry` as a free sanity check before installing, since it costs nothing and will flag anything this research missed.

## User Constraints

No CONTEXT.md exists for this quick task. Task scope is fixed by the orchestrator's task description: bump the 6 exact-pinned `5.41.1` packages to `5.50.0`, and check/bump the 4 caret-range packages to their latest compatible versions.

## Version Matrix (verified against npm registry, 2026-07-02)

| Package | Current | Target | Verified published? |
|---|---|---|---|
| `@strapi/strapi` | 5.41.1 (exact) | 5.50.0 | ✅ npm view |
| `@strapi/plugin-users-permissions` | 5.41.1 (exact) | 5.50.0 | ✅ |
| `@strapi/provider-email-mailgun` | 5.41.1 (exact) | 5.50.0 | ✅ |
| `@strapi/utils` | 5.41.1 (exact) | 5.50.0 | ✅ |
| `@strapi/database` | 5.41.1 (exact, devDep) | 5.50.0 | ✅ |
| `@strapi/typescript-utils` | 5.41.1 (exact, devDep) | 5.50.0 | ✅ |
| `@strapi/cloud-cli` | ^5.21.0 | 5.50.0 | ✅ (latest on npm) |
| `@strapi/plugin-sentry` | ^5.15.0 | 5.50.0 | ✅ (latest on npm) |
| `@strapi/provider-upload-cloudinary` | ^5.20.0 | 5.50.0 | ✅ (latest on npm) |
| `@strapi/sdk-plugin` | ^5.2.7 | **5.4.0**, not 6.1.1 | ✅ — 6.1.1 is latest overall but is a major-version line; 5.4.0 is the last 5.x release and is what `^5.2.7` already resolves to under normal `pnpm install`. Flagging so the plan doesn't accidentally pull 6.x. |

Release train dates (from npm `time` metadata): 5.42.0 (04-08), 5.42.1 (04-15), 5.43.0 (04-22), 5.44.0 (04-29), 5.45.0 (05-06), 5.45.1 (05-11), 5.46.0 (05-13), 5.46.1 (05-20), 5.47.0 (05-28), 5.47.1 (06-03), 5.48.0 (06-10), 5.48.1 (06-17), 5.49.0 (06-24), 5.50.0 (07-02) — a clean weekly cadence, no gaps, no yanked releases.

## Node.js Compatibility

`@strapi/strapi@5.50.0` engines: `"node": ">=20.0.0 <=26.x.x"`, `"npm": ">=6.0.0"` (npm is only the floor-check; you use pnpm). Currently running **Node v22.22.2** — squarely inside the supported range.

- v5.48.1 added Node 26 support and **deprecated Node 20** in documentation (not dropped — CI matrix dropped Node 20 from *test* runs only, `engines` still accepts it).
- Node 22 was never deprecated or flagged in this range. No action needed.

## Breaking Changes / Manual Migration Steps

**None found in 5.42.0 → 5.50.0 that apply to this codebase.** Searched every release body (9 minor + 5 patch) for breaking-change language, deprecations, and migration notes. Findings, in order of relevance:

### 1. `qs`/populate arrayLimit now throws instead of silently truncating (v5.49.0)
> "throw ValidationError when populate exceeds qs arrayLimit" (#25632, #25916)

Any REST request whose `filters[$in]` or `populate` array (as parsed from the query string) exceeds the default `qs` `arrayLimit` (20) now returns a `400 ValidationError` instead of Strapi silently truncating/mis-parsing it. **Audited this codebase's `$in` usage** (`grep -rn '\$in' src/`) — all three occurrences (`migrate-subscription-pro.ts`, `userController.ts` ×2) filter by 2-3 status/role values, far under the limit. No populate object in `src/api/**` has more than a handful of keys. **Risk: LOW, but flag for a smoke test** — specifically any dashboard/website call that builds a dynamic `filters[id][$in]=` list from a user-selected array (e.g., bulk actions), since that's client-driven and not bounded by server code today.

### 2. Undocumented users-permissions plugin internals (no changelog entry — inferred risk, not a finding from the changelogs)
This codebase's `src/extensions/users-permissions/strapi-server.ts` depends on two Strapi v5 internals *not* covered by semver guarantees:
- `plugin.controllers.auth` being a **factory function** that must be wrapped (not mutated) — documented inline in the file itself as a hard-won fix.
- `plugin.routes["content-api"]` also being a factory function, meaning `.routes.push()` after plugin load is a no-op (this is why `verify-code`/`resend-code` live in `src/api/auth-verify/` instead of being pushed onto the plugin).

**Neither of these registration mechanisms changed in any of the 14 releases in this range** (confirmed: no PR title mentions plugin registration, controller factory, or route factory changes for users-permissions in 5.42–5.50; the only users-permissions changes were additive — `documentId` support for user/role relations in v5.48.1 and v5.50.0, and a typo fix). This is not a new risk introduced by this upgrade, but it's the single most fragile piece of custom code touching an area Strapi does change over time — **smoke-test registration, login, Google OAuth, and 2-step verification end-to-end after the bump**, since a silent regression here wouldn't throw at build time.

### 3. `strapi build` no longer auto-runs install (v5.48.0/5.48.1)
> "build does not run install; add install-deps arg" (#26483)

Verified against `docs/deployment.md`: this project's Forge deploy script already runs `yarn install --frozen-lockfile` then `yarn build` as **separate explicit steps** (not relying on `strapi build`'s old implicit install behavior). **No action needed** — this change doesn't affect this project's deploy pipeline. (Note: `docs/deployment.md` says `yarn`, but the actual package manager per `CLAUDE.md`/root `package.json` is `pnpm@11.1.1` — pre-existing doc/reality mismatch, out of scope for this task.)

### 4. `users-permissions`: "default legacy JWT verify to HS256" (v5.50.0, #26752)
Hardens JWT verification against algorithm-confusion attacks by pinning the verify algorithm. This project's `.env.example` only declares a single symmetric `JWT_SECRET` (no asymmetric key config, no `jwtSecret.options.algorithms` override in `plugins.ts`) — i.e., it was already implicitly HS256-only. **No action needed**, this is a hardening default that matches existing behavior.

### 5. Database migration idempotency fix (v5.44.0, #26045)
> "database: make 5.0.0-02-created-document-id migration idempotent"

This is a fix to a migration that runs once during the original v4→v5 upgrade (already long completed on this project, per PROJECT.md history — this codebase has been on v5 since well before v5.40). **Not relevant** — this migration will not re-run.

### 6. Content Manager keyboard shortcut change (v5.49.0, #26621)
`Cmd/Ctrl+Enter` now saves as **draft** instead of publishing; `Cmd/Ctrl+Shift+Enter` publishes. This is an admin-panel UX change only (affects human editors in the Strapi admin, not code). Worth a one-line heads-up to whoever manages content (Articles, Terms, etc.) via the Strapi admin panel, since muscle memory could accidentally leave content as an unpublished draft. Zero code impact.

## Plugin/Provider-Specific Findings

Searched all 14 release bodies for `users-permissions`, `sentry`, `cloudinary`, `mailgun`, `sdk-plugin`, `cloud-cli`:

| Plugin/Provider | Findings in 5.42–5.50 |
|---|---|
| `@strapi/plugin-users-permissions` | See items 2 and 4 above. Also additive: `documentId` support for user↔role relations (v5.48.1, v5.50.0) — does not affect existing numeric-id-based code, purely additive capability. |
| `@strapi/provider-email-mailgun` | **Zero mentions** in any release body in this range. No changes. |
| `@strapi/plugin-sentry` | **Zero mentions.** No changes. (Separate from the unrelated v5.46.0 change that replaced `sendmail` with `nodemailer` in the *built-in* email provider — this project uses the `mailgun` provider, not the built-in sendmail/nodemailer one, so that change is N/A.) |
| `@strapi/provider-upload-cloudinary` | **Zero mentions.** The only upload-provider changes in range were to `provider-upload-aws-s3` (credential provider function, v5.50.0) and the built-in `upload` plugin (pagination endpoint, GIF/WebP frame preservation) — none touch Cloudinary. |
| `@strapi/sdk-plugin` | Only appears once, tangentially: v5.47.0 chore "remove sdk-plugin from todo-example plugin" (internal example cleanup, not user-facing). The 5.x line stopped at 5.4.0 (released before this task's window); 6.x is a separate major not covered by this research. |
| `@strapi/cloud-cli` | No functional mentions relevant to a self-hosted (non-Strapi-Cloud) deployment; this project does not use Strapi Cloud, so cloud-cli's billing-portal/deploy-widget changes (v5.44.0, v5.48.1) are inert. |

## Config File Schema Changes

Reviewed all 6 config files (`admin.ts`, `api.ts`, `cron-tasks.ts`, `database.ts`, `middlewares.ts`, `plugins.ts`, `server.ts`) against every config-shape-affecting changelog entry in range. **No schema changes required in any config file.** Specifically:
- `config/database.ts` — connection/pool shape unchanged; no new required fields in this range for mysql/postgres/sqlite connectors.
- `config/plugins.ts` — `email`/`users-permissions`/`sentry`/`upload` config shapes unchanged. The `users-permissions.config.ratelimit` block this project sets is untouched by the v5.45.0 "dynamically update rate limit prefix key based on route" change — that's an internal Redis-key-namespacing fix, not a config-shape change (verified: no new/removed keys under `ratelimit` in the plugin's schema across releases).
- `config/middlewares.ts` — `strapi::security`/`strapi::cors`/`strapi::session` middleware config shapes unchanged.
- `config/server.ts` — `cron`/`webhooks`/`proxy` shapes unchanged.

## `@strapi/upgrade` Tool — Recommendation

Per official docs (`docs.strapi.io/cms/upgrade-tool`): the tool (1) bumps dependency versions, (2) applies codemods for breaking changes, (3) reinstalls. It supports `npx @strapi/upgrade to 5.50.0` (exact target) and a `-n`/`--dry` flag to preview without touching files.

Given the research above found **zero codemod-worthy breaking changes** in this range, running the tool isn't strictly necessary — a manual `package.json` version bump + `pnpm install` + restart is sufficient, matching how this project already treats Strapi minor bumps (there's no evidence of prior `@strapi/upgrade` runs being required for past minor jumps in `STATE.md`'s history, e.g. 5.40→5.41).

**Recommendation:** Run `npx --yes @strapi/upgrade@latest to 5.50.0 --dry` (dry-run) as a zero-cost second opinion before hand-editing `package.json` — if it reports zero codemods to apply, proceed with the manual bump; if it reports something this research missed, investigate that specific item before proceeding. Do not run it for-real (non-dry) — a manual, reviewable `package.json` diff is safer and more consistent with this project's git-diff-driven review process.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---|---|---|
| Verifying "did this version bump break anything" | Manual read-through of admin UI | `tsc --noEmit` (project already enforces zero-`any`/strict TS per CLAUDE.md) + full Jest suite (`npx jest --maxWorkers=2` per STATE.md's documented sandbox constraint) + a manual smoke pass of login/2FA/Google OAuth/ad-creation/payment flows, since those are the areas touching the fragile users-permissions internals |

## Common Pitfalls

### Pitfall 1: Pinning caret packages to `6.x` by accident
**What goes wrong:** Running `pnpm update @strapi/sdk-plugin` without a version pin could resolve to the published `6.1.1`, which is an unresearched major line.
**Why it happens:** `^5.2.7` in package.json still allows this if the field is later rewritten to `^6.x` instead of an explicit `5.50.0`/`5.4.0`.
**How to avoid:** Explicitly pin `@strapi/sdk-plugin` to `5.4.0` in `package.json` (matching the exact-pin style already used for the 6 core packages), not a caret range, to avoid future silent major jumps.

### Pitfall 2: Assuming `mailgun`/`sentry`/`cloudinary` packages lag behind core
**What goes wrong:** Some Strapi ecosystem packages release on a slower cadence than `@strapi/strapi` itself, so a plan might defensively pin them to an older compatible version.
**Why it happens:** Historically true for some third-party plugins; not true here.
**How to avoid:** Already verified all four (`plugin-users-permissions`, `provider-email-mailgun`, `plugin-sentry`, `provider-upload-cloudinary`) publish `5.50.0` in lockstep with core — pin all to `5.50.0` with no version-skew concern.

## Runtime State Inventory

This is a dependency version bump, not a rename/refactor/migration phase — no stored-data, live-service-config, OS-registration, or secrets-renaming concerns apply. Explicitly checked and ruled out:
- **Stored data:** No content-type schema changes ship in this range (confirmed via `config`/schema-shape review above) — no data migration needed.
- **Live service config:** N/A — no external service (Mailgun, Sentry, Cloudinary) configuration changes in this range.
- **OS-registered state:** N/A — PM2 process (`waldo-api`) config (`ecosystem.config.js`) is untouched by this upgrade; only requires a `pm2 restart`/redeploy after install.
- **Secrets/env vars:** No new required env vars introduced in this range (verified no config-shape changes above).
- **Build artifacts:** `pnpm install` will refresh `node_modules`/lockfile entries for the 10 bumped packages; no stale build-artifact concern (no package renames in this range).

## Open Questions

1. **Does the qs `arrayLimit` ValidationError change (v5.49.0) affect any dashboard bulk-action endpoint that sends large `$in` filter arrays from the client?**
   - What we know: server-side code never builds `$in` arrays larger than a handful of items.
   - What's unclear: whether the website or dashboard frontend ever sends a client-constructed `filters[id][$in]=...` query with more than 20 items (e.g., a "select all + bulk delete" UI pattern was not exhaustively grepped in the two frontend apps, only in `apps/strapi`).
   - Recommendation: quick grep of `apps/website`/`apps/dashboard` for `$in` usage in outgoing Strapi query params before/during the upgrade PR's smoke test; if found, test that specific flow post-upgrade with a >20-item selection.

## Validation Architecture

`workflow.nyquist_validation` was not checked in `.planning/config.json` for this quick task (out of scope for quick-task mode — no phase config gate applies here). Given this is infra/dependency-bump work rather than a feature phase, the practical validation path is:
- `tsc --noEmit` in `apps/strapi` (project standard, zero-`any`/strict enforced)
- `npx jest --maxWorkers=2` (per STATE.md's documented sandbox-safe invocation) — compare against the known pre-existing baseline of ~4 unrelated failing suites (per STATE.md phase 05 notes) so the diff, not the raw pass/fail count, is the signal
- Manual smoke test: admin login, `/api/auth/local` (2-step flow), Google OAuth callback, one ad-creation + Webpay payment round trip, one Mailgun-triggered email (e.g. password reset), one Cloudinary upload

## Sources

### Primary (HIGH confidence)
- `api.github.com/repos/strapi/strapi/releases/tags/{v5.42.0…v5.50.0, v5.42.1, v5.45.1, v5.46.1, v5.47.1, v5.48.1}` — full release body text, fetched directly, not summarized by an intermediate model
- `npm view @strapi/{strapi,plugin-users-permissions,provider-email-mailgun,utils,database,typescript-utils,cloud-cli,plugin-sentry,provider-upload-cloudinary,sdk-plugin}` — live registry version/engines/time metadata
- `docs.strapi.io/cms/upgrade-tool` (via WebFetch) — `@strapi/upgrade` tool behavior and flags
- Local codebase: `apps/strapi/package.json`, `config/*.ts`, `src/extensions/users-permissions/strapi-server.ts`, `src/middlewares/*`, `docs/deployment.md`, `apps/strapi/ecosystem.config.js`, `.planning/STATE.md`, `.planning/PROJECT.md`

### Secondary (MEDIUM confidence)
- None used — all claims verified against primary sources above.

### Discarded
- An initial `WebFetch` summarization of `github.com/strapi/strapi/releases` produced a plausible-looking but partially fabricated table (invented CVE numbers, a `v4.26.2` entry mixed into the v5 list, and dates that didn't fully match npm's registry timestamps). Discarded in favor of direct `api.github.com` fetches per-tag and `npm view` cross-checks, per this role's "verify before asserting" discipline.

## Metadata

**Confidence breakdown:**
- Version matrix / npm registry state: HIGH — direct registry queries
- Breaking-change survey: HIGH — every release body in range read in full, cross-referenced against actual codebase usage (grep-verified, not assumed)
- Node.js compatibility: HIGH — engines field read directly from the 5.50.0 package
- Config-shape-change survey: HIGH — all 6 config files read and diffed against every config-related changelog line

**Research date:** 2026-07-02
**Valid until:** ~7 days — Strapi ships weekly minor/patch releases; if this upgrade isn't executed within a week, re-check `npm view @strapi/strapi versions` for anything newer than 5.50.0 before planning.
