---
phase: quick-48
plan: 01
subsystem: dashboard-dev
tags: [dev-tooling, vite, hmr, typescript]
dependency_graph:
  requires: []
  provides: [stable-parallel-dev-servers]
  affects: [apps/dashboard]
tech_stack:
  added: []
  patterns: [typeCheck-disabled-for-race-avoidance, hmr-port-isolation]
key_files:
  created: []
  modified:
    - apps/dashboard/nuxt.config.ts
decisions:
  - Dashboard disables typeCheck to avoid EEXIST race on shared vite-plugin-checker node_modules path
  - Dashboard uses HMR port 24679 to isolate WebSocket from website (24678)
metrics:
  duration: "3 minutes"
  completed: "2026-03-15"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 48: Fix EEXIST mkdir Error in vite-plugin-checker Summary

**One-liner:** Disabled dashboard typeCheck and set HMR port 24679 to eliminate concurrent dev-server race conditions.

## What Was Done

Two targeted edits to `apps/dashboard/nuxt.config.ts` that unblock parallel `yarn dev` execution:

1. **`typescript.typeCheck: false`** — Both the website and dashboard share the same `node_modules/vite-plugin-checker/dist/checkers/vueTsc/typescript-vue-tsc` path. When `yarn dev` starts both apps concurrently, both `prepareVueTsc` calls check the flag file at the same time, both set `shouldBuildFixture = true`, then process A does `rm -rf` + `mkdir` while process B does `mkdir` on the already-recreated directory → `EEXIST`. Disabling typeCheck in the dashboard eliminates dashboard's `prepareVueTsc` invocation entirely. Type checking is still available via `yarn workspace waldo-dashboard nuxi typecheck`.

2. **`vite.server.hmr.port: 24679`** — Both Nuxt apps default to Vite HMR WebSocket port 24678. After the EEXIST crash above causes dashboard to restart, the website still owns 24678. Setting dashboard to 24679 gives each app its own dedicated HMR port.

## Tasks

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Fix typeCheck race and HMR port conflict in dashboard | 124a026 | apps/dashboard/nuxt.config.ts |

## Deviations from Plan

None — plan executed exactly as written.

## Verification

```
grep -n "typeCheck\|hmr\|24679" apps/dashboard/nuxt.config.ts
394:    // typeCheck disabled: both apps share the same node_modules/vite-plugin-checker/...
395:    // path. Running prepareVueTsc concurrently causes EEXIST race. Website runs typeCheck instead.
397:    typeCheck: false,
434:      hmr: {
435:        // Use 24679 (not default 24678) to avoid WebSocket port conflict with website ...
436:        port: 24679,

grep -n "typeCheck\|hmr" apps/website/nuxt.config.ts
407:    typeCheck: true,    ← unchanged
```

Website is unaffected: `typeCheck: true`, no HMR override, still on port 24678.

## Self-Check: PASSED

- [x] `apps/dashboard/nuxt.config.ts` modified — `typeCheck: false` + `hmr.port: 24679` present
- [x] Website config unchanged — `typeCheck: true`, no HMR port override
- [x] Commit `124a026` exists and includes only `apps/dashboard/nuxt.config.ts`
