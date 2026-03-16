---
phase: 092-cookie-domain-migration
verified: 2026-03-16T14:15:00Z
status: human_needed
score: 6/6 must-haves verified
human_verification:
  - test: "Login on waldo.click → navigate to dashboard.waldo.click without login prompt (SESS-01)"
    expected: "Dashboard loads with authenticated user state — no redirect to /auth/login"
    why_human: "Requires COOKIE_DOMAIN=.waldo.click set in both apps and both apps running on real subdomains or staged /etc/hosts entries"
  - test: "Login on dashboard.waldo.click → visit waldo.click, confirm user avatar/name loads (SESS-02)"
    expected: "Website shows authenticated state (name/avatar visible) without re-login"
    why_human: "Same as above — cross-subdomain cookie sharing cannot be verified in localhost without a shared parent domain"
  - test: "Logout on website → navigate to dashboard.waldo.click, confirm login page shown (SESS-03)"
    expected: "Dashboard shows /auth/login — shared waldo_jwt cookie has been cleared from .waldo.click domain"
    why_human: "Requires staging or production environment with COOKIE_DOMAIN set"
  - test: "Logout on dashboard → navigate to waldo.click, confirm logged-out state (SESS-04)"
    expected: "Website shows logged-out state — shared cookie gone"
    why_human: "Same environment requirement as SESS-03"
---

# Phase 092: Cookie Domain Migration — Verification Report

**Phase Goal:** Users authenticated on one subdomain are automatically recognized on the other — login once, access both apps; logout anywhere clears both
**Verified:** 2026-03-16T14:15:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from PLAN must_haves + ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | When `COOKIE_DOMAIN=.waldo.click` is set, both apps emit `Set-Cookie` with `domain=.waldo.click` | ✓ VERIFIED | Conditional spread `...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})` confirmed in both `nuxt.config.ts` strapi.cookie blocks. `@nuxtjs/strapi` passes cookie options verbatim to `useCookie()`. |
| 2 | When `COOKIE_DOMAIN` is unset, both apps emit a host-only cookie (no domain attribute) — local dev unchanged | ✓ VERIFIED | The `?: {}` fallback in both configs emits no `domain` property when env var is absent. Confirmed by direct file inspection. |
| 3 | Logout clears the old host-only `waldo_jwt` cookie (no domain attr) to prevent zombie sessions | ✓ VERIFIED | `document.cookie = "waldo_jwt=; path=/; max-age=0"` present in both `useLogout.ts` composables inside `if (import.meta.client)` guard, **before** `strapiLogout()` call. Ordering confirmed. |
| 4 | `strapiLogout()` clears the new shared cookie (`domain=.waldo.click`) | ✓ VERIFIED | `strapiLogout()` → `setToken(null)` → `token.value = null` on the `useCookie(cookieName, config.strapi.cookie)` ref. Since `config.strapi.cookie` includes `domain` in production, the cookie is cleared with the correct domain attribute. Source: `node_modules/@nuxtjs/strapi/dist/runtime/composables/useStrapiAuth.js` + `useStrapiToken.js`. |
| 5 | `.env.example` in both apps documents `COOKIE_DOMAIN` with production + staging values | ✓ VERIFIED | Both files contain the 3-line comment block with header + `# COOKIE_DOMAIN=.waldo.click  # production` + `# COOKIE_DOMAIN=.waldoclick.dev  # staging`. Lines commented out by design — local dev must not set this var. |
| 6 | All logout call sites in both apps flow through `useLogout` composable (no bypass paths) | ✓ VERIFIED | Website: 3 call sites (MobileBar.vue, MenuUser.vue, SidebarAccount.vue) all destructure `const { logout } = useLogout()`. Dashboard: 3 call sites (DropdownUser.vue, FormVerifyCode.vue, guard.global.ts) all use `useLogout()`. No raw `useStrapiAuth().logout()` calls found outside composables. |

**Automated Score:** 6/6 truths verified programmatically

**Human-gated truths (require staging/production):**
- SESS-01: Login on one subdomain → recognized on the other (cross-subdomain cookie sharing)
- SESS-02: Reverse direction of SESS-01
- SESS-03: Logout on website → dashboard session cleared
- SESS-04: Logout on dashboard → website session cleared

