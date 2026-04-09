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
    const communes = await strapi.db.query("api::commune.commune").findMany({
      where: filters,
      populate: query.populate || "*",
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: query.sort || { name: "asc" },
    });

    // Get total count
    const total = await strapi.db.query("api::commune.commune").count({
      where: filters,
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
    const commune = await strapi.db.query("api::commune.commune").findOne({
      where: { id },
      populate: ["region"],
    });
    return { data: commune };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const commune = await strapi.db.query("api::commune.commune").create({ data });
    return { data: commune };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const commune = await strapi.db.query("api::commune.commune").update({ where: { id }, data });
    return { data: commune };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const commune = await strapi.db.query("api::commune.commune").delete({ where: { id } });
    return { data: commune };
  },
};
