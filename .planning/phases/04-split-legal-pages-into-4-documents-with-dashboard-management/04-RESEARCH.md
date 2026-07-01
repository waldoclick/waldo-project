# Phase 4 Research — Split legal pages into 4 documents with dashboard management

**Researched:** 2026-07-01
**Confidence:** HIGH (all findings are direct file reads of this repo, not external/library research — this phase is pure "replicate an existing internal pattern")

<user_constraints>
## User Constraints (from 04-CONTEXT.md)

### Locked Decisions
- **D-01:** Replace content of `apps/strapi/seeders/terms.ts` and `apps/strapi/seeders/policies.ts` entirely with content sourced from `docs/terminos-y-condiciones.md` and `docs/politica-de-privacidad.md`.
- **D-02:** Add 2 new seeders — Cookies and Seguridad — sourced from `docs/politica-de-cookies.md` and `docs/politica-de-seguridad.md`, following the exact `populate{X}(strapi)` delete-then-recreate pattern, wired into `apps/strapi/src/index.ts` bootstrap, gated by `APP_RUN_SEEDERS === "true"`.
- **D-03:** MD → seeder mapping: each `##` section heading becomes one row's `title`; body becomes `text` as HTML (`<p>/<strong>/<em>/<ul>` style, not raw markdown); `order` is sequential index starting at 1.
- **D-04:** `/condiciones-de-uso` renamed to `/terminos-y-condiciones-de-uso`, with 301 redirect. 2-commit pattern: `git mv` page file first, update all internal references second.
- **D-05:** New pages: `/politicas-de-cookies` and `/politicas-de-seguridad` (plural "politicas-de-X" convention).
- **D-06:** Visible label changes everywhere from "Condiciones de uso" to "Términos y Condiciones de Uso" — footer, about nav, page title/H1, SEO meta, registration checkbox label. Explicit intentional change.
- **D-07:** Every reference to old URL/label must be located and updated (see reference list below — verified complete by fresh grep during this research).
- **D-08:** NO home-page integration, NO `featured`/`destacado` field on any of the 4 content-types. Explicitly retracted.
- **D-09:** Registration stays at 2 checkboxes (Términos + Privacidad). Cookies/Seguridad NOT added to registration flow.
- **D-10:** Only the Términos checkbox's link/label updates. Privacidad checkbox/link untouched.
- **D-11:** Cookies and Seguridad get admin CRUD under `apps/website/app/pages/dashboard/maintenance/{cookies,security}/` (or equivalent — Claude's Discretion on exact slug), mirroring `terms/`/`policies/` route structure exactly (`index.vue`, `new.vue`, `[id]/index.vue`, `[id]/edit.vue`), each with drag-and-drop reorder via `vuedraggable` + `/reorder` POST endpoint.
- **D-12:** New nav entries in `MenuMaintenance.vue` (and `knownSubRoutes` array) for Cookies and Seguridad. Términos nav entry label updates to match D-06.

### Claude's Discretion
- Exact Strapi API id / route naming for the 2 new content-types (e.g. `cookie-policy` vs `cookie`, `security-policy` vs `security`) — must not collide with the existing `condition` content-type (unrelated: ad item-condition, new/used).
- Whether the 2 new dashboard CRUD sections are literal copies vs. consolidation into shared generic components. Default to faithful replication; only consolidate if clean subtractive follow-up with no regression risk.
- Exact HTML markup translation from MD prose into seeder's inline HTML string style.

### Deferred Ideas (OUT OF SCOPE)
- Home-page "featured" integration for legal docs — explicitly retracted mid-discussion.
- Consolidating the 4x-duplicated dashboard CRUD + drag-and-drop pattern into one generic shared component — not attempted this phase.
</user_constraints>

---

## 1. Term vs Policy pattern — confirmed identical (backend quadruplet)

Read end-to-end. **`term` and `policy` are byte-for-byte identical in shape**, differing only in identifier substitution (`term`→`policy`, `terms`→`policies`, singular/plural). No validation, middleware, or field differences exist between them.

### Schema (`apps/strapi/src/api/term/content-types/term/schema.json` / `.../policy/...`)
```json
{
  "kind": "collectionType",
  "collectionName": "terms",           // "policies" for policy
  "info": {
    "singularName": "term",             // "policy"
    "pluralName": "terms",              // "policies"
    "displayName": "Term"               // "Policy"
  },
  "options": { "draftAndPublish": false },
  "pluginOptions": {},
  "attributes": {
    "title": { "type": "string", "required": true },
    "text": { "type": "text" },
    "order": { "type": "integer" }
  }
}
```
No `documentId` field appears in schema.json — that's automatic/implicit in Strapi v5 documents, not a schema attribute. This confirms the type gap (point 5 below) is purely a frontend TS interface omission, not a backend schema issue.

### Controller (`apps/strapi/src/api/term/controllers/term.ts` / `.../policy/controllers/policy.ts`)
Hand-rolled controller (does NOT use `factories.createCoreController`). Exports a plain object with `find`, `findOne`, `create`, `update`, `delete`, `reorder`. Confirmed identical apart from `"api::term.term"` ↔ `"api::policy.policy"` UID string substitution and variable names (`term`/`terms` ↔ `policy`/`policies`).

Key implementation details to replicate exactly:
- `find`: manual pagination via `strapi.db.query(UID).findMany()` + separate `.count()` call, NOT the core controller's sanitized output — returns raw `{ data, meta: { pagination } }`.
- `findOne`: uses `strapi.documents(UID).findOne({ documentId })` (v5 Document Service API, not `db.query`).
- `create`: uses `strapi.db.query(UID).create({ data })` (NOT `strapi.documents().create()` — inconsistent with `update`/`delete`, but this is the existing pattern to replicate).
- `update`/`delete`: use `strapi.documents(UID).update({ documentId, data })` / `.delete({ documentId })`.
- `reorder`: validates `data` is a non-empty array of `{ documentId: string, order: number }`, then does `Promise.all` of `strapi.documents(UID).update({ documentId, data: { order } })` per entry. Returns `{ data: { count: data.length } }`.

### Routes (2 files per content-type)
- `routes/{term,policy}.ts` — core router: `factories.createCoreRouter("api::term.term")` — standard REST routes (find/findOne/create/update/delete) still registered even though the controller overrides them.
- `routes/01-custom-{term,policy}.ts` — custom route file, numeric prefix `01-` ensures it's registered before/alongside the core router. Registers `POST /terms/reorder` → `handler: "term.reorder"`, `policies: []` (no policy middleware attached — same for `/policies/reorder`).

### Service (`services/{term,policy}.ts`)
Trivial pass-through: `factories.createCoreService("api::term.term")`. No custom logic.

**For the 2 new content-types**, replicate this exact quadruplet under `apps/strapi/src/api/{new-api-id}/{content-types/{new-api-id}/schema.json, controllers/{new-api-id}.ts, routes/{new-api-id}.ts, routes/01-custom-{new-api-id}.ts, services/{new-api-id}.ts}`.

### Naming recommendation (resolves "Claude's Discretion" naming question)
Avoid collision with existing `condition` content-type (ad item-condition, unrelated). Recommended API ids:
- Cookies → singular `cookie-policy`, plural `cookie-policies` (avoids bare `cookie` which could later collide with browser-cookie-related naming; avoids `cookies` which sounds like a plugin/session concept). REST path becomes `/cookie-policies` and `/cookie-policies/reorder`.
- Seguridad → singular `security-policy`, plural `security-policies`. REST path `/security-policies` and `/security-policies/reorder`.

This keeps parity with `policy`/`policies` naming style (both are "policy" content-types) while being unambiguous. Alternative shorter ids (`cookie`, `security`) are viable too but `cookie` risks confusion with cookie-consent/session code already in the codebase (`LightboxCookies.vue`, `$cookies` plugin) — prefer the more explicit compound name.

---

## 2. Dashboard components — TermsDashboard.vue / FormTerm.vue (and Policy equivalents) full extraction

Confirmed **byte-for-byte identical** apart from identifier substitution (`term`/`Term`/`terms`/`Condicion` ↔ `policy`/`Policy`/`policies`/`Politica`). This is copy-paste-replace territory.

### `TermsDashboard.vue` / `PoliciesDashboard.vue` (full file read, ~286-293 lines each)
Structure: `SearchDashboard` + `FilterDefault` header → `vuedraggable` wrapping a `<table>` `tbody` (`item-key="id"`, `handle=".{block}--dashboard__drag"`, `:disabled="!isDraggable"`, `@end="handleReorder"`) → footer with count/saving indicator.

Reusable script-setup pieces to copy verbatim (renaming only the block/type names):
```ts
interface Term {              // rename to e.g. CookiePolicy
  id: number;
  documentId: string;
  title: string;
  text: string;
  order: number | null;
  updatedAt: string;
  createdAt: string;
}

const settingsStore = useSettingsStore();
const section = "terms" as const;   // MUST match new settings.store.ts section key — see finding #2a below

const filters = computed(() => settingsStore.getTermsFilters);  // needs new getter, e.g. getCookiePoliciesFilters

const isDraggable = computed(() => !settingsStore.terms.searchTerm); // settingsStore.cookiePolicies.searchTerm

const fetchTerms = async () => { ... };  // GET "terms" -> GET "cookie-policies" (the new API id, plural)

const handleReorder = async () => {
  ...
  await apiClient("/terms/reorder", { method: "POST", body: { data: updates } });
  // -> "/cookie-policies/reorder"
  ...
};

const sortOptions = [
  { value: "order:asc", label: "Orden asc." },
  { value: "order:desc", label: "Orden desc." },
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "createdAt:asc", label: "Más antiguos" },
  { value: "title:asc", label: "Título A-Z" },
  { value: "title:desc", label: "Título Z-A" },
];

const stripHtml = (html: string) => { /* identical helper, safe to copy verbatim */ };
const truncateText = (text: string, maxLength: number) => { /* identical, copy verbatim */ };

const handleViewTerm = (documentId: string) => router.push(`/dashboard/maintenance/terms/${documentId}`);
const handleEditTerm = (documentId: string) => router.push(`/dashboard/maintenance/terms/${documentId}/edit`);

watch(
  [() => settingsStore.terms.searchTerm, () => settingsStore.terms.sortBy],
  () => { fetchTerms(); },
  { immediate: true },
);
```

**⚠️ CRITICAL FINDING NOT IN CONTEXT.md:** `useSettingsStore()` (in `apps/website/app/stores/settings.store.ts`) has **hardcoded per-section state** — it is NOT a generic key-value store. To add Cookies/Seguridad dashboard filtering+sort, you MUST:
1. Add new fields to `SectionSettings`-typed refs (e.g. `const cookiePolicies = ref<SectionSettings>({ ...defaultSectionSettings, sortBy: "order:asc" })`) — mirroring how `terms`/`policies` are declared with `sortBy: "order:asc"` override.
2. Add to the `SettingsState` interface (add `cookiePolicies: SectionSettings; securityPolicies: SectionSettings;`).
3. Add new computed getters `getCookiePoliciesFilters` / `getSecurityPoliciesFilters` (copy `getTermsFilters`/`getPoliciesFilters` pattern).
4. Add new `case` branches in the `getSectionSettings(section)` switch statement.
5. Add to both the `return { ... }` state list and getters list at the bottom of the store.

This is a **required, non-optional 5-part edit to a shared file** every time a new orderable/searchable dashboard section is added — the CONTEXT.md's "Reusable Assets" section did not flag this file at all. The planner MUST create a task for this file, or the 2 new dashboards will throw `Unknown section` errors at runtime (thrown by `getSectionSettings`'s `default` case) the moment `setSearchTerm`/`setFilters` is called with `"cookiePolicies"` as the section key that doesn't exist yet.

