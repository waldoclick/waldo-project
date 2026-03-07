# Phase 41: Sentry Production-Only — Plan

**Phase goal:** Ensure Sentry initialization and error capture only runs when `NODE_ENV === 'production'` across all three apps (website, dashboard, strapi).

**Based on:** `41-RESEARCH.md`
**Granularity:** coarse
**Parallelization:** true

---

## Context

After auditing all Sentry entry points, 4 files need changes (1 bug fix + 3 logic fixes) and 3 files need only a comment added (already logically correct). All changes are small, targeted, and safe — no new packages, no new files, no architectural changes.

**Files with actual bugs/logic errors:**
1. `apps/dashboard/sentry.server.config.ts` — **missing production guard entirely**
2. `apps/dashboard/app/plugins/sentry.ts` — captures errors in `staging || production` (must be `production` only)
3. `apps/website/app/plugins/sentry.ts` — same issue as dashboard plugin
4. `apps/strapi/config/plugins.ts` — `enabled: true` unconditionally

**Files that are correct but need the required comment:**
5. `apps/website/sentry.client.config.ts` — already has the comment ✅ (no change needed)
6. `apps/website/sentry.server.config.ts` — already has the comment ✅ (no change needed)
7. `apps/dashboard/sentry.client.config.ts` — already has the comment ✅ (no change needed)

---

## Wave 1 — Fix Sentry Production Guards (all in parallel)

### Task 1.1 — Fix `dashboard/sentry.server.config.ts`

**File:** `apps/dashboard/sentry.server.config.ts`

**Problem:** No `NODE_ENV` guard — Sentry initializes in dev and staging.

**Action:** Apply the same DSN-gating pattern already used in `sentry.client.config.ts`.

Replace the entire file content with:
```typescript
import * as Sentry from "@sentry/nuxt";

// Only initialize Sentry in production to prevent dev/staging noise from
// reaching Sentry. Passing dsn: undefined is the official SDK-supported way
// to disable all instrumentation with zero overhead.
const isProduction = process.env.NODE_ENV === "production";

const config = useRuntimeConfig();

const dsn = isProduction ? config.public.sentryDsn : undefined;
const enableDebug = config.public.sentryDebug;

Sentry.init({
  dsn: dsn,
  environment: process.env.NODE_ENV,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1,

  // Set the profiling sample rate (1.0 = 100% of sessions will be profiled)
  profilesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: enableDebug,
});
```

**Verify:** File contains `isProduction` variable, `dsn: isProduction ? ... : undefined`, and the production-only comment.

---

### Task 1.2 — Fix `website/app/plugins/sentry.ts`

**File:** `apps/website/app/plugins/sentry.ts`

**Problem:** Error capture is gated on `staging || production` in two places. Must be `production` only.

**Action:** Replace both occurrences of the condition:
```typescript
// FROM (in vue:error hook):
if (
  process.env.NODE_ENV === "staging" ||
  process.env.NODE_ENV === "production"
) {

// TO:
// Only report errors to Sentry in production — staging and development errors
// should not reach Sentry.
if (process.env.NODE_ENV === "production") {
```

Apply the same replacement in the `unhandledrejection` listener (second occurrence of the same pattern).

**Verify:** No occurrences of `NODE_ENV === "staging"` remain in this file.

---

### Task 1.3 — Fix `dashboard/app/plugins/sentry.ts`

**File:** `apps/dashboard/app/plugins/sentry.ts`

**Problem:** Same as Task 1.2 — error capture gated on `staging || production`.

**Action:** Apply identical replacements as Task 1.2:
- Remove `process.env.NODE_ENV === "staging" ||` from both conditionals in the file
- Add the production-only comment above each guard

**Verify:** No occurrences of `NODE_ENV === "staging"` remain in this file.

---

### Task 1.4 — Fix `strapi/config/plugins.ts`

**File:** `apps/strapi/config/plugins.ts`

**Problem:** `sentry` plugin has `enabled: true` unconditionally — runs in dev, staging, CI.

**Action:** Replace the `enabled` line:
```typescript
// FROM:
  sentry: {
    enabled: true,
    config: {

// TO:
  sentry: {
    // Only enable Sentry in production to prevent dev/staging errors from
    // reaching Sentry. Setting enabled: false unloads the plugin entirely.
    enabled: process.env.NODE_ENV === "production",
    config: {
```

**Verify:** `sentry.enabled` is `process.env.NODE_ENV === "production"`, not `true`. Comment is present.

---

## Wave 2 — Verification

### Task 2.1 — Audit all Sentry files for consistency

After Wave 1, verify the complete Sentry state across all files:

**Check each file:**

| File | Expected state |
|------|---------------|
| `apps/website/sentry.client.config.ts` | `dsn: isProduction ? ... : undefined` ✅ unchanged |
| `apps/website/sentry.server.config.ts` | `dsn: isProduction ? ... : undefined` ✅ unchanged |
| `apps/website/app/plugins/sentry.ts` | No `staging` references, only `production` guard |
| `apps/dashboard/sentry.client.config.ts` | `dsn: isProduction ? ... : undefined` ✅ unchanged |
| `apps/dashboard/sentry.server.config.ts` | `dsn: isProduction ? ... : undefined` ✅ after Task 1.1 |
| `apps/dashboard/app/plugins/sentry.ts` | No `staging` references, only `production` guard |
| `apps/strapi/config/plugins.ts` | `enabled: process.env.NODE_ENV === "production"` |

**Run grep to confirm no `staging` references remain in Sentry files:**
```bash
grep -n "staging" \
  apps/website/app/plugins/sentry.ts \
  apps/dashboard/app/plugins/sentry.ts
# Expected: no output
```

**Run grep to confirm all sentry config files have the production guard:**
```bash
grep -n "isProduction\|NODE_ENV.*production" \
  apps/website/sentry.client.config.ts \
  apps/website/sentry.server.config.ts \
  apps/dashboard/sentry.client.config.ts \
  apps/dashboard/sentry.server.config.ts
# Expected: at least one match per file
```

**Run grep to confirm Strapi plugin guard:**
```bash
grep -n "NODE_ENV" apps/strapi/config/plugins.ts
# Expected: enabled: process.env.NODE_ENV === "production"
```

---

## Acceptance Criteria Checklist

- [ ] **AC-1:** `NODE_ENV === 'production'` guard present in all 7 Sentry entry points
- [ ] **AC-2:** No `staging` or `development` errors reach Sentry:
  - DSN is `undefined` when not production in all 4 Sentry config files
  - `captureException` only called when `production` in both plugins
  - Strapi plugin `enabled: false` when not production
- [ ] **AC-3:** Comment explaining the production-only restriction present in every modified file

---

## Notes

- No new packages required
- No new files required
- TypeScript: these are config/plugin files — `useRuntimeConfig` is a Nuxt auto-import available in `sentry.*.config.ts` files at runtime (existing pattern in repo)
- Strapi: `process.env.NODE_ENV` is available directly in Strapi config files (confirmed by `env("NODE_ENV")` already being used in plugins.ts line 62)
