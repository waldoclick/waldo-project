# Phase 118: Enforce Root-Level Tests Directory for Strapi - Research

**Researched:** 2026-04-06
**Domain:** Jest configuration, TypeScript path resolution, file relocation with relative import updates
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STRUCT-118-STRAPI | Move all 27 Strapi test files from src/ subdirectory tests/ dirs to a single root-level apps/strapi/tests/ directory mirroring the source folder structure, update all relative imports, zero test logic changes | Jest `roots` config change + relative import depth rewrite for each file; full file inventory and import map documented below |

</phase_requirements>

## Summary

All 27 Strapi test files currently live inside `apps/strapi/src/` in nested `tests/` subdirectories alongside their source modules. Phase 116 already achieved `tests/` subdirectory convention (no `__tests__/` dirs, no flat co-located files). Phase 118 goes one step further: lift the entire test tree out of `src/` into a root-level `apps/strapi/tests/` directory, mirroring the `src/` folder structure.

The key technical change is: every relative import currently goes one level up (`../`) from the `tests/` dir to its sibling source module. After moving to the root-level `tests/` directory, the test files are no longer siblings of their source modules — they are parallel to them. Each import must now traverse up through all mirrored path segments, cross from `tests/` to `src/`, then descend to the target file. The number of `../` levels required varies by how deeply nested the mirrored path is (2 to 5 levels).

The Jest `roots` config in `jest.config.js` points to `<rootDir>/src`. This must be changed to `<rootDir>/tests` (or to `<rootDir>` with an updated `testMatch` pattern). The `tsconfig.json` already includes `./**/*.ts` so the `tests/` directory at root level will be covered for TypeScript compilation automatically. The `**/*.test.*` exclusion in `tsconfig.json` applies globally regardless of location, so test files remain excluded from production builds.

**Primary recommendation:** Change `roots` in `jest.config.js` from `["<rootDir>/src"]` to `["<rootDir>/tests"]`, then for each of the 27 test files: `git mv` to the mirrored path under `tests/`, and rewrite every relative import to route through `src/`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Jest | ^29.7.0 | Test runner | Project standard for Strapi (per CLAUDE.md) |
| ts-jest | ^29.2.5 | TypeScript transform for Jest | Required for TS test files |
| @types/jest | ^29.5.14 | Jest type definitions | Dev dependency already installed |

No new libraries required. This is a pure file-move operation with configuration update.

## Architecture Patterns

### Recommended Project Structure (post-phase)

```
apps/strapi/
├── src/                                  # Source code (unchanged)
│   ├── api/
│   ├── cron/
│   ├── extensions/
│   ├── middlewares/
│   └── services/
├── tests/                                # NEW: root-level test directory
│   ├── api/
│   │   ├── ad/
│   │   │   ├── controllers/
│   │   │   │   └── ad.findBySlug.test.ts
│   │   │   └── services/
│   │   │       ├── ad.approve.zoho.test.ts
│   │   │       ├── ad.compute-status.test.ts
│   │   │       └── ad.sort-priority.test.ts
│   │   ├── article/content-types/article/
│   │   │   └── article.lifecycles.test.ts
│   │   ├── auth-one-tap/controllers/
│   │   │   └── auth-one-tap.test.ts
│   │   └── payment/
│   │       ├── controllers/
│   │       │   └── payment.test.ts
│   │       ├── services/
│   │       │   ├── ad.service.test.ts
│   │       │   ├── ad.zoho.test.ts
│   │       │   ├── pack.service.test.ts
│   │       │   ├── pack.zoho.test.ts
│   │       │   └── pro-cancellation.service.test.ts
│   │       └── general.utils.test.ts
│   ├── cron/
│   │   └── subscription-charge.cron.test.ts
│   ├── extensions/users-permissions/controllers/
│   │   ├── authController.test.ts
│   │   └── userController.test.ts
│   ├── middlewares/
│   │   └── protect-user-fields.test.ts
│   └── services/
│       ├── facto/         └── facto.test.ts
│       ├── flow/          └── flow.test.ts
│       ├── google-one-tap/└── google-one-tap.service.test.ts
│       ├── indicador/     └── indicador.test.ts
│       ├── oneclick/      └── oneclick.service.test.ts
│       ├── payment-gateway/└── gateway.test.ts
│       ├── tavily/        └── tavily.test.ts
│       ├── weather/       └── weather.test.ts
│       └── zoho/
│           ├── http-client.test.ts
│           └── zoho.test.ts
├── jest.config.js                        # roots: ["<rootDir>/tests"]
└── jest.setup.ts
```

