# Roadmap: Waldo Project

## Milestones

- ✅ **v1.46 PRO Subscriptions + Post-Merge Hardening** — Phases 102–129 (shipped 2026-06-14). See `.planning/milestones/v1.46-ROADMAP.md`
- ✅ **v1.45 User Onboarding** — Phases 099–101 (shipped 2026-03-20). See `.planning/milestones/v1.45-ROADMAP.md`
- ✅ **v1.44 Google One Tap Sign-In** — Phases 094–098 (shipped 2026-03-19). See `.planning/milestones/v1.44-ROADMAP.md`
- ✅ **v1.43 Cross-App Session Replacement** — Phase 095 (shipped 2026-03-19). See `.planning/milestones/v1.43-ROADMAP.md`
- ✅ **v1.42 Dashboard Session Persistence** — Phase 094 (shipped 2026-03-18). See `.planning/milestones/v1.42-ROADMAP.md`
- ✅ **v1.41 Ad Preview Error Handling** — Phase 093 (shipped 2026-03-18). See `.planning/milestones/v1.41-ROADMAP.md`
- ⛔ **v1.25 Unified Checkout** — forcibly closed 2026-03-09. See `.planning/milestones/v1.25-ROADMAP.md`
- ✅ **v1.26 Mostrar comprobante Webpay** — Phase 060 (shipped 2026-03-11). See `.planning/milestones/v1.26-ROADMAP.md`
- ✅ **v1.27 Reparar eventos GA4 ecommerce** — Phase 061 (shipped 2026-03-12). See `.planning/milestones/v1.27-ROADMAP.md`
- ✅ **v1.28 Logout Store Cleanup** — Phase 062 (shipped 2026-03-12). See `.planning/milestones/v1.28-ROADMAP.md`
- ✅ **v1.29 News Manager** — Phases 063–064 (shipped 2026-03-12). See `.planning/milestones/v1.29-ROADMAP.md`
- ✅ **v1.30 Blog Public Views** — Phases 065–068 (shipped 2026-03-13). See `.planning/milestones/v1.30-ROADMAP.md`
- ✅ **v1.31 Article Manager Improvements** — Phases 069–070 (shipped 2026-03-13). See `.planning/milestones/v1.31-ROADMAP.md`
- ✅ **v1.32 Gemini AI Service** — Phase 071 (shipped 2026-03-13). See `.planning/milestones/v1.32-ROADMAP.md`
- ✅ **v1.33 Anthropic Claude AI Service** — Phase 072 (shipped 2026-03-13). See `.planning/milestones/v1.33-ROADMAP.md`
- ✅ **v1.34 LightBoxArticles** — Phases 073–074 (shipped 2026-03-13). See `.planning/milestones/v1.34-ROADMAP.md`
- ✅ **v1.35 Gift Reservations to Users** — Phases 075–076 (shipped 2026-03-13). See `.planning/milestones/v1.35-ROADMAP.md`
- ✅ **v1.36 Two-Step Login Verification** — Phases 077–078 (shipped 2026-03-14). See `.planning/milestones/v1.36-ROADMAP.md`
- ✅ **v1.37 Email Authentication Flows** — Phases 079–082 (shipped 2026-03-14). See `.planning/milestones/v1.37-ROADMAP.md`
- ✅ **v1.38 GA4 Analytics Audit & Implementation** — Phases 083–085 (shipped 2026-03-14). See `.planning/milestones/v1.38-ROADMAP.md`
- ✅ **v1.39 Unified API Client** — Phases 089–090 (shipped 2026-03-15). See `.planning/milestones/v1.39-ROADMAP.md`
- ✅ **v1.40 Shared Authentication Session** — Phases 091–092 (shipped 2026-03-16). See `.planning/milestones/v1.40-ROADMAP.md`

## Phases

No active milestone. All shipped milestones are archived under `.planning/milestones/`.

