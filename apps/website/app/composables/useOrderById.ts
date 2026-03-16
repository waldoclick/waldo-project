import { useApiClient } from "#imports";

/**
 * Fetch a single order from Strapi by documentId (string or number).
 * Returns the order on success, or throws if not found or on error.
 */
export async function useOrderById(documentId: string) {
  const client = useApiClient();
  if (!documentId) {
    throw new Error("Missing documentId");
  }
  const response = (await client(`payments/thankyou/${documentId}`, {
    method: "GET",
  })) as { data: unknown };
  if (!response.data) {
    throw new Error("Order not found");
  }
  return response.data;
}
