import { describe, expect, it } from "vitest";
import { convertCurrency, formatCurrency } from "../../app/utils/price";
import type { Indicator } from "../../app/types/indicator";

const indicators: Indicator[] = [
  { code: "dolar", name: "Dólar", unit: "Pesos", value: 950 },
  { code: "euro", name: "Euro", unit: "Pesos", value: 1030 },
];

describe("convertCurrency", () => {
  it("returns the same amount when from and to currencies match", () => {
    expect(convertCurrency(1000, "CLP", "CLP", indicators)).toBe(1000);
    expect(convertCurrency(10, "USD", "USD", indicators)).toBe(10);
  });

  it("converts CLP to USD using the dolar rate", () => {
    expect(convertCurrency(9500, "CLP", "USD", indicators)).toBeCloseTo(10);
  });

  it("converts USD to CLP using the dolar rate", () => {
    expect(convertCurrency(10, "USD", "CLP", indicators)).toBe(9500);
  });

  it("converts CLP to EUR using the euro rate", () => {
    expect(convertCurrency(10300, "CLP", "EUR", indicators)).toBeCloseTo(10);
  });

  it("converts EUR to CLP using the euro rate", () => {
    expect(convertCurrency(10, "EUR", "CLP", indicators)).toBe(10300);
  });

  it("converts USD to EUR by routing through CLP", () => {
    // 10 USD -> 9500 CLP -> 9500/1030 EUR
    expect(convertCurrency(10, "USD", "EUR", indicators)).toBeCloseTo(
      9500 / 1030,
    );
  });

  it("returns null when converting from USD without a dolar indicator", () => {
    expect(convertCurrency(10, "USD", "CLP", [])).toBeNull();
  });

  it("returns null when converting from EUR without a euro indicator", () => {
    expect(convertCurrency(10, "EUR", "CLP", [])).toBeNull();
  });

  it("returns null when converting to USD without a dolar indicator", () => {
    const euroOnly = indicators.filter((i) => i.code !== "dolar");
    expect(convertCurrency(1000, "CLP", "USD", euroOnly)).toBeNull();
  });

  it("returns null when converting to EUR without a euro indicator", () => {
    const dolarOnly = indicators.filter((i) => i.code !== "euro");
    expect(convertCurrency(1000, "CLP", "EUR", dolarOnly)).toBeNull();
  });
});

describe("formatCurrency", () => {
  it("returns '--' for null or undefined", () => {
    expect(formatCurrency(null)).toBe("--");
    expect(formatCurrency()).toBe("--");
  });

  it("returns '--' for a non-numeric string", () => {
    expect(formatCurrency("not-a-number")).toBe("--");
  });

  it("formats a numeric amount as CLP by default", () => {
    expect(formatCurrency(1000)).toContain("1.000");
  });

  it("formats a numeric string amount", () => {
    expect(formatCurrency("1000")).toContain("1.000");
  });
});
