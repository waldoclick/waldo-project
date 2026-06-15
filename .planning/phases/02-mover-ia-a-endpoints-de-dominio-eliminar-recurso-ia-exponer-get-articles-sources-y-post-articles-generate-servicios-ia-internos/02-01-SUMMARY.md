---
phase: 02-mover-ia-a-endpoints-de-dominio-eliminar-recurso-ia-exponer-get-articles-sources-y-post-articles-generate-servicios-ia-internos
plan: 01
subsystem: api
tags: [strapi, ai, cerebras, groq, deepseek, gemini, anthropic, tavily, article]

# Dependency graph
requires: []
provides:
  - "GET /articles/sources?q= endpoint (manager-only, domain-shaped Tavily news results)"
  - "POST /articles/generate endpoint (manager-only, backend-built prompt, returns { text } only)"
  - "ai-provider orchestrator service with AI_PROVIDER env selection + fallback chain"
  - "Lazy-loaded AI service index files (gemini, groq, deepseek, anthropic)"
affects:
  - "02-02 (frontend cutover to new endpoints)"
  - "LightBoxArticles.vue (will be updated in 02-02 to call domain endpoints)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Lazy getter singleton in AI service index files (defer constructor throw to call time)"
    - "AI provider orchestrator: PROVIDERS map hides per-provider function name differences"
    - "resolveProvider() at call time (not constructor) so test env overrides work correctly"
    - "00-article-custom.ts prefix ensures static paths register before core :id wildcard"

key-files:
  created:
    - "apps/strapi/src/services/ai-provider/ai-provider.types.ts"
    - "apps/strapi/src/services/ai-provider/ai-provider.service.ts"
    - "apps/strapi/src/services/ai-provider/index.ts"
    - "apps/strapi/tests/services/ai-provider/ai-provider.service.test.ts"
    - "apps/strapi/src/api/article/routes/00-article-custom.ts"
  modified:
    - "apps/strapi/src/services/gemini/index.ts (eager → lazy)"
    - "apps/strapi/src/services/groq/index.ts (eager → lazy)"
    - "apps/strapi/src/services/deepseek/index.ts (eager → lazy)"
    - "apps/strapi/src/services/anthropic/index.ts (eager → lazy)"
    - "apps/strapi/src/api/article/controllers/article.ts (bare core → extended with sources + generate)"

key-decisions:
  - "resolveProvider() reads AI_PROVIDER at call time (not constructor) so env overrides in tests and runtime take effect correctly per-call"
  - "PROVIDERS map (Record<AiProviderName, fn>) hides the generateText vs generateWithSearch export name inconsistency between providers"
  - "Fallback chain JSON caveat: non-Cerebras providers may return fenced JSON which the frontend JSON.parse will fail on — acceptable since Cerebras is default and any failure is already better than today"
  - "ia and search resources left completely untouched — deletion is 02-02's job after frontend cutover (D-10)"

patterns-established:
  - "Lazy getter pattern: let x: XService | null = null; function getX(): XService { if (!x) { x = new XService(); } return x; } — defers constructor throw to first call"
  - "AiProviderService.generateArticleDraft resolves env at call time for testability"
  - "00-prefix custom route files register before core router so static segments precede wildcards"

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-06-15
---

# Phase 02 Plan 01: Additive AI Domain Endpoints Summary

**ai-provider orchestrator service with Cerebras-default + 5-provider fallback chain; GET /articles/sources and POST /articles/generate with manager-only access and server-side prompt; all 4 eager AI index files converted to lazy getters**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-15T15:22:01Z
- **Completed:** 2026-06-15T15:27:22Z
- **Tasks:** 3 (Task 2 = TDD with 2 commits: RED + GREEN)
- **Files modified:** 10

## Accomplishments

- Converted 4 eager AI service index files (gemini, groq, deepseek, anthropic) to the lazy getter pattern — constructors no longer throw at import time when API keys are missing, enabling the fallback chain to work
- Created `ai-provider` orchestrator service: reads `AI_PROVIDER` env at call time, builds attempt order with the resolved provider first + fixed `FALLBACK_ORDER`, tries each in sequence, logs each failure, throws all-providers-failed only when all 5 fail
- Extended article controller with `sources` (GET, returns `{ sources: result.news }` domain shape) and `generate` (POST, builds prompt server-side from `ARTICLE_PROMPT_TEMPLATE`, calls `generateArticleDraft`, returns `{ text }`, no persistence); registered both under `global::isManager` via `00-article-custom.ts`

## Task Commits

