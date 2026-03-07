// plugins/structured-data.ts
import { useHead } from "#app";

export default defineNuxtPlugin(() => {
  // Inject structured data (JSON-LD) into the page head
  const setStructuredData = (data: object) => {
    useHead({
      script: [
        {
          key: "structured-data",
          type: "application/ld+json",
          innerHTML: JSON.stringify(data),
        },
      ],
    });
  };

  // Expose globally via $setStructuredData
  return {
    provide: {
      setStructuredData,
    },
  };
});

declare module "#app" {
  interface NuxtApp {
    $setStructuredData: (data: object) => void;
  }
}
