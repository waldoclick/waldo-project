# Phase 5: Audit log for every CRUD operation in Strapi - Research

**Researched:** 2026-07-01
**Domain:** Strapi v5.41.1 database lifecycle hooks, AsyncLocalStorage request context, actor tracking
**Confidence:** HIGH (all core findings verified against the exact installed package version, 5.41.1, from source — not training data, not a different-version Context7 doc)

## Summary

All primary findings for this phase come from reading the actual `@strapi/database@5.41.1` and `@strapi/core@5.41.1` compiled source (found cached at exact version in this machine's yarn cache), not from documentation or memory. This gives HIGH confidence on API shapes that would otherwise be MEDIUM/LOW.

**Primary recommendation:** Register a single `strapi.db.lifecycles.subscribe({ afterCreate, afterUpdate, afterDelete })` handler in `bootstrap()`. Do **not** build a custom AsyncLocalStorage middleware — `strapi.requestContext.get()` is a built-in Strapi v5 core service, already wired at the raw Koa app level (before any configurable middleware), and is available today with zero new code. This is the single most important correction to CONTEXT.md's locked decisions (see "Correction to CONTEXT.md" below) and removes an entire task from the plan.

## Correction to CONTEXT.md (read this first)

CONTEXT.md states: *"strapi.requestContext / AsyncLocalStorage middleware DOES NOT EXIST YET in this codebase (grepped, zero results) — must be newly built."*

That grep was scoped to `apps/strapi/src`, which is correct as far as it goes — there is no **project** code implementing this. But `strapi.requestContext` is a **framework-core** API, invisible to a grep of application source. It cannot be found by grepping `apps/strapi/src` because it lives in `node_modules/@strapi/core`, not in this project's code at all.

**Verified directly from `@strapi/core@5.41.1` compiled source:**

`node_modules/@strapi/core/dist/services/request-context.js` (exact file, exact version):
```js
var async_hooks = require('async_hooks');
const storage = new async_hooks.AsyncLocalStorage();
const requestCtx = {
  async run(store, cb) { return storage.run(store, cb); },
  get() { return storage.getStore(); }
};
module.exports = requestCtx;
```

`node_modules/@strapi/core/dist/services/server/index.js` (line 22, exact version):
```js
app.use((ctx, next) => requestContext.run(ctx, () => next()));
```

This line runs at the **raw Koa `app.use()` level**, registered inside `createServer()` before the configurable `config/middlewares.ts` chain, before `strapi::session`, before any custom middleware — and it wraps **every** request: `/admin`, `/content-manager`, `/api/*`, everything. It stores the live `ctx` object (not a snapshot), exactly as CONTEXT.md's locked decision required.

`Strapi.js` (line 68-69) decorates it onto the global `strapi` instance:
```js
get requestContext() {
  return this.get('requestContext');
}
```

**Consequence for the plan:** `strapi.requestContext.get()?.state?.user` works today, with zero new middleware. The locked decision to build `global::request-context` as a new Koa middleware (`apps/strapi/src/middlewares/*.ts`, registered in `config/middlewares.ts`) is unnecessary work — it would duplicate a wheel Strapi already ships built-in and already wires before any project middleware. **This is a HIGH-confidence finding that should override the "must be newly built" premise of the locked decision.** The underlying architectural intent (actor read from request context, live not snapshotted, unscoped to `/api`) is fully satisfied by the existing core service — nothing else in the locked decisions needs to change.

Also verified this is the officially documented pattern (not just an internal implementation detail) — Strapi's own docs show the identical `strapi.requestContext.get()` call used inside a `beforeUpdate()` lifecycle to read `ctx.state.user`:
```js
// Official Strapi v5 docs pattern
module.exports = {
  beforeUpdate() {
    const ctx = strapi.requestContext.get();
    console.log('User info in service: ', ctx.state.user);
  },
};
```
Source: https://docs.strapi.io/cms/backend-customization/requests-responses

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hook mechanism**
- Single global `strapi.db.lifecycles.subscribe()` registered once in `bootstrap()` (`apps/strapi/src/index.ts`), not per-controller instrumentation.
- `strapi.documents.use()` is explicitly rejected: verified in this codebase that hand-rolled controllers (e.g. `cookie-policy`, `security-policy`, `term`, `policy`, `order`, `faq`) call `strapi.db.query(...).create()` directly for `create`, while using `strapi.documents(...)` only for `update`/`delete`. `documents.use()` would silently miss every one of those creates. `db.lifecycles.subscribe()` fires for both `db.query()` and `documents()` code paths, so it is the only mechanism that covers 100% of writes from one place.
- The new `audit-log` content-type itself must be excluded from the subscriber (by content-type UID check) to avoid infinite recursion when the audit write happens.

**Log depth**
- Record actor + action (create/update/delete) + content-type UID + record id/documentId + timestamp only.
- Explicitly NOT capturing field-level before/after diffs — out of scope for this phase.

**Actor identity**
- Read from `strapi.requestContext.get()?.state?.user` at the moment the lifecycle hook fires.
- ~~This requestContext mechanism does not exist yet in this codebase~~ **CORRECTED BY RESEARCH: it exists as a Strapi core service — see "Correction to CONTEXT.md" above. Skip building a custom middleware; call `strapi.requestContext.get()` directly.**
- Actor-type discriminator required: Strapi admin-panel users (`admin::user`) and users-permissions users (`plugin::users-permissions.user`) are separate tables with overlapping numeric ids — the audit record must store which table the actor id refers to, not just a bare numeric id. **Research adds a concrete, verified mechanism for this: `strapi.requestContext.get()?.state?.auth?.strategy?.name` — see "Actor-Type Discriminator" section below.**

**System/non-request writes**
- Seeders (10 files imported in `apps/strapi/src/index.ts` bootstrap) and the 4 existing cron jobs (`adCron`, `userCron`, `backupCron`, `cleanupCron`) run outside any HTTP request, so `requestContext.get()` will return undefined for them.
- These writes are still logged, tagged with a fixed `system` actor value (not skipped).

**Retention**
- No pruning/retention cron in this phase. Log grows unbounded for now — explicitly deferred.

**Read path**
- No new dashboard UI. Audit records are read directly via the Strapi admin Content Manager (standard collection-type list/detail view) — same as any other content-type today.

### Claude's Discretion
None stated beyond the locked decisions — the scoping conversation with the user covered all open questions for this phase per CONTEXT.md.

### Deferred Ideas (OUT OF SCOPE)
- Field-level before/after diffing on updates — deferred, may become its own phase if real audit needs surface.
- Retention/pruning cron for the audit log — deferred, reuse the existing `cleanupCron` pattern if/when needed.
- Dedicated dashboard UI to browse/filter audit logs — deferred, Content Manager is sufficient for now.

## Phase Requirements

No requirement IDs were mapped to this phase (`phase_req_ids` is null — added ad hoc, not sourced from REQUIREMENTS.md). No REQUIREMENTS.md file exists in this project's `.planning/` directory.

## Standard Stack

No new dependencies. This phase uses only Strapi v5.41.1 core APIs already installed:

| API | Package | Version | Purpose |
|-----|---------|---------|---------|
| `strapi.db.lifecycles.subscribe()` | `@strapi/database` | 5.41.1 (installed) | Global CRUD hook covering both `db.query()` and `documents()` |
| `strapi.requestContext.get()` | `@strapi/core` | 5.41.1 (installed) | Read live Koa `ctx` from anywhere, incl. lifecycle hooks — built-in, no new middleware |

**Version verification:** Confirmed via `apps/strapi/package.json`: `"@strapi/strapi": "5.41.1"`, `"@strapi/utils": "5.41.1"`. Exact-version compiled source was located and read directly (see Sources).

**No installation required** — nothing new to add to `package.json`.

## Architecture Patterns

### Recommended Project Structure
```
apps/strapi/src/
├── api/
│   └── audit-log/
│       └── content-types/
│           └── audit-log/
│               └── schema.json     # new collection-type, no relations
├── index.ts                        # bootstrap(): register db.lifecycles.subscribe() here
```

No new middleware file is needed (see Correction above) — this eliminates the `apps/strapi/src/middlewares/request-context.ts` file and its `config/middlewares.ts` registration originally planned in CONTEXT.md.

### Pattern 1: Global lifecycle subscriber (SubscriberMap form)

**What:** Register one object-shaped subscriber (not a function-shaped one) so Strapi's dispatcher only invokes handlers for the actions you care about, instead of running your function on all 18 possible actions and self-filtering inside.

**Verified exact `Event` type** (from `@strapi/database@5.41.1` `dist/lifecycles/types.d.ts`, HIGH confidence — exact installed version):
```ts
export type Action =
  | 'beforeCreate' | 'afterCreate'
  | 'beforeFindOne' | 'afterFindOne'
  | 'beforeFindMany' | 'afterFindMany'
  | 'beforeCount' | 'afterCount'
  | 'beforeCreateMany' | 'afterCreateMany'
  | 'beforeUpdate' | 'afterUpdate'
  | 'beforeUpdateMany' | 'afterUpdateMany'
  | 'beforeDelete' | 'afterDelete'
  | 'beforeDeleteMany' | 'afterDeleteMany';

export interface Params {
  select?: any; where?: any; _q?: any; orderBy?: any;
  groupBy?: any; offset?: any; limit?: any; populate?: any; data?: any;
}

export interface Event {
  action: Action;
  model: Meta;                        // has .uid, .tableName, .singularName, .attributes, etc.
  params: Params;
  state: Record<string, unknown>;
  result?: any;                       // present in "after" hooks only
}

export type SubscriberFn = (event: Event) => Promise<void> | void;
export type SubscriberMap = { models?: string[] } & Partial<Record<Action, SubscriberFn>>;
export type Subscriber = SubscriberFn | SubscriberMap;
```

`event.model` is the full `Meta` object (from `dist/metadata/metadata.d.ts`): `{ uid, tableName, singularName, attributes, indexes, foreignKeys, lifecycles }`. **Use `event.model.uid`** to compare against the audit-log's own UID and against the audit target's content-type UID.

**Registration site** — `apps/strapi/src/index.ts` `bootstrap()`, top of the function, before seeders run (per locked decision so seeder writes are captured):
```ts
async bootstrap({ strapi }) {
  strapi.db.lifecycles.subscribe({
    models: undefined, // do NOT use this filter — see "Excluding audit-log" below
    afterCreate: (event) => recordAuditEntry(strapi, event, "create"),
    afterUpdate: (event) => recordAuditEntry(strapi, event, "update"),
    afterDelete: (event) => recordAuditEntry(strapi, event, "delete"),
  });
  // ... existing seeders, unchanged, run after this
}
```

**Confirmed dispatcher behavior** (from `@strapi/database@5.41.1` `dist/lifecycles/index.js`, exact version): for an object-shaped subscriber, the dispatcher only calls `subscriber[action]?.(event)` when `action in subscriber` — so a `SubscriberMap` with only `afterCreate`/`afterUpdate`/`afterDelete` keys is never invoked for find/count/createMany/etc. This is more efficient and clearer than a function-shaped subscriber that self-filters `event.action` inside.

### Pattern 2: `afterX` hooks always carry a fully-resolved `result`, including `afterDelete`

**Verified exact runtime behavior** (from `@strapi/database@5.41.1` `dist/entity-manager/index.js`, exact version — this is the real implementation of `strapi.db.query(uid).create/update/delete()`):

```js
// create — entity-manager/index.js line ~193-232
async create(uid, params = {}) {
  const states = await db.lifecycles.run('beforeCreate', uid, { params });
  // ... insert row ...
  const result = await this.findOne(uid, { where: { id }, select: params.select, populate: params.populate, filters: params.filters });
  await db.lifecycles.run('afterCreate', uid, { params, result }, states);
  return result;
}

// update — entity-manager/index.js line ~278-330
async update(uid, params = {}) {
  const states = await db.lifecycles.run('beforeUpdate', uid, { params });
  const entity = await this.createQueryBuilder(uid).select('*').where(where).first().execute({ mapResults: false });
  const { id } = entity;
  // ... update row + relations ...
  const result = await this.findOne(uid, { where: { id }, select: params.select, populate: params.populate, filters: params.filters });
  await db.lifecycles.run('afterUpdate', uid, { params, result }, states);
  return result;
}

// delete — entity-manager/index.js line ~352-390
async delete(uid, params = {}) {
  const states = await db.lifecycles.run('beforeDelete', uid, { params });
  const { where, select, populate } = params;
  const entity = await this.findOne(uid, { select: select && ['id'].concat(select), where, populate });
  const { id } = entity;
  await this.createQueryBuilder(uid).where({ id }).delete().execute();
  // ... delete relations ...
  await db.lifecycles.run('afterDelete', uid, { params, result: entity }, states);  // <-- result IS populated, fully
  return entity;
}
```

**Key finding: `afterDelete`'s `event.result` is the fully-resolved entity fetched via `findOne` BEFORE the row is deleted** — it is not `undefined`, not just an id. This means `event.result.id` and `event.result.documentId` are both reliably available in `afterDelete`, answering Q2/Q3 directly: read the record id from `event.result`, not from `event.params.where`, in every "after" hook variant.

**`before*` hooks only ever get `{ params }` — no `result`.** If you needed pre-delete state you'd read `params.where`, but since the plan only needs id/documentId/action/actor/timestamp (no diffing), the `after*` hooks are sufficient and simpler — you never need the `before*` hooks for this phase.

### Pattern 3: `documents()` calls funnel through the exact same entity-manager — single lifecycle fire per document operation

**Verified from `@strapi/core@5.41.1` `dist/services/document-service/entries.js`** (exact version) — this is what `strapi.documents(uid).create/update/delete()` actually calls under the hood:

```js
// entries.js — createEntry, updateEntry, deleteEntry
async function createEntry(params) {
  // ... validation, component handling ...
  const doc = await strapi.db.query(uid).create({ ...query, data: entryData });  // <-- single db.query call
  return doc;
}
async function updateEntry(entryToUpdate, params) {
  // ... validation, component handling ...
  return strapi.db.query(uid).update({ ...query, where: { id: entryToUpdate.id }, data: entryData });  // <-- single call
}
async function deleteEntry(id) {
  const deletedEntry = await strapi.db.query(uid).delete({ where: { id } });  // <-- single call
  return deletedEntry;
}
```

This confirms, with certainty (not inference), that `strapi.documents(uid).create/update/delete()` each trigger **exactly one** `db.query(uid).create/update/delete()` call — i.e. exactly one `beforeX`/`afterX` lifecycle pair — **for this codebase's content-types**, because all 20 have `draftAndPublish: false` and no i18n plugin is installed (see "Verified: No Multi-Fire Risk" below). The `documents()` layer's extra complexity (draft/publish duplication, per-locale fan-out) simply doesn't engage here.

### Pattern 4: Actor-Type Discriminator — use `ctx.state.auth.strategy.name`, not id-range inference

CONTEXT.md correctly identifies that `admin::user` and `plugin::users-permissions.user` are separate tables with overlapping numeric ids, and that a discriminator field is required. Research adds the concrete, verified mechanism:

**Verified from `@strapi/core@5.41.1` `dist/services/auth/index.js`** (exact version):
```js
async authenticate(ctx, next) {
  // ...
  for (const strategy of strategiesToUse) {
    const result = await strategy.authenticate(ctx);
    if (result.authenticated) {
      ctx.state.isAuthenticated = true;
      ctx.state.auth = { strategy, credentials, ability };  // <-- strategy is the full strategy object, has .name
      return next();
    }
  }
}
```

Three strategies exist in this Strapi installation, each with a distinct `.name`:
| Strategy `.name` | Where it authenticates | Sets `ctx.state.user`? | Actor table |
|---|---|---|---|
| `'admin'` | Admin panel (`/admin`, `/content-manager`) | Yes (`ctx.state.user = user` — verified in `@strapi/admin@5.41.1` `strategies/admin.js`) | `admin::user` |
| `'users-permissions'` | Public API (`/api/*`) with a user JWT | Yes (`ctx.state.user = user` — verified in `@strapi/plugin-users-permissions@5.41.1` `strategies/users-permissions.js`) | `plugin::users-permissions.user` |
| `'api-token'` | Public API with an `Authorization: Bearer <api-token>` header | **No** — only `ctx.state.auth.credentials` (the token record) is set, `ctx.state.user` stays undefined | N/A — no user actor |

**Recommended read pattern inside the subscriber:**
```ts
const reqCtx = strapi.requestContext.get();
const user = reqCtx?.state?.user;
const strategyName = reqCtx?.state?.auth?.strategy?.name; // 'admin' | 'users-permissions' | 'api-token' | undefined

const actorType = !reqCtx ? "system"
  : strategyName === "admin" ? "admin::user"
  : strategyName === "users-permissions" ? "plugin::users-permissions.user"
  : "system"; // api-token writes or unauthenticated public writes with no ctx.state.user — treat as system/unknown
```

**Verified: this project does not use API tokens for any content write path** — `grep -rn "API_TOKEN\|api-token"` across `apps/strapi/src` shows only `API_TOKEN_SALT` (Strapi's own token-signing config, not a consumer of tokens) and unrelated third-party `*_API_TOKEN` env vars (Cloudflare, Better Stack) that are never used as Strapi auth. This means in practice, for this codebase, `actorType` will only ever be `admin::user`, `plugin::users-permissions.user`, or `system` — the `api-token` branch is a defensive fallback, not an active path today.

### Pattern 5: Excluding the audit-log content-type from its own subscription

Do this with an equality check inside each handler, **not** the `SubscriberMap.models` allowlist field:

```ts
const AUDIT_LOG_UID = "api::audit-log.audit-log";

async function recordAuditEntry(strapi, event, action) {
  if (event.model.uid === AUDIT_LOG_UID) return; // prevents infinite recursion
  // ...
}
```

`SubscriberMap.models` (verified present in the type: `{ models?: string[] } & Partial<Record<Action, SubscriberFn>>`) is an **allowlist** — if set, the subscriber ONLY fires for UIDs in that array. Using it would mean manually listing all 20 content-type UIDs and remembering to add every future one — brittle, and contradicts the "every CRUD operation" phase intent (new content-types would silently be un-audited until someone edits the allowlist). The equality-check-inside-handler approach requires zero maintenance when content-types are added.

### Anti-Patterns to Avoid
- **Using `strapi.documents.use()` instead of `db.lifecycles.subscribe()`:** confirmed by CONTEXT.md's own code inspection — would miss every hand-rolled `strapi.db.query().create()` call (cookie-policy, security-policy, term, policy, order, faq, and others).
- **Building a custom AsyncLocalStorage middleware:** unnecessary — `strapi.requestContext` is already a core service, already wired before all configurable middleware. See Correction above.
- **Reading `event.params.where` for the record id in `afterDelete`:** works today (Strapi resolves `where` to `{ id }` before calling `findOne`), but `event.result.id`/`event.result.documentId` is the documented, resilient path since `result` is the actual resolved entity, not a filter expression that may vary in shape.
- **Letting an audit-log write failure break the real business write:** `db.lifecycles.run()` `await`s each subscriber in sequence — an uncaught exception in `recordAuditEntry` propagates and rejects the original `create`/`update`/`delete` call, causing the actual API request to fail because of an *audit logging* bug. Always wrap the audit insert in try/catch and log-and-swallow errors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request-scoped actor tracking across async boundaries | Custom Koa middleware + Node `AsyncLocalStorage` instance | `strapi.requestContext.get()` (built-in) | Already implemented, already wired at the correct point in the Koa chain (before `config/middlewares.ts` even starts), zero new code, zero new failure surface |
| Determining whether a write came from admin panel vs public API | Inferring from numeric id ranges or route path prefix | `strapi.requestContext.get()?.state?.auth?.strategy?.name` (`'admin'` vs `'users-permissions'`) | Framework already discriminates this cleanly at auth time; id-range inference is fragile (both tables auto-increment from 1) |

**Key insight:** the entire "actor identity" and "system-write tagging" mechanics this phase needs are already built into Strapi core. The only genuinely new code in this phase is: (1) the `audit-log` schema, (2) the subscriber registration + handler function, (3) tagging the 10 seeders and 4 crons as `system` (which, per CONTEXT.md, happens automatically since `requestContext.get()` returns `undefined` outside a request — no extra tagging code needed beyond the `!reqCtx → "system"` branch already shown above).

## Common Pitfalls

### Pitfall 1: Audit-log write failure breaks the real business write
**What goes wrong:** `strapi.db.lifecycles.run()` awaits each subscriber. If `recordAuditEntry()` throws (e.g. a bad enum value, a DB constraint violation, a null actor field marked required), the exception propagates up through `afterCreate`/`afterUpdate`/`afterDelete` and rejects the original `create()`/`update()`/`delete()` call — meaning a bug in audit logging would 500 a legitimate ad creation, order update, etc.
**Why it happens:** the lifecycle system has no built-in isolation between subscribers — one subscriber's failure fails the whole `run()`.
**How to avoid:** wrap the entire audit-log write in try/catch inside the handler; log the error (e.g. via existing logger) and never rethrow.
**Warning signs:** any failing test where a legitimate CRUD operation starts throwing after this phase ships.

### Pitfall 2: `createMany`/`updateMany`/`deleteMany` are separate Actions, not covered by the singular hooks
**What goes wrong:** a `SubscriberMap` registered with only `afterCreate`/`afterUpdate`/`afterDelete` will never fire for bulk operations — `strapi.db.query(uid).createMany()`, `.updateMany()`, `.deleteMany()` dispatch to `beforeCreateMany`/`afterCreateMany`/`beforeUpdateMany`/`afterUpdateMany`/`beforeDeleteMany`/`afterDeleteMany` instead (verified: these are separate entries in the `Action` union and the entity-manager code calls `db.lifecycles.run('afterCreateMany', ...)` etc., a distinct call from `afterCreate`).
**Why it happens:** Strapi models bulk ops as a structurally different action, not a repeated singular action.
**Verified scope of this risk in THIS codebase:** `grep -rn "updateMany\|deleteMany\|createMany" apps/strapi/src` finds exactly one use: `apps/strapi/src/cron/verification-code-cleanup.cron.ts` calls `.deleteMany({ where: { expiresAt: { $lt: now } } })` to purge expired verification codes. No `createMany`/`updateMany` calls exist anywhere in project code. The FAQ/policy/term "bulk reorder" endpoints (quick task 260409-ea4) use `Promise.all()` over individual `documents().update()` calls — confirmed by reading `apps/strapi/src/api/faq/controllers/faq.ts`'s `reorder()` method — so those fire the singular `afterUpdate` hook once per record, already covered.
**How to avoid:** Decide explicitly, don't leave implicit: either (a) also subscribe to `afterDeleteMany` and log one audit row with `action: "delete"`, `recordId: null`, a note that it was a bulk operation covering N rows (since `afterDeleteMany`'s `result` is only `{ count }` — no ids, per the entity-manager source read above), or (b) explicitly scope this phase to singular operations only and accept that the one cron `deleteMany` call (verification-code cleanup, already ephemeral/non-sensitive data) goes unaudited, documenting that as a conscious boundary. Given the phase description says "every CRUD operation" and the only real-world instance is a cron already tagged `system`, recommend (b): document the boundary explicitly in the plan rather than silently missing it.
**Warning signs:** any future code that starts using `createMany`/`updateMany` in bulk-import or bulk-edit features would silently bypass the audit log unless this is revisited.

### Pitfall 3: `beforeX` hooks have no `result` — don't try to read record data from them
**What goes wrong:** `event.result` is `undefined` in `beforeCreate`/`beforeUpdate`/`beforeDelete` (verified: entity-manager only passes `{ params }` to `db.lifecycles.run('beforeX', ...)`, `result` is added only in the `afterX` call).
**Why it happens:** the record doesn't exist yet (create) or hasn't been re-fetched yet (update/delete) at the "before" point.
**How to avoid:** use only `afterCreate`/`afterUpdate`/`afterDelete` for this phase — all three reliably carry a fully-resolved `result` including id and documentId, as shown above.

### Pitfall 4: `api-token`-authenticated writes have no `ctx.state.user`
**What goes wrong:** if a future integration authenticates via `Authorization: Bearer <admin-generated-api-token>` instead of a user JWT, `ctx.state.auth.strategy.name === 'api-token'` but `ctx.state.user` is `undefined` — falling through to the `system` actor bucket even though it's not truly a system/unattended write.
**Why it happens:** the `api-token` strategy (verified in `@strapi/admin@5.41.1` `strategies/api-token.js`) sets `ctx.state.auth.credentials` to the token record, never `ctx.state.user`.
**How to avoid:** not an active risk today (verified: no API tokens are used for content writes in this codebase). If this changes, extend the actor-type mapping to a fourth bucket (`admin::api-token`) using `reqCtx.state.auth.credentials.id`/`.name` instead of `ctx.state.user`.

## Code Examples

### Full subscriber registration (bootstrap wiring point)
```ts
// apps/strapi/src/index.ts — inside bootstrap({ strapi }), added near the top, before seeders run
import registerAuditLogSubscriber from "./subscribers/audit-log.subscriber";
// ...
async bootstrap({ strapi }) {
  registerAuditLogSubscriber(strapi);
  // existing seeders unchanged below this line
}
```

### Subscriber handler (new file, e.g. `apps/strapi/src/subscribers/audit-log.subscriber.ts`)
```ts
import type { Core } from "@strapi/strapi";

const AUDIT_LOG_UID = "api::audit-log.audit-log";

type AuditAction = "create" | "update" | "delete";

async function recordAuditEntry(
  strapi: Core.Strapi,
  event: { model: { uid: string }; result?: { id: number; documentId?: string } },
  action: AuditAction,
) {
  if (event.model.uid === AUDIT_LOG_UID) return; // avoid recursion

  try {
    const reqCtx = strapi.requestContext.get();
    const user = reqCtx?.state?.user as { id?: number } | undefined;
    const strategyName = (reqCtx?.state as { auth?: { strategy?: { name?: string } } } | undefined)
      ?.auth?.strategy?.name;

    const actorType = !reqCtx
      ? "system"
      : strategyName === "admin"
        ? "admin::user"
        : strategyName === "users-permissions"
          ? "plugin::users-permissions.user"
          : "system";

    await strapi.db.query(AUDIT_LOG_UID).create({
      data: {
        action,
        content_type_uid: event.model.uid,
        record_id: event.result?.id ?? null,
        record_document_id: event.result?.documentId ?? null,
        actor_id: actorType === "system" ? null : (user?.id ?? null),
        actor_type: actorType,
      },
    });
  } catch (error) {
    strapi.log.error("Failed to write audit-log entry", error);
    // swallow — never let audit logging break the real write
  }
}

export default (strapi: Core.Strapi) => {
  strapi.db.lifecycles.subscribe({
    afterCreate: (event) => recordAuditEntry(strapi, event, "create"),
    afterUpdate: (event) => recordAuditEntry(strapi, event, "update"),
    afterDelete: (event) => recordAuditEntry(strapi, event, "delete"),
  });
};
```

### `audit-log` schema.json (follows the `term` content-type pattern per CONTEXT.md)
```json
{
  "kind": "collectionType",
  "collectionName": "audit_logs",
  "info": {
    "singularName": "audit-log",
    "pluralName": "audit-logs",
    "displayName": "Audit Log"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {},
  "attributes": {
    "action": {
      "type": "enumeration",
      "enum": ["create", "update", "delete"],
      "required": true
    },
    "content_type_uid": {
      "type": "string",
      "required": true
    },
    "record_id": {
      "type": "integer"
    },
    "record_document_id": {
      "type": "string"
    },
    "actor_id": {
      "type": "integer"
    },
    "actor_type": {
      "type": "enumeration",
      "enum": ["admin::user", "plugin::users-permissions.user", "system"],
      "required": true
    }
  }
}
```

No explicit timestamp field is needed — Strapi's built-in `timestampsLifecyclesSubscriber` (verified present in `@strapi/database@5.41.1` `dist/lifecycles/subscribers/timestamps.js`, registered as a default subscriber alongside your custom one) auto-populates `createdAt`/`updatedAt` on every content-type, including `audit-log`. Since the audit row is created synchronously inside the `afterX` hook of the original write, `audit-log.createdAt` **is** the write timestamp — there is no meaningful distinction between "when the audited action happened" and "when the audit row was created" for this phase's needs (no async queueing, no batching).

`record_id` and `actor_id` are separate `integer` fields rather than combined strings — cleaner for querying/filtering in Content Manager, and avoids ambiguity between the two overlapping numeric id spaces (`admin::user` ids vs `plugin::users-permissions.user` ids) since `actor_type` disambiguates which table `actor_id` refers to.

## State of the Art

| Old Approach (mistaken premise in CONTEXT.md) | Current Approach (verified) | When Changed | Impact |
|---|---|---|---|
| Build custom AsyncLocalStorage middleware for request context | Use built-in `strapi.requestContext` | Present since early Strapi v5 (confirmed at 5.41.1, current installed version) | Removes an entire middleware file + config/middlewares.ts registration from the plan |
| `strapi.documents.use()` middleware for tracking writes | `strapi.db.lifecycles.subscribe()` | N/A — both APIs coexist in v5; `documents.use()` was never sufficient here per CONTEXT.md's own controller audit | Confirmed correct in CONTEXT.md, no change needed |

**Deprecated/outdated:** None relevant — this phase does not touch any deprecated Strapi v4 → v5 API surface (entityService is already fully migrated per STATE.md phase 122).

## Open Questions

1. **Should `afterDeleteMany` (and `afterCreateMany`/`afterUpdateMany`) be subscribed to at all?**
   - What we know: only one `deleteMany` call exists in the entire codebase (`verification-code-cleanup.cron.ts`, already a `system`-context cron job on ephemeral data). No `createMany`/`updateMany` calls exist anywhere. `afterDeleteMany`'s `result` is `{ count }` only — no per-record ids are available without an extra `beforeDeleteMany` → `findMany` lookup.
   - What's unclear: whether "every CRUD operation" as stated in the phase description is meant literally (including this one bulk cron delete) or pragmatically (the operations that matter for accountability — user-initiated single-record writes).
   - Recommendation: scope this phase to singular `afterCreate`/`afterUpdate`/`afterDelete` only, and explicitly document in the plan that bulk `*Many` operations (currently: one cron-only `deleteMany` call on verification codes) are out of scope for this phase — consistent with the "system writes are tagged, not audited in detail" spirit of the locked decisions. If the user wants bulk-op coverage, it's a small additive follow-up (subscribe to `afterDeleteMany`, log a single summary row per bulk call since per-record ids aren't available without extra querying).

