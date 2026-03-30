---
gsd_state_version: 1.0
milestone: v1.46
milestone_name: milestone
status: unknown
stopped_at: Completed 110-01-PLAN.md
last_updated: "2026-03-30T02:15:52.120Z"
progress:
  total_phases: 4
  completed_phases: 4
  total_plans: 10
  completed_plans: 10
  percent: 100
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-29)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 110 — fix-ssr-data-loading-in-ads-detail-page-and-dashboard-home-stats

## Position

Milestone v1.46 PRO Subscriptions archived. Ready to start next milestone.

```
Progress: [██████████] 100%
```

## Accumulated Context

### Key Decisions (carry forward)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- `pro_status === "active"` is the single source of truth for PRO membership (no `pro` boolean)
- Oneclick Mall must be contracted separately with Transbank for production (separate from Webpay Plus)
- Method-based reCAPTCHA guard (POST/PUT/DELETE) replaces allowlist-based guard — simpler and protects all future mutations automatically (107-01)
- Dashboard vitest config aligned with website pattern (happy-dom + stubs) to fix broken nuxt environment (107-01)
- useApiClient is a drop-in for useStrapiClient — only the initialization line changes, no call-site changes needed (107-02)
- Never call useStrapiClient() directly in components for mutating requests — use useApiClient() instead (107-02)
- Use apiClient typed generic apiClient<{ data: T }>() for response shape inference — avoids response.data type errors (107-03)
- Keep useStrapi() for read operations (find/findOne), replace only mutations with useApiClient() — FormPassword exception: useStrapi removed entirely (107-03)
- Remove useStrapi() from a component entirely when no read operations remain after migrating mutations — applied to FormArticle.vue (107-04)
- Custom Strapi action endpoints (approve/reject/banned) do NOT wrap body in { data: ... }; standard content-type updates MUST use { data: payload } (107-04)
- useApiClient() replaces useStrapi() for all GET reads in dashboard — eliminates dual-resource pattern, all HTTP through one composable (108-01)
- useApiClient() must always be declared at setup scope, never inside watch/onMounted/fetch function callbacks (108-01)
- useApiClient() must be declared at setup scope (outside useAsyncData) when replacing strapi.find/findOne — the captured apiClient variable is used inside callbacks (108-02)
- users/[id] endpoint returns user object directly (no { data: T } wrapper); normalizeUser() handles both response shapes — no special-casing needed (108-02)
- Phase 108 migration verified complete — zero strapi.find/findOne calls remain across entire dashboard app directory; TypeScript compiles clean; all 55 tests pass (108-03)
- useSessionUser state key is "session_user" (not "strapi_user") — FormVerifyCode.vue clears this exact cache key; changing it would break login flow (109-01)
- useSessionToken caches in nuxt._cookies[cookieName] — required pattern for FormVerifyCode.vue to clear the cookie ref on login (109-01)
- useSessionClient uses qs.stringify with encodeValuesOnly: true — produces bracket notation for Strapi nested filters; key brackets are NOT URL-encoded (encodeValuesOnly only encodes values) (109-01)
- vi.stubGlobal used for Nuxt auto-imported composables in vitest tests — auto-imports are globals, not importable symbols; vi.mock of the module path alone is insufficient (109-01)
- Top-level strapi: module option block must be removed from nuxt.config.ts when @nuxtjs/strapi is removed — was module config (not runtimeConfig); leaving it causes TS2353; runtimeConfig.strapi blocks must be preserved for composable runtime access (109-02)
- config.strapi as Record<string, unknown> cast pattern resolves runtimeConfig public/server union type — runtimeConfig.public.strapi only has {url:string} declared but server-side has full shape; cast to Record resolves both branches (109-02)
- @nuxtjs/strapi is fully eliminated from dashboard — zero useStrapiX references in apps/dashboard/; all session management via custom useSessionX composables (109-02)
- watch(() => true, fn, { immediate: true }) is the correct pattern for SSR data loading in dashboard components — replaces onMounted which is client-only and causes hydration flash (110-01)
- useAdsStore() must be instantiated at setup scope before useAsyncData, not inside the callback — composable context is only available at setup time (110-01)

### Roadmap Evolution

- Phase 107 added: en el dashboard hay que validar todas las rutas POST, PUT y DELETE igual como en el website
- Phase 108 added: dashboard replace nuxtjs-strapi sdk with useApiClient for all reads — eliminate dual-resource pattern, all HTTP through one composable
- Phase 109 added: Eliminate @nuxtjs/strapi dependency from dashboard only — replace useStrapiUser() with custom session composable, useStrapiToken() with direct cookie read, useStrapiClient() inside useApiClient with native $fetch
- Phase 110 added: Fix SSR data loading in ads detail page and dashboard home stats

### Blockers/Concerns (open)

- Oneclick Mall must be contracted separately with Transbank for production

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260329-pa1 | fix CSP violations in staging - add missing script-src connect-src worker-src directives for Google GTM reCAPTCHA Hotjar Cloudflare Sentry | 2026-03-29 | f5ead3f9 | [260329-pa1-fix-csp-violations-in-staging-add-missin](./quick/260329-pa1-fix-csp-violations-in-staging-add-missin/) |

## Session Continuity

Last session: 2026-03-30T02:13:00Z
Stopped at: Completed 110-01-PLAN.md
Resume file: None
