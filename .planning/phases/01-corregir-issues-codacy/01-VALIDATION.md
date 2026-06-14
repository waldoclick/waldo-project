---
phase: 1
slug: corregir-issues-codacy
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from 01-RESEARCH.md §"Validation Architecture". Note F1: the local
> Codacy CLI (`pnpm codacy`) only reproduces the **ESLint** buckets; the **security**
> buckets (Opengrep/Semgrep) are hosted rules verified only by a **remote re-scan**.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (Strapi)** | Jest 29.x (AAA), tests in `apps/strapi/tests/` mirroring `src/` |
| **Framework (Website)** | Vitest + `@nuxt/test-utils`, tests in `apps/website/tests/` |
| **Config file** | `apps/strapi/jest.config.*`, `apps/website/vitest.config.ts` |
| **Quick run command** | `pnpm --filter strapi jest <file>` / `pnpm --filter website vitest run <file>` |
| **Full suite command** | `pnpm test` (Turbo) |
| **Static gate** | `pnpm codacy` (ESLint buckets only) + Codacy remote re-scan (security buckets) |
| **Estimated runtime** | ~90 seconds (per-app quick runs are sub-10s) |

---

## Sampling Rate

- **After every task commit:** Run the quick command for the touched file
- **After every plan wave:** Run the full app suite + `pnpm codacy` (ESLint)
- **Before `/gsd:verify-work`:** Full suite green + Codacy remote shows 0 open (or Ignored-with-justification)
- **Max feedback latency:** ~90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Invariant | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-----------|-----------|-------------------|-------------|--------|
| 1-00-01 | 00 | 0 | saveDraft `ad_id` object-injection characterization (RED) | unit | `pnpm --filter strapi jest ad.service.saveDraft` | ❌ W0 new | ⬜ pending |
| 1-00-02 | 00 | 0 | pendingToken object rejected (RED) | unit | `pnpm --filter strapi jest authController` | ✅ extend | ⬜ pending |
| 1-00-03 | 00 | 0 | payload.pack object rejected (RED) | unit | `pnpm --filter strapi jest checkout.service` | ✅ extend | ⬜ pending |
| 1-00-04 | 00 | 0 | useProviders allowlist redirect guard (RED) | unit | `pnpm --filter website vitest run useProviders` | ❌ W0 new | ⬜ pending |
| 1-01-01 | 01 | 1 | authController `String(pendingToken)` coercion — turns 00-02 green | unit | `pnpm --filter strapi jest authController` | ✅ via W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | authController username suffix via server `crypto.randomBytes` | unit | `pnpm --filter strapi jest authController` | ✅ existing | ⬜ pending |
| 1-02-01 | 02 | 1 | ad.ts `Number(ad.ad_id)` — turns 00-01 green | unit | `pnpm --filter strapi jest ad.service.saveDraft` | ✅ via W0 | ⬜ pending |
| 1-02-02 | 02 | 1 | checkout.service `String(payload.pack)` — turns 00-03 green | unit | `pnpm --filter strapi jest checkout.service` | ✅ via W0 | ⬜ pending |
| 1-03-01 | 03 | 1 | password.ts client `crypto.getRandomValues` + rejection sampling | unit | `pnpm --filter website vitest run password` | ✅ existing | ⬜ pending |
| 1-04-01 | 04 | 1 | no-explicit-any → unknown (9 sites) | static | `pnpm codacy` + per-app typecheck | ✅ ESLint | ⬜ pending |
| 1-05-01 | 05 | 1 | useProviders allowlist — turns 00-04 green | unit | `pnpm --filter website vitest run useProviders` | ✅ via W0 | ⬜ pending |
| 1-05-02 | 05 | 1 | image-uploader `realpath` under `os.tmpdir()` confinement | static | grep + per-app typecheck | ✅ grep | ⬜ pending |
| 1-06-01 | 06 | 2 | ~80 FP ignored on remote (account-token bulk-ignore) + repo-config audit note | manual+api | Codacy remote re-scan shows 0 open (or Ignored) | n/a | ⬜ blocked: account token |

---

## Wave 0 Requirements

- [ ] `apps/strapi/tests/api/ad/services/ad.service.saveDraft.test.ts` — characterization + injection test for `saveDraft` (covers FIX ad.service:1141). **No existing coverage.**
- [ ] Extend `apps/strapi/tests/.../authController.test.ts` — `pendingToken` object-injection case (FIX authController:396)
- [ ] Extend `apps/strapi/tests/api/payment/.../checkout.service.test.ts` — `payload.pack` object-injection case (FIX checkout:112)
- [ ] `apps/website/tests/.../useProviders` — allowlist redirect guard test (VALIDATE useProviders:7)

*password.ts and authController username-suffix paths have existing characterization tests.*

---

## Manual-Only Verifications

| Behavior | Invariant | Why Manual | Test Instructions |
|----------|-----------|------------|-------------------|
| ~80 false positives marked Ignored | Codacy grade reflects only real issues | Codacy cloud state is out-of-git; bulk-ignore API needs an **account** API token (project token is read-only — canary returned 401) | Provide account token → run `POST .../issues/bulk-ignore` (≤100/call) with `reason:"False positive"` + per-issue justification from 01-RESEARCH.md disposition table; OR mark Ignored in dashboard. Verify via `POST .../ignoredIssues/search` |
| Security buckets cleared | Real fixes resolved on remote | Hosted Opengrep rules not in local CLI (F1) | Push branch → Codacy re-scan → open count for the 6 reals drops to 0 |

*In-repo audit trail for the out-of-git ignores = the disposition table in 01-RESEARCH.md + justifications echoed in 05-PLAN.md.*

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (saveDraft, useProviders allowlist)
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter
- [x] Per-Task Map synced to final 7-plan structure (00–06)

**Approval:** approved 2026-06-14
