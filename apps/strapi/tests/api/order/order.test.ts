/**
 * Regression tests for order IDOR + user-scoping — SEC2-AUTHZ
 *
 * Tests 1-3: findOne must enforce ownership (non-managers cannot read other users' orders)
 * Test 4: find must scope results to the calling user (non-managers cannot widen scope)
 *
 * RED phase: these tests fail against the current production code before the fix.
 */

// ─── Capture the controller extension via factories mock ─────────────────────
let capturedExtension: Record<string, (..._args: unknown[]) => unknown> = {};

jest.mock("@strapi/strapi", () => ({
  factories: {
    createCoreController: jest.fn(
      (_uid: string, fn: (_deps: unknown) => unknown) => {
        capturedExtension = fn({
          strapi: (global as unknown as { strapi: object }).strapi,
        }) as Record<string, (..._args: unknown[]) => unknown>;
        return capturedExtension;
      },
    ),
  },
}));

// ─── Mock strapi global ───────────────────────────────────────────────────────
const mockFindOne = jest.fn();
const mockFindMany = jest.fn();
const mockCount = jest.fn().mockResolvedValue(0);

(global as unknown as { strapi: object }).strapi = {
  db: {
    query: jest.fn().mockReturnValue({
      findOne: mockFindOne,
      findMany: mockFindMany,
      count: mockCount,
    }),
  },
  documents: jest.fn().mockReturnValue({
    findOne: mockFindOne,
  }),
  log: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
};

// ─── Import controller (triggers jest.mock side effects) ─────────────────────
import "../../../src/api/order/controllers/order";

// ─── Build mock Koa context ───────────────────────────────────────────────────
function makeCtx(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    params: {},
    query: {},
    state: { user: { id: 7, role: { name: "user" } } },
    forbidden: jest.fn(),
    unauthorized: jest.fn(),
    badRequest: jest.fn(),
    notFound: jest.fn(),
    send: jest.fn(),
    throw: jest.fn(),
    body: undefined,
    status: undefined,
    ...overrides,
  };
}

// ─── findOne tests ────────────────────────────────────────────────────────────
describe("order.findOne — ownership enforcement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Test 1 (findOne IDOR): returns 403 when non-manager requests another user's order", async () => {
    // Arrange: order belongs to user 99, caller is user 7
    const order = {
      id: 1,
      documentId: "abc123",
      user: { id: 99 },
      ad: null,
    };
    mockFindOne.mockResolvedValueOnce(order);

    const ctx = makeCtx({
      params: { id: "1" },
      state: { user: { id: 7, role: { name: "user" } } },
    });

    // Act
    await capturedExtension.findOne(ctx);

    // Assert: forbidden must be called (IDOR blocked)
    expect(ctx.forbidden).toHaveBeenCalled();
    expect(ctx.send).not.toHaveBeenCalled();
  });

  it("Test 2 (findOne owner): allows owner to read their own order", async () => {
    // Arrange: order belongs to user 7, caller is user 7
    const order = {
      id: 1,
      documentId: "abc123",
      user: { id: 7 },
      ad: null,
    };
    mockFindOne.mockResolvedValueOnce(order);

    const ctx = makeCtx({
      params: { id: "1" },
      state: { user: { id: 7, role: { name: "user" } } },
    });

    // Act
    await capturedExtension.findOne(ctx);

    // Assert: forbidden NOT called, order is returned
    expect(ctx.forbidden).not.toHaveBeenCalled();
    expect(ctx.send).toHaveBeenCalledWith({ data: order });
  });

  it("Test 3 (findOne manager bypass): manager can read any order", async () => {
    // Arrange: order belongs to user 99, caller is manager
    const order = {
      id: 1,
      documentId: "abc123",
      user: { id: 99 },
      ad: null,
    };
    mockFindOne.mockResolvedValueOnce(order);

    const ctx = makeCtx({
      params: { id: "1" },
      state: { user: { id: 1, role: { name: "manager" } } },
    });

    // Act
    await capturedExtension.findOne(ctx);

    // Assert: forbidden NOT called, order is returned
    expect(ctx.forbidden).not.toHaveBeenCalled();
    expect(ctx.send).toHaveBeenCalledWith({ data: order });
  });
});

// ─── find tests ──────────────────────────────────────────────────────────────
describe("order.find — user scoping", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);
  });

  it("Test 4 (find scoping): non-manager cannot widen scope via client-supplied filters", async () => {
    // Arrange: attacker sets filters.user.id = 99 to see other user's orders
    // caller is user 7
    const ctx = makeCtx({
      query: {
        filters: { user: { id: 99 } }, // attacker filter
        pagination: { page: "1", pageSize: "25" },
      },
      state: { user: { id: 7, role: { name: "user" } } },
    });

    // Act
    await capturedExtension.find(ctx);

    // Assert: findMany was called with where scoped to user 7 only (not 99)
    expect(mockFindMany).toHaveBeenCalled();
    const callArgs = mockFindMany.mock.calls[0][0] as { where: unknown };
    const where = callArgs.where as Record<string, unknown>;

    // The where clause must scope to user 7
    expect(where).toMatchObject({ user: { id: 7 } });

    // The where clause must NOT contain reference to user 99
    const whereStr = JSON.stringify(where);
    expect(whereStr).not.toContain('"id":99');
    expect(whereStr).not.toContain('"id": 99');
  });

  it("Test 5 (find manager pass-through): manager receives unfiltered results", async () => {
    // Arrange: manager queries with explicit filters
    const ctx = makeCtx({
      query: {
        filters: { payment_method: "webpay" },
        pagination: { page: "1", pageSize: "25" },
      },
      state: { user: { id: 1, role: { name: "manager" } } },
    });

    // Act
    await capturedExtension.find(ctx);

    // Assert: findMany where clause uses manager filters, NOT scoped to user id
    expect(mockFindMany).toHaveBeenCalled();
    const callArgs = mockFindMany.mock.calls[0][0] as { where: unknown };
    const where = callArgs.where as Record<string, unknown>;

    // Manager where clause should NOT be scoped to a single user id
    const whereStr = JSON.stringify(where);
    expect(whereStr).not.toContain('"user":{"id":1}');
  });
});
