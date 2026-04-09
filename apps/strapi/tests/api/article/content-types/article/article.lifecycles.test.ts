/**
 * Unit tests for Article lifecycle hooks.
 * Verifies slug generation from title on beforeCreate and beforeUpdate.
 *
 * Requirements covered: BLOG-01
 */

import lifecycles from "../../../../../src/api/article/content-types/article/lifecycles";
import type { Event } from "@strapi/database/dist/lifecycles";

// Mock the global strapi object used by beforeUpdate
const mockFindOne = jest.fn();
Object.assign(global, {
  strapi: {
    db: {
      query: jest.fn().mockImplementation((uid: string) => {
        if (uid === "api::article.article") {
          return { findOne: mockFindOne };
        }
        return {};
      }),
    },
  },
});

describe("Article lifecycles", () => {
  describe("beforeCreate", () => {
    it("generates slug from title", async () => {
      // Arrange
      const event = { params: { data: { title: "Hello World" } } };

      // Act
      await lifecycles.beforeCreate(event as unknown as Event);

      // Assert
      expect(event.params.data).toHaveProperty("slug", "hello-world");
    });

    it("slugifies special characters and accents", async () => {
      // Arrange
      const event = { params: { data: { title: "¡Artículo Español!" } } };

      // Act
      await lifecycles.beforeCreate(event as unknown as Event);

      // Assert
      expect(event.params.data).toHaveProperty("slug", "articulo-espanol");
    });

    it("does not set slug when title is absent", async () => {
      // Arrange
      const event = { params: { data: { header: "some header" } } };

      // Act
      await lifecycles.beforeCreate(event as unknown as Event);

      // Assert
      expect(
        (event.params.data as Record<string, unknown>).slug
      ).toBeUndefined();
    });
  });

  describe("beforeUpdate", () => {
    beforeEach(() => {
      mockFindOne.mockReset();
    });

    it("regenerates slug when title changes", async () => {
      // Arrange
      mockFindOne.mockResolvedValue({ title: "Old Title" });
      const event = {
        params: {
          data: { title: "New Title" },
          where: { id: 1 },
        },
      };

      // Act
      await lifecycles.beforeUpdate(event as unknown as Event);

      // Assert
      expect(event.params.data).toHaveProperty("slug", "new-title");
    });

    it("does not regenerate slug when title is unchanged", async () => {
      // Arrange
      mockFindOne.mockResolvedValue({ title: "Same Title" });
      const event = {
        params: {
          data: { title: "Same Title" },
          where: { id: 1 },
        },
      };

      // Act
      await lifecycles.beforeUpdate(event as unknown as Event);

      // Assert
      expect(
        (event.params.data as Record<string, unknown>).slug
      ).toBeUndefined();
    });

    it("does not touch slug when no title in update data", async () => {
      // Arrange
      const event = {
        params: {
          data: { header: "updated header" },
          where: { id: 1 },
        },
      };

      // Act
      await lifecycles.beforeUpdate(event as unknown as Event);

      // Assert
      expect(mockFindOne).not.toHaveBeenCalled();
      expect(
        (event.params.data as Record<string, unknown>).slug
      ).toBeUndefined();
    });
  });
});
