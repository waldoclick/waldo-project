# Phase 117: Enforce Root-Level Tests Directory for Website — Research

**Researched:** 2026-04-06
**Domain:** Test organization, Vitest (Nuxt website app), file-system audit
**Confidence:** HIGH

---

## Summary

**This phase is already complete.** Phase 116 Plan 01 (`116-01-PLAN.md`, commit `6edfe808`) moved all 9 co-located website test files from `app/composables/` and `app/components/` to `apps/website/tests/`, deleted 4 dead non-test `.ts` stubs in `tests/components/`, and updated all import paths to `@/` alias. The Phase 116 verifier confirmed 6/6 truths and marked STRUCT-116-WEB satisfied.

The current filesystem state exactly matches the "target state" described in Phase 117's title. All 23 website test files reside exclusively under `apps/website/tests/` with a mirrored folder structure. Zero test files exist under `apps/website/app/`. Zero test logic was changed.

**What Phase 117 must do:** Act as a formal closure and verification record for the website testing directory rule. The single plan should be a verification-only plan that: (1) confirms the current structure matches the mandatory rule, (2) runs the test suite to capture the current baseline, and (3) marks the requirement as satisfied in the roadmap.

**Primary recommendation:** Plan Phase 117 as a single verification plan with no file moves. The work is done — document and close it.

---

## Current State Audit (HIGH confidence — direct filesystem)

### All website test files (23 total, all in `tests/`)

```
apps/website/tests/
├── components/
│   ├── AccordionDefault.test.ts
│   ├── AccountAnnouncements.test.ts
│   ├── CardCategory.test.ts
│   ├── FormLogin.render.test.ts
│   ├── FormLogin.website.test.ts
│   ├── FormProfile.onboarding.test.ts
│   ├── FormRegister.test.ts
│   ├── OnboardingDefault.test.ts
│   ├── OnboardingThankyou.test.ts
│   ├── PoliciesDefault.test.ts
│   └── ResumeOrder.test.ts
├── composables/
│   ├── useAdAnalytics.test.ts
│   ├── useApiClient.test.ts
│   ├── useGoogleOneTap.test.ts
│   ├── useLogout.test.ts
│   └── useOrderById.test.ts
├── middleware/
│   ├── onboarding-guard.test.ts
│   └── referer.test.ts
├── pages/
│   └── gracias.test.ts
├── plugins/
│   └── google-one-tap.test.ts
├── server/
│   └── recaptcha-proxy.test.ts
└── stores/
    ├── policies.store.test.ts
    └── terms.store.test.ts
```

### Confirmed absences (all verified with `find`)

| Assertion | Command | Result |
|-----------|---------|--------|
| No test files under `app/` | `find apps/website/app -name "*.test.ts" -o -name "*.spec.ts"` | EMPTY — confirmed |
| No dead `.ts` files in `tests/components/` without `.test.ts` suffix | `find apps/website/tests/components -name "*.ts" -not -name "*.test.ts"` | EMPTY — confirmed |
| No `.spec.ts` files anywhere in website | `find apps/website -name "*.spec.ts"` (outside node_modules) | EMPTY — confirmed |

### Stubs directory (not tests — correct)

```
apps/website/tests/stubs/
├── app.stub.ts      # Nuxt #app alias stub — not a test file
└── imports.stub.ts  # Nuxt #imports alias stub — not a test file
```

These two files are shared stubs required by the test harness. They are not test files and should NOT be renamed.

---

## Standard Stack

### Core
| Tool | Version | Purpose | Config file |
|------|---------|---------|-------------|
| Vitest | project-pinned | Website test runner | `apps/website/vitest.config.ts` |
| `@nuxt/test-utils` | project-pinned | Nuxt test utilities | included in nuxt.config modules |

### Vitest configuration (verified)

```typescript
// apps/website/vitest.config.ts — no changes needed
// Key properties:
//   environment: "happy-dom"
//   globals: true
//   No explicit "include" pattern → Vitest default: **/*.{test,spec}.{ts,...}
//   alias "@" → "./app"    (resolves @/composables/*, @/components/*, etc.)
//   alias "~" → "./"
//   alias "#app" → "./tests/stubs/app.stub.ts"
//   alias "#imports" → "./tests/stubs/imports.stub.ts"
```

No vitest.config.ts changes are required — configuration is already correct for the `tests/` directory layout.

---

## Architecture Patterns

### Mandatory Testing Directory Rule (from CLAUDE.md)

> Unit tests live in `tests/utils/{name}.test.ts` for utility functions.
> All utility functions must have 100% unit test coverage at creation time.

The rule mandates `tests/` as the root test directory. Website is now fully compliant.

### Mirror structure principle

Test file location must mirror source file location:

| Source | Test |
|--------|------|
| `app/composables/useApiClient.ts` | `tests/composables/useApiClient.test.ts` |
| `app/components/FormLogin.vue` | `tests/components/FormLogin.*.test.ts` |
| `app/middleware/referer.global.ts` | `tests/middleware/referer.test.ts` |
| `app/pages/pagar/gracias.vue` | `tests/pages/gracias.test.ts` |
| `app/plugins/google-one-tap.client.ts` | `tests/plugins/google-one-tap.test.ts` |
| `server/api/...` | `tests/server/...` |
| `app/stores/...` | `tests/stores/...` |

