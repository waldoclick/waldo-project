---
phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie
plan: "05"
subsystem: auth
tags: [jwt, httponly-cookie, session, middleware, uploads, logout, nuxt, strapi]

# Dependency graph
requires:
  - phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie
    provides: "Plan 01 composables (useSessionUser, useSessionAuth) and session plugin"
  - phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie
    provides: "Plan 02 server routes: verify-code.post.ts, logout.post.ts, proxy Authorization injection"
provides:
  - "FormVerifyCode.vue: drops setToken; calls fetchUser after server route sets httpOnly cookie"
  - "useImage.uploadFiles: no useStrapiToken, no manual Authorization header; proxy injects auth"
  - "UploadMedia.vue: no useStrapiToken, no manual Authorization header; proxy injects auth"
  - "useLogout: POST /api/auth/logout (server clears httpOnly cookie); no document.cookie hack"
  - "auth.ts, onboarding-guard.global.ts, dashboard-guard.global.ts, guest.ts: useStrapiToken eliminated; fetchUser unconditional on client"
affects:
  - "129-06 (module removal sweep depends on all useStrapiToken references eliminated)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Guards call fetchUser() unconditionally on client — no token gate (httpOnly cookie is unreadable client-side)"
    - "Logout via $fetch POST /api/auth/logout + useSessionUser().value = null (server clears cookie, client clears state)"
    - "Upload components send no Authorization header — proxy reads waldo_jwt httpOnly cookie and injects Bearer token"
    - "FormVerifyCode: await bare apiClient() — no responseRaw.jwt consumed; fetchUser() reads cookie set by server route"

key-files:
  created: []
  modified:
    - apps/website/app/components/FormVerifyCode.vue
    - apps/website/app/composables/useImage.ts
    - apps/website/app/components/UploadMedia.vue
    - apps/website/app/composables/useLogout.ts
    - apps/website/app/middleware/auth.ts
    - apps/website/app/middleware/onboarding-guard.global.ts
    - apps/website/app/middleware/dashboard-guard.global.ts
    - apps/website/app/middleware/guest.ts
    - apps/website/tests/composables/useLogout.test.ts
    - apps/website/tests/middleware/dashboard-guard.test.ts

key-decisions:
  - "FormVerifyCode drops const responseRaw — the server route returns { user } not { jwt }; no field on response is consumed; fetchUser() reads from cookie"
  - "guest.ts added to scope — plan's app-wide verification grep catches all middleware; pre-existing useStrapiUser mechanical rename applied"
  - "dashboard-guard SSR path: if (import.meta.server) return navigateTo('/login') — on SSR with no user, redirect immediately rather than calling fetchUser in SSR context"
  - "useLogout: $fetch('/api/auth/logout') + useSessionUser().value = null — explicit double-clear (server deletes cookie, client clears reactive state)"

patterns-established:
  - "Zero useStrapiToken references remain in apps/website/app/ — proxy owns Authorization, client never touches token"
  - "Middleware guards: SSR fail-open then unconditional client fetchUser(); 401 from proxy sets user null silently — no token guard anywhere"

requirements-completed: [VERIFYCODE-NO-SETTOKEN, UPLOADS-NO-TOKEN, LOGOUT-SERVER-ROUTE, GUARDS-NO-TOKEN]

# Metrics
duration: 20min
completed: 2026-06-14
---

# Phase 129 Plan 05: Client Token Elimination (verify-code, uploads, logout, guards) Summary

**useStrapiToken fully eliminated from website app: verify-code calls fetchUser after cookie is set server-side, uploads rely on proxy Authorization injection, logout posts to server route, all four middleware guards are token-free and user-state-based**

## Performance

- **Duration:** 20 min
- **Started:** 2026-06-14T01:15:00Z
- **Completed:** 2026-06-14T01:35:00Z
- **Tasks:** 3
- **Files modified:** 10 (8 source + 2 tests, including guest.ts deviation)

## Accomplishments
- `FormVerifyCode.vue`: removed `setToken(responseRaw.jwt)` and dropped `const responseRaw =` (unused var); calls `useSessionAuth().fetchUser()` after the server route has set the httpOnly cookie
- `useImage.ts` and `UploadMedia.vue`: removed `useStrapiToken()` and manual `Authorization: Bearer ${token.value}` header from upload fetch calls; the Nitro proxy now injects the header from the httpOnly cookie
- `useLogout.ts`: replaced `useStrapiAuth().logout()` + `document.cookie = ...max-age=0` with `$fetch("/api/auth/logout", { method: "POST" })` + `useSessionUser().value = null`; client can never clear an httpOnly cookie
- All four middleware guards (`auth.ts`, `onboarding-guard.global.ts`, `dashboard-guard.global.ts`, `guest.ts`): eliminated `useStrapiToken()` gate; client calls `fetchUser()` unconditionally — 401 = anonymous, no side effects
- 11 unit tests passing (5 useLogout + 6 dashboard-guard) with user-state-based stubs, no token stubs

