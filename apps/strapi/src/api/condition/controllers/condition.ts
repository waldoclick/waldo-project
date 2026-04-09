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
    const conditions = await strapi.db.query("api::condition.condition").findMany({
      where: filters,
      populate: query.populate || "*",
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: query.sort || { name: "asc" },
    });

    // Get total count
    const total = await strapi.db.query("api::condition.condition").count({
      where: filters,
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
    const condition = await strapi.db.query("api::condition.condition").findOne({ where: { id } });
    return { data: condition };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const condition = await strapi.db.query("api::condition.condition").create({ data });
    return { data: condition };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const condition = await strapi.db.query("api::condition.condition").update({ where: { id }, data });
    return { data: condition };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const condition = await strapi.db.query("api::condition.condition").delete({ where: { id } });
    return { data: condition };
  },
};
