---
phase: 098-frontend-rewrite-logout-fix
verified: 2026-03-19T14:25:00Z
status: gaps_found
score: 9/11 must-haves verified
gaps:
  - truth: "3 plugin tests from Plan 01 are GREEN"
    status: failed
    reason: "Plugin was extended in commit 216c57c (route guard for /login/* paths added) but the plugin test's vi.mock('#imports') block was never updated to include useRoute. All 3 plugin tests fail with: [vitest] No 'useRoute' export is defined on the '#imports' mock."
    artifacts:
      - path: "apps/website/tests/plugins/google-one-tap.test.ts"
        issue: "vi.mock('#imports', ...) factory missing useRoute export — plugin calls useRoute() from #imports but test mock does not provide it"
      - path: "apps/website/app/plugins/google-one-tap.client.ts"
        issue: "Added useRoute from #imports (line 7, line 25) in commit 216c57c, but corresponding test was not updated"
    missing:
      - "Add useRoute to vi.mock('#imports', ...) factory in google-one-tap.test.ts: useRoute: () => ({ path: '/' })"
  - truth: "GTAP-08 marked complete in REQUIREMENTS.md"
    status: failed
    reason: "REQUIREMENTS.md still shows GTAP-08 as '[ ]' (unchecked) and 'Pending' in the coverage table. The plugin file exists and works (except for the test gap above), but the requirement tracking was not updated after commit 8517bdb."
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "Line 23: '- [ ] **GTAP-08**' should be '- [x] **GTAP-08**'. Line 60: '| GTAP-08 | Phase 098 | Pending |' should be 'Complete'."
    missing:
      - "Update REQUIREMENTS.md: mark GTAP-08 as [x] checked and change status from 'Pending' to 'Complete'"
human_verification:
  - test: "Manual smoke test — One Tap overlay visible for unauthenticated users"
    expected: "Google One Tap overlay appears within 2-3 seconds on http://localhost:3000 in incognito window; no overlay on /cuenta/perfil; waldo_jwt cookie set after completing One Tap; logout does not re-trigger overlay immediately"
    why_human: "Real-time browser behavior, GIS library loading, cookie inspection — cannot verify programmatically"
---

# Phase 098: Frontend Rewrite + Logout Fix Verification Report

**Phase Goal:** Rewrite useGoogleOneTap composable, create google-one-tap.client.ts plugin, fix logout to call disableAutoSelect()
**Verified:** 2026-03-19T14:25:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | useLogout calls disableAutoSelect() before strapiLogout() | VERIFIED | `useLogout.ts` line 33: `window.google?.accounts?.id?.disableAutoSelect()` before `await strapiLogout()` (line 35). 5/5 tests GREEN including GTAP-12 invocationCallOrder assertion. |
| 2  | useGoogleOneTap exports promptIfEligible() (not initializeGoogleOneTap) | VERIFIED | `useGoogleOneTap.ts` 27 lines — exports `{ promptIfEligible }` only. No reference to `initializeGoogleOneTap` anywhere in the website app. |
| 3  | promptIfEligible() skips prompt() when user is authenticated | VERIFIED | Auth guard at line 6-7: `if (user.value) return`. Test "does NOT call prompt() when user is authenticated" passes. |
| 4  | promptIfEligible() skips prompt() on private routes | VERIFIED | Route guard at lines 10-12: checks `/cuenta`, `/pagar`, `/anunciar`, `/packs` prefixes. 4 parametrized test cases pass. |
| 5  | promptIfEligible() calls window.google.accounts.id.prompt() for unauthenticated users on public routes | VERIFIED | Line 17: `window.google.accounts.id.prompt(...)`. Happy-path test passes. |
| 6  | window.d.ts declares disableAutoSelect, deprecated declarations removed | VERIFIED | `window.d.ts` has `disableAutoSelect: () => void` in `id` interface. `googleOneTapInitialized`, `handleCredentialResponse`, `isNotDisplayed`, `getNotDisplayedReason` all absent. |
| 7  | google-one-tap.client.ts exists with substantive GIS initialization | VERIFIED | Plugin is 63 lines. Has auth guard, route guard, 100ms retry loop, initialize() call, callback with setToken/fetchUser, prompt() call. Not a stub. |
| 8  | Plugin skips initialization for authenticated users (auth state guard) | VERIFIED | Lines 20-21: `const user = useStrapiUser(); if (user.value) return;` at plugin root. |
| 9  | Dead comment blocks removed from default.vue and auth.vue | VERIFIED | `default.vue` has no commented-out Google One Tap block; `auth.vue` has no commented-out block. Neither file contains `initializeGoogleOneTap`. |
| 10 | 3 plugin tests from Plan 01 are GREEN | FAILED | All 3 plugin tests fail: `[vitest] No "useRoute" export is defined on the "#imports" mock`. Commit 216c57c added `useRoute` to the plugin but the test mock was not updated. |
| 11 | GTAP-08 marked complete in REQUIREMENTS.md | FAILED | REQUIREMENTS.md line 23 shows `- [ ] **GTAP-08**` (unchecked) and the coverage table at line 60 shows `Pending`. Plugin file was created in commit 8517bdb but requirement tracking was not updated. |

