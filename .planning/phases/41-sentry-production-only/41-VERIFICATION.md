---
phase: 41-sentry-production-only
verified: 2026-03-07T23:10:00Z
status: passed
score: 7/7 must-haves verified
re_verification: false
---

# Phase 41: Sentry Production-Only Verification Report

**Phase Goal:** Ensure Sentry initialization and error capture only runs when `NODE_ENV === 'production'` across all three apps (website, dashboard, strapi).
**Verified:** 2026-03-07T23:10:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `dashboard/sentry.server.config.ts` has `isProduction` guard — DSN `undefined` when not production | ✓ VERIFIED | Line 6: `const isProduction = process.env.NODE_ENV === "production"`, line 10: `const dsn = isProduction ? config.public.sentryDsn : undefined` |
| 2 | `website/app/plugins/sentry.ts` has NO `staging` condition — only `production` guard on `captureException` | ✓ VERIFIED | Lines 51 and 72: `if (process.env.NODE_ENV === "production")` — no `staging` references in executable code (only in comments) |
| 3 | `dashboard/app/plugins/sentry.ts` has NO `staging` condition — only `production` guard on `captureException` | ✓ VERIFIED | Lines 51 and 72: `if (process.env.NODE_ENV === "production")` — no `staging` references in executable code (only in comments) |
| 4 | `strapi/config/plugins.ts` has `enabled: process.env.NODE_ENV === "production"` (not `enabled: true`) | ✓ VERIFIED | Line 58: `enabled: process.env.NODE_ENV === "production"` |
| 5 | `website/sentry.client.config.ts` retains its `isProduction` guard (unchanged, already correct) | ✓ VERIFIED | Line 5: `const isProduction = process.env.NODE_ENV === "production"`, line 9: `const dsn = isProduction ? config.public.sentryDsn : undefined` |
| 6 | `website/sentry.server.config.ts` retains its `isProduction` guard (unchanged, already correct) | ✓ VERIFIED | Line 5: `const isProduction = process.env.NODE_ENV === "production"`, line 9: `const dsn = isProduction ? config.public.sentryDsn : undefined` |
| 7 | `dashboard/sentry.client.config.ts` retains its `isProduction` guard (unchanged, already correct) | ✓ VERIFIED | Line 5: `const isProduction = process.env.NODE_ENV === "production"`, line 9: `const dsn = isProduction ? config.public.sentryDsn : undefined` |

**Score:** 7/7 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/dashboard/sentry.server.config.ts` | `isProduction` guard + `dsn: isProduction ? ... : undefined` + comment | ✓ VERIFIED | All 3 conditions met (lines 3–10) |
| `apps/website/app/plugins/sentry.ts` | Production-only `captureException` guards (×2), no `staging` condition | ✓ VERIFIED | Both guards at lines 51 and 72; zero `staging` in executable code |
| `apps/dashboard/app/plugins/sentry.ts` | Production-only `captureException` guards (×2), no `staging` condition | ✓ VERIFIED | Both guards at lines 51 and 72; zero `staging` in executable code |
| `apps/strapi/config/plugins.ts` | `enabled: process.env.NODE_ENV === "production"` + comment | ✓ VERIFIED | Lines 56–58; comment and dynamic expression both present |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `isProduction` flag | `dsn` parameter in `Sentry.init()` | Ternary assignment | ✓ WIRED | All 4 config files: `const dsn = isProduction ? config.public.sentryDsn : undefined; Sentry.init({ dsn })` |
| `NODE_ENV === "production"` check | `captureException` calls | `if` guard (×2 per plugin) | ✓ WIRED | Both plugin files: `if (process.env.NODE_ENV === "production") { Sentry.captureException(...) }` in both `vue:error` and `unhandledrejection` handlers |
| `NODE_ENV` expression | Strapi plugin `enabled` field | Direct assignment | ✓ WIRED | `enabled: process.env.NODE_ENV === "production"` — plugin is unloaded entirely when falsy |

---

### Acceptance Criteria

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | `NODE_ENV === 'production'` guard in all 7 Sentry entry points | ✓ SATISFIED | 4 config files use `isProduction`/`dsn` pattern; 2 plugin files use `if (process.env.NODE_ENV === "production")`; 1 Strapi config uses `enabled: process.env.NODE_ENV === "production"` |
| AC-2 | No staging/dev errors reach Sentry | ✓ SATISFIED | DSN `undefined` in all 4 config files when not production; `captureException` gated in both plugins; Strapi plugin disabled when not production |
| AC-3 | Production-only comment in every modified file | ✓ SATISFIED | `dashboard/sentry.server.config.ts` lines 3–5; both plugin files lines 49–50 and 70–71; `strapi/config/plugins.ts` lines 56–57 |

---

### Anti-Patterns Found

No anti-patterns detected in any of the 4 modified files. No `TODO`, `FIXME`, placeholder strings, empty implementations, or `console.log`-only handlers found.

The word "staging" appears in comments only (explaining what the guard prevents) — not in any executable condition. This is correct and expected.

---

### Commit Verification

All 4 task commits documented in SUMMARY.md were verified to exist in git history:

| Commit | Task | Description |
|--------|------|-------------|
| `9aa0d01` | 1.1 | fix(41-41): add production-only guard to dashboard sentry.server.config.ts |
| `378d6f7` | 1.2 | fix(41-41): restrict website sentry plugin to production-only error capture |
| `ef0b56c` | 1.3 | fix(41-41): restrict dashboard sentry plugin to production-only error capture |
| `fe27326` | 1.4 | fix(41-41): gate strapi sentry plugin on production NODE_ENV |

---

### Human Verification Required

None. All behavioral aspects of this phase are fully verifiable through static code inspection:
- Production guards are pattern-matched conditions, not runtime behaviors
- DSN-gating (`dsn: undefined`) is the official SDK-supported approach — no runtime testing required to confirm it disables instrumentation
- Plugin `enabled: false` in Strapi unloads the plugin entirely — verifiable from the config value

---

### Summary

Phase goal fully achieved. All 7 Sentry entry points across website, dashboard, and Strapi now have `NODE_ENV === 'production'` guards with zero staging/dev noise reaching Sentry:

- **4 Nuxt SDK config files** (`sentry.client.config.ts` × 2, `sentry.server.config.ts` × 2): DSN gated via `isProduction` ternary — undefined when not production, zero instrumentation overhead
- **2 Vue plugin files** (`app/plugins/sentry.ts` in both apps): Both `captureException` call sites in both `vue:error` and `unhandledrejection` handlers wrapped in `if (process.env.NODE_ENV === "production")`
- **1 Strapi config**: `enabled: process.env.NODE_ENV === "production"` — plugin unloaded entirely in dev/staging/CI

No regressions in previously-correct files. No anti-patterns. Plan executed exactly as written.

---

_Verified: 2026-03-07T23:10:00Z_
_Verifier: Claude (gsd-verifier)_
