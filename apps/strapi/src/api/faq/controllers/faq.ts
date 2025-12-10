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
    const faqs = await strapi.entityService.findMany("api::faq.faq", {
      filters,
      populate: query.populate || "*",
      start: (page - 1) * pageSize,
      limit: pageSize,
      sort: query.sort || { createdAt: "desc" },
    });

    // Get total count
    const total = await strapi.entityService.count("api::faq.faq", {
      filters,
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
    const faq = await strapi.entityService.findOne("api::faq.faq", id);
    return { data: faq };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const faq = await strapi.entityService.create("api::faq.faq", {
      data,
    });
    return { data: faq };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const faq = await strapi.entityService.update("api::faq.faq", id, {
      data,
    });
    return { data: faq };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const faq = await strapi.entityService.delete("api::faq.faq", id);
    return { data: faq };
  },
};