**Score:** 9/11 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/website/app/plugins/google-one-tap.client.ts` | GIS initialization plugin, SSR-safe, useApiClient + useStrapiAuth at root | VERIFIED | 63 lines, substantive implementation, wired via Nuxt auto-discovery (.client.ts suffix) |
| `apps/website/app/composables/useGoogleOneTap.ts` | promptIfEligible() with auth/route/GIS guards | VERIFIED | 27 lines, all three guards present, exports `{ promptIfEligible }` |
| `apps/website/app/composables/useLogout.ts` | disableAutoSelect() before strapiLogout() | VERIFIED | 41 lines, optional chain on line 33 before `await strapiLogout()` on line 35 |
| `apps/website/app/types/window.d.ts` | disableAutoSelect declared, deprecated members removed | VERIFIED | 37 lines, `disableAutoSelect: () => void` present, 4 deprecated members absent |
| `apps/website/app/layouts/default.vue` | Dead comment block removed | VERIFIED | 20 lines, only 5 component imports in script block, no commented-out One Tap code |
| `apps/website/app/layouts/auth.vue` | Dead comment block removed | VERIFIED | 12 lines, only 2 component imports in script block, no commented-out One Tap code |
| `apps/website/tests/plugins/google-one-tap.test.ts` | 3 plugin tests GREEN | STUB/BROKEN | File exists and is substantive (85 lines) but all 3 tests fail due to missing useRoute in vi.mock('#imports') factory |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `useLogout.ts` | `window.google.accounts.id.disableAutoSelect` | optional chain `window.google?.accounts?.id?.disableAutoSelect()` | WIRED | Line 33 — fires before `strapiLogout()` on line 35 |
| `useGoogleOneTap.ts` | `useStrapiUser` | `useStrapiUser()` from `#imports` | WIRED | Line 1 import, line 6 usage |
| `useGoogleOneTap.ts` | `window.google.accounts.id.prompt` | direct call inside `promptIfEligible()` | WIRED | Line 17 |
| `google-one-tap.client.ts` | `POST /api/auth/google-one-tap` | `useApiClient()` in GIS callback | WIRED | Line 43-46: `client("auth/google-one-tap", { method: "POST", body: { credential: response.credential } })` |
| `google-one-tap.client.ts` | `waldo_jwt cookie` | `useStrapiAuth().setToken(result.jwt)` | WIRED | Line 47: `setToken(result.jwt)` |
| `google-one-tap.client.ts` | `useStrapiUser() reactive ref` | `useStrapiAuth().fetchUser()` | WIRED | Line 48: `await fetchUser()` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| GTAP-07 | 098-01, 098-02 | useGoogleOneTap.ts rewritten — redirect hack, global flag, deprecated FedCM methods removed | SATISFIED | Composable is 27 lines. No `handleCredentialResponse`, no `googleOneTapInitialized`, no `isNotDisplayed`, no `use_fedcm_for_prompt`. Exports `{ promptIfEligible }`. 6/6 tests GREEN. |
| GTAP-08 | 098-03 | google-one-tap.client.ts created — initializes GIS once with auth-state guard; SSR-safe via .client.ts suffix | SATISFIED (tracking gap) | Plugin file exists and is substantive (63 lines). However REQUIREMENTS.md still marks this as `[ ]` Pending — tracking not updated after commit 8517bdb. |
| GTAP-09 | 098-01, 098-02, 098-03 | One Tap appears automatically on public pages for unauthenticated users | SATISFIED (human needed) | Plugin calls `prompt()` after `initialize()`. Auth guard skips authenticated users. Tests cover automated behavior. Manual smoke test approved per 098-03-SUMMARY.md. Cannot re-verify programmatically. |
| GTAP-10 | 098-01, 098-02, 098-03 | One Tap does NOT appear on private routes | SATISFIED | Both composable and plugin have route guards for `/cuenta`, `/pagar`, `/anunciar`, `/packs`. Plugin adds `/login/*` guard (commit 216c57c). 4 parametrized test cases GREEN. |
| GTAP-11 | 098-01, 098-03 | Completing One Tap calls setToken(jwt) + fetchUser() — user authenticated with waldo_jwt cookie | SATISFIED (test gap) | Plugin implementation is wired correctly (lines 47-48). However the 3 plugin tests that verify this behavior all fail due to missing `useRoute` in mock. Manual smoke test confirmed working per 098-03-SUMMARY.md. |
| GTAP-12 | 098-01, 098-02 | useLogout.ts calls window.google?.accounts?.id?.disableAutoSelect() before strapiLogout() | SATISFIED | Line 33 of useLogout.ts. GTAP-12 test GREEN (invocationCallOrder assertion passes). 5/5 useLogout tests GREEN. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `tests/plugins/google-one-tap.test.ts` | 11-15 | `vi.mock('#imports', ...)` missing `useRoute` export | Blocker | All 3 plugin tests fail at runtime with vitest mock validation error — GTAP-11 test coverage broken |
| `.planning/REQUIREMENTS.md` | 23, 60 | GTAP-08 marked `[ ]` Pending despite plugin file existing | Warning | Requirement tracker out of sync with actual codebase state |

