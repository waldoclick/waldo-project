---
phase: 117-enforce-root-level-tests-directory
plan: 01
subsystem: testing
tags: [vitest, nuxt, website, test-organization, compliance]

# Dependency graph
requires:
  - phase: 116-enforce-centralized-test-directory-structure
    provides: Moved all 23 website test files from app/ co-location to tests/ with mirrored structure
provides:
  - Formal verification record confirming website test directory structure is fully compliant with the Mandatory Testing Directory Rule
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "All website tests live in apps/website/tests/{subdirectory}/ mirroring apps/website/app/{subdirectory}/"
    - "Import paths use @/ alias (resolves to ./app) — never relative ../../../app/ traversal"

key-files:
  created:
    - .planning/phases/117-enforce-root-level-tests-directory-for-website-move-all-test-files-to-apps-website-tests-following-the-mandatory-testing-directory-rule-preserve-mirrored-folder-structure-zero-test-logic-changes/117-01-SUMMARY.md
  modified:
    - .planning/ROADMAP.md
    - .planning/STATE.md

key-decisions:
  - "Phase 117 is verification-only — Phase 116 already completed all 23 file moves; no further structural changes needed"
  - "17 pre-existing test failures are out of scope and must not be fixed in this phase"

patterns-established:
  - "All new website test files must go in tests/{subdirectory}/ never co-located under app/"

requirements-completed:
  - STRUCT-117-WEB

# Metrics
duration: 8min
completed: 2026-04-06
---

# Phase 117 Plan 01: Enforce Root-Level Tests Directory for Website — Summary

**Formal verification confirming all 23 website test files reside exclusively in apps/website/tests/ with mirrored structure — Phase 116 work validated, requirement STRUCT-117-WEB closed**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-06T17:40:42Z
- **Completed:** 2026-04-06T17:48:00Z
- **Tasks:** 2
- **Files modified:** 2 (.planning/ROADMAP.md, .planning/STATE.md)

## Accomplishments
- All 7 structural verification checks passed — website test directory is fully compliant
- Test suite baseline confirmed: 107 passing / 17 pre-existing failures (124 total, unchanged from Phase 116)
- Phase 117 closed in ROADMAP.md and STATE.md with formal verification record

## Verification Record

### Phase 117 verification: all checks PASSED. Website test directory structure is compliant.

| Check | Command | Result |
|-------|---------|--------|
| 1. Test files in tests/ | `find apps/website/tests -name "*.test.ts" \| sort` | 23 files across 7 subdirectories (components, composables, middleware, pages, plugins, server, stores) |
| 2. Zero test files under app/ | `find apps/website/app -name "*.test.ts" -o -name "*.spec.ts"` | EMPTY — confirmed |
| 3. No spec files in website | `find apps/website -path "*/node_modules" -prune -o -name "*.spec.ts" -print` | EMPTY — confirmed |
| 4. Stubs are infrastructure | `ls apps/website/tests/stubs/` | `app.stub.ts` and `imports.stub.ts` only |
| 5. Import alias clean | `grep -r "from '\.\./\.\./app/" apps/website/tests/` | CLEAN: no relative app imports |
| 6. Test suite baseline | `cd apps/website && yarn test --run` | 107 passing, 17 failing (pre-existing), 124 total |
| 7. Vitest config unchanged | Read `apps/website/vitest.config.ts` | `@` alias → `./app`, no explicit include pattern — correct |

### Test Suite Output (Baseline)

```
Test Files  6 failed | 17 passed (23)
      Tests  17 failed | 107 passed (124)
   Duration  1.90s
```

The 17 failures are pre-existing (createError not defined, recaptcha-proxy module resolution) — all existed before Phase 116 and are out of scope for Phase 117.

### Test File Manifest (23 files)

```
apps/website/tests/
├── components/          (11 files)
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
├── composables/         (5 files)
│   ├── useAdAnalytics.test.ts
│   ├── useApiClient.test.ts
│   ├── useGoogleOneTap.test.ts
│   ├── useLogout.test.ts
│   └── useOrderById.test.ts
├── middleware/          (2 files)
│   ├── onboarding-guard.test.ts
│   └── referer.test.ts
├── pages/              (1 file)
│   └── gracias.test.ts
├── plugins/            (1 file)
│   └── google-one-tap.test.ts
├── server/             (1 file)
│   └── recaptcha-proxy.test.ts
└── stores/             (2 files)
    ├── policies.store.test.ts
    └── terms.store.test.ts
```

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify website test directory compliance and run test baseline** - (chore)
2. **Task 2: Update ROADMAP.md and STATE.md to close Phase 117** - (docs)

**Plan metadata:** (docs: complete plan)

## Files Created/Modified
- `.planning/phases/117-.../117-01-SUMMARY.md` - This verification record
- `.planning/ROADMAP.md` - Phase 117 section updated with goal, requirements, and completion status
- `.planning/STATE.md` - Stopped at / Roadmap Evolution updated

## Decisions Made
- Phase 117 is verification-only — Phase 116 (commit `6edfe808`) already completed all 23 file moves; no further structural changes are required
- 17 pre-existing test failures are documented as out of scope and must not be fixed here

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Website test directory rule (Mandatory Testing Directory Rule) is fully enforced and verified
- All future website test files must be placed in `apps/website/tests/{subdirectory}/` — never co-located under `app/`
- The 17 pre-existing test failures (createError not defined, recaptcha-proxy module resolution) remain open for a future remediation phase if desired

---
*Phase: 117-enforce-root-level-tests-directory*
*Completed: 2026-04-06*
