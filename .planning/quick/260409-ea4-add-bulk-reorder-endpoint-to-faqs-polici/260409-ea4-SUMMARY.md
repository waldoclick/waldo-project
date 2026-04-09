---
phase: 260409-ea4
plan: "01"
subsystem: strapi-api, dashboard-components
tags: [reorder, bulk-endpoint, faq, policy, term, strapi, dashboard]
dependency_graph:
  requires: []
  provides:
    - POST /api/faqs/reorder (bulk update order field)
    - POST /api/policies/reorder (bulk update order field)
    - POST /api/terms/reorder (bulk update order field)
    - PUT /api/policies/:id with documentId support
    - PUT /api/terms/:id with documentId support
  affects:
    - apps/strapi/src/api/faq/controllers/faq.ts
    - apps/strapi/src/api/faq/routes/01-custom-faq.ts
    - apps/strapi/src/api/policy/controllers/policy.ts
    - apps/strapi/src/api/policy/routes/01-custom-policy.ts
    - apps/strapi/src/api/term/controllers/term.ts
    - apps/strapi/src/api/term/routes/01-custom-term.ts
    - apps/dashboard/app/components/FaqsDefault.vue
    - apps/dashboard/app/components/PoliciesDefault.vue
    - apps/dashboard/app/components/TermsDefault.vue
tech_stack:
  added: []
  patterns:
    - Bulk reorder endpoint using Promise.all of db.query updates (no entityService)
    - Custom route file (01-custom-{name}.ts) alongside core router for extra routes
    - Dual-id (numeric id vs documentId) update pattern from faq.update() applied to policy and term
key_files:
  created:
    - apps/strapi/src/api/faq/routes/01-custom-faq.ts
    - apps/strapi/src/api/policy/routes/01-custom-policy.ts
    - apps/strapi/src/api/term/routes/01-custom-term.ts
  modified:
    - apps/strapi/src/api/faq/controllers/faq.ts
    - apps/strapi/src/api/policy/controllers/policy.ts
    - apps/strapi/src/api/term/controllers/term.ts
    - apps/dashboard/app/components/FaqsDefault.vue
    - apps/dashboard/app/components/PoliciesDefault.vue
    - apps/dashboard/app/components/TermsDefault.vue
decisions:
  - Inline db.query in controller instead of service layer — matches existing faq controller pattern; keeps change minimal
  - Full custom controller for policy and term (not extending createCoreController) — required because reorder action and dual-id update both need direct db.query; createCoreController wraps through document service which expects documentId natively but the custom update is needed for consistency with faq and to match existing dashboard behavior
  - 01-custom-{name}.ts naming for extra routes — Strapi auto-loads all files in routes/ directory; prefix 01- ensures load order before core router if Strapi processes alphabetically
  - Reorder permissions not granted in this task — must be allowed via Users & Permissions plugin for authenticated role at runtime; dashboard sends authenticated token via useApiClient
metrics:
  duration_minutes: 15
  completed_date: "2026-04-09"
  tasks_completed: 2
  files_changed: 9
---

# Phase 260409-ea4 Plan 01: Add Bulk Reorder Endpoint to FAQs, Policies, Terms — Summary

**One-liner:** Single POST /reorder bulk endpoint for faq/policy/term with dual-id update fix; replaces N parallel PUTs from dashboard drag-to-reorder.

## Tasks Completed

| # | Name | Commit |
|---|------|--------|
| 1 | Add bulk reorder + dual-id update to Strapi controllers and routes | ff9f0cb9 |
| 2 | Replace N-PUT reorder with single bulk POST in three dashboard components | 70b10ee4 |

## What Was Built

### Strapi (Task 1)

**FAQ controller** (`apps/strapi/src/api/faq/controllers/faq.ts`) — added `reorder` action to the existing custom controller. Validates that `data` is a non-empty array, each entry has a string `documentId` and a finite numeric `order`, then runs a `Promise.all` of `strapi.db.query(...).update` calls.

**Policy controller** (`apps/strapi/src/api/policy/controllers/policy.ts`) — replaced the default `factories.createCoreController` with a full custom controller mirroring the faq structure: `find` (pagination + populate normalization + orderBy normalization + count), `findOne`, `create`, `update` (dual-id pattern), `delete`, `reorder`.

**Term controller** (`apps/strapi/src/api/term/controllers/term.ts`) — identical structure to policy controller, UID `api::term.term`.

**Custom route files** — three new files created:
- `apps/strapi/src/api/faq/routes/01-custom-faq.ts` → `POST /faqs/reorder`
- `apps/strapi/src/api/policy/routes/01-custom-policy.ts` → `POST /policies/reorder`
- `apps/strapi/src/api/term/routes/01-custom-term.ts` → `POST /terms/reorder`

Core router files (`faq.ts`, `policy.ts`, `term.ts`) left untouched — Strapi loads all files in `routes/` and the core router provides standard CRUD.

### Dashboard (Task 2)

`handleReorder` in `FaqsDefault.vue`, `PoliciesDefault.vue`, `TermsDefault.vue` — replaced the `Promise.all` of N `PUT /{resource}/{documentId}` calls with a single `apiClient("/{resource}/reorder", { method: "POST", body: { data: updates } })`. The `updates` array shape `[{ documentId, order }]` is unchanged; only the transport changed from N individual requests to one batch request.

## Decisions Made

**Inline db.query vs service layer:** The existing faq controller inlines db.query directly (no service). Policy and term follow the same pattern to keep the diff minimal and consistent. A separate service layer would require new files and additional indirection with no benefit here.

**Full custom controller for policy/term:** `createCoreController` was sufficient before because no custom behavior was needed. Adding `reorder` and the dual-id `update` requires stepping out of the factory pattern. The full custom controller also gives explicit control over `find` (pagination normalization) that the core controller handled transparently — copied verbatim from the faq controller to avoid any regression.

**Permissions at runtime:** The new `reorder` action must be explicitly allowed in the Strapi admin under Settings > Users & Permissions > Roles > Authenticated > {resource}. This is a one-time manual step in the Strapi admin panel — out of scope for this code task.

## Gotchas

**Strapi route file loading:** Strapi v5 merges all `.ts` files exported from the `routes/` directory. Naming the custom file `01-custom-{name}.ts` ensures it is logically separate from the core router and loads in predictable order. Do not delete the core router file or standard CRUD routes (`find`, `findOne`, `create`, `update`, `delete`) will be lost.

**Permissions for new actions:** Any action added to a custom controller that is not part of the standard CRUD set (`find`, `findOne`, `create`, `update`, `delete`) does NOT automatically inherit permissions from the core router. The `reorder` action will return 403 until it is explicitly allowed in Users & Permissions for the authenticated role in the Strapi admin.

**No entityService:** All db operations use `strapi.db.query` per the Phase 122 project-wide migration rule.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

Files verified:
- apps/strapi/src/api/faq/routes/01-custom-faq.ts: FOUND
- apps/strapi/src/api/policy/routes/01-custom-policy.ts: FOUND
- apps/strapi/src/api/term/routes/01-custom-term.ts: FOUND
- apps/strapi/src/api/policy/controllers/policy.ts: FOUND (reorder action present)
- apps/strapi/src/api/term/controllers/term.ts: FOUND (reorder action present)

Commits verified:
- ff9f0cb9: FOUND
- 70b10ee4: FOUND
