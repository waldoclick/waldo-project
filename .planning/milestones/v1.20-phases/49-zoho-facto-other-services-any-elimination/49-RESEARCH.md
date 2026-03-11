# Phase 49: Zoho + Facto + Other Services any Elimination - Research

**Researched:** 2026-03-08
**Domain:** TypeScript `any` elimination in third-party integration services (Zoho, Facto, Indicador, Google, Transbank, payment-gateway)
**Confidence:** HIGH

## Summary

Phase 49 targets 11 files across 6 service directories. All files have been read in full. `tsc --noEmit` currently passes with zero errors (confirmed pre-change baseline). Every `any` occurrence falls into one of five patterns: (1) return type `Promise<any>` / `Promise<any[]>` on Zoho service methods and interface declarations, (2) HTTP client `params`/`data` parameters in `zoho/http-client.ts`, (3) `datos: any` factory param and `private client: any` / `getClient(): any` in Facto, (4) SOAP callback `(err: any, result: any)` — the soap package's `CreateClientCallback` type itself uses `(err: any, client: Client)`, which is a library-defined signature, (5) `data: any` in `indicador.service.ts`'s `transformToEnglishFormat`, `data: any[]` in Google Sheets, and `error?: any` / `response?: any` fields in Transbank types and gateway interface.

Key findings: The `transformToEnglishFormat(data: any)` param in `indicador.service.ts` can use the existing `Indicador` interface from `./interfaces` — the four properties accessed (`data.codigo`, `data.nombre`, `data.unidad_medida`, `data.valor`) are all defined on `Indicador`. The SOAP `emitirDocumento` callback `(err: any, result: any)` — the soap package's own `createClient` callback signature is `(err: any, client: Client)` in `soap.d.ts`, but the `emitirDocumento` callback is a dynamic method call on `client` (typed `[method: string]: any`). The result shape is well-known: `result.return.resultado.status`, `result.return.resultado.mensaje_error` — use `unknown` with narrowing. For `private client: any` in `FactoConfig` — `soap.Client` from the `soap` package is the correct type; `getClient()` should return `soap.Client`. The Zoho service/interface `Promise<any>` returns can all become `Promise<unknown>` — callers only use `.data[0]` which is already opaque, or the return value is passed directly to the Strapi layer.

