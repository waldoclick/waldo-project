---
phase: 126-security-hardening
plan: "04"
subsystem: security
tags: [security, hardening, email-escape, dev-endpoints, regex-bypass]
dependency_graph:
  requires: [126-01]
  provides: [dev-endpoint-gate, email-html-escape, trailing-slash-regex-fix]
  affects: [apps/website/server/api, apps/strapi/src/api/contact, apps/strapi/src/middlewares]
tech_stack:
  added: [apps/strapi/src/services/mjml/escape.ts, apps/website/tests/stubs/nitro-globals.ts]
  patterns: [import.meta.dev gate, boundary escaping before template render, optional trailing-slash regex]
key_files:
  created:
    - apps/website/server/api/dev-config.get.ts (modified)
    - apps/website/server/api/dev-login.post.ts (modified)
    - apps/strapi/src/services/mjml/escape.ts
    - apps/website/tests/server/dev-endpoints.test.ts
    - apps/website/tests/stubs/nitro-globals.ts
    - apps/strapi/tests/api/contact/contact-escape.test.ts
  modified:
    - apps/strapi/src/services/mjml/index.ts
    - apps/strapi/src/api/contact/services/contact.service.ts
    - apps/strapi/src/middlewares/protect-user-fields.ts
    - apps/strapi/tests/middlewares/protect-user-fields.test.ts
    - apps/website/vitest.config.ts
decisions:
  - "escapeHtml applied at contact service boundary (not inside renderEmail) so nunjucks autoescape: false stays intact for server-built transactional HTML"
  - "Nitro globals (defineEventHandler, createError, etc.) stubbed via setupFiles in vitest.config.ts — vi.stubGlobal is insufficient because ESM static imports resolve before test body runs"
  - "escapeHtml(value: unknown) accepts any type — returns empty string for null/undefined, coerces everything else via String()"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-12"
  tasks: 3
  files: 11
---

# Phase 126 Plan 04: Dev-Endpoint Gate, Email HTML Escape, and Regex Fix Summary

Three independent security hardening fixes: production dev-bypass gate, HTML injection prevention in operator emails, and a regex trailing-slash bypass closure.

## Completed Tasks

### Task 1: Gate dev endpoints behind import.meta.dev + Vitest test (commit: 661c7ab0)

Added `import.meta.dev` guard as the **first statement** of both dev-only Nitro handlers. In production, `import.meta.dev` is `false`, causing the handlers to return 404 immediately before any body parsing or credential check occurs.

- `dev-config.get.ts`: guard added before `useRuntimeConfig()` call
- `dev-login.post.ts`: guard added before `readBody(event)` call
- Test: `tests/server/dev-endpoints.test.ts` — two `it()` cases asserting statusCode 404

**Deviation (Rule 3 - Blocking):** Added `tests/stubs/nitro-globals.ts` and `setupFiles` entry in `vitest.config.ts`. Nitro auto-imports (`defineEventHandler`, `createError`, etc.) are not available in the Vitest environment. `vi.stubGlobal` cannot stub them before ESM static imports are resolved. A `setupFiles` entry registers them on `globalThis` before any test module is evaluated — this is the only reliable approach without rewriting the handlers to use explicit imports.

### Task 2: Escape user-supplied contact fields before email render + Jest test (commit: 315e4de9)

Created `apps/strapi/src/services/mjml/escape.ts` with an `escapeHtml(value: unknown): string` helper that converts `< > & " '` to their HTML entities. The function accepts `unknown` to handle `null`/`undefined` phone/company fields (they are optional in `ContactData`).

Applied `escapeHtml` to all user-supplied fields before they enter `sendMjmlEmail` in both calls:
- `contact-user` payload: `name`, `phone`, `company`
- `contact-admin` payload: `name`, `email`, `phone`, `company`, `message`

The recipient `to` address (passed as the 3rd argument to `sendMjmlEmail`) is intentionally **not** escaped — it is an SMTP envelope field, not a rendered template body field.

