---
phase: quick
plan: 260404-mbi
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/dashboard/app/components/PoliciesDefault.vue
  - apps/dashboard/app/components/FormPolicy.vue
  - apps/dashboard/app/scss/components/_policies.scss
  - apps/dashboard/app/pages/policies/index.vue
  - apps/dashboard/app/pages/policies/new.vue
  - apps/dashboard/app/pages/policies/[id]/index.vue
  - apps/dashboard/app/pages/policies/[id]/edit.vue
  - apps/dashboard/app/stores/settings.store.ts
  - apps/dashboard/app/components/MenuDefault.vue
autonomous: true
requirements: [quick-260404-mbi]
must_haves:
  truths:
    - "Admin can see a list of all privacy policies with title, text preview, order, and dates"
    - "Admin can create a new policy with title, text (richtext), and order"
    - "Admin can view a single policy's full details"
    - "Admin can edit an existing policy"
    - "Policies appear in the Mantenedores sidebar menu"
  artifacts:
    - path: "apps/dashboard/app/components/PoliciesDefault.vue"
      provides: "Policy listing table with search, filters, pagination"
    - path: "apps/dashboard/app/components/FormPolicy.vue"
      provides: "Create/edit form for policies"
    - path: "apps/dashboard/app/pages/policies/index.vue"
      provides: "Policy list page"
    - path: "apps/dashboard/app/pages/policies/new.vue"
      provides: "New policy page"
    - path: "apps/dashboard/app/pages/policies/[id]/index.vue"
      provides: "Policy detail page"
    - path: "apps/dashboard/app/pages/policies/[id]/edit.vue"
      provides: "Policy edit page"
  key_links:
    - from: "PoliciesDefault.vue"
      to: "/api policies endpoint"
      via: "useApiClient GET policies"
      pattern: 'apiClient\("policies"'
    - from: "FormPolicy.vue"
      to: "/api policies endpoint"
      via: "useApiClient POST/PUT policies"
      pattern: 'apiClient.*policies'
    - from: "MenuDefault.vue"
      to: "/policies"
      via: "NuxtLink in Mantenedores submenu"
      pattern: 'to="/policies"'
---

<objective>
Create a privacy policy CRUD maintainer in the dashboard, replicating the exact same pattern used by the FAQ maintainer.

Purpose: Allow admins to manage privacy policies (create, view, edit, list) from the dashboard, using the existing Strapi `policy` content type (fields: title, text as richtext, order as integer).

Output: 6 new files (2 components, 4 pages), 2 modified files (settings store, menu), 1 new SCSS file.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/dashboard/app/components/FaqsDefault.vue (list component pattern to replicate)
@apps/dashboard/app/components/FormFaq.vue (form component pattern to replicate)
@apps/dashboard/app/scss/components/_faqs.scss (SCSS pattern to replicate)
@apps/dashboard/app/pages/faqs/index.vue (list page pattern)
@apps/dashboard/app/pages/faqs/new.vue (new page pattern)
@apps/dashboard/app/pages/faqs/[id]/index.vue (detail page pattern)
@apps/dashboard/app/pages/faqs/[id]/edit.vue (edit page pattern)
@apps/dashboard/app/stores/settings.store.ts (settings store to extend)
@apps/dashboard/app/components/MenuDefault.vue (sidebar menu to extend)
@apps/strapi/src/api/policy/content-types/policy/schema.json (Strapi schema — fields: title string required, text richtext, order integer)

<interfaces>
<!-- Policy content type from Strapi -->
Policy schema fields:
- title: string (required)
- text: richtext
- order: integer

