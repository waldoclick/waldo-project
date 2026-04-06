---
phase: quick
plan: 260406-es8
subsystem: tooling
tags: [eslint, codacy, typescript-eslint, code-quality]
dependency_graph:
  requires: []
  provides: [eslint-unused-vars-pattern-fix]
  affects: [codacy-eslint8-run]
tech_stack:
  added: []
  patterns: ["@typescript-eslint/no-unused-vars with ignore patterns overriding recommended preset"]
key_files:
  modified:
    - .eslintrc.json
decisions:
  - "Disable base no-unused-vars and configure @typescript-eslint/no-unused-vars explicitly — TS-ESLint rule is authoritative for TS files; preset enables it without patterns which caused 27 false positives"
metrics:
  duration: 3m
  completed: "2026-04-06"
  tasks_completed: 1
  files_modified: 1
---

# Phase quick Plan 260406-es8: Fix Codacy Still Flagging Prefixed Vars Summary

## One-liner

Disable base `no-unused-vars` and configure `@typescript-eslint/no-unused-vars` with all five ignore patterns to override the pattern-less preset from `plugin:@typescript-eslint/recommended`, eliminating 27 false-positive Codacy warnings for `_`-prefixed variables.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Configure @typescript-eslint/no-unused-vars with ignore patterns in .eslintrc.json | 1f436255 | .eslintrc.json |

## What Was Built

Updated `.eslintrc.json` root-level ESLint config (used by Codacy's legacy ESLint 8 run):

- `"no-unused-vars": "off"` — disables the base ESLint rule to prevent double-reporting. The TypeScript-ESLint rule understands TypeScript constructs (e.g. constructor parameter properties) that the base rule does not.
- `"@typescript-eslint/no-unused-vars": ["warn", { ... }]` — explicitly configured with all five ignore patterns: `argsIgnorePattern`, `varsIgnorePattern`, `caughtErrorsIgnorePattern`, `destructuredArrayIgnorePattern`, `ignoreRestSiblings`.

The root cause was that `plugin:@typescript-eslint/recommended` already enables `@typescript-eslint/no-unused-vars` as `"warn"` but WITHOUT any ignore patterns. The previously configured base rule's patterns had no effect on the TS-ESLint rule. Explicit configuration in the `rules` block overrides the preset defaults.

## Decisions Made

- Disable base `no-unused-vars` and configure `@typescript-eslint/no-unused-vars` explicitly — TS-ESLint rule is authoritative for TS files; preset enables it without patterns which caused 27 false positives.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `.eslintrc.json` verified: `"no-unused-vars": "off"` present on line 22
- `"@typescript-eslint/no-unused-vars"` with all 5 patterns present on lines 23-29
- Commit `1f436255` verified in git log