### Pattern 1: Jest roots Configuration
**What:** Change `roots` from pointing at source tree to pointing at test tree
**When to use:** Always required when test tree moves out of `src/`
**Example:**
```javascript
// apps/strapi/jest.config.js — BEFORE
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/tests/**/*.ts", "**/?(*.)+(spec|test).ts"],
  // ...
};

// apps/strapi/jest.config.js — AFTER
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/tests/**/*.ts", "**/?(*.)+(spec|test).ts"],
  // ...
};
```

### Pattern 2: Relative Import Rewriting (the core task)
**What:** Every import in a test file that previously pointed `../` into the sibling `src/` module now needs to route across the `tests/`→`src/` boundary.
**Rule:** Count the path segments in the mirrored directory (between `tests/` and the filename). That many `../` hops get you back to `apps/strapi/`. Then add `src/` + the mirrored path + the imported module name.

**Depth calculation:**

| Target directory under `tests/` | Hops to `apps/strapi/` | Prefix to reach `src/` sibling |
|----------------------------------|------------------------|--------------------------------|
| `tests/cron/` | 2 | `../../src/cron/` |
| `tests/middlewares/` | 2 | `../../src/middlewares/` |
| `tests/api/payment/` | 3 | `../../../src/api/payment/` |
| `tests/services/facto/` | 3 | `../../../src/services/facto/` |
| `tests/services/flow/` | 3 | `../../../src/services/flow/` |
| `tests/services/google-one-tap/` | 3 | `../../../src/services/google-one-tap/` |
| `tests/services/indicador/` | 3 | `../../../src/services/indicador/` |
| `tests/services/oneclick/` | 3 | `../../../src/services/oneclick/` |
| `tests/services/payment-gateway/` | 3 | `../../../src/services/payment-gateway/` |
| `tests/services/tavily/` | 3 | `../../../src/services/tavily/` |
| `tests/services/weather/` | 3 | `../../../src/services/weather/` |
| `tests/services/zoho/` | 3 | `../../../src/services/zoho/` |
| `tests/api/ad/controllers/` | 4 | `../../../../src/api/ad/controllers/` |
| `tests/api/ad/services/` | 4 | `../../../../src/api/ad/services/` |
| `tests/api/auth-one-tap/controllers/` | 4 | `../../../../src/api/auth-one-tap/controllers/` |
| `tests/api/payment/controllers/` | 4 | `../../../../src/api/payment/controllers/` |
| `tests/api/payment/services/` | 4 | `../../../../src/api/payment/services/` |
| `tests/extensions/users-permissions/controllers/` | 4 | `../../../../src/extensions/users-permissions/controllers/` |
| `tests/api/article/content-types/article/` | 5 | `../../../../../src/api/article/content-types/article/` |

### Anti-Patterns to Avoid
- **Do not add `moduleNameMapper` or `paths` aliases to jest.config.js:** Every import in the test suite is already a regular relative `../` import. The Phase 116 work established this cleanly. Aliases would add complexity for no benefit.
- **Do not modify tsconfig.json:** The existing `include: ["./", "./**/*.ts"]` already covers `tests/`. The `exclude: ["**/*.test.*"]` already excludes test files from compilation. No changes needed.
- **Do not change `testMatch`:** The pattern `**/tests/**/*.ts` continues to match files under `tests/` at any depth. Only `roots` changes.

## Complete File Inventory and Import Map

This is the definitive list of all 27 files, their current and target locations, and the import rewrites required.

### Group 1: Files with NO relative imports to update (imports are all external packages or no imports)

These files import only from external packages (`@strapi/strapi`, `axios-mock-adapter`, `@jest/globals`, etc.) or from modules within their own directory using `../`. After the move, the `../` imports resolve differently, so they DO still need updating. There are no files in this phase with zero relative import updates — every test file has at least one relative import to rewrite.

### Group 2: Files where ALL current imports use `../` (one level up into sibling module)

