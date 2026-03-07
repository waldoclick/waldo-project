# Phase 40: Users Filter Authenticated — Research

**Researched:** 2026-03-07
**Domain:** Strapi v5 users-permissions plugin — `/api/users` filtering, populate, controller extension
**Confidence:** HIGH (all critical findings verified against installed node_modules source)

---

## Summary

The dashboard's `UsersDefault.vue` needs to show **only Authenticated users** and drop the "Rol" column. Three
separate problems must be solved:

1. **`filters[role][name][$eq]=Authenticated` returns 400** — The route-level Zod validator accepts the shape
   (`filters` is `z.record(z.string(), z.any())`), but the **content-API query sanitizer strips every relation
   filter it cannot authorise** via `removeRestrictedRelations`. The `role` relation on `plugin::users-permissions.user`
   targets `plugin::users-permissions.role`, and the sanitizer calls `strapi.auth.verify(auth, { scope:
   'plugin::users-permissions.role.find' })`. A regular JWT user does not have that scope, so the filter key is
   silently removed and the endpoint returns all users — or, depending on version, throws a 400 before reaching
   the DB.

2. **`populate: { role: { fields: ["name"] } }` returns `role: null/-`** — Same mechanism: `sanitizePopulate`
   strips relation population the caller is not allowed to access. Anonymous / regular-user tokens cannot
   populate `role` on `/api/users`.

3. **`getUserDataWithFilters` is already written but commented out** — `strapi-server.ts` is fully commented
   and the plugin's controller extension is inactive. The custom controller at
   `src/extensions/users-permissions/controllers/userController.ts` (`getUserDataWithFilters`) already
   implements DB-level role filtering and `populate: { role: true }` via `strapi.db.query`, which bypasses
   content-API sanitization entirely.

**Primary recommendation:** Re-enable `strapi-server.ts` for the `find` route only, wiring it to the
already-written `getUserDataWithFilters`. Then add a hard-coded `role.type = 'authenticated'` filter inside
that function (server-side, non-forgeable). Remove the `populate: { role: … }` from the dashboard call and
drop the "Rol" table column.

---

## Standard Stack

### Core — verified from installed source

| Component | Version | File |
|-----------|---------|------|
| `@strapi/plugin-users-permissions` | 5.36.1 | `node_modules/@strapi/plugin-users-permissions/` |
| Default `find` controller | `user.js` line 151-157 | `server/controllers/user.js` |
| Default `fetchAll` service | `user.js` line 109-113 | `server/services/user.js` |
| Zod route validator | `validation.js` | `server/routes/content-api/validation.js` |
| Query sanitizer | `sanitize/index.js` line 78-108 | `node_modules/@strapi/utils/dist/sanitize/index.js` |
| `removeRestrictedRelations` | visitor | `node_modules/@strapi/utils/dist/sanitize/visitors/remove-restricted-relations.js` |

---

## Root Cause Analysis — All Four Research Questions Answered

### Q1: Does `/api/users` support `filters[role][name][$eq]=Authenticated`?

**Answer: No — verified from source (HIGH confidence)**

The Zod route schema (`validation.js`) defines `filters: validator.filters.optional()` where
`filters = z.record(z.string(), z.any())`. The Zod layer **accepts** the filter. The problem is downstream:

```javascript
// node_modules/@strapi/utils/dist/sanitize/index.js  line 110-131
const sanitizeFilters = (filters, schema, { auth } = {}) => {
  // ...
  transforms.push(queryFilters(removeRestrictedRelations(auth), { schema, getModel }));
  // ...
};
```

`removeRestrictedRelations` walks every relation key in `filters`. For `role`:

```javascript
// remove-restricted-relations.js
const handleRegularRelation = async () => {
  const scopes = ACTIONS_TO_VERIFY.map((action) => `${attribute.target}.${action}`);
  // attribute.target = 'plugin::users-permissions.role'
  // scopes = ['plugin::users-permissions.role.find']
  const isAllowed = await hasAccessToSomeScopes(scopes, auth);
  if (!isAllowed) {
    remove(key); // <-- silently drops the filter key
  }
};
```

