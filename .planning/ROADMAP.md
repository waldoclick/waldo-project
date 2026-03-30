# Roadmap: Waldo Project

## Milestones

- ✅ **v1.46 PRO Subscriptions** — Phases 102–106 (shipped 2026-03-29). See `.planning/milestones/v1.46-ROADMAP.md`
- ✅ **v1.45 User Onboarding** — Phases 099–101 (shipped 2026-03-20). See `.planning/milestones/v1.45-ROADMAP.md`
- ✅ **v1.44 Google One Tap Sign-In** — Phases 094–098 (shipped 2026-03-19). See `.planning/milestones/v1.44-ROADMAP.md`
- ✅ **v1.43 Cross-App Session Replacement** — Phase 095 (shipped 2026-03-19). See `.planning/milestones/v1.43-ROADMAP.md`
- ✅ **v1.42 Dashboard Session Persistence** — Phase 094 (shipped 2026-03-18). See `.planning/milestones/v1.42-ROADMAP.md`
- ✅ **v1.41 Ad Preview Error Handling** — Phase 093 (shipped 2026-03-18). See `.planning/milestones/v1.41-ROADMAP.md`
- ⛔ **v1.25 Unified Checkout** — forcibly closed 2026-03-09. See `.planning/milestones/v1.25-ROADMAP.md`
- ✅ **v1.26 Mostrar comprobante Webpay** — Phase 060 (shipped 2026-03-11). See `.planning/milestones/v1.26-ROADMAP.md`
- ✅ **v1.27 Reparar eventos GA4 ecommerce** — Phase 061 (shipped 2026-03-12). See `.planning/milestones/v1.27-ROADMAP.md`
- ✅ **v1.28 Logout Store Cleanup** — Phase 062 (shipped 2026-03-12). See `.planning/milestones/v1.28-ROADMAP.md`
- ✅ **v1.29 News Manager** — Phases 063–064 (shipped 2026-03-12). See `.planning/milestones/v1.29-ROADMAP.md`
- ✅ **v1.30 Blog Public Views** — Phases 065–068 (shipped 2026-03-13). See `.planning/milestones/v1.30-ROADMAP.md`
- ✅ **v1.31 Article Manager Improvements** — Phases 069–070 (shipped 2026-03-13). See `.planning/milestones/v1.31-ROADMAP.md`
- ✅ **v1.32 Gemini AI Service** — Phase 071 (shipped 2026-03-13). See `.planning/milestones/v1.32-ROADMAP.md`
- ✅ **v1.33 Anthropic Claude AI Service** — Phase 072 (shipped 2026-03-13). See `.planning/milestones/v1.33-ROADMAP.md`
- ✅ **v1.34 LightBoxArticles** — Phases 073–074 (shipped 2026-03-13). See `.planning/milestones/v1.34-ROADMAP.md`
- ✅ **v1.35 Gift Reservations to Users** — Phases 075–076 (shipped 2026-03-13). See `.planning/milestones/v1.35-ROADMAP.md`
- ✅ **v1.36 Two-Step Login Verification** — Phases 077–078 (shipped 2026-03-14). See `.planning/milestones/v1.36-ROADMAP.md`
- ✅ **v1.37 Email Authentication Flows** — Phases 079–082 (shipped 2026-03-14). See `.planning/milestones/v1.37-ROADMAP.md`
- ✅ **v1.38 GA4 Analytics Audit & Implementation** — Phases 083–085 (shipped 2026-03-14). See `.planning/milestones/v1.38-ROADMAP.md`
- ✅ **v1.39 Unified API Client** — Phases 089–090 (shipped 2026-03-15). See `.planning/milestones/v1.39-ROADMAP.md`
- ✅ **v1.40 Shared Authentication Session** — Phases 091–092 (shipped 2026-03-16). See `.planning/milestones/v1.40-ROADMAP.md`

## Phases

<details>
<summary>✅ v1.46 PRO Subscriptions (Phases 102–106) — SHIPPED 2026-03-29</summary>

- [x] Phase 102: Oneclick Service + Inscription Flow (2/2 plans) — completed 2026-03-20
- [x] Phase 103: Monthly Charging Cron (2/2 plans) — completed 2026-03-20
- [x] Phase 103.1: Remove pro boolean (INSERTED) (2/2 plans) — completed 2026-03-21
- [x] Phase 104: Cancellation + Account Management (2/2 plans) — completed 2026-03-21
- [x] Phase 105: PRO subscription checkout page (3/3 plans) — completed 2026-03-21
- [x] Phase 106: Registration form age and terms checkboxes (2/2 plans) — completed 2026-03-29

</details>

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 102. Oneclick Service + Inscription Flow | v1.46 | 2/2 | Complete | 2026-03-20 |
| 103. Monthly Charging Cron | v1.46 | 2/2 | Complete | 2026-03-20 |
| 103.1. Remove pro boolean (INSERTED) | v1.46 | 2/2 | Complete | 2026-03-21 |
| 104. Cancellation + Account Management | v1.46 | 2/2 | Complete | 2026-03-21 |
| 105. PRO subscription checkout page | v1.46 | 3/3 | Complete | 2026-03-21 |
| 106. Registration form age and terms checkboxes | v1.46 | 2/2 | Complete | 2026-03-29 |

### Phase 107: Dashboard reCAPTCHA validation on all POST/PUT/DELETE routes

**Goal:** Protect every mutating API call in the dashboard with reCAPTCHA v3, matching the website's existing pattern. Update server-side guard from allowlist (3 auth routes) to method-based (all POST/PUT/DELETE), add useApiClient composable, and migrate all 19+ call sites.
**Requirements**: [RCP-107-01, RCP-107-02, RCP-107-03, RCP-107-04, RCP-107-05, RCP-107-06, RCP-107-07, RCP-107-08]
**Depends on:** Phase 106
**Plans:** 4/4 plans complete

Plans:
- [x] 107-01-PLAN.md — Foundation: server guard + useApiClient composable + tests
- [x] 107-02-PLAN.md — Migrate useStrapiClient direct calls (auth forms + 4 components)
- [x] 107-03-PLAN.md — Migrate useStrapi SDK calls (6 CRUD forms + FormPassword + me.store)
- [x] 107-04-PLAN.md — Migrate remaining pages and components (ads, articles)

### Phase 108: dashboard replace nuxtjs-strapi sdk with useApiClient for all reads

**Goal:** Replace every remaining `strapi.find()` and `strapi.findOne()` call (66 calls across 49 files) in the dashboard with `apiClient(url, { method: "GET", params: ... })`, eliminating the dual-resource pattern so all HTTP goes through `useApiClient`.
**Requirements**: [RDR-108-01, RDR-108-02, RDR-108-03]
**Depends on:** Phase 107
**Plans:** 3/3 plans complete

Plans:
- [x] 108-01-PLAN.md — Migrate store and all 29 components to apiClient GET
- [x] 108-02-PLAN.md — Migrate all 19 pages to apiClient GET
- [x] 108-03-PLAN.md — Final verification sweep (grep + typecheck + tests)

### Phase 109: Eliminate nuxtjs-strapi dependency from dashboard

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 108
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 109 to break down)
