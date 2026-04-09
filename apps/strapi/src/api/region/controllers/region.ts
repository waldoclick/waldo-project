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
    const regions = await strapi.db.query("api::region.region").findMany({
      where: filters,
      populate: query.populate || "*",
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: query.sort || { name: "asc" },
    });

    // Get total count
    const total = await strapi.db.query("api::region.region").count({
      where: filters,
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
    const region = await strapi.db.query("api::region.region").findOne({
      where: { id },
      populate: ["communes"],
    });
    return { data: region };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const region = await strapi.db.query("api::region.region").create({ data });
    return { data: region };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const region = await strapi.db.query("api::region.region").update({ where: { id }, data });
    return { data: region };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const region = await strapi.db.query("api::region.region").delete({ where: { id } });
    return { data: region };
  },
};
