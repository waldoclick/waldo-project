# Phase 119: Export Orders to CSV from Dashboard Orders Page - Research

**Researched:** 2026-04-06
**Domain:** CSV export, dashboard UI, Strapi API extension
**Confidence:** HIGH

## Summary

Phase 119 adds a "Export CSV" button to the dashboard orders page (`OrdersDefault.vue`). When clicked, it fetches all orders from Strapi (no pagination, all records) and downloads a `.csv` file in the browser without any external library dependency. The entire feature is self-contained: one Strapi endpoint addition (`GET /api/orders/export-csv`), one utility function (`exportOrdersToCsv`), and a minimal UI change to `OrdersDefault.vue` header.

No CSV library needs to be installed. The data volume is small enough (order records) that a hand-rolled CSV serializer would be acceptable, but the simpler and safer option is to build the CSV string in a pure utility function using standard string manipulation — matching the project's existing pattern of lightweight utils in `apps/dashboard/app/utils/`. There is no existing export/download precedent in the codebase; this is the first such feature.

The recommended architecture: add a new Strapi route `GET /orders/export-csv` that fetches all orders with `limit: -1` (matching the existing `salesByMonth` pattern), serializes them to CSV on the server, and returns the CSV string with `Content-Type: text/csv`. The dashboard calls this endpoint via `useApiClient`, then triggers a browser download using the `Blob` + `URL.createObjectURL` + `<a>` click pattern. No third-party library is needed on either side.

**Primary recommendation:** Add a Strapi `GET /orders/export-csv` endpoint that returns CSV content directly. Dashboard triggers download via Blob URL pattern in a new `useExportCsv` composable.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native `Blob` + `URL.createObjectURL` | Browser API | Client-side file download trigger | Zero deps, works in all modern browsers, already allowed by CSP (`blob:` is in `img-src` but NOT in any other directive — see Pitfall 1) |
| Strapi `entityService.findMany` with `limit: -1` | Strapi v5 (project) | Fetch all orders without pagination | Existing pattern in `salesByMonth` controller action |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `papaparse` | 5.5.3 | Client-side CSV parse/unparse | Only if CSV needs to handle complex quoting rules with commas/newlines in field values (e.g. `payment_response` JSON). For simple flat fields, native string join is sufficient. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Strapi endpoint returns CSV | Dashboard fetches paginated JSON and converts client-side | Strapi approach is simpler — no multi-page fetch loop on the client; server already has `limit: -1` pattern |
| Native Blob download | `window.location.href` pointing to Strapi URL | Blob approach works without CORS headers on the binary download; Strapi URL approach requires `Content-Disposition` header and CORS `expose-headers` config |
| Hand-rolled CSV serializer | `papaparse` | For flat fields without embedded commas/newlines, hand-rolled is fine and adds zero deps. If `items` (JSON) or `payment_response` (JSON) are included in the export, use `papaparse` to handle quoting automatically. |

**Installation (if papaparse is chosen):**
```bash
yarn workspace waldo-dashboard add papaparse
yarn workspace waldo-dashboard add -D @types/papaparse
```

**Version verification:** `papaparse` 5.5.3 confirmed via npm registry (2026-04-06).

## Architecture Patterns

### Recommended Project Structure
No new directories needed. Changes touch:
```
apps/
├── strapi/src/api/order/
│   ├── controllers/order.ts       # add exportCsv action
│   └── routes/01-order-me.ts     # add GET /orders/export-csv route
└── dashboard/app/
    ├── composables/useExportCsv.ts    # new — download trigger composable
    ├── utils/csv.ts                    # new — CSV serializer utility + tests
    ├── components/OrdersDefault.vue    # add export button to header
    └── scss/components/_orders.scss   # add button styles
```

### Pattern 1: Strapi "fetch all + return text response"
**What:** Override the Koa context to return a plain text response with CSV content type instead of JSON.
**When to use:** When the endpoint is meant to deliver a file payload rather than an API response.
**Example:**
```typescript
// Source: Strapi v5 Koa context — consistent with salesByMonth pattern in this codebase
async exportCsv(ctx: Context) {
  const orders = await strapi.entityService.findMany("api::order.order", {
    populate: ["user", "ad"],
    limit: -1,                        // fetch ALL — matches salesByMonth pattern
    sort: { createdAt: "desc" },
  });

  const csv = buildOrdersCsv(orders as OrderWithRelations[]);
  ctx.set("Content-Type", "text/csv; charset=utf-8");
  ctx.set("Content-Disposition", 'attachment; filename="orders.csv"');
  ctx.body = csv;
},
```