### Dashboard as reference implementation

Dashboard `tests/` directory structure is the gold standard:

```
apps/dashboard/tests/
├── composables/
├── server/
├── stubs/
└── utils/
```

Website now mirrors this pattern with additional subdirectories for `middleware`, `pages`, `plugins`, and `stores`.

### Structural gap: `tests/utils/` does not exist in website

Dashboard has `tests/utils/` for utility function tests. Website has no `app/utils/` directory and no utility functions requiring unit tests, so no `tests/utils/` directory is needed at this time. This is NOT a violation — CLAUDE.md rule only applies when utility functions exist.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Test discovery config | Custom glob scripts | Vitest default include pattern (`**/*.{test,spec}.ts`) |
| Import alias resolution | Relative path traversal from `tests/` | `@/` alias defined in `vitest.config.ts` |

---

## Common Pitfalls

### Pitfall 1: Treating Phase 117 as new file-move work
**What goes wrong:** Planner creates tasks to move files that no longer need moving. Phase 116 already completed the website portion.
**How to avoid:** Read Phase 116 artifacts before planning. All website moves are done. Plan 117 as verification-only.

### Pitfall 2: Adding new test files to `app/` instead of `tests/`
**What goes wrong:** A developer adds a new test co-located with a composable or component.
**How to avoid:** Document the rule as enforced: all new test files must go to `tests/{subdirectory}/`.

### Pitfall 3: Confusing stubs with test files
**What goes wrong:** `tests/stubs/app.stub.ts` and `tests/stubs/imports.stub.ts` are renamed or deleted, breaking all tests that rely on the `#app` and `#imports` aliases.
**How to avoid:** Stubs are infrastructure, not test files. The naming convention is correct as-is.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (project-pinned version) |
| Config file | `apps/website/vitest.config.ts` |
| Quick run command | `cd apps/website && yarn test --run` |
| Full suite command | `cd apps/website && yarn test --run` |

### Current test baseline (verified 2026-04-06)

| App | Test files | Total tests | Passing | Failing |
|-----|------------|-------------|---------|---------|
| Website | 23 | 124 | 107 | 17 |

The 17 failing tests are pre-existing failures unrelated to test file location. They existed before Phase 116 and must not be changed by Phase 117.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Status |
|--------|----------|-----------|-------------------|--------|
| STRUCT-117-WEB | All website test files in `tests/`, zero in `app/` | Structural verification | `find apps/website/app -name "*.test.ts" -o -name "*.spec.ts"` returns empty | Already satisfied |
| STRUCT-117-WEB | Test suite passes with same baseline count | Regression check | `cd apps/website && yarn test --run` | Confirmed: 17 pre-existing failures, 107 passing |

### Wave 0 Gaps

None — existing test infrastructure covers all phase requirements. No new test files, config, or fixtures needed.

---

## Open Questions

1. **Should Phase 117 be closed as a no-op or have a single verification plan?**
   - What we know: All stated work is done. The roadmap entry exists with `Plans: 0 plans`.
   - What's unclear: Whether the GSD workflow requires at least one plan per phase or can close a phase without plans.
   - Recommendation: Create a single minimal verification plan (PLAN.md) that documents the completed state, runs the test suite, and captures the baseline. This produces the required SUMMARY.md and satisfies the roadmap entry.

2. **Website `app/utils/` directory does not exist — is this a gap?**
   - What we know: Dashboard has `app/utils/` with formatting helpers (date, price, string). Website has no `app/utils/` directory; utility functions are either composables or not present.
   - What's unclear: The phase description mentions "mirrored folder structure" — should website also have `tests/utils/`?
   - Recommendation: No. The mirror applies to existing source directories. Since website has no `app/utils/`, no `tests/utils/` is needed. CLAUDE.md rule only mandates tests when utility functions exist.

---

## Sources

### Primary (HIGH confidence)
- Direct filesystem audit: `find apps/website -name "*.test.ts" -o -name "*.spec.ts"` — confirmed 23 files all under `tests/`
- Direct filesystem audit: `find apps/website/app -name "*.test.ts" -o -name "*.spec.ts"` — confirmed empty
- `apps/website/vitest.config.ts` — read directly, alias and environment confirmed
- `.planning/phases/116-enforce-centralized-test-directory-structure/116-VERIFICATION.md` — STRUCT-116-WEB verified 6/6 truths, status PASSED
- `.planning/phases/116-enforce-centralized-test-directory-structure/116-01-SUMMARY.md` — lists all 9 moves completed in commit `6edfe808`
- Live test run: `cd apps/website && yarn test --run` — 124 tests, 17 failing, 107 passing (confirmed 2026-04-06)
- `CLAUDE.md` — testing rules section confirms `tests/` directory mandate

### Secondary (MEDIUM confidence)
- Vitest default include pattern (`**/*.{test,spec}.{ts,...}`) — explains why no explicit `include` config is needed after the move

---

## Metadata

**Confidence breakdown:**
- Current state: HIGH — verified by `find` commands and live test run
- Phase 116 completion: HIGH — VERIFICATION.md, SUMMARY.md, and git commits all confirm
- Recommended plan approach: HIGH — GSD workflow requires at least one plan per phase entry

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable — test file structure changes rarely)
