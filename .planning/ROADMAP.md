# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** — Phases 3-6 (shipped 2026-03-05)
- ✅ **v1.2 Double-Fetch Cleanup** — Phases 7-8 (shipped 2026-03-05)
- ✅ **v1.3 Utility Extraction** — Phases 9-11 (shipped 2026-03-06)
- ✅ **v1.4 URL Localization** — Phases 12-15 (shipped 2026-03-06)
- ✅ **v1.5 Ad Credit Refund** — Phases 16-17 (shipped 2026-03-06)
- ✅ **v1.6 Website API Optimization** — Phases 18-19 (shipped 2026-03-06)
- 🚧 **v1.7 Cron Reliability** — Phases 20-23 (in progress)

## Phases

<details>
<summary>✅ v1.1 Dashboard Technical Debt Reduction (Phases 3-6) — SHIPPED 2026-03-05</summary>

Phases 3-6 completed in v1.1: double-fetch + pagination isolation, Sentry/dead-code cleanup,
AdsTable generic component, canonical domain types + typeCheck, Strapi aggregate endpoints.
Archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ v1.2 Double-Fetch Cleanup (Phases 7-8) — SHIPPED 2026-03-05</summary>

Phases 7-8 completed in v1.2: eliminated redundant `onMounted` from all 10 non-ads dashboard
components; `watch({ immediate: true })` is now sole data-loading trigger across the entire dashboard.
Archive: `.planning/milestones/v1.2-ROADMAP.md`

</details>

<details>
<summary>✅ v1.3 Utility Extraction (Phases 9-11) — SHIPPED 2026-03-06</summary>

Phases 9-11 completed in v1.3: date, price, and string utilities extracted into `app/utils/`; all
51 inline duplicate function definitions eliminated across the dashboard.
Archive: `.planning/milestones/v1.3-ROADMAP.md`

</details>

<details>
<summary>✅ v1.4 URL Localization (Phases 12-15) — SHIPPED 2026-03-06</summary>

Phases 12-15 completed in v1.4: all dashboard URL segments renamed to English; 301 redirects added
for legacy Spanish paths; `nuxt typecheck` passes with zero errors.
Archive: `.planning/milestones/v1.4-ROADMAP.md`

</details>

<details>
<summary>✅ v1.5 Ad Credit Refund (Phases 16-17) — SHIPPED 2026-03-06</summary>

**Milestone Goal:** When an ad is rejected or banned, return the ad reservation and featured reservation credits to the user, and notify them via email that their credits were refunded.

- [x] **Phase 16: Credit Refund Logic** — Wired reservation-freeing into `rejectAd()` and `bannedAd()` (completed 2026-03-06)
- [x] **Phase 17: Email Notification Update** — Updated `ad-rejected.mjml` and `ad-banned.mjml` with conditional credit-return messaging (completed 2026-03-06)

Archive: `.planning/milestones/v1.5-ROADMAP.md`

</details>

<details>
<summary>✅ v1.6 Website API Optimization (Phases 18-19) — SHIPPED 2026-03-06</summary>

**Milestone Goal:** Eliminate double-fetches and redundant API calls in the website, applying the same patterns already established in the dashboard (v1.2).

- [x] **Phase 18: Page Double-Fetch Fixes** — Fixed `preguntas-frecuentes.vue` (2 calls → 1); added `GET /api/ads/me/counts` Strapi endpoint; `mis-anuncios.vue` reduced from 6 API calls → 2 (completed 2026-03-06)
- [x] **Phase 19: Store Cache Guards & Component Cleanup** — 30-min timestamp-based cache guards added to `packs.store.ts`, `conditions.store.ts`, `regions.store.ts`; redundant `loadCommunes()` removed from `FormCreateThree.vue` (completed 2026-03-06)

Archive: `.planning/milestones/v1.6-ROADMAP.md`

</details>

### 🚧 v1.7 Cron Reliability (In Progress)

**Milestone Goal:** Fix the three non-functional cron jobs (userCron, backupCron, cleanupCron) and add English documentation comments throughout all cron files.

