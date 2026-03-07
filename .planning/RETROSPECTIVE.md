# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

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

## Milestone: v1.2 — Double-Fetch Cleanup

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