Each task was committed atomically:

1. **Task 1: Make 4 eager AI service index files lazy** - `a6ec604c` (feat)
2. **Task 2 RED: Add failing tests for ai-provider orchestrator** - `db43c2c3` (test)
3. **Task 2 GREEN: Create ai-provider orchestrator service** - `9c93f1c7` (feat)
4. **Task 3: Add sources + generate actions to article controller** - `38c7667e` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `apps/strapi/src/services/gemini/index.ts` — eager singleton → lazy getter (generateText export preserved)
- `apps/strapi/src/services/groq/index.ts` — eager singleton → lazy getter (generateText export preserved)
- `apps/strapi/src/services/deepseek/index.ts` — eager singleton → lazy getter (generateText export preserved)
- `apps/strapi/src/services/anthropic/index.ts` — eager singleton → lazy getter (generateWithSearch export name preserved)
- `apps/strapi/src/services/ai-provider/ai-provider.types.ts` — AiProviderName, IAiProviderResult, IAiProviderService
- `apps/strapi/src/services/ai-provider/ai-provider.service.ts` — AiProviderService class with PROVIDERS map, FALLBACK_ORDER, resolveProvider(), buildAttemptOrder(), generateArticleDraft()
- `apps/strapi/src/services/ai-provider/index.ts` — lazy singleton + generateArticleDraft named export + type re-exports
- `apps/strapi/tests/services/ai-provider/ai-provider.service.test.ts` — 5 Jest tests covering default/env-override/fallback/all-fail/invalid-env
- `apps/strapi/src/api/article/controllers/article.ts` — extended from bare core controller to factory-with-strapi with sources + generate actions + ARTICLE_PROMPT_TEMPLATE
- `apps/strapi/src/api/article/routes/00-article-custom.ts` — GET /articles/sources + POST /articles/generate with global::isManager

## Decisions Made

- **resolveProvider() at call time** — reading AI_PROVIDER inside generateArticleDraft() (not in a class constructor called at module load) ensures env overrides in tests and runtime deployments take effect per-call without needing service re-instantiation.
- **PROVIDERS map** — `Record<AiProviderName, (prompt: string) => Promise<{ text: string }>>` normalizes the `generateText` vs `generateWithSearch` naming inconsistency between providers at the boundary. All callers see a uniform signature.
- **Fallback-chain JSON parse caveat** — the frontend (`LightBoxArticles.vue`) calls `JSON.parse(result.text)` assuming Cerebras `json_object` mode output (fence-free). Non-Cerebras fallback providers may return fenced JSON which will cause `JSON.parse` to fail and surface the generic error. This is acceptable behavior: (a) Cerebras is the default and only changes on failure, (b) a failed parse is strictly better than today's single-provider behavior (total failure). The frontend will be updated in plan 02-02 as part of the cutover. Contract remains `{ text }` per D-08.

## Deviations from Plan

None — plan executed exactly as written. `ia` and `search` resources were left completely untouched as required.

## Issues Encountered

None. The advisor highlighted one edge case in advance: the `done` criterion `grep -c "= new .*Service()"` cannot reach 0 in a correctly-converted lazy file because the lazy getter body itself contains `new XService()`. Used the authoritative `ALL_LAZY` check (grep-L) instead, which correctly validates the pattern.

## User Setup Required

None — no external service configuration required. The `AI_PROVIDER` env var is optional; when unset, Cerebras is used by default.

## Fallback Chain JSON Parse Caveat

**Known limitation:** `LightBoxArticles.vue` currently calls `JSON.parse(result.text)` on the AI response, relying on Cerebras `json_object` mode which returns fence-free JSON. If the fallback chain fires (Cerebras fails and another provider is used), that provider may return markdown-fenced JSON and `JSON.parse` will throw. The frontend will show a generic error. This is acceptable and will be addressed in plan 02-02 during the frontend cutover — the new `/articles/generate` endpoint returns `{ text }` per D-08 and the frontend will need to handle parse errors gracefully.

## Next Phase Readiness

- Plan 02-02 can now proceed: cut the frontend (`LightBoxArticles.vue`) over from `/ia/cerebras` + `/search/tavily` to `/articles/sources` + `/articles/generate`, then remove the `ia` and `search` resources (D-04/D-10)
- `npx tsc --noEmit` exits 0 in apps/strapi — TypeScript is clean
- All 8 tests pass (5 ai-provider + 3 tavily regression)

---
*Phase: 02-mover-ia-a-endpoints-de-dominio*
*Completed: 2026-06-15*
