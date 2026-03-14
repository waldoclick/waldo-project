---
phase: 082-email-verification-backend-activation
plan: 01
subsystem: auth
tags: [email-confirmation, strapi, users-permissions, migration, cron-runner]

# Dependency graph
requires:
  - phase: 081-email-verification-frontend
    provides: /registro/confirmar page + FormRegister no-JWT guard deployed before toggle activation
provides:
  - Idempotent DB migration seeder setting confirmed=true on all pre-existing users
  - userConfirmedMigration cron task registered and triggerable via POST /api/cron-runner/user-confirmed-migration
  - email_confirmation toggle ON in Strapi Admin Panel (production)
  - email_confirmation_redirection = https://waldo.click/login (production)
  - Full email confirmation flow verified end-to-end (5/5 smoke-test checks)
affects:
  - future-auth
  - registration-flow
  - user-permissions

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "One-shot migration seeder pattern: far-future cron rule (0 0 1 1 *) prevents auto-run; manual-only via cron-runner POST"
    - "Idempotent migration: findMany unconfirmed → early return if 0 → updateMany; safe to re-run"
    - "Hard gate ordering: DB migration MUST precede Admin Panel toggle to prevent existing-user lockout"

key-files:
  created:
    - apps/strapi/seeders/user-confirmed-migration.ts
  modified:
    - apps/strapi/config/cron-tasks.ts
    - apps/strapi/src/api/cron-runner/controllers/cron-runner.ts

key-decisions:
  - "Migration runs BEFORE toggle activation — hard gate prevents existing-user lockout"
  - "Redirect URL set to https://waldo.click/login (full URL with protocol required by Yup validation)"
  - "Migration script registered as manual-only cron (far-future rule) — never auto-runs on boot"
  - "Dashboard forgot-password reCAPTCHA missing — out of scope, logged as deferred issue"

patterns-established:
  - "One-shot migration pattern: seeder + far-future cron + cron-runner entry for safe manual-only execution"

requirements-completed: [REGV-01, REGV-02, REGV-06]

# Metrics
duration: ~60min (split across two sessions with human gates)
completed: 2026-03-14
---

# Phase 082 Plan 01: Email Verification Backend Activation Summary

**Email confirmation activated in production: DB migration (all users confirmed=true), Strapi toggle ON, redirect to https://waldo.click/login, full 5-check smoke-test passed**

## Performance

- **Duration:** ~60 min (two human-gate sessions)
- **Started:** 2026-03-14T03:00:00Z
- **Completed:** 2026-03-14T04:13:02Z
- **Tasks:** 4 (2 auto, 2 human checkpoints)
- **Files modified:** 3

## Accomplishments

- Written idempotent migration seeder (`user-confirmed-migration.ts`) + wired into cron-runner; TypeScript clean
- Production DB migrated: all users set to `confirmed=true` via `POST /api/cron-runner/user-confirmed-migration` (human-confirmed)
- Strapi Admin Panel configured: `email_confirmation` toggle ON, `email_confirmation_redirection` = `https://waldo.click/login`
- All 5 smoke-test checks passed on website (REGV-01, REGV-02, REGV-06 verified end-to-end)

## Task Commits

Each task was committed atomically:

1. **Task 1: Write migration script + wire into cron-runner** — `3fbcbe9` (feat)
2. **Task 2: Deploy + run migration** — Human action (production SQL confirmed; count = 0 post-migration)
3. **Task 3: Configure Strapi Admin Panel** — Human action (toggle ON, redirect URL set)
4. **Task 4: Smoke-test the full email confirmation flow** — Human verify (all 5 checks passed)

**Plan metadata:** _(this commit)_ (docs: complete plan)

## Files Created/Modified

- `apps/strapi/seeders/user-confirmed-migration.ts` — Idempotent ORM migration; sets `confirmed=true` on all users with `confirmed=false` or NULL; returns early if none found
- `apps/strapi/config/cron-tasks.ts` — Added `userConfirmedMigration` task with far-future cron rule (`0 0 1 1 *`), manual-only trigger
- `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts` — Added `"user-confirmed-migration": "userConfirmedMigration"` to `CRON_NAME_MAP`; updated JSDoc

## Decisions Made

- **Migration-first hard gate:** DB migration (`confirmed=true` on all existing users) runs before the Admin Panel toggle. This is non-negotiable — flipping the toggle first would lock out all pre-existing users immediately.
- **Full URL redirect required:** `email_confirmation_redirection` must be a full URL (`https://waldo.click/login`), not a path. Strapi's Yup validation rejects path-only values.
- **Manual-only cron pattern:** Far-future rule (`0 0 1 1 *`) ensures the migration never auto-runs on Strapi boot or scheduled runs — must be triggered explicitly via `POST /api/cron-runner/user-confirmed-migration`.
- **Dashboard reCAPTCHA bug deferred:** The "Recuperar contraseña" form on the dashboard is missing reCAPTCHA submission — pre-existing bug, out of scope for this plan, logged as deferred item.

## Smoke-Test Results

All 5 checks passed on website (https://waldo.click):

| Check | Description | Requirement | Result |
|-------|-------------|-------------|--------|
| 1 | Existing user login (2-step verify flow) | REGV-06 | ✅ Passed |
| 2 | New registration → `/registro/confirmar` (no JWT), email sent | REGV-01 | ✅ Passed |
| 3 | Confirmation link → redirects to `https://waldo.click/login` | REGV-01 | ✅ Passed |
| 4 | Google OAuth login — no email gate, direct auth | REGV-02 | ✅ Passed |
| 5 | Unconfirmed user login attempt → blocked ("not confirmed") | REGV-01 | ✅ Passed |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Dashboard forgot-password reCAPTCHA missing (out of scope):** During smoke-testing, the dashboard "Recuperar contraseña" form was found to be missing reCAPTCHA submission. This is a pre-existing bug unrelated to this plan's scope (email confirmation activation). Logged as deferred issue — requires a separate fix.

## User Setup Required

None - Admin Panel configuration was performed directly by the user as part of Task 3 (human-action checkpoint). No additional external service configuration required.

## Next Phase Readiness

- Email confirmation flow is fully active in production
- All three REGV requirements (REGV-01, REGV-02, REGV-06) are satisfied
- Phase 082 is the last phase of milestone v1.37 — milestone complete
- Dashboard reCAPTCHA bug on forgot-password form should be addressed in a follow-up quick task before next milestone

---
*Phase: 082-email-verification-backend-activation*
*Completed: 2026-03-14*