Start the next milestone with `/gsd:new-milestone` (questioning → research → requirements → roadmap).

## Progress

| Milestone | Phases | Status | Shipped |
|-----------|--------|--------|---------|
| v1.46 PRO Subscriptions + Post-Merge Hardening | 102–129 | ✅ Complete | 2026-06-14 |

### Phase 1: Corregir issues de Codacy

**Goal:** Resolver los 100 issues abiertos en Codacy (90 Security/Opengrep, 9 BestPractice/ESLint, 1 UnusedCode), analizando cada patrón para descartar falsos positivos y evaluar riesgo de regresión antes de aplicar cada fix. Snapshot: `.planning/research/codacy-issues-snapshot-2026-06-14.md`
**Requirements**: CODACY-TRIAGE, CODACY-FIX, CODACY-SUPPRESS, CODACY-VERIFY
**Depends on:** Phase 0
**Plans:** 7 plans (3 waves)

Plans:
- [x] 01-00-PLAN.md — Wave 0 regression gate: characterization + injection tests (RED by design) before the fixes
- [x] 01-01-PLAN.md — authController.ts end-to-end: pendingToken scalar coercion + crypto.randomBytes username suffix
- [x] 01-02-PLAN.md — NoSQL coercion: ad.ts saveDraft Number(ad_id) + checkout.service String(pack)
- [x] 01-03-PLAN.md — password.ts client CSPRNG: crypto.getRandomValues with rejection sampling
- [x] 01-04-PLAN.md — no-explicit-any → unknown across koa.d.ts, nitro-globals, better-stack, cloudflare
- [x] 01-05-PLAN.md — hardening: useProviders allowlist + image-uploader os.tmpdir() confinement
- [ ] 01-06-PLAN.md — suppression track (autonomous:false, blocked on Codacy account token): bulk-ignore ~80 FPs + remote verify

### Phase 2: Mover IA a endpoints de dominio (eliminar recurso ia, exponer GET /articles/sources y POST /articles/generate, servicios IA internos)

**Goal:** Reubicar la IA desde el recurso `ia` a endpoints de dominio: exponer `GET /articles/sources` y `POST /articles/generate` (manager-only), dejar los servicios IA y Tavily internos (sin ruta), mover la construcción del prompt y la selección de proveedor al backend (default Cerebras + cadena de fallback configurable por env), migrar `LightBoxArticles.vue` y eliminar los recursos `ia` y `search`. Sin cambio de comportamiento del flujo de noticias del dashboard.
**Requirements**: N/A
**Depends on:** Phase 1
**Plans:** 6 plans (3 waves) — 1/6 executed

Plans:
- [x] 02-01-PLAN.md — Backend additivo: servicio ai-provider (selección + fallback), index IA lazy, acciones article.sources/article.generate + rutas isManager
- [ ] 02-02-PLAN.md — Cutover frontend a endpoints de dominio + borrar recursos ia y search + checkpoint de verificación humana

### Phase 3: Validacion IA de campos de texto libre en el registro (boolean por campo, fail-open)

**Goal:** Agregar validación semántica con IA en el flujo de registro (server-side, antes de crear el usuario, en `registerUserLocal`): la IA evalúa SOLO campos de texto libre (firstname, lastname, address y, si es empresa, business_name/business_type/business_address), devuelve un boolean por campo y, si alguno es `false` explícito, rechaza el registro con un mensaje en español específico del campo. Fail-open no negociable: cualquier error/timeout/sin tokens/JSON no parseable ⇒ se asume `true` y el registro nunca se bloquea por fallas de la IA. Reusa el `ai-provider` de la fase 02; el frontend (FormRegister.vue) muestra el mensaje de rechazo.
**Requirements**: N/A
**Depends on:** Phase 2
**Plans:** 2/2 plans complete

