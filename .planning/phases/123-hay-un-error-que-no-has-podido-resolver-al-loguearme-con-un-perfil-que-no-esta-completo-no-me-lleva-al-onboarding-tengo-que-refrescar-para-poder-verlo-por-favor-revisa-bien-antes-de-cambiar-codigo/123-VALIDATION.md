---
phase: 123
slug: 123-hay-un-error-que-no-has-podido-resolver-al-loguearme-con-un-perfil-que-no-esta-completo-no-me-lleva-al-onboarding-tengo-que-refrescar-para-poder-verlo-por-favor-revisa-bien-antes-de-cambiar-codigo
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-11
---

# Phase 123 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @nuxt/test-utils |
| **Config file** | `apps/website/vitest.config.ts` |
| **Quick run command** | `yarn workspace website test --run tests/middleware/ tests/components/` |
| **Full suite command** | `yarn workspace website test --run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn workspace website test --run tests/middleware/ tests/components/`
- **After every plan wave:** Run `yarn workspace website test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 123-01-01 | 01 | 1 | GUARD-TEST-01 | unit | `yarn workspace website test --run tests/middleware/onboarding-guard.test.ts` | ✅ | ⬜ pending |
| 123-01-02 | 01 | 1 | NAV-FIX-01 (FormVerifyCode) | structural + unit | `grep -c "router.push\\|router.replace\\|useRouter" apps/website/app/components/FormVerifyCode.vue` returns 0 AND `yarn workspace website test --run tests/middleware/onboarding-guard.test.ts` | ✅ | ⬜ pending |
| 123-01-03 | 01 | 1 | NAV-FIX-02 (login/google) | structural + lint | `grep -c "router.push\\|useRouter" apps/website/app/pages/login/google.vue` returns 0 AND `cd apps/website && yarn lint app/pages/login/google.vue` | ✅ | ⬜ pending |
| 123-01-04 | 01 | 1 | NAV-FIX-03 (login/facebook) | structural + lint | `grep -c "router.push\\|useRouter" apps/website/app/pages/login/facebook.vue` returns 0 AND `cd apps/website && yarn lint app/pages/login/facebook.vue` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Note on 123-01-02 / 123-01-03:** Navigation behavior end-to-end requires a full Nuxt mount with real middleware pipeline execution, which is out of scope for unit tests. The automated coverage for these tasks is:
1. **Structural grep acceptance criteria** in the PLAN.md (zero `router.push`, exact `navigateTo(` counts, zero `isProfileComplete` calls, etc.) — these mechanically prove the substitution was made correctly.
2. **Guard unit test** (`tests/middleware/onboarding-guard.test.ts`) — proves the guard still correctly redirects incomplete-profile users when `navigateTo` triggers the middleware pipeline.
3. **Lint + typecheck** — proves the code compiles and has no unused imports.
4. **Manual E2E verification** (see section below) — proves the actual browser navigation works.

This combination satisfies Nyquist sampling for a mechanical substitution task where the behavior depends on framework internals (Nuxt middleware pipeline) rather than component-level logic.

---

## Wave 0 Requirements

- [ ] `apps/website/tests/middleware/onboarding-guard.test.ts` — fix broken mocks (add `useStrapiToken`, `useStrapiAuth`), remove stale `setReferer` assertion + delete now-unused `mockSetReferer` and `global.useAppStore` lines, fix `startsWith` → `===` for `/onboarding/thankyou`

**No test scaffolds needed for FormVerifyCode.vue or login/google.vue:** the structural grep criteria + existing guard test provide proportionate automated coverage for this mechanical `router.push` → `navigateTo` substitution. Creating a full Nuxt-mount component test for a 4-line substitution would be disproportionate and slow the feedback loop.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Login with incomplete profile (email+OTP) → redirected to /onboarding without refresh | NAV-FIX-01 | E2E flow requires real Strapi auth + real browser + real Nuxt middleware pipeline | 1. Create user with incomplete profile. 2. Log in via email+code. 3. Confirm redirect to /onboarding happens without manual refresh. |
| Login via Google with incomplete profile → redirected to /onboarding without refresh | NAV-FIX-02 | E2E flow requires real Google OAuth + real browser + real Nuxt middleware pipeline | 1. Create user via Google OAuth with incomplete profile. 2. Log in. 3. Confirm redirect to /onboarding without refresh. |
| Login via Facebook with incomplete profile → redirected to /onboarding without refresh | NAV-FIX-03 | E2E flow requires real Facebook OAuth + real browser + real Nuxt middleware pipeline | 1. Create user via Facebook OAuth with incomplete profile. 2. Log in. 3. Confirm redirect to /onboarding without refresh. |
| Login with complete profile → redirected to /anuncios (or referer), not /onboarding | NAV-FIX-01/02/03 | Same as above | 1. Log in with complete-profile user. 2. Confirm landing on /anuncios or stored referer. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (structural grep counts as automated)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (only `onboarding-guard.test.ts` needs Wave 0 fixes)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