After the move, `../` would resolve to `tests/{mirrored-parent}/` which is wrong. All `../something` must become `{N-hops}../src/{mirrored-path}/something`.

### Detailed per-file import rewrite map

**`src/api/ad/controllers/tests/ad.findBySlug.test.ts`**
→ `tests/api/ad/controllers/ad.findBySlug.test.ts` (4 hops)
- `from "../../services/sanitize-ad"` → `from "../../../../src/api/ad/services/sanitize-ad"` (currently 2 hops from tests/, which landed at `src/api/ad/services/` — same result needed)

  Wait: current file is at `src/api/ad/controllers/tests/`. `../../services/` goes up to `src/api/ad/` then into `services/`. New file is at `tests/api/ad/controllers/`. To reach `src/api/ad/services/` we go up 4 levels (controllers, ad, api, tests) then `src/api/ad/services/`. So: `../../../../src/api/ad/services/sanitize-ad`.

- `import "../../controllers/ad"` → `import "../../../../src/api/ad/controllers/ad"` (currently `../../controllers/ad` from `src/api/ad/controllers/tests/` = `src/api/ad/controllers/ad.ts` — correct. New: `../../../../src/api/ad/controllers/ad`)

**`src/api/ad/services/tests/ad.approve.zoho.test.ts`**
→ `tests/api/ad/services/ad.approve.zoho.test.ts` (4 hops)
- `jest.mock("../../../../services/mjml", ...)` → `jest.mock("../../../../../../src/services/mjml", ...)`

  Wait, let me reconsider. Current path: `src/api/ad/services/tests/`. `../../../../services/mjml` = up 4 (tests, services, ad, api) then into `src/services/mjml` = `src/services/mjml`. New path: `tests/api/ad/services/`. To reach `src/services/mjml` = up 4 (services, ad, api, tests) then `src/services/mjml` = `../../../../src/services/mjml`.

- `jest.mock("../../../../services/zoho", ...)` → `jest.mock("../../../../src/services/zoho", ...)`
- `from "../../../../services/zoho"` → `from "../../../../src/services/zoho"`
- `import adServiceFactory from "../ad"` → `import adServiceFactory from "../../../../src/api/ad/services/ad"`

  Wait: current `../ad` from `src/api/ad/services/tests/` = `src/api/ad/services/ad`. New: from `tests/api/ad/services/` to `src/api/ad/services/ad` = `../../../../src/api/ad/services/ad`.

**`src/api/ad/services/tests/ad.compute-status.test.ts`**
→ `tests/api/ad/services/ad.compute-status.test.ts` (4 hops)
- All `../` imports → `../../../../src/api/ad/services/`
- All `../../../../services/` imports → `../../../../src/services/`

**`src/api/ad/services/tests/ad.sort-priority.test.ts`**
→ `tests/api/ad/services/ad.sort-priority.test.ts` (4 hops)
- `from "../ad"` → `from "../../../../src/api/ad/services/ad"`

**`src/api/article/content-types/article/tests/article.lifecycles.test.ts`**
→ `tests/api/article/content-types/article/article.lifecycles.test.ts` (5 hops)
- `import lifecycles from "../lifecycles"` → `import lifecycles from "../../../../../src/api/article/content-types/article/lifecycles"`

**`src/api/auth-one-tap/controllers/tests/auth-one-tap.test.ts`**
→ `tests/api/auth-one-tap/controllers/auth-one-tap.test.ts` (4 hops)
- `jest.mock("../../../../services/google-one-tap", ...)` → `jest.mock("../../../../src/services/google-one-tap", ...)`

  Current: `src/api/auth-one-tap/controllers/tests/` + `../../../../services/` = up 4 (tests, controllers, auth-one-tap, api) = `src/services/`. New: `tests/api/auth-one-tap/controllers/` + `../../../../` = up 4 (controllers, auth-one-tap, api, tests) = `apps/strapi/` + `src/services/` = `../../../../src/services/`.

- `from "../auth-one-tap"` → `from "../../../../src/api/auth-one-tap/controllers/auth-one-tap"` (if present; verify actual imports when executing)

