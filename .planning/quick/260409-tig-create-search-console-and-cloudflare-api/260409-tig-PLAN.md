---
phase: quick
plan: 260409-tig
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/api/search-console/controllers/search-console.ts
  - apps/strapi/src/api/search-console/routes/search-console.ts
  - apps/strapi/src/api/cloudflare/controllers/cloudflare.ts
  - apps/strapi/src/api/cloudflare/routes/cloudflare.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "GET /api/search-console is reachable and returns { ok: true }"
    - "GET /api/cloudflare is reachable and returns { ok: true }"
    - "Both routes are protected by the global::isManager policy"
  artifacts:
    - path: "apps/strapi/src/api/search-console/controllers/search-console.ts"
      provides: "getData stub that instantiates SearchConsoleService"
    - path: "apps/strapi/src/api/search-console/routes/search-console.ts"
      provides: "GET /api/search-console route with isManager policy"
    - path: "apps/strapi/src/api/cloudflare/controllers/cloudflare.ts"
      provides: "getData stub that instantiates CloudflareService"
    - path: "apps/strapi/src/api/cloudflare/routes/cloudflare.ts"
      provides: "GET /api/cloudflare route with isManager policy"
  key_links:
    - from: "apps/strapi/src/api/search-console/routes/search-console.ts"
      to: "apps/strapi/src/api/search-console/controllers/search-console.ts"
      via: "handler: search-console.getData"
    - from: "apps/strapi/src/api/cloudflare/routes/cloudflare.ts"
      to: "apps/strapi/src/api/cloudflare/controllers/cloudflare.ts"
      via: "handler: cloudflare.getData"
---

<objective>
Create two Strapi API modules — search-console and cloudflare — each with a controller and route file, following the exact same pattern as apps/strapi/src/api/cron-runner/.

Purpose: Expose GET endpoints for search console and Cloudflare data retrieval, locked behind the isManager policy. Controllers are stubs returning { ok: true } for now; service wiring is in place but no real API calls are made.
Output: Four files — two controllers, two routes — mirroring the cron-runner structure.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<interfaces>
<!-- Existing service constructors the controllers must instantiate -->

From apps/strapi/src/services/search-console/services/search-console.service.ts:
```typescript
export class SearchConsoleService implements ISearchConsoleService {
  constructor() { /* reads GOOGLE_SC_CREDENTIALS_PATH, GOOGLE_SC_SITE_URL */ }
}
```

From apps/strapi/src/services/cloudflare/services/cloudflare.service.ts:
```typescript
export class CloudflareService implements ICloudflareService {
  constructor() { /* reads CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID */ }
}
```

From apps/strapi/src/services/search-console/index.ts:
```typescript
export * from "./types/search-console.types";
export * from "./services/search-console.service";
```

From apps/strapi/src/services/cloudflare/index.ts:
```typescript
export * from "./types/cloudflare.types";
export * from "./services/cloudflare.service";
```

Reference pattern — cron-runner controller (apps/strapi/src/api/cron-runner/controllers/cron-runner.ts):
- Named default export object with async method(s) receiving `ctx: Context`
- Uses ctx.body to return success, ctx.internalServerError for errors

Reference pattern — cron-runner route (apps/strapi/src/api/cron-runner/routes/cron-runner.ts):
- Default export: `{ routes: [{ method, path, handler, config: { policies: [...] } }] }`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create search-console API module (controller + route)</name>
  <files>
    apps/strapi/src/api/search-console/controllers/search-console.ts
    apps/strapi/src/api/search-console/routes/search-console.ts
  </files>
  <action>
Create the directory structure apps/strapi/src/api/search-console/controllers/ and apps/strapi/src/api/search-console/routes/.

**apps/strapi/src/api/search-console/controllers/search-console.ts**

```typescript
/**
 * Search Console Controller
 *
 * Handles GET /api/search-console requests.
 * Returns stub response; actual API calls will be implemented in a future task.
 */

import { Context } from "koa";
import { SearchConsoleService } from "../../../services/search-console";

export default {
  async getData(ctx: Context) {
    try {
      new SearchConsoleService();
      ctx.body = { ok: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Search Console error: ${message}`);
    }
  },
};
```

Note: `new SearchConsoleService()` will throw if GOOGLE_SC_SITE_URL is unset — the try/catch handles this gracefully. The constructor is called to validate wiring exists; no real API calls are made yet.

**apps/strapi/src/api/search-console/routes/search-console.ts**

```typescript
/**
 * Search Console Routes
 *
 * Exposes a single endpoint to retrieve Search Console data.
 * Access is controlled via the global::isManager policy.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/search-console",
      handler: "search-console.getData",
      config: { policies: ["global::isManager"] },
    },
  ],
};
```
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace strapi tsc --noEmit 2>&1 | grep -E "search-console|cloudflare|error TS" | head -20</automated>
  </verify>
  <done>Both files exist with correct exports; TypeScript finds no errors in these files.</done>
</task>

<task type="auto">
  <name>Task 2: Create cloudflare API module (controller + route)</name>
  <files>
    apps/strapi/src/api/cloudflare/controllers/cloudflare.ts
    apps/strapi/src/api/cloudflare/routes/cloudflare.ts
  </files>
  <action>
Create the directory structure apps/strapi/src/api/cloudflare/controllers/ and apps/strapi/src/api/cloudflare/routes/.

**apps/strapi/src/api/cloudflare/controllers/cloudflare.ts**

```typescript
/**
 * Cloudflare Controller
 *
 * Handles GET /api/cloudflare requests.
 * Returns stub response; actual API calls will be implemented in a future task.
 */

import { Context } from "koa";
import { CloudflareService } from "../../../services/cloudflare";

export default {
  async getData(ctx: Context) {
    try {
      new CloudflareService();
      ctx.body = { ok: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Cloudflare error: ${message}`);
    }
  },
};
```

Note: `new CloudflareService()` will throw if CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID is unset — the try/catch handles this gracefully.

**apps/strapi/src/api/cloudflare/routes/cloudflare.ts**

```typescript
/**
 * Cloudflare Routes
 *
 * Exposes a single endpoint to retrieve Cloudflare analytics data.
 * Access is controlled via the global::isManager policy.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/cloudflare",
      handler: "cloudflare.getData",
      config: { policies: ["global::isManager"] },
    },
  ],
};
```
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace strapi tsc --noEmit 2>&1 | grep -E "cloudflare|error TS" | head -20</automated>
  </verify>
  <done>Both files exist with correct exports; TypeScript finds no errors in these files.</done>
</task>

</tasks>

<verification>
After both tasks:
- apps/strapi/src/api/search-console/controllers/search-console.ts exists and exports default object with getData
- apps/strapi/src/api/search-console/routes/search-console.ts exists with GET /search-console + isManager policy
- apps/strapi/src/api/cloudflare/controllers/cloudflare.ts exists and exports default object with getData
- apps/strapi/src/api/cloudflare/routes/cloudflare.ts exists with GET /cloudflare + isManager policy
- TypeScript compiles clean across both new modules
- Handler strings match filenames: "search-console.getData" and "cloudflare.getData"
</verification>

<success_criteria>
- Four new files created under apps/strapi/src/api/search-console/ and apps/strapi/src/api/cloudflare/
- Each controller imports from the correct service path (../../../services/{service-name})
- Each route uses policy global::isManager — matches cron-runner pattern exactly
- No TypeScript errors in new files
- No unused variables or imports (Codacy compliance)
</success_criteria>

<output>
After completion, create .planning/quick/260409-tig-create-search-console-and-cloudflare-api/260409-tig-SUMMARY.md
</output>
