# Phase 4: Split legal pages into 4 documents with dashboard management - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Split the single-seeming legal-docs surface into 4 fully independent legal documents: Términos y Condiciones de Uso, Política de Cookies, Política de Privacidad, Política de Seguridad.

Critical finding from codebase scout: **this is half-built already.** Two of the four documents exist end-to-end today — `term` (public page `/condiciones-de-uso`) and `policy` (public page `/politicas-de-privacidad`) — each with its own Strapi collection-type (title/text/order rows, custom controller + `/reorder` route), a Pinia store, a public accordion page, and full dashboard CRUD with drag-and-drop reorder (`vuedraggable`) under `apps/website/app/pages/dashboard/maintenance/{terms,policies}/`.

This phase delivers:
1. Two new Strapi content-types (Cookies, Seguridad) replicating the `term`/`policy` pattern exactly (schema, controller, routes, service, `/reorder` endpoint).
2. Two new public pages (`/politicas-de-cookies`, `/politicas-de-seguridad`) replicating `condiciones-de-uso.vue`/`politicas-de-privacidad.vue`.
3. Two new dashboard admin sections (Cookies, Seguridad) replicating `TermsDashboard.vue`/`PoliciesDashboard.vue` + `FormTerm.vue`/`FormPolicy.vue`, with drag-and-drop, registered in `MenuMaintenance.vue`.
4. Rename `/condiciones-de-uso` → `/terminos-y-condiciones-de-uso` (URL + visible label "Términos y Condiciones de Uso"), with a 301 redirect, and every reference to the old URL/label updated across both apps.
5. A seeder for all 4 documents sourced from the humanized `docs/*.md` files written this session — replacing the current (differently-worded) seeded content for Términos and Privacidad, and adding new seeded content for Cookies and Seguridad.

**Explicitly NOT in scope** (retracted by user during discussion): no "featured/destacado" field on any of the 4 content-types, no home-page section for any legal doc — home page only surfaces FAQs, that pattern doesn't extend here. Cookies and Seguridad do not join the registration acceptance checkbox flow — that stays at 2 checkboxes (Términos + Privacidad).

Note: `apps/dashboard` does not exist as a separate app (contradicts the monorepo description in CLAUDE.md) — all admin/maintenance UI lives inside `apps/website/app/pages/dashboard/**`. "Dashboard" in this context means that Nuxt route tree, not a separate application.

</domain>

<decisions>
## Implementation Decisions

