---
phase: quick
verified: 2026-07-03T04:15:00Z
status: passed
score: 5/5 must-haves verified
---

# Quick Task: Upgrade Strapi from 5.41.1 to 5.50.0 Verification Report

**Task Goal:** Upgrade Strapi from v5.41.1 to v5.50.0 in apps/strapi, bump all @strapi packages, run full test suite and typecheck to verify. Production backend, self-hosted via PM2.
**Verified:** 2026-07-03T04:15:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `apps/strapi/package.json` declares 5.50.0 (exact, no caret) for all 9 core `@strapi/*` packages and 5.4.0 (exact) for `@strapi/sdk-plugin` | ✓ VERIFIED | Read package.json lines 32-39, 71-72: all 10 entries exact-pinned, no `^` prefix remaining |
| 2 | `pnpm install` resolves `node_modules` to the declared versions with no peer-dependency errors | ✓ VERIFIED | `pnpm --filter waldo-strapi list` shows all 10 packages at exact declared versions; re-ran `pnpm install` — "Already up to date", no peer-dep errors surfaced |
| 3 | `tsc --noEmit` in `apps/strapi` exits 0 (no new type errors) | ✓ VERIFIED | Ran `npx tsc --noEmit` in apps/strapi — exit 0, no output |
| 4 | `npx jest --maxWorkers=2` shows no NEW failing suites beyond the documented baseline (`ad.approve.zoho.test.ts`, `indicador.test.ts`, `general.utils.test.ts`, `userController.test.ts`) | ✓ VERIFIED | Ran full suite: exactly 4 failed / 45 passed / 49 total, and the 4 failing suite paths match the documented baseline exactly (cross-checked against STATE.md phase 05 notes, which confirmed this exact 4-suite baseline via git stash) |
| 5 | No client-constructed dollar-in filters in `apps/website` exceeding ~20 items, or flagged if found | ✓ VERIFIED | Grepped `apps/website` for `$in`+`filter` co-occurrence and for `selectedIds`/`selectAll`/`bulkAction` patterns — zero matches on both, matching SUMMARY's claim |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/package.json` | All @strapi deps pinned to 5.50.0 (sdk-plugin 5.4.0) | ✓ VERIFIED | All 10 entries confirmed exact-pinned |
| `pnpm-lock.yaml` | Lockfile updated to match resolved versions | ✓ VERIFIED | Commit b47eaf16 shows 1999-line diff touching this file; `pnpm install` reports already up to date (no drift) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `apps/strapi/package.json` | `node_modules/@strapi/strapi` | `pnpm install` | ✓ WIRED | `pnpm list --depth 0` confirms `@strapi/strapi@5.50.0` resolved in node_modules, matching declared version |

### Scope Check

Only `apps/strapi/package.json` and `pnpm-lock.yaml` were modified in commit b47eaf16 (`git show --stat` confirms exactly these 2 files) — matches the plan's "nothing outside these two files" success criterion. `apps/website` was read-only (grep checks only, no edits).

### Requirements Coverage

No requirement IDs declared in plan frontmatter (`requirements: []`). N/A.

### Anti-Patterns Found

None. This is a dependency-bump quick task with no new application code; no stubs, TODOs, or placeholder patterns applicable.

### Human Verification Required

The plan and SUMMARY explicitly (and correctly) defer the following to manual post-deploy verification, since they cannot be exercised in this sandbox (no running PM2 process, no live OAuth/Mailgun/Cloudinary credentials in this environment):

1. **PM2 restart after deploy**
   **Test:** After deploying this dependency bump to the self-hosted server, restart the PM2 process for `apps/strapi`.
   **Expected:** Server picks up new `node_modules` (5.50.0); `pm2 logs` shows clean startup with no boot errors.
   **Why human:** Requires access to the production/staging server and PM2; not reproducible in this sandbox.

2. **Auth smoke test (login / 2FA / Google OAuth)**
   **Test:** After deploy, perform a standard email/password login, a 2FA code flow, and a Google OAuth login against the upgraded instance.
   **Expected:** All three flows succeed as before the upgrade.
   **Why human:** The hand-rolled `src/extensions/users-permissions/strapi-server.ts` extension is flagged by RESEARCH.md as the most fragile point for a silent Strapi internal-behavior regression; automated Jest coverage doesn't exercise the real OAuth/2FA network round-trips, and no live credentials exist in this sandbox.

3. **Payment/upload smoke test**
   **Test:** One ad-creation + Webpay round trip, one Mailgun email send, one Cloudinary upload.
   **Expected:** All three external integrations continue to work post-upgrade.
   **Why human:** Requires live external service credentials (Webpay, Mailgun, Cloudinary) not available in this sandbox.

### Gaps Summary

None. All 5 must-have truths verified against the live codebase: package.json/lockfile versions are correct and installed cleanly, tsc is clean, the full Jest suite shows exactly the pre-existing 4-suite baseline (confirmed against STATE.md's independently-documented baseline from phase 05, not just trusted from the SUMMARY), the frontend dollar-in risk was independently re-grepped and confirmed absent, and the change is scoped to exactly the two expected files. The three human-verification items are pre-deploy/post-deploy operational checks correctly deferred by the plan itself (PM2 restart, auth smoke test, payment/upload smoke test) rather than gaps in the implementation.

---

*Verified: 2026-07-03T04:15:00Z*
*Verifier: Claude (gsd-verifier)*
