# Phase 5: Audit log for every CRUD operation in Strapi - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Track who creates, updates, and deletes records across every Strapi content-type (admin panel + public API writes), so any change can be traced back to an actor and a timestamp. This phase delivers the tracking mechanism and storage only — no dashboard UI, no field-level diffing, no retention policy.

</domain>

<decisions>
## Implementation Decisions

These were resolved directly with the user via AskUserQuestion earlier in this session (scoping review requested before any phase was created) — presented here as locked, not re-opened.

### Hook mechanism
- Single global `strapi.db.lifecycles.subscribe()` registered once in `bootstrap()` (`apps/strapi/src/index.ts`), not per-controller instrumentation.
- `strapi.documents.use()` is explicitly rejected: verified in this codebase that hand-rolled controllers (e.g. `cookie-policy`, `security-policy`, `term`, `policy`, `order`, `faq`) call `strapi.db.query(...).create()` directly for `create`, while using `strapi.documents(...)` only for `update`/`delete`. `documents.use()` would silently miss every one of those creates. `db.lifecycles.subscribe()` fires for both `db.query()` and `documents()` code paths, so it is the only mechanism that covers 100% of writes from one place.
- The new `audit-log` content-type itself must be excluded from the subscriber (by content-type UID check) to avoid infinite recursion when the audit write happens.

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
