---
phase: quick
plan: 53
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/nuxt.config.ts
  - apps/dashboard/app/plugins/sentry.ts
  - apps/dashboard/.env.example
autonomous: true
requirements: [QUICK-53]

must_haves:
  truths:
    - "Refreshing any dashboard page while logged in keeps the session intact"
    - "SSR fetchUser() calls go directly to Strapi, never through the dashboard proxy"
    - "sentry.ts plugin does not import unused fetchUser"
    - "SESSION_MAX_AGE comment in .env.example correctly says 'in seconds'"
  artifacts:
    - path: "apps/dashboard/nuxt.config.ts"
      provides: "strapi.url always set to API_URL (never BASE_URL)"
      contains: "process.env.API_URL || \"http://localhost:1337\""
    - path: "apps/dashboard/app/plugins/sentry.ts"
      provides: "Clean sentry plugin without dead fetchUser import"
    - path: "apps/dashboard/.env.example"
      provides: "Correct SESSION_MAX_AGE comment (seconds, not milliseconds)"
  key_links:
    - from: "@nuxtjs/strapi plugin (SSR)"
      to: "Strapi API"
      via: "strapi.url → API_URL directly"
      pattern: "API_URL.*localhost:1337"
---

<objective>
Fix dashboard logout-on-refresh by removing the SSR self-proxy loop that destroys the JWT cookie.

Purpose: When `@nuxtjs/strapi` calls `fetchUser()` on SSR, it uses `strapi.url`. Currently that URL points to the dashboard's own proxy (`BASE_URL`) when `API_DISABLE_PROXY=false`, creating a self-loop. Any error in that loop triggers `setToken(null)` which wipes the JWT cookie, causing `guard.global.ts` to redirect to login.

Output: `strapi.url` always points directly to `API_URL`. Two minor housekeeping fixes are bundled (dead import removal, `.env.example` comment).
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/dashboard/nuxt.config.ts
@apps/dashboard/app/middleware/guard.global.ts
@apps/dashboard/app/plugins/sentry.ts
@apps/dashboard/.env.example
</context>

<tasks>

<task type="auto">
  <name>Task 1: Point strapi.url directly to API_URL in nuxt.config.ts</name>
  <files>apps/dashboard/nuxt.config.ts</files>
  <action>
Replace the `strapi.url` block (lines 228–232) with a direct reference to `API_URL`. The proxy bypass logic is no longer needed here because:

1. SSR: `@nuxtjs/strapi` must hit Strapi directly — routing through the dashboard's own Nitro server creates a self-loop
2. Client-side: the Nitro proxy (`server/api/[...].ts`) still handles client requests transparently via the `proxy` module — this is unrelated to `strapi.url`

The `API_DISABLE_PROXY` environment variable can remain in `runtimeConfig.public` for other uses, but it must not influence `strapi.url`.

Change from:
```ts
// Note: Using BASE_URL instead of API_URL to route through proxy
// This hides the actual Strapi API URL from the client
strapi: {
  url:
    process.env.API_DISABLE_PROXY === "true"
      ? process.env.API_URL || "http://localhost:1337" // ← Directo a Strapi
      : process.env.BASE_URL || "http://localhost:3001", // ← A través del proxy
  prefix: "/api",
```

Change to:
```ts
// strapi.url must always point directly to Strapi — never through the dashboard proxy.
// The Nitro proxy (server/api/[...].ts) handles client-side requests transparently.
// Routing SSR fetchUser() through BASE_URL causes a self-loop that destroys the JWT cookie on any error.
strapi: {
  url: process.env.API_URL || "http://localhost:1337",
  prefix: "/api",
```

Do NOT change any other strapi config fields (cookie, cookieName, auth.populate, version).
Do NOT touch the Nitro proxy file or any other file.
  </action>
  <verify>
    <automated>grep -n "strapi.url\|BASE_URL.*proxy\|API_DISABLE_PROXY.*true.*1337\|A través del proxy" apps/dashboard/nuxt.config.ts | grep -v "runtimeConfig" || echo "PASS: no proxy-conditional strapi URL found"</automated>
  </verify>
  <done>
    `strapi.url` is a single unconditional expression: `process.env.API_URL || "http://localhost:1337"`.
    The old ternary referencing `BASE_URL` and `API_DISABLE_PROXY` for `strapi.url` is gone.
    The comment above the strapi block explains why direct URL is required.
  </done>
</task>

<task type="auto">
  <name>Task 2: Remove dead fetchUser import from sentry.ts + fix SESSION_MAX_AGE comment</name>
  <files>apps/dashboard/app/plugins/sentry.ts, apps/dashboard/.env.example</files>
  <action>
**In `apps/dashboard/app/plugins/sentry.ts`:**

Remove the unused `fetchUser` destructure. The plugin only uses `useStrapiUser()` — `fetchUser` was imported but never called.

Change from:
```ts
  const user = useStrapiUser();
  const { fetchUser } = useStrapiAuth();
```

Change to:
```ts
  const user = useStrapiUser();
```

Do NOT touch any other line in sentry.ts.

---

**In `apps/dashboard/.env.example`:**

Fix the `SESSION_MAX_AGE` comment — the value is parsed with `Number.parseInt()` and passed directly to the cookie's `maxAge` field in seconds (per `@nuxtjs/strapi` cookie config). The example value `604800000` looks like milliseconds (7 days × 86400000) but the cookie field expects **seconds**. The default hardcoded fallback in nuxt.config.ts is `604800` (seconds = 1 week), so the example value is wrong.

Change from:
```
SESSION_MAX_AGE=604800000 # 7 days
```

Change to:
```
SESSION_MAX_AGE=604800 # 7 days in seconds (cookie maxAge is in seconds)
```
  </action>
  <verify>
    <automated>grep -n "fetchUser" apps/dashboard/app/plugins/sentry.ts || echo "PASS: fetchUser removed from sentry.ts"</automated>
  </verify>
  <done>
    `sentry.ts` line `const { fetchUser } = useStrapiAuth();` is deleted.
    `.env.example` SESSION_MAX_AGE is `604800` with a comment clarifying the unit is seconds.
  </done>
</task>

</tasks>

<verification>
After both tasks complete, verify the full fix:

1. `strapi.url` uses `API_URL` unconditionally:
   ```bash
   grep -A3 "^  strapi:" apps/dashboard/nuxt.config.ts
   ```
   Expected: `url: process.env.API_URL || "http://localhost:1337",`

2. No stale proxy comment above strapi block:
   ```bash
   grep "BASE_URL.*proxy\|através del proxy" apps/dashboard/nuxt.config.ts
   ```
   Expected: no matches

3. sentry.ts has no fetchUser:
   ```bash
   grep "fetchUser" apps/dashboard/app/plugins/sentry.ts
   ```
   Expected: no matches

4. .env.example SESSION_MAX_AGE is corrected:
   ```bash
   grep "SESSION_MAX_AGE" apps/dashboard/.env.example
   ```
   Expected: `SESSION_MAX_AGE=604800 # 7 days in seconds (cookie maxAge is in seconds)`
</verification>

<success_criteria>
- Refreshing a logged-in dashboard page no longer triggers logout
- SSR `fetchUser()` resolves directly against `API_URL` with no proxy hop
- `sentry.ts` has zero TypeScript unused-variable warnings from `fetchUser`
- `SESSION_MAX_AGE` example value matches the fallback in `nuxt.config.ts` (both 604800 seconds)
</success_criteria>

<output>
After completion, create `.planning/quick/53-fix-dashboard-logout-on-refresh-point-ss/53-SUMMARY.md`
</output>
