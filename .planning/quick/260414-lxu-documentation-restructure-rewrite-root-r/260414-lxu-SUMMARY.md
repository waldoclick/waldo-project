---
phase: quick-260414-lxu
plan: 01
subsystem: documentation
tags: [docs, readme, monorepo]
key-files:
  created:
    - README.md (rewritten)
    - apps/website/README.md (rewritten)
    - apps/dashboard/README.md (rewritten)
    - apps/strapi/README.md (rewritten)
    - docs/payment-flow.md
    - docs/reservation-system.md
    - docs/data-model.md
    - docs/env-vars.md
    - docs/deployment.md
  modified: []
decisions:
  - "env vars in website and dashboard use API_URL (not NUXT_PUBLIC_STRAPI_URL) and BASE_URL (not NUXT_PUBLIC_SITE_URL) — actual names taken from nuxt.config.ts; plan task description used the NUXT_PUBLIC_ prefix which does not match reality"
  - "dashboard cookie name is hardcoded as waldo_jwt in nuxt.config.ts — NUXT_PUBLIC_AUTH_COOKIE_NAME env var referenced in plan does not exist; COOKIE_DOMAIN is the relevant optional env var"
  - "Forge badges are identical between website and dashboard READMEs — copied as-is since no separate badge URLs exist"
metrics:
  duration: ~15 minutes
  completed: "2026-04-14"
  tasks_completed: 3
  files_changed: 9
---

# Quick Task 260414-lxu: Documentation Restructure and Root README Rewrite — Summary

Root README replaced with a 32-line global index; three app READMEs rewritten as pure technical setup docs; five missing domain docs created in `docs/`.

---

## Tasks Completed

### Task 1: Create 5 missing domain docs in docs/

All five files created, matching the style of `docs/ad-statuses.md` and `docs/permissions.md` — prose-first, tables where they add value, no decorative heading emojis, no in-file table of contents, English throughout.

| File | Content |
| --- | --- |
| `docs/payment-flow.md` | Webpay Plus and Oneclick Mall end-to-end flows, PackType/FeaturedType semantics, monthly billing cron, audit trail fields, key source files |
| `docs/reservation-system.md` | AdReservation and AdFeaturedReservation lifecycle, free slot guarantee (3 slots per user), slot freed on rejection/ban, manager gift endpoints |
| `docs/data-model.md` | Entity relationship diagram (ASCII), entity table with key fields/relations/source paths, computed fields (Ad.status, User.pro_status), documentId note |
| `docs/env-vars.md` | Complete per-app tables with Variable / Scope / Required / Purpose columns; extracted from nuxt.config.ts and apps/strapi/.env.example |
| `docs/deployment.md` | Laravel Forge sparse-checkout runbook, PM2 process names, build order, post-deploy checks, rollback steps, Oneclick Mall open concern |

**Commit:** `15b3c2f9`

### Task 2: Rewrite 3 app READMEs as pure technical docs

All three rewritten from scratch. Each is strictly technical: prereqs, env vars, scripts, port, source layout. No business rules, no duplicate content.

| File | Lines | Key change |
| --- | --- | --- |
| `apps/website/README.md` | 53 | Removed "Modo Desarrollo" long-form section; DEV_MODE now one-line env var entry |
| `apps/dashboard/README.md` | 50 | Removed all generic "Project Documentation" / "Modo Desarrollo" boilerplate |
| `apps/strapi/README.md` | 62 | Removed "Reglas de Anuncios" and "Sistema de Pagos" sections; added links to domain docs |

All three link to `../../docs/env-vars.md` for the full env var reference.

**Commit:** `e5c70dc4` (pre-commit prettier reformatted the tables; content identical)

### Task 3: Rewrite root README.md as global index

32-line index replacing the original 280-line mixed-content README. Links to all 3 app READMEs and all 8 `docs/*.md` files. No business rules, no setup instructions, no emoji headings.

**Commit:** `f1fb8dce`

---

## Deviations from Plan

### Assumption: env var name discrepancy

**Found during:** Task 2 (env var tables) and cross-checking Task 1 (env-vars.md)

**Issue:** The plan's task description listed `NUXT_PUBLIC_STRAPI_URL`, `NUXT_PUBLIC_SITE_URL`, and `NUXT_PUBLIC_AUTH_COOKIE_NAME` as the env var names. The actual `nuxt.config.ts` for both website and dashboard uses `API_URL` (for Strapi) and `BASE_URL` (for the site URL). The dashboard cookie name is hardcoded as `waldo_jwt` — the relevant env var is `COOKIE_DOMAIN` (optional), not `NUXT_PUBLIC_AUTH_COOKIE_NAME`.

**Fix:** Used the actual env var names from `nuxt.config.ts` in both the app READMEs and `docs/env-vars.md`. The plan's names would have been misleading.

**Files modified:** `apps/website/README.md`, `apps/dashboard/README.md`, `docs/env-vars.md`

---

## Known Stubs

None — this plan is documentation-only. No UI components, stores, or data flows were created or modified.

## Self-Check: PASSED

All 9 files confirmed present and correct.
