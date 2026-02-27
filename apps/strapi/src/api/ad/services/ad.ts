/**
 * Advertisement Service
 *
 * This service handles all advertisement-related business logic including:
 * - Retrieving ads by status (active, pending, archived, rejected)
 * - Approving and rejecting advertisements
 * - Managing advertisement lifecycle
 *
 * @module AdvertisementService
 */

import { factories } from "@strapi/strapi";
import { sendMjmlEmail } from "../../../services/mjml";

/**
 * Helper function to transform sort parameter from string to object format
 * @param {string|object} sort - Sort parameter (e.g., "createdAt:asc" or {createdAt: "asc"})
 * @returns {object} Transformed sort object for Strapi query
 */
function transformSortParameter(sort: any): any {
  if (!sort) return { createdAt: "desc" };

  // If already an object, return as is
  if (typeof sort === "object" && !Array.isArray(sort)) {
    return sort;
  }

  // If it's a string, parse it
  if (typeof sort === "string") {
    const sortParts = sort.split(":");
    if (sortParts.length === 2) {
      const [field, direction] = sortParts;
      return { [field]: direction.toLowerCase() };
    }
    // If no direction specified, default to asc
    return { [sort]: "asc" };
  }

  // Default fallback
  return { createdAt: "desc" };
}

/**
 * Helper function to get advertisements based on status and filters
 * @param {Object} options - Query options for filtering and pagination
 * @param {Object} defaultFilters - Default filters for the specific status
 * @param {string} status - The status of the advertisements to retrieve ("active", "pending", "archived", "rejected")
 * @param {Function} [postProcessFilter] - Optional function to post-process the fetched ads
 * @returns {Promise<Object>} Paginated list of advertisements
 */
async function getAdvertisements(
  options: any,
  defaultFilters: any,
  status: string,
  postProcessFilter?: (ads: any[]) => any[]
) {
  try {
    // Merge default filters with any additional filters provided
    const filters = {
      ...defaultFilters,
      ...(options.filters || {}),
    };

    // Define default relations to populate
    const defaultPopulate = {
      user: true, // User who created the ad
      gallery: true, // Ad images/gallery
      commune: true, // Geographic location
      condition: true, // Ad condition (new, used, etc.)
      type: true, // Ad type
      category: true, // Ad category
      details: true, // Additional ad details
      order: true, // Order relation
    };

    // Merge custom populates with defaults
    const populate = {
      ...defaultPopulate,
      ...(options.populate || {}),
    };

    // Set up pagination parameters
    const page = options.page ? parseInt(options.page) : 1;
    const pageSize = options.pageSize ? parseInt(options.pageSize) : 25;
    const start = (page - 1) * pageSize;

    // Build the database query
    const query = {
      where: filters,
      populate,
      limit: pageSize,
      offset: start,
      orderBy: transformSortParameter(options.sort),
    };

    // Execute query and count in parallel for better performance
    const [ads, total] = await Promise.all([
      strapi.db.query("api::ad.ad").findMany(query),
      strapi.db.query("api::ad.ad").count({ where: filters }),
    ]);

    // Add needs_payment field to all ads
    const adsWithPaymentStatus = ads.map((ad) => {
      const pack = ad.details?.pack;
      const featured = ad.details?.featured;
      const hasOrder = ad.order !== null;

      let needs_payment = false;

      if (typeof pack === "number") {
        needs_payment = !hasOrder;
      } else if (featured === true) {
        needs_payment = !hasOrder;
      }

      return {
        ...ad,
        needs_payment,
      };
    });

    // Apply post-processing filter if provided
    const processedAds = postProcessFilter
      ? postProcessFilter(adsWithPaymentStatus)
      : adsWithPaymentStatus;

    // Calculate pagination metadata
    const pageCount = Math.ceil(total / pageSize);

    // Return results in standard Strapi format
    return {
      data: processedAds,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount,
          total,
        },
      },
    };
  } catch (error) {
    console.error(`Error in ${status}Ads:`, error);
    return {
      data: null,
      meta: {
        error: error.message,
      },
    };
  }
}

