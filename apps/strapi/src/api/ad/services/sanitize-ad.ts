/**
 * Sanitize an ad for public/authenticated (non-manager) consumption.
 *
 * Removes sensitive user fields (password, tokens, personal data),
 * internal status flags, and payment/financial details.
 *
 * Managers receive the raw ad object — this function is only applied
 * to public and authenticated (non-manager) responses.
 */
export function sanitizeAdForPublic(
  ad: Record<string, unknown>
): Record<string, unknown> {
  const {
    user: userRaw,
    order: orderRaw,
    ad_featured_reservation: featuredRaw,
    ...adFields
  } = ad;
  const user = userRaw as Record<string, unknown> | null | undefined;
  const order = orderRaw as Record<string, unknown> | null | undefined;
  const ad_featured_reservation = featuredRaw as
    | Record<string, unknown>
    | null
    | undefined;

  // User: keep only what is needed to display the seller card
  const safeUser = user
    ? {
        id: user.id,
        documentId: user.documentId,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        pro_status: user.pro_status,
        is_company: user.is_company,
        business_name: user.business_name,
        createdAt: user.createdAt,
      }
    : null;

  // Order: only expose presence (id), nothing financial
  const safeOrder = order
    ? {
        id: order.id,
        documentId: order.documentId,
      }
    : null;

  // Featured reservation: only expose presence (id), not price or description
  const safeFeatured = ad_featured_reservation
    ? { id: ad_featured_reservation.id }
    : null;

  return {
    id: adFields.id,
    documentId: adFields.documentId,
    status: adFields.status,
    name: adFields.name,
    slug: adFields.slug,
    description: adFields.description,
    address: adFields.address,
    address_number: adFields.address_number,
    phone: adFields.phone,
    email: adFields.email,
    year: adFields.year,
    manufacturer: adFields.manufacturer,
    model: adFields.model,
    serial_number: adFields.serial_number,
    weight: adFields.weight,
    width: adFields.width,
    height: adFields.height,
    depth: adFields.depth,
    price: adFields.price,
    currency: adFields.currency,
    duration_days: adFields.duration_days,
    remaining_days: adFields.remaining_days,
    active: adFields.active,
    createdAt: adFields.createdAt,
    updatedAt: adFields.updatedAt,
    publishedAt: adFields.publishedAt,
    needs_payment: adFields.needs_payment,
    featured: adFields.featured,
    reason_for_rejection: adFields.reason_for_rejection,
    reason_for_ban: adFields.reason_for_ban,
    // Relations
    user: safeUser,
    gallery: adFields.gallery,
    commune: adFields.commune,
    condition: adFields.condition,
    category: adFields.category,
    order: safeOrder,
    ad_featured_reservation: safeFeatured,
  };
}