Plans:
- [x] 03-01-PLAN.md — Servicio `field-validation` (TDD): types + config (TIMEOUT_MS, buildValidationPrompt) + `validateFields` con timeout/fail-open/strip-fences + matriz de tests; export aditivo `generate` en ai-provider
- [x] 03-02-PLAN.md — Enganche en `registerUserLocal` (gate IA + mapa de mensajes ES) + tests de controller (incl. fail-open end-to-end) + verificar surfacing en FormRegister.vue

### Phase 4: Split legal pages into 4 documents with dashboard management

**Goal:** Split the single legal-docs surface into 4 fully independent, publicly-accessible legal documents (Términos y Condiciones de Uso, Política de Privacidad, Política de Cookies, Política de Seguridad), each with its own Strapi content-type, public page, and dashboard CRUD section with drag-and-drop reorder — replacing the current structural mislabeling where Cookies and Seguridad content is mixed into the `policy` content-type under Privacidad, and renaming `/condiciones-de-uso` to `/terminos-y-condiciones-de-uso` with a 301 redirect and updated labels everywhere.
**Requirements**: [LEGAL-SPLIT-01, LEGAL-SPLIT-02, LEGAL-SPLIT-03, LEGAL-SPLIT-04, LEGAL-SPLIT-05, LEGAL-SPLIT-06, LEGAL-SPLIT-07, LEGAL-SPLIT-08, LEGAL-SPLIT-09, LEGAL-SPLIT-10]
**Depends on:** Phase 3
**Plans:** 8/9 plans complete

Plans:
- [x] 04-01-PLAN.md — Wave 1: Strapi content-type quadruplets for cookie-policy and security-policy (schema/controller/routes×2/service each)
- [x] 04-02-PLAN.md — Wave 1: Seeder split (remove Cookies/Seguridad rows from policies.ts) + reword terms.ts/policies.ts from humanized docs + create cookie-policies.ts/security-policies.ts seeders + wire into index.ts bootstrap
- [x] 04-08-PLAN.md — Wave 1: URL rename condiciones-de-uso → terminos-y-condiciones-de-uso (git mv, 301 redirect, label updates across 8 reference-point files, RESERVED_USERNAMES sync, sitemap additions)
- [x] 04-03-PLAN.md — Wave 2: Frontend types (cookie-policy.d.ts, security-policy.d.ts, documentId fix on term.d.ts/policy.d.ts) + 2 new Pinia stores + mandatory 5-part settings.store.ts extension
- [x] 04-04-PLAN.md — Wave 3: Public pages (politicas-de-cookies.vue, politicas-de-seguridad.vue) + display components + SCSS partials
- [x] 04-05-PLAN.md — Wave 3: Dashboard CRUD for Cookies (CookiePoliciesDashboard.vue, FormCookiePolicy.vue, 4 route files, documentId-based fix-forward filtering)
- [x] 04-06-PLAN.md — Wave 3: Dashboard CRUD for Seguridad (SecurityPoliciesDashboard.vue, FormSecurityPolicy.vue, 4 route files, documentId-based fix-forward filtering)
- [x] 04-07-PLAN.md — Wave 4: MenuMaintenance.vue nav entries for both new dashboard sections + Términos label update + knownSubRoutes
- [ ] 04-09-PLAN.md — Wave 5 (non-autonomous): Manual Strapi admin permission grant (Public find/findOne for both content-types) + 12-point human visual/functional verification checklist

### Phase 5: Audit log for every CRUD operation in Strapi

**Goal:** Track who creates, updates, and deletes records across every Strapi content-type (admin panel + public API + system writes) via a single global `strapi.db.lifecycles.subscribe()` handler registered in `bootstrap()` — recording actor id + actor-type discriminator (admin::user / plugin::users-permissions.user / system), action, content-type UID, and record id/documentId per write. **Storage PIVOT (2026-07-02):** audit entries are written as structured LOG LINES via the existing Winston logger (Better Stack + local 90-day rotating file), NOT a Strapi `audit-log` DB table (the table built in 05-01 was removed in 05-03); read path is Better Stack / `apps/strapi/logs/app-*.log`. Also homologates the ~62 existing payment/ad-creation `logger.*` calls to the same `{ actor, actor_type, data }` envelope (reshape-only). No dashboard UI, no field-level diffing; retention handled by the logger's 90-day rotation.
**Requirements**: N/A
**Depends on:** Phase 4
**Plans:** 5/6 plans executed

