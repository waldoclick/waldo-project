# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.41 — Ad Preview Error Handling

**Shipped:** 2026-03-18
**Phases:** 1 (093) | **Plans:** 2 | **Timeline:** same-day

### What Was Built
- `createError({ statusCode: 404/500, fatal: true })` dentro de `useAsyncData` en `[slug].vue` — reemplaza `watchEffect`+`showError` que crasheaba el SSR con 500
- `default: () => null` agregado a `useAsyncData` (AGENTS.md compliance)
- `try/catch` + `strapi.log.error` en controller `findBySlug` — errores de DB → respuesta limpia
- 4 tests Jest (TDD RED→GREEN): null→notFound, throw→internalServerError, happy path manager, happy path public

### What Worked
- La investigación previa (fuera del workflow) identificó las 3 capas del bug antes de escribir una línea de código — el planner tuvo contexto completo y los planes fueron precisos desde el primer intento
- TDD en el plan de Strapi: el test en RED confirmó explícitamente el comportamiento roto antes de hacer el fix, dando confianza total en la solución
- Plan checker pasó en la segunda iteración (blocker único: VALIDATION.md faltante, creado manualmente en minutos)
- Verificador detectó un bonus no planeado: catch block re-lanza Nuxt errors correctamente — arquitectura más robusta de lo esperado

### What Was Inefficient
- El bug requirió 3 rondas de investigación con subagentes explore antes de entender la cadena completa — en retrospectiva, la segunda y tercera ronda de investigación podían haberse consolidado
- El questioning inicial generó una pregunta que demostró falta de comprensión del proyecto (¿cómo debe verse el preview para un manager?), lo que erosionó confianza brevemente — la investigación del código debería preceder más preguntas de scoping

### Patterns Established
- `createError({ fatal: true })` dentro de `useAsyncData` es el patrón canónico Nuxt 4 para errores SSR-safe — `showError()` fuera de `useAsyncData` es un anti-patrón que causa 500 en SSR
- Catch block en `useAsyncData` debe re-lanzar errores Nuxt antes del `createError({ statusCode: 500 })` genérico — previene que los 404 se conviertan en 500
- Bug investigation con subagentes explore es costoso pero confiable — ideal cuando la cadena de causalidad abarca múltiples archivos y frameworks

### Key Lessons
1. **Investigar el código antes de hacer scoping.** Este milestone empezó con preguntas de UX que resultaron irrelevantes (¿cómo se ve el preview para un manager?) cuando el bug era puramente técnico. Revisar los archivos implicados antes de hacer preguntas habría ahorrado 2-3 turnos.
2. **`showError()` en `watchEffect` es un anti-patrón Nuxt 4.** Marcarlo en AGENTS.md o en una futura skill como patrón prohibido evitaría que se repita.
3. **TDD en Strapi vale la pena incluso para fixes pequeños.** El test RED confirmó que el bug existía y el test GREEN confirmó que el fix fue correcto — confianza sin smoke test manual.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: 1 de investigación (3 subagentes explore) + 1 de planning + 1 de ejecución
- Notable: milestone más corto en historia del proyecto — 1 fase, 2 planes, ~2 horas total incluyendo investigación

---

## Milestone: v1.40 — Shared Authentication Session

**Shipped:** 2026-03-16
**Phases:** 2 (091–092) | **Plans:** 3 | **Timeline:** 1 day (same-day delivery)

### What Was Built
- `useLogout.ts` composable created in dashboard — centralizes all logout logic (resets 3 stores + strapiLogout + navigate); `meStore.reset()` action added; 3 scattered call sites migrated
- Conditional `COOKIE_DOMAIN` domain spread in both `nuxt.config.ts` strapi.cookie blocks — production emits shared-domain JWT cookie
- Old host-only `waldo_jwt` cleanup in both `useLogout.ts` composables via `import.meta.client` guard — eliminates zombie sessions
- `COOKIE_DOMAIN` documented as commented-out examples in both `.env.example` files; human-verified regression-free

### What Worked
- Phase 091 (composable) before Phase 092 (cookie domain) was the right ordering — old-cookie cleanup applied in one place atomically, no scattered missed call sites
- The `import.meta.client` guard pattern for client-side cookie manipulation was already established in the codebase — immediate adoption, no discovery needed
- Conditional object spread `...(COOKIE_DOMAIN ? { domain } : {})` is a clean TypeScript-idiomatic pattern for optional cookie attributes
- Human-verify checkpoint as last task in Phase 092 (plan 02) gave explicit local regression confirmation before archiving

### What Was Inefficient
- REQUIREMENTS.md traceability table showed SESS-01–06 as "Pending" after Phase 092 was complete — the SUMMARY.md marked them complete but the requirements file wasn't updated during execution; required reconciliation at archival time
- No staging deployment to fully validate SESS-01–04 cross-subdomain behavior — code is correct but the real test requires `COOKIE_DOMAIN` to be set in staging environment

### Patterns Established
- `import { useStrapiAuth, navigateTo } from '#imports'` in composables — required for Nuxt auto-import interception; always use `#imports` (not auto-import) in composable files
- `if (import.meta.client) { document.cookie = ... }` — the canonical SSR-safe pattern for client-side cookie manipulation in Nuxt 4 composables
- Commented-out env vars in `.env.example` for vars that MUST be unset in local dev — prevents developer confusion while documenting the production/staging values

### Key Lessons
1. **Update REQUIREMENTS.md traceability during execution, not just SUMMARY.md.** When a plan completes requirements, checking them in REQUIREMENTS.md immediately prevents archival-time reconciliation.
2. **For env-gated features, staging smoke test should be a mandatory plan.** SESS-01–04 (cross-subdomain session sharing) can only be verified with `COOKIE_DOMAIN` set — a dedicated staging-verify plan would close this gap formally.
3. **Two-phase cookie migration (composable first, domain second) is the right pattern.** Phase 091 guaranteed Phase 092's cleanup was atomic — single place, no scattered call sites. Always centralize before extending.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 2 (one per phase)
- Notable: v1.40 was the fastest 2-phase milestone in project history — 6 min total execution time across all 3 plans

---

## Milestone: v1.39 — Unified API Client

**Shipped:** 2026-03-15
**Phases:** 2 (089–090) | **Plans:** 7 | **Timeline:** 1 day

### What Was Built
- Confirmed `useApiClient` GET passthrough was already correct — added 1 test to document the contract; no source changes needed (phase 089)
- Migrated 5 reference-data stores (filter, regions, communes, conditions, faqs) to `useApiClient` in batch
- Migrated 4 content stores (ads, related, articles, categories) and 3 user/business stores (me, user, indicator)
- Migrated 3 composables (`useStrapi`, `useOrderById`, `usePacksList`) — caller API unchanged
- Migrated 4 pages + 1 component; `FormProfile.vue` `useStrapi()` import was dead code (purely subtractive)
- Final grep gate + typecheck + browser smoke test — zero regressions, zero SDK data-fetch calls remain

### What Worked
- Batching stores by domain (reference data / content / user-business) made each plan focused and reviewable
- "Raw body shapes identical to SDK" discovery meant zero caller changes needed for composable migrations — multiplied the value of phases 089-04
- Final validation gate plan (090-06) as a dedicated explicit step gave confidence the migration was complete — prevented "probably done" ambiguity
- `/api/` prefix discovery and fix (`96653c4`) happened quickly post-ship — the grep gate found it because it tested against a live server, not just typecheck

### What Was Inefficient
- gsd-tools milestone complete reported "4 phases, 10 plans" (inflated) — it included phases/plans from other milestones that happened to be in the directory. Phase count should have been filtered by milestone scope
- The `/api/` prefix bug (URLs were being doubled: `/api/api/...`) was only caught by the browser smoke test, not by typecheck or Vitest — an integration test against the real Nitro proxy would have caught this earlier

### Patterns Established
- `const client = useApiClient()` at store root level — never inside action functions; composable rules require setup-level instantiation
- `useApiClient()` inside factory function for module-level composables like `usePacksList` — same rule, different shape
- Store methods returning collection responses need explicit return types when callers access `.data`/`.meta` — TypeScript infers `{}` from raw `client()` without them
- URL convention: no `/api/` prefix in `useApiClient` calls — `useStrapiClient` config already applies the prefix
- Final validation plan pattern: grep gate → typecheck → browser smoke test → summary commit; this sequence catches all three failure modes systematically

### Key Lessons
1. **Add a dedicated validation plan for large migrations.** The 090-06 grep + typecheck + smoke test pattern is worth repeating for any migration that touches 10+ files.
2. **Don't trust typecheck alone for API shape migrations.** The `/api/` prefix bug passed typecheck and Vitest but failed in the browser. Integration tests or manual smoke testing is required for URL-shape changes.
3. **"Caller API unchanged" is a force multiplier.** Preserving the existing return shape in `useStrapi`/`useOrderById`/`usePacksList` meant callers were migration-transparent — zero downstream changes needed.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 7 (one per plan + one for post-ship fix)
- Notable: Phase 089 was 1 min — discovered the implementation was already correct; just added missing test. Fastest phase in project history.

---

## Milestone: v1.38 — GA4 Analytics Audit & Implementation

**Shipped:** 2026-03-14
**Phases:** 3 (083–085) | **Plans:** 6 | **Timeline:** 1 day

### What Was Built
- Fixed 3 GA4 ecommerce bugs: real revenue (Strapi biginteger `Number()` coercion), correct `item_id` (`||` fallback chain), and free-ad `purchase` event with `value: 0`
- Added 3 discovery tracking functions to `useAdAnalytics`: `viewItemListPublic`, `viewItem`, `search` — wired into `/anuncios` pages with SSR-safe guard patterns
- Added 5 engagement/lifecycle/content functions: `contactSeller`, `generateLead`, `signUp`, `login`, `articleView` — wired into 5 components/pages
- TDD throughout: each plan started with failing tests, implementation driven by RED-GREEN cycle; 31 tests total
- GTM Version 6 published: single `ga4-engagement-events` tag with `{{Event}}` dynamic name covers all new events

### What Worked
- TDD cycle was extremely fast — RED commit then GREEN commit per plan; no debugging needed
- The `pushEvent()` delegation pattern from prior milestones made adding new events trivial (just call pushEvent with different args)
- SSR guard patterns (`viewItemFired` ref + slug-change reset watcher) established in 084 carried cleanly into 085
- GTM `{{Event}}` dynamic variable pattern: one tag, one trigger covering all engagement events — no per-event tag pollution
- `@click.capture` for contact events was a low-effort, high-reliability fix for click propagation edge cases

### What Was Inefficient
- Phase 083's git first-commit shows `2025-12-18` in the stats lookup (the `008589a` commit is an old codebase commit matched by `083`/`084`/`085` string — not phase-specific). Better to scope git stats to phase directory commits only
- Pre-existing Vitest failures in unrelated files (`useOrderById.test.ts`, `FormLogin.spec.ts`, `ResumeOrder.test.ts`) caused confusion in Phase 084 — needed `git stash` to confirm they were pre-existing

### Patterns Established
- Strapi biginteger defense: always wrap numeric fields from API responses with `Number()` before passing to GA4
- `||` over `??` for fallback chains where empty string should trigger fallback (not just `null`/`undefined`)
- `watch(dataRef, { immediate: true })` + boolean `firedRef` guard for all analytics events on data-driven pages — prevents double-fire on SSR hydration
- Slug-change watcher resets `firedRef` to `false` — required when Nuxt reuses a component across `[slug]` navigations
- Flow strings: `ad_creation` (ecommerce), `user_engagement` (contact/lead), `user_lifecycle` (auth), `content_engagement` (blog)
- All non-ecommerce GA4 events pass empty `[]` items array — no ecommerce block for engagement events
- GTM dynamic `{{Event}}` variable pattern: one trigger regex + one tag = coverage for N events without N tags

### Key Lessons
1. **TDD is the fastest path for analytics composables.** Writing assertions before implementation forces precise thinking about event shape and avoids debugging dataLayer pushes manually in the browser.
2. **SSR-safe analytics requires two guards: immediate watcher + fired ref.** The `{ immediate: true }` handles already-loaded SSR data; the boolean guard prevents multiple calls from reactive re-evaluation.
3. **GTM tag consolidation pays off.** Registering all engagement events under one regex trigger + one tag keeps GTM workspace clean and reduces publish friction for future event additions.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 3 (one per phase)
- Notable: All 6 plans completed in 1 day — TDD + established patterns = very low friction; average plan execution ~2-5 min

---

## Milestone: v1.1 — Dashboard Technical Debt Reduction

**Shipped:** 2026-03-05
**Phases:** 4 (3-6) | **Plans:** 15 | **Timeline:** 2 days

### What Was Built
- Double-fetch eliminated and pagination isolated per ads section via dedicated settings store keys
- `AdsTable.vue` generic component replacing 6 duplicated Ads* components (~1,200 lines removed)
- Canonical domain types (Ad, User, Order, Category, Pack) in `app/types/` — single source of truth
- `typeCheck: true` enabled with clean build (resolved 200+ TypeScript errors across 50+ files)
- Sentry error visibility restored; dead code, deps, and auth middleware removed
- 3 Strapi aggregate endpoints (categories/ad-counts, orders/sales-by-month, indicators/dashboard-stats) wired to dashboard components — N+1 and client-side pagination loops eliminated

### What Worked
- Wave-based plan execution: quick wins first (Phase 3) unblocked all subsequent phases cleanly
- Atomic task commits made each plan reviewable and reversible at any point
- gsd-tools roadmap analyze correctly surfaced Phase 6 disk_status discrepancy (ROADMAP showed 2/3 but 3 SUMMARYs existed)
- The Strapi SDK v5 cast pattern (established in Phase 5) carried cleanly into Phase 6 — no rework

### What Was Inefficient
- Phase 5 (typeCheck) took ~90 min for a single plan — the 200+ errors were all systematic but required touching 50+ files. A pre-check run of vue-tsc before enabling typeCheck in config would have surfaced errors without the blocking build failure loop
- ROADMAP.md Phase 6 progress row was never updated to show 3/3 Complete — STATE.md and ROADMAP were out of sync at milestone close

### Patterns Established
- `watch({ immediate: true })` as sole data-loading trigger — never pair with `onMounted`
- Per-entity section keys in settings store — never share a key between distinct list views
- Strapi SDK v5 casts: `response.data as T[]`, `params as Record<string,unknown>`, `payload as unknown as Parameters<...>[N]`
- Aggregate endpoint pattern: `findMany` with `limit:-1` + server-side aggregation over N client HTTP round trips
- Custom Strapi route ordering: specific paths (e.g. `/categories/ad-counts`) before parameterized paths (`:id`)
- `Omit<DomainType, field> & { field?: NarrowShape }` for API response shape compatibility without full interface re-declaration

### Key Lessons
1. **Enable type checking early.** Running vue-tsc before touching code (not after enabling typeCheck) surfaces errors without blocking builds mid-work.
2. **Defer consolidation when prerequisites are missing.** Reservations*/Featured* correctly deferred — forced consolidation would have created pagination conflicts. Document the blockers explicitly so the next milestone can act on them.
3. **Strapi route ordering matters.** Specific routes must precede parameterized routes; Strapi processes arrays in order and will match `:id` before named paths if order is wrong.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: ~6-8 (estimated)
- Notable: Phase 5 typeCheck plan had the highest cost (50+ files, 90 min) — systematic but unavoidable given accumulated type debt

---

## Milestone: v1.19 — Zoho CRM Sync Model

**Shipped:** 2026-03-08
**Phases:** 4 (43-46) | **Plans:** 8 | **Timeline:** 1 day

### What Was Built
- ZohoHttpClient fixed: `Zoho-oauthtoken` header prefix, 401 response interceptor with `_retry` guard for automatic token refresh
- Test isolation via `axios-mock-adapter` injected through optional constructor param — production path unchanged
- ZohoService extended: `createDeal()`, `updateContactStats()` (selective payload, no undefined keys), `createLead()` (Lead_Status: New), `createContact()` (counters init to 0)
- `pack_purchased` → Zoho Deal + Contact stats wired in `pack.service.ts` with `await` (safe, not a redirect handler)
- `ad_paid` → Zoho Deal + Contact stats wired in `ad.service.ts` as floating promise (redirect must not be blocked)
- `approveAd()` → `Ads_Published__c` + `Last_Ad_Posted_At__c` with first-publish guard (re-approval never double-counts)
- Post-ship fix: `"Closed Won"` → `"Cerrado ganado"` after CRM pipeline validation revealed stage name mismatch