### Seeder & content source
- **D-01:** Replace the content of `apps/strapi/seeders/terms.ts` and `apps/strapi/seeders/policies.ts` entirely with content sourced from `docs/terminos-y-condiciones.md` and `docs/politica-de-privacidad.md` — single source of truth, consistent humanized tone across all 4 documents (the currently-seeded wording predates and diverges from today's humanized rewrite).
- **D-02:** Add 2 new seeders — Cookies and Seguridad — sourced from `docs/politica-de-cookies.md` and `docs/politica-de-seguridad.md`, following the exact `populate{X}(strapi)` delete-then-recreate pattern already used in `terms.ts`/`policies.ts`, wired into `apps/strapi/src/index.ts` bootstrap, gated by `APP_RUN_SEEDERS === "true"` like the existing seeders.
- **D-03:** MD → seeder mapping: each `##` section heading in the MD becomes one row's `title`; the section body becomes `text` as HTML (matching the existing `<p>/<strong>/<em>/<ul>` style already used in `terms.ts`/`policies.ts` — not raw markdown); `order` is the sequential section index starting at 1.

### URLs & naming
- **D-04:** `/condiciones-de-uso` is renamed to `/terminos-y-condiciones-de-uso`, with a 301 redirect from the old URL. Follow the project's established 2-commit pattern (CLAUDE.md): `git mv` the page file first, update all internal references in a second commit.
- **D-05:** New pages follow the existing plural "politicas-de-X" convention already established by `/politicas-de-privacidad`: `/politicas-de-cookies` and `/politicas-de-seguridad`.
- **D-06:** Visible label changes everywhere from "Condiciones de uso" to "Términos y Condiciones de Uso" — footer, about nav, page title/H1, SEO meta, registration checkbox label. This is an explicit, intentional label change (not incidental to the URL migration — CLAUDE.md's "never silently change labels during a URL migration" rule doesn't block an intentional one).
- **D-07:** Every reference to the old URL/label must be located and updated. Known reference points from codebase scout (verify completeness during planning — do a fresh grep, don't rely solely on this list):
  - `apps/website/app/components/FormRegister.vue:183` — registration checkbox link/label
  - `apps/website/app/components/FormTerms.vue:42` — re-acceptance lightbox form link/label
  - `apps/website/app/components/LightboxCookies.vue:29` — cookie-consent banner "Más información" link currently points to `/politicas-de-privacidad`; update to point to the new `/politicas-de-cookies` page instead, since a dedicated cookie policy now exists
  - `apps/website/app/components/MenuAbout.vue:28` — "Leer condiciones de uso" nav link
  - `apps/website/app/components/MenuFooter.vue:24` — footer link
  - `apps/website/app/shared/constants.ts:61` — `RESERVED_USERNAMES` (add new slugs; keep `condiciones-de-uso` reserved to protect the redirect)
  - `apps/strapi/src/extensions/users-permissions/controllers/authController.ts:30` — same `RESERVED_USERNAMES` set, backend copy, must be updated in lockstep with the website copy
  - sitemap page (`apps/website/app/pages/sitemap.vue`, per PROJECT.md v1.16 sitemap work) — add entries for the 2 new pages, update the renamed one

### Home page / featured
- **D-08:** No home-page integration for any of the 4 legal documents. No `featured`/`destacado` field added to `term` or the 2 new content-types. This was explicitly retracted by the user mid-discussion ("me equivoqué, ninguno va al home — solo FAQ va al home"). Do not build a featured checkbox, a `featured` schema field, or any home section for legal docs.

### Registration & acceptance flow
- **D-09:** Registration stays at 2 checkboxes (Términos y Condiciones de Uso + Política de Privacidad). Cookies and Seguridad are NOT added to the registration acceptance flow. Cookies consent is already handled separately via `LightboxCookies.vue` (a distinct banner/consent mechanism, not a registration checkbox); Seguridad is purely informational content with no acceptance requirement.
- **D-10:** Only the Términos checkbox's link/label updates (per D-04/D-06). The Privacidad checkbox and its link are untouched.

### Dashboard
- **D-11:** Cookies and Seguridad get admin CRUD under `apps/website/app/pages/dashboard/maintenance/{cookies,security}/` (or equivalent naming — see Claude's Discretion), mirroring the existing `terms/`/`policies/` route structure exactly: `index.vue`, `new.vue`, `[id]/index.vue`, `[id]/edit.vue`. Each gets its own drag-and-drop reorder via `vuedraggable` + a `/reorder` POST endpoint on its Strapi content-type, matching `TermsDashboard.vue`'s `handleReorder()` implementation.
- **D-12:** New nav entries added to `MenuMaintenance.vue` (and its `knownSubRoutes` array) for Cookies and Seguridad. The existing Términos nav entry label updates to match D-06.

### Claude's Discretion
- Exact Strapi API id / route naming for the 2 new content-types (e.g. `cookie-policy` vs `cookie`, `security-policy` vs `security`) — must not collide with the existing `condition` content-type (unrelated: ad item-condition, new/used).
- Whether the 2 new dashboard CRUD sections are literal copies of `TermsDashboard.vue`/`PoliciesDashboard.vue`/`FormTerm.vue`/`FormPolicy.vue`, or a consolidation into shared generic components now that the pattern is duplicated 4x. CLAUDE.md favors "replicate the closest existing equivalent" for new files and "purely subtractive" refactors — default to faithful replication; only consolidate if it's a clean subtractive follow-up with no regression risk. If uncertain, replicate and flag consolidation as a deferred idea rather than attempting it inline.
- Exact HTML markup translation from the MD prose (headings, bold, lists) into the seeder's inline HTML string style.

### Known constraints to carry into planning (not user decisions — factual findings)
- Public `find`/`findOne` permissions for the 2 new content-types must be granted manually via the Strapi admin panel (stored in the `up_permissions` DB table) — there is no code-based permission bootstrap anywhere in this repo, not even for the existing `term`/`policy`/`faq` content-types. This must be an explicit manual step in the plan/execution checklist, not something scripted, to stay consistent with how `term`/`policy` permissions were originally granted.
- `apps/website/app/types/term.d.ts` and `policy.d.ts` are missing `documentId`, even though `TermsDashboard.vue`/`FormTerm.vue` already rely on `term.documentId` for edit/reorder links (pre-existing type gap). When defining types for the 2 new content-types, include `documentId` from the start, and consider fixing `term.d.ts`/`policy.d.ts` too for consistency (additive-only fix, low risk).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Content source (seeders)
- `docs/terminos-y-condiciones.md` — humanized content to seed Términos
- `docs/politica-de-cookies.md` — humanized content to seed the new Cookies content-type
- `docs/politica-de-privacidad.md` — humanized content to seed Privacidad
- `docs/politica-de-seguridad.md` — humanized content to seed the new Seguridad content-type

### Strapi pattern to replicate (backend)
- `apps/strapi/src/api/term/content-types/term/schema.json` — schema shape (title, text, order)
- `apps/strapi/src/api/term/controllers/term.ts` — custom find/findOne/create/update/delete/reorder controller (esp. the `reorder` handler using `strapi.documents(...).update({documentId, data:{order}})`)
- `apps/strapi/src/api/term/routes/term.ts` and `apps/strapi/src/api/term/routes/01-custom-term.ts` — core router + custom `/terms/reorder` route registration
- `apps/strapi/src/api/policy/**` — identical pattern, second reference instance
- `apps/strapi/seeders/terms.ts`, `apps/strapi/seeders/policies.ts` — seeder pattern (`populate{X}(strapi)`, delete-all-then-recreate, hardcoded array of `{order, title, text}`) to replicate for Cookies/Seguridad and to replace the content of
- `apps/strapi/src/index.ts` — bootstrap wiring, `APP_RUN_SEEDERS` env gate, where new seeders get called alongside `populateTerms`/`populatePolicies`

### Website pattern to replicate (public pages)
- `apps/website/app/pages/condiciones-de-uso.vue` — page to rename (git mv) to `terminos-y-condiciones-de-uso.vue`, and pattern for the 2 new pages
- `apps/website/app/pages/politicas-de-privacidad.vue` — second reference instance
- `apps/website/app/stores/terms.store.ts`, `apps/website/app/stores/policies.store.ts` — Pinia store pattern (GET with `sort:["order:asc"]`, `pageSize:50`)
- `apps/website/app/components/TermsDefault.vue`, `apps/website/app/components/PoliciesDefault.vue` — display components (both wrap `AccordionDefault`)
- `apps/website/app/types/term.d.ts`, `apps/website/app/types/policy.d.ts` — type definitions (missing `documentId`, see Known Constraints)

### Dashboard pattern to replicate (admin CRUD)
- `apps/website/app/pages/dashboard/maintenance/terms/{index,new}.vue`, `apps/website/app/pages/dashboard/maintenance/terms/[id]/{index,edit}.vue` — route structure to replicate
- `apps/website/app/pages/dashboard/maintenance/policies/**` — second reference instance
- `apps/website/app/components/TermsDashboard.vue` — drag-and-drop implementation (`vuedraggable`, `isDraggable` computed, `handleReorder()` POSTing to `/terms/reorder`)
- `apps/website/app/components/PoliciesDashboard.vue` — second reference instance
- `apps/website/app/components/FormTerm.vue`, `apps/website/app/components/FormPolicy.vue` — create/edit form pattern (vee-validate + yup, auto-incrementing `order` on create)
- `apps/website/app/components/FormFaq.vue` — featured-checkbox UI/logic precedent (NOT used this phase per D-08, kept as reference only in case scope changes later)
- `apps/website/app/components/MenuMaintenance.vue` — dashboard nav registration, `knownSubRoutes` array

### Reference points requiring updates (renamed URL/label)
- `apps/website/app/components/FormRegister.vue:183`
- `apps/website/app/components/FormTerms.vue:42`
- `apps/website/app/components/LightboxCookies.vue:29`
- `apps/website/app/components/MenuAbout.vue:28`
- `apps/website/app/components/MenuFooter.vue:24`
- `apps/website/app/shared/constants.ts:61` (`RESERVED_USERNAMES`)
- `apps/strapi/src/extensions/users-permissions/controllers/authController.ts:30` (`RESERVED_USERNAMES`, backend copy)
- `apps/website/app/pages/sitemap.vue` (sitemap entries)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AccordionDefault.vue` — generic accordion component already consumed by both `TermsDefault.vue` and `PoliciesDefault.vue`; reuse as-is for Cookies/Seguridad display pages.
- `vuedraggable` — already a project dependency, used for `TermsDashboard.vue`/`PoliciesDashboard.vue` reorder; reuse the same import/wiring for the 2 new dashboard sections.
- `useApiClient()` — the composable both stores use for all Strapi calls; use identically in new stores.

### Established Patterns
- Content-type quadruplet: schema.json (title/text/order) + hand-rolled controller (bypasses core controller for custom find/findOne/reorder) + core router + custom `/reorder` route file + pass-through service. This exact quadruplet is copied for `policy` already; copy again for the 2 new content-types.
- Seeder pattern: one `populate{X}(strapi)` function per content-type, always delete-all-then-recreate from a hardcoded array, gated by `APP_RUN_SEEDERS` env var, called from `apps/strapi/src/index.ts` bootstrap alongside existing seeders (`populateCategories`, `populateConditions`, `populateFaqs`, `populatePacks`, `populateRegions`, `populateAdDraftMigration`).
- Dashboard admin page pattern: `index.vue` (list + drag handle) → `new.vue` (create form) → `[id]/index.vue` (detail) → `[id]/edit.vue` (edit form), each thin wrapper around a shared `Form{X}.vue` and `{X}Dashboard.vue` component.
- 2-commit URL migration pattern (CLAUDE.md): rename first (`git mv`), update all internal references second. Never change unrelated Spanish UI labels during a pure URL migration — but this phase's label change is explicit and intentional (D-06), not incidental.

### Integration Points
- New content-types register in Strapi under `apps/strapi/src/api/{new-slug}/` following the `term`/`policy` directory structure verbatim.
- New public pages register as new files under `apps/website/app/pages/`.
- New dashboard routes register under `apps/website/app/pages/dashboard/maintenance/{new-slug}/` and must be added to `MenuMaintenance.vue`'s nav list + `knownSubRoutes`.
- `RESERVED_USERNAMES` must stay in sync between `apps/website/app/shared/constants.ts` and `apps/strapi/src/extensions/users-permissions/controllers/authController.ts` — both need every new/renamed slug added.

</code_context>

<specifics>
## Specific Ideas

No specific visual/UX references beyond "replicate what already exists for Términos/Privacidad" — the user's explicit intent is consistency with the existing 2 documents, not a new design.

</specifics>

<deferred>
## Deferred Ideas

- Home-page "featured" integration for legal docs — explicitly retracted mid-discussion. If revisited in a future phase, model on the existing `FaqDefault` + `featuredFaqs` pattern found in `apps/website/app/pages/index.vue` and `apps/website/app/stores/faqs.store.ts` (a `featured` boolean field + a home section with a `limit` prop).
- Consolidating the now-4x-duplicated dashboard CRUD + drag-and-drop pattern (`term`/`policy`/cookies/seguridad) into one generic shared component — noted as a possible subtractive follow-up, not attempted in this phase unless it's low-risk (see Claude's Discretion).

</deferred>

---

*Phase: 04-split-legal-pages-into-4-documents-with-dashboard-management*
*Context gathered: 2026-07-01*
