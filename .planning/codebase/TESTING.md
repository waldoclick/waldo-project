# Testing Patterns

**Analysis Date:** 2026-06-10

## Test Framework

**Website & Dashboard (`apps/website`, `apps/dashboard`):**

- Runner: Vitest 3.x
- Config: `apps/website/vitest.config.ts`
- Environment: `happy-dom`
- Component mounting: `@vue/test-utils`
- Globals enabled (`globals: true`) — no need to import `describe`, `it`, `expect`

**Strapi (`apps/strapi`):**

- Runner: Jest 29.x with `ts-jest`
- Config: `apps/strapi/jest.config.js`
- Environment: `node`
- Setup file: `apps/strapi/jest.setup.ts` — loads `dotenv/config` and seeds test env vars for payment gateways

**Run Commands:**

```bash
pnpm test                    # Run all tests across monorepo (via Turbo)
cd apps/website && pnpm test # Run website tests only
cd apps/strapi && pnpm test  # Run Strapi tests only
```

Vitest does not have a separate watch-mode script — run `pnpm test --watch` inside the app directory.

## Test File Organization

**Location rule:** All test files live in the root-level `tests/` directory of their app. Never co-located with source files.

| App | Test root | Source mirror |
|-----|-----------|---------------|
| `apps/website` | `apps/website/tests/` | mirrors `app/` |
| `apps/strapi` | `apps/strapi/tests/` | mirrors `src/` |

**Directory structure (website):**

```
apps/website/tests/
├── components/       # Component render + behavior tests
├── composables/      # Composable unit tests
├── middleware/       # Nuxt route middleware tests
├── pages/            # Page-level pure function tests
├── plugins/          # Nuxt plugin tests
├── server/           # Nitro server utility tests
├── stores/           # Pinia store tests
└── stubs/
    ├── app.stub.ts   # Stub for #app virtual module
    └── imports.stub.ts  # Stub for #imports virtual module
```

**Directory structure (Strapi):**

```
apps/strapi/tests/
├── api/
│   └── payment/
│       ├── controllers/
│       ├── services/
│       └── utils/
├── bootstrap/
├── cron/
├── extensions/
│   └── users-permissions/
│       └── controllers/
├── middlewares/
└── services/
```

**Naming:** `{SourceFileName}.test.ts` — e.g. `useLogout.ts` → `useLogout.test.ts`, `protect-user-fields.ts` → `protect-user-fields.test.ts`.

For components with multiple test concerns, use a dot qualifier: `FormLogin.website.test.ts`, `FormLogin.render.test.ts`.

## Test Structure

**Suite organization (Vitest):**

```typescript
import { vi, describe, it, expect, beforeEach } from "vitest";

// All mocks declared BEFORE imports that use them
vi.mock("@/stores/ad.store", () => ({
  useAdStore: () => ({ $reset: mockAdReset }),
}));

// Dynamic import after mocks
const { useLogout } = await import("@/composables/useLogout");

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls navigateTo with exactly '/'", async () => {
    const { logout } = useLogout();
    await logout();
    expect(mockNavigateTo).toHaveBeenCalledWith("/");
  });
});
```

**Suite organization (Jest/Strapi) — AAA pattern:**

```typescript
describe("protect-user-fields middleware", () => {
  it("strips pro_status from body.data, keeps safe fields", async () => {
    // Arrange
    const middleware = createMiddleware();
    const ctx = createContext("PUT", "/api/users/123", {
      data: { pro_status: "active", firstname: "Alice" },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    // Act
    await middleware(ctx as unknown as Context, next);

    // Assert
    expect(ctx.request.body.data).not.toHaveProperty("pro_status");
    expect(ctx.request.body.data).toHaveProperty("firstname", "Alice");
    expect(next).toHaveBeenCalled();
  });
});
```

**Patterns:**

