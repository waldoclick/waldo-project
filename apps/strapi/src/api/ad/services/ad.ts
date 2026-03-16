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
import logger from "../../../utils/logtail";
import { zohoService } from "../../../services/zoho";

type AdStatus =
  | "draft"
  | "active"
  | "pending"
  | "archived"
  | "banned"
  | "rejected"
  | "unknown";

interface AdQueryOptions {
  filters?: unknown;
  populate?: unknown;
  page?: string | number;
  pageSize?: string | number;
  sort?: unknown;
  orderBy?: unknown;
  pagination?: {
    page?: string;
    pageSize?: string;
  };
}

function computeAdStatus(ad: unknown): AdStatus {
  if (!ad || typeof ad !== "object") return "unknown";
  const adObj = ad as Record<string, unknown>;

  const hasReservationKey = Object.prototype.hasOwnProperty.call(
    adObj,
    "ad_reservation"
  );

  if (adObj.draft === true) {
    return "draft";
  }

  if (adObj.rejected) {
    return "rejected";
  }

  if (adObj.banned) {
    return "banned";
  }

  if (
    adObj.active &&
    !adObj.banned &&
    !adObj.rejected &&
    (adObj.remaining_days as number) > 0
  ) {
    return "active";
  }

  if (
    !adObj.active &&
    !adObj.banned &&
    !adObj.rejected &&
    adObj.remaining_days === 0
  ) {
    return "archived";
  }

  if (
    !adObj.active &&
    !adObj.banned &&
    !adObj.rejected &&
    (adObj.remaining_days as number) > 0 &&
    (!hasReservationKey || adObj.ad_reservation != null)
  ) {
    return "pending";
  }

  return "unknown";
}

/**
 * Helper function to transform sort parameter from string to object format
 * @param {string|object} sort - Sort parameter (e.g., "createdAt:asc" or {createdAt: "asc"})
 * @returns {object} Transformed sort object for Strapi query
 */
