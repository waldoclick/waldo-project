/**
 * ad-pack controller
 */

export default {
  async find(ctx) {
    const { query } = ctx;

    // Extract pagination parameters
    const page = parseInt(query.pagination?.page || "1", 10);
    const pageSize = parseInt(query.pagination?.pageSize || "25", 10);

    // Build filters
    const filters = query.filters || {};

    // Get ad packs with pagination
    const adPacks = await strapi.entityService.findMany(
      "api::ad-pack.ad-pack",
      {
        filters,
        populate: query.populate || "*",
        start: (page - 1) * pageSize,
        limit: pageSize,
        sort: query.sort || { name: "asc" },
      }
    );

    // Get total count
    const total = await strapi.entityService.count("api::ad-pack.ad-pack", {
      filters,
    });

    // Calculate pagination values
    const pageCount = Math.ceil(total / pageSize);

    return {
      data: adPacks,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount,
          total,
        },
      },
    };
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const adPack = await strapi.entityService.findOne(
      "api::ad-pack.ad-pack",
      id
    );
    return { data: adPack };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const adPack = await strapi.entityService.create("api::ad-pack.ad-pack", {
      data,
    });
    return { data: adPack };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const adPack = await strapi.entityService.update(
      "api::ad-pack.ad-pack",
      id,
      {
        data,
      }
    );
    return { data: adPack };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const adPack = await strapi.entityService.delete(
      "api::ad-pack.ad-pack",
      id
    );
    return { data: adPack };
  },
};
