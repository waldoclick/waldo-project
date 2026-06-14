/**
 * Stub Nitro/h3 server auto-imports for Vitest.
 * Nitro injects these as globals; they are not available in the test environment.
 * This file is loaded as a setupFile (see vitest.config.ts) for tests under tests/server/.
 */

// defineEventHandler: pass-through (returns the handler fn directly)

(globalThis as typeof globalThis & Record<string, unknown>).defineEventHandler =
  (fn: (event: unknown) => unknown) => fn;

// createError: wraps options into an Error with statusCode attached

(globalThis as typeof globalThis & Record<string, unknown>).createError = (
  opts: Record<string, unknown>,
) => Object.assign(new Error(String(opts.statusMessage ?? "")), opts);

// readBody, setCookie, getHeader: no-ops in test context

(globalThis as typeof globalThis & Record<string, unknown>).readBody = () =>
  Promise.resolve({});

(globalThis as typeof globalThis & Record<string, unknown>).setCookie =
  () => {};

(globalThis as typeof globalThis & Record<string, unknown>).getHeader =
  () => {};

// useRuntimeConfig: minimal config stub for server handlers

(globalThis as typeof globalThis & Record<string, unknown>).useRuntimeConfig =
  () => ({
    public: { devMode: false },
    devUsername: null,
    devPassword: null,
  });
