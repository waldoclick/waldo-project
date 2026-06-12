import { describe, it, expect, vi } from "vitest";

// vi.hoisted runs before module evaluation — required because defineEventHandler/createError
// are Nitro auto-imported globals, not explicit imports inside the handler files.
const { mockCreateError, mockDefineEventHandler } = vi.hoisted(() => {
  const mockCreateError = (opts: Record<string, unknown>) =>
    Object.assign(new Error(String(opts.statusMessage ?? "")), opts);
  const mockDefineEventHandler = (fn: (event: unknown) => unknown) => fn;
  return { mockCreateError, mockDefineEventHandler };
});

// Provide Nitro/h3 globals so the handlers can be imported in test environment
vi.stubGlobal("defineEventHandler", mockDefineEventHandler);
vi.stubGlobal("createError", mockCreateError);
vi.stubGlobal("readBody", vi.fn());
vi.stubGlobal("setCookie", vi.fn());
vi.stubGlobal(
  "useRuntimeConfig",
  vi.fn(() => ({ public: {}, devUsername: null, devPassword: null })),
);

vi.mock("h3", () => ({
  defineEventHandler: (fn: (event: unknown) => unknown) => fn,
  createError: (opts: Record<string, unknown>) =>
    Object.assign(new Error(String(opts.statusMessage ?? "")), opts),
  readBody: vi.fn(),
  setCookie: vi.fn(),
  getHeader: vi.fn(),
}));

// In the Vitest environment import.meta.dev is false (not dev mode),
// so both handlers must throw { statusCode: 404 } immediately.
import devConfig from "../../server/api/dev-config.get";
import devLogin from "../../server/api/dev-login.post";

describe("dev-only endpoints return 404 outside dev", () => {
  // DEV-01: dev-config.get returns 404 when not in dev mode
  it("dev-config returns 404 outside dev", async () => {
    await expect(
      (devConfig as (event: unknown) => Promise<unknown>)({}),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  // DEV-02: dev-login.post returns 404 when not in dev mode
  it("dev-login returns 404 outside dev", async () => {
    await expect(
      (devLogin as (event: unknown) => Promise<unknown>)({}),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
