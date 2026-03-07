# Requirements — v1.14 GTM Module: Dashboard

## Milestone Goal

Install and configure `@saslavik/nuxt-gtm` in `apps/dashboard`, mirroring the v1.13 website implementation. Remove the legacy `gtmId` flat field from `runtimeConfig.public`. Dashboard GTM tracking must work with `enableRouterSync: true` and `nuxt typecheck` must pass with zero errors.

## Requirements

### GTM-DASH-01: Install `@saslavik/nuxt-gtm` module

**What:** Add `@saslavik/nuxt-gtm@0.1.3` to `apps/dashboard` devDependencies and register it in `nuxt.config.ts` modules array.

**Why:** Dashboard has no GTM instrumentation today. Without the module, no GTM tags fire in the admin interface.

**Acceptance criteria:**
- `@saslavik/nuxt-gtm` appears in `apps/dashboard/package.json` devDependencies
- Module is listed in `modules[]` in `apps/dashboard/nuxt.config.ts`
- `yarn install` completes without errors

**Phase:** 34

---

### GTM-DASH-02: Configure module — GTM ID, enableRouterSync, remove legacy field

**What:** Add a top-level `gtm: { id: config.public.gtm.id, enableRouterSync: true, debug: false }` block in `nuxt.config.ts`. Change `runtimeConfig.public.gtmId` to `runtimeConfig.public.gtm: { id: process.env.GTM_ID || 'GTM-N4B8LDKS' }`. Remove the old `gtmId` field entirely.

**Why:** `enableRouterSync: true` ensures the module fires a `page_view` on every SPA navigation. Nested `gtm.id` in runtimeConfig keeps the structure consistent with `apps/website` (established in v1.13). The flat `gtmId` field is dead code after this change.

**Acceptance criteria:**
- `gtm: { id, enableRouterSync: true, debug: false }` block present at top level in `nuxt.config.ts`
- `runtimeConfig.public` contains `gtm: { id: ... }` and does NOT contain `gtmId`
- No other file in `apps/dashboard` references `gtmId`

**Phase:** 34

---

### GTM-DASH-03: TypeScript typecheck passes with zero errors

**What:** Run `nuxt typecheck` in `apps/dashboard` and confirm zero TypeScript errors after the module and config changes.

**Why:** Dashboard has `typeCheck: true` in its build. Any type mismatch introduced by the new module or the runtimeConfig shape change would break CI builds.

**Acceptance criteria:**
- `yarn workspace apps/dashboard exec nuxt typecheck` exits with zero errors
- No new `any` or suppression comments introduced

**Phase:** 34

---

## Traceability

| Requirement | Phase | Plan | Status |
|-------------|-------|------|--------|
| GTM-DASH-01 | 34 | TBD | pending |
| GTM-DASH-02 | 34 | TBD | pending |
| GTM-DASH-03 | 34 | TBD | pending |
