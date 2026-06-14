# Phase 116: Enforce Centralized Test Directory Structure - Research

**Researched:** 2026-04-06
**Domain:** Test organization, Vitest (Nuxt apps), Jest (Strapi), monorepo structure
**Confidence:** HIGH

---

## Summary

Phase 116 is a pure file-relocation refactor. No test logic changes — only where files live and what they are named. Three violations exist across the monorepo and each has a different character:

**Website** has the most noise: 5 composable tests are co-located inside `app/composables/`, 4 component tests are co-located inside `app/components/`, and 4 "dead" test-shaped `.ts` files in `tests/components/` lack the `.test.ts` suffix so Vitest never discovers them.

**Dashboard** is already compliant. All 6 test files live under `tests/`. No action needed.

**Strapi** has three competing conventions in the same codebase: (a) flat co-located `*.test.ts` next to source files, (b) `__tests__/` subdirectories, and (c) `tests/` subdirectories. CLAUDE.md mandates the `tests/` subdirectory pattern with `{name}.test.ts` naming for Strapi services. Controllers and middleware lack a codified convention entirely.

**Primary recommendation:** Move website co-located tests to `tests/` and rename the 4 dead `.ts` files to `.test.ts`. For Strapi, standardize everything to `tests/` subdirectories. No test logic changes in any file.

---

## Inventory of Violations

### Website (`apps/website`) — 9 violations

#### Co-located composable tests — MOVE to `tests/composables/`
| Current path | Target path |
|---|---|
| `app/composables/useAdAnalytics.test.ts` | `tests/composables/useAdAnalytics.test.ts` |
| `app/composables/useApiClient.test.ts` | `tests/composables/useApiClient.test.ts` |
| `app/composables/useGoogleOneTap.test.ts` | `tests/composables/useGoogleOneTap.test.ts` |
| `app/composables/useLogout.test.ts` | `tests/composables/useLogout.test.ts` |
| `app/composables/useOrderById.test.ts` | `tests/composables/useOrderById.test.ts` |

**Import path impact:** These files import from `"./composableName"` (relative). After the move they must import from `"@/composables/composableName"` (alias). The `vitest.config.ts` already resolves `@` to `./app`.

#### Co-located component tests — MOVE to `tests/components/`
| Current path | Target path | Conflict? |
|---|---|---|
| `app/components/AccordionDefault.spec.ts` | `tests/components/AccordionDefault.test.ts` | YES — duplicate exists as `tests/components/AccordionDefault.ts` (dead) |
| `app/components/AccountAnnouncements.spec.ts` | `tests/components/AccountAnnouncements.test.ts` | YES — duplicate exists as `tests/components/AccountAnnouncements.ts` (dead) |
| `app/components/CardCategory.spec.ts` | `tests/components/CardCategory.test.ts` | YES — duplicate exists as `tests/components/CardCategory.ts` (dead) |
| `app/components/FormLogin.spec.ts` | `tests/components/FormLogin.test.ts` | YES — `tests/components/FormLogin.ts` (dead) AND `tests/components/FormLogin.website.test.ts` (active, different tests) |

**Import path impact:** These files import from `"./ComponentName.vue"` (relative). After the move they must import from `"@/components/ComponentName.vue"` (alias).

#### Dead test files — RENAME or DELETE
These 4 files in `tests/components/` are test-shaped code (use `describe`/`it`) but have no `.test.ts` suffix. Vitest default include pattern only matches `*.{test,spec}.{ts,...}`. These files are never executed.

| File | Content summary | Action |
|---|---|---|
| `tests/components/AccordionDefault.ts` | Duplicate of `app/components/AccordionDefault.spec.ts` (uses `@/` alias). Has real assertion. | The `.spec.ts` is the canonical version; after move this becomes redundant. DELETE. |
| `tests/components/AccountAnnouncements.ts` | Stub test — no assertions, no component import. | DELETE. |
| `tests/components/CardCategory.ts` | Stub test — no assertions, no component import. | DELETE. |
| `tests/components/FormLogin.ts` | Duplicate of `app/components/FormLogin.spec.ts` (uses `@/` alias). All assertions commented out. | DELETE. |

**Nuxt auto-import context:** Co-located tests in `app/composables/` and `app/components/` are NOT treated differently by Nuxt — auto-imports are not available inside Vitest regardless of where the file lives. They already mock `#imports` explicitly. The move does not change this.