**`src/api/payment/controllers/tests/payment.test.ts`**
→ `tests/api/payment/controllers/payment.test.ts` (4 hops)
- `jest.mock("../../../../utils/logtail", ...)` → `jest.mock("../../../../src/utils/logtail", ...)`

  Current: `src/api/payment/controllers/tests/` + `../../../../` = `src/` directory → `src/utils/logtail`. New: `tests/api/payment/controllers/` + `../../../../` = `apps/strapi/` → `src/utils/logtail` = `../../../../src/utils/logtail`. Correct.

- `jest.mock("../../utils/order.utils", ...)` → `jest.mock("../../../../src/api/payment/utils/order.utils", ...)`

  Current: from `src/api/payment/controllers/tests/` + `../../utils/` = up 2 (tests, controllers) = `src/api/payment/` + `utils/`. New: `../../../../src/api/payment/utils/order.utils`.

- `jest.mock("../../utils/general.utils", ...)` → same pattern: `"../../../../src/api/payment/utils/general.utils"`
- All other `../../` imports from `src/api/payment/controllers/tests/` go to `src/api/payment/` — new form: `../../../../src/api/payment/`
- All `../../../../` imports from current location go to `src/` — new form: `../../../../src/`

**`src/api/payment/services/tests/ad.service.test.ts`**
→ `tests/api/payment/services/ad.service.test.ts` (4 hops)
- `jest.mock("../../../../services/transbank")` → `jest.mock("../../../../src/services/transbank")`

  Current: `src/api/payment/services/tests/` + `../../../../` = `src/` → `src/services/transbank`. New: from `tests/api/payment/services/` + `../../../../` = `apps/strapi/` → `src/services/transbank` = `../../../../src/services/transbank`. Correct.

- `jest.mock("../../utils")` → `jest.mock("../../../../src/api/payment/utils")`

  Current: from `src/api/payment/services/tests/` + `../../` = `src/api/payment/` + `utils`. New: `../../../../src/api/payment/utils`.

- `jest.mock("../../../../utils/logtail")` → `jest.mock("../../../../src/utils/logtail")`
- `jest.mock("../../../../services/mjml")` → `jest.mock("../../../../src/services/mjml")`
- `jest.mock("../../../ad/services/ad")` → `jest.mock("../../../../src/api/ad/services/ad")`

  Current: from `src/api/payment/services/tests/` + `../../../` = `src/api/` + `ad/services/ad`. New: `../../../../src/api/ad/services/ad`.

- `jest.mock("../../../../services/payment-gateway", ...)` → `jest.mock("../../../../src/services/payment-gateway", ...)`
- `from "../../../../services/payment-gateway"` → `from "../../../../src/services/payment-gateway"`
- `import adService from "../ad.service"` → `import adService from "../../../../src/api/payment/services/ad.service"`
- `import PaymentUtils from "../../utils"` → `import PaymentUtils from "../../../../src/api/payment/utils"`

**`src/api/payment/services/tests/ad.zoho.test.ts`**
→ `tests/api/payment/services/ad.zoho.test.ts` (4 hops)
- Same depth rules as `ad.service.test.ts` above
- `jest.mock("../../../../services/transbank")` → `../../../../src/services/transbank`
- `jest.mock("../../utils")` → `../../../../src/api/payment/utils`
- `jest.mock("../../../../utils/logtail")` → `../../../../src/utils/logtail`

**`src/api/payment/services/tests/pack.service.test.ts`**
→ `tests/api/payment/services/pack.service.test.ts` (4 hops)
- Same depth pattern as above

**`src/api/payment/services/tests/pack.zoho.test.ts`**
→ `tests/api/payment/services/pack.zoho.test.ts` (4 hops)
- Same depth pattern

**`src/api/payment/services/tests/pro-cancellation.service.test.ts`**
→ `tests/api/payment/services/pro-cancellation.service.test.ts` (4 hops)
- `from "../pro-cancellation.service"` → `from "../../../../src/api/payment/services/pro-cancellation.service"`
- `jest.mock("../../../../utils/logtail", ...)` → `jest.mock("../../../../src/utils/logtail", ...)`
- `jest.mock("../../../../services/oneclick", ...)` → `jest.mock("../../../../src/services/oneclick", ...)`

