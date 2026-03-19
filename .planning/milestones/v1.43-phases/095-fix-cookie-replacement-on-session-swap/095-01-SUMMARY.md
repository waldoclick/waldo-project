---
phase: 095-fix-cookie-replacement-on-session-swap
plan: "01"
subsystem: auth
tags: [cookie, session, strapi, nuxt, jwt, ssr]

# Dependency graph
requires:
  - phase: 094-diagnose-fix-session-persistence
    provides: root-cause analysis of dead populate joins causing setToken(null) on SSR timeout
provides:
  - Correct session cookie clearing on dashboard login when website session already exists
  - Lean auth.populate in both website and dashboard (no dead relational joins)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Use useStrapiAuth().logout() (not useCookie().value=null) to clear JWT cookies respecting COOKIE_DOMAIN attribute"
    - "auth.populate should only include fields present in the User TypeScript interface and consumed by components"

key-files:
  created: []
  modified:
    - apps/dashboard/app/components/FormLogin.vue
    - apps/website/nuxt.config.ts
    - apps/dashboard/nuxt.config.ts

key-decisions:
  - "Use useStrapiAuth().logout() instead of useLogout() composable mid-login — useLogout() resets Pinia stores and navigates away, which breaks the in-progress login flow"
  - "Remove ad_reservations.ad and ad_featured_reservations.ad from auth.populate in both apps — not in User type, not consumed by any component, cause heavy joins on every SSR /users/me"

patterns-established:
  - "Cookie clearing pattern: always use useStrapiAuth().logout() to clear waldo_jwt — it reads the full cookie options (name, domain, path) from nuxt.config.ts strapi.cookie block"

requirements-completed: [SESS-05, SESS-06, SESS-07, SESS-08]

# Metrics
duration: 2min
completed: 2026-03-18
---

# Phase 095 Plan 01: Fix Cookie Replacement on Session Swap Summary

**Replaced `existingCookie.value = null` with `await useStrapiAuth().logout()` in FormLogin.vue to correctly clear both host-only and shared-domain `waldo_jwt` cookies; removed dead `ad_reservations.ad` and `ad_featured_reservations.ad` joins from `auth.populate` in both apps**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-18T23:57:41Z
- **Completed:** 2026-03-18T23:59:26Z
- **Tasks:** 2 (+ 1 checkpoint awaiting human verification)
- **Files modified:** 3

## Accomplishments
- Fixed zombie-cookie bug: `existingCookie.value = null` only cleared host-only cookie; `await strapiLogout()` from `useStrapiAuth()` respects the `domain` attribute from the module config and clears both cookie scopes
- Removed dead relational joins from website and dashboard `auth.populate` — same SSR slowness root cause diagnosed in Phase 094 (re-added by commit `33eb248` after that fix)
- TypeScript typechecks pass in both apps

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix FormLogin.vue session cookie clearing** - `e9b764a` (fix)
2. **Task 2: Remove dead auth.populate joins from both nuxt.config.ts files** - `ac49aeb` (perf)

**Plan metadata:** (pending — awaiting human-verify checkpoint)

## Files Created/Modified
- `apps/dashboard/app/components/FormLogin.vue` — Replaced `existingCookie.value = null` with `useStrapiAuth().logout()` call so shared-domain cookie is cleared correctly
- `apps/website/nuxt.config.ts` — Removed `ad_reservations.ad` and `ad_featured_reservations.ad` from `strapi.auth.populate`
- `apps/dashboard/nuxt.config.ts` — Same removal; retained `role`, `commune`, `region`, `business_region`, `business_commune`

## Decisions Made
- **`useStrapiAuth().logout()` vs `useLogout()` composable:** Used the lower-level `useStrapiAuth().logout()` directly because the full `useLogout()` composable also resets Pinia stores (appStore, meStore, searchStore) and navigates to `/auth/login` — both destructive in the middle of a login flow. The plan explicitly documented this distinction.
- **Why not `existingCookie.value = null`:** `useCookie()` in Nuxt clears only the host-only cookie (no domain attribute). The shared-domain version (with `domain=.COOKIE_DOMAIN`) survives because it was set with an explicit domain and must be cleared with the same domain. `useStrapiAuth().logout()` reads the full cookie config from `nuxt.config.ts strapi.cookie` block and issues a `Set-Cookie` header with the correct attributes.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Code changes are complete and TypeScript-clean
- Human verification required: confirm single `waldo_jwt` cookie after session swap, dashboard stays authenticated on hard refresh
- Checkpoint awaits browser-level verification (see checkpoint details below)

### Checkpoint: Human Verification Required

**What was built:**
1. FormLogin.vue — session replacement now calls `await strapiLogout()` from `useStrapiAuth()`, clearing both host-only and shared-domain `waldo_jwt` cookies correctly
2. Both nuxt.config.ts files — `ad_reservations.ad` and `ad_featured_reservations.ad` removed from `auth.populate`

**How to verify:**

**Local smoke test (without staging COOKIE_DOMAIN):**
1. Start website (`yarn workspace waldo-website dev`) and dashboard (`yarn workspace waldo-dashboard dev`)
2. Log in on the website (`http://localhost:3000`) as a regular user — confirm `waldo_jwt` cookie appears in DevTools → Application → Cookies
3. Navigate to dashboard (`http://localhost:3001`) — the login form should detect the existing session and show the Swal warning
4. Click "Continuar" — the login should proceed to the 2-step verify-code page without errors
5. Complete login on dashboard — after `setToken()` is called, check DevTools → Application → Cookies: should show exactly **one** `waldo_jwt` cookie for `localhost`
6. Hard-refresh the dashboard (`Ctrl+Shift+R`) — manager should stay authenticated, NOT redirected to `/auth/login`

**Staging smoke test (with real shared-domain cookies):**
1. Log in on `https://waldo.waldoclick.dev` (website) as any user
2. Open `https://admin.waldoclick.dev` (dashboard) — Swal warning should appear
3. Click "Continuar" and complete 2-step login
4. DevTools → Application → Cookies: confirm **single** `waldo_jwt` cookie with `Domain=.waldoclick.dev` — no duplicate with different scope
5. Hard-refresh dashboard → stay authenticated
6. Navigate back to website → manager cookie visible and user appears logged in

**Resume signal:** Type "approved" if authentication persists across refresh and no duplicate cookies are present. Describe any issues if the fix doesn't hold.

---
*Phase: 095-fix-cookie-replacement-on-session-swap*
*Completed: 2026-03-18*
