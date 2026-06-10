---
phase: quick-260610-fix-strapi-controllers-documentid
status: complete
date: 2026-06-10
---

# Summary — Fix Strapi Controllers: documentId

## What was changed per file

### region.ts
- `findOne`: `const { id }` → `const { id: documentId }`, `where: { id }` → `where: { documentId }`
- `update`: same rename + where fix
- `delete`: same rename + where fix

### category.ts
- `findOne`: `const { id }` → `const { id: documentId }`, `where: { id }` → `where: { documentId }`
- `update`: same rename + where fix
- `delete`: same rename + where fix
- `adCounts` method left untouched (uses `where: { category: { id: { $eq: category.id } } }` — filtering ads by relation, correct as-is)

### commune.ts
- `findOne`: `const { id }` → `const { id: documentId }`, `where: { id }` → `where: { documentId }` (kept `populate: ["region"]`)
- `update`: same rename + where fix
- `delete`: same rename + where fix

### condition.ts
- `findOne`: `const { id }` → `const { id: documentId }`, `where: { id }` → `where: { documentId }`
- `update`: same rename + where fix
- `delete`: same rename + where fix

### faq.ts
- `findOne`: `const { id }` → `const { id: documentId }`, `where: { id }` → `where: { documentId }`
- `update`: removed dual numericId/isNumericId branch entirely — replaced with clean `const { id: documentId } = ctx.params` + single `where: { documentId }` call
- `delete`: same rename + where fix
- `reorder` method left untouched (already used `where: { documentId: entry.documentId }`)

### term.ts
- `findOne`: `const { id }` → `const { id: documentId }`, `where: { id }` → `where: { documentId }`
- `update`: removed dual numericId/isNumericId branch entirely — replaced with clean `const { id: documentId } = ctx.params` + single `where: { documentId }` call
- `delete`: same rename + where fix
- `reorder` method left untouched

### policy.ts
- `findOne`: `const { id }` → `const { id: documentId }`, `where: { id }` → `where: { documentId }`
- `update`: removed dual numericId/isNumericId branch entirely — replaced with clean `const { id: documentId } = ctx.params` + single `where: { documentId }` call
- `delete`: same rename + where fix
- `reorder` method left untouched

## TypeScript check result

```
cd apps/strapi && npx tsc --noEmit
```

Output: (no output) — 0 errors. No type casts were needed; `documentId` was accepted as a valid where-clause key by the Strapi db.query types.

## Final verification grep results

### 1. No `where: { id }` remaining in any of the 7 controllers

```
grep -rn "where: { id }" region.ts category.ts commune.ts condition.ts faq.ts term.ts policy.ts
```

Result: **0 lines** (exit 1 = no matches)

### 2. No dual numericId/isNumericId logic remaining

```
grep -rn "numericId\|isNumericId" faq.ts term.ts policy.ts
```

Result: **0 lines** (exit 1 = no matches)

### 3. All 7 controllers have `where: { documentId }` — exactly 3 per file

21 total hits confirmed (findOne + update + delete for each of 7 controllers).

## Root cause fixed

The REST API routes receive a `documentId` string (e.g. `lkp26a8jnrb0zsmxkm1ue7ow`) in `ctx.params.id`. Previously, `where: { id: "lkp26a8..." }` was matching against the numeric primary key column — never finding any row. Updates silently returned null while the UI reported success. All 7 controllers now query by `documentId` string, which is the correct Strapi v5 identifier for single-record operations via the REST API.
