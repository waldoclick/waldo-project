---
phase: quick
plan: 260329-gdf
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/cron/subscription-charge.cron.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "subscription-charge.cron.ts compiles without TS2352 error"
    - "pro_pending_invoice is properly typed on ProUser interface"
  artifacts:
    - path: "apps/strapi/src/cron/subscription-charge.cron.ts"
      provides: "ProUser interface with pro_pending_invoice field"
      contains: "pro_pending_invoice"
  key_links: []
---

<objective>
Fix TS2352 type error in subscription-charge.cron.ts by adding `pro_pending_invoice` to the `ProUser` interface.

Purpose: The `pro_pending_invoice` field is queried from the database on line 395 but is missing from the `ProUser` interface, causing a cast error. Adding it to the interface is the proper fix (avoids double-cast workaround).
Output: Clean compilation of subscription-charge.cron.ts
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/strapi/src/cron/subscription-charge.cron.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add pro_pending_invoice to ProUser interface and remove unsafe cast</name>
  <files>apps/strapi/src/cron/subscription-charge.cron.ts</files>
  <action>
    1. In the `ProUser` interface (line 9-14), add `pro_pending_invoice?: boolean;` as an optional field (it may not be set on all users).

    2. On line 394-396, simplify the cast. Change:
       `(user as Record<string, unknown>).pro_pending_invoice ?? false`
       to:
       `user.pro_pending_invoice ?? false`

       Since `pro_pending_invoice` is now on the `ProUser` interface, no cast is needed.

    3. Run TypeScript check to confirm the error is resolved.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace strapi exec tsc --noEmit --pretty 2>&1 | grep -E "subscription-charge|error TS" | head -20; echo "EXIT: $?"</automated>
  </verify>
  <done>TS2352 error on line 395 is gone. ProUser interface includes pro_pending_invoice as optional boolean. No unsafe casts remain for this field.</done>
</task>

</tasks>

<verification>
TypeScript compilation succeeds with no errors in subscription-charge.cron.ts.
</verification>

<success_criteria>
- `tsc --noEmit` produces no TS2352 error for subscription-charge.cron.ts
- ProUser interface properly declares pro_pending_invoice
- No double-cast workaround needed
</success_criteria>

<output>
After completion, create `.planning/quick/260329-gdf-fix-ts2352-error-in-subscription-charge-/260329-gdf-SUMMARY.md`
</output>