`nunjucks autoescape` remains `false` in `index.ts` — transactional templates render server-built HTML (button URLs, links) that must not be double-escaped.

Jest test file (`tests/api/contact/contact-escape.test.ts`) covers: direct `escapeHtml` unit tests for all 5 entities + null/undefined/number coercion; service integration test asserting `<script>x</script>` → `&lt;script&gt;x&lt;/script&gt;` in contact-admin payload; and that the recipient email is unescaped. 7 tests total, all passing.

### Task 3: Fix USER_UPDATE_PATH_REGEX trailing-slash bypass + test extension (commit: 1e78e4b6)

Changed `USER_UPDATE_PATH_REGEX` in `protect-user-fields.ts` from `/^\/api\/users\/\d+$/` to `/^\/api\/users\/\d+\/?$/`. The `\/?` makes the trailing slash optional — `PUT /api/users/123/` now correctly triggers field stripping.

`PROTECTED_USER_FIELDS` unchanged — still 8 fields (`pro_status`, `username`, `avatar`, `cover`, `role`, `provider`, `confirmed`, `blocked`). No `email` or `password` present.

Added test 11 to `protect-user-fields.test.ts` (appended, no existing cases modified): asserts that `PUT /api/users/123/` with `{ data: { pro_status: "active", firstname: "Alice" } }` strips `pro_status` and preserves `firstname`. 11 tests total, all passing.

## Verification

- `cd apps/website && pnpm exec vitest run tests/server/dev-endpoints.test.ts` — 2 tests passed
- `cd apps/strapi && pnpm exec jest tests/api/contact/contact-escape.test.ts tests/middlewares/protect-user-fields.test.ts` — 18 tests passed (7 + 11)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added nitro-globals.ts setupFile for Vitest server handler tests**
- **Found during:** Task 1
- **Issue:** `defineEventHandler`, `createError`, and `useRuntimeConfig` are Nitro auto-injected globals. `vi.stubGlobal` and `vi.hoisted` cannot set them before ESM static module evaluation resolves.
- **Fix:** Created `apps/website/tests/stubs/nitro-globals.ts` that sets these on `globalThis`, and added `setupFiles: ["./tests/stubs/nitro-globals.ts"]` to `vitest.config.ts` — setupFiles run before any module is imported.
- **Files modified:** `apps/website/tests/stubs/nitro-globals.ts`, `apps/website/vitest.config.ts`
- **Commit:** 661c7ab0

## Known Stubs

None — all three fixes are complete implementations, not stubs.

## Self-Check: PASSED

- [x] `apps/website/server/api/dev-config.get.ts` — FOUND, contains `import.meta.dev` and `statusCode: 404`
- [x] `apps/website/server/api/dev-login.post.ts` — FOUND, contains `import.meta.dev` and `statusCode: 404`
- [x] `apps/strapi/src/services/mjml/escape.ts` — FOUND, exports `escapeHtml`
- [x] `apps/strapi/src/services/mjml/index.ts` — FOUND, re-exports `escapeHtml`; `autoescape: false` present
- [x] `apps/strapi/src/api/contact/services/contact.service.ts` — FOUND, `escapeHtml` called on all 5 user fields
- [x] `apps/strapi/src/middlewares/protect-user-fields.ts` — FOUND, regex matches `\d+\/?$`
- [x] `apps/website/tests/server/dev-endpoints.test.ts` — FOUND, 2 it() cases
- [x] `apps/strapi/tests/api/contact/contact-escape.test.ts` — FOUND, 7 tests
- [x] `apps/strapi/tests/middlewares/protect-user-fields.test.ts` — FOUND, 11 tests (10 original + 1 new)
- [x] commit 661c7ab0 — FOUND
- [x] commit 315e4de9 — FOUND
- [x] commit 1e78e4b6 — FOUND
