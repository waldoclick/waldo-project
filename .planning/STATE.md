---
gsd_state_version: 1.0
milestone: v1.46
milestone_name: milestone
status: unknown
stopped_at: Completed 115-01-PLAN.md
last_updated: "2026-04-06T04:08:18.182Z"
progress:
  total_phases: 9
  completed_phases: 8
  total_plans: 19
  completed_plans: 19
  percent: 100
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-29)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 115 — fix-remaining-any-and-function-type-violations

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
- Used richtext (not text) for Strapi policy text field because content contains multi-paragraph HTML with p and a tags (111-01)
- order integer field allows editors to control policy display sequence from Strapi admin independently of creation order (111-01)
- policy.d.ts uses order: number | null instead of featured: boolean — policies have explicit ordering, not featured flag (111-02)
- default: () => [] added to useAsyncData in politicas-de-privacidad.vue per CLAUDE.md rule to eliminate T|undefined from return type (111-02)
- Ownership guard in anunciar/index.vue placed AFTER useAsyncData because meStore.loadMe() runs inside that block — placing it before would mean meStore.me is null, incorrectly resetting every user's draft (112-02)
- userId stored at top-level of AdState (not inside ad object) and written directly as adStore.userId — it is a store identity field, not a form field; no dedicated action/getter needed (112-02)
- CommuneRecord uses Omit<CommuneData, 'region'> to override region shape — base has region.id (form use) but detail page needs region.name (display) (115-01)
- Cast useAsyncData.value as TypedInterface | null on assignment when async return includes unknown[] elements — packs/featured/reservations detail pages (115-01)

### Roadmap Evolution

- Phase 107 added: en el dashboard hay que validar todas las rutas POST, PUT y DELETE igual como en el website
- Phase 108 added: dashboard replace nuxtjs-strapi sdk with useApiClient for all reads — eliminate dual-resource pattern, all HTTP through one composable
- Phase 109 added: Eliminate @nuxtjs/strapi dependency from dashboard only — replace useStrapiUser() with custom session composable, useStrapiToken() with direct cookie read, useStrapiClient() inside useApiClient with native $fetch
- Phase 110 added: Fix SSR data loading in ads detail page and dashboard home stats
- Phase 111 added: haz que sean administrables desde strapi y usa la misma informacion para completar el seeder
- Phase 114 added: Fix Codacy best-practice warnings — replace any with unknown, Function type, and require statements across monorepo
- Phase 115 added: Fix remaining any and Function type violations

### Blockers/Concerns (open)

- Oneclick Mall must be contracted separately with Transbank for production

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260329-pa1 | fix CSP violations in staging - add missing script-src connect-src worker-src directives for Google GTM reCAPTCHA Hotjar Cloudflare Sentry | 2026-03-29 | f5ead3f9 | [260329-pa1-fix-csp-violations-in-staging-add-missin](./quick/260329-pa1-fix-csp-violations-in-staging-add-missin/) |
| 260404-lpv | fix blank page on non-existent root slugs - rethrow useAsyncData error.value in [slug].vue so Nuxt routes to error.vue with 404 | 2026-04-04 | 3ba48296 | [260404-lpv-la-pagina-historial-no-existe-pero-no-mu](./quick/260404-lpv-la-pagina-historial-no-existe-pero-no-mu/) |
| 260404-mbi | privacy policy maintainer in dashboard following FAQ pattern | 2026-04-04 | eaba7f45 | [260404-mbi-privacy-policy-maintainer-in-dashboard-f](./quick/260404-mbi-privacy-policy-maintainer-in-dashboard-f/) |
| 260404-mmr | policies list remove pagination, add vuedraggable drag-and-drop reorder persisting order to Strapi | 2026-04-04 | e608ebc8 | [260404-mmr-policies-list-remove-pagination-show-all](./quick/260404-mmr-policies-list-remove-pagination-show-all/) |
| 260404-nms | fix policy detail and edit pages showing empty data - replace documentId filter with numeric id filter, fix FormPolicy post-save redirect | 2026-04-04 | f026572a | [260404-nms-al-ver-o-editar-una-politica-est-n-vacia](./quick/260404-nms-al-ver-o-editar-una-politica-est-n-vacia/) |
| 260404-nt5 | add order field to FAQ schema and drag-and-drop reorder in FaqsDefault.vue matching PoliciesDefault pattern | 2026-04-04 | a8ae2eab | [260404-nt5-en-faq-agregar-order-field-drag-and-drop](./quick/260404-nt5-en-faq-agregar-order-field-drag-and-drop/) |
| 260404-o0g | Condiciones de Uso feature: Strapi term collection type, dashboard CRUD at /terms, website /condiciones-de-uso page | 2026-04-04 | c23d4a97 | [260404-o0g-hay-que-hacer-un-nuevo-collect-type-y-un](./quick/260404-o0g-hay-que-hacer-un-nuevo-collect-type-y-un/) |
| 260404-ouo | Fix [slug].vue showing 404 for existing users - replace arrow function key with plain template literal in useAsyncData | 2026-04-04 | 1606c1ce | [260404-ouo-en-home-gab-code-waldo-project-apps-webs](./quick/260404-ouo-en-home-gab-code-waldo-project-apps-webs/) |
| 260405-jn2 | Fix hero background image - rebuild IPX bundled sharp native binary, switch PictureDefault to NuxtImg, add postinstall to prevent regression | 2026-04-05 | 6f3cbfee | [260405-jn2-revisa-porque-la-imagen-del-herohome-no-](./quick/260405-jn2-revisa-porque-la-imagen-del-herohome-no-/) |
| 260405-gdl | Fix all Codacy best-practice unused-code warnings across monorepo (website, dashboard, strapi) | 2026-04-05 | ed920f97 | [260405-gdl-fix-all-codacy-best-practice-unused-code](./quick/260405-gdl-fix-all-codacy-best-practice-unused-code/) |
| 260405-mj9 | Refactor website ad listings to use shared status-specific endpoints; add userId role-based filtering to Strapi service/controllers | 2026-04-05 | cf045415 | [260405-mj9-refactor-website-ad-listings-to-use-shar](./quick/260405-mj9-refactor-website-ad-listings-to-use-shar/) |
| 260405-mt9 | Replace /ads/me/counts with shared /ads/count using role-based filtering — managers see all ads, authenticated users see their own | 2026-04-05 | cb703d1c | [260405-mt9-replace-ads-me-counts-with-shared-ads-co](./quick/260405-mt9-replace-ads-me-counts-with-shared-ads-co/) |
| 260405-njc | Add public GET /ads/catalog endpoint in Strapi bypassing user filtering; update website store and sitemap to use it instead of /ads/actives | 2026-04-05 | caff3e0b | [260405-njc-add-ads-catalog-public-endpoint-for-acti](./quick/260405-njc-add-ads-catalog-public-endpoint-for-acti/) |
| 260405-tf1 | Add accepted_usage_terms field to Strapi schema; three-checkbox consent flow (age + privacy policy + usage terms) in FormRegister, FormTerms, LightboxTerms | 2026-04-05 | 760645bb | [260405-tf1-en-el-registro-y-en-el-lightbox-de-acept](./quick/260405-tf1-en-el-registro-y-en-el-lightbox-de-acept/) |
| 260405-uxm | Move function declaration to function body root in gtm.client.ts | 2026-04-06 | e55c1c9c | [260405-uxm-move-function-declaration-to-function-bo](./quick/260405-uxm-move-function-declaration-to-function-bo/) |

## Session Continuity

Last session: 2026-04-06T04:05:45.008Z
Stopped at: Completed 115-01-PLAN.md
Resume file: None
