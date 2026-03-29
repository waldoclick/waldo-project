---
phase: quick
plan: 260329-pa1
subsystem: security/csp
tags: [csp, security, nuxt-security, staging, cloudflare, gtm, hotjar, logrocket]
dependency_graph:
  requires: []
  provides: [complete-csp-connect-src-coverage]
  affects: [apps/website, apps/dashboard]
tech_stack:
  added: []
  patterns: [nuxt-security contentSecurityPolicy directive arrays]
key_files:
  created: []
  modified:
    - apps/website/nuxt.config.ts
    - apps/dashboard/nuxt.config.ts
decisions:
  - Dashboard does not use Hotjar or Zoho SalesIQ — those domains are website-only
  - Both apps share Cloudflare Insights, GTM, GA4, LogRocket ingest coverage in connect-src
  - Existing worker-src blob: entries already cover Sentry/LogRocket workers — no changes needed
metrics:
  duration: ~5min
  completed_date: "2026-03-29"
  tasks_completed: 3
  files_modified: 2
---

# Quick Task 260329-pa1: Fix CSP Violations in Staging Summary

**One-liner:** Added 7 missing connect-src domains to website and 4 to dashboard CSP configs, covering Cloudflare RUM, GA4 regional endpoint, GTM beacon, Hotjar HTTPS API, and LogRocket ingest.

## What Was Done

Fixed Content Security Policy violations observed in staging by adding missing domain entries to the `connect-src` directive in both `apps/website/nuxt.config.ts` and `apps/dashboard/nuxt.config.ts`.

## Tasks Completed

### Task 1: Website connect-src additions (commit 2779a4c4)

Added 7 missing domains to `apps/website/nuxt.config.ts` connect-src:

- `https://static.cloudflareinsights.com` — Cloudflare Insights beacon POST
- `https://cloudflareinsights.com` — Cloudflare Insights alternate domain
- `https://www.googletagmanager.com` — GA4 beacon/collect via GTM
- `https://region1.google-analytics.com` — GA4 regional analytics endpoint
- `https://*.hotjar.com` — Hotjar HTTPS API connections (complementing existing wss:// entries)
- `https://vc.hotjar.io` — Hotjar visitor recordings upload
- `https://*.lgrckt-in.com` — LogRocket ingest connections

### Task 2: Dashboard connect-src additions (commit 0bf00f05)

Added 4 missing domains to `apps/dashboard/nuxt.config.ts` connect-src:

- `https://static.cloudflareinsights.com` — adds static. prefix variant (cloudflareinsights.com already existed)
- `https://www.googletagmanager.com` — GA4 beacon/collect via GTM
- `https://region1.google-analytics.com` — GA4 regional analytics endpoint
- `https://*.lgrckt-in.com` — LogRocket ingest connections

Hotjar and Zoho SalesIQ domains were intentionally NOT added to the dashboard (dashboard does not use these services).

### Task 3: Verification

All 12 targeted domain checks passed across both config files. Both files retain valid TypeScript structure. No existing entries were removed from either app. `worker-src: ['self', 'blob:']` already present in both apps — no changes required there.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `apps/website/nuxt.config.ts` — modified, contains all required domains
- `apps/dashboard/nuxt.config.ts` — modified, contains all required domains
- Commit `2779a4c4` — exists (website fix)
- Commit `0bf00f05` — exists (dashboard fix)
