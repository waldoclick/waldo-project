# Roadmap — v1.14 GTM Module: Dashboard

## Milestone Goal

Install `@saslavik/nuxt-gtm@0.1.3` in `apps/dashboard`, configure it identically to the v1.13 website implementation, and remove the legacy `gtmId` flat field. Dashboard GTM tracking fires on every SPA route change via `enableRouterSync: true`. TypeScript typecheck passes with zero errors.

**Success definition:** Opening the dashboard in a browser with GTM Preview Mode confirms tags fire on page load and on every navigation.

---

## Requirements Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| GTM-DASH-01 | 34 | pending |
| GTM-DASH-02 | 34 | pending |
| GTM-DASH-03 | 34 | pending |

---

## Phase 34 — GTM Module: Dashboard

**Goal:** `apps/dashboard` has `@saslavik/nuxt-gtm@0.1.3` installed, configured, and fully typed — identical behaviour to `apps/website` post-v1.13.

**Requirements:** GTM-DASH-01, GTM-DASH-02, GTM-DASH-03

**Plans:** 1 plan

Plans:
- [ ] 34-01-PLAN.md — Install + configure @saslavik/nuxt-gtm in apps/dashboard; remove gtmId; typecheck passes

**Files:**
- `apps/dashboard/package.json`
- `apps/dashboard/nuxt.config.ts`

**Estimated effort:** ~15 min Claude execution time

---

## Execution Order

```
Wave 1: Phase 34 (no dependencies — single phase milestone)
```

---

## Constraints

- No changes to `apps/website` — it was done in v1.13
- No changes to `apps/strapi` — backend is not involved
- No CSP changes needed — `https://www.googletagmanager.com` already present in dashboard CSP
- No `useAppConfiguration` composable in dashboard — no feature flag to update
- No `gtm.client.ts` plugin in dashboard — nothing to delete
- Package manager: Yarn (never npm)
