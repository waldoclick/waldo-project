# Phase 096: CSP & Environment Setup — Research

**Researched:** 2026-03-18
**Domain:** Content Security Policy (nuxt-security) + Strapi environment variables
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GTAP-01 | `connect-src` in `nuxt.config.ts` includes `https://accounts.google.com/gsi/` and `frame-src` includes `https://accounts.google.com/gsi/` | Exact values confirmed by official Google GIS CSP docs (2025-10-31); current `nuxt.config.ts` confirmed to be missing both — file directly inspected |
| GTAP-02 | `GOOGLE_CLIENT_ID` present in `apps/strapi/.env` and documented in `.env.example` | `.env` has no `GOOGLE_CLIENT_ID` entry (only `GOOGLE_SPREADSHEET_ID`); `.env.example` already has `GOOGLE_CLIENT_ID=your_google_client_id` in the Gmail section but comment header says "Gmail configuration" — value is correct, comment header needs clarification |
</phase_requirements>

---

## Summary

Phase 096 is a two-task mechanical change: one CSP edit in `apps/website/nuxt.config.ts` and one `.env` entry in `apps/strapi/.env`. Both tasks are fully constrained by direct codebase inspection — no design ambiguity.

**GTAP-01 (CSP):** The `connect-src` directive (lines 99–118) does NOT include `https://accounts.google.com/gsi/`. The `frame-src` directive (lines 120–128) has `https://accounts.google.com` but NOT the more specific `https://accounts.google.com/gsi/`. Google's official docs (last updated 2025-10-31) specify that both `connect-src` and `frame-src` must include the parent path `https://accounts.google.com/gsi/` for FedCM to work. The GIS client script is already loaded correctly in `app.head.script` (line 262). `script-src` already includes `https://accounts.google.com` and covers the GIS library load.

**GTAP-02 (Env var):** `apps/strapi/.env` has no `GOOGLE_CLIENT_ID` entry at all. `apps/strapi/.env.example` already has the variable defined (line 36: `GOOGLE_CLIENT_ID=your_google_client_id`) but under a "Gmail configuration" comment which is slightly misleading — it covers both Gmail OAuth and One Tap. The planner must add the actual value to `.env` and optionally update the comment to cover One Tap as well.

**Primary recommendation:** Two targeted edits. Touch only `connect-src` and `frame-src` in `nuxt.config.ts`; add `GOOGLE_CLIENT_ID` to `apps/strapi/.env`. No new files needed.

---

## Standard Stack

### Core (already in project — no new installs needed)
| Library / Tool | Version | Purpose | Notes |
|----------------|---------|---------|-------|
| `nuxt-security` | existing | Injects CSP headers via `security.headers.contentSecurityPolicy` in `nuxt.config.ts` | Already configured; only array entries need adding |
| `apps/strapi/.env` | — | Runtime environment variables for Strapi | File exists; just missing `GOOGLE_CLIENT_ID` value |

**Installation:** None required for this phase.

---

## Architecture Patterns

### CSP Configuration Location
`apps/website/nuxt.config.ts` — the `security.contentSecurityPolicy` object (lines 49–145). The security block is conditionally applied only when `NODE_ENV !== "local"`.

```typescript
// Current connect-src (lines 99–118) — MISSING gsi/ entry
"connect-src": [
  "'self'",
  "https:",
  // ... other entries ...
  // ⚠️ https://accounts.google.com/gsi/ NOT present
],

// Current frame-src (lines 120–128) — has parent domain but NOT /gsi/ path
"frame-src": [
  "https://accounts.google.com",   // ← covers general Google pages
  // ⚠️ https://accounts.google.com/gsi/ NOT present — FedCM iframe blocked
  "https://www.google.com",
  // ...
],
```

### Correct CSP Entries (from official Google docs, 2025-10-31)
```typescript
// Source: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#content_security_policy

// Add to connect-src:
"https://accounts.google.com/gsi/"

// Add to frame-src:
"https://accounts.google.com/gsi/"

// Note: script-src already has "https://accounts.google.com" which covers gsi/client load.
// style-src addition is optional: "https://accounts.google.com/gsi/style"
```

**Why the parent path, not individual endpoints:**
> "Avoid listing individual GIS URLs when using `connect-src`. This helps minimize failures when GIS is updated. For example, instead of adding `https://accounts.google.com/gsi/status` use the GIS parent URL `https://accounts.google.com/gsi/`."
> — Google Identity Services docs, 2025-10-31

