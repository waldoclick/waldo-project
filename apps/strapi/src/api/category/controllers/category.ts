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

    // Get categories with pagination
    const categories = await strapi.entityService.findMany(
      "api::category.category",
      {
        filters,
        populate: query.populate || "*",
        start: (page - 1) * pageSize,
        limit: pageSize,
        sort: query.sort || { name: "asc" },
      }
    );

    // Get total count
    const total = await strapi.entityService.count("api::category.category", {
      filters,
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
    const category = await strapi.entityService.findOne(
      "api::category.category",
      id
    );
    return { data: category };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const category = await strapi.entityService.create(
      "api::category.category",
      {
        data,
      }
    );
    return { data: category };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const category = await strapi.entityService.update(
      "api::category.category",
      id,
      {
        data,
      }
    );
    return { data: category };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const category = await strapi.entityService.delete(
      "api::category.category",
      id
    );
    return { data: category };
  },

  async adCounts(ctx) {
    try {
      // Fetch all category IDs in one query
      const categories = await strapi.entityService.findMany(
        "api::category.category",
        {
          fields: ["id"],
          limit: -1,
        }
      );

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
