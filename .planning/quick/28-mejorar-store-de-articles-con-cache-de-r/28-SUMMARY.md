---
phase: quick-28
plan: 28
subsystem: dashboard
tags: [pinia, cache, articles, ai, duplicate-detection, lightbox]
dependency_graph:
  requires: []
  provides: [AI response cache keyed by source URL, duplicate article guard in LightBoxArticles]
  affects: [LightBoxArticles.vue, articles.store.ts]
tech_stack:
  added: []
  patterns: [session-only Pinia store (no persist), Strapi GET before POST duplicate check]
key_files:
  created:
    - apps/dashboard/app/stores/articles.store.ts
  modified:
    - apps/dashboard/app/components/LightBoxArticles.vue
decisions:
  - "Session-only AI cache (no persist) — avoids stale AI responses surviving page reload"
  - "Duplicate check uses GET /articles with source_url filter before POST, then navigates to /articles/edit/[documentId] using documentId per project rules"
  - "isDismissed check on cache Swal exits early with loading.value = false — prevents loader getting stuck"
  - "Duplicate Swal uses await + single isConfirmed check (no nested .then) for cleaner async flow"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-03-13T18:58:13Z"
  tasks_completed: 2
  files_modified: 2
---

# Quick Task 28: Improve Articles Store with AI Response Cache and Duplicate Detection

**One-liner:** Session AI cache (Pinia, no persist) + Strapi source_url duplicate guard before article creation.

## What Was Built

### Task 1 — articles.store.ts
Created `apps/dashboard/app/stores/articles.store.ts` as a new Pinia Composition-API store following the same pattern as `search.store.ts`.

- **`IAIArticleCache` interface** exported — `{ sourceUrl, result: { title, header, body, seo_title, seo_description }, cachedAt }`
- **`aiCache` state** — `ref<Record<string, IAIArticleCache>>({})` keyed by source URL
- **Three methods:** `getAICache(url)`, `hasAICache(url)`, `setAICache(url, result)`
- **No `persist`** — session-only, intentional — stale AI responses should not survive page reload

### Task 2 — LightBoxArticles.vue handleGenerate() guards
Added two new guard flows inside `handleGenerate()`:

**Guard A — AI Cache Check (before Groq call):**
- `articlesStore.hasAICache(item.link)` checked before building the Groq prompt
- Cache hit → Swal "Respuesta guardada" with "Usar guardada" / "Generar nueva" options
- `isDismissed` → early return with `loading.value = false`
- `isConfirmed` → `parsed` set from cache, Groq call skipped entirely
- After successful Groq parse → `articlesStore.setAICache(item.link, parsed)` caches result

**Guard B — Duplicate Article Check (before Strapi POST):**
- `GET /articles` with `params: { filters: { source_url: { $eq: item.link } } }` via `useStrapiClient()`
- Duplicate found → Swal "Esta noticia ya existe" with "Ir al artículo" / "Cancelar"
- Confirmed → `navigateTo(\`/articles/edit/${docId}\`)` using `documentId` (project rule)
- Either branch exits with `return` — POST never fires if duplicate exists

## Verification

- `yarn --cwd apps/dashboard nuxt typecheck` → zero errors (both tasks)
- No pre-commit hook failures (ESLint + Prettier passed unchanged)
- Store has no `persist` block — confirmed session-only

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `apps/dashboard/app/stores/articles.store.ts` — FOUND
- `apps/dashboard/app/components/LightBoxArticles.vue` — FOUND
- Commit `7375efb` (Task 1) — FOUND
- Commit `f05e75e` (Task 2) — FOUND
