---
gsd_state_version: 1.0
milestone: v1.21
milestone_name: Ad Draft Decoupling
status: planning
stopped_at: Completed 52-04-PLAN.md
last_updated: "2026-03-08T18:41:47.420Z"
last_activity: 2026-03-08 — Roadmap committed, ready to plan Phase 52
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 9
  completed_plans: 9
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.21 — Ad Draft Decoupling (planning Phase 52)

## Current Position

Phase: Phase 52 (pending plan)
Plan: —
Status: Planning
Last activity: 2026-03-08 — Roadmap committed, ready to plan Phase 52

### v1.21 Phase List

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 52 | Ad Draft Decoupling | SCHEMA-01, BACK-01–06, FRONT-01–03, DASH-01 | Pending |

## Accumulated Context

### Decisions

All decisions from v1.1–v1.19 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.9**: `typeCheck: true` permanently enabled in both apps
- [Phase 33-34]: GTM delivered via `@saslavik/nuxt-gtm` module in both apps
- **v1.15**: `$setSEO` derives ogTitle/ogDescription from title/description — zero call-site changes when extending plugin
- **v1.15**: `key: "structured-data"` on useHead script entry prevents JSON-LD accumulation on SPA nav
- **v1.15**: `useSeoMeta({ robots: "noindex, nofollow" })` for private page noindex defense-in-depth
- **v1.16**: `descPart` leading-space pattern eliminates double-space when ad description is null
- **v1.16**: `descPrefix`/`descSuffix` split for budget-aware ad description slicing
- **v1.17**: Use `strapi.db.query` to bypass content-API sanitizer for server-enforced role filtering
- **v1.17**: Use `dsn: undefined` pattern (not conditional init) in sentry.*.config.ts
- **v1.18**: `stepRoutes` Record map pattern for wizard step-to-URL routing in `CreateAd.vue`
- **v1.18**: Per-page analytics — each wizard step page owns its own `stepView` in `onMounted`; no centralized watcher
- **v1.18**: `if (import.meta.server) return;` is mandatory first line of any client-only middleware reading a localStorage-backed store
- **v1.19**: Floating promise pattern for any Zoho sync inside a redirect handler — capture variables before `Promise.resolve().then()`
- **v1.19**: First-publish guard pattern: `isPending` check before firing any "ad published" side effects
- **v1.19**: Zoho stage names must match CRM pipeline exactly — validate before hardcoding
- [Phase 47-ad-api-any-elimination]: Use AdQueryOptions interface for ad service methods replacing options: any — Expresses intent for query shape; allows typed access to page, pageSize, filters, sort, populate, orderBy, pagination fields
- [Phase 47-ad-api-any-elimination]: Strapi SDK v5 cast pattern for entityService filter params — filters as unknown as Record<string, unknown> — matches AGENTS.md Strapi SDK v5 cast pattern; used in meCounts controller for all 5 entityService.count calls
- [Phase 48]: IFlowSubscriptionResponse.invoices typed as IFlowInvoice[] (not unknown[]) — IFlowInvoice already existed and pro.service.ts accesses .id on items
- [Phase 48]: Record<string,string> for Flow API param bags with String() casts — required by URLSearchParams and removes Record<string,any>
- [Phase 49]: IZohoContact interface (id:string + index signature) instead of plain unknown — callers access .id on findContact/createContact/updateContact results
- [Phase 49]: IWebpayCommitData interface with optional fields (status?/buy_order?/amount?) + index signature — allows partial test mock objects while removing any from transbank and gateway interfaces
- [Phase 50]: data double-cast pattern (as unknown as Parameters<...>[1]['data']) for entityService JSON fields — JSONValue stricter than unknown
- [Phase 50]: WebpayAdResult local interface for processPaidWebpay — TypeScript union can't narrow on optional property absence; local interface gives type safety without changing inferred return type
- [Phase 50]: BillingDetails exported from user.utils.ts for use in FactoDocumentData.userDetails — eliminates userDetails: any in general.utils.ts
- [Phase 51]: (global as unknown as { strapi: MockStrapi }) cast for test global mock — avoids @strapi/types global redeclaration conflict
- [Phase 51]: controller.packResponse direct access with ctx as unknown as Context — public property, Koa partial mock needs Context cast
- [Phase 52-ad-draft-decoupling]: draft field required=true/default=true so every new ad starts as a draft — Ensures no ad is ever published without explicit promotion out of draft state
- [Phase 52-ad-draft-decoupling]: Intersection type cast for draft/is_paid fields not in AdData — Avoids modifying the core AdData interface for fields only relevant to the draft flow
- [Phase 52-ad-draft-decoupling]: draft field is single source of truth for draft state — replaced complex abandoned conditions — Simplifies computeAdStatus and eliminates abandoned concept from the service layer
- [Phase 52-ad-draft-decoupling]: Free ad flow (pack=free) skips draft call entirely — no draft saved for free packs
- [Phase 52-ad-draft-decoupling]: adsDraft added to AdsTable SettingsSection type and settings.store.ts — required by type-safe section prop system

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-08T18:35:29.094Z
Stopped at: Completed 52-04-PLAN.md
Resume with: `/gsd-plan-phase 52` once roadmap is committed
