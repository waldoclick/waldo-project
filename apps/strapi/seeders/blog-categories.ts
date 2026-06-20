// /seeders/blog-categories.ts
import type { Core } from "@strapi/strapi";

// The 7 names MUST match categoryHue HUE_MAP exactly (incl. accents) — they key
// the per-category accent hue on the website. The `color` here is metadata only;
// the live accent is computed by getCategoryHue from the name.
const blogCategoriesData = [
  { name: "Guía de compra", slug: "guia-de-compra", color: "#F6EACE" },
  { name: "Mercado", slug: "mercado", color: "#D0D9EB" },
  { name: "Mantención", slug: "mantencion", color: "#F3D6D0" },
  { name: "Vender mejor", slug: "vender-mejor", color: "#C2E3D9" },
  { name: "Financiamiento", slug: "financiamiento", color: "#DBE2C5" },
  { name: "Logística", slug: "logistica", color: "#C9D3EB" },
  { name: "Seguridad", slug: "seguridad", color: "#F1CAD8" },
];

const populateBlogCategories = async (strapi: Core.Strapi): Promise<void> => {
  console.log("Poblando categorías de blog...");

  console.log(
    `Procesando ${blogCategoriesData.length} categorías de blog...`,
  );

  for (const category of blogCategoriesData) {
    try {
      // Verificar si la categoría de blog ya existe
      const existing = await strapi.db
        .query("api::blog-category.blog-category")
        .findMany({
          where: { slug: category.slug },
        });

      if (existing.length > 0) {
        console.log(`Categoría de blog ya existe: ${category.name}`);
        continue;
      }

      await strapi.db.query("api::blog-category.blog-category").create({
        data: {
          name: category.name,
          slug: category.slug,
          color: category.color,
        },
      });

      console.log(`✅ Categoría de blog creada: ${category.name}`);
    } catch (categoryError) {
      console.error(
        `❌ Error creando categoría de blog ${category.name}:`,
        categoryError.message,
      );
    }
  }

  console.log("🎉 Datos de categorías de blog poblados exitosamente");
};

// Esta función será llamada desde el bootstrap de src/index.ts

export default populateBlogCategories;
