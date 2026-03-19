---
phase: 090
slug: migrate-all-get-callers
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 090 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace waldo-website vitest run --reporter=verbose apps/website/app/composables/useApiClient.test.ts` |
| **Full suite command** | `yarn workspace waldo-website vitest run --reporter=verbose` |
| **Typecheck command** | `yarn workspace waldo-website nuxt typecheck` |
| **Estimated runtime** | ~15 seconds (quick), ~30 seconds (full), ~60 seconds (typecheck) |

---

## Sampling Rate

- **After every task commit:** Run quick vitest (useApiClient.test.ts) to confirm no regression
- **After every plan wave:** Run full vitest suite + `nuxt typecheck`
- **Before `/gsd-verify-work`:** Full suite must be green + typecheck exits 0
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 090-01-1 | 01 | 1 | API-01 | manual grep + typecheck | `grep -rn "strapi.find" apps/website/app/stores/filter.store.ts apps/website/app/stores/regions.store.ts apps/website/app/stores/communes.store.ts apps/website/app/stores/conditions.store.ts apps/website/app/stores/faqs.store.ts` | ✅ | ⬜ pending |
| 090-02-1 | 02 | 1 | API-01, API-02 | manual grep + typecheck | `grep -rn "strapi.find" apps/website/app/stores/ads.store.ts apps/website/app/stores/related.store.ts apps/website/app/stores/articles.store.ts apps/website/app/stores/categories.store.ts` | ✅ | ⬜ pending |
| 090-03-1 | 03 | 1 | API-01, API-02 | manual grep + typecheck | `grep -rn "strapi.find\|strapi.findOne" apps/website/app/stores/me.store.ts apps/website/app/stores/user.store.ts apps/website/app/stores/indicator.store.ts` | ✅ | ⬜ pending |
| 090-04-1 | 04 | 1 | API-03 | manual grep + typecheck | `grep -rn "strapi.find\|strapi.findOne" apps/website/app/composables/useStrapi.ts apps/website/app/composables/useOrderById.ts apps/website/app/composables/usePacksList.ts` | ✅ | ⬜ pending |
| 090-05-1 | 05 | 1 | API-04 | manual grep + typecheck | `grep -rn "strapi.find\|strapi.findOne" apps/website/app/pages/index.vue apps/website/app/pages/anunciar/gracias.vue apps/website/app/pages/anunciar/index.vue apps/website/app/pages/packs/index.vue apps/website/app/components/FormProfile.vue` | ✅ | ⬜ pending |
| 090-06-1 | 06 | 2 | API-06 | automated | `yarn workspace waldo-website nuxt typecheck` | ✅ | ⬜ pending |
| 090-06-2 | 06 | 2 | API-01..06 | automated | `grep -rn "strapi\.find\|strapi\.findOne" apps/website/app/stores/ apps/website/app/composables/ apps/website/app/pages/ apps/website/app/components/` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

- `apps/website/app/composables/useApiClient.test.ts` — 9-test suite already green (phase 089)
- TypeScript typecheck already passing (phase 089)

*No new test scaffolding needed — migration is mechanical substitution with grep-based verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All pages load correctly in browser | API-01..04 | Runtime response shape; TypeScript can't catch `.data` wrapper mismatches at runtime | Start dev server, visit /, /packs, /anunciar, /cuenta/perfil/editar, /anunciar/gracias?ad=<id> — confirm no console errors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