**Primary recommendation:** Replace all `any` with `unknown` for data containers and responses; use `Indicador` (existing interface) for `transformToEnglishFormat`; use `soap.Client` for the Facto SOAP client field; use `unknown` with narrowing for SOAP callbacks. No new packages needed.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TSANY-13 | `zoho.service.ts` — `Promise<any[]>`, `Promise<any>`, `Promise<any | null>` return types → `Promise<unknown[]>`, `Promise<unknown>`, `Promise<unknown \| null>` | 5 occurrences confirmed: `createLead` returns `Promise<any[]>`, `createContact`/`findContact`/`updateContact` return `Promise<any>`, `updateContactStats` uses `post<{ data: any[] }>` inline. |
| TSANY-14 | `zoho.service.ts` — `httpClient.post/get/put<{ data: any[] }>` generics → `<{ data: unknown[] }>` | 5 inline generic args on `httpClient.post`, `httpClient.get`, `httpClient.put` calls use `{ data: any[] }` — all become `{ data: unknown[] }`. |
| TSANY-15 | `zoho/interfaces.ts` — interface method return types `Promise<any[]>`, `Promise<any>` → `Promise<unknown[]>`, `Promise<unknown>` | 4 occurrences in `IZohoService`: `createLead` → `Promise<unknown[]>`, `createContact` / `findContact` / `updateContact` → `Promise<unknown>`. Must stay in sync with service impl. |
| TSANY-16 | `zoho/http-client.ts` — `params?: any`, `data: any` params → `unknown` | 3 occurrences: `get(url, params?: any)`, `post(url, data: any)`, `put(url, data: any)`. Axios `.get(url, { params })` and `.post(url, data)` accept `unknown` — no breakage. |
| TSANY-17 | `facto.factory.ts` — `datos: any` param → `unknown` | 1 occurrence: `createDocument(is_invoice, datos: any)`. The `datos` is spread-merged with `{ encabezado: { tipo_dte } }` and passed to `emitInvoice`/`emitTicket` which expect `IFactoDocument`. Change to `unknown` requires a cast to `IFactoDocument` at the call sites inside `createDocument`. |
| TSANY-18 | SOAP callback `(err: any, result: any)` in both electronic service files → `(err: unknown, result: unknown)` | 2 occurrences (1 per file). Result usage is already well-guarded: `result.return.resultado.status` is accessed only after `!result` and `!result.return` null checks — but those checks need narrowing casts after type changes. The soap package's own callback type uses `any` — we override the local parameter type. |
| TSANY-19 | `facto.config.ts` — `private client: any` and `getClient(): any` → `soap.Client` | 2 occurrences. `soap.Client` is exported from the `soap` package (`import { Client } from 'soap'`). The `createClient` callback delivers a `Client` instance. `getClient()` typed as `soap.Client` aligns with actual usage. |
| TSANY-20 | `indicador.service.ts` — `transformToEnglishFormat(data: any)` → `data: Indicador` | 1 occurrence. `Indicador` interface is already in `./interfaces` and defines all 4 accessed properties (`codigo`, `nombre`, `unidad_medida`, `valor`). The callers already pass typed `Indicador` values (`response.uf`, `response.dolar`, etc.). |
| TSANY-21 | `google.types.ts` + `google-sheets.service.ts` — `appendToSheet(data: any[])` → `data: unknown[]` | 2 occurrences (1 in interface, 1 in implementation). The `values: [data]` usage in googleapis `sheets.spreadsheets.values.append` accepts `unknown[][]`. |
| TSANY-22 | `transbank/types/index.ts` + `transbank.service.ts` — `error?: any`, `response?: any` in result interfaces → `unknown`; `handleError(error: any)` → `unknown` | 3 `any` fields in types file (`IWebpayInitResponse.error`, `IWebpayCommitResponse.response`, `IWebpayCommitResponse.error`) + 1 in `handleError(error: any)` param. The `error.code`, `error.message` access in `handleError` needs narrowing cast after type change. |
| TSANY-23 | `payment-gateway/types/gateway.interface.ts` — `error?: any`, `response?: any` → `unknown` | 3 occurrences: `IGatewayInitResponse.error`, `IGatewayCommitResponse.response`, `IGatewayCommitResponse.error`. The `transbank.adapter.ts` copies `result.error` from `IWebpayInitResponse.error` into `IGatewayInitResponse.error` — both become `unknown` simultaneously, no mismatch. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.x (via Strapi) | Static typing | Already in use |
| `soap` | (installed) | SOAP client — `soap.Client` type | Already imported in `facto.config.ts` |
| `@strapi/strapi` | 5.x | Not needed for this phase | Already confirmed working in phases 47/48 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `Indicador` interface (local) | — | `transformToEnglishFormat` param type | Already defined in `./interfaces`, no new import needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `soap.Client` | `unknown` for `private client` | `soap.Client` is more expressive — IDE shows SOAP methods; `unknown` would require cast every time `getClient()` result is used |
| `Indicador` for `transformToEnglishFormat` | `unknown` with narrowing | `Indicador` is already the correct type — every caller already passes a typed `Indicador` value; `unknown` adds unnecessary complexity |
| `unknown` for SOAP `result` | Create `IFactoSoapResult` interface | `unknown` with narrowing is sufficient — the result shape is only accessed in one place after null checks |

**Installation:** No new packages needed — `soap` already installed, `Indicador` already in project.

## Architecture Patterns

### Target Files Map
```
apps/strapi/src/
├── services/zoho/
│   ├── zoho.service.ts        # TSANY-13, TSANY-14 (5+5 any occurrences)
│   ├── interfaces.ts           # TSANY-15 (4 any in IZohoService)
│   └── http-client.ts          # TSANY-16 (3 any params)
├── services/facto/
│   ├── factories/facto.factory.ts         # TSANY-17 (1 datos: any)
│   ├── config/facto.config.ts             # TSANY-19 (2 any: field + return)
│   └── services/
│       ├── electronic-ticket.service.ts   # TSANY-18 (1 callback pair)
│       └── electronic-invoice.service.ts  # TSANY-18 (1 callback pair)
├── services/indicador/
│   └── indicador.service.ts    # TSANY-20 (1 transformToEnglishFormat param)
├── services/google/
│   ├── types/google.types.ts   # TSANY-21 (1 interface method)
│   └── services/google-sheets.service.ts  # TSANY-21 (1 impl method)
├── services/transbank/
│   ├── types/index.ts          # TSANY-22 (3 any fields)
│   └── services/transbank.service.ts      # TSANY-22 (1 handleError param)
└── services/payment-gateway/
    └── types/gateway.interface.ts         # TSANY-23 (3 any fields)
```

All changes are in-place edits. No new files. No new packages.

