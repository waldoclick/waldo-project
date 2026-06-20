/**
 * blog-category public read routes
 *
 * Custom router array (NOT createCoreRouter) so write operations stay unexposed.
 * auth:false disables the users-permissions JWT requirement; the proxy-auth
 * middleware still gates every request on X-Proxy-Key.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/blog-categories",
      handler: "blog-category.find",
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/blog-categories/:id",
      handler: "blog-category.findOne",
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