**`src/api/payment/tests/general.utils.test.ts`**
→ `tests/api/payment/general.utils.test.ts` (3 hops)
- `import generalUtils from "../utils/general.utils"` → `import generalUtils from "../../../src/api/payment/utils/general.utils"`

  Current: from `src/api/payment/tests/` + `../utils/` = `src/api/payment/utils/`. New: from `tests/api/payment/` + `../../../` = `apps/strapi/` + `src/api/payment/utils/general.utils` = `../../../src/api/payment/utils/general.utils`.

  NOTE: This test uses `createStrapi` and calls `instance.start()` — it is an integration test that likely requires a real Strapi instance. It may fail in CI regardless of file location. Document as-is and do not change test logic.

**`src/cron/tests/subscription-charge.cron.test.ts`**
→ `tests/cron/subscription-charge.cron.test.ts` (2 hops)
- `from "../subscription-charge.cron"` → `from "../../src/cron/subscription-charge.cron"`
- `jest.mock("../../utils/logtail", ...)` → `jest.mock("../../src/utils/logtail", ...)`

  Current: from `src/cron/tests/` + `../../` = `src/` + `utils/logtail`. New: from `tests/cron/` + `../../` = `apps/strapi/` + `src/utils/logtail` = `../../src/utils/logtail`.

- `jest.mock("../../services/oneclick", ...)` → `jest.mock("../../src/services/oneclick", ...)`
- `jest.mock("../../api/payment/utils/order.utils", ...)` → `jest.mock("../../src/api/payment/utils/order.utils", ...)`
- `jest.mock("../../api/payment/utils/general.utils", ...)` → `jest.mock("../../src/api/payment/utils/general.utils", ...)`

**`src/extensions/users-permissions/controllers/tests/authController.test.ts`**
→ `tests/extensions/users-permissions/controllers/authController.test.ts` (4 hops)
- `from "../authController"` → `from "../../../../src/extensions/users-permissions/controllers/authController"`
- `jest.mock("../../../../services/mjml", ...)` → `jest.mock("../../../../src/services/mjml", ...)`

  Current: from `src/extensions/users-permissions/controllers/tests/` + `../../../../` = `src/` + `services/mjml`. New: from `tests/extensions/users-permissions/controllers/` + `../../../../` = `apps/strapi/` + `src/services/mjml` = `../../../../src/services/mjml`. Correct.

- `from "../../../../services/mjml"` → `from "../../../../src/services/mjml"`

**`src/extensions/users-permissions/controllers/tests/userController.test.ts`**
→ `tests/extensions/users-permissions/controllers/userController.test.ts` (4 hops)
- `from "../userController"` → `from "../../../../src/extensions/users-permissions/controllers/userController"`

**`src/middlewares/tests/protect-user-fields.test.ts`**
→ `tests/middlewares/protect-user-fields.test.ts` (2 hops)
- `import protectUserFields from "../protect-user-fields"` → `import protectUserFields from "../../src/middlewares/protect-user-fields"`

**`src/services/facto/tests/facto.test.ts`**
→ `tests/services/facto/facto.test.ts` (3 hops)
- `from "../config/facto.config"` → `from "../../../src/services/facto/config/facto.config"`
- `import generalUtils from "../../../api/payment/utils/general.utils"` → `import generalUtils from "../../../src/api/payment/utils/general.utils"`

  Current: from `src/services/facto/tests/` + `../../../` = `src/` + `api/payment/utils/general.utils`. New: from `tests/services/facto/` + `../../../` = `apps/strapi/` + `src/api/payment/utils/general.utils` = `../../../src/api/payment/utils/general.utils`. Same `../../../` hops, just insert `src/` after.

**`src/services/flow/tests/flow.test.ts`**
→ `tests/services/flow/flow.test.ts` (3 hops)
- `from "../factories/flow.factory"` → `from "../../../src/services/flow/factories/flow.factory"`
- `from "../services/flow.service"` → `from "../../../src/services/flow/services/flow.service"`
- `from "../types/flow.types"` → `from "../../../src/services/flow/types/flow.types"`

**`src/services/google-one-tap/tests/google-one-tap.service.test.ts`**
→ `tests/services/google-one-tap/google-one-tap.service.test.ts` (3 hops)
- `from "../google-one-tap.service"` → `from "../../../src/services/google-one-tap/google-one-tap.service"`

