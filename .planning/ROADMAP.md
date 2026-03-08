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
- 🔄 **v1.19 Zoho CRM Sync Model** — Phases 43-46 (in progress)

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

## Active Phases

<!-- v1.19 Zoho CRM Sync Model — Phases 43-46 -->

- [x] **Phase 43: Zoho Service Reliability** — Fix token refresh (401 interceptor), fix auth header prefix, isolate tests with axios-mock-adapter, add env vars to .env.example (completed 2026-03-08)
  **Plans:** 2 plans
  - [ ] 43-01-PLAN.md — Fix ZohoHttpClient: correct auth header (`Zoho-oauthtoken`) and 401 response interceptor with `_retry` guard
  - [ ] 43-02-PLAN.md — Rewrite zoho.test.ts with axios-mock-adapter; add ZOHO_* vars to .env.example
- [ ] **Phase 44: Zoho Service Layer** — Initialize Contact custom fields to 0 on creation; implement `updateContactStats()` and `createDeal()` on service; fix Lead_Status missing field
- [ ] **Phase 45: Payment Event Wiring** — Wire `pack_purchased` and `ad_paid` events to `createDeal()` + `updateContactStats()`; resolve Contact ID via `findContact()` before every deal creation
- [ ] **Phase 46: Ad Published Event Wiring** — Wire `ad_published` event to `updateContactStats()`; guard with status-transition check to prevent double-counting

## Phase Details

### Phase 43: Zoho Service Reliability
**Goal**: The Zoho HTTP client handles token expiry correctly and tests never hit the live API
**Depends on**: Nothing (foundation phase)
**Requirements**: RELY-01, RELY-02, RELY-04, RELY-05
**Success Criteria** (what must be TRUE):
  1. A Zoho API call made after token expiry (simulated 401 response) automatically refreshes the token and retries — the calling code receives the successful result, not an error
  2. The authorization header on every outbound Zoho request reads `Zoho-oauthtoken <token>` (not `Bearer <token>`)
  3. Running `yarn test` in `apps/strapi` makes zero network calls to `zohoapis.com` — all Zoho HTTP calls are intercepted by `axios-mock-adapter`
  4. `apps/strapi/.env.example` contains all four `ZOHO_*` variables (`ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_API_URL`)
**Plans**: 2 plans — 43-01-PLAN.md (ZohoHttpClient fix), 43-02-PLAN.md (test isolation + .env.example)

### Phase 44: Zoho Service Layer
**Goal**: The Zoho service exposes `createDeal()` and `updateContactStats()`, Contact creation initializes counters to zero, and Leads are created with a status
**Depends on**: Phase 43
**Requirements**: CONT-01, CONT-02, DEAL-01, RELY-03
**Success Criteria** (what must be TRUE):
  1. A Contact created via `createContact()` always has `Ads_Published__c: 0`, `Total_Spent__c: 0`, and `Packs_Purchased__c: 0` in the Zoho API payload
  2. `zohoService.createDeal(deal)` posts a Deal payload with `Deal_Name`, `Stage: "Closed Won"`, `Amount`, `Contact_Name: { id }`, `Type`, `Closing_Date`, `Description`, and `Lead_Source` — and returns the created Deal's Zoho ID
  3. `zohoService.updateContactStats(contactId, stats)` issues a `PUT /crm/v5/Contacts/{id}` with only the provided stat fields (no undefined keys sent)
  4. `zohoService.createLead()` includes `Lead_Status: "New"` in the payload sent to Zoho
**Plans**: TBD

### Phase 45: Payment Event Wiring
**Goal**: Every confirmed pack purchase and paid ad activation creates a Deal in Zoho and updates the Contact's spend stats
**Depends on**: Phase 44
**Requirements**: DEAL-02, DEAL-03, EVT-03
**Success Criteria** (what must be TRUE):
  1. After Transbank confirms a pack payment (`pack_purchased`), a Deal appears in Zoho linked to the buyer's Contact, with `Amount` matching the charged amount and `Stage: "Closed Won"`
  2. After Transbank confirms an ad payment (`ad_paid`), a Deal appears in Zoho linked to the buyer's Contact, with `Amount` matching the charged amount
  3. The `Total_Spent__c` field on the Zoho Contact is incremented by the payment amount after each confirmed payment event
  4. `Packs_Purchased__c` is incremented on the Contact after a pack purchase (but not after an ad payment)
  5. If `findContact(email)` returns null (user not yet in Zoho), no Deal is created and no error is thrown — the failure is logged and the payment flow completes normally
**Plans**: TBD

### Phase 46: Ad Published Event Wiring
**Goal**: Every ad approval increments the Contact's published-ads counter in Zoho, firing exactly once per genuine first-publish transition
**Depends on**: Phase 44
**Requirements**: EVT-01, EVT-02
**Success Criteria** (what must be TRUE):
  1. When an admin approves an ad (`approveAd()` called), the Zoho Contact for that user has `Ads_Published__c` incremented by 1 and `Last_Ad_Posted_At__c` updated to the current timestamp
  2. The sync only fires when the ad's status transitions to `"published"` for the first time — re-approving an already-published ad does not increment the counter a second time
  3. No Deal is created for the `ad_published` event (only Contact stats are updated)
  4. If `findContact(email)` returns null for the ad's owner, the sync is silently skipped and `approveAd()` completes successfully
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 3-34 | v1.1–v1.14 | All | Complete | 2026-03-05 to 2026-03-07 |
| 35. Website SEO Audit | v1.15 | 3/3 | Complete | 2026-03-07 |
| 36. SEO Bug Fixes | v1.16 | 1/1 | Complete | 2026-03-07 |
| 37. Dynamic Page Copy | v1.16 | 1/1 | Complete | 2026-03-07 |
| 38. Static Page Copy | v1.16 | 2/2 | Complete | 2026-03-07 |
| 39. Spanish Default Language | — | 0/1 | Not started | — |
| 40. Users Filter Authenticated | v1.17 | 2/2 | Complete | 2026-03-07 |
| 41. Sentry Production-Only | v1.17 | 1/1 | Complete | 2026-03-07 |
| 42. Ad Creation URL Refactor | v1.18 | 3/3 | Complete | 2026-03-08 |
| 43. Zoho Service Reliability | 2/2 | Complete    | 2026-03-08 | — |
| 44. Zoho Service Layer | v1.19 | 0/? | Not started | — |
| 45. Payment Event Wiring | v1.19 | 0/? | Not started | — |
| 46. Ad Published Event Wiring | v1.19 | 0/? | Not started | — |
