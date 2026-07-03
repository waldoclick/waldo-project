/**
 * Shared find/findOne/create/update/delete/reorder implementation for the
 * simple "maintainer" content types (term, faq, category, commune,
 * condition, region, policy, cookie-policy, security-policy) that all
 * duplicated the same logic parameterized only by content-type UID.
 */

interface ListControllerConfig {
  uid: string;
  /** Default sort applied when the request has no `sort` query param. */
  defaultOrderBy?: Record<string, string>;
  /** Relations to populate on `findOne`, in addition to the entry itself. */
  findOnePopulate?: string[];
}

/**
 * `strapi.documents()` types its UID argument as the literal union generated
 * from each content-type's schema, so a runtime `string` can't be passed
 * directly. This factory is intentionally parameterized by UID across
 * content types, so the cast is required here.
 */
const documentsFor = (uid: string) =>
  strapi.documents(uid as Parameters<typeof strapi.documents>[0]);

export const createListController = ({
  uid,
  defaultOrderBy = { createdAt: "desc" },
  findOnePopulate,
}: ListControllerConfig) => ({
  async find(ctx) {
    const { query } = ctx;

    const page = parseInt(query.pagination?.page || "1", 10);
    const pageSize = parseInt(query.pagination?.pageSize || "25", 10);

    const filters = query.filters || {};

    const populate =
      !query.populate || query.populate === "*" ? true : query.populate;

    let orderBy: Record<string, string> = defaultOrderBy;
    if (query.sort) {
      const s = Array.isArray(query.sort) ? query.sort[0] : query.sort;
      if (typeof s === "string" && s.includes(":")) {
        const [f, d] = s.split(":");
        orderBy = { [f]: d.toLowerCase() };
      } else if (s && typeof s === "object") {
        orderBy = s as Record<string, string>;
      }
    }

    const entries = await strapi.db.query(uid).findMany({
      where: filters,
      populate: populate as unknown as Record<string, unknown>,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      orderBy,
    });

    const total = await strapi.db.query(uid).count({ where: filters });
    const pageCount = Math.ceil(total / pageSize);

    return {
      data: entries,
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
    // `populate` is typed against ContentType's own relation names, which a
    // generic factory can't know ahead of time — same rationale as `uid`.
    const params = (
      findOnePopulate
        ? { documentId, populate: findOnePopulate }
        : { documentId }
    ) as Parameters<ReturnType<typeof documentsFor>["findOne"]>[0];
    const entry = await documentsFor(uid).findOne(params);
    return { data: entry };
  },

  async create(ctx) {
    const { data } = ctx.request.body;
    const entry = await strapi.db.query(uid).create({ data });
    return { data: entry };
  },

  async update(ctx) {
    const { id: documentId } = ctx.params;
    const { data } = ctx.request.body;
    const entry = await documentsFor(uid).update({ documentId, data });
    return { data: entry };
  },

  async delete(ctx) {
    const { id: documentId } = ctx.params;
    const entry = await documentsFor(uid).delete({ documentId });
    return { data: entry };
  },
});

/**
 * Reorders entries by documentId. Used by the maintainer lists that expose
 * a drag-to-reorder UI in the dashboard (term, faq, policy, cookie-policy,
 * security-policy).
 */
export const createReorderController = (uid: string) => async (ctx) => {
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
      documentsFor(uid).update({
        documentId: entry.documentId as string,
        data: { order: entry.order } as unknown as Record<string, unknown>,
      }),
    ),
  );
  return { data: { count: data.length } };
};