**`src/services/indicador/tests/indicador.test.ts`**
→ `tests/services/indicador/indicador.test.ts` (3 hops)
- `from "../indicador.service"` → `from "../../../src/services/indicador/indicador.service"`
- `from "../http-client"` → `from "../../../src/services/indicador/http-client"`
- `from "../interfaces"` → `from "../../../src/services/indicador/interfaces"`

**`src/services/oneclick/tests/oneclick.service.test.ts`**
→ `tests/services/oneclick/oneclick.service.test.ts` (3 hops)
- `from "../services/oneclick.service"` → `from "../../../src/services/oneclick/services/oneclick.service"`
- `from "../types/oneclick.types"` → `from "../../../src/services/oneclick/types/oneclick.types"`

**`src/services/payment-gateway/tests/gateway.test.ts`**
→ `tests/services/payment-gateway/gateway.test.ts` (3 hops)
- `jest.mock("../../transbank/services/transbank.service")` → `jest.mock("../../../src/services/transbank/services/transbank.service")`

  Current: from `src/services/payment-gateway/tests/` + `../../` = `src/services/` + `transbank/services/transbank.service`. New: from `tests/services/payment-gateway/` + `../../../` = `apps/strapi/` + `src/services/transbank/services/transbank.service` = `../../../src/services/transbank/services/transbank.service`.

- `from "../registry"` → `from "../../../src/services/payment-gateway/registry"`
- `from "../types/gateway.interface"` → `from "../../../src/services/payment-gateway/types/gateway.interface"`
- `from "../adapters/transbank.adapter"` → `from "../../../src/services/payment-gateway/adapters/transbank.adapter"`
- `from "../../transbank/services/transbank.service"` → `from "../../../src/services/transbank/services/transbank.service"`

**`src/services/tavily/tests/tavily.test.ts`**
→ `tests/services/tavily/tavily.test.ts` (3 hops)
- `from "../tavily.service"` → `from "../../../src/services/tavily/tavily.service"`

**`src/services/weather/tests/weather.test.ts`**
→ `tests/services/weather/weather.test.ts` (3 hops)
- `from "../index"` → `from "../../../src/services/weather/index"`
- `dotenv.config({ path: path.resolve(__dirname, "../../../../.env") })` — `__dirname` will be the new test file's directory (`tests/services/weather/`). The `.env` file is at `apps/strapi/.env`. From `tests/services/weather/` that is 3 levels up = `../../../.env`. The current path uses `../../../../.env` (4 levels up from `src/services/weather/tests/` = `src/services/weather/` + 3 = `src/` + 1 = `apps/strapi/` — wait, 4 ups from `src/services/weather/tests/` = tests→weather→services→src→appstrapi → that overshoots). Let me recount:

  Current: `src/services/weather/tests/` — 4 levels up = `apps/strapi/`. File is `apps/strapi/.env`. So path `../../../../.env` is correct for current location.
  
  New: `tests/services/weather/` — 3 levels up = `apps/strapi/`. So `path.resolve(__dirname, "../../../.env")` is correct for new location.

**`src/services/zoho/tests/http-client.test.ts`**
→ `tests/services/zoho/http-client.test.ts` (3 hops)
- `from "../http-client"` → `from "../../../src/services/zoho/http-client"`
- `from "../interfaces"` → `from "../../../src/services/zoho/interfaces"`

**`src/services/zoho/tests/zoho.test.ts`**
→ `tests/services/zoho/zoho.test.ts` (3 hops)
- `from "../http-client"` → `from "../../../src/services/zoho/http-client"`
- `from "../zoho.service"` → `from "../../../src/services/zoho/zoho.service"`
- `from "../interfaces"` → `from "../../../src/services/zoho/interfaces"`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Import path recalculation | Custom script | Manual per-file editing with Read/Edit tools | 27 files is tractable manually; scripts add fragility and must themselves be tested |
| Directory creation | Custom tooling | `mkdir -p` via Bash | Standard shell command |
| File moves preserving git history | Manual copy+delete | `git mv` | Preserves rename history in git log |

## Common Pitfalls