2. **Does the Content Manager auto-show the new `audit-log` collection-type to admin roles without extra permission wiring?**
   - What we know: CONTEXT.md states this should be verified but expects no extra work needed, consistent with how every other content-type (`term`, `policy`, etc.) becomes visible in Content Manager automatically for the Super Admin role.
   - What's unclear: whether any non-Super-Admin admin roles need explicit permission grants to view `audit-log` — this project's admin panel appears to only use Super Admin in practice (no custom admin roles found in schemas), but this wasn't independently re-verified in this research pass beyond CONTEXT.md's own note.
   - Recommendation: verify in a manual QA step after Wave 1 implementation — log into the admin panel and confirm the new content-type appears under Content Manager without a manual permissions edit.

## Validation Architecture

*Skipped per `.planning/config.json`.* No `.planning/config.json` file exists in this project — the `workflow.nyquist_validation` key is therefore absent, which per instructions means "treat as enabled." However, no test framework config or test directory pattern was found under `apps/strapi/tests/` relevant to lifecycle subscribers as of this research (existing Strapi tests use Jest per CLAUDE.md, AAA pattern, mocking external dependencies).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (per CLAUDE.md — Strapi app uses Jest with AAA pattern) |
| Config file | `apps/strapi/jest.config.js` (assumed standard location — not independently verified in this pass) |
| Quick run command | `pnpm --filter strapi test -- audit-log` (adjust to actual jest config once Wave 0 confirms exact test script name) |
| Full suite command | `pnpm --filter strapi test` |

