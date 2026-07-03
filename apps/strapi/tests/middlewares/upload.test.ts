// upload.test.ts — magic-byte validation regression tests
// SEC2-LOCKDOWN: Tests 1-2 are RED until Task 2 adds fromFile magic-byte check.
// Tests 3-7 are the existing MIME allowlist tests that remain green.

import type { Context } from "koa";

// file-type@16.5.4 exports fromFile (not fileTypeFromFile which is v17+ naming)
jest.mock("file-type", () => ({
  fromFile: jest.fn(),
}));

import fileType from "file-type";
const mockFromFile = (fileType as unknown as { fromFile: jest.Mock }).fromFile;

import uploadMiddleware from "../../src/middlewares/upload";

function createContext(
  files: Record<string, unknown> | null,
  path = "/api/upload",
) {
  const ctx = {
    path,
    request: { files },
    throw: jest.fn((status: number, message: string) => {
      const err = new Error(message) as Error & { status: number };
      err.status = status;
      throw err;
    }),
  };
  return ctx;
}

describe("upload middleware — magic-byte validation (SEC2-LOCKDOWN)", () => {
  let middleware: (ctx: Context, next: () => Promise<void>) => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = uploadMiddleware();
  });

  // Test 1 (RED — magic mismatch): declared mimetype is image/png but actual bytes are PDF
  // This test MUST FAIL against current code (no magic-byte check) and PASS after Task 2.
  it("Test 1: rejects file when magic bytes do not match declared MIME (png declared, pdf detected)", async () => {
    // Arrange
    mockFromFile.mockResolvedValue({ mime: "application/pdf", ext: "pdf" });
    const ctx = createContext({
      file: {
        mimetype: "image/png",
        filepath: "/tmp/fake-upload-001",
        size: 1024,
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    // Act + Assert: expect ctx.throw to be called with 400
    await expect(middleware(ctx as unknown as Context, next)).rejects.toThrow();
    expect(ctx.throw).toHaveBeenCalledWith(
      400,
      expect.stringContaining("image/png"),
    );
    expect(next).not.toHaveBeenCalled();
  });

  // Test 2 (RED — magic match): declared mimetype matches actual bytes → passes
  // This test MUST FAIL against current code (mockFromFile never called) and PASS after Task 2.
  it("Test 2: passes file when magic bytes match declared MIME (png declared, png detected)", async () => {
    // Arrange
    mockFromFile.mockResolvedValue({ mime: "image/png", ext: "png" });
    const ctx = createContext({
      file: {
        mimetype: "image/png",
        filepath: "/tmp/fake-upload-002",
        size: 1024,
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    // Act
    await middleware(ctx as unknown as Context, next);

    // Assert: middleware calls next (file passes) and fromFile was called
    expect(next).toHaveBeenCalled();
    expect(mockFromFile).toHaveBeenCalledWith("/tmp/fake-upload-002");
  });

  // Test 3 (existing green): rejects disallowed MIME type (image/gif)
  it("Test 3: rejects file with disallowed MIME type (image/gif)", async () => {
    // Arrange: no fromFile call expected since allowlist check comes first
    const ctx = createContext({
      file: {
        mimetype: "image/gif",
        filepath: "/tmp/fake-upload-003",
        size: 512,
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    // Act + Assert
    await expect(middleware(ctx as unknown as Context, next)).rejects.toThrow();
    expect(ctx.throw).toHaveBeenCalledWith(
      400,
      expect.stringContaining("image/gif"),
    );
  });

  // Test 4 (existing green): passes when no files present
  it("Test 4: skips validation when no files are present", async () => {
    // Arrange
    const ctx = createContext({});
    const next = jest.fn().mockResolvedValue(undefined);

    // Act
    await middleware(ctx as unknown as Context, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(ctx.throw).not.toHaveBeenCalled();
  });

  // Test 5 (existing green): skips validation on non-API paths
  it("Test 5: skips validation on non-API paths", async () => {
    // Arrange
    const ctx = createContext(
      {
        file: {
          mimetype: "image/gif",
          filepath: "/tmp/fake-upload-005",
          size: 512,
        },
      },
      "/admin/upload",
    );
    const next = jest.fn().mockResolvedValue(undefined);

    // Act
    await middleware(ctx as unknown as Context, next);

    // Assert: no throw on non-API path
    expect(next).toHaveBeenCalled();
    expect(ctx.throw).not.toHaveBeenCalled();
  });

  // Test 6: array of files — rejects if any file has magic-byte mismatch
  it("Test 6: rejects array upload when one file has magic-byte mismatch", async () => {
    // Arrange
    mockFromFile
      .mockResolvedValueOnce({ mime: "image/png", ext: "png" }) // first passes
      .mockResolvedValueOnce({ mime: "application/pdf", ext: "pdf" }); // second fails
    const ctx = createContext({
      files: [
        {
          mimetype: "image/png",
          filepath: "/tmp/fake-upload-006a",
          size: 1024,
        },
        {
          mimetype: "image/png",
          filepath: "/tmp/fake-upload-006b",
          size: 1024,
        },
      ],
    });
    const next = jest.fn().mockResolvedValue(undefined);

    // Act + Assert
    await expect(middleware(ctx as unknown as Context, next)).rejects.toThrow();
    expect(ctx.throw).toHaveBeenCalledWith(
      400,
      expect.stringContaining("image/png"),
    );
  });

  // Test 7: array of files — passes when all files have matching magic bytes
  it("Test 7: passes array upload when all files have matching magic bytes", async () => {
    // Arrange
    mockFromFile
      .mockResolvedValueOnce({ mime: "image/jpeg", ext: "jpg" })
      .mockResolvedValueOnce({ mime: "image/webp", ext: "webp" });
    const ctx = createContext({
      files: [
        {
          mimetype: "image/jpeg",
          filepath: "/tmp/fake-upload-007a",
          size: 2048,
        },
        {
          mimetype: "image/webp",
          filepath: "/tmp/fake-upload-007b",
          size: 2048,
        },
      ],
    });
    const next = jest.fn().mockResolvedValue(undefined);

    // Act
    await middleware(ctx as unknown as Context, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(ctx.throw).not.toHaveBeenCalled();
  });

  // Test 8: passes AVIF file when magic bytes match declared MIME
  it("Test 8: passes file when magic bytes match declared MIME (avif declared, avif detected)", async () => {
    // Arrange
    mockFromFile.mockResolvedValue({ mime: "image/avif", ext: "avif" });
    const ctx = createContext({
      file: {
        mimetype: "image/avif",
        filepath: "/tmp/fake-upload-008",
        size: 1024,
      },
    });
    const next = jest.fn().mockResolvedValue(undefined);

    // Act
    await middleware(ctx as unknown as Context, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(ctx.throw).not.toHaveBeenCalled();
  });
});
