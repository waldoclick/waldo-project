---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/pages/anunciar/gracias.vue
  - apps/website/app/pages/anunciar/resumen.vue
  - apps/website/app/pages/pagar/gracias.vue
autonomous: true
requirements: []

must_haves:
  truths:
    - "Free ad creation redirects to /anunciar/gracias?ad=<documentId>"
    - "/anunciar/gracias page displays the ad summary using ResumeDefault"
    - "/pagar/gracias TypeScript errors are resolved — no duplicate v-if, correct function name, correct variable"
  artifacts:
    - path: "apps/website/app/pages/anunciar/gracias.vue"
      provides: "New page displaying ad summary after free ad creation"
    - path: "apps/website/app/pages/anunciar/resumen.vue"
      provides: "Free ad redirect to /anunciar/gracias with documentId from API response"
    - path: "apps/website/app/pages/pagar/gracias.vue"
      provides: "TypeScript-clean page showing only order summary (ResumeOrder)"
  key_links:
    - from: "apps/website/app/pages/anunciar/resumen.vue (handleFreeCreation)"
      to: "/anunciar/gracias?ad=<documentId>"
      via: "freeAdResponse.data.ad.documentId captured before router.push"
    - from: "apps/website/app/pages/anunciar/gracias.vue"
      to: "ResumeDefault component"
      via: ":summary prop with ad data fetched by useAsyncData using route.query.ad"
---

<objective>
Fix three related bugs in the ad creation flow:
1. Free ad creation incorrectly redirects to `/pagar/gracias` — should go to `/anunciar/gracias` with the ad's `documentId`
2. `/anunciar/gracias` page does not exist — needs to be created to show ad summary via `ResumeDefault`
3. `/pagar/gracias.vue` has TypeScript errors: duplicate `v-if` directives, `prepareAdSummary` (should not exist), and `adData` (does not exist)

Purpose: Correct post-creation UX for free ads and eliminate TypeScript compilation errors.
Output: New `anunciar/gracias.vue`, updated `resumen.vue` redirect, and cleaned-up `pagar/gracias.vue`.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/website/app/pages/anunciar/resumen.vue
@apps/website/app/pages/pagar/gracias.vue
@apps/website/app/components/ResumeDefault.vue

<interfaces>
<!-- Key contracts for this plan. No codebase exploration needed. -->

From apps/website/app/pages/anunciar/resumen.vue — handleFreeCreation():
```typescript
// freeAdResponse is the return of create<...>("payments/free-ad", {...})
// The API returns: { data: { success: boolean, ad: { documentId: string, name: string, ... } } }
// Currently unused documentId: adStore.ad.documentId || adStore.ad.ad_id (wrong — store has no documentId)
const freeAdResponse = await create<{ ad?: { id: number } }>(
  "payments/free-ad",
  { ad_id: adStore.ad.ad_id, pack: adStore.pack } as unknown as Parameters<typeof create>[1],
);
// FIX: capture freeAdResponse.data.ad.documentId and redirect to /anunciar/gracias?ad=<documentId>
```

From apps/website/app/composables/useOrderById.ts:
```typescript
export async function useOrderById(documentId: string) {
  const strapi = useStrapi();
  const { data } = await strapi.findOne("orders", documentId, { populate: "*" });
  if (!data) throw new Error("Order not found");
  return data;
}
```

ResumeDefault.vue props:
```typescript
defineProps({
  showIcon: { type: Boolean, default: true },
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  summary: { type: Object, default: () => null },
  hidePaymentSection: { type: Boolean, default: false },
})
// summary object fields used: title, category, price, currency, description,
// email, phone, commune, address, addressNumber, condition, manufacturer,
// model, serialNumber, year, weight, width, height, depth, gallery,
// pack, featured, isInvoice, hasToPay, totalAmount, paymentMethod, showEditLinks
```

Strapi free-ad endpoint response (from payment controller freeAdCreate):
```typescript
// ctx.body = { data: result }
// result = { success: true, ad: { documentId: string, name: string, category, ... }, message: string }
// So freeAdResponse.data.ad.documentId gives the ad's documentId
```

