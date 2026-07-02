export default defineEventHandler(async (event) => {
  // Get the path after /api/images/
  const fullPath = event.node.req.url?.replace("/api/images/", "") || "";

  // Build the Strapi uploads URL
  const config = useRuntimeConfig();
  const strapiUrl = `${config.apiUrl}/uploads/${fullPath}`;

  // Get query parameters and force WebP format
  const query = getQuery(event);
  const queryParams = new URLSearchParams(query as Record<string, string>);

  // Force WebP format if not already specified
  if (!queryParams.has("format")) {
    queryParams.set("format", "webp");
  }

  const queryString = queryParams.toString();
  const finalUrl = queryString
    ? `${strapiUrl}?${queryString}`
    : `${strapiUrl}?format=webp`;

  // Set headers
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": process.env.BASE_URL || "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  };

  // Forward the request to Strapi
  return proxyRequest(event, finalUrl, {
    headers,
    onResponse(e) {
      // Overrides Strapi's origin Cache-Control (max-age=14400, no s-maxage)
      // so Vercel's edge can actually cache this response.
      setResponseHeader(
        e,
        "cache-control",
        "public, max-age=14400, s-maxage=14400, stale-while-revalidate=86400",
      );
    },
  });
});
