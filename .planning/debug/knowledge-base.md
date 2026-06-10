# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## ssr-ipc-connection-closed-crash — SSR worker dies with "IPC connection closed" on every request after SCSS migration
- **Date:** 2026-06-10
- **Error patterns:** IPC connection closed, vite-node, SSR worker, undefined variable, sass, SCSS, $white, GET /, 500
- **Root cause:** Phase 125 dashboard SCSS merge omitted `$white: #ffffff` from `apps/website/app/scss/abstracts/_variables.scss`. Sass throws "Undefined variable $white" when the vite-node worker compiles `app.scss` on the first request, killing the worker process. The parent sees only the IPC socket close — masking the true cause with "IPC connection closed" and no useful stack trace.
- **Fix:** Added `$white: #ffffff` to `apps/website/app/scss/abstracts/_variables.scss` (matching the value from the original dashboard `_variables.scss`).
- **Files changed:** apps/website/app/scss/abstracts/_variables.scss
---
