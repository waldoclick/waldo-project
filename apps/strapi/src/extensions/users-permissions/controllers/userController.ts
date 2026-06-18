// /src/extensions/users-permissions/controllers/userController.ts

// Pure contact-mask helpers (08-04) — imported from the ad api service file
// directly (NOT via an index that re-exports the ad factory default) so no
// controller/service factory side effects leak into this plugin extension.
import { maskEmail, maskPhone } from "../../../api/ad/services/contact-mask";

const PAGE_SIZE = 500;

/**
 * Retrieves detailed user data by removing sensitive information and adding additional details.
 * @param {Object} user - The user object.
 * @returns {Object} The detailed user data.
 */
const getDetailedUserData = async (user) => {
  delete user.password;
  // delete user.provider;
  delete user.resetPasswordToken;
  delete user.confirmationToken;
  // delete user.role;

  // Contar directamente las reservas gratuitas sin ad asignado
  const freeAdReservationsCount = await strapi.db
    .query("api::ad-reservation.ad-reservation")
    .count({
      where: {
        ad: null,
        user: user.id,
        price: 0,
      },
    });

  // Contar directamente las reservas pagadas sin ad asignado
  const paidAdReservationsCount = await strapi.db
    .query("api::ad-reservation.ad-reservation")
    .count({
      where: {
        ad: null,
        user: user.id,
        price: { $gt: 0 },
      },
    });

  // Contar directamente las reservas featured sin ad asignado
  const adFeaturedReservationsCount = await strapi.db
    .query("api::ad-featured-reservation.ad-featured-reservation")
    .count({
      where: {
        ad: null,
        user: user.id,
        price: 0,
      },
    });

  // Fetch the user's ads
  const adService = strapi.service("api::ad.ad");
  const userAds = await adService.find({
    filters: {
      user: user.id,
    },
    pagination: {
      pageSize: PAGE_SIZE, // Adjust this value as needed to get all results
    },
  });

  // Count the published ads
  const publishedAdsCount = userAds.results.filter(
    (ad) => ad.active === true && ad.rejected === false,
  ).length;

  // Count the ads under review
  const inReviewAdsCount = userAds.results.filter(
    (ad) => ad.active === false && ad.rejected === false,
  ).length;

  // Count the rejected ads
  const rejectedAdsCount = userAds.results.filter(
    (ad) => ad.rejected === true,
  ).length;

  const totalAdsCount = publishedAdsCount + inReviewAdsCount + rejectedAdsCount;

  // Fetch card data from subscription-pro (card_type, card_last4)
  const subPro = (await strapi.db
    .query("api::subscription-pro.subscription-pro")
    .findOne({
      where: { user: { id: user.id } },
      select: ["card_type", "card_last4"],
    })) as { card_type?: string | null; card_last4?: string | null } | null;

  // Fetch period_end from the latest approved subscription-payment (replaces pro_expires_at)
  const latestPayment = (await strapi.db
    .query("api::subscription-payment.subscription-payment")
    .findOne({
      where: { user: { id: user.id }, status: "approved" },
      select: ["period_end"],
      orderBy: { period_end: "desc" },
    })) as { period_end?: string | null } | null;

  // Combine additional data with user data
  return {
    ...user,
    freeAdReservationsCount,
    paidAdReservationsCount,
    adFeaturedReservationsCount,
    publishedAdsCount,
    inReviewAdsCount,
    rejectedAdsCount,
    totalAdsCount,
    // PRO card info (from subscription-pro, was previously on user)
    pro_card_type: subPro?.card_type ?? null,
    pro_card_last4: subPro?.card_last4 ?? null,
    // PRO period end (from subscription-payment, replaces user.pro_expires_at)
    pro_expires_at: latestPayment?.period_end ?? null,
  };
};

/**
 * Retrieves detailed data for the authenticated user.
 * @param {Object} ctx - The Koa context object.
 * @returns {Object} The detailed user data.
 */
export const getUserData = async (ctx) => {
  const userId = Number(ctx.state.user.id);

  // Call the original controller
  const user = await strapi.db.query("plugin::users-permissions.user").findOne({
    where: { id: userId },
    populate: {
      role: true,
      commune: {
        populate: ["region"], // Ensure to include the 'region' relation within 'commune'
      },
      business_commune: {
        populate: ["region"], // Ensure to include the 'region' relation within 'commune'
      },
      avatar: true,
      cover: true,
    },
  });

  if (!user) {
    return ctx.badRequest("User not found");
  }

  // Debug log para verificar el role
  console.log("User role:", user.role);

  const detailedUser = await getDetailedUserData(user);
  return detailedUser;
};

/**
 * Retrieves detailed data for a user by their ID.
 * @param {Object} ctx - The Koa context object.
 * @returns {Object} The detailed user data.
 */
export const getUserDataById = async (ctx) => {
  const userId = Number(ctx.params.id);

  // Call the original controller
  const user = await strapi.db.query("plugin::users-permissions.user").findOne({
    where: { id: userId },
    populate: {
      role: true,
      region: true,
      commune: {
        populate: ["region"], // Ensure to include the 'region' relation within 'commune'
      },
      business_region: true,
      business_commune: {
        populate: ["region"],
      },
      avatar: true,
      cover: true,
    },
  });

  if (!user) {
    return ctx.badRequest("User not found");
  }

  const detailedUser = await getDetailedUserData(user);
  return detailedUser;
};

