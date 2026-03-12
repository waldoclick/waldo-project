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

- `apps/strapi/src/api/news/content-types/news/schema.json` — Content type schema with 8 attributes
- `apps/strapi/src/api/news/controllers/news.ts` — Core controller factory
- `apps/strapi/src/api/news/routes/news.ts` — Core router factory
- `apps/strapi/src/api/news/services/news.ts` — Core service factory

## Schema Details

```json
{
  "kind": "collectionType",
  "collectionName": "news_items",
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

- `collectionName: "news_items"` — avoids SQL reserved word collision with `news`
- `draftAndPublish: true` — uses Strapi's native toggle, no custom `status` field
- `categories` is `manyToMany` (not `manyToOne`) — allows a news entry to belong to multiple categories
- Both `cover` and `gallery` are `multiple: true` media fields with `allowedTypes: ["images"]`
- All TypeScript errors from `tsc --noEmit` are exclusively the Strapi `ContentType` union — these auto-resolve when Strapi restarts and regenerates its type registry

## Requirements Addressed

- **NEWS-01** ✓ — title (string), header (string), body (richtext), cover (media/multiple), gallery (media/multiple)
- **NEWS-02** ✓ — categories manyToMany relation to `api::category.category` (optional)
- **NEWS-03** ✓ — `"draftAndPublish": true` in options; no custom status field
- **NEWS-08** ✓ — seo_title and seo_description as optional string fields

## What Phase 064 Can Use

- Endpoint: `/api/news-articles` (GET list, GET single, POST, PUT, DELETE)
- Content type UID: `api::news.news`
- All standard Strapi CRUD routes available via core router
- Note: `pluralName` is `"news-articles"` (not `"news"`) — Strapi's validator puts singularName and pluralName in the same uniqueness array, so `"news"/"news"` would collide with itself
