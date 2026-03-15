// composables/useStrapi.ts

export async function useStrapiData() {
  const client = useApiClient();
  const response = (await client("/api/ads", { method: "GET" })) as {
    data: unknown;
  };
  return response.data;
}
