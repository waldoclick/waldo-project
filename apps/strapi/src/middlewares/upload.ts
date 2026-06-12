import { Context } from "koa";
import { fromFile } from "file-type";

/**
 * List of allowed MIME types for file uploads
 * Currently supports:
 * - PNG images (image/png)
 * - JPEG images (image/jpeg)
 * - WebP images (image/webp)
 */
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

/**
 * Validates file magic bytes against the declared MIME type.
 * Uses file-type@16.5.4 (last CJS-compatible version) to read actual file bytes.
 * Returns false if detection fails (unrecognized format → reject to be safe).
 */
async function validateMagicBytes(
  filePath: string,
  declaredMime: string,
): Promise<boolean> {
  const result = await fromFile(filePath);
  if (!result) return false; // undetectable → reject
  return result.mime === declaredMime;
}

/**
 * Middleware to validate file uploads
 * Ensures that only allowed image types (PNG, JPG, WEBP) can be uploaded through the API.
 * Also validates that file magic bytes match the declared MIME type (prevents content-type spoofing).
 *
 * @returns {Function} Koa middleware function
 */
export default () => {
  return async (ctx: Context, next: () => Promise<void>) => {
    // Solo aplicar restricciones a rutas de la API
    if (!ctx.path.startsWith("/api/")) {
      return next();
    }

    // Skip validation if no files are present in the request
    if (!ctx.request.files || Object.keys(ctx.request.files).length === 0) {
      return next();
    }

    // Validate each file in the request
    for (const file of Object.values(ctx.request.files)) {
      // Handle multiple file uploads
      if (Array.isArray(file)) {
        for (const f of file) {
          if (!ALLOWED_MIME_TYPES.includes(f.mimetype)) {
            ctx.throw(
              400,
              `File type not allowed: ${f.mimetype}. Only PNG, JPG and WEBP images are allowed.`,
            );
          }
          const isValid = await validateMagicBytes(f.filepath, f.mimetype);
          if (!isValid) {
            ctx.throw(
              400,
              `File content does not match declared type: ${f.mimetype}`,
            );
          }
        }
      } else {
        // Handle single file upload
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          ctx.throw(
            400,
            `File type not allowed: ${file.mimetype}. Only PNG, JPG and WEBP images are allowed.`,
          );
        }
        const isValid = await validateMagicBytes(file.filepath, file.mimetype);
        if (!isValid) {
          ctx.throw(
            400,
            `File content does not match declared type: ${file.mimetype}`,
          );
        }
      }
    }

    return next();
  };
};