### Pattern 1: Zoho `Promise<any>` return types → `Promise<unknown>`

**What:** Replace all `Promise<any>` / `Promise<any[]>` return types in both `zoho.service.ts` and `interfaces.ts`.
**When to use:** `createLead`, `createContact`, `findContact`, `updateContact`, `updateContactStats`.
**Example:**
```typescript
// BEFORE (zoho.service.ts)
async createLead(lead: ZohoLead): Promise<any[]> {
  const response = await this.httpClient.post<{ data: any[] }>("/crm/v5/Leads", { ... });
  return response.data;
}
async createContact(contact: { ... }): Promise<any> {
  const response = await this.httpClient.post<{ data: any[] }>("/crm/v5/Contacts", { ... });
  return response.data[0];
}
async findContact(email: string): Promise<any | null> {
  const response = await this.httpClient.get<{ data?: any[] }>("/crm/v5/Contacts/search", { ... });
  return response.data[0];
}
async updateContact(id: string, contact: { ... }): Promise<any> {
  const response = await this.httpClient.put<{ data: any[] }>(`/crm/v5/Contacts/${id}`, { ... });
  return response.data[0];
}
await this.httpClient.put<{ data: any[] }>(`/crm/v5/Contacts/${contactId}`, { ... });

// AFTER (zoho.service.ts)
async createLead(lead: ZohoLead): Promise<unknown[]> {
  const response = await this.httpClient.post<{ data: unknown[] }>("/crm/v5/Leads", { ... });
  return response.data;
}
async createContact(contact: { ... }): Promise<unknown> {
  const response = await this.httpClient.post<{ data: unknown[] }>("/crm/v5/Contacts", { ... });
  return response.data[0];
}
async findContact(email: string): Promise<unknown | null> {
  const response = await this.httpClient.get<{ data?: unknown[] }>("/crm/v5/Contacts/search", { ... });
  return response.data[0];
}
async updateContact(id: string, contact: { ... }): Promise<unknown> {
  const response = await this.httpClient.put<{ data: unknown[] }>(`/crm/v5/Contacts/${id}`, { ... });
  return response.data[0];
}
await this.httpClient.put<{ data: unknown[] }>(`/crm/v5/Contacts/${contactId}`, { ... });
```

```typescript
// BEFORE (interfaces.ts — IZohoService)
createLead(lead: ZohoLead): Promise<any[]>;
createContact(contact: { ... }): Promise<any>;
findContact(email: string): Promise<any>;
updateContact(id: string, contact: { ... }): Promise<any>;

// AFTER (interfaces.ts — IZohoService)
createLead(lead: ZohoLead): Promise<unknown[]>;
createContact(contact: { ... }): Promise<unknown>;
findContact(email: string): Promise<unknown>;
updateContact(id: string, contact: { ... }): Promise<unknown>;
```

### Pattern 2: Zoho HTTP client `params`/`data` → `unknown`

**What:** Replace `params?: any`, `data: any` with `unknown` in the three HTTP methods.
**When to use:** `ZohoHttpClient.get`, `.post`, `.put`
**Example:**
```typescript
// BEFORE
async get<T>(url: string, params?: any): Promise<T> {
  const response = await this.client.get(url, { params });
  return response.data;
}
async post<T>(url: string, data: any): Promise<T> {
  const response = await this.client.post(url, data);
  return response.data;
}
async put<T>(url: string, data: any): Promise<T> {
  const response = await this.client.put(url, data);
  return response.data;
}

// AFTER
async get<T>(url: string, params?: unknown): Promise<T> {
  const response = await this.client.get(url, { params });
  return response.data;
}
async post<T>(url: string, data: unknown): Promise<T> {
  const response = await this.client.post(url, data);
  return response.data;
}
async put<T>(url: string, data: unknown): Promise<T> {
  const response = await this.client.put(url, data);
  return response.data;
}
```
**Note:** Axios `.get(url, { params })` and `.post(url, data)` accept `unknown` for their data/params arguments — this compiles without errors.

### Pattern 3: `facto.factory.ts` — `datos: any` → `unknown` with cast

**What:** Change param to `unknown`, cast to `IFactoDocument` when spreading into `documento`.
**When to use:** `factoService.createDocument`
**Example:**
```typescript
// BEFORE
createDocument: async (is_invoice: boolean, datos: any): Promise<IFactoLegacyResponse> => {
  const documento = { ...datos, encabezado: { ...datos.encabezado, tipo_dte } };

// AFTER
createDocument: async (is_invoice: boolean, datos: unknown): Promise<IFactoLegacyResponse> => {
  const documento = {
    ...(datos as IFactoDocument),
    encabezado: { ...(datos as IFactoDocument).encabezado, tipo_dte },
  };
```
Source: `IFactoDocument` is already imported in this file via `import { IFactoDocument, IFactoLegacyResponse } from "../types/index"`.

