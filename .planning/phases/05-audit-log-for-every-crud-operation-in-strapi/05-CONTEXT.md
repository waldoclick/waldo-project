# Phase 5: Audit log for every CRUD operation in Strapi - Context

**Gathered:** 2026-07-01
**Status:** PIVOTED mid-execution (2026-07-02) — see "Storage mechanism (PIVOT)" below. Ready for re-planning.

<domain>
## Phase Boundary

Track who creates, updates, and deletes records across every Strapi content-type (admin panel + public API writes), so any change can be traced back to an actor and a timestamp. **Also homologate the existing ad-hoc `logger.*` calls in the ad-creation and payment flows to the same actor/data shape** — these were flagged by the user as "super importantes" and explicitly in scope, since ad/order/payment creation ARE the CRUD operations this phase is meant to cover; their current logging is inconsistent (mixed flat/nested metadata, missing `userId` in several call sites) and is part of the same problem this phase solves. No dashboard UI, no field-level diffing, no retention policy (retention is already handled by the existing 90-day log rotation, see below).

</domain>

<decisions>
## Implementation Decisions

These were resolved directly with the user via AskUserQuestion earlier in this session (scoping review requested before any phase was created) — presented here as locked unless superseded by the PIVOT below.

### Storage mechanism (PIVOT — supersedes "Hook mechanism" and "Read path" below)
**What happened:** 05-01 was executed building a new `api::audit-log.audit-log` Strapi content-type (DB table) as storage, per the original locked decision. After execution, the user corrected this: when they said "log", they meant this project's actual existing logging pattern — `apps/strapi/src/utils/logtail/index.ts`, a Winston logger with three transports (Better Stack via `LOGTAIL_TOKEN`, console, and a local `DailyRotateFile` with `maxFiles: "90d"`), already used by ~20 files via `logger.info()`/`logger.error()`/`logger.warn()`. They were never asked "database table vs. log line" as an explicit choice — that assumption was introduced unilaterally during research/planning. This is a genuine correction, not a preference nuance.

**New storage decision:**
- The `audit-log` Strapi content-type/schema built in 05-01 is **removed entirely** — no new DB table, no Content Manager screen.
- The subscriber writes via the existing `logger` (`apps/strapi/src/utils/logtail/index.ts`), not `strapi.db.query()`.
- Because the audit write is no longer a monitored-content-type DB write, **the recursion-guard concern from the original "Hook mechanism" decision no longer applies** — logger calls don't trigger `db.lifecycles` events. The `AUDIT_LOG_UID` exclusion check can be dropped (or kept as a harmless no-op comment — planner's call).
- Because `logger.info()` is fire-and-forget (not awaited, doesn't throw synchronously into the lifecycle hook), the "audit write failure must not break the real write" defensive try/catch from the original research is lower-stakes than with a DB write, but keep it anyway — Winston transports can still emit errors, and a wrapped call costs nothing.
- **Retention** is now handled for free by the existing `DailyRotateFile` config (`maxFiles: "90d"`) — the original "no retention for now" decision is superseded; retention already exists via the shared logger infra.
- **Read path** is now Better Stack's log explorer (external, already used daily for error logs) plus the local rotating file — not Strapi Content Manager. The original "Content Manager visibility" human-verification item (from 05-RESEARCH.md's Open Question 2 and 05-02's checkpoint) is now moot and should be replaced with a check against Better Stack/the local log file instead.

### Homologated log shape (NEW — user-specified)
All structured audit-style log calls (the new CRUD subscriber AND the existing payment/ad-creation logger calls, see "Homologate existing payment/ad logs" below) must route through **one shared helper function**, not be hand-shaped per call site. Proposed/confirmed shape:
```ts
logAudit(message: string, {
  actor: number | "system",       // user id, or "system" if no request context
  actor_type: "admin::user" | "plugin::users-permissions.user" | "system",
  data: Record<string, unknown>,  // everything else — action, content_type_uid, record ids, or (for payment/ad sites) whatever fields that call site already logs
})
```
This calls `logger.info(message, { actor, actor_type, data })` under the hood (or `logger.error`/`logger.warn` variants as needed — the helper should support the log level or there should be one helper per level, planner's call). `message` stays human-readable (preserve each existing call site's message string). Nest each site's existing metadata fields under `data` — drop nothing that's logged today.

### Homologate existing payment/ad logs (NEW — user-specified, in scope)
The following ~30 existing `logger.info`/`logger.error`/`logger.warn` call sites must be rewritten to use the shared `logAudit` helper (or equivalent), reshaping their arguments to the `actor`/`actor_type`/`data` envelope — **this is a reshape-only change: do not alter any business logic, control flow, or the human-readable message text; only change how metadata is passed to the logger.** Payment code is governed by this project's "Payment Rules — NEVER VIOLATE THESE" (CLAUDE.md) — treat every touch as reshape-only, zero logic change.

Files and call sites (verified by direct code read, 2026-07-02):
- `apps/strapi/src/api/ad/services/ad.ts` — draft creation/update/error (3 calls), Zoho sync for ad approval (2 calls)
- `apps/strapi/src/api/payment/controllers/payment.ts` — ~13 calls across ad creation, payment validation, Webpay response handling, Facto document generation, order creation
- `apps/strapi/src/api/payment/services/ad.service.ts` — ~13 calls: ad creation/modification, pack reservations, Zoho sync
- `apps/strapi/src/api/payment/services/pack.service.ts` — ~14 calls: pack purchase flow, Webpay transaction creation/response, Zoho sync
- `apps/strapi/src/api/payment/services/checkout.service.ts` — 4 calls: Facto document (checkout variant), order record creation failure, Zoho sync
- `apps/strapi/src/api/payment/services/free-ad.service.ts` — 1 call: free ad creation email error

**Actor resolution for these sites is DIFFERENT from the subscriber's `requestContext` approach:** these call sites already have `userId` in scope as a local variable (it's already being logged today, just inconsistently placed). Use that local `userId` directly for the `actor` field — do NOT switch these sites to read `strapi.requestContext.get()`, since Webpay/Transbank webhook callbacks are frequently unauthenticated (no `ctx.state.user`) and would incorrectly resolve to `"system"`, regressing the actor field on exactly the logs the user flagged as important. Where a call site has no `userId` in scope at all (e.g. `checkout.service.ts`'s order-record-creation-failure log, `free-ad.service.ts`'s email error), keep `actor: "system"` — do not invent a userId lookup that doesn't already exist in that function.

