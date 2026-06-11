/**
 * category controller
 */

export default {
  async find(ctx) {
    const { query } = ctx;

    const page = parseInt(query.pagination?.page || "1", 10);
    const pageSize = parseInt(query.pagination?.pageSize || "25", 10);

    const filters = query.filters || {};

    const populate =
      !query.populate || query.populate === "*" ? true : query.populate;

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

    const categories = await strapi.db
      .query("api::category.category")
      .findMany({
        where: filters,
        populate: populate as unknown as Record<string, unknown>,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        orderBy,
      });

    const total = await strapi.db.query("api::category.category").count({
      where: filters,
    });

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
    const { id: documentId } = ctx.params;
    const category = await strapi
      .documents("api::category.category")
      .findOne({ documentId });
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
    const { id: documentId } = ctx.params;
    const { data } = ctx.request.body;
    const category = await strapi
      .documents("api::category.category")
      .update({ documentId, data });
    return { data: category };
  },

  async delete(ctx) {
    const { id: documentId } = ctx.params;
    const category = await strapi
      .documents("api::category.category")
      .delete({ documentId });
    return { data: category };
  },

  async adCounts(ctx) {
    try {
      const categories = await strapi.db
        .query("api::category.category")
        .findMany({
          select: ["id"],
        });

      const results = await Promise.all(
        categories.map(async (category) => {
          const count = await strapi.db.query("api::ad.ad").count({
            where: {
              category: { id: { $eq: category.id } },
            },
          });
          return { categoryId: category.id, count };
        }),
      );

      return ctx.send({ data: results });
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
