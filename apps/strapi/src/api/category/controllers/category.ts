/**
 * category controller
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

    // Get categories with pagination
    const categories = await strapi.db
      .query("api::category.category")
      .findMany({
        where: filters,
        populate: populate as unknown as Record<string, unknown>,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        orderBy,
      });

    // Get total count
    const total = await strapi.db.query("api::category.category").count({
      where: filters,
    });

    // Calculate pagination values
    const pageCount = Math.ceil(total / pageSize);

    return {
      data: categories,
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
    const category = await strapi.db
      .query("api::category.category")
      .findOne({ where: { id } });
    return { data: category };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const category = await strapi.db
      .query("api::category.category")
      .create({ data });
    return { data: category };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const category = await strapi.db
      .query("api::category.category")
      .update({ where: { id }, data });
    return { data: category };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const category = await strapi.db
      .query("api::category.category")
      .delete({ where: { id } });
    return { data: category };
  },

  async adCounts(ctx) {
    try {
      // Fetch all category IDs in one query
      const categories = await strapi.db
        .query("api::category.category")
        .findMany({
          select: ["id"],
          limit: -1,
        });

      // Count ads per category using parallel DB queries — one count call
      // per category, but all launched in parallel (not sequentially)
      const results = await Promise.all(
        categories.map(async (category) => {
          const count = await strapi.db.query("api::ad.ad").count({
            where: {
              category: { id: { $eq: category.id } },
            },
          });
          return { categoryId: category.id, count };
        })
      );

      return ctx.send({ data: results });
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
