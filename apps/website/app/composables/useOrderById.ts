import { useApiClient } from "#imports";

/**
 * Fetch a single order from Strapi by documentId (string or number).
 * Returns the order on success, or throws if not found or on error.
 */
export async function useOrderById(documentId: string) {
  const client = useApiClient();
  if (!documentId) {
    throw createError({ statusCode: 404, message: "Missing documentId" });
  }
  try {
    const response = (await client(`payments/thankyou/${documentId}`, {
      method: "GET",
    })) as { data: unknown };
    if (!response.data) {
      throw createError({ statusCode: 404, message: "Orden no encontrada" });
    }
    return response.data;
  } catch (error: unknown) {
    const statusCode =
      (error as { statusCode?: number }).statusCode ||
      (error as { status?: number }).status ||
      404;
    throw createError({
      statusCode,
      message: "Orden no encontrada",
    });
  }
}
