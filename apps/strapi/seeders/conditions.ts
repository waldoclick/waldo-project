// /seeders/conditions.ts
import type { Core } from "@strapi/strapi";

const conditionsData = [
  {
    id: 1,
    attributes: {
      name: "Nuevo",
      slug: "nuevo",
    },
  },
  {
    id: 2,
    attributes: {
      name: "Usado",
      slug: "usado",
    },
  },
];

const populateConditions = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando condiciones...");

  console.log(`Procesando ${conditionsData.length} condiciones...`);

  for (const condition of conditionsData) {
    try {
      // Verificar si la condición ya existe
      const existingCondition = await strapi.db
        .query("api::condition.condition")
        .findMany({
          where: { slug: condition.attributes.slug },
        });

      if (existingCondition.length > 0) {
        console.log(`Condición ya existe: ${condition.attributes.name}`);
        continue;
      }

      // Crear la condición usando strapi.db.query()
      await strapi.db.query("api::condition.condition").create({
        data: {
          name: condition.attributes.name,
          slug: condition.attributes.slug,
        },
      });

      console.log(`✅ Condición creada: ${condition.attributes.name}`);
    } catch (conditionError) {
      console.error(
        `❌ Error creando condición ${condition.attributes.name}:`,
        conditionError.message
      );
    }
  }

  console.log("🎉 Datos de condiciones poblados exitosamente");
};

// Esta función será llamada desde el bootstrap de src/index.ts

export default populateConditions;
