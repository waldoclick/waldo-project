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

**Goal:** Replace all 4 @nuxtjs/strapi composables (useStrapiUser, useStrapiToken, useStrapiClient, useStrapiAuth) with project-owned session composables, add a custom startup plugin, and remove the @nuxtjs/strapi module from the dashboard entirely.
**Requirements**: [REQ-109-01, REQ-109-02, REQ-109-03, REQ-109-04, REQ-109-05]
**Depends on:** Phase 108
**Plans:** 2/2 plans complete

Plans:
- [x] 109-01-PLAN.md — Create session composables, startup plugin, add qs dependency, unit tests
- [x] 109-02-PLAN.md — Swap all consumer files, update test mocks, remove @nuxtjs/strapi module

### Phase 110: Fix SSR data loading in ads detail page and dashboard home stats

**Goal:** Fix two SSR data-loading violations: replace client-only onMounted with watch(immediate:true) in dashboard stats components, and move useAdsStore to setup scope in ads detail page.
**Requirements**: [SSR-110-01, SSR-110-02]
**Depends on:** Phase 109
**Plans:** 1/1 plans complete

Plans:
- [x] 110-01-PLAN.md — Fix onMounted in dashboard stats + useAdsStore scope in [slug].vue

### Phase 111: Make privacy policies manageable from Strapi and seed initial data

**Goal:** Create a `policy` collection type in Strapi so editors can manage privacy policy text from the admin panel, write a seeder that pre-populates all 16 policy sections from the current hardcoded data, and refactor the website frontend to fetch policies from the API instead of a static array.
**Requirements**: [POL-01, POL-02, POL-03, POL-04, POL-05, POL-06, POL-07]
**Depends on:** Phase 110
**Plans:** 2/2 plans complete

Plans:
- [x] 111-01-PLAN.md — Strapi policy content type + seeder + bootstrap registration
- [x] 111-02-PLAN.md — Website type, store, page and component refactor to use Strapi data

### Phase 112: Fix ad wizard ownership validation

**Goal:** Prevent a logged-in user from continuing another user's ad wizard flow (persisted in localStorage) by: (1) storing the owner's userId in the ad.store and resetting early at wizard entry if it doesn't match the current user, (2) adding ownership validation in Strapi's saveDraft update path, and (3) overriding the inherited CRUD update/delete handlers in the ad controller to verify ownership before allowing modifications.
**Requirements**: [SEC-112-01, SEC-112-02, SEC-112-03]
**Depends on:** Phase 111
**Plans:** 2/2 plans complete

Plans:
- [x] 112-01-PLAN.md — Backend ownership checks: saveDraft update guard + controller update/delete overrides
- [x] 112-02-PLAN.md — Frontend ownership guard: userId field in ad store + wizard entry reset

### Phase 113: Fix stale session cookie leaking authenticated requests after logout

**Goal:** SKIPPED — issue resolved as side effect of Phase 109 (@nuxtjs/strapi elimination). Session cookie lifecycle now managed entirely by custom useSessionToken composable.
**Requirements**: N/A
**Depends on:** Phase 112
**Plans:** 0 plans (skipped)
**Status:** Skipped — 2026-04-07

### Phase 114: Fix Codacy best-practice warnings — replace any with unknown, Function type, and require statements across monorepo

**Goal:** Replace all `any` type annotations (~83 instances), `Function` type usage (6 instances), with proper TypeScript types across the monorepo (website, dashboard, strapi). Pure type-annotation refactoring with zero runtime behavior changes.
**Requirements**: [CBP-01, CBP-02, CBP-03, CBP-04]
**Depends on:** Phase 113
**Plans:** 4/4 plans complete

Plans:
- [x] 114-01-PLAN.md — Fix all `any` violations in website app (~20 files)
- [x] 114-02-PLAN.md — Fix all `any` violations in dashboard app (~30 files)
- [x] 114-03-PLAN.md — Fix all `any`/`Function` violations in strapi app (~20 files)
- [x] 114-04-PLAN.md — Final monorepo verification sweep (typecheck + tests + grep)

### Phase 115: Fix remaining any and Function type violations

**Goal:** Fix 12 residual `any` violations missed by Phase 114's grep patterns: 2 `Array<any>` prop annotations in IntroduceAuth.vue (website + dashboard) and 10 `ref<any>(null)` reactive state declarations in dashboard detail pages. Pure type-annotation refactoring with zero runtime behavior changes.
**Requirements**: [TYPE-001, TYPE-002]
**Depends on:** Phase 114
**Plans:** 1/1 plans complete