### Pattern 4: `facto.config.ts` — `private client: any` → `soap.Client`

**What:** Import `Client` from `soap` and use it for the private field and return type.
**When to use:** `FactoConfig`
**Example:**
```typescript
// BEFORE
import * as soap from "soap";
// ...
private client: any;
// ...
public getClient(): any { ... }

// AFTER
import * as soap from "soap";
// (soap.Client is available as soap.Client — no additional named import needed)
// ...
private client: soap.Client | undefined;
// ...
public getClient(): soap.Client { ... }
```
**Note:** `initializeClient()` assigns `this.client = client` from the `createClient` callback where `client: Client` — this is already type-checked. The `private client: soap.Client | undefined` and initialization guard in `getClient()` are consistent.

### Pattern 5: SOAP callbacks `(err: any, result: any)` → `(err: unknown, result: unknown)` with narrowing

**What:** Change callback param types, add narrowing for `result` access.
**When to use:** Both `electronic-ticket.service.ts` and `electronic-invoice.service.ts`
**Example:**
```typescript
// BEFORE
client.emitirDocumento(params, (err: any, result: any) => {
  if (err) { reject(err); return; }
  if (!result || !result.return || !result.return.resultado) { ... }
  if (result.return.resultado.status !== "0") { ... }
  resolve(result);
});

// AFTER
client.emitirDocumento(params, (err: unknown, result: unknown) => {
  if (err) { reject(err instanceof Error ? err : new Error(String(err))); return; }

  const soapResult = result as {
    return?: {
      resultado?: { status?: string; mensaje_error?: string | null };
    };
  };

  if (!soapResult || !soapResult.return || !soapResult.return.resultado) {
    reject(new Error("Respuesta inválida del servicio"));
    return;
  }

  if (soapResult.return.resultado.status !== "0") {
    reject(
      new Error(
        soapResult.return.resultado.mensaje_error || "Error al emitir documento"
      )
    );
    return;
  }

  resolve(result as IFactoLegacyResponse);
});
```
**Note:** The `reject(err)` call — `Promise.reject` accepts `unknown`. However, `reject` callback from `new Promise` has type `(reason?: unknown) => void` in TypeScript ≥4.4 — so passing `err: unknown` directly is fine. The `resolve(result)` needs a cast to `IFactoLegacyResponse` since the Promise is typed as `Promise<IFactoLegacyResponse>`.

### Pattern 6: `indicador.service.ts` — `transformToEnglishFormat(data: any)` → `data: Indicador`

**What:** Replace `any` with the existing `Indicador` interface from the same interfaces module.
**When to use:** `IndicadorService.transformToEnglishFormat`
**Example:**
```typescript
// BEFORE
import { IHttpClient, IIndicadorService, IndicadorResponse, Indicator, IndicatorsResponse, Currency, ConversionError } from "./interfaces";
// ...
private transformToEnglishFormat(data: any): Indicator {
  return { code: data.codigo, name: data.nombre, unit: data.unidad_medida, value: data.valor };
}

// AFTER
import { IHttpClient, IIndicadorService, IndicadorResponse, Indicator, Indicador, IndicatorsResponse, Currency, ConversionError } from "./interfaces";
// ...
private transformToEnglishFormat(data: Indicador): Indicator {
  return { code: data.codigo, name: data.nombre, unit: data.unidad_medida, value: data.valor };
}
```
**Note:** `Indicador` interface is already defined in `./interfaces` (line 6) with exactly `codigo`, `nombre`, `unidad_medida`, `fecha`, `valor` — all four accessed properties are present. Add `Indicador` to the named import list. `Indicador` and `Indicator` are two distinct interfaces (`Indicador` = Spanish API format; `Indicator` = English standardized format).

### Pattern 7: Google Sheets `data: any[]` → `data: unknown[]`