- `beforeEach`: reset mocks (`vi.clearAllMocks()` / `jest.clearAllMocks()`) and re-initialize stores
- `afterEach`: clean up global stubs (`vi.unstubAllGlobals()`) when `vi.stubGlobal` was used
- Pinia stores: initialize with `setActivePinia(createPinia())` in each `beforeEach`
- Test names are descriptive English sentences; requirement codes included where traceability is needed (e.g. `"GUARD-01"`, `"WIRE-02"`, `"RCP-03"`)

## Mocking

**Vitest mocking (website):**

All `vi.mock()` calls are declared at the top of the file before any imports that depend on them (Vitest hoists these automatically):

```typescript
const mockAdReset = vi.fn();

vi.mock("@/stores/ad.store", () => ({
  useAdStore: () => ({ $reset: mockAdReset }),
}));
```

**Nuxt virtual module mocking:**

```typescript
// Mock #imports (composables, navigateTo, useStrapiAuth, etc.)
vi.mock("#imports", () => ({
  useApiClient: () => mockClient,
  navigateTo: mockNavigateTo,
}));

// Mock #app (useNuxtApp, useRuntimeConfig, useState, etc.)
vi.mock("#app", () => ({
  useNuxtApp: () => ({ $recaptcha: mockRecaptcha }),
}));
```

**Nuxt auto-import globals (when no explicit import exists in source):**

```typescript
global.useSweetAlert2 = vi.fn(() => ({ Swal: { fire: mockSwalFire } }));
global.useStrapiClient = vi.fn(() => mockClient) as unknown as typeof useStrapiClient;
global.useState = vi.fn((_key: string, init: () => unknown) => ref(init())) as unknown as typeof useState;
global.useRouter = vi.fn(() => ({ push: mockPush })) as unknown as typeof useRouter;
```

**`vi.hoisted` for cross-reference mocks:**

```typescript
const { mockClient } = vi.hoisted(() => ({
  mockClient: vi.fn(),
}));

vi.mock("#imports", () => ({
  useApiClient: () => mockClient,
}));
```

**Jest mocking (Strapi):**

```typescript
jest.mock("../../../../src/utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../../../../src/services/payment-gateway", () => ({
  getPaymentGateway: jest.fn().mockReturnValue({
    createTransaction: jest.fn().mockResolvedValue({ success: true, ... }),
    commitTransaction: jest.fn().mockResolvedValue({ success: true, ... }),
  }),
}));

import { getPaymentGateway } from "../../../../src/services/payment-gateway";
// Import AFTER jest.mock declarations
```

**Strapi global mock:**

```typescript
(global as unknown as Record<string, unknown>).strapi = {
  db: { query: strapiQueryMock },
  plugins: {
    "users-permissions": {
      services: { jwt: { issue: mockJwtIssue } },
    },
  },
};
```

**What to mock:**

- All Nuxt auto-imports (`useStrapiClient`, `navigateTo`, `useRouter`, `useState`, etc.)
- External SDK calls (Strapi DB queries, payment gateways, email services)
- All stores when testing composables or middleware
- `$fetch` / `fetch` for server utility tests
- Pinia stores (return minimal shape with required functions/state)

**What NOT to mock:**

- The module under test itself
- Pure utility functions being tested directly
- `vue` primitives (`ref`, `computed`, `nextTick`)
- `pinia` itself — use `setActivePinia(createPinia())` instead

## Stubs

**Nuxt virtual module stubs** in `apps/website/tests/stubs/`:

- `app.stub.ts` — exports no-op implementations of all `#app` exports (`useNuxtApp`, `useState`, `navigateTo`, `useRouter`, `useRoute`, `useAsyncData`, `useFetch`, `defineNuxtPlugin`, etc.)
- `imports.stub.ts` — exports no-op implementations of all `#imports` exports (`navigateTo`, `useStrapiAuth`, `useStrapiClient`, `useNuxtApp`, `useStrapiUser`, `useRoute`, `useRuntimeConfig`, etc.)

