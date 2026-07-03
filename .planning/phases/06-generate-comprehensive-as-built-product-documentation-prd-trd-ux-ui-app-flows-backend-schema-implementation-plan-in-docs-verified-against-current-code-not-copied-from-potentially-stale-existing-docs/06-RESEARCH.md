# Phase 6: Generate Comprehensive As-Built Product Documentation - Research

**Researched:** 2026-07-02
**Domain:** Technical documentation synthesis (as-built, verified-against-code) — not code implementation
**Confidence:** HIGH (all claims below verified directly against the live filesystem/source in this repo, not training data)

## Summary

This is a writing/synthesis phase: produce six Markdown documents in `/docs` (PRD, TRD, UXD, FLOWS, BSD, IPD) describing the Waldo Project as it exists today. There is no library or framework to select — the "stack" for this phase is the repo itself plus Mermaid for diagrams. The research value here is **verification legwork**: confirming every canonical ref in 06-CONTEXT.md exists, cataloguing the real file set behind each of the 6 priority flows, listing the actual Strapi content-types (including the one that hides in `extensions/`, not `api/`), and flagging concrete staleness in the existing `/docs/*.md` and `CLAUDE.md` so the planner scopes corrections instead of copy-pasting stale claims forward.

Two confirmed, load-bearing facts drive the plan structure: (1) `apps/dashboard` does not exist — `pnpm-workspace.yaml` lists only `apps/strapi` and `apps/website`, and all dashboard routes live at `apps/website/app/pages/dashboard/**`, gated by `dashboard-guard.global.ts`; (2) the cron job count in 06-CONTEXT.md's D-06 ("adCron, userCron, backupCron, cleanupCron" — 4 jobs) is itself stale — `apps/strapi/config/cron-tasks.ts` registers **6 active cron tasks** (`userCron`, `adCron`, `cleanupCron`, `backupCron`, `verificationCodeCleanupCron`, `subscriptionChargeCron` when `PRO_ENABLE=true`) plus one manual-trigger-only migration task (`userConfirmedMigration`). Per D-10 ("current code wins"), FLOWS.md must document all 6, not 4, and this correction itself belongs in the "Inconsistencias detectadas" note.

**Primary recommendation:** Structure the phase as two waves — Wave 1 (parallel, per-flow/per-domain verification passes producing scratch notes or directly drafting flow sections) and Wave 2 (document assembly, since BSD's schema and FLOWS' flow list feed TRD/PRD/IPD). Treat each of the 6 documents as its own plan-scoped unit of work with concrete, greppable acceptance criteria (e.g., "FLOWS.md contains exactly 6 named ```mermaid blocks", "BSD.md's entity table row count matches `ls apps/strapi/src/api/*/content-types/*/schema.json | wc -l` + 1 for User").

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Six documents in `/docs`, acronym filenames: `PRD.md`, `TRD.md`, `UXD.md` (UX/UI Design), `FLOWS.md` (App Flow), `BSD.md` (Backend Schema Document), `IPD.md` (Implementation Plan Document).
- **D-02:** Each document is self-contained with its own table of contents.
- **D-03:** PRD's "MVP y futuras iteraciones" section = current shipped baseline + forward-looking backlog (from `.planning/ROADMAP.md` shipped milestones + open backlog/todos), not a from-zero MVP definition.
- **D-04:** IPD's "Roadmap por fases / Épicas / Historias de usuario" = a retrospective account of how the product was actually built (phases 1–129+ per `.planning/milestones/`), reframed as reusable delivery patterns for future work — not a fictitious build-from-scratch plan. Explicitly note this reframing at the top of IPD.md.
- **D-05:** "Criterios de aceptación" in PRD = behaviors already verified as shipped (cross-referenced to code/tests), not speculative acceptance criteria.
- **D-06:** Every flow in FLOWS.md must be re-derived from current source, not from `.planning/codebase/*` or `.planning/milestones/*` prose alone. Minimum flow set: (1) authentication (JWT via httpOnly proxy cookie `waldo_jwt`, Google One Tap, two-step verification, email auth), (2) ad creation → moderation → publish lifecycle, (3) payment/checkout (Webpay + gateway-agnostic, `order.documentId` identity per CLAUDE.md payment rules), (4) reservation system (ad + featured reservations, restore-on-reject/ban), (5) CRUD + audit-log (Phase 5, logger-based envelope `{actor, actor_type, data}`), (6) cron jobs. **NOTE (research correction, D-10 applies):** D-06's literal cron enumeration ("adCron, userCron, backupCron, cleanupCron") undercounts — see Common Pitfalls below. Document all 6 active cron tasks.
- **D-07:** Each flow gets a Mermaid diagram (sequence or flowchart, whichever fits) plus prose covering happy path, error states, and role-gated branches.
- **D-08:** The dashboard-is-merged-into-website discrepancy must be explicitly called out in TRD's architecture section and in a top-level "Inconsistencias detectadas" note — do not silently normalize it away.
- **D-09:** Every document carries a "Preguntas abiertas" section. Populate with genuine unknowns; state "ninguna identificada" explicitly if nothing found — never leave as a stub.
- **D-10:** Where `.planning/codebase/*` or `/docs/*.md` conflict with current code, current code wins; note the correction inline (short note, not a changelog).
- **D-11:** Senior/staff-engineer level depth — technical precision over hand-holding; Spanish UX copy stays quoted verbatim where relevant.
- **D-12:** Document body content in English, except direct quotes of Spanish UI strings.