<!-- FAQ pattern uses these shared components (all auto-imported): -->
- HeroDefault (title, breadcrumbs, #actions slot)
- BoxContent (#content, #sidebar slots)
- BoxInformation (title, columns props)
- CardInfo (title, description props)
- SearchDefault (model-value, placeholder, @update:model-value)
- FilterDefault (model-value, sort-options, page-sizes, @update:model-value)
- TableDefault (columns prop)
- TableRow, TableCell
- BadgeDefault (variant prop)
- PaginationDefault (current-page, total-pages, total-records, page-size, @page-change)
- formatDate() — auto-imported from app/utils/date.ts

<!-- Settings store pattern for new section -->
- Add `policies: SectionSettings` to SettingsState interface
- Add `policies` ref with defaultSectionSettings
- Add `getPoliciesFilters` computed
- Add `policies` case to getSectionSettings switch
- Export policies ref and getPoliciesFilters getter
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create PoliciesDefault list component, FormPolicy form component, and policies SCSS</name>
  <files>
    apps/dashboard/app/components/PoliciesDefault.vue
    apps/dashboard/app/components/FormPolicy.vue
    apps/dashboard/app/scss/components/_policies.scss
  </files>
  <action>
    Create PoliciesDefault.vue by copying FaqsDefault.vue exactly and making these substitutions:
    - BEM block: `faqs` -> `policies` (class `policies policies--default`, all nested `policies--default__*`)
    - Section const: `const section = "policies" as const`
    - settingsStore refs: `settingsStore.faqs` -> `settingsStore.policies`, `settingsStore.getFaqsFilters` -> `settingsStore.getPoliciesFilters`
    - Interface: `Faq` -> `Policy` with fields `{ id: number; title: string; text: string; order: number | null; updatedAt: string; createdAt: string }`
    - API endpoint: `"faqs"` -> `"policies"`
    - Search placeholder: `"Buscar FAQs..."` -> `"Buscar Politicas..."`
    - Table columns: Replace "Destacado" with "Orden" (the order field). Remove BadgeDefault for featured, instead show `policy.order ?? '-'` as plain text
    - Table cells: id, title (truncated 60), text (truncated 80), order, updatedAt, actions (view/edit)
    - Router paths: `/faqs/` -> `/policies/`
    - Empty/loading messages: `"FAQs"` -> `"politicas"`
    - Sort options: same pattern (createdAt desc/asc, title asc/desc)
    - Import BadgeDefault is NOT needed (no featured field) — remove that import

    Create FormPolicy.vue by copying FormFaq.vue exactly and making these substitutions:
    - Interface: `FaqData` -> `PolicyData` with fields `{ id?: number; documentId?: string; title?: string; text?: string; order?: number | null }`
    - Props: `faq` -> `policy`
    - Emit: `(e: "saved", policy: PolicyData): void`
    - Form fields: title (text input), text (textarea with rows="8" since richtext is longer), order (number input)
    - Remove featured checkbox entirely, add order field: `<div class="form__group"><label class="form__label" for="order">Orden</label><Field v-model.number="form.order" name="order" type="number" class="form__control" /></div>`
    - Yup schema: title required, text required, order number nullable
    - Form ref: `{ title: "", text: "", order: null as number | null }`
    - Payload: `{ title, text, order }` (no featured)
    - API endpoint: `"faqs"` -> `"policies"`, `/faqs/` -> `/policies/`
    - Success/error messages: `"FAQ"` -> `"Politica"`
    - Submit labels: `"Crear Politica"` / `"Actualizar Politica"`
    - Router paths: `/faqs/` -> `/policies/`
    - Watch prop: `props.faq` -> `props.policy`
    - hydrateForm: map title, text, order (not featured)

    Create _policies.scss by copying _faqs.scss exactly:
    - Replace `.faqs` with `.policies` throughout
    - Keep all the same structure (default variant, container, header, search, filters, table-wrapper, empty, loading, question->title, answer->text, actions, pagination)
    - Remove the global tooltip styles (they are already defined in _faqs.scss, no need to duplicate)
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && grep -c "policies" apps/dashboard/app/components/PoliciesDefault.vue && grep -c "policies" apps/dashboard/app/components/FormPolicy.vue && test -f apps/dashboard/app/scss/components/_policies.scss && echo "OK"</automated>
  </verify>
  <done>PoliciesDefault.vue renders a table of policies with search/filter/pagination. FormPolicy.vue handles create/edit with title, text, order fields. _policies.scss provides identical styling structure to FAQs.</done>
</task>

<task type="auto">
  <name>Task 2: Create policy pages (list, new, detail, edit) and wire into settings store and sidebar menu</name>
  <files>
    apps/dashboard/app/pages/policies/index.vue
    apps/dashboard/app/pages/policies/new.vue
    apps/dashboard/app/pages/policies/[id]/index.vue
    apps/dashboard/app/pages/policies/[id]/edit.vue
    apps/dashboard/app/stores/settings.store.ts
    apps/dashboard/app/components/MenuDefault.vue
  </files>
  <action>
    Create pages/policies/index.vue copying pages/faqs/index.vue:
    - HeroDefault title: "Politicas de Privacidad"
    - Action button: NuxtLink to="/policies/new" text "Agregar Politica"
    - Import and use PoliciesDefault instead of FaqsDefault
    - Breadcrumbs: `[{ label: "Politicas" }]`
    - definePageMeta layout: "dashboard"

    Create pages/policies/new.vue copying pages/faqs/new.vue:
    - HeroDefault title: "Nueva Politica"
    - BoxInformation title: "Nueva Politica"
    - Use FormPolicy instead of FormFaq
    - Breadcrumbs: `[{ label: "Politicas", to: "/policies" }, { label: "Nueva" }]`

    Create pages/policies/[id]/index.vue copying pages/faqs/[id]/index.vue:
    - title computed: `item.value?.title || "Politica"`
    - Breadcrumbs: `[{ label: "Politicas", to: "/policies" }, ...]`
    - Edit button NuxtLink to `/policies/${route.params.id}/edit`
    - BoxInformation content: CardInfo for "Titulo" (item.title), "Contenido" (item.text), "Orden" (item.order ?? 'Sin orden')
    - BoxInformation sidebar: CardInfo for creation date, last modified
    - useAsyncData key: `policy-${route.params.id}`
    - API calls: `"policies"` endpoint with documentId filter, fallback `policies/${id}`

    Create pages/policies/[id]/edit.vue copying pages/faqs/[id]/edit.vue:
    - title computed: `policy.value?.title || "Politica"`
    - Breadcrumbs: `[{ label: "Politicas", to: "/policies" }, ..., { label: "Editar" }]`
    - BoxInformation title: "Editar Politica"
    - Use FormPolicy with `:policy="policy"` prop and `@saved="handlePolicySaved"`
    - useAsyncData key: `policy-edit-${route.params.id}`
    - API calls: `"policies"` endpoint

    Update settings.store.ts:
    - Add `policies: SectionSettings` to SettingsState interface (after faqs line)
    - Add `const policies = ref<SectionSettings>({ ...defaultSectionSettings });` (after faqs ref)
    - Add `getPoliciesFilters` computed getter (copy getFaqsFilters pattern, reference policies.value)
    - Add `case "policies": return policies;` in getSectionSettings switch
    - Add `policies` to the return object (state section)
    - Add `getPoliciesFilters` to the return object (getters section)

    Update MenuDefault.vue:
    - Add a new `<li>` menu item for policies in the Mantenedores submenu, right after the FAQ menu item. Copy the exact FAQ `<li>` pattern:
      ```
      <li class="menu--default__subitem" :class="{ 'menu--default__subitem--active': isRouteActive('/policies') }">
        <NuxtLink to="/policies" class="menu--default__sublink">
          <Shield class="menu--default__subicon" />
          <span>Politicas</span>
        </NuxtLink>
      </li>
      ```
    - Import `Shield` from `lucide-vue-next` (add to existing import)
    - Add `isRouteActive("/policies")` to the `isMantenedoresActive` computed (in the return expression)
    - Add `path.startsWith("/policies")` to the auto-open condition for mantenedores menu

    Import the new SCSS file: check how _faqs.scss is imported (likely in a main scss file) and add _policies.scss the same way.
  </action>
  <verify>
    <automated>cd /home/gab/Code/waldo-project && npx nuxi typecheck apps/dashboard 2>&1 | tail -20</automated>
  </verify>
  <done>All 4 policy pages exist and follow the exact FAQ page structure. Settings store has `policies` section for search/filter/pagination state. MenuDefault sidebar shows "Politicas" link under Mantenedores. TypeScript compiles clean.</done>
</task>

</tasks>

<verification>
- `npx nuxi typecheck apps/dashboard` passes with no errors related to policy files
- Navigating to `/policies` in dashboard shows the policy list table
- Navigating to `/policies/new` shows the create form with title, text, order fields
- Settings store correctly persists policy filter/pagination state
- Menu sidebar shows "Politicas" under Mantenedores and highlights when active
</verification>

<success_criteria>
- All 6 new files created following exact FAQ pattern structure
- Settings store extended with policies section (state + getter + switch case)
- MenuDefault sidebar includes Politicas link with Shield icon
- Policy CRUD works against Strapi `policies` endpoint (title, text richtext, order integer)
- TypeScript compiles clean
</success_criteria>

<output>
After completion, create `.planning/quick/260404-mbi-privacy-policy-maintainer-in-dashboard-f/260404-mbi-SUMMARY.md`
</output>
