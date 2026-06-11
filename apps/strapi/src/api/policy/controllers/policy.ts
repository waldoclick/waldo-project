/**
 * policy controller
 */

export default {
  async find(ctx) {
    const { query } = ctx;

    const page = parseInt(query.pagination?.page || "1", 10);
    const pageSize = parseInt(query.pagination?.pageSize || "25", 10);

    const filters = query.filters || {};

    const populate =
      !query.populate || query.populate === "*" ? true : query.populate;

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

    const policies = await strapi.db.query("api::policy.policy").findMany({
      where: filters,
      populate: populate as unknown as Record<string, unknown>,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy,
    });

    const total = await strapi.db.query("api::policy.policy").count({
      where: filters,
    });

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
    const { id: documentId } = ctx.params;
    const policy = await strapi
      .documents("api::policy.policy")
      .findOne({ documentId });
    return { data: policy };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const policy = await strapi.db.query("api::policy.policy").create({ data });
    return { data: policy };
  },

  async update(ctx) {
    const { id: documentId } = ctx.params;
    const { data } = ctx.request.body;
    const policy = await strapi
      .documents("api::policy.policy")
      .update({ documentId, data });
    return { data: policy };
  },

  async delete(ctx) {
    const { id: documentId } = ctx.params;
    const policy = await strapi
      .documents("api::policy.policy")
      .delete({ documentId });
    return { data: policy };
  },

  async reorder(ctx) {
    const { data } = ctx.request.body as {
      data?: Array<{ documentId?: string; order?: number }>;
    };
    if (!Array.isArray(data) || data.length === 0) {
      return ctx.badRequest("data must be a non-empty array");
    }
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
        strapi.documents("api::policy.policy").update({
          documentId: entry.documentId as string,
          data: { order: entry.order } as unknown as Record<string, unknown>,
        }),
      ),
    );
    return { data: { count: data.length } };
  },
};