### `FormTerm.vue` / `FormPolicy.vue` (full file read, ~200 lines each)
Identical vee-validate + yup pattern:
```ts
export interface TermData {         // rename to CookiePolicyData
  id?: number;
  documentId?: string;
  title?: string;
  text?: string;
  order?: number | null;
}

const schema = yup.object({
  title: yup.string().required("Título es requerido"),
  text: yup.string().required("Contenido es requerido"),
  order: yup.number().nullable().default(null),
});
```
- `isEditMode` computed from `props.term?.documentId || props.term?.id`.
- On create: fetches last item via `GET "terms"` with `sort: "order:desc", pagination: { pageSize: 1 }`, sets `payload.order = lastOrder + 1` (auto-increment pattern — replicate exactly for the new content-types, swapping the endpoint string).
- On create/update: POSTs/PUTs to `"/terms"` / `` `/terms/${documentId}` ``, uses `useSweetAlert2()` for success/error toasts (Spanish strings), then `router.push` to the dashboard detail/list route.
- Template uses generic `.form`/`.form__group`/`.form__control` BEM classes with a block modifier `form--term` (`form--policy`) on the root wrapper `<div>` — for the 2 new forms use `form--cookie-policy` / `form--security-policy` (or matching chosen block name) per this repo's BEM modifier rules.