**What:** Change param type in interface and implementation.
**When to use:** `IGoogleSheetsService.appendToSheet` and `GoogleSheetsService.appendToSheet`
**Example:**
```typescript
// BEFORE (google.types.ts)
interface IGoogleSheetsService { appendToSheet(data: any[]): Promise<void>; }

// AFTER
interface IGoogleSheetsService { appendToSheet(data: unknown[]): Promise<void>; }

// BEFORE (google-sheets.service.ts)
async appendToSheet(data: any[]): Promise<void> {
  // ... values: [data]

// AFTER
async appendToSheet(data: unknown[]): Promise<void> {
  // ... values: [data]  ← unchanged, still valid
```
**Note:** `sheets.spreadsheets.values.append` expects `requestBody.values` as `unknown[][]` in googleapis type definitions — passing `[data]` where `data: unknown[]` is valid.

### Pattern 8: Transbank + payment-gateway `error?: any` / `response?: any` → `unknown`

**What:** Replace `any` fields in 4 interfaces + 1 `handleError` param.
**When to use:** `transbank/types/index.ts`, `transbank.service.ts`, `gateway.interface.ts`
**Example:**
```typescript
// BEFORE (transbank/types/index.ts)
interface IWebpayInitResponse { success: boolean; token?: string; url?: string; error?: any; }
interface IWebpayCommitResponse { success: boolean; response?: any; error?: any; }

// AFTER
interface IWebpayInitResponse { success: boolean; token?: string; url?: string; error?: unknown; }
interface IWebpayCommitResponse { success: boolean; response?: unknown; error?: unknown; }

// BEFORE (transbank.service.ts)
private handleError(error: any): IWebpayError {
  return { code: error.code || "UNKNOWN_ERROR", message: error.message || "An unknown error occurred" };
}

// AFTER
private handleError(error: unknown): IWebpayError {
  const e = error as Record<string, unknown>;
  return {
    code: typeof e?.code === "string" ? e.code : "UNKNOWN_ERROR",
    message: typeof e?.message === "string" ? e.message : "An unknown error occurred",
  };
}

// BEFORE (gateway.interface.ts)
interface IGatewayInitResponse { success: boolean; gatewayRef?: string; url?: string; error?: any; }
interface IGatewayCommitResponse { success: boolean; response?: any; error?: any; }

// AFTER
interface IGatewayInitResponse { success: boolean; gatewayRef?: string; url?: string; error?: unknown; }
interface IGatewayCommitResponse { success: boolean; response?: unknown; error?: unknown; }
```
**Note:** `transbank.adapter.ts` copies `result.error` from `IWebpayInitResponse.error` (now `unknown`) into `IGatewayInitResponse.error` (now also `unknown`) — this is a type-compatible assignment.

### Anti-Patterns to Avoid
- **Don't add a narrowing guard to `catch (error)` blocks in zoho.service.ts** — the `error.message` accesses in `throw new Error(...)` calls are in `catch` blocks which are out of scope per REQUIREMENTS.md ("Catch block `error: unknown` narrowing is out of scope").
- **Don't change `soap.createClient` callback signature** — the `soap` package's own `CreateClientCallback` types `err: any` and `client: Client`. Only the `emitirDocumento` callback inside the SOAP client is in scope.
- **Don't use `import { Client } from 'soap'`** — use `soap.Client` via the existing `import * as soap from "soap"` to keep one import statement.
- **Don't cast `datos as IFactoDocument` at every spread access** — do it once with a local const if preferred, or inline as shown.
- **Don't touch `zoho.test.ts`, `indicador.test.ts`, or `facto.test.ts`** — test files are out of scope for this phase.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SOAP client type | Custom `ISoapClient` interface | `soap.Client` from `soap` package | Already installed, official type, has `[method: string]: any` index |
| Indicador API response type | New interface | `Indicador` (already in `./interfaces`) | All four properties confirmed present |
| Zoho response shapes | `IZohoContactResponse`, `IZohoLeadResponse` | `unknown` | External API responses — consumers cast downstream, no need for full shape |

**Key insight:** All logic is already correct — this phase is purely type annotation changes. No runtime behavior changes. The type improvements make intent explicit without altering execution.

## Common Pitfalls

### Pitfall 1: `catch (error)` blocks in zoho.service.ts — DON'T touch
**What goes wrong:** The `error.message` accesses inside `catch (error)` blocks in `zoho.service.ts` and `transbank.service.ts` look like `any` problems but are **out of scope** per REQUIREMENTS.md.
**Why it happens:** REQUIREMENTS.md explicitly excludes "Catch block `error: unknown` narrowing" from Phase 49.
**How to avoid:** Only fix the explicitly listed `any` occurrences. Leave `catch (error)` parameter types unchanged.
**Warning signs:** Accidentally adding `error: unknown` to catch blocks.

