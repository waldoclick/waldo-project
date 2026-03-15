/**
 * hide-admin-redirect middleware
 *
 * Intercepts GET / on the Strapi API server and returns 404 instead of
 * redirecting to /admin — prevents exposing the admin panel path to scanners.
 */
export default () => {
  return async (ctx, next) => {
    if (ctx.method === "GET" && ctx.path === "/") {
      ctx.status = 404;
      ctx.body = {
        error: { status: 404, name: "NotFoundError", message: "Not Found" },
      };
      return;
    }
    await next();
  };
};
