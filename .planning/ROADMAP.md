# Roadmap: Waldo Project

## Milestones

- 🚧 **v1.44 Google One Tap Sign-In** — Phases 096–098 (in progress). See below.
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

<details>
<summary>🚧 v1.44 Google One Tap Sign-In (Phases 096–098) — IN PROGRESS</summary>

- [x] **Phase 096: CSP & Environment Setup** — Add `connect-src`/`frame-src` for GIS and `GOOGLE_CLIENT_ID` env var (completed 2026-03-19)
- [x] **Phase 097: Strapi One Tap Endpoint** — `POST /api/auth/google-one-tap` with token verification, user upsert, and JWT response (completed 2026-03-19)
- [ ] **Phase 098: Frontend Rewrite + Logout Fix** — Plugin, composable rewrite, route guard, and `disableAutoSelect`


</details>

<details>
<summary>✅ v1.43 Cross-App Session Replacement (Phase 095) — SHIPPED 2026-03-19</summary>

- [x] Phase 095: Fix Cookie Replacement on Session Swap (1/1 plan) — completed 2026-03-19

</details>

<details>
<summary>✅ v1.42 Dashboard Session Persistence (Phase 094) — SHIPPED 2026-03-18</summary>

- [x] Phase 094: Diagnose & Fix Session Persistence (1/1 plan) — completed 2026-03-18

</details>

<details>
<summary>✅ v1.41 Ad Preview Error Handling (Phase 093) — SHIPPED 2026-03-18</summary>

- [x] Phase 093: Ad Preview Error Handling (2/2 plans) — completed 2026-03-18

</details>

<details>
<summary>✅ v1.40 Shared Authentication Session (Phases 091–092) — SHIPPED 2026-03-16</summary>

- [x] Phase 091: Dashboard useLogout Composable (1/1 plan) — completed 2026-03-16
- [x] Phase 092: Cookie Domain Migration (2/2 plans) — completed 2026-03-16

</details>

<details>
<summary>✅ v1.39 Unified API Client (Phases 089–090) — SHIPPED 2026-03-15</summary>

- [x] Phase 089: GET Support in useApiClient (1/1 plan) — completed 2026-03-15
- [x] Phase 090: Migrate All GET Callers (6/6 plans) — completed 2026-03-15

</details>

<details>
<summary>✅ v1.38 GA4 Analytics Audit & Implementation (Phases 083–085) — SHIPPED 2026-03-14</summary>

- [x] Phase 083: Ecommerce Bug Fixes (2/2 plans) — completed 2026-03-14
- [x] Phase 084: Ad Discovery Tracking (2/2 plans) — completed 2026-03-14
- [x] Phase 085: Contact, Auth & Blog Events (2/2 plans) — completed 2026-03-14

</details>

<details>
<summary>✅ v1.36 Two-Step Login Verification (Phases 077–078) — SHIPPED 2026-03-14</summary>

- [x] Phase 077: Strapi 2-Step Backend (4/4 plans) — completed 2026-03-13
- [x] Phase 078: Dashboard Verify Flow (2/2 plans) — completed 2026-03-14

</details>

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

<details>
<summary>✅ v1.37 Email Authentication Flows (Phases 079–082) — SHIPPED 2026-03-14</summary>

- [x] Phase 079: Website Verify Flow + MJML Fix (1/1 plan) — completed 2026-03-14
- [x] Phase 080: Password Reset MJML + Context Routing (2/2 plans) — completed 2026-03-14
- [x] Phase 081: Email Verification Frontend (2/2 plans) — completed 2026-03-14
- [x] Phase 082: Email Verification Backend Activation (1/1 plan) — completed 2026-03-14

</details>

## Phase Details

### Phase 096: CSP & Environment Setup

**Goal**: The infrastructure prerequisites for One Tap are in place — CSP allows GIS network traffic and Strapi has the Google Client ID it needs to verify tokens

**Depends on**: Nothing (prerequisite for all subsequent phases)

