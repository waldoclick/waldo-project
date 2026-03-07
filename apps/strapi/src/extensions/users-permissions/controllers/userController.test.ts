// Tests for getUserDataWithFilters — FILTER-01, FILTER-02, FILTER-03
// AAA pattern (Arrange-Act-Assert), all dependencies mocked.

import { getUserDataWithFilters } from "./userController";

// Mock strapi global
const mockFindOne = jest.fn();
const mockFindWithCount = jest.fn();

const strapiQueryMock = (contentType: string) => {
  if (contentType === "plugin::users-permissions.role") {
    return { findOne: mockFindOne };
  }
  if (contentType === "plugin::users-permissions.user") {
    return { findWithCount: mockFindWithCount };
  }
  return {};
};

(global as unknown as Record<string, unknown>).strapi = {
  db: {
    query: strapiQueryMock,
  },
};

const mockUsers = [
  { id: 1, username: "alice", email: "alice@example.com", role: { id: 42 } },
  { id: 2, username: "bob", email: "bob@example.com", role: { id: 42 } },
];
const mockTotal = 2;

describe("getUserDataWithFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindOne.mockResolvedValue({ id: 42, type: "authenticated" });
    mockFindWithCount.mockResolvedValue([mockUsers, mockTotal]);
  });

  describe("FILTER-01: Returns only Authenticated users", () => {
    it("calls findWithCount with role: { id: authenticatedRole.id } in where clause", async () => {
      // Arrange
      const ctx = {
        query: { pagination: {}, filters: {} },
        body: null,
      };

      // Act
      await getUserDataWithFilters(
        ctx as unknown as Parameters<typeof getUserDataWithFilters>[0]
      );

      // Assert: role filter enforced server-side
      expect(mockFindWithCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: { id: 42 } }),
        })
      );

      // Assert: ctx.body.data is the array of plain users (no getDetailedUserData enrichment)
      expect(ctx.body).not.toBeNull();
      const body01 = ctx.body as unknown as { data: Record<string, unknown>[] };
      expect(body01.data).toHaveLength(2);
      // No publishedAdsCount — getDetailedUserData was NOT called
      expect(body01.data[0]).not.toHaveProperty("publishedAdsCount");
    });
  });

  describe("FILTER-02: Respects pagination params", () => {
    it("calls findWithCount with correct offset and limit, and returns correct meta", async () => {
      // Arrange
      const ctx = {
        query: { pagination: { page: "2", pageSize: "10" }, filters: {} },
        body: null,
      };

      // Act
      await getUserDataWithFilters(
        ctx as unknown as Parameters<typeof getUserDataWithFilters>[0]
      );

      // Assert: offset = (2-1)*10 = 10, limit = 10
      expect(mockFindWithCount).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 10,
          limit: 10,
        })
      );

      // Assert: meta.pagination reflects correct values
      const body = ctx.body as unknown as {
        meta: {
          pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
          };
        };
      };
      expect(body.meta.pagination).toEqual({
        page: 2,
        pageSize: 10,
        pageCount: Math.ceil(mockTotal / 10),
        total: mockTotal,
      });
    });
  });

  describe("FILTER-03: Forwards sort and client filters", () => {
    it("calls findWithCount with orderBy from sort and merges client filters with role filter", async () => {
      // Arrange
      const ctx = {
        query: {
          sort: "createdAt:asc",
          filters: { username: { $containsi: "alice" } },
          pagination: {},
        },
        body: null,
      };

      // Act
      await getUserDataWithFilters(
        ctx as unknown as Parameters<typeof getUserDataWithFilters>[0]
      );

      // Assert: sort parsed into { field: direction } object for strapi.db.query
      expect(mockFindWithCount).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "asc" },
        })
      );

      // Assert: client filter merged with role filter in where
      expect(mockFindWithCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            username: { $containsi: "alice" },
            role: { id: 42 },
          }),
        })
      );
    });
  });
});
