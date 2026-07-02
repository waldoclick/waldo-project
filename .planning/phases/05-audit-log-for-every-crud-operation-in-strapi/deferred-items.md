# Deferred Items — Phase 05

Out-of-scope issues discovered during plan execution. Not fixed per deviation-rules scope boundary (pre-existing, unrelated to this plan's changes).

## From 05-01 execution

- `tests/api/ad/services/ad.approve.zoho.test.ts` — fails to compile: `adServiceFactory({ strapi })` mock object is missing most of the `Core.Strapi` interface (TS2740, "missing properties: server, log, fs, eventHub, and 56 more"). Confirmed pre-existing via `git stash` — fails identically on the commit before this plan's changes.
- `tests/services/indicador/indicador.test.ts` — fails to compile: `result.date` does not exist on type `IndicatorsResponse` (TS2339). Confirmed pre-existing via `git stash`.
- `tests/api/payment/general.utils.test.ts` — fails to run: Strapi worker `stopWithError` during test bootstrap, unrelated to this plan. Confirmed pre-existing via `git stash`.
- Note: running the full Jest suite with default worker concurrency in this sandboxed environment causes many worker processes to be SIGKILLed (OOM), producing 36 false-failing suites. Re-running with `--maxWorkers=2` resolves this and surfaces only the 3 genuine pre-existing failures above. Not an audit-log-subscriber issue — worth flagging to the team as a CI/sandbox resource constraint, not a code defect.
