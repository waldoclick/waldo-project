# Phase 060: Mostrar comprobante Webpay - Research

**Researched:** 2026-03-09  
**Domain:** Nuxt 4 frontend, Webpay/Transbank receipt compliance, Chile  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Implement an on-screen digital receipt at `/pagar/gracias` for successful **Webpay** payments only.
- Always show these fields:  
  - Monto (amount), Código de autorización (authorization code), Fecha/hora de pago (date/time), Tipo de pago (payment type), Últimos 4 dígitos (last 4 digits), Número de orden/compra (order ID), Nombre/RUT/ID de comercio (merchant name/id), Webpay branding (logo).
- Labels must be in Spanish.
- Data must come from the confirmed Webpay response with *no masking* (verbatim display).
- If a field is missing, display a warning or placeholder.
- No print/email/download features.  
- Out of scope: non-Webpay gateways.

### Claude's Discretion
- How receipt UI/component is architected.
- Fetch/data-load pattern (must follow Nuxt + project idioms).
- UX for warnings/placeholders.

### Deferred Ideas (OUT OF SCOPE)
- Email or printable receipts
- Download/printing
- Supporting other payment providers
</user_constraints>

---

## Summary

This phase delivers a compliant, user-facing Webpay (Transbank) receipt immediately after a successful payment, at `/pagar/gracias`. All required fields (per Chilean/Transbank standard) must be shown, using *exact values* from the API response. If any field is missing, a clear Spanish placeholder or warning is required. The implementation must use standard Nuxt 4, Vue 3 `<script setup>`, and TypeScript, adhering to project architecture and BEM SCSS conventions.

**Primary recommendation:**  
Design a typed, reusable receipt Vue component (`ComprobanteWebpay.vue`) and load data using `useAsyncData` in the page (Nuxt pattern). Enforce strict Spanish localization and display *all* required fields, with explicit handling for missing data.

---

## Standard Stack

### Core
| Library             | Version  | Purpose                            | Why Standard          |
|---------------------|----------|------------------------------------|-----------------------|
| Nuxt                | 4.1.3    | Main SSR/SPA Framework             | Project-wide default  |
| Vue                 | 3.x      | UI Composition API                 | Required, project-wide|
| TypeScript          | ^5.6.x   | Static typing                      | Strict mode mandatory |
| Pinia               | 2.2.2    | State management (if needed)       | Project-wide default  |
| @nuxtjs/strapi      | 2.1.1    | Strapi integration                 | Required for data     |
| Sass                | ^1.79.x  | SCSS, BEM conventions              | Project-wide default  |

### Supporting
| Library               | Version  | Purpose                 | When to Use            |
|-----------------------|----------|-------------------------|------------------------|
| @nuxt/image           | 1.11.0   | Logo/brand asset        | For Webpay logo        |
| sweetalert2 (if used) | ^11.x    | Warnings/alerts         | Placeholder messages   |
| @nuxtjs/i18n          | 9.5.5    | Text localization       | If needed              |

### Alternatives Considered
| Instead of         | Could Use   | Tradeoff                              |
|--------------------|-------------|---------------------------------------|
| Nuxt page+SFC      | Modal-only  | Must be the full page, not a modal    |

**Installation:**
```bash
yarn add @nuxt/image @nuxtjs/i18n sweetalert2
# Core packages already present per package.json
```

---

## Architecture Patterns

### Recommended Project Structure
```
apps/website/
  pages/pagar/gracias.vue           # Receipt page route
  components/ComprobanteWebpay.vue  # Component rendering receipt
  app/types/webpay-receipt.d.ts     # Type for Webpay receipt payload
  assets/webpay-logo.svg            # Webpay branding asset
```

### Pattern 1: Typed Receipt Component
**What:**  
A single Vue SFC (`ComprobanteWebpay.vue`), accepting a typed prop with Webpay receipt data, renders the full compliant receipt with all fields and branding.

**When to use:**  
Immediately after a successful payment, always at `/pagar/gracias`.

**Example:**
```vue
<!-- ComprobanteWebpay.vue -->
<script setup lang="ts">
import type { IWebpayReceipt } from '@/app/types/webpay-receipt'
const props = defineProps<{ receipt: IWebpayReceipt }>()
</script>
<template>
  <section class="comprobante">
    <img src="@/assets/webpay-logo.svg" alt="Webpay" />
    <div class="comprobante__datos">
      <div class="comprobante__campo"><span>Monto</span><span>{{ receipt.amount ?? 'No disponible' }}</span></div>
      <div class="comprobante__campo"><span>Código de autorización</span><span>{{ receipt.authorizationCode ?? 'No disponible' }}</span></div>
      <!-- ... etc. ... -->
    </div>
  </section>
</template>
```
*Enforce all labels in Spanish, use `?? 'No disponible'` for missing fields.*

### Anti-Patterns to Avoid
- **Directly embedding receipt in page template:** Reduces reusability/testability. Always use a component.
- **Hard-coded/mock data:** All fields must come from actual Webpay confirmation API, never faked.
- **Omitting required fields if data missing:** Always show field name + placeholder, not omission.

---

## Don't Hand-Roll

| Problem   | Don't Build           | Use Instead     | Why                                   |
|-----------|----------------------|-----------------|----------------------------------------|
| Data fetching | Custom fetch logic | `useAsyncData`  | Ensures SSR compat & Nuxt hydration    |
| State/store | Ad-hoc objects      | Pinia (if needed) | Project standard, but usually not required |
| Logos/assets | Download Webpay logos at runtime | Static asset in repo | Control, compliance, speed            |

