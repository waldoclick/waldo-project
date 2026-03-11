# Quick Task 4: Fix Strapi ad service findOne to query by documentId

## Root Cause

`apps/strapi/src/api/ad/services/ad.ts` overrides Strapi's core `findOne` method.
The override always does `where: { id }` — but in Strapi v5, the REST API calls
`findOne(documentId_string, options)`. This causes a type mismatch: comparing a
`documentId` string against the numeric `id` column returns no results → 404.

## Fix

Detect whether the `id` parameter is a string (documentId) or a number, and use
the correct `where` clause accordingly:

```ts
const where =
  typeof id === "string" && isNaN(Number(id))
    ? { documentId: id }
    : { id: Number(id) };
```

## File

- `apps/strapi/src/api/ad/services/ad.ts`
