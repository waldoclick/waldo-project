---
phase: quick-260611-qtt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/config/middlewares.ts
  - apps/strapi/config/api.ts
  - apps/strapi/src/middlewares/user-registration.ts
  - apps/website/nuxt.config.ts
  - apps/website/app/composables/useProviders.ts
  - apps/website/app/composables/useAppConfig.ts
  - apps/website/app/pages/login/index.vue
  - apps/website/app/pages/registro/index.vue
  - apps/website/app/pages/pagar/gracias.vue
  - apps/website/app/plugins/runtime-config.client.ts
  - apps/website/server/api/images/[...].ts
  - apps/website/server/routes/sitemap.xml.ts
autonomous: false
requirements: [SEC-FRAMEGUARD, SEC-APIURL, SEC-TOKENLEAK, SEC-MAXLIMIT]

must_haves:
  truths:
    - "Strapi responses include X-Frame-Options (frameguard active)"
    - "The raw Strapi API_URL is no longer present in client-shipped runtimeConfig.public"
    - "processedTokens never grows unbounded — entries expire after a fixed TTL"
    - "Strapi REST maxLimit is 100, not 400"
    - "Google OAuth login/registro still redirect to the provider correctly through the Nitro proxy"
    - "Image proxy and sitemap server routes still resolve the Strapi URL (server-only)"
  artifacts:
    - path: "apps/strapi/config/middlewares.ts"
      provides: "Security middleware with frameguard enabled"
      contains: "strapi::security"
    - path: "apps/strapi/config/api.ts"
      provides: "REST config with maxLimit 100"
      contains: "maxLimit: 100"
    - path: "apps/strapi/src/middlewares/user-registration.ts"
      provides: "TTL-bounded token dedup via Map"
      contains: "Map<string, number>"
    - path: "apps/website/nuxt.config.ts"
      provides: "Server-only apiUrl key; apiUrl removed from runtimeConfig.public"
  key_links:
    - from: "apps/website/server/api/images/[...].ts"
      to: "server-only config.apiUrl"
      via: "useRuntimeConfig server access"
      pattern: "config\\.apiUrl"
    - from: "apps/website/server/routes/sitemap.xml.ts"
      to: "server-only config.apiUrl"
      via: "useRuntimeConfig server access"
      pattern: "config\\.apiUrl"
---

<objective>
Close 4 security gaps across Strapi and the website:

1. **Frameguard** — re-enable X-Frame-Options in Strapi security middleware (currently `frameguard: false`).
2. **apiUrl exposure** — stop shipping the raw Strapi `API_URL` to the browser via `runtimeConfig.public.apiUrl`. Move it to a server-only runtime key, remove dead/live client consumers, and reroute the OAuth client paths through the existing Nitro proxy.
3. **processedTokens memory leak** — the OAuth dedup `Set<string>` in `user-registration.ts` grows forever. Replace with a TTL-bounded `Map`.
4. **maxLimit** — reduce Strapi REST `maxLimit` from 400 to 100 (DoS / mass-extraction hardening).

Purpose: Reduce attack surface (clickjacking, API URL disclosure, unbounded memory, mass data extraction) with no functional regression.
Output: 12 files modified; client bundle no longer contains the raw API URL; OAuth + image proxy + sitemap still work.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md

# Key constraint from STATE.md (125-07): nuxi typecheck / nuxi build FAIL in CI due to
# estree-walker ESM-only at root workspace. Use `vue-tsc --noEmit` for website TS verification (exits 0).

<interfaces>
<!-- apiUrl consumer breakdown — already discovered, do NOT re-investigate the codebase. -->

DEAD client assignments (const apiUrl assigned, never read) — DELETE the line:
  - apps/website/app/pages/login/index.vue:71   → `const apiUrl = config.public.apiUrl;`
  - apps/website/app/pages/pagar/gracias.vue:38 → `const apiUrl = config.public.apiUrl;`