These stubs are registered as path aliases in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    "@": fileURLToPath(new URL("./app", import.meta.url)),
    "~": fileURLToPath(new URL("./", import.meta.url)),
    "#app": fileURLToPath(new URL("./tests/stubs/app.stub.ts", import.meta.url)),
    "#imports": fileURLToPath(new URL("./tests/stubs/imports.stub.ts", import.meta.url)),
  },
}
```

Individual tests override the stubs with `vi.mock("#imports", () => ({ ... }))` when they need specific behavior.

**Component stubs** are defined inline per test:

```typescript
const CardInfoStub = {
  name: "CardInfo",
  props: ["title", "description"],
  template: '<div class="card--info">{{ title }}</div>',
};

mount(ResumeOrder, {
  global: {
    components: { CardInfo: CardInfoStub },
    stubs: { "client-only": { template: "<div><slot /></div>" } },
  },
});
```

## Nuxt SSR Guard Handling

The `vitest.config.ts` includes a custom Vite plugin that replaces `import.meta.client` with `true` and `import.meta.server` with `false` in all transformed files. This ensures SSR bail-outs never fire during tests, so all component and guard logic runs in the test environment.

```typescript
// vitest.config.ts
{
  name: "nuxt-meta-client-stub",
  transform(code) {
    return code
      .replace(/import\.meta\.client/g, "true")
      .replace(/import\.meta\.server/g, "false");
  },
}
```

## Coverage

**Requirements:** No enforced coverage threshold configured. The project standard is 100% unit test coverage for all utility functions at creation time.

**View coverage:**

```bash
cd apps/website && pnpm vitest --coverage
cd apps/strapi && pnpm jest --coverage
```

## Test Types

**Unit tests (primary):**

- Composables: test return values, side effects, call order
- Stores: test fetch behavior, cache guards, state mutations
- Strapi services: test gateway delegation, success/failure paths, data transformation
- Strapi middleware: test field stripping, route matching, `next()` call
- Utility functions: test pure input/output

**Integration-style component tests:**

- Mount component with `@vue/test-utils`
- Trigger user interactions (`wrapper.find(...).trigger("click")`)
- Assert DOM state with `wrapper.find(".bem-class").exists()` or `.text()`
- Assert mock calls to verify correct API endpoints and payloads

**No E2E tests** — Cypress is listed as a build dependency but no E2E test files exist.

## Common Patterns

**Async testing (Vitest):**

```typescript
it("fetches order by documentId", async () => {
  mockClient.mockResolvedValueOnce({ data: { documentId: "VALID_ID" } });
  const order = await useOrderById("VALID_ID");
  expect(order).toMatchObject({ documentId: "VALID_ID" });
});
```

**Error path testing:**

```typescript
it("throws error if order not found", async () => {
  mockClient.mockResolvedValueOnce({ data: null });
  await expect(useOrderById("NO_ORDER")).rejects.toThrow("Order not found");
});
```

**Call order verification (Vitest):**

```typescript
const authOrder = mockAuthLogout.mock.invocationCallOrder[0]!;
const navOrder = mockNavigateTo.mock.invocationCallOrder[0]!;
expect(navOrder).toBeGreaterThan(authOrder);
```

**Dynamic import after mocks (required for modules using Nuxt auto-imports):**

```typescript
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

it("...", async () => {
  const { useLogout } = await import("@/composables/useLogout");
  // ...
});
```

**Pinia store isolation:**

```typescript
beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});
```

**Global stub for browser APIs:**

```typescript
beforeEach(() => {
  vi.stubGlobal("google", {
    accounts: { id: { disableAutoSelect: mockDisableAutoSelect } },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
```

**Helper factory functions** for reducing test boilerplate:

```typescript
function mountFormLogin() {
  return mount(FormLogin, { global: { stubs: { ... } } });
}

async function triggerSubmit(vm: unknown, email: string, password: string) {
  await (vm as { handleSubmit: (_v: Record<string, unknown>) => Promise<void> })
    .handleSubmit({ email, password });
}
```

---

*Testing analysis: 2026-06-10*
