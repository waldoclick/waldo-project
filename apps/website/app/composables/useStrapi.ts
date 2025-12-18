// composables/useStrapi.ts

export async function useStrapiData() {
  const strapi = useStrapi();

  // Usa `strapi` para tus operaciones
  const { data } = await strapi.find("ads");

  return data;
}
