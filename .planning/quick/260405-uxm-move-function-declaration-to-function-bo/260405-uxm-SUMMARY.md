---
phase: quick
plan: 260405-uxm
subsystem: website/plugins
tags: [codacy, eslint, best-practice, gtm]
dependency_graph:
  requires: []
  provides: [codacy-best-practice]
  affects: []
tech_stack:
  added: []
  patterns: [const-arrow-function-expression]
key_files:
  created: []
  modified:
    - apps/website/app/plugins/gtm.client.ts
decisions:
  - Convert function declarations inside block scope to const arrow function expressions to satisfy ESLint no-inner-declarations rule
metrics:
  duration: "~2 minutes"
  completed: "2026-04-06T02:18:02Z"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 260405-uxm: Move Function Declaration to Function Body Summary

**One-liner:** Converted `gtag` function declaration inside `if` block to `const` arrow function expression to resolve Codacy `no-inner-declarations` ESLint violation in `gtm.client.ts`.

## What Was Done

Resolved a Codacy best-practice ESLint violation in `apps/website/app/plugins/gtm.client.ts`. The `gtag` function was declared with a `function` keyword inside an `if (import.meta.client && appConfig.features.gtm)` block, which triggers the `no-inner-declarations` rule. Converting it to a `const` arrow function expression (`const gtag = (...args: any[]) => { ... }`) is valid inside block scope and eliminates the violation.

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Convert gtag function declaration to arrow function expression | e55c1c9c | apps/website/app/plugins/gtm.client.ts |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- File `apps/website/app/plugins/gtm.client.ts` exists and contains `const gtag = (...args: any[]) => {`
- Commit `e55c1c9c` exists in git log
- TypeScript compilation via `vue-tsc --noEmit` passes with no errors