### What Worked
- TDD (RED → GREEN) discipline caught integration issues early — mock path depth bug and missing `contentType` mock surfaced in test run before commit
- Floating promise pattern from Phase 45 carried directly into Phase 46 design with zero rework
- Capturing `_zohoEmail` / `_zohoAmount` before the floating promise prevents closure-over-mutable-variable bugs — pattern should be used in all future floating Zoho calls
- Phase ordering (reliability → service layer → wiring) was correct: all new calls inherited the fixed auth header automatically

### What Was Inefficient
- `"Closed Won"` stage name was hardcoded based on Zoho English default without validating the CRM pipeline — required a post-ship fix after manual testing revealed the mismatch. A quick CRM API call to list Deal stages during Phase 44 planning would have caught this
- STATE.md was not updated correctly across sessions — the `gsd-tools phase complete` CLI was not called consistently, causing the state to show 0% progress despite phases being complete

### Patterns Established
- **Floating promise for any Zoho sync in a redirect handler**: capture `_zohoEmail`, `_zohoAmount` before `Promise.resolve().then(async () => { ... }).catch(...)` — never `await` inside a method that triggers `ctx.redirect()`
- **`await` is safe for Zoho in non-redirect service methods**: `processPaidWebpay` for packs does not redirect; blocking is simpler and easier to test
- **First-publish guard pattern**: `const isPending = ad.status !== 'published'` checked before firing any "ad published" side effects — prevents double-counting on re-approval
- **Zoho stage names must match CRM pipeline exactly**: validate stage values against the actual CRM pipeline (Configuración → Módulos → Tratos → Fase) before hardcoding

### Key Lessons
1. **External API field names and picklist values must be validated against the live system before hardcoding.** `"Closed Won"` was wrong for a Spanish-configured CRM. Any hardcoded enum value from a third-party API needs a one-time verification step.
2. **Floating promises need pre-captured variables.** All variables used inside `.then()` must be captured before the `Promise.resolve()` call — not just for correctness but for readability and testability.
3. **axios-mock-adapter via optional constructor injection is the cleanest test isolation pattern.** It avoids module-level mocking complexity and keeps the production path untouched.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: ~2 (planning session + execution session)
- Notable: Post-ship fix (`"Cerrado ganado"`) was a one-line change discovered through manual CRM testing — not caught by automated tests since tests mock the HTTP layer. Integration tests against a real Zoho sandbox would catch this class of error.

---

**Shipped:** 2026-03-05
**Phases:** 2 (7-8) | **Plans:** 2 | **Timeline:** ~28 minutes

### What Was Built
- `onMounted` eliminated from all 10 remaining non-ads dashboard components (6 catalog + 4 transactional)
- `watch({ immediate: true })` is now the sole data-loading trigger across the entire dashboard
- `searchParams: any` replaced with `Record<string, unknown>` in all 10 files (Strapi SDK v5 pattern)
- TS18046 narrowing error resolved via explicit cast: `(searchParams.filters as Record<string, unknown>).$or`

### What Worked
- Purely subtractive approach: zero new code added, zero behavior changes — this is the safest possible refactor
- Pattern was already established in v1.1 (AdsTable + Phase 7 catalog components) so Phase 8 was mechanical
- The `typeCheck: true` build gate (enabled in v1.1) immediately caught the TS18046 narrowing regression — proving its value

### What Was Inefficient
- The TS18046 error was foreseeable: changing `any` to `Record<string, unknown>` for a nested mutation always requires a cast. Could have been caught by reading the component code more carefully before executing. Low cost in practice (~2 min fix), but preventable with a quick pre-read.

### Patterns Established
- `(searchParams.filters as Record<string, unknown>).$or = [...]` — canonical cast for nested `Record<string, unknown>` property mutation with vue-tsc strict mode
- ReservationsUsed.vue dual-watch pattern preserved: primary fetch watch + secondary page-bounds watch are intentionally separate

### Key Lessons
1. **`any` → `Record<string, unknown>` always requires nested cast.** When a property is typed as `unknown`, sub-property access fails strict typeCheck. Anticipate and pre-cast in the same commit.
2. **Purely subtractive refactors are the fastest path to correctness.** v1.2 took 28 minutes because it added nothing — just removed the duplicate trigger.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: 1 (both phases in single execute-phase run)
- Notable: Fastest milestone to date — 2 phases, 28 minutes total wall time

---

## Milestone: v1.3 — Utility Extraction

**Shipped:** 2026-03-06
**Phases:** 3 (9-11) | **Plans:** 7 | **Timeline:** ~1 day

### What Was Built
- `app/utils/date.ts`: `formatDate` and `formatDateShort` — replaced 33 inline date formatter definitions across 17 files
- `app/utils/price.ts`: `formatCurrency` with CLP/es-CL as default — replaced 13 inline currency formatter definitions
- `app/utils/string.ts`: `formatFullName`, `formatAddress`, `formatBoolean`, `formatDays`, `getPaymentMethod` — replaced 6 inline definitions
- 100% unit test coverage for all three utility files
- `nuxt typecheck` passes clean after every phase's replacements

### What Worked
- Nuxt auto-import for `app/utils/*.ts` eliminated all explicit import boilerplate — the refactor was purely subtractive in components
- Batching replacements by component vs page kept each plan focused and reviewable
- Treating UTIL-07 (typecheck validation) as a success criterion per phase rather than a standalone phase kept quality gates tight without adding overhead
- The `"--"` fallback pattern was immediately consistent across all three utilities — no ambiguity about missing data display

### What Was Inefficient
- The v1.3-ROADMAP.md archive was captured mid-execution (before Phase 11 completed), requiring a manual correction at milestone close — the archive step should run after all phases are done, not before the final phase
- Phase 10 had Plans: TBD in ROADMAP.md at start — plan count was resolved organically (1 plan), but pre-defining plan structure would have been cleaner

### Patterns Established
- `app/utils/*.ts` as the canonical location for shared pure formatting functions (Nuxt auto-imported)
- All utility functions typed as `(value: T | null | undefined) => string` with `"--"` as the universal fallback
- `formatCompactCurrency` naming pattern for component-local compact variants alongside the global `formatCurrency`
- Unit tests in `tests/utils/{name}.test.ts` co-located with each utility at creation time

### Key Lessons
1. **Auto-import makes refactors trivially clean.** When the utility lands in `app/utils/`, every component gets it for free — the refactor is just removing inline definitions. No import churn.
2. **Archive milestones only after all phases complete.** Premature archival creates stale artifacts that need correction. The archive step is strictly a post-completion action.
3. **Consistent null handling (`"--"`) across all utilities eliminates a whole class of UI bugs.** The pattern is simple, predictable, and worth enforcing at utility creation time.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: ~5 (one per plan + milestone close)
- Notable: Phase 9 took ~43 min total (5 plans) — the largest single milestone by plan count; Phases 10-11 were 1 plan each at ~15 min

---

## Milestone: v1.4 — URL Localization

**Shipped:** 2026-03-06
**Phases:** 4 (12-15) | **Plans:** 9 | **Timeline:** 1 day (2026-03-05 → 2026-03-06)
**Files changed:** 94 files, +3,621/-243 lines | **Requirements:** 15/15 complete

### What Was Built
- All 11 Spanish page directory names renamed to English equivalents (`anuncios`→`ads`, `categorias`→`categories`, `comunas`→`communes`, `condiciones`→`conditions`, `ordenes`→`orders`, `regiones`→`regions`, `usuarios`→`users`, `cuenta`→`account`, `destacados`→`featured`, `reservas`→`reservations`; `faqs`/`packs` `editar.vue`→`edit.vue`)
- All 5 navigation components (MenuDefault, DropdownUser, DropdownSales, DropdownPendings, StatisticsDefault) updated to English routes
- All 17 data/form components updated (`router.push`, `NuxtLink :to`, `isRouteActive()` key strings)
- `nuxt.config.ts` `routeRules` with 301 redirects covering all legacy Spanish URL prefixes
- `nuxt typecheck` passes with zero errors after all changes

### What Worked
- `git mv` pattern established in Phase 12 carried through all 4 phases perfectly — no rework
- Two-commit pattern (rename first, update refs second) kept each task clean and reviewable
- Preserving Spanish UI labels (breadcrumbs, page titles) while only changing route path strings was a clear, correct boundary: avoids unintended UX changes while achieving URL migration
- Phase order was optimal: Phases 12-14 were independent route renames, Phase 15 was the integration (links + redirects + typecheck). No merge conflicts.
- Explicit `routeRules` (no wildcards) worked cleanly — TypeScript-compatible and covers 100% of known routes

### What Was Inefficient
- Phase 15, Plan 02: Several components (AdsTable, UserAnnouncements, OrdersDefault, router plugin) were already updated in a prior session commit (8a95dfd) — the plan had to account for "already done" state. A brief pre-read before executing would have removed them from scope.
- Phase 15, Plan 02: `UsersDefault.vue` router.push was missed in the initial plan execution and required a follow-up fix commit. The component was not in the original plan's file list. A broader grep for Spanish path strings before finalizing the plan would have caught it.
- Spanish breadcrumb labels were incorrectly translated in an intermediate commit (25 page files) and had to be reverted — the plan explicitly said not to change UI labels, but the executor translated them anyway. Tighter success criteria per task would prevent this.

### Patterns Established
- `git mv` for all Nuxt page directory and file renames — preserves Git rename history, keeps `git log --follow` functional
- Two-commit pattern for URL migration: `git mv` rename first → update all internal route refs second
- External public website hrefs (e.g. `websiteUrl + /anuncios/[slug]`) are explicitly out of scope for dashboard URL localization
- `routeRules` with explicit named paths (no `:splat` wildcards) — compatible with Nuxt TypeScript build
- Spanish UI labels (breadcrumbs, page `<h1>` text, sidebar labels) are content, not routing — never changed in a URL migration

### Key Lessons
1. **Pre-read component code before finalizing a plan's file list.** A 5-minute grep for Spanish path strings before writing the plan would have caught the UsersDefault.vue miss and the already-updated components from prior commits.
2. **Explicit scope boundaries in plans prevent scope creep.** The "do NOT change Spanish UI labels" instruction was in the plan but not in per-task success criteria — adding it per task would have prevented the breadcrumb revert.
3. **URL migration is purely mechanical when the pattern is clear.** The `git mv` + two-commit pattern made each phase ~2-3 min of actual execution. The upfront cost is identifying all affected files — this should be the research focus, not the implementation.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: ~8 (one per plan + fixes + milestone close)
- Notable: Fastest per-plan average — 9 plans in 1 day; most plans were 2-3 min execution once file list was identified

---

## Milestone: v1.5 — Ad Credit Refund

**Shipped:** 2026-03-06
**Phases:** 2 (16-17) | **Plans:** 2 | **Timeline:** ~4 minutes
**Files changed:** 3 source files modified | **Requirements:** 8/8 complete

### What Was Built
- `rejectAd()` and `bannedAd()` in `ad.ts` now free `ad_reservation.ad = null` and `ad_featured_reservation.ad = null` via `entityService.update` before sending email — credits immediately reusable
- `ad-rejected.mjml` and `ad-banned.mjml` render conditional Spanish credit-return paragraphs (`{% if adReservationReturned %}`, `{% if featuredReservationReturned %}`) — only shown when credits were actually returned

### What Worked
- Reusing the existing cron pattern (`entityService.update(uid, id, { data: { ad: null } })`) made implementation trivial — no new patterns needed
- Placing the freeing block *before* the email try block was the right sequencing decision: the email boolean flags evaluate correctly from the pre-freed `ad` object
- Phase split (Phase 16: service logic, Phase 17: email templates) was correct — clean separation, each phase independently verifiable
- Both phases executed in 2 minutes each — mechanical implementation once the pattern was clear

### What Was Inefficient
- The MJML template files were modified but not committed by the executor agent — required a manual follow-up commit (`7e7a3cc`). The executor committed `ad.ts` changes but left the templates unstaged. This is a known gap in the executor's self-check for MJML files.

### Patterns Established
- Reservation freeing updates the reservation side (FK lives on reservation entity, not ad) — consistent with cron, never update the ad side
- No try/catch around reservation-freeing calls — freeing failure should propagate as a hard error, not be silently swallowed
- Boolean flags for email templates: `!!ad.X?.id` evaluated on pre-freed snapshot — captures "did this ad have X before we freed it?"
- MJML Nunjucks conditional pattern: `{% if flagName %}...<mj-text>...</mj-text>...{% endif %}` for optional email sections

### Key Lessons
1. **Verify MJML file commits explicitly.** Executor agents may commit TypeScript changes but leave MJML (or other non-TS files) unstaged. Add MJML files to the per-task verify grep check in plans.
2. **Pre-freed object snapshot is the correct timing for email flag computation.** Always read reservation state *before* freeing when you need to communicate "what was returned" — the freeing call destroys the evidence.
3. **Reuse existing patterns over inventing new ones.** The `entityService.update(ad: null)` pattern was already proven in the cron. Recognizing and reusing it avoided any design work.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 4 (plan-phase × 2, execute-phase × 2, milestone close split across 2 sessions)
- Notable: Fastest milestone by execution time — 3 plans, ~7 min. The patterns were fully established; this was pure application.

---

## Milestone: v1.7 — Cron Reliability

**Shipped:** 2026-03-06
**Phases:** 4 (20-23) | **Plans:** 4 | **Timeline:** ~35 minutes
**Files changed:** 5 source files modified | **Requirements:** 10/10 complete

### What Was Built
- `ad-free-reservation-restore.cron.ts` (`user.cron.ts` renamed): fixed multi-ad deactivation loop (`for...of` over all expired ads per user); removed unused `PaymentUtils` import; added English JSDoc throughout
- `bbdd-backup.cron.ts` (`backup.cron.ts` renamed): corrected Strapi v5 config path to `strapi.config.get('database') as { connection: any }`; redacted DB password from logged shell command; added English docs
- `media-cleanup.cron.ts` (`cleanup.cron.ts` renamed): replaced incompatible relation sub-filter with two-step folderPath resolution via `db.query('plugin::upload.folder').findOne`; translated all Spanish comments to English
- `ad-expiry.cron.ts` (`ad.cron.ts` renamed): English JSDoc on class, method, and key inline steps
- `cron-tasks.ts`: English JSDoc comment block for all four job entries documenting purpose, schedule expression, timezone, and service method

### What Worked
- All four cron phases were independent — could have been executed in parallel; instead streamed sequentially with no blocking
- The established class-based cron service pattern (from v1.8 planning) made each fix mechanical: find the bug, fix it, add English comments, verify
- Plan quality was high — each plan had a single clear bug to fix with no ambiguity

### What Was Inefficient
- Cron files were renamed (ad.cron → ad-expiry.cron, etc.) but the import paths in `cron-tasks.ts` were not updated in the same session, causing a broken state that was only caught later. File renames should always be followed by a grep of all import references.

### Patterns Established
- Strapi v5 config access pattern: `strapi.config.get('database') as { connection: { host, port, database, user, password } }`
- Two-step folder filter for Cloudinary/Strapi upload folder: `db.query('plugin::upload.folder').findOne({ where: { path: '/ads' } })` then filter files by `folderId`
- English JSDoc in all cron files: class-level (what the cron does), method-level (algorithm), inline on non-obvious steps
- Cron service naming convention after v1.7: files named `{domain}-{function}.cron.ts` (e.g. `ad-expiry`, `ad-free-reservation-restore`, `bbdd-backup`, `media-cleanup`)

### Key Lessons
1. **Rename + update imports atomically.** When renaming a file, always update all import references in the same commit. A file rename without import updates leaves the codebase in a broken state.
2. **Strapi v5 config path differs from v4.** The `strapi.config.database` pattern from Strapi v4 docs does not work in v5 — use `strapi.config.get('database')` with a type cast.
3. **Two-step queries beat nested relation filters for folder lookups.** Strapi's `entityService` does not support filtering by nested relation fields on `plugin::upload.file` — resolve the folder ID first, then filter files by ID.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: ~5 (one per plan + milestone close)
- Notable: 4 independent bug-fix plans in ~35 min — fast because each plan had a single, isolated bug with no cross-cutting changes

---

## Milestone: v1.8 — Free Featured Reservation Guarantee

**Shipped:** 2026-03-07
**Phases:** 1 (24) | **Plans:** 1 | **Timeline:** ~2 hours (including debug + revert cycle)
**Files changed:** ~7 source files | **Requirements:** 9/9 complete (with post-ship revision)