### Dashboard route files (`pages/dashboard/maintenance/{terms,policies}/**`)
Read all 4 files for `terms/`. All 4 (`index.vue`, `new.vue`, `[id]/index.vue`, `[id]/edit.vue`) are trivial thin wrappers:
- `index.vue`: `HeroHeaderDashboard` + "Agregar X" NuxtLink button + `<TermsDashboard />`. **Bug to avoid replicating:** `terms/index.vue` has a dead unused import `import TermsDefault from "@/components/TermsDefault.vue";` that is never referenced in the template — do NOT copy this import into the new `index.vue` files (Codacy will flag unused imports, and CLAUDE.md explicitly forbids leaving unused imports).
- `new.vue`: `HeroHeaderDashboard` (no actions slot) + `BoxContent`/`BoxInformation` wrapping `<FormTerm />`.
- `[id]/index.vue` (detail/view): fetches via `useAsyncData` calling `apiClient("terms", { params: { filters: { id: { $eq: Number(id) } } } })` — **note this filters by numeric `id`, not `documentId`, even though the route param is used as `route.params.id` which is actually populated with a `documentId` string from the list-view link** (`handleViewTerm(documentId)` in the Dashboard component pushes `documentId` into the `id` route param slot). This is an **existing latent inconsistency**: the numeric-id filter (`Number(id)`) will silently fail/return nothing when `id` is actually a Strapi v5 documentId (alphanumeric string), since `Number("abc123...")` → `NaN`, and `{ id: { $eq: NaN } }` matches nothing. Flag this as a pre-existing bug in `term`/`policy` — when building the 2 new detail/edit pages, either (a) reproduce the bug faithfully as CONTEXT.md's "replicate exactly" discretion default suggests, or (b) fix it by filtering on `documentId` instead of `Number(id)`, which is more correct and lower-risk (purely additive/corrective, no behavior regression for correctly-functioning cases). Recommend flagging this to the user/planner as a small optional fix-forward, not silently applying it.
- `[id]/edit.vue`: same fetch as detail page + `<FormTerm :term="term" @saved="handleTermSaved" />`.

---

## 3. Seeder pattern and bootstrap wiring — MAJOR STRUCTURAL FINDING

**⚠️ CRITICAL DISCOVERY not fully captured in CONTEXT.md:** `apps/strapi/seeders/policies.ts` (309 lines) currently seeds **53 rows into the single `policy` content-type**, and those 53 rows are **not just Privacidad content** — they are the concatenation of all 4 future documents:

| Row range | `order` values | Content | Belongs to (per this phase) |
|---|---|---|---|
| Rows 1–20 | order 1–20 | Privacidad sections ("¿Qué regula esta política?" … "¿Cómo contactarnos?") | `policy` (stays) |
| Rows 21–33 | order 21–33 (implied, not verified per-row but title content is unambiguous) | Cookies sections ("¿Qué regula la política de cookies?" … "Contacto — Cookies") | NEW `cookie-policy` content-type |
| Rows 34–53 | order 34–53 | Seguridad sections ("¿Qué regula la política de seguridad?" … "Contacto — Seguridad") | NEW `security-policy` content-type |

`terms.ts` (169 lines) is clean — it seeds only 27 rows, all Términos content, order 1–27, into `term`. No split needed there beyond D-01's content replacement.

**Planning implication:** This phase is not just "add 2 new seeders" — it also requires **splitting `policies.ts` apart**, removing the Cookies and Seguridad rows from `policiesData` (leaving only the ~20 Privacidad rows, replaced per D-01 with `docs/politica-de-privacidad.md` content), and creating 2 brand-new seeder files for Cookies/Seguridad. If this isn't done, the currently-live `policy` collection contains legally mixed content (Cookies/Seguridad text mislabeled as "Política de Privacidad" sections) that has nothing to do with the D-05 pages the user wants (`/politicas-de-cookies`, `/politicas-de-seguridad`) — those new pages will read from the NEW content-types, so simply leaving `policies.ts` as-is means the OLD mixed content keeps polluting the `policy`/Privacidad content-type and its dashboard/page, duplicating Cookies/Seguridad text in the wrong place.

### Seeder function pattern (exact, from `terms.ts`)
```ts
import type { Core } from "@strapi/strapi";

const termsData = [
  { order: 1, title: "...", text: "<p>...</p><p><strong>...</strong>...</p>" },
  // ...
];

const populateTerms = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando Términos y Condiciones...");

  const existing = await strapi.db.query("api::term.term").findMany({ where: {} });

  if (existing.length > 0) {
    await strapi.db.query("api::term.term").deleteMany({ where: {} });
    console.log(`Eliminados ${existing.length} registros anteriores de Términos y Condiciones`);
  }

  for (const term of termsData) {
    try {
      await strapi.db.query("api::term.term").create({
        data: { title: term.title, text: term.text, order: term.order },
      });
      console.log(`Término creado: ${term.title}`);
    } catch (termError) {
      console.error(`Error creando Término ${term.title}:`, termError.message);
    }
  }

  console.log(`Términos y Condiciones poblados: ${termsData.length} secciones`);
};

export default populateTerms;
```
For the 2 new seeders, follow this exact shape: file `apps/strapi/seeders/cookie-policies.ts` exporting default `populateCookiePolicies`, and `apps/strapi/seeders/security-policies.ts` exporting default `populateSecurityPolicies`, querying/creating against `"api::cookie-policy.cookie-policy"` / `"api::security-policy.security-policy"` UIDs (matching whichever API ids are finalized).

