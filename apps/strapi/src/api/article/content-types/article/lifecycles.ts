/**
 * Article lifecycles
 * Generates the slug from the article title on create and update.
 */

import slugify from "slugify";

export default {
  /**
   * Triggered before creating an article.
   * Sets slug from title if title is present.
   */
  async beforeCreate(event: any) {
    const { data } = event.params;
    if (data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }
  },

  /**
   * Triggered before updating an article.
   * Regenerates slug if title is being changed.
   */
  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    if (data.title) {
      const existingArticle = await strapi.entityService.findOne(
        "api::article.article",
        where.id,
        { fields: ["title"] }
      );
      if (existingArticle && existingArticle.title !== data.title) {
        data.slug = slugify(data.title, { lower: true, strict: true });
      }
    }
  },
};
