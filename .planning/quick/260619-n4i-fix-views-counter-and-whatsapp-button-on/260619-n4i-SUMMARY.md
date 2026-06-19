---
phase: quick
plan: 260619-n4i
subsystem: strapi/ad-view
tags: [bug-fix, ad-views, whatsapp, local-dev]
dependency_graph:
  requires: []
  provides: [recordView-no-owner-exclusion, whatsapp-test-data]
  affects: [api::ad-view.ad-view, up_users]
tech_stack:
  added: []
  patterns: [visitor_hash-dedup-only]
key_files:
  modified:
    - apps/strapi/src/api/ad-view/services/ad-view.ts
  created: []
decisions:
  - "Owner exclusion removed: visitor_hash dedup (sha256 ip+ua+day) is sufficient to prevent inflation; owners legitimately visit their own pages"
  - "populate: ['user'] removed from Step 2 findOne — no longer needed after owner guard removal; reduces unnecessary DB join"
metrics:
  duration_minutes: 5
  tasks_completed: 2
  files_modified: 1
  completed_date: "2026-06-19"
---

# Quick Task 260619-n4i Summary

**One-liner:** Remove owner-exclusion guard from recordView (visitor_hash dedup sufficient) and set whatsapp='+56912345678' for local dev user id=2.

## Tasks Completed

| # | Task | Commit | Result |
|---|------|--------|--------|
| 1 | Remove owner-exclusion guard from recordView | 854f48d8 | TypeScript clean, adUser grep = 0 hits |
| 2 | Set whatsapp for user id=2 in SQLite | no commit (gitignored) | SELECT returns `2\|gabrielburgos\|+56912345678` |

## Changes Made

### Task 1 — apps/strapi/src/api/ad-view/services/ad-view.ts

Removed the "Step 3: Owner exclusion" block:
- `const adUser = ad.user as Record<string, unknown> | null | undefined;`
- `if (viewerId && adUser?.id === viewerId) return;`
- The comment line `// Step 3: Owner exclusion`

Also cleaned up:
- Removed `populate: ["user"]` from the Step 2 findOne (no longer needed)
- Updated Step 2 comment from "Resolve the ad with its owner" to "Resolve the ad numeric id"
- Updated Step numbering (old Step 4 → Step 3, old Step 5 → Step 4)
- Removed JSDoc bullet `- Owner exclusion: if viewerId === ad.user.id, returns early (no row).`
- Updated class-level JSDoc: replaced "excluding the ad owner" with "(sha256 dedup: ip+ua+day)"

**IMPORTANT: Strapi must be restarted for this change to take effect.** TypeScript is compiled at startup — the running process still has the old compiled code with the owner-exclusion guard active.

### Task 2 — apps/strapi/.tmp/data.db

```sql
UPDATE up_users SET whatsapp='+56912345678' WHERE id=2;
```

No Strapi restart needed — DB reads are live. The manager bypass path (`ad.ts:942`) skips `sanitizeAdForPublic` and reads raw `user.whatsapp` directly from the populate result. After this update, `AdSingle.vue` will resolve `hasWhatsapp = !!(undefined || '+56912345678') = true` and render the WhatsApp button.

## Verification

- TypeScript: `npx tsc --noEmit` exits 0 (no output)
- `grep -n "adUser" apps/strapi/src/api/ad-view/services/ad-view.ts | wc -l` returns 0
- SQLite: `SELECT id, username, whatsapp FROM up_users WHERE id=2;` returns `2|gabrielburgos|+56912345678`

## Deviations from Plan

**1. [Rule 1 - Bug cleanup] Removed unused `populate: ["user"]` from Step 2 findOne**
- **Found during:** Task 1
- **Issue:** After removing the owner guard, the `populate: ["user"]` was dead code — `adUser` was the only consumer and it was deleted
- **Fix:** Removed the populate option; the ad is still fetched correctly for `ad.id` in Step 4
- **Files modified:** apps/strapi/src/api/ad-view/services/ad-view.ts
- **Commit:** 854f48d8

## Known Stubs

None.

## Self-Check: PASSED

- File exists: `apps/strapi/src/api/ad-view/services/ad-view.ts` — FOUND
- Commit 854f48d8 — FOUND (`git log --oneline | grep 854f48d8`)
- SQLite whatsapp value — verified via SELECT
