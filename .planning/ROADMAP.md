# Roadmap: Waldo Project

## Milestones

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
- 🚧 **v1.36 Two-Step Login Verification** — Phases 077–079 (in progress)

## Phases

- [x] **Phase 077: Strapi 2-Step Backend** — verification-code content type, overridden auth.local controller, verify-code and resend-code endpoints, MJML email, Google OAuth bypass (completed 2026-03-13)
- [ ] **Phase 078: Dashboard Verify Flow** — updated FormLogin + /auth/verify-code page with full verify/resend/error/redirect logic
- [ ] **Phase 079: Website Verify Flow** — updated FormLogin + /login/verificar page with full verify/resend/error/redirect logic

<details>
<summary>✅ v1.35 Gift Reservations to Users (Phases 075–076) — SHIPPED 2026-03-13</summary>

- [x] Phase 075: Strapi Gift Endpoints (2/2 plans) — completed 2026-03-13
- [x] Phase 076: Dashboard Gift Lightbox (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.34 LightBoxArticles (Phases 073–074) — SHIPPED 2026-03-13</summary>

- [x] Phase 073: Tavily Search Backend (2/2 plans) — completed 2026-03-13
- [x] Phase 074: LightBoxArticles Dashboard (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.33 Anthropic Claude AI Service (Phase 072) — SHIPPED 2026-03-13</summary>

- [x] Phase 072: Anthropic Claude AI Service (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.32 Gemini AI Service (Phase 071) — SHIPPED 2026-03-13</summary>

- [x] Phase 071: Gemini AI Service (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.31 Article Manager Improvements (Phases 069–070) — SHIPPED 2026-03-13</summary>

- [x] Phase 069: Strapi Schema (1/1 plan) — completed 2026-03-13
- [x] Phase 070: Dashboard Form & Detail (1/1 plan) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.30 Blog Public Views (Phases 065–068) — SHIPPED 2026-03-13</summary>

- [x] Phase 065: Strapi Slug Field (1/1 plan) — completed 2026-03-13
- [x] Phase 066: Article Infrastructure (2/2 plans) — completed 2026-03-13
- [x] Phase 067: Blog Listing Page (3/3 plans) — completed 2026-03-13
- [x] Phase 068: Blog Detail Page (2/2 plans) — completed 2026-03-13

</details>

<details>
<summary>✅ v1.29 News Manager (Phases 063–064) — SHIPPED 2026-03-12</summary>

- [x] Phase 063: News Content Type (1/1 plan) — completed 2026-03-12
- [x] Phase 064: Dashboard Articles UI (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.28 Logout Store Cleanup (Phase 062) — SHIPPED 2026-03-12</summary>

- [x] Phase 062: Logout Store Cleanup (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.27 Reparar eventos GA4 ecommerce (Phase 061) — SHIPPED 2026-03-12</summary>

- [x] Phase 061: Fix GA4 ecommerce events (2/2 plans) — completed 2026-03-12

</details>

<details>
<summary>✅ v1.26 Mostrar comprobante Webpay (Phase 060) — SHIPPED 2026-03-11</summary>

- [x] Phase 060: Mostrar comprobante Webpay (3/3 plans) — completed 2026-03-11

</details>

## Phase Details

### Phase 077: Strapi 2-Step Backend
**Goal**: Strapi intercepts email/password login, issues a `pendingToken` instead of a JWT, stores a time-limited 6-digit code, and provides verify/resend endpoints — Google OAuth flows through unmodified
**Depends on**: Nothing (first phase of milestone)
**Requirements**: VSTEP-01, VSTEP-02, VSTEP-03, VSTEP-04, VSTEP-05, VSTEP-06, VSTEP-07, VSTEP-08
**Success Criteria** (what must be TRUE):
  1. Calling `POST /api/auth/local` with valid credentials returns `{ pendingToken, email }` — no JWT in the response
  2. The user receives an email with a 6-digit code within seconds of login; a `verification-code` record exists in Strapi with `userId`, `code`, `expiresAt`, `attempts`, and `pendingToken`
  3. Calling `POST /api/auth/verify-code` with a valid `pendingToken` + `code` returns a full Strapi login response (JWT + user) — same shape as the pre-2-step response
  4. Three failed `verify-code` attempts invalidate the code; submitting a fourth attempt returns an error and a fresh login is required
  5. `POST /api/connect/google/callback` still issues a JWT directly — Google OAuth users are never redirected to a verify step
**Plans**: 4 plans

Plans:
- [ ] 077-01-PLAN.md — verification-code content type (schema + scaffolding)
- [ ] 077-02-PLAN.md — verification-code.mjml email template in Spanish
- [ ] 077-03-PLAN.md — overrideAuthLocal + verifyCode + resendCode controllers + plugin wiring
- [ ] 077-04-PLAN.md — verification-code-cleanup cron + cron-tasks.ts + cron-runner.ts wiring

### Phase 078: Dashboard Verify Flow
**Goal**: Dashboard users complete login through the 2-step verify page — `FormLogin` hands off to `/auth/verify-code`, which verifies the code and restores the existing post-login behavior
**Depends on**: Phase 077
**Requirements**: VSTEP-09, VSTEP-10, VSTEP-11, VSTEP-12
**Success Criteria** (what must be TRUE):
  1. Submitting valid email+password on `/auth/login` no longer logs in directly — the browser navigates to `/auth/verify-code` and the user is prompted for a 6-digit code
  2. The verify page shows a code input, a "Verificar" button, and a "Reenviar código" button that is disabled for 60 seconds after each send
  3. Entering the correct code on `/auth/verify-code` completes login — the JWT is stored via `useStrapiAuth()` and the user arrives at `/` (with manager-role check applied)
  4. When the code expires or the attempt limit is reached, a Swal error appears and the user is redirected back to `/auth/login` to start over
**Plans**: 2 plans

Plans:
- [ ] 078-01-PLAN.md — FormLogin.vue: replace useStrapiAuth().login() with direct POST + pendingToken handoff
- [ ] 078-02-PLAN.md — /auth/verify-code page: code input, 60s resend, JWT storage, role check, error flows

### Phase 079: Website Verify Flow
**Goal**: Website users complete login through the 2-step verify page — `FormLogin` hands off to `/login/verificar`, which verifies the code and restores the existing post-login behavior (referer redirect + profile-complete check)
**Depends on**: Phase 077
**Requirements**: VSTEP-13, VSTEP-14, VSTEP-15, VSTEP-16
**Success Criteria** (what must be TRUE):
  1. Submitting valid email+password on `/login` no longer logs in directly — the browser navigates to `/login/verificar` and the user is prompted for a 6-digit code
  2. The verify page shows a code input, a "Verificar" button, and a "Reenviar código" button that is disabled for 60 seconds after each send
  3. Entering the correct code on `/login/verificar` completes login — JWT is stored and the user is redirected per existing post-login logic (referer → `/anuncios` fallback), with profile-complete check applied
  4. When the code expires or the attempt limit is reached, a Swal error appears and the user is redirected back to `/login` to start over
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
|-------|-----------|----------------|-------------|------------|
| 060   | v1.26     | 3/3            | Complete    | 2026-03-11 |
| 061   | v1.27     | 2/2            | Complete    | 2026-03-12 |
| 062   | v1.28     | 2/2            | Complete    | 2026-03-12 |
| 063   | v1.29     | 1/1            | Complete    | 2026-03-12 |
| 064   | v1.29     | 2/2            | Complete    | 2026-03-12 |
| 065   | v1.30     | 1/1            | Complete    | 2026-03-13 |
| 066   | v1.30     | 2/2            | Complete    | 2026-03-13 |
| 067   | v1.30     | 3/3            | Complete    | 2026-03-13 |
| 068   | v1.30     | 2/2            | Complete    | 2026-03-13 |
| 069   | v1.31     | 1/1            | Complete    | 2026-03-13 |
| 070   | v1.31     | 1/1            | Complete    | 2026-03-13 |
| 071   | v1.32     | 1/1            | Complete    | 2026-03-13 |
| 072   | v1.33     | 1/1            | Complete    | 2026-03-13 |
| 073   | v1.34     | 2/2            | Complete    | 2026-03-13 |
| 074   | v1.34     | 2/2            | Complete    | 2026-03-13 |
| 075   | v1.35     | 2/2            | Complete    | 2026-03-13 |
| 076   | v1.35     | 2/2            | Complete    | 2026-03-13 |
| 077   | 4/4 | Complete    | 2026-03-13 | —          |
| 078   | 1/2 | In Progress|  | —          |
| 079   | v1.36     | 0/TBD          | Not started | —          |
