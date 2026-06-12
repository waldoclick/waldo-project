import { describe, it, expect, vi, beforeEach } from "vitest";

const mockReadBody = vi.fn();
const mockSetCookie = vi.fn();
const mockUseRuntimeConfig = vi.fn();

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
vi.stubGlobal("readBody", mockReadBody);
vi.stubGlobal("setCookie", mockSetCookie);
vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);

vi.mock("h3", () => ({
  defineEventHandler: (fn: (event: unknown) => unknown) => fn,
  createError: (opts: Record<string, unknown>) =>
    Object.assign(new Error(String(opts.statusMessage ?? "")), opts),
  readBody: vi.fn(),
  setCookie: vi.fn(),
  getHeader: vi.fn(),
}));

import devConfig from "../../server/api/dev-config.get";
import devLogin from "../../server/api/dev-login.post";

type Handler = (event: unknown) => Promise<unknown>;

describe("dev-config: returns 404 outside dev mode", () => {
  it("dev-config returns 404 outside dev", async () => {
    await expect((devConfig as Handler)({})).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("dev-login: authentication flow", () => {
  beforeEach(() => {
    mockReadBody.mockReset();
    mockSetCookie.mockReset();
    mockUseRuntimeConfig.mockReset();
  });

  it("returns 400 when credentials are missing", async () => {
    mockReadBody.mockResolvedValue({ username: "", password: "" });
    await expect((devLogin as Handler)({})).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("returns 401 when credentials are wrong", async () => {
    mockReadBody.mockResolvedValue({ username: "admin", password: "wrong" });
    mockUseRuntimeConfig.mockReturnValue({
      devUsername: "admin",
      devPassword: "correct",
    });
    await expect((devLogin as Handler)({})).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("returns success and sets cookie when credentials are correct", async () => {
    const event = {};
    mockReadBody.mockResolvedValue({ username: "admin", password: "secret" });
    mockUseRuntimeConfig.mockReturnValue({
      devUsername: "admin",
      devPassword: "secret",
    });

    const result = await (devLogin as Handler)(event);

    expect(result).toMatchObject({ success: true });
    expect(mockSetCookie).toHaveBeenCalledWith(
      event,
      "devmode",
      expect.any(String),
      expect.objectContaining({ sameSite: "strict", path: "/" }),
    );
  });
});
