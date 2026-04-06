import { vi, describe, it, expect, beforeEach } from "vitest";

// Use vi.hoisted so mock variables are available when vi.mock() factory runs
const { mockClient } = vi.hoisted(() => ({
  mockClient: vi.fn(),
}));

// useOrderById.ts uses useApiClient() as a Nuxt auto-import (no explicit import)
// Vitest resolves auto-imports via the #imports virtual module
vi.mock("#imports", () => ({
  useApiClient: () => mockClient,
}));

// Import after mock is registered
const { useOrderById } = await import("@/composables/useOrderById");

describe("useOrderById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches order by valid documentId via payments/thankyou endpoint", async () => {
    mockClient.mockResolvedValueOnce({
      data: {
        id: "order1",
        documentId: "VALID_ID",
        amount: 5000,
        status: "paid",
      },
    });

    const order = await useOrderById("VALID_ID");
    expect(order).toMatchObject({
      documentId: "VALID_ID",
      amount: 5000,
      status: "paid",
    });
    expect(mockClient).toHaveBeenCalledWith("payments/thankyou/VALID_ID", {
      method: "GET",
    });
  });

  it("throws error if order not found (null data)", async () => {
    mockClient.mockResolvedValueOnce({ data: null });
    await expect(useOrderById("NO_ORDER")).rejects.toThrow("Order not found");
  });

  it("throws error if documentId missing", async () => {
    await expect(useOrderById("")).rejects.toThrow("Missing documentId");
  });
});