### Human Verification Required

#### 1. One Tap Overlay End-to-End Smoke Test

**Test:** Start `yarn workspace waldo-website dev`, open `http://localhost:3000` in an incognito window. Wait up to 3 seconds.
**Expected:** Google One Tap overlay appears in top-right corner. Navigate to `/cuenta/perfil` — no overlay. Log in via One Tap — `waldo_jwt` cookie appears in DevTools, header shows user name. Log out — overlay does not immediately re-appear.
**Why human:** Real-time GIS script loading, browser cookie behavior, UI rendering — cannot verify programmatically.

### Gaps Summary

Two gaps block full goal achievement:

**Gap 1 — Plugin tests failing (blocker):** Commit `216c57c` added a `/login/*` route guard to the plugin, correctly importing `useRoute` from `#imports`. However the plugin's test file (`tests/plugins/google-one-tap.test.ts`) was not updated to include `useRoute` in its `vi.mock("#imports", ...)` factory. All 3 GTAP-11 plugin tests fail with the vitest mock validation error: `No "useRoute" export is defined on the "#imports" mock`. The fix is one line: add `useRoute: () => ({ path: "/" })` to the mock factory.

**Gap 2 — REQUIREMENTS.md tracking not updated (non-blocking for behavior, blocking for closure):** GTAP-08 is still shown as unchecked (`[ ]`) and "Pending" in the requirements coverage table, despite the plugin file being created in commit `8517bdb` and confirmed working. This appears to be a documentation update that was missed when the phase was finalized.

---

_Verified: 2026-03-19T14:25:00Z_
_Verifier: Claude (gsd-verifier)_