### What Was Built
- `cron-runner` API committed (controller + routes) — `POST /api/cron-runner/:name` for manual cron execution
- `ad-free-reservation-restore.cron.ts` logic corrected: reservations linked to expired ads stay linked (history); "available pool" now counts `ad=null` + `ad.active=true` (not `remaining_days>0`); cron simplified to single-responsibility guarantee of 3 free slots per user
- Parallel batch processing: `Promise.all` over batches of 50 users — avoids DB connection pool exhaustion
- `featured.cron.ts` implemented, registered, then **reverted by business decision** — the guarantee is already satisfied by `ad-free-reservation-restore.cron.ts`

### What Worked
- The debug cycle (v18-free-featured-reservation-bugs.md) correctly identified that the original cron logic was counting reservations incorrectly — fixing the counting logic fixed the root cause
- Parallel batching pattern transferred cleanly from the featured cron design into the existing cron

### What Was Inefficient
- `featured.cron.ts` was fully implemented, documented, committed, and then removed in the same milestone — a pre-implementation audit of what `ad-free-reservation-restore.cron.ts` already does would have prevented the redundant implementation
- Import paths in `cron-tasks.ts` were not updated when cron files were renamed in v1.7 — this carried forward as broken imports into v1.8 and had to be fixed as a separate cleanup commit

### Patterns Established
- `ad-free-reservation-restore.cron.ts` "available pool" definition: `ad=null` (unused) + `ad.active=true` (currently in use). Reservations linked to `ad.active=false` are consumed history — not counted as available.
- Parallel batch pattern for cron jobs with many users: `Promise.all` in chunks of 50 — balances throughput vs connection pool pressure
- Before implementing a new cron: check if an existing cron already handles the same domain — avoid duplicate responsibility

### Key Lessons
1. **Before writing a new cron, audit existing ones for overlapping responsibility.** `featured.cron.ts` was fully built before realizing `ad-free-reservation-restore.cron.ts` already covered the same guarantee. A 5-minute read of the existing cron would have prevented ~1 hour of redundant work.
2. **File renames require atomic import updates.** The v1.7 cron file renames left `cron-tasks.ts` importing from old paths — this carried into v1.8 as a silent breakage. Any file rename must be followed by a global import grep in the same commit.
3. **Counting logic bugs are invisible without explicit test cases.** The `remaining_days>0` vs `ad.active=true` distinction was a real correctness bug that required a debug session to surface. Explicit unit tests on the counting logic would have caught it at write time.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: ~6 (plan, execute, debug × 2, revert, milestone close)
- Notable: The revert of `featured.cron.ts` was the biggest inefficiency — 1 full implementation cycle wasted. The lesson (audit before implementing) is now in the patterns.

---

## Milestone: v1.9 — Website Technical Debt

**Shipped:** 2026-03-07
**Phases:** 5 (25-29) | **Plans:** 6 | **Timeline:** ~2 days (2026-03-06 → 2026-03-07)
**Files changed:** 124 files, +6,551/-597 lines | **Requirements:** 18/18 complete ✓

### What Was Built
- **Phase 25 (Critical Correctness Bugs)**: Fixed Strapi `/ads/me` route ordering (shadowed by wildcard `:id`); corrected `useAsyncData` key collisions on `/`, `/packs`, and `/anuncios/[slug]`; proper `$setStructuredData` type augmentation; restored `console.error`/`warn` visibility in production.
- **Phase 26 (Data Fetching Cleanup)**: Moved `onMounted(async)` data-fetching to `useAsyncData` in 7 components; all 33 remaining `onMounted` calls documented with classification comments (`UI-only`, `analytics-only`, `client-only-intentional`).
- **Phase 27 (TypeScript Migration)**: Added `lang="ts"` to all 17 JavaScript pages; eliminated `any` in `user.store`, `me.store`, `ad.store`, `useAdAnalytics`, `useAdPaymentSummary`, `usePackPaymentSummary`; exported `AnalyticsItem` and `DataLayerEvent` interfaces.
- **Phase 28 (Store Persist Audit)**: Added `// persist: CORRECT | REVIEW | RISK` classification comments to all 14 stores; applied Strapi SDK filter cast pattern to 4 stores; discovered and catalogued 183 typecheck errors (deferred to Phase 29).
- **Phase 29 (TypeScript Strict Errors)**: Fixed all 183 errors across 55 files — created `window.d.ts`, `plugins.d.ts`, extended `strapi.d.ts`, `ad.d.ts`; fixed `createError statusMessage`, `useAsyncData` default option, `useSeoMeta` argument types; enabled `typeCheck: true`; added `vue-tsc` devDependency.

### What Worked
- The phased TypeScript approach (migrate pages first → audit stores → fix errors → enable strict) was the right order — each phase had a clean prerequisite and no backtracking.
- Phase 25 and 26 were purely subtractive/additive changes with no architectural risk — fast and reliable execution.
- Using `nuxt typecheck` as a discovery tool in Phase 28 was the right call — revealed the true error surface (183 errors vs the expected 10) before committing to enable `typeCheck: true`, preventing a broken build.
- Phase 29's systematic wave structure (window globals → plugin augmentation → user types → API mismatches → props → composables) avoided re-running typecheck after each individual fix.

### What Was Inefficient
- Phase 28 has 2 PLANs but only 1 SUMMARY — the summary covers both plans, which is accurate but creates a `disk_status: partial` flag in tooling. A phase-level summary is the right choice here but the tooling interprets plan-count vs summary-count literally.
- The persist audit comments (STORE-01) and the Strapi SDK filter casts (part of 28-01) were combined into a single phase but had zero dependency on each other — they could have been separate phases for cleaner history.

### Patterns Established
- **TypeScript discovery before enabling strict**: Run `nuxt typecheck` without `typeCheck: true` first; catalogue errors by category; fix all before enabling — prevents a build-breaking intermediate state.
- **`window.d.ts` consolidates all Window globals**: TypeScript's declaration merging means one file is authoritative — no per-file `declare global` pollution.
- **`useAsyncData` default option**: `default: () => []` eliminates `T | undefined` from the inferred type without changing runtime behavior — avoids downstream null guards.
- **`Ad.category` as union type**: `number | CategoryObject` models unpopulated vs populated Strapi responses correctly — eliminates type casts at usage sites.
- **persist audit comment format**: `// persist: CORRECT|REVIEW|RISK — <one-line rationale>` immediately above the `persist:` key — scannable, self-documenting, machine-readable.

### Key Lessons
1. **Run `nuxt typecheck` early to discover true scope before planning.** Phase 28 found 183 errors vs 10 expected — an 18× scope increase. Had we enabled `typeCheck: true` directly, every build would have failed. Running it as a diagnostic before committing to the plan is the right sequencing.
2. **Systematic waves beat opportunistic fixes for large error sets.** Phase 29's 183 errors were fixed in 6 ordered waves (window globals → plugins → user types → API mismatches → props → composables) rather than randomly. Each wave closed a category; the next wave had fewer interference.
3. **`vue-tsc` is required by `typeCheck: true` but not declared automatically.** Adding `typeCheck: true` to `nuxt.config.ts` requires `vue-tsc` as a devDependency — this isn't obvious from the config option alone. Required a hotfix commit.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: ~12 (plan + execute per phase × 5, plus UAT + milestone close)
- Notable: Phase 29 was the heaviest plan (183 errors, 55 files) but completed in a single execute session — the systematic wave structure made it tractable.

---

---

## Milestone: v1.10 — Dashboard Orders Dropdown UI

**Shipped:** 2026-03-07
**Phases:** 1 (30) | **Plans:** 1 | **Timeline:** ~5 minutes
**Files changed:** 1 source file (apps/dashboard) | **Requirements:** 2/2 complete

### What Was Built
- `DropdownSales.vue` title line: `getBuyerName(order.user)` — `formatFullName(firstname, lastname)` with fallback chain to `username`, `email`, then `"Usuario"` — replaces raw `buy_order` order ID
- `DropdownSales.vue` meta line: `formatDateShort(createdAt) • formatTime(createdAt)` — full date + time, replaces time-only display

### What Worked
- Existing utility functions (`formatFullName`, `formatDateShort`) covered the requirement exactly — zero new code needed beyond the wrapper helper
- Single-file plan: no dependencies, no waves, instant execution
- The `getBuyerName` wrapper pattern (destructure + fallback chain) was an obvious extension of the existing `formatFullName` utility

### What Was Inefficient
- Nothing — this was a textbook minimal-change fix. ~5 min wall time.

### Patterns Established
- `getBuyerName(user?: OrderUser): string` — wrapper pattern for API user objects that separates field extraction from formatting; reusable for any component showing buyer identity

### Key Lessons
1. **Utility functions age well.** The `formatFullName` and `formatDateShort` utilities defined in v1.3 were immediately applicable here with zero modification — consistent utility design pays dividends.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 1
- Notable: Smallest milestone by file count — 1 file, 2 requirements, ~5 min. Pure value.

---

## Milestone: v1.11 — GTM / GA4 Tracking Fix

**Shipped:** 2026-03-07
**Phases:** 1 (31) | **Plans:** 1 | **Timeline:** ~2 minutes
**Files changed:** 2 source files (apps/website) | **Requirements:** 2/2 complete

### What Was Built
- `gtm.client.ts`: deleted local `gtag()` shim (was pushing arrays, not objects); SPA `page_view` now pushes `{ event: "page_view", page_path, page_title }` as a plain object via `window.dataLayer.push()`
- `gtm.client.ts`: Consent Mode v2 default denial (`analytics_storage: "denied"`, `ad_storage: "denied"`) pushed after `window.dataLayer` init and before GTM script `async = true`
- `LightboxCookies.vue`: `acceptCookies()` replaced `accept_cookies` custom event with correct Consent Mode v2 update command (`{ "consent": "update", analytics_storage: "granted", ad_storage: "granted" }`)

### What Worked
- Root cause was clear and isolated — the broken `gtag()` shim was a single function responsible for all the failures; deleting it was simpler than fixing it
- `window.dataLayer.push()` is a direct, unambiguous replacement — no new abstraction needed
- Both tasks were independent files (plugin + component) → executed in 2 minutes total

### What Was Inefficient
- The broken shim had been in place since v1.0 — it was never noticed because GA4 silently ignores malformed pushes. A basic GA4 Realtime check at the end of any analytics-touching phase would have caught this months earlier.

### Patterns Established
- No `gtag()` helper anywhere in the codebase — `window.dataLayer.push()` is the sole push mechanism
- Consent Mode v2 command structure: `{ "consent": "default"|"update", analytics_storage: "denied"|"granted", ad_storage: "denied"|"granted" }` — flat structure, quoted `consent` key
- Consent Mode v2 timing: default denial push MUST precede GTM script injection

### Key Lessons
1. **GA4 Realtime is the cheapest regression test for analytics.** A 30-second check in Realtime after any plugin change confirms events are arriving. The broken shim would have been caught at v1.0 with this check.
2. **Delete broken abstractions, don't fix them.** The `gtag()` shim was wrong at its foundation (arrays vs objects). Deleting it and using the native API was cleaner and less risky than patching it.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 1
- Notable: Fastest milestone ever — 1 plan, 2 files, 2 minutes. The problem was well-defined and the solution was deletion + direct replacement.

---

## Milestone: v1.12 — Ad Creation Analytics Gaps

**Shipped:** 2026-03-07
**Phases:** 1 (32) | **Plans:** 1 | **Timeline:** ~10 minutes
**Files changed:** 6 source files (apps/website) | **Requirements:** 5/5 complete

### What Was Built
- `CreateAd.vue`: removed dead `useAdAnalytics` import + instantiation (ANA-01)
- `index.vue`: removed `{ immediate: true }` from `watch(adStore.step)`; added explicit `stepView(1, ...)` in `onMounted` — step 1 fires exactly once per flow entry (ANA-02)
- `resumen.vue`: `pushEvent("redirect_to_payment", [], { payment_method: "webpay" })` before `handleRedirect()` (ANA-03)
- `gracias.vue`: `purchaseFired = ref(false)` guard prevents duplicate `purchase` events on `watchEffect` re-runs (ANA-04)
- `useAdAnalytics.ts`: `DataLayerEvent` exported; `ecommerce` widened to `| null`; `window.d.ts` types `window.dataLayer` as `(DataLayerEvent | Record<string, unknown>)[]` union (ANA-05)

### What Worked
- All 5 gaps were isolated, surgical changes — no cross-cutting concerns
- The union type for `window.dataLayer` (`DataLayerEvent | Record<string, unknown>`) was the right call: avoids forcing non-analytics files (gtm plugin, LightboxCookies) to cast to `DataLayerEvent`
- Single-plan phase: all 5 fixes are in one atomic commit — easy to verify, easy to revert

### What Was Inefficient
- ANA-02 (step_view overcounting) required understanding the two-location firing pattern (onMounted for step 1 + watcher for steps 2-5) before implementing. A brief pre-read of `index.vue` and `CreateAd.vue` together would have surfaced this immediately.

### Patterns Established
- `purchaseFired = ref(false)` guard pattern for `watchEffect`-triggered one-time events — set flag immediately before the push, not after
- `DataLayerEvent.ecommerce` typed as `Record<string, unknown> | null` — supports GTM's recommended null-flush pattern before each ecommerce event
- Union type `(DataLayerEvent | Record<string, unknown>)[]` for `window.dataLayer` — accurate model for mixed analytics + consent command payloads

### Key Lessons
1. **`watchEffect` can re-run on any reactive dependency change.** Any one-time action inside `watchEffect` needs an explicit fired guard — `ref(false)` is the simplest and most readable pattern.
2. **Dead imports in analytics composables have silent side effects.** The dead `useAdAnalytics` instantiation in `CreateAd.vue` was harmless at runtime, but it was setting up a composable that tracked nothing. Removing it made the ownership model explicit: analytics belong to the page, not the sub-component.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 1
- Notable: 5 requirements in 1 plan in ~10 minutes — well-scoped, targeted fixes with clear success criteria per requirement.

---

## Milestone: v1.13 — GTM Module Migration

**Shipped:** 2026-03-07
**Phases:** 1 (33) | **Plans:** 1 | **Timeline:** ~15 minutes
**Files changed:** 3 modified, 1 deleted (apps/website) | **Requirements:** 4/4 complete

### What Was Built
- `apps/website/app/plugins/gtm.client.ts` — **DELETED** (the broken hand-rolled plugin that never actually injected the GTM script in production)
- `apps/website/package.json` — `@saslavik/nuxt-gtm@0.1.3` added to devDependencies
- `apps/website/nuxt.config.ts` — module added to `modules[]`; top-level `gtm: { id, enableRouterSync: true, debug: false }` config block; `runtimeConfig.public.gtm: { id }` replaces flat `gtmId` field
- `apps/website/app/composables/useAppConfig.ts` — feature flag updated to `!!config.public.gtm?.id`

### What Worked
- `@saslavik/nuxt-gtm` was immediately identifiable as the correct module — it's the only one with explicit Nuxt 4 support; `@nuxtjs/gtm` is Nuxt 2 only
- `enableRouterSync: true` replaces the manual `router.afterEach` page_view push entirely — the module handles it natively
- The Nuxt 4 type system auto-generates `runtimeConfig` types from `nuxt.config.ts` — no manual `runtime-config.d.ts` needed
- GA4 Realtime confirmed working locally with 1 active user immediately after testing

### What Was Inefficient
- v1.11 fixed the broken plugin internals and v1.13 replaced the plugin entirely — these could have been one milestone if the module had been researched at the outset. The `gtm.client.ts` plugin was always fragile; a module was always the correct long-term solution.

### Patterns Established
- GTM module config: top-level `gtm: {}` block in `nuxt.config.ts`, NOT nested inside the `modules` array entry
- Feature flag pattern: `!!config.public.gtm?.id` — optional chaining handles the case where `gtm` is not set in config
- Nuxt module research order: check `@nuxtjs/` namespace first, but verify Nuxt version compatibility — many official modules are still Nuxt 2

### Key Lessons
1. **Check the Nuxt module ecosystem before writing any plugin.** `@saslavik/nuxt-gtm` handles GTM injection, router sync, and SSR correctly in 3 config lines. The hand-rolled plugin took 65+ lines and was still broken. Modules exist for most common integrations.
2. **GA4 Realtime is a fast integration test.** After installing the module and running `nuxt dev`, GA4 Realtime showed 1 active user within seconds — confirming end-to-end delivery without needing a staging deploy.
3. **`runtimeConfig` typing is automatic in Nuxt 4.** Adding a new field to `runtimeConfig.public` in `nuxt.config.ts` is immediately type-safe — no declaration file needed.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 1
- Notable: Clean execution — zero deviations, zero issues. The module API was straightforward and the `nuxt typecheck` passed on the first attempt.

