---
phase: quick
plan: 260410-dxp
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/package.json
  - apps/strapi/.env.example
  - apps/strapi/src/services/google-analytics/types/google-analytics.types.ts
  - apps/strapi/src/services/google-analytics/services/google-analytics.service.ts
  - apps/strapi/src/services/google-analytics/index.ts
  - apps/strapi/src/api/google-analytics/routes/google-analytics.ts
  - apps/strapi/src/api/google-analytics/controllers/google-analytics.ts
autonomous: true
requirements: [GA4-API]
must_haves:
  truths:
    - "GET /google-analytics/stats returns daily time series for last 28 days"
    - "GET /google-analytics/pages returns top 25 pages with metrics"
    - "Both endpoints require isManager policy"
  artifacts:
    - path: "apps/strapi/src/services/google-analytics/services/google-analytics.service.ts"
      provides: "GA4 Data API client with getStats and getPages methods"
    - path: "apps/strapi/src/services/google-analytics/types/google-analytics.types.ts"
      provides: "IGoogleAnalyticsService, GA4StatsRow, GA4PageRow interfaces"
    - path: "apps/strapi/src/services/google-analytics/index.ts"
      provides: "Re-exports from types and services"
    - path: "apps/strapi/src/api/google-analytics/routes/google-analytics.ts"
      provides: "Route definitions for /google-analytics/stats and /pages"
    - path: "apps/strapi/src/api/google-analytics/controllers/google-analytics.ts"
      provides: "Controller handlers instantiating service per request"
  key_links:
    - from: "apps/strapi/src/api/google-analytics/controllers/google-analytics.ts"
      to: "apps/strapi/src/services/google-analytics/index.ts"
      via: "import GoogleAnalyticsService"
      pattern: "new GoogleAnalyticsService"
---

<objective>
Add Google Analytics 4 API integration to Strapi, mirroring the existing Search Console pattern exactly.

Purpose: Expose GA4 metrics (daily stats + top pages) to the dashboard via two manager-only endpoints.
Output: Service module + API module (controller + routes) for GA4, plus `@google-analytics/data` dependency.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/strapi/src/services/search-console/services/search-console.service.ts
@apps/strapi/src/services/search-console/types/search-console.types.ts
@apps/strapi/src/services/search-console/index.ts
@apps/strapi/src/api/search-console/controllers/search-console.ts
@apps/strapi/src/api/search-console/routes/search-console.ts

<interfaces>
<!-- Mirror these patterns exactly for GA4 -->

From search-console.types.ts:
```typescript
export interface SearchConsoleRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}
export interface ISearchConsoleService {
  getPerformance(): Promise<SearchConsolePerformanceRow[]>;
  getQueries(): Promise<SearchConsoleRow[]>;
  getPages(): Promise<SearchConsoleRow[]>;
}
```

From search-console.service.ts (constructor + createClient pattern):
```typescript
export class SearchConsoleService implements ISearchConsoleService {
  private credentialsPath: string;
  private siteUrl: string;
  constructor() {
    this.credentialsPath = process.env.GOOGLE_SC_CREDENTIALS_PATH || "./google.json";
    this.siteUrl = process.env.GOOGLE_SC_SITE_URL || "";
    if (!this.siteUrl) throw new Error("GOOGLE_SC_SITE_URL is required");
  }
  private createClient() { /* Auth.GoogleAuth per call */ }
}
```

From search-console controller (new instance per request pattern):
```typescript
async getPerformance(ctx: Context) {
  try {
    const service = new SearchConsoleService();
    ctx.body = await service.getPerformance();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return ctx.internalServerError(`Search Console error: ${message}`);
  }
}
```

