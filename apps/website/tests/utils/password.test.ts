import { describe, expect, it } from "vitest";
import {
  computePasswordStrength,
  generateSecurePassword,
} from "../../app/utils/password";

describe("computePasswordStrength", () => {
  it("returns score 0 and empty label for an empty string", () => {
    expect(computePasswordStrength("")).toEqual({ score: 0, label: "" });
  });

  it("returns score 1 (Muy débil) when only one basic criterion is met", () => {
    // 'abc': lowercase only — 1 criterion
    const result = computePasswordStrength("abc");
    expect(result.score).toBe(1);
    expect(result.label).toBe("Muy débil");
  });

  it("returns score 1 (Muy débil) for a non-empty string with no basic criteria", () => {
    // '!': special only — 0 basic criteria (no length, upper, lower, digit)
    const result = computePasswordStrength("!");
    expect(result.score).toBe(1);
    expect(result.label).toBe("Muy débil");
  });

  it("returns score 2 (Débil) when two basic criteria are met", () => {
    // 'abcABCD': lowercase + uppercase, no length≥8, no digit — 2 criteria
    const result = computePasswordStrength("abcABCD");
    expect(result.score).toBe(2);
    expect(result.label).toBe("Débil");
  });

  it("returns score 2 (Débil) when three basic criteria are met", () => {
    // 'Pass1': uppercase + lowercase + digit, no length≥8 — 3 criteria
    const result = computePasswordStrength("Pass1");
    expect(result.score).toBe(2);
    expect(result.label).toBe("Débil");
  });

  it("returns score 3 (Fuerte) when all four basic criteria are met", () => {
    // 'Password1': length≥8 + uppercase + lowercase + digit — 4 criteria, no special
    const result = computePasswordStrength("Password1");
    expect(result.score).toBe(3);
    expect(result.label).toBe("Fuerte");
  });

  it("returns score 4 (Muy fuerte) when all four basic criteria plus a special char are met", () => {
    // 'Password1!': all 4 basic + special
    const result = computePasswordStrength("Password1!");
    expect(result.score).toBe(4);
    expect(result.label).toBe("Muy fuerte");
  });
});

describe("generateSecurePassword", () => {
  const RUNS = 30;

  it("always generates a 16-character string", () => {
    for (let i = 0; i < RUNS; i++) {
      expect(generateSecurePassword()).toHaveLength(16);
    }
  });

  it("always contains at least one uppercase letter", () => {
    for (let i = 0; i < RUNS; i++) {
      expect(/[A-Z]/.test(generateSecurePassword())).toBe(true);
    }
  });

  it("always contains at least one lowercase letter", () => {
    for (let i = 0; i < RUNS; i++) {
      expect(/[a-z]/.test(generateSecurePassword())).toBe(true);
    }
  });

  it("always contains at least one digit", () => {
    for (let i = 0; i < RUNS; i++) {
      expect(/\d/.test(generateSecurePassword())).toBe(true);
    }
  });

  it("always contains at least one special character", () => {
    for (let i = 0; i < RUNS; i++) {
      expect(/[^\dA-Za-z]/.test(generateSecurePassword())).toBe(true);
    }
  });

  it("always passes all yup validation rules (length, upper, lower, digit)", () => {
    for (let i = 0; i < RUNS; i++) {
      const pwd = generateSecurePassword();
      expect(pwd.length).toBeGreaterThanOrEqual(8);
      expect(pwd.length).toBeLessThanOrEqual(50);
      expect(/[A-Z]/.test(pwd)).toBe(true);
      expect(/[a-z]/.test(pwd)).toBe(true);
      expect(/\d/.test(pwd)).toBe(true);
    }
  });

  it("always scores at the highest strength level (Muy fuerte)", () => {
    for (let i = 0; i < RUNS; i++) {
      const result = computePasswordStrength(generateSecurePassword());
      expect(result.score).toBe(4);
      expect(result.label).toBe("Muy fuerte");
    }
  });
});