### Dashboard (`apps/dashboard`) — 0 violations

All tests are in `tests/` with correct subdirectory organization:
- `tests/composables/useApiClient.test.ts`
- `tests/composables/useSessionClient.test.ts`
- `tests/server/recaptcha.test.ts`
- `tests/utils/date.test.ts`
- `tests/utils/price.test.ts`
- `tests/utils/string.test.ts`

No action required. Dashboard is the reference implementation.

### Strapi (`apps/strapi`) — 12 violations

CLAUDE.md mandates for services: `tests/` subdirectory, filename `{name}.test.ts`. Current reality has three patterns. The table below maps each violation to its target.

#### Flat co-located `*.test.ts` — MOVE to `tests/` subdirectory
| Current path (relative to `src/`) | Canonical target |
|---|---|
| `api/auth-one-tap/controllers/auth-one-tap.test.ts` | `api/auth-one-tap/controllers/tests/auth-one-tap.test.ts` |
| `api/payment/controllers/payment.test.ts` | `api/payment/controllers/tests/payment.test.ts` |
| `cron/subscription-charge.cron.test.ts` | `cron/tests/subscription-charge.cron.test.ts` |
| `extensions/users-permissions/controllers/authController.test.ts` | `extensions/users-permissions/controllers/tests/authController.test.ts` |
| `extensions/users-permissions/controllers/userController.test.ts` | `extensions/users-permissions/controllers/tests/userController.test.ts` |
| `middlewares/protect-user-fields.test.ts` | `middlewares/tests/protect-user-fields.test.ts` |
| `services/google-one-tap/google-one-tap.service.test.ts` | `services/google-one-tap/tests/google-one-tap.service.test.ts` |
| `services/indicador/indicador.test.ts` | `services/indicador/tests/indicador.test.ts` |
| `services/tavily/tavily.test.ts` | `services/tavily/tests/tavily.test.ts` |
| `services/weather/weather.test.ts` | `services/weather/tests/weather.test.ts` |
| `services/zoho/http-client.test.ts` | `services/zoho/tests/http-client.test.ts` |
| `services/zoho/zoho.test.ts` | `services/zoho/tests/zoho.test.ts` |

#### `__tests__/` subdirectories — RENAME directory to `tests/`
| Current path (relative to `src/`) | Canonical target |
|---|---|
| `api/ad/controllers/__tests__/ad.findBySlug.test.ts` | `api/ad/controllers/tests/ad.findBySlug.test.ts` |
| `api/ad/services/__tests__/ad.approve.zoho.test.ts` | `api/ad/services/tests/ad.approve.zoho.test.ts` |
| `api/ad/services/__tests__/ad.compute-status.test.ts` | `api/ad/services/tests/ad.compute-status.test.ts` |
| `api/ad/services/__tests__/ad.sort-priority.test.ts` | `api/ad/services/tests/ad.sort-priority.test.ts` |
| `api/article/content-types/article/__tests__/article.lifecycles.test.ts` | `api/article/content-types/article/tests/article.lifecycles.test.ts` |
| `api/payment/services/__tests__/ad.service.test.ts` | `api/payment/services/tests/ad.service.test.ts` |
| `api/payment/services/__tests__/ad.zoho.test.ts` | `api/payment/services/tests/ad.zoho.test.ts` |
| `api/payment/services/__tests__/pack.service.test.ts` | `api/payment/services/tests/pack.service.test.ts` |
| `api/payment/services/__tests__/pack.zoho.test.ts` | `api/payment/services/tests/pack.zoho.test.ts` |
| `api/payment/services/__tests__/pro-cancellation.service.test.ts` | `api/payment/services/tests/pro-cancellation.service.test.ts` |

#### Already correct `tests/` subdirectories — NO CHANGE
| Path | Status |
|---|---|
| `api/payment/tests/general.utils.test.ts` | Correct |
| `services/facto/tests/facto.test.ts` | Correct |
| `services/flow/tests/flow.test.ts` | Correct |
| `services/oneclick/tests/oneclick.service.test.ts` | Correct |
| `services/payment-gateway/tests/gateway.test.ts` | Correct |

---

## Standard Stack

