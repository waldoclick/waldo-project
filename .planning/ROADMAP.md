# Roadmap: Waldo Project

## Milestones

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
- 🚧 **v1.45 User Onboarding** — Phases 099–101 (in progress)

## Phases

### 🚧 v1.45 User Onboarding (In Progress)

**Milestone Goal:** Force newly registered users with incomplete profiles through a dedicated onboarding flow before they can use the platform.

- [x] **Phase 099: Onboarding UI** - Layout, pages, and components for the onboarding flow (completed 2026-03-19)
- [ ] **Phase 100: Guard** - Middleware that intercepts navigation and enforces profile completion
- [ ] **Phase 101: Integration** - Wire One Tap suppression, referer exclusion, and pre-redirect URL storage

## Phase Details

### Phase 099: Onboarding UI
**Goal**: Users can complete their profile through a dedicated onboarding page and reach a confirmation screen with clear next steps
**Depends on**: Nothing (first phase of milestone)
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, FORM-01, FORM-02, FORM-03, THANK-01, THANK-02, THANK-03
**Success Criteria** (what must be TRUE):
  1. User navigating to `/onboarding` sees only the Waldo logo with no header, footer, or navigation — just the profile form
  2. User can complete the profile form at `/onboarding` and be taken to `/onboarding/thankyou` on success
  3. Existing profile editing at `/cuenta/perfil/editar` continues to work exactly as before
  4. `/onboarding/thankyou` displays a thank-you message with two buttons: "Crear mi primer anuncio" and "Volver a Waldo"
**Plans:** 3/3 plans complete
Plans:
- [x] 099-00-PLAN.md — Wave 0 test stubs (Nyquist scaffolding)
- [x] 099-01-PLAN.md — Layout, SCSS, and FormProfile emit refactor (foundation)
- [ ] 099-02-PLAN.md — Onboarding pages and components (user-facing UI)

### Phase 100: Guard
**Goal**: Incomplete-profile users are automatically intercepted and routed to onboarding on every page navigation
**Depends on**: Phase 099
**Requirements**: GUARD-01, GUARD-02, GUARD-03, GUARD-04
**Success Criteria** (what must be TRUE):
  1. A newly registered user visiting any non-exempt page is redirected to `/onboarding` before seeing any content
  2. A user with a complete profile visiting `/onboarding` is redirected to the home page
  3. Visiting `/login`, `/registro`, or `/logout` never triggers the onboarding redirect
  4. Page refresh on any page does not cause an incorrect redirect to `/onboarding` (SSR-safe)
**Plans**: TBD

### Phase 101: Integration
**Goal**: Google One Tap is suppressed on onboarding pages, the referer is saved before redirect, and `/onboarding` routes are excluded from referer history
**Depends on**: Phase 100
**Requirements**: INTEG-01, INTEG-02, INTEG-03
**Success Criteria** (what must be TRUE):
  1. Google One Tap overlay does not appear on `/onboarding` or `/onboarding/thankyou`
  2. "Volver a Waldo" on the thank-you page returns the user to the page they were visiting before being redirected to onboarding
  3. Navigating through `/onboarding` pages does not pollute `appStore.referer` with onboarding URLs
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 099. Onboarding UI | 3/3 | Complete   | 2026-03-19 | - |
| 100. Guard | v1.45 | 0/? | Not started | - |
| 101. Integration | v1.45 | 0/? | Not started | - |
