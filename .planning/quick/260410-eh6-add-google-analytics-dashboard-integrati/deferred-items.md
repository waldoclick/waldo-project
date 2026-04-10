# Deferred Items

## Pre-existing TypeScript error (out of scope)

**File:** `apps/dashboard/app/components/CloudflareThreats.vue` line 173
**Error:** `Argument of type 'number | null' is not assignable to parameter of type 'number'`
**Context:** `context.parsed.y` in ChartJS TooltipItem callback — ChartJS returns `number | null` but `formatNumber` expects `number`.
**Origin:** Introduced in commit `0bdb0e20` (CloudflareThreats chart feature). Not introduced by this task.
**Fix:** Add null guard: `formatNumber(context.parsed.y ?? 0)` in CloudflareThreats.vue.
