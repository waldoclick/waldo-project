import {
  verifyRecaptchaToken,
  isRecaptchaProtectedRoute,
} from "../utils/recaptcha";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  // Get the API URL from environment
  const apiUrl = process.env.API_URL || "http://localhost:1337";

  // Get the path after /api/
  const fullPath = event.node.req.url?.replace("/api/", "") || "";

  // reCAPTCHA validation for protected routes
  if (isRecaptchaProtectedRoute(fullPath, event.method ?? "")) {
    const recaptchaToken = getHeader(event, "x-recaptcha-token");
    await verifyRecaptchaToken(
      recaptchaToken,
      config.recaptchaSecretKey as string,
    );
    // Token is valid — proceed. X-Recaptcha-Token is NOT forwarded to Strapi.
  }

  // Build the target URL
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

  const cookie = getHeader(event, "cookie");
  if (cookie) {
    headers["Cookie"] = cookie;
  }

  // Forward the request
  return proxyRequest(event, targetUrl, {
    headers,
  });
});
