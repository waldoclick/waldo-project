---
phase: 01-corregir-issues-codacy
plan: 03
subsystem: website-utils
tags: [security, insecure-random, csprng, codacy-fix]
requires: []
provides:
  - "CSPRNG-backed client password generation (crypto.getRandomValues)"
affects:
  - apps/website/app/utils/password.ts
tech-stack:
  added: []
  patterns:
    - "Web Crypto getRandomValues + rejection sampling for bias-free uniform integers (client)"
key-files:
  created: []
  modified:
    - apps/website/app/utils/password.ts
    - apps/website/tests/utils/password.test.ts
decisions:
  - "Client password generator uses Web Crypto crypto.getRandomValues (not node:crypto randomBytes) — password.ts runs in the browser"
  - "randomInt(max) uses rejection sampling (limit = floor(0xffffffff/max)*max) to eliminate modulo bias"
metrics:
  duration: ~5m
  completed: 2026-06-14
  tasks: 2
  files: 2
---

# Phase 01 Plan 03: Client Password Generator CSPRNG Summary

Replaced both `Math.random()` sites in the client-side `generateSecurePassword` with a Web Crypto CSPRNG (`crypto.getRandomValues`) using rejection sampling, clearing the 2 `insecure-random` Codacy findings (password.ts:31 pick, :45 Fisher-Yates shuffle) without changing output shape.

## What Was Built

- **Task 1 (998e7700):** Added module-private `randomInt(max)` helper backed by `crypto.getRandomValues(new Uint32Array(1))` with rejection sampling. Replaced the charset `pick` (`Math.floor(Math.random() * charset.length)`) and the Fisher-Yates shuffle index (`Math.floor(Math.random() * (i + 1))`) with `randomInt(...)`. Uses the global `crypto` (Web Crypto), no `node:crypto`/`randomBytes`, no `any`, no unused vars.
- **Task 2 (9e34ae79):** Extended (not rewrote) `password.test.ts` with a 50-iteration loop asserting length 16 and all four character classes survive the CSPRNG refactor.

## Verification

| Check | Result |
|---|---|
| `grep -c 'Math.random' password.ts` | 0 |
| `grep -c 'getRandomValues' password.ts` | 1 |
| `grep -c 'randomBytes' password.ts` | 0 (server primitive correctly absent) |
| `grep -c 'node:crypto' password.ts` | 0 |
| Password tests (`vitest run password`) | 15 passed (14 prior + 1 added) |

Test runner note: the plan's `pnpm --filter website vitest run password` shorthand does not resolve — the package name is `waldo-website` and `test` maps to watch-mode `vitest`. Ran via the local binary: `cd apps/website && node ../../node_modules/.bin/vitest run password` → 15/15 passing. `crypto.getRandomValues` resolves in the Vitest (happy-dom/Node 18+) environment, confirmed empirically.

## Deviations from Plan

None — plan executed as written. The only adjustment was the test-invocation command (filter name / `run` flag), not the plan's intent.

## Known Stubs

None.

## Codacy Impact

The 2 `insecure-random` findings in `password.ts` (snapshot lines 31, 45) are expected to clear on the remote re-scan handled by plan 01-06. This plan does not perform the remote re-scan (security buckets are remote-only per RESEARCH F1).

## Self-Check: PASSED

- FOUND: apps/website/app/utils/password.ts
- FOUND: apps/website/tests/utils/password.test.ts
- FOUND commit 998e7700 (fix: CSPRNG password generation)
- FOUND commit 9e34ae79 (test: multi-invocation charset/length guard)