### Pitfall 1: `roots` vs `testMatch` confusion
**What goes wrong:** Changing only `testMatch` without changing `roots` — Jest's `roots` scopes where it looks for tests. If `roots: ["<rootDir>/src"]` and test files move to `tests/`, Jest finds zero tests even though `testMatch` would match them.
**Why it happens:** `roots` acts as the search scope filter before `testMatch` is applied.
**How to avoid:** Change `roots` to `["<rootDir>/tests"]`. The `testMatch` patterns remain valid.
**Warning signs:** `yarn test` reports "No tests found" after moving files.

### Pitfall 2: `jest.mock()` path resolution
**What goes wrong:** `jest.mock()` calls use relative paths just like `import` statements — they resolve relative to the test file's directory. They must be rewritten with the same depth logic as regular imports.
**Why it happens:** Developers sometimes forget `jest.mock("../../services/x")` is path-relative.
**How to avoid:** Treat every string argument in `jest.mock()` that starts with `.` or `..` as an import path that needs updating.
**Warning signs:** Jest throws "Cannot find module '../../services/x'" during test run.

### Pitfall 3: `__dirname` in dotenv.config
**What goes wrong:** `weather.test.ts` uses `path.resolve(__dirname, "../../../../.env")` — `__dirname` is runtime-resolved to the actual file's directory. Moving the file changes `__dirname`, so the hop count changes.
**Why it happens:** `__dirname` is a Node.js runtime value, not statically analyzed by TypeScript.
**How to avoid:** Recalculate `__dirname`-relative paths: from `tests/services/weather/` the `.env` is 3 levels up (not 4). Change to `"../../../.env"`.
**Warning signs:** dotenv loads silently with empty vars; `weather.test.ts` fails with missing env vars.

### Pitfall 4: Integration test (`general.utils.test.ts`) requires live Strapi
**What goes wrong:** `general.utils.test.ts` calls `createStrapi()` and `instance.start()` — it boots a real Strapi instance. This test was likely already skipped or failing in CI. Moving it does not fix this; it will still require a running Strapi environment.
**Why it happens:** The test was written as an integration test, not a unit test.
**How to avoid:** Move the file as-is, do not change test logic. Accept that this test may remain skipped/failing in CI. Do not add `--testPathIgnorePatterns` — that is a test logic change, which is out of scope.
**Warning signs:** Test runs hang or fail with "Cannot connect to database" after moving.

### Pitfall 5: TypeScript compilation
**What goes wrong:** The existing `tsconfig.json` `include` covers `"./**/*.ts"` which includes `tests/` once it exists. However, the `exclude` has `"**/*.test.*"` which excludes all test files. This is correct and unchanged. No modifications to `tsconfig.json` are needed.
**Why it happens:** Developers assume the new directory location needs explicit `tsconfig.json` inclusion.
**How to avoid:** Do not modify `tsconfig.json`. Verify with `yarn ts-jest` or a test run.

### Pitfall 6: `jest.mock()` calls must appear BEFORE imports (hoisting)
**What goes wrong:** Some test files have `jest.mock()` calls interspersed with imports. The order matters (Jest hoists `jest.mock()` calls). When rewriting import paths, do not reorder lines or change the position of `jest.mock()` relative to `import` statements.
**Why it happens:** Mechanical search-and-replace may reorder accidentally.
**How to avoid:** Only change the path string argument — do not move lines.

## Code Examples

### jest.config.js change
```javascript
// Source: apps/strapi/jest.config.js — current state (post Phase 116)
// BEFORE:
roots: ["<rootDir>/src"],

// AFTER:
roots: ["<rootDir>/tests"],
```

### Import rewrite — 2-hop example (middlewares)
```typescript
// BEFORE (src/middlewares/tests/protect-user-fields.test.ts):
import protectUserFields from "../protect-user-fields";

// AFTER (tests/middlewares/protect-user-fields.test.ts):
import protectUserFields from "../../src/middlewares/protect-user-fields";
```

### Import rewrite — 3-hop example (zoho service)
```typescript
// BEFORE (src/services/zoho/tests/zoho.test.ts):
import { ZohoHttpClient } from "../http-client";
import { ZohoService } from "../zoho.service";
import { ZohoConfig } from "../interfaces";

// AFTER (tests/services/zoho/zoho.test.ts):
import { ZohoHttpClient } from "../../../src/services/zoho/http-client";
import { ZohoService } from "../../../src/services/zoho/zoho.service";
import { ZohoConfig } from "../../../src/services/zoho/interfaces";
```

