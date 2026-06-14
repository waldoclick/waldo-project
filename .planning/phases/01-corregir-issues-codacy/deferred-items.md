# Deferred Items — Phase 01 (corregir-issues-codacy)

Out-of-scope discoveries logged during execution. NOT fixed here per the executor scope boundary
(only auto-fix issues DIRECTLY caused by the current task's changes).

## Pre-existing test failures in authController.test.ts (NOT caused by 01-00)

Discovered while running Task 2 (`pnpm jest authController`). These 3 cases were already RED on the
01-00 baseline (verified via `git stash` before any 01-00 edit: 42 passed / 45 total / 3 failed).
They are unrelated to the Wave 0 injection guards added in 01-00.

1. `verifyCode › VSTEP-04 › returns full login response on correct code`
2. `verifyCode › VSTEP-04 › deletes the verification-code record after successful verification`
3. `registerUserLocal › calls original registerController when both consent fields are true`

These appear to predate this phase (likely test/source drift from a prior milestone). They should be
triaged separately — do NOT attribute them to the 01-00 RED-by-design injection cases.
