---
phase: quick-260404-o0g
plan: "01"
subsystem: terms-feature
tags: [strapi, dashboard, website, crud, drag-and-drop, terms]
dependency_graph:
  requires: []
  provides: [term-collection-type, terms-crud-dashboard, condiciones-de-uso-page]
  affects: [apps/strapi, apps/dashboard, apps/website]
tech_stack:
  added: []
  patterns: [policies-mirror-pattern, cache-guard-store, drag-and-drop-reorder]
key_files:
  created:
    - apps/strapi/src/api/term/content-types/term/schema.json
    - apps/strapi/src/api/term/controllers/term.ts
    - apps/strapi/src/api/term/routes/term.ts
    - apps/strapi/src/api/term/services/term.ts
    - apps/website/app/types/term.d.ts
    - apps/website/app/stores/terms.store.ts
    - apps/website/app/components/TermsDefault.vue
    - apps/website/app/pages/condiciones-de-uso.vue
    - apps/website/tests/stores/terms.store.test.ts
    - apps/dashboard/app/components/TermsDefault.vue
    - apps/dashboard/app/components/FormTerm.vue
    - apps/dashboard/app/pages/terms/index.vue
    - apps/dashboard/app/pages/terms/new.vue
    - apps/dashboard/app/pages/terms/[id]/index.vue
    - apps/dashboard/app/pages/terms/[id]/edit.vue
  modified:
    - apps/dashboard/app/stores/settings.store.ts
    - apps/dashboard/app/components/MenuDefault.vue
decisions:
  - Term collection type replicates policy schema exactly (string title, text, integer order, draftAndPublish false)
  - Website terms store uses 1-hour cache TTL with persistedState.localStorage, identical to policies store
  - Dashboard TermsDefault uses drag-and-drop reorder via vuedraggable, mirroring PoliciesDefault pattern
  - Menu entry added after Politicas under Mantenedores using ScrollText icon from lucide-vue-next
metrics:
  duration: ~20 minutes
  completed: "2026-04-04"
  tasks_completed: 2
  files_created: 15
  files_modified: 2
---

# Phase quick-260404-o0g Plan 01: Terms of Use Feature Summary

## One-liner

Full "Condiciones de Uso" feature: Strapi term collection type, dashboard CRUD with drag-and-drop reorder at /terms, and public website page at /condiciones-de-uso with accordion display.

## Tasks Completed

| # | Name | Commit | Status |
|---|------|--------|--------|
| 1 | Create Strapi term collection type and website term types/store/page | 22f0c430 | Done |
| 2 | Create dashboard term management pages and wire into menu/settings | c23d4a97 | Done |

## What Was Built

### Task 1 — Strapi + Website

**Strapi collection type** (`apps/strapi/src/api/term/`): Created full directory structure with `schema.json` (kind: collectionType, collectionName: terms, attributes: title/text/order, draftAndPublish: false), `controllers/term.ts`, `routes/term.ts`, and `services/term.ts` — all using `factories.createCoreX("api::term.term")` pattern.

**Website types** (`apps/website/app/types/term.d.ts`): `Term` and `TermResponse` interfaces mirroring `policy.d.ts`.

**Website store** (`apps/website/app/stores/terms.store.ts`): `useTermsStore` with 1-hour cache guard (`CACHE_DURATION = 3600000`), sorts by `order:asc`, persisted to localStorage with audit comment.

**Website component** (`apps/website/app/components/TermsDefault.vue`): "Condiciones de uso" heading with intro paragraph, renders `AccordionDefault :questions="terms"`.

**Website page** (`apps/website/app/pages/condiciones-de-uso.vue`): Layout "about", `useAsyncData("terms", ...)`, full SEO via `$setSEO` and `$setStructuredData` with WebPage schema.

**Website tests** (`apps/website/tests/stores/terms.store.test.ts`): 3 unit tests — first fetch, cache skip, stale cache refetch. All pass.

### Task 2 — Dashboard

**Settings store** (`apps/dashboard/app/stores/settings.store.ts`): Added `terms: SectionSettings` to interface, `terms` ref with `sortBy: "order:asc"`, `getTermsFilters` computed, `case "terms"` in switch, exported in return.

**TermsDefault.vue** (`apps/dashboard/app/components/TermsDefault.vue`): Full drag-and-drop list with vuedraggable, search/filter support, fetchTerms, handleReorder (PUT to `/terms/${documentId}`), BEM `terms terms--default`.

**FormTerm.vue** (`apps/dashboard/app/components/FormTerm.vue`): Create/edit form with vee-validate + yup, auto-assigns next order on create, PUT on edit, Swal feedback, BEM `form form--term`.

**Pages**:
- `/terms/index.vue`: List page with "Agregar Condicion" CTA
- `/terms/new.vue`: Create page with FormTerm
- `/terms/[id]/index.vue`: Detail page (filters by numeric id)
- `/terms/[id]/edit.vue`: Edit page with FormTerm and saved handler

**MenuDefault.vue**: Added `ScrollText` icon import, new `<li>` entry "Condiciones de Uso" at `/terms` after Politicas, `isRouteActive("/terms")` in `isMantenedoresActive`, `path.startsWith("/terms")` in route watch.

## Verification

- Strapi: `apps/strapi/src/api/term/content-types/term/schema.json` exists with correct schema (CONFIRMED)
- Website: `yarn workspace waldo-website vitest run tests/stores/terms.store.test.ts` — 3/3 tests pass (CONFIRMED)
- Dashboard: `npx nuxi typecheck apps/dashboard` — clean (no errors) (CONFIRMED)
- Menu: `/terms` route appears in MenuDefault.vue under Mantenedores (CONFIRMED)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files verified:
- `apps/strapi/src/api/term/content-types/term/schema.json` — FOUND
- `apps/website/app/stores/terms.store.ts` — FOUND
- `apps/website/app/pages/condiciones-de-uso.vue` — FOUND
- `apps/dashboard/app/components/TermsDefault.vue` — FOUND
- `apps/dashboard/app/pages/terms/index.vue` — FOUND

Commits verified:
- `22f0c430` — FOUND (feat: Strapi + website)
- `c23d4a97` — FOUND (feat: dashboard CRUD + menu)