/**
 * Advertisement Service Factory
 *
 * Creates a core service for the advertisement API with custom business logic methods.
 * Extends the default Strapi service with advertisement-specific functionality.
 */
export default factories.createCoreService("api::ad.ad", ({ strapi }) => ({
  /**
   * Override the default findOne method to include status field
   * @param {string|number} id - The advertisement ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Advertisement with status field
   */
  async findOne(id: string | number, options: any = {}) {
    // Call the original findOne method
    const ad = await strapi.db.query("api::ad.ad").findOne({
      where: { id },
      ...options,
    });

    if (!ad) return null;

    // Calculate and add status field
    let status = "unknown";

    if (ad.rejected) {
      status = "rejected";
    } else if (ad.banned) {
      status = "banned";
    } else if (
      ad.active &&
      !ad.banned &&
      !ad.rejected &&
      ad.remaining_days > 0
    ) {
      status = "active";
    } else if (
      !ad.active &&
      !ad.banned &&
      !ad.rejected &&
      ad.remaining_days === 0
    ) {
      status = "archived";
    } else if (
      !ad.active &&
      !ad.banned &&
      !ad.rejected &&
      ad.remaining_days > 0 &&
      (ad.ad_reservation == null || ad.ad_reservation === undefined) &&
      ad.is_paid
    ) {
      status = "abandoned";
    } else if (
      !ad.active &&
      !ad.banned &&
      !ad.rejected &&
      ad.remaining_days > 0
    ) {
      status = "pending";
    }

    // Return advertisement with status field
    return {
      ...ad,
      status,
    };
  },

  /**
   * Override the default findMany method to include status field for all advertisements
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Advertisements with status field
   */
  async findMany(options: any = {}) {
    // Set default sorting by name if no sort is provided
    const queryOptions = {
      ...options,
      orderBy: options.orderBy || { name: "asc" },
    };

    // Call the original findMany method with all options (including orderBy)
    const ads = await strapi.db.query("api::ad.ad").findMany(queryOptions);

    // Add status field to each advertisement
    const adsWithStatus = ads.map((ad) => {
      let status = "unknown";

      if (ad.rejected) {
        status = "rejected";
      } else if (ad.banned) {
        status = "banned";
      } else if (
        ad.active &&
        !ad.banned &&
        !ad.rejected &&
        ad.remaining_days > 0
      ) {
        status = "active";
      } else if (
        !ad.active &&
        !ad.banned &&
        !ad.rejected &&
        ad.remaining_days === 0
      ) {
        status = "archived";
      } else if (
        !ad.active &&
        !ad.banned &&
        !ad.rejected &&
        ad.remaining_days > 0 &&
        (ad.ad_reservation == null || ad.ad_reservation === undefined) &&
        ad.is_paid
      ) {
        status = "abandoned";
      } else if (
        !ad.active &&
        !ad.banned &&
        !ad.rejected &&
        ad.remaining_days > 0
      ) {
        status = "pending";
      }

      // Return with status field at the beginning
      return {
        status,
        ...ad,
      };
    });

    return adsWithStatus;
  },

  /**
   * Retrieve active advertisements
   *
   * Fetches advertisements that are currently active and have remaining days.
   * Active ads are those that have been approved and are still running.
   *
   * @param {Object} options - Query options for filtering and pagination
   * @param {Object} [options.filters] - Additional filters to apply
   * @param {Object} [options.populate] - Relations to populate
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.pageSize=25] - Number of items per page
   * @param {Object} [options.sort] - Sorting criteria
   * @returns {Promise<Object>} Paginated list of active advertisements
   *
   * @example
   * // Get first page of active ads
   * const activeAds = await strapi.service("api::ad.ad").activeAds();
   *
   * // Get active ads with custom filters and pagination
   * const filteredAds = await strapi.service("api::ad.ad").activeAds({
   *   filters: { category: "electronics" },
   *   page: 2,
   *   pageSize: 10
   * });
   */
  async activeAds(options: any = {}) {
    const defaultFilters = {
      active: { $eq: true },
      banned: { $eq: false },
      rejected: { $eq: false },
      remaining_days: { $gt: 0 },
    };

    return getAdvertisements(options, defaultFilters, "active");
  },

  /**
   * Retrieve pending advertisements awaiting approval
   *
   * Fetches advertisements that are pending approval. These are ads that:
   * - Are not yet active
   * - Have remaining days equal to duration days (not yet started)
   * - Have not been rejected
   *
   * @param {Object} options - Query options for filtering and pagination
   * @param {Object} [options.filters] - Additional filters to apply
   * @param {Object} [options.populate] - Relations to populate
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.pageSize=25] - Number of items per page
   * @param {Object} [options.sort] - Sorting criteria
   * @returns {Promise<Object>} Paginated list of pending advertisements
   *
   * @example
   * // Get all pending ads for approval
   * const pendingAds = await strapi.service("api::ad.ad").pendingAds();
   */
  async pendingAds(options: any = {}) {
    const defaultFilters = {
      active: { $eq: false },
      banned: { $eq: false },
      rejected: { $eq: false },
      remaining_days: { $gt: 0 },
      ad_reservation: { $ne: null },
    };

    return getAdvertisements(options, defaultFilters, "pending");
  },

  /**
   * Retrieve archived advertisements
   *
   * Fetches advertisements that have been archived. These are ads that:
   * - Are no longer active
   * - Have no remaining days (expired)
   * - Have not been rejected
   *
   * @param {Object} options - Query options for filtering and pagination
   * @param {Object} [options.filters] - Additional filters to apply
   * @param {Object} [options.populate] - Relations to populate
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.pageSize=25] - Number of items per page
   * @param {Object} [options.sort] - Sorting criteria
   * @returns {Promise<Object>} Paginated list of archived advertisements
   *
   * @example
   * // Get all archived ads
   * const archivedAds = await strapi.service("api::ad.ad").archivedAds();
   */
  async archivedAds(options: any = {}) {
    const defaultFilters = {
      active: { $eq: false },
      banned: { $eq: false },
      rejected: { $eq: false },
      remaining_days: { $eq: 0 },
    };

    return getAdvertisements(options, defaultFilters, "archived");
  },

  /**
   * Retrieve banned advertisements
   *
   * Fetches advertisements that have been banned by owner or administrator.
   *
   * @param {Object} options - Query options for filtering and pagination
   * @returns {Promise<Object>} Paginated list of banned advertisements
   */
  async bannedAds(options: any = {}) {
    const defaultFilters = {
      banned: { $eq: true },
    };

    return getAdvertisements(options, defaultFilters, "banned");
  },

  /**
   * Retrieve rejected advertisements
   *
   * Fetches advertisements that have been rejected by administrators.
   * These ads failed to meet platform guidelines or requirements.
   *
   * @param {Object} options - Query options for filtering and pagination
   * @param {Object} [options.filters] - Additional filters to apply
   * @param {Object} [options.populate] - Relations to populate
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.pageSize=25] - Number of items per page
   * @param {Object} [options.sort] - Sorting criteria
   * @returns {Promise<Object>} Paginated list of rejected advertisements
   *
   * @example
   * // Get all rejected ads
   * const rejectedAds = await strapi.service("api::ad.ad").rejectedAds();
   */
  async rejectedAds(options: any = {}) {
    const defaultFilters = {
      rejected: { $eq: true },
    };

    return getAdvertisements(options, defaultFilters, "rejected");
  },

  /**
   * Retrieve abandoned advertisements
   *
   * Ads that required payment but never completed it (no ad_reservation assigned).
   */
  async abandonedAds(options: any = {}) {
    const defaultFilters = {
      active: { $eq: false },
      banned: { $eq: false },
      rejected: { $eq: false },
      ad_reservation: { $null: true },
    };

    return getAdvertisements(options, defaultFilters, "abandoned");
  },

  /**
   * Approve a pending advertisement
   *
   * Approves an advertisement that is pending approval. This action:
   * - Activates the advertisement
   * - Records who approved it and when
   * - Allows the ad to start running
   *
   * @param {string} adId - The ID of the advertisement to approve
   * @param {string} userId - The ID of the user performing the approval
   * @returns {Promise<Object>} Result of the approval operation
   * @throws {Error} When advertisement is not found or not pending approval
   *
   * @example
   * // Approve an advertisement
   * const result = await strapi.service("api::ad.ad").approveAd("123", "admin456");
   */
  async approveAd(adId: string, userId: string) {
    try {
      // Find the advertisement to approve
      const ad = await strapi.query("api::ad.ad").findOne({
        where: { id: adId },
        populate: ["user"],
      });

      // Validate that the advertisement exists
      if (!ad) {
        throw new Error("Advertisement not found");
      }

      // Validate that the advertisement is pending approval
      const isPending =
        ad.active === false &&
        ad.banned === false &&
        ad.rejected === false &&
        ad.remaining_days > 0;

      if (!isPending) {
        throw new Error("Advertisement is not pending approval");
      }

      // Approve the advertisement by updating its status
      await strapi.query("api::ad.ad").update({
        where: { id: adId },
        data: {
          active: true, // Activate the ad
          actived_at: new Date(),
          actived_by: userId,
        },
      });

      // Enviar email de aprobación al usuario
      try {
        if (ad.user && ad.user.email) {
          await sendMjmlEmail(
            strapi,
            "ad-approved",
            ad.user.email,
            "Tu anuncio ha sido aprobado",
            {
              name: `${ad.user.firstname} ${ad.user.lastname}`,
              adTitle: ad.name,
              adUrl: `${process.env.FRONTEND_URL}/anuncios/${ad.slug}`,
            }
          );
        } else {
          console.error("User data not available for approval email");
        }
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
      }

      // Return success response
      return {
        success: true,
        message: "Advertisement approved successfully",
        data: { id: adId, actived_by: userId },
      };
    } catch (error) {
      console.error("Error in approveAd:", error);
      throw error;
    }
  },

  /**
   * Reject a pending advertisement
   *
   * Rejects an advertisement that is pending approval. This action:
   * - Marks the advertisement as rejected
   * - Records the rejection reason
   * - Records who rejected it and when
   * - Prevents the ad from being activated
   *
   * @param {string} adId - The ID of the advertisement to reject
   * @param {string} userId - The ID of the user performing the rejection
   * @param {string} [reasonRejected] - Optional reason for rejection
   * @returns {Promise<Object>} Result of the rejection operation
   * @throws {Error} When advertisement is not found or not pending approval
   *
   * @example
   * // Reject an advertisement with custom reason
   * const result = await strapi.service("api::ad.ad").rejectAd("123", "admin456", "Inappropriate content");
   *
   * // Reject an advertisement with default reason
   * const result = await strapi.service("api::ad.ad").rejectAd("123", "admin456");
   */
  async rejectAd(adId: string, userId: string, reasonRejected?: string) {
    try {
      // Find the advertisement to reject
      const ad = await strapi.query("api::ad.ad").findOne({
        where: { id: adId },
        populate: ["user"],
      });

      // Validate that the advertisement exists
      if (!ad) {
        throw new Error("Advertisement not found");
      }

      // Validate that the advertisement is pending approval
      const isPending =
        ad.active === false &&
        ad.banned === false &&
        ad.rejected === false &&
        ad.remaining_days > 0;

      if (!isPending) {
        throw new Error("Advertisement is not pending approval");
      }

      // Set default rejection reason if not provided
      const rejectionReason =
        reasonRejected ||
        "Fue rechazado porque no cumple con las políticas y términos de uso de Waldo.click®";

      // Reject the advertisement by updating its status
      await strapi.query("api::ad.ad").update({
        where: { id: adId },
        data: {
          rejected: true, // Mark as rejected
          reason_for_rejection: rejectionReason, // Record rejection reason
          rejected_at: new Date(), // Record when it was rejected
          rejected_by: userId,
        },
      });

      // Enviar email de rechazo al usuario
      try {
        if (ad.user && ad.user.email) {
          await sendMjmlEmail(
            strapi,
            "ad-rejected",
            ad.user.email,
            "Tu anuncio ha sido rechazado",
            {
              name: `${ad.user.firstname} ${ad.user.lastname}`,
              adTitle: ad.name,
              reason: rejectionReason,
            }
          );
        } else {
          console.error("User data not available for rejection email");
        }
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError);
      }

      // Return success response
      return {
        success: true,
        message: "Advertisement rejected successfully",
        data: {
          id: adId,
          reason_for_rejection: rejectionReason,
        },
      };
    } catch (error) {
      console.error("Error in rejectAd:", error);
      throw error;
    }
  },

  /**
   * Ban an advertisement.
   *
   * Bans an advertisement by setting it inactive and recording
   * the ban reason and date. Only the owner of the ad or an administrator can ban it.
   *
   * @param {string} adId - The ID of the advertisement to ban
   * @param {string} userId - The ID of the user performing the ban
   * @param {string} [reasonForBan] - Optional reason for the ban
   * @returns {Promise<Object>} Result of the ban operation
   * @throws {Error} When advertisement is not found, already banned, or user lacks permission
   *
   * @example
   * const result = await strapi.service("api::ad.ad").bannedAd("123", "user456", "Violation");
   */
  async bannedAd(adId: string, userId: string, reasonForBan?: string) {
    try {
      const ad = await strapi.db.query("api::ad.ad").findOne({
        where: { id: adId },
        populate: ["user"],
      });

      if (!ad) {
        throw new Error("Advertisement not found");
      }

      if (ad.banned === true) {
        throw new Error("Advertisement is already banned");
      }

      const isOwner = ad.user?.id?.toString() === userId.toString();
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: userId }, populate: ["role"] });

      const isAdmin =
        user?.role?.name === "Administrator" ||
        user?.role?.name === "Admin" ||
        user?.role?.name === "Manager";

      if (!isOwner && !isAdmin) {
        throw new Error("You don't have permission to ban this advertisement");
      }

      await strapi.db.query("api::ad.ad").update({
        where: { id: adId },
        data: {
          active: false,
          banned: true,
          banned_at: new Date(),
          reason_for_ban: reasonForBan ?? null,
          banned_by: userId,
        },
      });

      // Enviar email de baneo al usuario
      try {
        if (ad.user && ad.user.email) {
          await sendMjmlEmail(
            strapi,
            "ad-banned",
            ad.user.email,
            "Tu anuncio ha sido baneado",
            {
              name: `${ad.user.firstname} ${ad.user.lastname}`,
              adTitle: ad.name,
              reason: reasonForBan ?? undefined,
            }
          );
        } else {
          console.error("User data not available for ban email");
        }
      } catch (emailError) {
        console.error("Error sending ban email:", emailError);
      }

      return {
        success: true,
        message: "Advertisement banned successfully",
        data: { id: adId },
      };
    } catch (error) {
      console.error("Error in bannedAd (ban):", error);
      throw error;
    }
  },

  /**
   * Deactivate an advertisement (leave as expired).
   * Only the owner can deactivate. Sets active = false, remaining_days = 0.
   *
   * @param {string} adId - The advertisement id
   * @param {string} userId - The user id (must be owner)
   * @param {string} [reasonForDeactivation] - Optional reason
   * @returns {Promise<Object>} Result with success and data
   */
  async deactivateAd(
    adId: string,
    userId: string,
    reasonForDeactivation?: string
  ) {
    try {
      const ad = await strapi.db.query("api::ad.ad").findOne({
        where: { id: adId },
        populate: ["user"],
      });

      if (!ad) {
        throw new Error("Advertisement not found");
      }

      const isOwner = ad.user?.id?.toString() === userId.toString();
      if (!isOwner) {
        throw new Error(
          "You don't have permission to deactivate this advertisement"
        );
      }

      const alreadyExpired = ad.active === false && ad.remaining_days === 0;
      if (alreadyExpired) {
        throw new Error("Advertisement is already deactivated");
      }

      await strapi.db.query("api::ad.ad").update({
        where: { id: adId },
        data: {
          active: false,
          remaining_days: 0,
          reason_for_deactivation: reasonForDeactivation ?? null,
        },
      });

      return {
        success: true,
        message: "Advertisement deactivated successfully",
        data: { id: adId },
      };
    } catch (error) {
      console.error("Error in deactivateAd:", error);
      throw error;
    }
  },
}));
