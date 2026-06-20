import { describe, expect, it } from "vitest";
import { getCategoryHue } from "../../app/utils/categoryHue";

describe("getCategoryHue", () => {
  it("maps 'Guía de compra' to hue 62", () => {
    const hue = getCategoryHue("Guía de compra");
    expect(hue.washBg).toBe("oklch(0.955 0.035 62)");
    expect(hue.onColor).toBe("oklch(0.50 0.13 62)");
    expect(hue.baseColor).toBe("oklch(0.66 0.16 62)");
  });

  it("maps 'Seguridad' to hue 352", () => {
    const hue = getCategoryHue("Seguridad");
    expect(hue.washBg).toBe("oklch(0.955 0.035 352)");
    expect(hue.onColor).toBe("oklch(0.50 0.13 352)");
    expect(hue.baseColor).toBe("oklch(0.66 0.16 352)");
  });

  it("maps every locked design name to a defined hue", () => {
    const names = [
      "Guía de compra",
      "Mercado",
      "Mantención",
      "Vender mejor",
      "Financiamiento",
      "Logística",
      "Seguridad",
    ];
    for (const name of names) {
      const hue = getCategoryHue(name);
      expect(hue.washBg).toMatch(/^oklch\(0\.955 0\.035 \d+\)$/);
      expect(hue.onColor).toMatch(/^oklch\(0\.50 0\.13 \d+\)$/);
      expect(hue.baseColor).toMatch(/^oklch\(0\.66 0\.16 \d+\)$/);
    }
  });

  it("falls back to default hue 38 for an unknown name", () => {
    const hue = getCategoryHue("Cualquiera");
    expect(hue.washBg).toBe("oklch(0.955 0.035 38)");
    expect(hue.onColor).toBe("oklch(0.50 0.13 38)");
    expect(hue.baseColor).toBe("oklch(0.66 0.16 38)");
  });

  it("falls back to default hue 38 for an empty string", () => {
    const hue = getCategoryHue("");
    expect(hue.baseColor).toBe("oklch(0.66 0.16 38)");
  });

  it("falls back to default hue 38 for null/undefined", () => {
    expect(getCategoryHue(null).baseColor).toBe("oklch(0.66 0.16 38)");
    expect(getCategoryHue(undefined).baseColor).toBe("oklch(0.66 0.16 38)");
  });
});