### Pitfall 2: `soap.Client | undefined` field initialization
**What goes wrong:** Changing `private client: any` to `private client: soap.Client | undefined` requires updating all usages — `this.client = client` in the `createClient` callback assigns `Client` (not `undefined`), which is correct.
**Why it happens:** `soap.Client` and `Client` are the same type — just accessed via the namespace.
**How to avoid:** Change field declaration to `private client: soap.Client | undefined`. The `initializeClient` guard `if (!this.client)` already prevents re-initialization. `getClient()` already throws if not initialized — its return type `soap.Client` is safe.

### Pitfall 3: `reject(err)` with `err: unknown` in SOAP callback
**What goes wrong:** `Promise` constructor's `reject` function signature in TypeScript is `(reason?: unknown) => void` in modern TypeScript. Passing `err: unknown` directly works. However, `reject(err instanceof Error ? err : new Error(String(err)))` is the safer pattern.
**Why it happens:** Some TypeScript configs may warn about passing non-`Error` values to `reject`.
**How to avoid:** Use `reject(err instanceof Error ? err : new Error(String(err)))` for `err: unknown` in SOAP error callbacks.
**Warning signs:** TypeScript error on `reject(err)` if `err` is `unknown`.

### Pitfall 4: `Indicador` vs `Indicator` naming collision
**What goes wrong:** Both `Indicador` (Spanish, API format) and `Indicator` (English, standardized format) exist in `./interfaces`. Adding `Indicador` to the import list when `Indicator` is already imported could cause confusion.
**Why it happens:** Two similarly-named interfaces in the same file.
**How to avoid:** Import both explicitly: `import { ..., Indicador, Indicator, ... } from "./interfaces"`. They are distinct types — `Indicador` has `codigo`/`nombre`/`unidad_medida`/`fecha`/`valor`; `Indicator` has `code`/`name`/`unit`/`value`.

### Pitfall 5: `transbank.adapter.ts` compatibility after gateway interface changes
**What goes wrong:** `transbank.adapter.ts` (not in Phase 49 target list) copies `result.error` from `IWebpayInitResponse.error` into `IGatewayInitResponse.error`. Both are changing to `unknown` in this phase.
**Why it happens:** The adapter bridges the two interfaces.
**How to avoid:** Verify the adapter compiles after changes. Since both sides change to `unknown` simultaneously, the assignment `error: result.error` remains valid (both `unknown`). Run `tsc --noEmit` after changes.
**Warning signs:** TypeScript error in `transbank.adapter.ts` if only one side is changed.

### Pitfall 6: `resolve(result)` cast needed in SOAP callback
**What goes wrong:** After `result: unknown`, `resolve(result)` inside `Promise<IFactoLegacyResponse>` fails because `unknown` is not assignable to `IFactoLegacyResponse`.
**Why it happens:** `resolve` expects the Promise's type parameter.
**How to avoid:** Cast at the resolve site: `resolve(result as IFactoLegacyResponse)`. The null checks above verify the result shape sufficiently.

## Code Examples

Verified patterns from actual source files:

### Pattern 1 — Zoho return type changes (TSANY-13/14/15)
```typescript
// Source: zoho.service.ts (lines 18-21, 65-67, 107-109, 154-156, 231)
// Change: Promise<any[]> → Promise<unknown[]>, Promise<any> → Promise<unknown>
// Change: { data: any[] } → { data: unknown[] }
async createLead(lead: ZohoLead): Promise<unknown[]> {
  const response = await this.httpClient.post<{ data: unknown[] }>("/crm/v5/Leads", { ... });
  return response.data;
}
```

### Pattern 2 — Zoho HTTP client params (TSANY-16)
```typescript
// Source: http-client.ts (lines 71, 76, 81)
async get<T>(url: string, params?: unknown): Promise<T> {
  const response = await this.client.get(url, { params });
  return response.data;
}
async post<T>(url: string, data: unknown): Promise<T> {
  const response = await this.client.post(url, data);
  return response.data;
}
async put<T>(url: string, data: unknown): Promise<T> {
  const response = await this.client.put(url, data);
  return response.data;
}
```

### Pattern 3 — Facto factory (TSANY-17)
```typescript
// Source: facto.factory.ts (lines 17-40)
createDocument: async (is_invoice: boolean, datos: unknown): Promise<IFactoLegacyResponse> => {
  const tipo_dte = is_invoice ? DocumentType.INVOICE : DocumentType.TICKET;
  const documento = {
    ...(datos as IFactoDocument),
    encabezado: { ...(datos as IFactoDocument).encabezado, tipo_dte },
  };
  // ...
```

