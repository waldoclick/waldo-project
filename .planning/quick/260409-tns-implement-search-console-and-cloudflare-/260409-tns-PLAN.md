---
phase: quick
plan: 260409-tns
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/services/search-console/types/search-console.types.ts
  - apps/strapi/src/services/search-console/services/search-console.service.ts
  - apps/strapi/src/services/cloudflare/types/cloudflare.types.ts
  - apps/strapi/src/services/cloudflare/services/cloudflare.service.ts
  - apps/strapi/src/api/search-console/controllers/search-console.ts
  - apps/strapi/src/api/cloudflare/controllers/cloudflare.ts
autonomous: true
requirements: [TNS-01]

must_haves:
  truths:
    - "GET /api/search-console returns { performance, topQueries, topPages }"
    - "GET /api/cloudflare returns { requests, bandwidth, threats, pageviews, cacheHitRate, errorRate, timeseries }"
    - "Both services compile without TypeScript errors"
  artifacts:
    - path: "apps/strapi/src/services/search-console/types/search-console.types.ts"
      provides: "ISearchConsoleService interface with 3 method signatures"
    - path: "apps/strapi/src/services/search-console/services/search-console.service.ts"
      provides: "getPerformance, getTopQueries, getTopPages implementations"
    - path: "apps/strapi/src/services/cloudflare/types/cloudflare.types.ts"
      provides: "ICloudflareService interface with getAnalytics signature"
    - path: "apps/strapi/src/services/cloudflare/services/cloudflare.service.ts"
      provides: "getAnalytics implementation using fetch"
  key_links:
    - from: "apps/strapi/src/api/search-console/controllers/search-console.ts"
      to: "SearchConsoleService.getPerformance/getTopQueries/getTopPages"
      via: "direct method calls"
    - from: "apps/strapi/src/api/cloudflare/controllers/cloudflare.ts"
      to: "CloudflareService.getAnalytics"
      via: "direct method call"
---

<objective>
Implement real API methods in SearchConsoleService and CloudflareService, update their interfaces, and wire both controllers to return real data.

Purpose: Replace stub { ok: true } responses with actual Google Search Console and Cloudflare analytics data.
Output: Two fully functional analytics endpoints backed by real external API calls.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Current stubs — read before editing -->
@apps/strapi/src/services/search-console/types/search-console.types.ts
@apps/strapi/src/services/search-console/services/search-console.service.ts
@apps/strapi/src/services/cloudflare/types/cloudflare.types.ts
@apps/strapi/src/services/cloudflare/services/cloudflare.service.ts
@apps/strapi/src/api/search-console/controllers/search-console.ts
@apps/strapi/src/api/cloudflare/controllers/cloudflare.ts

<interfaces>
<!-- googleapis is already in apps/strapi/package.json at ^148.0.0 -->
<!-- Auth pattern: GoogleAuth with keyFile + scopes -->
<!-- google.searchconsole('v1').searchAnalytics.query({ siteUrl, requestBody }) -->

Current ISearchConsoleService (stub — to be replaced):
```typescript
export interface ISearchConsoleService {
  // Methods will be added here
}
```

Current ICloudflareService (stub — to be replaced):
```typescript
export interface ICloudflareService {
  // Methods will be added here
}
```

Current SearchConsoleService fields:
  private credentialsPath: string  // from GOOGLE_SC_CREDENTIALS_PATH env
  private siteUrl: string          // from GOOGLE_SC_SITE_URL env

Current CloudflareService fields:
  private apiToken: string         // from CLOUDFLARE_API_TOKEN env
  private zoneId: string           // from CLOUDFLARE_ZONE_ID env
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement Search Console service methods and update interface</name>
  <files>
    apps/strapi/src/services/search-console/types/search-console.types.ts
    apps/strapi/src/services/search-console/services/search-console.service.ts
  </files>
  <action>
Update `search-console.types.ts` — replace the stub interface with the full typed interface:

```typescript
export interface SearchConsoleRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsolePerformanceRow {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface ISearchConsoleService {
  getPerformance(): Promise<SearchConsolePerformanceRow[]>;
  getTopQueries(): Promise<SearchConsoleRow[]>;
  getTopPages(): Promise<SearchConsoleRow[]>;
}
```

Update `search-console.service.ts` — add 3 methods. Auth is created per call (no shared instance) using GoogleAuth with `keyFile: this.credentialsPath` and `scopes: ['https://www.googleapis.com/auth/webmasters.readonly']`. Use `google.searchconsole('v1')` and call `searchAnalytics.query`. All three methods share the same auth/client construction pattern.

- `getPerformance()`: last 28 days, `dimensions: ['date']`, no rowLimit. Map response rows to `{ date: row.keys[0], clicks, impressions, ctr, position }`. Return `[]` if no rows.
- `getTopQueries()`: `dimensions: ['query']`, `rowLimit: 10`. Map response rows to `{ keys: row.keys, clicks, impressions, ctr, position }`. Return `[]` if no rows.
- `getTopPages()`: `dimensions: ['page']`, `rowLimit: 10`. Same mapping as getTopQueries. Return `[]` if no rows.

For date range in `getPerformance()`: compute `startDate` as 28 days ago (`new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]`) and `endDate` as today (`new Date().toISOString().split('T')[0]`).

The `requestBody` for each call:
- getPerformance: `{ startDate, endDate, dimensions: ['date'] }`
- getTopQueries: `{ startDate, endDate, dimensions: ['query'], rowLimit: 10 }`
- getTopPages: `{ startDate, endDate, dimensions: ['page'], rowLimit: 10 }`

Import: `import { google, Auth } from 'googleapis';` — use `Auth.GoogleAuth` for the auth class.

