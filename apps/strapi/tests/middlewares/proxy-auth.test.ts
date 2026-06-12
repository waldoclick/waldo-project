// proxy-auth.test.ts

import type { Context } from "koa";
import proxyAuth from "../../src/middlewares/proxy-auth";

const VALID_WEB_KEY =
  "50e09ce6153051edb8ba9b95bc7474965b14c1d23807ad36638e9313187160ef";
const VALID_APP_KEY =
  "12bac1dc704f7b6a3d1d73f31d384713c0c272498592f2c498780754dc48575f";

let originalWeb: string | undefined;
let originalApp: string | undefined;

beforeEach(() => {
  originalWeb = process.env.PROXY_SECRET_WEB;
  originalApp = process.env.PROXY_SECRET_APP;
  process.env.PROXY_SECRET_WEB = VALID_WEB_KEY;
  process.env.PROXY_SECRET_APP = VALID_APP_KEY;
});

afterEach(() => {
  if (originalWeb === undefined) {
    delete process.env.PROXY_SECRET_WEB;
  } else {
    process.env.PROXY_SECRET_WEB = originalWeb;
  }
  if (originalApp === undefined) {
    delete process.env.PROXY_SECRET_APP;
  } else {
    process.env.PROXY_SECRET_APP = originalApp;
  }
});

function createContext(
  path: string,
  proxyKey?: string,
): {
  path: string;
  request: { headers: Record<string, string | undefined> };
  unauthorized: jest.Mock;
  forbidden: jest.Mock;
} {
  const headers: Record<string, string | undefined> = {};
  if (proxyKey !== undefined) {
    headers["x-proxy-key"] = proxyKey;
  }
  return {
    path,
    request: { headers },
    unauthorized: jest.fn(),
    forbidden: jest.fn(),
  };
}

describe("proxy-auth middleware", () => {
  // Test 1: non-/api path passes through without enforcement
  it("calls next() without checking header for non-/api paths (admin panel stays working)", async () => {
    const mw = proxyAuth();
    const ctx = createContext("/admin");
    const next = jest.fn().mockResolvedValue(undefined);

    await mw(ctx as unknown as Context, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.unauthorized).not.toHaveBeenCalled();
    expect(ctx.forbidden).not.toHaveBeenCalled();
  });

  // Test 2: /api path with no key returns 401
  it("returns 401 unauthorized when X-Proxy-Key header is missing on /api route", async () => {
    const mw = proxyAuth();
    const ctx = createContext("/api/ads");
    const next = jest.fn().mockResolvedValue(undefined);

    await mw(ctx as unknown as Context, next);

    expect(ctx.unauthorized).toHaveBeenCalledWith("Proxy key is required");
    expect(next).not.toHaveBeenCalled();
    expect(ctx.forbidden).not.toHaveBeenCalled();
  });

  // Test 3: /api path with wrong key returns 403
  it("returns 403 forbidden when X-Proxy-Key header has an invalid value on /api route", async () => {
    const mw = proxyAuth();
    const ctx = createContext("/api/ads", "wrong-key-value");
    const next = jest.fn().mockResolvedValue(undefined);

    await mw(ctx as unknown as Context, next);

    expect(ctx.forbidden).toHaveBeenCalledWith("Invalid proxy key");
    expect(next).not.toHaveBeenCalled();
    expect(ctx.unauthorized).not.toHaveBeenCalled();
  });

  // Test 4: /api path with PROXY_SECRET_WEB calls next()
  it("calls next() when X-Proxy-Key matches PROXY_SECRET_WEB on /api route", async () => {
    const mw = proxyAuth();
    const ctx = createContext("/api/ads", VALID_WEB_KEY);
    const next = jest.fn().mockResolvedValue(undefined);

    await mw(ctx as unknown as Context, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.unauthorized).not.toHaveBeenCalled();
    expect(ctx.forbidden).not.toHaveBeenCalled();
  });

  // Test 5: /api path with PROXY_SECRET_APP calls next() (mobile app path)
  it("calls next() when X-Proxy-Key matches PROXY_SECRET_APP on /api route (mobile app)", async () => {
    const mw = proxyAuth();
    const ctx = createContext("/api/ads", VALID_APP_KEY);
    const next = jest.fn().mockResolvedValue(undefined);

    await mw(ctx as unknown as Context, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.unauthorized).not.toHaveBeenCalled();
    expect(ctx.forbidden).not.toHaveBeenCalled();
  });
});
