# Phase 41: Sentry Production-Only - Research

**Researched:** 2026-03-07
**Domain:** Sentry initialization gating across Nuxt 4 + Strapi v5
**Confidence:** HIGH

## Summary

The goal is to ensure Sentry only initializes (and therefore only captures and reports errors) when `NODE_ENV === 'production'`. After auditing all six Sentry-related files across the three apps, the project is **partially fixed**: the two Nuxt apps are mostly correct but have inconsistencies, while the Strapi `config/plugins.ts` has no production guard at all.

The key insight is that each integration point needs its own guard:

1. **`sentry.client.config.ts` / `sentry.server.config.ts`** — controls whether the SDK initializes at all (DSN gating). Both website files already implement this correctly. The dashboard client file is correct; the dashboard server file is **missing the guard entirely**.
2. **`app/plugins/sentry.ts`** — controls whether Vue/window error events are forwarded to Sentry. Both website and dashboard plugins currently capture errors in both `staging` AND `production`. Per the acceptance criteria, this must be narrowed to `production` only.
3. **`apps/strapi/config/plugins.ts`** — the `@strapi/plugin-sentry` plugin config. It has `enabled: true` unconditionally and does not guard on `NODE_ENV`. This means Sentry is active in development/staging on Strapi.

**Primary recommendation:** Apply a consistent `NODE_ENV === 'production'` guard pattern across all three apps, and add the required explanatory comment in every entry point.

---

## Current State Audit

### Website (`apps/website`)

| File | Guard Present? | Issue |
|------|---------------|-------|
| `sentry.client.config.ts` | ✅ Yes — `dsn: isProduction ? ... : undefined` | **None** — already correct |
| `sentry.server.config.ts` | ✅ Yes — same pattern | **None** — already correct |
| `app/plugins/sentry.ts` | ⚠️ Partial | Captures errors in `staging` OR `production`. Must be `production` only. Comment missing. |

### Dashboard (`apps/dashboard`)

| File | Guard Present? | Issue |
|------|---------------|-------|
| `sentry.client.config.ts` | ✅ Yes — same DSN guard pattern | **None** — already correct |
| `sentry.server.config.ts` | ❌ No guard | **Missing** — DSN is always passed, Sentry always initializes |
| `app/plugins/sentry.ts` | ⚠️ Partial | Same as website plugin — captures in `staging` OR `production` |

### Strapi (`apps/strapi`)

| File | Guard Present? | Issue |
|------|---------------|-------|
| `config/plugins.ts` | ❌ No guard | `enabled: true` unconditionally; no `NODE_ENV` check |

---

## Standard Pattern

### Nuxt `sentry.*.config.ts` — DSN guard (already implemented in most files)
```typescript
// Only initialize Sentry in production to prevent dev/staging noise from
// reaching Sentry. Passing dsn: undefined is the official SDK-supported way
// to disable all instrumentation with zero overhead.
const isProduction = process.env.NODE_ENV === "production";
const dsn = isProduction ? config.public.sentryDsn : undefined;
```

### Nuxt Plugin — event capture guard
The plugin runs in all environments (it binds Vue hooks), but `captureException` calls should be gated. Current code uses `staging || production`; the fix is `production` only:
```typescript
// Only report errors to Sentry in production.
if (process.env.NODE_ENV === "production") {
  Sentry.captureException(error, { ... });
}
```
A `return` early-exit pattern is also viable and more readable:
```typescript
if (process.env.NODE_ENV !== "production") return;
Sentry.captureException(error, { ... });
```

### Strapi `config/plugins.ts` — conditional plugin enable
Strapi plugin config supports a function callback and the `enabled` key accepts a boolean expression:
```typescript
sentry: {
  // Only enable Sentry in production to prevent dev/staging errors from being reported.
  enabled: process.env.NODE_ENV === "production",
  config: {
    dsn: env("SENTRY_DSN"),
    ...
  },
},
```
This is the idiomatic Strapi v5 pattern — `enabled: false` tells Strapi not to load the plugin at all.

