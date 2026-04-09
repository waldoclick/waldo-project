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

    // Normalize populate: db.query requires true (not "*") for all relations
    const populate =
      !query.populate || query.populate === "*" ? true : query.populate;

    // Normalize orderBy: db.query requires object { field: dir }, not "field:dir" string
    let orderBy: Record<string, string> = { name: "asc" };
    if (query.sort) {
      const s = Array.isArray(query.sort) ? query.sort[0] : query.sort;
      if (typeof s === "string" && s.includes(":")) {
        const [f, d] = s.split(":");
        orderBy = { [f]: d.toLowerCase() };
      } else if (s && typeof s === "object") {
        orderBy = s as Record<string, string>;
      }
    }

    // Get ad packs with pagination
    const adPacks = await strapi.db.query("api::ad-pack.ad-pack").findMany({
      where: filters,
      populate: populate as unknown as Record<string, unknown>,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy,
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
    const adPack = await strapi.db
      .query("api::ad-pack.ad-pack")
      .findOne({ where: { id } });
    return { data: adPack };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const adPack = await strapi.db
      .query("api::ad-pack.ad-pack")
      .create({ data });
    return { data: adPack };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const adPack = await strapi.db
      .query("api::ad-pack.ad-pack")
      .update({ where: { id }, data });
    return { data: adPack };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const adPack = await strapi.db
      .query("api::ad-pack.ad-pack")
      .delete({ where: { id } });
    return { data: adPack };
  },
};