pagar/gracias.vue current broken template (lines 6-21):
```vue
<!-- PROBLEM 1: two v-if on same element (line 6-8) -->
<ResumeOrder
  v-if="orderData && orderData.documentId"  <!-- duplicate v-if -->
  v-if="orderData"                          <!-- duplicate v-if -->
  ...
  :summary="prepareSummary(orderData)"      <!-- prepareSummary exists ✓ -->
/>
<!-- PROBLEM 2: ResumeDefault block references non-existent adData + prepareAdSummary -->
<ResumeDefault
  v-if="!orderData && adData"   <!-- adData does not exist -->
  v-else-if="adData"            <!-- adData does not exist -->
  :summary="prepareAdSummary(adData)"  <!-- prepareAdSummary does not exist -->
/>
<!-- FIX: remove entire ResumeDefault block; keep ResumeOrder with single v-if="orderData" -->
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix pagar/gracias.vue TypeScript errors</name>
  <files>apps/website/app/pages/pagar/gracias.vue</files>
  <action>
    The file currently has two bugs in the template:

    **Bug 1 — duplicate `v-if` on `ResumeOrder`:** Lines 6-8 have both
    `v-if="orderData && orderData.documentId"` and `v-if="orderData"` on the same element.
    Remove the first one; keep only `v-if="orderData"`.

    **Bug 2 — non-existent `adData` and `prepareAdSummary`:** Lines 15-21 show a
    `ResumeDefault` block that references `adData` (which does not exist) and calls
    `prepareAdSummary(adData)` (function also does not exist). This block is dead code
    now that free ads redirect to `/anunciar/gracias`. Remove the entire `<ResumeDefault .../>` block.

    Also remove the now-unused `ResumeDefault` import at the top of `<script setup>`.

    After edits the template's main content area should only contain:
    ```vue
    <ResumeOrder
      v-if="orderData"
      title="¡Pago recibido!"
      :description="`Tu pago Webpay fue procesado correctamente. Más abajo verás el comprobante de tu pago y los datos de tu orden (#${orderData.documentId || '--'}). Guarda este comprobante.`"
      :show-icon="true"
      :summary="prepareSummary(orderData)"
    />
    ```

    Do NOT add `ResumeDefault` import back. Do NOT change any other logic.
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxi typecheck 2>&1 | grep -E "pagar/gracias|prepareAdSummary|adData" || echo "No errors in pagar/gracias.vue"</automated>
  </verify>
  <done>
    `pagar/gracias.vue` compiles without TypeScript errors. No duplicate `v-if`, no
    references to `adData` or `prepareAdSummary`. Only `ResumeOrder` remains in template.
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix free ad redirect in resumen.vue and create anunciar/gracias.vue</name>
  <files>
    apps/website/app/pages/anunciar/resumen.vue
    apps/website/app/pages/anunciar/gracias.vue
  </files>
  <action>
    **Part A — Fix redirect in `resumen.vue`:**

    In `handleFreeCreation()` (around line 183), change the type annotation of
    `freeAdResponse` to capture the `documentId` from the returned ad:

    Change:
    ```typescript
    const freeAdResponse = await create<{ ad?: { id: number } }>(
      "payments/free-ad",
      { ad_id: adStore.ad.ad_id, pack: adStore.pack } as unknown as Parameters<typeof create>[1],
    );

    await fetchUser();
    router.push(
      "/pagar/gracias?order=" + (adStore.ad.documentId || adStore.ad.ad_id),
    );
    ```

    To:
    ```typescript
    const freeAdResponse = await create<{ ad?: { documentId?: string; id?: number } }>(
      "payments/free-ad",
      { ad_id: adStore.ad.ad_id, pack: adStore.pack } as unknown as Parameters<typeof create>[1],
    );

    await fetchUser();
    const adDocumentId = (freeAdResponse as unknown as { data?: { ad?: { documentId?: string } } }).data?.ad?.documentId;
    router.push("/anunciar/gracias?ad=" + (adDocumentId || adStore.ad.ad_id));
    ```

    **Part B — Create `apps/website/app/pages/anunciar/gracias.vue`:**

    Create a new page that:
    - Reads `route.query.ad` as the ad `documentId`
    - Fetches the ad from Strapi using `useAsyncData` with key `'anunciar-gracias-${route.query.ad}'`
    - Uses `useStrapi().findOne("ads", documentId, { populate: "*" })` to load the ad
    - Calls `showError({ statusCode: 404, ... })` if `route.query.ad` is missing or ad not found
    - Renders `ResumeDefault` with `:summary` mapped from the ad data and `hidePaymentSection: true`
    - Has `definePageMeta({ middleware: "auth" })`
    - Has `useSeoMeta({ robots: "noindex, nofollow" })`

    The summary object passed to `ResumeDefault` should mirror the shape from `resumen.vue`'s
    `prepareSummary()` function (same field names), built from the fetched ad object:
    ```typescript
    const prepareAdSummary = (ad: Record<string, unknown>) => ({
      showEditLinks: false,
      title: ad.name,
      category: (ad.category as { id?: unknown })?.id ?? ad.category,
      price: ad.price,
      currency: ad.currency,
      description: ad.description,
      email: ad.email,
      phone: ad.phone,
      commune: (ad.commune as { id?: unknown })?.id ?? ad.commune,
      address: ad.address,
      addressNumber: ad.address_number,
      condition: (ad.condition as { id?: unknown })?.id ?? ad.condition,
      manufacturer: ad.manufacturer,
      model: ad.model,
      serialNumber: ad.serial_number,
      year: ad.year,
      weight: ad.weight,
      width: ad.width,
      height: ad.height,
      depth: ad.depth,
      gallery: ad.gallery,
      hasToPay: false,
    });
    ```

    Page structure:
    ```vue
    <template>
      <div class="page">
        <HeaderDefault :show-search="true" />
        <HeroFake />
        <ResumeDefault
          v-if="adData"
          :show-icon="true"
          :hide-payment-section="true"
          title="¡Anuncio creado!"
          description="Tu anuncio ha sido enviado para revisión. Te notificaremos por correo cuando esté publicado."
          :summary="prepareAdSummary(adData)"
        />
        <FooterDefault />
      </div>
    </template>
    ```

    Use `useAsyncData` following project rules:
    - Key: `\`anunciar-gracias-${route.query.ad}\``
    - `server: true`, `lazy: false`
    - `default: () => null`
    - Handle missing `ad` query param by returning `{ error: 'INVALID_URL' }` and
      calling `showError` via `watchEffect` on data
    - Import `HeaderDefault`, `HeroFake`, `ResumeDefault`, `FooterDefault` explicitly
  </action>
  <verify>
    <automated>cd apps/website && yarn nuxi typecheck 2>&1 | grep -E "anunciar/gracias|anunciar/resumen" || echo "No errors in anunciar pages"</automated>
  </verify>
  <done>
    - `apps/website/app/pages/anunciar/gracias.vue` exists and renders `ResumeDefault` with fetched ad data
    - `resumen.vue` free-ad path redirects to `/anunciar/gracias?ad=<documentId>` (not `/pagar/gracias`)
    - Both files pass TypeScript check
  </done>
</task>

</tasks>

<verification>
Run full typecheck on the website app:
```bash
cd apps/website && yarn nuxi typecheck 2>&1 | grep -E "error|Error" | grep -v "node_modules" | head -20
```
Expected: zero errors in the three modified/created files.

Smoke check redirect path:
- `resumen.vue` `handleFreeCreation` must `router.push` to `/anunciar/gracias?ad=...`
- `pagar/gracias.vue` must NOT reference `adData` or `prepareAdSummary`
- `anunciar/gracias.vue` must exist and import `ResumeDefault`
</verification>

<success_criteria>
- `apps/website/app/pages/pagar/gracias.vue`: compiles cleanly, no duplicate `v-if`, no `adData`/`prepareAdSummary` references
- `apps/website/app/pages/anunciar/resumen.vue`: free ad flow redirects to `/anunciar/gracias?ad=<documentId>` using value from API response
- `apps/website/app/pages/anunciar/gracias.vue`: new page exists, fetches ad by `documentId` from query param, renders `ResumeDefault` with `hidePaymentSection: true`
</success_criteria>

<output>
After completion, create `.planning/quick/1-fix-free-ad-redirect-to-anunciar-gracias/1-SUMMARY.md`
</output>
