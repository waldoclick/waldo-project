import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock factories (hoisted so they're available before module evaluation) ---
const { mockDefineEventHandler } = vi.hoisted(() => {
  const mockDefineEventHandler = (fn: (event: unknown) => unknown) => fn;
  return { mockDefineEventHandler };
});

// --- Nitro/h3 globals ---
const mockGetQuery = vi.fn();
const mockUseRuntimeConfig = vi.fn();
const mockProxyRequest = vi.fn();
const mockSetResponseHeader = vi.fn();

vi.stubGlobal("defineEventHandler", mockDefineEventHandler);
vi.stubGlobal("getQuery", mockGetQuery);
vi.stubGlobal("useRuntimeConfig", mockUseRuntimeConfig);
vi.stubGlobal("proxyRequest", mockProxyRequest);
vi.stubGlobal("setResponseHeader", mockSetResponseHeader);

import imagesHandler from "../../../../server/api/images/[...]";

type Handler = (event: unknown) => Promise<unknown>;

describe("images proxy route", () => {
  beforeEach(() => {
    mockGetQuery.mockReset();
    mockUseRuntimeConfig.mockReset();
    mockProxyRequest.mockReset();
    mockSetResponseHeader.mockReset();

    mockGetQuery.mockReturnValue({});
    mockUseRuntimeConfig.mockReturnValue({ apiUrl: "https://api.example.com" });
  });

  it("calls proxyRequest with an onResponse option that is a function", async () => {
    const event = { node: { req: { url: "/api/images/test.jpg" } } };

    await (imagesHandler as Handler)(event);

    expect(mockProxyRequest).toHaveBeenCalledOnce();
    const opts = mockProxyRequest.mock.calls[0][2] as Record<string, unknown>;
    expect(typeof opts.onResponse).toBe("function");
  });

  it("onResponse sets the expected Vercel-cacheable cache-control header", async () => {
    const event = { node: { req: { url: "/api/images/test.jpg" } } };

    await (imagesHandler as Handler)(event);

    const opts = mockProxyRequest.mock.calls[0][2] as Record<
      string,
      (e: unknown, response: unknown) => void
    >;
    const onResponse = opts.onResponse as (
      e: unknown,
      response: unknown,
    ) => void;

    onResponse(event, {});

    expect(mockSetResponseHeader).toHaveBeenCalledWith(
      event,
      "cache-control",
      "public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400",
    );
  });

  it("does not include a Cache-Control/cache-control key in the outgoing request headers", async () => {
    const event = { node: { req: { url: "/api/images/test.jpg" } } };

    await (imagesHandler as Handler)(event);

    const opts = mockProxyRequest.mock.calls[0][2] as Record<string, unknown>;
    const headers = opts.headers as Record<string, string>;
    const headerKeys = Object.keys(headers).map((k) => k.toLowerCase());

    expect(headerKeys).not.toContain("cache-control");
  });
});
