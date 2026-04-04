---
phase: quick
plan: 260404-nms
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/pages/policies/[id]/index.vue
  - apps/dashboard/app/pages/policies/[id]/edit.vue
  - apps/dashboard/app/components/FormPolicy.vue
autonomous: true
requirements: []
must_haves:
  truths:
    - "Navigating to /policies/34 shows the policy with numeric id 34"
    - "Navigating to /policies/34/edit loads the policy data into the form"
    - "After saving a policy (create or edit), user is redirected to /policies/{numericId} and the page loads correctly"
  artifacts:
    - path: "apps/dashboard/app/pages/policies/[id]/index.vue"
      provides: "Policy detail page fetching by numeric id"
      contains: "filters: { id: { $eq: Number(id) } }"
    - path: "apps/dashboard/app/pages/policies/[id]/edit.vue"
      provides: "Policy edit page fetching by numeric id"
      contains: "filters: { id: { $eq: Number(id) } }"
    - path: "apps/dashboard/app/components/FormPolicy.vue"
      provides: "Policy form with numeric id navigation after save"
      contains: "responseData?.id || responseData?.documentId"
  key_links:
    - from: "apps/dashboard/app/components/PoliciesDefault.vue"
      to: "apps/dashboard/app/pages/policies/[id]/index.vue"
      via: "router.push(/policies/{numericId})"
      pattern: "handleViewPolicy.*policy\\.id"
    - from: "apps/dashboard/app/components/FormPolicy.vue"
      to: "apps/dashboard/app/pages/policies/[id]/index.vue"
      via: "router.push(/policies/{numericId}) after save"
      pattern: "responseData\\?\\.id \\|\\| responseData\\?\\.documentId"
---

<objective>
Fix policy detail and edit pages showing empty data when navigated via numeric id.

Purpose: The policies list navigates to `/policies/{numericId}` but the detail and edit pages filter by `documentId` (UUID), so they never find the record. After saving, FormPolicy also redirects to a documentId-based URL, breaking the view page. All three files need to use numeric id consistently, matching the established dashboard pattern (commit aa4451c9).

Output: Working policy view, edit, and save-redirect flows using numeric id.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/dashboard/app/pages/policies/[id]/index.vue
@apps/dashboard/app/pages/policies/[id]/edit.vue
@apps/dashboard/app/components/FormPolicy.vue
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix policy detail and edit pages to fetch by numeric id</name>
  <files>apps/dashboard/app/pages/policies/[id]/index.vue, apps/dashboard/app/pages/policies/[id]/edit.vue</files>
  <action>
In both `policies/[id]/index.vue` and `policies/[id]/edit.vue`, replace the useAsyncData fetch logic. The current code:
1. Filters by `documentId: { $eq: id }` (fails because id is numeric like "34")
2. Falls back to `apiClient('policies/34')` (also fails in Strapi v5)

Replace with a simple direct fetch by numeric id filter:

```typescript
const response = (await apiClient("policies", {
  method: "GET",
  params: { filters: { id: { $eq: Number(id) } } } as unknown as Record<
    string,
    unknown
  >,
})) as { data: unknown[] };
return Array.isArray(response.data) ? response.data[0] : null;
```

Remove the entire fallback block (`const fallback = ...`). No fallback is needed -- numeric id filter is the correct and only approach, consistent with commit aa4451c9 which established numeric id navigation for policies.

Also add `default: () => null` to both useAsyncData calls per CLAUDE.md rule to eliminate `T | undefined`.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx nuxi typecheck apps/dashboard 2>&1 | tail -5</automated>
  </verify>
  <done>Both pages fetch policy by numeric id filter. No fallback logic. TypeScript compiles clean.</done>
</task>

<task type="auto">
  <name>Task 2: Fix FormPolicy post-save navigation to use numeric id</name>
  <files>apps/dashboard/app/components/FormPolicy.vue</files>
  <action>
In `FormPolicy.vue`, fix the post-save navigation to prefer numeric `id` over `documentId`:

Line 163 (after PUT): change `responseData?.documentId || responseData?.id` to `responseData?.id || responseData?.documentId`. This ensures the redirect goes to `/policies/{numericId}` which the detail page can now load.

Line 190 (after POST): change `createdData?.documentId || createdData?.id` to `createdData?.id || createdData?.documentId`. Same reasoning.

Also in the edit mode PUT block (lines 110-128), fix the lookup that resolves documentId to policyId. Currently it tries to look up by documentId (line 120: `filters: { documentId: { $eq: documentId } }`), but the route param is a numeric id. Replace this block:

- Get policyId directly from `route.params.id`: `policyId = props.policy?.id || Number(route.params.id)`
- Remove the entire `if (!policyId && documentId)` lookup block (lines 116-128) -- when navigating from the list or from the detail page, `route.params.id` is always the numeric id, so the lookup is unnecessary.
- Keep the `if (!policyId)` error guard (lines 130-136).
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx nuxi typecheck apps/dashboard 2>&1 | tail -5</automated>
  </verify>
  <done>After creating or editing a policy, user is redirected to /policies/{numericId}. The detail page loads the policy correctly. No documentId-based lookups remain in the save flow.</done>
</task>

</tasks>

<verification>
1. `npx nuxi typecheck apps/dashboard` passes
2. Navigate to /policies in dashboard, click any policy -> detail page shows data
3. Click edit on a policy -> edit page loads with form populated
4. Save an edit -> redirects to /policies/{numericId} with data visible
5. Create a new policy -> redirects to /policies/{numericId} with data visible
</verification>

<success_criteria>
- Policy detail page at /policies/{numericId} displays policy title, text, and order
- Policy edit page at /policies/{numericId}/edit loads form with existing data
- Post-save redirects land on /policies/{numericId} (not UUID)
- TypeScript compiles without errors
</success_criteria>

<output>
After completion, create `.planning/quick/260404-nms-al-ver-o-editar-una-politica-est-n-vacia/260404-nms-SUMMARY.md`
</output>