LIVE client consumers of config.public.apiUrl — must be rerouted off the public key:
  - apps/website/app/composables/useProviders.ts:20-22
      Uses `config.public.baseUrl` → `config.public.apiUrl` string replace on the provider URL.
  - apps/website/app/pages/registro/index.vue:60,64
      `const apiUrl = config.public.apiUrl;` then `fetch(\`${apiUrl}/api/connect/google/callback\`)`.

SERVER files reading config.public.apiUrl — break if apiUrl leaves public; switch to server-only key:
  - apps/website/server/api/images/[...].ts:7   → `const strapiUrl = \`${config.public.apiUrl}/uploads/...\``
  - apps/website/server/routes/sitemap.xml.ts:59 → `const apiUrl = config.public.apiUrl as string;`
  - apps/website/server/api/[...].ts ALREADY uses `process.env.API_URL` directly — NO CHANGE.

OTHER:
  - apps/website/app/plugins/runtime-config.client.ts:13-16 → apiUrl public fallback block (remove).
  - apps/website/app/composables/useAppConfig.ts:13 → `apiUrl: config.public.apiUrl,`
      VERIFIED: no consumer reads `appConfig.apiUrl` (all 4 callers use only `.features`). Safe to delete the line.

DEV-MODE BRANCHES — DO NOT MODIFY these files; leave them reading `config.public.apiUrl`:
  - apps/website/app/components/UploadMedia.vue (apiDisableProxy branch, lines 95-96, 143-144)
  - apps/website/app/composables/useImage.ts (apiDisableProxy branch, lines 24-25, 79-80)
  Both branches execute ONLY when `apiDisableProxy === true` — the client hits Strapi directly
  (a dev/debug mode where exposing the URL is unavoidable and acceptable).
  They keep reading `config.public.apiUrl`. This stays valid because Task 2 makes `public.apiUrl`
  CONDITIONAL: present exactly when `API_DISABLE_PROXY === "true"`, absent otherwise. So in production
  (proxy on) the URL never ships; in dev-direct mode it is present precisely for these branches.
  `apiDisableProxy` itself remains in runtimeConfig.public unchanged.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Strapi hardening — frameguard, maxLimit, token TTL</name>
  <files>apps/strapi/config/middlewares.ts, apps/strapi/config/api.ts, apps/strapi/src/middlewares/user-registration.ts</files>
  <action>
Three independent Strapi edits (no file overlap with Task 2):

1. **Frameguard (SEC-FRAMEGUARD)** — in `apps/strapi/config/middlewares.ts`, inside the
   `strapi::security` config object, REMOVE the line `frameguard: false, // Desactiva x-frame-options`.
   Removing it restores Strapi's secure default (X-Frame-Options: SAMEORIGIN). Do NOT set
   `frameguard: true` explicitly unless removal alone is insufficient — default behavior is the goal.
   Leave `noSniff: true` and all CSP directives untouched.

2. **maxLimit (SEC-MAXLIMIT)** — in `apps/strapi/config/api.ts`, change `maxLimit: 400` to
   `maxLimit: 100`. Leave `defaultLimit: 25` and `withCount: true` unchanged.

