# Roadmap: Waldo Project

## Milestones

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
- 🚧 **v1.46 PRO Subscriptions (Webpay Oneclick)** — Phases 102–104 (in progress)

## Phases

### 🚧 v1.46 PRO Subscriptions (Webpay Oneclick)

**Milestone goal:** Users can subscribe to a monthly PRO plan via Webpay Oneclick Mall — card registration, automatic monthly charges, and cancellation.

- [x] **Phase 102: Oneclick Service + Inscription Flow** - Backend Oneclick service and end-to-end card enrollment with frontend redirect and return handling (completed 2026-03-20)
- [x] **Phase 103: Monthly Charging Cron** - subscription-payment content type, daily charge cron, 3-day retry logic, and idempotency guard (completed 2026-03-20)
- [x] **Phase 103.1: Remove pro boolean** - Eliminate dual source of truth by replacing all pro boolean usage with pro_status enum (completed 2026-03-21)
- [ ] **Phase 104: Cancellation + Account Management** - Cancel endpoint, period-end expiry, card deletion from Transbank, and account UI

## Phase Details

### Phase 102: Oneclick Service + Inscription Flow
**Goal**: Users can enroll their card in Webpay Oneclick Mall and get confirmed as PRO subscribers
**Depends on**: Nothing (first phase of milestone)
**Requirements**: INSC-01, INSC-02, INSC-03, INSC-04, FRNT-01, FRNT-02
**Success Criteria** (what must be TRUE):
  1. User clicks "Hazte PRO" and is redirected to the Transbank card enrollment page
  2. After completing enrollment on Transbank, user is redirected back and their `pro_status` is set to `active`
  3. User's card type and masked card number are stored and visible on the confirmation page
  4. If the user cancels or the enrollment fails, they land on an error page with a retry option
**Plans:** 2/2 plans complete
Plans:
- [ ] 102-01-PLAN.md — OneclickService backend + user schema extension + API routes
- [ ] 102-02-PLAN.md — Frontend rewire (MemoPro.vue) + confirmation page (/pro/gracias)

### Phase 103: Monthly Charging Cron
**Goal**: PRO subscribers are charged automatically each month without any manual action
**Depends on**: Phase 102
**Requirements**: CHRG-01, CHRG-02, CHRG-03, CHRG-04, CHRG-05
**Success Criteria** (what must be TRUE):
  1. A daily cron job runs at 5 AM and charges all active PRO users whose billing period has expired
  2. Each successful charge creates a `subscription-payment` record and extends `pro_expires_at` by 30 days
  3. A failed charge is retried on day 1 and day 3 before deactivating the subscription on day 4
  4. The charge amount comes from `PRO_MONTHLY_PRICE` env var — changing the var changes the charge with no code deploy
  5. Running the cron twice in the same day does not double-charge any user
**Plans:** 2/2 plans complete
Plans:
- [x] 103-01-PLAN.md — subscription-payment content type + OneclickService.authorizeCharge() + env vars
- [x] 103-02-PLAN.md — SubscriptionChargeService cron class + tests + cron registration

### Phase 103.1: Remove pro boolean — use pro_status as single source of truth (INSERTED)

**Goal:** All application code uses `pro_status === "active"` as the single source of truth for PRO membership — the `pro` boolean is no longer read or written anywhere
**Requirements**: PRO-SINGLE-01, PRO-SINGLE-02, PRO-SINGLE-03, PRO-SINGLE-04, PRO-SINGLE-05, PRO-SINGLE-06, PRO-SINGLE-07
**Depends on:** Phase 103
**Success Criteria** (what must be TRUE):
  1. No server-side code writes `pro: true` or `pro: false` to user records
  2. `computeSortPriority` determines PRO status from `pro_status`, not `pro` boolean
  3. `sanitizeAdForPublic` returns `pro_status` in the user object instead of `pro`
  4. All website PRO page gates check `pro_status !== "active"` instead of `!user.pro`
  5. All website/dashboard components use `pro_status === "active"` instead of `user.pro`
  6. User type definitions no longer contain the `pro: boolean` field
  7. All existing tests pass with updated mocks
**Plans:** 2/2 plans complete

Plans:
- [x] 103.1-01-PLAN.md — Strapi backend: computeSortPriority, sanitize-ad, payment writes, cron writes, protect-user-fields, and tests
- [x] 103.1-02-PLAN.md — Frontend: website + dashboard type definitions, page gates, and component updates

### Phase 104: Cancellation + Account Management
**Goal**: PRO subscribers can cancel their subscription and see their subscription status at any time
**Depends on**: Phase 102
**Requirements**: CANC-01, CANC-02, CANC-03, CANC-04, FRNT-03, FRNT-04
**Success Criteria** (what must be TRUE):
  1. An active subscriber can cancel from their account page with a Swal confirmation dialog
  2. After cancellation, PRO features remain active until `pro_expires_at` (no immediate cutoff)
  3. When the billing period expires after cancellation, `pro_status` flips to `inactive` and PRO features are disabled
  4. The account page shows subscription status, masked card info, and next charge date for active subscribers
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 102. Oneclick Service + Inscription Flow | 2/2 | Complete   | 2026-03-20 | - |
| 103. Monthly Charging Cron | 1/2 | 2/2 | Complete    | 2026-03-20 |
| 103.1. Remove pro boolean | v1.46 | 2/2 | Complete   | 2026-03-21 |
| 104. Cancellation + Account Management | v1.46 | 0/? | Not started | - |
