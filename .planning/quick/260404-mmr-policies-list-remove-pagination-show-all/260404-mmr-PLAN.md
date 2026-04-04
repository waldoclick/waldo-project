---
phase: quick
plan: 260404-mmr
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/PoliciesDefault.vue
  - apps/dashboard/app/scss/components/_policies.scss
  - apps/dashboard/package.json
autonomous: true
requirements: [remove-pagination, drag-drop-reorder, persist-order]

must_haves:
  truths:
    - "All policies load in a single request without pagination controls"
    - "User can drag and drop table rows to reorder policies"
    - "New order persists to Strapi immediately after drop (1-based sequential)"
    - "Drag handles are disabled when search filter is active, with visible note"
  artifacts:
    - path: "apps/dashboard/app/components/PoliciesDefault.vue"
      provides: "Drag-and-drop policy list without pagination"
    - path: "apps/dashboard/app/scss/components/_policies.scss"
      provides: "Styles for drag handle, disabled state, drag note"
  key_links:
    - from: "PoliciesDefault.vue draggable @end handler"
      to: "PUT /api/policies/:documentId"
      via: "apiClient loop updating each policy's order field"
      pattern: "apiClient.*policies.*PUT"
---

<objective>
Remove pagination from the policies list, fetch all policies in one request, add drag-and-drop reorder via vuedraggable, and persist order to Strapi on every drop.

Purpose: Editors need to visually reorder policies without navigating pages or manually editing order numbers.
Output: Updated PoliciesDefault.vue with drag-and-drop, no pagination.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@apps/dashboard/app/components/PoliciesDefault.vue
@apps/dashboard/app/scss/components/_policies.scss
@apps/dashboard/app/stores/settings.store.ts (policies section uses SectionSettings with searchTerm, sortBy, pageSize, currentPage)

<interfaces>
<!-- Existing Policy interface in PoliciesDefault.vue (line 115): -->
```typescript
interface Policy {
  id: number;
  title: string;
  text: string;
  order: number | null;
  updatedAt: string;
  createdAt: string;
}
```

<!-- FormPolicy.vue already declares documentId on its interface (line 56-62): -->
```typescript
interface PolicyData {
  id?: number;
  documentId?: string;
  title?: string;
  text?: string;
  order?: number | null;
}
```

<!-- apiClient pattern for standard content-type PUT (from ads/[id].vue line 399): -->
```typescript
await apiClient(`/ads/${adDocumentId}`, {
  method: "PUT",
  body: { data: { gallery: updatedGallery } },
});
```

<!-- FilterDefault accepts sortBy + pageSize, emits update:modelValue -->
<!-- SearchDefault accepts model-value string, emits update:model-value -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install vuedraggable and remove pagination, fetch all policies</name>
  <files>apps/dashboard/package.json, apps/dashboard/app/components/PoliciesDefault.vue</files>
  <action>
1. Install vuedraggable: run `yarn workspace dashboard add vuedraggable@next` from the monorepo root.

2. In PoliciesDefault.vue, update the Policy interface to include `documentId: string`:
```typescript
interface Policy {
  id: number;
  documentId: string;
  title: string;
  text: string;
  order: number | null;
  updatedAt: string;
  createdAt: string;
}
```

3. Remove all pagination-related code:
   - Remove the `PaginationDefault` import (line 113)
   - Remove the `<PaginationDefault>` template block (lines 89-98)
   - Remove `paginationMeta` ref (lines 139-144)
   - Remove `totalPages` computed (lines 189-191)
   - Remove `totalRecords` computed (lines 193-195)
   - Remove the `paginationMeta.value = ...` assignment in fetchPolicies (line 177-178)

4. Remove pagination params from fetchPolicies. Also remove `pageSize` and `currentPage` from the watch array. The new fetch should be:
```typescript
const searchParams: Record<string, unknown> = {
  pagination: { pageSize: 200 },  // fetch all in one request
  sort: settingsStore.policies.sortBy,
};
```
Keep the search filter logic as-is.

5. Remove the `FilterDefault` component from the template entirely — it controls pageSize and sort, but with all items loaded and drag-and-drop controlling order, it is no longer needed. Also remove its import, the `filters` computed, and the `handleFiltersChange` function. Keep `sortOptions` only if used elsewhere (it is not — remove it too).