### Environment Variable Pattern
Strapi reads env vars via `strapi.config.get()` or direct `process.env.*` access. The `GOOGLE_CLIENT_ID` var is needed in Phase 097 by `OAuth2Client.verifyIdToken()`. This phase only establishes its presence in `.env` and ensures `.env.example` documents it clearly.

```bash
# apps/strapi/.env — ADD:
GOOGLE_CLIENT_ID=your_actual_google_oauth_client_id
```

```bash
# apps/strapi/.env.example — ALREADY EXISTS at line 36:
# Gmail configuration
GOOGLE_CLIENT_ID=your_google_client_id   ← already present but comment header is "Gmail"
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

The planner should consider updating the comment from "Gmail configuration" to "Google OAuth / One Tap configuration" to reflect that this key serves both OAuth sign-in and One Tap token verification.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSP header generation | Custom middleware | `nuxt-security` module config in `nuxt.config.ts` | Already installed and active; modifying the config array is the correct pattern |
| Env var validation at startup | Custom validator | Document in `.env.example`; runtime error if missing | Phase 097 handles the actual usage; this phase just ensures the var exists |

---

## Common Pitfalls

### Pitfall 1: Using full GIS endpoint URL instead of parent path
**What goes wrong:** Adding `https://accounts.google.com/gsi/status` or `https://accounts.google.com/gsi/client` individually instead of the parent `https://accounts.google.com/gsi/`.
**Why it happens:** Copying from browser DevTools network tab.
**How to avoid:** Always use `https://accounts.google.com/gsi/` (with trailing slash) — covers all GIS endpoints future-proof.
**Warning signs:** Some GIS requests blocked while others succeed.

### Pitfall 2: Adding `/gsi/` to `script-src` instead of leaving `accounts.google.com` as-is
**What goes wrong:** Replacing `https://accounts.google.com` in `script-src` with `https://accounts.google.com/gsi/client` — breaks other Google scripts (sign-in button).
**Why it happens:** Over-scoping the change to "all Google CSP".
**How to avoid:** `script-src` already has `https://accounts.google.com` which covers the GIS library. **Do not touch `script-src`.**

### Pitfall 3: CSP only active for `NODE_ENV !== "local"`
**What goes wrong:** Local dev never exercises the CSP; the fix is only validated in staging/production.
**Why it happens:** The `security` block is wrapped in `...(process.env.NODE_ENV !== "local" && { ... })`.
**How to avoid:** Test CSP changes in staging (or temporarily remove the local exclusion). DevTools Console → Network tab filter for "csp" in staging confirms the headers.
**Warning signs:** Developer tests locally and sees no CSP errors — but staging still blocks GIS.

### Pitfall 4: `.env.example` comment mismatch
**What goes wrong:** Future developer doesn't know `GOOGLE_CLIENT_ID` is needed for One Tap verification — they see "Gmail configuration" and think it's only for OAuth mail sending.
**How to avoid:** Update the comment header from "Gmail configuration" to "Google OAuth / One Tap configuration".

---

## Code Examples

### Exact diff for `nuxt.config.ts` — `connect-src`
```typescript
// Source: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#content_security_policy
"connect-src": [
  "'self'",
  "https:",
  "wss://*.hotjar.com",
  "wss://ws.hotjar.com",
  process.env.BASE_URL || "http://localhost:3000",
  process.env.API_URL || "http://localhost:1337",
  "https://*.logrocket.io",
  "https://*.lr-ingest.io",
  "https://*.sentry.io",
  "https://*.ingest.sentry.io",
  "https://www.google-analytics.com",
  "https://salesiq.zohopublic.com",
  "https://salesiq.zoho.com",
  "wss://salesiq.zohopublic.com",
  "wss://salesiq.zoho.com",
  "wss://vts.zohopublic.com",
  "https://*.zohocdn.com",
  "wss://*.zohocdn.com",
  "https://accounts.google.com/gsi/",  // ← ADD: FedCM One Tap network requests
],
```

### Exact diff for `nuxt.config.ts` — `frame-src`
```typescript
// Source: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#content_security_policy
"frame-src": [
  "https://accounts.google.com",
  "https://accounts.google.com/gsi/",  // ← ADD: FedCM One Tap iframe
  "https://www.google.com",
  "https://www.gstatic.com",
  "https://www.googletagmanager.com",
  "https://salesiq.zohopublic.com",
  "https://salesiq.zoho.com",
  "https://*.zohocdn.com",
],
```

