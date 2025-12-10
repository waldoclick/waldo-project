// /seeders/packs.ts

const packsData = [
  {
    name: "1 Aviso",
    text: null,
    total_days: "45",
    total_ads: "1",
    total_features: "0",
    price: "5990",
    description: "1 Aviso",
  },
  {
    name: "15 Avisos",
    text: "Ahorras un 27%",
    total_days: "45",
    total_ads: "15",
    total_features: "1",
    price: "69900",
    description:
      "15 Avisos para usarlos cuando quieras.\nCada Aviso será publicado por 45 días.\nIncluye 1 Destacado que puedes utilizar en el Aviso que prefieras.\nAhorras un 27%",
  },
  {
    name: "30 Avisos",
    text: "Ahorras un 37%",
    total_days: "45",
    total_ads: "30",
    total_features: "2",
    price: "119900",
    description:
      "30 Avisos para usarlos cuando quieras.\nCada Aviso será publicado por 45 días.\nIncluye 2 Destacados que puedes utilizar en los avisos que prefieras.\nAhorras un 37%.",
  },
  {
    name: "60 Avisos",
    text: "Ahorras un 48%",
    total_days: "45",
    total_ads: "60",
    total_features: "3",
    price: "199900",
    description:
      "60 Avisos para usarlos cuando quieras.\nCada Aviso será publicado por 45 días.\nIncluye 4 Destacados que puedes utilizar en los Avisos que prefieras.\nAhorras un 48%",
  },
];

const populatePacks = async (strapi: any) => {
  console.log("Poblando packs...");

  console.log(`Procesando ${packsData.length} packs...`);

  for (const pack of packsData) {
    try {
      // Verificar si el pack ya existe
      const existingPack = await strapi.db
        .query("api::ad-pack.ad-pack")
        .findMany({
          where: { name: pack.name },
        });

      if (existingPack.length > 0) {
        console.log(`Pack ya existe: ${pack.name}`);
        continue;
      }

      // Crear el pack usando strapi.db.query()
      await strapi.db.query("api::ad-pack.ad-pack").create({
        data: {
          name: pack.name,
          text: pack.text,
          total_days: pack.total_days,
          total_ads: pack.total_ads,
          total_features: pack.total_features,
          price: pack.price,
          description: pack.description,
        },
      });

      console.log(`✅ Pack creado: ${pack.name}`);
    } catch (packError) {
      console.error(`❌ Error creando pack ${pack.name}:`, packError.message);
    }
  }

  console.log("🎉 Datos de packs poblados exitosamente");
};

// Esta función será llamada desde el bootstrap de src/index.ts

export default populatePacks;
