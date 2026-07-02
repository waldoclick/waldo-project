# Deferred Items — Phase 05

Out-of-scope issues discovered during plan execution. Not fixed per deviation-rules scope boundary (pre-existing, unrelated to this plan's changes).

## From 05-01 execution

- `tests/api/ad/services/ad.approve.zoho.test.ts` — fails to compile: `adServiceFactory({ strapi })` mock object is missing most of the `Core.Strapi` interface (TS2740, "missing properties: server, log, fs, eventHub, and 56 more"). Confirmed pre-existing via `git stash` — fails identically on the commit before this plan's changes.
- `tests/services/indicador/indicador.test.ts` — fails to compile: `result.date` does not exist on type `IndicatorsResponse` (TS2339). Confirmed pre-existing via `git stash`.
- `tests/api/payment/general.utils.test.ts` — fails to run: Strapi worker `stopWithError` during test bootstrap, unrelated to this plan. Confirmed pre-existing via `git stash`.
- Note: running the full Jest suite with default worker concurrency in this sandboxed environment causes many worker processes to be SIGKILLed (OOM), producing 36 false-failing suites. Re-running with `--maxWorkers=2` resolves this and surfaces only the 3 genuine pre-existing failures above. Not an audit-log-subscriber issue — worth flagging to the team as a CI/sandbox resource constraint, not a code defect.

## From 05-03 execution

- `tests/extensions/users-permissions/controllers/userController.test.ts` — 6/9 tests fail with `TypeError: strapi.db.query(...).findMany is not a function`; the test suite's own `describe` name ("SEC2-LOCKDOWN: PII strip for non-managers (Tests 3-5 RED until Task 2)") indicates this is a pre-existing RED-by-design test scaffold for unrelated, unfinished work (a users-permissions PII-lockdown feature, not audit-log). Confirmed pre-existing via `git stash` — fails identically on the commit before this plan's changes. Full-suite baseline for phase 05 is therefore 4 known pre-existing failing suites (this one plus the 3 above), not 3 as recorded in 05-01's SUMMARY.
