// /seeders/categories.ts
import type { Core } from "@strapi/strapi";

const categoriesData = [
  {
    id: 3,
    attributes: {
      name: "Agricultura",
      slug: "agricultura",
      color: "#C2E3D9",
    },
  },
  {
    id: 2,
    attributes: {
      name: "Alimentación",
      slug: "alimentacion",
      color: "#D8C9DE",
    },
  },
  {
    id: 1,
    attributes: {
      name: "Construcción",
      slug: "construccion",
      color: "#D0D9EB",
    },
  },
  {
    id: 4,
    attributes: {
      name: "Energía",
      slug: "energia",
      color: "#F6EACE",
    },
  },
  {
    id: 11,
    attributes: {
      name: "Ganadería",
      slug: "ganaderia",
      color: "#F3D6D0",
    },
  },
  {
    id: 9,
    attributes: {
      name: "Manufactura",
      slug: "manufactura",
      color: "#F1CAD8",
    },
  },
  {
    id: 5,
    attributes: {
      name: "Minería",
      slug: "mineria",
      color: "#F4E3CD",
    },
  },
  {
    id: 6,
    attributes: {
      name: "Pesca",
      slug: "pesca",
      color: "#C9E9EC",
    },
  },
  {
    id: 7,
    attributes: {
      name: "Salud",
      slug: "salud",
      color: "#FFFFFF",
    },
  },
  {
    id: 8,
    attributes: {
      name: "Silvicultura",
      slug: "silvicultura",
      color: "#DBE2C5",
    },
  },
  {
    id: 12,
    attributes: {
      name: "Telecomunicaciones",
      slug: "telecomunicaciones",
      color: "#C9D3EB",
    },
  },
  {
    id: 10,
    attributes: {
      name: "Transporte",
      slug: "transporte",
      color: "#D6D6D7",
    },
  },
];

const populateCategories = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando categorías...");

  console.log(`Procesando ${categoriesData.length} categorías...`);

  for (const category of categoriesData) {
    try {
      // Verificar si la categoría ya existe
      const existingCategory = await strapi.db
        .query("api::category.category")
        .findMany({
          where: { slug: category.attributes.slug },
        });

      if (existingCategory.length > 0) {
        console.log(`Categoría ya existe: ${category.attributes.name}`);
        continue;
      }

      // Crear la categoría usando strapi.db.query()
      await strapi.db.query("api::category.category").create({
        data: {
          name: category.attributes.name,
          slug: category.attributes.slug,
          color: category.attributes.color,
          icon: null, // Campo opcional
        },
      });

      console.log(`✅ Categoría creada: ${category.attributes.name}`);
    } catch (categoryError) {
      console.error(
        `❌ Error creando categoría ${category.attributes.name}:`,
        categoryError.message
      );
    }
  }

  console.log("🎉 Datos de categorías poblados exitosamente");
};

// Esta función será llamada desde el bootstrap de src/index.ts

export default populateCategories;
