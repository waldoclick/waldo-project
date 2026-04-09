/**
 * faq controller
 */

export default {
  async find(ctx) {
    const { query } = ctx;

    // Extract pagination parameters
    const page = parseInt(query.pagination?.page || "1", 10);
    const pageSize = parseInt(query.pagination?.pageSize || "25", 10);

    // Build filters
    const filters = query.filters || {};

    // Get FAQs with pagination
    const faqs = await strapi.db.query("api::faq.faq").findMany({
      where: filters,
      populate: query.populate || "*",
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy: query.sort || { createdAt: "desc" },
    });

    // Get total count
    const total = await strapi.db.query("api::faq.faq").count({
      where: filters,
    });

    // Calculate pagination values
    const pageCount = Math.ceil(total / pageSize);

    return {
      data: faqs,
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
    const faq = await strapi.db
      .query("api::faq.faq")
      .findOne({ where: { id } });
    return { data: faq };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const faq = await strapi.db.query("api::faq.faq").create({ data });
    return { data: faq };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const faq = await strapi.db
      .query("api::faq.faq")
      .update({ where: { id }, data });
    return { data: faq };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const faq = await strapi.db.query("api::faq.faq").delete({ where: { id } });
    return { data: faq };
  },
};