Actually, KEEP the FilterDefault but remove only the `:page-sizes` prop (set it to empty or remove the prop). The sort functionality is still useful for viewing. Keep `filters`, `handleFiltersChange`, and `sortOptions`. Only remove pagination-specific parts.

Correction: The FilterDefault combines sort and pageSize into one component. Since we are removing pagination, remove the `:page-sizes` prop from FilterDefault. The component should still show sort options.

6. Remove `paginatedPolicies` computed — use `allPolicies` directly in template.

7. Update the watch to only observe searchTerm and sortBy (remove pageSize and currentPage):
```typescript
watch(
  [
    () => settingsStore.policies.searchTerm,
    () => settingsStore.policies.sortBy,
  ],
  () => { fetchPolicies(); },
  { immediate: true },
);
```
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace dashboard exec -- npx nuxi typecheck</automated>
  </verify>
  <done>PoliciesDefault.vue fetches all policies in one request, no PaginationDefault rendered, no pagination state used, TypeScript compiles clean.</done>
</task>

<task type="auto">
  <name>Task 2: Add drag-and-drop reorder with vuedraggable and persist order to Strapi</name>
  <files>apps/dashboard/app/components/PoliciesDefault.vue, apps/dashboard/app/scss/components/_policies.scss</files>
  <action>
1. In PoliciesDefault.vue, import vuedraggable:
```typescript
import draggable from "vuedraggable";
```
Also import `GripVertical` from `lucide-vue-next` for the drag handle icon.

2. Add a `saving` ref for the reorder save state:
```typescript
const saving = ref(false);
```

3. Add a computed `isDraggable` that returns `false` when search is active:
```typescript
const isDraggable = computed(() => !settingsStore.policies.searchTerm);
```

4. Replace the table body content. The current structure uses `TableDefault` with `TableRow`/`TableCell`. Wrap the rows in a `<draggable>` component. The draggable must wrap the `<tbody>` element inside the table. Since `TableDefault` renders its own `<table>` and `<thead>`, we need to use draggable as the `<tbody>` element via the `tag` prop.

Replace the `v-for` on `TableRow` with a `<draggable>` wrapper:
```vue
<TableDefault :columns="tableColumns">
  <draggable
    v-model="allPolicies"
    tag="tbody"
    item-key="id"
    handle=".policies--default__drag"
    :disabled="!isDraggable"
    @end="handleReorder"
  >
    <template #item="{ element: policy }">
      <TableRow :key="policy.id">
        <TableCell>
          <button
            class="policies--default__drag"
            :class="{ 'policies--default__drag--disabled': !isDraggable }"
            :disabled="!isDraggable"
            title="Arrastrar para reordenar"
          >
            <GripVertical class="policies--default__drag__icon" />
          </button>
        </TableCell>
        <TableCell>{{ policy.id }}</TableCell>
        <!-- ... rest of cells identical to current template ... -->
        <TableCell>
          <div v-if="policy.title" v-tooltip="stripHtml(policy.title).length > 60 ? stripHtml(policy.title) : ''" class="policies--default__question">
            {{ truncateText(policy.title, 60) }}
          </div>
          <div v-else class="policies--default__question">-</div>
        </TableCell>
        <TableCell>
          <div v-if="policy.text" v-tooltip="stripHtml(policy.text).length > 80 ? stripHtml(policy.text) : ''" class="policies--default__answer">
            {{ truncateText(policy.text, 80) }}
          </div>
          <div v-else class="policies--default__answer">-</div>
        </TableCell>
        <TableCell>{{ policy.order ?? "-" }}</TableCell>
        <TableCell>{{ formatDate(policy.updatedAt) }}</TableCell>
        <TableCell align="right">
          <div class="policies--default__actions">
            <button class="policies--default__action" title="Ver Politica" @click="handleViewPolicy(policy.id)">
              <Eye class="policies--default__action__icon" />
            </button>
            <button class="policies--default__action" title="Editar Politica" @click="handleEditPolicy(policy.id)">
              <Pencil class="policies--default__action__icon" />
            </button>
          </div>
        </TableCell>
      </TableRow>
    </template>
  </draggable>
</TableDefault>
```