Plans:
- [x] 05-01-PLAN.md — Wave 1 (TDD): audit-log content-type schema + subscriber tests + `db.lifecycles.subscribe()` handler wired at top of bootstrap() (SUPERSEDED by 05-03's logger pivot — DB table removed)
- [x] 05-03-PLAN.md — Wave 1 (TDD): PIVOT rework — delete the audit-log DB table, add shared `logAudit` helper (info/warn/error) wrapping the Winston logger, reroute the subscriber through it, update tests to mock the helper
- [x] 05-04-PLAN.md — Wave 2: homologate payment.ts (23 logger call sites) to the `logAudit` envelope (reshape-only, level+message preserved, actor from local userId/system)
- [x] 05-05-PLAN.md — Wave 2: homologate ad.service.ts (12) + pack.service.ts (16) logger calls to `logAudit` (reshape-only)
- [x] 05-06-PLAN.md — Wave 2: homologate ad.ts (5) + checkout.service.ts (5) + free-ad.service.ts (1) logger calls to `logAudit` (reshape-only)
- [ ] 05-02-PLAN.md — Wave 3 (non-autonomous): end-to-end human verification against the LOG (local rotating file / Better Stack, not Content Manager) — admin/public-API/system actor tagging + at least one homologated payment log renders the new envelope; business + payment writes unaffected

### Phase 6: Generate comprehensive as-built product documentation (PRD, TRD, UX/UI, App Flows, Backend Schema, Implementation Plan) in /docs, verified against current code — not copied from potentially stale existing docs

**Goal:** Produce six professional-grade, self-contained Markdown documents in `/docs` (`PRD.md`, `TRD.md`, `UXD.md`, `FLOWS.md`, `BSD.md`, `IPD.md`) describing the Waldo Project as it exists today, each fact re-derived from live source (not copied from stale `.planning/codebase/*` or `/docs/*.md`). Flows are the highest-scrutiny deliverable: 6 core flows (auth, ad lifecycle, payment, reservations, CRUD+audit-log, cron) each with a Mermaid diagram. Known stale claims are corrected inline and surfaced in explicit "Inconsistencias detectadas" / "Preguntas abiertas" sections — notably the `apps/dashboard`-is-merged-into-`apps/website` fact and the corrected count of 6 active cron jobs (not 4).
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11, D-12 (from 06-CONTEXT.md — no formal REQUIREMENTS.md)
**Depends on:** Phase 5
**Plans:** 6 plans (2 waves)

Plans:
- [ ] 06-01-PLAN.md — Wave 1: BSD.md (21-entity ER diagram + field tables + endpoint reference, verified against live schema.json)
- [ ] 06-02-PLAN.md — Wave 1: FLOWS.md (6 core flows, each a Mermaid diagram + prose; corrects 6-cron count and reservation path)
- [ ] 06-03-PLAN.md — Wave 2: TRD.md (stack/architecture/integrations/NFRs + "Inconsistencias detectadas" dashboard-merge & cron corrections)
- [ ] 06-04-PLAN.md — Wave 2: PRD.md (as-built problem/personas/MVP+backlog/acceptance criteria cross-referenced to flows)
- [ ] 06-05-PLAN.md — Wave 2: IPD.md (retrospective phase/milestone history reframed as reusable delivery patterns)
- [ ] 06-06-PLAN.md — Wave 2: UXD.md (page inventory public/dashboard, component taxonomy, BEM/SCSS, brand palette)
