/**
 * Fetch a single order from Strapi by documentId (string or number).
 * Returns the order on success, or throws if not found or on error.
 */
export async function useOrderById(documentId: string) {
  const strapi = useStrapi();
  if (!documentId) {
    throw new Error("Missing documentId");
  }
  // Strapi's .findOne uses 'id' but our backend accepts documentId as id or documentId.
  const { data } = await strapi.findOne("orders", documentId, {
    populate: "*",
  });
  if (!data) {
    throw new Error("Order not found");
  }
  return data;
}
