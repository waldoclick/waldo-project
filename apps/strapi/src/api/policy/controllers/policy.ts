/**
 * policy controller
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

    // Get policies with pagination
    const policies = await strapi.db.query("api::policy.policy").findMany({
      where: filters,
      populate: populate as unknown as Record<string, unknown>,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy,
    });

    // Get total count
    const total = await strapi.db.query("api::policy.policy").count({
      where: filters,
    });

    // Calculate pagination values
    const pageCount = Math.ceil(total / pageSize);

    return {
      data: policies,
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
    const policy = await strapi.db
      .query("api::policy.policy")
      .findOne({ where: { id } });
    return { data: policy };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const policy = await strapi.db.query("api::policy.policy").create({ data });
    return { data: policy };
  },

  async update(ctx) {
    const { id } = ctx.params;
    const { data } = ctx.request.body;
    const numericId = Number(id);
    const isNumericId =
      Number.isInteger(numericId) &&
      numericId > 0 &&
      String(numericId) === String(id);
    const policy = isNumericId
      ? await strapi.db
          .query("api::policy.policy")
          .update({ where: { id: numericId }, data })
      : await strapi.db
          .query("api::policy.policy")
          .update({ where: { documentId: id }, data });
    return { data: policy };
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const policy = await strapi.db
      .query("api::policy.policy")
      .delete({ where: { id } });
    return { data: policy };
  },

  async reorder(ctx) {
    const { data } = ctx.request.body as {
      data?: Array<{ documentId?: string; order?: number }>;
    };
    if (!Array.isArray(data) || data.length === 0) {
      return ctx.badRequest("data must be a non-empty array");
    }
    // Validate every entry
    for (const entry of data) {
      if (!entry.documentId || typeof entry.documentId !== "string") {
        return ctx.badRequest("Every entry must have a string documentId");
      }
      if (typeof entry.order !== "number" || !Number.isFinite(entry.order)) {
        return ctx.badRequest("Every entry must have a numeric order");
      }
    }
    await Promise.all(
      data.map((entry) =>
        strapi.db.query("api::policy.policy").update({
          where: { documentId: entry.documentId },
          data: { order: entry.order },
        })
      )
    );
    return { data: { count: data.length } };
  },
};
