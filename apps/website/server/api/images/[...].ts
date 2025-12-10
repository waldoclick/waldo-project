export default defineEventHandler(async (event) => {
  // Get the path after /api/images/
  const path = getRouterParam(event, "images") || "";
  const fullPath = event.node.req.url?.replace("/api/images/", "") || "";

  // Build the Strapi uploads URL
  const config = useRuntimeConfig();
  const strapiUrl = `${config.public.apiUrl}/uploads/${fullPath}`;

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
    "Cache-Control": "no-cache", // Sin cache en servidor, solo Cloudflare
    "Access-Control-Allow-Origin": process.env.BASE_URL || "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  };

  // Forward the request to Strapi
  return proxyRequest(event, finalUrl, {
    headers,
  });
});
