/**
 * Commune lifecycles
 */

import slugify from "slugify";
import type { Event } from "@strapi/database/dist/lifecycles";

export default {
  /**
   * Triggered before updating a commune
   * Updates the slug if the name has changed
   */
  async beforeUpdate(event: Event) {
    const { data, where } = event.params;

    // Si el nombre está siendo actualizado, generar el slug
    if (data.name) {
      // Obtener la comuna actual para comparar
      const existingCommune = await strapi.entityService.findOne(
        "api::commune.commune",
        where.id,
        { fields: ["name"] }
      );

      // Solo actualizar el slug si el nombre cambió
      if (existingCommune && existingCommune.name !== data.name) {
        // Generar slug desde el nuevo nombre
        data.slug = slugify(data.name, { lower: true, strict: true });
      }
    }
  },
};
