# Implementation Plan Document (IPD)

This is a retrospective account of how Waldo was actually built (milestones v1.1–v1.46, phases 1–129+, plus the current post-milestone phase series 1–6), reframed as reusable delivery patterns — NOT a build-from-scratch plan. Every phase/milestone entry below traces to `.planning/ROADMAP.md` and `.planning/STATE.md`; nothing here is invented or projected. Read this document as "how the team actually shipped a production classified-ads platform incrementally," not as a spec to follow verbatim for a new build.

**Numbering note:** Waldo's phase counter has been reset once. Phases 1–129 belong to the archived milestone track (v1.1 through v1.46, each milestone spanning a phase range). After v1.46 shipped, the phase counter was reset to 1 for a new, not-yet-versioned line of work (Codacy hardening → AI provider consolidation → AI registration validation → legal page split → audit logging → this documentation phase). Where "Phase 1" appears below, the surrounding milestone or phase-range column disambiguates which numbering track it belongs to.

## Table of Contents

- [Roadmap por fases (retrospectiva)](#roadmap-por-fases-retrospectiva)
- [Épicas e historias de usuario (retrospectivas)](#épicas-e-historias-de-usuario-retrospectivas)
- [Patrones de entrega reutilizables](#patrones-de-entrega-reutilizables)
- [Preguntas abiertas](#preguntas-abiertas)

## Roadmap por fases (retrospectiva)

Waldo shipped as a sequence of versioned milestones (v1.1 → v1.46), each milestone composed of one or more numbered phases, each phase composed of vertical-slice plans. The table below groups the shipped history by milestone, states what each cluster delivered, and ties it to the flow(s) it built in [`docs/spec/application-flows.md`](./application-flows.md) where applicable. Source: `.planning/ROADMAP.md` (milestone index) and `.planning/STATE.md` § Roadmap Evolution (phase-by-phase narrative).

### Foundational and internal-quality milestones (v1.1–v1.20)

| Milestone | Phases | What it delivered | Related flow |
|---|---|---|---|
| v1.1–v1.3 | early phases | Dashboard list-component deduplication (generic `AdsTable` replacing 6 variants), independent pagination/filter state per section, shared domain TypeScript types (`Ad`, `User`, `Order`, `Category`), N+1 elimination in categories/sales aggregates, centralized date/price/string utilities | Flow 5 (CRUD conventions) |
| v1.4 | — | English-only dashboard URL segments with 301 redirects from the old Spanish routes; explicit `routeRules` (no wildcards); Spanish UI labels preserved (only routes translated) | — |
| v1.5 | — | Ad reject/ban flows free the associated `AdReservation`/`AdFeaturedReservation` for reuse, with conditional credit-return email notifications | Flow 4 (Reservation System) |
| v1.6 | — | Website double-fetch elimination via `useAsyncData`-only loading pattern; cache-guarded Pinia stores (packs, conditions, regions) with array-length + timestamp TTL guards; aggregate `GET /ads/me/counts` endpoint replacing 5 parallel client calls | — |
| v1.7–v1.8 | — | Cron job suite documented in English; `cron-runner` manual-execution API (`POST /api/cron-runner/:name`); `ad-free-reservation-restore.cron.ts` guarantees 3 free ad-reservation slots per user | Flow 4, Flow 6 (Cron Jobs) |
| v1.9 | — | Website SSR-safety pass: `useAsyncData` everywhere, `typeCheck: true` enabled, structured data on every page, 14 persisted stores audited inline (CORRECT/REVIEW/RISK) | — |
| v1.10–v1.16 | — | GTM/GA4 rollout (Consent Mode v2, `@saslavik/nuxt-gtm` in both apps, full ecommerce event chain — `step_view`, `begin_checkout`, `purchase`), then a dedicated SEO hardening pass (OG/Twitter tags, JSON-LD per page type, `noindex` on 18+ private pages, title/description budget compliance) | — |
| v1.17 | — | Sentry restricted to production only (7 entry points); server-side Authenticated-role filtering via `strapi.db.query` (non-forgeable) | Flow 1 (Authentication) |
| v1.18 | — | Ad creation wizard refactored from `?step=N` query params to 5 dedicated routes, with a `wizard-guard.ts` SSR-safe middleware preventing step-skipping | Flow 2 (Ad Lifecycle) |
| v1.19 | — | Zoho CRM integration (contacts/deals sync on ad publish and pack purchase), with token-refresh guard and floating-promise vs. blocking-await chosen per redirect-timing constraints | — |
| v1.20 | — | Zero-`any` TypeScript pass across the entire Strapi backend (ad service/controller, all type files, all integration services, all seeders, all payment tests) — `tsc --noEmit` exits 0 | — |

### Checkout and payment unification (v1.21–v1.27)

| Milestone | Phases | What it delivered | Related flow |
|---|---|---|---|
| v1.21 | — | `draft: boolean` field on Ad as single source of truth for draft state, replacing a multi-condition "abandoned" heuristic; `POST /api/ads/save-draft` pre-payment; `publishAd()` flips `draft: false` on confirmation | Flow 2, Flow 3 (Payment/Checkout) |
| v1.22 | — | `/pagar` established as the single central payment page; `CheckoutDefault.vue` owns full payment logic (draft + Webpay redirect + free path); `PaymentAd`/`PaymentGateway`/`BarCheckout` components | Flow 3 |
| v1.23 | — | Unified payment flow: `packs.store.ts` eliminated in favor of a module-level-cache composable; `/pagar` branches on `adStore.ad.ad_id === null` for pack-only vs. ad+pack purchases | Flow 3 |
| v1.24 | — | `POST /api/payments/free-ad` endpoint validating credit by pack type, publishing the ad, sending non-fatal confirmation emails | Flow 3 |
| v1.26 | — | Full 8-field Webpay receipt on `/pagar/gracias`, sourced from `order.payment_response`; `findOne()` switched to `documentId`-based lookup (the `order.documentId`-is-identity rule now codified in `CLAUDE.md`) | Flow 3 |
| v1.27 | — | GA4 `purchase` event wired with a one-shot ref guard; `pushEvent()` flow discriminator distinguishes `ad_creation` from `pack_purchase` | Flow 3 |

### Content, AI services, and account lifecycle (v1.28–v1.35)

| Milestone | Phases | What it delivered | Related flow |
|---|---|---|---|
| v1.28 | — | Centralized `useLogout` composable resetting all 6 user-scoped stores in a defined order on logout | Flow 1 |
| v1.29–v1.31 | 63–70 | Article/News content type with SEO fields, slug auto-generation, public blog views (`blog/index.vue`, `blog/[slug].vue`), draft/publish toggle, `source_url` field | — |
| v1.32–v1.34 | 71–74 | Sequential AI-provider integrations — Gemini, then Anthropic Claude (with a `web_search` tool loop via Brave Search), then Tavily news search — each as a singleton service behind `services/<name>/index.ts`, culminating in `LightBoxArticles.vue`'s 3-step search → prompt → generate dashboard workflow | — |
| v1.35 | 75–76 | Gift-reservation feature: `POST /api/ad-reservations/gift` and `/ad-featured-reservations/gift`, server-side Authenticated-role user search, non-fatal notification email | Flow 4 |

### Authentication hardening and session unification (v1.36–v1.44)

| Milestone | Phases | What it delivered | Related flow |
|---|---|---|---|
| v1.36 Two-Step Login Verification | 77–78 | `verification-code` content type; `overrideAuthLocal` intercepts `POST /api/auth/local` to return a `pendingToken` instead of a JWT; `POST /api/auth/verify-code` (15-min expiry, 3 attempts) and `/resend-code` (60s rate limit); Google OAuth bypasses the 2-step gate via a GET-method guard; dedicated verify-code UI in both apps | Flow 1 |
| v1.37 Email Authentication Flows | 79–82 | Email confirmation and password-reset flows completed end-to-end across both apps | Flow 1 |
| v1.38 GA4 Analytics Audit & Implementation | 83–85 | Analytics event audit and gap-fill pass | — |
| v1.39 Unified API Client | 89–90 | `useApiClient` composable established as the pattern that phases 107–110 later completed the migration to | — |
| v1.40 Shared Authentication Session | 91–92 | Conditional `COOKIE_DOMAIN` in both apps' `nuxt.config.ts` `strapi.cookie` blocks — the `waldo_jwt` cookie becomes identical and shared across `.waldo.click` subdomains in production; zombie host-only cookie cleanup on logout | Flow 1 |
| v1.41 Ad Preview Error Handling | 93 | Ad-preview error-state hardening | Flow 2 |
| v1.42 Dashboard Session Persistence | 94 | Dashboard session persistence fix | Flow 1 |
| v1.43 Cross-App Session Replacement | 95 | Cross-app session mechanism replacement, precursor to v1.44's Google One Tap | Flow 1 |
| v1.44 Google One Tap Sign-In | 94–98 | Google One Tap login integration alongside existing local/Google-OAuth flows | Flow 1 |
| v1.45 User Onboarding | 99–101 | Post-registration onboarding flow with profile-completeness gating | — |

### PRO subscriptions and post-merge hardening (v1.46)

| Milestone | Phases | What it delivered | Related flow |
|---|---|---|---|
| v1.46 PRO Subscriptions + Post-Merge Hardening | 102–129 | Full Webpay Oneclick Mall subscription lifecycle (`OneclickService`, `subscription-payment` content type, `SubscriptionChargeService` daily cron with 3-day retry, `ProCancellationService`); `apps/dashboard` merged into `apps/website` under `/dashboard/**` with route-by-route migration off `@nuxtjs/strapi` to a custom `useSessionX` composable family; httpOnly `waldo_jwt` proxy cookie centralizing all authenticated HTTP through a Nitro proxy (`server/api/[...].ts`); security review rounds fixing payment-integrity, authorization (IDOR), and auth-hardening findings; `strapi.entityService` → `strapi.db.query` migration for Strapi v5 compatibility | Flow 1, Flow 3, Flow 4, Flow 6 |

This is the single largest and highest-risk milestone in Waldo's history — it is also where the `apps/dashboard`-as-separate-app claim (still present in `CLAUDE.md`, corrected in `docs/spec/technical-requirements.md`'s "Inconsistencias detectadas") became stale, since the merge happened here.

### Current phase series (post-v1.46, counter reset to 1 — not yet a versioned milestone)

Per `.planning/STATE.md`, the phase counter reset to 1 after v1.46 shipped and all prior milestones were archived under `.planning/milestones/`. This series has not yet been assigned a `v1.4x`/`v1.5x` tag.

| Phase | What it delivered | Related flow |
|---|---|---|
| Phase 1 — Corregir issues de Codacy | Resolved 100 open Codacy findings (90 security/Opengrep, 9 best-practice/ESLint, 1 unused-code) via a Wave-0 characterization/regression-test gate before each fix | — |
| Phase 2 — Mover IA a endpoints de dominio | Relocated ad-hoc AI endpoints to domain-scoped routes (`GET /articles/sources`, `POST /articles/generate`), moved provider selection + prompt construction server-side with a configurable fallback chain | — |
| Phase 3 — Validación IA de campos de texto libre en el registro | Added a fail-open AI semantic-validation gate to `registerUserLocal` for free-text registration fields, reusing the Phase 2 `ai-provider` service | Flow 1 |
| Phase 4 — Split legal pages into 4 documents | Split the single legal-docs surface (Términos, Privacidad, Cookies, Seguridad) into 4 independent content-types, public pages, and dashboard CRUD sections with drag-and-drop ordering; `/condiciones-de-uso` renamed to `/terminos-y-condiciones-de-uso` with a 301 redirect | — |
| Phase 5 — Audit log for every CRUD operation | Global `strapi.db.lifecycles.subscribe()` hook in `bootstrap()`; storage mechanism pivoted mid-phase from a dedicated DB table to the existing Winston logger, with a shared `{ actor, actor_type, data }` envelope homologated across ~62 pre-existing payment/ad `logger.*` call sites | Flow 5 (CRUD + Audit Log) |
| Phase 6 — This documentation phase | Produced `backend-schema.md`, `application-flows.md`, `technical-requirements.md`, `product-requirements.md`, `implementation-plan.md` (this document), `ux-design.md` — all re-derived from live source, not copied from stale leads | All flows |

## Épicas e historias de usuario (retrospectivas)

The epics below describe **capabilities Waldo has already shipped**, framed as user stories for traceability — not a backlog of future work. Each maps to the milestone(s) that delivered it and the flow(s) in `docs/spec/application-flows.md` that document its current behavior.

### Epic: Secure, low-friction authentication

- As a returning user, I can log in with email/password and receive a 6-digit verification code by email before I get a session, so my account is protected even if my password leaks (v1.36).
- As a user, I can sign in with Google (OAuth or One Tap) and skip the 2-step code entirely, since Google has already verified my identity (v1.36, v1.44).
- As a user, once logged into either the public site or the dashboard, my session is recognized on the other without logging in again, because both apps share the same `waldo_jwt` cookie scoped to `.waldo.click` (v1.40).
- As a user, my JWT is never exposed to client-side JavaScript — it lives in an httpOnly cookie, and all authenticated API calls are proxied server-side with the token injected for me (v1.46, phase 129).

See Flow 1 in `application-flows.md`.

### Epic: Publish an ad through a guided, resumable flow

- As a seller, I fill out my ad across 5 dedicated wizard steps (not a single long form), and I can't skip ahead to a step I haven't reached yet (v1.18).
- As a seller, my in-progress ad is saved as a draft before I pay, so a failed or abandoned payment doesn't lose my work (v1.21).
- As a seller, once my payment (or free-tier submission) is confirmed, my ad is automatically published — no separate manual step (v1.21, v1.24).
- As a moderator, I can approve, reject, or ban a submitted ad, and rejecting/banning automatically frees up the seller's reservation credit for reuse (v1.5).

See Flow 2 in `application-flows.md`.

### Epic: Pay for ads and packs regardless of gateway

- As a buyer, I go through one central `/pagar` page for both ad-linked and pack-only purchases — the page adapts its UI based on what I'm buying (v1.22, v1.23).
- As a buyer, after paying via Webpay I see a full receipt (amount, authorization code, timestamp, payment type, order number) sourced directly from the payment gateway's response stored on my order (v1.26).
- As the business, payment gateway identifiers (`buy_order`, `token_ws`) are never used to look anything up externally — the Strapi `order.documentId` is always the canonical reference, so swapping payment gateways in the future doesn't break order lookups (codified across v1.21–v1.26, enforced in `CLAUDE.md`).
- As a PRO subscriber, my card is registered once via Webpay Oneclick Mall, then charged automatically every billing period with a 3-day retry window on failure (v1.46).

See Flow 3 in `application-flows.md`.

### Epic: Reservation credits that don't get wasted

- As a seller, when my ad is rejected or banned, the ad-reservation and featured-reservation slots I used are freed and returned to my available pool automatically (v1.5).
- As a seller, I always have a guaranteed minimum of free ad-reservation slots, restored daily by a cron job if I've used any (v1.8).
- As a user, another user can gift me reservation credits directly from the dashboard (v1.35).

See Flow 4 in `application-flows.md`.

### Epic: Every write to the system is traceable

- As an operator, every create/update/delete across all 21 content-types is logged with who did it (or `system` if unattended), what type of actor they were, and what record was touched — without needing to inspect application code or guess (Phase 5).
- As an operator, this traceability lives in the same log infrastructure (Winston/Better Stack) already used for error monitoring, not a separate audit database that needs its own retention policy (Phase 5, storage pivot).

See Flow 5 in `application-flows.md`.

### Epic: Background maintenance runs itself

- As an operator, expired ads decrement their remaining days and deactivate automatically overnight, orphaned reservation slots are restored, expired verification codes are purged, and the database is backed up on a rotation — all without manual intervention, and all individually re-triggerable on demand via `POST /api/cron-runner/:name` if something needs to run early (v1.7, v1.8, v1.36, v1.46).

See Flow 6 in `application-flows.md`.

## Patrones de entrega reutilizables

These are the delivery mechanics that made 129+ phases (and counting) shippable incrementally without regressions. They are extracted from how the phases in the table above were actually executed — not aspirational process — and are intended to be reused by future phases.

### 1. Vertical-slice plans, not layer-slice plans

Every phase is broken into plans that each deliver one complete, independently verifiable slice of behavior (e.g., "backend endpoint + frontend consumer + email template" together), rather than "all backend work" followed by "all frontend work." This is visible throughout — v1.21's draft flow, v1.24's free-ad endpoint, and Phase 4's legal-page split all shipped backend + frontend + seeder in the same plan or tightly sequenced plans, so nothing sat half-wired.

### 2. Wave-based parallelization with explicit dependencies

Multi-plan phases are grouped into numbered waves; plans within a wave touch disjoint files and run in parallel, while later waves depend on earlier ones' outputs. Phase 4 (legal pages) used 5 waves: content-types → seeders/URL-rename → frontend types/stores → public pages/dashboard CRUD → navigation. Phase 6 (this documentation set) uses 2 waves: BSD/FLOWS first (schema and flow truth), then TRD/PRD/IPD/UXD second (documents that consume BSD/FLOWS as inputs).

### 3. Wave-0 regression gates before risky fixes

For security- or correctness-sensitive work, a "Wave 0" plan writes RED-by-design characterization and injection tests *before* any fix lands, so the fix's success criterion is "these tests now pass" rather than manual judgment. Phase 1 (Codacy issues) used this for the authController NoSQL-injection and CSPRNG fixes — tests were written to fail against the vulnerable code first, confirming they'd catch a regression.

### 4. Storage/architecture pivots are allowed mid-phase, with the reasoning preserved

Phase 5's audit-log mechanism was originally a dedicated Strapi content-type (05-01), then deliberately deleted and replaced with the existing Winston logger (05-03) once it became clear the user's "log" meant existing logging infrastructure, not a new database table. The pivot is documented inline in STATE.md rather than silently overwritten — the original attempt, the reason for the change, and the final envelope shape are all traceable.

### 5. Mechanical homologation as its own plan, separated from feature work

When N pre-existing call sites need to be reshaped to a new convention (e.g., 05-04/05-05/05-06's ~62 `logger.*` calls reshaped to the `logAudit` envelope), that reshaping is scoped as its own "reshape-only" plan with an explicit diff-scope gate (no business-logic changes), rather than bundled into the plan that introduced the new convention.

### 6. Fix-forward over fix-everywhere when adding new surfaces

New content-types fix pre-existing bugs in the pattern they're copying without also fixing the bug at the original site. Phase 4's `cookie-policy`/`security-policy` `[id]` pages filter by `documentId` (correct for Strapi v5) instead of replicating the pre-existing `Number(id)` bug in `terms/[id]`/`policies/[id]` — the old bug stays explicitly out of scope, logged as a known issue rather than silently inherited or silently fixed as a drive-by.

### 7. Documentation-only phases get structural, not behavioral, verification

This phase (6) produces zero executable code, so its acceptance criteria are shell-verifiable structural checks (`grep`, `ls`, line counts) against the Markdown output, not a test suite. Each document's plan states its own literal grep gates up front (e.g., "must contain the string `FLOWS.md`") so the executor and verifier check the same thing.

### 8. Corrections belong inline, not in a separate changelog

When current code contradicts an existing doc or convention file (e.g., the actual cron count vs. `CLAUDE.md`'s stale "four cron jobs" claim, or the dashboard-merge fact), the correction is written as a short inline note at the point of contradiction — in an explicit "Inconsistencias detectadas" section for technical-requirements.md, or as a corrected fact plus citation elsewhere — rather than accumulated into a separate errata document that readers have to cross-reference.

### 9. Parallel documentation plans against a shared dependency graph

When multiple output documents share upstream inputs (BSD's schema, FLOWS' flow list), the phase plan makes the dependency graph explicit (`backend-schema.md`/`application-flows.md` → `technical-requirements.md`/`product-requirements.md`/`implementation-plan.md`/`ux-design.md`) so Wave 2 plans can run in parallel against each other without racing on their own shared inputs, only against the filesystem lock on `.planning/STATE.md`.

## Preguntas abiertas

- **Is the current post-v1.46 phase series (1–6, Codacy through this documentation phase) intended to become a future `v1.47` milestone, or does it stay unversioned indefinitely?** `.planning/ROADMAP.md` shows "No active milestone" for this series. Not something derivable from code or STATE.md — a planning/process question for the team, not a documentation gap.
- **Are milestones v1.41–v1.43 and v1.45 (Ad Preview Error Handling, Dashboard Session Persistence, Cross-App Session Replacement, User Onboarding) fully retired, or did any of their concerns get partially revisited in the v1.46 post-merge hardening rounds (phases 126–129)?** `.planning/ROADMAP.md` lists them as shipped and archived individually, but the density of session/auth-related work in v1.46 raises the possibility of overlap not captured at the milestone-index level. Flagged for the team to confirm rather than assumed either way here.

