---
quick_task: 7
type: execute
autonomous: true
files_modified:
  - apps/website/app/pages/anunciar/gracias.vue
  - apps/website/app/pages/pagar/gracias.vue
---

<objective>
Clear the ad store (useAdStore) when landing on a /gracias page after a successful ad creation or payment, so old form data does not bleed into subsequent flows.

Purpose: The ad store is persisted to localStorage across the multi-step wizard. After a successful publish or payment, the store must be reset so the next ad creation starts fresh.
Output: Both gracias pages call adStore.clearAll() on mount.
</objective>

<context>
@apps/website/app/pages/anunciar/gracias.vue
@apps/website/app/pages/pagar/gracias.vue
@apps/website/app/stores/ad.store.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Clear ad store on anunciar/gracias.vue mount</name>
  <files>apps/website/app/pages/anunciar/gracias.vue</files>
  <action>
    Import useAdStore from "@/stores/ad.store" and call adStore.clearAll() inside an onMounted() hook.

    Placement: Add the import alongside the existing imports, then add:

    ```ts
    import { onMounted } from "vue";
    import { useAdStore } from "@/stores/ad.store";

    const adStore = useAdStore();
    onMounted(() => {
      adStore.clearAll();
    });
    ```

    Note: watchEffect already imports from "vue" (watchEffect), so extend the existing vue import to add onMounted instead of creating a second vue import line.

    Do NOT call clearAll() inside useAsyncData or watchEffect — use onMounted so the store is cleared exactly once, client-side, after the success page renders. SSR doesn't have access to localStorage anyway (store is persisted client-side).
  </action>
  <verify>
    Run: yarn workspace website typecheck
    Confirm no TypeScript errors in anunciar/gracias.vue.
    Manual check: after creating an ad and landing on /anunciar/gracias, navigate to /anunciar — the wizard should start at step 1 with empty fields.
  </verify>
  <done>anunciar/gracias.vue imports useAdStore, calls clearAll() in onMounted. No TS errors.</done>
</task>

<task type="auto">
  <name>Task 2: Clear ad store on pagar/gracias.vue mount</name>
  <files>apps/website/app/pages/pagar/gracias.vue</files>
  <action>
    pagar/gracias.vue already imports useAdStore (line 24) and instantiates adStore (line 36) but never calls clearAll().

    Add onMounted to the existing vue import (line 21 already imports computed, watchEffect, ref — add onMounted there), then add an onMounted hook that calls adStore.clearAll():

    ```ts
    onMounted(() => {
      adStore.clearAll();
    });
    ```

    Place this after the adStore and adAnalytics declarations, before the useAsyncData call.

    The TODO comment on line 138-140 ("No ad store to clean; order data loaded") is now outdated — remove it and replace the entire else if block with just the store clear (which is handled by onMounted instead).

    Specifically, the watchEffect block (lines 120–142) should be simplified: remove the dangling `else if` block since store clearing is now in onMounted. Keep only the error handling branches:

    ```ts
    watchEffect(() => {
      if (error.value) {
        showError({
          statusCode: error.value.statusCode || 500,
          message: error.value.message || "Error inesperado",
          statusMessage:
            error.value.statusMessage ||
            error.value.message ||
            "Lo sentimos, ha ocurrido un error.",
        });
        return;
      }
      if (data.value && "error" in data.value) {
        handleError(data.value.error as "INVALID_URL" | "NOT_FOUND");
      }
    });
    ```
  </action>
  <verify>
    Run: yarn workspace website typecheck
    Confirm no TypeScript errors in pagar/gracias.vue.
    Manual check: after a successful Webpay payment landing on /pagar/gracias, navigate to /anunciar — wizard starts at step 1 with empty fields.
  </verify>
  <done>pagar/gracias.vue calls adStore.clearAll() in onMounted. Stale TODO comment removed. No TS errors.</done>
</task>

</tasks>

<verification>
yarn workspace website typecheck
</verification>

<success_criteria>
- Both /anunciar/gracias and /pagar/gracias call adStore.clearAll() on client mount
- No TypeScript errors introduced
- After landing on either gracias page, navigating to /anunciar shows a fresh wizard (step 1, empty fields)
- adStore.clearAll() is NOT called on SSR (onMounted is client-only)
</success_criteria>
