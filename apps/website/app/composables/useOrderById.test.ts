import { vi, describe, it, expect } from "vitest";
import { useOrderById } from "./useOrderById";

// Mock the global useStrapi composable
vi.mock("@nuxtjs/strapi", () => ({
  useStrapi: () => ({
    findOne: vi.fn(async (type: string, id: string) => {
      if (id === "VALID_ID") {
        return {
          data: {
            id: "order1",
            documentId: "VALID_ID",
            amount: 5000,
            status: "paid",
          },
        };
      } else if (id === "NO_ORDER") {
        return { data: null };
      } else {
        throw new Error("Not found");
      }
    }),
  }),
}));

describe("useOrderById", () => {
  it("fetches order by valid documentId", async () => {
    const order = await useOrderById("VALID_ID");
    expect(order).toMatchObject({
      documentId: "VALID_ID",
      amount: 5000,
      status: "paid",
    });
  });

  it("throws error if order not found", async () => {
    await expect(useOrderById("NO_ORDER")).rejects.toThrow("Order not found");
  });

  it("throws error if documentId missing", async () => {
    await expect(useOrderById("")).rejects.toThrow("Missing documentId");
  });
});