### Phase Requirements → Test Map
No formal requirement IDs exist for this phase (see Phase Requirements section). Suggested test coverage based on the locked decisions and verified behavior above:

| Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|
| `afterCreate` writes an audit row with correct action/uid/actor for an admin-authenticated write | unit (mocked `strapi.db`, `strapi.requestContext`) | `apps/strapi/tests/subscribers/audit-log.subscriber.test.ts` | ❌ Wave 0 |
| `afterUpdate`/`afterDelete` write audit rows with correct `record_id`/`record_document_id` from `event.result` | unit | same file | ❌ Wave 0 |
| Writes with no request context (`reqCtx` undefined) are tagged `actor_type: "system"` | unit | same file | ❌ Wave 0 |
| Writes to the `audit-log` content-type itself are skipped (no recursion) | unit | same file | ❌ Wave 0 |
| A thrown error inside `recordAuditEntry` does not propagate to the caller | unit | same file | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** targeted Jest run on the new subscriber test file
- **Per wave merge:** `pnpm --filter strapi test`
- **Phase gate:** full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/strapi/tests/subscribers/audit-log.subscriber.test.ts` — covers all behaviors in the table above, mocking `strapi.db.query`, `strapi.requestContext.get`, and `strapi.log.error`
- [ ] Confirm exact Jest config/test script location in `apps/strapi/package.json` before writing the test file path into task actions

## Sources

### Primary (HIGH confidence — read directly from exact installed version 5.41.1)
- `apps/strapi/package.json` — confirms `"@strapi/strapi": "5.41.1"`
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-database-5.41.1-*/node_modules/@strapi/database/dist/lifecycles/types.d.ts` — exact `Event`/`Action`/`Params`/`SubscriberMap` type shapes
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-database-5.41.1-*/node_modules/@strapi/database/dist/lifecycles/index.js` — exact dispatcher logic (`run()`, action/model filtering for `SubscriberMap`)
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-database-5.41.1-*/node_modules/@strapi/database/dist/entity-manager/index.js` — exact `create`/`update`/`delete`/`createMany`/`updateMany`/`deleteMany` implementations, confirming when `result` is populated and what it contains
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-database-5.41.1-*/node_modules/@strapi/database/dist/metadata/metadata.d.ts` — exact `Meta` (event.model) shape
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-core-5.41.1-*/node_modules/@strapi/core/dist/services/request-context.js` — exact `requestContext` AsyncLocalStorage implementation
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-core-5.41.1-*/node_modules/@strapi/core/dist/services/server/index.js` — exact wiring point (`app.use((ctx, next) => requestContext.run(ctx, () => next()))`)
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-core-5.41.1-*/node_modules/@strapi/core/dist/Strapi.js` — `get requestContext()` decoration onto global `strapi`
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-core-5.41.1-*/node_modules/@strapi/core/dist/services/document-service/entries.js` — exact `documents().create/update/delete()` → `strapi.db.query()` mapping (confirms single lifecycle fire per document op)
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-core-5.41.1-*/node_modules/@strapi/core/dist/services/auth/index.js` — exact `ctx.state.auth = { strategy, credentials, ability }` assignment
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-admin-5.41.1-*/node_modules/@strapi/admin/dist/server/server/src/strategies/admin.js` — confirms `name: 'admin'`, `ctx.state.user = user`
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-plugin-users-permissions-5.41.1-*/node_modules/@strapi/plugin-users-permissions/dist/server/strategies/users-permissions.js` — confirms `name: 'users-permissions'`, `ctx.state.user = user`
- `/mnt/wslg/distro/usr/local/share/.cache/yarn/v6/npm-@strapi-admin-5.41.1-*/node_modules/@strapi/admin/dist/server/server/src/strategies/api-token.js` — confirms `name: 'api-token'`, no `ctx.state.user` assignment
- `apps/strapi/src/api/*/content-types/*/schema.json` (all 20) — confirms all content-types have `draftAndPublish: false`; no `localized`/i18n configuration anywhere in the project
- `apps/strapi/src` grep for `updateMany|deleteMany|createMany` — confirms exactly one bulk-op call in the entire codebase
- `apps/strapi/src/api/faq/controllers/faq.ts` `reorder()` — confirms bulk reorder uses `Promise.all()` of individual `documents().update()` calls, not `updateMany`

### Secondary (MEDIUM confidence — official docs, verified consistent with primary source)
- https://docs.strapi.io/cms/backend-customization/requests-responses — official Strapi v5 docs confirming `strapi.requestContext.get()` is the documented pattern for reading `ctx.state.user` inside lifecycle hooks, consistent with the source-code finding above

### Tertiary (LOW confidence — none used for load-bearing claims)
None — all findings in this document trace to primary source reads at the exact installed package version.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, all APIs verified from exact installed version source
- Architecture (lifecycle event shape, requestContext, actor discriminator): HIGH — read directly from `@strapi/database@5.41.1` and `@strapi/core@5.41.1` compiled source, matching this project's exact installed version
- Pitfalls: HIGH for `*Many` action gap and `beforeX`-has-no-result (verified from source); MEDIUM for the recommendation to scope `*Many` out (a judgment call, clearly flagged as such in Open Questions)

**Research date:** 2026-07-01
**Valid until:** 2026-07-31 (30 days — Strapi v5.x is the active major version but the specific compiled internals read here are implementation details that could shift in a minor/patch bump; re-verify if `@strapi/strapi` version in `package.json` changes before this phase is implemented)
