export default defineEventHandler(async (event) => {
  // Get the API URL from environment
  const apiUrl = process.env.API_URL || "http://localhost:1337";

  // Get the path after /api/
  const path = getRouterParam(event, "api") || "";
  const fullPath = event.node.req.url?.replace("/api/", "") || "";

  // Build the target URL
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
