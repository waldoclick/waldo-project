/**
 * Article lifecycles
 * Generates the slug from the article title on create and update.
 */

import slugify from "slugify";
import type { Event } from "@strapi/database/dist/lifecycles";

export default {
  /**
   * Triggered before creating an article.
   * Sets slug from title if title is present.
   */
  async beforeCreate(event: Event) {
    const { data } = event.params;
    if (data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }
  },

  /**
   * Triggered before updating an article.
   * Regenerates slug if title is being changed.
   */
  async beforeUpdate(event: Event) {
    const { data, where } = event.params;
    if (data.title) {
      const existingArticle = await strapi.db
        .query("api::article.article")
        .findOne({
          where: { id: where.id },
          select: ["title"],
        });
      if (existingArticle && existingArticle.title !== data.title) {
        data.slug = slugify(data.title, { lower: true, strict: true });
      }
    }
  },
};
