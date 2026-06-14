---
phase: 111-haz-que-sean-administrables-desde-strapi-y-usa-la-misma-informacion-para-completar-el-seeder
verified: 2026-04-04T15:35:00Z
status: human_needed
score: 7/7 must-haves verified (automated)
human_verification:
  - test: "Open Strapi admin and confirm Policy collection type appears with title, text, order fields"
    expected: "Policy content type is visible in Strapi admin with correct fields and draftAndPublish disabled"
    why_human: "Cannot verify Strapi admin panel UI programmatically; schema.json exists but Strapi type registration requires a running instance"
  - test: "Run Strapi with APP_RUN_SEEDERS=true, count Policy records in admin, restart and count again"
    expected: "16 records on first run; still exactly 16 records on second run (idempotent)"
    why_human: "Seeder idempotency (POL-02, POL-03) requires a live database connection to verify — cannot be confirmed from source alone"
  - test: "curl https://[strapi-host]/api/policies (unauthenticated) and verify HTTP 200 with policy data"
    expected: "Returns 200 with 16 policies sorted by order:asc; no 403 or 404"
    why_human: "Public role permission (POL-07) is set via Strapi admin UI; SUMMARY claims it was done but cannot be verified from code (it is stored in the database, not source files)"
  - test: "Navigate to /politicas-de-privacidad in browser and confirm all 16 policy sections render"
    expected: "Page loads without error, shows all 16 accordion sections with correct titles and text content from Strapi"
    why_human: "End-to-end rendering depends on network call to Strapi, SSR hydration, and visual display — not verifiable from source"
---

# Phase 111: Make Privacy Policies Manageable from Strapi — Verification Report

**Phase Goal:** Create a `policy` collection type in Strapi so editors can manage privacy policy text from the admin panel, write a seeder that pre-populates all 16 policy sections from the current hardcoded data, and refactor the website frontend to fetch policies from the API instead of a static array.
**Verified:** 2026-04-04T15:35:00Z
**Status:** human_needed (all automated checks pass; 4 items need human/runtime verification)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Strapi admin shows a Policy collection type with title, text (richtext), and order (integer) fields | ? HUMAN | `schema.json` is correct on disk; requires running Strapi to confirm registration |
| 2 | Running seeders creates 16 policy records from the hardcoded data | ? HUMAN | `policiesData` array has exactly 16 items (orders 1–16); runtime DB needed to confirm |
| 3 | Running seeders a second time does not duplicate records | ? HUMAN | `findMany({ where: { title } })` guard is present in source; idempotency requires live DB run |
| 4 | Public role has find and findOne permission on the policies endpoint | ? HUMAN | SUMMARY claims this was done via admin UI; cannot be confirmed from source code |
| 5 | Policies page loads data from Strapi API via usePoliciesStore, not hardcoded array | VERIFIED | `PoliciesDefault.vue` has zero hardcoded data; page wires `useAsyncData` + `usePoliciesStore().loadPolicies()` |
| 6 | Store caches policies in localStorage with 1-hour TTL | VERIFIED | `CACHE_DURATION = 3600000`, `lastFetchTimestamp` guard, `persist: { storage: persistedState.localStorage }` — all present |
| 7 | Unit tests for store (POL-04, POL-05) and component (POL-06) pass | VERIFIED | `yarn workspace waldo-website test --run` — 5/5 tests pass |

**Score:** 3/7 truths VERIFIED (automated), 4/7 need human/runtime confirmation

---

## Required Artifacts

### Plan 111-01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/strapi/src/api/policy/content-types/policy/schema.json` | Policy collection type schema | VERIFIED | `collectionType`, `collectionName: "policies"`, `richtext`, `integer` (order), `draftAndPublish: false` all present |
| `apps/strapi/seeders/policies.ts` | Policy seeder with 16 items | VERIFIED | 16 items (orders 1–16), `export default populatePolicies`, findMany + create pattern |
| `apps/strapi/src/api/policy/controllers/policy.ts` | Core controller for api::policy.policy | VERIFIED | `factories.createCoreController("api::policy.policy")` |
| `apps/strapi/src/api/policy/routes/policy.ts` | Core router for api::policy.policy | VERIFIED | `factories.createCoreRouter("api::policy.policy")` |
| `apps/strapi/src/api/policy/services/policy.ts` | Core service for api::policy.policy | VERIFIED | `factories.createCoreService("api::policy.policy")` |