From search-console routes (isManager policy pattern):
```typescript
export default {
  routes: [
    { method: "GET", path: "/search-console/performance", handler: "search-console.getPerformance", config: { policies: ["global::isManager"] } },
  ],
};
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install dependency, create service types and service class</name>
  <files>
    apps/strapi/package.json,
    apps/strapi/.env.example,
    apps/strapi/src/services/google-analytics/types/google-analytics.types.ts,
    apps/strapi/src/services/google-analytics/services/google-analytics.service.ts,
    apps/strapi/src/services/google-analytics/index.ts
  </files>
  <action>
    1. Install `@google-analytics/data` in apps/strapi: `cd apps/strapi && yarn add @google-analytics/data`

    2. Add `GA4_PROPERTY_ID=433494628` to `apps/strapi/.env.example` in the Google section (near GOOGLE_SC_ vars).

    3. Create `apps/strapi/src/services/google-analytics/types/google-analytics.types.ts`:
       - `GA4StatsRow` interface: `{ date: string; sessions: number; users: number; bounceRate: number; avgSessionDuration: number }`
       - `GA4PageRow` interface: `{ page: string; pageTitle: string; sessions: number; pageViews: number; bounceRate: number }`
       - `IGoogleAnalyticsService` interface with methods: `getStats(): Promise<GA4StatsRow[]>` and `getPages(): Promise<GA4PageRow[]>`

    4. Create `apps/strapi/src/services/google-analytics/services/google-analytics.service.ts`:
       - Import `BetaAnalyticsDataClient` from `@google-analytics/data`
       - Class `GoogleAnalyticsService implements IGoogleAnalyticsService`
       - Constructor: reads `GOOGLE_SC_CREDENTIALS_PATH` (default `./google.json`) and `GA4_PROPERTY_ID` from env. Throws if `GA4_PROPERTY_ID` is missing.
       - Private `createClient()`: instantiates `new BetaAnalyticsDataClient({ keyFilename: this.credentialsPath })` — new instance per call (same pattern as Search Console Auth.GoogleAuth per call, to avoid stale credentials).
       - Private `getDateRange()`: returns `{ startDate: string; endDate: string }` — last 28 days in `YYYY-MM-DD` format (same logic as SearchConsoleService).
       - `async getStats()`: calls `client.runReport()` with:
         - `property: 'properties/${this.propertyId}'`
         - `dateRanges: [{ startDate, endDate }]`
         - `dimensions: [{ name: 'date' }]`
         - `metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'bounceRate' }, { name: 'averageSessionDuration' }]`
         - Maps response rows to `GA4StatsRow[]`. GA4 date format is `YYYYMMDD` — convert to `YYYY-MM-DD`. Use `parseFloat` with `?? 0` fallback for metric values. Return sorted by date ascending.
       - `async getPages()`: calls `client.runReport()` with:
         - `property: 'properties/${this.propertyId}'`
         - `dateRanges: [{ startDate, endDate }]`
         - `dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }]`
         - `metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'bounceRate' }]`
         - `limit: 25`
         - `orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }]`
         - Maps response rows to `GA4PageRow[]`. Use `parseFloat` with `?? 0` fallback.
       - NOTE: GA4 `runReport` response shape: `response[0].rows` is the array. Each row has `dimensionValues[N].value` and `metricValues[N].value` (both strings).

    5. Create `apps/strapi/src/services/google-analytics/index.ts`:
       - `export * from "./types/google-analytics.types";`
       - `export * from "./services/google-analytics.service";`
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/strapi && npx tsc --noEmit --pretty 2>&1 | head -30</automated>
  </verify>
  <done>GA4 service compiles cleanly, types exported, @google-analytics/data installed, GA4_PROPERTY_ID in .env.example</done>
</task>

<task type="auto">
  <name>Task 2: Create API routes and controller</name>
  <files>
    apps/strapi/src/api/google-analytics/routes/google-analytics.ts,
    apps/strapi/src/api/google-analytics/controllers/google-analytics.ts
  </files>
  <action>
    1. Create `apps/strapi/src/api/google-analytics/routes/google-analytics.ts`:
       - Export default routes array with two entries:
         - `{ method: "GET", path: "/google-analytics/stats", handler: "google-analytics.getStats", config: { policies: ["global::isManager"] } }`
         - `{ method: "GET", path: "/google-analytics/pages", handler: "google-analytics.getPages", config: { policies: ["global::isManager"] } }`

    2. Create `apps/strapi/src/api/google-analytics/controllers/google-analytics.ts`:
       - Import `Context` from `koa`
       - Import `GoogleAnalyticsService` from `../../../services/google-analytics`
       - Export default object with two methods:
         - `async getStats(ctx: Context)`: try/catch, `new GoogleAnalyticsService()` inside try, `ctx.body = await service.getStats()`. Catch: `ctx.internalServerError('Google Analytics error: ${message}')` (same pattern as Search Console controller).
         - `async getPages(ctx: Context)`: same pattern, calls `service.getPages()`.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/strapi && npx tsc --noEmit --pretty 2>&1 | head -30</automated>
  </verify>
  <done>Both endpoints defined with isManager policy, controller instantiates service per request, TypeScript compiles clean</done>
</task>

</tasks>

<verification>
1. TypeScript compiles: `cd apps/strapi && npx tsc --noEmit` — zero errors
2. File structure matches Search Console pattern:
   - `src/services/google-analytics/{index,types/google-analytics.types,services/google-analytics.service}.ts`
   - `src/api/google-analytics/{routes/google-analytics,controllers/google-analytics}.ts`
3. No unused variables or imports
</verification>

<success_criteria>
- `@google-analytics/data` installed in apps/strapi
- `GA4_PROPERTY_ID` in .env.example
- GET /google-analytics/stats returns `GA4StatsRow[]` (date, sessions, users, bounceRate, avgSessionDuration)
- GET /google-analytics/pages returns `GA4PageRow[]` (page, pageTitle, sessions, pageViews, bounceRate) top 25
- Both endpoints guarded by `global::isManager`
- New instance per request (no singleton)
- Constructor validates `GA4_PROPERTY_ID` presence
- TypeScript compiles with zero errors
</success_criteria>

<output>
After completion, create `.planning/quick/260410-dxp-implement-google-analytics-4-api-integra/260410-dxp-SUMMARY.md`
</output>