### Bootstrap wiring (`apps/strapi/src/index.ts`)
```ts
import populatePolicies from "../seeders/policies";
import populateTerms from "../seeders/terms";
// + new imports:
// import populateCookiePolicies from "../seeders/cookie-policies";
// import populateSecurityPolicies from "../seeders/security-policies";

async bootstrap({ strapi }) {
  const runSeeders = process.env.APP_RUN_SEEDERS === "true";
  if (!runSeeders) { ... } else {
    try {
      await populateCategories(strapi);
      await populateConditions(strapi);
      await populateFaqs(strapi);
      await populatePacks(strapi);
      await populateRegions(strapi);
      await populateAdDraftMigration(strapi);
      await populatePolicies(strapi);
      await populateTerms(strapi);
      // + await populateCookiePolicies(strapi);
      // + await populateSecurityPolicies(strapi);
      console.log("✅ Seeders completados exitosamente");
    } catch (error) { ... }
  }
  ...
}
```
Simple additive edit — add 2 import lines + 2 `await` calls inside the existing `try` block, order doesn't matter (each seeder is independent, delete-then-recreate against its own content-type).

---

## 4. Strapi v5 content-type/route/controller naming conventions — confirmed, no gotchas beyond naming choice

Confirmed via schema.json/UID inspection: content-type UID format is `api::{api-id}.{api-id}` (singular form used twice), e.g. `api::term.term`, `api::policy.policy`. For the new types this becomes `api::cookie-policy.cookie-policy` and `api::security-policy.security-policy`.

Folder path: `apps/strapi/src/api/{api-id}/` where `{api-id}` is the **singular, kebab-case** form (matches `info.singularName` in schema.json). So:
- `apps/strapi/src/api/cookie-policy/content-types/cookie-policy/schema.json`
- `apps/strapi/src/api/cookie-policy/controllers/cookie-policy.ts`
- `apps/strapi/src/api/cookie-policy/routes/cookie-policy.ts`
- `apps/strapi/src/api/cookie-policy/routes/01-custom-cookie-policy.ts`
- `apps/strapi/src/api/cookie-policy/services/cookie-policy.ts`

(mirror for `security-policy`).

**CLAUDE.md's "custom controllers in plugin extensions not supported in v5" rule does NOT apply here** — that rule is specifically about `src/extensions/{plugin-name}/strapi-server.ts` controller overrides for third-party plugins (e.g. `users-permissions`), which Strapi v5 genuinely restricts. `term`/`policy`/the-2-new-types are **regular API content-types** under `src/api/`, where hand-rolled custom controllers (replacing `factories.createCoreController`) are fully supported and already in active use (confirmed: `term.ts`/`policy.ts` controllers are hand-written objects, not `createCoreController` wrappers). No gotcha, no restriction — proceed as CONTEXT.md's canonical refs already assume.