### Claude's Discretion

- Exact section ordering within each document beyond what the user specified.
- Whether ER diagram + endpoint tables live in BSD.md only or are cross-linked from TRD.md (avoid duplication — single source of truth, cross-reference).
- Which Mermaid diagram type (flowchart vs sequenceDiagram vs stateDiagram) fits each flow best.
- Whether to produce one PLAN per document or fewer PLANs covering multiple documents, in the execute-phase step.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope. No scope-creep signals in the original request; it was a single, bounded documentation-generation ask.

## Phase Requirements

No formal REQUIREMENTS.md exists for this ad-hoc milestone phase. The 06-CONTEXT.md decisions (D-01 through D-12) ARE the requirements; there are no separate REQ-IDs to map.

## Canonical Refs Verification (all confirmed to exist, 2026-07-02)

| Ref | Status | Note |
|---|---|---|
| `CLAUDE.md` (repo root) | EXISTS | Confirmed stale: describes `apps/dashboard` as separate app (see Pitfalls) |
| `.planning/PROJECT.md` | EXISTS | |
| `.planning/STATE.md` | EXISTS | |
| `.planning/codebase/ARCHITECTURE.md`, `STACK.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `INTEGRATIONS.md`, `TESTING.md`, `CONCERNS.md` | ALL EXIST | Leads only, dated 2026-06-10 |
| `docs/data-model.md`, `payment-flow.md`, `permissions.md`, `ad-statuses.md`, `reservation-system.md`, `analytics-events.md`, `cache.md`, `deployment.md`, `env-vars.md` | ALL EXIST | See Pitfalls for confirmed staleness in `data-model.md`, `reservation-system.md`; `analytics-events.md` dated Mar 14 (oldest — higher staleness risk, not independently verified here) |
| `.planning/milestones/` | EXISTS | 46 milestone dirs, v1.1 through v1.46 |
| `.planning/ROADMAP.md` | EXISTS | 119 lines, full milestone history to v1.46 |
| `apps/strapi/src/api/payment/controllers/payment.ts` | EXISTS | |
| `apps/website/app/middleware/dashboard-guard.global.ts`, `auth.ts` | BOTH EXIST | Read in full — see Code Examples |
| `apps/website/server/api/` | EXISTS | Nitro proxy layer confirmed: `[...].ts` catch-all + `auth/` subtree |
| `apps/strapi/src/index.ts` | EXISTS | Bootstrap wires `registerAuditLogSubscriber(strapi)` as line 32 |
| `apps/strapi/src/**/*.cron.ts` | EXISTS, but path is `apps/strapi/src/cron/` (singular), not `crons/` | 6 files, see Pitfalls |
| `apps/strapi/src/api/*/content-types/*/schema.json` | EXISTS, 20 files | Misses `User`, which lives in `extensions/` — see BSD Entity Set below |

## BSD Entity Set (confirmed from filesystem)

**20 content-types under `apps/strapi/src/api/*/content-types/*/schema.json`:**

```
ad-featured-reservation, ad-pack, ad-reservation, ad, article, category, commune,
condition, contact, cookie-policy, faq, order, policy, region, remaining,
security-policy, subscription-payment, subscription-pro, term, verification-code
```

**Plus 1 content-type NOT under `apps/strapi/src/api/`:**

- `User` — lives at `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` (Strapi's users-permissions plugin extension pattern). **A `find apps/strapi/src/api/*/content-types/*/schema.json` or `ls` command alone will silently miss User** — the BSD.md ER diagram's central entity. The planner must instruct the executor to explicitly include this path.

**Full entity set for BSD.md's ER diagram = 21 entities.**

Cross-check against `docs/data-model.md`'s existing entity table (11 entities listed: User, Ad, AdReservation, AdFeaturedReservation, Order, Pack, SubscriptionPro, SubscriptionPayment, Category, Commune, Region, Policy, Faq, Term, Condition, Article — actually 16, still) — **missing from that doc**: `cookie-policy`, `security-policy` (added Phase 4, 2026-07-01), `remaining` (used by the ad-expiry cron for decrement-once-per-day tracking), `contact`, `verification-code`. These 5 must be added when BSD.md supersedes `data-model.md`'s table.

## Architecture Patterns

### Recommended Document Set Layout (in `/docs`, additive — existing `/docs/*.md` untouched)

```
docs/
├── PRD.md      # Product Requirements — problem, personas, MVP+backlog, acceptance criteria
├── TRD.md      # Technical Requirements — stack, architecture (incl. "Inconsistencias detectadas"), NFRs
├── UXD.md      # UX/UI Design — page inventory, component patterns, BEM/SCSS conventions, brand palette
├── FLOWS.md    # App Flow — 6 flows, each with Mermaid diagram + prose
├── BSD.md      # Backend Schema — ER diagram (21 entities), endpoint tables (cross-link docs/permissions.md)
└── IPD.md      # Implementation Plan — retrospective phase/milestone history reframed as delivery patterns
```

Existing `/docs/*.md` files (data-model, payment-flow, permissions, ad-statuses, reservation-system, analytics-events, cache, deployment, env-vars) keep their names and become **source material with corrections**, cross-linked from the new acronym docs rather than duplicated.

### Cross-Document Dependency Graph

```
BSD.md (entity/schema truth)
   │
   ├──> feeds TRD.md (architecture section references BSD's data layer)
   │
FLOWS.md (6 verified flows)
   │
   ├──> feeds PRD.md (use cases / acceptance criteria derive from flow happy paths)
   └──> feeds IPD.md (retrospective ties phases to which flows they built)

TRD.md (architecture, incl. dashboard-merge fact)
   │
   └──> UXD.md references TRD's page/route inventory for the public-vs-dashboard split
```

This is why a two-wave structure fits: **Wave 1** produces the verified raw material (schema inventory, 6 flow write-ups with diagrams, page/component inventory, milestone/phase retrospective extraction) — these are largely independent and parallelizable per-flow/per-domain. **Wave 2** assembles/cross-links the 6 final documents, since PRD/TRD/UXD/IPD consume BSD's and FLOWS' outputs.

### Pattern: Verification-before-write for as-built docs

**What:** For every factual claim sourced from `.planning/codebase/*` or existing `/docs/*.md`, re-derive it from the current source file(s) before writing it into the new doc. Do not transcribe.
**When to use:** Every claim in every one of the 6 documents — this is the explicit phase mandate (D-06, D-10).
**Example of the pattern already correctly modeled in this repo:** `docs/payment-flow.md` itself states "Order identity is always `order.documentId`" and cites gateway fields as audit-only — this matches the live `payment.ts` route table and CLAUDE.md's payment rules. Use this doc as the quality bar for FLOWS.md's payment section, after re-verifying against `apps/strapi/src/api/payment/controllers/payment.ts` and `apps/strapi/src/api/payment/routes/payment.ts` directly (confirmed routes: `/payments/free-ad`, `/payments/checkout`, `/payments/webpay`, `/payments/thankyou/:documentId`, `/payments/pro`, `/payments/pro-response`, `/payments/pro-cancel`).

### Anti-Patterns to Avoid

- **Copying `.planning/codebase/ARCHITECTURE.md` prose verbatim into TRD.md:** it is dated 2026-06-10 and is explicitly flagged in 06-CONTEXT.md as a lead, not a source of truth. Re-verify every structural claim (package list, app boundaries, integration list) against the current filesystem.
- **Treating "4 cron jobs" as fact because CLAUDE.md and 06-CONTEXT.md both say it:** both are wrong. Verify against `apps/strapi/config/cron-tasks.ts`, not prose.
- **Writing BSD.md's entity list from `apps/strapi/src/api/*` glob alone:** misses `User` (lives in `extensions/`). Same risk pattern could apply to other plugin-extension content-types — grep `apps/strapi/src/extensions/**/content-types/*/schema.json` explicitly as a second pass.
- **Skipping the "Preguntas abiertas" section when nothing was found:** D-09 requires an explicit "ninguna identificada" statement, not an omitted section.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Flow diagrams | ASCII art (as `docs/reservation-system.md` currently uses) or hand-drawn images | Mermaid `sequenceDiagram`/`flowchart`/`stateDiagram-v2` fenced code blocks | D-07 explicitly requires Mermaid; GitHub/most Markdown viewers render Mermaid natively; text-diffable in future updates |
| ER diagram | Manual box-and-arrow prose (as `docs/data-model.md` currently uses) | Mermaid `erDiagram` | Same rationale — text-diffable, and Mermaid `erDiagram` syntax directly maps Strapi schema.json `attributes.relation` fields to relationship cardinality notation (`||--o{`, etc.) |
| Milestone/phase history extraction | Re-reading every phase folder's PLAN/SUMMARY files individually | `.planning/ROADMAP.md` (already the curated index, 119 lines, v1.1–v1.46) + `.planning/milestones/*-ROADMAP.md` per milestone | ROADMAP.md is already the authoritative shipped-milestone index; re-deriving from scratch duplicates work D-03/D-04 already point at |

**Key insight:** This phase's "don't hand-roll" isn't about libraries — it's about not re-deriving indices that already exist (`.planning/ROADMAP.md` for IPD, `docs/permissions.md` for BSD's endpoint tables) while still re-verifying their *content* against live code per D-10.

## Runtime State Inventory

Not applicable — this phase is pure documentation generation with explicit "no code changes" scope (see Phase Boundary in 06-CONTEXT.md). No rename/refactor/migration occurs. Skipping this section per the trigger condition in the agent instructions.

## Common Pitfalls

### Pitfall 1: Cron job undercounting (confirmed stale in BOTH CLAUDE.md and 06-CONTEXT.md D-06)
**What goes wrong:** Both the project's own CLAUDE.md ("Four active cron jobs: `adCron` (1 AM), `userCron` (2 AM), `backupCron` (3 AM), `cleanupCron` (Sunday 4 AM)") and 06-CONTEXT.md's D-06 enumerate only 4 cron jobs.
**Why it happens:** CLAUDE.md predates later cron additions and was never updated; 06-CONTEXT.md's author (auto-mode discussion) inherited the stale count from CLAUDE.md without cross-checking `cron-tasks.ts`.
**What's actually true (verified in `apps/strapi/config/cron-tasks.ts`, registered via `apps/strapi/config/server.ts`'s `cron: { enabled: true, tasks: cronTasks }`):**
| Key | Schedule | Source file | Notes |
|---|---|---|---|
| `userCron` | `0 2 * * *` (2 AM Santiago) | `src/cron/ad-free-reservation-restore.cron.ts` | Restores free ad reservation slots |
| `adCron` | `0 1 * * *` (1 AM Santiago) | `src/cron/ad-expiry.cron.ts` | Decrements `remaining_days`, deactivates expired ads |
| `cleanupCron` | `0 4 * * 0` (Sun 4 AM) | `src/cron/media-cleanup.cron.ts` | Orphan image audit (Cloudinary), audit-only, never auto-deletes |
| `backupCron` | `0 3 * * *` (3 AM Santiago) | `src/cron/bbdd-backup.cron.ts` | pg_dump DB backup, 7-file rotation |
| `verificationCodeCleanupCron` | `0 4 * * *` (4 AM Santiago) | `src/cron/verification-code-cleanup.cron.ts` | Deletes expired verification-code records |
| `subscriptionChargeCron` | `0 5 * * *` (5 AM Santiago), **only registered when `PRO_ENABLE=true`** | `src/cron/subscription-charge.cron.ts` | Monthly PRO billing via Oneclick |
| `userConfirmedMigration` | `0 0 1 1 *` (never auto-fires — far-future placeholder) | inline, calls `../seeders/user-confirmed-migration` | Manual-trigger-only, via `POST /api/cron-runner/user-confirmed-migration` |

**How to avoid:** FLOWS.md's cron section and TRD.md must state the correct count (6 active + 1 manual-only) and cite `cron-tasks.ts` directly, not CLAUDE.md. Per D-10, this is a "current code wins, note the correction inline" case — belongs in the "Inconsistencias detectadas" note alongside the dashboard-merge fact.
**Warning signs:** Any doc draft that says "four cron jobs" without a `cron-tasks.ts` citation.

### Pitfall 2: `docs/reservation-system.md`'s cron path is wrong
**What goes wrong:** The doc's "Key Source Files" table states `User cron (slot restoration) | apps/strapi/src/crons/user-*.cron.ts` — plural `crons/` directory and a `user-*` glob that doesn't match any real file.
**Reality:** The actual directory is `apps/strapi/src/cron/` (singular), and the actual file is `ad-free-reservation-restore.cron.ts` (class name `UserCronService`, default export).
**How to avoid:** When BSD.md/FLOWS.md/TRD.md cite this doc's content for the reservation flow, correct the path. Also verify the featured-reservation restore logic lives in the same file or a sibling — confirmed: `ad-free-reservation-restore.cron.ts` handles both via its `restoreFreeAds()` method (single file, not two).

### Pitfall 3: `docs/data-model.md` entity table is incomplete post-Phase-4
**What goes wrong:** Table lists 16 entities but omits `CookiePolicy`, `SecurityPolicy` (added 2026-07-01, Phase 4 — very recent, plausible the doc predates them since its file mtime is 2026-06-10), `Remaining` (used by ad-expiry cron), `Contact`, `VerificationCode`.
**How to avoid:** BSD.md's entity table must be built from the filesystem glob (21 entities per BSD Entity Set section above), not by extending `data-model.md`'s existing rows.

### Pitfall 4: CLAUDE.md's `apps/dashboard` claim (already flagged in 06-CONTEXT.md D-08, confirmed here)
**What goes wrong:** CLAUDE.md's "Project Context" section describes three apps: `apps/website`, `apps/dashboard`, `apps/strapi`, and a "Nuxt apps (`apps/website`, `apps/dashboard`)" heading for shared conventions.
**Reality confirmed:** `pnpm-workspace.yaml` packages list is `['apps/strapi', 'apps/website']` only; `ls apps/` returns only `strapi` and `website`; all dashboard UI is under `apps/website/app/pages/dashboard/**` (10 subdirectories: `featured`, `articles`, `users`, `integrations`, `maintenance`, `orders`, `account`, `reservations`, `ads`, plus `index.vue`), gated by `apps/website/app/middleware/dashboard-guard.global.ts`.
**How to avoid:** TRD.md's architecture section must state the 2-package reality explicitly and cross-reference this as the "Inconsistencias detectadas" top-level note (D-08 already mandates this — treat as confirmed, not merely alleged).

### Pitfall 5: `nyquist_validation: true` in config, but this phase produces zero executable code
**What goes wrong:** A generic Validation Architecture section modeled on unit-test commands (pytest/jest) doesn't fit a documentation-only phase — there is no `tests/` coverage possible for "does BSD.md have an accurate ER diagram."
**How to avoid:** See Validation Architecture section below — acceptance criteria must be shell-verifiable structural checks (grep/wc/diff against filesystem), not test-runner commands.

## Code Examples

### Verified working auth middleware pattern (for FLOWS.md's authentication flow, sequenceDiagram candidate)

```typescript
// Source: apps/website/app/middleware/auth.ts (read in full, verified 2026-07-02)
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSessionUser();
  if (!user.value) {
    // SSR fail-open: skip on server; client hydration re-runs this guard after
    // the session plugin has populated user state via fetchUser(). Pattern per D-03.
    if (import.meta.server) return;
    const { fetchUser } = useSessionAuth();
    try {
      await fetchUser(); // 401 = anonymous; sets user.value = null silently
    } catch {
      /* Strapi unavailable — treat as unauthenticated */
    }
  }
  if (!user.value) {
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    return navigateTo("/login");
  }
});
```

```typescript
// Source: apps/website/app/middleware/dashboard-guard.global.ts (read in full, verified 2026-07-02)
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/dashboard")) return;
  const user = useSessionUser<User>();
  if (!user.value) {
    if (import.meta.server) return navigateTo("/login");
    const { fetchUser } = useSessionAuth();
    try { await fetchUser(); } catch { /* anonymous */ }
  }
  if (!user.value) return navigateTo("/login");
  const roleName = user.value.role?.name?.toLowerCase() ?? null;
  if (!roleName) return; // SSR fail-open skip per D-03 (research Open Q #4)
  if (roleName !== "manager") return navigateTo("/");
});
```

### Verified audit-log envelope (for FLOWS.md's CRUD+audit-log flow — cross-reference, do not duplicate description across flows 2/3/5)

```typescript
// Source: apps/strapi/src/utils/audit-log/index.ts (read in full, verified 2026-07-02)
export interface AuditMeta {
  actor: number | "system";
  actor_type: "admin::user" | "plugin::users-permissions.user" | "system";
  data?: Record<string, unknown>;
}
// logAuditInfo/logAuditWarn/logAuditError wrap the Winston logger with this envelope
```

Registered as the first bootstrap statement in `apps/strapi/src/index.ts`:
```typescript
async bootstrap({ strapi }) {
  registerAuditLogSubscriber(strapi); // apps/strapi/src/subscribers/audit-log.subscriber.ts
  ...
}
```

## Per-Flow File Map (for Task #3 — concrete paths an executor opens to verify each flow)

### Flow 1: Authentication (highest scrutiny per user emphasis — most files)

**Backend (Strapi):**
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — local login step 1 (returns `pendingToken`), register, password reset
- `apps/strapi/src/api/auth-verify/controllers/auth-verify.ts` — step 2, code verification, JWT issuance
- `apps/strapi/src/api/auth-google/controllers/auth-google.ts` — Google OAuth
- `apps/strapi/src/api/auth-one-tap/controllers/auth-one-tap.ts` — Google One Tap
- `apps/strapi/src/services/google/services/google-auth.service.ts`
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — user fields incl. `confirmed`, role relation
- `apps/strapi/src/cron/verification-code-cleanup.cron.ts` — expired code cleanup (ties into this flow)

**Frontend (Nuxt — proxy layer):**
- `apps/website/server/api/auth/verify-code.post.ts`, `logout.post.ts`, `google-one-tap.post.ts`, `google/`, `google-oauth/`, `facebook/` — Nitro server routes that set/clear the httpOnly `waldo_jwt` cookie
- `apps/website/server/api/[...].ts` — catch-all proxy injecting `Authorization: Bearer` from the httpOnly cookie into all other Strapi calls

**Frontend (Nuxt — client):**
- `apps/website/app/middleware/auth.ts`, `dashboard-guard.global.ts`, `guest.ts`, `onboarding-guard.global.ts` — route guards
- `apps/website/app/composables/useSessionUser.ts`, `useSessionAuth.ts`, `useSessionClient.ts` — session state/actions
- `apps/website/app/pages/login/index.vue`, `google.vue`, `facebook.vue`, `verificar.vue` — login pages
- `apps/website/app/pages/registro/index.vue`, `confirmar.vue`, `activar.vue` — registration pages
- `apps/website/app/components/FormLogin.vue`, `FormRegister.vue`, `FormVerifyCode.vue`, `LoginWithGoogle.vue`, `LoginWithFacebook.vue`, `LightboxLogin.vue`, `LightboxRegister.vue`, `LinkLogin.vue`

### Flow 2: Ad creation → moderation → publish lifecycle

- `apps/strapi/src/api/ad/controllers/ad.ts` — `approveAd`, `rejectAd`, `banned`/`bannedAds`, `rejecteds`, save-draft, upload
- `apps/strapi/src/api/ad/services/ad.ts` — `computeAdStatus()`, `publishAd()`, business logic
- `apps/strapi/src/api/ad/routes/` — route + policy wiring (`global::isManager` for approve/reject/banned)
- `apps/strapi/src/api/ad/content-types/ad/schema.json` — status-relevant fields (`draft`, `active`, `banned`, `rejected`, `remaining_days`, `actived_at`, `rejected_at`, `banned_at`)
- `apps/strapi/src/cron/ad-expiry.cron.ts` — daily decrement/expiry
- `docs/ad-statuses.md` — existing lead, re-verify against `computeAdStatus()`
- `apps/website/app/pages/anunciar/**` — ad creation wizard pages
- `apps/website/app/pages/dashboard/ads/**` — manager moderation UI

### Flow 3: Payment/checkout

- `apps/strapi/src/api/payment/controllers/payment.ts` — all payment endpoints
- `apps/strapi/src/api/payment/routes/payment.ts` — confirmed paths: `/payments/free-ad`, `/payments/checkout`, `/payments/webpay`, `/payments/thankyou/:documentId`, `/payments/pro`, `/payments/pro-response`, `/payments/pro-cancel`
- `apps/strapi/src/api/payment/services/ad.service.ts`, `pack.service.ts`, `checkout.service.ts`, `free-ad.service.ts` — homologated to `logAudit*` in Phase 5
- `apps/strapi/src/api/payment/utils/order.utils.ts`, `general.utils.ts`, `user.utils.ts`
- `apps/strapi/src/api/order/` — Order content-type, controller, service
- `apps/strapi/src/cron/subscription-charge.cron.ts` — monthly PRO billing (Oneclick)
- `apps/website/app/pages/pagar/**`, `apps/website/app/pages/pro/**` — checkout/PRO frontend pages
- `docs/payment-flow.md` — existing lead, confirmed largely accurate against routes; re-verify webpay/pro-response `auth:false` claims against route config

### Flow 4: Reservation system

- `apps/strapi/src/api/ad-reservation/` — AdReservation content-type/controller/service (incl. `/gift` endpoint, `global::isManager`)
- `apps/strapi/src/api/ad-featured-reservation/` — AdFeaturedReservation, same pattern
- `apps/strapi/src/cron/ad-free-reservation-restore.cron.ts` — restore-on-reject/ban logic (correct path — `docs/reservation-system.md` cites the wrong path, see Pitfall 2)
- `apps/strapi/src/api/ad/services/ad.ts` — `publishAd()` slot-consumption tie-in
- `docs/reservation-system.md` — existing lead, re-verify lifecycle diagram against `ad.ts`/cron logic, correct the source-file path

### Flow 5: CRUD + audit-log

- `apps/strapi/src/subscribers/audit-log.subscriber.ts` — global `db.lifecycles.subscribe()` hook
- `apps/strapi/src/utils/audit-log/index.ts` — `logAuditInfo`/`logAuditWarn`/`logAuditError` envelope helper
- `apps/strapi/src/index.ts` — bootstrap registration (first statement)
- Homologated call sites (Phase 5, all confirmed complete per STATE.md): `apps/strapi/src/api/payment/controllers/payment.ts`, `apps/strapi/src/api/payment/services/ad.service.ts`, `pack.service.ts`, `checkout.service.ts`, `free-ad.service.ts`, `apps/strapi/src/api/ad/controllers/ad.ts`
- **Cross-reference, don't duplicate:** this flow's envelope description overlaps flows 2 and 3 (ad/payment logging) — FLOWS.md should describe the envelope once here and link to it from flows 2/3's error-state sections rather than re-explaining.

### Flow 6: Cron jobs

- `apps/strapi/config/cron-tasks.ts` — registration + schedule (source of truth — see Pitfall 1 for full corrected table)
- `apps/strapi/config/server.ts` — `cron: { enabled, tasks }` wiring
- `apps/strapi/src/cron/*.cron.ts` — all 6 implementation files (`ad-expiry`, `ad-free-reservation-restore`, `bbdd-backup`, `media-cleanup`, `verification-code-cleanup`, `subscription-charge`)
- `apps/strapi/src/api/cron-runner/controllers/cron-runner.ts`, `routes/cron-runner.ts` — manual trigger endpoint (`POST /api/cron-runner/:name`)

## UXD.md Source Orientation (no existing `/docs/*.md` covers this — verified fresh)

- **Page inventory (public):** `apps/website/app/pages/` top-level dirs — `anunciar`, `anuncios`, `blog`, `contacto`, `cuenta`, `login`, `onboarding`, `packs`, `pagar`, `pro`, `registro`, plus top-level files `index.vue`, `[slug].vue`, `politicas-de-*.vue` (3), `terminos-y-condiciones-de-uso.vue`, `preguntas-frecuentes.vue`, `recuperar-contrasena.vue`, `restablecer-contrasena.vue`, `sitemap.vue`, `dev.vue`.
- **Page inventory (dashboard, gated):** `apps/website/app/pages/dashboard/` — `featured`, `articles`, `users`, `integrations`, `maintenance`, `orders`, `account`, `reservations`, `ads`, plus `index.vue`.
- **Components:** `apps/website/app/components/` — 225 `.vue` files, flat directory (no subdirs except `icons/`), PascalCase, prefixed by role (`Form*`, `Card*`, `Lightbox*`, `Menu*`, `Login*`, etc.) per CLAUDE.md naming convention.
- **Styling system:** `apps/website/app/scss/abstracts/_variables.scss` (brand palette — cross-reference CLAUDE.md's color token table, do not re-invent), `apps/website/app/scss/app.scss` (entry), `apps/website/app/scss/components/*.scss` (one file per BEM block, ~20+ files: `_accordion`, `_category`, `_pagination`, `_badge`, `_sidebar`, `_payment`, `_faqs`, `_toast`, `_filter`, `_share`, etc.).
- **UXD.md should document:** page inventory (public vs dashboard split, cross-referencing TRD's architecture note on the merged app), component taxonomy/naming conventions, BEM block list with SCSS file mapping, brand palette (quote directly from CLAUDE.md's table — do not re-derive hex values), and Spanish UI copy conventions (quote verbatim per D-11/D-12).
- **Confidence:** MEDIUM — oriented on structure (file/dir inventory), but did not open individual component files to audit visual/interaction patterns in depth; that is executor-level verification work for the actual UXD.md plan.

## State of the Art

Not applicable in the traditional "old library vs new library" sense — this is an internal documentation phase, not a tech-adoption phase. The relevant "old vs new" axis is **doc staleness**, already covered in Common Pitfalls.

## Open Questions

1. **Does `docs/analytics-events.md` (dated 2026-03-14, oldest of the 9 existing docs) still match the current GA4 event implementation?**
   - What we know: file exists, not independently verified against `apps/strapi/src/services/google/` or website GTM/GA4 composables in this research pass.
   - What's unclear: whether analytics events changed between Mar 14 and now (multiple ecommerce/GA4-related quick-tasks appear in STATE.md's Quick Tasks table, e.g. `260329-pa1`, `260401` CSP fixes).
   - Recommendation: not one of the 6 mandatory flows (D-06), so lower priority — flag for the executor to spot-check if time allows when writing FLOWS.md or TRD.md's integrations section, but do not block the phase on it.

2. **Are there other plugin-extension content-types besides `User` that the `apps/strapi/src/api/*` glob would miss for BSD.md?**
   - What we know: `User` is confirmed to live under `extensions/users-permissions/content-types/user/`. No other `extensions/` subdirectories were found to contain `content-types/` in this pass (`apps/strapi/src/extensions/` only has `users-permissions/` besides a `.gitkeep`).
   - What's unclear: nothing further — this is effectively resolved (User is the only exception), but the executor should re-run `find apps/strapi/src/extensions -path "*/content-types/*/schema.json"` at BSD.md write time to confirm no drift.
   - Recommendation: state as resolved in BSD.md's own verification, not as an open question in the final doc.

## Validation Architecture

This phase produces zero executable application code — `nyquist_validation: true` in `.planning/config.json` is honored via **structural, shell-verifiable checks on the Markdown output**, not a test framework.

### Test Framework

| Property | Value |
|---|---|
| Framework | None (doc-structure verification via shell commands, not a test runner) |
| Config file | none |
| Quick run command | per-document grep/wc checks below |
| Full suite command | run all checks below sequentially before phase gate |

### Phase Requirements → Verification Map

| Decision | Behavior | Verification Type | Command |
|---|---|---|---|
| D-01 | 6 files exist at exact paths | structural | `ls docs/PRD.md docs/TRD.md docs/UXD.md docs/FLOWS.md docs/BSD.md docs/IPD.md` |
| D-02 | Each doc has its own TOC | structural | `grep -l "^## Table of Contents\|^## Índice" docs/{PRD,TRD,UXD,FLOWS,BSD,IPD}.md` — expect 6 matches |
| D-07 | FLOWS.md has one Mermaid block per named flow | structural | `grep -c '```mermaid' docs/FLOWS.md` — expect ≥6 |
| BSD entity completeness | ER diagram includes all 21 entities incl. User | structural | `grep -c "erDiagram" docs/BSD.md` ≥1, then manually diff entity names against `find apps/strapi/src/api/*/content-types/*/schema.json apps/strapi/src/extensions/*/content-types/*/schema.json` |
| D-09 | Every doc has "Preguntas abiertas"/"Open Questions" section | structural | `grep -l "Preguntas [Aa]biertas\|Preguntas abiertas" docs/{PRD,TRD,UXD,FLOWS,BSD,IPD}.md` — expect 6 matches |
| D-08 | Dashboard-merge inconsistency called out | content | `grep -l "Inconsistencias detectadas" docs/TRD.md` + manual read confirming the note is present and accurate |
| D-06/Pitfall 1 | Cron count corrected to 6 (not 4) | content | manual read of FLOWS.md's cron section against the corrected table in this RESEARCH.md |
| D-12 | English body, Spanish only in quoted UI strings | content | spot-check, not automatable — executor/reviewer judgment |

### Sampling Rate

- **Per document (per plan/task):** run the structural greps for that specific document immediately after writing it.
- **Per wave merge:** run the full structural check table across all 6 docs.
- **Phase gate:** all 6 files exist, all 6 have TOCs, FLOWS.md has ≥6 mermaid blocks, all 6 have Preguntas Abiertas sections, TRD.md contains the Inconsistencias detectadas note — before `/gsd:verify-work`.

### Wave 0 Gaps

None — this phase requires no test-framework scaffolding. The "tests" are grep/ls/wc checks runnable ad hoc with no setup, since the artifacts are Markdown files, not code.

## Sources

### Primary (HIGH confidence — direct filesystem/source read, 2026-07-02)

- `.planning/phases/06-.../06-CONTEXT.md` — full read, all decisions and canonical refs
- `.planning/STATE.md` — full read, phase/milestone history
- `pnpm-workspace.yaml` — confirmed 2-package monorepo
- `apps/strapi/config/cron-tasks.ts`, `apps/strapi/config/server.ts` — full read, confirmed 6 active + 1 manual cron
- `apps/strapi/src/cron/*.cron.ts` (6 files) — headers read, confirmed class names and file paths
- `apps/strapi/src/api/*/content-types/*/schema.json` (20 files) — enumerated via find
- `apps/strapi/src/extensions/users-permissions/content-types/user/schema.json` — confirmed exists, 210 lines
- `apps/strapi/src/utils/audit-log/index.ts`, `apps/strapi/src/index.ts` — full/partial read, confirmed Phase 5 envelope
- `apps/website/app/middleware/auth.ts`, `dashboard-guard.global.ts` — full read
- `apps/website/app/composables/useSessionUser.ts`, `useSessionAuth.ts`, `useSessionClient.ts` — confirmed exist
- `apps/website/app/pages/**` (top-level enumeration), `apps/website/app/components/**` (count + sample), `apps/website/app/scss/**` (structure)
- `docs/data-model.md`, `docs/payment-flow.md`, `docs/reservation-system.md`, `docs/permissions.md` — full read for staleness spot-check
- `apps/strapi/src/api/payment/routes/payment.ts` — full path enumeration
- `apps/strapi/src/api/ad/controllers/ad.ts` — grep for approve/reject/banned routes
- `.planning/ROADMAP.md` — full read (119 lines)
- `.planning/config.json` — confirmed `nyquist_validation: true`
- `apps/strapi/jest.config.js`, `apps/website/vitest.config.ts` — confirmed exist (not deeply inspected — not relevant to a code-free phase)

### Secondary (MEDIUM confidence)

- `docs/analytics-events.md`, `docs/cache.md`, `docs/deployment.md`, `docs/env-vars.md`, `docs/ad-statuses.md` — confirmed to exist, file dates checked, content not deeply cross-verified against code in this research pass (flagged as executor-level work in Open Questions)

### Tertiary (LOW confidence)

None — all findings in this document trace to a direct file read or command output in this session.

## Metadata

**Confidence breakdown:**
- Canonical refs existence: HIGH — every path checked with `ls`/`find`, all confirmed
- Cron job count correction: HIGH — read `cron-tasks.ts` in full, cross-checked against `server.ts` registration
- BSD entity set: HIGH — filesystem enumeration plus explicit User-in-extensions check
- Per-flow file maps: HIGH for flows 1, 3, 5, 6 (files opened or greped directly); MEDIUM for flows 2, 4 (controller/service files located and partially greped, not fully read line-by-line)
- UXD source orientation: MEDIUM — structural inventory only, no deep component-level read
- Existing `/docs/*.md` staleness: MEDIUM — 4 of 9 docs spot-checked in depth (data-model, payment-flow, reservation-system, permissions); 5 not opened (analytics-events, cache, deployment, env-vars, ad-statuses)

**Research date:** 2026-07-02
**Valid until:** Short-lived — this is a snapshot of live code state. Re-verify any claim if more than 1-2 weeks pass before planning/execution, since this is an actively developed repo (STATE.md shows near-daily commits).