### Import rewrite — 4-hop example with cross-service mocks (ad.approve.zoho.test.ts)
```typescript
// BEFORE (src/api/ad/services/tests/):
jest.mock("../../../../services/mjml", () => ({ ... }));
jest.mock("../../../../services/zoho", () => ({ ... }));
import { zohoService } from "../../../../services/zoho";
import adServiceFactory from "../ad";

// AFTER (tests/api/ad/services/):
jest.mock("../../../../src/services/mjml", () => ({ ... }));
jest.mock("../../../../src/services/zoho", () => ({ ... }));
import { zohoService } from "../../../../src/services/zoho";
import adServiceFactory from "../../../../src/api/ad/services/ad";
```

### weather.test.ts __dirname path
```typescript
// BEFORE (src/services/weather/tests/ — 4 hops to apps/strapi/):
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

// AFTER (tests/services/weather/ — 3 hops to apps/strapi/):
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tests flat co-located with source | Tests in `tests/` subdirectory per module | Phase 116 (2026-04-06) | Enforces separation; all 27 files already under `tests/` |
| `__tests__/` directories | `tests/` directories | Phase 116 (2026-04-06) | Jest testMatch already updated |
| `roots: ["<rootDir>/src"]` | `roots: ["<rootDir>/tests"]` | This phase | Single config change |

## Open Questions

1. **`general.utils.test.ts` is an integration test**
   - What we know: It calls `createStrapi()` and `instance.start()`, requiring a real database connection
   - What's unclear: Whether this test is currently passing in CI or already marked to skip
   - Recommendation: Move as-is (pure file relocation), do not change test logic; document in plan that this test requires a live Strapi environment

2. **facto.test.ts may require live Facto SOAP connection**
   - What we know: It imports `FactoConfig` and uses real env vars (`FACTO_URL`, `FACTO_USER`, `FACTO_PASSWORD`)
   - What's unclear: Whether tests are mocked or make real network calls
   - Recommendation: Move as-is; import path update is all that is needed

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + ts-jest 29.2.5 |
| Config file | `apps/strapi/jest.config.js` |
| Quick run command | `cd apps/strapi && yarn test --testPathPattern="tests/middlewares"` |
| Full suite command | `cd apps/strapi && yarn test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STRUCT-118-STRAPI | All 27 test files discoverable by Jest from `tests/` root | structural | `cd apps/strapi && yarn test 2>&1 \| grep -E "Test Suites:|Tests:"` | ❌ Wave 0 — files must be moved |

### Sampling Rate
- **Per task commit:** `cd apps/strapi && yarn test 2>&1 | tail -20`
- **Per wave merge:** `cd apps/strapi && yarn test`
- **Phase gate:** Full suite — same pass/fail count as pre-move baseline

### Wave 0 Gaps
- [ ] `apps/strapi/tests/` directory — must be created during task execution
- [ ] All 27 test files must be `git mv`'d and imports rewritten

*(No new test files to write — this phase is pure relocation)*

## Sources

### Primary (HIGH confidence)
- `apps/strapi/jest.config.js` — verified current config: `roots: ["<rootDir>/src"]`, `testMatch: ["**/tests/**/*.ts", "**/?(*.)+(spec|test).ts"]`
- `apps/strapi/tsconfig.json` — verified: `include: ["./", "./**/*.ts"]`, `exclude: ["**/*.test.*"]`
- `apps/strapi/package.json` — verified: `jest: ^29.7.0`, `ts-jest: ^29.2.5`
- All 27 test files read directly — import patterns verified firsthand

### Secondary (MEDIUM confidence)
- Phase 116 SUMMARY.md — documents what was done in the prior move (confirms all 27 files are under `src/*/tests/` and imports already use `../`)
- Phase 116 PLAN 02 — confirms `testMatch` already updated from `__tests__` to `tests` pattern in Phase 116

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions read directly from package.json
- Architecture: HIGH — all 27 file locations verified with `find` command, all imports read directly
- Pitfalls: HIGH — derived from direct code inspection and Phase 116 execution history
- Import rewrite map: HIGH — calculated mathematically from directory depths, cross-checked against current imports

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (file structure is stable; no fast-moving dependencies)
