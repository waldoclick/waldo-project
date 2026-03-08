# Roadmap: Waldo Project

## Milestones

- ✅ **v1.1 Dashboard Technical Debt Reduction** — Phases 3-6 (shipped 2026-03-05)
- ✅ **v1.2 Double-Fetch Cleanup** — Phases 7-8 (shipped 2026-03-05)
- ✅ **v1.3 Utility Extraction** — Phases 9-11 (shipped 2026-03-06)
- ✅ **v1.4 URL Localization** — Phases 12-15 (shipped 2026-03-06)
- ✅ **v1.5 Ad Credit Refund** — Phases 16-17 (shipped 2026-03-06)
- ✅ **v1.6 Website API Optimization** — Phases 18-19 (shipped 2026-03-06)
- ✅ **v1.7 Cron Reliability** — Phases 20-23 (shipped 2026-03-06)
- ✅ **v1.8 Free Featured Reservation Guarantee** — Phase 24 (shipped 2026-03-07)
- ✅ **v1.9 Website Technical Debt** — Phases 25-29 (shipped 2026-03-07)
- ✅ **v1.10 Dashboard Orders Dropdown UI** — Phase 30 (shipped 2026-03-07)
- ✅ **v1.11 GTM / GA4 Tracking Fix** — Phase 31 (shipped 2026-03-07)
- ✅ **v1.12 Ad Creation Analytics Gaps** — Phase 32 (shipped 2026-03-07)
- ✅ **v1.13 GTM Module Migration** — Phase 33 (shipped 2026-03-07)
- ✅ **v1.14 GTM Module: Dashboard** — Phase 34 (shipped 2026-03-07)
- ✅ **v1.15 Website SEO Audit** — Phase 35 (shipped 2026-03-07)
- ✅ **v1.16 Website Meta Copy Audit** — Phases 36-38 (shipped 2026-03-07)
- ✅ **v1.17 Security & Stability** — Phases 40-41 (shipped 2026-03-07)
- ✅ **v1.18 Ad Creation URL Refactor** — Phase 42 (shipped 2026-03-08)
- ✅ **v1.19 Zoho CRM Sync Model** — Phases 43-46 (shipped 2026-03-08)

## Phases

<details>
<summary>✅ v1.1–v1.16 (Phases 3-38) — SHIPPED</summary>

All prior phases shipped. See `.planning/milestones/` for archived roadmaps.

</details>

<details>
<summary>✅ v1.17 — Security & Stability (Phases 40-41) — SHIPPED 2026-03-07</summary>

- [x] **Phase 40: Users Filter Authenticated** — Server-enforced Authenticated role filter via strapi.db.query; N+1 eliminated; TDD (completed 2026-03-07)
- [x] **Phase 41: Sentry Production-Only** — Production-only guard in all 7 Sentry entry points across website, dashboard, strapi (completed 2026-03-07)

</details>

<details>
<summary>✅ v1.18 — Ad Creation URL Refactor (Phase 42) — SHIPPED 2026-03-08</summary>

- [x] **Phase 42: Ad Creation URL Refactor** — Replace `?step=N` query-param navigation with dedicated per-step Spanish routes; wizard-guard middleware added; analytics preserved; `nuxt typecheck` passes with zero errors (completed 2026-03-08)

</details>

<details>
<summary>✅ v1.19 — Zoho CRM Sync Model (Phases 43-46) — SHIPPED 2026-03-08</summary>

- [x] **Phase 43: Zoho Service Reliability** — Fix token refresh (401 interceptor), fix auth header prefix (`Zoho-oauthtoken`), isolate tests with axios-mock-adapter, add env vars to .env.example (completed 2026-03-08)
- [x] **Phase 44: Zoho Service Layer** — `createDeal()`, `updateContactStats()`, `createLead()` (Lead_Status: New), `createContact()` (counters init to 0) (completed 2026-03-08)
- [x] **Phase 45: Payment Event Wiring** — `pack_purchased` → Deal + Contact stats (await); `ad_paid` → Deal + Contact stats (floating promise) (completed 2026-03-08)
- [x] **Phase 46: Ad Published Event Wiring** — `approveAd()` → `Ads_Published__c` + `Last_Ad_Posted_At__c`; first-publish guard prevents double-counting (completed 2026-03-08)

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 3-34 | v1.1–v1.14 | All | Complete | 2026-03-05 to 2026-03-07 |
| 35. Website SEO Audit | v1.15 | 3/3 | Complete | 2026-03-07 |
| 36. SEO Bug Fixes | v1.16 | 1/1 | Complete | 2026-03-07 |
| 37. Dynamic Page Copy | v1.16 | 1/1 | Complete | 2026-03-07 |
| 38. Static Page Copy | v1.16 | 2/2 | Complete | 2026-03-07 |
| 40. Users Filter Authenticated | v1.17 | 2/2 | Complete | 2026-03-07 |
| 41. Sentry Production-Only | v1.17 | 1/1 | Complete | 2026-03-07 |
| 42. Ad Creation URL Refactor | v1.18 | 3/3 | Complete | 2026-03-08 |
| 43. Zoho Service Reliability | v1.19 | 2/2 | Complete | 2026-03-08 |
| 44. Zoho Service Layer | v1.19 | 2/2 | Complete | 2026-03-08 |
| 45. Payment Event Wiring | v1.19 | 2/2 | Complete | 2026-03-08 |
| 46. Ad Published Event Wiring | v1.19 | 1/1 | Complete | 2026-03-08 |
