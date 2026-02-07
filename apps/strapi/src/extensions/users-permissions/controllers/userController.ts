// /src/extensions/users-permissions/controllers/userController.ts

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
    (ad) => ad.active === true && ad.rejected === false
  ).length;

  // Count the ads under review
  const inReviewAdsCount = userAds.results.filter(
    (ad) => ad.active === false && ad.rejected === false
  ).length;

  // Count the rejected ads
  const rejectedAdsCount = userAds.results.filter(
    (ad) => ad.rejected === true
  ).length;

  const totalAdsCount = publishedAdsCount + inReviewAdsCount + rejectedAdsCount;

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
  };
};

/**
 * Retrieves detailed data for the authenticated user.
 * @param {Object} ctx - The Koa context object.
 * @returns {Object} The detailed user data.
 */
export const getUserData = async (ctx) => {
  const userId = ctx.state.user.id;

  // Call the original controller
  const user = await strapi.query("plugin::users-permissions.user").findOne({
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
  const userId = ctx.params.id;

  // Call the original controller
  const user = await strapi.query("plugin::users-permissions.user").findOne({
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
 * Retrieves detailed data for users with filters and pagination.
 * @param {Object} ctx - The Koa context object.
 */
export const getUserDataWithFilters = async (ctx) => {
  const { filters, pagination = {} } = ctx.query;

  // Extract pagination parameters correctly
  const page = parseInt(pagination.page || "1", 10);
  const pageSize = parseInt(pagination.pageSize || "25", 10);

  // Call the original controller
  const [users, total] = await strapi.db
    .query("plugin::users-permissions.user")
    .findWithCount({
      where: filters,
      populate: {
        role: true,
        commune: {
          populate: ["region"], // Ensure to include the 'region' relation within 'commune'
        },
        avatar: true,
        cover: true,
      },
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

  const detailedUsers = await Promise.all(
    users.map(async (user) => {
      return await getDetailedUserData(user);
    })
  );

  ctx.body = {
    data: detailedUsers,
    meta: {
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        pageCount: Math.ceil(total / Number(pageSize)),
        total,
      },
    },
  };
};
