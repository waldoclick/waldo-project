import { Context } from "koa";

/**
 * List of allowed MIME types for file uploads
 * Currently supports:
 * - PNG images (image/png)
 * - JPEG images (image/jpeg)
 * - WebP images (image/webp)
 */
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];

/**
 * Middleware to validate file uploads
 * Ensures that only allowed image types (PNG, JPG, WEBP) can be uploaded through the API
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
              `File type not allowed: ${f.mimetype}. Only PNG, JPG and WEBP images are allowed.`
            );
          }
        }
      } else {
        // Handle single file upload
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          ctx.throw(
            400,
            `File type not allowed: ${file.mimetype}. Only PNG, JPG and WEBP images are allowed.`
          );
        }
      }
    }

    return next();
  };
};