### Pattern 2: Dashboard Blob download
**What:** Fetch the CSV string from the API, wrap it in a `Blob`, create an object URL, click a hidden `<a>` tag, then revoke the URL.
**When to use:** Any time the dashboard needs to trigger a file download without navigating away.
**Example:**
```typescript
// Source: MDN Web Docs — standard Blob download pattern
export function useExportCsv() {
  const apiClient = useApiClient();
  const isExporting = ref(false);

  async function exportOrders(): Promise<void> {
    isExporting.value = true;
    try {
      const csv = await apiClient<string>("orders/export-csv", { method: "GET" });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `orders-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      isExporting.value = false;
    }
  }

  return { exportOrders, isExporting };
}
```

### Pattern 3: CSV serializer utility
**What:** A pure function that converts an array of Order objects to a CSV string. Lives in `apps/dashboard/app/utils/csv.ts` — consistent with `date.ts`, `price.ts`, `string.ts`.
**When to use:** All CSV formatting logic lives here; composable only handles the download trigger.
**Example:**
```typescript
// Pure utility — fully testable with 100% coverage at creation (per CLAUDE.md)
export function ordersTocsv(orders: OrderRow[]): string {
  const headers = ["ID", "Cliente", "Email", "Anuncio", "Monto", "Método", "Tipo", "Fecha"];
  const rows = orders.map((o) => [
    String(o.id),
    o.user?.username ?? "",
    o.user?.email ?? "",
    o.ad?.name ?? "",
    String(o.amount),
    o.payment_method ?? "",
    o.is_invoice ? "Factura" : "Boleta",
    o.createdAt,
  ]);
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
}
```

### Anti-Patterns to Avoid
- **Fetching paginated JSON and looping on the client:** Adds complexity, multiple round trips, no benefit over `limit: -1` on the server.
- **Using `window.location.href` with the Strapi URL directly:** Requires CORS `expose-headers: Content-Disposition` and browser handles the download natively only if Strapi sends the right headers — fragile.
- **Embedding CSV logic inside the Vue component:** All formatting logic must live in `utils/csv.ts` so it can be 100% unit-tested per CLAUDE.md requirement for utility functions.
- **Using `useAsyncData` for the export action:** `useAsyncData` is for SSR data loading; the export is a user-initiated client action that runs `onClick`. Use a plain `async` function in the composable.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV cell quoting | Custom regex escaping | `"${cell.replace(/"/g, '""')}"` (RFC 4180) | The double-quote escaping rule is simple but easy to forget; document it explicitly |
| File download | Backend file storage + pre-signed URL | Blob + object URL | No storage needed for on-demand exports; Blob approach is ephemeral and instant |
| Loading state | Store-based loading flag | `ref<boolean>` in composable | Export is local UI state, not shared state — no Pinia store needed |

**Key insight:** CSV for flat tabular data (no nested arrays, no multi-line values) is simple enough to hand-roll safely if each cell is double-quoted. The only risk is embedded `"` characters in field values — handle with `"".replace(/"/g, '""')`.

## Common Pitfalls

### Pitfall 1: `blob:` URL not allowed by CSP `script-src`
**What goes wrong:** The Blob URL for the download `<a>` tag is a `blob:` URL. The dashboard CSP currently has `blob:` only in `img-src`. If the browser tries to "navigate" to the blob URL rather than download it, a CSP violation may fire on some browsers.
**Why it happens:** `<a download>` attribute tells the browser to download rather than navigate. The `download` attribute must be present or the browser may navigate (CSP issue).
**How to avoid:** Always set `link.setAttribute("download", "filename.csv")` before clicking. Never use `window.open(blobUrl)` — that triggers navigation, not download.
**Warning signs:** Browser console shows `Refused to navigate to 'blob:...' because it violates the following CSP directive`.

