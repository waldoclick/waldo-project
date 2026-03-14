---
phase: quick-35
plan: 35
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/website/app/components/CheckoutDefault.vue
autonomous: true
requirements:
  - QUICK-35
must_haves:
  truths:
    - "is_invoice is forwarded to Strapi's checkoutCreate when user selects Boleta/Factura"
  artifacts:
    - path: "apps/website/app/components/CheckoutDefault.vue"
      provides: "Sends is_invoice in POST /payments/checkout body"
      contains: "is_invoice: adStore.is_invoice"
  key_links:
    - from: "apps/website/app/components/CheckoutDefault.vue"
      to: "payments/checkout (Strapi)"
      via: "create() payload"
      pattern: "is_invoice.*adStore\\.is_invoice"
---

<objective>
Forward `adStore.is_invoice` to Strapi's `payments/checkout` endpoint by adding the field to the `create()` payload in `handlePayClick()`.

Purpose: Without this field, Strapi's checkout controller never receives the invoice type selection made by the user in `PaymentInvoice.vue`, breaking Boleta/Factura invoice emission.
Output: `CheckoutDefault.vue` with `is_invoice: adStore.is_invoice` included in the POST body.
</objective>

<execution_context>
@/home/gabriel/.config/Claude/get-shit-done/workflows/execute-plan.md
@/home/gabriel/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/website/app/components/CheckoutDefault.vue
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add is_invoice to checkout payload</name>
  <files>apps/website/app/components/CheckoutDefault.vue</files>
  <action>
In `handlePayClick()`, locate the `create("payments/checkout", { ... })` call (line 56–63).
Add `is_invoice: adStore.is_invoice,` as a new field after `featured: adStore.featured,`.

The object should become:
```ts
{
  pack: selectedPack.name,
  ad_id: adStore.ad.ad_id,
  featured: adStore.featured,
  is_invoice: adStore.is_invoice,
} as unknown as Parameters<typeof create>[1]
```

No other changes. `adStore` is already imported and available in scope.
  </action>
  <verify>
    <automated>grep -n "is_invoice" apps/website/app/components/CheckoutDefault.vue</automated>
  </verify>
  <done>`is_invoice: adStore.is_invoice` appears in the create() payload object; TypeScript check passes (`yarn workspace website typecheck` exits 0).</done>
</task>

</tasks>

<verification>
Run `yarn workspace website typecheck` — must exit 0 with no new errors.
Confirm grep output shows `is_invoice: adStore.is_invoice` inside `CheckoutDefault.vue`.
</verification>

<success_criteria>
`POST /payments/checkout` payload includes `is_invoice` sourced from `adStore.is_invoice`, ensuring Strapi receives the Boleta/Factura flag set by `PaymentInvoice.vue`.
</success_criteria>

<output>
After completion, create `.planning/quick/35-verify-is-invoice-field-flows-from-check/35-SUMMARY.md`
</output>