**Requirements**: GTAP-01, GTAP-02

**Success Criteria** (what must be TRUE):
  1. Chrome DevTools Network tab shows no CSP-blocked requests to `accounts.google.com/gsi/` — One Tap overlay can communicate with Google's FedCM endpoint without being silently blocked
  2. `apps/strapi` starts without errors after `GOOGLE_CLIENT_ID` is added to `.env` — the variable is present and accessible at runtime
  3. `.env.example` in `apps/strapi` documents `GOOGLE_CLIENT_ID` so future developers know the variable is required
  4. `nuxt.config.ts` `connect-src` and `frame-src` directives include `https://accounts.google.com/gsi/` — verified by inspecting the CSP header on a local build

**Plans**: 1 plan
- [ ] 096-01-PLAN.md — CSP GIS entries + GOOGLE_CLIENT_ID env setup

---

### Phase 097: Strapi One Tap Endpoint

**Goal**: A new `POST /api/auth/google-one-tap` endpoint verifies a Google credential JWT server-side and returns a valid Waldo session — independently testable before any frontend work

**Depends on**: Phase 096 (`GOOGLE_CLIENT_ID` must be present in Strapi env)

**Requirements**: GTAP-03, GTAP-04, GTAP-05, GTAP-06

**Success Criteria** (what must be TRUE):
  1. `curl -X POST /api/auth/google-one-tap -d '{"credential":"<valid-google-jwt>"}'` returns `{ jwt, user }` in the same shape as all other Strapi auth endpoints — the response is immediately usable by `setToken(jwt)` + `fetchUser()`
  2. Calling the endpoint with the credential of a user whose email already exists in Strapi returns the existing user's JWT — no duplicate account is created
  3. Calling the endpoint with a brand-new Google account creates a new Strapi user AND grants 3 free ad-reservation slots (same behaviour as email registration) — the new user can immediately create ads
  4. The endpoint does NOT trigger the 2-step verification-code flow — the Waldo JWT is returned directly, matching the existing `/connect/google` OAuth bypass behaviour
  5. Calling the endpoint with an invalid or expired Google credential returns a 4xx error — no JWT is issued for malformed tokens

**Plans**: 3 plans

Plans:
- [ ] 097-01-PLAN.md — Wave 0: Test scaffolds (RED) for service and controller
- [ ] 097-02-PLAN.md — schema google_sub field + GoogleOneTapService implementation (GREEN)
- [ ] 097-03-PLAN.md — auth-one-tap controller + routes wiring (GREEN)

---

### Phase 098: Frontend Rewrite + Logout Fix

**Goal**: One Tap appears automatically for unauthenticated users on public pages, signs them in via the new Strapi endpoint, and is cleanly suppressed after logout — with no dead-loops or SSR crashes

**Depends on**: Phase 096 (CSP), Phase 097 (Strapi endpoint must exist)

**Requirements**: GTAP-07, GTAP-08, GTAP-09, GTAP-10, GTAP-11, GTAP-12

**Success Criteria** (what must be TRUE):
  1. An unauthenticated user visiting any public page (home, ad listing, ad detail, blog) sees the Google One Tap overlay appear — the prompt fires without a page redirect or any manual action
  2. Completing One Tap signs the user in: the `waldo_jwt` cookie is set, the site header shows the user's name/avatar, and the user remains on the current page without a full-page reload
  3. Visiting a private route (`/cuenta/*`, `/pagar/*`, `/anunciar/*`) as an unauthenticated user does NOT trigger the One Tap overlay — no prompt appears on authenticated-only pages
  4. An already-authenticated user visiting any page does NOT see the One Tap overlay — the auth-state guard suppresses it for existing sessions
  5. After logout, the One Tap overlay does NOT immediately reappear — `disableAutoSelect()` clears the GIS auto-sign-in state so the user can stay logged out

**Plans**: 3 plans