IMPORTANT: Check how `TableDefault` renders its slot. If it wraps children in a `<tbody>`, the draggable `tag="tbody"` would create a nested tbody. Read `TableDefault.vue` first. If TableDefault already wraps in `<tbody>`, remove `tag="tbody"` from draggable or use `tag="template"`. Adjust accordingly.

5. Add a column at the beginning of `tableColumns` for the drag handle:
```typescript
const tableColumns = [
  { label: "" },  // drag handle column, no header label
  { label: "ID" },
  // ... rest unchanged
];
```

6. Add the `handleReorder` function that persists 1-based sequential order for ALL items after a drag:
```typescript
const handleReorder = async () => {
  if (!isDraggable.value) return;
  saving.value = true;
  try {
    const updates = allPolicies.value.map((policy, index) => ({
      documentId: policy.documentId,
      order: index + 1,
    }));

    await Promise.all(
      updates.map((u) =>
        apiClient(`/policies/${u.documentId}`, {
          method: "PUT",
          body: { data: { order: u.order } },
        }),
      ),
    );

    // Update local state to reflect new order values
    allPolicies.value = allPolicies.value.map((policy, index) => ({
      ...policy,
      order: index + 1,
    }));
  } catch (error) {
    console.error("Error saving policy order:", error);
    // Re-fetch to restore server state on failure
    await fetchPolicies();
  } finally {
    saving.value = false;
  }
};
```

7. Add a visual indicator when search is active and drag is disabled. Below the search/filter header, add:
```vue
<p v-if="!isDraggable" class="policies--default__drag-note">
  El arrastre para reordenar no esta disponible mientras se filtra.
</p>
```

8. Add a saving indicator. Below the table wrapper or as an overlay:
```vue
<p v-if="saving" class="policies--default__saving">
  Guardando orden...
</p>
```

9. Update `_policies.scss` to add styles for the new elements:
```scss
&__drag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: grab;
  border-radius: 4px;
  color: $davys_grey;

  &:active {
    cursor: grabbing;
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 0.3;
  }

  &__icon {
    width: 16px;
    height: 16px;
  }
}

&__drag-note {
  font-size: 13px;
  color: $davys_grey;
  margin: 0;
  padding: 0 4px;
}

&__saving {
  font-size: 13px;
  color: $davys_grey;
  text-align: center;
  padding: 8px 0;
}
```

Remove the `&__pagination` block from the SCSS since PaginationDefault is removed.

10. Also update template references: replace `paginatedPolicies` with `allPolicies` in the empty state check:
```vue
<div v-if="allPolicies.length === 0 && !loading" class="policies--default__empty">
```
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && yarn workspace dashboard exec -- npx nuxi typecheck</automated>
  </verify>
  <done>
    - Drag handle column visible on each row with GripVertical icon
    - Dragging a row reorders the list and PUTs new 1-based order to each policy via /api/policies/:documentId
    - When search term is active, drag handles show disabled state and a note explains why
    - Saving indicator shows during persist
    - SCSS updated with drag handle, note, saving styles; pagination styles removed
    - TypeScript compiles clean
  </done>
</task>

</tasks>

<verification>
1. `yarn workspace dashboard exec -- npx nuxi typecheck` passes
2. Open the policies list page in the dashboard — all policies load without pagination controls
3. Drag a row by its handle — order updates persist (check Strapi admin to confirm order values)
4. Type a search term — drag handles become disabled, note appears
5. Clear search — drag handles re-enable
</verification>

<success_criteria>
- No PaginationDefault component in PoliciesDefault.vue
- All policies fetched in single request (no pagination params except high pageSize)
- vuedraggable renders table rows as draggable
- After drop, all policies receive 1-based sequential order via PUT /api/policies/:documentId
- Drag disabled during search with user-visible note
- TypeScript compiles clean
</success_criteria>

<output>
After completion, create `.planning/quick/260404-mmr-policies-list-remove-pagination-show-all/260404-mmr-SUMMARY.md`
</output>