/**
 * Parses a sort string like "createdAt:desc" into { createdAt: "desc" }
 * as required by strapi.db.query orderBy.
 */
const parseSortParam = (sort?: string): Record<string, "asc" | "desc"> => {
  if (!sort) return { createdAt: "desc" };
  const [field, direction] = sort.split(":");
  return { [field]: direction === "asc" ? "asc" : "desc" };
};

/**
 * Retrieves users with server-enforced Authenticated role filter, pagination, sort, and client filters.
 * Does NOT call getDetailedUserData — no N+1 query problem.
 * @param {Object} ctx - The Koa context object.
 */
// Allowed filter keys for the users list endpoint — prevents PII filter abuse
const ALLOWED_FILTER_KEYS = [
  "username",
  "commune",
  "region",
  "is_company",
  "pro_status",
] as const;

// PII fields stripped from list responses for non-managers
const PII_FIELDS = [
  "email",
  "phone",
  "rut",
  "address",
  "address_number",
  "postal_code",
  "birthdate",
  "business_rut",
  "business_address",
] as const;

export const getUserDataWithFilters = async (ctx) => {
  const { filters: clientFilters = {}, pagination = {}, sort } = ctx.query;

  const page = parseInt((pagination as Record<string, string>).page || "1", 10);
  const pageSize = parseInt(
    (pagination as Record<string, string>).pageSize || "25",
    10,
  );

  // Whitelist client-supplied filter keys — drop any key not in ALLOWED_FILTER_KEYS
  // to prevent PII filter abuse (e.g. email $contains enumeration attack)
  const rawFilters = (clientFilters as Record<string, unknown>) ?? {};
  const safeFilters = Object.fromEntries(
    Object.entries(rawFilters).filter(([key]) =>
      (ALLOWED_FILTER_KEYS as readonly string[]).includes(key),
    ),
  );

  // Server-enforced: only return real human users — non-forgeable from client.
  // "authenticated" and "manager" are both regular user roles (manager only adds
  // /dashboard access); both must appear in public seller profiles. The "public"
  // (unauthenticated) and any system roles are excluded. The content-API
  // sanitizer strips `filters[role]` for regular JWTs, so this controller uses
  // strapi.db.query directly to bypass that restriction.
  const userRoles = await strapi.db
    .query("plugin::users-permissions.role")
    .findMany({ where: { type: { $in: ["authenticated", "manager"] } } });
  const userRoleIds = userRoles.map((r: { id: number }) => r.id);

  const where = {
    ...safeFilters,
    ...(userRoleIds.length ? { role: { id: { $in: userRoleIds } } } : {}),
  };

  const [users, total] = await strapi.db
    .query("plugin::users-permissions.user")
    .findWithCount({
      where,
      populate: {
        role: true,
        commune: { populate: ["region"] },
        avatar: true,
        cover: true,
      },
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: parseSortParam(sort as string | undefined),
    });

  // Determine if caller is a manager — managers retain PII fields in the response
  const isManager =
    (
      (ctx.state.user as { role?: { name?: string } })?.role?.name ?? ""
    ).toLowerCase() === "manager";

  // Sanitize sensitive fields without calling getDetailedUserData (avoids N+1).
  // Strips always: password, resetPasswordToken, confirmationToken.
  // Strips for non-managers: PII_FIELDS (email, phone, rut, address, etc.)
  const sanitizedUsers = (users as Record<string, unknown>[]).map((user) => {
    const {
      password: _password,
      resetPasswordToken: _resetPasswordToken,
      confirmationToken: _confirmationToken,
      ...safe
    } = user as {
      password?: unknown;
      resetPasswordToken?: unknown;
      confirmationToken?: unknown;
      [key: string]: unknown;
    };
    if (!isManager) {
      for (const field of PII_FIELDS) {
        delete (safe as Record<string, unknown>)[field];
      }
      // Obfuscate contact channels for the public profile card (08-04); real
      // values only via the per-channel /ads|/sellers reveal endpoints. This
      // re-adds email/phone MASKED (PII_FIELDS deleted them above) and masks
      // whatsapp (which was NOT in PII_FIELDS and previously leaked raw).
      const rawUser = user as Record<string, unknown>;
      const safeRecord = safe as Record<string, unknown>;
      safeRecord.email = maskEmail(rawUser.email as string);
      safeRecord.phone = maskPhone(rawUser.phone as string);
      safeRecord.whatsapp = maskPhone(rawUser.whatsapp as string);
      safeRecord.has_email = !!rawUser.email;
      safeRecord.has_phone = !!rawUser.phone;
      safeRecord.has_whatsapp = !!rawUser.whatsapp;
    }
    return safe;
  });

  ctx.body = {
    data: sanitizedUsers,
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        total,
      },
    },
  };
};

/**
 * Returns all users with the Authenticated role, selecting only id, firstName, lastName.
 * Server-enforced role filter — cannot be forged by the client.
 * Used by the dashboard gift lightbox user-select (GIFT-08).
 * @param {Object} ctx - The Koa context object.
 */
export const getAuthenticatedUsers = async (ctx) => {
  const authenticatedRole = await strapi.db
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "authenticated" } });

  if (!authenticatedRole) {
    ctx.body = { data: [] };
    return;
  }

  const users = await strapi.db
    .query("plugin::users-permissions.user")
    .findMany({
      where: { role: { id: authenticatedRole.id } },
      select: ["id", "firstName", "lastName"],
      orderBy: { lastName: "asc" },
    });

  ctx.body = { data: users };
};