**Test baseline:** 05-01's SUMMARY.md noted 3 pre-existing Jest failures unrelated to this phase (confirmed via `git stash`). The bar for this payment-log rework is "no *new* failures vs. that baseline" and a clean `tsc`/`vue-tsc` — not "all tests green," since the suite was already red before this phase started.

### Hook mechanism (ORIGINAL — still valid, storage target changed by PIVOT above)
- Single global `strapi.db.lifecycles.subscribe()` registered once in `bootstrap()` (`apps/strapi/src/index.ts`), not per-controller instrumentation.
- `strapi.documents.use()` is explicitly rejected: verified in this codebase that hand-rolled controllers (e.g. `cookie-policy`, `security-policy`, `term`, `policy`, `order`, `faq`) call `strapi.db.query(...).create()` directly for `create`, while using `strapi.documents(...)` only for `update`/`delete`. `documents.use()` would silently miss every one of those creates. `db.lifecycles.subscribe()` fires for both `db.query()` and `documents()` code paths, so it is the only mechanism that covers 100% of writes from one place.
- ~~The new `audit-log` content-type itself must be excluded from the subscriber~~ — moot per PIVOT (no longer a DB write, no recursion path).

### Log depth
- Record actor + action (create/update/delete) + content-type UID + record id/documentId + timestamp only.
- Explicitly NOT capturing field-level before/after diffs — out of scope for this phase.

### Actor identity
- Read from `strapi.requestContext.get()?.state?.user` at the moment the lifecycle hook fires.
- **CORRECTED BY RESEARCH (05-RESEARCH.md):** `strapi.requestContext` is a built-in Strapi v5 core service (`@strapi/core`, `AsyncLocalStorage`-backed), already wired via `app.use((ctx, next) => requestContext.run(ctx, () => next()))` at the raw Koa level — before any configurable middleware, before `config/middlewares.ts`, covering both admin panel and `/api/*`. Verified directly from the exact installed `@strapi/core@5.41.1` source. No custom middleware needs to be built — `strapi.requestContext.get()?.state?.user` works today with zero new code. The original plan to add a `global::request-context` middleware in `apps/strapi/src/middlewares/` is dropped.
- Actor-type discriminator required: Strapi admin-panel users (`admin::user`) and users-permissions users (`plugin::users-permissions.user`) are separate tables with overlapping numeric ids — the audit record must store which table the actor id refers to, not just a bare numeric id. Concrete mechanism (from research): `strapi.requestContext.get()?.state?.auth?.strategy?.name` returns `'admin'` or `'users-permissions'`, mapped to `actor_type`.

