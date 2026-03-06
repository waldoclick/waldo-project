import { describe, it, expect } from "vitest";
import { formatCurrency } from "../../app/utils/price";

describe("formatCurrency", () => {
  it("formats a number as CLP currency", () => {
    expect(formatCurrency(1000)).toBe("$1.000");
    expect(formatCurrency(1500000)).toBe("$1.500.000");
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats a string number as CLP currency", () => {
    expect(formatCurrency("1000")).toBe("$1.000");
    expect(formatCurrency("1500000")).toBe("$1.500.000");
    expect(formatCurrency("0")).toBe("$0");
  });

  it("handles null and undefined", () => {
    expect(formatCurrency(null)).toBe("--");
    expect(formatCurrency()).toBe("--");
  });

  it("handles invalid number strings", () => {
    expect(formatCurrency("invalid")).toBe("--");
  });

  it("accepts options", () => {
    expect(
      formatCurrency(1000, {
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ).toBe("US$1.000,00"); // es-CL locale uses comma for decimals
  });
});