Plans:
- [x] 115-01-PLAN.md — Fix all 12 `Array<any>` and `ref<any>` violations across website and dashboard

### Phase 116: Enforce centralized test directory structure

**Goal:** Move all co-located test files to centralized `tests/` directories across the monorepo. Website: move 9 test files from `app/composables/` and `app/components/` to `tests/`, delete 4 dead test-shaped files, update imports to use `@/` alias. Strapi: rename 4 `__tests__/` directories to `tests/`, move 12 flat co-located test files into `tests/` subdirectories, update relative imports. Dashboard already compliant. Zero test logic changes — pure file relocation.
**Requirements**: [STRUCT-116-WEB, STRUCT-116-STRAPI]
**Depends on:** Phase 115
**Plans:** 2/2 plans complete

Plans:
- [x] 116-01-PLAN.md — Move website co-located tests to tests/, delete dead files, update imports
- [x] 116-02-PLAN.md — Rename Strapi __tests__ to tests/, move flat co-located tests, update imports

### Phase 117: Enforce root-level tests directory for website — move all test files to apps/website/tests following the Mandatory Testing Directory Rule. Preserve mirrored folder structure. Zero test logic changes.

**Goal:** Formally verify that all 23 website test files reside exclusively under apps/website/tests/ with mirrored folder structure, confirming the Mandatory Testing Directory Rule is enforced. Verification-only phase — structural work completed in Phase 116.
**Requirements**: [STRUCT-117-WEB]
**Depends on:** Phase 116
**Plans:** 1/1 plans complete

Plans:
- [x] 117-01-PLAN.md — Verify website test directory compliance and close phase

### Phase 118: Enforce root-level tests directory for Strapi — move all test files to apps/strapi/tests/ mirroring the source folder structure. Zero test logic changes.

**Goal:** Move all 27 Strapi test files from their scattered locations inside src/ (nested within each service/controller/api directory) to a single root-level apps/strapi/tests/ directory, mirroring the source folder structure. Update all relative imports. Zero test logic changes — pure file relocation.
**Requirements**: [STRUCT-118-STRAPI]
**Depends on:** Phase 117
**Plans:** 2/2 plans complete

Plans:
- [x] 118-01-PLAN.md — Jest config + git mv all 27 files + rewrite api/ test imports
- [x] 118-02-PLAN.md — Rewrite remaining 14 test imports + full test suite verification

### Phase 119: export orders to CSV from dashboard orders page

**Goal:** Add a CSV export feature to the dashboard orders page: a Strapi `GET /orders/export-csv` endpoint that returns all orders as CSV, a client-side `ordersTocsv()` utility with full test coverage, a `useExportCsv` composable for the Blob download trigger, and an "Exportar CSV" button in the orders page header.
**Requirements**: [CSV-STRAPI-01, CSV-UTIL-01, CSV-UI-01, CSV-DOWNLOAD-01]
**Depends on:** Phase 118
**Plans:** 2/2 plans complete

Plans:
- [x] 119-01-PLAN.md — Strapi exportCsv endpoint + dashboard CSV utility with tests
- [x] 119-02-PLAN.md — Dashboard useExportCsv composable + UI button + human verification

### Phase 120: Refactor PRO subscription model: subscription-pro collection type, move card data out of user, fix charge-before-activate order, calendar billing

**Goal:** Introduce a `subscription-pro` collection type to own card enrollment data, fix the charge-before-activate ordering bug in proResponse (charge first, activate only on success), migrate cron and cancellation service to read card data from subscription-pro, remove the orphaned `pro` boolean from the user schema, and update all affected tests.
**Requirements**: [SUB-SCHEMA-01, SUB-SCHEMA-02, SUB-SCHEMA-03, SUB-MIGRATE-01, SUB-CHARGE-01, SUB-CHARGE-02, SUB-ERROR-01, SUB-CRON-01, SUB-CANCEL-01, SUB-PROTECT-01]
**Depends on:** Phase 119
**Plans:** 1/5 plans executed

Plans:
- [x] 120-00-PLAN.md — Wave 0 test stubs for subscription-pro and payment-pro-response
- [ ] 120-01-PLAN.md — Create subscription-pro schema + user schema update + bootstrap migration
- [ ] 120-02-PLAN.md — Fix charge-before-activate in proResponse + subscription-pro record creation
- [ ] 120-03-PLAN.md — Update cron + cancellation service + middleware to use subscription-pro
- [ ] 120-04-PLAN.md — Update tests + full verification sweep
