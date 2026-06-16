# Roadmap: Waldo Project

## Milestones

- 🚧 **v1.47 Rediseño visual (rebrand)** — Phase 04 auth (started 2026-06-16). Demás áreas (público, cuenta, dashboard) se agregan cuando se aprueben.
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

## Phases — v1.47 Rediseño visual

### Phase 04: Auth + tokens base

**Goal:** Establecer los tokens compartidos (crear variables SCSS NUEVAS con los valores de la maqueta — sin tocar las existentes —, iconos Lucide) y restilizar auth (login, registro, verificación, reset/forgot) a la maqueta. Poppins ya existe. Primera fase: deja la base que reusan las demás áreas.
**Requirements:** TOK-01, TOK-02, TOK-03, AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Depends on:** —
**Success criteria:**
1. Login, registro, verificación y reset/forgot se ven según la maqueta (color, tipografía, espaciado, iconos)
2. Se crean variables SCSS nuevas con los valores de la maqueta y los componentes de auth apuntan a ellas; las variables existentes quedan intactas
3. La iconografía Lucide se aplica donde la maqueta la usa
4. Cero cambios de comportamiento en los flujos de auth (login/registro/verificación/reset funcionan igual)
5. Las variables nuevas viven junto a las existentes en `_variables.scss`; solo cambia de tono lo que ya migró a usarlas (auth). El resto del sitio sigue con las variables viejas hasta su fase. Marca intacta, sin font swap (Poppins ya existe)

**Plans:** 3/7 plans executed

Plans:
- [x] 04-01-PLAN.md — Add new SCSS design tokens to _variables.scss + confirm Poppins global (TOK-01, TOK-02)
- [x] 04-02-PLAN.md — Restyle shared form primitives scoped under .auth (inputs, buttons, separator, checkboxes, password controls, strength meter) + remove duplicate .form--verify (TOK-01, TOK-03)
- [x] 04-03-PLAN.md — 50/50 layout + cream brand-panel card with amber glows (IntroduceAuth) + amber Google button (TOK-03, AUTH-01..04)
- [ ] 04-04-PLAN.md — Login screen restyle: Google-first order, divider, secondary submit, lucide back link (AUTH-01)
- [ ] 04-05-PLAN.md — Register restyle: 2-step indicator, generate, amber/secondary buttons + confirmar (AUTH-02)
- [ ] 04-06-PLAN.md — Verify 2FA restyle: 62px OTP boxes, amber focus + verificar (AUTH-03)
- [ ] 04-07-PLAN.md — Recover + reset restyle: amber submits, lucide generate, dead-import cleanup (AUTH-04)

> Las áreas público, cuenta y dashboard se agregarán como fases recién cuando el usuario apruebe cada rediseño.

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
**Plans:** 1/2 plans executed

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