### System/non-request writes
- Seeders (10 files imported in `apps/strapi/src/index.ts` bootstrap) and the 4 existing cron jobs (`adCron`, `userCron`, `backupCron`, `cleanupCron`) run outside any HTTP request, so `requestContext.get()` will return undefined for them.
- These writes are still logged, tagged with a fixed `system` actor value (not skipped).

### Retention
- No pruning/retention cron in this phase. Log grows unbounded for now — explicitly deferred.

### Read path
- No new dashboard UI. Audit records are read directly via the Strapi admin Content Manager (standard collection-type list/detail view) — same as any other content-type today (no code path in this repo currently auto-grants Content Manager visibility beyond the default; verify the `audit-log` content-type is visible to admin roles as-is, no extra work needed since Content Manager access is separate from the Users & Permissions `Public` role permissions used for public API reads).

</decisions>

<code_context>
## Existing Code Insights

### Content-types inventory (verified by direct inspection, not assumption)
20 content-types with a `schema.json` under `apps/strapi/src/api/*/content-types/*/schema.json`: `ad`, `ad-featured-reservation`, `ad-pack`, `ad-reservation`, `article`, `category`, `commune`, `condition`, `contact`, `cookie-policy`, `faq`, `order`, `policy`, `region`, `remaining`, `security-policy`, `subscription-payment`, `subscription-pro`, `term`, `verification-code`.

Action-only API folders with no schema (not content-types, no lifecycle events apply): `auth-google`, `auth-one-tap`, `auth-verify`, `better-stack`, `cloudflare`, `cron-runner`, `filter`, `google-analytics`, `payment`, `related`, `search-console`.

### Confirmed hand-rolled create/update split (example: `cookie-policy` controller)
```ts
async create(ctx) {
  const { data } = ctx.request.body;
  const cookiePolicy = await strapi.db
    .query("api::cookie-policy.cookie-policy")
    .create({ data });          // <-- db.query path
  return { data: cookiePolicy };
},
async update(ctx) {
  const { id: documentId } = ctx.params;
  const { data } = ctx.request.body;
  const cookiePolicy = await strapi
    .documents("api::cookie-policy.cookie-policy")
    .update({ documentId, data });   // <-- documents() path
  return { data: cookiePolicy };
},
```
This same split pattern repeats across `term`, `policy`, `faq`, `order`, and other hand-rolled controllers — confirms `db.lifecycles.subscribe()` is the only hook that sees both.

### Bootstrap wiring point
`apps/strapi/src/index.ts` — `bootstrap({ strapi })` already runs seeders and `recalculateSortPriorities()`. The new `strapi.db.lifecycles.subscribe()` call should be registered at the top of `bootstrap()`, before the seeders run (so seeder writes are captured and correctly tagged `system`).

### Middleware pattern to follow
`apps/strapi/src/middlewares/proxy-auth.ts` is the closest existing pattern: default-exported factory returning `(ctx, next) => {...}`, registered by name (`global::proxy-auth`) in `apps/strapi/config/middlewares.ts`. The new `request-context` middleware follows the same shape but must NOT scope itself to `/api` only (proxy-auth does, via `if (!ctx.path.startsWith("/api")) return next()`) — audit needs to cover admin-panel writes too.

Current `config/middlewares.ts` order (relevant excerpt):
```
"strapi::logger", "strapi::errors", "global::proxy-auth", "strapi::security",
"strapi::cors", "strapi::query", "strapi::body", "strapi::session",
"strapi::favicon", "strapi::public", "global::upload", ...
```
`global::request-context` should be inserted near the top (after `strapi::logger`/`strapi::errors`, before `strapi::session`) so it wraps everything downstream.

### Content-type schema pattern to follow
`term/content-types/term/schema.json` is the simplest existing reference: `collectionType`, `draftAndPublish: false`, flat `attributes`. The `audit-log` content-type should follow this shape (collectionType, draftAndPublish false, no relations needed — actor id/type stored as plain fields, not a relation, since it can point to either of two different user tables).

</code_context>

<specifics>
## Specific Ideas

No additional specifics beyond what's captured in Implementation Decisions — the scoping conversation with the user covered all open questions for this phase.

</specifics>

<deferred>
## Deferred Ideas

- Field-level before/after diffing on updates — deferred, may become its own phase if real audit needs surface.
- Retention/pruning cron for the audit log — deferred, reuse the existing `cleanupCron` pattern if/when needed.
- Dedicated dashboard UI to browse/filter audit logs — deferred, Content Manager is sufficient for now.

</deferred>