### Pattern 4 — Facto config SOAP client type (TSANY-19)
```typescript
// Source: facto.config.ts (lines 6, 54)
import * as soap from "soap";
// ...
private client: soap.Client | undefined;
// ...
public getClient(): soap.Client {
  if (!this.client) {
    throw new Error("Cliente SOAP no inicializado. Llame a initializeClient primero.");
  }
  return this.client;
}
// In initializeClient callback:
soap.createClient(wsdl, {}, (err, client) => {
  // err: any, client: soap.Client — soap package types
  this.client = client;  // client is soap.Client, assignable to soap.Client | undefined
  resolve();
});
```

### Pattern 5 — SOAP emitirDocumento callback (TSANY-18)
```typescript
// Source: electronic-ticket.service.ts and electronic-invoice.service.ts (line 62)
client.emitirDocumento(params, (err: unknown, result: unknown) => {
  if (err) {
    console.error("Error en la llamada SOAP:", err);
    reject(err instanceof Error ? err : new Error(String(err)));
    return;
  }
  const soapResult = result as {
    return?: { resultado?: { status?: string; mensaje_error?: string | null } };
  };
  if (!soapResult || !soapResult.return || !soapResult.return.resultado) {
    reject(new Error("Respuesta inválida del servicio"));
    return;
  }
  if (soapResult.return.resultado.status !== "0") {
    reject(new Error(soapResult.return.resultado.mensaje_error || "Error al emitir documento"));
    return;
  }
  resolve(result as IFactoLegacyResponse);
});
```

### Pattern 6 — Indicador transformToEnglishFormat (TSANY-20)
```typescript
// Source: indicador.service.ts (line 198)
// Add Indicador to existing import
import { IHttpClient, IIndicadorService, IndicadorResponse, Indicator, Indicador,
         IndicatorsResponse, Currency, ConversionError } from "./interfaces";
// ...
private transformToEnglishFormat(data: Indicador): Indicator {
  return {
    code: data.codigo,
    name: data.nombre,
    unit: data.unidad_medida,
    value: data.valor,
  };
}
```

### Pattern 7 — Google Sheets (TSANY-21)
```typescript
// Source: google.types.ts (line 13), google-sheets.service.ts (line 8)
// google.types.ts
interface IGoogleSheetsService { appendToSheet(data: unknown[]): Promise<void>; }

// google-sheets.service.ts
async appendToSheet(data: unknown[]): Promise<void> {
  // ... requestBody: { values: [data] } — unchanged, still valid
```

### Pattern 8 — Transbank types + handleError (TSANY-22)
```typescript
// Source: transbank/types/index.ts (lines 12, 17, 18), transbank.service.ts (line 74)
// types/index.ts
interface IWebpayInitResponse { success: boolean; token?: string; url?: string; error?: unknown; }
interface IWebpayCommitResponse { success: boolean; response?: unknown; error?: unknown; }

// transbank.service.ts
private handleError(error: unknown): IWebpayError {
  const e = error as Record<string, unknown>;
  return {
    code: typeof e?.code === "string" ? e.code : "UNKNOWN_ERROR",
    message: typeof e?.message === "string" ? e.message : "An unknown error occurred",
  };
}
```

### Pattern 9 — Gateway interface (TSANY-23)
```typescript
// Source: gateway.interface.ts (lines 5, 10, 11)
interface IGatewayInitResponse { success: boolean; gatewayRef?: string; url?: string; error?: unknown; }
interface IGatewayCommitResponse { success: boolean; response?: unknown; error?: unknown; }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `private client: any` in FactoConfig | `soap.Client \| undefined` | Phase 49 | Proper SOAP client typing |
| `datos: any` in facto factory | `unknown` with `IFactoDocument` cast | Phase 49 | Intent clear — caller must pass `IFactoDocument`-shaped data |
| `Promise<any>` on Zoho methods | `Promise<unknown>` | Phase 49 | Callers must narrow downstream |
| `error?: any` in response interfaces | `error?: unknown` | Phase 49 | Consistent with TypeScript best practice |

## Open Questions

1. **`handleError` usage in `transbank.service.ts`**
   - What we know: `handleError` is defined (line 74) but never called in `transbank.service.ts` — catch blocks in `createTransaction` and `commitTransaction` return error objects directly without calling it.
   - What's unclear: Whether `handleError` is dead code or called by the adapter/tests.
   - Recommendation: Change `handleError(error: any)` to `handleError(error: unknown)` with narrowing regardless — it still compiles, and if it's dead code, that's a future cleanup concern outside this phase's scope.

2. **`resolve(result as IFactoLegacyResponse)` safety**
   - What we know: The `result` shape is validated by null-checks before `resolve` is called, but it's still a cast.
   - What's unclear: Whether a runtime mismatch is possible.
   - Recommendation: The cast is safe — the null guards confirm `result.return.resultado.status` exists, meaning the full `IFactoLegacyResponse` structure is present. The cast is the correct pattern here.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest (`apps/strapi/jest.config.js`) |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && npx tsc --noEmit` |
