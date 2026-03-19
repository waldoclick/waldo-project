---
phase: 072-anthropic-claude-service
plan: "01"
subsystem: strapi-ai-services
tags: [anthropic, claude, web-search, brave-search, ai-service, strapi]
dependency_graph:
  requires: []
  provides: [anthropic-claude-service, post-ia-claude-endpoint]
  affects: [apps/strapi/src/api/ia]
tech_stack:
  added: ["@anthropic-ai/sdk@^0.78.0"]
  patterns: [module-level-singleton, tool-loop, native-fetch, application-error]
key_files:
  created:
    - apps/strapi/src/services/anthropic/anthropic.types.ts
    - apps/strapi/src/services/anthropic/anthropic.service.ts
    - apps/strapi/src/services/anthropic/index.ts
  modified:
    - apps/strapi/src/api/ia/controllers/ia.ts
    - apps/strapi/src/api/ia/routes/ia.ts
    - apps/strapi/package.json
    - yarn.lock
key_decisions:
  - "Model locked to claude-sonnet-4-5 (per plan spec)"
  - "Module-level singleton in index.ts throws at startup if either API key is missing"
  - "Native fetch for Brave Search (no axios — consistent with Node 20+ environment)"
  - "Tool loop terminates on stop_reason === end_turn; throws on unexpected stop_reason"
  - "Controller imports from services/anthropic/index.ts only — no direct SDK in API layer"
metrics:
  duration_seconds: 130
  completed_date: "2026-03-13"
  tasks_completed: 3
  tasks_total: 3
  files_created: 3
  files_modified: 2
---

# Phase 072 Plan 01: Anthropic Claude AI Service Summary

**One-liner:** AnthropicService with Brave Search web_search tool loop via @anthropic-ai/sdk + POST /api/ia/claude endpoint.

## What Was Built

Implemented the full Anthropic Claude AI integration for Strapi:

1. **`apps/strapi/src/services/anthropic/anthropic.types.ts`** — Four exported interfaces: `WebSearchResult`, `AnthropicRequest`, `AnthropicResponse`, `IAnthropicService`. Mirrors GeminiService types pattern exactly.

2. **`apps/strapi/src/services/anthropic/anthropic.service.ts`** — `AnthropicService` class implementing `IAnthropicService`:
   - Constructor validates both `ANTHROPIC_API_KEY` and `BRAVE_SEARCH_API_KEY`, throwing on startup if either is missing
   - `generate()` implements a full tool loop: calls `client.messages.create()`, processes `tool_use` blocks by executing Brave Search queries, feeds results back as `tool_result` messages, and terminates when `stop_reason === "end_turn"`
   - `executeBraveSearch()` calls `GET https://api.search.brave.com/res/v1/web/search?q={query}&count=5` using native fetch with `X-Subscription-Token` header
   - Zero `any` — uses `Anthropic.MessageParam[]`, `Anthropic.Tool`, `Anthropic.Messages.ToolUseBlock`, `Anthropic.Messages.TextBlock`, `Anthropic.ToolResultBlockParam` explicitly

3. **`apps/strapi/src/services/anthropic/index.ts`** — Module-level singleton + `generateWithSearch(prompt): Promise<AnthropicResponse>` named export. Re-exports all types. Mirrors GeminiService index pattern exactly.

4. **`apps/strapi/src/api/ia/controllers/ia.ts`** — Added `claude()` method alongside existing `gemini()`: validates prompt, calls `generateWithSearch`, returns `{ text }`, catches errors as `ApplicationError` with structured logging.

5. **`apps/strapi/src/api/ia/routes/ia.ts`** — Added `POST /ia/claude` route entry mapping to `ia.claude` handler.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Install @anthropic-ai/sdk | 8363e19 | apps/strapi/package.json, yarn.lock |
| 2 | Create AnthropicService (types, service, index) | 3d9e7ce | 3 new files in services/anthropic/ |
| 3 | Extend ia controller + routes | 30bfd48 | controllers/ia.ts, routes/ia.ts |

## Verification Results

All plan success criteria met:

- ✅ `apps/strapi/src/services/anthropic/` contains exactly 3 files
- ✅ Constructor throws if `ANTHROPIC_API_KEY` missing
- ✅ Constructor throws if `BRAVE_SEARCH_API_KEY` missing
- ✅ `generate()` implements full tool loop (tool_use → Brave Search → end_turn)
- ✅ `executeBraveSearch()` calls correct Brave Search endpoint with `X-Subscription-Token`
- ✅ `index.ts` exports singleton + `generateWithSearch(prompt): Promise<AnthropicResponse>`
- ✅ `POST /api/ia/claude` route maps to `ia.claude` handler
- ✅ Controller `claude()` validates prompt, calls `generateWithSearch`, throws `ApplicationError`
- ✅ Controller imports from `../../../services/anthropic` only (no direct `@anthropic-ai/sdk`)
- ✅ `.env.example` documents `ANTHROPIC_API_KEY` and `BRAVE_SEARCH_API_KEY`
- ✅ `tsc --noEmit` exits 0 with zero type errors
- ✅ Zero `any` in all new files

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files verified:
- `apps/strapi/src/services/anthropic/anthropic.types.ts` ✅
- `apps/strapi/src/services/anthropic/anthropic.service.ts` ✅
- `apps/strapi/src/services/anthropic/index.ts` ✅
- `apps/strapi/src/api/ia/controllers/ia.ts` ✅
- `apps/strapi/src/api/ia/routes/ia.ts` ✅

Commits verified:
- 8363e19 ✅
- 3d9e7ce ✅
- 30bfd48 ✅
