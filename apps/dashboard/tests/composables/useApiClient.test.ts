import { describe, it, expect, vi, beforeEach } from "vitest";

const mockClient = vi.fn().mockResolvedValue({});
const mockExecute = vi.fn().mockResolvedValue("fake-recaptcha-token");

vi.mock("#imports", () => ({
  useStrapiClient: () => mockClient,
  useNuxtApp: () => ({ $recaptcha: { execute: mockExecute } }),
}));

import { useApiClient } from "~/app/composables/useApiClient";

describe("useApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.mockResolvedValue({});
    mockExecute.mockResolvedValue("fake-recaptcha-token");
  });

  it("calls $recaptcha.execute('submit') and passes X-Recaptcha-Token for POST", async () => {
    const apiClient = useApiClient();
    await apiClient("/test", { method: "POST" });

    expect(mockExecute).toHaveBeenCalledWith("submit");
    expect(mockClient).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Recaptcha-Token": "fake-recaptcha-token",
        }),
      }),
    );
  });

  it("calls $recaptcha.execute('submit') and passes X-Recaptcha-Token for PUT", async () => {
    const apiClient = useApiClient();
    await apiClient("/test", { method: "PUT" });

    expect(mockExecute).toHaveBeenCalledWith("submit");
    expect(mockClient).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Recaptcha-Token": "fake-recaptcha-token",
        }),
      }),
    );
  });

  it("calls $recaptcha.execute('submit') and passes X-Recaptcha-Token for DELETE", async () => {
    const apiClient = useApiClient();
    await apiClient("/test", { method: "DELETE" });

    expect(mockExecute).toHaveBeenCalledWith("submit");
    expect(mockClient).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Recaptcha-Token": "fake-recaptcha-token",
        }),
      }),
    );
  });

  it("does NOT call $recaptcha.execute for GET requests (no method)", async () => {
    const apiClient = useApiClient();
    await apiClient("/test");

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockClient).toHaveBeenCalledWith("/test", undefined);
  });

  it("does NOT add X-Recaptcha-Token for GET requests", async () => {
    const apiClient = useApiClient();
    await apiClient("/test", { method: "GET" });

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockClient).toHaveBeenCalledWith(
      "/test",
      expect.not.objectContaining({
        headers: expect.objectContaining({ "X-Recaptcha-Token": expect.any(String) }),
      }),
    );
  });

  it("proceeds without token when $recaptcha.execute throws (graceful fallback)", async () => {
    mockExecute.mockRejectedValueOnce(new Error("reCAPTCHA blocked"));
    const apiClient = useApiClient();
    await apiClient("/test", { method: "POST" });

    // Call should still go through
    expect(mockClient).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({ method: "POST" }),
    );
    // No X-Recaptcha-Token header when token fetch fails
    const callArgs = mockClient.mock.calls[0][1] as { headers?: Record<string, string> };
    expect(callArgs.headers?.["X-Recaptcha-Token"]).toBeUndefined();
  });

  it("preserves caller-supplied headers alongside injected token", async () => {
    const apiClient = useApiClient();
    await apiClient("/test", {
      method: "POST",
      headers: { Authorization: "Bearer my-token" },
    });

    expect(mockClient).toHaveBeenCalledWith(
      "/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-token",
          "X-Recaptcha-Token": "fake-recaptcha-token",
        }),
      }),
    );
  });
});
