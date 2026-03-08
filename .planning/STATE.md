---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: milestone
status: active — roadmap ready, no plans written yet
stopped_at: Completed 45-02-PLAN.md
last_updated: "2026-03-08T03:49:37.649Z"
last_activity: 2026-03-08 — roadmap created; Phases 43-46 defined; 13/13 requirements mapped
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.19 — Zoho CRM Sync Model — Phase 43: Zoho Service Reliability

## Current Position

Status: active — roadmap ready, no plans written yet
Plan: —
Last activity: 2026-03-08 — roadmap created; Phases 43-46 defined; 13/13 requirements mapped

```
Progress: [░░░░░░░░░░] 0% — 0/4 phases complete
Phase 43: Zoho Service Reliability   [ ] Not started
Phase 44: Zoho Service Layer         [ ] Not started
Phase 45: Payment Event Wiring       [ ] Not started
Phase 46: Ad Published Event Wiring  [ ] Not started
```

## Accumulated Context

### Decisions

All decisions from v1.1–v1.18 are logged in PROJECT.md Key Decisions table.

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
- **v1.18**: `wizard-guard.ts` — step-skip prevention middleware; client-only; redirects to first incomplete step
- [Phase 43-zoho-service-reliability]: Use Zoho-oauthtoken header prefix (not Bearer) — Zoho CRM API requirement — Required by Zoho API spec; Bearer is wrong scheme and causes all requests to fail
- [Phase 43-zoho-service-reliability]: Inject AxiosAdapter via optional constructor param for test isolation — Preserves production path unchanged while enabling axios-mock-adapter injection in tests
- [Phase 43-zoho-service-reliability]: Do not import from ./index in ZohoService tests — that singleton reads real env vars; test creates its own ZohoHttpClient and ZohoService with dummy config
- [Phase 44-zoho-service-layer]: Lead_Status hardcoded to 'New' in createLead() payload — initialization value, not a caller param
- [Phase 44-zoho-service-layer]: Counter fields (Ads_Published__c, Total_Spent__c, Packs_Purchased__c) hardcoded to 0 in createContact() — initialization values, not passed-in params
- [Phase 44-zoho-service-layer]: Stage: 'Closed Won' hardcoded in createDeal() — all deals at Waldo are immediately closed; callers never pass Stage
- [Phase 44-zoho-service-layer]: Object.fromEntries filter pattern for selective updateContactStats() payload — strips undefined keys without extra library
- [Phase 45-payment-event-wiring]: Floating promise (.then().catch()) for ad_paid Zoho sync — adResponse controller issues ctx.redirect() right after processPaidWebpay; awaiting would block the redirect — Confirmed by STATE.md design decision: 'ad_paid wiring MUST use .then().catch() floating promise'

### v1.19 Key Decisions (from research)

- **Zoho event wiring**: Direct service calls (not lifecycle hooks, not Strapi event hub) — callers have full context; explicit causality; consistent with existing fire-and-forget pattern
- **Phase 43 must come first**: Token refresh (RELY-01) and auth header fix (RELY-02) must be in place before any new Zoho methods are added — all new calls inherit the bug otherwise
- **Test isolation (RELY-04)**: `axios-mock-adapter` injected via optional constructor param on `ZohoHttpClient` — enables mocking without touching production path
- **`pack_purchased` wiring**: Async `await` is safe (not a redirect endpoint); `ad_paid` wiring must use `.then().catch()` floating promise (redirect must not be blocked)
- **No lifecycle hooks for CRM events**: `afterUpdate` on Ad lacks business context (user email, amount); direct call in `approveAd()` is unambiguously better
- **Race condition on counter increments**: Read-modify-write accepted as known limitation at Waldo's traffic volume; reconciliation cron deferred to future reliability milestone

### Pending Todos

- Confirm Zoho CRM custom field API names (`Ads_Published__c`, `Total_Spent__c`, etc.) in Zoho Admin UI before Phase 44 can be completed end-to-end
- Install `axios-retry@^4.5.0` (prod) and `axios-mock-adapter@^2.1.0` (dev) in Phase 43

### Blockers/Concerns

- **External dependency**: Zoho custom field API names must be confirmed from Zoho CRM Admin → Modules → Contacts → Fields before `updateContactStats()` can be verified end-to-end. This is the only blocker for Phase 44 completion.

## Session Continuity

Last session: 2026-03-08T03:49:31.764Z
Stopped at: Completed 45-02-PLAN.md
Resume with: `/gsd-plan-phase 43`