Plans:
- [ ] 098-01-PLAN.md — Wave 1: TDD scaffolds (RED) for all changed files
- [ ] 098-02-PLAN.md — Wave 2: window.d.ts update + useLogout fix + useGoogleOneTap rewrite (GREEN)
- [ ] 098-03-PLAN.md — Wave 3: google-one-tap.client.ts plugin + layout cleanup + smoke test

---

### Phase 095: Fix Cookie Replacement on Session Swap

**Goal**: When a dashboard manager replaces an existing session, the old `waldo_jwt` cookie — including the shared-domain version — is fully removed before the new one is written

**Depends on**: Nothing (standalone one-file bug fix)

**Requirements**: SESS-05, SESS-06, SESS-07, SESS-08

**Success Criteria** (what must be TRUE):
  1. After session replacement, no `waldo_jwt` cookie with `Domain=.waldo.click` (or `.waldoclick.dev`) remains in the browser — DevTools Application → Cookies shows a single clean cookie for the new session
  2. After session replacement + hard refresh in the dashboard, the manager remains authenticated and is not redirected to `/auth/login`
  3. After session replacement + hard refresh in the website, the new manager cookie is present and readable — the user appears logged in on the website
  4. No duplicate `waldo_jwt` cookies with different `domain` scopes exist at any point after the replacement flow completes

**Plans**: TBD

---

### Phase 094: Diagnose & Fix Session Persistence

**Goal**: Dashboard users who log in through the 2-step verify-code flow remain authenticated after a page refresh — the guard never redirects an authenticated user to login

**Depends on**: Nothing (standalone bug fix)

**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04

**Success Criteria** (what must be TRUE):
  1. Root cause is identified and documented — specifically whether the issue is a missing/expired cookie set by `setToken()`, a failed `fetchUser()` call on page load, a race condition between the Strapi plugin auto-`fetchUser` and `guard.global.ts`, or a `cookieName`/`path`/`domain` mismatch
  2. After login → verify-code → page refresh, the `waldo_jwt` cookie is present in browser DevTools (Application → Cookies) with `path=/` and the correct `maxAge`
  3. After login → verify-code → page refresh, the dashboard loads the authenticated user's home page (`/`) without being redirected to `/auth/login`
  4. The full end-to-end flow is verified in local dev: login form → 6-digit code entry → `setToken()` + `fetchUser()` → hard browser refresh → user stays on `/` authenticated

**Plans**: 1 plan
- [x] 094-01-PLAN.md — Remove dead auth.populate joins; root cause documented — completed 2026-03-18

---

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
| 077   | v1.36     | 4/4            | Complete    | 2026-03-13 |
| 078   | v1.36     | 2/2            | Complete    | 2026-03-14 |
| 079   | v1.37     | 1/1            | Complete    | 2026-03-14 |
| 080   | v1.37     | 2/2            | Complete    | 2026-03-14 |
| 081   | v1.37     | 2/2            | Complete    | 2026-03-14 |
| 082   | v1.37     | 1/1            | Complete    | 2026-03-14 |
| 083   | v1.38     | 2/2            | Complete    | 2026-03-14 |
| 084   | v1.38     | 2/2            | Complete    | 2026-03-14 |
| 085   | v1.38     | 2/2            | Complete    | 2026-03-14 |
| 089   | v1.39     | 1/1            | Complete    | 2026-03-15 |
| 090   | v1.39     | 6/6            | Complete    | 2026-03-15 |
| 091   | v1.40     | 1/1            | Complete    | 2026-03-16 |
| 092   | v1.40     | 2/2            | Complete    | 2026-03-16 |
| 093   | v1.41     | 2/2            | Complete    | 2026-03-18 |
| 094   | v1.42     | 1/1            | Complete    | 2026-03-18 |
| 095   | v1.43     | 1/1            | Complete    | 2026-03-19 |
| 096   | 1/1 | Complete    | 2026-03-19 | -          |
| 097   | 3/3 | Complete    | 2026-03-19 | -          |
| 098   | 1/3 | In Progress|  | -          |