3. **Token TTL (SEC-TOKENLEAK)** — in `apps/strapi/src/middlewares/user-registration.ts`:
   - Replace `const processedTokens = new Set<string>();` with `const processedTokens = new Map<string, number>();`
     (token → insertion timestamp in ms).
   - Add a module-level constant: `const PROCESSED_TOKEN_TTL_MS = 60000;` (60s — the dedup only
     guards the existing 10s `createdAt` window, so 60s is ample headroom).
   - At the OAuth callback dedup site (currently `if (accessToken && !processedTokens.has(accessToken))`):
     before the check, purge expired entries:
       `const nowMs = Date.now();`
       `for (const [tok, ts] of processedTokens) { if (nowMs - ts > PROCESSED_TOKEN_TTL_MS) processedTokens.delete(tok); }`
     Keep the guard as `if (accessToken && !processedTokens.has(accessToken))`.
     Replace `processedTokens.add(accessToken);` with `processedTokens.set(accessToken, nowMs);`.
   - No behavior change for the dedup window itself — same-token requests within 60s are still deduped;
     only the unbounded growth is fixed. Do not introduce unused vars (CLAUDE.md).
  </action>
  <verify>
    <automated>cd apps/strapi && pnpm tsc --noEmit && grep -q "maxLimit: 100" config/api.ts && grep -q "Map<string, number>" src/middlewares/user-registration.ts && ! grep -q "frameguard: false" config/middlewares.ts && echo STRAPI_OK</automated>
  </verify>
  <done>frameguard:false removed; maxLimit is 100; processedTokens is a Map with 60s TTL purge; Strapi TypeScript compiles clean.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Remove apiUrl from client bundle, reroute OAuth, fix server reads</name>
  <files>apps/website/nuxt.config.ts, apps/website/app/composables/useProviders.ts, apps/website/app/composables/useAppConfig.ts, apps/website/app/pages/login/index.vue, apps/website/app/pages/registro/index.vue, apps/website/app/pages/pagar/gracias.vue, apps/website/app/plugins/runtime-config.client.ts, apps/website/server/api/images/[...].ts, apps/website/server/routes/sitemap.xml.ts</files>
  <what-built>
Reworked apiUrl handling so the raw Strapi API_URL is no longer shipped to the browser in
production (proxy mode), while preserving OAuth, the image proxy, and the sitemap. Concrete edits:

**A. nuxt.config.ts (SEC-APIURL) — conditional exposure**
   In `runtimeConfig`:
   - Add a SERVER-ONLY key (sibling of `recaptchaSecretKey`, NOT under `public`):
       `apiUrl: process.env.API_URL || "http://localhost:1337",`
   - In `runtimeConfig.public`, REPLACE the unconditional
       `apiUrl: process.env.API_URL || "http://localhost:1337",`
     with a conditional that only exposes it in dev-direct mode:
       `...(process.env.API_DISABLE_PROXY === "true"`
       `  ? { apiUrl: process.env.API_URL || "http://localhost:1337" }`
       `  : {}),`
     Rationale: when `API_DISABLE_PROXY=true` the client talks to Strapi directly (dev/debug) and
     the URL is inherently exposed — unavoidable. In production (`API_DISABLE_PROXY` unset/false),
     `public.apiUrl` is absent, so the URL never ships. The dev-mode branches in UploadMedia.vue
     and useImage.ts keep working unchanged because public.apiUrl exists exactly when they need it.

**B. server/api/images/[...].ts** — line 7: change `config.public.apiUrl` → `config.apiUrl`
   (server-only key now added in step A; server runtimeConfig has full access).

**C. server/routes/sitemap.xml.ts** — line 59: change
   `const apiUrl = config.public.apiUrl as string;` → `const apiUrl = config.apiUrl as string;`.

**D. useProviders.ts** — the proxy-on branch does `originalUrl.replace(frontendUrl, apiUrl)`
   using `config.public.apiUrl`, which is now absent in production. Replace this composable's
   logic so the proxy-on branch returns the URL unchanged (the Nitro proxy at server/api/[...].ts
   already 302-redirects /api/connect/google to Strapi). Specifically: in the proxy-enabled path,
   return `originalUrl` as-is (the provider URL points at baseUrl/api/connect/google which the proxy
   forwards). Keep the `apiDisableProxy` branch returning the original URL too. Remove the now-unused
   `apiUrl`/`frontendUrl` locals to satisfy CLAUDE.md no-unused-vars. (Mirror how login/index.vue
   detects providers via `getProviderAuthenticationUrl` without touching apiUrl.)

