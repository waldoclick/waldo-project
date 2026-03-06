import { describe, it, expect } from "vitest";
import { formatDate, formatDateShort } from "../../app/utils/date";

describe("date utils", () => {
  describe("formatDate", () => {
    it('returns "--" for undefined', () => {
      expect(formatDate()).toBe("--");
    });

    it('returns "--" for empty string', () => {
      expect(formatDate("")).toBe("--");
    });

    it('returns "--" for invalid date', () => {
      expect(formatDate("invalid-date")).toBe("--");
    });

    it("formats seconds ago", () => {
      const now = new Date();
      const secondsAgo = new Date(now.getTime() - 10 * 1000); // 10 seconds ago
      expect(formatDate(secondsAgo.toISOString())).toMatch(/hace 10 segundos/);
    });

    it("formats minutes ago", () => {
      const now = new Date();
      const minutesAgo = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago
      expect(formatDate(minutesAgo.toISOString())).toMatch(/hace 10 minutos/);
    });

    it("formats hours ago", () => {
      const now = new Date();
      const hoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
      expect(formatDate(hoursAgo.toISOString())).toMatch(/hace 5 horas/);
    });

    it("formats days ago", () => {
      const now = new Date();
      const daysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      expect(formatDate(daysAgo.toISOString())).toMatch(/hace 5 días/);
    });

    it("formats months ago", () => {
      const now = new Date();
      // 65 days ago is > 2 months
      const monthsAgo = new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000);
      expect(formatDate(monthsAgo.toISOString())).toMatch(/hace 2 meses/);
    });

    it("formats years ago", () => {
      const now = new Date();
      // 400 days ago is approx 1 year
      const yearsAgo = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000);
      expect(formatDate(yearsAgo.toISOString())).toMatch(/hace 1 año/);
    });
  });

  describe("formatDateShort", () => {
    it('returns "--" for undefined', () => {
      expect(formatDateShort()).toBe("--");
    });

    it('returns "--" for invalid date', () => {
      expect(formatDateShort("invalid")).toBe("--");
    });

    it("formats valid date correctly", () => {
      // 2026-03-05
      const date = new Date("2026-03-05T12:00:00Z");
      const formatted = formatDateShort(date.toISOString());
      // Expecting something like "5 mar 2026"
      // Note: We use regex because day might be "05" or "5" depending on implementation/locale data
      expect(formatted).toMatch(/5 mar 2026/);
    });
  });
});