### Pitfall 2: `limit: -1` performance with large datasets
**What goes wrong:** `limit: -1` fetches ALL records. If orders grow to thousands, this could be a slow query.
**Why it happens:** The export is a one-shot admin action — acceptable for now, but worth noting.
**How to avoid:** Add `isExporting` loading state in the UI; the export button should show a spinner and be disabled during fetch. For now no cap is needed, but document that future optimization (date range filter) is a natural next step.
**Warning signs:** Request takes >5s; browser shows timeout.

### Pitfall 3: JSON fields in CSV cells (`items`, `payment_response`)
**What goes wrong:** `items` and `payment_response` are JSON type fields in Strapi. If included as-is in CSV, the JSON string contains commas and quotes, breaking the CSV structure.
**Why it happens:** CSV comma-separation conflicts with JSON commas in values.
**How to avoid:** Either (a) exclude these JSON fields from the CSV export (recommended for simplicity), or (b) JSON.stringify them, then apply the double-quote CSV escaping. The recommended column set is: ID, Cliente, Email, Anuncio, Monto, Método, Tipo, Fecha — no JSON fields.
**Warning signs:** CSV opens in Excel with columns shifted unexpectedly.

### Pitfall 4: Strapi route ordering — custom routes must precede core routes
**What goes wrong:** The new `GET /orders/export-csv` route must be declared in `01-order-me.ts` (which loads before `order.ts`), not in a new file. If it's in a file with a name that sorts after `order.ts`, Strapi may match `/orders/:id` first and treat `export-csv` as a document ID.
**Why it happens:** Strapi loads route files alphabetically; `01-order-me.ts` naming guarantees it loads first.
**How to avoid:** Add the new route to the existing `01-order-me.ts` file, not a new route file. Alternatively name a new file `00-order-export.ts`.
**Warning signs:** Strapi returns a 404 or "document not found" error for `/orders/export-csv`.

### Pitfall 5: Missing Strapi permission for `exportCsv` action
**What goes wrong:** Strapi v5 requires explicit permissions for custom controller actions. After adding `exportCsv`, the route will return 403 until it's enabled in Settings > Roles > Authenticated (or Manager role).
**Why it happens:** Strapi's permission system does not auto-grant new custom actions.
**How to avoid:** Document in the plan that Strapi admin permissions must be configured for the new action. This is a manual step.
**Warning signs:** Dashboard receives 403 on the export endpoint despite being logged in.

## Code Examples

Verified patterns from the codebase:

### Strapi `limit: -1` to fetch all records
```typescript
// Source: apps/strapi/src/api/order/controllers/order.ts — salesByMonth action
const orders = await strapi.entityService.findMany("api::order.order", {
  filters: { ... },
  fields: ["amount", "createdAt"],
  limit: -1, // fetch all matching orders without pagination
});
```

### Custom Strapi route declaration (prepend file)
```typescript
// Source: apps/strapi/src/api/order/routes/01-order-me.ts
export default {
  routes: [
    { method: "GET", path: "/orders/sales-by-month", handler: "order.salesByMonth" },
    { method: "GET", path: "/orders/me", handler: "order.me" },
    // Add here:
    { method: "GET", path: "/orders/export-csv", handler: "order.exportCsv" },
  ],
};
```

### Dashboard `apiClient` GET pattern
```typescript
// Source: apps/dashboard/app/components/OrdersDefault.vue
const apiClient = useApiClient();
const res = await apiClient("orders", { method: "GET", params: { ... } });
```

