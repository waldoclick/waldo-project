import { computeSortPriority } from "../ad";

describe("computeSortPriority", () => {
  describe("not featured: returns 2 regardless of pro_status", () => {
    it("returns 2 when ad_featured_reservation is null", () => {
      const result = computeSortPriority({
        ad_featured_reservation: null,
        user: { pro_status: "active" },
      });
      expect(result).toBe(2);
    });

    it("returns 2 when ad_featured_reservation is undefined", () => {
      const result = computeSortPriority({
        user: { pro_status: "active" },
      });
      expect(result).toBe(2);
    });

    it("returns 2 when ad_featured_reservation is a value without id", () => {
      const result = computeSortPriority({
        ad_featured_reservation: {},
        user: { pro_status: "active" },
      });
      expect(result).toBe(2);
    });
  });

  describe("featured + pro_status=active: returns 0 (highest priority)", () => {
    it("returns 0 when featured and user has pro_status=active", () => {
      const result = computeSortPriority({
        ad_featured_reservation: { id: 1 },
        user: { pro_status: "active" },
      });
      expect(result).toBe(0);
    });
  });

  describe("featured + pro_status inactive or missing: returns 1", () => {
    it("returns 1 when featured and user has pro_status=inactive", () => {
      const result = computeSortPriority({
        ad_featured_reservation: { id: 1 },
        user: { pro_status: "inactive" },
      });
      expect(result).toBe(1);
    });

    it("returns 1 when featured and user has no pro_status field", () => {
      const result = computeSortPriority({
        ad_featured_reservation: { id: 1 },
        user: {},
      });
      expect(result).toBe(1);
    });

    it("returns 1 when featured and user is null", () => {
      const result = computeSortPriority({
        ad_featured_reservation: { id: 1 },
        user: null,
      });
      expect(result).toBe(1);
    });

    it("returns 1 when featured and user is undefined", () => {
      const result = computeSortPriority({
        ad_featured_reservation: { id: 1 },
      });
      expect(result).toBe(1);
    });
  });
});
