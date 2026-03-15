---
phase: quick-49
plan: "01"
subsystem: strapi/seo
tags: [robots-txt, seo, crawler-blocking, strapi]
dependency_graph:
  requires: []
  provides: [strapi-robots-txt-blocks-all-crawlers]
  affects: []
tech_stack:
  added: []
  patterns: [static-file-serving-from-public]
key_files:
  created: []
  modified:
    - apps/strapi/public/robots.txt
decisions:
  - "Uncomment existing User-agent: * and Disallow: / directives — no new file needed, Strapi serves public/ automatically"
metrics:
  duration: "< 1 minute"
  completed: "2026-03-15"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 49: Block Strapi robots.txt to Prevent Search Indexing — Summary

**One-liner:** Uncommented `User-agent: *` / `Disallow: /` in Strapi's robots.txt to block all search crawlers from the API backend.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Uncomment Disallow directives in Strapi robots.txt | 30a8a94 | apps/strapi/public/robots.txt |

## What Was Done

The file `apps/strapi/public/robots.txt` existed with the correct directives commented out (behind `#`). The comment lines were removed, leaving only the two active directives:

```
User-agent: *
Disallow: /
```

Strapi automatically serves files from `public/` — no configuration change was needed. Any crawler requesting `GET /robots.txt` from the Strapi origin now receives a response instructing it to index nothing.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `apps/strapi/public/robots.txt` contains `User-agent: *` and `Disallow: /` (verified by `grep -c`)
- [x] No comment characters (`#`) in file
- [x] No extra blank lines or stray content (file is 2 lines + trailing newline)
- [x] Commit `30a8a94` exists

## Self-Check: PASSED