### BEM button class pattern (from `FilterDefault.vue`)
```html
<!-- Existing pattern for action buttons in header area -->
<button class="filter--default__button" @click="handleClick">
  <Icon class="filter--default__button__icon" />
  <span>Label</span>
</button>
```
For the orders header, the export button would be:
```html
<button class="orders--default__export" :disabled="isExporting" @click="exportOrders">
  <Download class="orders--default__export__icon" />
  <span>{{ isExporting ? 'Exportando...' : 'Exportar CSV' }}</span>
</button>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side CSV generation with streams | In-memory string concat with `limit: -1` | N/A for this project | Streams only needed for millions of rows; order counts are small |
| Third-party CSV libraries (papaparse, csv-stringify) | Native string manipulation | N/A | Zero deps preferred unless JSON fields require it |

**Deprecated/outdated:**
- Server-side CSV file storage + download link: unnecessary complexity for on-demand exports.

## Open Questions

1. **Which fields to include in the CSV?**
   - What we know: The table shows: ID, Cliente, Anuncio, Monto, Método de Pago, Tipo (Factura/Boleta), Fecha
   - What's unclear: Should email, firstname, lastname, phone from `OrderUser` be included? Should `buy_order` be included for payment auditing?
   - Recommendation: Mirror the table columns exactly (ID, username, ad name, amount, payment_method, is_invoice, createdAt) plus email for practical use. Exclude JSON fields (items, payment_response, document_details).

2. **Date range filter for the export?**
   - What we know: The existing orders page has no date filter in the UI.
   - What's unclear: Whether the product owner wants "export all" or "export with filters".
   - Recommendation: Start with "export all" (simplest). A date range filter can be added later as a follow-up.

3. **Access control: who can export?**
   - What we know: The dashboard is manager-only (authenticated role).
   - What's unclear: Whether the Strapi `exportCsv` action should be accessible to all authenticated users or only specific roles.
   - Recommendation: Allow any authenticated user (consistent with `find` action behavior in this project). The Strapi admin must manually grant the permission post-deploy.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.0.9 |
| Config file | `apps/dashboard/vitest.config.ts` |
| Quick run command | `yarn workspace waldo-dashboard vitest run tests/utils/csv.test.ts` |
| Full suite command | `yarn workspace waldo-dashboard vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CSV-01 | `ordersTocsv()` correctly serializes flat order rows to RFC 4180 CSV | unit | `yarn workspace waldo-dashboard vitest run tests/utils/csv.test.ts` | ❌ Wave 0 |
| CSV-02 | `ordersTocsv()` escapes embedded double-quotes in cell values | unit | same as above | ❌ Wave 0 |
| CSV-03 | `ordersTocsv()` handles null/undefined user or ad relations gracefully | unit | same as above | ❌ Wave 0 |
| CSV-04 | `ordersTocsv()` produces correct header row | unit | same as above | ❌ Wave 0 |
| CSV-05 | Strapi `exportCsv` controller action: manual smoke test — verify 200 + text/csv content type | manual | N/A | N/A |

### Sampling Rate
- **Per task commit:** `yarn workspace waldo-dashboard vitest run tests/utils/csv.test.ts`
- **Per wave merge:** `yarn workspace waldo-dashboard vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/dashboard/tests/utils/csv.test.ts` — covers CSV-01 through CSV-04
- [ ] `apps/dashboard/app/utils/csv.ts` — the utility itself (created in same task as test)

## Sources

### Primary (HIGH confidence)
- Codebase: `apps/strapi/src/api/order/controllers/order.ts` — `salesByMonth` action establishes `limit: -1` as the project pattern for "fetch all"
- Codebase: `apps/strapi/src/api/order/routes/01-order-me.ts` — establishes the custom route prepend pattern
- Codebase: `apps/dashboard/app/components/OrdersDefault.vue` — establishes `useApiClient` GET pattern and component structure
- Codebase: `apps/dashboard/app/utils/string.ts`, `date.ts`, `price.ts` — establishes pure utility function pattern with 100% test coverage requirement
- Codebase: `apps/dashboard/nuxt.config.ts` — CSP configuration confirms `blob:` is in `img-src` only (not `script-src`)

### Secondary (MEDIUM confidence)
- MDN Web Docs — `Blob` + `URL.createObjectURL` + `<a download>` is the canonical browser-native file download pattern
- RFC 4180 — CSV double-quote escaping rule (`""` for embedded quotes)
- npm registry — `papaparse` 5.5.3 verified 2026-04-06

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries/APIs are either built-in browser APIs or already in the codebase
- Architecture: HIGH — patterns directly modeled on existing `salesByMonth` (Strapi) and utility function conventions (dashboard)
- Pitfalls: HIGH — CSP issue verified against actual `nuxt.config.ts`; route ordering verified against actual file naming; permission requirement is Strapi v5 documented behavior

**Research date:** 2026-04-06
**Valid until:** 2026-06-06 (stable domain — no fast-moving libraries)
