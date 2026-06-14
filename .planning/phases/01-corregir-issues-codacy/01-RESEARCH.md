## RESEARCH COMPLETE

# Phase 1: Corregir issues de Codacy - Research

**Researched:** 2026-06-14
**Domain:** Static-analysis triage (Codacy remote / Opengrep + ESLint) across Strapi v5 + Nuxt 4 monorepo; security remediation on payment/auth/password paths
**Confidence:** HIGH (every flagged line read in source; remote-vs-local config and suppression-mechanism caveats verified)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Triage de los **100 issues**: arreglar los reales y suprimir los falsos positivos con justificación. Codacy debe quedar limpio y auditable.
- El **veredicto por-issue se decide leyendo cada línea flagueada** — no se asume desde el nombre del patrón.
- Sin gate de aprobación manual intermedio: execute procede de forma autónoma una vez planeado. La lista de disposición vive en PLAN.md como artefacto visible.
- **Mecanismo de supresión:** inline por-línea para reglas con mezcla de hits reales/falsos (NoSQL, path-traversal, v-html, SSRF, insecure-random); **disable repo-wide SOLO para reglas 100% ruido** (`hashicorp-tf-password`, `detected-generic-api-key`).
- **NUNCA** desactivar repo-wide una regla que tenga al menos un hit real.
- `insecure-random`: cliente (`apps/website/app/utils/password.ts`) → `crypto.getRandomValues()`; server Node (`authController.ts`) → `crypto.randomBytes()`. No aplicar uno solo a ambos.
- Alto blast-radius (payment controllers, `authController.ts`, `password.ts`): confirmar cobertura de tests antes de refactorizar; donde no exista, agregar test de caracterización primero.
- Verificación por bucket antes de pasar al siguiente. Commits atómicos por bucket de patrón.

### Claude's Discretion
- Clasificación final FIX/SUPPRESS/VALIDATE por línea (la clasificación mental previa es hipótesis).
- Mecanismo exacto de supresión en Codacy remoto (ver Open Question OQ-1 — el mecanismo locked "nosemgrep inline" tiene un caveat técnico verificado abajo).

### Deferred Ideas (OUT OF SCOPE)
- Conectar el dashboard de Codacy vía API/MCP con token de lectura — no requerido; se trabaja desde snapshot + CLI local + re-scan remoto.
- Lifecycle/milestone del snapshot (v1.46 ya "Complete") — verificar antes del paso de lifecycle autónomo que no corrompa el archivo.
- Issues nuevos posteriores al snapshot; refactors no relacionados; cambios de comportamiento de producto.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CODACY-TRIAGE | Per-issue disposition (FIX/SUPPRESS/VALIDATE) for all 100 snapshot issues | §1 Disposition table — every line read in source |
| CODACY-FIX | Apply concrete fixes to the genuine issues | §3 Fix plan (6 real reals + 9 `any`; client vs server crypto noted) |
| CODACY-SUPPRESS | Suppress false positives without blinding future detection | §2 Suppression plan (inline per-line; 1 repo-wide disable; OQ-1 mechanism caveat) |
| CODACY-VERIFY | Confirm each bucket drops to 0 without regressions | §4 Verification (remote re-scan for security buckets; local ESLint for `any`/unused) |
</phase_requirements>

---

## Summary

All 100 flagged sites were opened in source and triaged. The headline numbers:

- **6 genuine reals to FIX** in security buckets: 2 `insecure-random` sites in `password.ts` (client → `crypto.getRandomValues`), 1 `insecure-random` in `authController.ts:290` (server → `crypto.randomBytes`), and **3 NoSQL operator-injection vectors** where uncoerced HTTP input reaches a `where` filter value: `ad/services/ad.ts:1141` (`ad.ad_id`), `checkout.service.ts:112` (`payload.pack`), `authController.ts:396` (`pendingToken`).
- **9 `no-explicit-any` to FIX** (replace with `unknown` / typed augmentation per CLAUDE.md ban on `any`).
- **~80 SUPPRESS** (false positives): all NoSQL on scalar-coerced or server-derived values, all path-traversal on fixed server dirs / server-generated timestamps, all 12 current v-html (every one routes through `sanitize-html`), both SSRF (fixed API hosts), the regex (hardcoded constant), the dynamic-method (env-driven allowlist with throw), and the 9 `hashicorp-tf-password` (the `"password"` show/hide idiom — structural noise → the only legitimate repo-wide disable).
- **2 VALIDATE** (currently safe, harden defensively): `image-uploader.ts` (server temp `filepath` from multipart parser) and `useProviders.ts:7` (`provider` is literal-only at all call sites).
- **3 already resolved at HEAD** (snapshot is stale, dated same day before recent commits): `no-unused-vars` payment.test.ts:98 (commit bb82c170), the v-html audit (08e35269 removed PacksDefault:4 + one AccountMain line), the bbdd-backup basename guard (3d81e7eb shifted all backup line numbers). These will auto-clear on remote re-scan — not SUPPRESS.