Do NOT store auth/client as instance fields — instantiate per method to avoid credential caching issues.
  </action>
  <verify>
    <automated>cd apps/strapi && npx tsc --noEmit 2>&1 | grep -E "search-console" || echo "TypeScript OK for search-console"</automated>
  </verify>
  <done>ISearchConsoleService has 3 typed method signatures; SearchConsoleService implements all 3; no TypeScript errors in these files.</done>
</task>

<task type="auto">
  <name>Task 2: Implement Cloudflare service getAnalytics method and update interface</name>
  <files>
    apps/strapi/src/services/cloudflare/types/cloudflare.types.ts
    apps/strapi/src/services/cloudflare/services/cloudflare.service.ts
  </files>
  <action>
Update `cloudflare.types.ts` — replace stub interface with fully typed version:

```typescript
export interface CloudflareTimeseries {
  since: string;
  until: string;
  requests: { all: number; cached: number; uncached: number };
  bandwidth: { all: number; cached: number; uncached: number };
  threats: { all: number };
  pageviews: { all: number };
}

export interface CloudflareAnalytics {
  requests: number;
  bandwidth: number;
  threats: number;
  pageviews: number;
  cacheHitRate: number;
  errorRate: number;
  timeseries: CloudflareTimeseries[];
}

export interface ICloudflareService {
  getAnalytics(): Promise<CloudflareAnalytics>;
}
```

Update `cloudflare.service.ts` — add `getAnalytics()` method:

```
GET https://api.cloudflare.com/client/v4/zones/{this.zoneId}/analytics/dashboard?since=-672&until=0
Headers: Authorization: Bearer {this.apiToken}, Content-Type: application/json
```

Parse the JSON response. The totals live at `response.result.totals`, timeseries at `response.result.timeseries`.

Compute derived fields from `totals`:
- `requests`: `totals.requests.all`
- `bandwidth`: `totals.bandwidth.all`
- `threats`: `totals.threats.all`
- `pageviews`: `totals.pageviews.all`
- `cacheHitRate`: `totals.requests.cached / totals.requests.all` (return 0 if all is 0)
- `errorRate`: `(totals.requests['4xx'] + totals.requests['5xx']) / totals.requests.all` (return 0 if all is 0)
- `timeseries`: `response.result.timeseries` (pass through as-is)

Use `fetch` (Node 18+ built-in, available in Strapi v5). Cast the response JSON as `any` to navigate nested properties — add a comment: `// Cloudflare response shape is not typed; using any for nested navigation`.

Throw an error if `!response.ok`, including `response.status` and `response.statusText` in the message.
  </action>
  <verify>
    <automated>cd apps/strapi && npx tsc --noEmit 2>&1 | grep -E "cloudflare" || echo "TypeScript OK for cloudflare"</automated>
  </verify>
  <done>ICloudflareService has getAnalytics typed; CloudflareService.getAnalytics fetches Cloudflare API and returns CloudflareAnalytics shape; no TypeScript errors.</done>
</task>

<task type="auto">
  <name>Task 3: Wire controllers to call service methods and return real data</name>
  <files>
    apps/strapi/src/api/search-console/controllers/search-console.ts
    apps/strapi/src/api/cloudflare/controllers/cloudflare.ts
  </files>
  <action>
Update `apps/strapi/src/api/search-console/controllers/search-console.ts`:

Remove the stub `new SearchConsoleService()` with no usage. Instantiate the service and call all three methods in parallel:

```typescript
import { Context } from "koa";
import { SearchConsoleService } from "../../../services/search-console";

export default {
  async getData(ctx: Context) {
    try {
      const service = new SearchConsoleService();
      const [performance, topQueries, topPages] = await Promise.all([
        service.getPerformance(),
        service.getTopQueries(),
        service.getTopPages(),
      ]);
      ctx.body = { performance, topQueries, topPages };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Search Console error: ${message}`);
    }
  },
};
```

Update `apps/strapi/src/api/cloudflare/controllers/cloudflare.ts`:

```typescript
import { Context } from "koa";
import { CloudflareService } from "../../../services/cloudflare";

export default {
  async getData(ctx: Context) {
    try {
      const service = new CloudflareService();
      const analytics = await service.getAnalytics();
      ctx.body = analytics;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return ctx.internalServerError(`Cloudflare error: ${message}`);
    }
  },
};
```
  </action>
  <verify>
    <automated>cd apps/strapi && npx tsc --noEmit 2>&1 | grep -E "controller" || echo "TypeScript OK for controllers"</automated>
  </verify>
  <done>Search Console controller returns { performance, topQueries, topPages } from real service calls. Cloudflare controller returns CloudflareAnalytics directly. Both compile without TypeScript errors.</done>
</task>

</tasks>

<verification>
Full TypeScript check across strapi:

```bash
cd apps/strapi && npx tsc --noEmit
```

Must complete with zero errors.
</verification>

<success_criteria>
- `ISearchConsoleService` has `getPerformance()`, `getTopQueries()`, `getTopPages()` signatures
- `SearchConsoleService` implements all three using `google.searchconsole('v1').searchAnalytics.query`
- `ICloudflareService` has `getAnalytics(): Promise<CloudflareAnalytics>` signature
- `CloudflareService.getAnalytics()` fetches Cloudflare dashboard endpoint and returns computed metrics
- Search Console controller responds with `{ performance, topQueries, topPages }`
- Cloudflare controller responds with `{ requests, bandwidth, threats, pageviews, cacheHitRate, errorRate, timeseries }`
- `npx tsc --noEmit` passes with zero errors across all modified files
</success_criteria>

<output>
After completion, create `.planning/quick/260409-tns-implement-search-console-and-cloudflare-/260409-tns-SUMMARY.md`
</output>
