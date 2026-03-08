---
gsd_state_version: 1.0
milestone: v1.20
milestone_name: TypeScript any Elimination
status: Shipped
stopped_at: v1.20 milestone complete — all planning docs archived
last_updated: "2026-03-08T17:27:52.096Z"
last_activity: 2026-03-08 — v1.20 shipped
progress:
  total_phases: 5
  completed_phases: 5
  total_plans: 5
  completed_plans: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.20 shipped — next milestone TBD

## Current Position

Phase: — (all 5 phases complete)
Plan: —
Status: Shipped
Last activity: 2026-03-08 — v1.20 shipped

### v1.20 Phase List

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 47 | Ad API any Elimination | TSANY-01–07 | Shipped |
| 48 | Type Files + Flow Service any Elimination | TSANY-08–12 | Shipped |
| 49 | Zoho + Facto + Other Services any Elimination | TSANY-13–23 | Shipped |
| 50 | Payment Utils + Middlewares any Elimination | TSANY-24–32 | Shipped |
| 51 | Seeders + Test Files any Elimination | TSANY-33–36 | Shipped |

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

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-08
Stopped at: v1.20 milestone complete — all planning docs archived
Resume with: `/gsd-new-milestone` to start v1.21
