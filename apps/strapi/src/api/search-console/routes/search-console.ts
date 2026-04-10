/**
 * Search Console Routes
 *
 * Exposes a single endpoint to retrieve Search Console data.
 * Access is controlled via the global::isManager policy.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/search-console",
      handler: "search-console.getData",
      config: { policies: ["global::isManager"] },
    },
  ],
};
