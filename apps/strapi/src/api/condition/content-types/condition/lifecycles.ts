/**
 * Condition lifecycles
 */

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Remove leading hyphens
    .replace(/-+$/, ""); // Remove trailing hyphens
}

export default {
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
        data.slug = generateSlug(data.name);
      }
    }
  },
};
