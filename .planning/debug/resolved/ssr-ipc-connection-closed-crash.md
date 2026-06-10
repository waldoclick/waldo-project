---
status: resolved
trigger: "SSR worker crashes with IPC connection closed on every GET / request even with no cookies"
created: 2026-06-10T00:00:00Z
updated: 2026-06-10T01:00:00Z
symptoms_prefilled: true
---

## Current Focus

hypothesis: CONFIRMED — Phase 125 dashboard SCSS merge omitted $white variable definition
test: Added $white: #ffffff to _variables.scss, ran nuxi dev + curl GET / → HTTP 200
expecting: Successful response
next_action: DONE

## Symptoms

expected: GET / renders the home page without errors
actual: SSR worker crashes with "IPC connection closed" on every request
errors: IPC connection closed (symptom only, not root cause)
reproduction: Start nuxi dev server, make any request to GET /
started: After Phase 125 migration (added ~200 components, 68 pages, new packages, stores, layout)

## Eliminated

- hypothesis: Guard middlewares (onboarding-guard, dashboard-guard) crashing on fetchUser
  evidence: Both have try/catch around fetchUser() — pre-ruled out
  timestamp: 2026-06-10

- hypothesis: better-sqlite3 native bindings
  evidence: Rebuilt successfully — pre-ruled out
  timestamp: 2026-06-10

- hypothesis: TypeScript compilation errors
  evidence: nuxi typecheck passes with 0 errors — pre-ruled out
  timestamp: 2026-06-10

## Evidence

- timestamp: 2026-06-10T00:10:00Z
  checked: nuxi generate output
  found: Build fails with "[sass] Undefined variable $white" in apps/website/app/scss/components/_button.scss:258 via app.scss:19
  implication: The vite-node SSR worker compiles SCSS lazily on the first request in dev mode — the sass exception kills the worker process, the IPC socket closes, and the parent reports "IPC connection closed"

- timestamp: 2026-06-10T00:15:00Z
  checked: apps/website/app/scss/abstracts/_variables.scss vs git show HEAD~20:apps/dashboard/app/scss/abstracts/_variables.scss
  found: Dashboard had $white:#ffffff; website _variables.scss had every other variable except $white
  implication: Phase 125 (feat/125-06) merged dashboard SCSS component files but the _variables.scss merge omitted the $white token

- timestamp: 2026-06-10T00:20:00Z
  checked: All $white usages across merged SCSS files
  found: 16 occurrences across _button.scss, _cloudflare.scss, _upload.scss, _better-stack.scss, _gallery.scss, _card.scss, _google-analytics.scss, _search-console.scss
  implication: All newly merged dashboard SCSS components relied on $white; _button.scss is imported first (line 19 of app.scss) so it's the first to crash

- timestamp: 2026-06-10T00:25:00Z
  checked: Fix verification — added $white:#ffffff to _variables.scss, curl GET / on nuxi dev
  found: HTTP 200, full HTML rendered correctly
  implication: Root cause confirmed and fixed

- timestamp: 2026-06-10T00:30:00Z
  checked: nuxi generate after fix
  found: Build succeeded (3318 modules transformed); only errors are Sentry 401 (expected in local dev, no auth token)
  implication: SCSS compilation clean in both dev and production build modes

## Resolution

root_cause: Phase 125 dashboard SCSS merge omitted the $white:#ffffff variable from _variables.scss. The website's _variables.scss had all 15 brand color tokens from the dashboard except $white. When any request hits GET /, Vite compiles app.scss for SSR which includes _button.scss (first component import at line 19). Sass throws "Undefined variable $white" which kills the vite-node SSR worker process. The parent process only sees the IPC socket close, reporting "IPC connection closed" — masking the true cause.
fix: Added $white:#ffffff to apps/website/app/scss/abstracts/_variables.scss between $silver and $white_smoke, matching the value from the original dashboard _variables.scss.
verification: curl GET http://localhost:3006/ returns HTTP 200 with full HTML. nuxi generate completes successfully (3318 modules transformed) with zero SCSS errors.
files_changed: [apps/website/app/scss/abstracts/_variables.scss]