These 4 truths are architecturally satisfied by the implementation but **can only be confirmed with `COOKIE_DOMAIN` set and both apps served on real subdomains under a shared parent domain**.

---

### Required Artifacts

| Artifact | Provides | Status | Details |
|----------|----------|--------|---------|
| `apps/website/nuxt.config.ts` | Conditional domain spread in `strapi.cookie` block | ✓ VERIFIED | Lines 287–290: `...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {})` present and substantive |
| `apps/dashboard/nuxt.config.ts` | Conditional domain spread in `strapi.cookie` block | ✓ VERIFIED | Lines 239–242: identical pattern confirmed |
| `apps/website/app/composables/useLogout.ts` | Old-cookie cleanup before `strapiLogout()` | ✓ VERIFIED | Lines 26–29: `if (import.meta.client) { document.cookie = "waldo_jwt=; path=/; max-age=0"; }` confirmed BEFORE `await strapiLogout()` at line 31 |
| `apps/dashboard/app/composables/useLogout.ts` | Old-cookie cleanup before `strapiLogout()` | ✓ VERIFIED | Lines 18–21: same pattern, BEFORE `await strapiLogout()` at line 22 |
| `apps/website/.env.example` | `COOKIE_DOMAIN` env var documentation | ✓ VERIFIED | 3-line comment block with header, production, and staging values at lines 7–9 |
| `apps/dashboard/.env.example` | `COOKIE_DOMAIN` env var documentation | ✓ VERIFIED | 3-line comment block at lines 8–10 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `apps/website/nuxt.config.ts` strapi.cookie | `process.env.COOKIE_DOMAIN` | conditional spread | ✓ WIRED | Pattern `COOKIE_DOMAIN.*domain` confirmed at line 287 |
| `apps/dashboard/nuxt.config.ts` strapi.cookie | `process.env.COOKIE_DOMAIN` | conditional spread | ✓ WIRED | Pattern confirmed at line 239 |
| `apps/website/app/composables/useLogout.ts` | `document.cookie` old-cookie cleanup | `document.cookie = assignment before strapiLogout()` | ✓ WIRED | `document.cookie.*waldo_jwt` pattern confirmed; ordering verified |
| `apps/dashboard/app/composables/useLogout.ts` | `document.cookie` old-cookie cleanup | `document.cookie = assignment before strapiLogout()` | ✓ WIRED | Same as above |
| `apps/website/.env.example` | `apps/website/nuxt.config.ts` strapi.cookie conditional | `COOKIE_DOMAIN` env var | ✓ WIRED | Both files reference `COOKIE_DOMAIN`; production value `.waldo.click` documented |
| All 6 logout call sites | `useLogout` composable | `const { logout } = useLogout()` | ✓ WIRED | MobileBar, MenuUser, SidebarAccount (website); DropdownUser, FormVerifyCode, guard.global.ts (dashboard) — all use composable, no bypass paths |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SESS-01 | 092-01 | User authenticated on website is auto-authenticated on dashboard | ? NEEDS HUMAN | Cookie domain spread implemented; cross-subdomain recognition requires runtime verification with `COOKIE_DOMAIN` set |
| SESS-02 | 092-01 | User authenticated on dashboard is auto-authenticated on website | ? NEEDS HUMAN | Same as SESS-01 |
| SESS-03 | 092-01 | Logout on website clears dashboard session | ? NEEDS HUMAN | `strapiLogout()` clears shared cookie with domain attr; passive session clearing confirmed in strapi module source; active dashboard redirect requires browser visit |
| SESS-04 | 092-01 | Logout on dashboard clears website session | ? NEEDS HUMAN | Same mechanism as SESS-03 |
| SESS-05 | 092-01 | Shared cookie configured via `COOKIE_DOMAIN` env var per environment | ✓ SATISFIED | Conditional spread in both `nuxt.config.ts`; `.env.example` documents prod (`.waldo.click`) and staging (`.waldoclick.dev`) values |
| SESS-06 | 092-01 | Local dev without `COOKIE_DOMAIN` unaffected — host-only cookie | ✓ SATISFIED | `?: {}` fallback in conditional spread emits no domain attribute when env var is unset |
| SAFE-02 | 092-01 | Pre-migration host-only `waldo_jwt` cleared on logout to prevent zombie sessions | ✓ SATISFIED | `document.cookie = "waldo_jwt=; path=/; max-age=0"` in both composables, before `strapiLogout()`, inside `import.meta.client` guard |
| SAFE-03 | 092-02 | `.env.example` in both apps documents `COOKIE_DOMAIN` | ✓ SATISFIED | Both files contain commented-out block with production + staging values |