**Key insight:**  
Do not reinvent core Nuxt/Vue idioms or manage loading manually outside `useAsyncData`. Do not construct receipt "by hand" in more than one place.

---

## Common Pitfalls

### Pitfall 1: SSR/SPA Data Mismatch
**What goes wrong:** Data isn't ready in SSR; hydration mismatch.
**Why it happens:** Not using `useAsyncData` or using store incorrectly.
**How to avoid:** Only use `useAsyncData` in page, never `onMounted` or store `fetch` for initial receipt data load.

### Pitfall 2: Label Localization Drift
**What goes wrong:** English/incorrect field labels shown.
**Why it happens:** Not using explicit Spanish strings; copying from API data directly.
**How to avoid:** Hard-code Spanish field names per requirements, unless project i18n mandates otherwise.

### Pitfall 3: Incomplete Receipt Data
**What goes wrong:** Missing/undefined values are omitted, not shown to user.
**Why it happens:** Failing to map all required fields.
**How to avoid:** For every standard field, always show label and either value or "No disponible".

### Pitfall 4: Asset Not Found (Logo)
**What goes wrong:** Receipt renders without Webpay branding.
**Why it happens:** Remote logo not bundled, broken path.
**How to avoid:** Commit SVG/logo locally and reference statically.

---

## Code Examples

### Render Webpay Receipt
```vue
<script setup lang="ts">
import type { IWebpayReceipt } from '@/app/types/webpay-receipt'
const props = defineProps<{ receipt: IWebpayReceipt }>()
</script>

<template>
  <section class="comprobante">
    <img src="@/assets/webpay-logo.svg" alt="Webpay" />
    <div class="comprobante__campo">
      <span>Monto:</span>
      <span>{{ receipt.amount ?? 'No disponible' }}</span>
    </div>
    <!-- Repeat for all required fields... -->
  </section>
</template>
```
*Source: Project convention, Nuxt/Vue SFC docs.*

---

## State of the Art

| Old Approach                       | Current Approach                        | When Changed | Impact                      |
|-------------------------------------|-----------------------------------------|--------------|-----------------------------|
| SSR "hydrate on mount" + `onMounted`| SSR-compatible `useAsyncData`            | v1.6         | Prevents hydration errors   |
| English labels, partial translations| Full Spanish field labels, always shown | v1.25        | 100% compliance, clarity    |

**Deprecated/outdated:**
- Print/email buttons on receipt: Out of scope, not permitted now.
- "Hide fields if missing": Deprecated—always show field name + placeholder.

---

## Open Questions

1. **How exactly does the receipt payload arrive at the page in SSR/CSR?**
   - What we know: Must use data from Webpay confirmation *as received by backend*, delivered to Nuxt page.
   - What's unclear: Whether Strapi returns it via `@nuxtjs/strapi` or SSR-passed prop (not findable in code).
   - Recommendation: Planner to clarify at task-level if additional Strapi field, custom endpoint, or API gateway pass-through is required.

2. **Where is the Webpay logo asset sourced?**
   - What we know: Not present in `assets/`, `public/`, `static/`.
   - What's unclear: If must be checked in, or referenced via CDN.
   - Recommendation: Download official Webpay SVG, commit to assets.

---

## Validation Architecture

### Test Framework
| Property          | Value                     |
|-------------------|--------------------------|
| Framework         | Vitest ^3.0.x + @nuxt/test-utils |
| Config file       | apps/website/vitest.config.ts |
| Quick run command | `yarn test`              |
| Full suite command| `yarn test`              |

### Phase Requirements → Test Map
| Req ID  | Behavior                                                               | Test Type | Automated Command            | File Exists?       |
|---------|------------------------------------------------------------------------|-----------|------------------------------|--------------------|
| N/A     | Receipt shows all fields with real API data, placeholders if missing   | unit+e2e  | `yarn test` (Vitest)         | ❌ (must add)      |
| N/A     | All labels Spanish, never omitted                                      | unit      | `yarn test`                  | ❌ (must add)      |
| N/A     | Receipt visible on success/absent on failure flows                     | e2e       | `yarn test`                  | ❌ (must add)      |

### Sampling Rate
- **Per task commit:** `yarn test`
- **Per wave merge:** `yarn test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `apps/website/components/ComprobanteWebpay.vue` — needs unit test in `tests/utils/comprobante.test.ts`
- [ ] No receipt asset (`assets/webpay-logo.svg`, needs commit)
- [ ] Test for "missing value shows placeholder"
- [ ] Test for "all receipt fields show from API payload"

---

## Sources

### Primary (HIGH confidence)
- [AGENTS.md, Nuxt 4 + Vue 3 composition conventions](apps/website/ and monorepo root)
- [.planning/phases/060-mostrar-comprobante-webpay/060-CONTEXT.md] — direct phase constraints
- [.planning/REQUIREMENTS.md] — acceptance criteria, field list

### Secondary (MEDIUM confidence)
- Nuxt 4 official docs — `useAsyncData`, page structure ([Nuxt docs](https://nuxt.com/docs/guide/directory-structure/pages))
- Transbank Webpay docs (for field names/meaning), November 2025

### Tertiary (LOW confidence)
- None required — core implementation is project-standards driven

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — fully verified, project prescribed
- Architecture: HIGH — project conventions, no deviation warranted
- Pitfalls: HIGH — match prior pattern, warnings clear

**Research date:** 2026-03-09  
**Valid until:** 2026-04-08 (30 days, stable UI standard)
