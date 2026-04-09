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

    // Normalize populate: db.query requires true (not "*") for all relations
    const populate =
      !query.populate || query.populate === "*" ? true : query.populate;

    // Normalize orderBy: db.query requires object { field: dir }, not "field:dir" string
    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (query.sort) {
      const s = Array.isArray(query.sort) ? query.sort[0] : query.sort;
      if (typeof s === "string" && s.includes(":")) {
        const [f, d] = s.split(":");
        orderBy = { [f]: d.toLowerCase() };
      } else if (s && typeof s === "object") {
        orderBy = s as Record<string, string>;
      }
    }

    // Get FAQs with pagination
    const faqs = await strapi.db.query("api::faq.faq").findMany({
      where: filters,
      populate: populate as unknown as Record<string, unknown>,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy,
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
