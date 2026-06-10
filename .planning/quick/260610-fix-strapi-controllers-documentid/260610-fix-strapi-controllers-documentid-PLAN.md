---
phase: quick-260610-fix-strapi-controllers-documentid
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/api/region/controllers/region.ts
  - apps/strapi/src/api/faq/controllers/faq.ts
  - apps/strapi/src/api/category/controllers/category.ts
  - apps/strapi/src/api/commune/controllers/commune.ts
  - apps/strapi/src/api/condition/controllers/condition.ts
  - apps/strapi/src/api/term/controllers/term.ts
  - apps/strapi/src/api/policy/controllers/policy.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - "PUT /api/regions/{documentId} updates the record in the database"
    - "PUT /api/categories/{documentId} updates the record in the database"
    - "PUT /api/communes/{documentId} updates the record in the database"
    - "PUT /api/conditions/{documentId} updates the record in the database"
    - "PUT /api/faqs/{documentId} updates the record in the database"
    - "PUT /api/terms/{documentId} updates the record in the database"
    - "PUT /api/policies/{documentId} updates the record in the database"
    - "GET /api/{resource}/{documentId} returns the correct record"
    - "DELETE /api/{resource}/{documentId} deletes the correct record"
  artifacts:
    - path: apps/strapi/src/api/region/controllers/region.ts
      provides: "findOne, update, delete use where: { documentId } not where: { id }"
    - path: apps/strapi/src/api/category/controllers/category.ts
      provides: "findOne, update, delete use where: { documentId } not where: { id }"
    - path: apps/strapi/src/api/commune/controllers/commune.ts
      provides: "findOne, update, delete use where: { documentId } not where: { id }"
    - path: apps/strapi/src/api/condition/controllers/condition.ts
      provides: "findOne, update, delete use where: { documentId } not where: { id }"
    - path: apps/strapi/src/api/faq/controllers/faq.ts
      provides: "findOne, update (simplified), delete use where: { documentId }"
    - path: apps/strapi/src/api/term/controllers/term.ts
      provides: "findOne, update (simplified), delete use where: { documentId }"
    - path: apps/strapi/src/api/policy/controllers/policy.ts
      provides: "findOne, update (simplified), delete use where: { documentId }"
---

<objective>
Fix all 7 Strapi maintenance custom controllers so that findOne, update, and delete operations
use `where: { documentId }` instead of `where: { id }`.

Root cause: The frontend sends PUT /api/{resource}/{documentId} using a documentId string
(e.g. "lkp26a8jnrb0zsmxkm1ue7ow"). The custom controllers extract `ctx.params.id` and pass it
directly to `db.query().update({ where: { id } })`. Since `id` is the numeric primary key
and `documentId` is a string, the WHERE clause never matches any row. The update silently
returns null and the form shows "success" but nothing is persisted.

Output: All 7 controllers use documentId for single-record operations. Strapi TypeScript check passes.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix region.ts — findOne, update, delete to use documentId</name>
  <files>
    apps/strapi/src/api/region/controllers/region.ts
  </files>
  <action>
Read the file first. Then apply these 3 changes:

**findOne** — change from:
```typescript
async findOne(ctx) {
  const { id } = ctx.params;
  const region = await strapi.db.query("api::region.region").findOne({
    where: { id },
    populate: ["communes"],
  });
  return { data: region };
},
```
To:
```typescript
async findOne(ctx) {
  const { id: documentId } = ctx.params;
  const region = await strapi.db.query("api::region.region").findOne({
    where: { documentId },
    populate: ["communes"],
  });
  return { data: region };
},
```

**update** — change from:
```typescript
async update(ctx) {
  const { id } = ctx.params;
  const { data } = ctx.request.body;
  const region = await strapi.db
    .query("api::region.region")
    .update({ where: { id }, data });
  return { data: region };
},
```
To:
```typescript
async update(ctx) {
  const { id: documentId } = ctx.params;
  const { data } = ctx.request.body;
  const region = await strapi.db
    .query("api::region.region")
    .update({ where: { documentId }, data });
  return { data: region };
},
```

**delete** — change from:
```typescript
async delete(ctx) {
  const { id } = ctx.params;
  const region = await strapi.db
    .query("api::region.region")
    .delete({ where: { id } });
  return { data: region };
},
```
To:
```typescript
async delete(ctx) {
  const { id: documentId } = ctx.params;
  const region = await strapi.db
    .query("api::region.region")
    .delete({ where: { documentId } });
  return { data: region };
},
```
  </action>
  <verify>
    <automated>grep -n "where: { id }" apps/strapi/src/api/region/controllers/region.ts</automated>
  </verify>
  <done>Zero occurrences of `where: { id }` in region.ts (excluding `find` handler which uses variable filters).</done>
