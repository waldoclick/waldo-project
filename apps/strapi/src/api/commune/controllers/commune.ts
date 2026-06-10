/**
 * commune controller
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

    const communes = await strapi.db.query("api::commune.commune").findMany({
      where: filters,
      populate: populate as unknown as Record<string, unknown>,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy,
    });

    const total = await strapi.db.query("api::commune.commune").count({
      where: filters,
    });

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
    const { id: documentId } = ctx.params;
    const commune = await strapi
      .documents("api::commune.commune")
      .findOne({ documentId, populate: ["region"] });
    return { data: commune };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const commune = await strapi.db
      .query("api::commune.commune")
      .create({ data });
    return { data: commune };
  },

  async update(ctx) {
    const { id: documentId } = ctx.params;
    const { data } = ctx.request.body;
    const commune = await strapi
      .documents("api::commune.commune")
      .update({ documentId, data });
    return { data: commune };
  },

  async delete(ctx) {
    const { id: documentId } = ctx.params;
    const commune = await strapi
      .documents("api::commune.commune")
      .delete({ documentId });
    return { data: commune };
  },
};
