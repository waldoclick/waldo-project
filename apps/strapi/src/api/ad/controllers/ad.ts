/**
 * Advertisement Controller
 *
 * This controller handles HTTP requests for advertisement-related operations.
 * It acts as a thin layer between the HTTP layer and the business logic service.
 *
 * @module AdvertisementController
 */

import { factories } from "@strapi/strapi";

interface PaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

interface QueryParams {
  filters?: any;
  pagination?: {
    page?: string;
    pageSize?: string;
  };
  sort?: any;
  populate?: any;
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
   * Get active advertisements
   *
   * Retrieves a paginated list of active advertisements.
   * Delegates to the advertisement service for business logic.
   *
   * @route GET /api/ads/actives
   */
  async actives(ctx: any) {
    try {
      const { query } = ctx;

      // Extract pagination parameters from query.pagination
      const options: any = {
        ...query,
        page: query.pagination?.page
          ? parseInt(query.pagination.page, 10)
          : query.page || 1,
        pageSize: query.pagination?.pageSize
          ? parseInt(query.pagination.pageSize, 10)
          : query.pageSize || 25,
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
  async pendings(ctx: any) {
    try {
      const { query } = ctx;

      // Extract pagination parameters from query.pagination
      const options: any = {
        ...query,
        page: query.pagination?.page
          ? parseInt(query.pagination.page, 10)
          : query.page || 1,
        pageSize: query.pagination?.pageSize
          ? parseInt(query.pagination.pageSize, 10)
          : query.pageSize || 25,
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
  async archiveds(ctx: any) {
    try {
      const { query } = ctx;

      // Extract pagination parameters from query.pagination
      const options: any = {
        ...query,
        page: query.pagination?.page
          ? parseInt(query.pagination.page, 10)
          : query.page || 1,
        pageSize: query.pagination?.pageSize
          ? parseInt(query.pagination.pageSize, 10)
          : query.pageSize || 25,
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
   * Get rejected advertisements
   *
   * Retrieves a paginated list of rejected advertisements.
   * Delegates to the advertisement service for business logic.
   *
   * @route GET /api/ads/rejecteds
   */
  async rejecteds(ctx: any) {
    try {
      const { query } = ctx;

      // Extract pagination parameters from query.pagination
      const options: any = {
        ...query,
        page: query.pagination?.page
          ? parseInt(query.pagination.page, 10)
          : query.page || 1,
        pageSize: query.pagination?.pageSize
          ? parseInt(query.pagination.pageSize, 10)
          : query.pageSize || 25,
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
   * Approve an advertisement
   *
   * Approves a pending advertisement, making it active.
   * Delegates to the advertisement service for business logic.
   *
   * @route PUT /api/ads/:id/approve
   */
  async approveAd(ctx: any) {
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
  async rejectAd(ctx: any) {
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
   * Get user's advertisements
   *
   * Retrieves a paginated list of advertisements for the authenticated user.
   * Supports filtering by status (published, review, expired, rejected, pending_payment).
   *
   * @route GET /api/ads/me
   */
  async me(ctx: any) {
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
        filters = {},
        pagination = {},
        sort = {},
        populate = "*",
      } = ctx.query as QueryParams;

      // Validate pagination
      const page = parseInt(pagination.page, 10) || 1;
      const pageSize = parseInt(pagination.pageSize, 10) || 10;

      if (page <= 0 || pageSize <= 0) {
        return ctx.badRequest(
          "Invalid pagination parameters. Page and pageSize must be positive integers."
        );
      }

      // Extract status from filters
      const status = filters?.status;

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
      const filterClause: any = {
        user: userId, // Filter by user ID
      };

      // Remove status from filters if it exists
      const { status: _, ...restFilters } = filters;

      // Add any other valid filters
      if (typeof restFilters === "object") {
        Object.assign(filterClause, restFilters);
      }

      // Add conditions based on the status parameter
      switch (status) {
        case "published":
          filterClause.active = true;
          filterClause.rejected = false;
          filterClause.remaining_days = { $gt: 0 };
          break;
        case "review":
          filterClause.active = false;
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
          filterClause.rejected = false;
          filterClause.remaining_days = { $gt: 0 };
          filterClause.is_paid = true;
          filterClause.order = null;
          break;
        case "expired":
          filterClause.active = false;
          filterClause.rejected = false;
          filterClause.remaining_days = 0;
          break;
        case "rejected":
          filterClause.rejected = true;
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
      const adsWithStatus = ads.map((ad: any) => ({
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
  async upload(ctx: any) {
    try {
      const { files } = ctx.request.files;

      if (!files) {
        return ctx.badRequest("No files provided");
      }

      // Agregar "ad_" al principio del nombre de cada archivo
      if (Array.isArray(files)) {
        files.forEach((file) => {
          file.name = `ad_${file.name}`;
        });
      } else {
        files.name = `ad_${files.name}`;
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
   * Deactivate an advertisement (soft delete)
   *
   * Deactivates an advertisement, marking it as archived.
   * Only the owner of the ad or an administrator can deactivate it.
   *
   * @route PUT /api/ads/:id/deactivate
   */
  async deactivateAd(ctx: any) {
    try {
      const { id } = ctx.params;
      const { reason_deactivated } = ctx.request.body;
      const userId = ctx.state.user.id;

      if (!userId) {
        return ctx.unauthorized(
          "You must be authenticated to deactivate an advertisement"
        );
      }

      const result = await strapi
        .service("api::ad.ad")
        .deactivateAd(id, userId, reason_deactivated);
      return result;
    } catch (error) {
      // Handle specific error cases with appropriate HTTP status codes
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
