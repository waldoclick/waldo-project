import {
  verifyRecaptchaToken,
  isRecaptchaProtectedRoute,
} from "../utils/recaptcha";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  // Get the API URL from environment
  const apiUrl = process.env.API_URL || "http://localhost:1337";

  // Get the frontend URL for OAuth redirects
  const frontendUrl = process.env.BASE_URL || "http://localhost:3000";

  // Get the path after /api/
  const fullPath = event.node.req.url?.replace("/api/", "") || "";

  // Exclude OAuth routes from proxy - these should go directly to Strapi
  const oauthRoutes = [
    "connect/google",
    "connect/google/callback",
    "connect/facebook",
    "connect/facebook/callback",
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
      query as Record<string, string>,
    ).toString();
    const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    // Redirect to Strapi OAuth endpoint
    return sendRedirect(event, finalUrl, 302);
  }

  // reCAPTCHA validation for protected routes
  if (isRecaptchaProtectedRoute(fullPath, event.method ?? "")) {
    const recaptchaToken = getHeader(event, "x-recaptcha-token");
    await verifyRecaptchaToken(
      recaptchaToken,
      config.recaptchaSecretKey as string,
    );
    // Token is valid — proceed. X-Recaptcha-Token is NOT forwarded to Strapi.
  }

  // Build the target URL for non-OAuth routes
  const targetUrl = `${apiUrl}/api/${fullPath}`;

  // Forward only whitelisted headers — X-Recaptcha-Token is deliberately excluded
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

  const cookies = parseCookies(event);
  const jwt = cookies["waldo_jwt"];
  if (jwt) {
    headers["Cookie"] = `waldo_jwt=${jwt}`;
  }

  // Forward the request
  return proxyRequest(event, targetUrl, {
    headers,
  });
});