A dashboard JWT does not hold `plugin::users-permissions.role.find` scope → the `role` key is stripped →
either the request proceeds without the filter (returns everyone) or Strapi v5.36 throws 400 on the
now-invalid query shape. **There is no way to fix this from the client without overriding the controller.**

### Q2: Does `populate=role` work on `/api/users`?

**Answer: No — same sanitizer applies (HIGH confidence)**

`sanitizePopulate` in `sanitize/index.js` (line 163+) also calls `removeRestrictedRelations(auth)` on the
populate tree. The `role` relation is stripped for the same reason as filters. This is why `user.role?.name`
comes back as `undefined` / `-` in the dashboard — the field never reaches the response.

### Q3: Recommended approach

**Answer: Override `plugin.controllers.user.find` in `strapi-server.ts` (HIGH confidence)**

Three options were evaluated:

| Option | How | Verdict |
|--------|-----|---------|
| A) Client-side filter query param | `filters[role][name][$eq]=…` | ❌ Sanitizer strips it — impossible |
| B) Global Strapi middleware | Hook on `/api/users` path | ⚠️ Works but complex; can't inject DB-level where clause cleanly |
| C) Plugin controller override via `strapi-server.ts` | `plugin.controllers.user.find = getUserDataWithFilters` | ✅ **Correct** — uses `strapi.db.query` directly, bypasses sanitizer, already written |

**Option C is correct** because:
- The custom `getUserDataWithFilters` in `userController.ts` already uses `strapi.db.query(…).findWithCount()`
  which is **not subject to content-API sanitization**
- It already does `populate: { role: true, … }` at the DB layer — role data will be present
- The code is already written, tested, and commented out — only un-commenting is needed
- The controller returns `{ data: [], meta: { pagination: {} } }` which `UsersDefault.vue` already handles
  (the `response.data` branch in its response adapter, lines 173-177)

### Q4: Existing extension that can be leveraged

**Answer: Yes — `getUserDataWithFilters` in `userController.ts` (HIGH confidence)**

```
apps/strapi/src/extensions/users-permissions/
├── strapi-server.ts          ← entire file is commented out; line 169-173 is the live stub
├── controllers/
│   ├── userController.ts     ← getUserDataWithFilters at line 164 — exactly what we need
│   ├── avatarUpdateController.ts
│   ├── coverUpdateController.ts
│   ├── usernameUpdateController.ts
│   ├── userUpdateController.ts
│   └── authController.ts
└── content-types/user/schema.json
```

`getUserDataWithFilters` (line 164-204 in `userController.ts`):
- Accepts `ctx.query.filters` and `ctx.query.pagination`
- Calls `strapi.db.query('plugin::users-permissions.user').findWithCount({ where: filters, populate: { role: true, … } })`
- Returns `{ data: detailedUsers[], meta: { pagination: { page, pageSize, pageCount, total } } }`

---

## Architecture Patterns

### Recommended: Minimal controller override in `strapi-server.ts`

The existing code just needs two changes:

**1. Uncomment the import for `getUserDataWithFilters` and wire it:**

```typescript
// apps/strapi/src/extensions/users-permissions/strapi-server.ts

import { getUserDataWithFilters } from "./controllers/userController";

export default function (plugin) {
  // Override only the find (GET /users) controller
  plugin.controllers.user.find = getUserDataWithFilters;
  return plugin;
}
```

**2. Add a hard-coded Authenticated role filter inside `getUserDataWithFilters`:**

