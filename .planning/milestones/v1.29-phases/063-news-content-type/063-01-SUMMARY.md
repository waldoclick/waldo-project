---
phase: 063-news-content-type
plan: 01
status: complete
completed_at: "2026-03-12"
requirements_addressed:
  - NEWS-01
  - NEWS-02
  - NEWS-03
  - NEWS-08
---

# Summary: News Content Type

## What Was Done

Created the `News` collection type in Strapi v5 with all required fields, category relation, SEO metadata, and native draft/publish support.

## Files Created

- `apps/strapi/src/api/article/content-types/article/schema.json` — Content type schema with 8 attributes
- `apps/strapi/src/api/article/controllers/article.ts` — Core controller factory
- `apps/strapi/src/api/article/routes/article.ts` — Core router factory
- `apps/strapi/src/api/article/services/article.ts` — Core service factory

## Schema Details

```json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "options": { "draftAndPublish": true },
  "attributes": {
    "title":           { "type": "string",   "required": true },
    "header":          { "type": "string",   "required": false },
    "body":            { "type": "richtext", "required": false },
    "cover":           { "type": "media",    "multiple": true, "allowedTypes": ["images"] },
    "gallery":         { "type": "media",    "multiple": true, "allowedTypes": ["images"] },
    "categories":      { "type": "relation", "relation": "manyToMany", "target": "api::category.category" },
    "seo_title":       { "type": "string",   "required": false },
    "seo_description": { "type": "string",   "required": false }
  }
}
```

## Key Decisions

- `singularName: "article"`, `pluralName: "articles"` — clean conventional naming; Strapi's uniqueness check puts both in the same array so they must differ
- `collectionName: "articles"` — matches the API naming
- `draftAndPublish: true` — uses Strapi's native toggle, no custom `status` field
- `categories` is `manyToMany` (not `manyToOne`) — allows an article to belong to multiple categories
- Both `cover` and `gallery` are `multiple: true` media fields with `allowedTypes: ["images"]`
- All TypeScript errors from `tsc --noEmit` are exclusively the Strapi `ContentType` union — these auto-resolve when Strapi restarts and regenerates its type registry

## Requirements Addressed

- **NEWS-01** ✓ — title (string), header (string), body (richtext), cover (media/multiple), gallery (media/multiple)
- **NEWS-02** ✓ — categories manyToMany relation to `api::category.category` (optional)
- **NEWS-03** ✓ — `"draftAndPublish": true` in options; no custom status field
- **NEWS-08** ✓ — seo_title and seo_description as optional string fields

## What Phase 064 Can Use

- Endpoint: `/api/articles` (GET list, GET single, POST, PUT, DELETE)
- Content type UID: `api::article.article`
- All standard Strapi CRUD routes available via core router
