---
phase: 06-generate-comprehensive-as-built-product-documentation-prd-trd-ux-ui-app-flows-backend-schema-implementation-plan-in-docs-verified-against-current-code-not-copied-from-potentially-stale-existing-docs
plan: 02
subsystem: documentation
tags: [flows, mermaid, as-built, auth, payment, cron, audit-log, reservations]
dependency_graph:
  requires: []
  provides:
    - "docs/FLOWS.md — 6 core app flows, each with a Mermaid diagram + happy/error/role-gated prose, re-derived from live source"
  affects:
    - "docs/PRD.md (Wave 2 — acceptance criteria derive from flow happy paths)"
    - "docs/IPD.md (Wave 2 — retrospective ties phases to flows they built)"
tech_stack:
  added: []
  patterns:
    - "Mermaid sequenceDiagram/stateDiagram-v2/flowchart per flow, matched to the flow's shape (round-trip auth = sequence, ad status = state machine, cron scheduling = flowchart)"
key_files:
  created:
    - "docs/FLOWS.md"
  modified: []
decisions:
  - "Wrote all 6 flows in a single Write call (efficiency), then committed as two separate task-scoped commits (flows 1-3, then flows 4-6) to preserve the plan's per-task atomic commit intent even though the underlying file content was authored together"
  - "adCreate/adResponse (older /payments/ad controller pair) documented as dead code — route is commented out in payment routes, replaced by unified checkoutCreate/webpayResponse — this is stated explicitly in Flow 3 rather than silently omitted, since the code still physically exists in payment.ts"
  - "PRO subscription payment flow (/payments/pro, /payments/pro-response, /payments/pro-cancel) explicitly scoped OUT of Flow 3's diagram — confirmed to exist and follow the same documentId/auth:false patterns, but is a separate recurring-billing flow not in the six mandated core flows; noted in Preguntas abiertas rather than silently dropped"
  - "AdFeaturedReservation restore has NO scheduled cron path — only the nightly userCron (ad-free-reservation-restore.cron.ts, restoreFreeAds()) restores AdReservation; featured reservations are only restored synchronously on reject/ban or via manager gift. This corrects an initial draft that (transcribed from RESEARCH.md prose) incorrectly claimed the cron handled both reservation types in one file"
metrics:
  duration_minutes: 55
  tasks_completed: 2
  files_changed: 1
  completed_date: "2026-07-02"
---

# Phase 06 Plan 02: App Flow Documentation (FLOWS.md) Summary

Produced `docs/FLOWS.md`, documenting all 6 mandated core application flows — authentication, ad lifecycle, payment/checkout, reservation system, CRUD+audit-log, and cron jobs — each re-derived directly from live Strapi controllers/services/routes and Nuxt middleware/server routes, with a Mermaid diagram and happy-path/error-state/role-gated-branch prose per flow.

## What Was Built

`docs/FLOWS.md` (352 lines), structured as:

1. **Flow 1 — Authentication:** local 2-step login (credentials → pendingToken → verification code → JWT), Google OAuth popup, Google One Tap (both bypass 2-step), the httpOnly `waldo_jwt` cookie set exclusively by Nitro server routes (never exposed to client JS), the catch-all proxy's `Authorization: Bearer` injection, SSR fail-open middleware pattern, and the `dashboard-guard.global.ts` manager role gate. Sequence diagram covering the full client↔Nitro↔Strapi round-trip.
2. **Flow 2 — Ad Creation → Moderation → Publish:** `computeAdStatus()` as the single source of truth for ad state (no separate status column), `saveDraft`/`approveAd`/`rejectAd`/`bannedAd`/`deactivateAd` service methods, the `global::isManager` route gate on approve/reject/banned (vs. `deactivateAd`'s in-service owner-or-manager check with no route policy), reservation release on reject/ban, and `adCron` expiry. State diagram (`stateDiagram-v2`) modeling the draft→pending→active/rejected/banned/archived transitions.
3. **Flow 3 — Payment/Checkout:** confirmed the *live* route set (`/payments/free-ad`, `/payments/checkout`, `/payments/webpay`, `/payments/thankyou/:documentId`, PRO routes) and explicitly flagged the older `/payments/ad` (`adCreate`/`adResponse`) pair as commented-out dead code, superseded by the unified `checkoutCreate`/`webpayResponse` flow. Documented the `order.documentId`-identity rule end-to-end (never `buy_order`/`token_ws`), the `auth:false` callback-route rationale (proxy would otherwise inject `Authorization` on Transbank's top-level GET redirect), the idempotent-replay guard, and the fail-closed `AD_FEATURED_PRICE` amount check. Sequence diagram covering both the free and Webpay-paid branches.
4. **Flow 4 — Reservation System:** reserve/consume on `publishAd()`, synchronous restore-to-null on reject/ban (both `AdReservation` and `AdFeaturedReservation`), the nightly `userCron` safety-net restore (confirmed `AdReservation`-only via direct source read), and manager-gated gift endpoints. Flowchart diagram.
5. **Flow 5 — CRUD + Audit Log:** the global `strapi.db.lifecycles.subscribe()` hook registered as the first bootstrap statement, the exact `actor`/`actor_type` resolution mechanism (via `reqCtx.state.auth.strategy.name`, not a naive user-presence check), the Winston-based envelope (no DB table — this document is the canonical description, cross-linked rather than re-explained in Flows 2/3), and the documented bulk-`*Many` scope boundary. Flowchart diagram.
6. **Flow 6 — Cron Jobs:** corrected the stale "4 cron jobs" claim (present in both `CLAUDE.md` and the phase's own `06-CONTEXT.md` D-06) to the actual 6 active + 1 manual-only job, with a full schedule/source-file/purpose table verified directly against `apps/strapi/config/cron-tasks.ts`. Flowchart diagram.
7. **Preguntas abiertas:** 3 genuine open items (analytics-events.md staleness not re-verified, cron-runner endpoint access-control not re-verified, PRO payment flow deliberately out of this document's diagram scope).

## Deviations from Plan

### Process deviation (not a Rule 1-4 case, but disclosed for transparency)

**Single-pass authoring, two-commit structure.** The plan specifies Task 1 (flows 1-3) and Task 2 (flows 4-6) as sequential, separately-committed units. All 6 flows were authored in a single `Write` call for efficiency (the file's structure — shared TOC, cross-references between flows — made incremental append-only authoring more error-prone than writing the whole document at once with full context of all 6 flows). To preserve the plan's atomic-commit intent, the work was still split into two commits: the first commit captured the file as flows 1-3 content plus scaffolding; a second commit captured a source-verification correction pass scoped to flows 4-6 (see below). Both tasks' independent acceptance-criteria greps pass against the final state.

### Auto-fixed Issues

**1. [Rule 1 - Bug/accuracy] Flows 4-6 initially drafted from RESEARCH.md/STATE.md prose instead of live source**

- **Found during:** Advisor review after Task 2's grep-based verification passed but before finalizing.
- **Issue:** Flows 1-3 were traced by opening every controller/service/route file directly. Flows 4-6 were drafted using RESEARCH.md's "Common Pitfalls" table and STATE.md's decision log as the primary source — this is exactly the anti-pattern D-06/D-10 prohibit ("re-derived from CURRENT source, not from RESEARCH.md prose"). Passing grep checks (`grep -q verificationCodeCleanupCron`) only confirmed a string was present, not that the schedule/path/purpose next to it was accurate.
- **Fix:** Read `apps/strapi/config/cron-tasks.ts`, `apps/strapi/src/cron/ad-free-reservation-restore.cron.ts`, `apps/strapi/src/subscribers/audit-log.subscriber.ts`, and `apps/strapi/src/utils/audit-log/index.ts` directly. The Flow 6 cron table was confirmed fully accurate against source (all 6 schedules, source-file paths, and the `userConfirmedMigration` far-future cron expression matched). Two corrections were made:
  - Flow 4: the claim that `ad-free-reservation-restore.cron.ts` "handles both ad and featured-reservation restoration in one file" was **false** — `restoreFreeAds()` only restores `AdReservation` records; `AdFeaturedReservation` has no scheduled restore path (an earlier `featuredCron` was implemented and reverted per STATE.md's own decision log). Corrected prose and the Mermaid diagram to state this precisely.
  - Flow 5: the claim that actor resolution reads `strapi.requestContext.get()?.state?.user` directly was imprecise — the actual mechanism inspects `reqCtx.state.auth.strategy.name` (`"admin"` vs `"users-permissions"` vs absent) to determine `actor_type` first, then reads `.user?.id` only when a real user type resolved. Corrected to describe the exact mechanism.
- **Files modified:** `docs/FLOWS.md`
- **Commit:** `00c15b13`

## Verification Results

```
mermaid count: 6 (>= 6 required, D-07)
Preguntas abiertas: present (D-09)
cron correction (verificationCodeCleanupCron + subscriptionChargeCron both present): OK
Flow 1/2/3/4/5/6 headings: all present
waldo_jwt cookie named: OK
order.documentId identity rule stated: OK
Table of Contents present: OK (D-02)
ad-free-reservation-restore.cron.ts (correct reservation cron path, not the stale crons/user-*.cron.ts): OK
actor_type / audit envelope described once, cross-linked from Flows 2/3: OK
```

## Self-Check: PASSED

- `docs/FLOWS.md` — FOUND (352 lines)
- Commit `c059c161` (Task 1, flows 1-3) — FOUND in `git log`
- Commit `00c15b13` (Task 2, flows 4-6 + source-verification corrections) — FOUND in `git log`