| Full suite command | `cd apps/strapi && yarn test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TSANY-13 | Zoho service `Promise<unknown>` return types | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-14 | Zoho `httpClient` generics `{ data: unknown[] }` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-15 | `IZohoService` interface return types | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-16 | `ZohoHttpClient` params/data → `unknown` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-17 | `factoService.createDocument` `datos: unknown` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-18 | SOAP callback `(err: unknown, result: unknown)` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-19 | `FactoConfig.client: soap.Client \| undefined` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-20 | `transformToEnglishFormat(data: Indicador)` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-21 | Google Sheets `appendToSheet(data: unknown[])` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-22 | Transbank types `unknown` fields + `handleError` | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |
| TSANY-23 | Gateway interface `unknown` fields | compile | `cd apps/strapi && npx tsc --noEmit` | ✅ (type check) |

### Sampling Rate
- **Per task commit:** `cd apps/strapi && npx tsc --noEmit`
- **Per wave merge:** `cd apps/strapi && yarn test`
- **Phase gate:** `tsc --noEmit` passes with zero errors + all Jest tests pass before `/gsd-verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. `tsc --noEmit` is the primary validation tool for type annotation changes.

## Sources

### Primary (HIGH confidence)
- Direct file read: `apps/strapi/src/services/zoho/zoho.service.ts` — all `any` occurrences catalogued
- Direct file read: `apps/strapi/src/services/zoho/interfaces.ts` — all `any` occurrences catalogued
- Direct file read: `apps/strapi/src/services/zoho/http-client.ts` — all `any` occurrences catalogued
- Direct file read: `apps/strapi/src/services/facto/factories/facto.factory.ts` — `datos: any` confirmed
- Direct file read: `apps/strapi/src/services/facto/config/facto.config.ts` — `private client: any`, `getClient(): any` confirmed
- Direct file read: `apps/strapi/src/services/facto/services/electronic-ticket.service.ts` — SOAP callback `(err: any, result: any)` confirmed
- Direct file read: `apps/strapi/src/services/facto/services/electronic-invoice.service.ts` — SOAP callback `(err: any, result: any)` confirmed
- Direct file read: `apps/strapi/src/services/indicador/indicador.service.ts` — `transformToEnglishFormat(data: any)` confirmed
- Direct file read: `apps/strapi/src/services/indicador/interfaces.ts` — `Indicador` interface verified (has all 4 props)
- Direct file read: `apps/strapi/src/services/google/types/google.types.ts` — `appendToSheet(data: any[])` confirmed
- Direct file read: `apps/strapi/src/services/google/services/google-sheets.service.ts` — `appendToSheet(data: any[])` confirmed
- Direct file read: `apps/strapi/src/services/transbank/types/index.ts` — `error?: any`, `response?: any` confirmed
- Direct file read: `apps/strapi/src/services/transbank/services/transbank.service.ts` — `handleError(error: any)` confirmed
- Direct file read: `apps/strapi/src/services/payment-gateway/types/gateway.interface.ts` — all `any` fields confirmed
- Direct file read: `apps/strapi/src/services/payment-gateway/adapters/transbank.adapter.ts` — adapter compatibility confirmed
- Direct file read: `apps/strapi/src/services/facto/types/index.ts` — `IFactoDocument` import confirmed available
- Direct inspect: `node_modules/soap/lib/soap.d.ts` — `soap.Client` type and `CreateClientCallback` signature verified
- `cd apps/strapi && npx tsc --noEmit` — zero errors confirmed (pre-change baseline)

### Secondary (MEDIUM confidence)
- Phase 47/48 RESEARCH.md — established patterns for `unknown` substitution, `tsc --noEmit` workflow, and catch-block out-of-scope rule confirmed

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all types verified from installed packages and project source
- Architecture: HIGH — patterns verified from actual code analysis of all 13 target files
- Pitfalls: HIGH — identified from direct inspection of all service files and inter-file dependencies

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable TypeScript patterns)
