/**
 * Stub Nitro/h3 server auto-imports for Vitest.
 * Nitro injects these as globals; they are not available in the test environment.
 * This file is loaded as a setupFile (see vitest.config.ts) for tests under tests/server/.
 */

// defineEventHandler: pass-through (returns the handler fn directly)

(globalThis as any).defineEventHandler = (fn: (event: unknown) => unknown) =>
  fn;

// createError: wraps options into an Error with statusCode attached

(globalThis as any).createError = (opts: Record<string, unknown>) =>
  Object.assign(new Error(String(opts.statusMessage ?? "")), opts);

// readBody, setCookie, getHeader: no-ops in test context

(globalThis as any).readBody = () => Promise.resolve({});

(globalThis as any).setCookie = () => {};

(globalThis as any).getHeader = () => {};

// useRuntimeConfig: minimal config stub for server handlers

(globalThis as any).useRuntimeConfig = () => ({
  public: { devMode: false },
  devUsername: null,
  devPassword: null,
});
