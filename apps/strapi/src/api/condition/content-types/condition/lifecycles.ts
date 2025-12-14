/**
 * Condition lifecycles
 */

import slugify from "slugify";

export default {
  /**
   * Triggered before creating a condition
   * Generates the slug from the name
   */
  async beforeCreate(event: any) {
    const { data } = event.params;

    // Si el nombre está presente, generar el slug siempre
    if (data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
  },

  /**
   * Triggered before updating a condition
   * Updates the slug if the name has changed
   */
  async beforeUpdate(event: any) {
    const { data, where } = event.params;

    // Si el nombre está siendo actualizado, generar el slug
    if (data.name) {
      // Obtener la condición actual para comparar
      const existingCondition = await strapi.entityService.findOne(
        "api::condition.condition",
        where.id,
        { fields: ["name"] }
      );

      // Solo actualizar el slug si el nombre cambió
      if (existingCondition && existingCondition.name !== data.name) {
        // Generar slug desde el nuevo nombre
        data.slug = slugify(data.name, { lower: true, strict: true });
      }
    }
  },
};
