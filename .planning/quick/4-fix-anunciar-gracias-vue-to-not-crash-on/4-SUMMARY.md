# Quick Task 4 Summary: Fix Strapi ad service findOne to query by documentId

**Date:** 2026-03-11
**Commit:** 5939419

## Root Cause

`apps/strapi/src/api/ad/services/ad.ts` overrides Strapi's core `findOne`. The
override always used `where: { id }` regardless of whether a numeric id or a
documentId string was passed. In Strapi v5, the REST API `GET /api/ads/:documentId`
calls `service.findOne(documentId_string, options)` — the string gets passed as
`id`, then `where: { id: "k7ngras0ffwhh68ttuyunsgv" }` matches nothing (id is
numeric), causing a 404.

## Fix

Added type detection: if `id` is a string that can't be parsed as a number, use
`where: { documentId: id }`. Otherwise use `where: { id: Number(id) }`.

## Files Changed

- `apps/strapi/src/api/ad/services/ad.ts` — fixed `findOne` where clause

## Impact

Fixes `/anunciar/gracias?ad=:documentId` — the page now correctly fetches the ad.
Also fixes any other place that calls the Strapi REST API `GET /api/ads/:documentId`.
