/**
 * Advertisement Controller
 *
 * This controller handles HTTP requests for advertisement-related operations.
 * It acts as a thin layer between the HTTP layer and the business logic service.
 *
 * @module AdvertisementController
 */

import { factories } from "@strapi/strapi";
import { Context } from "koa";
import jwt from "jsonwebtoken";
import { sanitizeAdForPublic } from "../services/sanitize-ad";

/** Returns true if ctx.state.user has the manager role. */
const ctxIsManager = (ctx: Context): boolean => {
  const user = ctx.state.user as Record<string, unknown>;
  const role = user?.role as Record<string, unknown> | undefined;
  return ((role?.name as string) ?? "").toLowerCase() === "manager";
};

/**
 * Advertisement Controller Factory
 *
 * Creates a core controller for the advertisement API that delegates business logic
 * to the advertisement service while handling HTTP-specific concerns like:
 * - Request parameter extraction
 * - Response formatting
 * - Error handling and HTTP status codes
 */
export default factories.createCoreController("api::ad.ad", ({ strapi }) => ({
  /**
   * Find single advertisement
   *
   * Overrides the default findOne to hide sensitive contact information
   * (phone and email) when the request is made by an unauthenticated user.
   *
   * @route GET /api/ads/:id
   */
  async findOne(ctx: Context) {
    // Delegate to the core controller to keep default behavior (sanitization, etc.)
    const response = await super.findOne(ctx);

    const isAuthenticated = !!ctx.state?.user;

    if (!isAuthenticated && response?.data) {
      // When unauthenticated, hide contact information from the public API
      response.data.phone = null;
      response.data.email = null;
    }

    return response;
  },
  /**
   * Update an advertisement
   *
   * Overrides the default update to verify ownership before allowing modifications.
   * Only the ad owner or a manager can update an ad.
   *
   * @route PUT /api/ads/:id
   */
  async update(ctx: Context) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized(
        "You must be authenticated to update an advertisement"
      );
    }

    const { id } = ctx.params;

    const ad = await strapi.db.query("api::ad.ad").findOne({
      where: { id },
      populate: ["user"],
    });

    if (!ad) {
      return ctx.notFound("Advertisement not found");
    }

    const isOwner = ad.user?.id?.toString() === userId.toString();
    if (!isOwner && !ctxIsManager(ctx)) {
      return ctx.forbidden(
        "You don't have permission to update this advertisement"
      );
    }

    return await super.update(ctx);
  },
  /**
   * Delete an advertisement
   *
   * Overrides the default delete to verify ownership before allowing deletion.
   * Only the ad owner or a manager can delete an ad.
   *
   * @route DELETE /api/ads/:id
   */
  async delete(ctx: Context) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized(
        "You must be authenticated to delete an advertisement"
      );
    }

    const id = Number(ctx.params.id);

    const ad = await strapi.db.query("api::ad.ad").findOne({
      where: { id },
      populate: ["user"],
    });

    if (!ad) {
      return ctx.notFound("Advertisement not found");
    }

    const isOwner = ad.user?.id?.toString() === userId.toString();
    if (!isOwner && !ctxIsManager(ctx)) {
      return ctx.forbidden(
        "You don't have permission to delete this advertisement"
      );
    }

    return await super.delete(ctx);
  },
  /**
   * Get active advertisements
   *
   * Retrieves a paginated list of active advertisements.
   * Delegates to the advertisement service for business logic.
   *
   * @route GET /api/ads/actives
   */
  async actives(ctx: Context) {
    try {
      const query = ctx.query as Record<string, unknown>;
      const pagination = query.pagination as Record<string, string> | undefined;

      // Extract pagination parameters from query.pagination
      const options: Record<string, unknown> = {
        ...query,
        page: pagination?.page
          ? parseInt(pagination.page, 10)
          : (query.page as number) || 1,
        pageSize: pagination?.pageSize
          ? parseInt(pagination.pageSize, 10)
          : (query.pageSize as number) || 25,
      };

      // Remove pagination object if it exists to avoid conflicts
      if (options.pagination) {
        delete options.pagination;
      }

      const userId = ctx.state.user?.id ?? null;
      const activeAds = await strapi
        .service("api::ad.ad")
        .activeAds(options, ctxIsManager(ctx), userId);
      return activeAds;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get all active advertisements (public catalog)
   *
   * Retrieves a paginated list of all active advertisements without authentication.
   * Bypasses user filtering by passing isManager=true and userId=null.
   *
   * @route GET /api/ads/catalog
   */
  async catalog(ctx: Context) {
    try {
      const query = ctx.query as Record<string, unknown>;
      const pagination = query.pagination as Record<string, string> | undefined;

      // Extract pagination parameters from query.pagination
      const options: Record<string, unknown> = {
        ...query,
        page: pagination?.page
          ? parseInt(pagination.page, 10)
          : (query.page as number) || 1,
        pageSize: pagination?.pageSize
          ? parseInt(pagination.pageSize, 10)
          : (query.pageSize as number) || 25,
      };

      // Remove pagination object if it exists to avoid conflicts
      if (options.pagination) {
        delete options.pagination;
      }

      const activeAds = await strapi
        .service("api::ad.ad")
        .activeAds(options, true, null);
      return activeAds;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get pending advertisements
   *
   * Retrieves a paginated list of advertisements pending approval.
   * Delegates to the advertisement service for business logic.
   *
   * @route GET /api/ads/pendings
   */
  async pendings(ctx: Context) {
    try {
      const query = ctx.query as Record<string, unknown>;
      const pagination = query.pagination as Record<string, string> | undefined;

      // Extract pagination parameters from query.pagination
      const options: Record<string, unknown> = {
        ...query,
        page: pagination?.page
          ? parseInt(pagination.page, 10)
          : (query.page as number) || 1,
        pageSize: pagination?.pageSize
          ? parseInt(pagination.pageSize, 10)
          : (query.pageSize as number) || 25,
      };

      // Remove pagination object if it exists to avoid conflicts
      if (options.pagination) {
        delete options.pagination;
      }

      const userId = ctx.state.user?.id ?? null;
      const pendingAds = await strapi
        .service("api::ad.ad")
        .pendingAds(options, ctxIsManager(ctx), userId);
      return pendingAds;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get archived advertisements
   *
   * Retrieves a paginated list of archived (expired) advertisements.
   * Delegates to the advertisement service for business logic.
   *
   * @route GET /api/ads/archiveds
   */
  async archiveds(ctx: Context) {
    try {
      const query = ctx.query as Record<string, unknown>;
      const pagination = query.pagination as Record<string, string> | undefined;

      // Extract pagination parameters from query.pagination
      const options: Record<string, unknown> = {
        ...query,
        page: pagination?.page
          ? parseInt(pagination.page, 10)
          : (query.page as number) || 1,
        pageSize: pagination?.pageSize
          ? parseInt(pagination.pageSize, 10)
          : (query.pageSize as number) || 25,
      };

      // Remove pagination object if it exists to avoid conflicts
      if (options.pagination) {
        delete options.pagination;
      }

      const userId = ctx.state.user?.id ?? null;
      const archivedAds = await strapi
        .service("api::ad.ad")
        .archivedAds(options, ctxIsManager(ctx), userId);
      return archivedAds;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get banned advertisements
   *
   * Retrieves a paginated list of banned advertisements.
   *
   * @route GET /api/ads/banneds
   */
  async banneds(ctx: Context) {
    try {
      const query = ctx.query as Record<string, unknown>;
      const pagination = query.pagination as Record<string, string> | undefined;

      const options: Record<string, unknown> = {
        ...query,
        page: pagination?.page
          ? parseInt(pagination.page, 10)
          : (query.page as number) || 1,
        pageSize: pagination?.pageSize
          ? parseInt(pagination.pageSize, 10)
          : (query.pageSize as number) || 25,
      };

      if (options.pagination) {
        delete options.pagination;
      }

      const userId = ctx.state.user?.id ?? null;
      const bannedAds = await strapi
        .service("api::ad.ad")
        .bannedAds(options, ctxIsManager(ctx), userId);
      return bannedAds;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get rejected advertisements
   *
   * Retrieves a paginated list of rejected advertisements.
   * Delegates to the advertisement service for business logic.
   *
   * @route GET /api/ads/rejecteds
   */
  async rejecteds(ctx: Context) {
    try {
      const query = ctx.query as Record<string, unknown>;
      const pagination = query.pagination as Record<string, string> | undefined;

      // Extract pagination parameters from query.pagination
      const options: Record<string, unknown> = {
        ...query,
        page: pagination?.page
          ? parseInt(pagination.page, 10)
          : (query.page as number) || 1,
        pageSize: pagination?.pageSize
          ? parseInt(pagination.pageSize, 10)
          : (query.pageSize as number) || 25,
      };

      // Remove pagination object if it exists to avoid conflicts
      if (options.pagination) {
        delete options.pagination;
      }

      const userId = ctx.state.user?.id ?? null;
      const rejectedAds = await strapi
        .service("api::ad.ad")
        .rejectedAds(options, ctxIsManager(ctx), userId);
      return rejectedAds;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get draft advertisements
   *
   * Retrieves a paginated list of draft advertisements (draft === true).
   * Delegates to the advertisement service for business logic.
   *
   * @route GET /api/ads/drafts
   */
  async drafts(ctx: Context) {
    try {
      const query = ctx.query as Record<string, unknown>;
      const pagination = query.pagination as Record<string, string> | undefined;

      const options: Record<string, unknown> = {
        ...query,
        page: pagination?.page
          ? parseInt(pagination.page, 10)
          : (query.page as number) || 1,
        pageSize: pagination?.pageSize
          ? parseInt(pagination.pageSize, 10)
          : (query.pageSize as number) || 25,
      };

      if (options.pagination) {
        delete options.pagination;
      }

      const userId = ctx.state.user?.id ?? null;
      const draftAds = await strapi
        .service("api::ad.ad")
        .draftAds(options, ctxIsManager(ctx), userId);
      return draftAds;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Approve an advertisement
   *
   * Approves a pending advertisement, making it active.
   * Delegates to the advertisement service for business logic.
   *
   * @route PUT /api/ads/:id/approve
   */
  async approveAd(ctx: Context) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const result = await strapi.service("api::ad.ad").approveAd(id, userId);
      return result;
    } catch (error) {
      // Handle specific error cases with appropriate HTTP status codes
      if (error.message === "Advertisement not found") {
        return ctx.notFound(error.message);
      }
      if (error.message === "Advertisement is not pending approval") {
        return ctx.badRequest(error.message);
      }
      ctx.throw(500, error);
    }
  },

  /**
   * Reject an advertisement
   *
   * Rejects a pending advertisement with an optional reason.
   * Delegates to the advertisement service for business logic.
   *
   * @route PUT /api/ads/:id/reject
   */
  async rejectAd(ctx: Context) {
    try {
      const { id } = ctx.params;
      const { reason_rejected } = ctx.request.body;
      const userId = ctx.state.user.id;

      const result = await strapi
        .service("api::ad.ad")
        .rejectAd(id, userId, reason_rejected);
      return result;
    } catch (error) {
      // Handle specific error cases with appropriate HTTP status codes
      if (error.message === "Advertisement not found") {
        return ctx.notFound(error.message);
      }
      if (error.message === "Advertisement is not pending approval") {
        return ctx.badRequest(error.message);
      }
      ctx.throw(500, error);
    }
  },

  /**
   * Get counts of advertisements grouped by status
   *
   * Returns a single object with counts for all 5 statuses in parallel.
   * Managers see counts for ALL ads. Authenticated users see only their own.
   *
   * @route GET /api/ads/count
   */
  async count(ctx: Context) {
    try {
      const isManager = ctxIsManager(ctx);
      const userId: number | undefined = ctx.state.user?.id;

      if (!isManager && !userId) {
        return ctx.unauthorized(
          "Debes estar autenticado para ver tus anuncios."
        );
      }

      const userFilter = isManager ? {} : { user: userId };

      const [published, review, expired, rejected, banned] = await Promise.all([
        strapi.entityService.count("api::ad.ad", {
          filters: {
            ...userFilter,
            active: true,
            banned: false,
            rejected: false,
            remaining_days: { $gt: 0 },
          } as unknown as Record<string, unknown>,
        }),
        strapi.entityService.count("api::ad.ad", {
          filters: {
            ...userFilter,
            active: false,
            banned: false,
            rejected: false,
            remaining_days: { $gt: 0 },
            $or: [{ is_paid: true, order: { $ne: null } }, { is_paid: false }],
          } as unknown as Record<string, unknown>,
        }),
        strapi.entityService.count("api::ad.ad", {
          filters: {
            ...userFilter,
            active: false,
            banned: false,
            rejected: false,
            remaining_days: 0,
          } as unknown as Record<string, unknown>,
        }),
        strapi.entityService.count("api::ad.ad", {
          filters: { ...userFilter, rejected: true } as unknown as Record<
            string,
            unknown
          >,
        }),
        strapi.entityService.count("api::ad.ad", {
          filters: { ...userFilter, banned: true } as unknown as Record<
            string,
            unknown
          >,
        }),
      ]);

      return ctx.send({ published, review, expired, rejected, banned });
    } catch (error) {
      return ctx.internalServerError("Internal server error");
    }
  },

  /**
   * Upload image for advertisement
   *
   * Handles image uploads for advertisements with folder organization.
   * Uses Strapi's upload plugin to manage file uploads.
   *
   * @route POST /api/ads/upload
   */
  async upload(ctx: Context) {
    try {
      if (!ctx.state.user?.id) {
        return ctx.unauthorized("You must be authenticated to upload images");
      }

      const { files } = ctx.request.files as Record<string, unknown>;

      if (!files) {
        return ctx.badRequest("No files provided");
      }

      // Agregar "ad_" al principio del nombre de cada archivo
      if (Array.isArray(files)) {
        (files as Record<string, unknown>[]).forEach((file) => {
          file.name = `ad_${file.name}`;
        });
      } else {
        (files as Record<string, unknown>).name = `ad_${
          (files as Record<string, unknown>).name
        }`;
      }

      const uploaded = await strapi.plugin("upload").service("upload").upload({
        data: {},
        files,
        folder: "api",
      });

      ctx.body = uploaded;
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Delete an uploaded image file — only the uploader can delete their own files.
   *
   * Ownership is verified by checking that at least one ad belonging to the
   * authenticated user contains this file in its gallery.
   *
   * @route DELETE /api/ads/upload/:id
   */
  async deleteUpload(ctx: Context) {
    try {
      const fileId = Number(ctx.params.id);
      const userId = Number(ctx.state.user?.id);

      if (!userId) {
        return ctx.unauthorized("You must be authenticated to delete an image");
      }

      if (!fileId || isNaN(fileId)) {
        return ctx.badRequest("Invalid file id");
      }

      // Verify the file exists
      const file = await strapi.db
        .query("plugin::upload.file")
        .findOne({ where: { id: fileId } });

      if (!file) {
        return ctx.notFound("File not found");
      }

      // Ownership check: verify at least one ad by this user contains this file
      const ownerAd = await strapi.db.query("api::ad.ad").findOne({
        where: {
          user: { id: userId },
          gallery: { id: fileId },
        },
      });

      if (!ownerAd) {
        return ctx.forbidden("You do not have permission to delete this file");
      }

      // Delete the file from storage and database
      await strapi.plugin("upload").service("upload").remove(file);

      ctx.body = { success: true };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Ban an advertisement
   *
   * Bans an advertisement. Only the owner of the ad or an administrator can ban it.
   *
   * @route PUT /api/ads/:id/banned
   */
  async bannedAd(ctx: Context) {
    try {
      const { id } = ctx.params;
      const reasonForBan = ctx.request.body?.reason_for_ban;
      const userId = ctx.state.user.id;

      if (!userId) {
        return ctx.unauthorized(
          "You must be authenticated to deactivate an advertisement"
        );
      }

      const result = await strapi
        .service("api::ad.ad")
        .bannedAd(id, userId, reasonForBan);
      return result;
    } catch (error) {
      // Handle specific error cases with appropriate HTTP status codes
      if (error.message === "Advertisement not found") {
        return ctx.notFound(error.message);
      }
      if (error.message === "Advertisement is already banned") {
        return ctx.badRequest(error.message);
      }
      if (error.message.includes("permission")) {
        return ctx.forbidden(error.message);
      }
      ctx.throw(500, error);
    }
  },

  /**
   * Deactivate an advertisement (leave as expired).
   * Only the owner can deactivate.
   *
   * @route PUT /api/ads/:id/deactivate
   */
  /**
   * Save an ad as a draft before payment processing.
   * Creates a new draft ad or updates an existing one with draft: true.
   *
   * @route POST /api/ads/draft
   */
  async saveDraft(ctx: Context) {
    try {
      const { data } = ctx.request.body as {
        data?: { ad?: Record<string, unknown> };
      };
      const ad = data?.ad;
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized(
          "You must be authenticated to save a draft advertisement"
        );
      }

      if (!ad || typeof ad !== "object") {
        return ctx.badRequest("Missing or invalid ad payload");
      }

      const result = await strapi
        .service("api::ad.ad")
        .saveDraft(ad, String(userId));

      if (!result.success) {
        ctx.status = 400;
        ctx.body = { success: false, message: result.message };
        return;
      }

      ctx.body = { data: { id: result.id } };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async deactivateAd(ctx: Context) {
    try {
      const { id } = ctx.params;
      const reasonForDeactivation = ctx.request.body?.reason_for_deactivation;
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized(
          "You must be authenticated to deactivate an advertisement"
        );
      }

      const result = await strapi
        .service("api::ad.ad")
        .deactivateAd(id, userId, reasonForDeactivation);
      return result;
    } catch (error) {
      if (error.message === "Advertisement not found") {
        return ctx.notFound(error.message);
      }
      if (error.message === "Advertisement is already deactivated") {
        return ctx.badRequest(error.message);
      }
      if (error.message.includes("permission")) {
        return ctx.forbidden(error.message);
      }
      ctx.throw(500, error);
    }
  },

  /**
   * Get ad by documentId for thank-you page (owner only).
   * Uses strapi.db.query to bypass publishedAt — pending ads are valid.
   * @route GET /api/ads/thankyou/:documentId
   */
  async thankyou(ctx: Context) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized();

    const { documentId } = ctx.params;
    const ad = await strapi
      .service("api::ad.ad")
      .findByDocumentIdForOwner(documentId, userId);

    if (!ad) return ctx.notFound("Ad not found or access denied");

    return ctx.send({ data: ad });
  },

  /**
   * Get advertisement by slug with server-side access control.
   * Active ads are public. Pending/inactive: owner or manager only.
   *
   * @route GET /api/ads/slug/:slug
   */
  async findBySlug(ctx: Context) {
    const { slug } = ctx.params;

    // Route has auth: false so ctx.state.user is not populated by Strapi middleware.
    // Decode JWT manually — allows owner/manager access without requiring Public role permission.
    let userId: number | null = null;
    const authHeader = ctx.request.headers?.authorization as string | undefined;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const secret = process.env.JWT_SECRET ?? "strapi-jwt-secret";
        const decoded = jwt.verify(token, secret) as { id: number };
        userId = decoded?.id ?? null;
      } catch {
        userId = null;
      }
    }

    try {
      const result = await strapi
        .service("api::ad.ad")
        .findBySlug(slug, userId);

      if (!result) {
        return ctx.notFound("Ad not found or access denied");
      }

      // Managers see the full ad; public and owners get sanitized data
      const adData =
        result.access.role === "manager"
          ? result.ad
          : sanitizeAdForPublic(result.ad as Record<string, unknown>);

      return ctx.send({ data: adData, access: result.access });
    } catch (error) {
      strapi.log.error("findBySlug error for slug %s: %o", slug, error);
      return ctx.internalServerError("Internal server error");
    }
  },
}));