</task>

<task type="auto">
  <name>Task 2: Fix category.ts — findOne, update, delete to use documentId</name>
  <files>
    apps/strapi/src/api/category/controllers/category.ts
  </files>
  <action>
Read the file first. Apply the same 3-part pattern:

**findOne** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

**update** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

**delete** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

Do NOT touch the `find`, `create`, or `adCounts` methods.
  </action>
  <verify>
    <automated>grep -n "where: { id }" apps/strapi/src/api/category/controllers/category.ts</automated>
  </verify>
  <done>Zero occurrences of `where: { id }` in category.ts (the `adCounts` handler uses `where: { category: { id: { $eq: category.id } } }` which is correct and should NOT be changed — it's filtering ads by category using a relation, not finding the category itself).</done>
</task>

<task type="auto">
  <name>Task 3: Fix commune.ts — findOne, update, delete to use documentId</name>
  <files>
    apps/strapi/src/api/commune/controllers/commune.ts
  </files>
  <action>
Read the file first. Apply the same 3-part pattern:

**findOne** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`. Keep `populate: ["region"]` intact.

**update** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

**delete** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

Do NOT touch the `find` or `create` methods.
  </action>
  <verify>
    <automated>grep -n "where: { id }" apps/strapi/src/api/commune/controllers/commune.ts</automated>
  </verify>
  <done>Zero occurrences of `where: { id }` in commune.ts.</done>
</task>

<task type="auto">
  <name>Task 4: Fix condition.ts — findOne, update, delete to use documentId</name>
  <files>
    apps/strapi/src/api/condition/controllers/condition.ts
  </files>
  <action>
Read the file first. Apply the same 3-part pattern:

**findOne** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

**update** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

**delete** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

Do NOT touch the `find` or `create` methods.
  </action>
  <verify>
    <automated>grep -n "where: { id }" apps/strapi/src/api/condition/controllers/condition.ts</automated>
  </verify>
  <done>Zero occurrences of `where: { id }` in condition.ts.</done>
</task>

<task type="auto">
  <name>Task 5: Fix faq.ts — simplify update + fix findOne and delete to use documentId</name>
  <files>
    apps/strapi/src/api/faq/controllers/faq.ts
  </files>
  <action>
Read the file first.

**findOne** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

Current:
```typescript
async findOne(ctx) {
  const { id } = ctx.params;
  const faq = await strapi.db
    .query("api::faq.faq")
    .findOne({ where: { id } });
  return { data: faq };
},
```
Fixed:
```typescript
async findOne(ctx) {
  const { id: documentId } = ctx.params;
  const faq = await strapi.db
    .query("api::faq.faq")
    .findOne({ where: { documentId } });
  return { data: faq };
},
```

**update** — replace the dual numeric/documentId logic with clean documentId-only logic:

Current (the whole method):
```typescript
async update(ctx) {
  const { id } = ctx.params;
  const { data } = ctx.request.body;
  const numericId = Number(id);
  const isNumericId =
    Number.isInteger(numericId) &&
    numericId > 0 &&
    String(numericId) === String(id);
  const faq = isNumericId
    ? await strapi.db
        .query("api::faq.faq")
        .update({ where: { id: numericId }, data })
    : await strapi.db
        .query("api::faq.faq")
        .update({ where: { documentId: id }, data });
  return { data: faq };
},
```
Fixed:
```typescript
async update(ctx) {
  const { id: documentId } = ctx.params;
  const { data } = ctx.request.body;
  const faq = await strapi.db
    .query("api::faq.faq")
    .update({ where: { documentId }, data });
  return { data: faq };
},
```

**delete** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

Current:
```typescript
async delete(ctx) {
  const { id } = ctx.params;
  const faq = await strapi.db.query("api::faq.faq").delete({ where: { id } });
  return { data: faq };
},
```
Fixed:
```typescript
async delete(ctx) {
  const { id: documentId } = ctx.params;
  const faq = await strapi.db.query("api::faq.faq").delete({ where: { documentId } });
  return { data: faq };
},
```

Do NOT touch `find`, `create`, or `reorder` methods.
  </action>
  <verify>
    <automated>grep -n "where: { id" apps/strapi/src/api/faq/controllers/faq.ts && grep -n "numericId\|isNumericId" apps/strapi/src/api/faq/controllers/faq.ts</automated>
  </verify>
  <done>No `where: { id` patterns (except in reorder which uses documentId) and no numericId/isNumericId variables in faq.ts.</done>
</task>

<task type="auto">
  <name>Task 6: Fix term.ts — simplify update + fix findOne and delete to use documentId</name>
  <files>
    apps/strapi/src/api/term/controllers/term.ts
  </files>
  <action>
Read the file first. Apply the same pattern as Task 5 (faq.ts):

**findOne** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

**update** — replace the dual numeric/documentId logic with clean documentId-only:
```typescript
async update(ctx) {
  const { id: documentId } = ctx.params;
  const { data } = ctx.request.body;
  const term = await strapi.db
    .query("api::term.term")
    .update({ where: { documentId }, data });
  return { data: term };
},
```

**delete** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

Do NOT touch `find`, `create`, or `reorder` methods.
  </action>
  <verify>
    <automated>grep -n "where: { id" apps/strapi/src/api/term/controllers/term.ts && grep -n "numericId\|isNumericId" apps/strapi/src/api/term/controllers/term.ts</automated>
  </verify>
  <done>No `where: { id` patterns (outside of reorder which uses documentId) and no numericId/isNumericId in term.ts.</done>
</task>

<task type="auto">
  <name>Task 7: Fix policy.ts — simplify update + fix findOne and delete to use documentId</name>
  <files>
    apps/strapi/src/api/policy/controllers/policy.ts
  </files>
  <action>
Read the file first. Apply the same pattern as Task 5 (faq.ts):

**findOne** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

**update** — replace the dual numeric/documentId logic with clean documentId-only:
```typescript
async update(ctx) {
  const { id: documentId } = ctx.params;
  const { data } = ctx.request.body;
  const policy = await strapi.db
    .query("api::policy.policy")
    .update({ where: { documentId }, data });
  return { data: policy };
},
```

**delete** — rename `id` → `documentId`, change `where: { id }` → `where: { documentId }`.

Do NOT touch `find`, `create`, or `reorder` methods.
  </action>
  <verify>
    <automated>grep -n "where: { id" apps/strapi/src/api/policy/controllers/policy.ts && grep -n "numericId\|isNumericId" apps/strapi/src/api/policy/controllers/policy.ts</automated>
  </verify>
  <done>No `where: { id` patterns (outside of reorder which uses documentId) and no numericId/isNumericId in policy.ts.</done>
</task>

<task type="auto">
  <name>Task 8: TypeScript check — verify no new errors in Strapi</name>
  <files>
    apps/strapi/tsconfig.json
  </files>
  <action>
Run TypeScript check on the Strapi app to confirm no new errors were introduced.

```bash
cd /home/gab/Code/waldo-project/apps/strapi && npx tsc --noEmit 2>&1 | head -50
```

If there are errors related to the `where` clause types (e.g., TypeScript complaining that `documentId` is not a valid key), cast it:
```typescript
.update({ where: { documentId } as Record<string, unknown>, data })
```

Apply the cast only if TypeScript actually fails — do not add it preemptively.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/strapi && npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0 errors"</automated>
  </verify>
  <done>TypeScript reports 0 errors (or the same errors as before this change — run before/after to confirm no new ones).</done>
</task>

</tasks>

<verification>
Final verification after all 8 tasks:

1. No `where: { id }` left in single-record handlers across all 7 controllers:
   ```
   grep -n "where: { id }" apps/strapi/src/api/region/controllers/region.ts
   grep -n "where: { id }" apps/strapi/src/api/faq/controllers/faq.ts
   grep -n "where: { id }" apps/strapi/src/api/category/controllers/category.ts
   grep -n "where: { id }" apps/strapi/src/api/commune/controllers/commune.ts
   grep -n "where: { id }" apps/strapi/src/api/condition/controllers/condition.ts
   grep -n "where: { id }" apps/strapi/src/api/term/controllers/term.ts
   grep -n "where: { id }" apps/strapi/src/api/policy/controllers/policy.ts
   ```
   All 7 must return 0 lines (or only lines in the `find` handler's general filter passthrough, not in findOne/update/delete).

2. No dual numericId logic left in any controller:
   ```
   grep -rn "numericId\|isNumericId" apps/strapi/src/api/
   ```
   Must return 0 lines.

3. All 7 controllers have `where: { documentId }` in their update methods:
   ```
   grep -rn "where: { documentId }" apps/strapi/src/api/region/ apps/strapi/src/api/faq/ apps/strapi/src/api/category/ apps/strapi/src/api/commune/ apps/strapi/src/api/condition/ apps/strapi/src/api/term/ apps/strapi/src/api/policy/
   ```
   Must return at least 3 lines per controller (findOne + update + delete).
</verification>

<success_criteria>
- All 7 maintenance controllers use documentId for findOne, update, and delete
- No dual numeric/documentId logic remains
- TypeScript check passes (0 new errors)
- Frontend can PUT /api/{resource}/{documentId} and the change persists in the database
</success_criteria>

<output>
After completion, create `.planning/quick/260610-fix-strapi-controllers-documentid/260610-fix-strapi-controllers-documentid-SUMMARY.md`
</output>