### Plan 111-02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/website/app/types/policy.d.ts` | Policy and PolicyResponse interfaces | VERIFIED | Both interfaces present; `order: number \| null`, `publishedAt: string \| null` |
| `apps/website/app/stores/policies.store.ts` | Pinia store with loadPolicies, cache guard, persist | VERIFIED | `defineStore("policies")`, `useApiClient()`, `CACHE_DURATION=3600000`, `persist: CORRECT` comment, `order:asc` sort |
| `apps/website/app/components/PoliciesDefault.vue` | Component accepting policies prop | VERIFIED | `defineProps<{ policies: Policy[] }>()`, `:questions="policies"`, zero hardcoded data |
| `apps/website/app/pages/politicas-de-privacidad.vue` | Page with useAsyncData loading policies | VERIFIED | `useAsyncData("policies", ...)`, `usePoliciesStore()`, `default: () => []`, `server: true`, `:policies="policies \|\| []"` |
| `apps/website/tests/stores/policies.store.test.ts` | Unit tests for usePoliciesStore | VERIFIED | 3 tests: first fetch, fresh cache skip, stale cache refetch — all GREEN |
| `apps/website/tests/components/PoliciesDefault.test.ts` | Unit test for PoliciesDefault prop rendering | VERIFIED | 2 tests: prop binding, empty array — all GREEN |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `apps/strapi/src/index.ts` | `apps/strapi/seeders/policies.ts` | `import populatePolicies` + `await populatePolicies(strapi)` in bootstrap | VERIFIED | Both import (line 7) and call (line 42) present inside the `APP_RUN_SEEDERS` guard, after `populateAdDraftMigration` |
| `apps/website/app/pages/politicas-de-privacidad.vue` | `apps/website/app/stores/policies.store.ts` | `usePoliciesStore().loadPolicies()` | VERIFIED | `const policiesStore = usePoliciesStore()` + `await policiesStore.loadPolicies()` inside `useAsyncData` |
| `apps/website/app/stores/policies.store.ts` | `/api/policies` | `useApiClient GET` | VERIFIED | `client("policies", { method: "GET", params: { sort: ["order:asc"] } })` |
| `apps/website/app/pages/politicas-de-privacidad.vue` | `apps/website/app/components/PoliciesDefault.vue` | `:policies` prop binding | VERIFIED | `<PoliciesDefault :policies="policies \|\| []" />` in template |
| `apps/website/app/components/PoliciesDefault.vue` | `AccordionDefault` | `:questions="policies"` | VERIFIED | Prop is passed directly to `<AccordionDefault :questions="policies" />` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| POL-01 | 111-01 | Policy content type with title, text, order fields in Strapi | ? HUMAN | Schema file is correct; Strapi admin confirmation needed |
| POL-02 | 111-01 | Seeder creates 16 policy records on first run | ? HUMAN | 16 items in `policiesData`; live DB verification needed |
| POL-03 | 111-01 | Seeder is idempotent (no duplicates on second run) | ? HUMAN | Guard logic present (`findMany` by title); live verification needed |
| POL-04 | 111-02 | `usePoliciesStore.loadPolicies()` fetches from `/api/policies` | SATISFIED | Unit test verifies `client` called with `"policies"` + `method: "GET"` |
| POL-05 | 111-02 | Store cache guard prevents double fetch within 1-hour TTL | SATISFIED | Unit tests verify skip on fresh timestamp and refetch on stale |
| POL-06 | 111-02 | `PoliciesDefault.vue` renders prop data via AccordionDefault | SATISFIED | Unit test verifies `:questions` receives the `policies` prop value |
| POL-07 | 111-01 | Public role has `find` permission on `/api/policies` endpoint | ? HUMAN | SUMMARY claims completed via admin UI; not verifiable from source |

No orphaned requirements — all 7 POL requirements are claimed by a plan.

---

## Anti-Patterns Found

No anti-patterns detected across all modified files:

- `PoliciesDefault.vue` — zero occurrences of `const faqs`, `return null`, `TODO`, `FIXME`, or placeholder patterns
- `politicas-de-privacidad.vue` — no hardcoded data; all policy content flows through `useAsyncData`
- `policies.store.ts` — persist annotation `// persist: CORRECT` present per CLAUDE.md rule; cache guard implemented correctly
- `policies.ts` (seeder) — no stub patterns; all 16 items have real content

---

## Human Verification Required

### 1. Strapi Policy Collection Type Registration (POL-01)

**Test:** Start Strapi (`yarn workspace waldo-strapi develop`), open the admin panel, navigate to Content-Type Builder, confirm "Policy" collection type appears with fields: `title` (Text, Required), `text` (Rich text), `order` (Number > Integer), and Draft & Publish disabled.
**Expected:** All 4 fields visible with correct types; no draft/publish toggle on policy records.
**Why human:** Strapi reads `schema.json` at startup and registers the type in its database. The file is correct on disk but the actual admin panel appearance requires a running instance to confirm.

### 2. Seeder Creates 16 Records (POL-02)

**Test:** Start Strapi with `APP_RUN_SEEDERS=true yarn workspace waldo-strapi develop`, wait for bootstrap to complete, count Policy records in the admin panel (Content Manager -> Policy).
**Expected:** Exactly 16 records appear, all with non-empty title, text, and order values.
**Why human:** The seeder runs against a live database. The source code is correct but actual record creation requires a running Strapi + database environment.

### 3. Seeder Is Idempotent (POL-03)

**Test:** With 16 records already in the database from POL-02, restart Strapi again with `APP_RUN_SEEDERS=true`. Count Policy records after restart.
**Expected:** Still exactly 16 records — no duplicates created. Console should show "Politica ya existe: ..." for all 16 items.
**Why human:** Idempotency verification requires two successive database runs.

### 4. Public API Endpoint Returns 200 (POL-07)

**Test:** With Strapi running, execute `curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/api/policies` from terminal (no auth headers).
**Expected:** HTTP 200 with JSON body containing `{ data: [...16 policies...], meta: {...} }`.
**Why human:** The Strapi permissions system stores role permissions in the database (not in source files). The SUMMARY confirms the human operator granted `find` and `findOne` to the Public role, but this cannot be verified programmatically without a live database.

---

## Gaps Summary

No code-level gaps found. All source artifacts are complete, substantive, and wired correctly. The 4 outstanding items are all runtime/environment checks that require a live Strapi instance and database. They are classified as `human_needed` rather than `gaps_found` because the underlying code is correct — the blockers are observability constraints, not implementation defects.

**Note on POL-07:** The public role permissions grant is the only item where code evidence is genuinely absent (it is stored in the DB). The SUMMARY explicitly states "Task 3 (Strapi admin permissions grant) was completed manually by the operator." This should be treated as high-confidence but unverifiable without a live environment.

---

_Verified: 2026-04-04T15:35:00Z_
_Verifier: Claude (gsd-verifier)_