**Primary recommendation:** FIX the 6 security reals + 9 `any` first (each with a regression test), then resolve the false positives via Codacy suppression — but **canary-test the suppression mechanism on one finding before bulk-applying** (see OQ-1: inline `nosemgrep` is provably ignored under SARIF output, which Codacy remote uses; the reliable mechanism is the Codacy dashboard "Ignore" action and/or committed `.codacy.yaml` path-excludes).

---

## Critical operational findings (read before planning)

### F1 — The flagged security rules are NOT in the local CLI config
The snapshot rules (`Semgrep_rules_lgpl_javascript_*`, `avoid-v-html`, `non-literal-fs`, etc.) are part of **Codacy's hosted Opengrep ruleset**, not the 555-rule local `.codacy/tools-configs/semgrep.yaml` (grep for any of these IDs returns empty). **Consequence:** running `.codacy/cli.sh` / `pnpm codacy` locally will NOT reproduce the security buckets. Only the **remote dashboard re-scan** verifies them. The local CLI only validates the ESLint buckets (`no-explicit-any`, `no-unused-vars`).

### F2 — Inline `nosemgrep` is ignored under SARIF output (verified)
Opengrep/Semgrep have a known, open bug: when output is SARIF, `// nosemgrep` comments are NOT honored and the finding is still emitted (opengrep#269, semgrep#11605, semgrep#6658). Codacy's remote integration consumes SARIF. **Therefore the CONTEXT-locked "inline nosemgrep" mechanism may not actually suppress on Codacy remote.** The reliable Codacy mechanism is the **dashboard "Ignore" triage action** (per-finding, persists) and/or **committed `.codacy.yaml` path-excludes** for whole files. This is the single biggest execution risk — see OQ-1 and the canary step in §2.

### F3 — Remote ignores differ from the committed local `.codacy.yaml`
The committed root `.codacy.yaml` already excludes `**/tests/**`, `**/*.config.ts`, and `jest.setup.ts`, yet the remote snapshot still flags `nitro-globals.ts` (tests/), `payment.test.ts` (tests/), and `jest.setup.ts`. So **remote does not currently honor those committed excludes** (the dashboard has its own ignore config). Cleanest fix for the test/config cluster is to **sync the remote ignore settings with the local `.codacy.yaml`** rather than per-line edits — pending OQ-1.

---

## 1. Disposition table

Verdicts grouped by bucket; per-line where a bucket splits. "Snapshot line" = the line in the 2026-06-14 snapshot (may be stale); "current line" given where it shifted.

### NoSQL-injection (36) — 33 SUPPRESS, 3 FIX

| File:line (snapshot) | Verdict | Justification | Action |
|---|---|---|---|
| condition/region/commune/article/category `lifecycles.ts` (32,19,19,28,19) | SUPPRESS | `where: { id: where.id }` from `event.params` (internal Strapi update event, server-controlled) — not HTTP input | Suppress 5 |
| ad-featured-reservation ctrl:12 | SUPPRESS | `where: { id: userId }`, `userId = Number(body.userId)` — scalar-coerced | Suppress |
| ad-reservation ctrl:12 | SUPPRESS | same pattern, `Number(body.userId)` | Suppress |
| google-one-tap.service:40 | SUPPRESS | `google_sub: sub` (verified token), `email: normalizedEmail` = `(email??"").toLowerCase()` (forces string) | Suppress |
| authController:209 | SUPPRESS | `update where:{ id: user.id }` — `user.id` from register response | Suppress |
| authController:231 | SUPPRESS | `findOne where:{ id: user.id }` — server-created user | Suppress |
| authController:340 | SUPPRESS | `Number(ctx.response.body.user.id)` — scalar | Suppress |
| **authController:396** | **FIX** | `findOne({ where: { pendingToken } })` — `pendingToken` from `ctx.request.body`, **NOT coerced**; guard `if(!pendingToken)` passes `{$ne:null}` → operator injection on verification-code login | `String(pendingToken)` coercion before query |
| authController:425 | SUPPRESS | `where:{ id: record.userId }` — from DB record | Suppress |
| authController:598 | SUPPRESS | `where:{ email: email.toLowerCase() }` — forces string | Suppress |
| authController:750 | SUPPRESS | `userId = responseBody.user.id` — from response body | Suppress |
| userController:79,87 | SUPPRESS | `where:{ user:{ id: user.id } }` — `ctx.state.user` (authenticated) | Suppress |
| userController:119 | SUPPRESS | `Number(ctx.state.user.id)` — scalar | Suppress |
| userController:154 | SUPPRESS | `Number(ctx.params.id)` — route param coerced | Suppress |
| usernameUpdateController:4 | SUPPRESS | `Number(ctx.state.user.id)` → `where:{ id: userId }` | Suppress |
| user-registration:102,106,142 | SUPPRESS | `where:{ id: loginResponse.user.id / userResponse.id }` — server response body | Suppress |
| ad ctrl:104 | SUPPRESS | `Number(ctx.params.id)` → `where:{ id }` | Suppress |
| ad ctrl:566,567 | SUPPRESS | `Number(ctx.params.id)`, `Number(ctx.state.user?.id)` — scalar | Suppress |
| **ad/services/ad.ts:1141** | **FIX** | `adId = ad.ad_id as number\|undefined` (HTTP payload, **uncoerced**) → `findOne/update where:{ id: adId }`; `if(!adId)` passes `{$gt:0}` → operator injection (ownership re-check limits but does not close it) | `Number(ad.ad_id)` coercion |
| payment ctrl:419 | SUPPRESS | flagged line is `ctx.redirect(...)`; nearest query uses authenticated `user.id` | Suppress |
| payment ctrl:449 | SUPPRESS | `where:{ user:{ id: user.id } }` — `getCurrentUser(ctx)` authenticated | Suppress |
| order ctrl:395 | SUPPRESS | `documentId = ctx.params.documentId ?? ctx.params.id` (route param = string); numeric branch `Number()`-validated, string branch → `documents().findOne({ documentId })` (id slot, not filter operator) | Suppress |
| **checkout.service:112** | **FIX** | `findOne({ where: { name: payload.pack } })` — `payload.pack` from HTTP body, **uncoerced** (typed `string` ≠ runtime guarantee); `pack:{$ne:""}` returns first pack | `String(payload.pack)` coercion |
| checkout.service:191 | SUPPRESS | `userId = parts[1]` from `buyOrder.split("-")` (`buyOrder as string`) — string | Suppress |
| payment/utils/user.utils:49 | SUPPRESS | `where:{ id: ctx.state.user.id }` — authenticated | Suppress |
| subscription-charge.cron:164,174 | SUPPRESS | `user.id` from iterated DB records | Suppress |
| migrate-subscription-pro:35 | SUPPRESS | `where:{ user:{ id: user.id } }` — DB iteration | Suppress |

### path-traversal `non-literal-fs` (17) + `path-join-resolve` (4) + `generic-path-traversal` (1) — all SUPPRESS or VALIDATE

| File (snapshot lines) | Verdict | Justification |
|---|---|---|
| weather.service.ts (19,20,23,24,29,34→ now 13,19,20,23,24,29,34) | SUPPRESS | `path.join(process.cwd(), "data", "weather.json")` — hardcoded constants, no input |
| indicador.service.ts (32,33→ now 29,32,33) | SUPPRESS | `path.join(process.cwd(), "data", "indicators.json")` — hardcoded constants |
| bbdd-backup.cron.ts (126,128,206,217,220 fs; 147,169,183 path-join → now via `backupFilePath()` 41/92/155/174/185/217/218/221) | SUPPRESS | `backupDir` = `path.join(cwd,"backups")` fixed; all segments are server-generated timestamps; **basename guard already added (commit 3d81e7eb)** — snapshot lines stale |
| config/database.ts:58 | SUPPRESS | `path.join(__dirname,"..","..",env("DATABASE_FILENAME",".tmp/data.db"))` — env/config-driven, not HTTP |
| image-uploader.ts (27,33,88,111 + generic:27) | VALIDATE | `f.filepath` is the temp path assigned by Strapi's multipart parser (server-generated `/tmp/...`), not user-controlled; user controls only `originalFilename` (display). Not exploitable today → realistic disposition is SUPPRESS. Optional hardening: assert `realpath(f.filepath)` is under the OS temp dir before read/write |

### v-html (14 snapshot → 12 current) — all SUPPRESS; 2 already resolved

Current v-html inventory (re-grepped) — every one routes through `useSanitize` (`sanitize-html` with `marked` HTML-suppression):

| Component:line (current) | Source | Verdict |
|---|---|---|
| AdSingle.vue:15 | `sanitizeRich(all.description)` | SUPPRESS |
| ArticleSingle.vue:12 | `parseMarkdown(article.body)` | SUPPRESS |
| CardCategory.vue:8 | `sanitizeText(props.title)` | SUPPRESS |
| CardHighlight.vue:12,13 | `sanitizeText(title/description)` | SUPPRESS |
| MessageDefault.vue:14 | `sanitizeText(description)` | SUPPRESS |
| AccordionDefault.vue:33 | `item.text` ← `sanitizeRich(...)` (line 62) | SUPPRESS |
| CardPack.vue:14 | `descriptionText` ← `sanitizeText(...)` (line 67) | SUPPRESS |
| AccountMain.vue:22,25 | `adReservationsText`/`featuredAdReservationsText` ← `sanitizeText(...)` | SUPPRESS |
| IntroduceAuth.vue:7,12 | `getTitle`=`stringSanitizeTitle(...)`, `sanitizedSubtitle`=`sanitizeText(...)` | SUPPRESS |
| ~~PacksDefault.vue:4~~ | **RESOLVED** — now `{{ title }}` (commit 08e35269) | already clear on re-scan |
| ~~AccountMain.vue (one of 22/23/29)~~ | **RESOLVED** — pack banner de-v-html'd (08e35269); snapshot's 14th line is stale | already clear |

### no-explicit-any (9) — all FIX

| File:line | Verdict | Action |
|---|---|---|
| koa.d.ts:10 (`body: any`) | FIX | → `body: unknown` (existing call sites already cast via `as`) — verify tsc |
| nitro-globals.ts:9,14,23,27 (`globalThis as any`) | FIX | typed augmentation: `(globalThis as typeof globalThis & Record<string, unknown>)` or a declared interface; test stub, low risk |
| better-stack.service.ts:45,63 (`{ data: any[] }`) | FIX | → `unknown[]` (the `.map` already casts `item.attributes`) |
| cloudflare.service.ts:24,43 (`Promise<any>`, `as any`) | FIX | → `Promise<unknown>` + cast at use (CLAUDE.md bans `any`; STATE precedent was documented `any` — supersede with `unknown`) |

### hashicorp-tf-password (9) — all SUPPRESS via the ONE repo-wide disable

| File:line | Justification |
|---|---|
| FormPassword:139, FormPasswordDashboard:120/125/130, FormDev:77, FormLogin:110, FormResetPassword:150, FormRegister:339 | `passwordType.value === "password" ? "text" : "password"` — show/hide input-type idiom; gitleaks matches the literal word `"password"`, not a credential |
| authController:562 | `"create-password"`/`"reset-password"` email template name strings — not a credential |

→ **100% structural noise, zero real hits → repo-wide disable is legitimate** (the only one).

### insecure-random (3) — all FIX (environment-specific)

| File:line | Env | Action |
|---|---|---|
| password.ts:31 (`Math.random()` in `pick`) | **client** | `crypto.getRandomValues(new Uint32Array(1))` + rejection sampling |
| password.ts:45 (`Math.random()` in Fisher-Yates shuffle) | **client** | same CSPRNG helper |
| authController.ts:290 (`Math.random().toString(36).slice(2,6)`) | **server** | `crypto.randomBytes(...)`. NB: value is a username-collision suffix, not a credential — low security impact, but apply correct server primitive to keep the rule active |

### Remaining singletons

| File:line | Rule | Verdict | Justification / Action |
|---|---|---|---|
| zoho/http-client.ts:17 | SSRF | SUPPRESS | `baseURL: config.apiUrl` from internal `ZohoConfig` (env-driven), not HTTP input |
| better-stack.service.ts:28 | SSRF | SUPPRESS | base URL hardcoded; only hardcoded `per_page` query params appended via `searchParams.set` |
| payment-gateway/registry.ts:15 | unsafe-dynamic-method | SUPPRESS | `GATEWAY_FACTORIES[id]`, `id = process.env.PAYMENT_GATEWAY ?? "transbank"` — env-driven key against a static allowlist `{transbank}`; unknown keys throw |
| useProviders.ts:7 | open-redirect | VALIDATE | `window.location.href = getProviderAuthenticationUrl(provider)`; all 4 call sites pass literals (`"google"`/`"facebook"`) — not exploitable today. Harden: validate `provider` against allowlist `['google','facebook']` before redirect |
| useValidation.ts:157 | non-literal-regexp | SUPPRESS | `new RegExp(\`\\b${word}\\b\`,"i")` where `word` iterates a hardcoded `loremWords` constant; user input (`text`) only goes into `.test()` (safe) |
| jest.setup.ts:4 | generic-api-key | SUPPRESS (path-exclude, NOT repo-wide disable) | hardcoded Transbank **sandbox/integration** key in a test setup file — but the rule has genuine detection value (it correctly matches a hardcoded-credential pattern), so it is **not** "100% noise". See OQ-2 — deviates from CONTEXT's repo-wide hypothesis |
| payment.test.ts:98 | no-unused-vars | **RESOLVED** | `mockSubPayCreate` removed in commit bb82c170 — clears on re-scan; not a SUPPRESS |

---

## 2. Suppression plan

> **CANARY FIRST (OQ-1):** Before bulk-applying any suppression, apply ONE (e.g. one NoSQL false positive), trigger a remote re-scan, and confirm the finding moves to Ignored / drops. Inline `nosemgrep` is provably ignored under SARIF (F2) — if the canary inline comment does not clear, switch the entire suppression strategy to the **Codacy dashboard "Ignore" action** (per-finding) and/or committed `.codacy.yaml` path-excludes. Do not author 50 source edits against an unverified mechanism.

### A. Repo-wide disable — exactly ONE rule (the only 100%-noise rule)
In the **Codacy dashboard code-pattern config** (and mirror in `.codacy.yaml`/`.codacy/codacy.yaml` if remote honors it — pending F3/OQ-1), disable:
- `hashicorp-tf-password` (gitleaks) — rule id surface: `Semgrep_generic.secrets.gitleaks.hashicorp-tf-password.hashicorp-tf-password`. 9 hits, all the `"password"` show/hide idiom, zero real.

### B. Path-exclude (sync remote with local `.codacy.yaml`) — F3
- `jest.setup.ts` → exclude on remote (already in local `.codacy.yaml`). Covers `detected-generic-api-key`. **Do NOT repo-wide disable `detected-generic-api-key`** (OQ-2 — it has detection value).
- `apps/website/tests/stubs/nitro-globals.ts` and `apps/strapi/tests/**` → exclude on remote (already in local `.codacy.yaml`). Note: the 4 `nitro-globals` `any` issues are ALSO being FIXed in §3 (belt-and-suspenders; CLAUDE.md bans `any` even in test stubs).

### C. Inline per-line suppression (IF canary confirms it works on remote)
Mechanism per CONTEXT: `// nosemgrep: <rule-id>` with a one-line justification. Rule-ids derive from the snapshot's dotted display names (e.g. `javascript.vue.security.audit.xss.templates.avoid-v-html.avoid-v-html`). **The `rules_lgpl_*` ids use an ambiguous separator — confirm the exact accepted id during the canary; never use a bare `// nosemgrep` (over-suppresses every rule on the line).**

Lines to suppress (re-derive current line numbers at apply-time — several shifted):
- **NoSQL (33):** all rows marked SUPPRESS in §1 NoSQL table — each gets `// nosemgrep: <nosqli-id> — value is scalar-coerced / server-derived (see justification)`.
- **path-traversal (21):** weather (current 13,19,20,23,24,29,34), indicador (29,32,33), bbdd-backup (current 41/92/136/138/155/174/185/207/217/218/221 — re-grep), database.ts:58 — `// nosemgrep: <id> — fixed server dir / server-generated segment`.
- **v-html (12 current):** the 12 components in §1 v-html table — `<!-- nosemgrep: ...avoid-v-html — sanitized via useSanitize/sanitize-html -->` (Vue template comment placement; confirm Opengrep reads HTML comments — part of canary).
- **SSRF (2), dynamic-method (1), non-literal-regexp (1):** the 4 singletons marked SUPPRESS.
- **image-uploader (5) + useProviders (1):** VALIDATE items — suppress only AFTER the defensive hardening in §3 lands (so the suppression comment can cite the new guard).

> If the canary fails (likely, per F2/SARIF bug): replace ALL of section C with **dashboard "Ignore" actions** keyed to each finding, each annotated with the same justification. This is the documented-reliable Codacy path. The plan must branch here.

---

## 3. Fix plan

### Group 1 — NoSQL operator-injection (3 reals) — scalar coercion
| File:line | Fix | Char. test exists? |
|---|---|---|
| authController.ts:396 | `const token = String(pendingToken); ... findOne({ where: { pendingToken: token } })` | YES — `authController.test.ts` covers `verifyCode`/`pendingToken` (VSTEP). **Add** injection test: `pendingToken: {$ne:null}` → `badRequest` |
| ad/services/ad.ts:1141 | `const adId = Number(ad.ad_id);` (then `if (!adId)` guard already rejects NaN/0) | **NO test** → **Wave 0 gap**: write `saveDraft` characterization test (new-vs-update branch + ownership) BEFORE fixing |
| checkout.service.ts:112 | `findOne({ where: { name: String(payload.pack) } })` | YES — `checkout.service.test.ts` mocks `ad-pack findOne`. **Add** injection test: `payload.pack = {$ne:""}` → no match |

### Group 2 — insecure-random (3) — environment-split crypto
| File:line | Fix |
|---|---|
| password.ts:31,45 (**client**) | Add `randomInt(max)` helper using `crypto.getRandomValues(new Uint32Array(1))` with rejection sampling (avoid modulo bias); replace both `Math.floor(Math.random()*n)`. `password.test.ts` EXISTS (length/charset/strength) — validates output shape post-refactor |
| authController.ts:290 (**server**) | `crypto.randomBytes(3).toString("hex").slice(0,4)` (or base36 from bytes) for the username suffix. `authController.test.ts` EXISTS |

> **Do NOT cross-apply:** `getRandomValues` is browser/Web Crypto (client); `randomBytes` is Node (server). `password.ts` runs in the browser → `getRandomValues`. `authController.ts` is Strapi Node → `randomBytes`.

### Group 3 — no-explicit-any (9)
Per §1 table. `koa.d.ts` → `unknown`; `nitro-globals.ts` → typed `globalThis` augmentation; `better-stack`/`cloudflare` → `unknown[]`/`unknown` + cast at use. Verify with `vue-tsc --noEmit` (website) and Strapi `tsc` (STATE note: use `vue-tsc`, not `nuxi typecheck`, in worktrees).

### Group 4 — defensive hardening (VALIDATE → optional FIX)
| File | Hardening |
|---|---|
| useProviders.ts:7 | `const ALLOWED = ['google','facebook']; if (!ALLOWED.includes(provider)) return;` before building/assigning the redirect URL |
| image-uploader.ts | (optional) assert `path.resolve(f.filepath)` starts with `os.tmpdir()` before `fs` ops |

### High-blast-radius files needing a characterization test BEFORE refactor
| File | Test status |
|---|---|
| `authController.ts` (verifyCode :396, random :290) | EXISTS — `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts` |
| `checkout.service.ts` (:112) | EXISTS — `apps/strapi/tests/api/payment/services/checkout.service.test.ts` |
| `apps/website/app/utils/password.ts` (:31,:45) | EXISTS — `apps/website/tests/utils/password.test.ts` |
| **`ad/services/ad.ts` saveDraft (:1141)** | **MISSING → Wave 0 gap** — write test first |

---

## 4. Verification per bucket

| Bucket | Verifies via | Command / mechanism |
|---|---|---|
| NoSQL, path-traversal, v-html, SSRF, dynamic-method, regex, tf-password, insecure-random, generic-api-key, open-redirect | **Remote Codacy re-scan ONLY** (F1 — these rules are not in the local CLI config) | Push to branch → trigger Codacy analysis → confirm each bucket → 0 (or Ignored). The canary (§2) gates this |
| no-explicit-any (9) | **Local** ESLint + typecheck | Strapi: `tsc` / Jest; Website: `vue-tsc --noEmit` (NOT `nuxi typecheck` in worktree, per STATE). `pnpm codacy` (local CLI covers ESLint) |
| no-unused-vars (payment.test.ts) | Already resolved (bb82c170) | confirm on re-scan |
| Regression on FIX paths | Jest (Strapi) + Vitest (website), AAA, tests in root `tests/` | `pnpm --filter strapi jest <path>`; `pnpm --filter website vitest run`. Add the 3 injection tests + the saveDraft characterization test |

**Per-bucket sequencing:** atomic commit per pattern bucket; re-scan after each before moving on (CONTEXT). Because security verification is remote-only, batch the security suppressions into as few re-scan cycles as the canary result allows.

---

## Validation Architecture

> nyquist_validation is enabled (config.json: `workflow.nyquist_validation: true`).

### Test Framework
| Property | Value |
|----------|-------|
| Framework (Strapi) | Jest (AAA pattern), tests in `apps/strapi/tests/` mirroring `src/` |
| Framework (Website) | Vitest + `@nuxt/test-utils`, tests in `apps/website/tests/` |
| Config | `apps/strapi/jest.config.*`, `apps/website/vitest.config.ts` |
| Quick run | `pnpm --filter strapi jest <file>` / `pnpm --filter website vitest run <file>` |
| Full suite | `pnpm test` (Turbo) |
| Static-analysis gate | Local: `pnpm codacy` (ESLint buckets). Remote: Codacy dashboard re-scan (security buckets — F1) |

### Security invariants → test map
| Invariant | Where enforced | How validated |
|---|---|---|
| **No operator injection on HTTP-input filters** — every `where`-value reachable from `ctx.request.body/query` must be scalar-coerced (`String()`/`Number()`) | authController:396, ad.service:1141, checkout:112 | New Jest tests pass an object (`{$ne:null}`/`{$gt:0}`) as the input and assert no match / `badRequest`. saveDraft test is a Wave 0 gap |
| **CSPRNG for password generation** — no `Math.random()` in `generateSecurePassword` | password.ts:31,45 | `password.test.ts` (existing) validates output length/charset/strength survives the `crypto.getRandomValues` refactor; assert `Math.random` is not referenced (grep guard) |
| **Server-side secret randomness** — username suffix via `crypto.randomBytes` not `Math.random` | authController:290 | `authController.test.ts` (existing) covers the reserved-username path; assert suffix length |
| **Path confinement** — fs paths stay under intended server dirs | bbdd-backup (`backupFilePath`+basename guard, existing), image-uploader (temp dir) | bbdd-backup basename guard already in place (3d81e7eb); image-uploader optional `realpath` assertion under `os.tmpdir()` |
| **No unsanitized user HTML in v-html** — every `v-html` binds a `useSanitize` output | 12 website components | Confirmed by source audit (all route through `sanitize-html`); regression guard: grep that no `v-html` binds a raw prop/Strapi field without `sanitize*`/`parseMarkdown`/`stringSanitizeTitle` |
| **Open-redirect confinement** — `provider` validated against allowlist before `window.location.href` | useProviders.ts:7 | Vitest: `redirectToProvider('evil://x')` does not navigate |

### Sampling rate
- **Per task commit:** quick Jest/Vitest run for the touched file.
- **Per bucket merge:** full app suite + `pnpm codacy` (ESLint) locally; remote re-scan for security buckets.
- **Phase gate:** all suites green + Codacy remote shows 0 open (or Ignored-with-justification) before `/gsd:verify-work`.

### Wave 0 gaps
- [ ] `apps/strapi/tests/api/ad/services/ad.service.saveDraft.test.ts` — characterization + injection test for `saveDraft` (covers CODACY-FIX ad.service:1141). **No existing coverage.**
- [ ] Add injection cases to existing `authController.test.ts` (pendingToken object) and `checkout.service.test.ts` (payload.pack object).
- [ ] Canary harness: one suppression → remote re-scan, to validate the suppression mechanism (OQ-1) before bulk apply.

*(All other FIX paths have existing characterization tests — authController, checkout, password.)*

---

## Open Questions

### OQ-1 (HIGH — gates the whole suppression strategy): Does Codacy remote honor inline `nosemgrep`?
- **Known:** Opengrep/Semgrep ignore `// nosemgrep` when output is SARIF (verified bug, opengrep#269 / semgrep#11605 / #6658); Codacy remote consumes SARIF.
- **Unclear:** whether Codacy's pipeline post-processes nosemgrep regardless of SARIF, and whether committed `.codacy.yaml`/dashboard config is the effective ignore surface on remote (F3 says committed excludes are currently NOT honored remotely).
- **Recommendation:** CANARY — apply one inline suppression, re-scan, observe. If it doesn't clear, use the **Codacy dashboard "Ignore" action** as the suppression mechanism (per-finding, persists, documented-reliable) and/or sync remote ignore config with `.codacy.yaml`. The plan must branch on the canary result. This corrects CONTEXT line 45 ("local CLI to confirm bucket→0") which is invalid for security buckets (F1).

### OQ-2 (MEDIUM — deviation from CONTEXT): `detected-generic-api-key` should NOT be repo-wide disabled
- CONTEXT's hypothesis labeled it "100% noise (fixture in jest.setup.ts)". Reading jest.setup.ts:4 shows a real hardcoded-credential *pattern* (a Transbank sandbox key) — the rule is doing its job, so it has future detection value. Per CONTEXT line 33 ("never repo-wide disable a rule with a real-pattern hit"), the correct action is a **path-exclude of `jest.setup.ts`** (matching local `.codacy.yaml`), not a repo-wide disable. Flagged visibly for planner confirmation.

### OQ-3 (LOW): exact `rules_lgpl_*` rule-id string for inline comments
- The underscore-namespaced display names (`Semgrep_rules_lgpl_javascript_database_rule-node-nosqli-injection`) don't map 1:1 to a dotted semgrep id and aren't present in the local config (F1). Confirm the accepted id during the canary. Moot if suppression goes via the dashboard "Ignore" action (which is id-agnostic).

---

## Sources

### Primary (HIGH)
- Direct source reads (all 100 sites): `apps/strapi/src/**`, `apps/website/app/**`, configs, tests — every file:line in the snapshot opened.
- `.codacy.yaml`, `.codacy/codacy.yaml`, `.codacy/cli-config.yaml`, `.codacy/tools-configs/semgrep.yaml` (555 rules; lgpl security rules absent → F1).
- Git: commits 3d81e7eb (backup basename guard), 08e35269 (v-html audit), bb82c170 (unused-var removal) — staleness baseline.
- `apps/strapi/tests/`, `apps/website/tests/` — characterization-test inventory.

### Secondary (MEDIUM)
- Codacy/Opengrep/Semgrep suppression behaviour — opengrep#269, semgrep#11605/#6658, semgrep.dev/docs/ignoring-files-folders-code (F2/OQ-1). https://github.com/opengrep/opengrep/issues/269 , https://semgrep.dev/docs/ignoring-files-folders-code

---

## Metadata

**Confidence breakdown:**
- Per-issue triage: HIGH — every line read in source with origin/coercion traced.
- The 3 NoSQL reals + 3 insecure-random + 9 `any`: HIGH — concrete, mechanism-verified.
- Suppression mechanism (OQ-1): MEDIUM — SARIF/nosemgrep bug confirmed; Codacy's exact handling needs the canary.
- Staleness (3 already-resolved): HIGH — verified against HEAD + commit diffs.

**Research date:** 2026-06-14
**Valid until:** 2026-06-21 (7 days — depends on a live Codacy snapshot; new issues may appear)