### Core
| Tool | Version | Purpose | Config file |
|---|---|---|---|
| Vitest | (project version) | Website + Dashboard test runner | `apps/*/vitest.config.ts` |
| Jest (ts-jest) | (project version) | Strapi test runner | `apps/strapi/jest.config.js` |

### Jest configuration (Strapi)
```js
// apps/strapi/jest.config.js — existing, no changes needed
roots: ["<rootDir>/src"],
testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
```

The existing `testMatch` in `jest.config.js` already matches both `__tests__/` and `tests/` subdirectory patterns (`**/__tests__/**/*.ts` and `**/?(*.)+(spec|test).ts`). Moving from `__tests__/` to `tests/` is covered without config changes. Flat co-located files are also matched by `**/?(*.)+(spec|test).ts`. No `jest.config.js` edits are required for the moves to continue being discovered.

**Confirmation:** `testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"]` — the second glob matches any `*.test.ts` file anywhere under `src/`, including `services/*/tests/*.test.ts`. Discovery is config-agnostic for this move.

### Vitest configuration (Nuxt apps)
```ts
// apps/website/vitest.config.ts — existing, no changes needed
// No explicit "include" pattern = uses Vitest default:
//   **/*.{test,spec}.{js,mjs,cjs,jsx,ts,mts,cts,tsx}
// After move: co-located files removed, tests/ files already discovered
```

The `vitest.config.ts` alias `@` → `./app` is already in place. Moving co-located tests to `tests/` and updating imports to `@/composables/...` and `@/components/...` requires no config changes.

---

## Architecture Patterns

### Target structure: Website
```
apps/website/
├── app/
│   ├── components/         # Vue components — NO test files
│   └── composables/        # Composables — NO test files
└── tests/
    ├── components/         # All component tests (*.test.ts)
    ├── composables/        # All composable tests (*.test.ts)  ← NEW directory
    ├── middleware/
    ├── pages/
    ├── plugins/
    ├── server/
    ├── stores/
    └── stubs/              # Shared stubs (app.stub.ts, imports.stub.ts)
```

### Target structure: Dashboard (already compliant)
```
apps/dashboard/
└── tests/
    ├── composables/
    ├── server/
    ├── stubs/
    └── utils/
```

### Target structure: Strapi
```
apps/strapi/src/
├── api/
│   ├── ad/
│   │   ├── controllers/
│   │   │   └── tests/          # was __tests__/
│   │   └── services/
│   │       └── tests/          # was __tests__/
│   ├── article/content-types/article/
│   │   └── tests/              # was __tests__/
│   ├── auth-one-tap/controllers/
│   │   └── tests/              # was flat co-located
│   └── payment/
│       ├── controllers/
│       │   └── tests/          # was flat co-located
│       ├── services/
│       │   └── tests/          # was __tests__/
│       └── tests/              # already correct
├── cron/
│   └── tests/                  # was flat co-located
├── extensions/users-permissions/controllers/
│   └── tests/                  # was flat co-located
├── middlewares/
│   └── tests/                  # was flat co-located
└── services/
    ├── google-one-tap/tests/   # was flat co-located
    ├── indicador/tests/        # was flat co-located
    ├── tavily/tests/           # was flat co-located
    ├── weather/tests/          # was flat co-located
    └── zoho/tests/             # was flat co-located (2 files)
```

### Import update pattern for website composable tests
```typescript
// BEFORE (co-located in app/composables/)
import type { SomeType } from "./useComposable";
// or
const { useComposable } = await import("./useComposable");

// AFTER (in tests/composables/)
import type { SomeType } from "@/composables/useComposable";
// or
const { useComposable } = await import("@/composables/useComposable");
```

### Import update pattern for website component tests
```typescript
// BEFORE (co-located in app/components/)
import MyComponent from "./MyComponent.vue";

// AFTER (in tests/components/)
import MyComponent from "@/components/MyComponent.vue";
```

### Strapi test import paths
Strapi tests use relative imports to their subjects (e.g., `import adService from "../ad.service"`). Moving from `__tests__/` to `tests/` or from flat co-located to `tests/` changes the relative depth. Each file needs its subject import path updated:

```typescript
// File originally at: api/ad/services/__tests__/ad.compute-status.test.ts
import { computeAdStatus } from "../ad.service";  // up 1 from __tests__

// File moved to: api/ad/services/tests/ad.compute-status.test.ts
import { computeAdStatus } from "../ad.service";  // up 1 from tests — SAME depth, no change needed
```

