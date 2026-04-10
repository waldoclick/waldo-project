---
phase: quick
plan: 260409-taw
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/services/search-console/index.ts
  - apps/strapi/src/services/search-console/services/search-console.service.ts
  - apps/strapi/src/services/search-console/types/search-console.types.ts
  - apps/strapi/src/services/cloudflare/index.ts
  - apps/strapi/src/services/cloudflare/services/cloudflare.service.ts
  - apps/strapi/src/services/cloudflare/types/cloudflare.types.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - "Both service directories exist with the correct three-file structure"
    - "Each index.ts re-exports all public symbols from its service"
    - "TypeScript compiles clean with no errors in either service"
  artifacts:
    - path: "apps/strapi/src/services/search-console/index.ts"
      provides: "Re-exports for search-console service"
    - path: "apps/strapi/src/services/search-console/services/search-console.service.ts"
      provides: "SearchConsoleService class stub"
    - path: "apps/strapi/src/services/search-console/types/search-console.types.ts"
      provides: "ISearchConsoleService interface"
    - path: "apps/strapi/src/services/cloudflare/index.ts"
      provides: "Re-exports for cloudflare service"
    - path: "apps/strapi/src/services/cloudflare/services/cloudflare.service.ts"
      provides: "CloudflareService class stub"
    - path: "apps/strapi/src/services/cloudflare/types/cloudflare.types.ts"
      provides: "ICloudflareService interface"
  key_links:
    - from: "apps/strapi/src/services/search-console/index.ts"
      to: "apps/strapi/src/services/search-console/services/search-console.service.ts"
      via: "export * from"
    - from: "apps/strapi/src/services/cloudflare/index.ts"
      to: "apps/strapi/src/services/cloudflare/services/cloudflare.service.ts"
      via: "export * from"
---

<objective>
Create two empty service stubs in apps/strapi/src/services/: `search-console` and `cloudflare`.

Purpose: Establish the file structure and naming conventions so future API methods can be added without structural rework.
Output: Six files across two service directories — types, service class, and index re-export for each.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/strapi/src/services/slack/index.ts
@apps/strapi/src/services/slack/slack.service.ts
@apps/strapi/src/services/google/index.ts
@apps/strapi/src/services/google/types/google.types.ts

<interfaces>
<!-- Existing patterns to replicate exactly -->

slack/index.ts pattern:
```typescript
import { SlackService } from "./slack.service";
const slackService = new SlackService();
export const someAction = (...) => slackService.someMethod(...);
export { SlackService };
```

google/types/google.types.ts pattern:
```typescript
export interface IServiceName {
  methodName(_param: Type): Promise<ReturnType>;
}
```

google/index.ts pattern (multi-file service):
```typescript
export * from "./types/service.types";
export * from "./services/service.service";
```

google/services/*.service.ts pattern:
```typescript
export class ServiceName implements IServiceName {
  private field: string;
  constructor() {
    this.field = process.env.ENV_VAR || "";
    if (!this.field) throw new Error("ENV_VAR is required");
  }
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create search-console service stub</name>
  <files>
    apps/strapi/src/services/search-console/types/search-console.types.ts,
    apps/strapi/src/services/search-console/services/search-console.service.ts,
    apps/strapi/src/services/search-console/index.ts
  </files>
  <action>
Create three files under `apps/strapi/src/services/search-console/`. Replicate the google service folder structure exactly (types/ and services/ subdirectories, then index.ts at root).

**apps/strapi/src/services/search-console/types/search-console.types.ts**
```typescript
export interface ISearchConsoleService {
  // Methods will be added here
}
```

**apps/strapi/src/services/search-console/services/search-console.service.ts**
```typescript
import { ISearchConsoleService } from "../types/search-console.types";

export class SearchConsoleService implements ISearchConsoleService {
  private credentialsPath: string;
  private siteUrl: string;

  constructor() {
    this.credentialsPath =
      process.env.GOOGLE_SC_CREDENTIALS_PATH || "./google.json";
    this.siteUrl = process.env.GOOGLE_SC_SITE_URL || "";

    if (!this.siteUrl) {
      throw new Error("GOOGLE_SC_SITE_URL is required");
    }
  }
}
```

**apps/strapi/src/services/search-console/index.ts**
```typescript
export * from "./types/search-console.types";
export * from "./services/search-console.service";
```

No actual API methods — this is a stub. The `googleapis` package is already present in apps/strapi because the google service uses it; no new dependency needed.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/strapi && npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "search-console" || echo "No search-console TS errors"</automated>
  </verify>
  <done>Three files exist with correct BEM-equivalent naming. TypeScript compiles without errors in the search-console service files.</done>
</task>

<task type="auto">
  <name>Task 2: Create cloudflare service stub</name>
  <files>
    apps/strapi/src/services/cloudflare/types/cloudflare.types.ts,
    apps/strapi/src/services/cloudflare/services/cloudflare.service.ts,
    apps/strapi/src/services/cloudflare/index.ts
  </files>
  <action>
Create three files under `apps/strapi/src/services/cloudflare/`. Same structure as search-console. Uses plain `fetch` — no new npm dependencies.

**apps/strapi/src/services/cloudflare/types/cloudflare.types.ts**
```typescript
export interface ICloudflareService {
  // Methods will be added here
}
```

**apps/strapi/src/services/cloudflare/services/cloudflare.service.ts**
```typescript
import { ICloudflareService } from "../types/cloudflare.types";

export class CloudflareService implements ICloudflareService {
  private apiToken: string;
  private zoneId: string;

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || "";

    if (!this.apiToken) {
      throw new Error("CLOUDFLARE_API_TOKEN is required");
    }
    if (!this.zoneId) {
      throw new Error("CLOUDFLARE_ZONE_ID is required");
    }
  }
}
```

**apps/strapi/src/services/cloudflare/index.ts**
```typescript
export * from "./types/cloudflare.types";
export * from "./services/cloudflare.service";
```

No actual API methods — stub only. HTTP calls will use native `fetch` when methods are added later.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project/apps/strapi && npx tsc --noEmit --project tsconfig.json 2>&1 | grep -i "cloudflare" || echo "No cloudflare TS errors"</automated>
  </verify>
  <done>Three files exist. TypeScript compiles without errors in the cloudflare service files.</done>
</task>

</tasks>

<verification>
After both tasks:

```bash
cd /home/gab/Code/waldo-project/apps/strapi && npx tsc --noEmit --project tsconfig.json 2>&1 | tail -5
```

Expected: zero errors output (or only pre-existing errors unrelated to these services).

Directory structure check:
```bash
ls apps/strapi/src/services/search-console/{index.ts,types/,services/}
ls apps/strapi/src/services/cloudflare/{index.ts,types/,services/}
```
</verification>

<success_criteria>
- `apps/strapi/src/services/search-console/` contains: index.ts, types/search-console.types.ts, services/search-console.service.ts
- `apps/strapi/src/services/cloudflare/` contains: index.ts, types/cloudflare.types.ts, services/cloudflare.service.ts
- Both service classes read env vars in constructor and throw if required ones are missing
- Both index.ts files re-export everything from types and services subdirectories
- TypeScript compiles clean across apps/strapi
</success_criteria>

<output>
After completion, create `.planning/quick/260409-taw-add-search-console-and-cloudflare-servic/260409-taw-SUMMARY.md`
</output>
