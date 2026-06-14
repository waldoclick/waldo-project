import { vi, describe, it, expect, afterEach } from "vitest";

describe("useSessionUser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("initializes to null via useState", async () => {
    // useState is a Nuxt auto-import (global) — stub it directly
    let capturedInitFn: (() => unknown) | undefined;
    vi.stubGlobal("useState", (key: string, init: () => unknown) => {
      capturedInitFn = init;
      return { value: init() };
    });

    const { useSessionUser } = await import("@/composables/useSessionUser");

    const userRef = useSessionUser();

    expect(userRef.value).toBeNull();
    expect(capturedInitFn?.()).toBeNull();
  });

  it("uses the key 'session_user'", async () => {
    let capturedKey: string | undefined;
    vi.stubGlobal("useState", (key: string, init: () => unknown) => {
      capturedKey = key;
      return { value: init() };
    });

    const { useSessionUser } = await import("@/composables/useSessionUser");

    useSessionUser();

    expect(capturedKey).toBe("session_user");
  });
});