```typescript
// File originally at: middlewares/protect-user-fields.test.ts (flat)
import { protectUserFields } from "./protect-user-fields";  // same dir

// File moved to: middlewares/tests/protect-user-fields.test.ts
import { protectUserFields } from "../protect-user-fields";  // up 1 level
```

Key observation: `__tests__/` → `tests/` keeps the same relative depth (`../`). Flat co-located → `tests/` changes `"./subject"` to `"../subject"`. Always verify each file.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---|---|---|
| Discovering test files | Custom glob script | Vitest/Jest default testMatch patterns |
| Moving files atomically | Manual copy+delete | `git mv` for all moves (preserves history) |
| Verifying imports after move | Manual grep | `yarn typecheck` in each app post-move |

---

## Common Pitfalls

### Pitfall 1: Breaking relative imports in Strapi tests
**What goes wrong:** Moving a flat co-located test to `tests/` without updating `"./subjectFile"` to `"../subjectFile"`. TypeScript will fail immediately, but the error message points to the moved file, not the import.
**Why it happens:** Relative imports are position-sensitive.
**How to avoid:** For every flat co-located file being moved, audit all `import` statements and change `"./"` to `"../"` for references to sibling source files.
**Warning signs:** `yarn test` in strapi reports "Cannot find module" after the move.

### Pitfall 2: Dead `.ts` files causing confusion
**What goes wrong:** The 4 files in `tests/components/` (`AccordionDefault.ts`, `AccountAnnouncements.ts`, `CardCategory.ts`, `FormLogin.ts`) are real Vitest code that Vitest never runs (no `.test.ts` suffix). They look like tests in the editor but are invisible to the runner.
**How to avoid:** Delete them rather than rename — the canonical versions are the `app/components/*.spec.ts` files which will be moved and renamed to `.test.ts`.

### Pitfall 3: `AccordionDefault` duplication
**What goes wrong:** `app/components/AccordionDefault.spec.ts` (uses `"./AccordionDefault.vue"`) and `tests/components/AccordionDefault.ts` (uses `"@/components/AccordionDefault.vue"`) test the same component. After moving the `.spec.ts`, if the dead `.ts` file is renamed to `.test.ts`, both run and one fails (import mismatch) or you get duplicate test output.
**How to avoid:** DELETE the dead `.ts` file first, then move and rename the `.spec.ts` to `.test.ts`.

### Pitfall 4: `FormLogin` has TWO distinct test files
**What goes wrong:** `app/components/FormLogin.spec.ts` tests "disable submit button when fields are empty" while `tests/components/FormLogin.website.test.ts` tests "REGV-05 unconfirmed email resend section." These are different test files covering different behaviors.
**How to avoid:** When moving `FormLogin.spec.ts`, rename it `FormLogin.render.test.ts` (or similar) to avoid filename collision with the existing `FormLogin.website.test.ts`.

### Pitfall 5: `useApiClient.test.ts` dynamic import with relative path
**What goes wrong:** The co-located `app/composables/useApiClient.test.ts` uses dynamic import: `const { useApiClient } = await import("./useApiClient")`. After moving to `tests/composables/`, this must become `await import("@/composables/useApiClient")`. Static analysis (`typecheck`) will NOT catch dynamic import path errors.
**How to avoid:** Run `yarn test` (not just `yarn typecheck`) after moving this file specifically.

### Pitfall 6: Website tests that currently fail are not a blocker
**What goes wrong:** `yarn test` in website currently reports 17 failing tests across 6 files. These failures pre-exist Phase 116. The phase must not fix these failures (out of scope) but also must not introduce new ones.
**How to avoid:** Document the pre-existing failure count before starting. Verify post-move failure count is identical.

---

## Code Examples

### Moving a file with git mv (preserves history)
```bash
# Strapi __tests__ → tests rename (directory rename)
git mv apps/strapi/src/api/ad/controllers/__tests__ apps/strapi/src/api/ad/controllers/tests

# Flat co-located → tests/ subdirectory
mkdir -p apps/strapi/src/middlewares/tests
git mv apps/strapi/src/middlewares/protect-user-fields.test.ts \
       apps/strapi/src/middlewares/tests/protect-user-fields.test.ts

# Website: move and rename .spec.ts to .test.ts
mkdir -p apps/website/tests/composables
git mv apps/website/app/composables/useApiClient.test.ts \
       apps/website/tests/composables/useApiClient.test.ts
```

