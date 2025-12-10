/**
 * condition controller
 */

export default {
  async find(ctx) {
    const { query } = ctx;

    // Extract pagination parameters
    const page = parseInt(query.pagination?.page || "1", 10);
    const pageSize = parseInt(query.pagination?.pageSize || "25", 10);

    // Build filters
    const filters = query.filters || {};

    // Get conditions with pagination
    const conditions = await strapi.entityService.findMany(
      "api::condition.condition",
      {
        filters,
        populate: query.populate || "*",
        start: (page - 1) * pageSize,
        limit: pageSize,
        sort: query.sort || { name: "asc" },
      }
    );

    // Get total count
    const total = await strapi.entityService.count("api::condition.condition", {
      filters,
    });

    // Calculate pagination values
    const pageCount = Math.ceil(total / pageSize);

    return {
      data: conditions,
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
    const condition = await strapi.entityService.findOne(
      "api::condition.condition",
      id
    );
    return { data: condition };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const condition = await strapi.entityService.create(
      "api::condition.condition",
      {
        data,
      }
    );
    return { data: condition };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const condition = await strapi.entityService.update(
      "api::condition.condition",
      id,
      {
        data,
      }
    );
    return { data: condition };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const condition = await strapi.entityService.delete(
      "api::condition.condition",
      id
    );
    return { data: condition };
  },
};
