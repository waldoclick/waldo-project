/**
 * Tests for the contact-mask helpers and their integration into
 * sanitizeAdForPublic (08-04).
 *
 * AAA pattern. The mask helpers are pure (no strapi stub needed).
 * sanitizeAdForPublic is also pure over its input — it requires no strapi global.
 */

import {
  maskEmail,
  maskPhone,
  revealUserChannel,
} from "../../../src/api/ad/services/contact-mask";
import { sanitizeAdForPublic } from "../../../src/api/ad/services/sanitize-ad";

describe("maskEmail", () => {
  it("keeps the first local char, the first domain label is bulleted, and the TLD is preserved", () => {
    // Arrange
    const input = "gabriel@waldo.cl";

    // Act
    const result = maskEmail(input);

    // Assert
    expect(result).toBe("g••••••@•••••.cl");
    expect(result).not.toContain("gabriel");
    expect(result).not.toContain("waldo");
  });

  it("returns an empty string for null/undefined/empty input (null-safe)", () => {
    // Arrange / Act / Assert
    expect(maskEmail(null)).toBe("");
    expect(maskEmail(undefined)).toBe("");
    expect(maskEmail("")).toBe("");
  });

  it("returns an empty string for malformed input without an @ or TLD", () => {
    // Arrange / Act / Assert
    expect(maskEmail("notanemail")).toBe("");
    expect(maskEmail("a@b")).toBe("");
  });
});

describe("maskPhone", () => {
  it("keeps the +CC head and last 2 digits, bulleting the middle", () => {
    // Arrange
    const input = "+56 9 1234 5678";

    // Act
    const result = maskPhone(input);

    // Assert
    expect(result).toBe("+56 9 •••• ••78");
    expect(result).not.toContain("1234");
    expect(result).not.toContain("5678");
  });

  it("returns an empty string for null/undefined/empty input (null-safe)", () => {
    // Arrange / Act / Assert
    expect(maskPhone(null)).toBe("");
    expect(maskPhone(undefined)).toBe("");
    expect(maskPhone("")).toBe("");
  });
});

describe("revealUserChannel", () => {
  it("returns the raw value for the requested channel", () => {
    // Arrange
    const user = {
      phone: "+56 9 1234 5678",
      whatsapp: "+56 9 8765 4321",
      email: "gabriel@waldo.cl",
    };

    // Act / Assert
    expect(revealUserChannel(user, "phone")).toBe("+56 9 1234 5678");
    expect(revealUserChannel(user, "whatsapp")).toBe("+56 9 8765 4321");
    expect(revealUserChannel(user, "email")).toBe("gabriel@waldo.cl");
  });

  it("returns null when the channel is absent or empty", () => {
    // Arrange
    const user = { phone: "", email: "gabriel@waldo.cl" };

    // Act / Assert
    expect(revealUserChannel(user, "phone")).toBeNull();
    expect(revealUserChannel(user, "whatsapp")).toBeNull();
  });
});

describe("sanitizeAdForPublic — seller contact obfuscation (08-04)", () => {
  it("emits masked email/phone/whatsapp plus presence flags and removes raw values", () => {
    // Arrange
    const ad = {
      id: 1,
      documentId: "abc",
      name: "Test ad",
      user: {
        id: 7,
        documentId: "user-7",
        username: "gabo",
        firstname: "Gabriel",
        lastname: "Burgos",
        email: "gabriel@waldo.cl",
        phone: "+56 9 1234 5678",
        whatsapp: "+56 9 8765 4321",
        pro_status: "active",
        is_company: false,
        business_name: null,
        createdAt: "2024-01-01",
      },
    };

    // Act
    const result = sanitizeAdForPublic(ad);
    const safeUser = result.user as Record<string, unknown>;

    // Assert — masked values present
    expect(safeUser.email).toBe("g••••••@•••••.cl");
    expect(safeUser.phone).toBe("+56 9 •••• ••78");
    expect(safeUser.whatsapp).toBe("+56 9 •••• ••21");

    // Assert — presence flags
    expect(safeUser.has_email).toBe(true);
    expect(safeUser.has_phone).toBe(true);
    expect(safeUser.has_whatsapp).toBe(true);

    // Assert — raw values never travel
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("gabriel@waldo.cl");
    expect(serialized).not.toContain("1234 5678");
    expect(serialized).not.toContain("8765 4321");
  });

  it("sets presence flags to false and masks to empty when channels are absent", () => {
    // Arrange
    const ad = {
      id: 2,
      documentId: "def",
      name: "No contact",
      user: {
        id: 8,
        documentId: "user-8",
        username: "anon",
        firstname: "Ana",
        lastname: "Nim",
        email: null,
        phone: null,
        whatsapp: null,
        pro_status: null,
        is_company: false,
        business_name: null,
        createdAt: "2024-01-01",
      },
    };

    // Act
    const result = sanitizeAdForPublic(ad);
    const safeUser = result.user as Record<string, unknown>;

    // Assert
    expect(safeUser.email).toBe("");
    expect(safeUser.phone).toBe("");
    expect(safeUser.whatsapp).toBe("");
    expect(safeUser.has_email).toBe(false);
    expect(safeUser.has_phone).toBe(false);
    expect(safeUser.has_whatsapp).toBe(false);
  });
});
