---
gsd_state_version: 1.0
milestone: v1.46
milestone_name: milestone
status: unknown
last_updated: "2026-06-15T15:28:58.324Z"
last_activity: 2026-06-15
progress:
  total_phases: 2
  completed_phases: 0
  total_plans: 9
  completed_plans: 7
  percent: 14
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-29)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 02 — Mover IA a endpoints de dominio

## Position

Phase 01 (corregir-issues-codacy) — plan 01-00 complete (Wave 0 regression gate). 4 RED-by-design security guards committed: ad_id={$gt:0} (saveDraft, RED until 01-02), pendingToken={$ne:null} (authController, RED until 01-01), payload.pack={$ne:''} (checkout, RED until 01-02), useProviders open-redirect allowlist (RED until 01-05). saveDraft now has first-ever characterization coverage. No production code modified; Wave 1 (01-01/01-02/01-05) turns each RED test green. 6 plans remain (01-01..01-06).

(Prior: Phase 129 complete — @nuxtjs/strapi eliminated from apps/website; httpOnly waldo_jwt cookie sole JWT carrier; proxy single Strapi exit point.)

```
Progress: [████████░░] 78% (phase 02: 1/2 plans complete)
```

## Accumulated Context

### Key Decisions (carry forward)

- resolveProvider() reads AI_PROVIDER at call time (not constructor) so env overrides in tests and runtime take effect correctly per-call without re-instantiation (02-01)
- PROVIDERS map (Record<AiProviderName, fn>) hides generateText vs generateWithSearch export name differences; all callers see uniform prompt-in, {text}-out signature (02-01)
- Fallback chain JSON caveat: non-Cerebras providers may return fenced JSON which frontend JSON.parse will fail on — acceptable, Cerebras is default, will be addressed in 02-02 frontend cutover (02-01)
- ia and search Strapi resources left untouched in 02-01 — deletion deferred to 02-02 after frontend cutover (D-10) (02-01)
- authController owns its file end-to-end in 01-01: pendingToken coerced with String() before the verifyCode findOne where filter (NoSQL operator-injection closed, Wave 0 guard now GREEN); reserved-username suffix switched from Math.random to crypto.randomBytes (server CSPRNG) reusing the existing top-of-file `import crypto from "crypto"` rather than adding a node:crypto import — no shape-assertion update needed since no test pins the registerUserAuth suffix (01-01)
- Wave 0 RED-by-design guards must flip green under exactly the planned Wave 1 fix: saveDraft ad_id guard asserts update() NOT called (Number({$gt:0})=NaN diverts to the CREATE branch after 01-02, so a where.id-scalar assertion would error post-fix instead of pass); authController/checkout guards assert typeof where-value==='string' matching the planned String() coercion (String keeps findOne on the call path, so the test is the post-fix invariant) (01-00)
- saveDraft Jest test harness requires strapi.contentType stub (factory init) + __esModule:true on the logtail default-export mock, else every test dies in the catch block on logger.error — mirror ad.compute-status.test.ts (01-00)
- httpOnly proxy injects Authorization: Bearer on ALL forwarded requests including top-level GET navigations (sameSite=lax) — gateway callback routes that receive GET redirects from payment processors must be marked auth:false in Strapi route config, or the authenticated role is applied and may block the callback (129-06)
- Webpay /payments/webpay and /payments/pro-response routes marked auth:false — these are identified by the Transbank token, not ctx.state.user; order identity is always order.documentId, never a gateway reference; Strapi must be restarted after deploy for route config to reload (129-06)
- Original Manager-deactivate logout bug root cause: @nuxtjs/strapi module registered an auto-fetch plugin that raced with session.ts on window.location.reload(), writing null user state; removing the module eliminates the competing writer and the bug (129-06)
- VERCEL_AUTOMATION_BYPASS_SECRET must be set in all Vercel environments (staging + prod) for SSR Nitro self-calls to pass Deployment Protection via x-vercel-protection-bypass header (129-06)
- useStrapiToken fully eliminated from apps/website/app/: FormVerifyCode calls fetchUser after server sets httpOnly cookie; uploads rely on proxy Authorization injection; logout posts to /api/auth/logout server route; all four middleware guards (auth.ts, onboarding-guard, dashboard-guard, guest.ts) are token-free and user-state-based (129-05)
- guest.ts required mechanical useStrapiUser→useSessionUser rename as part of guard migration — caught by app-wide middleware verification grep; not listed in original plan files_modified (129-05)
- dashboard-guard SSR path: if (import.meta.server) return navigateTo('/login') — redirect immediately on SSR when no user state available, rather than calling fetchUser in SSR context (129-05)
- vi.stubGlobal required for composables that use Nuxt bare auto-imports (useState, $fetch, useRuntimeConfig) — vi.mock('#imports') only works when the composable has explicit #imports imports (129-01)
- useSessionClient injects NO Authorization header — Nitro proxy injects Bearer token from httpOnly waldo_jwt cookie server-side in plan 02 (129-01)
- fetchUser regression guard: catch block sets user.value = null only, zero cookie/token side effects; session.ts plugin guarded with PLAN-06-REMOVE-THIS-LINE marker until cutover in plan 06 (129-01)
- overrideForgotPassword context ternary collapsed: both website and residual dashboard callers now resolve to FRONTEND_URL/restablecer-contrasena — context field removed as unused (125-07)
- dashboardUrl removed from website runtimeConfig.public — MenuUser was the sole consumer; no TS declaration update needed (125-07)
- nuxi typecheck and nuxi build fail in CI due to estree-walker ESM-only package at root workspace — pre-existing constraint; use vue-tsc --noEmit for TypeScript verification (exits 0) (125-07)
- formatDate/formatDateShort/formatBoolean require explicit imports in vue-tsc strict mode — Nuxt auto-imports are runtime-only, not reflected in vue-tsc template type context; add import { formatDate } from "@/utils/date" explicitly (125-06)
- Media.formats extended with small/large variants to cover all Strapi Cloudinary upload formats; formatDate/formatDateShort accept string|undefined|null — Strapi returns null not undefined (125-06)
- GalleryItem.id is string (Strapi documentId); numeric gallery IDs compared via Number(image.id) when filtering array of Strapi numeric IDs (125-06)
- nuxi typecheck in worktree requires: node <root>/node_modules/.bin/nuxi typecheck run from within worktree apps/website/ — yarn workspace waldo-website nuxi typecheck targets main repo checkout, not worktree (125-06)
- All 68 surviving dashboard pages already had layout: "dashboard" — the only 5 without it were exactly the 5 dropped (auth+dev); Strapi API calls to /auth/* endpoints intentionally unchanged (backend REST, not navigation) (125-05)
- useStrapiAuth() is the website-native replacement for useSessionAuth() — exposes identical setToken/fetchUser/logout API (verified from @nuxtjs/strapi dist/.d.ts); qs-serialization caveat does not apply — none of the 9 migrated components used useSessionClient (125-04)
- D-04 session replacement complete: useSessionUser→useStrapiUser, useSessionToken→useStrapiToken, useSessionAuth→useStrapiAuth, useSessionClient→useApiClient (125-04)
- routeRules /dashboard/ prefix pattern: all 24 dashboard Spanish->English redirects scoped under /dashboard/ namespace in website nuxt.config.ts — prevents collision with public website routes; CONTEXT.md stated "22" but actual count was 24 (125-02)
- @vueform/multiselect excluded from website install — zero imports in dashboard source confirmed; dead dependency (125-02)
- vite.optimizeDeps only 4 new entries (qs, vue-chartjs, chart.js, chartjs-plugin-annotation) per D-10 spec — slugify/highlight.js/vuedraggable installed as packages but not in optimizeDeps (125-02)
- dashboard-guard.global.ts uses useStrapiUser/Token/Auth (not useSessionX) — website @nuxtjs/strapi session system wins; SSR fail-open skip preserved: if (!roleName) return allows through during hydration, client re-run enforces role (125-01)
- onboarding-guard /dashboard exemption: startsWith('/dashboard') early return inside !profileComplete block — not in AUTH_EXEMPT_PATHS (exact-match only) (125-01)
- FormVerifyCode.vue manager redirect: useStrapiUser() without User generic — component is plain JS SFC, generic syntax is a parse error (125-01)
- settings.store.ts persist: CORRECT — pure UI preferences, no remote fetch, no TTL guard needed (125-01)
- navigateTo() instead of router.push() for all post-login redirects in Nuxt 4 — router.push can race or silently abort after async fetchUser() state updates; navigateTo triggers the middleware pipeline reliably (123-01)
- Profile completeness delegated to onboarding-guard.global.ts — login components call navigateTo(redirectTo) and the guard handles /onboarding redirect; meStore.reset() must precede navigateTo to clear stale persisted cache (123-01)
- Self-guarding period_end query in Step 1 eliminates idempotency check: renewed subscription-payment records have period_end in the future and won't appear in results (121-02)
- chargeUser periodEnd param replaces periodStart: old period_end is input; newPeriodEnd computed as first of next month; step 4 deduplicates cancelled users with Set<number> (121-02)
- mockImplementation routing pattern used for strapi.db.query in Jest tests to dispatch different mock objects per UID — enables independent assertions for different content types (120-04)
- Separate update mock functions per UID (mockSubPayUpdate/mockUserUpdate) instead of shared mockUpdate enables clean assertions without UID-based call filtering — required when migrating from entityService to db.query (122-04)
- Phase 122 migration complete: zero strapi.entityService references in entire apps/strapi/ (src + tests); TypeScript clean; all 55 migrated tests pass (122-04)
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
- ordersTocsv utility kept for unit testing isolation; runtime CSV export calls Strapi endpoint directly without client-side re-serialization (119-01)
- /orders/export-csv route declared first in 01-order-me.ts to prevent :id wildcard from capturing the static path segment (119-01)
- ExportOrder interface defined locally in controller alongside StrapiOrder — avoids coupling with shared types (119-01)
- Auth.GoogleAuth instantiated per method call (not as instance field) in SearchConsoleService to avoid stale credential caching across requests (260409-tns)
- Cloudflare analytics response navigated with any cast + inline comment — Cloudflare Analytics API has no public TS types; cacheHitRate and errorRate computed from totals with zero-division guard (260409-tns)
- Use @/data/countries.json import alias (not ~/data/) in InputPhone.vue — Vitest config maps ~ to apps/website/ root while @ maps to apps/website/app/; @ alias ensures consistent resolution in both Nuxt and Vitest (124-01)
- parsePhone uses longest-match via sort(b.dialCode.length - a.dialCode.length) to correctly resolve +1868 (Trinidad) over +1 (US/Canada) — essential for Caribbean/Pacific dialCode disambiguation (124-01)
- Use <Field v-slot="{ field }"><InputPhone v-bind="field" /></Field> pattern — correct vee-validate wrapping for custom v-model component, keeps name registration without double binding; FormContact.vue had no handlePhoneInput function to delete (124-02)
- no-explicit-any bucket was 13 sites, not 9 — plan under-enumerated nitro-globals (6, not 4) and omitted cloudflare's 3 `groups: any[]`; the Task verify grep (which includes `any[]`) is authoritative over the prose count; all 13 → unknown + cast-at-use (01-04)
- better-stack: casting `attr` to Record<string,unknown> leaves `attr.status ?? "pending"` as unknown and fails the typed return interface under strict tsc — type each map callback's attributes to concrete optional field shapes (status: MonitorStatus, etc.) instead (01-04)
- cloudflare: graphql() → Promise<unknown>; added private extractGroups<T>(data, key) helper to navigate data?.data?.viewer?.zones?.[0]?.<key> once instead of 3 duplicated casts (01-04)
- widening a global type from any→unknown (koa.d.ts Request.body) needs a full app tsc to confirm zero cross-file consumer fallout — grep alone is insufficient; Strapi tsc was exit 0 (01-04)

### Roadmap Evolution

- Phase 1 added: Corregir los 100 issues abiertos en Codacy (90 Security/Opengrep, 9 BestPractice/ESLint, 1 UnusedCode). Analizar cada patrón para descartar falsos positivos y evaluar riesgo de regresión antes de aplicar. Snapshot completo en .planning/research/codacy-issues-snapshot-2026-06-14.md. (Numeración reiniciada en 1 tras archivar milestones v1.x.)
- Phase 129 added: Eliminate @nuxtjs/strapi from website and fully centralize session/auth + HTTP through the proxy with an httpOnly JWT cookie. Security-first, single phase, nothing deferred. Target: httpOnly cookie client can never read → proxy injects Authorization server-side; zero direct API_URL calls (SSR goes through proxy with x-vercel-protection-bypass); useApiClient as the only HTTP client; minimal session layer replaces useStrapiUser/Token/Auth across ~60 files (incl. Google OAuth + verify-code flows); audit+centralize every direct fetch/$fetch/raw-fetch (useImage.ts, UploadMedia.vue). Reuse 109-RESEARCH.md as template. Full detail in 129-CONTEXT.md.
- Phase 127 added: Security review round 2 — fix new vulnerabilities not covered by phase 126 (5 areas: payment integrity Webpay amount+idempotency, order/reservation/pack authorization, auth hardening Google email_verified + JWT fallback + rate-limit + reCAPTCHA binding, frontend SSR XSS + httpOnly session, email autoescape + upload validation + users PII + core-route lockdown). Findings detailed in 127-FINDINGS.md. Branch feat/127-security-review-fixes from main.
- Phase 126 added: Security hardening — fix authorization vulnerabilities from security review (4 plans: users IDOR account-takeover, ad mass-assignment payment/approval bypass, free-ad publish IDOR, dev-endpoint + email-escape + regex-bypass hardening)
- Phase 107 added: en el dashboard hay que validar todas las rutas POST, PUT y DELETE igual como en el website
- Phase 108 added: dashboard replace nuxtjs-strapi sdk with useApiClient for all reads — eliminate dual-resource pattern, all HTTP through one composable
- Phase 109 added: Eliminate @nuxtjs/strapi dependency from dashboard only — replace useStrapiUser() with custom session composable, useStrapiToken() with direct cookie read, useStrapiClient() inside useApiClient with native $fetch
- Phase 110 added: Fix SSR data loading in ads detail page and dashboard home stats
- Phase 111 added: haz que sean administrables desde strapi y usa la misma informacion para completar el seeder
- Phase 114 added: Fix Codacy best-practice warnings — replace any with unknown, Function type, and require statements across monorepo
- Phase 115 added: Fix remaining any and Function type violations
- Phase 116 added: Enforce centralized test directory structure
- Phase 117 added: Enforce root-level tests directory for website — move all test files to apps/website/tests/
- Phase 117 completed: verification-only closure — website test directory structure confirmed compliant after Phase 116 moves
- Phase 119 added: export orders to CSV from dashboard orders page
- Phase 120 added: Refactor PRO subscription model: subscription-pro collection type, move card data out of user, fix charge-before-activate order, calendar billing
- Phase 122 added: Migrate strapi.entityService to strapi.db.query for Strapi v5 compatibility
- Phase 123 added: Fix onboarding redirect on login — incomplete profile does not navigate to onboarding without a page refresh

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
| 260406-d4s | Fix Codacy unused-code warnings: ESLint argsIgnorePattern for _ prefix and remove dead code | 2026-04-06 | 1e585882 | [260406-d4s-fix-codacy-unused-code-warnings-eslint-a](./quick/260406-d4s-fix-codacy-unused-code-warnings-eslint-a/) |
| 260406-dbk | Fix remaining Codacy unused-code warnings across website, dashboard, strapi — remove dead code, prefix unused params, rename private constructor fields | 2026-04-06 | c439eaa1 | [260406-dbk-fix-remaining-codacy-unused-code-warning](./quick/260406-dbk-fix-remaining-codacy-unused-code-warning/) |
| 260406-es8 | Fix Codacy still flagging _-prefixed vars — disable base no-unused-vars, configure @typescript-eslint/no-unused-vars with all ignore patterns in .eslintrc.json | 2026-04-06 | 1f436255 | [260406-es8-fix-codacy-still-flagging-prefixed-vars-](./quick/260406-es8-fix-codacy-still-flagging-prefixed-vars-/) |
| 260406-r0g | fix pagination not resetting to page 1 when search filter changes | 2026-04-06 | 246b1233 | [260406-r0g-fix-pagination-not-resetting-to-page-1-w](./quick/260406-r0g-fix-pagination-not-resetting-to-page-1-w/) |
| 260406-raw | haz que el layout del dashboard funcione de manera responsive, solo el layout, debe funcionar en tablet y celulares. Solo eso | 2026-04-06 | dbbb2a05 | [260406-raw-haz-que-el-layout-del-dashboard-funcione](./quick/260406-raw-haz-que-el-layout-del-dashboard-funcione/) |
| 260406-t1o | make tables responsive with horizontal scroll and white-space nowrap on cells | 2026-04-07 | — | [260406-t1o-make-tables-responsive-with-horizontal-s](./quick/260406-t1o-make-tables-responsive-with-horizontal-s/) |
| 260406-t82 | fix responsive: tables overflow with horizontal scroll, mobile menu overlaps content | 2026-04-07 | f8e3ed83 | [260406-t82-fix-responsive-tables-overflow-with-hori](./quick/260406-t82-fix-responsive-tables-overflow-with-hori/) |
| 260406-tjg | fix responsive layout of dashboard home page | 2026-04-07 | 4bde8d74 | [260406-tjg-fix-responsive-layout-of-dashboard-home-](./quick/260406-tjg-fix-responsive-layout-of-dashboard-home-/) |
| 260406-tue | quita el overlay cuando se abre el menu default y que el menu quede al 100% de la pantalla al abrir | 2026-04-07 | 32030ee1 | [260406-tue-quita-el-overlay-cuando-se-abre-el-menu-](./quick/260406-tue-quita-el-overlay-cuando-se-abre-el-menu-/) |
| 260408-npv | add loading toast and button spinner when creating ad on resumen page | 2026-04-08 | faf632dc | [260408-npv-add-loading-toast-and-button-spinner-whe](./quick/260408-npv-add-loading-toast-and-button-spinner-whe/) |
| 260408-w1e | restore active badge in MemoPro for active PRO subscriptions and guard card line when card data is null | 2026-04-08 | b14a2ebf | [260408-w1e-en-el-banner-de-pro-cuando-pro-esta-acti](./quick/260408-w1e-en-el-banner-de-pro-cuando-pro-esta-acti/) |
| 260409-ea4 | Add bulk reorder endpoint to FAQs, policies, and terms in Strapi and update dashboard components | 2026-04-09 | 6b54691e | [260409-ea4-add-bulk-reorder-endpoint-to-faqs-polici](./quick/260409-ea4-add-bulk-reorder-endpoint-to-faqs-polici/) |
| 260409-h79 | Crear vistas de subscription en el dashboard siguiendo exactamente el patrón existente de packs | 2026-04-09 | f9243ec4 | [260409-h79-crear-vistas-de-subscription-en-el-dashb](./quick/260409-h79-crear-vistas-de-subscription-en-el-dashb/) |
| 260409-hvh | fix orders 500 - normalize array populate to object in order controller find method | 2026-04-09 | 798c69a9 | [260409-hvh-fix-orders-500-normalize-array-populate-](./quick/260409-hvh-fix-orders-500-normalize-array-populate-/) |
| 260409-i26 | fix 500 error on orders/me endpoint - normalize sort and populate params | 2026-04-09 | 28b4565d | [260409-i26-fix-500-error-on-orders-me-endpoint](./quick/260409-i26-fix-500-error-on-orders-me-endpoint/) |
| 260409-kru | split layout--dashboard__menu into logo + rail (MenuMain 3 icons) + nav (MenuDefault) | 2026-04-09 | 889b104f | [260409-kru-split-layout-dashboard-menu-into-rail-me](./quick/260409-kru-split-layout-dashboard-menu-into-rail-me/) |
| 260409-nhj | create MenuMaintenance flat links, move maintenance pages to /maintenance, wire icon switching | 2026-04-09 | 5e6e243e | [260409-nhj-create-menumaintenance-with-flat-links-m](./quick/260409-nhj-create-menumaintenance-with-flat-links-m/) |
| 260409-pr8 | create MenuUsers, move subscription-pros and subscription-payments to pages/users/, wire Users icon in MenuMain | 2026-04-09 | 38df84e4 | [—](./quick/) |
| 260409-qg2 | fix active menu panel not persisting on page refresh | 2026-04-09 | 38df84e4 | [260409-qg2-fix-active-menu-panel-not-persisting-on-](./quick/260409-qg2-fix-active-menu-panel-not-persisting-on-/) |
| 260409-taw | create search-console and cloudflare service stubs following google multi-file pattern | 2026-04-10 | b1b3e04c | [260409-taw-add-search-console-and-cloudflare-servic](./quick/260409-taw-add-search-console-and-cloudflare-servic/) |
| 260409-tig | create search-console and cloudflare API modules (controller + route) following cron-runner pattern | 2026-04-10 | fa96b1f5 | [260409-tig-create-search-console-and-cloudflare-api](./quick/260409-tig-create-search-console-and-cloudflare-api/) |
| 260409-tns | implement real SearchConsoleService methods (getPerformance/getTopQueries/getTopPages) and CloudflareService.getAnalytics; wire both controllers to return real analytics data | 2026-04-10 | fde1984a | [260409-tns-implement-search-console-and-cloudflare-](./quick/260409-tns-implement-search-console-and-cloudflare-/) |
| 260409-ujs | add Integrations section to dashboard: Plug rail button, MenuIntegrations panel, /integrations page, layout wiring | 2026-04-09 | 7f614341 | [260409-ujs-add-integrations-section-to-dashboard-me](./quick/260409-ujs-add-integrations-section-to-dashboard-me/) |
| 260409-x6t | articulos hay que sacarlo de /maintenance y crear una carpeta /articles y agregar un icono de articulos a MenuMain | 2026-04-10 | 81ee855c | [260409-x6t-articulos-hay-que-sacarlo-de-maintenance](./quick/260409-x6t-articulos-hay-que-sacarlo-de-maintenance/) |
| 260410-dxp | Implement Google Analytics 4 API integration in Strapi | 2026-04-10 | 34bcca9d | [260410-dxp-implement-google-analytics-4-api-integra](./quick/260410-dxp-implement-google-analytics-4-api-integra/) |
| 260410-eh6 | Add Google Analytics dashboard integration with summary endpoint and frontend components | 2026-04-10 | 6540b8be | [260410-eh6-add-google-analytics-dashboard-integrati](./quick/260410-eh6-add-google-analytics-dashboard-integrati/) |
| 260410-n56 | Fix broken navigation in all 8 dashboard mantenedor sections: add documentId to interfaces, fix router.push to use /maintenance/ prefix and documentId, fix post-save redirects, fix breadcrumbs | 2026-04-10 | 4df97e90 | [260410-n56-fix-error-in-dashboard-mantenedores-view](./quick/260410-n56-fix-error-in-dashboard-mantenedores-view/) |
| 260411-m0h | Add maxlength limits to all auth form inputs in both apps | 2026-04-11 | fb087c5c | [260411-m0h-add-maxlength-limits-to-all-auth-form-in](./quick/260411-m0h-add-maxlength-limits-to-all-auth-form-in/) |
| 260411-mpl | Split verification code input into 6 individual OTP digit inputs with auto-advance, backspace nav, paste distribution, and arrow key support | 2026-04-11 | 8a6eb900 | [260411-mpl-split-verification-code-input-into-6-ind](./quick/260411-mpl-split-verification-code-input-into-6-ind/) |
| 260411-sd7 | Fix Spanish error messages in FormRegister yup schema: typo "Appelido" → "Apellido", add missing article "El" to RUT required and invalid messages | 2026-04-11 | b300acad | [260411-sd7-corregir-textos-formulario-registro-camp](./quick/260411-sd7-corregir-textos-formulario-registro-camp/) |
| 260411-sgs | fix registro: strip accepted_age_confirmation, accepted_terms, accepted_usage_terms from register payload, persist via db.query after registration | 2026-04-12 | b300acad | [260411-sgs-fix-registro-invalid-parameters-accepted](./quick/260411-sgs-fix-registro-invalid-parameters-accepted/) |
| 260411-sox | fix onboarding: botón continuar bloqueado aunque formulario esté completo — hasChanges gate bypassed in onboardingMode | 2026-04-12 | 4b27b01c | [260411-sox-fix-onboarding-boton-continuar-bloqueado](./quick/260411-sox-fix-onboarding-boton-continuar-bloqueado/) |
| 260411-tcf | Replace dynamic referer CTA with deterministic "Ir al inicio" → / on OnboardingThankyou; remove script block + unused imports | 2026-04-12 | 8be3884b | [260411-tcf-cuando-un-usuario-inicia-sesion-y-el-per](./quick/260411-tcf-cuando-un-usuario-inicia-sesion-y-el-per/) |
| 260412-02k | en los inputs de busqueda, en ambos hay que validar la cantidad de texto que se puede buscar | 2026-04-12 | 88dd5140 | [260412-02k-en-los-inputs-de-busqueda-en-ambos-hay-q](./quick/260412-02k-en-los-inputs-de-busqueda-en-ambos-hay-q/) |
| 260412-0bc | enforce hard 300-char cap on ad description textarea — maxlength attribute + Vue watcher dual-layer | 2026-04-12 | bb0cb627 | [260412-0bc-enforce-300-char-limit-on-ad-description](./quick/260412-0bc-enforce-300-char-limit-on-ad-description/) |
| 260412-lfh | agregar medidas mínimas 750x420 de forma natural en el texto del paso de subir imágenes al crear anuncio | 2026-04-12 | 5fed8d34 | [260412-lfh-en-el-paso-de-subir-imagenes-para-crear-](./quick/260412-lfh-en-el-paso-de-subir-imagenes-para-crear-/) |
| 260412-lm7 | limit address_number and business_address_number to 5 chars in FormProfile — yup .max(5) + @input hard-cap handlers | 2026-04-12 | d563c5f2 | [260412-lm7-en-el-formprofile-hay-que-validar-el-num](./quick/260412-lm7-en-el-formprofile-hay-que-validar-el-num/) |
| 260413-lxd | unique username collision handling — ensureUniqueUsername helper with random 5-digit suffix, wired into registerUserLocal, 4 Jest unit tests | 2026-04-13 | 7d19ca47 | [260413-lxd-unique-username-generation-with-random-5](./quick/260413-lxd-unique-username-generation-with-random-5/) |
| 260414-lxu | Documentation restructure: rewrite root README.md as global index, create technical READMEs per app, complete missing docs | 2026-04-14 | 38a59eb6 | [260414-lxu-documentation-restructure-rewrite-root-r](./quick/260414-lxu-documentation-restructure-rewrite-root-r/) |
| 260504-t98 | Fix email confirmation link pointing to Strapi API directly instead of frontend proxy | 2026-05-05 | bc183da5 | [260504-t98-fix-email-confirmation-link-pointing-to-](./quick/260504-t98-fix-email-confirmation-link-pointing-to-/) |
| 260504-ue0 | Email confirmation auto-resend + SSR verification — overrideEmailConfirmation returns { resent: true } for confirmed tokens; activar.vue rewritten with useAsyncData SSR-compatible | 2026-05-04 | bcef2a18 | [260504-ue0-email-confirmation-auto-resend-ssr-verif](./quick/260504-ue0-email-confirmation-auto-resend-ssr-verif/) |
| 260504-wqf | Reserved username validation — RESERVED_USERNAMES constant, frontend guards in FormRegister/FormUsername/[slug].vue, backend badRequest in registerUserLocal + suffix in registerUserAuth | 2026-05-05 | bf70340d | [260504-wqf-reserved-username-validation](./quick/260504-wqf-reserved-username-validation/) |
| 260611-pyz | Delete 19 orphaned Phase 125 dashboard-migration components and remove 2 stale explicit imports; vue-tsc clean | 2026-06-11 | eec60978 | [260611-pyz-delete-orphaned-unused-components-and-fi](./quick/260611-pyz-delete-orphaned-unused-components-and-fi/) |
| 260611-q5u | Consolidate CardInfo and CardInfoDashboard: promote TS superset to replace plain-JS CardInfo, delete CardInfoDashboard, update 25 dashboard pages; vue-tsc clean | 2026-06-11 | 2ba02aed | [260611-q5u-consolidate-cardinfo-and-cardinfodashboa](./quick/260611-q5u-consolidate-cardinfo-and-cardinfodashboa/) |
| 260611-qtt | Fix 4 security gaps: frameguard, apiUrl exposure, processedTokens memory leak, maxLimit | 2026-06-11 | bda08a0b | [260611-qtt-fix-4-security-gaps-frameguard-apiurl-ex](./quick/260611-qtt-fix-4-security-gaps-frameguard-apiurl-ex/) |
| 260611-reg | Change Transbank return_url from APP_URL to FRONTEND_URL so callbacks go through Nuxt proxy | 2026-06-11 | 0549f2fa | [260611-reg-change-transbank-return-url-from-app-url](./quick/260611-reg-change-transbank-return-url-from-app-url/) |
| 260611-rok | Implement proxy secret key authentication between Nuxt and Strapi | 2026-06-11 | 83355e30 | [260611-rok-implement-proxy-secret-key-authenticatio](./quick/260611-rok-implement-proxy-secret-key-authenticatio/) |
| 260611-reg | Replace APP_URL with FRONTEND_URL in all 5 Transbank return/response URLs across 4 payment files so callbacks route through the Nuxt proxy | 2026-06-11 | 0549f2fa | [260611-reg-change-transbank-return-url-from-app-url](./quick/260611-reg-change-transbank-return-url-from-app-url/) |

| 260613-v33 | Auditoria completa flujo usuario Manager en website Nuxt — SSR fail-open en auth.ts + onboarding bypass + deactivate isManager | 2026-06-14 | d2dad61c | [260613-v33-auditoria-completa-flujo-usuario-manager](./quick/260613-v33-auditoria-completa-flujo-usuario-manager/) |

## Session Continuity

Last activity: 2026-06-15
Resume file: None