---

## Milestone: v1.14 — GTM Module: Dashboard

**Shipped:** 2026-03-07
**Phases:** 1 (34) | **Plans:** 1 | **Timeline:** ~5 minutes
**Files changed:** 3 modified, 1 deleted (apps/dashboard) | **Requirements:** 3/3 complete

### What Was Built
- `apps/dashboard/app/plugins/gtm.client.ts` — **DELETED** (64-line hand-rolled plugin replaced by module)
- `apps/dashboard/package.json` — `@saslavik/nuxt-gtm@0.1.3` added to devDependencies
- `apps/dashboard/nuxt.config.ts` — module added to `modules[]`; top-level `gtm: { id, enableRouterSync: true, debug: false }` config block; `runtimeConfig.public.gtm: { id }` replaces flat `gtmId` field

### What Worked
- The v1.13 pattern transferred directly — same module, same config shape, same runtimeConfig structure; zero design decisions needed
- `nuxt prepare` confirmed GTM module injection with `$gtm: GtmSupport` in the auto-generated types

### What Was Inefficient
- Pre-existing `formatDate` typecheck errors (54 errors, unrelated to GTM) blocked a clean `nuxt typecheck` pass — deferred to a future phase. GTM-DASH-03 acceptance criterion was met (zero NEW errors from GTM changes) but total typecheck output is noisy.

### Patterns Established
- Both website (`apps/website`) and dashboard (`apps/dashboard`) now use identical GTM module configuration — pattern is fully standardized across the monorepo

### Key Lessons
1. **Pattern reuse within a milestone series is near-zero cost.** v1.14 took 5 minutes because v1.13 established every detail — module choice, config shape, runtimeConfig structure. The only work was copying the pattern.
2. **Deferred issues need explicit scope boundaries.** The pre-existing `formatDate` errors were clearly out of scope (no failing component was touched), but without the `deferred-items.md` file the acceptance criteria would appear to fail.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 1
- Notable: Fastest milestone to date — 5 minutes, 1 plan, 3 requirements. Purely a pattern application from v1.13.

---

## Milestone: v1.15 — Website SEO Audit

**Shipped:** 2026-03-07
**Phases:** 1 (35) | **Plans:** 3

### What Was Built
- `$setSEO` plugin extended with full OG + Twitter Card tag set (`ogTitle`, `ogDescription`, `ogUrl`, `ogType`, `twitterCard`, `twitterTitle`, `twitterDescription`) — zero call-site changes needed
- 74+ hardcoded `https://waldo.click` strings replaced with `config.public.baseUrl` across 21 page files
- `$setSEO` + structured data added to 4 pages that had none (`packs/index.vue`, `packs/comprar.vue`, `mis-ordenes.vue`, `mis-anuncios.vue`); profile page `[slug].vue` SEO restored with `ProfilePage`/`Person` schema; home page gained `WebSite` + `Organization` JSON-LD with `SearchAction`
- `noindex, nofollow` applied to all 18 private/transactional pages via `useSeoMeta` — defense-in-depth alongside `robots.txt`
- `microdata.ts` fixed: `key: "structured-data"` on `useHead` script entry prevents JSON-LD accumulation on SPA navigation
- Sitemap restructured: `sources` array replaced with single `async urls()` function combining static entries (with `changefreq`/`priority`) and dynamic ad URLs

### What Worked
- Extending the plugin to derive all new OG/Twitter fields from existing `title`/`description` params meant zero call-site updates were needed — the extension was fully backward-compatible
- Breaking into 3 plans by responsibility (plugin + URLs / coverage + noindex / dedup + sitemap) gave clean execution boundaries; no plan bled into another's concerns
- The `useHead` key pattern for JSON-LD deduplication was a one-line fix with high impact — Nuxt handles merging natively

### What Was Inefficient
- Plan 35-01 SUMMARY.md was not created during execution — required creation at milestone close. SUMMARY.md should be generated immediately after each plan completes.
- The pre-existing `v1.15-ROADMAP.md` and `v1.15-REQUIREMENTS.md` archives in milestones/ still showed "In Progress" status; the gsd-tools CLI doesn't update previously created archives on `milestone complete` — manual update required.

### Patterns Established
- `useSeoMeta({ robots: "noindex, nofollow" })` pattern for private page noindex defense-in-depth
- `key: "structured-data"` on `useHead` script entry prevents JSON-LD accumulation on SPA navigation
- Sitemap pattern: single `async urls()` function — static entries as `const staticUrls` prepended, dynamic entries spread-appended
- `$setSEO` plugin extension pattern: derive new tag fields from existing params to preserve backward compatibility

### Key Lessons
1. **Always write SUMMARY.md immediately after a plan completes.** The summary is the canonical record of what was done. Missing summaries block milestone completion tooling and require reconstruction from plan + commit history.
2. **Pre-existing milestone archives need manual status update.** The `milestone complete` CLI tool creates new archive files but doesn't update previously-created ones; if archives were pre-created during milestone start, review and update them at close.
3. **One-line fixes with high impact:** The `key: "structured-data"` fix eliminated a structural SEO bug that would have confused Google's structured data crawler — a trivial code change with outsized SEO consequence.
4. **Backward compatibility in plugin extension is a design constraint, not an accident.** Deriving `ogTitle` from `title` means existing `$setSEO` callers automatically get correct social sharing — no migration sweep needed.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 1
- Notable: Compact milestone — 3 focused plans, ~1.5 hours total. Highest file-touch count (27+ files for SEO-07 noindex sweep) was mechanical and fast.

---

## Milestone: v1.16 — Website Meta Copy Audit

**Shipped:** 2026-03-07
**Phases:** 3 (36–38) | **Plans:** 4

### What Was Built
- 4 SEO bug fixes (Phase 36): double-suffix titles eliminated in `anuncios/[slug].vue` and `[slug].vue`; SSR-safe `$setSEO` placement fixed in `anuncios/index.vue`; `noindex, nofollow` added to `packs/index.vue`, `login/facebook.vue`, `login/google.vue`, and `dev.vue`; `descPart` leading-space guard eliminates double-space when ad description is null
- Canonical vocabulary enforced across all 4 dynamic pages (Phase 37): `anuncios` / `activos industriales` / `Waldo.click®` replace all forbidden terms (`avisos`, `maquinaria industrial`, `clasificados`); all dynamic `$setSEO` titles ≤ 45 chars; all descriptions 120–155 chars; stale `${totalAds}` counter removed
- 4 static pages rewritten with distinct, keyword-rich SERP copy (Phase 38): FAQ, Contact, Sitemap, Privacy Policy all carry canonical vocabulary, correct budgets, and unique title+description combinations
- Budget-aware slice formula `(155 - prefix.length - suffix.length - 4)` for ad descriptions — replaces hardcoded 150-char limit, enabling exact budget calculation regardless of ad name length

### What Worked
- Phase 36 (bug fixes) as prerequisite for Phases 37–38 ensured vocabulary conventions were confirmed before copy was authored — no copy rework needed after bug fixes
- Two-plan split in Phase 38 (FAQ+Contact vs. Sitemap+Privacy) gave clean execution boundaries with no cross-plan bleed
- `descPrefix`/`descSuffix` pattern for dynamic ad pages isolates variable content from fixed brand suffix — budget math is exact and maintainable

### What Was Inefficient
- STATE.md carried stale data from milestone start (milestone shown as `v1.1`, status `ROADMAP_DEFINED`) through the entire execution cycle — it was never updated to reflect phase progress. STATE.md should be updated at each phase completion, not only at milestone close.
- The `gsd-tools milestone complete` CLI archives ROADMAP and REQUIREMENTS correctly but does not zero-out STATE.md — manual cleanup is always required at milestone close.