### Strapi `.env` entry
```bash
# apps/strapi/.env
GOOGLE_CLIENT_ID=1234567890-abc123def456.apps.googleusercontent.com
```

### `.env.example` updated comment (optional but recommended)
```bash
# Google OAuth / One Tap configuration
GOOGLE_CLIENT_ID=your_google_client_id         # Used for OAuth sign-in AND One Tap token verification
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/login/google
```

---

## State of the Art

| Area | Current State | After This Phase |
|------|--------------|-----------------|
| GIS CDN script | ✅ Already loaded via `app.head.script` | Unchanged |
| `script-src` | ✅ Has `https://accounts.google.com` — covers GIS library | Unchanged |
| `connect-src` | ❌ Missing `https://accounts.google.com/gsi/` — FedCM network calls blocked | ✅ Added |
| `frame-src` | ⚠️ Has `https://accounts.google.com` but not `/gsi/` path — FedCM iframe may be blocked | ✅ Added |
| `style-src` | Optional: missing `https://accounts.google.com/gsi/style` | Leave unchanged (GIS degrades gracefully) |
| `GOOGLE_CLIENT_ID` in Strapi `.env` | ❌ Not present (only `GOOGLE_SPREADSHEET_ID` in file) | ✅ Added |
| `GOOGLE_CLIENT_ID` in `.env.example` | ✅ Already present at line 36 | ✅ Comment header improved |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (website) — `vitest.config.ts` exists |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `yarn workspace website vitest run` |
| Full suite command | `yarn workspace website vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GTAP-01 | `connect-src` and `frame-src` contain `https://accounts.google.com/gsi/` | manual-only | n/a | n/a |
| GTAP-02 | `GOOGLE_CLIENT_ID` present in `.env`, documented in `.env.example` | manual-only | n/a | n/a |

**Manual-only justification:**
- GTAP-01: CSP header validation requires a running Nuxt server (staging environment) and Chrome DevTools inspection. The CSP is only active when `NODE_ENV !== "local"`. No utility function to unit test — the verification is a browser network tab check.
- GTAP-02: Env var presence is a deployment concern, not a code behavior unit. No utility function exists or should be created for this check.

### Sampling Rate
- **Per task commit:** n/a — no automated tests for this phase
- **Per wave merge:** Manual smoke test: run website in staging, open DevTools Console, confirm zero CSP errors for `accounts.google.com/gsi/` requests
- **Phase gate:** Human verification per success criteria before moving to Phase 097

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements (no test files needed; GTAP-01 and GTAP-02 are deployment/config changes verified manually).

---

## Open Questions

1. **`style-src` addition for GIS styles**
   - What we know: Official Google docs say `style-src https://accounts.google.com/gsi/style` is optional; GIS degrades gracefully without it.
   - What's unclear: Whether the One Tap overlay looks correct without it.
   - Recommendation: Skip in this phase; add in Phase 098 if visual issues appear in staging.

2. **`.env.example` comment header update**
   - What we know: The comment says "Gmail configuration" but `GOOGLE_CLIENT_ID` serves One Tap too.
   - Recommendation: Update to "Google OAuth / One Tap configuration" — low risk, high clarity.

---

## Sources

### Primary (HIGH confidence)
- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#content_security_policy (2025-10-31) — Exact CSP directives for GIS; `connect-src`, `frame-src`, `script-src`, `style-src` values; parent-path recommendation
- Direct inspection: `apps/website/nuxt.config.ts` — confirmed missing `connect-src` and `frame-src` GIS entries; `script-src` and GIS script load already correct
- Direct inspection: `apps/strapi/.env` — confirmed `GOOGLE_CLIENT_ID` not present
- Direct inspection: `apps/strapi/.env.example` line 36 — confirmed `GOOGLE_CLIENT_ID` already documented

### Secondary (MEDIUM confidence)
- `.planning/research/SUMMARY.md` — Milestone-level research; CSP gap (missing `connect-src`) confirmed as "Pitfall 1 — most common debugging time sink"

---

## Metadata

**Confidence breakdown:**
- GTAP-01 (CSP): HIGH — Exact values from official Google docs (2025-10-31) + direct file inspection
- GTAP-02 (Env var): HIGH — Direct file inspection of both `.env` and `.env.example`
- Pitfalls: HIGH — Direct inspection confirms exact lines; Google docs confirm parent-path requirement

**Research date:** 2026-03-18
**Valid until:** 2026-06-18 (stable — Google CSP requirements rarely change)
