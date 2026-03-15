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

interface PaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

interface QueryParams {
  filters?: unknown;
  pagination?: {
    page?: string;
    pageSize?: string;
  };
  sort?: unknown;
  populate?: unknown;
}

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

      const activeAds = await strapi.service("api::ad.ad").activeAds(options);
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

      const pendingAds = await strapi.service("api::ad.ad").pendingAds(options);
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

      const archivedAds = await strapi
        .service("api::ad.ad")
        .archivedAds(options);
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

      const bannedAds = await strapi.service("api::ad.ad").bannedAds(options);
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

      const rejectedAds = await strapi
        .service("api::ad.ad")
        .rejectedAds(options);
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

      const draftAds = await strapi.service("api::ad.ad").draftAds(options);
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
   * Get counts of user's advertisements grouped by status
   *
   * Returns a single object with counts for all 5 statuses in parallel,
   * avoiding the need for 5 separate API calls.
   *
   * @route GET /api/ads/me/counts
   */
  async meCounts(ctx: Context) {
    try {
      if (!ctx.state.user?.id) {
        return ctx.unauthorized(
          "Debes estar autenticado para ver tus anuncios."
        );
      }
      const userId: number = ctx.state.user.id;

      const [published, review, expired, rejected, banned] = await Promise.all([
        strapi.entityService.count("api::ad.ad", {
          filters: {
            user: userId,
            active: true,
            banned: false,
            rejected: false,
            remaining_days: { $gt: 0 },
          } as unknown as Record<string, unknown>,
        }),
        strapi.entityService.count("api::ad.ad", {
          filters: {
            user: userId,
            active: false,
            banned: false,
            rejected: false,
            remaining_days: { $gt: 0 },
            $or: [{ is_paid: true, order: { $ne: null } }, { is_paid: false }],
          } as unknown as Record<string, unknown>,
        }),
        strapi.entityService.count("api::ad.ad", {
          filters: {
            user: userId,
            active: false,
            banned: false,
            rejected: false,
            remaining_days: 0,
          } as unknown as Record<string, unknown>,
        }),
        strapi.entityService.count("api::ad.ad", {
          filters: { user: userId, rejected: true } as unknown as Record<
            string,
            unknown
          >,
        }),
        strapi.entityService.count("api::ad.ad", {
          filters: { user: userId, banned: true } as unknown as Record<
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
   * Get user's advertisements
   *
   * Retrieves a paginated list of advertisements for the authenticated user.
   * Supports filtering by status (published, review, expired, rejected, pending_payment).
   *
   * @route GET /api/ads/me
   */
  async me(ctx: Context) {
    try {
      // Ensure ctx.state.user is defined
      if (!ctx.state.user || !ctx.state.user.id) {
        return ctx.unauthorized(
          "Debes estar autenticado para ver tus anuncios."
        );
      }

      // Get the logged-in user's ID
      const userId: number = ctx.state.user.id;

      // Extract Strapi query parameters from ctx.query
      const {
        filters: rawFilters = {},
        pagination = {},
        sort = {},
        populate = "*",
      } = ctx.query as QueryParams;

      const filters = rawFilters as Record<string, unknown>;

      // Validate pagination
      const page = parseInt(pagination.page as string, 10) || 1;
      const pageSize = parseInt(pagination.pageSize as string, 10) || 10;

      if (page <= 0 || pageSize <= 0) {
        return ctx.badRequest(
          "Invalid pagination parameters. Page and pageSize must be positive integers."
        );
      }

      // Extract status from filters
      const status = filters?.status as string | undefined;

      // Validate status is required
      if (!status) {
        return ctx.badRequest("Status parameter is required");
      }

      // Validate status
      const validStatuses = [
        "published",
        "review",
        "expired",
        "rejected",
        "banned",
        "pending_payment",
      ];
      if (status && !validStatuses.includes(status)) {
        return ctx.badRequest(
          `Invalid status parameter. Allowed values are: ${validStatuses.join(
            ", "
          )}`
        );
      }

      // Ensure filters is an object
      const filterClause: Record<string, unknown> = {
        user: userId, // Filter by user ID
      };

      // Remove status from filters if it exists
      const { status: _, ...restFilters } = filters as Record<string, unknown>;

      // Add any other valid filters
      if (typeof restFilters === "object") {
        Object.assign(filterClause, restFilters);
      }

      // Add conditions based on the status parameter
      switch (status) {
        case "published":
          filterClause.active = true;
          filterClause.banned = false;
          filterClause.rejected = false;
          filterClause.remaining_days = { $gt: 0 };
          break;
        case "review":
          filterClause.active = false;
          filterClause.banned = false;
          filterClause.rejected = false;
          filterClause.remaining_days = { $gt: 0 };
          filterClause.$or = [
            {
              is_paid: true,
              order: { $ne: null },
            },
            {
              is_paid: false,
            },
          ];
          break;
        case "pending_payment":
          filterClause.active = false;
          filterClause.banned = false;
          filterClause.rejected = false;
          filterClause.remaining_days = { $gt: 0 };
          filterClause.is_paid = true;
          filterClause.order = null;
          break;
        case "expired":
          filterClause.active = false;
          filterClause.banned = false;
          filterClause.rejected = false;
          filterClause.remaining_days = 0;
          break;
        case "rejected":
          filterClause.rejected = true;
          break;
        case "banned":
          filterClause.banned = true;
          break;
        default:
          // No additional conditions for other statuses
          break;
      }

      // Fetch ads for the logged-in user with the specified conditions
      const ads = await strapi.entityService.findMany("api::ad.ad", {
        filters: filterClause,
        populate,
        start: (page - 1) * pageSize,
        limit: pageSize,
        sort,
      });

      // Add status from filters to each ad
      const adsWithStatus = ads.map((ad) => ({
        ...ad,
        status: status || "unknown",
      }));

      // Fetch the total count of ads matching the filters
      const count = await strapi.entityService.count("api::ad.ad", {
        filters: filterClause,
      });

      // Return the ads along with meta information
      return ctx.send({
        data: adsWithStatus,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(count / pageSize),
            total: count,
          },
        } as PaginationMeta,
      });
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
      const userId = ctx.state.user?.id;

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
}));