**Source:** `@strapi/plugin-sentry` README confirms the `enabled` key controls plugin loading. Strapi v5 plugin config docs confirm this pattern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Disabling Sentry SDK | Custom no-op wrapper | Pass `dsn: undefined` — official SDK-supported disable |
| Strapi plugin toggle | Environment-specific config files | `enabled: boolean` in plugin config |

---

## Common Pitfalls

### Pitfall 1: `staging` leaking into error capture conditions
**What goes wrong:** Both Nuxt plugins currently check `staging || production`. "Staging" is not a standard `NODE_ENV` value — it's typically a custom value. If a staging server sets `NODE_ENV=staging`, errors still reach Sentry.
**How to avoid:** Use `=== 'production'` exclusively.

### Pitfall 2: Dashboard `sentry.server.config.ts` has no DSN guard
**What goes wrong:** Server-side Sentry always initializes regardless of environment.
**How to avoid:** Apply the same `isProduction ? dsn : undefined` pattern already used in the client config.

### Pitfall 3: Strapi `enabled: true` is unconditional
**What goes wrong:** The `@strapi/plugin-sentry` initializes in dev, staging, and CI. Any unhandled errors in those environments will be reported.
**How to avoid:** Change to `enabled: process.env.NODE_ENV === "production"`.

### Pitfall 4: Comment requirement
**What goes required:** Each file must have a comment explaining the production-only restriction.
**How to avoid:** Add a clear comment on the guard line in every file touched.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + `@nuxt/test-utils` (Nuxt apps); Jest (Strapi) |
| Config file | `vitest.config.ts` per Nuxt app; `jest.config.ts` in Strapi |
| Quick run command | `yarn workspace @waldo/website test` |
| Full suite command | `yarn test` (Turbo) |

### Phase Requirements → Test Map

| ID | Behavior | Test Type | Notes |
|----|----------|-----------|-------|
| AC-1 | Sentry init only in production | manual-only | Config files run at app startup; no unit test harness for Sentry config files themselves |
| AC-2 | No dev/staging errors sent to Sentry | manual-only | Requires runtime environment verification |
| AC-3 | Comment present in setup | code review | Verified by inspection, not by test |

These requirements are **code review / config changes** — they are verified by reading the modified files, not by automated tests. No new test files are needed.

### Wave 0 Gaps
None — no new test infrastructure required for this phase.

---

## Files to Modify

| File | Change | Priority |
|------|--------|----------|
| `apps/dashboard/sentry.server.config.ts` | Add `isProduction` DSN guard + comment | HIGH (bug fix) |
| `apps/dashboard/app/plugins/sentry.ts` | Change `staging \|\| production` → `production` only + comment | HIGH |
| `apps/website/app/plugins/sentry.ts` | Change `staging \|\| production` → `production` only + comment | HIGH |
| `apps/strapi/config/plugins.ts` | Change `enabled: true` → `enabled: process.env.NODE_ENV === 'production'` + comment | HIGH |
| `apps/website/sentry.client.config.ts` | Add missing explanatory comment (already correct logically) | LOW |
| `apps/website/sentry.server.config.ts` | Add missing explanatory comment (already correct logically) | LOW |
| `apps/dashboard/sentry.client.config.ts` | Add missing explanatory comment (already correct logically) | LOW |

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection of all 6 Sentry files in the repository
- Strapi plugin config pattern: standard `enabled` key behaviour (verified in `config/plugins.ts` structure)
- `@sentry/nuxt` DSN-as-undefined pattern: documented in `sentry.client.config.ts` existing comment ("Passing dsn: undefined is the official way to disable the SDK")

### Secondary (MEDIUM confidence)
- `@strapi/plugin-sentry` v5 plugin enable/disable: standard Strapi plugin config pattern

## Metadata

**Confidence breakdown:**
- Files to change: HIGH — direct file inspection
- Correct patterns: HIGH — already implemented in some files, just needs consistent application
- Strapi plugin guard: HIGH — `enabled` key is standard Strapi config

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (stable libraries)
