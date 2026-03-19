# Phase 098: User Setup Required

**Generated:** 2026-03-19
**Phase:** 098-frontend-rewrite-logout-fix
**Status:** Incomplete

Complete these items to verify the Google One Tap end-to-end integration works correctly. Claude automated everything possible (plugin code, tests, layout cleanup); these items require a running browser with real Google credentials.

## Environment Variables

No new environment variables required for this phase. `GOOGLE_CLIENT_ID` was already configured in Phase 096.

## Dashboard Configuration

- [ ] **Test 1 — One Tap overlay appears for unauthenticated users (GTAP-09)**
  - Location: Browser — open `http://localhost:3000` in an incognito/private window (logged out)
  - Expected: Google One Tap overlay appears in the top-right corner within 3 seconds

- [ ] **Test 2 — No overlay on private routes (GTAP-10)**
  - Location: Browser — in the same incognito window, navigate to `http://localhost:3000/cuenta/perfil`
  - Expected: Redirected to `/login` (auth middleware), NO One Tap overlay visible

- [ ] **Test 3 — Authenticated users do NOT see overlay (GTAP-09 corollary)**
  - Location: Browser — log in via any method (email/password), then navigate to `http://localhost:3000`
  - Expected: NO One Tap overlay (auth guard in plugin suppresses it)

- [ ] **Test 4 — Complete One Tap sign-in sets waldo_jwt cookie (GTAP-11)**
  - Location: Browser DevTools → Application → Cookies → `localhost`
  - Steps:
    1. In incognito, visit `http://localhost:3000`
    2. Click "Continue as [your Google account]" in the overlay
    3. Check DevTools Cookies panel
  - Expected: `waldo_jwt` cookie appears with `path=/` and a future expiry; site header shows your Google account name/avatar; you remain on the home page (no redirect)

- [ ] **Test 5 — Logout does not immediately re-trigger One Tap (GTAP-12)**
  - Location: Browser — while logged in, click logout
  - Expected: Redirected to `/` as guest; One Tap does NOT immediately re-appear (disableAutoSelect() called before logout)

## Verification

Before running the smoke tests, start the dev server:

```bash
yarn workspace waldo-website dev
```

Then proceed with Tests 1–5 above in an incognito browser window.

---

**Once all items complete:** Mark status as "Complete" at top of file.
