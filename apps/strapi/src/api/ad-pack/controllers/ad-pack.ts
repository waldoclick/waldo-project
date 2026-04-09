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
    const adPacks = await strapi.db.query("api::ad-pack.ad-pack").findMany({
      where: filters,
      populate: query.populate || "*",
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: query.sort || { name: "asc" },
    });

    // Get total count
    const total = await strapi.db.query("api::ad-pack.ad-pack").count({
      where: filters,
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
    const adPack = await strapi.db.query("api::ad-pack.ad-pack").findOne({ where: { id } });
    return { data: adPack };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const adPack = await strapi.db.query("api::ad-pack.ad-pack").create({ data });
    return { data: adPack };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const adPack = await strapi.db.query("api::ad-pack.ad-pack").update({ where: { id }, data });
    return { data: adPack };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const adPack = await strapi.db.query("api::ad-pack.ad-pack").delete({ where: { id } });
    return { data: adPack };
  },
};