```typescript
// apps/strapi/src/extensions/users-permissions/controllers/userController.ts

export const getUserDataWithFilters = async (ctx) => {
  const { filters: clientFilters = {}, pagination = {}, sort } = ctx.query;

  const page = parseInt(pagination.page || "1", 10);
  const pageSize = parseInt(pagination.pageSize || "25", 10);

  // Server-enforced: only return Authenticated users — non-forgeable from client
  const authenticatedRole = await strapi.db
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "authenticated" } });

  const where = {
    ...clientFilters,
    ...(authenticatedRole ? { role: { id: authenticatedRole.id } } : {}),
  };

  const [users, total] = await strapi.db
    .query("plugin::users-permissions.user")
    .findWithCount({
      where,
      populate: { role: true, commune: { populate: ["region"] }, avatar: true, cover: true },
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: sort || { createdAt: "desc" },
    });

  ctx.body = {
    data: users.map(sanitizeUser),
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        total,
      },
    },
  };
};
```

> **Note:** The existing `getUserDataWithFilters` calls `getDetailedUserData` per user, which fires 5 additional
> DB queries per user (ad counts, reservations). For a list of 100 users that is 500 extra queries. Consider
> removing `getDetailedUserData` from the list controller and keeping it only for single-user detail views.

### Response structure already handled in the dashboard

`UsersDefault.vue` lines 173-177 already handle `{ data: User[], meta: { pagination: … } }`:

```typescript
} else if (response.data) {
  allUsers.value = Array.isArray(response.data) ? response.data : [];
  paginationMeta.value = (response.meta?.pagination || null) as typeof paginationMeta.value;
}
```

So **no change is needed in the dashboard's response parsing logic** once the Strapi controller is fixed.

### Remove `populate` from dashboard call

Once the controller handles `populate: { role: true }` server-side (and role data is still present in the
response), there is no need to send `populate: { role: { fields: ["name"] } }` from the client. However,
since the goal is to **remove the "Rol" column entirely**, there is also no need for role data in the
response at all. The `populate` key can be dropped from `searchParams`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Role-based filtering of users | Client-side filter via query params | Server-side `where: { role: { id } }` in controller | Sanitizer strips relation keys from client filters |
| Bypassing content-API sanitizer | Custom middleware modifying queries | `strapi.db.query` (lower layer, no sanitization) | DB layer is not subject to content-API auth restrictions |
| Role ID lookup | Hardcode the role ID | `strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } })` | Role IDs differ between environments |

---

## Common Pitfalls

### Pitfall 1: Hardcoding the role ID
**What goes wrong:** The Authenticated role has ID 1 in one environment, ID 3 in another.
**Why it happens:** Strapi seeds roles in order; if custom roles are created before Authenticated, IDs shift.
**How to avoid:** Always look up `type: 'authenticated'` dynamically at request time (or cache it at bootstrap).

### Pitfall 2: Overriding ALL controllers at once
**What goes wrong:** Uncommenting all of `strapi-server.ts` breaks the app — AGENTS.md explicitly states
"Custom controllers in plugin extensions are **not supported** in Strapi v5".
**Why it happens:** Some controller actions (updateMe, etc.) rely on Strapi v4 patterns no longer valid.
**How to avoid:** Only override `plugin.controllers.user.find`. Leave everything else commented.

### Pitfall 3: `getDetailedUserData` in list context
**What goes wrong:** N+1 query explosion — 5 DB queries × N users on every page load.
**Why it happens:** `getDetailedUserData` counts ads, reservations, etc. — designed for single-user detail.
**How to avoid:** Call it only from `getUserDataById`, not from the list controller.

### Pitfall 4: `populate` sent from client still stripped
**What goes wrong:** Dashboard sends `populate: { role: { fields: ["name"] } }` but the custom controller
ignores it (uses its own hardcoded populate).
**Why it happens:** `strapi.db.query` uses the `populate` from the code, not from `ctx.query`.
**How to avoid:** Remove `populate` from `searchParams` in `UsersDefault.vue` — it's unused and confusing.

