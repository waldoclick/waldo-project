export default defineEventHandler(async (event) => {
  // Get the API URL from environment
  const apiUrl = process.env.API_URL || "http://localhost:1337";

  // Get the frontend URL for OAuth redirects
  const frontendUrl = process.env.BASE_URL || "http://localhost:3000";

  // Get the path after /api/
  const path = getRouterParam(event, "api") || "";
  const fullPath = event.node.req.url?.replace("/api/", "") || "";

  // Exclude OAuth routes from proxy - these should go directly to Strapi
  const oauthRoutes = [
    "connect/google",
    "connect/google/callback",
    "connect/facebook",
    "connect/facebook/callback",
    "connect/github",
    "connect/github/callback",
    "connect/twitter",
    "connect/twitter/callback",
    "connect/discord",
    "connect/discord/callback",
    "connect/linkedin",
    "connect/linkedin/callback",
  ];

  // Check if this is an OAuth route that should be excluded from proxy
  const isOAuthRoute = oauthRoutes.some((route) => fullPath.startsWith(route));

  if (isOAuthRoute) {
    // For OAuth routes, redirect directly to Strapi
    const targetUrl = `${apiUrl}/api/${fullPath}`;

    // Get query parameters
    const query = getQuery(event);

    // Add frontend URL to query parameters for OAuth redirects
    if (fullPath.includes("connect/google")) {
      query.frontend_url = frontendUrl;
      // Also add the redirect URL that Strapi should use
      query.redirect_url = `${frontendUrl}/api/connect/google/callback`;
    }

    const queryString = new URLSearchParams(
      query as Record<string, string>
    ).toString();
    const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    // Redirect to Strapi OAuth endpoint
    return sendRedirect(event, finalUrl, 302);
  }

  // Build the target URL for non-OAuth routes
  const targetUrl = `${apiUrl}/api/${fullPath}`;

  // Get headers from the original request
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": process.env.BASE_URL || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Forward important headers from the original request
  const authHeader = getHeader(event, "authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  const contentType = getHeader(event, "content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  const cookie = getHeader(event, "cookie");
  if (cookie) {
    headers["Cookie"] = cookie;
  }

  // Forward the request
  return proxyRequest(event, targetUrl, {
    headers,
  });
});