## Task Commits

Each task was committed atomically:

1. **Task 1: FormVerifyCode.vue + uploads — drop setToken, cache-bust, and manual Authorization** - `5175b58a` (feat)
2. **Task 2: useLogout.ts — call server logout route; remove document.cookie clearing** - `ec6ecf2d` (feat)
3. **Task 3: Middleware guards — drop useStrapiToken guard, fetchUser unconditional on client** - `8063d29e` (feat)

## Files Created/Modified
- `apps/website/app/components/FormVerifyCode.vue` - Remove setToken + drop responseRaw; switch to useSessionAuth/useSessionUser
- `apps/website/app/composables/useImage.ts` - Remove useStrapiToken + Authorization header from uploadFiles
- `apps/website/app/components/UploadMedia.vue` - Remove useStrapiToken + Authorization header from uploadToStrapi
- `apps/website/app/composables/useLogout.ts` - Replace strapiLogout + document.cookie with $fetch POST; drop useStrapiAuth import
- `apps/website/app/middleware/auth.ts` - Replace useStrapiToken/useStrapiAuth with unconditional useSessionAuth.fetchUser; shorten stale comment
- `apps/website/app/middleware/onboarding-guard.global.ts` - Remove useStrapiToken block; SSR fail-open then unconditional fetchUser on client; preserve all exemption/manager/onboarding logic
- `apps/website/app/middleware/dashboard-guard.global.ts` - Remove useStrapiToken block; use useSessionUser<User>/useSessionAuth; keep D-03 roleName null return
- `apps/website/app/middleware/guest.ts` - Mechanical rename useStrapiUser → useSessionUser (caught by app-wide verification grep)
- `apps/website/tests/composables/useLogout.test.ts` - Replace useStrapiAuth.logout mock with $fetch mock; assert POST /api/auth/logout and ordering
- `apps/website/tests/middleware/dashboard-guard.test.ts` - Remove useStrapiToken stub; replace useStrapiUser/Auth stubs with useSessionUser/useSessionAuth

## Decisions Made
- `FormVerifyCode.vue` drops `const responseRaw =` entirely — the server route no longer returns `{ jwt }` (returns `{ user }`), but we don't consume the user object either; `fetchUser()` is the authoritative source via the httpOnly cookie
- `guest.ts` was added to this plan's scope — the plan's app-wide verification grep (`! grep -rq "useStrapiUser" app/middleware/`) would fail without it; one-line mechanical rename applied under deviation Rule 2 (correctness of the verification guarantee)
- `dashboard-guard.global.ts` SSR path: `if (import.meta.server) return navigateTo("/login")` — on SSR with no user state available, redirect immediately rather than calling fetchUser in SSR context where cookies may not be forwarded
- `useLogout` does explicit `useSessionUser().value = null` after the server POST — ensures reactive client state is cleared immediately, not waiting for the next fetchUser

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added guest.ts to middleware migration scope**
- **Found during:** Task 3 verification (app-wide useStrapiUser/useStrapiAuth grep)
- **Issue:** `apps/website/app/middleware/guest.ts` contained `useStrapiUser()` — the plan's verification grep `! grep -rq "useStrapiUser\|useStrapiAuth" app/middleware/` would fail
- **Fix:** Mechanical rename `useStrapiUser()` → `useSessionUser()` (one line, no logic change)
- **Files modified:** `apps/website/app/middleware/guest.ts`
- **Verification:** `! grep -rq "useStrapiUser\|useStrapiAuth" app/middleware/` now passes
- **Committed in:** `8063d29e` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing from plan scope but required for plan verification)
**Impact on plan:** Trivial — one-line rename. No logic change, no scope creep.

## Issues Encountered
- None — all plan tasks executed cleanly; test rewrites matched expected patterns from advisor guidance

## Known Stubs
None — all changes are functional. The verify-code flow depends on `verify-code.post.ts` (plan 02, already complete) to set the httpOnly cookie. End-to-end verification is deferred to plan 06 human-verify checkpoints per plan design.

## Next Phase Readiness
- `useStrapiToken` is fully eliminated from `apps/website/app/` — confirmed by `! grep -rn "useStrapiToken" apps/website/app/`
- Plan 06 (module removal + session.ts plugin activation) can now proceed — all client token reads/writes outside OAuth surface are eliminated
- Plan 04 (login/google.vue + google-one-tap + providers) is the remaining sibling wave-2 plan; its files are independent of this plan's changes

---
*Phase: 129-eliminate-nuxtjs-strapi-and-centralize-session-auth-and-http-through-the-proxy-with-httponly-cookie*
*Completed: 2026-06-14*
