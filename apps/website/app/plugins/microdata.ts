// plugins/structured-data.ts
import { useHead } from "#app";

export default defineNuxtPlugin(() => {
  // Función para agregar datos estructurados
  const setStructuredData = (data: object) => {
    useHead({
      script: [
        {
          type: "application/ld+json",
          children: JSON.stringify(data),
        },
      ],
    });
  };

  // Exponer la función globalmente
  return {
    provide: {
      setStructuredData,
    },
  };
});