`collectionName` in schema.json (e.g. `"terms"`, `"policies"`) maps to the actual DB table name — for the new types use `"cookie_policies"` and `"security_policies"` (snake_case, Strapi convention for collectionName when the plural has multiple words — verify this against `pluralName` casing: `pluralName` should be `cookie-policies`/`security-policies` kebab-case matching REST path convention already seen in `term`/`policy` (`"pluralName": "policies"` is a single word so this doesn't fully disambiguate hyphenation-in-plural, but Strapi's own generator uses kebab-case pluralName consistently across content-types — no reason to deviate).

---

## 5. Frontend types — `term.d.ts` / `policy.d.ts` documentId gap

Both files (full read):
```ts
export interface Term {
  id: number;
  title: string;
  text: string;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface TermResponse {
  data: Term[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}
```
**Confirmed: no `documentId` field**, despite `TermsDashboard.vue` accessing `term.documentId` directly (it declares its own local `interface Term { ...; documentId: string; ... }` inline in the component script, which is a *separate, shadow* interface — NOT imported from `@/types/term`). So the gap is real but harmless today only because the dashboard component defines its own richer local interface rather than importing the shared one. `FormTerm.vue`'s `TermData` interface also independently declares `documentId?: string`.

**For the 2 new content-types**, create `apps/website/app/types/cookie-policy.d.ts` and `security-policy.d.ts` following the exact same shape as `term.d.ts`/`policy.d.ts` but WITH `documentId: string` included from day one:
```ts
export interface CookiePolicy {
  id: number;
  documentId: string;
  title: string;
  text: string;
  order: number | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CookiePolicyResponse {
  data: CookiePolicy[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}
```
(mirror for `SecurityPolicy`/`SecurityPolicyResponse`).

**Additive fix recommendation (per CONTEXT.md "Known Constraints"):** also add `documentId: string;` to the existing `term.d.ts`/`policy.d.ts` interfaces in the same phase — this is purely additive (widening an interface with a new required field that's already always present in the real API response; no consumer breaks since nothing currently destructures `.documentId` off the *typed* `Term`/`Policy`, only off ad-hoc local interfaces). Low risk, consistent with D-code's stated intent.

---

## 6. Markdown → seeder mapping tables (all 4 documents)

Below, each `##` heading becomes one seeder row. `order` = sequential position starting at 1. `title` = heading text stripped of the leading `## N. ` numbering prefix (existing seeders' titles do NOT include the numeric prefix — e.g. MD heading "## 1. Algunas palabras que vas a ver seguido" but existing precedent style uses short question/topic titles like "Conceptos clave", "¿Qué es Waldo.click®?" — so translate MD numbered-prose headings into the same short-title style already established, dropping the number). `text` = body content converted to inline HTML (`<p>`, `<strong>`, `<em>`, `<ul><li>`) matching `terms.ts`/`policies.ts` style — bullet lists in MD (`- item`) become `<ul><li>item</li></ul>`, bold (`**text**`) becomes `<strong>text</strong>`.

### 6a. Términos y Condiciones de Uso (`docs/terminos-y-condiciones.md`) → `term` content-type

| order | MD heading | Seeder title | Notes |
|---|---|---|---|
| 1 | 1. Algunas palabras que vas a ver seguido | Conceptos clave | Bullet list → `<ul><li><strong>Term</strong>: definition</li></ul>` |
| 2 | 2. ¿Qué hace exactamente Waldo.click? | ¿Qué es Waldo.click®? | Includes "esto significa que nosotros no" bullet list |
| 3 | 3. Al usar la plataforma, aceptas estas reglas | Aceptación de estos términos | Single paragraph |
| 4 | 4. ¿Quién puede usar Waldo.click? | ¿Quién puede usar la plataforma? | Bullet list of 2 conditions + closing paragraph |
| 5 | 5. Tu cuenta | Registro de cuenta | Bullet list of 4 actions Waldo can take |
| 6 | 6. Cuida tu cuenta | Seguridad de tu cuenta | Single paragraph |
| 7 | 7. Si publicas algo, estás declarando que... | Tus publicaciones | Bullet list of 4 declarations |
| 8 | 8. Sobre la información de los productos | Información de los productos | 2 paragraphs |
| 9 | 9. Podemos revisar los anuncios | Revisión de anuncios | Single paragraph |
| 10 | 10. Lo que no se puede publicar | Contenido prohibido | Bullet list of 8 prohibited items |
| 11 | 11. Servicios pagados | Servicios de pago | Single paragraph |
| 12 | 12. Cómo funcionan los pagos | Facturación y pagos | Single paragraph |
| 13 | 13. Reembolsos | Reembolsos | Single paragraph |
| 14 | 14. Propiedad intelectual | Propiedad intelectual | Single paragraph |
| 15 | 15. Sobre el contenido que tú subes | Licencia sobre tu contenido | Bullet list of 4 license terms |
| 16 | 16. Tus datos personales | Protección de datos personales | Contains markdown link `[Política de Privacidad](politica-de-privacidad.md)` → convert to `<a href="/politicas-de-privacidad">Política de Privacidad</a>` (relative link resolves to live site route, not the .md filename) |
| 17 | 17. Ciberseguridad | Ciberseguridad | Single paragraph |
| 18 | 18. Si ocurre un incidente de seguridad | Incidentes de seguridad | Single paragraph |
| 19 | 19. Disponibilidad del servicio | Disponibilidad del servicio | Single paragraph |
| 20 | 20. Hasta dónde llega nuestra responsabilidad | Limitación de responsabilidad | Bullet list of 5 exclusions |
| 21 | 21. Enlaces a otros sitios | Sitios y servicios de terceros | Single paragraph |
| 22 | 22. Suspensión o cierre de cuentas | Suspensión o cancelación de cuenta | Single paragraph |
| 23 | 23. Fuerza mayor | Fuerza mayor | Single paragraph |
| 24 | 24. Cambios a este documento | Cambios a estos términos | Single paragraph |
| 25 | 25. Si una parte de este documento deja de ser válida | Validez parcial | Single paragraph |
| 26 | 26. Ley aplicable | Ley chilena y jurisdicción | Single paragraph, `<strong>República de Chile</strong>` |
| 27 | 27. ¿Dudas? Escríbenos | ¿Cómo contactarnos? | Contact block: `<p><strong>Waldo.click®</strong><br>contacto@waldo.click<br>Santiago, Chile</p>` |

(27 rows total — matches existing `termsData.length` of 27, confirming 1:1 section correspondence with the currently-seeded structure, just re-worded per the humanized MD.)

### 6b. Política de Privacidad (`docs/politica-de-privacidad.md`) → `policy` content-type

| order | MD heading | Seeder title | Notes |
|---|---|---|---|
| 1 | 1. ¿De qué se trata este documento? | ¿Qué regula esta política? | Single paragraph |
| 2 | 2. ¿Quién es responsable de tus datos? | ¿Quién gestiona tus datos? | Contact block + DPD mention |
| 3 | 3. ¿A quién aplica esta política? | ¿A quién aplica esta política? | Single paragraph |
| 4 | 4. Algunos conceptos clave | Conceptos clave | Bullet list of 6 definitions |
| 5 | 5. ¿Qué datos podemos recopilar? | ¿Qué datos recopilamos? | Multiple `<p><strong>Category</strong>: items</p>` blocks (identificación, contacto, cuenta, comerciales, técnicos, sensibles) |
| 6 | 6. ¿Para qué usamos tus datos? | ¿Para qué usamos tus datos? | Bullet list of 6 purposes with `<strong>` lead-ins |
| 7 | 7. ¿Con qué derecho tratamos tus datos? | ¿Con qué fundamento legal tratamos tus datos? | Bullet list of 6 legal bases |
| 8 | 8. Datos obligatorios vs. voluntarios | Datos obligatorios y opcionales | Single paragraph |
| 9 | 9. Sobre menores de edad | Menores de edad | Single paragraph |
| 10 | 10. ¿Con quién compartimos tus datos? | ¿Con quién compartimos tus datos? | Bullet list of 3 categories |
| 11 | 11. ¿Tus datos salen de Chile? | Transferencias fuera de Chile | Single paragraph |
| 12 | 12. ¿Cuánto tiempo guardamos tus datos? | ¿Cuánto tiempo guardamos tus datos? | Single paragraph |
| 13 | 13. Tus derechos como titular de tus datos | Tus derechos sobre tus datos | Bullet list of 7 rights (acceso, rectificación, supresión, oposición, portabilidad, bloqueo, no-ser-evaluado-solo-por-algoritmo) |
| 14 | 14. ¿Cómo ejerces estos derechos? | ¿Cómo ejercer tus derechos? | 2 paragraphs |
| 15 | 15. Decisiones automatizadas | Decisiones automatizadas | Single paragraph |
| 16 | 16. Cómo protegemos tus datos | ¿Cómo protegemos tu información? | Single paragraph |
| 17 | 17. Si hay una brecha de seguridad | Incidentes de seguridad | Single paragraph, mentions Ley 21.719 art. 26 |
| 18 | 18. Cookies | Uso de cookies | Contains markdown link `[Política de Cookies](politica-de-cookies.md)` → convert to `<a href="/politicas-de-cookies">Política de Cookies</a>` |
| 19 | 19. Cambios a esta política | Cambios a esta política | Single paragraph |
| 20 | 20. Contacto | ¿Cómo contactarnos? | Contact block + APDP complaint mention |

(20 rows — matches the Privacidad-only slice of the current mixed `policiesData` array, order 1–20.)

### 6c. Política de Cookies (`docs/politica-de-cookies.md`) → NEW `cookie-policy` content-type

| order | MD heading | Seeder title | Notes |
|---|---|---|---|
| 1 | 1. ¿Qué es una cookie? | ¿Qué regula la política de cookies? | Single paragraph — precedent title from the existing (mixed) `policiesData` array for this section |
| 2 | (intro/1, split) | ¿Qué son las cookies? | Existing precedent has this as a distinct row from the "regula" row above — MD source only has one "¿Qué es una cookie?" heading; when writing the new seeder, either keep as 1 row or split intro vs. definition to match the existing 14-row precedent (recommend keeping 1:1 with MD's 13 `##` headings — see corrected total below; do not force-match the old mixed array's row count, since D-01/D-02 call for content sourced from the MD, not preserving the old array verbatim) |
| 2 | 2. No solo cookies | Tecnologías similares | Single paragraph |
| 3 | 3. Los tipos de cookies que usamos | Tipos de cookies que usamos | 5 `<p><strong>Category</strong><br>description</p>` blocks (necesarias, funcionales, analíticas, publicitarias, rendimiento) |
| 4 | 4. ¿Para qué usamos todo esto? | ¿Para qué usamos las cookies? | Bullet list of 4 purposes |
| 5 | 5. Cookies de terceros | Cookies de terceros | Bullet list of 5 providers (Google, Meta, LinkedIn, Microsoft, Cloudflare) |
| 6 | 6. Tu consentimiento importa | ¿Cómo funciona el consentimiento? | Bullet list of 5 consent qualities (libre, informada, específica, previa, afirmativa) |
| 7 | 7. Puedes cambiar de opinión cuando quieras | ¿Cómo retirar el consentimiento? | Single paragraph |
| 8 | 8. Cómo gestionar las cookies desde tu navegador | Administración desde el navegador | Single paragraph |
| 9 | 9. Transferencias fuera de Chile | Transferencias internacionales | Single paragraph |
| 10 | 10. ¿Cuánto tiempo duran? | ¿Cuánto tiempo duran las cookies? | Bullet list of 2 (sesión, persistentes) |
| 11 | 11. Tus derechos | Tus derechos sobre las cookies | Single paragraph |
| 12 | 12. Actualizaciones | Cambios a la política de cookies | Single paragraph |
| 13 | 13. Contacto | Contacto — Cookies | Contact block |

**Row-count correction:** the MD file (`docs/politica-de-cookies.md`) has exactly **13 `##` headings** (verified by direct read), so the new seeder built strictly from the MD per D-02/D-03 will have **13 rows**, order 1–13. The OLD mixed `policiesData` array (still live in `apps/strapi/seeders/policies.ts` today, to be removed from that file per this phase) has **14 Cookies-labeled rows at order 21–34** (one extra row: it splits "¿Qué es una cookie?" into two title variants: "¿Qué regula la política de cookies?" at order 21 and "¿Qué son las cookies?" at order 22 — an intro/definition split that doesn't map 1:1 to the MD's single combined heading). **Do not try to force 14 rows out of 13 MD headings** — follow D-03 literally (one row per `##` heading in the MD) and produce 13 rows, OR add an explicit intro row (order 1, title "¿Qué regula la política de cookies?", short intro text drawn from the MD's un-headed lead paragraph before "## 1") to preserve the existing 14-row precedent. Flag this exact ambiguity to the planner/user rather than silently picking one.

### 6d. Política de Seguridad (`docs/politica-de-seguridad.md`) → NEW `security-policy` content-type

| order | MD heading | Seeder title | Notes |
|---|---|---|---|
| 1 | 1. Qué buscamos proteger | ¿Qué regula la política de seguridad? | Bullet list of 4 protected assets |
| 2 | 2. A quién aplica | ¿A quién aplica esta política? | Single paragraph |
| 3 | 3. Quién está a cargo | ¿Quién es responsable de la seguridad? | CISO/contact mention |
| 4 | 4. Los principios que seguimos | Principios de seguridad | Bullet list of 5 principles (confidencialidad, integridad, disponibilidad, trazabilidad, resiliencia) |
| 5 | 5. Medidas de seguridad que aplicamos | Medidas de seguridad implementadas | 2 paragraphs |
| 6 | 6. Cómo gestionamos los accesos | Gestión de accesos | Single paragraph |
| 7 | 7. Lo que esperamos de los usuarios | Tus obligaciones de seguridad | Bullet list of 4 |
| 8 | 8. Lo que está prohibido | Actividades prohibidas | Bullet list of 6 |
| 9 | 9. Monitoreo | Monitoreo de seguridad | Single paragraph |
| 10 | 10. Cómo clasificamos los incidentes | Clasificación de incidentes | 3 `<strong>Category</strong>: description` bullets |
| 11 | 11. Qué hacemos frente a un incidente | ¿Qué hacemos ante un incidente? | Single paragraph |
| 12 | 12. A quién notificamos y en qué plazo | Notificación de incidentes | Bullet list of 3 (ANCI, APDP, titulares) with specific hour/day deadlines |
| 13 | 13. Coordinación con el CSIRT | Coordinación con CSIRT | Single paragraph |
| 14 | 14. Proveedores tecnológicos | Proveedores tecnológicos | Single paragraph |
| 15 | 15. Continuidad operacional | Continuidad operacional | Single paragraph |
| 16 | 16. Los límites de lo que podemos garantizar | Limitación de responsabilidad en seguridad | Single paragraph |
| 17 | 17. Marco legal que seguimos | Cumplimiento normativo | Single paragraph |
| 18 | 18. Actualizaciones | Cambios a la política de seguridad | Single paragraph |
| 19 | 19. Contacto | Contacto — Seguridad | Contact block with CISO email |

(19 rows — matches the Seguridad rows currently embedded in `policiesData`, order 34–52... actual count: title list showed order up to 53, meaning 19 rows total to match; verify final count against MD `##` heading count = 19, consistent.)

**Total new/changed rows:** Términos 27 (reworded) + Privacidad 20 (reworded) + Cookies 13 (new) + Seguridad 19 (new) = 79 rows across 4 content-types.

---

## 7. Reference points requiring updates — exact current content

Fresh grep for `condiciones-de-uso` across `apps/website` and `apps/strapi` (excluding build output dirs `.output`/`.vercel`) returned **exactly 7 files** — confirms CONTEXT.md's list is complete, EXCEPT `sitemap.vue` does not currently reference `/condiciones-de-uso` at all (see below), so that's a "add new entry" task, not an "update existing reference" task.

### `apps/website/app/components/FormRegister.vue` (around line 183)
```vue
      <div class="form-group">
        <div class="form-check">
          <Field
            id="accepted_usage_terms"
            v-model="form.accepted_usage_terms"
            name="accepted_usage_terms"
            type="checkbox"
            class="form-check-input"
            :value="true"
            :unchecked-value="false"
          />
          <label class="form-check-label" for="accepted_usage_terms">
            Acepto las
            <NuxtLink to="/condiciones-de-uso" target="_blank"
              >condiciones de uso</NuxtLink
            >
          </label>
        </div>
        <ErrorMessage name="accepted_usage_terms" />
      </div>
```
Change: `to="/condiciones-de-uso"` → `to="/terminos-y-condiciones-de-uso"`; label text `condiciones de uso` → `Términos y Condiciones de Uso` (per D-06). The neighboring Privacidad block (`to="/politicas-de-privacidad"`, label "políticas de privacidad") is untouched per D-10.

### `apps/website/app/components/FormTerms.vue` (around line 42)
```vue
    <div v-if="needsUsageTerms" class="form-group">
      <div class="form-check">
        <input
          id="terms-usage-accepted"
          v-model="usageTermsAccepted"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="terms-usage-accepted">
          Acepto las
          <NuxtLink to="/condiciones-de-uso" target="_blank"
            >condiciones de uso</NuxtLink
          >
        </label>
      </div>
    </div>
```
Same change pattern as FormRegister.vue. This is the re-acceptance lightbox form (`LightboxTerms.vue` presumably wraps it — not read in depth, out of scope since only the link/label changes).

### `apps/website/app/components/LightboxCookies.vue` (around line 29)
```vue
        <nuxt-link
          to="/politicas-de-privacidad"
          class="btn btn--secondary btn--block"
          title="Más información"
        >
          Más información
        </nuxt-link>
```
Per D-07: this currently points to Privacidad; **change target to `/politicas-de-cookies`** (the new dedicated Cookies page) since a cookie-specific policy now exists and is more relevant to a cookie-consent banner's "more information" link. Note the banner's body text also says "consulta nuestra Política de Privacidad" (line ~20) — this is prose text, not a link; CONTEXT.md doesn't explicitly call for updating this sentence, but it would be inconsistent to change the link target without updating the sentence that names Privacidad specifically when the link now goes to Cookies. Flag this as a judgment call for the planner — recommend updating the sentence to reference "nuestra Política de Cookies" for consistency, since the button below it will point there.

### `apps/website/app/components/MenuAbout.vue` (around line 28)
```vue
      <li class="menu--about__item">
        <nuxt-link
          to="/condiciones-de-uso"
          class="menu--about__link"
          aria-label="Leer condiciones de uso"
          title="Leer condiciones de uso"
        >
          <IconScrollText class="menu--about__icon" aria-hidden="true" />
          <span>Condiciones de uso</span>
        </nuxt-link>
      </li>
```
Change `to`, `aria-label`, `title`, and visible `<span>` text all together — update all 4 occurrences of the old label/URL in this one block. New nav entries for Cookies/Seguridad are NOT required here per D-07's list (MenuAbout only needs the rename); the CONTEXT.md doesn't ask for new About-nav links for Cookies/Seguridad, only the existing Términos entry's label/URL update. (No explicit decision found either requiring or forbidding new About nav links for the 2 new public pages — flag as a gap: the user should be asked, or Claude's Discretion applied conservatively to NOT add new nav entries since D-07's list only mentions renaming the existing one.)

### `apps/website/app/components/MenuFooter.vue` (around line 24)
```vue
    <li>
      <NuxtLink to="/condiciones-de-uso">
        <span>Condiciones de uso</span>
      </NuxtLink>
    </li>
```
Same rename pattern — `to` + visible text. Same gap noted above regarding whether footer should also list the 2 new pages (Cookies/Seguridad) — CONTEXT.md's explicit reference list only calls for the rename, not additions. Recommend treating "add nav links for new pages" as out of scope unless the planner/user decides otherwise, since D-07 enumerates specific line-level changes and does not mention adding new footer/about entries for Cookies/Seguridad.

### `apps/website/app/shared/constants.ts` (around line 45–64)
```ts
export const RESERVED_USERNAMES = [
  "login",
  "registro",
  "blog",
  "anuncios",
  "anunciar",
  "contacto",
  "cuenta",
  "pagar",
  "pro",
  "packs",
  "sitemap",
  "onboarding",
  "recuperar-contrasena",
  "restablecer-contrasena",
  "preguntas-frecuentes",
  "condiciones-de-uso",
  "politicas-de-privacidad",
  "dev",
] as const;
```
Per D-07: keep `"condiciones-de-uso"` (protects the redirect from being claimed as a username) and ADD `"terminos-y-condiciones-de-uso"`, `"politicas-de-cookies"`, `"politicas-de-seguridad"`.

### `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` (around line 14–33)
```ts
const RESERVED_USERNAMES = new Set([
  "login",
  "registro",
  "blog",
  "anuncios",
  "anunciar",
  "contacto",
  "cuenta",
  "pagar",
  "pro",
  "packs",
  "sitemap",
  "onboarding",
  "recuperar-contrasena",
  "restablecer-contrasena",
  "preguntas-frecuentes",
  "condiciones-de-uso",
  "politicas-de-privacidad",
  "dev",
]);
```
Identical list, must be updated in lockstep — same 4 additions/retentions as above. Used at line ~184: `if (RESERVED_USERNAMES.has(username.toLowerCase())) { return ctx.badRequest("Username not available"); }`.

### `apps/website/app/pages/sitemap.vue`
**Correction to CONTEXT.md:** this file currently does NOT reference `/condiciones-de-uso` at all — the `sitemapBlocks` array's "Páginas Principales" list only includes `/`, `/anuncios`, `/contacto`, `/login`, `/packs`, `/politicas-de-privacidad`, `/preguntas-frecuentes`, `/recuperar-contrasena`, `/registro`, `/sitemap`. There is no existing Términos entry to update. Task here is purely additive: add 3 new entries (Términos renamed URL, Cookies, Seguridad) to the `sitemapBlocks[0].items` array, following the existing shape:
```ts
{ to: "/terminos-y-condiciones-de-uso", label: "Términos y Condiciones de Uso", icon: IconScrollText },
{ to: "/politicas-de-cookies", label: "Política de Cookies", icon: IconShield },
{ to: "/politicas-de-seguridad", label: "Política de Seguridad", icon: IconShield },
```
(`IconScrollText` is already used in `MenuAbout.vue`, not yet imported in `sitemap.vue` — will need adding to the `lucide-vue-next` import block; `IconShield` is already imported in `sitemap.vue`.)

---

## 8. Strapi public permissions — confirmed manual-only, no code path exists

Searched `apps/strapi/src` for `up_permissions`, `strapi.query('plugin::users-permissions...`, and any permission-bootstrap code: **zero matches**. No seeder, migration, or bootstrap script anywhere in this repo touches the `up_permissions` table or the `users-permissions` plugin's permission model programmatically — not even for `term`, `policy`, or `faq` (all of which are already public-readable today, meaning their permissions were granted purely through manual admin-panel clicks at some point in the past, with no corresponding code artifact in the repo).

**Confirmed: this must be a manual step.** For the 2 new content-types, after Strapi restarts and picks up the new content-type schemas, someone with Strapi admin access must go to:
`Settings → Users & Permissions plugin → Roles → Public → Cookie-policy / Security-policy → check "find" and "findOne"`

This is the exact same manual step that was presumably done for `term`/`policy`/`faq` — there is no way to script or seed this without either (a) writing new bootstrap code that directly manipulates `plugin::users-permissions.permission` records (a new pattern not currently used anywhere in this codebase, and arguably out of scope for a "replicate the existing pattern" phase), or (b) manual admin UI action. Recommend the plan explicitly list this as a manual post-deploy checklist item (one bullet per environment: local/staging/production), not a code task.

---

## Architecture Patterns Summary (for planner task-writing)

1. **Backend quadruplet per new content-type** (schema/controller/routes×2/service) — pure copy of `term`'s files with identifier substitution.
2. **Seeder split-and-add**: edit `policies.ts` to remove Cookies/Seguridad rows (keep only ~20 Privacidad rows, reworded from MD), edit `terms.ts` content (reworded from MD, same 27-row count), create 2 new seeder files, wire into `index.ts` bootstrap (4 lines: 2 imports + 2 awaits).
3. **Settings store extension is mandatory, not optional** — `settings.store.ts` needs 2 new `SectionSettings` refs, 2 new interface fields, 2 new getters, 2 new switch-case branches, and inclusion in both return blocks. Without this, the new dashboards will crash on `Unknown section` errors.
4. **Frontend types**: 2 new `.d.ts` files WITH `documentId` from day one; optionally also patch `term.d.ts`/`policy.d.ts` additively.
5. **Public pages**: 2 new page files (`politicas-de-cookies.vue`, `politicas-de-seguridad.vue`) copying `politicas-de-privacidad.vue` exactly (SEO block, `definePageMeta({layout: "about"})`, `useAsyncData` + store pattern) + 1 renamed page (`condiciones-de-uso.vue` → `terminos-y-condiciones-de-uso.vue` via `git mv`, then content/label edits).
6. **Display components**: 2 new `XDefault.vue` components copying `PoliciesDefault.vue`/`TermsDefault.vue` (wraps `AccordionDefault`), needing corresponding new SCSS partials (`_cookie-policies.scss`/`_security-policies.scss` following `_terms.scss`/`_policies.scss` verbatim) registered via `@use` in `app.scss`.
7. **Stores**: 2 new Pinia stores copying `terms.store.ts`/`policies.store.ts` exactly (GET with `sort:["order:asc"]`, `pageSize:50`).
8. **Dashboard**: 2 new `XDashboard.vue` + `FormX.vue` components + 4 route files each (`index/new/[id]/index/[id]/edit`), following the exact patterns extracted in section 2 above, PLUS the mandatory `settings.store.ts` edit from point 3, PLUS `MenuMaintenance.vue` nav entry + `knownSubRoutes` array addition (2 new `<li>` blocks + array pushes).
9. **URL rename**: `git mv` page file, add `routeRules` 301 redirect entry in `nuxt.config.ts` (`"/condiciones-de-uso": { redirect: { to: "/terminos-y-condiciones-de-uso", statusCode: 301 } }` — note existing precedent redirects are all under `/dashboard/*`; this is the first PUBLIC-facing redirect, still uses the identical `routeRules` mechanism), update all 7 reference-point files (section 7 above), update `RESERVED_USERNAMES` in both apps, add sitemap entries.
10. **Manual step**: grant Public find/findOne permissions in Strapi admin for the 2 new content-types (not scriptable, confirmed no code path exists in this repo).

## Common Pitfalls (for verification steps)

- Forgetting the `settings.store.ts` 5-part edit → runtime `Unknown section` error when opening new dashboard pages.
- Copying the dead `TermsDefault` import into new `index.vue` dashboard list pages (Codacy unused-import violation).
- Leaving `policies.ts` un-split → duplicate/mislabeled Cookies+Seguridad content still lives under the `policy`/Privacidad content-type after this phase ships.
- Using `Number(id)` instead of `documentId` string filtering in new `[id]/index.vue`/`[id]/edit.vue` pages — pre-existing bug in `term`/`policy`, worth fixing forward rather than replicating (recommend flagging to user).
- Forgetting to add `documentId` to new `.d.ts` files (must be included from creation, per D-code known-constraints).
- Missing the manual Strapi admin permission grant — new content-types will 403/return empty on the public pages until granted.
- Sitemap.vue needs NEW entries added (not "updated" — there was no prior Términos entry), and needs `IconScrollText` added to its lucide-vue-next import list.
- LightboxCookies.vue's body prose text names "Política de Privacidad" while its button will point to the new Cookies page — recommend updating the prose for consistency (judgment call, not an explicit decision).
- MenuAbout.vue/MenuFooter.vue: CONTEXT.md's reference list only calls for renaming the existing Términos entry — adding new nav links for Cookies/Seguridad pages is NOT explicitly decided; treat as out of scope unless planner/user opts in.

