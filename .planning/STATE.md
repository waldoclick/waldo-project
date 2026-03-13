---
gsd_state_version: 1.0
milestone: v1.33
milestone_name: Anthropic Claude AI Service
current_phase: 072
status: complete
last_updated: "2026-03-13"
last_activity: 2026-03-13 — v1.33 complete — Anthropic Claude AI Service shipped
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13 after v1.32 milestone shipped)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.33 — Anthropic Claude AI Service

## Position

**Milestone:** v1.33 — Anthropic Claude AI Service (complete)
**Current Phase:** 072 (complete)
**Status:** 072-01-PLAN.md executed — AnthropicService shipped

Last activity: 2026-03-13 — Phase 072 complete — AnthropicService + POST /api/ia/claude endpoint delivered

## Session Log

- 2026-03-13: Milestone v1.32 archived — Gemini AI Service shipped
- 2026-03-13: Milestone v1.33 started — Anthropic Claude AI Service
- 2026-03-13: Roadmap created — 1 phase (072), 6/6 requirements mapped (CLAUDE-01 through CLAUDE-06 → Phase 072)
- 2026-03-13: 072-01-PLAN.md created — AnthropicService with web_search tool loop + POST /api/ia/claude endpoint
- 2026-03-13: 072-01-PLAN.md executed — AnthropicService shipped, tsc --noEmit passes, all success criteria met

### Key Decisions

- All 6 CLAUDE requirements map to single phase 072 — tight coupling (one service + one endpoint + one tool) makes splitting artificial
- AnthropicService uses module-level singleton (same as GeminiService/SlackService) — throws at startup if ANTHROPIC_API_KEY or BRAVE_SEARCH_API_KEY missing
- Model: `claude-sonnet-4-5` (locked decision)
- Web search via Brave Search API (`https://api.search.brave.com/res/v1/web/search`) with `X-Subscription-Token` header
- Native `fetch` (Node 20+) for Brave Search HTTP calls — axios not in strapi dependencies
- Tool loop processes tool_use blocks until stop_reason is "end_turn" (max_tokens not used as a loop control)
- Controller imports only from `services/anthropic/index.ts` — no direct `@anthropic-ai/sdk` in API layer
- `ApplicationError` for runtime errors (same as GeminiService pattern)
- `process.env` for API keys (not `strapi.config.get`) — consistent with all other integration services

### Blockers/Concerns

None.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 17 | fix article body not rendering and add date to hero | 2026-03-13 | 95fc566 | [17-fix-article-body-not-rendering-and-add-d](./quick/17-fix-article-body-not-rendering-and-add-d/) |
| 18 | fix dashboard article edit and preview pages showing blank | 2026-03-13 | 2648345 | [18-fix-dashboard-article-edit-and-preview-p](./quick/18-fix-dashboard-article-edit-and-preview-p/) |
| 19 | fix article body not showing in dashboard edit and preview pages | 2026-03-13 | 68f4746 | [19-fix-article-body-not-showing-in-dashboar](./quick/19-fix-article-body-not-showing-in-dashboar/) |
| 20 | fix article body being reset to null on save in edit page | 2026-03-13 | 217d3fb | [20-fix-article-body-being-reset-to-null-on-](./quick/20-fix-article-body-being-reset-to-null-on-/) |
| 21 | fix article update using numeric id instead of documentId causing 400 error | 2026-03-13 | 6d32544 | [21-fix-article-update-using-numeric-id-inst](./quick/21-fix-article-update-using-numeric-id-inst/) |
| 22 | truncate long breadcrumb labels with ellipsis in website and dashboard | 2026-03-13 | b4f8dff | [22-truncate-long-breadcrumb-labels-with-ell](./quick/22-truncate-long-breadcrumb-labels-with-ell/) |
| 23 | fix article body paragraph spacing in website and dashboard preview | 2026-03-13 | f8d8eee | [23-fix-article-body-paragraph-spacing-in-we](./quick/23-fix-article-body-paragraph-spacing-in-we/) |
| 24 | add image upload component to article form (cover + gallery) | 2026-03-12 | — | [24-add-image-upload-component-to-article-fo](./quick/24-add-image-upload-component-to-article-fo/) |
| 25 | make article body textarea auto-resize | 2026-03-13 | 5936945 | [25-make-article-body-textarea-auto-resize-i](./quick/25-make-article-body-textarea-auto-resize-i/) |
| 26 | create profile view with edit profile and change password | 2026-03-13 | 7f96a69 | [26-create-profile-view-with-edit-profile-an](./quick/26-create-profile-view-with-edit-profile-an/) |