function transformSortParameter(sort: unknown): unknown {
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
  options: AdQueryOptions,
  defaultFilters: Record<string, unknown>,
  status: string,
  postProcessFilter?: (ads: unknown[]) => unknown[]
) {
  try {
    // Merge default filters with any additional filters provided
    const filters = {
      ...defaultFilters,
      ...((options.filters as Record<string, unknown>) || {}),
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
      ad_featured_reservation: true, // Featured reservation
    };

    // Merge custom populates with defaults
    const populate = {
      ...defaultPopulate,
      ...((options.populate as Record<string, unknown>) || {}),
    };

    // Set up pagination parameters
    const page = options.page ? parseInt(String(options.page)) : 1;
    const pageSize = options.pageSize ? parseInt(String(options.pageSize)) : 25;
    const start = (page - 1) * pageSize;

    // Build the database query
    const query = {
      where: filters,
      populate,
      limit: pageSize,
      offset: start,
      orderBy: transformSortParameter(options.sort) as Record<string, string>,
    };

    // Execute query and count in parallel for better performance
    const [ads, total] = await Promise.all([
      strapi.db.query("api::ad.ad").findMany(query),
      strapi.db.query("api::ad.ad").count({ where: filters }),
    ]);

    // Add needs_payment and status fields to all ads
    const adsWithPaymentStatusAndState = ads.map((ad) => {
      const pack = ad.details?.pack;
      const hasOrder = ad.order !== null;
      const isFeatured = !!ad.ad_featured_reservation?.id;

      let needs_payment = false;

      if (typeof pack === "number") {
        needs_payment = !hasOrder;
      } else if (isFeatured) {
        needs_payment = !hasOrder;
      }

      const status = computeAdStatus(ad);

      return {
        status,
        ...ad,
        needs_payment,
        featured: isFeatured,
      };
    });

    // Apply post-processing filter if provided
    const processedAds = postProcessFilter
      ? postProcessFilter(adsWithPaymentStatusAndState)
      : adsWithPaymentStatusAndState;

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
  async findOne(id: string | number, options: AdQueryOptions = {}) {
    // In Strapi v5 the REST API passes documentId (string) as the id parameter.
    // Use documentId for string lookups, numeric id for number lookups.
    const where =
      typeof id === "string" && isNaN(Number(id))
        ? { documentId: id }
        : { id: Number(id) };
    // Call the original findOne method
    const ad = await strapi.db.query("api::ad.ad").findOne({
      where,
      ...(options as Record<string, unknown>),
    });

    if (!ad) return null;

    // Calculate and add status field using shared helper
    const status = computeAdStatus(ad);

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
  async findMany(options: AdQueryOptions = {}) {
    // Set default sorting by name if no sort is provided
    const queryOptions = {
      ...options,
      orderBy: options.orderBy || { name: "asc" },
    } as Record<string, unknown>;

    // Call the original findMany method with all options (including orderBy)
    const ads = await strapi.db.query("api::ad.ad").findMany(queryOptions);

    // Add status field to each advertisement using shared helper
    const adsWithStatus = ads.map((ad) => {
      const status = computeAdStatus(ad);

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
  async activeAds(options: AdQueryOptions = {}) {
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
  async pendingAds(options: AdQueryOptions = {}) {
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
  async archivedAds(options: AdQueryOptions = {}) {
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
  async bannedAds(options: AdQueryOptions = {}) {
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
  async rejectedAds(options: AdQueryOptions = {}) {
    const defaultFilters = {
      rejected: { $eq: true },
    };

    return getAdvertisements(options, defaultFilters, "rejected");
  },

  /**
   * Retrieve draft advertisements
   *
   * Ads that have draft === true. The draft field is the authoritative
   * source of truth for draft state.
   */
  async draftAds(options: AdQueryOptions = {}) {
    const defaultFilters = {
      draft: { $eq: true },
    };

    return getAdvertisements(options, defaultFilters, "draft");
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

      // ── EVT-02 guard: capture first-publish state before update ──────────────────
      // ad.active is the pre-update value. isPending already ensures active===false,
      // so isFirstPublish is always true here. Guard is explicit for EVT-02 clarity
      // and to protect against future changes to the isPending check.
      const isFirstPublish = ad.active !== true;

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

      // ── EVT-01: Zoho CRM sync — floating promise (non-blocking) ──────────────────
      // Fires only on first-publish transition (EVT-02 guard).
      // No Deal created — only Contact stats updated.
      if (isFirstPublish) {
        const _zohoEmail = ad.user?.email;
        Promise.resolve()
          .then(async () => {
            if (!_zohoEmail) return;
            const contact = await zohoService.findContact(_zohoEmail);
            if (!contact) {
              logger.info(
                "Zoho contact not found for ad approval — skipping CRM sync",
                { adId }
              );
              return;
            }
            const lastAdPostedAt = new Date().toISOString().split("T")[0];
            await zohoService.updateContactStats(contact.id, {
              Ads_Published__c: 1,
              Last_Ad_Posted_At__c: lastAdPostedAt,
            });
          })
          .catch((zohoError) => {
            logger.error(
              "Zoho sync failed for ad approval — approval flow unaffected",
              { adId, error: zohoError.message }
            );
          });
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
        populate: ["user", "ad_reservation", "ad_featured_reservation"],
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

      // Liberar reservas asociadas al anuncio rechazado
      if (ad.ad_reservation?.id) {
        await strapi.entityService.update(
          "api::ad-reservation.ad-reservation",
          ad.ad_reservation.id,
          { data: { ad: null } as unknown as Record<string, unknown> }
        );
      }
      if (ad.ad_featured_reservation?.id) {
        await strapi.entityService.update(
          "api::ad-featured-reservation.ad-featured-reservation",
          ad.ad_featured_reservation.id,
          { data: { ad: null } as unknown as Record<string, unknown> }
        );
      }

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
              adReservationReturned: !!ad.ad_reservation?.id,
              featuredReservationReturned: !!ad.ad_featured_reservation?.id,
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
        populate: ["user", "ad_reservation", "ad_featured_reservation"],
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

      // Liberar reservas asociadas al anuncio baneado
      if (ad.ad_reservation?.id) {
        await strapi.entityService.update(
          "api::ad-reservation.ad-reservation",
          ad.ad_reservation.id,
          { data: { ad: null } as unknown as Record<string, unknown> }
        );
      }
      if (ad.ad_featured_reservation?.id) {
        await strapi.entityService.update(
          "api::ad-featured-reservation.ad-featured-reservation",
          ad.ad_featured_reservation.id,
          { data: { ad: null } as unknown as Record<string, unknown> }
        );
      }

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
              adReservationReturned: !!ad.ad_reservation?.id,
              featuredReservationReturned: !!ad.ad_featured_reservation?.id,
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

  /**
   * Find an advertisement by slug with server-side access control.
   *
   * Access rules:
   * 1. Always fetch the ad (no filters) — if not found → null
   * 2. Public (no userId): only active ads
   * 3. Authenticated:
   *    - Manager (role.name.toLowerCase() === "manager") → always, any status
   *    - active → always
   *    - pending + owner (ad.user.id === userId) → allowed
   *    - anything else → null
   *
   * Returns the ad plus an `access` object with role, status, and a contextual message.
   *
   * @param slug - The advertisement slug
   * @param userId - The authenticated user's numeric ID, or null for anonymous callers
   */
  async findBySlug(slug: string, userId?: number | null) {
    const POPULATE = {
      user: true,
      commune: { populate: ["region"] },
      category: true,
      condition: true,
      gallery: true,
      ad_reservation: true,
      ad_featured_reservation: true,
    };

    // Step 1: always fetch — no active/publishedAt filters
    const ad = await strapi.db.query("api::ad.ad").findOne({
      where: { slug },
      populate: POPULATE,
    });

    if (!ad) return null;

    const adRecord = ad as Record<string, any>;
    const status = computeAdStatus(ad);

    // Step 2: public (no token)
    if (!userId) {
      if (status === "active") {
        return {
          ad: { ...ad, status },
          access: { role: "public", status, message: null },
        };
      }
      return null;
    }

    // Step 3: authenticated — fetch user role once
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: userId }, populate: ["role"] });

    const userRecord = user as Record<string, any>;
    const roleName = ((userRecord?.role?.name as string) ?? "").toLowerCase();
    const isManager = roleName === "manager";
    const isOwner = adRecord.user?.id === userId;

    const statusLabels: Record<string, string> = {
      active: "activo",
      pending: "en revisión",
      archived: "archivado",
      banned: "baneado",
      rejected: "rechazado",
      draft: "borrador",
      unknown: "desconocido",
    };
    const statusLabel = statusLabels[status] ?? status;

    // Manager sees everything
    if (isManager) {
      return {
        ad: { ...ad, status },
        access: {
          role: "manager",
          status,
          message: `Estás viendo este anuncio como manager. Estado: ${statusLabel}`,
        },
      };
    }

    // Active — any authenticated user
    if (status === "active") {
      return {
        ad: { ...ad, status },
        access: { role: "owner", status, message: null },
      };
    }

    // Pending + owner
    if (status === "pending" && isOwner) {
      return {
        ad: { ...ad, status },
        access: {
          role: "owner",
          status,
          message: "Este anuncio está en revisión. Solo tú puedes verlo.",
        },
      };
    }

    return null;
  },

  /**
   * Find an advertisement by documentId for the thank-you page (owner only).
   *
   * Uses strapi.db.query to bypass the publishedAt filter — pending ads are valid.
   * Returns null if the ad is not found or if the requesting user is not the owner.
   *
   * @param documentId - The advertisement documentId (Strapi v5)
   * @param userId - The authenticated user's numeric ID
   */
  async findByDocumentIdForOwner(documentId: string, userId: number) {
    const ad = await strapi.db.query("api::ad.ad").findOne({
      where: { documentId },
      populate: {
        user: true,
        commune: true,
        category: true,
        condition: true,
        gallery: true,
        ad_reservation: true,
        ad_featured_reservation: true,
      },
    });

    if (!ad) return null;

    const adRecord = ad as Record<string, any>;
    if (adRecord.user?.id !== userId) return null;

    return ad;
  },

  /**
   * Save an ad as a draft (create or update with draft: true).
   * Used before payment processing to persist the ad data.
   *
   * @param ad - The ad payload from the frontend
   * @param userId - The authenticated user ID
   * @returns Object with success status and the draft ad ID
   */
  async saveDraft(ad: Record<string, unknown>, userId: string) {
    try {
      const adId = ad.ad_id as number | undefined;

      // Extract only schema-known fields, normalizing gallery to ID array
      const galleryRaw = ad.gallery;
      const gallery = Array.isArray(galleryRaw)
        ? (galleryRaw as Array<{ id?: number | string } | number>).map((item) =>
            typeof item === "object" && item !== null && "id" in item
              ? Number(item.id)
              : Number(item)
          )
        : [];

      const adPayload = {
        name: ad.name,
        description: ad.description,
        address: ad.address,
        address_number: ad.address_number,
        phone: ad.phone,
        email: ad.email,
        year: ad.year,
        manufacturer: ad.manufacturer,
        model: ad.model,
        serial_number: ad.serial_number,
        weight: ad.weight,
        width: ad.width,
        height: ad.height,
        depth: ad.depth,
        commune: ad.commune,
        condition: ad.condition,
        category: ad.category,
        currency: ad.currency as "CLP" | "USD",
        price: ad.price,
        gallery,
      };

      if (!adId) {
        const timestamp = Date.now();
        const baseName = typeof ad.name === "string" ? ad.name : "borrador";
        const slug = `${baseName}-${timestamp}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, "");

        const newAd = await strapi.service("api::ad.ad").create({
          data: {
            ...adPayload,
            slug,
            user: userId,
            draft: true,
            duration_days: 15,
            remaining_days: 15,
          },
        });

        logger.info("Borrador de anuncio creado", {
          userId,
          adId: newAd.id,
        });

        return { success: true, id: newAd.id };
      }

      await strapi.entityService.update("api::ad.ad", adId, {
        data: {
          ...adPayload,
          draft: true,
        } as unknown as Parameters<
          typeof strapi.entityService.update
        >[2]["data"],
      });

      logger.info("Borrador de anuncio actualizado", {
        userId,
        adId,
      });

      return { success: true, id: adId };
    } catch (error) {
      console.error("Error al guardar borrador de anuncio:", error);
      logger.error("Error al guardar borrador de anuncio", {
        userId,
        error: (error as Error).message,
      });
      return { success: false, message: (error as Error).message };
    }
  },
}));