### Patterns Established
- `descPart` leading-space variable pattern: `const descPart = ad.description ? ` ${ad.description.slice(...)}` : ''` — eliminates double-space when dynamic content is null
- `descPrefix`/`descSuffix` split for budget-aware ad description slicing: `slice(0, 155 - descPrefix.length - descSuffix.length - 4)`
- SSR-safe `$setSEO` must be called at top-level synchronous scope in a page — not inside `watch()` only (watch doesn't fire on first SSR pass)
- `noindex, nofollow` via `useSeoMeta` is a per-page concern: apply to every non-indexable page, not just categories

### Key Lessons
1. **Fix structural bugs before authoring copy.** Phase 36 caught title double-suffix and SSR deferral bugs that would have made Phase 37 copy partially invisible to crawlers. Prerequisite phases pay off immediately.
2. **Budget-aware formulas beat hardcoded limits.** The `descPrefix.length + descSuffix.length` formula makes description budgets self-correcting as surrounding copy changes — hardcoded slice offsets require re-auditing every time surrounding text is edited.
3. **STATE.md is the developer's checkpoint, not just the agent's.** A stale STATE.md (wrong milestone, 0% progress) is a silent correctness hazard for any agent resuming mid-session. Update it at each phase boundary, not only at open and close.
4. **Canonical vocabulary enforcement is a constraint, not a preference.** Forbidden terms (`avisos`, `maquinaria industrial`, `clasificados`) were found on high-traffic pages. A vocabulary audit as a dedicated milestone phase (not a review item in a larger milestone) catches all occurrences before they compound.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 1
- Notable: 3-phase milestone with tight scope — all 12 requirements completed in a single session. Phase 36 bug fixes were the highest-leverage work (SSR correctness + structural title fixes).

---

## Milestone: v1.20 — TypeScript any Elimination

**Shipped:** 2026-03-08
**Phases:** 5 (47-51) | **Plans:** 5 | **Timeline:** 1 day

### What Was Built
- Ad service + controller: `AdQueryOptions` interface, `computeAdStatus(unknown)`, `ctx: Context` (koa) — zero `any` in the highest-traffic Strapi API file
- Type files: `order.types.ts`, `filter.types.ts`, `flow.types.ts` operator fields → `unknown`; `flow.factory.ts` + `flow.service.ts` → `Core.Strapi` DI typing + `Record<string, string>` param bags
- 13 integration service files (Zoho, Facto, Indicador, Google Sheets, Transbank, payment-gateway): `IZohoContact` + `IWebpayCommitData` interfaces with index signatures for backward compatibility
- 9 payment util + middleware files: data double-cast pattern for entityService JSON fields; `WebpayAdResult` local interface; `BillingDetails` exported from `user.utils.ts`
- 5 seeders: `Core.Strapi` replaces `strapi: any`; 4 test files: typed result interfaces + `(global as unknown as { strapi: MockStrapi })` cast avoiding `@strapi/types` conflict
- `tsc --noEmit` exits 0 and all Jest tests pass after every phase commit

### What Worked
- Phase ordering (ad API → type files → services → utils/middlewares → seeders/tests) was correct — each phase built on a stable foundation; no rework required
- Research phase before each plan surfaced the real call-site impact before touching code — the `IZohoContact` and `IWebpayCommitData` auto-fixes came from pre-reading callers, not from TSC failures post-edit
- Single-plan phases kept each execution focused and fast — average 8 minutes per phase
- The `unknown` + inline narrowing pattern is now consistent across the entire Strapi codebase — one pattern, no exceptions

### What Was Inefficient
- Phase 39 (Spanish default language / i18n) had been stubbed/deferred with a placeholder summary since v1.17 — it occupied a slot in the phase numbering but produced nothing. Deferred phases should be explicitly cancelled or extracted to a backlog item, not left as stubs.
- The MILESTONES.md entry created by `gsd-tools milestone complete` was empty ("none recorded") because the CLI couldn't parse one-liners from markdown bold (`**One-liner:**`) vs YAML fields — required manual enrichment afterward. The CLI tool should support the actual summary format.

### Patterns Established
- **`Core.Strapi` for all DI parameters in Strapi service factories and seeders**: `import type { Core } from "@strapi/strapi"` → `strapi: Core.Strapi`; official Strapi-provided type, no casting needed
- **Data double-cast for entityService JSON fields**: `{ ...data } as unknown as Parameters<typeof strapi.entityService.create>[1]["data"]` — Strapi's `JSONValue` type is stricter than `unknown`; this cast is the canonical AGENTS.md-aligned approach
- **Index signature interfaces for third-party API results**: `IZohoContact { id: string; [key: string]: unknown }` — typed primary fields + index signature allows callers to access specific properties without losing flexibility for unknown fields
- **`(global as unknown as { strapi: MockStrapi })` for Jest global mocks**: avoids `@strapi/types` global `var strapi: Strapi` conflict; double-cast via `unknown` is narrower than `(global as any).strapi`

### Key Lessons
1. **Pre-read callers before changing a return type to `unknown`.** Changing `Promise<any>` to `Promise<unknown>` in an interface will break every call site that accesses a named property on the result. A 2-minute grep of all call sites before committing saves a round-trip through TSC error messages.
2. **TypeScript union narrowing doesn't work on optional property absence.** `if (!result.webpay)` does not narrow a complex union type — TypeScript needs a discriminant property or explicit type guard. When callers need to branch on shape, introduce a local interface + cast at the branching point.
3. **`@strapi/types` owns the `global var strapi` declaration.** Never `declare global { var strapi: ... }` in test files — it conflicts with Strapi's own types. Use `(global as unknown as { strapi: MockStrapi })` instead.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: ~6 (one per phase plan + milestone close)
- Notable: Fastest multi-phase milestone per plan — 5 plans in 1 day averaging ~8 min each. The `any` elimination pattern was mechanical once established in Phase 47; Phases 48-51 were primarily application of the same patterns.

---

## Milestone: v1.21 — Ad Draft Decoupling

**Shipped:** 2026-03-08
**Phases:** 1 (52) | **Plans:** 4 | **Timeline:** 1 day
**Files changed:** 25 files, +2,186/-61 lines (apps/strapi, apps/website, apps/dashboard) | **Requirements:** 11/11 complete ✓

### What Was Built
- `draft: boolean` field added to Ad content-type schema (`required: true`, `default: true`) — every new ad is a draft from creation
- Idempotent migration seeder sets `draft: true` on all existing ads with abandoned condition (`active=false`, `ad_reservation=null`)
- `computeAdStatus()` returns `"draft"` as the first status check; `"abandoned"` status eliminated from the codebase
- `POST /api/ads/save-draft` (moved from payment domain to ad domain): creates or updates draft ad before payment; returns `{ data: { id } }`
- `publishAd()` method in `ad.utils.ts` sets `draft: false`; called in both `processPaidWebpay()` and `processFreePayment()` after payment confirmed
- `resumen.vue` calls draft endpoint before payment for all non-free packs; `ad_id` returned and stored in `adStore`
- Dashboard `abandoned.vue` repurposed as Borradores — label, endpoint (`/ads/drafts`), and filter all updated

### What Worked
- The `draft` field as a single boolean source of truth was immediately simpler than the multi-condition `abandoned` check it replaced — one field to set, one field to check, one migration path
- Phase split into 4 atomic plans (schema → service/route → draft endpoint → frontend) gave clean execution boundaries with no cross-plan bleed
- Post-verification bug discovery (`draft: false` never being set on paid ads) was caught through manual testing of the full payment flow — the test coverage gap was real but the fix was clear and isolated
- Moving the endpoint from payment domain to ad domain was the right call when found: `saveDraft` is an ad concern, co-located with `draftAds()`, `computeAdStatus()`, and the schema

### What Was Inefficient
- The original plan had `POST /api/payments/ad-draft` in the payment domain — the domain assignment was wrong and required a mid-session move. A brief ownership audit (what domain does this belong to?) before naming the endpoint would have caught this
- `draft: false` on payment confirmation was not in the original requirements — it was discovered as a critical data integrity bug during UAT. The requirement "ads with `draft: true` after payment" was a logical consequence of adding the field but not explicitly planned. Future `draft`-touching endpoints should always ask: "what sets this back to false?"
- The Strapi permission for `GET /api/ads/drafts` had to be inserted manually into the SQLite DB — Strapi's admin permission UI is required but out of scope for automated execution. This class of permission setup should be documented as a manual deploy step in the plan

### Patterns Established
- **`publishAd(adId)` helper pattern**: any payment confirmation path (Transbank callback or free payment) MUST call `publishAd()` to set `draft: false` — never rely on the default value alone
- **Endpoint domain assignment**: route location should match the primary entity, not the triggering flow. `save-draft` lives in `/api/ads/`, not `/api/payments/`, because the result is an `Ad` record
- **"What sets this back?" audit**: when adding a boolean field with `default: true`, always explicitly plan the flip to `false` before considering the feature complete
- **Strapi permission as manual deploy step**: any new public endpoint needs a permission entry in the Strapi admin. Document this as an explicit post-deploy step in the plan, not an afterthought

### Key Lessons
1. **Plan the full lifecycle of a new boolean field.** Adding `draft: true` as default is not complete until you also plan `draft: false` (when, where, by whom). The missing `publishAd()` call was a critical data integrity bug that required a hotfix — it should have been in the original requirements.
2. **Endpoint domain belongs with the entity, not the trigger.** The payment flow triggers the draft save, but the result is an Ad — `POST /api/ads/save-draft` is correct; `POST /api/payments/ad-draft` mixes concerns. Apply this to any new endpoint: where does the resulting record live?
3. **Strapi permission setup is a deploy-time manual step.** New endpoints (especially non-standard routes) require explicit permission setup in the Strapi admin panel. This should be documented in the plan as a manual step, not treated as automatically granted.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: ~5 (one per plan + UAT + hotfixes + milestone close)
- Notable: The `publishAd()` hotfix was discovered through manual UAT (reservation flow test), not through automated tests — a strong argument for a Jest test covering the full payment confirmation path that asserts `draft: false` on the resulting ad

---

## Milestone: v1.22 — Checkout Flow UI

**Shipped:** 2026-03-08
**Phases:** 1 (53) | **Plans:** 1 | **Timeline:** 1 day
**Files changed:** 13 files, +867/-110 lines (apps/website) | **Requirements:** 20/23 complete (REDIR-01–03 deferred to next milestone)

### What Was Built
- `pages/pagar/index.vue` — auth middleware, `noindex`, renders `CheckoutDefault`; established as the single payment execution page
- `PaymentAd.vue` — ad preview card (image, name, price, Edit button) shown as the first checkout element for context before paying
- `PaymentGateway.vue` — WebPay checkbox (decorative, disabled); structured for future gateway additions without layout changes
- `CheckoutDefault.vue` — owns the full payment logic (draft call, `payments/ad`, WebPay redirect, free path, error handling); eliminates logic duplication from `resumen.vue`
- `FormCheckout.vue` — reestructurado: `lang="ts"`, 5 accordion sections in correct order (ad → method → featured → invoice → gateway), dead code removed
- `BarCheckout.vue` — checkout-specific action bar (no back button, no step display); separated from `BarAnnouncement` to avoid prop flag soup
- SCSS: `payment--ad`, `payment--gateway` blocks; `form--checkout__field__title` for section headings

### What Worked
- The component decomposition (PaymentAd, PaymentGateway, FormCheckout, CheckoutDefault, BarCheckout) gave clear single-responsibility boundaries — each component has one job
- Building `CheckoutDefault` as the payment logic owner upfront means the redirect wiring in phase 54 is purely mechanical: point flows to `/pagar` and `CheckoutDefault` handles the rest
- Separating `BarCheckout` from `BarAnnouncement` avoided a growing list of conditional props to hide/show elements that don't belong in the wizard context

### What Was Inefficient
- Phase 54 (redirect wiring from `resumen.vue` and pack flow) was scoped but not executed — the milestone was closed with 3 requirements pending. The checkout page exists but isn't reachable from the ad creation wizard yet. This means the feature is built but not connected.
- No SUMMARY.md was created for Phase 53 — the phase directory was never created, making it invisible to gsd-tools roadmap analysis. Future phases should always create the directory even if working directly from commits.

### Patterns Established
- **`/pagar` as payment hub**: all paid flows redirect here; `CheckoutDefault` owns execution; no payment logic in pages that precede it
- **PaymentAd pattern**: show the user what they're paying for as the very first checkout element — reduces abandonment and support requests about "wrong ad"
- **Payment component separation**: `PaymentGateway` is decorative today but structured for real gateway selection without layout changes — the slot is there

### Key Lessons
1. **Ship the connection, not just the destination.** Building the `/pagar` page without wiring the redirect from `resumen.vue` leaves the feature in a half-shipped state. The next milestone must complete REDIR-01–03 before this is usable.
2. **Always create the phase directory, even for single-plan phases.** Phase 53 has no directory → no SUMMARY.md → gsd-tools can't see it. Two commands (`mkdir` + writing the summary) would have kept the planning state consistent.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: ~3 (build + fixes + milestone close)
- Notable: Milestone closed with known gaps (REDIR-01–03) by explicit user decision — context integrity was prioritized over feature completeness

---

## Milestone: v1.26 — Mostrar comprobante Webpay en /pagar/gracias

**Shipped:** 2026-03-11
**Phases:** 1 (060) | **Plans:** 3 | **Timeline:** ~2 days (2026-03-09 → 2026-03-11)

### What Was Built
- `prepareSummary()` extended to extract all 8 mandatory Webpay fields (`amount`, `authorizationCode`, `transactionDate`, `paymentTypeCode`, `cardDetail`, `buyOrder`, `commerceCode`, `status`) from `order.payment_response`
- `ResumeOrder.vue` with `CardInfo` components — Spanish labels, "No disponible" fallbacks for missing data, conditional display based on payment type
- Strapi `findOne()` fixed to query by `documentId` (string) not numeric `id` — resolves Strapi v5 migration regression
- Webpay redirect updated to use `order.documentId` — thank-you flow is now order-centric, not ad-centric
- Test scaffolds for `ResumeOrder` and `gracias.vue` created with Vitest; 7/7 tests passing at phase close

### What Worked
- Order-centric approach (redirecting with `documentId` instead of `adId`) was the right foundation — Transbank callback doesn't have `adId` anyway
- Test scaffolds in Wave 0 gave confidence for the implementation phases — verified behavior before and after
- The 3-plan split (test scaffolds / receipt fields / backend redirect) was clean; no cross-plan dependencies

### What Was Inefficient
- Several quick tasks were executed in parallel with this milestone (fixes 1-17 in STATE.md) — while efficient for velocity, mixing milestone plans with quick tasks creates noisy git history and makes milestone-specific stats harder to isolate
- MILESTONES.md entry was auto-generated with "TBD" values because the milestone was started before completion — the `gsd-tools milestone complete` CLI updates the entry at close, but prior manual edits to the entry caused a merge conflict in the file structure

### Patterns Established
- `order.documentId` as the redirect parameter for all post-payment thank-you pages — never `adId` (unavailable in Transbank callback)
- `prepareSummary()` as the extraction point for all payment response fields — page stays thin, all field mapping centralized
- Vitest test scaffolds as Wave 0 for any visual component with conditional display logic

### Key Lessons
1. **Strapi v5 uses `documentId` everywhere for entity lookup.** `findOne({ where: { id: numericId } })` silently returns no results in Strapi v5 — always query by `documentId` (string) for public-facing lookups.
2. **Thank-you pages should be order-centric, not ad-centric.** The payment gateway callback carries order data, not ad data; designing around `documentId` makes the page correct by default.
3. **Test scaffolds before implementation reduce rework.** Wave 0 tests caught the missing "No disponible" fallback case before the component was fully built.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: ~5 (quick tasks interspersed with milestone plans)
- Notable: Parallel quick task execution during milestone phases is efficient but complicates attribution and git history clarity

---

## Milestone: v1.27 — Reparar eventos GA4 ecommerce en flujo de pago unificado

**Shipped:** 2026-03-12
**Phases:** 1 (061) | **Plans:** 2 | **Timeline:** 2 days (2026-03-11 → 2026-03-12)
**Git range:** `5e4da12` → `b1de40b`

### What Was Built
- `purchase(order: PurchaseOrderData)` method added to `useAdAnalytics` composable — fires GA4 ecommerce `purchase` event with all required fields (`transaction_id`, `value`, `currency`, `items`) from order data, not cleared ad store
- `PurchaseOrderData` interface exported from composable for page-level type-checking
- `pushEvent()` flow discriminator: optional 4th param `flow = "ad_creation"` — fully backward-compatible; distinguishes `ad_creation` vs `pack_purchase` in all downstream events
- 12 Vitest tests covering `purchase()` behavior and flow discriminator — TDD (RED then GREEN)
- `/pagar/gracias.vue`: `watch(orderData, handler, { immediate: true })` + `purchaseFired` ref guard — fires exactly once per visit; `adStore.clearAll()` retained in `onMounted` without interfering
- `/pagar/index.vue`: `onMounted` with `adStore.ad.ad_id === null` guard — `beginCheckout()` fires for pack-only flow only; ad-creation flow unaffected

### What Worked
- TDD discipline (12 failing tests committed before implementation) surfaced the `extraData.ecommerce` vs `items` payload design question early — the decision to pass `[]` as items and put the full ecommerce payload in `extraData` came out of the test-writing phase, not after a runtime failure
- Wave structure (composable first, page wiring second) was correct — Plan 02 was purely mechanical once the composable API was stable
- `watch(orderData, { immediate: true })` was the right trigger for SSR hydration safety — the page is visited after a Transbank redirect, so `orderData` may already be populated before mount

### What Was Inefficient
- Plan 02's implementation was already partially present from a prior session (commits `41836a2` and `be85762` pre-dated the formal plan execution) — the executor correctly identified and documented this but it added confusion about what was "new" vs "pre-existing"
- The verifier reported 0 tasks counted (gsd-tools milestone complete shows `"tasks": 0`) because tasks are extracted from SUMMARY.md YAML fields that were not populated — a format inconsistency in the summary template

### Patterns Established
- **`purchase()` payload pattern**: pass `items: []` to `pushEvent`; put full ecommerce object in `extraData.ecommerce` — avoids internal overwrite in `pushEvent` while preserving full GTM payload
- **`purchaseFired` ref guard**: one-shot boolean on any analytics event that fires inside `watch` or `watchEffect` — set immediately before the push, never after
- **`watch(computed, cb, { immediate: true })` for post-async event firing**: correct trigger when data arrives asynchronously after page load (e.g., post-redirect fetch); `onMounted` is too early if the data is not yet fetched
- **Flow discriminator as 4th positional arg with default**: `pushEvent(event, items, extra, flow = "ad_creation")` — backward-compatible extension; new flows pass explicitly, existing calls unchanged

### Key Lessons
1. **Analytics composable logic benefits most from TDD.** The purchase/pushEvent interaction has subtle payload behavior (overwrite risk). Writing tests before implementation forced the design question to be answered explicitly. Runtime debugging of GTM payload structure is slow and hard; test failures are fast and precise.
2. **Pre-existing commits from prior sessions should be audited before executing a plan.** If key files are already partially modified, the plan should be adjusted to "verify and complete" rather than "implement from scratch." The executor handled this correctly but it created confusion in the summary.
3. **`watch({ immediate: true })` is the correct trigger for post-redirect analytics events.** On `/pagar/gracias`, `orderData` is fetched via `useAsyncData`. If the user navigates directly (not through Transbank callback), `immediate: true` ensures the event fires when data becomes available — not on a stale `onMounted` that runs before the fetch resolves.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 3 (plan, execute, verify + milestone close)
- Notable: Fastest two-plan execution in recent milestones — 2 days total including prior session work; the composable was the only design-heavy part; page wiring was mechanical once API was clear

---

## Milestone: v1.28 — Logout Store Cleanup

**Shipped:** 2026-03-12
**Phases:** 1 (062) | **Plans:** 2 | **Timeline:** 1 day (2026-03-12)
**Git range:** `c71e437` → `33cf4ec`

### What Was Built
- `reset()` action added to `useAdsStore`, `useMeStore`, `useUserStore` (Composition API stores that lack built-in `$reset()`)
- `useLogout` composable orchestrating 6-store reset sequence in locked order: `useAdStore.$reset()` → `useHistoryStore.$reset()` → `useMeStore.reset()` → `useUserStore.reset()` → `useAdsStore.reset()` → `useAppStore.$reset()` → `strapiAuth.logout()` → `navigateTo('/')`
- 4 Vitest tests with TDD cycle; `#imports` alias infrastructure in `vitest.config.ts` for Nuxt auto-import mocking
- `MenuUser.vue`, `MobileBar.vue`, `SidebarAccount.vue` migrated from inline `useStrapiAuth().logout()` + `router.push('/')` to `useLogout().logout()`
- `clearAll()` renamed to `reset()` in `ad.store.ts` and all 4 call sites — consistent naming across all stores

### What Worked
- Purely subtractive refactor mindset: the executor correctly identified that `clearAll` was duplicate and the rename + call-site update was the right completion step
- Wave structure was correct — composable infrastructure first (Wave 1), component wiring second (Wave 2); Wave 2 was entirely mechanical once `useLogout` existed
- TDD cycle for the composable surfaced the `#imports` vitest alias gap early — fixing it in the RED phase meant GREEN was clean

### What Was Inefficient
- Plan 062-01 added `reset()` without removing the pre-existing `clearAll()` — the duplicate was caught post-execution by the user reviewing the code, not during planning or verification. A code search for duplicates should be part of the plan action.
- The `clearAll()` → `reset()` rename across call sites was done as a separate unplanned commit after milestone execution — it should have been part of Plan 062-01's action.
- SUMMARY.md one-liner field not populated (gsd-tools returns `null`) — format inconsistency in the summary template, affects milestone stats.

### Patterns Established
- **Composition API store reset**: `const reset = () => { field.value = initialValue; ... }; return { ..., reset };` — canonical pattern for setup stores that can't use `$reset()`
- **`#imports` vitest alias**: for any Nuxt composable that imports from `#imports`, add alias in `vitest.config.ts` pointing to `tests/stubs/imports.stub.ts` — enables `vi.mock("#imports")` interception
- **Component logout handler**: `const { logout } = useLogout(); await logout();` — no post-logout navigation, no store calls, no router imports in the component

### Key Lessons
1. **When adding a new function that duplicates an existing one, search for the old one first.** Plan 062-01 added `reset()` without checking that `clearAll()` existed with identical logic. A one-line grep before implementing would have caught it, and the plan action could have been "rename clearAll to reset" instead of "add reset."
2. **Rename tasks should include call-site updates atomically.** When renaming a function, the plan must also grep for all call sites and update them in the same commit. Leaving call sites to be discovered post-execution creates follow-up work that falls outside the plan.
3. **Post-execution code review by the user is a valuable gap-catching step.** The `clearAll` duplicate and the missing call-site updates were caught by the user reviewing the code after execution — a fast, low-cost review that caught what automated verification missed.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 2 (execute, milestone close)
- Notable: Fastest milestone in recent history — 1 day, 10 commits; the refactor was well-scoped and the composable pattern was straightforward

---

## Milestone: v1.29 — News Manager

**Shipped:** 2026-03-12
**Phases:** 2 (063–064) | **Plans:** 3 | **Timeline:** 1 day (2026-03-12)

### What Was Built
- `apps/strapi/src/api/article/` — full Strapi v5 content type: `schema.json` (title, header, body/richtext, cover, gallery, categories many-to-many, seo_title, seo_description, `draftAndPublish: true`), controller, routes, service (Phase 063)
- `ArticlesDefault.vue` — articles list component: 5-column table (title, category, status, date, actions), search, sort, pagination, delete with Swal confirmation (Phase 064)
- `FormArticle.vue` — create/edit form with vee-validate + yup: title, header, body (via TextareaArticle), seo_title, seo_description (Phase 064)
- `TextareaArticle.vue` — custom Markdown textarea with lucide-vue-next toolbar (Bold, Italic, Heading2, List, ListOrdered, Link, Quote, Code) — no external font/icon dependencies (Phase 064)
- 4 dashboard pages: `articles/index.vue`, `articles/new.vue`, `articles/[id]/index.vue`, `articles/[id]/edit.vue` (Phase 064)
- `MenuDefault.vue` updated — Artículos entry added under Mantenedores with Newspaper icon (Phase 064)
- `ToolbarDefault.vue` updated — Newspaper shortcut icon linking to `/articles` (Phase 064)
- `settings.store.ts` updated — `articles` section added for pagination/sort state (Phase 064)
- `_textarea.scss` created; `app.scss` updated with `@use "components/textarea"` import (Phase 064)

### What Worked
- Backend-first phase ordering (063 → 064) was correct — the Strapi schema was stable before any UI was built; no rework on the content type
- `TextareaArticle.vue` as a custom component (lucide icons only) was the right call over EasyMDE — no external CSS import complexity, no Font Awesome dependency, aligns with the existing icon strategy
- Following the `faqs/` page pattern exactly for article pages kept implementation mechanical — `ArticleData` interface, `publishedAt null→"Borrador"` status display, and pagination all reused established patterns
- 9/9 requirements verified at VERIFICATION.md pass — clean delivery, no deferred items

### What Was Inefficient
- EasyMDE was installed, wired, committed, and then removed in the same milestone — a quick check for existing icon library (lucide-vue-next already in package.json) before reaching for an external library would have prevented the false start
- BEM classes in `FormArticle.vue` used modifier-scoped element names (`form--article__field`) on the first pass — required a fix commit after the user flagged the deviation from the `form__group`/`form__label` pattern. Pre-reading an existing form component before writing a new one would have caught this.
- The `body` field was omitted from `FormArticle.vue` in the initial implementation and required a separate fix commit — component requirements (especially all form fields) should be enumerated in the plan action rather than inferred from the schema

### Patterns Established
- **`TextareaArticle.vue` custom Markdown editor pattern**: lucide-vue-next toolbar + native `<textarea>`; `insertMarkdown(prefix, suffix)` helper for all toolbar actions; no external markdown/editor library needed for basic article authoring
- **`richtext` in Strapi v5 stores Markdown** (not HTML) — the frontend receives and sends raw Markdown; rendering is the consumer's responsibility
- **Strapi v5 SDK `delete` requires string `documentId`**: `documentId || String(id)` pattern for all delete operations — numeric `id` alone will silently fail
- **Form field enumeration in plans**: list every form field explicitly in the plan action (not just "implement the form") — missing fields are only caught at runtime or review otherwise
- **Pre-read existing component before writing a new one of the same type**: reading `FormFaq.vue` or `FormCategory.vue` before `FormArticle.vue` would have confirmed the BEM class pattern (`form__group`, `form__label`, `form__control`) and the vee-validate setup without trial and error

### Key Lessons
1. **Check installed packages before adding new ones.** `lucide-vue-next` was already in `package.json`; reaching for EasyMDE + Font Awesome was unnecessary. A 10-second `grep` for icon libraries before installing would have saved a full install/wire/remove cycle.
2. **Read the BEM rules and a peer component before writing form markup.** The modifier-scoped element class mistake (`form--article__field` vs `form__group`) is a direct consequence of writing markup without first reading the BEM rule in AGENTS.md and looking at an existing form. Pre-reading is the cheapest form of validation.
3. **Enumerate all form fields in the plan, not just the schema.** The schema lists all fields; the plan should explicitly map schema fields to form controls. Missing `body` was obvious in hindsight but invisible in the plan text because it was only implied by the schema reference.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 2 (execute-phase for 063 + 064, milestone close)
- Notable: Fastest feature milestone to date — 2 phases, 1 day; the faqs/ pattern reuse made dashboard implementation near-mechanical; only friction was the EasyMDE false start and the two BEM/field fix commits

---

## Milestone: v1.30 — Blog Public Views

**Shipped:** 2026-03-13
**Phases:** 4 (065–068) | **Plans:** 8 | **Timeline:** 1 day (2026-03-13)

### What Was Built
- `slug` uid field added to Strapi Article schema with `beforeCreate`/`beforeUpdate` lifecycle hooks; `slugify strict:true`; 6 Jest tests covering generation and uniqueness
- `Article` TypeScript interface in `app/types/article.d.ts` (13 fields); `typeCheck: true` passes with zero errors
- SCSS scaffolding: `_article.scss` (article--archive, article--single), blog-specific blocks added to `_hero.scss`, `_filter.scss`, `_related.scss`, `_card.scss`; `app.scss` import added
- `useArticlesStore` (Pinia, no persist, `pageSize: 12`) with `loadArticles(filters, pagination, sort)`
- 7 blog-specific components: `HeroArticles`, `FilterArticles`, `ArticleArchive`, `CardArticle`, `RelatedArticles`, `HeroArticle`, `ArticleSingle`
- `blog/index.vue` — SSR `useAsyncData`, `?category=`/`?order=`/`?page=` URL param reactivity, `MessageDefault` empty state, `RelatedArticles` fallback, `$setSEO` + `@type:"Blog"` structured data
- `blog/[slug].vue` — `useAsyncData(() => 'article-${slug}')`, 404 guard, Markdown via `marked`, `$setSEO` + `@type:"BlogPosting"` structured data, `RelatedArticles` with same-category-first logic

### What Worked
- Phase ordering (schema → infrastructure → listing → detail) had no rework — each phase had stable prerequisites
- Replicating the `anuncios/` pattern for blog pages was mostly mechanical — adapting field names (no price, no seller, `header` instead of `description`) was the only design work
- Infrastructure-first approach (Phase 066: types + SCSS before any component) eliminated undefined-field TypeScript errors in later phases
- `article.gallery` vs `article.cover` distinction was caught early by reading the TypeScript interface — cover is `Media[]` (no `.url`); gallery is `GalleryItem[]` (has `.url`)
- All 4 phases passed verification (4/4, 7/7, 9/9, 8/8 must-haves)

### What Was Inefficient
- Several quick fixes were executed in parallel with this milestone (body rendering, paragraph spacing, dashboard edit pages, image upload) — correct for velocity but makes phase stats (plans vs commits) harder to read in retrospect
- `FilterArticles` BEM class mismatch (`selector__select` → `select`) was caught in phase verification, not during planning — pre-reading the SCSS file before plan execution would have caught it
- The `fix-state-persistence` phase was an out-of-band fix that appeared as `in_progress` in gsd-tools — required a retroactive summary to close it cleanly

### Patterns Established
- **Blog component pattern**: replicate from ads equivalent with blog-specific BEM modifier (`article--archive` mirrors `announcement--archive`, `card--article` mirrors `card--announcement`); do not share components between ads and blog namespaces
- **`cover: Media[]` vs `gallery: GalleryItem[]`**: cover has no `.url` (use `formats.medium?.url || formats.thumbnail.url`); gallery items extend Media and add `.url` — always pass gallery to `GalleryDefault`
- **`useArticlesStore` without persist**: article lists are volatile (filter/pagination-dependent); persist would stale-cache filtered views across sessions
- **Related articles pattern**: load same-category (filtered by category IDs), merge with most-recent, deduplicate by `id`, slice to target count
- **`useAsyncData(() => 'article-${slug}')` lambda key**: required for SSR cache isolation on dynamic routes — string interpolation inside lambda captures SSR-safe reactive value

### Key Lessons
1. **Infrastructure phases pay off immediately.** Phase 066 (types + SCSS) with no user-visible output made Phases 067–068 strictly additive. Every component in Phase 067 had accurate TypeScript types from day one — zero rework for type mismatches.
2. **Read the SCSS file before writing component markup.** The `FilterArticles` BEM mismatch (`selector__select` vs the SCSS selector `.filter--articles__select`) was caught in verification. A 30-second read of `_filter.scss` during plan research would have aligned the class name before writing code.
3. **`cover: Media[]` has no `.url` — always use `gallery: GalleryItem[]` for display.** The `Media` type represents a Strapi media entity (has `formats` with nested URL); `GalleryItem` extends it to add a top-level `.url`. This distinction matters for every component that renders images.
4. **Out-of-band phases should be closed immediately.** The `fix-state-persistence` phase appeared as `in_progress` because the work was done without the GSD workflow. Creating the SUMMARY.md retroactively closed it cleanly — but doing so at the time of the work would be cleaner.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: ~8 (execute-phase per phase-plan, quick tasks interspersed, milestone close)
- Notable: Highest component count in a single milestone — 7 new Vue components + 2 new pages + 1 Pinia store + 1 TypeScript interface + SCSS scaffolding; velocity was high because the ads pattern was established and mechanical to replicate

---

## Milestone: v1.31 — Article Manager Improvements

**Shipped:** 2026-03-13
**Phases:** 2 (069–070) | **Plans:** 2 | **Timeline:** 1 day (2026-03-13)
**Files changed:** 4 files (apps/strapi, apps/website, apps/dashboard) | **Requirements:** 6/6 complete ✓

### What Was Built
- `source_url` string field added to Strapi Article schema (optional, no constraints); `source_url: string | null` in website `Article` TypeScript interface
- `FormArticle.vue`: draft/publish boolean toggle mapped to `publishedAt: null` / ISO string on submit; toggle hydrates correctly from existing `publishedAt` on edit
- `FormArticle.vue`: `source_url` URL field with Yup validation — saves on create, pre-fills on edit, sends null when empty
- Article detail page (`/articles/:id`) sidebar: `source_url` rendered as `<a target="_blank" rel="noopener noreferrer">` when non-empty; hidden when absent

### What Worked
- Two-phase split (schema first → UI second) was correct; Phase 070 had stable prerequisites from day one
- Boolean `form.published` → `publishedAt` mapping on submit was cleaner than direct v-model on an ISO string in form state
- Using the existing `card--info` pattern in the detail sidebar (same as the body block) correctly accommodated the custom `<a>` element — `CardInfo` component only accepts plain string descriptions
- Phase execution was mechanical — both phases were 2–3 min execution time

### What Was Inefficient
- `source_url` re-sync after update (keeping local form state consistent with saved payload) was not in the original plan but was a natural correctness requirement — a brief "what happens after save?" check during planning would have included it upfront
- MILESTONES.md accomplishments were empty (`"none recorded"`) because the gsd-tools CLI couldn't parse one-liners from SUMMARY.md YAML format — required manual enrichment; this is a recurring issue with the CLI parser

### Patterns Established
- **`publishedAt` toggle pattern**: `boolean form.published → publishedAt: null | new Date().toISOString()` on submit — cleaner than storing ISO strings in form state; toggle hydrates from `!!article.publishedAt` on edit
- **`card--info` for custom HTML elements in detail sidebar**: when a sidebar block needs a non-string child (like `<a>`), use `card--info` pattern directly; `CardInfo` component only supports plain text descriptions
- **Nullable Strapi optional string field**: `string | null` (not `string | undefined`) — Strapi returns `null` for unset optional string fields; `undefined` would cause TypeScript false positives on `?.` guards

### Key Lessons
1. **Always ask "what happens after save?" when adding a form field.** The `source_url` re-sync after update ensures the form's local state matches what was actually stored. This is a correctness requirement for any field that can be server-processed or trimmed — plan it upfront.
2. **Check component signatures before choosing a display pattern.** The `CardInfo` component only accepts string descriptions — using it for `source_url` (which needs an `<a>` element) would have required either hacking the component or adding a slot. The `card--info` CSS pattern provides the same visual output with full HTML flexibility.
3. **Optional string fields in Strapi v5 return `null`, not `undefined`.** Always type them as `string | null` in TypeScript interfaces. Using `string | undefined` causes false positives on optional chaining (`?.`) that make the field appear always-absent.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 2 (execute-phase × 2 phases, milestone close)
- Notable: Fastest feature milestone by session count — 2 phases, 2 plans, both executed in under 5 minutes combined; the `publishedAt` mapping pattern was the only design decision; everything else was mechanical

---

## Milestone: v1.32 — Gemini AI Service

**Shipped:** 2026-03-13
**Phases:** 1 (071) | **Plans:** 1 | **Timeline:** ~4 minutes (2026-03-13)
**Files changed:** 6 files (apps/strapi) | **Requirements:** 5/5 complete ✓

### What Was Built
- `apps/strapi/src/services/gemini/gemini.types.ts` — `IGeminiService`, `GeminiRequest`, `GeminiResponse` interfaces
- `apps/strapi/src/services/gemini/gemini.service.ts` — `GeminiService` class; reads `GEMINI_API_KEY` from `process.env`; uses `gemini-1.5-flash` model; throws at startup if key missing (same as SlackService)
- `apps/strapi/src/services/gemini/index.ts` — module-level singleton + `generateText` named export
- `apps/strapi/src/api/ia/controllers/ia.ts` — validates prompt presence, delegates to `generateText`, wraps errors in `ApplicationError`
- `apps/strapi/src/api/ia/routes/ia.ts` — `POST /api/ia/gemini` route
- `apps/strapi/.env.example` — `GEMINI_API_KEY` documented

### What Worked
- Pattern clarity: SlackService was the exact blueprint (module-level singleton, `process.env` key, startup throw) — zero design decisions needed
- Controller imports only from `services/gemini/index.ts` — no `@google/generative-ai` leakage into the API layer; encapsulation was clean by design
- `ApplicationError` over `ctx.internalServerError` was the correct Strapi-idiomatic choice — keeps Strapi running on Gemini failures while returning proper HTTP error responses
- Single-phase, single-plan execution took 4 minutes — the tightest phase in the project history
- All 5 requirements verified by the user at first UAT pass — no deviations, no hotfixes

### What Was Inefficient
- Nothing material — this was one of the cleanest executions to date. The SlackService pattern was fully established and the implementation was purely mechanical.
- MILESTONES.md auto-generated with "none recorded" accomplishments (known CLI parser limitation with SUMMARY.md YAML format) — required manual enrichment at milestone close; recurring issue

### Patterns Established
- **Gemini service pattern**: `GeminiService` in `apps/strapi/src/services/gemini/`; module-level singleton; `process.env.GEMINI_API_KEY` (not `strapi.config.get`); throws at startup if missing; controller imports only from `index.ts`
- **`ApplicationError` for third-party API failures in Strapi controllers**: `try { ... } catch (err) { throw new ApplicationError(message) }` — keeps Strapi running, returns structured error response
- **AI service domain isolation**: `apps/strapi/src/api/ia/` as the namespace for all AI-facing endpoints — `ia` is the stable name regardless of which model provider is behind it

### Key Lessons
1. **When a clear pattern already exists in the codebase, use it exactly.** SlackService was the perfect blueprint for GeminiService — same singleton model, same env var access, same startup guard. There was no value in inventing a different approach.
2. **Keep the AI service name stable (`ia/`), not the provider name.** The route is `POST /api/ia/gemini` today; a future Claude or OpenAI endpoint would be `POST /api/ia/claude`. The `ia` domain is the stable abstraction layer, not `gemini`.
3. **`process.env` for API keys, not `strapi.config.get`.** All integration services in this codebase use `process.env` directly (Slack, now Gemini). `strapi.config.get` is for structured config blocks, not secrets.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 1 (single execute-phase session + milestone close)
- Notable: Fastest milestone by wall time — 1 phase, 1 plan, ~4 min execution; the pattern was fully established before implementation began

---

## Milestone: v1.44 — Google One Tap Sign-In

**Shipped:** 2026-03-19
**Phases:** 5 (094–098) | **Plans:** 9 | **Timeline:** 2 days (2026-03-18 → 2026-03-19)

### What Was Built
- Root-caused SSR session persistence bug — dead `auth.populate` joins causing `setToken(null)` on SSR `fetchUser()` failure; purely subtractive fix
- Fixed cookie replacement on session swap — `useStrapiAuth().logout()` respects `COOKIE_DOMAIN` attribute
- GIS CSP entries (`connect-src` + `frame-src`) and `GOOGLE_CLIENT_ID` env var
- `POST /api/auth/google-one-tap` Strapi endpoint — Google JWT verification, user find-or-create with `google_sub`, 3 free ad slots, 2-step bypass
- `useGoogleOneTap` composable rewrite — `promptIfEligible()` (25 lines) replaces `initializeGoogleOneTap()` (90 lines)
- `google-one-tap.client.ts` Nuxt plugin — SSR-safe GIS initializer with auth + route guards
- `disableAutoSelect()` in `useLogout.ts` prevents post-logout One Tap re-prompt

### What Worked
- TDD across both Strapi (Jest) and frontend (Vitest) — RED scaffolds in wave 0 validated API contracts before implementation
- Phases 094 and 095 (session bugs) were diagnosed and fixed in under an hour each — root cause analysis was precise
- Research phase for 096–098 identified the `src/api/` pattern over plugin extension routes early, avoiding the known Strapi v5 plugin factory bug
- `google_sub` field decision (lookup by sub, email fallback) followed Google's explicit guidance — no need to revisit
- Purely subtractive composable rewrite: 90 → 25 lines, no new abstractions, cleaner test surface

### What Was Inefficient
- Phases 094 and 095 were reactive bug fixes triggered by deploying v1.40's shared cookie — could have been caught with a pre-deploy session replacement test
- The initial 098-01 RED scaffolds had test structure issues that needed fixing in 098-02 (import paths, mock patterns)

### Patterns Established
- `src/api/auth-*` pattern for new Strapi auth endpoints (not plugin extensions) — confirmed reliable across `auth-verify`, `auth-one-tap`
- `google_sub` field as immutable Google identity anchor — email is fallback only for existing account linking
- `.client.ts` plugin suffix for SSR-safe browser-only initialization — no runtime guards needed
- `disableAutoSelect()` before `strapiLogout()` as mandatory logout step for any Google auth integration

### Key Lessons
1. **Deploy session changes with a session-swap test plan** — shared domain cookies have interaction effects (host-only zombies) that unit tests can't catch
2. **Research phase blockers (`google_sub` vs `provideridentifier`) resolve faster during implementation** — the field turned out to be needed; research flagged it correctly
3. **Full page reload after OAuth-style login is simpler and safer than reactive propagation** — all SSR-hydrated components pick up auth state cleanly without refactoring layouts

### Cost Observations
- Model mix: ~100% sonnet (balanced profile) for execution, opus for research/planning
- Sessions: Multiple sessions across 2 days (094/095 bug fixes, then 096–098 feature work)
- Notable: 5-phase milestone completed in 2 days including 2 reactive bug fixes and 3 planned feature phases

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 2 | 4 | Initial payment gateway abstraction |
| v1.1 | 4 | 15 | First full GSD workflow with wave parallelization |
| v1.2 | 2 | 2 | Pattern application: extend v1.1 cleanup to remaining components |
| v1.3 | 3 | 7 | Utility extraction: centralized formatting, introduced unit testing for utilities |
| v1.4 | 4 | 9 | URL localization: all routes in English, 301 redirects for legacy Spanish URLs |
| v1.5 | 2 | 2 | Backend credit refund + conditional email notifications in Strapi |
| v1.6 | 2 | 3 | Website API optimization: aggregate endpoint + store cache guards |
| v1.7 | 4 | 4 | Cron bug fixes + English docs; all 4 cron jobs now functional |
| v1.8 | 1 | 1 | Free reservation guarantee + debug cycle; featured.cron reverted |
| v1.9 | 5 | 6 | Website TypeScript strict mode + 5 correctness bugs fixed |
| v1.10 | 1 | 1 | Dashboard UX: buyer name + full timestamp in orders dropdown |
| v1.11 | 1 | 1 | GTM plugin fixed: broken gtag() shim removed, Consent Mode v2 added |
| v1.12 | 1 | 1 | Ad creation analytics gaps closed: 5 targeted fixes across 6 files |
| v1.13 | 1 | 1 | GTM hand-rolled plugin replaced with @saslavik/nuxt-gtm module |
| v1.14 | 1 | 1 | Dashboard GTM module installed; website + dashboard now consistent |
| v1.15 | 1 | 3 | Website SEO audit: OG/Twitter tags, 74+ URL replacements, noindex sweep, JSON-LD dedup, sitemap restructure |
| v1.16 | 3 | 4 | Website meta copy audit: 4 SEO bug fixes, canonical vocabulary enforced across all public pages, SERP copy rewritten |
| v1.17 | 2 | 3 | Security & Stability: server-enforced user role filter via strapi.db.query; production-only Sentry guard in all 7 entry points |
| v1.18 | 1 | 3 | Ad creation URL refactor: 5 dedicated wizard routes; wizard-guard middleware; per-page analytics; `?step=N` eliminated |
| v1.19 | 4 | 8 | Zoho CRM sync model: reliable HTTP client, 4 service methods, payment + publish event wiring |
| v1.20 | 5 | 5 | TypeScript any elimination: zero `any` across all Strapi services, utils, middlewares, seeders, and test files |
| v1.21 | 1 | 4 | Ad draft decoupling: `draft` field lifecycle, `publishAd()` helper, endpoint domain assignment, Strapi permission deploy step |
| v1.26 | 1 | 3 | Webpay receipt: 8-field on-screen receipt in /pagar/gracias; order-centric redirect; test scaffolds |
| v1.27 | 1 | 2 | GA4 ecommerce event chain completed: purchase() method + page wiring; flow discriminator; 12 Vitest tests |
| v1.28 | 1 | 2 | Logout store cleanup: `reset()` pattern for Composition API stores; `useLogout` composable; `clearAll` renamed |
| v1.29 | 2 | 3 | News Manager: Strapi article content type + dashboard CRUD UI; custom Markdown textarea with lucide icons |
| v1.30 | 4 | 8 | Blog Public Views: slug field, Article TS type, SCSS scaffolding, 7 blog components, /blog listing + detail pages, full SEO |
| v1.31 | 2 | 2 | Article Manager Improvements: source_url Strapi field, draft/publish toggle in FormArticle, source_url link on detail page |
| v1.32 | 1 | 1 | Gemini AI Service: GeminiService + POST /api/ia/gemini endpoint; SlackService pattern reused exactly; 4-min execution |
| v1.41 | 1 | 2 | Ad preview error handling: SSR-safe createError pattern, TDD controller fix |
| v1.42 | 1 | 1 | Session persistence: removed dead auth.populate joins causing setToken(null) on SSR |
| v1.43 | 1 | 1 | Cookie replacement: useStrapiAuth().logout() respects COOKIE_DOMAIN attribute |
| v1.44 | 5 | 9 | Google One Tap: Strapi endpoint + frontend plugin + composable rewrite + session bug fixes |

### Cumulative Quality

| Milestone | Tests | typeCheck | Zero-Dep Additions |
|-----------|-------|-----------|-------------------|
| v1.0 | none | false | 0 |
| v1.1 | none | true | 1 (vue-tsc) |
| v1.2 | none | true | 0 |
| v1.3 | utils (100% coverage) | true | 0 |
| v1.4 | utils (100% coverage) | true | 0 |
| v1.5 | utils (100% coverage) | true | 0 |
| v1.6 | utils (100% coverage) | true | 0 |
| v1.7 | utils (100% coverage) | true | 0 |
| v1.8 | utils (100% coverage) | true | 0 |
| v1.9 | utils (100% coverage) | true (website + dashboard) | 1 (vue-tsc for website) |
| v1.10 | utils (100% coverage) | true | 0 |
| v1.11 | utils (100% coverage) | true | 0 |
| v1.12 | utils (100% coverage) | true | 0 |
| v1.13 | utils (100% coverage) | true | 1 (@saslavik/nuxt-gtm) |
| v1.14 | utils (100% coverage) | true | 0 |
| v1.15 | utils (100% coverage) | true | 0 |
| v1.16 | utils (100% coverage) | true | 0 |
| v1.17 | utils + jest (strapi role controller) | true | 0 |
| v1.18 | utils + jest (strapi) | true | 1 (wizard-guard middleware) |
| v1.19 | utils + jest (zoho, pack, ad) | true | 0 |
| v1.20 | utils + jest (all payment tests) | true | 0 |
| v1.21 | utils + jest (payment + draft) | true | 0 |
| v1.26 | utils + jest (vitest for ResumeOrder + gracias.vue) | true | 0 |
| v1.27 | utils + vitest (useAdAnalytics — 12 tests) | true | 0 |
| v1.28 | utils + vitest (useLogout — 4 tests) | true | 0 |
| v1.29 | utils + vitest (unchanged) | true | 0 |
| v1.30 | utils + jest (slug lifecycle hooks — 6 tests) + vitest (unchanged) | true | 1 (marked for Markdown rendering) |
| v1.31 | utils + jest + vitest (unchanged) | true | 0 |
| v1.32 | utils + jest + vitest (unchanged) | true | 1 (@google/generative-ai) |
| v1.41 | utils + jest (findBySlug controller — 4 tests) + vitest | true | 0 |
| v1.42 | utils + jest + vitest (unchanged) | true | 0 |
| v1.43 | utils + jest + vitest (unchanged) | true | 0 |
| v1.44 | utils + jest (GoogleOneTapService 8 + controller 4) + vitest (composable 3 + plugin) | true | 1 (google-auth-library) |

### Top Lessons (Verified Across Milestones)

1. Keep Strapi as the single business logic layer — frontend stays stateless and swappable
2. Establish canonical types and patterns early; deferred type debt compounds across components
3. `typeCheck: true` catches regressions immediately — v1.2 TS18046 error caught in same commit cycle
4. Auto-import + utility files make codebase-wide refactors purely subtractive — remove inline, done
5. Pre-read component code before finalizing a plan's file list — prevents missed files and scope from prior commits
6. Explicit scope boundaries in per-task success criteria prevent unintended changes (e.g., UI labels vs route paths)
7. Reuse existing patterns over inventing new ones — the cron's `entityService.update(ad: null)` pattern applied directly to reject/ban with zero design work
8. Verify non-TypeScript file commits explicitly — MJML, SQL, config files may be silently skipped by executor agents
9. `useAsyncData` is the sole correct data-loading trigger in Nuxt pages — bare `await` before it causes double-fetch on SSR + hydration
10. Cache guards need both data-length check and timestamp — and always verify the store has `persist` or the guard is useless
11. Rename + update imports atomically — a file rename without updating imports leaves the codebase silently broken
12. Before implementing a new cron, audit existing ones for overlapping responsibility — duplicate crons waste a full implementation cycle
13. Verify the Nuxt ecosystem before hand-rolling a plugin — a maintained Nuxt 4-compatible module exists for most common integrations (GTM, analytics, etc.)
14. Fix structural/SSR bugs before authoring copy — a title double-suffix or SSR deferral bug makes copy partially invisible to crawlers regardless of content quality
15. Use `strapi.db.query` for server-enforced filters — the content-API sanitizer strips `filters[role]` for regular JWTs, making client-enforced role filtering bypassable
16. Gate Sentry (and all observability tools) on `NODE_ENV === 'production'` from day one — staging noise pollutes dashboards and costs money
17. Any middleware reading a localStorage-backed Pinia store must bail out on server with `if (import.meta.server) return;` — store is always empty on server (storage: undefined), causing false redirects
18. Pre-read all callers before changing a return type to `unknown` — every call site accessing a named property will break; a 2-min grep is cheaper than a TSC round-trip
19. TypeScript union narrowing doesn't work on optional property absence — when callers branch on shape, introduce a local interface + cast at the guard site rather than relying on union inference
20. `(global as unknown as { strapi: MockStrapi })` for Jest global mocks avoids conflict with `@strapi/types` global `var strapi: Strapi` declaration
21. Plan the full lifecycle of a new boolean field — adding `default: true` is not complete until the flip to `false` is also planned (who, when, where)
22. Endpoint domain belongs with the entity, not the trigger — `POST /api/ads/save-draft` (not `/api/payments/ad-draft`) because the result is an Ad
23. Strapi permission setup for new non-standard routes is a manual deploy-time step — document it explicitly in the plan
24. Check installed packages before adding new ones — `lucide-vue-next` was already present; EasyMDE was installed and immediately removed
25. Read AGENTS.md BEM rules and a peer component before writing form markup — modifier-scoped element classes (`form--x__field`) are wrong; use `form__group`, `form__label`, `form__control`
26. Enumerate all form fields explicitly in the plan — fields implied by the schema but not listed are frequently omitted in the first implementation pass
27. Infrastructure phases (types + SCSS) with no user-visible output unlock faster downstream phases — invest upfront, they pay off immediately
28. `cover: Media[]` has no direct `.url`; `gallery: GalleryItem[]` does — always pass gallery to display components; cover is for OG image metadata only
29. `useAsyncData(() => 'key-${param}')` lambda key is required for SSR cache isolation on dynamic routes — without the lambda, the key is evaluated once and all slug pages share the same cache entry
30. Always ask "what happens after save?" when adding a form field — `source_url` re-sync after update was a correctness requirement that was missed in planning
31. Check component signatures before choosing a display pattern — `CardInfo` only accepts plain strings; use the `card--info` CSS pattern directly when a sidebar block needs custom HTML (e.g., an `<a>` element)
32. Strapi v5 optional string fields return `null`, not `undefined` — type them as `string | null`; using `string | undefined` causes false positives on optional chaining guards
33. Name API routes by domain, not by provider — `POST /api/ia/gemini` today, `POST /api/ia/claude` tomorrow; the `ia` namespace is the stable abstraction layer regardless of which model powers it

## Milestone: v1.17 — Security & Stability

**Shipped:** 2026-03-07
**Phases:** 2 (40, 41) | **Plans:** 3 | **Timeline:** 1 day

### What Was Built
- Server-enforced Authenticated role filter on `GET /api/users` via `strapi.db.query` controller override — non-forgeable, N+1 eliminated, sort support added (Phase 40)
- TDD red-green for role filter controller: Jest unit tests committed before production code (Phase 40)
- `strapi-server.ts` reduced from 173 lines of commented-out code to 8 lines — minimal override pattern (Phase 40)
- Dashboard users table "Rol" column removed along with `populate:role` that the API was already stripping (Phase 40)
- Production-only Sentry guard applied to all 7 entry points across website, dashboard, and strapi (Phase 41)

### What Worked
- Research phase identified the exact root cause before planning: content-API sanitizer strips `filters[role]` — pointed directly to `strapi.db.query` as the solution
- TDD pattern (RED commit before GREEN) made the role filter verifiable without manual testing
- Phase 41 was purely mechanical once the 4 broken files were identified — execution in 2 min

### What Was Inefficient
- Phase 41 should have been caught earlier — Sentry `staging ||` condition and missing server guard were pre-existing bugs. A Sentry audit at v1.9 would have found these.
- Phase 39 (Spanish Default Language) was planned for this milestone but not executed — left pending for v1.18.

### Patterns Established
- `strapi.db.query` for role-enforced queries — bypasses content-API sanitizer, non-forgeable
- TDD RED: failing tests committed first, GREEN implementation in subsequent commit
- Production-only Sentry: `isProduction = process.env.NODE_ENV === 'production'`, `dsn = isProduction ? config.public.sentryDsn : undefined`
- Strapi plugin guard: `enabled: process.env.NODE_ENV === 'production'` unloads plugin entirely

### Key Lessons
1. **Server-enforce all security filters.** Client-side role filtering is bypassable — the only safe pattern is `strapi.db.query` with a server-looked-up role ID.
2. **Audit observability tools early.** Sentry with `enabled: true` in dev/staging costs money and pollutes dashboards — production-gate from initial setup.
3. **TDD is worth the commit overhead.** The failing-tests-first commit provides a verifiable contract before any production code exists.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: 2 (one per phase)
- Notable: Phase 41 was the fastest plan in the project (2 min, 4 files, purely mechanical)

---

## Milestone: v1.18 — Ad Creation URL Refactor

**Shipped:** 2026-03-08
**Phases:** 1 (42) | **Plans:** 3 | **Timeline:** ~1.5 hours
**Files changed:** 21 files, +1,525/-112 lines (apps/website) | **Requirements:** 11/11 complete ✓

### What Was Built
- 4 dedicated Nuxt pages (`datos-del-producto`, `datos-personales`, `ficha-de-producto`, `galeria-de-imagenes`) replacing `?step=N` query-param navigation — each page fires its own `stepView` analytics on mount
- `CreateAd.vue` converted from `router.push({ query: { step: N } })` to `stepRoutes` Record map + `router.push(path)`
- `index.vue` simplified — multi-step analytics watcher removed; step 1 analytics fire once on mount only
- `resumen.vue` back button corrected to `/anunciar/galeria-de-imagenes`
- `FormCreateThree.vue` debug `<pre>{{ user.value }}</pre>` PII leak removed
- `wizard-guard.ts` middleware added post-verification — prevents step skipping; client-only (`if (import.meta.server) return;`) to avoid SSR localStorage miss

### What Worked
- Phase split into 3 atomic plans (step pages / isolated fixes / CreateAd + index wiring) was exactly right — each plan was independently verifiable and had no cross-plan bleed
- Keeping `adStore.step` as an internal ordering reference (not the source of truth) while making URL the navigation source of truth created a clean separation of concerns
- The `stepRoutes` Record map pattern is explicit, type-safe, and avoids magic strings — replaces scattered `router.push({ query })` calls throughout `CreateAd.vue`
- `onMounted` (not a watcher) for analytics + step sync was the correct trigger — each page mounts fresh on navigation, so mount fires exactly once per step entry

### What Was Inefficient
- The `wizard-guard.ts` middleware was not in the original requirements (REQUIREMENTS.md explicitly said "Step access guard — Not requested") but was correctly added post-verification as a UX improvement. The scope expansion was small and low-risk, but surfaced an SSR bug that required a second commit (`if (import.meta.server) return;`). Had the guard been in scope from the start, the SSR edge case would have been part of the plan's interface spec.
- The SSR bug in the guard (`adStore` uses `localStorage` → storage is `undefined` on server → store always empty → guard always redirected) is a class of bug that applies to any client-only middleware using a persisted store. This pattern should be in the plan template for any middleware that reads a localStorage-backed store.

### Patterns Established
- **`stepRoutes` Record map pattern**: `const stepRoutes: Record<number, string> = { 2: '/anunciar/datos-del-producto', ... }` — explicit, type-safe, no magic strings; use this for any wizard with numbered steps
- **Per-page analytics**: each wizard step page owns its own `stepView` in `onMounted` — no centralized watcher; avoids overcounting and couples analytics to the correct page boundary
- **`if (import.meta.server) return;` as first line of any client-only middleware** that reads a localStorage-backed store — server-side the store is always empty (storage: undefined), so any guard based on store state must be client-only
- **Step page structure**: `<ClientOnly> > div.step--N > FormCreateN` — consistent structure, `middleware: ["auth", "wizard-guard"]`, `useSeoMeta({ robots: "noindex, nofollow" })`

### Key Lessons
1. **SSR guard is mandatory for any middleware reading a localStorage-backed store.** The `adStore` uses `persist` with `storage: localStorage`, which means `typeof window !== "undefined"` guard returns `undefined` storage on server — the store initializes empty. Any middleware checking store state must bail out immediately on server with `if (import.meta.server) return;`.
2. **Post-verification scope additions need their own plan.** The `wizard-guard.ts` was added after phase verification — it was the right decision, but it discovered an SSR edge case not in the original plan. Scope additions mid-flow benefit from a lightweight "addendum plan" with explicit interface spec to catch these edge cases upfront.
3. **URL-as-source-of-truth + store-as-internal-reference is the cleanest wizard pattern.** The store step number syncs on mount (what page am I on?) rather than driving navigation (where do I go next?). This eliminates the `route.query.step` sync complexity entirely.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: ~4 (plan-phase × 1, execute-phase × 3 plans, post-verification wizard-guard)
- Notable: One of the cleanest executions — zero deviations in Plans 01 and 02; Plan 03 had a minor lang="ts" addition. Only friction was the wizard-guard SSR bug found post-verification.

---

## Milestone: v1.34 — LightBoxArticles

**Shipped:** 2026-03-13
**Phases:** 2 (073–074) | **Plans:** 4 | **Quick Tasks:** 2 (QT-27, QT-28)

### What Was Built
- `TavilyService` in Strapi + `POST /api/search/tavily` — news search backend with typed results
- `LightBoxArticles.vue` — 3-step dashboard lightbox: search → edit prompt → generate + save article draft
- `search.store.ts` enhanced with Tavily cache by query string (Swal reuse-or-refresh on hit)
- `articles.store.ts` — new session-only store caching AI responses by source URL + duplicate `source_url` guard before Strapi POST
- Groq `llama-3.3-70b-versatile` via `POST /api/ia/groq` with `response_format: json_object` as primary article generator
- DeepSeek and Gemini endpoints also scaffolded (`/api/ia/deepseek`, `/api/ia/gemini`)

### What Worked
- Tavily `snippet` field already contains article content — no browser fetch to source URL needed; eliminated a whole fetch layer
- Quick tasks (QT-27, QT-28) were the right tool for iterative fixes to the generation flow — kept planned phases clean
- Swal guard pattern (check before API call, inform user, let them choose) applied consistently for cache hits, empty content, AI errors, and duplicates

### What Was Inefficient
- Spent time on browser-side `fetch(item.link)` approach before realizing Tavily already provides content in `snippet`; this should have been caught in research
- Rate limit friction: Gemini (5 RPM) → DeepSeek (402 Payment Required) → Groq; three providers before a working solution; a quick API capability check upfront would have saved iterations
- Groq returned JSON wrapped in markdown code fences despite prompt instructions — `response_format: json_object` solved it but required a debug cycle

### Patterns Established
- **`response_format: { type: "json_object" }` in Groq requests** — always enforce this when expecting JSON; eliminates code fence wrapping entirely
- **Check Tavily `snippet`/`content` before fetching source URLs** — Tavily already extracts article text; browser-side scraping is last resort, not first
- **Session-only store for AI response cache** — no `persist`; session cache avoids redundant calls without stale data risk
- **Duplicate guard pattern**: `GET /collection?filters[field][$eq]=value` before POST → Swal with "go to edit" option if found

### Key Lessons
1. **Evaluate AI provider rate limits before planning.** Gemini free tier (5 RPM) is insufficient for iterative dev. Groq (30 RPM free) is the right default for development workflows.
2. **Read the third-party API response shape before planning the fetch layer.** Tavily returns `content` (extracted article text) — no browser fetch needed. Should be caught in discovery.
3. **`response_format: json_object` is non-negotiable for JSON-only AI endpoints.** LLMs add markdown wrappers regardless of prompt instructions; enforce at the API level.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: ~3 (plan-phase × 1, execute-phase × 1, iterative quick tasks × many)
- Notable: High iteration count on AI provider selection; most context spent debugging rate limits and JSON parsing rather than core feature work

---

## Milestone: v1.35 — Gift Reservations to Users

**Shipped:** 2026-03-13
**Phases:** 2 (075–076) | **Plans:** 4 | **Timeline:** Same-day delivery (~90 min total)

### What Was Built
- `GET /api/users/authenticated` — custom users-permissions plugin route with `strapi.db.query` server-side role filter returning only `{ id, firstName, lastName }`
- `POST /api/ad-reservations/gift` and `POST /api/ad-featured-reservations/gift` — create N reservation records for any authenticated user with MJML email notification
- `gift-reservation.mjml` email template in Spanish with `name`, `quantity`, `type` variables
- `LightboxGift.vue` — reusable controlled lightbox (quantity input + searchable user select + Swal confirm + dynamic POST to any `/gift` endpoint)
- "Regalar Reservas" / "Regalar Reservas Destacadas" buttons wired into both reservation detail pages — end-to-end gift flow complete

### What Worked
- Existing patterns transferred cleanly: `strapi.db.query` role filter (from v1.17), controlled lightbox pattern (from LightboxRazon/LightboxArticles), non-fatal email wrappers (from free-ad and reject/ban flows)
- TDD cycle (RED-GREEN commit pattern) for `getAuthenticatedUsers` worked well — 3 test cases before implementation, all green after
- `endpoint` prop on `LightboxGift.vue` was the right abstraction — single component served both reservation types without branching
- Same-day delivery across both phases with zero blockers or deviations

### What Was Inefficient
- Initial `FormGift` used a two-field manual input pattern (firstName + lastName as separate text fields) before being replaced by `InputAutocomplete.vue` with server-side search — this was a quick-task fix post-execution, not caught in planning
- `InputAutocomplete.vue` was added as a quick task rather than planned in the original phase — a more thorough PLAN.md would have specified the UX for user selection

### Patterns Established
- **Gift endpoint pattern**: custom Strapi controller with `strapi.db.query` user lookup before bulk record creation + non-fatal MJML email in inner try/catch
- **`giftOpen` ref pattern**: `ref(false)` toggled by button click, reset on both `@close` and `@gifted` — ensures lightbox closes on cancel and success
- **`LightboxGift` after `BoxContent`**: placed inside root div after closing `BoxContent` tag — least invasive, no new wrapper components

### Key Lessons
1. **Plan the user-facing input component explicitly.** "Searchable user select" in the requirement description was underspecified — the plan should have spelled out the component approach (server-side search with debounce vs. client-side filter of preloaded list).
2. **Reuse via `endpoint` prop beats per-type components.** A single `LightboxGift.vue` with a dynamic endpoint handles all gift types cleanly — this pattern should be the default for any future "action on a specific entity" lightboxes.
3. **Non-fatal email is the right default for admin-triggered gifts.** Gift creation is the primary action; email is a side effect. Wrapping in inner try/catch prevents email misconfiguration from blocking the main flow.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: ~2 (execute-phase × 2, quick tasks × 1)
- Notable: Fastest milestone to date — small scope, clear patterns to follow, zero external API rate limit issues

## Milestone: v1.36 — Two-Step Login Verification

**Shipped:** 2026-03-14
**Phases:** 2 (077–078) | **Plans:** 6 | **Timeline:** 1 day (~5 hours total)
**Files changed:** 26 files, +1,599 / -163 lines

### What Was Built
- `verification-code` Strapi content type (5 fields: userId, code, expiresAt, attempts, pendingToken); `overrideAuthLocal` intercepts `POST /api/auth/local` — valid credentials now return `{ pendingToken, email }` with no JWT exposed
- `POST /api/auth/verify-code` (15-min expiry, max 3 attempts, single-use → issues JWT on success); `POST /api/auth/resend-code` (60s rate limit, regenerates code + resends email)
- `verification-code.mjml` Spanish email template; daily 4 AM cleanup cron via `deleteMany`
- Dashboard `/auth/verify-code` page with extracted `FormVerifyCode.vue` component — 6-digit auto-submit, 60s countdown, `setToken(jwt)` + `fetchUser()`, manager role check, Swal errors
- Website `FormLogin.vue` and `/login/verificar` implemented (code present; phase 079 not formally executed)
- Post-ship bug fix: OAuth Google login triggered 2-step flow — resolved by `ctx.method === "GET"` guard in `overrideAuthLocal`

### What Worked
- Strapi plugin controller override pattern (higher-order function) transferred cleanly from v1.17 user-controller work
- `useStrapiClient()` direct POST was the correct call immediately — no time lost trying to force `useStrapiAuth().login()` to work with non-JWT responses
- Component extraction to `FormVerifyCode.vue` was the right call — page stayed clean, resend button could live in `auth__form__help` following existing auth page conventions
- TDD cycle for `authController.test.ts` (RED → GREEN) provided confidence in the verify/resend logic before integration
- The `auth.callback` handler insight (same handler for both email/password and OAuth) was critical — understanding Strapi internals prevented a deeper bug from reaching production

### What Was Inefficient
- OAuth bug discovered post-execution during manual testing — the `auth.callback` dual-path behavior (handles both `POST /auth/local` and `GET /auth/:provider/callback`) was not documented in the phase plan, so the guard was not added upfront
- VSTEP-13 to VSTEP-16 (website verify flow) — the code was implemented but phase 079 was never formally planned and executed; requirements stayed pending at milestone close
- Multiple Strapi wiring fixes needed mid-execution: plugin route push being silently ignored, `info.pluginName` required for handler resolution, factory wrapper needed for controller overrides — each required an iteration cycle

### Patterns Established
- **`auth.callback` dual-path guard**: `overrideAuthLocal` must check `ctx.method === "GET"` to bypass OAuth callbacks — `auth.callback` handles both `POST /auth/local` and `GET /auth/:provider/callback`
- **`pendingToken` handoff**: `useState<string>('pendingToken')` set in login form, consumed in verify-code page — SSR-safe transient state between auth pages
- **`useStrapiClient()` for non-JWT responses**: when backend returns a shape that doesn't include `{ jwt }`, bypass `useStrapiAuth().login()` entirely
- **`onMounted` guard (not middleware) for pre-auth pages**: JWT not set yet when verify-code page mounts — guard on `pendingToken` emptiness is the correct signal
- **Strapi v5 plugin controller override**: `plugin.controllers.auth` is a factory — must wrap the factory itself, not set properties on it directly; override returns modified instance from factory call

### Key Lessons
1. **Document Strapi route handler sharing in phase plans.** `auth.callback` handles multiple routes — this should have been noted in phase 077 planning so the OAuth guard was included upfront, not discovered in testing.
2. **"Code exists" ≠ "phase complete."** VSTEP-13–16 had implementation in place but the phase was never formally planned or executed. For future milestones: if code is written organically, create a minimal PLAN.md + SUMMARY.md to capture the work formally.
3. **Strapi plugin wiring quirks accumulate.** Three separate wiring issues (route push ignored, pluginName missing, factory pattern) each required a debug cycle. A dedicated Strapi plugin cheatsheet in AGENTS.md would reduce future iteration.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: ~4 (execute-phase × 2, quick tasks × 3, post-ship bug fix × 1)
- Notable: Post-ship OAuth bug required immediate hotfix — discovered via manual testing by user. The `ctx.method` check was the simplest possible fix (5 lines).

## Milestone: v1.37 — Email Authentication Flows

**Shipped:** 2026-03-14
**Phases:** 4 (079–082) | **Plans:** 6 | **Timeline:** 1 day (~6 hours total)
**Files changed:** 27 files, +1,550 / -85 lines

### What Was Built
- Verification email copy fix: "5 minutos" → "15 minutos" in `verification-code.mjml`
- `overrideForgotPassword` controller fully replacing Strapi's built-in — sends branded `reset-password.mjml`; routes to website or dashboard reset page based on `context` field in POST body; `DASHBOARD_URL` env var drives dashboard URL
- `FormRegister.vue` JWT guard (`if (response.jwt)`) prevents `setToken(undefined)` call in email-confirmation mode; redirects to `/registro/confirmar` using `useState('registrationEmail')` for cross-page handoff
- `/registro/confirmar` page (website): displays email, resend button + 60s countdown, redirects to `/registro` on empty state
- `FormLogin.vue` (website + dashboard): unconfirmed-user error now shows inline resend section with `POST /auth/send-email-confirmation` call; replaces generic Swal for this error path
- Idempotent migration seeder (`user-confirmed-migration.ts`) — ORM `findMany` unconfirmed → early return if 0 → `updateMany`; registered in cron-runner with far-future `0 0 1 1 *` rule (manual-trigger only)
- Production DB migrated: all users `confirmed=true`; Strapi Admin Panel: `email_confirmation: ON`, `email_confirmation_redirection: https://waldo.click/login`; smoke-test passed (all 5 checks)

### What Worked
- Phase sequencing rationale (079 → 080 → 081 → 082) was well-defined upfront and held — no ordering issues during execution
- `overrideForgotPassword` was a pure replacement (not a wrap) — correct call; wrapping would have sent two emails per request
- Native Strapi `POST /api/auth/send-email-confirmation` eliminated the need for any custom resend backend code — correct zero-code call
- DB migration hard gate (count = 0 before toggle) enforced discipline — zero lockout risk on production flip
- `useState('registrationEmail')` as transient cross-page state was immediately obvious given `pendingToken` precedent from v1.36

### What Was Inefficient
- Dashboard "Recuperar contraseña" reCAPTCHA bug discovered during v1.37 smoke testing — pre-existing issue not caught in v1.36; adds tech debt to address in a future milestone
- Phase 079 was a carry-forward from v1.36 with code already written; the formal plan was minimal (1 plan, MJML copy fix only); bundling it with a larger milestone wastes a phase slot on a trivial change

### Patterns Established
- **`overrideForgotPassword` as full replacement**: never wrap Strapi's built-in forgotPassword — always fully replace; calling original + custom sends two emails
- **`context` field in POST body for routing**: query params are lost after form submit redirect; body field survives the round-trip
- **`if (response.jwt)` guard before `setToken()`**: mandatory whenever a Strapi endpoint can return a response without a JWT (e.g., email-confirmation mode)
- **Migration seeder pattern**: `findMany` first (early return if 0) → `updateMany`; register in cron-runner with far-future rule; never in APP_RUN_SEEDERS (must be manual-only)
- **DB migration hard gate before irreversible toggle**: always verify count = 0 before flipping `email_confirmation: ON`

### Key Lessons
1. **Surface pre-existing bugs in smoke-test gates.** The dashboard reCAPTCHA bug was pre-existing but was only discovered during this milestone's smoke test. Phase plans for frontend changes should include a quick regression pass on adjacent auth forms.
2. **Carry-forwards inflate phase count.** Phase 079 was a single MJML copy fix carried over from v1.36. Future milestones should either ship these immediately (quick task) or formally fold them into the originating milestone.
3. **Production config gates (Admin Panel toggles) belong in plans.** The two human-action checkpoints (DB migration + Admin Panel toggle) in phase 082 were well-structured; this pattern should be the default for any irreversible production configuration change.

### Cost Observations
- Model mix: ~100% sonnet
- Sessions: ~3 (execute-phase × 2 with checkpoints, complete-milestone × 1)
- Notable: The two human-gate checkpoints in phase 082 were smooth — checkpoint protocol worked exactly as designed; continuation agent correctly resumed from Task 3 after user confirmed Task 2.