- [x] **Phase 20: user.cron Fix & Docs** - Fix multi-ad deactivation bug, remove unused import, add English comments (completed 2026-03-06)
- [x] **Phase 21: backup.cron Fix & Docs** - Fix Strapi v5 config path, redact password from logs, add English comments (completed 2026-03-06)
- [x] **Phase 22: cleanup.cron Fix & Docs** - Fix folder filter query for Strapi v5 compatibility, add English comments (completed 2026-03-06)
- [ ] **Phase 23: ad.cron + cron-tasks Docs** - Add English comments to ad.cron.ts and cron-tasks.ts (no bug fixes needed)

## Phase Details

### Phase 20: user.cron Fix & Docs
**Goal**: `user.cron.ts` correctly deactivates all expired free ads per user (not just the first), has no unused imports, and is fully documented in English
**Depends on**: Nothing (first phase of milestone)
**Requirements**: CRON-01, CRON-05, DOC-03
**Success Criteria** (what must be TRUE):
  1. The user deactivation loop iterates over all expired ads per user, not short-circuiting after the first
  2. `PaymentUtils` import no longer appears in `user.cron.ts`
  3. Each logical block in `user.cron.ts` has an English comment explaining multi-ad flow, user deduplication, reservation restore logic, and the 3-reservation guarantee
**Plans**: 1 plan

Plans:
- [ ] 20-01-PLAN.md — Fix multi-ad deactivation loop, remove PaymentUtils import, add English comments

### Phase 21: backup.cron Fix & Docs
**Goal**: `backup.cron.ts` reads the database config via the correct Strapi v5 path, never logs the DB password in plaintext, and is fully documented in English
**Depends on**: Phase 20
**Requirements**: CRON-02, CRON-03, DOC-05
**Success Criteria** (what must be TRUE):
  1. `backup.cron.ts` uses `strapi.config.get('database').connection` (or equivalent correct Strapi v5 path) to access DB config — no hardcoded or incorrect path
  2. The shell command logged before execution has the password field redacted or omitted entirely
  3. Each logical block in `backup.cron.ts` has an English comment explaining config path, command construction, compression, rotation, and password-redaction approach
**Plans**: 1 plan

Plans:
- [ ] 21-01-PLAN.md — Fix Strapi v5 config path, redact DB password from logs, add English comments

### Phase 22: cleanup.cron Fix & Docs
**Goal**: `cleanup.cron.ts` correctly retrieves files from the `ads` folder using a Strapi v5-compatible query and is fully documented in English
**Depends on**: Phase 21
**Requirements**: CRON-04, DOC-04
**Success Criteria** (what must be TRUE):
  1. The folder filter query in `cleanup.cron.ts` returns files from the `ads` folder (does not return an empty set due to `plugin::upload.file` relation incompatibility)
  2. The orphan detection logic runs against the correctly scoped set of files
  3. Each logical block in `cleanup.cron.ts` has an English comment explaining the audit-only approach, folder query strategy, and orphan detection logic
**Plans**: 1 plan

Plans:
- [ ] 22-01-PLAN.md — Fix folder filter query (two-step folderPath resolution), translate all Spanish text to English

### Phase 23: ad.cron + cron-tasks Docs
**Goal**: `ad.cron.ts` and `cron-tasks.ts` have English comments so all five cron files are uniformly documented
**Depends on**: Phase 22
**Requirements**: DOC-01, DOC-02
**Success Criteria** (what must be TRUE):
  1. `cron-tasks.ts` has English comments for each registered job documenting purpose, schedule expression, and timezone
  2. `ad.cron.ts` has English comments explaining deduplication via `remainings`, deactivation on zero days, and the daily report email
**Plans**: 1 plan

Plans:
- [ ] 23-01-PLAN.md — Add English comments to ad.cron.ts and cron-tasks.ts

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 20. user.cron Fix & Docs | 1/1 | Complete   | 2026-03-06 | - |
| 21. backup.cron Fix & Docs | 1/1 | Complete   | 2026-03-06 | - |
| 22. cleanup.cron Fix & Docs | 1/1 | Complete   | 2026-03-06 | - |
| 23. ad.cron + cron-tasks Docs | v1.7 | 0/1 | Not started | - |