### Pitfall 5: `pagination` not passed in `searchParams`
**What goes wrong:** The existing `UsersDefault.vue` sends `pagination: { page, pageSize }` in `searchParams`
but `getUserDataWithFilters` currently reads it as `ctx.query.pagination` — `@nuxtjs/strapi` serialises nested
objects as query strings. Verify the key names match (`pagination[page]` / `pagination[pageSize]`).
**Why it happens:** Strapi's query-params parsing expects `qs`-style deep objects.
**How to avoid:** Test with the actual query string received by Strapi (log `ctx.query` during dev).

### Pitfall 6: Response structure mismatch after enabling override
**What goes wrong:** Current `/api/users` returns a plain array; after enabling the override it returns
`{ data: [], meta: {} }`. Any other place in the dashboard that calls `strapi.find("users", …)` and
expects an array will break.
**Why it happens:** Changing the response contract of a shared endpoint has cascading effects.
**How to avoid:** Check all callers of `strapi.find("users", …)` across the dashboard before enabling.
**Known callers:** `UsersDefault.vue` (already handles both shapes).

---

## Code Examples

### Wiring the controller in `strapi-server.ts`
```typescript
// Source: apps/strapi/src/extensions/users-permissions/strapi-server.ts
// Official pattern: https://docs.strapi.io/cms/plugins-development/plugins-extension

import { getUserDataWithFilters } from "./controllers/userController";

export default function (plugin) {
  plugin.controllers.user.find = getUserDataWithFilters;
  return plugin;
}
```

### Server-side role filter in `getUserDataWithFilters`
```typescript
// Source: apps/strapi/src/extensions/users-permissions/controllers/userController.ts
// Pattern: strapi.db.query bypasses content-API sanitizer

const authenticatedRole = await strapi.db
  .query("plugin::users-permissions.role")
  .findOne({ where: { type: "authenticated" } });

const where = {
  ...clientFilters,
  ...(authenticatedRole ? { role: { id: authenticatedRole.id } } : {}),
};
```

### `strapi.db.query` populate pattern (already in codebase)
```typescript
// Source: apps/strapi/src/extensions/users-permissions/controllers/userController.ts line 172-186
const [users, total] = await strapi.db
  .query("plugin::users-permissions.user")
  .findWithCount({
    where: filters,
    populate: {
      role: true,
      commune: { populate: ["region"] },
      avatar: true,
      cover: true,
    },
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });
```