### Verifying test discovery after moves
```bash
# Website: list all files vitest will pick up
cd apps/website && find . -name "*.test.ts" -o -name "*.spec.ts" | grep -v node_modules | grep -v .nuxt | sort

# Strapi: list all files jest will pick up
cd apps/strapi && find src -name "*.test.ts" | sort
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|---|---|
| Website/Dashboard | Vitest (no explicit version pinned — uses workspace version) |
| Strapi | Jest + ts-jest |
| Website config | `apps/website/vitest.config.ts` |
| Dashboard config | `apps/dashboard/vitest.config.ts` |
| Strapi config | `apps/strapi/jest.config.js` |
| Website quick run | `cd apps/website && yarn test --run` |
| Dashboard quick run | `cd apps/dashboard && yarn test --run` |
| Strapi quick run | `cd apps/strapi && yarn test --testPathPattern="ad.compute"` |
| Full suite | `cd apps/website && yarn test --run && cd ../dashboard && yarn test --run` |

### Pre-move baseline (2026-04-06)
| App | Total tests | Passing | Failing |
|---|---|---|---|
| Website | 124 | 107 | 17 |
| Dashboard | 59 | 59 | 0 |
| Strapi | varies (some have ts errors) | n/a | n/a |

The 17 website failures are pre-existing (unrelated to test placement). The move must not change this count.

### Phase Gate Verification
After all moves:
1. `cd apps/website && yarn test --run` — failing count must remain 17 (no new failures from moves)
2. `cd apps/dashboard && yarn test --run` — all 59 tests still pass
3. `cd apps/strapi && yarn test` — same tests pass/fail as before
4. `cd apps/website && yarn typecheck` — no new type errors (import paths are correct)
5. No `*.test.ts` or `*.spec.ts` files remain under `app/` in website
6. No `__tests__/` directories remain in Strapi
7. No flat co-located `*.test.ts` files remain in Strapi (everything is under a `tests/` subdir)

---

## Open Questions

1. **Strapi `indicador.test.ts` — TypeScript error**
   - What we know: Running `yarn test --testPathPattern="indicador"` fails with a TypeScript compile error on `result.date`.
   - What's unclear: This is a pre-existing error unrelated to file placement.
   - Recommendation: Document the failure as pre-existing. Move the file but do not fix the test error (out of scope for Phase 116).

2. **`FormLogin.spec.ts` rename**
   - What we know: `FormLogin.website.test.ts` already exists in `tests/components/`. Moving `app/components/FormLogin.spec.ts` there would cause a filename conflict if named `FormLogin.test.ts`.
   - Recommendation: Rename the moved file to `FormLogin.render.test.ts` to distinguish it from the REGV-05 test.

3. **Dashboard `tests/utils/` vs CLAUDE.md rule**
   - CLAUDE.md says "Unit tests live in `tests/utils/{name}.test.ts` for utility functions" — dashboard follows this exactly.
   - What's unclear: Should website also have a `tests/utils/` for utility tests? No utility tests currently exist in website.
   - Recommendation: Do not create new test files in Phase 116. Only move existing ones.

---

## Sources

### Primary (HIGH confidence)
- Direct filesystem audit of `/home/gab/Code/waldo-project/apps/*/` — all test file paths verified with `find`
- `CLAUDE.md` lines 88–91, 224–226 — canonical test location rules
- `apps/strapi/jest.config.js` — testMatch pattern verified
- `apps/website/vitest.config.ts` and `apps/dashboard/vitest.config.ts` — no explicit include = Vitest defaults apply
- Live test run: website (124 tests, 17 failing), dashboard (59 tests, 0 failing) — confirmed 2026-04-06

### Secondary (MEDIUM confidence)
- Vitest documentation default include pattern: `**/*.{test,spec}.{js,mjs,cjs,jsx,ts,mts,cts,tsx}` — explains why `.ts` files without `.test.` suffix are invisible to the runner

---

## Metadata

**Confidence breakdown:**
- Violation inventory: HIGH — every file verified with `find` and `cat`
- Import path impact: HIGH — relative imports read directly from source
- Strapi jest.config testMatch: HIGH — config read directly
- Website 17 pre-existing failures: HIGH — confirmed by live test run

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable — test infra changes infrequently)
