/**
 * commune controller
 */

export default {
  async find(ctx) {
    const { query } = ctx;

    // Extract pagination parameters
    const page = parseInt(query.pagination?.page || "1", 10);
    const pageSize = parseInt(query.pagination?.pageSize || "25", 10);

    // Build filters
    const filters = query.filters || {};

    // Get communes with pagination
    const communes = await strapi.entityService.findMany(
      "api::commune.commune",
      {
        filters,
        populate: query.populate || "*",
        start: (page - 1) * pageSize,
        limit: pageSize,
        sort: query.sort || { name: "asc" },
      }
    );

    // Get total count
    const total = await strapi.entityService.count("api::commune.commune", {
      filters,
    });

    // Calculate pagination values
    const pageCount = Math.ceil(total / pageSize);

    return {
      data: communes,
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
    const commune = await strapi.entityService.findOne(
      "api::commune.commune",
      id,
      {
        populate: ["region"],
      }
    );
    return { data: commune };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const commune = await strapi.entityService.create("api::commune.commune", {
      data,
    });
    return { data: commune };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const commune = await strapi.entityService.update(
      "api::commune.commune",
      id,
      {
        data,
      }
    );
    return { data: commune };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const commune = await strapi.entityService.delete(
      "api::commune.commune",
      id
    );
    return { data: commune };
  },
};