**Note — REQUIREMENTS.md sync gap:** The traceability table in `.planning/REQUIREMENTS.md` still marks SAFE-02 and all SESS-* as `Pending`. The checkbox `- [ ]` for SAFE-02 is also unchecked. The implementation is present and verified — this is a documentation staleness issue, not a code deficiency. The REQUIREMENTS.md should be updated to mark SAFE-02 as `[x]` and update the traceability table.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No anti-patterns detected | — | — |

Scanned for: TODO/FIXME/XXX/HACK/PLACEHOLDER, `return null`, `return {}`, `return []`, empty handlers, console.log-only implementations. All clear across the 6 modified files.

---

### TypeCheck Results

| App | Result |
|-----|--------|
| `waldo-website` | ✅ Pass (0 errors) |
| `waldo-dashboard` | ✅ Pass (0 errors) |

---

### Human Verification Required

These items cannot be verified programmatically — they require both apps running on real subdomains with `COOKIE_DOMAIN=.waldo.click` set (staging or production environment, or local `/etc/hosts` with a shared parent domain).

#### 1. SESS-01: Website login → Dashboard access without re-authentication

**Test:** Set `COOKIE_DOMAIN=.waldo.click` in both apps. Start both on subdomains. Log in on `waldo.click` as a manager user. Open `dashboard.waldo.click` in the same browser.
**Expected:** Dashboard loads authenticated — user is recognized without being prompted to log in. Pinia `me` store populates from the shared `waldo_jwt` cookie.
**Why human:** Requires a real shared-parent-domain environment — `localhost` cannot share cookies across "subdomains" (e.g. `app1.localhost` and `app2.localhost`).

#### 2. SESS-02: Dashboard login → Website recognition

**Test:** Same environment. Log in on `dashboard.waldo.click`. Visit `waldo.click`.
**Expected:** Website shows authenticated state (user name/avatar visible in header/nav).
**Why human:** Same environment constraint.

#### 3. SESS-03: Website logout → Dashboard session cleared

**Test:** Log in on both subdomains. Click logout on `waldo.click`. Navigate to `dashboard.waldo.click`.
**Expected:** Dashboard redirects to `/auth/login` — the shared `waldo_jwt` cookie was cleared with `Domain=.waldo.click` by `strapiLogout()`, so both subdomains lose the token on the next request.
**Why human:** Requires staging environment with real domain names.

#### 4. SESS-04: Dashboard logout → Website session cleared

**Test:** Log in on both subdomains. Click logout on `dashboard.waldo.click`. Visit `waldo.click`.
**Expected:** Website shows logged-out state — no name/avatar, "login" button visible.
**Why human:** Same environment constraint.

---

### Gaps Summary

No code gaps detected. All 6 must-have artifacts exist, are substantive, and are correctly wired. The phase is code-complete.

The `human_needed` status reflects that 4 of the 8 requirements (SESS-01 through SESS-04) describe **runtime, cross-subdomain behavior** that requires a real subdomain environment for full confirmation. The implementation is architecturally correct:

- The `waldo_jwt` cookie will carry `Domain=.waldo.click` when `COOKIE_DOMAIN` is set → both `waldo.click` and `dashboard.waldo.click` browsers will send/receive the same cookie.
- `strapiLogout()` sets `token.value = null` on the `useCookie()` ref that was initialized with `domain: COOKIE_DOMAIN` → clears the shared cookie with the correct domain scope.
- The old host-only cookie cleanup prevents zombie sessions from lingering after migration.

**Ancillary documentation gap (non-blocking):** `.planning/REQUIREMENTS.md` traceability table and checkboxes for SAFE-02 and all SESS-* should be updated to reflect implementation status (`Complete` / `[x]`).

---

*Verified: 2026-03-16T14:15:00Z*
*Verifier: Claude (gsd-verifier)*
