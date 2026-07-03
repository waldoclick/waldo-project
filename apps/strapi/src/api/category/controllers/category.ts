/**
 * category controller
 */

import { createListController } from "../../../utils/list-controller";

const UID = "api::category.category";

export default {
  ...createListController({ uid: UID, defaultOrderBy: { name: "asc" } }),

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