**E. registro/index.vue** — remove `const apiUrl = config.public.apiUrl;` (line 60) and replace the
   provider probe `fetch(\`${apiUrl}/api/connect/google/callback\`)` with the same approach
   login/index.vue uses: derive `google: !!getProviderAuthenticationUrl("google")` inside the
   useAsyncData callback (wrap in try/catch, default google:true on error). No raw fetch to apiUrl.

**F. login/index.vue** — delete the dead `const apiUrl = config.public.apiUrl;` (line 71). It is
   never read.

**G. pagar/gracias.vue** — delete the dead `const apiUrl = config.public.apiUrl;` (line 38). Never read.

**H. useAppConfig.ts** — delete the `apiUrl: config.public.apiUrl,` line (13). Verified: no consumer
   reads `appConfig.apiUrl`.

**I. runtime-config.client.ts** — remove the apiUrl public fallback block (lines 13-16). It writes
   to `config.public.apiUrl` which no longer exists in production. Keep the baseUrl fallback block.

Constraint: use `vue-tsc --noEmit` for TS verification (per STATE.md 125-07, nuxi typecheck/build
fail on estree-walker in CI). Do not introduce unused imports/vars (CLAUDE.md).
  </what-built>
  <how-to-verify>
1. Build/run the website in production mode (proxy enabled, `API_DISABLE_PROXY` unset). Confirm the
   raw Strapi API_URL does NOT appear in the client payload:
   - Run: `cd apps/website && grep -rn "config.public.apiUrl" app/ | grep -v "apiDisableProxy"`
     → should return ONLY the UploadMedia.vue / useImage.ts dev-mode branches (both guarded), nothing else.
2. Visit `/login` — click "Continuar con Google". Confirm it redirects to the Google consent screen
   (through the proxy) and completes login. Expected: full OAuth round-trip works.
3. Visit `/registro` — confirm the page renders and the Google button appears (provider probe works
   without the raw apiUrl fetch).
4. Load any page with a Strapi-hosted image (e.g. an ad with a cover) — confirm images still load via
   `/api/images/...` (image proxy server route using server-only config.apiUrl).
5. Hit `/sitemap.xml` — confirm it returns a populated XML (sitemap server route resolves apiUrl).
6. View page source / network of any public page — confirm the response does NOT contain the raw
   Strapi origin (e.g. `api.waldo.click` direct or the dev `localhost:1337`) in the inlined runtime config.
  </how-to-verify>
  <resume-signal>Type "approved" if OAuth login, registro, images, and sitemap all work and the API URL is absent from the client bundle — or describe what broke.</resume-signal>
</task>

</tasks>

<verification>
- Strapi: `cd apps/strapi && pnpm tsc --noEmit` clean; frameguard line gone; maxLimit 100; Map+TTL present.
- Website: `cd apps/website && node <root>/node_modules/.bin/vue-tsc --noEmit` exits 0 (run from apps/website).
- `grep -rn "config.public.apiUrl" apps/website/app | grep -v apiDisableProxy` → empty (only guarded dev branches remain).
- Manual (checkpoint): Google OAuth login, registro provider probe, image proxy, sitemap all functional.
</verification>

<success_criteria>
- X-Frame-Options restored on Strapi responses (frameguard default active).
- runtimeConfig.public.apiUrl absent in production; present only when API_DISABLE_PROXY=true.
- server/api/images and server/routes/sitemap read server-only config.apiUrl and still work.
- OAuth (login + registro) functions through the Nitro proxy with no raw apiUrl on the client.
- processedTokens is a Map purged at a 60s TTL — no unbounded growth.
- Strapi REST maxLimit = 100.
- All dead `const apiUrl` assignments and the useAppConfig/runtime-config public-apiUrl references removed; no unused vars (Codacy clean).
- Strapi `tsc --noEmit` and website `vue-tsc --noEmit` both pass.
</success_criteria>

<output>
After completion, create `.planning/quick/260611-qtt-fix-4-security-gaps-frameguard-apiurl-ex/260611-qtt-SUMMARY.md`
</output>
</content>
</invoke>
