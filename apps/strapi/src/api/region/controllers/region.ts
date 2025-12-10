/**
 * region controller
 */

export default {
  async find(ctx) {
    const { query } = ctx;

    // Extract pagination parameters
    const page = parseInt(query.pagination?.page || "1", 10);
    const pageSize = parseInt(query.pagination?.pageSize || "25", 10);

    // Build filters
    const filters = query.filters || {};

    // Get regions with pagination
    const regions = await strapi.entityService.findMany("api::region.region", {
      filters,
      populate: query.populate || "*",
      start: (page - 1) * pageSize,
      limit: pageSize,
      sort: query.sort || { name: "asc" },
    });

    // Get total count
    const total = await strapi.entityService.count("api::region.region", {
      filters,
    });

    // Calculate pagination values
    const pageCount = Math.ceil(total / pageSize);

    return {
      data: regions,
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
    const region = await strapi.entityService.findOne(
      "api::region.region",
      id,
      {
        populate: ["communes"],
      }
    );
    return { data: region };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const region = await strapi.entityService.create("api::region.region", {
      data,
    });
    return { data: region };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const region = await strapi.entityService.update("api::region.region", id, {
      data,
    });
    return { data: region };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const region = await strapi.entityService.delete("api::region.region", id);
    return { data: region };
  },
};
