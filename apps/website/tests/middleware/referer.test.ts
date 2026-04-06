import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

const mockNavigateTo = vi.fn();
vi.mock("#app", () => ({
  defineNuxtRouteMiddleware: (fn: unknown) => fn,
  navigateTo: mockNavigateTo,
}));

global.defineNuxtRouteMiddleware = (fn: unknown) => fn;

const mockSetReferer = vi.fn();
global.useAppStore = vi.fn(() => ({ setReferer: mockSetReferer }));

let middleware: (...args: unknown[]) => unknown = () => {};

beforeAll(async () => {
  const mod = await import("@/middleware/referer.global");
  middleware = mod.default;
});

const makeRoute = (path: string) => ({ path, fullPath: path });

describe("referer.global (INTEG-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores referer when leaving a normal page (baseline)", () => {
    middleware(makeRoute("/destino"), makeRoute("/anuncios"));
    expect(mockSetReferer).toHaveBeenCalledWith("/anuncios");
  });

  it("does not store /onboarding as referer (INTEG-02)", () => {
    middleware(makeRoute("/destino"), makeRoute("/onboarding"));
    expect(mockSetReferer).not.toHaveBeenCalled();
  });

  it("does not store /onboarding/thankyou as referer (INTEG-02)", () => {
    middleware(makeRoute("/destino"), makeRoute("/onboarding/thankyou"));
    expect(mockSetReferer).not.toHaveBeenCalled();
  });

  it("does not store excluded exact-match route /registro as referer", () => {
    middleware(makeRoute("/destino"), makeRoute("/registro"));
    expect(mockSetReferer).not.toHaveBeenCalled();
  });
});
