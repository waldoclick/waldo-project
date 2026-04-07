---
phase: "088"
plan: "01"
subsystem: "website/api-client"
tags: ["migration", "useApiClient", "recaptcha", "strapi-v5", "mutation-calls"]
dependency_graph:
  requires: ["087-01"]
  provides: ["all-mutations-via-useApiClient"]
  affects: ["apps/website/app/stores", "apps/website/app/components", "apps/website/app/pages"]
tech_stack:
  added: []
  patterns:
    - "All POST/PUT/DELETE flows through useApiClient (reCAPTCHA-aware)"
    - "Raw body access after useApiClient — no .data wrapper"
    - "documentId (string) over numeric id for Strapi v5 write operations"
key_files:
  created: []
  modified:
    - "apps/website/app/types/ad.d.ts"
    - "apps/website/app/stores/me.store.ts"
    - "apps/website/app/components/UploadAvatar.vue"
    - "apps/website/app/components/UploadCover.vue"
    - "apps/website/app/components/CheckoutDefault.vue"
    - "apps/website/app/components/MemoPro.vue"
    - "apps/website/app/pages/anunciar/resumen.vue"
    - "apps/website/app/pages/registro/confirmar.vue"
    - "apps/website/app/components/FormVerifyCode.vue"
    - "apps/website/app/components/FormPassword.vue"
    - "apps/website/app/stores/user.store.ts"
    - "apps/website/app/components/CardProfileAd.vue"
decisions:
  - "Client variable moved to store root level in user.store.ts — both updateUserProfile and deactivateAd share the root-level client"
  - "deactivateAd accepts documentId: string (not adId: number) per Strapi v5 AGENTS.md rule"
  - "MemoPro: removed unused import { useNuxtApp } from '#app' alongside migration"
  - "FormPassword: removed dead import const { login } = useStrapiAuth() alongside migration"
metrics:
  duration_minutes: 8
  completed_date: "2026-03-15"
  tasks_completed: 11
  files_modified: 12
---

# Phase 088 Plan 01: Migrate Mutation Calls to useApiClient — Summary

**One-liner:** All 15 remaining mutation calls in apps/website now flow through useApiClient, ensuring universal reCAPTCHA token injection via X-Recaptcha-Token header, with deactivateAd fixed to use Strapi v5 documentId.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1.1 | Add `documentId: string` to `Ad` interface | 33c7d25 | ad.d.ts |
| 2.1 | Migrate `me.store` `saveUsername` → `apiClient` | 4ee5ea1 | me.store.ts |
| 2.2 | Migrate `UploadAvatar` `strapi.update` × 2 | 906d028 | UploadAvatar.vue |
| 2.3 | Migrate `UploadCover` `strapi.update` × 2 | 4f881d6 | UploadCover.vue |
| 3.1 | Migrate `CheckoutDefault` `create` → `apiClient` | f03c653 | CheckoutDefault.vue |
| 3.2 | Migrate `MemoPro` `create` → `apiClient` | 667ec2c | MemoPro.vue |
| 3.3 | Migrate `resumen.vue` `create` × 3 → `apiClient` | 677614a | resumen.vue |
| 4.1 | Migrate `registro/confirmar` → `apiClient` | 61dc175 | confirmar.vue |
| 4.2 | Migrate `FormVerifyCode` × 2 → `apiClient` | c504785 | FormVerifyCode.vue |
| 5.1 | Migrate `FormPassword` `changePassword` → `apiClient` | cdc8da1 | FormPassword.vue |
| 6.1 | Migrate `user.store` `deactivateAd` + `CardProfileAd` call site | 4049f78 | user.store.ts, CardProfileAd.vue |

## Verification

- `yarn nuxt typecheck` — ✅ zero errors
- `yarn vitest run composables/useApiClient.test.ts` — ✅ 8/8 tests pass
- Grep for `useStrapiClient()`, `strapi.update(`, `{ create } = useStrapi()`, `$fetch(` in affected files — ✅ zero matches

## Decisions Made

1. **`client` moved to store root in `user.store.ts`** — The existing `const client = useApiClient()` inside `updateUserProfile` was moved to store root level, so both `updateUserProfile` and `deactivateAd` share one instance. Clean composable lifecycle compliance.

2. **`deactivateAd` parameter: `adId: number` → `adDocumentId: string`** — Fixes the AGENTS.md violation. Strapi v5 write operations must use `documentId`. `CardProfileAd.vue` updated accordingly.

3. **Removed unused imports during migration** — `MemoPro.vue`: `import { useNuxtApp }` was unused. `FormPassword.vue`: `const { login } = useStrapiAuth()` was a dead import. Both removed as Rule 1 (bug/cleanup) auto-fixes during the wave.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `MemoPro.vue` had unused `import { useNuxtApp } from '#app'`**
- **Found during:** Task 3.2
- **Issue:** `useNuxtApp` was imported but never used in the component body
- **Fix:** Removed the unused import alongside the migration
- **Files modified:** `MemoPro.vue`
- **Commit:** 667ec2c

**2. [Rule 1 - Bug] `user.store.ts` `client` was local to `updateUserProfile` function body**
- **Found during:** Task 6.1
- **Issue:** Plan said to "reuse existing `client` variable" but it was locally scoped inside a function — calling `useApiClient()` inside a function body (not at setup/store root) violates Nuxt composable rules
- **Fix:** Moved `const client = useApiClient()` to store root level alongside `const strapi = useStrapi()`; removed the local declaration from `updateUserProfile`
- **Files modified:** `user.store.ts`
- **Commit:** 4049f78

## Self-Check: PASSED

Files verified exist:
- ✅ `apps/website/app/types/ad.d.ts`
- ✅ `apps/website/app/stores/me.store.ts`
- ✅ `apps/website/app/components/UploadAvatar.vue`
- ✅ `apps/website/app/components/UploadCover.vue`
- ✅ `apps/website/app/components/CheckoutDefault.vue`
- ✅ `apps/website/app/components/MemoPro.vue`
- ✅ `apps/website/app/pages/anunciar/resumen.vue`
- ✅ `apps/website/app/pages/registro/confirmar.vue`
- ✅ `apps/website/app/components/FormVerifyCode.vue`
- ✅ `apps/website/app/components/FormPassword.vue`
- ✅ `apps/website/app/stores/user.store.ts`
- ✅ `apps/website/app/components/CardProfileAd.vue`

Commits verified exist:
- ✅ 33c7d25, 4ee5ea1, 906d028, 4f881d6, f03c653, 667ec2c, 677614a, 61dc175, c504785, cdc8da1, 4049f78