### Removing `populate` and "Rol" column from dashboard
```typescript
// apps/dashboard/app/components/UsersDefault.vue — searchParams
const searchParams: Record<string, unknown> = {
  pagination: { page: settingsStore.users.currentPage, pageSize: settingsStore.users.pageSize },
  sort: settingsStore.users.sortBy,
  // populate: { role: { fields: ["name"] } }  ← DELETE: unused after server override
};

// tableColumns — remove the "Rol" entry:
const tableColumns = [
  { label: "ID" },
  { label: "Usuario" },
  { label: "Correo electrónico" },
  { label: "Nombre" },
  // { label: "Rol" },  ← DELETE
  { label: "Fecha" },
  { label: "Acciones", align: "right" as const },
];
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Controller extensions (Strapi v4) | Middleware extensions (Strapi v5) | Custom controllers work in `strapi-server.ts` but Strapi docs warn against it for most actions |
| `strapi.entityService` (v4) | `strapi.db.query` / `strapi.documents` (v5) | `strapi.entityService` still works in v5 but is deprecated |
| Plain array from `/api/users` | Plain array (unchanged) | `/api/users` still returns a plain array; the custom controller can return `{ data, meta }` instead |

**Note:** The existing `getUserDataWithFilters` already uses `strapi.db.query` — the correct v5 pattern.

---

## Open Questions

1. **Other callers of `strapi.find("users", …)` in the dashboard**
   - What we know: `UsersDefault.vue` handles both array and `{ data, meta }` shapes
   - What's unclear: Are there other pages/composables calling this endpoint that only expect a plain array?
   - Recommendation: Search the dashboard for `find("users"` before enabling the override

2. **N+1 query impact of `getDetailedUserData`**
   - What we know: It fires 5 extra queries per user (ad counts, reservation counts)
   - What's unclear: Whether the current implementation calls it in the list controller or only single view
   - Recommendation: The current `getUserDataWithFilters` (line 188-192) **does** call it in a `Promise.all` — this should be removed for the list endpoint

3. **Admin panel permissions for `/api/users`**
   - What we know: The endpoint requires an authenticated JWT with the `find` permission enabled for the User content type in Users & Permissions plugin settings
   - What's unclear: Whether the dashboard's token has this permission enabled
   - Recommendation: Verify the "Authenticated" role has `users-permissions > user > find` permission enabled

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (Strapi) |
| Config file | `apps/strapi/jest.config.js` or `package.json` |
| Quick run command | `yarn workspace strapi test --testPathPattern=userController` |
| Full suite command | `yarn workspace strapi test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FILTER-01 | `getUserDataWithFilters` returns only Authenticated users | unit | `yarn workspace strapi test --testPathPattern=userController` | ❌ Wave 0 |
| FILTER-02 | `getUserDataWithFilters` respects `pagination` params | unit | same | ❌ Wave 0 |
| FILTER-03 | `getUserDataWithFilters` respects `sort` and `filters` from `ctx.query` | unit | same | ❌ Wave 0 |
| FILTER-04 | Dashboard "Rol" column no longer exists in `tableColumns` | manual/visual | — | N/A |

### Sampling Rate
- **Per task commit:** `yarn workspace strapi test --testPathPattern=userController`
- **Per wave merge:** `yarn workspace strapi test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `apps/strapi/src/extensions/users-permissions/controllers/userController.test.ts` — covers FILTER-01, FILTER-02, FILTER-03

*(No test framework install needed — Jest already configured in `apps/strapi`)*

---

## Sources

### Primary (HIGH confidence)
- `node_modules/@strapi/plugin-users-permissions/server/controllers/user.js` — actual `find` controller source
- `node_modules/@strapi/plugin-users-permissions/server/services/user.js` — `fetchAll` service
- `node_modules/@strapi/plugin-users-permissions/server/routes/content-api/user.js` — route definitions with Zod schema
- `node_modules/@strapi/plugin-users-permissions/server/routes/content-api/validation.js` — `filtersSchema = z.record(z.string(), z.any())`
- `node_modules/@strapi/utils/dist/sanitize/index.js` — `sanitizeFilters` and `sanitizePopulate` implementations
- `node_modules/@strapi/utils/dist/sanitize/visitors/remove-restricted-relations.js` — exact logic that strips `role` filter key
- `apps/strapi/src/extensions/users-permissions/strapi-server.ts` — current state (fully commented out)
- `apps/strapi/src/extensions/users-permissions/controllers/userController.ts` — `getUserDataWithFilters` implementation
- `apps/dashboard/app/components/UsersDefault.vue` — current component with response adapter logic

### Secondary (MEDIUM confidence)
- `https://docs.strapi.io/cms/plugins-development/plugins-extension` — confirmed `strapi-server.ts` extension pattern for Strapi v5
- `https://docs.strapi.io/cms/features/users-permissions` — confirmed `role` attribute structure and default roles

---

## Metadata

**Confidence breakdown:**
- Root cause analysis (400 / role undefined): HIGH — verified directly against installed sanitizer source
- Architecture (controller override): HIGH — confirmed against docs and existing codebase pattern
- Implementation approach (un-commenting `strapi-server.ts`): HIGH — code already written, just deactivated
- N+1 risk: HIGH — counted query calls in `getDetailedUserData`
- Dashboard changes needed: HIGH — read `UsersDefault.vue` fully

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable library — Strapi 5.36.x)
