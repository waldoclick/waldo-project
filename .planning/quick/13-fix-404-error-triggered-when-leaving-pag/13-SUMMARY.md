---
phase: quick-13
plan: 01
subsystem: website/pages
tags: [nuxt, useAsyncData, routing, bug-fix]
dependency_graph:
  requires: []
  provides: [stable-gracias-pages]
  affects: [apps/website/app/pages/pagar/gracias.vue, apps/website/app/pages/anunciar/gracias.vue]
tech_stack:
  added: []
  patterns: [static-useAsyncData-key]
key_files:
  created: []
  modified:
    - apps/website/app/pages/pagar/gracias.vue
    - apps/website/app/pages/anunciar/gracias.vue
decisions:
  - "Static string keys for useAsyncData prevent reactive re-fetch when route.query clears on navigation"
metrics:
  duration: "< 5 minutes"
  completed: "2026-03-11"
  tasks_completed: 1
  files_modified: 2
---

# Quick Task 13: Fix 404 Error Triggered When Leaving Gracias Pages — Summary

**One-liner:** Replaced reactive `() => \`gracias-${route.query.*}\`` useAsyncData keys with static strings `"pagar-gracias"` / `"anunciar-gracias"` to eliminate phantom 404s on navigation away.

## What Was Done

Both `/pagar/gracias` and `/anunciar/gracias` used arrow functions as `useAsyncData` keys. In Nuxt 4, a function key makes the call **reactive** — the fetcher re-runs whenever the key changes. When navigating away from either page, `route.query` cleared, the key became `"gracias-undefined"`, the fetcher ran with no `documentId`, returned `{ error: "INVALID_URL" }`, and `watchEffect` fired `showError()`, intercepting the outgoing navigation with a 404.

The fix is a minimal two-line change: both keys are now static strings, so the fetcher runs exactly once on initial arrival and never triggers again on subsequent route changes. The fetcher body still reads `route.query.order` / `route.query.ad` correctly for the initial fetch.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix reactive useAsyncData keys in both gracias pages | 562adee | pagar/gracias.vue, anunciar/gracias.vue |

## Verification

```
grep -n '"pagar-gracias"' apps/website/app/pages/pagar/gracias.vue
→ 101:  "pagar-gracias",

grep -n '"anunciar-gracias"' apps/website/app/pages/anunciar/gracias.vue
→ 43:  "anunciar-gracias",

grep "() =>" | grep useAsyncData  → (no matches)
```

All three verification conditions from the plan pass.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `apps/website/app/pages/pagar/gracias.vue` — key changed ✓
- `apps/website/app/pages/anunciar/gracias.vue` — key changed ✓
- Commit `562adee` exists ✓
- No other lines changed in either file ✓
